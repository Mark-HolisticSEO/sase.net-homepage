# SASE.Net

An editorial, interactive guide to **Secure Access Service Edge (SASE)**. The site explains how cloud-delivered networking and security converge at the edge through a responsive, dependency-free experience.

[View the live site](https://ktg1.github.io/sase-net-site/)

The homepage is built to the wireframe in `example-homepage-zenarmor.drawio.png`, including its interaction notes.

## What is included

- A full-bleed hero over a generated SASE network illustration
- Trust elements and team cards that reveal detail on hover and focus
- Statistics with info-icons that open an explanation
- A benefits accordion that swaps the diagram, tag, and caption as you select
- A locally scrolling rail of fourteen core SASE attributes beside a sticky panel
- Thirteen architecture principles as accordions, four visible until "show all"
- Tabbed selection guidance and four themed internal-linking tracks
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
│   └── hero-edge.svg                     # Hero background illustration
└── example-homepage-zenarmor.drawio.png  # Source wireframe
```

## Content map

Sections appear in the order drawn in the wireframe. The step number in the left
spine matches the `data-step` attribute on each `<section>`.

| # | Section | Purpose |
| --- | --- | --- |
| — | Hero | Defines SASE in one statement over the network illustration |
| 01 | Trust elements | Written and video proof formats, then four testimonials |
| 02 | Experts | Four specialists with hover biographies, then four statistics |
| 03 | Benefits | Ten benefits; selecting one changes the diagram and the copy |
| 04 | How to use SASE | Four adoption missions beside the policy-plane diagram |
| 05 | Core attributes | Fourteen attributes in a locally scrolling rail |
| 06 | Architecture | Thirteen design principles as expandable accordions |
| 07 | Leadership | Executive quote and briefing call to action |
| 08 | Before you choose | Pricing, support, readiness, and provider-selection tabs |
| 09 | Continue reading | Four reading tracks, eight internal links each |
| 10 | Edge notes | Newsletter capture |

## Editing the site

- Update page copy and section order in `index.html`.
- Change the visual system and breakpoints in `styles.css` — the palette, type,
  and spacing live in the `:root` block at the top.
- Update interactive behavior in `script.js`.
- Swap the hero art by pointing `.hero-bg`'s `background-image` at a photograph;
  nothing else needs to change.
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

The review metrics, review quotes, video cards, expert profiles, and subscription interaction are illustrative placeholders. Replace them with verified material and connect the form to a real service before treating the site as production-ready.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the lightweight contribution and review workflow.

## License

No open-source license has been added. All rights are reserved unless the repository owner states otherwise.
