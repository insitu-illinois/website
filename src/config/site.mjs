// The lab approved launch on October 21, 2026. Set to false to hide the site from search engines again.
export const indexingEnabled = true;

// Temporarily hide topic chips without removing research relationships or routes.
export const showResearchTags = false;

export function crawlerPolicy(enabled, site) {
  return enabled
    ? `User-agent: *\nAllow: /\nDisallow: /admin/\nSitemap: ${new URL('/sitemap.xml', site)}\n`
    : 'User-agent: *\nDisallow: /\n';
}
