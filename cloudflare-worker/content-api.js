/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

const handleRequest = async (request, env, ctx) => {
  const url = new URL(request.url);
  if (url.port) {
    // Cloudflare opens a couple more ports than 443, so we redirect visitors
    // to the default port to avoid confusion.
    // https://developers.cloudflare.com/fundamentals/reference/network-ports/#network-ports-compatible-with-cloudflares-proxy
    const redirectTo = new URL(request.url);
    redirectTo.port = '';
    return new Response(`Moved permanently to ${redirectTo.href}`, {
      status: 301,
      headers: {
        location: redirectTo.href,
      },
    });
  }
  if (url.pathname.startsWith('/drafts/')) {
    return new Response('Not Found', { status: 404 });
  }

  let strippedQS;
  if (url.search && !url.pathname.match(/\.[0-9a-z]+$/i)) {
    // extensionless request w/ query string: strip query string
    strippedQS = url.search;
    url.search = '';
  }

  url.hostname = env.ORIGIN_HOSTNAME;
  const req = new Request(url, request);
  req.headers.set('x-forwarded-host', req.headers.get('host'));
  req.headers.set('x-byo-cdn-type', 'cloudflare');
  // TODO: set the following header if push invalidation is configured
  // (see https://www.hlx.live/docs/setup-byo-cdn-push-invalidation#cloudflare)
  // req.headers.set('x-push-invalidation', 'enabled');
  let resp = await fetch(req, {
    cf: {
      // cf doesn't cache html by default: need to override the default behavior
      cacheEverything: false,
    },
  });

  resp = new Response(resp.body, resp);
  if (resp.status === 301 && strippedQS) {
    const location = resp.headers.get('location');
    if (location && !location.match(/\?.*$/)) {
      resp.headers.set('location', `${location}${strippedQS}`);
    }
  }
  resp.headers.delete('age');
  resp.headers.delete('x-robots-tag');
  return new HTMLRewriter().on('.dynamic-menu', new LogHandler()).transform(resp);
};

class LogHandler {
  async element(element) {
    await loadData('https://dynamic-menu-api.h-minst.workers.dev').then((data) => {
      for (const key in data) {
        const elem = `<div class="${key}">${JSON.stringify(data[key])}</div>`;
        console.log(elem);
        element.append(elem, { html: true });
      }
    });
    console.log(JSON.stringify(element));
  }
}

export async function loadData(apiUrl) {
  const response = await fetch(apiUrl);
  const data = await response.json();
  return data;
}

export default {
  fetch: handleRequest,
};
