# Commit Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/).

## Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

## Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no code change |
| `refactor` | Code change that neither fixes nor adds |
| `perf` | Performance improvement |
| `test` | Adding or fixing tests |
| `chore` | Maintenance (deps, config) |
| `ci` | CI/CD changes |

## Scopes for this project

- `hub` — Changes to the hub UI/server
- `apps` — New apps or app modifications
- `docker` — Dockerfile or deployment changes
- `deps` — Dependency updates

## Examples

```bash
# New app
feat(apps): add 2026-02-01-prompt-analyzer - AI prompt improvement tool

# Hub UI change
feat(hub): add dark mode toggle

# Bug fix
fix(hub): correct date formatting for non-US locales

# Deployment fix
fix(docker): use bun for healthcheck instead of curl

# Documentation
docs: update README with deployment instructions
```

## Pre-commit checklist

- [ ] Code compiles without errors
- [ ] Tests pass (if applicable)
- [ ] No secrets in code
- [ ] Commit message follows convention
