# IN/SITU website

Astro static website for IN/SITU at the University of Illinois Urbana-Champaign.

Preview: https://insitu-illinois.insituillinois.workers.dev

Repository: https://github.com/insitu-illinois/website

## Current status

This is the early preview milestone: seven collections, 55 seed records, five published person pages, nine basic ordinary pages, shared navigation, and tested derived lists. Project, theme, publication, and news detail templates and the full design pass follow the first deployment. CMS forms load, but OAuth login and publishing are not connected yet. The early preview is deployed in the verified lab Cloudflare account. Continuous deployment is active. The OAuth relay is configured with the organization-owned app. End-to-end editor sign-in and publishing still await verification.

The preview asks search engines not to index it. Remove the temporary `noindex` meta tag and change `public/robots.txt` to `Allow: /` when the full public release is ready. Drafts are excluded from production HTML, but source records are in a public GitHub repository: never enter confidential or anonymous submissions, even as drafts.

## Add a paper through /admin

Once authentication is connected:

1. Open the site's `/admin/` page and choose GitHub login. Use your own GitHub account with Write access to this repository.
2. Choose **Publications**, then create an entry.
3. Enter a short permanent **Slug**, such as `archaeological-learning`. Use lowercase letters and hyphens. Do not change it after other records link to it.
4. Enter the title. Fill **Authors** with the complete author list in citation order, including people outside the lab. Select all lab members separately in **Lab authors**. Both fields are needed: the text produces the citation; the references update person pages.
5. Add the year, venue, type, and an approved plain-language summary. Select the related project and themes. Leave unknown information empty.
6. Upload a PDF under the media folder, and add DOI and code URLs or BibTeX when available. Optional buttons appear only when their fields are filled.
7. If adding a thumbnail, enable its image section, choose the image, and enter meaningful alt text. Both are required together.
8. Keep **Draft** on while anything needs confirmation. Turn it off only when the record is approved, then save/publish.
9. Publishing commits to `main`. Once continuous deployment is connected, wait for its successful build before checking the public page. The paper also appears automatically under its lab authors, project, themes, and the homepage when it is one of the three newest.

A failed build keeps the previous deployed version. Check the repository's Actions tab and the Worker build log, correct the entry in `/admin`, and publish again. Do not rename referenced slugs or delete a person used by another record; change their role to alumni instead.

## Add a person through /admin

1. Choose **People**, then create an entry.
2. Enter the person's name and a permanent slug, for example `first-last`.
3. Choose the confirmed role and enter the approved biography. Lower sort-order numbers appear first.
4. Add website, Scholar, and email only when supplied. For a photo, enable the photo section and fill both the image file and alt text. Without a photo, the site displays initials.
5. Save as a draft until the person approves their details. Switch Draft off and publish when ready.
6. Select this person in project teams, publication lab authors, presentation presenters, and recognition recipients. Their page fills itself from those references.

**Page text** contains the Home statement, About text, Join text, and footer contact. The proposed Home statement is draft pending approval.

Dates can be a year (`2019`), year and month (`2020-01`), or full date (`2021-03-12`). Leave unknown dates blank. Do not invent a day merely to fill a form. Images are optional objects containing a local `/media/` path and required `alt`; this lets Sveltia prevent saving an image without alt text.

## Invite an editor

An organization Owner handles invitations. Use the existing personal GitHub account; the repository remains owned by `insitu-illinois`.

1. In the organization's **Settings → Member privileges**, keep base repository permission at **Read**.
2. Open **website → Settings → Collaborators and teams / Manage access → Add people**.
3. Invite the member's own GitHub account with **Write** access to `website` only. Do not grant organization Owner or repository Admin for content editing.
4. Have them accept the invitation and sign in at `/admin/`.

These account-wide permissions have not been changed by the build.

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
- Set that URL in **only** `astro.config.mjs` under `site`; canonical URLs and later sitemap generation derive from it.
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

The relay was deployed on October 7, 2026 as version `c8cdd8ea-7bd2-4442-9680-3b561d01fa1f`. The lab owner entered the app credentials in the Cloudflare dashboard. A live check now returns a GitHub authorization redirect requesting only `public_repo`; this confirms configuration is present, while actual sign-in is still awaiting verification. Four local security checks pass: allowed domains, narrow public-repository scope, secure CSRF cookie/state checks, and rejection of missing client credentials. Organization registration uses the existing lab Owner account `insituillinois`. The builder's personal account stays an organization Member with Admin access to `website`; organization Owner access is not required for routine site work. No membership change was made. The lab-owned [IN/SITU content editor app](https://github.com/organizations/insitu-illinois/settings/applications/3912656) is registered. Its client ID and encrypted client secret have been saved in the lab Worker's dashboard. The public relay URL is also configured as the repository Actions variable `CMS_AUTH_URL`. Testing CMS login and publishing is pending.

The CMS script is pinned to major version `0`, as the official Sveltia release remains in beta. Its configuration is generated from the same field definitions as Astro's Zod schemas, so editing the generated YAML directly will be overwritten.

## Attach a custom domain later

No custom domain has been bought or configured.

When the lab separately authorizes it:

1. Register the chosen domain in the lab Cloudflare account; the lab owner handles payment.
2. Add it under the site Worker's **Settings → Domains & Routes → Add → Custom Domain**.
3. Change `site` in `astro.config.mjs` to the new HTTPS origin and redeploy.
4. Change the GitHub OAuth App's Homepage URL to the new site URL. Its callback stays on the auth Worker's `/callback` URL unless that Worker itself moves.
5. Add the new hostname to the auth Worker's `ALLOWED_DOMAINS` (comma-separated with the old hostname during transition).
6. Check the homepage, profile and project deep links, `/admin/`, canonical URLs, sitemap, and `robots.txt` over HTTPS.
7. Decide whether the old `workers.dev` URL should remain reachable or redirect; do not retire it accidentally.

## Development and checks

A future student needs Node.js 24 and npm. The lab's editors do not need a terminal.

```sh
npm ci
npm run dev
npm test
npm run check
npm run build
npx playwright install chromium
npx playwright test
```

`npm run dev` includes drafts and marks them. `npm run build` excludes drafts from pages and lists. `npm run preview` serves the production build. Automated tests exercise every derived rule in handoff section 8, schema and reference integrity, alt-text enforcement, draft exclusion, keyboard navigation, local links, external request absence, and axe WCAG checks at desktop, 390px and 320px widths. CI runs these checks on pushes and pull requests.

The token files came from the supplied design system. Fonts are self-hosted through Fontsource, with unchanged font-family names. The `sharp` override selects the patched dependency used by the build tooling; review it during future upgrades.

## Preview verification

The local production build generates 15 public pages. Astro type checks pass with zero errors or warnings; nine content and derived-list tests pass; six browser checks pass, including axe and reflow on every public page at 1440px, 390px and 320px. This was desktop Chrome automation and viewport emulation, not physical-device or screen-reader testing. Sveltia loads its configuration without errors; authenticated editing awaits the OAuth relay. The dependency audit reports zero known vulnerabilities. The live preview also passed the browser checks at all three widths. HTTPS, the person deep link, `/admin/`, its configuration, and `robots.txt` match the built files; `robots.txt` returns `text/plain`, security headers are present, and missing pages return 404. The first requests briefly preceded HTTPS certificate availability; rerunning the affected checks succeeded.

## Content provenance and confirmation queue

Content comes only from the supplied seed-content and old-site archive, with the handoff's approved names and structure. The original ZIPs and reference material remain local and are not committed. The first two historical PDFs were preserved under `public/media/papers/`, and their author lists were read from those files. The third PDF returned HTTP 429; its paper remains a draft.

Unconfirmed relationships are left empty: the current VRchaeology team and Sarvin's Chi311 team link. Confirm them before adding references. CITL and ATLAS are not displayed as current partners. Photos, logo, Scholar links, publication summaries, and unknown details are left empty. The website-launch post remains a draft until a public launch date exists. The temporary preview has no favicon because no logo file has been supplied.

Draft records needing review:

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

Lily: role and biography. Collaborators and alumni: permission to list. Beneath the Stone: complete author list. ASCAAD papers: acceptance and author lists. Lincoln Home: exact title and author list. Cognitive-loads paper: obtain PDF and complete author list. Epic MegaGrant: year and recipient. GSD 282 news: approved wording. Home statement: Laura’s approval. Website launch: actual launch date.

## Release record

- First preview: October 6, 2026.
- Site source commit: `a771992`.
- Cloudflare version: `0f9a74d5-ad10-4d8f-bd35-d1c867c36463`.
- Worker: `insitu-illinois`, free `workers.dev` hostname, lab account only.
- Deployment method for this first release: verified local Wrangler login.
- Automatic GitHub deployment: verified October 7, 2026.
- OAuth relay: deployed and configured with the organization-owned app; end-to-end CMS login and publishing are pending.
- Remaining website work: detail templates, ordinary page sections, full design pass, final accessibility and publishing checks.
