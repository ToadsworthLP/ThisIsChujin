/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run "npm run dev" in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run "npm run deploy" to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import * as http from "http";

export default {
    async fetch(request, env, ctx) {
        let options = {
            host: 'www.google.com',
            port: 80,
            path: '/index.html'
        };

        http.get(options, function(res) {
            console.log("Got response: " + res.statusCode);
        }).on('error', function(e) {
            console.log("Got error: " + e.message);
        });

        return new Response('Hello World!');
    },
};