# PC Sync Task: Transfer .env.local to Mac

**Status:** PENDING  
**Owner:** PC  
**Deadline:** Before next Mac session  
**Priority:** Medium

---

## Task

Sync the `.env.local` file from PC to Mac so Continue IDE integration works on both devices.

## Steps (PC)

1. Go to: `C:\Users\[username]\.continue\.env.local`
2. Copy entire file contents
3. Sync to GitHub or shared location
4. Notify when done

## Steps (Mac - after PC completes)

1. Pull updated files from GitHub
2. Check: `~/.continue/.env.local` exists with credentials
3. Restart VS Code
4. Verify Continue can access: Airtable, Slack, Notion, Google, Make

---

## Why This Matters

- Continue IDE integration requires MCP credentials
- PC is master config (per governance rule)
- Mac needs same .env.local for parity
- Enables Claude in VS Code on both devices

---

## File Location

**PC:** `C:\Users\[username]\.continue\.env.local`  
**Mac:** `~/.continue/.env.local`

---

**Created:** 2026-09-23  
**Add to:** Notion → Week 2 Tasks → Backlog
