/* ============================================================================
   SASE.Net — motion layer (Three.js + GSAP)
   Purely additive on top of script.js: a Three.js particle network in the
   hero, a GSAP-driven scroll progress bar, a scroll-filled "spine", scroll
   counters, ambient glow drift, an SVG line-draw for the deployment diagram,
   and a pointer-tilt on the card grids. Nothing here changes layout — only
   opacity/transform, so it can be deleted wholesale with no structural impact.

   Respects prefers-reduced-motion the same way script.js does: read live,
   torn down and rebuilt on change, never assumed once at load.
   ========================================================================= */

(async () => {
  const THREE = await import('three').catch(() => null);
  const hasThree = !!THREE;
  const hasGsap = typeof gsap !== 'undefined';
  if (!hasGsap && !hasThree) return;

  if (hasGsap && typeof ScrollTrigger !== 'undefined') gsap.registerPlugin(ScrollTrigger);

  const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
  let reduced = motionQuery.matches;

  /* --------------------------------------------------------- hero scene --- */

  /* A slowly rotating globe of distributed enforcement points: edge nodes sit
     on the sphere, traffic arcs hop between them along real 3D great circles,
     and two inclined orbit rings frame the whole thing. It reads as depth
     rather than a flat particle field because every element is genuinely
     positioned in 3D and shaded by distance — nodes and arcs fade as they
     travel around the back, so the sphere occludes itself.

     Deliberately cheap: no lights, no shadows, no post-processing. Additive
     unlit materials over a dark hero, one geometry per layer, and per-frame
     work bounded by node count rather than by node pairs. */

  let heroScene = null;

  function buildHeroScene() {
    if (!hasThree) return null;
    const canvas = document.querySelector('[data-hero-canvas]');
    const hero = document.querySelector('.hero');
    if (!canvas || !hero) return null;

    const renderer = new THREE.WebGLRenderer({
      canvas, alpha: true, antialias: true, powerPreference: 'high-performance'
    });
    /* Capped at 2: beyond that the fill cost doubles for no visible gain. */
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));

    const scene = new THREE.Scene();
    /* Fog pulls the far side of the globe down into the hero background, which
       is what sells the volume. Matches --navy so the falloff is invisible. */
    scene.fog = new THREE.FogExp2(0x06121b, 0.0075);

    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 400);
    camera.position.set(0, 0, 76);

    /* The whole scene hangs off one group so rotation and placement are applied
       in a single place, and the globe keeps a fixed axial lean like a real one.
       It is pushed right and back so it sits beside the headline rather than
       behind it — resize() re-places it once the viewport is known. */
    const group = new THREE.Group();
    group.rotation.z = -0.18;
    scene.add(group);

    const R = 11.4;
    const CYAN = new THREE.Color(0x58efe3);
    const BLUE = new THREE.Color(0x6e9cff);

    /* ---- wireframe shell: the globe's cage ---- */

    const shell = new THREE.LineSegments(
      new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(R, 2)),
      new THREE.LineBasicMaterial({
        color: 0x2c7f96, transparent: true, opacity: 0.3,
        blending: THREE.AdditiveBlending, depthWrite: false
      })
    );
    group.add(shell);

    /* ---- edge nodes: points of presence distributed over the sphere ---- */

    /* Fibonacci sphere — an even spread without the polar clustering that
       random spherical coordinates produce. */
    const NODE_COUNT = 220;
    const nodeHome = [];
    const nodePositions = new Float32Array(NODE_COUNT * 3);
    const nodeColors = new Float32Array(NODE_COUNT * 3);
    const nodeSizes = new Float32Array(NODE_COUNT);
    const golden = Math.PI * (3 - Math.sqrt(5));

    for (let i = 0; i < NODE_COUNT; i++) {
      const y = 1 - (i / (NODE_COUNT - 1)) * 2;
      const radius = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = golden * i;
      const v = new THREE.Vector3(Math.cos(theta) * radius, y, Math.sin(theta) * radius)
        .multiplyScalar(R);
      nodeHome.push(v);
      nodePositions[i * 3] = v.x;
      nodePositions[i * 3 + 1] = v.y;
      nodePositions[i * 3 + 2] = v.z;

      /* A minority of nodes are "hot" — larger and cyan, the rest recede in
         blue. Gives the surface a hierarchy instead of uniform dots. */
      const hot = i % 7 === 0;
      const c = hot ? CYAN : BLUE;
      nodeColors[i * 3] = c.r;
      nodeColors[i * 3 + 1] = c.g;
      nodeColors[i * 3 + 2] = c.b;
      nodeSizes[i] = hot ? 1.7 : 0.85;
    }

    const nodeGeometry = new THREE.BufferGeometry();
    nodeGeometry.setAttribute('position', new THREE.BufferAttribute(nodePositions, 3));
    nodeGeometry.setAttribute('color', new THREE.BufferAttribute(nodeColors, 3));
    nodeGeometry.setAttribute('aSize', new THREE.BufferAttribute(nodeSizes, 1));

    /* Round, soft-edged sprites drawn in the shader rather than from a texture,
       and scaled by true distance so near nodes are visibly larger. Depth also
       drives alpha, which is what makes the back of the globe recede. */
    const nodeMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      uniforms: { uPixelRatio: { value: renderer.getPixelRatio() }, uTime: { value: 0 } },
      vertexShader: [
        'attribute float aSize;',
        'uniform float uPixelRatio;',
        'uniform float uTime;',
        'varying vec3 vColor;',
        'varying float vFade;',
        'void main() {',
        '  vColor = color;',
        '  vec4 mv = modelViewMatrix * vec4(position, 1.0);',
        '  /* Front hemisphere at full strength, back hemisphere dimmed. */',
        '  vFade = smoothstep(-16.0, 14.0, mv.z);',
        '  float pulse = 0.85 + 0.15 * sin(uTime * 1.6 + position.x * 0.6 + position.y * 0.4);',
        '  gl_PointSize = aSize * pulse * 620.0 * uPixelRatio / max(0.001, -mv.z);',
        '  gl_Position = projectionMatrix * mv;',
        '}'
      ].join('\n'),
      fragmentShader: [
        'varying vec3 vColor;',
        'varying float vFade;',
        'void main() {',
        '  float d = length(gl_PointCoord - vec2(0.5));',
        '  if (d > 0.5) discard;',
        '  /* Bright core, soft halo — reads as a light source, not a disc. */',
        '  float core = 1.0 - smoothstep(0.0, 0.5, d);',
        '  float alpha = pow(core, 1.7) * (0.3 + 0.7 * vFade);',
        '  gl_FragColor = vec4(vColor, alpha);',
        '}'
      ].join('\n')
    });

    const nodes = new THREE.Points(nodeGeometry, nodeMaterial);
    group.add(nodes);

    /* ---- traffic arcs: sessions hopping between points of presence ---- */

    /* Each arc is a great-circle path lifted off the surface, drawn as a short
       travelling segment rather than a static line, so the globe always looks
       like it is carrying traffic. Geometry is allocated once and rewritten. */
    const ARC_COUNT = 16;
    const ARC_SEGMENTS = 34;
    const ARC_TAIL = 12;

    const arcGeometry = new THREE.BufferGeometry();
    const arcPositions = new Float32Array(ARC_COUNT * ARC_TAIL * 2 * 3);
    const arcColors = new Float32Array(ARC_COUNT * ARC_TAIL * 2 * 3);
    arcGeometry.setAttribute('position', new THREE.BufferAttribute(arcPositions, 3));
    arcGeometry.setAttribute('color', new THREE.BufferAttribute(arcColors, 3));
    const arcMaterial = new THREE.LineBasicMaterial({
      vertexColors: true, transparent: true, opacity: 1,
      blending: THREE.AdditiveBlending, depthWrite: false
    });
    group.add(new THREE.LineSegments(arcGeometry, arcMaterial));

    /* A point along the great circle between two nodes, bowed outward. Uses
       spherical interpolation, not lerp+normalize: for a near-antipodal pair
       the linear midpoint passes through the centre of the sphere, which makes
       the "arc" cut straight through the globe and whip across the frame.
       Slerp keeps every path on the surface. The lift scales with separation,
       so long hauls arc higher, like a real route map. */
    const arcPoint = (() => {
      const a = new THREE.Vector3();
      const b = new THREE.Vector3();
      const out = new THREE.Vector3();
      return (from, to, t, lift) => {
        a.copy(from).normalize();
        b.copy(to).normalize();
        const dot = Math.min(1, Math.max(-1, a.dot(b)));
        const omega = Math.acos(dot);
        const sin = Math.sin(omega);
        if (sin < 1e-4) {
          out.copy(a);
        } else {
          out.copy(a).multiplyScalar(Math.sin((1 - t) * omega) / sin)
            .addScaledVector(b, Math.sin(t * omega) / sin);
        }
        const bow = Math.sin(t * Math.PI);
        return out.multiplyScalar(R + lift * bow);
      };
    })();

    const arcs = [];
    const seedArc = (arc) => {
      const a = nodeHome[Math.floor(Math.random() * NODE_COUNT)];
      let b = nodeHome[Math.floor(Math.random() * NODE_COUNT)];
      /* Reject near-neighbours; short hops read as noise, not as routes. */
      let guard = 0;
      while (a.distanceTo(b) < R * 0.9 && guard++ < 8) {
        b = nodeHome[Math.floor(Math.random() * NODE_COUNT)];
      }
      arc.from = a;
      arc.to = b;
      arc.lift = 0.7 + (a.distanceTo(b) / (R * 2)) * 1.9;
      arc.progress = 0;
      arc.speed = 0.0022 + Math.random() * 0.0034;
      arc.color = Math.random() > 0.45 ? CYAN : BLUE;
      return arc;
    };
    for (let i = 0; i < ARC_COUNT; i++) arcs.push(seedArc({}));

    /* ---- orbit rings: the transit layer around the edge ---- */

    const rings = [];
    [[R * 1.34, 0.42, 0x58efe3, 0.34], [R * 1.5, -0.7, 0x6e9cff, 0.24]].forEach(
      ([radius, tilt, color, opacity]) => {
        const pts = [];
        for (let i = 0; i <= 128; i++) {
          const a = (i / 128) * Math.PI * 2;
          pts.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
        }
        const ring = new THREE.Line(
          new THREE.BufferGeometry().setFromPoints(pts),
          new THREE.LineBasicMaterial({
            color, transparent: true, opacity,
            blending: THREE.AdditiveBlending, depthWrite: false
          })
        );
        ring.rotation.x = Math.PI / 2 + tilt;
        ring.rotation.y = tilt * 0.6;
        group.add(ring);
        rings.push(ring);
      }
    );

    /* A few satellites riding the rings, so the orbits read as paths in motion. */
    const SAT_COUNT = 3;
    const satellites = [];
    for (let i = 0; i < SAT_COUNT; i++) {
      const ring = rings[i % rings.length];
      const sat = new THREE.Mesh(
        new THREE.SphereGeometry(0.19, 12, 12),
        new THREE.MeshBasicMaterial({
          color: i % 2 ? 0x6e9cff : 0x58efe3, transparent: true, opacity: 0.85,
          blending: THREE.AdditiveBlending, depthWrite: false
        })
      );
      group.add(sat);
      satellites.push({
        mesh: sat,
        ring,
        radius: i % rings.length ? R * 1.5 : R * 1.34,
        angle: Math.random() * Math.PI * 2,
        speed: 0.0032 + Math.random() * 0.0026
      });
    }

    /* ---- pointer parallax ---- */

    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    const onPointerMove = (event) => {
      const rect = hero.getBoundingClientRect();
      target.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      target.y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    };
    hero.addEventListener('pointermove', onPointerMove, { passive: true });

    /* Drifting back to centre when the pointer leaves stops the scene from
       being frozen at whatever angle the cursor last held. */
    const onPointerLeave = () => { target.x = 0; target.y = 0; };
    hero.addEventListener('pointerleave', onPointerLeave, { passive: true });

    /* resize() owns the camera's resting distance; the tick only nudges x/y for
       parallax, so the two never fight over the same property. */
    let baseCameraZ = 76;

    function resize() {
      const rect = canvas.getBoundingClientRect();
      const w = Math.max(1, rect.width);
      const h = Math.max(1, rect.height);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      nodeMaterial.uniforms.uPixelRatio.value = renderer.getPixelRatio();

      /* Placement is viewport-dependent because the hero copy is left-aligned.
         On a wide screen the globe sits in the right third, clear of the
         headline; as the layout narrows the copy takes the full width, so the
         globe recentres, sinks below the text, and moves further back to read
         as atmosphere rather than competing with it. */
      /* The hero copy is left-aligned inside a 1180px column, so on wide
         screens the globe is pushed toward the right edge and set back; the
         headline still crosses it, which the CSS mask below handles by fading
         the canvas out over the text column rather than by shrinking the
         globe into a corner. As the layout narrows the copy takes the full
         width, so the globe recentres, sinks, and moves further back. */
      const wide = w >= 1100;
      const mid = w >= 700;
      group.position.x = wide ? R * 1.5 : 0;
      group.position.y = wide ? R * 0.05 : -R * 0.9;
      group.position.z = wide ? -4 : -18;
      baseCameraZ = wide ? 78 : mid ? 94 : 110;
      camera.position.z = baseCameraZ;
    }

    let frame = 0;
    let running = false;
    let clock = 0;

    function tick() {
      if (!running) return;
      frame = requestAnimationFrame(tick);
      clock += 1 / 60;

      nodeMaterial.uniforms.uTime.value = clock;

      /* --- arcs travel, then re-seed between a new pair of nodes --- */
      const ap = arcGeometry.attributes.position.array;
      const ac = arcGeometry.attributes.color.array;
      let vertex = 0;

      arcs.forEach((arc) => {
        arc.progress += arc.speed;
        if (arc.progress >= 1) seedArc(arc);

        for (let s = 0; s < ARC_TAIL; s++) {
          /* The tail trails behind the head, clamped at zero so it never wraps
             around to the far end of the path while the head is near the start. */
          const headT = arc.progress;
          const t0 = Math.max(0, headT - (s + 1) / ARC_SEGMENTS);
          const t1 = Math.max(0, headT - s / ARC_SEGMENTS);

          /* arcPoint reuses one scratch vector to stay allocation-free, so
             each result is copied into the buffer before the next call. */
          const base = vertex * 3;
          const p0 = arcPoint(arc.from, arc.to, t0, arc.lift);
          ap[base] = p0.x; ap[base + 1] = p0.y; ap[base + 2] = p0.z;
          const p1 = arcPoint(arc.from, arc.to, t1, arc.lift);
          ap[base + 3] = p1.x; ap[base + 4] = p1.y; ap[base + 5] = p1.z;

          /* Brightest at the head, fading down the tail, and faded again at
             both ends of the flight so arcs appear and vanish smoothly. */
          const taper = (1 - s / ARC_TAIL) * Math.sin(Math.min(1, headT) * Math.PI);
          for (let k = 0; k < 2; k++) {
            const cb = base + k * 3;
            ac[cb] = arc.color.r * taper;
            ac[cb + 1] = arc.color.g * taper;
            ac[cb + 2] = arc.color.b * taper;
          }
          vertex += 2;
        }
      });
      arcGeometry.attributes.position.needsUpdate = true;
      arcGeometry.attributes.color.needsUpdate = true;

      /* --- satellites ride their rings, in each ring's own tilted plane --- */
      satellites.forEach((sat) => {
        sat.angle += sat.speed;
        sat.mesh.position
          .set(Math.cos(sat.angle) * sat.radius, 0, Math.sin(sat.angle) * sat.radius)
          .applyEuler(sat.ring.rotation);
      });

      /* --- rotation: constant drift plus eased pointer parallax --- */
      current.x += (target.x - current.x) * 0.045;
      current.y += (target.y - current.y) * 0.045;

      group.rotation.y += 0.0013;
      /* Tilt is applied to the camera rather than the group, so the globe's own
         axis stays put and only the viewing angle shifts — the difference
         between looking around an object and spinning the object. */
      camera.position.x = group.position.x + current.x * 2.2;
      camera.position.y = group.position.y + current.y * -2.6;
      camera.position.z = baseCameraZ;
      camera.lookAt(group.position);

      rings.forEach((ring, i) => { ring.rotation.z += i % 2 ? 0.0011 : -0.0008; });

      renderer.render(scene, camera);
    }

    const visibilityObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !running) {
        running = true;
        tick();
      } else if (!entry.isIntersecting && running) {
        running = false;
        cancelAnimationFrame(frame);
      }
    }, { threshold: 0.01 });
    visibilityObserver.observe(hero);

    addEventListener('resize', resize, { passive: true });
    resize();
    /* One frame is drawn even before intersection fires, so the canvas is
       never a blank flash while the observer spins up. */
    renderer.render(scene, camera);

    return {
      destroy() {
        running = false;
        cancelAnimationFrame(frame);
        visibilityObserver.disconnect();
        removeEventListener('resize', resize);
        hero.removeEventListener('pointermove', onPointerMove);
        hero.removeEventListener('pointerleave', onPointerLeave);
        scene.traverse((obj) => {
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) obj.material.dispose();
        });
        renderer.dispose();
      }
    };
  }

  /* -------------------------------------------------------- scroll fx --- */

  let scrollTriggers = [];

  function buildScrollMotion() {
    if (!hasGsap || typeof ScrollTrigger === 'undefined') return;

    scrollTriggers.push(
      gsap.to('[data-scroll-progress]', {
        scaleX: 1, ease: 'none',
        scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.3 }
      }).scrollTrigger,
      gsap.to('[data-spine-progress]', {
        scaleY: 1, ease: 'none',
        scrollTrigger: { trigger: 'main', start: 'top top', end: 'bottom bottom', scrub: 0.3 }
      }).scrollTrigger
    );

    document.querySelectorAll('.ambient-glow').forEach((glow, i) => {
      const tl = gsap.timeline({ repeat: -1, yoyo: true, defaults: { duration: 9 + (i % 3), ease: 'sine.inOut' } });
      tl.to(glow, { x: (i % 2 ? -1 : 1) * 46, y: (i % 3 ? 1 : -1) * 34, scale: 1.08 });
      scrollTriggers.push(tl);
    });

    /* Stat numbers: pure counts get a count-up, everything else (e.g. "24/7")
       just needs its scroll reveal, which .reveal already provides. */
    document.querySelectorAll('[data-count]').forEach((el) => {
      const target = Number(el.dataset.count);
      const prefix = el.dataset.countPrefix || '';
      const small = el.querySelector('small');
      const suffix = small ? small.outerHTML : '';
      const proxy = { value: 0 };
      const st = ScrollTrigger.create({
        trigger: el, start: 'top 88%', once: true,
        onEnter: () => gsap.to(proxy, {
          value: target, duration: 1.4, ease: 'power2.out',
          onUpdate: () => { el.innerHTML = prefix + Math.round(proxy.value) + suffix; }
        })
      });
      scrollTriggers.push(st);
    });

    /* Deployment diagram: draw the diamond outline in as it scrolls into view. */
    document.querySelectorAll('.how-diamond-outer, .how-diamond-inner, .how-diamond-cross').forEach((path) => {
      const length = path.getTotalLength();
      gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
      const st = ScrollTrigger.create({
        trigger: '.how-diagram', start: 'top 80%', once: true,
        onEnter: () => gsap.to(path, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.out' })
      });
      scrollTriggers.push(st);
    });

    /* Benefit visual: fade/scale the freshly-swapped SVG in on every click,
       rather than the instant innerHTML replace reading as a jump-cut. */
    const visualBody = document.querySelector('[data-visual-body]');
    if (visualBody) {
      const mo = new MutationObserver(() => {
        const svg = visualBody.querySelector('svg');
        if (svg) gsap.fromTo(svg, { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out', transformOrigin: '50% 50%' });
      });
      mo.observe(visualBody, { childList: true });
      scrollTriggers.push({ kill: () => mo.disconnect() });
    }
  }

  function killScrollMotion() {
    if (!hasGsap) return;
    scrollTriggers.forEach((t) => t?.kill?.());
    scrollTriggers = [];
    gsap.set('[data-scroll-progress], [data-spine-progress]', { clearProps: 'all' });
    gsap.set('.ambient-glow', { clearProps: 'all' });
  }

  /* -------------------------------------------------------- pointer tilt --- */

  const TILT_SELECTOR = '.team-card, .definition-card, .article-card, .trust-card';
  let tiltCleanups = [];

  function buildTilt() {
    if (!hasGsap) return;
    document.querySelectorAll(TILT_SELECTOR).forEach((card) => {
      const xTo = gsap.quickTo(card, 'rotationY', { duration: 0.5, ease: 'power3.out' });
      const yTo = gsap.quickTo(card, 'rotationX', { duration: 0.5, ease: 'power3.out' });
      const liftTo = gsap.quickTo(card, 'y', { duration: 0.5, ease: 'power3.out' });

      const onMove = (event) => {
        const rect = card.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width - 0.5;
        const py = (event.clientY - rect.top) / rect.height - 0.5;
        xTo(px * 10);
        yTo(py * -10);
        liftTo(-6);
      };
      const onLeave = () => { xTo(0); yTo(0); liftTo(0); };

      gsap.set(card, { transformPerspective: 700 });
      card.addEventListener('pointermove', onMove);
      card.addEventListener('pointerleave', onLeave);
      tiltCleanups.push(() => {
        card.removeEventListener('pointermove', onMove);
        card.removeEventListener('pointerleave', onLeave);
        gsap.set(card, { clearProps: 'transform' });
      });
    });
  }

  function killTilt() {
    tiltCleanups.forEach((fn) => fn());
    tiltCleanups = [];
  }

  /* ------------------------------------------------------------ toggle --- */

  function start() {
    heroScene = buildHeroScene();
    buildScrollMotion();
    buildTilt();
  }

  function stop() {
    heroScene?.destroy?.();
    heroScene = null;
    killScrollMotion();
    killTilt();
  }

  function applyPreference() {
    stop();
    if (!reduced) start();
  }

  /* motion.js is a module script, which defers by default, so the DOM is
     already parsed by the time this runs — no need to wait for
     DOMContentLoaded, and doing so as well would call applyPreference() a
     second time and duplicate every listener. */
  applyPreference();

  motionQuery.addEventListener('change', (event) => {
    reduced = event.matches;
    applyPreference();
  });
})();
