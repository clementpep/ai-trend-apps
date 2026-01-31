# AI Trend Apps - Project Guide

## Overview

Daily AI-powered applications inspired by viral AI trends. Every morning at 5:00 AM Paris time, an AI agent scans for trending AI topics, builds a functional application, and deploys it automatically.

### Project Type

Monorepo with Hub UI + Daily Generated Apps.

### Quick Start

```bash
# Install dependencies
export PATH="$HOME/.bun/bin:$PATH"
bun install

# Run locally
bun run dev

# Build
bun run build

# Deploy (via Dokploy webhook on push)
git push
```

## Architecture

### Project Structure

```
ai-trend-apps/
├── hub/                        # Landing page & app directory
│   └── src/
│       └── index.ts            # Hono server + Hub UI
├── apps/                       # Daily generated applications
│   ├── YYYY-MM-DD-app-name/    # Each app in dated folder
│   │   ├── meta.json           # App metadata for hub
│   │   ├── index.html          # Entry point
│   │   ├── src/                # Source code if needed
│   │   └── README.md           # Documentation
│   └── .gitkeep
├── Dockerfile                  # Production build
├── package.json
├── tsconfig.json
└── README.md
```

### Hub Server

- **Location**: `hub/src/index.ts`
- **Framework**: Hono (lightweight, fast)
- **Features**:
  - Dynamic app listing from `apps/*/meta.json`
  - Health check endpoint (`/health`)
  - API endpoint (`/api/apps`)
  - Static file serving for apps

### App Metadata Schema

```json
{
  "name": "App Name",
  "date": "YYYY-MM-DD",
  "trend": "The AI trend that inspired this app",
  "description": "What the app does in 1-2 sentences",
  "techStack": ["Bun", "Hono", "TypeScript"]
}
```

## Technology Stack

### Core

- **Runtime**: Bun 1.x
- **Server**: Hono
- **Language**: TypeScript (strict mode)
- **Styling**: Vanilla CSS (inline in HTML for apps)

### Deployment

- **Platform**: Dokploy on VPS (Hostinger)
- **Build**: Docker (oven/bun:1 image)
- **Domain**: ai-trend-apps.clementpep.cloud
- **SSL**: Let's Encrypt (via Traefik)

### CI/CD

- **Trigger**: GitHub webhook on push to main
- **Process**: Dokploy auto-builds and deploys

## Development Standards

Follow `/home/clementpep/clawd/DEV_STANDARDS.md`:

- **Package managers**: bun (not npm), uv (not pip)
- **No secrets in code**: Use environment variables
- **Strict typing**: No `any`, type all functions
- **Logging**: Use logger, not console.log/print
- **Language**: Code and docs in English
- **Commits**: Conventional commits format

## Notes for AI Assistants

### When adding a new app:

1. Create folder: `apps/YYYY-MM-DD-app-name/`
2. Add `meta.json` with required fields
3. Add `index.html` as entry point
4. Add `README.md` with documentation
5. Test locally before committing
6. Commit with: `feat(apps): add YYYY-MM-DD-app-name - [description]`

### When modifying the hub:

1. Edit `hub/src/index.ts`
2. Test with `bun run dev`
3. Build with `bun run build`
4. Commit with: `feat(hub): [description]` or `fix(hub): [description]`

### Common tasks:

- **Add new app**: Follow the dated folder convention
- **Update UI**: Modify the `renderHub()` function
- **Add API endpoint**: Add route in `hub/src/index.ts`
- **Fix deployment**: Check Dockerfile and healthcheck

### Healthcheck

Uses Bun's fetch (not curl) since we use bun:1-slim image:
```dockerfile
HEALTHCHECK CMD bun -e "fetch('http://localhost:3000/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"
```
