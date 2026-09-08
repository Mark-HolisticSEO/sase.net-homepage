/* ============================================================================
   SASE.Net — homepage behaviour
   Interactions follow the annotations in example-homepage-zenarmor.drawio.png:
     · trust elements and team cards reveal information on hover / focus (CSS)
     · statistics carry an info-icon that opens an explanation
     · benefit accordion changes the diagram and the text together
     · core attributes use a locally scrolling rail beside a sticky panel
     · architecture principles are accordions, four visible until "show all"
   ========================================================================= */

/* Motion preference is read live, not captured once at load: a visitor who
   turns on "reduce motion" mid-session should see the page settle immediately
   rather than having to reload. Everything below reads motionQuery.matches. */
const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
let reducedMotion = motionQuery.matches;

/* ------------------------------------------------------------- header --- */

const header = document.querySelector('[data-header]');
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#site-nav');

const updateHeader = () => header?.classList.toggle('scrolled', scrollY > 24);
updateHeader();
addEventListener('scroll', updateHeader, { passive: true });

menuToggle?.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!open));
  nav?.classList.toggle('open', !open);
});

nav?.addEventListener('click', (event) => {
  if (!event.target.closest('a')) return;
  nav.classList.remove('open');
  menuToggle?.setAttribute('aria-expanded', 'false');
});

addEventListener('keydown', (event) => {
  if (event.key !== 'Escape' || !nav?.classList.contains('open')) return;
  nav.classList.remove('open');
  menuToggle?.setAttribute('aria-expanded', 'false');
  menuToggle?.focus();
});

const year = document.querySelector('[data-year]');
if (year) year.textContent = String(new Date().getFullYear());

/* --------------------------------------------- statistics / info-icon --- */

document.querySelectorAll('.stat-card .info-icon').forEach((button) => {
  const card = button.closest('.stat-card');
  button.addEventListener('click', () => {
    const open = button.getAttribute('aria-expanded') === 'true';
    document.querySelectorAll('.stat-card').forEach((other) => {
      other.classList.remove('is-open');
      other.querySelector('.info-icon')?.setAttribute('aria-expanded', 'false');
    });
    if (open) return;
    card.classList.add('is-open');
    button.setAttribute('aria-expanded', 'true');
  });
});

document.addEventListener('click', (event) => {
  /* Cheap guard first: this listener fires on every click on the page, so it
     must not query the DOM unless a card is actually open. */
  if (!document.querySelector('.stat-card.is-open')) return;
  if (event.target.closest('.stat-card')) return;
  document.querySelectorAll('.stat-card.is-open').forEach((card) => {
    card.classList.remove('is-open');
    card.querySelector('.info-icon')?.setAttribute('aria-expanded', 'false');
  });
});

/* ------------------------------------ benefits: accordion + diagram swap --- */

/* Each diagram is drawn from the shape + node count declared on the item, so
   selecting a benefit visibly changes the image as well as the copy. */
const VISUAL_BOX = 'viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet"';

/* A packet travelling along a connector — the moving point that makes each
   diagram read as live traffic rather than a static schematic. animateMotion
   defaults to calcMode="paced", which is what gives constant velocity.
   Emitted only when motion is welcome; SMIL ignores the CSS reduced-motion
   override, so it has to be suppressed at the source. */
const packet = (d, dur, begin = 0) => reducedMotion ? '' :
  `<circle class="bv-packet" r="3.4"><animateMotion path="${d}" dur="${dur}s" begin="${begin}s" repeatCount="indefinite"/></circle>`;

const visualShapes = {
  ring(n) {
    const cx = 200, cy = 150, r = 104;
    let spokes = '', nodes = '', pkts = '';
    for (let i = 0; i < n; i++) {
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
      const x = +(cx + Math.cos(angle) * r).toFixed(1);
      const y = +(cy + Math.sin(angle) * r).toFixed(1);
      spokes += `<line class="bv-spoke" x1="${cx}" y1="${cy}" x2="${x}" y2="${y}"/>`;
      nodes += `<circle class="bv-node" cx="${x}" cy="${y}" r="9"/>`;
      pkts += packet(`M${cx} ${cy}L${x} ${y}`, 2.4, (i * 2.4) / n);
    }
    return `<circle class="bv-ring" cx="${cx}" cy="${cy}" r="${r}"/><circle class="bv-ring" cx="${cx}" cy="${cy}" r="${r - 34}"/>${spokes}${pkts}${nodes}<circle class="bv-core" cx="${cx}" cy="${cy}" r="30"/><text class="bv-label" x="${cx}" y="${cy + 5}">EDGE</text>`;
  },
  converge(n) {
    const cx = 296, cy = 150;
    let lines = '', nodes = '', pkts = '';
    for (let i = 0; i < n; i++) {
      const y = +(46 + i * (208 / Math.max(1, n - 1))).toFixed(1);
      const d = `M78 ${y}C168 ${y} 196 ${cy} ${cx - 34} ${cy}`;
      lines += `<path class="bv-spoke" fill="none" d="${d}"/>`;
      nodes += `<circle class="bv-node" cx="78" cy="${y}" r="7"/>`;
      pkts += packet(d, 2.8, (i * 2.8) / n);
    }
    return `${lines}${pkts}${nodes}<circle class="bv-ring" cx="${cx}" cy="${cy}" r="54"/><circle class="bv-core" cx="${cx}" cy="${cy}" r="32"/><text class="bv-label" x="${cx}" y="${cy + 5}">ONE</text>`;
  },
  path(n) {
    let d = 'M40 216', nodes = '';
    for (let i = 0; i < n; i++) {
      const x = +(40 + i * (320 / Math.max(1, n - 1))).toFixed(1);
      const y = +(216 - i * (150 / Math.max(1, n - 1)) + (i % 2 ? 26 : 0)).toFixed(1);
      if (i) d += `L${x} ${y}`;
      nodes += `<circle class="bv-node" cx="${x}" cy="${y}" r="8"/>`;
    }
    return `<path class="bv-spoke" fill="none" d="${d}"/>${packet(d, 3.2)}${packet(d, 3.2, 1.6)}${nodes}<circle class="bv-core" cx="360" cy="66" r="26"/><text class="bv-label" x="360" y="71">APP</text>`;
  },
  gate(n) {
    let left = '', lines = '', pkts = '';
    for (let i = 0; i < n; i++) {
      const y = +(62 + i * (176 / Math.max(1, n - 1))).toFixed(1);
      left += `<circle class="bv-node" cx="64" cy="${y}" r="8"/>`;
      lines += `<line class="bv-spoke" x1="64" y1="${y}" x2="168" y2="150"/>`;
      pkts += packet(`M64 ${y}L168 150`, 2, (i * 2) / n);
    }
    return `${lines}${pkts}${left}<rect class="bv-bar" x="168" y="86" width="64" height="128" rx="3" transform="translate(0,-36)"/><text class="bv-label" x="200" y="155">GATE</text><line class="bv-spoke" x1="232" y1="150" x2="322" y2="150"/>${packet('M232 150L322 150', 1.6, .5)}<circle class="bv-core" cx="336" cy="150" r="24"/>`;
  },
  stack(n) {
    let bars = '', pkts = '';
    const h = 22, gap = 8;
    for (let i = 0; i < n; i++) {
      const y = +(150 - (n * (h + gap)) / 2 + i * (h + gap)).toFixed(1);
      const w = 150 + (i % 3) * 52;
      const x = +(200 - w / 2).toFixed(1);
      bars += `<rect class="bv-bar" x="${x}" y="${y}" width="${w}" height="${h}" rx="2"/>`;
      if (i % 2 === 0) pkts += packet(`M${x} ${y + h / 2}L${x + w} ${y + h / 2}`, 2.6, i * 0.4);
    }
    return `${bars}${pkts}<circle class="bv-core" cx="200" cy="150" r="26"/><text class="bv-label" x="200" y="155">LOG</text>`;
  },
  pulse(n) {
    let rings = '', nodes = '';
    for (let i = 1; i <= 3; i++) rings += `<circle class="bv-ring" cx="200" cy="150" r="${34 + i * 32}"/>`;
    for (let i = 0; i < n; i++) {
      const angle = (Math.PI * 2 * i) / n - Math.PI / 3;
      nodes += `<circle class="bv-node" cx="${(200 + Math.cos(angle) * 112).toFixed(1)}" cy="${(150 + Math.sin(angle) * 112).toFixed(1)}" r="6"/>`;
    }
    const orbit = 'M200 52A98 98 0 1 1 200 248A98 98 0 1 1 200 52';
    return `${rings}${nodes}${packet(orbit, 5.5)}${packet(orbit, 5.5, 2.75)}<circle class="bv-core" cx="200" cy="150" r="30"/><text class="bv-label" x="200" y="155">ALERT</text>`;
  }
};

const benefitList = document.querySelector('[data-benefit-list]');
const visualIndex = document.querySelector('[data-visual-index]');
const visualTag = document.querySelector('[data-visual-tag]');
const visualBody = document.querySelector('[data-visual-body]');
const visualCaption = document.querySelector('[data-visual-caption]');

const paintBenefit = (item) => {
  if (!item || !visualBody) return;
  const shape = visualShapes[item.dataset.shape] || visualShapes.ring;
  const nodes = Math.min(12, Math.max(3, Number(item.dataset.nodes) || 6));
  visualBody.innerHTML = `<svg ${VISUAL_BOX} role="img" aria-label="Diagram for ${item.querySelector('.benefit-name').textContent}">${shape(nodes)}</svg>`;
  if (visualIndex) visualIndex.textContent = item.dataset.benefit;
  if (visualTag) visualTag.textContent = item.dataset.tag;
  if (visualCaption) visualCaption.textContent = item.dataset.caption;
};

/* Held so the motion-preference listener can redraw the current diagram when
   the visitor flips "reduce motion" — the SMIL packets live in the markup. */
let repaintActiveBenefit = () => {};

if (benefitList) {
  const items = [...benefitList.querySelectorAll('.benefit-item')];
  repaintActiveBenefit = () => paintBenefit(items.find((i) => i.classList.contains('is-open')) || items[0]);
  items.forEach((item) => {
    item.querySelector('button')?.addEventListener('click', () => {
      items.forEach((other) => {
        const active = other === item;
        other.classList.toggle('is-open', active);
        other.querySelector('button')?.setAttribute('aria-expanded', String(active));
      });
      paintBenefit(item);
    });
  });
  paintBenefit(items.find((item) => item.classList.contains('is-open')) || items[0]);
}

/* --------------------------------------------------- generic tab groups --- */

/* One implementation drives the attribute rail, the resource tabs, and the
   reading-track tabs. Panels stay in the DOM so their content remains
   crawlable; only `hidden` changes. */
const wireTabs = (tabSelector, { vertical = false } = {}) => {
  const tabs = [...document.querySelectorAll(tabSelector)];
  if (!tabs.length) return;

  const select = (tab, { focus = true } = {}) => {
    tabs.forEach((other) => {
      const active = other === tab;
      other.setAttribute('aria-selected', String(active));
      other.tabIndex = active ? 0 : -1;
      const panel = document.getElementById(other.getAttribute('aria-controls'));
      if (panel) panel.hidden = !active;
    });
    if (focus) tab.focus();
  };

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => select(tab, { focus: false }));
    tab.addEventListener('keydown', (event) => {
      const prevKeys = vertical ? ['ArrowUp', 'ArrowLeft'] : ['ArrowLeft', 'ArrowUp'];
      const nextKeys = vertical ? ['ArrowDown', 'ArrowRight'] : ['ArrowRight', 'ArrowDown'];
      let index = tabs.indexOf(tab);

      if (prevKeys.includes(event.key)) index = (index - 1 + tabs.length) % tabs.length;
      else if (nextKeys.includes(event.key)) index = (index + 1) % tabs.length;
      else if (event.key === 'Home') index = 0;
      else if (event.key === 'End') index = tabs.length - 1;
      else return;

      event.preventDefault();
      select(tabs[index]);
    });
  });
};

wireTabs('[data-attribute]', { vertical: true });
wireTabs('[data-resource]');
wireTabs('[data-explore]');

/* ------------------------------------------ architecture accordion list --- */

const archList = document.querySelector('[data-arch-list]');
const archItems = [...document.querySelectorAll('[data-arch]')];

archItems.forEach((item) => {
  item.addEventListener('toggle', () => {
    if (!item.open) return;
    archItems.forEach((other) => { if (other !== item) other.open = false; });
  });
});

const archToggle = document.querySelector('[data-arch-toggle]');
const archToggleLabel = document.querySelector('[data-arch-toggle-label]');
const hiddenCount = archItems.filter((item) => item.classList.contains('is-extra')).length;

archToggle?.addEventListener('click', () => {
  const expanded = archList.classList.toggle('is-expanded');
  archToggle.setAttribute('aria-expanded', String(expanded));
  if (archToggleLabel) {
    archToggleLabel.textContent = expanded
      ? 'Show fewer principles'
      : `Show all ${archItems.length} principles`;
  }
  archToggle.querySelector('span[aria-hidden]').textContent = expanded ? '↑' : '↓';

  /* Collapsing must not leave an open accordion stranded out of view. */
  if (!expanded) {
    archItems.forEach((item) => { if (item.classList.contains('is-extra')) item.open = false; });
  }
});

if (archToggleLabel && hiddenCount) archToggleLabel.textContent = `Show all ${archItems.length} principles`;
if (archToggle && !hiddenCount) archToggle.hidden = true;

/* ---------------------------------------------------------- newsletter --- */

document.querySelector('.newsletter-form')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const status = form.querySelector('[data-form-status]');
  const email = form.querySelector('#news-email');
  const role = form.querySelector('#news-role');

  /* No endpoint is configured yet. Confirming a subscription here would be a
     lie: the address goes nowhere. Say so plainly instead of showing success.
     Remove the [data-no-endpoint] attribute and the fieldset's `disabled` once
     the form posts to a real provider. */
  if (form.hasAttribute('data-no-endpoint')) {
    if (status) status.textContent = 'Signups are not open yet — the briefing schedule is still being confirmed.';
    return;
  }

  if (!email.value.trim() || !email.checkValidity()) {
    if (status) status.textContent = 'Enter a valid email address to subscribe.';
    email.focus();
    return;
  }
  if (!role.value) {
    if (status) status.textContent = 'Choose the role that best describes your work.';
    role.focus();
    return;
  }

  /* Reached only with a real endpoint configured; let the browser submit. */
  form.submit();
});

/* -------------------------------------------------------------- reveal --- */

/* Reveals, staggered depth, and hero parallax share one rAF-batched scroll
   pass. Everything is transform/opacity only — no layout property is animated,
   so the compositor handles it and scrolling stays off the main thread.

   Three rules hold this together:
     · reduced motion wins immediately, and is re-evaluated live
     · nothing is invisible without JS (see the .js-motion guard in styles.css)
     · will-change is set while an element moves and dropped when it settles */

const motionTargets = [...document.querySelectorAll('.reveal')];

/* Elements that share a row reveal in sequence rather than all at once. The
   delay is capped so a fourteen-item grid never leaves the last card waiting. */
const STAGGER_STEP = 60;
const STAGGER_MAX = 260;

const settleAll = () => {
  motionTargets.forEach((el) => {
    el.classList.add('is-visible');
    el.style.transitionDelay = '';
    el.style.removeProperty('--reveal-shift');
  });
};

let revealObserver = null;

const startReveals = () => {
  revealObserver = new IntersectionObserver((entries, observer) => {
    /* Entries arrive in DOM order per batch; grouping by parent gives each row
       its own stagger sequence instead of one delay ramp down the whole page. */
    const byParent = new Map();

    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const key = entry.target.parentElement || document.body;
      if (!byParent.has(key)) byParent.set(key, []);
      byParent.get(key).push(entry.target);
      observer.unobserve(entry.target);
    });

    byParent.forEach((group) => {
      group.forEach((el, i) => {
        el.style.transitionDelay = `${Math.min(i * STAGGER_STEP, STAGGER_MAX)}ms`;
        el.classList.add('is-visible');
        /* Clear the delay once the element has arrived, so a later hover or
           state change on the same node is not held back by a stale delay. */
        el.addEventListener('transitionend', () => { el.style.transitionDelay = ''; }, { once: true });
      });
    });
  }, { threshold: .06, rootMargin: '0px 0px -40px 0px' });

  motionTargets.forEach((el) => revealObserver.observe(el));
};

/* ------------------------------------------------------ scroll depth --- */

/* Layers that drift as the page scrolls. Each declares its own rate, and the
   background moves slowest, which is what sells the depth. Kept deliberately
   small (the hero art moves 6% of the scrolled distance) so the parallax reads
   as weight rather than as a moving background competing with the text. */
const depthLayers = [
  { el: document.querySelector('.hero-bg'), rate: 0.06 },
  { el: document.querySelector('.hero-scroll'), rate: -0.14 }
];

let depthTicking = false;

const paintDepth = () => {
  depthTicking = false;
  if (reducedMotion) return;
  const y = scrollY;
  /* Once the hero is fully scrolled past, stop writing transforms entirely. */
  if (y > innerHeight * 1.2) return;
  depthLayers.forEach(({ el, rate }) => {
    if (el) el.style.transform = `translate3d(0, ${(y * rate).toFixed(2)}px, 0)`;
  });
};

const requestDepth = () => {
  if (depthTicking || reducedMotion) return;
  depthTicking = true;
  requestAnimationFrame(paintDepth);
};

/* ------------------------------------------------- motion preference --- */

/* SMIL animations declared directly in the markup ignore the CSS
   prefers-reduced-motion override, so they must be stopped on the element
   itself. The deployment diagram's orbiting packet is the only such case. */
const declarativeMotion = [...document.querySelectorAll('animateMotion')];

const setDeclarativeMotion = (paused) => {
  declarativeMotion.forEach((node) => {
    /* beginElement/endElement are no-ops if SMIL is unsupported; guard anyway. */
    if (typeof node.endElement !== 'function') return;
    try { paused ? node.endElement() : node.beginElement(); } catch { /* no SMIL */ }
  });
};

const applyMotionPreference = () => {
  setDeclarativeMotion(reducedMotion);
  if (reducedMotion) {
    revealObserver?.disconnect();
    revealObserver = null;
    settleAll();
    /* Undo any parallax already written, so nothing is left off-position. */
    depthLayers.forEach(({ el }) => { if (el) el.style.transform = ''; });
    removeEventListener('scroll', requestDepth);
    return;
  }
  if (!revealObserver) startReveals();
  addEventListener('scroll', requestDepth, { passive: true });
  requestDepth();
};

/* The page ships with .reveal elements visible; this class hands control to JS
   only once JS is running, so a failed script never hides the content. */
document.documentElement.classList.add('js-motion');
applyMotionPreference();

motionQuery.addEventListener('change', (event) => {
  reducedMotion = event.matches;
  applyMotionPreference();
  /* SMIL packets are emitted as markup, so the current diagram must be redrawn
     to add or drop them when the preference flips mid-session. */
  repaintActiveBenefit();
});
