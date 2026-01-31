import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { logger } from "hono/logger";
import { readdir, readFile } from "fs/promises";
import { join } from "path";

const app = new Hono();

// Middleware
app.use("*", logger());

// Types
interface AppInfo {
  id: string;
  name: string;
  date: string;
  trend: string;
  description: string;
  path: string;
}

/**
 * Scan the apps directory and return metadata for each app.
 */
async function getApps(): Promise<AppInfo[]> {
  const appsDir = join(import.meta.dir, "../../apps");
  const apps: AppInfo[] = [];

  try {
    const folders = await readdir(appsDir);

    for (const folder of folders) {
      const metaPath = join(appsDir, folder, "meta.json");
      try {
        const meta = JSON.parse(await readFile(metaPath, "utf-8"));
        apps.push({
          id: folder,
          name: meta.name || folder,
          date: meta.date || folder.slice(0, 10),
          trend: meta.trend || "Unknown trend",
          description: meta.description || "No description",
          path: `/apps/${folder}`,
        });
      } catch {
        // Skip folders without valid meta.json
      }
    }
  } catch {
    // Apps directory doesn't exist yet
  }

  // Sort by date descending
  return apps.sort((a, b) => b.date.localeCompare(a.date));
}

/**
 * Generate the hub HTML page.
 */
function renderHub(apps: AppInfo[]): string {
  const appCards = apps
    .map(
      (app) => `
      <a href="${app.path}" class="app-card">
        <div class="app-date">${app.date}</div>
        <h2 class="app-name">${app.name}</h2>
        <div class="app-trend">📈 ${app.trend}</div>
        <p class="app-desc">${app.description}</p>
      </a>
    `
    )
    .join("");

  const emptyState =
    apps.length === 0
      ? `
    <div class="empty-state">
      <p>🚀 No apps yet!</p>
      <p>The first AI Trend App will be built tomorrow at 5:00 AM Paris time.</p>
    </div>
  `
      : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI Trend Apps</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      min-height: 100vh;
      color: #fff;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }
    
    header {
      text-align: center;
      margin-bottom: 3rem;
    }
    
    h1 {
      font-size: 3rem;
      margin-bottom: 0.5rem;
      background: linear-gradient(90deg, #00d9ff, #00ff88);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    
    .subtitle {
      color: #8892b0;
      font-size: 1.2rem;
    }
    
    .apps-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    }
    
    .app-card {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 1.5rem;
      text-decoration: none;
      color: inherit;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    
    .app-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 10px 40px rgba(0, 217, 255, 0.2);
      border-color: rgba(0, 217, 255, 0.3);
    }
    
    .app-date {
      font-size: 0.85rem;
      color: #00d9ff;
      margin-bottom: 0.5rem;
    }
    
    .app-name {
      font-size: 1.4rem;
      margin-bottom: 0.5rem;
    }
    
    .app-trend {
      font-size: 0.9rem;
      color: #00ff88;
      margin-bottom: 0.75rem;
    }
    
    .app-desc {
      color: #8892b0;
      font-size: 0.95rem;
      line-height: 1.5;
    }
    
    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      color: #8892b0;
    }
    
    .empty-state p {
      margin-bottom: 1rem;
      font-size: 1.2rem;
    }
    
    footer {
      text-align: center;
      margin-top: 4rem;
      padding: 2rem;
      color: #5a6078;
    }
    
    footer a {
      color: #00d9ff;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>🚀 AI Trend Apps</h1>
      <p class="subtitle">Daily applications inspired by viral AI trends</p>
    </header>
    
    <main>
      <div class="apps-grid">
        ${appCards}
      </div>
      ${emptyState}
    </main>
    
    <footer>
      <p>Built with 🌶️ by <a href="https://github.com/clementpep">El Tchoupinou</a></p>
      <p>New app every day at 5:00 AM Paris time</p>
    </footer>
  </div>
</body>
</html>`;
}

// Routes
app.get("/", async (c) => {
  const apps = await getApps();
  return c.html(renderHub(apps));
});

app.get("/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/api/apps", async (c) => {
  const apps = await getApps();
  return c.json(apps);
});

// Serve static files from apps directories
app.use("/apps/*", serveStatic({ root: "./" }));

// Start server
const port = parseInt(process.env.PORT || "3000");
console.log(`🚀 AI Trend Apps Hub running on http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};
