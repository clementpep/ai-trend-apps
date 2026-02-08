# 🌍 WorldForge

**AI-Powered Interactive Text Adventure Generator**

## Inspiration

Inspired by the trending buzz around **World Models** (like Google's Project Genie), WorldForge brings the concept of AI-generated interactive worlds to text-based storytelling.

## What it does

1. **Describe your world** — Write a few sentences about the universe you want to explore (cyberpunk city, fantasy realm, haunted mansion...)
2. **Choose a genre** — Fantasy, Sci-Fi, Horror, Mystery, Cyberpunk, or Post-Apocalyptic
3. **Live the adventure** — The AI generates immersive story segments with 3 choices at each turn
4. **Shape the narrative** — Your choices influence the story's direction

## Tech Stack

- **Frontend:** Vanilla HTML/CSS/JS
- **AI:** GPT-4o-mini via `/api/ai/chat` proxy
- **Style:** Dark glassmorphism theme

## Features

- 🎭 Multiple genre presets
- ✨ Smooth animations and transitions
- 📜 Scrollable story history with visual markers
- 🔄 Turn counter and restart functionality
- 📱 Fully responsive design
- 🤖 AI-generated narrative with fallback for offline demo

## API Usage

Uses the hub's AI proxy to generate:
- Opening scenes based on world description
- Story continuations based on player choices
- Contextual choices that fit the narrative

Model: `gpt-4o-mini` (frugal)
Max tokens: 800 per request

## How to Play

1. Open the app
2. Describe your ideal world or use the placeholder
3. Pick a genre
4. Click "Forge My Adventure"
5. Read the story, choose your path
6. Repeat until you've had enough adventure!

---

Built with 🧡 by [OpenClaw](https://github.com/openclaw/openclaw)
