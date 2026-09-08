# SASE.Net

A vendor-neutral guide to **Secure Access Service Edge (SASE)**. The site defines SASE, explains what it converges and which environments it protects, sets out how to evaluate a platform and how to deploy one — through a responsive, dependency-free experience.

SASE is deliberately **not** framed here as exclusively cloud-delivered. Where traffic inspection and enforcement run is an architectural choice, not part of the definition.

[View the live site](https://sase-net-homepage-tau.vercel.app)

The homepage is built to the wireframe in `example-homepage-zenarmor.drawio.png`, including its interaction notes.

## What is included

- A full-bleed hero over a generated SASE network illustration
- A "What is SASE?" definition section covering scope, convergence, and enforcement
- Customer evidence cards and team cards that reveal detail on hover and focus
- Statistics with info-icons that open an explanation
- A benefits accordion that swaps the diagram, tag, and caption as you select
- A locally scrolling rail of fourteen core SASE attributes beside a sticky panel
- Thirteen architecture principles as accordions, four visible until "show all"
- Five long-form in-page guides: SASE deployment, use cases, Managed SASE, SASE for MSPs, and SASE for business
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
git clone https://github.com/Mark-HolisticSEO/sase.net-homepage.git
cd sase.net-homepage
python3 -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000).

Opening `index.html` directly also works, but a local server more closely matches the GitHub Pages environment.

## Project structure

```text
.
├── index.html                            # Homepage structure and content, including the five long-form SASE guides
├── styles.css                            # Design tokens, layout, responsive states
├── script.js                             # Tabs, accordions, diagram swap, reveal
├── motion.js                             # Scroll reveals, hero parallax, magnetic tilt
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
| 05 | Deploying SASE | Full SASE deployment guide on this page: definition, models, steps, prerequisites, and challenges |
| 06 | SASE use cases | Full SASE use case guide on this page: common use cases, remote work, branch, cloud, Zero Trust, ransomware, third-party access, Shadow IT, and industries |
| 07 | Managed SASE | Full Managed SASE guide on this page: provider functions, SASE vs Managed SASE, Managed SASE vs MSSP, benefits, drawbacks, selection, and SLAs |
| 08 | SASE for MSPs | Full MSP delivery guide on this page: multi-tenancy, delivery, benefits, MSP vs MSSP, platform requirements, pricing, onboarding, and building a practice |
| 09 | SASE for business | Full business guide on this page: adoption drivers, distributed workforces, multi-branch, cost benefits, scaling, security posture, business case, and getting started |
| 10 | Core attributes | Fourteen attributes in a locally scrolling rail |
| 11 | Architecture | Thirteen design principles as expandable accordions |
| 12 | Leadership | Executive quote — **attribution provisional** |
| 13 | Evaluating a platform | Six evaluation areas as tabs |
| 14 | Articles | Article hub; five in-page guides |
| 15 | Continue reading | Four reading tracks, eight internal links each |
| 16 | Edge notes | Briefing signup — **offer provisional, form disabled** |

## Provisional sections

Two sections are on the page with their structure finished but their content
awaiting client confirmation. Leadership and Edge notes are marked three ways
so placeholder copy cannot be mistaken for approved copy:

1. An `is-provisional` class on the `<section>`
2. A visible `.provisional-flag` notice on the page
3. An HTML comment listing exactly what must be supplied

| Section | Waiting on |
| --- | --- |
| Leadership (12) | Named speaker and real title. Must **not** read "CEO of SASE.net" — SASE.net is an informational property, not a company. Placeholder reads `[Name pending] / [Title pending] — Zenarmor`. |
| Edge notes (16) | Confirmed offer, topics, owner, approver, and cadence — plus a real form endpoint. |

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
  "two formats". The trust pair now shows a "SASE Testimonials" summary card
  alongside the City of Nordhorn quote, in place of the removed video card.

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
- Motion lives in `motion.js` and the `.js-motion` block of `styles.css`.
  Content is visible by default; the hidden start state applies only once JS
  confirms it is running, so a blocked script never leaves a blank page.
  `prefers-reduced-motion` is honoured in CSS, re-checked live in JS, and
  stops the SMIL diagram animations that CSS cannot reach.
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

The `main` branch is published on Vercel (`mark-seo`) from [Mark-HolisticSEO/sase.net-homepage](https://github.com/Mark-HolisticSEO/sase.net-homepage). Production is at:

**https://sase-net-homepage-tau.vercel.app**

Deployment status is available from the [Vercel project dashboard](https://vercel.com/mark-seo/sase-net-homepage). GitHub auto-deploy is not connected on this team yet; production deploys are run with `vercel deploy --prod --scope mark-seo`.

## Content status

Customer reviews on the homepage are published Zenarmor quotes (City of Nordhorn and named partner accounts). Expert profiles and statistics remain illustrative placeholders. The two parked sections above must be resolved or stay removed.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the lightweight contribution and review workflow.

## License

No open-source license has been added. All rights are reserved unless the repository owner states otherwise.
