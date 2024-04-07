
export default {
    async fetch(request, env, ctx) {

        url.hostname = env.ORIGIN_HOSTNAME;
      const url = request.headers.get("Referer");
  
      const req = new Request(url, request);
      req.headers.set("x-forwarded-host", req.headers.get("host"));
      req.headers.set("x-byo-cdn-type", "cloudflare");
      req.headers.delete("Authorization");
  
      const cfCacheTtl = 60;
  
      let resp = await fetch(req, {
        cf: {
          cacheTtl: cfCacheTtl,
          // cf doesn't cache html by default: need to override the default behavior if we would want to
          cacheEverything: true,
        },
      });
  
      console.log("" + JSON.stringify(request.headers));
  
      resp = new Response(resp.body, resp);
      resp.headers.delete("age");
      resp.headers.delete("x-robots-tag");
      resp.headers.set("access-control-allow-origin", "*");
      resp.headers.set("Cache-Control", " max-age=120");
    },
  };