import { serve } from "bun";
import { readFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || 3000;

const server = serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);

    // Serve index.html for root path
    if (url.pathname === "/" || url.pathname === "/index.html") {
      try {
        const htmlPath = join(__dirname, "..", "index.html");
        const html = await readFile(htmlPath, "utf-8");

        return new Response(html, {
          headers: {
            "Content-Type": "text/html",
          },
        });
      } catch (error) {
        console.error("Error reading index.html:", error);
        return new Response("Error loading page", { status: 500 });
      }
    }

    // 404 for other paths
    return new Response("Not Found", { status: 404 });
  },
});

console.log(`Server running at http://localhost:${server.port}`);
