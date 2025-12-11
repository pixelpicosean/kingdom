import { serve } from "bun";

import page_game from "./index.html";

const PORT = process.env.PORT || 8000;

const server = serve({
  port: PORT,
  routes: {
    "/": page_game,
  },
  async fetch(req) {
    // 404 for other paths
    return new Response("Not Found", { status: 404 });
  },
});

console.log(`Server running at http://localhost:${server.port}`);
