// The site is static assets. This Worker only redirects www (see redirect.js); every other request is the built site.
import { wwwRedirect } from './redirect.js';

export default {
  fetch(request, env) {
    return wwwRedirect(request) ?? env.ASSETS.fetch(request);
  },
};
