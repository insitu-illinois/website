# CMS login relay

Unmodified source from [sveltia/sveltia-cms-auth](https://github.com/sveltia/sveltia-cms-auth), commit `95733a9811c7601c117a64c44395109bd1291a73`. The upstream MIT license is included. No OAuth credentials belong in this directory.

Run `node scripts/deploy-auth.mjs` from the repository root. This generates an ignored Wrangler configuration, derives `ALLOWED_DOMAINS` from the single site origin in `astro.config.mjs`, and invokes the same lab identity checks as local site publication. It preserves the upstream compatibility date and dashboard variables. The GitHub Actions deployment token cannot deploy or change this separate Worker.

After deployment, an organization Owner registers the OAuth app and enters `GITHUB_CLIENT_ID` and encrypted `GITHUB_CLIENT_SECRET` in this Worker's dashboard. Until both are present, the relay refuses authentication. See the main README for the full setup and replacement procedure.
