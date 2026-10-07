# IN/SITU website

[Public website](https://insitu-illinois.insituillinois.workers.dev/) · [Edit content](https://insitu-illinois.insituillinois.workers.dev/admin/) · [GitHub repository](https://github.com/insitu-illinois/website)

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
8. Wait for the successful deployment. The paper automatically appears under its lab authors, project, and themes, and on Home if it is one of the three newest.

### Add a person

1. Select **People → Create new entry**. Enter their name and a permanent `first-last` slug.
2. Choose the confirmed role and enter their approved biography. Smaller **Order** values appear first.
3. Add website, Scholar, and email only when supplied. A photo is optional; enable it and fill both file and alt text. Without one, the profile shows initials.
4. Keep **Draft** on while details need approval, then switch it off and save.
5. Select that person in project **Team**, publication **Lab authors**, presentation **Presenters**, and recognition **Recipients**. Their four profile lists fill automatically.

When someone leaves, change their role to **alumni** rather than deleting them. Remove references before deleting any record. To restore an accidental change, a maintainer can revert the corresponding GitHub commit; do not force-push shared history.

### Other edits

- **Page text** edits the Home statement, About text, Join text, and footer contact. The proposed Home statement remains draft pending approval; the site shows the approved lab description meanwhile.
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

Public pages use self-hosted fonts and make no third-party runtime requests. The CMS loads its pinned-major script from a CDN. No analytics or tracking was added. Color, typography, spacing, border, and motion values come from `design-system/`; the font-role assignments are unchanged. The favicon is a temporary typographic slash using the same color tokens, pending the actual logo file.

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

Facts come from the supplied seed content and old-site archive. The ZIPs and reference files stay local and are not published. Two archived paper PDFs were preserved under `public/media/papers/`, and their author lists were read from those PDFs. The third PDF was unavailable; that paper stays draft. Initial BibTeX entries format already-supplied citation facts without adding new bibliographic claims.

Unconfirmed relationships remain empty, including the current VRchaeology team and Sarvin's Chi311 team link. CITL and ATLAS are not displayed as current partners. Project stubs, absent photography, and missing summaries remain clearly empty or marked forthcoming. The four themes use the approved first-pass names. The real logo can replace the wordmark-only header and temporary favicon when supplied. The Home statement, opening details, and unconfirmed records need lab review, not new code.

### Every current draft

- `src/content/news/gsd-282-spring-2027.json` — GSD 282: VRchaeology opens in Spring 2027.
- `src/content/news/website-launch.json` — IN/SITU launches its website.
- `src/content/pages/home.json` — People, technology, and experience in context..
- `src/content/people/aaron-stocks.json` — Aaron Stocks.
- `src/content/people/alan-b-craig.json` — Alan B. Craig.
- `src/content/people/alexandra-zachwieja.json` — Alexandra Zachwieja.
- `src/content/people/alice-xuehui-chao.json` — Alice (Xuehui) Chao.
- `src/content/people/cameron-merrill.json` — Cameron Merrill.
- `src/content/people/dan-matis.json` — Dan Matis.
- `src/content/people/david-hopping.json` — David Hopping.
- `src/content/people/emma-verstraete.json` — Emma Verstraete.
- `src/content/people/isaac-smith.json` — Isaac Smith.
- `src/content/people/jamie-arjona.json` — Jamie Arjona.
- `src/content/people/janny-chen.json` — Janny Chen.
- `src/content/people/jin-jang.json` — Jin Jang.
- `src/content/people/lily-meyer.json` — Lily Meyer.
- `src/content/people/monika-janas.json` — Monika Janas.
- `src/content/people/nan-kang.json` — Nan Kang.
- `src/content/people/rajee-shah.json` — Rajee Shah.
- `src/content/people/robbie-sieczkowski.json` — Robbie Sieczkowski.
- `src/content/people/wen-hao-david-huang.json` — Wen-Hao David Huang.
- `src/content/people/zade-lobo.json` — Zade Lobo.
- `src/content/publications/beneath-the-stone.json` — Beneath the Stone: A Low-Resource Text-Based Design Framework for Ethical Digital Representation of Marginalized Heritage Sites.
- `src/content/publications/cognitive-loads.json` — Relationships between cognitive loads and motivational support in a VR game-based learning system for teaching introductory archaeology.
- `src/content/publications/computation-in-context.json` — Computation in Context: A Cross-Industry Framework for Assessing the Situated Challenges of XR in Environmental Conservation.
- `src/content/publications/lincoln-home-ar.json` — Lincoln Home augmented reality case study (title to confirm).
- `src/content/publications/situated-cartographies.json` — Situated Cartographies: Computational Methods for Surfacing Embedded Knowledge in Regional Architectural Heritage.
- `src/content/recognition/epic-megagrant.json` — Epic MegaGrant.

Lily needs role and biography confirmation. Collaborators and alumni need permission to list. Draft papers need complete author lists, titles, or acceptance confirmation as applicable. The Epic grant needs year and recipient confirmation. GSD 282 news needs approved wording. The Home statement needs Laura's approval. The website-launch news record awaits the lab's chosen announcement date and copy.

## Release verification

The initial preview was deployed October 6, 2026; GitHub Actions deployment and editor login were connected October 7. The full-site build has 32 public HTML pages (including 404), plus sitemap, robots.txt, and favicon. All five template types are built. Local verification: 15 unit/security/content tests, zero Astro errors or warnings, and 9 browser checks passed. All 9 browser checks also passed against the live URL. The homepage, representative project and publication pages, sitemap, robots.txt, favicon, and CMS configuration matched the local build byte for byte. HTTPS and security headers were verified with Chrome and curl; missing routes return HTTP 404, and `/admin/` carries `noindex`. Public pages are crawlable, with only `/admin/` excluded from robots.txt.

The browser checks use desktop Chrome with viewport emulation, not physical phones, Safari, or a screen reader. Automated axe checks supplement the keyboard and visual checks; they are not a claim of comprehensive manual WCAG certification.

CMS round trip: creation commit `1be1e15`, successful deployment [run 37672009509](https://github.com/insitu-illinois/website/actions/runs/37672009509), deletion commit `b7625ce`. The first CMS save exposed blank optional references; schemas now accept those blanks while still rejecting invalid nonblank references. The temporary record was removed after verifying the successful deployment.

Full website release: October 7, 2026, source commit `538d0107a7514be6e54b517bd3f6aefb2d65160c`, [successful Actions run 37672484614](https://github.com/insitu-illinois/website/actions/runs/37672484614), Cloudflare version `90fd8b7d-19cd-47c8-a8b0-022876bf5e0b`. CMS cleanup [run 37672349472](https://github.com/insitu-illinois/website/actions/runs/37672349472) also succeeded. Subsequent documentation and test-timeout updates do not change public content.
