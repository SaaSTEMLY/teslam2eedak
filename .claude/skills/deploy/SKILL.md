---
name: deploy
description: "Deploy project to Vercel — pre-flight checks, commit, push, monitor. Supports production/preview modes."
---

# Deploy

Deploy this project to Vercel. $ARGUMENTS can be: `production`, `preview`, or a custom commit message.

## Steps

1. **Pre-flight checks**: Run `bun check` and `bun lint`. If either fails, fix the issues before proceeding. Do not deploy broken code.

2. **Check for changes**: Run `git status`.
   - If there are changes: stage with `git add -A`, commit with message `deploy: $ARGUMENTS` (or `deploy: update` if no arguments).
   - If clean and up to date with remote: skip to step 4.

3. **Push to remote**: Run `git push`. This triggers Vercel's auto-deploy via GitHub integration.

4. **Monitor deployment**:
   - If `vercel` CLI is available: `vercel ls --limit 1` to see latest deployment
   - Otherwise: `gh run list --limit 3` to check GitHub Actions
   - Report the deployment URL when available

5. **Report result**: Show the deployed URL and whether it succeeded or failed.

## Rules

- Never force push
- Always run pre-flight checks before deploying
- If $ARGUMENTS contains "preview", use `vercel deploy` (preview) instead of pushing to main
- If deployment fails, show error logs and suggest fixes
