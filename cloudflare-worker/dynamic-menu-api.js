
export default {
    async fetch(request, env, ctx) {

      url.hostname = env.ORIGIN_HOSTNAME;
      const url = request.headers.get("Referer");
  
      const req = new Request(url, request);
      req.headers.set("x-forwarded-host", req.headers.get("host"));
      req.headers.set("x-byo-cdn-type", "cloudflare");
      req.headers.delete("Authorization");
  
      const cfCacheTtl = 60;
  
      loadData().then((data)=>{
        let html = '';
for (const key in tata) {
  if (!Array.isArray(json[key])) {
    html += '<div>' + json[key] + '</div>'
  } else {
    html += '<div>';
    for (const item of json[key]) {
      for (const key2 in item) {
        html += '<p>' + item[key2] + '</p>'
      }

    }
    html += '</div>';

  }

}
      })
  
      
  
      resp = new Response(resp.body, resp);
      resp.headers.delete("age");
      resp.headers.delete("x-robots-tag");
      resp.headers.set("access-control-allow-origin", "*");
      resp.headers.set("Cache-Control", " max-age=120");
    },
  };

  export async function loadData(apiUrl) {
    const response = await fetch(apiUrl)
    const data = await response.json()
    return data;
  }