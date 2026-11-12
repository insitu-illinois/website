// Sends the www hostname to the bare domain with a permanent redirect that keeps the path and query.
export const canonicalHost = 'insituillinois.com';

export function wwwRedirect(request) {
  const url = new URL(request.url);
  if (url.hostname !== `www.${canonicalHost}`) return null;
  url.hostname = canonicalHost;
  url.protocol = 'https:';
  return new Response(null, { status: 301, headers: { Location: url.href, 'Strict-Transport-Security': 'max-age=15552000' } });
}
