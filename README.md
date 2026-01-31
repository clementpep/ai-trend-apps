# 🚀 AI Trend Apps

Daily AI-powered applications inspired by viral AI trends on X/Twitter.

Every morning at 5:00 AM (Paris time), an AI agent:
1. Scans X for viral AI trends
2. Picks the most interesting one
3. Builds a functional application inspired by it
4. Deploys it automatically

## 🌐 Live

**Hub:** [ai-trend-apps.clementpep.cloud](https://ai-trend-apps.clementpep.cloud)

## 📁 Structure

```
ai-trend-apps/
├── hub/                    # Landing page & app directory
├── apps/                   # Daily applications
│   ├── YYYY-MM-DD-name/    # Each app in its own folder
│   └── ...
├── Dockerfile
└── README.md
```

## 🛠️ Tech Stack

- **Runtime:** Bun
- **Server:** Hono
- **Frontend:** React (when needed)
- **Deployment:** Dokploy on VPS

## 🏃 Development

```bash
# Install dependencies
bun install

# Run locally
bun run dev

# Build
bun run build
```

## 📜 License

MIT

---

*Built with 🌶️ by El Tchoupinou for Poupouille*
