import { serve } from "bun";

const PORT = process.env.PORT || 3000;
const indexHtml = Bun.file("./index.html");

const server = serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);

    // Serve index.html for root path
    if (url.pathname === "/" || url.pathname === "/index.html") {
      return new Response(indexHtml);
    }

    // 404 for other paths
    return new Response("Not Found", { status: 404 });
  },
});

console.log(`Server running at http://localhost:${server.port}`);
