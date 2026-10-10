
# IN/SITU Design System

**Current website typography (approved local review):** Space Grotesk 600 for headings, Source Sans 3 400 for reading text (with real italic and bold faces), and IBM Plex Mono for navigation, tags, metadata, and the unchanged wordmark. The tokens and self-hosted imports in `src/layouts/Base.astro` are authoritative. This supersedes the original font-substitution notes below.

**IN/SITU** is an interdisciplinary research lab at the University of Illinois, led by Professor Laura Shackelford, designing immersive, game-based, and interactive experiences that help people learn from and participate in the world around them — across archaeological sites, museums, cities, classrooms, and virtual worlds. Members work across anthropology, informatics, architecture, historic preservation, game studies, extended reality, AI, and the learning sciences, organized around a shared research philosophy (situated/contextual experience, immersive technology as means not ends, experiential learning, place/culture/public engagement, accessibility & belonging) rather than a single project or tool.

**Current lab members:** Laura Shackelford (Director — archaeology, human evolution, immersive field education), Sarvin Eshaghi (educational games, digital heritage, playable cities), Sepehr Vaez Afshar (serious games, XR, museums), Ogulcan Durmaz (AI-mediated XR for language learning), Brian Graves (accessibility in games/interactive environments).

**Flagship project:** VRchaeology (vrchaeologyillinois.com) — teaches archaeological field methods via VR. Other current projects: Chi311, XR in U.S. Museums, AI-Mediated XR for Language Learning, Game Accessibility Research.

**Site structure (provided):** Home · About (Mission & Vision, Research Philosophy, Lab History, Values) · People (5 members + Alumni/Collaborators) · Research (5 themes) · Projects (5 current + Completed) · Publications & Outputs · News & Events · Opportunities (Join, Collaborate, Participate) · Resources · Contact.

**Sources:** the lab's mission, roster, research themes, project list, and site structure were provided directly by the user (pasted brief) and referenced against the flagship project's public site, vrchaeologyillinois.com (a generic Wix template — used only to confirm project names, not copied visually). No Figma file, codebase, logo, or photography was attached — see "Caveats" at the end.

## Index

- `styles.css` — root stylesheet, imports everything below. Link this one file.
- `tokens/` — `colors.css`, `typography.css`, `spacing.css`, `fonts.css` (Google Fonts substitutes, see Typography below).
- `guidelines/` — specimen cards for the Design System tab (colors, type, spacing, wordmark, icons, shadow/radius).
- `components/core/` — Button, IconButton, Card, Badge, Tag
- `components/forms/` — Input, Select, Checkbox, Radio, Switch
- `components/navigation/` — Tabs
- `components/feedback/` — Dialog, Toast, Tooltip
- `ui_kits/lab-site/` — click-through recreation of the IN/SITU lab website (Home, Projects, Project detail, About/People)
- `assets/` — no logo file was provided (see Iconography); this folder holds the wordmark specimen and icon notes only
- `SKILL.md` — portable skill file for use outside this tool

## Content fundamentals

**Voice:** first-person-plural, institutional-but-human — "we build," "our work," never marketing "you"-address copy ("unlock your potential"). It reads like a lab reporting its own findings, not a product selling itself.

**Casing:** sentence case everywhere, including headings and buttons. Project and field names are set in the mono label style and often in small caps or all-caps (`SITE 04 — CAHOKIA`, `FIELD SEASON 2025`) to read like catalog labels, distinct from prose.

**Tone:** precise and descriptive over promotional. Prefer concrete nouns (excavation, mesh, corpus, interface, artifact, survey) to abstract ones (innovation, solutions, experience-driven). No exclamation points. No emoji anywhere — this is an academic/research context.

**Structure:** short declarative sentences; copy reads like field notes or a museum wall label. Example headline register: "Reconstructing Cahokia's Mound 72 in real time." Example body register: "The team combined LIDAR survey data with photogrammetry from three excavation seasons to produce a walkable, to-scale reconstruction used in both the field lab and a public gallery installation."

**Numbers & data:** dates, coordinates, site codes, and measurements appear often and are set in mono (`40.6°N, 90.06°W`, `EST. 2014`) — precision is part of the brand voice.

**What to avoid:** growth-hacking verbs ("supercharge," "unlock," "empower"), emoji, exclamation points, second-person imperative marketing voice, rounded/friendly diminutives.

## Visual foundations

**Color:** a deep excavation-dark base (`--ink-950` family) anchors dark surfaces and inverse sections; warm paper neutrals (`--paper-*`) are the primary light surface — closer to unbleached page than pure white. One warm heritage accent, a fired-clay ochre (`--ochre-500`), marks primary actions and heritage/physical-world content. One cool luminous accent, a survey-laser cyan (`--lumen-400`), is reserved for the digital/immersive/game side of the work — used sparingly, as a glow or line, never as a fill for large areas. Max two accent colors active in any one composition.

**Type:** three faces, each doing one job only. Big Shoulders Display (condensed, architectural, engineering-drawing feel) for display headlines — set tight (`line-height 0.95`, slightly negative tracking) and often in a heavy weight. Source Serif 4 for all reading body copy — a text serif, not a display one. IBM Plex Mono for every label, caption, tag, coordinate, and metadata string — always tracked out (`letter-spacing 0.08em`) and usually uppercase.

**Spacing:** a 4px base unit (`--space-1` … `--space-10`, 4px→128px), generous section spacing (48–96px between major blocks) with tight internal component spacing (8–16px) — the contrast reads as "precise drafting," not evenly-padded software.

**Backgrounds:** flat color fields, no gradients, no decorative blur. When photography is used it should be documentary/field-photography in character (site photos, museum interiors) rather than stock lifestyle imagery — warm, slightly desaturated, true-to-light (no cool color-grading, no heavy grain). Full-bleed imagery is reserved for hero moments only; everything else sits in the paper/ink flat-color system. No repeating decorative patterns.

**Animation:** minimal and functional, never bouncy. Fades and short cross-fades (`--dur-fast` 120ms / `--dur-med` 220ms, `--ease-standard` a gentle deceleration curve) for state changes; no spring/bounce easing, no parallax gimmicks. Motion should feel like a instrument readout settling, not a playful UI.

**Hover states:** on ink/paper surfaces, hover darkens fills slightly and/or introduces the hairline border in the accent color — never a color swap to an unrelated hue. On dark/inverse surfaces, hover brightens via the lumen accent (a thin glowing edge or underline) rather than lightening the whole fill, reserving that glow for exactly this purpose.

**Press states:** a 1px inset shift plus a slight fill darken — no scale/shrink transforms (this is a precise instrument, not a bouncy touch toy).

**Borders:** hairline (1px) borders in `--border-default` are the default separator on paper; a heavier 2px border in ink or the heritage accent marks emphasis (e.g. a selected tab, an active card). Borders are drawn, not implied by shadow.

**Shadows:** shallow and utilitarian — a 1px hard edge plus a soft, low-opacity drop (`--shadow-card`), reading as a card lifted slightly off a table, not glossy or floating. Inverse (dark) surfaces get a heavier, cooler shadow (`--shadow-inverse`). No colored/glow shadows except the deliberate lumen edge-glow used for the digital accent.

**Corner radii:** minimal — 2px default (`--radius-sm`), 4px for larger containers (`--radius-md`). Nothing pill-shaped except true controls that need it (switches, small tags). This is a drafting-table aesthetic: corners are barely eased, not soft.

**Cards:** flat paper surface, hairline border, `--shadow-card`, 4px radius. No colored left-border accent strip (a pattern this system deliberately avoids). A card's only accent is its content or a small mono label in the corner (e.g. a site code).

**Transparency/blur:** used only for modal/dialog scrims (a dark ink overlay at low opacity) — no frosted-glass blur anywhere else.

**Layout:** content sits in a max-width grid (`--grid-max` 1280px) with generous outer margins; headers can be fixed/sticky on scroll but keep a hairline bottom border rather than a shadow when they do.

## Typography — font substitution flag

No brand font files were provided. Based on the brief's direction (architectural display / readable serif / mono labels), this system substitutes three Google Fonts: **Big Shoulders Display** (display), **Source Serif 4** (body), **IBM Plex Mono** (labels) — loaded via `tokens/fonts.css`. **Please confirm these or supply the actual brand typefaces** if IN/SITU has licensed faces; swapping is a one-file change.

## Iconography

No icon set, sprite, or icon font was provided. This system uses **Lucide** (thin-stroke, geometric, precise — a reasonable stylistic match for the architectural/survey tone) loaded from CDN (`unpkg.com/lucide-static`) as inline `<img>` references — flagged here as a substitution, not a brand-owned asset. No emoji are used as icons or elsewhere (see Content fundamentals). No unicode-glyph icons. If IN/SITU has its own icon set (e.g. custom site/survey glyphs), attach it and this system should switch over.

## Logo / wordmark

No logo file was provided, so no logo was drawn or approximated. The "IN/SITU" wordmark is rendered in type only (see `guidelines/wordmark.card.html`): set in the mono face, uppercase, with the slash rendered in the heritage ochre accent and slightly enlarged to read as the brand's one graphic mark. **If IN/SITU has a real logo/wordmark lockup, please attach it** — this typographic treatment should then be replaced or reconciled with the real mark.

## Caveats & ask

The lab's mission, roster, research themes, and site structure are now real (provided by the user); the visual system (palette, type pairing, component inventory) is still a first-pass interpretation — no Figma, codebase, logo, or photography was attached. Publications, News, Opportunities, Resources, and Contact are stubbed with a disclaimer rather than invented content. **Please review and flag anything that should match real IN/SITU materials** — brand fonts, an existing logo, real photography, and any existing component library — so the next pass can correct toward ground truth instead of iterating on invention.


## Approved site-wide presentation — October 10, 2026

Use calm white and light-gray section surfaces with restrained borders and the existing soft corners; use corresponding semantic surfaces in night mode. Apply this hierarchy across page types, including Home, so long pages have clear visual sections. Keep readable prose widths inside the wider section surface. Research content and approved media lead the page. Person references are quiet, small, unboxed text links at the end of detail pages and list entries; they must not compete with the work. Keep names, relationships, routes, and citation authors intact. Topic chips remain temporarily hidden by the existing config switch.

VRchaeology has a CSS 3D disc-case presentation using its actual cover and game images. Opening the cover reveals a decorative disc and image sheet, with native controls for the readable image booklet. Essential information and the full gallery remain available independently of this effect. No continuous motion, automatic slideshow, or fake game screenshots. Respect site/device reduced motion, keyboard operation, no-JavaScript access, text resizing, and light/night contrast. Keep surrounding headings stationary when the booklet opens.

The enlarged VRchaeology hero keeps its heading compact and presents the case alongside an licensed, locally hosted 3D headset and controller models. The cover opens the case; the empty tray closes it. Both are native named keyboard controls. Opening the case reveals a clickable paper booklet; its native modal expands with a short rotation/scale transition, showing one screenshot and its caption/description at a time. Do not repeat the gallery below for JavaScript users; retain it as a no-script fallback. The headset has independently moving parts on hover/focus and a keyboard/touch availability disclosure. The disc performs one short lift/flip/spin on activation; its title is printed directly on the disc. No autoplay or promised online launch. The project’s Availability field is editable in the CMS.

Use a black printed game booklet with image, scene description, and real production credits. Enlarge the same paper design when selected, instead of introducing a different light gallery layout. Design reference: [The Banished Vault manual discussion by its director](https://www.gamedeveloper.com/design/deep-dive-the-banished-vault-manual); no text or artwork was copied. The user explicitly requested a real 3D headset on October 10; this supersedes the previous preference to avoid adding a 3D renderer for this presentation. Use on-demand rendering and respect reduced motion.

### Direct artwork interaction and shared motion

The disc uses the supplied cover as a single printed surface, keeping the original VRchaeology lettering intact. It stays inside the case: activation lifts and flips it a little; drag or arrow keys turn it, with compact Flip/Spin controls and Home to return it. The small tray-corner cross and the empty tray both close the case. Interior controls become available when the hinge has settled to prevent missed pointer clicks on moving targets.

The headset and each controller rotate independently through direct dragging. There is no visible rotation menu. With the headset focused, keys 1/2/3 select a part, arrows rotate it and Home resets that part. A drag never triggers the offline disclosure. The disclosure keeps its space reserved so the headset does not shift.

Use `--dur-med` (220 ms), `--delay-settle` (40 ms), and `--ease-standard` for control and disclosure transitions, including entering and leaving. Preserve immediate semantic feedback and navigation; the short delay belongs to visual settling, not artificial network or click latency. Use `--dur-decorative` (600 ms) for the case and deliberate disc movement. Shared helpers in `src/scripts/motion.ts` keep Escape, rapid toggling, focus restoration and device/site reduced motion consistent. No continuous rotation or autoplay.
