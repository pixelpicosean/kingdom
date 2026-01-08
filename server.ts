import { serve } from "bun";
import { readdir } from "node:fs/promises";
import path from "node:path";

type Section = {
    name: string; // e.g. "section-01"
    dir: string; // absolute path to src/section-01
    indexHtml: string; // absolute path to src/section-01/index.html
    title?: string;
};

const PORT = process.env.PORT || 8000;
const SRC_DIR = path.join(import.meta.dir, "src");

const transpiler = new Bun.Transpiler({ loader: "ts" });

async function fileExists(p: string): Promise<boolean> {
    try {
        return await Bun.file(p).exists();
    } catch {
        return false;
    }
}

function extractHtmlTitle(html: string): string | undefined {
    const m = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    const title = m?.[1]?.trim();
    return title ? title : undefined;
}

async function loadSections(): Promise<Section[]> {
    const entries = await readdir(SRC_DIR, { withFileTypes: true });

    const sectionNames = entries
        .filter((e) => e.isDirectory() && e.name.startsWith("section-"))
        .map((e) => e.name)
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    const sections: Section[] = [];

    for (const name of sectionNames) {
        const dir = path.join(SRC_DIR, name);
        const indexHtml = path.join(dir, "index.html");
        if (!(await fileExists(indexHtml))) continue;

        let title: string | undefined;
        try {
            title = extractHtmlTitle(await Bun.file(indexHtml).text());
        } catch {
            // ignore
        }

        sections.push({ name, dir, indexHtml, title });
    }

    return sections;
}

function indexPageHtml(sections: Section[]): string {
    const items = sections
        .map((s) => {
            const label = s.title ? `${s.title} (${s.name})` : s.name;
            return `<li><a href="/${s.name}/">${escapeHtml(label)}</a></li>`;
        })
        .join("\n");

    return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Kingdom</title>
  </head>
  <body>
    <h1>Sections</h1>
    <ul>
      ${items || "<li><em>No sections found.</em></li>"}
    </ul>
  </body>
</html>`;
}

function escapeHtml(s: string): string {
    return s
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

const sections = await loadSections();

const server = serve({
    port: PORT,
    async fetch(req) {
        const url = new URL(req.url);
        const pathname = decodeURIComponent(url.pathname);

        // Index page listing all sections.
        if (pathname === "/") {
            return new Response(indexPageHtml(sections), {
                headers: { "content-type": "text/html; charset=utf-8" },
            });
        }

        // Redirect /section-01 -> /section-01/
        const redirectMatch = pathname.match(/^\/(section-[^/]+)$/);
        if (redirectMatch) {
            return Response.redirect(`/${redirectMatch[1]}/`, 308);
        }

        // Serve /section-xx/... from src/section-xx/...
        const m = pathname.match(/^\/(section-[^/]+)\/(.*)$/);
        if (!m) return new Response("Not Found", { status: 404 });

        const [, sectionName, rest] = m;
        const section = sections.find((s) => s.name === sectionName);
        if (!section) return new Response("Not Found", { status: 404 });

        const rel = rest === "" ? "index.html" : rest;

        // Resolve + guard against path traversal.
        const abs = path.resolve(section.dir, rel);
        const root = path.resolve(section.dir) + path.sep;
        if (!abs.startsWith(root)) return new Response("Forbidden", { status: 403 });

        const file = Bun.file(abs);
        if (!(await file.exists())) return new Response("Not Found", { status: 404 });

        // Allow TypeScript modules without a build step.
        if (abs.endsWith(".ts")) {
            const js = transpiler.transformSync(await file.text());
            return new Response(js, {
                headers: { "content-type": "application/javascript; charset=utf-8" },
            });
        }

        return new Response(file);
    },
});

console.log(`Server running at http://localhost:${server.port}`);
