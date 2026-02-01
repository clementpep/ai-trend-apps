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
  stars?: number;
  techStack?: string[];
}

/**
 * Scan the apps directory and return metadata for each app.
 * Uses process.cwd() for consistent path resolution in both dev and production.
 */
async function getApps(): Promise<AppInfo[]> {
  const appsDir = join(process.cwd(), "apps");
  const apps: AppInfo[] = [];

  try {
    const folders = await readdir(appsDir);

    for (const folder of folders) {
      if (folder.startsWith(".")) continue;
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
          stars: meta.stars || 0,
          techStack: meta.techStack || [],
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
 * Generate the hub HTML page with Apple-style premium UI.
 */
function renderHub(apps: AppInfo[]): string {
  const appCards = apps
    .map(
      (app, index) => `
      <a href="${app.path}" class="app-card">
        <div class="card-glow"></div>
        <div class="card-content">
          <div class="card-header">
            <span class="app-number">${String(index + 1).padStart(2, "0")}</span>
            <span class="app-date">${formatDate(app.date)}</span>
          </div>
          <h2 class="app-name">${app.name}</h2>
          <div class="app-trend">
            <span class="trend-icon">📈</span>
            <span>${app.trend}</span>
          </div>
          <p class="app-desc">${app.description}</p>
          ${app.techStack && app.techStack.length > 0 ? `
          <div class="tech-stack">
            ${app.techStack.map((t: string) => `<span class="tech-badge">${t}</span>`).join("")}
          </div>
          ` : ""}
        </div>
        <div class="card-footer">
          <span class="view-project">View Project →</span>
        </div>
      </a>
    `
    )
    .join("");

  const statsSection = apps.length > 0 ? `
    <div class="stats-container">
      <div class="stat-card">
        <span class="stat-number">${apps.length}</span>
        <span class="stat-label">Apps Built</span>
      </div>
      <div class="stat-card">
        <span class="stat-number">${Math.floor(apps.length * 4.2)}</span>
        <span class="stat-label">Hours Saved</span>
      </div>
      <div class="stat-card">
        <span class="stat-number">2:00</span>
        <span class="stat-label">Daily Build Time</span>
      </div>
    </div>
  ` : "";

  const emptyState =
    apps.length === 0
      ? `
    <div class="empty-state">
      <div class="empty-icon">🚀</div>
      <h2>First App Coming Soon</h2>
      <p>Tomorrow at 2:00 AM Paris time, the first AI Trend App will be automatically built and deployed here.</p>
      <div class="countdown-hint">
        <span class="pulse-dot"></span>
        <span>Monitoring AI trends...</span>
      </div>
    </div>
  `
      : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI Trend Apps — Daily AI-Powered Applications</title>
  <meta name="description" content="Every day at 2:00 AM, an AI agent builds a new application inspired by viral AI trends.">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🚀</text></svg>">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-primary: #000000;
      --bg-secondary: #0a0a0a;
      --bg-card: rgba(255, 255, 255, 0.03);
      --bg-card-hover: rgba(255, 255, 255, 0.06);
      --border-subtle: rgba(255, 255, 255, 0.08);
      --border-hover: rgba(255, 255, 255, 0.15);
      --text-primary: #ffffff;
      --text-secondary: rgba(255, 255, 255, 0.6);
      --text-tertiary: rgba(255, 255, 255, 0.4);
      --accent-blue: #0A84FF;
      --accent-purple: #BF5AF2;
      --accent-cyan: #64D2FF;
      --accent-green: #30D158;
      --gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      --gradient-card: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
      --shadow-glow: 0 0 60px rgba(102, 126, 234, 0.15);
      --radius-sm: 8px;
      --radius-md: 16px;
      --radius-lg: 24px;
      --radius-xl: 32px;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    html {
      scroll-behavior: smooth;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: var(--bg-primary);
      color: var(--text-primary);
      min-height: 100vh;
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    /* Gradient background effect */
    body::before {
      content: '';
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 100vh;
      background: 
        radial-gradient(ellipse 80% 50% at 50% -20%, rgba(102, 126, 234, 0.15), transparent),
        radial-gradient(ellipse 60% 40% at 100% 0%, rgba(118, 75, 162, 0.1), transparent),
        radial-gradient(ellipse 60% 40% at 0% 100%, rgba(100, 210, 255, 0.08), transparent);
      pointer-events: none;
      z-index: 0;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 24px;
      position: relative;
      z-index: 1;
    }

    /* Header */
    header {
      padding: 80px 0 60px;
      text-align: center;
    }

    .logo {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 24px;
    }

    .logo-icon {
      width: 56px;
      height: 56px;
      background: var(--gradient-primary);
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      box-shadow: var(--shadow-glow);
    }

    .logo-text {
      font-size: 24px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }

    h1 {
      font-size: clamp(40px, 8vw, 72px);
      font-weight: 700;
      letter-spacing: -2px;
      line-height: 1.1;
      margin-bottom: 20px;
      background: linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.7) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .subtitle {
      font-size: 20px;
      color: var(--text-secondary);
      max-width: 600px;
      margin: 0 auto 40px;
      line-height: 1.6;
    }

    .highlight {
      color: var(--accent-cyan);
      font-weight: 500;
    }

    /* Stats */
    .stats-container {
      display: flex;
      justify-content: center;
      gap: 32px;
      margin-bottom: 60px;
      flex-wrap: wrap;
    }

    .stat-card {
      position: relative;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: var(--radius-lg);
      padding: 24px 40px;
      text-align: center;
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      transition: all 0.3s ease;
      overflow: hidden;
    }

    .stat-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
      transition: left 0.5s ease;
    }

    .stat-card:hover {
      border-color: rgba(102, 126, 234, 0.4);
      transform: translateY(-4px);
      box-shadow: 0 10px 30px rgba(102, 126, 234, 0.15);
    }

    .stat-card:hover::before {
      left: 100%;
    }

    .stat-number {
      display: block;
      font-size: 36px;
      font-weight: 700;
      background: var(--gradient-primary);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 4px;
    }

    .stat-label {
      font-size: 14px;
      color: var(--text-tertiary);
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    /* Apps Grid */
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--border-subtle);
    }

    .section-title {
      font-size: 14px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: var(--text-tertiary);
    }

    .apps-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 24px;
      margin-bottom: 80px;
    }

    .app-card {
      position: relative;
      background: rgba(255, 255, 255, 0.02);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: var(--radius-xl);
      padding: 28px;
      text-decoration: none;
      color: inherit;
      display: flex;
      flex-direction: column;
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      overflow: hidden;
    }

    .app-card::before {
      content: '';
      position: absolute;
      inset: -1px;
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.3), rgba(118, 75, 162, 0.3), rgba(100, 210, 255, 0.3));
      border-radius: var(--radius-xl);
      opacity: 0;
      transition: opacity 0.4s ease;
      z-index: -1;
    }

    .app-card::after {
      content: '';
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.8);
      border-radius: calc(var(--radius-xl) - 1px);
      z-index: -1;
    }

    .app-card:hover {
      border-color: transparent;
      transform: translateY(-6px) scale(1.01);
      box-shadow: 
        0 25px 50px rgba(0, 0, 0, 0.4),
        0 0 40px rgba(102, 126, 234, 0.15),
        0 0 80px rgba(100, 210, 255, 0.1);
    }

    .app-card:hover::before {
      opacity: 1;
      animation: borderGlow 3s ease-in-out infinite;
    }

    @keyframes borderGlow {
      0%, 100% { filter: hue-rotate(0deg); }
      50% { filter: hue-rotate(30deg); }
    }

    .card-glow {
      position: absolute;
      top: -100%;
      left: -100%;
      width: 300%;
      height: 300%;
      background: conic-gradient(from 0deg, transparent, rgba(102, 126, 234, 0.15), transparent, rgba(100, 210, 255, 0.15), transparent);
      opacity: 0;
      transition: opacity 0.6s ease;
      pointer-events: none;
      animation: rotate 8s linear infinite;
    }

    @keyframes rotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .app-card:hover .card-glow {
      opacity: 1;
    }

    .card-content {
      position: relative;
      z-index: 1;
      flex: 1;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .app-number {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      background: var(--gradient-primary);
      border-radius: var(--radius-sm);
      font-size: 14px;
      font-weight: 700;
      color: white;
    }

    .app-date {
      font-size: 13px;
      color: var(--text-tertiary);
      font-weight: 500;
    }

    .app-name {
      font-size: 22px;
      font-weight: 600;
      margin-bottom: 12px;
      letter-spacing: -0.3px;
    }

    .app-trend {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(48, 209, 88, 0.1);
      border: 1px solid rgba(48, 209, 88, 0.2);
      border-radius: 100px;
      padding: 6px 14px;
      font-size: 13px;
      color: var(--accent-green);
      margin-bottom: 16px;
    }

    .trend-icon {
      font-size: 14px;
    }

    .app-desc {
      color: var(--text-secondary);
      font-size: 15px;
      line-height: 1.6;
      margin-bottom: 16px;
    }

    .tech-stack {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .tech-badge {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid var(--border-subtle);
      border-radius: 100px;
      padding: 4px 12px;
      font-size: 12px;
      color: var(--text-secondary);
      font-weight: 500;
    }

    .card-footer {
      position: relative;
      z-index: 1;
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid var(--border-subtle);
    }

    .view-project {
      font-size: 14px;
      font-weight: 600;
      color: var(--accent-blue);
      transition: color 0.3s ease;
    }

    .app-card:hover .view-project {
      color: var(--accent-cyan);
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 80px 40px;
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-xl);
      margin-bottom: 80px;
    }

    .empty-icon {
      font-size: 64px;
      margin-bottom: 24px;
      animation: float 3s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }

    .empty-state h2 {
      font-size: 28px;
      font-weight: 600;
      margin-bottom: 12px;
    }

    .empty-state p {
      color: var(--text-secondary);
      max-width: 400px;
      margin: 0 auto 32px;
    }

    .countdown-hint {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      background: rgba(102, 126, 234, 0.1);
      border: 1px solid rgba(102, 126, 234, 0.2);
      border-radius: 100px;
      padding: 12px 24px;
      font-size: 14px;
      color: var(--text-secondary);
    }

    .pulse-dot {
      width: 8px;
      height: 8px;
      background: var(--accent-green);
      border-radius: 50%;
      animation: pulse 2s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(1.2); }
    }

    /* Footer */
    footer {
      text-align: center;
      padding: 40px 0 60px;
      border-top: 1px solid var(--border-subtle);
    }

    .footer-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }

    .footer-brand {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 15px;
      color: var(--text-tertiary);
    }

    .footer-brand a {
      color: var(--accent-cyan);
      text-decoration: none;
      font-weight: 500;
      transition: color 0.3s ease;
    }

    .footer-brand a:hover {
      color: var(--accent-blue);
    }

    .footer-schedule {
      font-size: 13px;
      color: var(--text-tertiary);
    }

    /* Responsive */
    @media (max-width: 768px) {
      header {
        padding: 60px 0 40px;
      }

      h1 {
        font-size: 36px;
        letter-spacing: -1px;
      }

      .subtitle {
        font-size: 16px;
      }

      .stats-container {
        gap: 16px;
      }

      .stat-card {
        padding: 20px 28px;
      }

      .apps-grid {
        grid-template-columns: 1fr;
      }

      .app-card {
        padding: 24px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="logo">
        <div class="logo-icon">🚀</div>
        <span class="logo-text">AI Trend Apps</span>
      </div>
      <h1>Daily AI-Powered<br>Applications</h1>
      <p class="subtitle">
        Every day at <span class="highlight">2:00 AM</span>, an AI agent scans for viral AI trends, 
        builds a functional application, and deploys it automatically.
      </p>
    </header>

    ${statsSection}

    <main>
      ${apps.length > 0 ? `
      <div class="section-header">
        <span class="section-title">Recent Apps</span>
      </div>
      ` : ""}
      
      <div class="apps-grid">
        ${appCards}
      </div>
      ${emptyState}
    </main>

    <footer>
      <div class="footer-content">
        <div class="footer-brand">
          Built with 🦞 <a href="https://github.com/openclaw/openclaw" target="_blank">OpenClaw</a>
        </div>
        <div class="footer-schedule">New app every day at 2:00 AM Paris time</div>
      </div>
    </footer>
  </div>
</body>
</html>`;
}

/**
 * Format date to readable string.
 */
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
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

/**
 * OpenAI Proxy API - Secure endpoint for AI-powered apps
 * Apps call this instead of OpenAI directly to keep the API key server-side
 */
app.post("/api/ai/chat", async (c) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return c.json({ error: "OpenAI API not configured" }, 500);
  }

  try {
    const body = await c.req.json();
    const { messages, model = "gpt-4o-mini", max_tokens = 500 } = body;

    if (!messages || !Array.isArray(messages)) {
      return c.json({ error: "messages array required" }, 400);
    }

    // Limit to prevent abuse
    if (max_tokens > 1000) {
      return c.json({ error: "max_tokens limited to 1000" }, 400);
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("OpenAI API error:", error);
      return c.json({ error: "AI request failed" }, response.status);
    }

    const data = await response.json();
    return c.json({
      content: data.choices?.[0]?.message?.content || "",
      model: data.model,
      usage: data.usage,
    });
  } catch (error) {
    console.error("AI proxy error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Serve static files from apps directories with custom handler
// (serveStatic has issues with bundled Bun output)
app.get("/apps/*", async (c) => {
  const path = c.req.path;
  const filePath = join(process.cwd(), path);
  
  try {
    const file = Bun.file(filePath);
    if (await file.exists()) {
      const content = await file.arrayBuffer();
      const ext = filePath.split('.').pop()?.toLowerCase() || '';
      const mimeTypes: Record<string, string> = {
        'html': 'text/html; charset=utf-8',
        'css': 'text/css; charset=utf-8',
        'js': 'application/javascript; charset=utf-8',
        'json': 'application/json; charset=utf-8',
        'png': 'image/png',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'gif': 'image/gif',
        'svg': 'image/svg+xml',
        'ico': 'image/x-icon',
      };
      return c.body(content, 200, {
        'Content-Type': mimeTypes[ext] || 'application/octet-stream',
      });
    }
    
    // Check if it's a directory with index.html
    const indexPath = join(filePath, 'index.html');
    const indexFile = Bun.file(indexPath);
    if (await indexFile.exists()) {
      // IMPORTANT: Redirect to trailing slash to fix relative paths in HTML
      // Without this, <link href="style.css"> would resolve to /apps/style.css instead of /apps/app-name/style.css
      if (!path.endsWith('/')) {
        return c.redirect(path + '/', 301);
      }
      const content = await indexFile.arrayBuffer();
      return c.body(content, 200, {
        'Content-Type': 'text/html; charset=utf-8',
      });
    }
    
    return c.notFound();
  } catch {
    return c.notFound();
  }
});

// Start server
const port = parseInt(process.env.PORT || "3000");
console.log(`🚀 AI Trend Apps Hub running on http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};
