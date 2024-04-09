
export default {
	async fetch(request:Request, env:any, ctx:any) {
		const apiEndpoint = env.ORIGIN_HOSTNAME;
  
		const url = new URL(request.url)
		console.log(url.pathname)

		const req = new Request(apiEndpoint + url.pathname, request);
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


		let re = await new HTMLRewriter().on('.dynamic-menu', new DynamicMenuHandler()).transform(resp)
		re.headers.set("Cache-Control", '120')
		return re;
	},
  };

  class DynamicMenuHandler {
	async element(element:any) {
	// who adds -wrapper and the block class???
	 let menuData = await loadData('https://menu2html.h-minst.workers.dev')
	 element.before(menuData, {html:true});	 
	}
  }

  export async function loadData(apiUrl:string) {
	const response = await fetch(apiUrl);
	const data = await response.text();
	return data;
  }