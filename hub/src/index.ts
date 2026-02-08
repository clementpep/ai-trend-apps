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
 * Generate the hub HTML page with Poup's AI Hub branding.
 */
function renderHub(apps: AppInfo[]): string {
  const appCards = apps
    .map(
      (app, index) => `
      <a href="${app.path}" class="glass-card app-card">
        <div class="card-header">
          <div class="number-badge">${String(index + 1).padStart(2, "0")}</div>
          <span class="app-date">${formatDate(app.date)}</span>
        </div>
        <h2 class="app-name">${app.name}</h2>
        <div class="app-trend">
          <span class="trend-icon">⚡</span>
          <span>${app.trend}</span>
        </div>
        <p class="app-desc">${app.description}</p>
        ${app.techStack && app.techStack.length > 0 ? `
        <div class="tech-stack">
          ${app.techStack.map((t: string) => `<span class="tech-badge">${t}</span>`).join("")}
        </div>
        ` : ""}
        <div class="card-footer">
          <span class="view-project">Explore →</span>
        </div>
      </a>
    `
    )
    .join("");

  const statsSection = apps.length > 0 ? `
    <div class="stats-container">
      <div class="stat-card glass-card">
        <span class="stat-number">${apps.length}</span>
        <span class="stat-label">Apps Built</span>
      </div>
      <div class="stat-card glass-card">
        <span class="stat-number">${Math.floor(apps.length * 4.2)}</span>
        <span class="stat-label">Hours Saved</span>
      </div>
      <div class="stat-card glass-card">
        <span class="stat-number">2:00</span>
        <span class="stat-label">Daily Build</span>
      </div>
    </div>
  ` : "";

  const emptyState =
    apps.length === 0
      ? `
    <div class="empty-state glass-card">
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
  <title>Poup's AI Hub — Daily AI-Powered Applications</title>
  <meta name="description" content="Every day at 2:00 AM, an AI agent builds a new application inspired by viral AI trends.">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🧠</text></svg>">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    /* ===== Poup's AI Hub - Branding Kit ===== */
    :root {
      /* Core Colors */
      --bg-oled: #050508;
      --bg-surface: #0A0A0D;
      --glow-blue: #3B82F6;
      --glow-purple: #8B5CF6;
      --success-green: #4ADE80;
      --error-red: #F87171;
      
      /* Glass Effects */
      --glass-bg: rgba(255, 255, 255, 0.03);
      --glass-border: rgba(255, 255, 255, 0.12);
      --glass-border-top: rgba(255, 255, 255, 0.3);
      --glass-blur: 20px;
      
      /* Text */
      --text-100: rgba(255, 255, 255, 1);
      --text-80: rgba(255, 255, 255, 0.8);
      --text-60: rgba(255, 255, 255, 0.6);
      --text-40: rgba(255, 255, 255, 0.4);
      
      /* Radius */
      --radius-sm: 0.75rem;
      --radius-md: 1rem;
      --radius-lg: 1.5rem;
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
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background-color: var(--bg-oled);
      color: var(--text-100);
      min-height: 100vh;
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
    }

    /* Background Halos */
    body::before,
    body::after {
      content: '';
      position: fixed;
      border-radius: 50%;
      filter: blur(80px);
      pointer-events: none;
      z-index: 0;
    }
    
    body::before {
      top: -200px;
      left: -100px;
      width: 600px;
      height: 600px;
      background: radial-gradient(circle, hsla(217, 91%, 60%, 0.12), transparent 70%);
    }
    
    body::after {
      bottom: -200px;
      right: -100px;
      width: 500px;
      height: 500px;
      background: radial-gradient(circle, hsla(271, 81%, 56%, 0.1), transparent 70%);
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1.5rem;
      position: relative;
      z-index: 1;
    }

    /* ===== Glass Card Base ===== */
    .glass-card {
      background: var(--glass-bg);
      backdrop-filter: blur(var(--glass-blur));
      -webkit-backdrop-filter: blur(var(--glass-blur));
      border: 1px solid var(--glass-border);
      border-top: 1px solid var(--glass-border-top);
      border-radius: var(--radius-lg);
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .glass-card:hover {
      transform: scale(1.02) translateY(-4px);
      backdrop-filter: blur(30px);
      box-shadow:
        0 0 40px hsla(217, 91%, 60%, 0.2),
        0 0 80px hsla(271, 81%, 56%, 0.15);
      border-color: rgba(255, 255, 255, 0.2);
    }

    /* ===== Header ===== */
    header {
      padding: 5rem 0 3rem;
      text-align: center;
    }

    .logo {
      display: inline-flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .logo-icon {
      width: 3.5rem;
      height: 3.5rem;
      background: linear-gradient(135deg, var(--glow-blue), var(--glow-purple));
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.75rem;
      box-shadow: 0 8px 30px hsla(217, 91%, 60%, 0.4);
    }

    .logo-text {
      font-size: 1.5rem;
      font-weight: 800;
      letter-spacing: -0.03em;
    }

    h1 {
      font-size: clamp(2.5rem, 8vw, 4.5rem);
      font-weight: 800;
      letter-spacing: -0.05em;
      line-height: 1.1;
      margin-bottom: 1.25rem;
      background: linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.7) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .subtitle {
      font-size: 1.125rem;
      font-weight: 300;
      color: var(--text-60);
      max-width: 600px;
      margin: 0 auto 2.5rem;
    }

    .highlight {
      color: var(--glow-blue);
      font-weight: 500;
    }

    /* ===== Stats ===== */
    .stats-container {
      display: flex;
      justify-content: center;
      gap: 1.5rem;
      margin-bottom: 4rem;
      flex-wrap: wrap;
    }

    .stat-card {
      padding: 1.5rem 2.5rem;
      text-align: center;
      position: relative;
      overflow: hidden;
    }

    .stat-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.08), transparent);
      transition: left 0.6s ease;
    }

    .stat-card:hover::before {
      left: 100%;
    }

    .stat-number {
      display: block;
      font-size: 2.25rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      background: linear-gradient(135deg, var(--glow-blue), var(--glow-purple));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 0.25rem;
    }

    .stat-label {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-40);
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }

    /* ===== Section Header ===== */
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--glass-border);
    }

    .section-title {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: var(--text-40);
    }

    /* ===== Apps Grid ===== */
    .apps-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 1.5rem;
      margin-bottom: 5rem;
    }

    .app-card {
      padding: 1.75rem;
      text-decoration: none;
      color: inherit;
      display: flex;
      flex-direction: column;
      position: relative;
      overflow: hidden;
    }

    /* Animated gradient border on hover */
    .app-card::before {
      content: '';
      position: absolute;
      inset: -1px;
      border-radius: inherit;
      padding: 1px;
      background: linear-gradient(135deg, 
        hsla(217, 91%, 60%, 0.3), 
        hsla(271, 81%, 56%, 0.2), 
        transparent);
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
      opacity: 0;
      transition: opacity 0.4s ease;
      pointer-events: none;
    }

    .app-card:hover::before {
      opacity: 1;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .number-badge {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.875rem;
      font-weight: 800;
      color: white;
      background: linear-gradient(135deg, var(--glow-blue), var(--glow-purple));
      box-shadow: 0 4px 15px hsla(217, 91%, 60%, 0.3);
    }

    .app-date {
      font-size: 0.8rem;
      font-weight: 500;
      color: var(--text-40);
    }

    .app-name {
      font-size: 1.375rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      margin-bottom: 0.75rem;
    }

    .app-trend {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(74, 222, 128, 0.1);
      border: 1px solid rgba(74, 222, 128, 0.2);
      border-radius: 100px;
      padding: 0.375rem 0.875rem;
      font-size: 0.8rem;
      font-weight: 500;
      color: var(--success-green);
      margin-bottom: 1rem;
      width: fit-content;
    }

    .trend-icon {
      font-size: 0.875rem;
    }

    .app-desc {
      color: var(--text-60);
      font-size: 0.9rem;
      font-weight: 300;
      line-height: 1.6;
      margin-bottom: 1rem;
      flex: 1;
    }

    .tech-stack {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .tech-badge {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--glass-border);
      border-radius: 100px;
      padding: 0.25rem 0.75rem;
      font-size: 0.7rem;
      font-weight: 500;
      color: var(--text-60);
    }

    .card-footer {
      margin-top: 1.25rem;
      padding-top: 1.25rem;
      border-top: 1px solid var(--glass-border);
    }

    .view-project {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--glow-blue);
      transition: color 0.3s ease;
    }

    .app-card:hover .view-project {
      color: var(--glow-purple);
    }

    /* ===== Empty State ===== */
    .empty-state {
      text-align: center;
      padding: 5rem 2.5rem;
      margin-bottom: 5rem;
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: 1.5rem;
      animation: float 3s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }

    .empty-state h2 {
      font-size: 1.75rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      margin-bottom: 0.75rem;
    }

    .empty-state p {
      color: var(--text-60);
      font-weight: 300;
      max-width: 400px;
      margin: 0 auto 2rem;
    }

    .countdown-hint {
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      background: rgba(59, 130, 246, 0.1);
      border: 1px solid rgba(59, 130, 246, 0.2);
      border-radius: 100px;
      padding: 0.75rem 1.5rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-60);
    }

    .pulse-dot {
      width: 8px;
      height: 8px;
      background: var(--success-green);
      border-radius: 50%;
      animation: pulse 2s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(1.3); }
    }

    /* ===== Footer ===== */
    footer {
      text-align: center;
      padding: 2.5rem 0 4rem;
      border-top: 1px solid var(--glass-border);
    }

    .footer-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .footer-brand {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
      font-weight: 300;
      color: var(--text-40);
    }

    .footer-brand a {
      color: var(--glow-blue);
      text-decoration: none;
      font-weight: 500;
      transition: color 0.3s ease;
    }

    .footer-brand a:hover {
      color: var(--glow-purple);
    }

    .footer-schedule {
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--text-40);
    }

    /* ===== Responsive ===== */
    @media (max-width: 768px) {
      header {
        padding: 3rem 0 2rem;
      }

      h1 {
        font-size: 2.25rem;
      }

      .subtitle {
        font-size: 1rem;
      }

      .stats-container {
        gap: 1rem;
      }

      .stat-card {
        padding: 1.25rem 1.75rem;
      }

      .apps-grid {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="logo">
        <div class="logo-icon">🧠</div>
        <span class="logo-text">Poup's AI Hub</span>
      </div>
      <h1>Daily AI-Powered<br>Applications</h1>
      <p class="subtitle">
        Every day at <span class="highlight">2:00 AM</span>, an AI agent scans viral trends, 
        builds a functional app, and deploys it automatically.
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
          Built with 🌶️ <a href="https://github.com/clementpep" target="_blank">El Tchoupinou</a>
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

// Serve shared static files (CSS, JS, etc.)
app.get("/shared/*", async (c) => {
  const path = c.req.path;
  const filePath = join(process.cwd(), path);
  
  try {
    const file = Bun.file(filePath);
    if (await file.exists()) {
      const content = await file.arrayBuffer();
      const ext = filePath.split('.').pop()?.toLowerCase() || '';
      const mimeTypes: Record<string, string> = {
        'css': 'text/css; charset=utf-8',
        'js': 'application/javascript; charset=utf-8',
        'json': 'application/json; charset=utf-8',
      };
      return c.body(content, 200, {
        'Content-Type': mimeTypes[ext] || 'application/octet-stream',
        'Cache-Control': 'public, max-age=86400',
      });
    }
    return c.notFound();
  } catch {
    return c.notFound();
  }
});

// Serve static files from apps directories
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
    
    const indexPath = join(filePath, 'index.html');
    const indexFile = Bun.file(indexPath);
    if (await indexFile.exists()) {
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

const port = parseInt(process.env.PORT || "3000");
console.log(`🧠 Poup's AI Hub running on http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};
