# SASE.Net

A vendor-neutral guide to **Secure Access Service Edge (SASE)**. The site defines SASE, explains what it converges and which environments it protects, sets out how to evaluate a platform and how to deploy one — through a responsive, dependency-free experience.

SASE is deliberately **not** framed here as exclusively cloud-delivered. Where traffic inspection and enforcement run is an architectural choice, not part of the definition.

[View the live site](https://ktg1.github.io/sase-net-site/)

The homepage is built to the wireframe in `example-homepage-zenarmor.drawio.png`, including its interaction notes.

## What is included

- A full-bleed hero over a generated SASE network illustration
- A "What is SASE?" definition section covering scope, convergence, and enforcement
- Customer evidence cards and team cards that reveal detail on hover and focus
- Statistics with info-icons that open an explanation
- A benefits accordion that swaps the diagram, tag, and caption as you select
- A locally scrolling rail of fourteen core SASE attributes beside a sticky panel
- Thirteen architecture principles as accordions, four visible until "show all"
- Six-area platform evaluation guidance and four themed internal-linking tracks
- Staggered scroll reveals and hero parallax, built on transform/opacity only
- Responsive layouts, keyboard-driven tabs, reduced-motion support, and semantic HTML

## Technology

This project intentionally uses a small, portable stack:

- HTML5
- CSS3
- Vanilla JavaScript
- GitHub Pages

There is no build step and no runtime dependency.

## Run locally

Clone the repository and serve its root directory with any static file server:

```bash
git clone https://github.com/KTG1/sase-net-site.git
cd sase-net-site
python3 -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000).

Opening `index.html` directly also works, but a local server more closely matches the GitHub Pages environment.

## Project structure

```text
.
├── index.html                            # Page content and semantic structure
├── styles.css                            # Design tokens, layout, responsive states
├── script.js                             # Tabs, accordions, diagram swap, reveal
├── assets/
│   ├── hero-edge.svg                     # Hero background illustration
│   └── favicon.svg                       # Browser tab icon
└── example-homepage-zenarmor.drawio.png  # Source wireframe
```

## Content map

Sections appear in the order drawn in the wireframe. The step number in the left
spine matches the `data-step` attribute on each `<section>`.

| # | Section | Purpose |
| --- | --- | --- |
| — | Hero | Defines SASE in one statement over the network illustration |
| 01 | Customer evidence | Written Zenarmor customer reviews, then four testimonials |
| 02 | Experts | Four specialists with hover biographies, then four statistics |
| 03 | What is SASE? | Definition, what it converges, what it protects, where enforcement runs |
| 04 | Benefits | Ten benefits; selecting one changes the diagram and the copy |
| 05 | Deploying SASE | Five deployment steps beside the policy-plane diagram |
| 06 | Core attributes | Fourteen attributes in a locally scrolling rail |
| 07 | Architecture | Thirteen design principles as expandable accordions |
| 08 | Leadership | Executive quote — **attribution provisional** |
| 09 | Evaluating a platform | Six evaluation areas as tabs |
| 10 | Articles | Article hub — **entries provisional** |
| 11 | Continue reading | Four reading tracks, eight internal links each |
| 12 | Edge notes | Briefing signup — **offer provisional, form disabled** |

## Provisional sections

Three sections are on the page with their structure finished but their content
awaiting client confirmation. Each is marked three ways so placeholder copy
cannot be mistaken for approved copy:

1. An `is-provisional` class on the `<section>`
2. A visible `.provisional-flag` notice on the page
3. An HTML comment listing exactly what must be supplied

| Section | Waiting on |
| --- | --- |
| Leadership (08) | Named speaker and real title. Must **not** read "CEO of SASE.net" — SASE.net is an informational property, not a company. Placeholder reads `[Name pending] / [Title pending] — Zenarmor`. |
| Articles (10) | Titles, standfirsts, and destinations for the reviewed articles. Six placeholder cards are in place. |
| Edge notes (12) | Confirmed offer, topics, owner, approver, and cadence — plus a real form endpoint. |

**The briefing form has no backend.** Its `<fieldset>` carries `disabled`, so it
cannot accept an address it would discard, and `script.js` returns an honest
"signups are not open yet" message instead of the simulated success it used to
show. To go live: set a real `action`, remove `disabled` and `data-no-endpoint`,
drop the `is-provisional` class, and delete the notice.

To clear a provisional section: replace every `[bracketed]` value, remove the
`is-provisional` class, delete the `.provisional-flag` element, and delete the
comment block above the section.

## Removed

- **Video testimonials** — the video review card and its CTA were removed
  because no video testimonials exist. The section intro no longer promises
  "two formats".

## Calls to action

Every button resolves to a real destination on the page. The fourteen
attribute-panel buttons previously promised tools that do not exist ("Model a
ZTNA policy", "Run a SaaS discovery"); they now read "Evaluate this capability"
and carry a `↓` in-page arrow rather than a `↗` external one.

## Editing the site

- Update page copy and section order in `index.html`.
- Change the visual system and breakpoints in `styles.css` — the palette, type,
  and spacing live in the `:root` block at the top.
- Update interactive behavior in `script.js`.
- Swap the hero art by pointing `.hero-bg`'s `background-image` at a photograph;
  nothing else needs to change.
- Motion lives in the `.js-motion` block of `styles.css` and the reveal/parallax
  section of `script.js`. Content is visible by default; the hidden start state
  applies only once JS confirms it is running, so a blocked script never leaves
  a blank page. `prefers-reduced-motion` is honoured in CSS, re-checked live in
  JS, and stops the SMIL diagram animations that CSS cannot reach.
- Tab panels stay in the DOM and are toggled with the `hidden` attribute so their
  content remains crawlable. Note that `[hidden]` is forced with `!important` in
  `styles.css`, because the UA rule loses to any component rule that sets `display`.
- Preserve the existing ARIA roles, `aria-selected` states, roving `tabindex`,
  keyboard focus styles, and reduced-motion behavior when adding interactions.

## Vendor naming

The wireframe labels three sections with the example vendor **Zenarmor**
("Benefits of SASE and Zenarmor", "SASE architecture with Zenarmor", and the
"Zenarmor's approach" callouts). Those labels are kept as drawn; the site brand
itself remains SASE.Net. Search `index.html` for `Zenarmor` to rename them.

## Publishing

The `main` branch is published with GitHub Pages. Changes pushed to `main` appear at:

**https://ktg1.github.io/sase-net-site/**

Deployment status is available from the repository's **Actions** and **Deployments** views.

## Content status

The review metrics, review quotes, and expert profiles are illustrative placeholders. Replace them with verified material before treating the site as production-ready. The two parked sections above must be resolved or stay removed.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the lightweight contribution and review workflow.

## License

No open-source license has been added. All rights are reserved unless the repository owner states otherwise.
