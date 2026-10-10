# IN/SITU website

[Review preview](https://insitu-illinois.insituillinois.workers.dev/) · [Edit content](https://insitu-illinois.insituillinois.workers.dev/admin/) · [GitHub repository](https://github.com/insitu-illinois/website)

Astro static site, Sveltia CMS, and Cloudflare Workers static assets. The organization owns the repository. Both Workers are in the lab Cloudflare account. No custom domain or paid service is required.

## For lab members

There is no separate Sveltia account. Sign in to `/admin/` with your own GitHub account after accepting repository Write access. Cloudflare access is not needed to edit content. No terminal is needed.

Saving an entry commits it to GitHub. The automatic checks then rebuild and deploy the site, usually within a few minutes. A green **Check and deploy website** run in [Actions](https://github.com/insitu-illinois/website/actions) confirms publication. If a check fails, the previous site stays online: correct the entry and save again, or ask a maintainer to read the failed check. Reload the public page after a successful deployment.

**Draft** hides an entry from the public site, not from GitHub. This repository is public. Never enter private material or anonymous submissions, even as drafts. Do not change an existing slug: other entries use it as a permanent reference.

### Add a paper

1. Open `/admin/`, sign in with GitHub, and select **Publications → Create new entry**.
2. Enter a permanent **Slug** using lowercase letters and hyphens, and the approved title.
3. **Authors** is the complete author list in citation order, including external co-authors. **Lab authors** separately selects the lab members whose profile pages should show the paper. Keep both fields.
4. Fill the year, venue, type, and approved summary. Select the related project and research themes. Leave unknown optional fields blank.
5. Upload the PDF; add DOI and code links when available. Paste the citation into **BibTeX** to show the copy button. The initial citations contain only the known title, authors, venue, and year; add verified volume, pages, and DOI when available.
6. For a thumbnail, enable the image section, choose a file, and write meaningful **Alt text**. Both are required together.
7. Keep **Draft** on until the content is confirmed. Turn it off and save when ready.
8. Wait for the successful deployment. The paper automatically appears under its lab authors, project, and themes, and on Home if it is one of the two newest.

### Add a person

1. Select **People → Create new entry**. Enter their name and a permanent `first-last` slug.
2. Choose the confirmed role. **Collaborator** and **Alumni** have their own sections; every other role appears under **Current members**. Changing the role moves the person automatically. Smaller **Order** values appear first.
3. Enter an approved biography: alumni remain compact list entries without a displayed biography, while other roles receive a profile page. Without a biography, the person appears in the People list only, even if they have a photo. Add website, Scholar, and email only when supplied or verified against an identity-matched public profile. A photo is optional; enable it and fill both file and alt text. Without one, a neutral silhouette placeholder appears automatically.
4. Keep **Draft** on while details need approval, then switch it off and save.
5. Select that person in project **Team**, publication **Lab authors**, presentation **Presenters**, and recognition **Recipients**. Their four profile lists fill automatically.

When someone leaves, change their role to **alumni** rather than deleting them. Remove references before deleting any record. To restore an accidental change, a maintainer can revert the corresponding GitHub commit; do not force-push shared history.

### Other edits

- **Page text** edits the Home statement, About text, Join text, and shared lab contact. The proposed Home statement remains draft pending approval; the site shows the approved lab description meanwhile.
- Themes can be renamed by editing **Name** while keeping the slug. Relationships survive the rename.
- News dates accept `YYYY`, `YYYY-MM`, or `YYYY-MM-DD`. Leave unknown dates blank rather than inventing a day. The news index paginates automatically after six entries.
- Project and news bodies support headings, paragraphs, lists, emphasis, and links. Use heading level 2 for sections. Add images with the dedicated image fields.
- Optional links and badges only appear when filled. Empty collections show a quiet “No entries published yet” message.

## Invite an editor

The lab organization Owner handles invitations. The existing lab owner is `insituillinois`. The builder `sepehrvafshar` stays an organization Member with repository Admin access; Owner is not needed for routine website work.

1. In **insitu-illinois → Settings → Member privileges**, keep base repository permission **Read**.
2. Open **website → Settings → Collaborators and teams / Manage access → Add people**.
3. Invite the member's own GitHub account with **Write** access to `website` only. Do not give content editors organization Owner or repository Admin.
4. Ask them to accept the invitation, open `/admin/`, and sign in with their own account.

A separate non-writer identity has not been used for an end-to-end denial test. GitHub enforces repository permissions; verify this with a consenting test account when inviting the next editor. The build did not change organization-wide membership or base permissions.

## Review mode and launch

The preview URL is publicly reachable, but indexing is disabled. `src/config/site.mjs` contains the single switch, `indexingEnabled = false`. In this state, `robots.txt` disallows every crawler and every generated HTML page carries `noindex, nofollow`, including 404 and `/admin/`. These directives do not make the site private or immediately remove a previously indexed URL.

Only after the lab explicitly approves launch, a maintainer changes that one value to `true`, commits, and pushes to `main`. The next successful deployment allows public crawling and removes the public-page noindex tags. `/admin/` and the 404 page remain noindex. Verify the deployed robots.txt and a public page’s source. To return to review mode, set the same value back to `false` and deploy.

### Change the public lab email

In `/admin/`, open **Page text → Lab contact → Email**, enter the new address, and save. This single field updates Join and About. For example, it can later change to `contact@insitu-illinois.org`. Laura’s own People entry retains her university email independently.

The site emits separate address parts and readable `[at]` / `[dot]` text, then a small script constructs the keyboard-accessible email link at runtime. The accessible name and no-JavaScript fallback spell out the address without exposing the full address in HTML source. This deters simple scrapers; it is not secrecy from JavaScript-capable bots or readers of this public repository.

### CMS version and field help

Every editable field, including nested image fields, has a plain-English hint. Sveltia is pinned to `0.231.0` in `public/admin/index.html`. To upgrade, choose and review an exact release, change that version, check sign-in and forms, and deploy; do not replace it with a floating `@0` tag. `scripts/generate-cms.mjs` generates the form configuration and fails if a top-level field lacks a hint.

## Lab-only Cloudflare deployment

The lab Cloudflare account must be created with the lab Gmail and protected with 2FA. Never use the builder's personal Cloudflare account, even for a test. Never change or remove its existing GitHub connection.

The verified lab account is `insituillinois@gmail.com`, account ID `8ff08acf55c2976a352f2dcc15b7612f`. Email 2FA is active. `wrangler.jsonc` is pinned to this ID. Local credentials are stored separately under ignored `.cloudflare-lab/`.

Use `npm run deploy` for local publication. The deployment script clears inherited Cloudflare credentials, uses the isolated lab login, runs `wrangler whoami`, and aborts unless both the lab email and account ID match. It also aborts if a legacy global Wrangler directory would override the isolated login. A new maintainer must authorize their lab account session before this command can work. Do not use a bare deploy command with a personal profile.

Site Worker settings:

- Worker name: `insitu-illinois`.
- Root directory: repository root.
- Build command: `npm run build`.
- Deploy command: `npx wrangler deploy`.
- Static assets directory: `./dist` (already in `wrangler.jsonc`).
- Node.js: 24; dependencies installed from `package-lock.json`.
- Source: `insitu-illinois/website`, branch `main`.
- URL: use the assigned `insitu-illinois.<lab-account>.workers.dev` URL.
- Set that URL in **only** `astro.config.mjs` under `site`; canonical URLs, sitemap, and robots.txt derive from it.
- Free Workers plan. No domain or paid features are required.

Automatic publication uses GitHub Actions. The app installation flow offered **Authorize & Request** because the builder's personal account is currently an organization Member, although it has Admin access to this repository. No installation request was submitted and the existing personal Cloudflare connection was not changed. The Actions fallback is active. Its first verified deployment succeeded on October 7, 2026: commit `6aa3432`, [run 37664725671](https://github.com/insitu-illinois/website/actions/runs/37664725671), Worker version `a6cc0969-0c4b-42ca-82a5-8c37c36889c5`. The live homepage matched the local build byte for byte, and preview crawler restrictions remained in place.

The workflow checks content, builds, runs browser tests, and passes that exact `dist/` artifact to the deployment job. Only `main` pushes or a manual run on `main` can deploy; pull requests only verify. CI asserts the lab account ID, Worker name, and output directory before running Wrangler. The account ID is public configuration, not a secret.

To create or replace the deployment token:

1. Sign into Cloudflare as `insituillinois@gmail.com`. Open **Manage account → Account API tokens → Create Token**.
2. Name: `insitu-website-github-actions`. Choose **Custom**, then scope **Specified Workers → insitu-illinois**.
3. Select only **Individual Workers → Editor**. Do not select Admin, other Workers, account-wide access, or zone permissions. The site already exists and has no custom domain. This is the [minimum role for deploying an existing Worker](https://developers.cloudflare.com/workers/authorization/workers/).
4. Review the token. A token without expiration avoids silently stopping publication; revoke or replace it when access changes. Leave IP filtering empty because hosted GitHub runners have changing addresses.
5. The lab owner clicks **Create token**, copies its value, and opens [the repository's new Actions secret form](https://github.com/insitu-illinois/website/settings/secrets/actions/new).
6. Secret name: `CLOUDFLARE_API_TOKEN`. Paste the value in **Secret**, click **Add secret**, and close the Cloudflare token-reveal page. Never put the token into chat, a source file, or a commit. On replacement, update the existing secret instead of creating a second one.
7. Push to `main`, or open **Actions → Check and deploy website → Run workflow → main**. Confirm both jobs succeed, then check the public site. An unsuccessful check or deployment leaves the previous site online.

Set **Settings → Secrets and variables → Actions → Variables → CMS_AUTH_URL** to the relay origin after the OAuth Worker is configured. This value is not secret. The workflow passes it into the build that generates the CMS configuration.

## Recreate the Sveltia OAuth relay

Use the official project: https://github.com/sveltia/sveltia-cms-auth. Recheck its current README when replacing it, because variable names and setup screens can change.

1. Run `node scripts/deploy-auth.mjs`. It verifies the isolated lab identity with `wrangler whoami`, derives the allowed hostname from `astro.config.mjs`, and deploys the vendored official relay as `insitu-cms-auth` in the **lab** account. Its current origin is `https://insitu-cms-auth.insituillinois.workers.dev`. Source provenance and license are in `infra/cms-auth/`. This command preserves dashboard variables; secrets stay in Cloudflare.
2. The existing lab organization Owner (`insituillinois`) opens **insitu-illinois → Settings → Developer settings → OAuth Apps → New OAuth App**.
3. Application name: **IN/SITU content editor**. Homepage URL: the actual site URL from `astro.config.mjs`. Authorization callback URL: the actual auth Worker URL followed by `/callback`.
4. Register the app and generate its client secret. The owner enters credentials directly in Cloudflare, never in Git, chat, or a source file.
5. In the auth Worker's **Settings → Variables and Secrets**, set `GITHUB_CLIENT_ID`, encrypted `GITHUB_CLIENT_SECRET`, and `ALLOWED_DOMAINS` to the site's hostname without `https://` or a path. Save and deploy.
6. Set the site's build variable `CMS_AUTH_URL` to the auth Worker's origin. `npm run build` generates `public/admin/config.yml` with this value as `backend.base_url`; the backend is GitHub, repo `insitu-illinois/website`, branch `main`, with `auth_scope: public_repo` so editors are not asked for private-repository access. Keep this environment variable in whichever deployment path is active.
7. Redeploy the site. Test `/admin/` with a permitted editor, create and publish a harmless draft, verify the GitHub commit and successful redeployment, then remove the test entry. Verify that a user without repo Write access cannot publish.

The lab-owned [IN/SITU content editor app](https://github.com/organizations/insitu-illinois/settings/applications/3912656) is registered. Its credentials are stored in the lab auth Worker, and `CMS_AUTH_URL` is set in repository Actions variables. Editor sign-in, saving a draft, a successful automatic deployment, draft exclusion on the live site, and deletion of the test record have been verified. The relay requests `public_repo`, validates the requesting hostname, and uses a secure CSRF state cookie. Tokens retain GitHub's expiration behavior. Never post credentials in chat or source control.

The CMS script is pinned to major version `0`. Its YAML is generated from the same field model as Astro's schemas; manual changes to generated YAML are overwritten. Markdown is rendered at build time with Marked and sanitized with sanitize-html. Images belong in the dedicated image fields, which require alt text; embedded Markdown images and executable HTML are not rendered.

## Attach a custom domain later

No custom domain has been bought or configured.

When the lab separately authorizes it:

1. Register the chosen domain in the lab Cloudflare account; the lab owner handles payment.
2. Add it under the site Worker's **Settings → Domains & Routes → Add → Custom Domain**.
3. Change `site` in `astro.config.mjs` to the new HTTPS origin and redeploy.
4. Change the GitHub OAuth App's Homepage URL to the new site URL. Its callback stays on the auth Worker's `/callback` URL unless that Worker itself moves.
5. Add the new hostname to the auth Worker's `ALLOWED_DOMAINS` (comma-separated with the old hostname during transition). If running `deploy-auth.mjs`, it sets this variable from the current `site` hostname; re-add the old hostname afterward if keeping both during migration.
6. Check the homepage, profile and project deep links, `/admin/`, canonical URLs, sitemap, and `robots.txt` over HTTPS.
7. Decide whether the old `workers.dev` URL should remain reachable or redirect; do not retire it accidentally.

## Development and checks

Editors do not need these commands. A future maintainer needs Node.js 24, npm, Git, and an authorized GitHub account.

```sh
npm ci
npm run dev
npm test
npm run check
CMS_AUTH_URL=https://insitu-cms-auth.insituillinois.workers.dev npm run build
npx playwright install chromium
npx playwright test
```

With Chrome already installed, use `PLAYWRIGHT_CHANNEL=chrome npx playwright test`. CI uses Chrome supplied by the Ubuntu 24.04 runner, avoiding an unnecessary OS package download; all accessibility and browser checks still run. See [Playwright browser channels](https://playwright.dev/docs/browsers#google-chrome--microsoft-edge) and [GitHub runner software](https://github.com/actions/runner-images/blob/main/images/ubuntu/Ubuntu2404-Readme.md).

`npm run dev` includes drafts and labels them; `npm run build` excludes them. `npm run preview` serves the production output. The build validates slugs, references, dates, and image alt text. Tests exercise every derived-list rule, draft exclusion, safe Markdown, OAuth domain/CSRF checks, keyboard navigation, citation copying, reduced motion, links, assets, sitemap, and automated axe checks at 1440, 390, and 320 CSS pixels. Browser screenshots are saved under ignored `test-results/`.

Public pages use self-hosted fonts and make no third-party runtime requests. The CMS loads its exact-version script (`@sveltia/cms@0.231.0`) from a CDN. No analytics or tracking was added. Color, typography, spacing, border, and motion values come from `design-system/`; the font-role assignments are unchanged. The favicon is a temporary typographic slash using the same color tokens, pending the actual logo file.

### Repository layout

- `src/content/`: seven collections and ordinary-page text, edited through Sveltia.
- `src/lib/content-model.mjs`: one model generates Zod schemas and CMS fields.
- `src/lib/derived.mjs`: shared filtering, sorting, grouping, and reference rules.
- `src/pages/`: nine ordinary pages and the five record templates; presentations and recognition remain list-only.
- `src/components/`, `src/layouts/`, `src/styles/`: shared rendering and token-based styling.
- `public/admin/`, `public/media/`: CMS entry point and uploaded media.
- `infra/cms-auth/`: pinned official OAuth relay source and license.
- `scripts/`: content checks, generated CMS configuration, and lab-only deployment guards.
- `.github/workflows/check.yml`: checks, build artifact, and deployment on `main`.

### Domain and login configuration

`astro.config.mjs → site` is the only website-origin configuration. Do not duplicate the site URL inside templates. The OAuth relay is a separate service origin supplied as `CMS_AUTH_URL`; this does not change when the website gets a custom domain. Local builds need that variable to generate a working `/admin` config. GitHub Actions supplies it automatically.

To authorize a new maintainer's local lab session, from the repo run `XDG_CONFIG_HOME="$PWD/.cloudflare-lab" npx wrangler login`, complete login as the lab account, then run `XDG_CONFIG_HOME="$PWD/.cloudflare-lab" npx wrangler whoami` and verify the exact lab email and ID below. Never reuse a personal login. The guarded deployment scripts additionally clear inherited credential variables and reject a conflicting legacy Wrangler directory. Keep `.cloudflare-lab/` ignored and private.

## Content provenance and confirmation queue

Initial facts came from the supplied seed content, old-site archive, and the old Team page explicitly authorized in the October 7 review request. The later profile update also uses the lab-authorized online sources listed below. The ZIPs and reference files stay local and are not published. Two archived paper PDFs were preserved under `public/media/papers/`, and their author lists were read from those PDFs. The third PDF was unavailable; that paper stays draft. Initial BibTeX entries format already-supplied citation facts without adding new bibliographic claims.

Unconfirmed relationships remain empty, including the current VRchaeology team and Sarvin's Chi311 team link. CITL and ATLAS are not displayed as current partners. Project stubs, absent photography, and missing summaries remain clearly empty or marked forthcoming. The four themes use the approved first-pass names. The real logo can replace the wordmark-only header and temporary favicon when supplied. The Home statement, opening details, and unconfirmed records need lab review, not new code.

### Every current draft

- `src/content/news/gsd-282-spring-2027.json` — GSD 282 announcement, pending approved wording.
- `src/content/news/website-launch.json` — Launch announcement, pending date and copy.
- `src/content/pages/home.json` — Proposed Home statement, pending Laura’s approval.
- `src/content/publications/cognitive-loads.json` — Bibliographic details and shareable PDF need confirmation.
- `src/content/recognition/epic-megagrant.json` — Year and recipients need confirmation.

All 24 people are approved for listing by the October 7 review request. The six current members, five collaborators, and thirteen alumni are public records. At that initial review, Lily’s biography and photo were blank. Her subsequently supplied biography and LinkedIn are now included; her photo remains blank. Alumni now use compact list entries instead of biography pages.

### Old Team page import

On October 7, 2026, the lab requested import from [the old Team page](https://www.vrchaeologyillinois.com/the-team). Eight biographies were imported with light tense edits. References to planned Fall 2022 degrees remain plans, not claims of completed degrees. The four existing approved current-member biographies were retained. Eleven assigned images were downloaded successfully into `public/media/people/`, with `Portrait of <name>` alt text. No image download remains failed. The source assigns pet photos to Laura Shackelford, Wen-Hao David Huang, Dan Matis, and Alexandra Zachwieja, and a VR figurine to Emma Verstraete. The lab explicitly confirmed preserving those assigned images; six others are headshots.

The old page used a silhouette for Alan B. Craig, Alice (Xuehui) Chao, Cameron Merrill, and Jin Jang; a lab logo for David Hopping, Robbie Sieczkowski, Nan Kang, and Zade Lobo. Those generic placeholders are not imported. Sepehr Vaez Afshar, Sarvin Eshaghi, Ogulcan Durmaz, Brian Graves, and Lily Meyer had no entry on that old page, so no old portrait was available for them.

The old alumni list provided no biographies for Alexandra Zachwieja, Jamie Arjona, Janny Chen, Monika Janas, Alice (Xuehui) Chao, Aaron Stocks, Isaac Smith, Cameron Merrill, Rajee Shah, Jin Jang, or Emma Verstraete. Those alumni remain compact list entries with photos and verified website/LinkedIn icons where available. Alumni biographies are not displayed. Lily now has a profile using the biography supplied by the lab.

## Release verification

The initial preview was deployed October 6, 2026; GitHub Actions deployment and editor login were connected October 7. The initial full-site build had 32 public HTML pages (including 404), plus sitemap, robots.txt, and favicon. All five template types are built. Local verification: 15 unit/security/content tests, zero Astro errors or warnings, and 9 browser checks passed. All 9 browser checks also passed against the live URL. The homepage, representative project and publication pages, sitemap, robots.txt, favicon, and CMS configuration matched the local build byte for byte. HTTPS and security headers were verified with Chrome and curl; missing routes return HTTP 404, and `/admin/` carries `noindex`. The October 7 review corrections supersede that initial crawler policy: indexing is disabled across the site until launch approval.

The browser checks use desktop Chrome with viewport emulation, not physical phones, Safari, or a screen reader. Automated axe checks supplement the keyboard and visual checks; they are not a claim of comprehensive manual WCAG certification.

CMS round trip: creation commit `1be1e15`, successful deployment [run 37672009509](https://github.com/insitu-illinois/website/actions/runs/37672009509), deletion commit `b7625ce`. The first CMS save exposed blank optional references; schemas now accept those blanks while still rejecting invalid nonblank references. The temporary record was removed after verifying the successful deployment.

Full website release: October 7, 2026, source commit `538d0107a7514be6e54b517bd3f6aefb2d65160c`, [successful Actions run 37672484614](https://github.com/insitu-illinois/website/actions/runs/37672484614), Cloudflare version `90fd8b7d-19cd-47c8-a8b0-022876bf5e0b`. CMS cleanup [run 37672349472](https://github.com/insitu-illinois/website/actions/runs/37672349472) also succeeded. Subsequent documentation and test-timeout updates do not change public content.

Review corrections verified locally on October 7 (20 unit/content/security tests, zero Astro diagnostics, and 11 browser checks): 51 collection records, 24 visible people, 12 biography-based profiles, and 11 imported images. One launch switch controls robots and public-page indexing. All editable fields have hints, and the shared lab contact is assembled at runtime. The four withdrawn publication records were deleted from the current repository contents. Automated checks include both JavaScript and no-JavaScript contact rendering, source-level email exclusion, role regrouping, and absence of empty profile routes.

## People and topic tags

In `/admin`, choose names from the searchable relationship fields; you do not need to type an ID or add a hashtag in the text. Save the entry and wait for the successful deployment before checking the website.

- **Projects → Team** connects a project to each selected person's profile.
- **Publications → Authors** keeps the complete citation in order. **Lab authors** separately selects lab people and alumni to preserve person relationships. Always maintain both fields.
- **Presentations → Presenters** and **Recognition → Recipients** connect those entries to people.
- **News → People** tags the people mentioned in a post. **Related project** connects the same post to its project page. **Related publication** adds a link to the paper.
- **Themes** selects topics for any of these records. People also have a Themes field for confirmed interests; their profiles combine these with themes from their projects, papers, and talks. Theme pages collect related work, news, recognition, and people. A news mention does not automatically become a person's research interest.

Name tags open a biography page when one exists; otherwise they jump to that person's entry on People. Changing a relationship updates the derived lists on the next build. Draft entries stay out of published lists. Removing a person or theme while other entries still refer to it causes validation to fail: remove those selections first.

**People → Affiliations** holds confirmed appointments, one per line, separately from the biography. **University profile**, **Website**, and **Google Scholar** accept verified profile URLs. Leave a link blank if the identity is uncertain. Do not change existing slugs when updating a name.

## Lab address and embedded map

Open **Page text → Lab location** to edit the single address shared by About and Join. The confirmed location is Davenport 209J, 607 S. Mathews Ave., Urbana, IL 61801. The map identifies the building; the written address identifies the room.

To replace the map, find the building in Google Maps, choose **Share → Embed a map**, and copy only the URL between `src="` and the next `"` in the supplied iframe code into **Map embed URL**. Keep the directions link in **Directions link**. The build accepts only HTTPS `www.google.com/maps/embed?pb=...` URLs. No API token or paid Maps account is needed. Visitors choose **Show lab map** to load Google Maps inside the page. Before that action, the public site makes no third-party requests; the address and directions link also work without JavaScript.

## October 7 profile research and publication sources

The lab authorized online research in addition to the original handoff. Five official university portraits were downloaded successfully and are served locally. Laura's earlier assigned image remains in the media archive; her profile now uses her university headshot. Lily Meyer's later biography and LinkedIn were supplied by the lab; no portrait has been supplied or verified.

- Laura: [Anthropology directory](https://anthro.illinois.edu/directory/profile/llshacke) and [Illinois Experts](https://experts.illinois.edu/en/persons/laura-lynn-shackelford/). Current appointments come from the email signature supplied and confirmed by the lab on October 7, 2026; these supersede older appointment descriptions.
- Sepehr: [Informatics profile](https://informatics.ischool.illinois.edu/people/sepehr-vaez-afshar/), including its linked ResearchGate profile.
- Sarvin: [Informatics profile](https://informatics.ischool.illinois.edu/people/sarvin-eshaghi/), including its linked ResearchGate profile.
- Ogulcan: [Informatics profile](https://informatics.ischool.illinois.edu/people/ogulcan-durmaz/) and [ResearchGate](https://www.researchgate.net/profile/Ogulcan-Durmaz).
- Brian: [SIB directory](https://sib.illinois.edu/directory/profile/brianag3), [March 27 university announcement](https://sib.illinois.edu/news/2026-03-27/two-peec-students-amongst-finalists-research-live), and his matched LinkedIn profile. The announcement supplies the portrait, candidacy, and news item. No sensitive personal details from the announcement were imported.

New publication search window: October 7, 2025–October 7, 2026. One identity-matched paper was verified: [Bridging anatomy curricular gaps](https://doi.org/10.1002/ca.70118), Clinical Anatomy, first published online April 10, 2026. Author order and date come from [publisher-deposited Crossref metadata](https://api.crossref.org/works/10.1002/ca.70118), corroborated by Laura's university page. It is connected to Laura and Situated learning, without inventing a lab project association. Existing older papers remain; the four withdrawn records remain deleted. Matching names already in their citations were connected to the corresponding lab people/alumni without changing the Authors text.

This is a verified addition, not an exhaustive annual bibliography. Direct Google Scholar profile lookup was unavailable during research, and no unverified Scholar IDs were saved. Publisher searches can omit unindexed work. Same-name authors in unrelated fields were excluded. Ogulcan's June 2025 DIVE-L article and 2024 thesis fall outside the requested window. The new news item demonstrates editable People and Themes tags with a sourced announcement rather than invented sample content.

Profile/tag/map update verified locally on October 7: 53 collection records, five new university portraits, one new paper and one sourced news item, 24 passing unit/content/security tests, zero Astro diagnostics, and 13 passing browser checks. Browser coverage includes all public pages at 1440, 390, and 320 CSS pixels, keyboard navigation, relationship links, map activation, robots/noindex, draft exclusion, and both email fallbacks. The Google map was also visually checked after loading and identifies Davenport Hall. Publication uses the existing lab-only GitHub Actions deployment; the release commit and exact workflow result are available in the repository Actions history.

Deployed profile/tag/map release: source commit `1555c4e5306f8487d669ec540b07b1149b01a3e9`, [successful Actions run 37679152868](https://github.com/insitu-illinois/website/actions/runs/37679152868), lab Worker version `e050a4ac-2389-4d5b-9ba9-b1e44e1c0a91`. All 13 browser checks also passed against the live preview. Homepage, Laura's profile, Join, robots.txt, and CMS configuration matched the tested local build byte for byte via curl. The live editor displayed the saved Brian Graves and Accessibility tags and the new Lab location entry. The live embedded map was visually checked. Cloudflare rejected Python's default HTTP client with 403, while curl and Chrome succeeded; no claim is made about every client or network. This documentation-only release note does not require rebuilding or redeploying unchanged site assets.

## Accessibility settings (local review branch)

The header and footer **Accessibility** buttons open a keyboard-accessible settings panel. Visitors can choose 100%, 125%, 150%, or 200% text, reduce motion, increase contrast, and reset their preferences. Settings are stored only in the visitor's browser under `insitu-accessibility`; nothing is sent to an external service. Saved values apply before the page is painted. If storage is blocked, controls still affect the current page. Device-level reduced motion remains active even after reset. Escape and Close return focus to the opening button, and Tab stays within the dialog. Without JavaScript, the entries link to the statement instead.

Edit the statement through **Page text → Accessibility** in `/admin` after this branch is released. Keep its evaluation status and known limitations accurate; passing automated checks is not certification. The contact link uses the same obfuscated **Lab contact → Email** field as the footer. Guidance: [WCAG 2.2 quick reference](https://www.w3.org/WAI/WCAG22/quickref/) and [W3C accessibility statements](https://www.w3.org/WAI/planning/statements/).

The implementation targets WCAG 2.2 AA. Local verification covers automated public-page rules at 1440, 390, and 320 CSS pixels; keyboard focus containment/restoration; preference persistence/reset; device and site motion settings; blocked browser storage; and the no-JavaScript fallback. Representative Home, Publications, People, VRchaeology, and Accessibility pages are additionally checked at 200% text on a 320 CSS-pixel viewport with higher contrast. Manual review covers the panel appearance and keyboard dismissal. A complete screen-reader audit, actual browser-zoom testing across browser engines, and testing with disabled users remain outstanding.

Media review still needed: `public/media/papers/motivational-support.pdf` and `public/media/papers/formative-evaluation.pdf` need checks for tagged structure and reading order. External project experiences and externally linked videos need their own caption, transcript, audio-description, and equivalent-participation review. Current presentation records have no video or slides URLs. Written project descriptions and the written lab address remain available without immersive equipment or the Google map, but they are not complete equivalents of every external experience. No original content or asset has been removed by these changes.

These changes are on `codex/light-presentation-preview`, for local review only. They have not been merged or deployed to the public site.

## Fonts in the local presentation preview

The approved combination is Space Grotesk 600 for headings, Source Sans 3 400 for body text, and IBM Plex Mono for navigation and metadata. Body text remains 18 CSS pixels by default with 1.65 line spacing; accessibility text sizing still applies. Actual Source Sans italic and bold files are bundled for formatted content. Fontsource packages serve all fonts from the site itself without Google Fonts requests. Family, size, and heading-weight tokens live in `design-system/tokens/typography.css`; the approved wordmark remains unchanged.

## Night mode and home-page sections (local review)

**Night mode** in the header switches every public page between light and dark palettes. Its outlined/filled moon icon, descriptive tooltip, accessible name, and pressed state work with keyboard and assistive technology. Light is the default even if the device prefers dark mode; only an explicit saved choice activates night mode. Theme and accessibility settings share the same browser preference record, so changing one preserves the others. Reset preferences also turns night mode off. If storage is blocked, changes work on the current page without being saved. `/admin` remains Sveltia's separate editor interface.

Night colors are tokens in `design-system/tokens/colors.css`, including distinct button text and hover colors. Higher contrast has a separate night palette. The home page now uses consistent section spacing and visible separators, without removing, reordering, or rewriting its content. This improves scanning while preserving the full research, publication, and news lists.

## Navigation in the local review preview

The six primary destinations are About, Research, People, Publications, News, and Join. Research opens a single submenu containing Projects, Research themes (the existing About section), Presentations, and Awards & funding. Existing URLs and content remain unchanged. The submenu opens by click, Enter, or Space; Escape closes it and restores focus. Smaller screens have a labeled Menu button. Without JavaScript, the links remain available through native HTML disclosure.

Night mode and Accessibility use compact icons in the header, with 48 CSS-pixel touch targets, accessible names, and hover/focus tooltips dismissible with Escape. The footer retains a text Accessibility entry. Navigation checks cover submenu links, keyboard behavior, no-JavaScript access, and enlarged text on mobile, alongside the existing light/night accessibility checks.

## Monochrome presentation trial

The local review uses a white reading surface, neutral text and outlined actions, with matching charcoal header and footer. Research themes keep their descriptions and links in an open two-column layout. Night mode uses neutral grays; high contrast and focus indicators remain available. All content, routes, CMS configuration and deployment settings are unchanged. Palette values are centralized in `design-system/tokens/colors.css`. This trial has not been published.

The softer-corner trial uses shared radius tokens: 4 pixels for tags, 8 for controls, and 12 for media, cards and the accessibility panel. Header/footer silhouettes and section dividers remain straight. This is a presentation-only change on the local review branch.

The hero now includes an original decorative SVG spatial study (not a map, lab photograph, or research result); the real-photo placeholder remains labeled. Featured work has a subtle neutral background. Both header utility icons share a local SVG component and retain their accessible names, tooltips, 48-pixel targets, and existing behavior. The artwork is static and hidden from assistive technology.

Header utility artwork uses Google's Material Icons: the outlined Bedtime crescent for night mode, plus filled Bedtime and Accessibility New, downloaded from the official `google/material-design-icons` repository and stored in `src/assets/icons/material/` with the Apache 2.0 license. The crescent source is `src/image/bedtime/materialiconsoutlined/24px.svg` in that repository. Icons render at their native 24-pixel size inside 48-pixel controls. No icon CDN or runtime dependency is used. Source: https://developers.google.com/fonts/docs/material_icons

## Concise homepage preview

Home presents the introduction, one featured project, four title-only theme links, the two newest papers, and the two newest news items. Publication and news previews show titles and date/venue metadata; full descriptions, authors, tags, and resource links remain on their detail and archive pages. The shared-premise explanation remains on About; the complete Support & connections list moved to About at `#support`. Home retains direct links to support and Awards & funding. CMS records, draft status, and existing URLs are unchanged.

The footer has three columns: lab identity, Explore (Projects, Publications, Lab values), and useful links (About, People, Accessibility, Sign in). Contact and directions remain on Join and About. The bottom row displays the build year, IN/SITU copyright, the editable developer credit, and the accessibility statement. Edit the credit in **Page text → Lab contact → Developer name**; leave blank to hide it. This notice does not change third-party content ownership or licenses. The mobile menu uses a three-line icon with an accessible Menu label.

## Lab review updates

Edit **Page text → Lab values** to change the three shared sentences on Home and About, plus the longer explanation on About. **Proposed** displays “Proposed values · Pending lab review”; turn it off only once the lab approves the wording. **Draft** hides the entire section and its footer link from static builds. The initial proposal is visible with the owner’s explicit approval, and is not presented as an adopted lab policy.

Every People entry has optional **LinkedIn**, **Google Scholar**, and **Website** fields. Only enter verified personal URLs; blanks produce no placeholder link. Icons accompany readable labels and screen-reader names. Current members and collaborators with biographies have a detail page; alumni show only their names, photos, and verified LinkedIn/website icons on People. Otherwise verified profile links appear in the People list. Existing roles, ordering, and relationships are preserved. Profile source notes and remaining blank channels are recorded in `docs/people-source-review.json`.

The night-mode button always shows a crescent: an outline in light mode and a filled moon in night mode. Filling/unfilling takes the shared 600 ms decorative transition token. Device and site reduced-motion preferences disable that transition. No sun is shown. Google Material Icons remain under Apache 2.0. Profile icons use Bootstrap Icons (LinkedIn and globe, MIT) and Simple Icons (Google Scholar, CC0), with licenses in their asset directories. SVGs are stored locally with no third-party requests.


Alumni appear as a compact list on People: name, optional photo, and verified LinkedIn/website icons only. There are no disclosures or visible biographies, and no Scholar links. Biography and Scholar values remain stored for future use. Former biography URLs redirect to the person's entry on People; alumni are excluded from the profile sitemap. Changing a person's role in `/admin` automatically changes this behavior. Icon links have accessible names, visible keyboard focus, and 48-pixel touch targets.


## Verified release — October 7, 2026

- Live site: https://insitu-illinois.insituillinois.workers.dev/
- Repository: https://github.com/insitu-illinois/website
- Deployed source commit: `d9905e007430e44a7db809b8e851be4fd6bba163`.
- Successful verification and deployment: [Actions run 37709223363](https://github.com/insitu-illinois/website/actions/runs/37709223363).
- Cloudflare Worker version: `960f453a-5768-4b3c-b0bc-4c0a7bf82b6d`, in the existing lab account. The workflow builds with `npm run build`, uploads only `dist/`, checks the lab account ID, and deploys using `wrangler.jsonc`.
- Delivered the reviewed monochrome design, accessibility preferences, persistent night mode with an animated filling crescent, verified profile updates and portraits, editable proposed lab values, and revised footer credit. Alumni display names, optional photos, and verified website/LinkedIn icons only; no biographies, disclosures, Scholar icons, or separate biography pages. Old biography URLs redirect to the corresponding People entry.
- Preserved all 24 people and their roles, order, draft status, and theme relationships. Projects, publications, themes, news, presentations, and recognition content remained unchanged in this presentation release.
- Validation: 24 unit/content/security tests; zero Astro diagnostics; 27 browser tests passed in CI. Browser checks cover keyboard use, 320/390-pixel mobile layouts, light/night contrast, 200% text, reduced motion, preferences, relationships, drafts, links, and crawler policy. A delayed-script regression test verifies that opening Research during loading is preserved.
- Live verification: Chrome smoke checks covered alumni links, preferences, night mode, and mobile/no-JavaScript navigation. A desktop navigation timing issue found during the first live pass was fixed; all four navigation tests then passed on the final deployed version. HTTPS root, People, Lily, the former Zade URL, robots.txt, favicon, CMS configuration, and Zade's portrait returned 200 and matched local build bytes. `robots.txt` remains text/plain with `Disallow: /`; public pages retain noindex. Launch still requires explicit approval.
- Manual visual review was performed on the local preview. A repeat manual browser visit to the live URL was blocked by the tool's approval-service usage limit; this did not affect deployment or the independently initiated automated checks. Full manual screen-reader testing and evaluation of external PDFs/videos remain outstanding as described on the Accessibility page. Proposed values still require lab approval; unverifiable profile links stay blank.

Subsequent content changes through `/admin` continue to deploy through the same checked `main` workflow. Documentation-only release records may use a `[skip ci]` commit: they do not change the already verified deployed assets.


Missing people photos use the same neutral silhouette template in member/collaborator cards, the compact Alumni list, and person pages. It follows the shared light/night color tokens and is decorative for assistive technology; the adjacent name identifies the person. Uploading a real photo in `/admin` automatically replaces the template. No placeholder images or invented portraits are saved into people records.

Placeholder release verified October 9, 2026: source `81892a9b27c0f3427f0b737e426576afe964a711`, [successful run 37890361331](https://github.com/insitu-illinois/website/actions/runs/37890361331), Worker version `7ea3f1cb-23b3-41c5-9f21-24ffd9fabdd3`. All seven published people without photos use the template. Build and Astro check passed, and CI passed all 24 unit checks and 27 browser checks. The live People view was visually inspected; root, People, Lily, the former Zade URL, robots, favicon, CMS config, and portrait bytes matched the build. No content records changed; noindex remains enabled.


### Project images and production credits

In **Projects → VRchaeology**, **Hero image** holds the supplied cover art. It appears without cropping on the project page and in the featured Home section. **Gallery** is an ordered list of local images: upload an image, provide meaningful alt text, and optionally add a caption. Reorder or remove gallery entries in the editor. Each image offers a keyboard-accessible full-image link. **Credits** stores role groups with one contributor name per line; keep the supplied order and spellings. Credits do not automatically create lab members. Select existing lab people separately in **Team** so project links appear on their profiles.

VRchaeology classroom readiness, continuing development at GSD Stu/dio, and the final production credits were supplied directly by the lab on October 10, 2026. The gallery uses six supplied game images, and the supplied cover is kept whole. WebP copies reduce transfer size without retouching the artwork or changing game content. The original ZIP and full-size source files remain outside the public repository. Existing historical content and funding references are retained, and no download/release date or unsupported platform requirements were invented.


VRchaeology release verified October 10, 2026: source `6b1193f03156a4c9797c903ddf1c789e2c8f70e3`, [successful run 38089784676](https://github.com/insitu-illinois/website/actions/runs/38089784676), Worker version `8b54ff77-e38b-4ec0-8930-b4e4219b829f` in the existing lab account. Added the uncropped supplied cover, six optimized game images with descriptive alternatives, classroom-readiness and ongoing GSD Stu/dio development information, and all 36 role/name entries across 16 credit groups (35 distinct contributors). Existing person references were connected where applicable without creating new lab members. Gallery and credits are editable in Sveltia. Build and Astro check passed; all 25 unit/content checks and 28 browser tests passed locally, and the deployment workflow passed. The focused gallery/credits browser test also passed on production. Manual review covered the project introduction, gallery, and credits; the live gallery was visually verified. The project HTML and all seven WebP files returned HTTP 200 and matched the tested local build byte-for-byte, as did the root, People, former Zade URL, Lily page, robots, favicon, CMS configuration, and Zade portrait. Noindex and robots Disallow remain enabled. Existing accessibility evaluation limitations still apply; automated checks do not establish full conformance.


### Compact people links and hidden topic tags

Research-topic chips are temporarily omitted from generated pages using `showResearchTags = false` in `src/config/site.mjs`. Research-theme pages, navigation, stored references, CMS fields, and derived lists remain available. Set the switch to `true` to restore topic chips. Person links use the shared compact type token and 32-pixel minimum height, retain keyboard focus, and grow with the Larger text setting. Project pages show people links once instead of repeating a Team card section; production Credits remain complete.

The Join page retains `/join/#classroom-use`. That section uses the existing obfuscated lab contact, so the public email still comes from the single Footer field in `/admin` and stays readable without JavaScript. No access, download, or response-time promise is implied.


Compact-tag release verified October 10, 2026: source `ef080c2aabcce9cef8eb1c059551afba29494600`, [successful run 38091070143](https://github.com/insitu-illinois/website/actions/runs/38091070143), lab Worker version `98abe2c4-3513-468f-8e8a-0f93e7d57470`. Build and Astro check passed with zero diagnostics; 25 unit/content checks passed. All 28 browser checks passed in CI, including no topic-chip rendering across public pages, light/night contrast, 320/390-pixel reflow, navigation, preferences, and the new classroom enquiry path. The initial local run stopped at a stale selector for the Research disclosure; that selector was corrected and the affected and remaining checks passed before publication. Desktop and mobile layouts and the contact destination were visually inspected. Production's focused project/contact test passed, and checked HTML, CSS, images, CMS config, favicon, and robots matched the local build. Research records/routes and all credits remain intact, including the user-confirmed spelling Dr. David Wen-hau Huang. Noindex remains enabled.


### Shared section surfaces and the VRchaeology artwork case

The approved presentation rules for future pages are recorded in `design-system/README.md`. Shared sections alternate white and gray semantic surfaces; person metadata appears as quiet, unboxed links at the end of detail pages and records. CMS relationships and publication author text are unchanged.

VRchaeology's interactive case reads **Hero image** and **Gallery** from its Projects entry in `/admin`; updating those assets also updates the case and booklet. Click the cover to open it, then select the paper booklet inside; click the empty tray to close the case. The booklet expands into a modal with Previous/Next image controls and visible image descriptions. Escape closes the modal and returns focus to the booklet; a second Escape closes the case. The real headset model opens the editable **Availability** note. The game images are shown once, in the booklet; without JavaScript they appear in a normal gallery. The CSS hinge transition respects both device and site Reduce motion. Without JavaScript, the full cover and normal gallery remain available. This is an artwork presentation, not a game download or a claim that a physical edition exists.


Section and artwork-case release verified October 10, 2026: source `be9693fd71022af4077c98f74ea5cf51684f5b3a`, [successful run 38092207810](https://github.com/insitu-illinois/website/actions/runs/38092207810), lab Worker version `bd992f26-89df-4706-baaa-8fcc5c5e9421`. Build and Astro diagnostics passed; 25 unit/content checks and all 31 browser tests passed locally and in CI. Four focused browser checks also passed on production: case open/close and six-image paging, Escape focus restoration, 320-pixel night mode with 200% text, both reduced-motion preferences, no-JavaScript cover/gallery, preserved credits, and the classroom contact route. Manual review covered the Home section treatment and project case on desktop, mobile, and night mode; the live case was opened and paged successfully. Checked HTML, CSS/JS, images, CMS config, favicon, and robots matched the local build. No content records changed; all names, roles, credits, relationships, drafts, and routes remain intact. Noindex remains enabled. The initial enlarged-text test found decorative booklet text exceeding its paper surface; that redundant decorative text was removed before the successful final runs. Full manual screen-reader and physical-device evaluation remain outside these checks.

The October 10 booklet revision removes the large classroom-readiness section and condenses the project introduction at the lab’s request. Credits, photographs, references, and status are unchanged. The enlarged case, disc, and real 3D headset are artwork interactions, not download buttons. The headset’s **Availability** text can be changed under **Projects → VRchaeology**; the approved message is “VRchaeology is currently used offline.” All six original screenshots and their descriptions remain editable through **Gallery**. Clearing the cover restores the ordinary gallery.

The final paper design uses a black game booklet with project images, descriptive text, and selected production credits. The same paper design appears in miniature inside the case and enlarged in the native dialog. The disc has a printed title and a reflective reverse; activation lifts, flips, and rotates it once. The default case is closed; select its cover to open, and select the empty tray to close. Device/site reduced motion suppresses these animations.

The Quest 3 headset is a real GLB model by [Elin](https://sketchfab.com/3d-models/meta-quest-3-65a813833dc04eeeb7d33bdca58c184c), used under CC BY 4.0; Touch Plus controller models come from the MIT-licensed [WebXR Input Profiles assets](https://github.com/immersive-web/webxr-input-profiles/tree/main/packages/assets/profiles/meta-quest-touch-plus). Creator and license links are available under “3D model credits” on the project page and in `public/media/models/quest-3/`. Models are hosted locally with Three.js pinned to 0.186.1, loaded near the viewport, and rendered only when needed. WebGL failure leaves a working availability button; essential project content does not depend on 3D rendering. The model payload is about 7.1 MB, so a first visit transfers more data than the earlier SVG illustration. No third-party runtime requests or tracking were introduced.


Black-booklet and real-model release verified October 10, 2026: source `7f18b44a28297668dfe6af8e6ec0cabddd6f3f7b`, [successful run 38094129783](https://github.com/insitu-illinois/website/actions/runs/38094129783), lab Worker version `5cebd7a5-da22-4ea3-b9c0-3e34919fe03a`. Build and Astro diagnostics passed; 25 unit/content checks and all 33 browser checks passed locally and in CI. All six focused project checks also passed on production, including the locally hosted GLB loading, default-closed case, tray close, disc spin, booklet keyboard/focus behavior, six scenes, 320-pixel night mode with enlarged text, reduced motion, no-JavaScript gallery, and complete credits. Manual desktop and mobile review covered the black paper, real headset/controllers, offline disclosure, and night mode. Live HTML, CSS/JS, game images, all model/license files, CMS config, favicon, and robots matched the tested local build. The VRchaeology body and optional availability field changed as requested; existing images, credit names/roles, references, ordering, and status were preserved. Noindex remains enabled. Full manual screen-reader and physical-device evaluation remain outside these checks.

The current artwork refinement keeps the disc inside its case, with no separate disc popup. Its print is a single view of the supplied cover, preserving the original title lettering. Select the disc to lift/turn it; drag or use arrow keys to rotate it, select Flip/Spin for a single controlled movement, and select the disc again or press Home to return it. A small corner cross and the empty tray both close the case. The readable black image booklet remains unchanged.

Drag the headset or either controller to rotate that part independently. Keyboard alternatives are available on the headset button: 1/2/3 select a part, arrow keys rotate it, and Home resets it. There is no separate rotation-control menu. The offline note fades into a reserved space so the model stays put. The model is decorative and essential project information remains ordinary HTML; these interactions are not a claim of full accessibility conformance.

Public controls, menus and dialogs share the design system's 220 ms settling transition and 40 ms visual delay, with 600 ms for deliberate artwork movement. The `motion.ts` helper coordinates opening and closing, cancellation and reduced-motion changes. OS and site reduced-motion preferences suppress interpolation. These timings do not delay navigation or content requests.
