'use strict';

const BASIC_AUTH_USER = "rosalind"
const BASIC_AUTH_PASS = "franklin"

/**
 * RegExp for basic auth credentials
 *
 * credentials = auth-scheme 1*SP token68
 * auth-scheme = "Basic" ; case insensitive
 * token68     = 1*( ALPHA / DIGIT / "-" / "." / "_" / "~" / "+" / "/" ) *"="
 */

const CREDENTIALS_REGEXP = /^ *(?:[Bb][Aa][Ss][Ii][Cc]) +([A-Za-z0-9._~+/-]+=*) *$/

/**
 * RegExp for basic auth user/pass
 *
 * user-pass   = userid ":" password
 * userid      = *<TEXT excluding ":">
 * password    = *TEXT
 */

const USER_PASS_REGEXP = /^([^:]*):(.*)$/

/**
 * Object to represent user credentials.
 */

const Credentials = function(name, pass) {
  this.name = name
  this.pass = pass
}

/**
 * Parse basic auth to object.
 */

const parseAuthHeader = function(string) {
  if (typeof string !== 'string') {
    return undefined
  }

  // parse header
  const match = CREDENTIALS_REGEXP.exec(string)

  if (!match) {
    return undefined
  }

  // decode user pass
  const userPass = USER_PASS_REGEXP.exec(atob(match[1]))

  if (!userPass) {
    return undefined
  }

  // return credentials object
  return new Credentials(userPass[1], userPass[2])
}

/**
 * 
 * @param {string} realmInfo 
 * @returns 
 */
const unauthorizedResponse = function(realmInfo) {
  return new Response(
    'You need to login.', 
    {
      status: 401,
      statusText: "'Authentication required.'",
      headers: {
        'WWW-Authenticate': `Basic realm="For ${realmInfo}"`,
        'access-control-allow-origin': '*'
      }
    }
  )
}

const handleRequest = async (request, env, ctx) => {
  const url = new URL(request.url);
  const basicAuthUser = env.BASIC_AUTH_USER || BASIC_AUTH_USER;
  const basicAuthPass = env.BASIC_AUTH_PASS || BASIC_AUTH_PASS;
  // enforce basic auth
  if (env.FORCE_AUTH === "true") {
    const credentials = parseAuthHeader(request.headers.get('Authorization'))
    if ( !credentials || credentials.name !== basicAuthUser ||  credentials.pass !== basicAuthPass) {
      return unauthorizedResponse(url.hostname)
    }
  }

  // route to correct backend
  if (url.pathname.startsWith("/dealers")) {
    url.hostname = env.HOSTNAME_EDS_DEALERS;
  } else {
    url.hostname = env.ORIGIN_HOSTNAME;
  }


  const req = new Request(url, request);
  req.headers.set('x-forwarded-host', req.headers.get('host'));
  req.headers.set('x-byo-cdn-type', 'cloudflare');
  req.headers.delete('Authorization');

  const cfCacheTtl = 60;

  // TODO: set the following header if push invalidation is configured
  // (see https://www.hlx.live/docs/setup-byo-cdn-push-invalidation#cloudflare)
  // req.headers.set('x-push-invalidation', 'enabled');
  let resp = await fetch(req, {
    cf: {
      cacheTtl: cfCacheTtl,
      // cf doesn't cache html by default: need to override the default behavior if we would want to
      cacheEverything: true,
    },
  });

  console.log("" + JSON.stringify(request.headers))

  resp = new Response(resp.body, resp);
  resp.headers.delete('age');
  resp.headers.delete('x-robots-tag');
  resp.headers.set('access-control-allow-origin','*')
  resp.headers.set('Cache-Control',' max-age=120')

  return resp;
};

export default {
  fetch: handleRequest,
};