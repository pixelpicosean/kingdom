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
    const latest = sections.at(-1);

    const cards = sections
        .map((s) => {
            const title = s.title ?? s.name;
            const subtitle = s.title ? s.name : undefined;
            const href = `/${s.name}/`;

            return `
              <a class="card" href="${href}">
                <div class="card__title">${escapeHtml(title)}</div>
                ${subtitle
                    ? `<div class="card__meta">${escapeHtml(subtitle)}</div>`
                    : `<div class="card__meta">Open section</div>`
                }
              </a>
            `.trim();
        })
        .join("\n");

    return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Project Kingdom</title>
    <style>
      :root {
        color-scheme: light;
        --bg0: #070a12;
        --bg1: #0b1022;
        --card: rgba(255, 255, 255, 0.06);
        --cardHover: rgba(255, 255, 255, 0.10);
        --border: rgba(255, 255, 255, 0.10);
        --text: rgba(255, 255, 255, 0.92);
        --muted: rgba(255, 255, 255, 0.72);
        --muted2: rgba(255, 255, 255, 0.58);
        --shadow: 0 18px 45px rgba(0, 0, 0, 0.45);
        --radius: 16px;
      }

      * { box-sizing: border-box; }

      html, body {
        height: 100%;
      }

      body {
        margin: 0;
        font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial,
          "Apple Color Emoji", "Segoe UI Emoji";
        color: var(--text);
        background:
          radial-gradient(1200px 700px at 20% -10%, rgba(124, 58, 237, 0.35), transparent 60%),
          radial-gradient(900px 600px at 90% 10%, rgba(56, 189, 248, 0.22), transparent 55%),
          linear-gradient(180deg, var(--bg0), var(--bg1));
      }

      a { color: inherit; text-decoration: none; }

      .wrap {
        min-height: 100%;
        padding: 56px 20px 36px;
        display: flex;
        justify-content: center;
      }

      .container {
        width: 100%;
        max-width: 1040px;
      }

      .hero {
        display: grid;
        gap: 18px;
        padding: 22px 22px 18px;
        border: 1px solid var(--border);
        border-radius: calc(var(--radius) + 6px);
        background: rgba(255, 255, 255, 0.04);
        box-shadow: var(--shadow);
        backdrop-filter: blur(10px);
      }

      .hero__top {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 14px;
        flex-wrap: wrap;
      }

      .brand {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .logo {
        width: 42px;
        height: 42px;
        border-radius: 12px;
        background:
          radial-gradient(16px 16px at 30% 30%, rgba(255, 255, 255, 0.35), transparent 70%),
          linear-gradient(135deg, rgba(124, 58, 237, 0.95), rgba(56, 189, 248, 0.90));
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.35);
        flex: 0 0 auto;
      }

      h1 {
        margin: 0;
        font-size: 30px;
        line-height: 1.1;
        letter-spacing: -0.02em;
      }

      .subtitle {
        margin: 6px 0 0;
        color: var(--muted);
        font-size: 14px;
        line-height: 1.5;
        max-width: 70ch;
      }

      .actions {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        align-items: center;
      }

      .btn {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        padding: 10px 12px;
        border-radius: 12px;
        border: 1px solid var(--border);
        background: rgba(255, 255, 255, 0.06);
        color: var(--text);
        font-weight: 600;
        font-size: 13px;
        letter-spacing: 0.01em;
        transition: transform 120ms ease, background 120ms ease, border-color 120ms ease;
      }

      .btn:hover {
        background: rgba(255, 255, 255, 0.10);
        border-color: rgba(255, 255, 255, 0.18);
        transform: translateY(-1px);
      }

      .btn--primary {
        border-color: rgba(124, 58, 237, 0.45);
        background: linear-gradient(
          135deg,
          rgba(124, 58, 237, 0.85),
          rgba(56, 189, 248, 0.65)
        );
      }

      .btn--primary:hover {
        border-color: rgba(255, 255, 255, 0.25);
        background: linear-gradient(
          135deg,
          rgba(124, 58, 237, 0.95),
          rgba(56, 189, 248, 0.75)
        );
      }

      .stats {
        display: flex;
        gap: 14px;
        flex-wrap: wrap;
        color: var(--muted2);
        font-size: 13px;
      }

      .stat {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 8px 10px;
        border-radius: 999px;
        border: 1px solid rgba(255, 255, 255, 0.10);
        background: rgba(0, 0, 0, 0.18);
      }

      .dot {
        width: 8px;
        height: 8px;
        border-radius: 999px;
        background: rgba(56, 189, 248, 0.95);
        box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.16);
      }

      .main {
        margin-top: 22px;
      }

      .sectionTitle {
        margin: 0 0 10px;
        font-size: 14px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: rgba(255, 255, 255, 0.75);
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(12, 1fr);
        gap: 12px;
      }

      .card {
        grid-column: span 6;
        padding: 14px 14px;
        border-radius: var(--radius);
        border: 1px solid var(--border);
        background: var(--card);
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25);
        transition: transform 120ms ease, background 120ms ease, border-color 120ms ease;
        outline: none;
      }

      .card:hover {
        transform: translateY(-1px);
        background: var(--cardHover);
        border-color: rgba(255, 255, 255, 0.18);
      }

      .card:focus-visible {
        box-shadow: 0 0 0 4px rgba(56, 189, 248, 0.22), 0 10px 25px rgba(0, 0, 0, 0.25);
      }

      .card__title {
        font-weight: 700;
        font-size: 15px;
        letter-spacing: -0.01em;
      }

      .card__meta {
        margin-top: 6px;
        color: var(--muted2);
        font-size: 13px;
      }

      .empty {
        padding: 18px 16px;
        border-radius: var(--radius);
        border: 1px dashed rgba(255, 255, 255, 0.22);
        color: var(--muted);
        background: rgba(255, 255, 255, 0.03);
      }

      footer {
        margin-top: 18px;
        color: rgba(255, 255, 255, 0.55);
        font-size: 12px;
      }

      @media (max-width: 820px) {
        .card { grid-column: span 12; }
        .wrap { padding-top: 42px; }
        h1 { font-size: 28px; }
      }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="container">
        <header class="hero">
          <div class="hero__top">
            <div class="brand">
              <div class="logo" aria-hidden="true"></div>
              <div>
                <h1>Project Kingdom</h1>
                <p class="subtitle">Tutorial & Playground.</p>
              </div>
            </div>
            <div class="actions">
              ${latest
            ? `<a class="btn btn--primary" href="/${latest.name}/">Open latest</a>`
            : ""
        }
              <a class="btn" href="/" title="Refresh the section list">Refresh</a>
            </div>
          </div>
          <div class="stats">
            <span class="stat"><span class="dot" aria-hidden="true"></span>${sections.length} section${sections.length === 1 ? "" : "s"
        } found</span>
            ${latest ? `<span class="stat">Latest: ${escapeHtml(latest.title ?? latest.name)}</span>` : ""}
          </div>
        </header>

        <main class="main">
          <h2 class="sectionTitle">Sections</h2>
          ${cards
            ? `<div class="grid">${cards}</div>`
            : `<div class="empty">No sections found.</div>`
        }
          <footer></footer>
        </main>
      </div>
    </div>
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

let sections = await loadSections();
let lastSectionScanMs = 0;
const SECTION_SCAN_INTERVAL_MS = 1000;

async function refreshSectionsIfNeeded(force = false): Promise<void> {
    const now = Date.now();
    if (!force && now - lastSectionScanMs < SECTION_SCAN_INTERVAL_MS) return;
    lastSectionScanMs = now;
    sections = await loadSections();
}

const server = serve({
    port: PORT,
    async fetch(req) {
        const url = new URL(req.url);
        const pathname = decodeURIComponent(url.pathname);

        // Index page listing all sections.
        if (pathname === "/") {
            await refreshSectionsIfNeeded(true);
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
        let section = sections.find((s) => s.name === sectionName);
        if (!section) {
            await refreshSectionsIfNeeded(true);
            section = sections.find((s) => s.name === sectionName);
        }
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
