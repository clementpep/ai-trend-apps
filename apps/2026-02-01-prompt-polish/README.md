# ✨ Prompt Polish

Analyze and improve your AI prompts with instant heuristic-based feedback.

## Overview

**Prompt Polish** helps you craft better prompts for AI tools like Claude, ChatGPT, and other LLMs. It analyzes your prompts across 4 key dimensions and provides actionable suggestions for improvement.

Inspired by the viral growth of Claude Code and the increasing need for better prompt engineering skills.

## Features

- **Real-time Analysis**: Get instant feedback on your prompts
- **4 Key Metrics**: 
  - 💎 **Clarity** - Is your intent clear?
  - 🎯 **Specificity** - Are you being specific enough?
  - 🏗️ **Structure** - Is your prompt well-organized?
  - 📚 **Context** - Did you provide enough background?
- **Smart Suggestions**: Actionable tips to improve your prompts
- **Improved Version**: Auto-generated enhanced prompt when needed
- **No API Required**: Everything runs locally in your browser

## Tech Stack

- HTML5
- CSS3 (CSS Variables, Grid, Flexbox)
- Vanilla JavaScript (ES6+)

## Usage

1. Open the app in your browser
2. Paste or type your prompt
3. Click "Analyze Prompt" (or Ctrl/Cmd + Enter)
4. Review your score and suggestions
5. Copy the improved version if available

## Scoring

| Score | Level |
|-------|-------|
| 70-100 | ✅ Good |
| 40-69 | ⚠️ Medium |
| 0-39 | ❌ Poor |

## How It Works

The analyzer uses heuristics to evaluate prompts:

- **Clarity**: Checks for action verbs, length, formatting
- **Specificity**: Detects vague words, looks for numbers/examples
- **Structure**: Identifies lists, sections, line breaks
- **Context**: Finds context indicators, role definitions, constraints

## Development

```bash
# No build step needed - just open index.html
open index.html

# Or serve with any static server
python -m http.server 8000
```

## License

MIT

---

Built with 🌶️ by El Tchoupinou
