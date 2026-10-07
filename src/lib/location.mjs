// Editors paste a URL, never executable iframe markup or arbitrary remote pages.
export function mapUrl(value) {
  if (!value) return '';
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.hostname !== 'www.google.com' || url.pathname !== '/maps/embed' || url.username || url.password || url.port || !url.searchParams.get('pb')) {
    throw new Error('Use the https://www.google.com/maps/embed?pb= URL from Google Maps → Share → Embed a map.');
  }
  return url.href;
}
