// Change only after the lab explicitly approves launch.
export const indexingEnabled = false;

export function crawlerPolicy(enabled, site) {
  return enabled
    ? `User-agent: *\nAllow: /\nDisallow: /admin/\nSitemap: ${new URL('/sitemap.xml', site)}\n`
    : 'User-agent: *\nDisallow: /\n';
}
