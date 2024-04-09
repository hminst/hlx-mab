/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export interface Env {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	// MY_KV_NAMESPACE: KVNamespace;
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	// MY_DURABLE_OBJECT: DurableObjectNamespace;
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	// MY_BUCKET: R2Bucket;
	//
	// Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
	// MY_SERVICE: Fetcher;
	//
	// Example binding to a Queue. Learn more at https://developers.cloudflare.com/queues/javascript-apis/
	// MY_QUEUE: Queue;
}

export default {

	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const apiEndpoint = env.API_ENDPOINT;
		const apiKey = env.X_API_KEY;

		let responseBody = '';
		await loadData(apiEndpoint, {
			headers: {
				"x-apikey": apiKey
			}
		}).then((data) => {
			responseBody = loopJson(data)
		});
		return new Response(responseBody);
	},
};

export async function loadData(apiUrl: string, params: any) {
	const response = (await fetch(apiUrl, params)).json()
	return response;
}

export function loopJson(data) {
	let html = ''
	let footer = ''
	for (var key in data) {
		let tag = 'div'
		if (key == 'guestFacingName') {
			tag = 'h2'
		} else if (key == 'image') {
			html += `<img src="${data[key].cdnUrl}" alt="${data[key].altText}"/>`
			continue
		} else if (key == 'images') {
			const imagesList = data[key]
			imagesList.forEach(function (image){
				html += `<img src="${image.cdnUrl}" alt="${image.altText}"/>`
			})
			continue
		} else if (key == 'menuCopyDigitalFooter') {
			footer = `<div class="${key}>${data[key]}</div>`
			continue
		} else if (key == 'menuCopyFooter') {
			continue
		}

		let elem = `<${tag} class="${key}">`
		if (typeof data[key] == 'string') {
			elem += `${(data[key])}`
		}
		if (typeof data[key] == 'object') {
			elem += loopJson(data[key])
		}
		elem += `</${tag}>`

		html += elem
	}
	html += footer
	return html;
}


