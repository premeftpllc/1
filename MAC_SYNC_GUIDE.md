> **⚠ SUPERSEDED - NOT A SOURCE OF TRUTH (marked 2026-09-24).** This document contains stale and, in places, fabricated status claims from earlier sessions. For verified state see `START_HERE.md` at the repo root (premeftpllc/1, branch main). Always prefer a live tool call over any markdown file.

# Mac Sync Guide - PC is Master Source (UPDATED 2026-09-22)

**CRITICAL:** PC .continue folder is now the authoritative master repository.

## Consolidation Complete
- Date: 2026-09-22 13:00 UTC
- PC Master Location: `C:\Users\Administrator\.continue`
- Files Consolidated: ~28,700 items from `C:\Users\Administrator\continue-demo`
- All files, directories, and git history preserved in single master repo

## For Mac Users: Sync Instructions

### Initial Setup (First Time)
1. Clone the consolidated repo if you haven't already:
   ```bash
   git clone https://github.com/premeftpllc/1.git ~/.continue
   cd ~/.continue
   ```

### Regular Sync (After PC Changes)
1. Navigate to your Mac .continue folder:
   ```bash
   cd ~/.continue
   ```

2. Fetch and pull all changes:
   ```bash
   git fetch origin
   git pull origin main
   ```

3. If merge conflicts occur: **PC version wins - accept theirs**
   ```bash
   git checkout --theirs .
   git add -A
   git commit -m "Merge PC master changes - accept PC versions"
   ```

4. Verify sync is complete:
   ```bash
   git log --oneline -3
   ```

## Key Changes in This Consolidation
- Single repo: `premeftpllc/1` (same for both PC and Mac)
- Master source: PC `.continue` folder
- All subdirectories: web-search-mcp, preme-os, rules, MCP launchers, etc.
- Configuration files: .continuerc.json, config.yaml, MCP tool configurations
- Dependencies: node_modules, .venv, packages all consolidated

## PC Commit References
- Consolidation Commit: 3a79d38147f277e8888b51b932548341fa7a9947
- Remote: https://github.com/premeftpllc/1.git
- Branch: main

## Important Notes
- PC files are **authoritative** - Mac versions should exactly mirror PC
- Never push to main from Mac unless coordinated with PC
- If working on different branches, PC main is the truth
- Both machines should have identical .continue directory content
