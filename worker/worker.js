/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run "npm run dev" in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run "npm run deploy" to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {
    async fetch(request, env, ctx) {
        const staticResourceBaseUrl = "https://toadsworthlp.github.io/ThisIsChujin/";
        const stringToReplaceWithPlayUrl = "{PLAY_TAPE_REQUEST_URL}"
        const targetRequestUrls = ["/", "/index.html"];

        const requestUrl = new URL(request.url);
        const staticRequestFullUrl = `${staticResourceBaseUrl}${requestUrl.pathname + requestUrl.search}`;

        const staticSiteResponse = await fetch(staticRequestFullUrl, {
            method: "GET"
        });

        let finalResponse;
        if(targetRequestUrls.some( url => url === requestUrl.pathname)) { // Only replace it in the target site
            let staticSiteResponseBody = (await staticSiteResponse.text());
            let updatedBody = staticSiteResponseBody.replaceAll(stringToReplaceWithPlayUrl, staticRequestFullUrl);
            finalResponse = new Response(updatedBody, {
                status: staticSiteResponse.status,
                statusText: staticSiteResponse.statusText,
                headers: staticSiteResponse.headers
            });
        } else {
            finalResponse = staticSiteResponse;
        }

        return finalResponse;
    },
};