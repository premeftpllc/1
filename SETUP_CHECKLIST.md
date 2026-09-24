> **⚠ SUPERSEDED - NOT A SOURCE OF TRUTH (marked 2026-09-24).** This document contains stale and, in places, fabricated status claims from earlier sessions. For verified state see `START_HERE.md` in `~/.continue` (repo premeftpllc/1, branch main). Always prefer a live tool call over any markdown file.

# MCP Setup Checklist — Slack, Gmail, Google Calendar/Drive, Shopify, Zapier, Make.com

Live config lives at `C:\Users\Administrator\.continue\config.yaml` (NOT `.continue/config.yaml`
in this repo, which is deleted/unused — see `CONTINUE_SETUP.md`). It now registers ten servers
directly, not only through the Make bridge — this replicates the set of connectors already
authorized for this account on claude.ai (Airtable, Gmail, Google Calendar, Google Drive, Make,
Notion, Shopify, Slack, Zapier).

**Done locally (2026-09-21):**
- Repointed the `gmail` MCP server entry in `config.yaml` from
  `web-search-mcp/scripts/gmail-mcp-launcher.js` (needed `GOOGLE_SERVICE_ACCOUNT_JSON`, which was
  never set) to `.continue/mcp-gmail-launcher.js`, which implements the OAuth2 user-consent flow
  chosen for this mailbox.
- Corrected `CONTINUE_SETUP.md`, which incorrectly said Make was the sole gateway for
  Slack/Gmail/Airtable — the live config runs them as direct MCP servers.
- Installed `@cocal/google-calendar-mcp`, `@piotr-agier/google-drive-mcp`, and `shopify-mcp`
  (added to `package.json`), and wrote four new launchers:
  `.continue/mcp-calendar-launcher.js`, `.continue/mcp-drive-launcher.js`,
  `.continue/mcp-shopify-launcher.js`, `.continue/mcp-zapier-bridge.mjs`. Calendar and Drive reuse
  the same `gcp-oauth.keys.json` the Gmail launcher generates, so they share the Google OAuth
  client already in `.env.local`.
- Registered `google-calendar`, `google-drive`, `shopify`, and `zapier` as new `mcpServers`
  entries in `config.yaml`. YAML re-parsed and validated after every edit; all launcher scripts
  pass `node --check`.
- Added placeholder env vars for the new services to `.continue/.env.local`:
  `ZAPIER_MCP_URL`, `SHOPIFY_ACCESS_TOKEN`, `MYSHOPIFY_DOMAIN` (plus commented
  `SHOPIFY_CLIENT_ID`/`SHOPIFY_CLIENT_SECRET` for the Dev Dashboard auth path). Still placeholders
  — no real Shopify/Zapier credentials exist anywhere for me to use.

**Still manual — nothing below can be done from a file edit:**

## 1. Slack MCP — root cause found

**Problem:** `SLACK_BOT_TOKEN` in `.continue/.env.local` starts with `xoxe.` — that prefix is a
Slack **token-rotation refresh token**, not a usable bot token. Refresh tokens can't call the
Web API directly; they must first be exchanged (`oauth.v2.exchange` / `tooling.tokens.rotate`)
for a short-lived `xoxb-...` access token. That's why every Slack call is failing — it isn't a
scopes problem, it's a wrong-credential-type problem.

**Fix:**
1. In the Slack App admin (https://api.slack.com/apps → your app → **OAuth & Permissions**),
   check whether token rotation is enabled for this app.
   - If **not** using rotation: reinstall the app to the workspace and copy the **Bot User OAuth
     Token** (`xoxb-...`) shown on that page — not any token starting `xoxe-`.
   - If rotation **is** enabled: your backend must call the refresh flow to mint a fresh
     `xoxb-` token periodically and store *that* in `.env.local`, not the refresh token itself.
2. Once a real `xoxb-` token is in place, confirm scopes on **OAuth & Permissions → Scopes →
   Bot Token Scopes**. Minimum set for the current MCP tools (read + search + reactions +
   canvases/lists):
   - `channels:read`, `groups:read`, `im:read`, `mpim:read`
   - `channels:history`, `groups:history`, `im:history`, `mpim:history`
   - `users:read`, `users:read.email` (profile lookups)
   - `search:read` (or `search:read.public` on newer scope model)
   - `reactions:read`, `reactions:write` (if reactions used)
   - `files:read`, `files:write` (upload flow)
   - `canvases:read`, `canvases:write`
   - `lists:read`, `lists:write`
   - `chat:write` — only if `SLACK_MCP_ADD_MESSAGE_TOOL` is enabled for posting; keep it off an
     allow-list of specific channel IDs, not workspace-wide (per
     `preme-os/CONTINUE_CONNECTOR_AUTHORIZATION_NOW.md`).
3. After any scope change, **reinstall the app to the workspace** — scope edits don't take
   effect on the existing token until reinstall.
4. Invite the bot user (`/invite @yourbot`) to every channel it needs to read/post in — scopes
   alone don't grant channel membership.
5. Verify with a direct, low-risk call (do this yourself in a terminal, not pasted into chat):
   `curl -H "Authorization: Bearer $SLACK_BOT_TOKEN" https://slack.com/api/auth.test`
   A healthy `xoxb-` token returns `"ok": true` with your bot's user/team id. `"ok": false` with
   `invalid_auth` confirms the token is still wrong; `missing_scope` in a later call pinpoints
   which scope above is missing.

## 2. Gmail MCP — launcher wiring fixed, one manual step left

The wrong-launcher problem is fixed: `config.yaml`'s `gmail` entry now points at
`.continue/mcp-gmail-launcher.js`, which uses the OAuth2 user-consent flow (the option chosen for
this mailbox, since it's not necessarily a Google Workspace account with admin access for
domain-wide delegation — that's the only way a service account could work, and the key at
`.continue/premeos-420ab5146811.json` is left unused for that reason).

**What's still needed — a real Google OAuth client:**
1. In Google Cloud Console → APIs & Services → Credentials, create an **OAuth client ID**
   (type: Desktop app or Web app, matching `GOOGLE_REDIRECT_URI`), and put the real values into
   `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` in `.continue/.env.local`, replacing the
   `YOUR_OAUTH_CLIENT_ID` / `YOUR_OAUTH_CLIENT_SECRET` placeholders still there.
2. Run the one-time authorization flow from `continue-demo`:
   `npx @klodr/gmail-mcp auth --scopes=gmail.readonly,gmail.send`
   (add `gmail.modify` only if labels/state changes are required).
3. This writes `.continue/gcp-oauth.keys.json` and stores a token; the MCP server then runs
   without further prompts. **Google Calendar and Google Drive (below) reuse this same client and
   key file**, so this one Cloud Console step unblocks all three — but each server still needs its
   own one-time browser consent, since each stores its own token separately.

## 3. Google Calendar & Google Drive MCP — new servers, need the Gmail OAuth step above

Both were just added (`google-calendar` → `.continue/mcp-calendar-launcher.js`, `google-drive` →
`.continue/mcp-drive-launcher.js`). Neither needs a separate Cloud Console app — they reuse
`GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` from `.env.local` and the `gcp-oauth.keys.json` the
Gmail launcher writes (Drive's launcher copies it into
`%USERPROFILE%\.config\google-drive-mcp\gcp-oauth.keys.json`, where that package expects it).

**What's still needed:**
1. Complete step 2's Gmail OAuth client setup first (shared dependency).
2. In Google Cloud Console, enable the **Calendar API** and **Drive API** for the same project
   used for Gmail (they're separate APIs from `gmail.googleapis.com` and must be enabled
   individually).
3. Each server does its own first-run browser consent the first time Continue calls one of its
   tools — accept the prompt when it appears. If it doesn't appear, run manually:
   `npx @cocal/google-calendar-mcp auth` (reads `GOOGLE_OAUTH_CREDENTIALS`, set automatically by
   the launcher) and check `@piotr-agier/google-drive-mcp`'s own `auth` command if Drive doesn't
   prompt.

## 4. Shopify MCP — new server, no store credentials exist yet

Added as `shopify` → `.continue/mcp-shopify-launcher.js` (`shopify-mcp` package). The launcher
fails fast with a clear error if `SHOPIFY_ACCESS_TOKEN`/`MYSHOPIFY_DOMAIN` (or
`SHOPIFY_CLIENT_ID`/`SHOPIFY_CLIENT_SECRET`) are still placeholders in `.env.local` — which they
are right now; there was no existing Shopify credential anywhere in this repo or in Make's
authorized connections to reuse.

**What's still needed:**
1. In the target store's admin: **Settings → Apps and sales channels → Develop apps**, create a
   custom app with scopes matching what's needed (at minimum `read_products`, `read_orders`,
   `read_customers`; add `write_*` variants only if writes are required).
2. Install the app on the store and copy either the static **Admin API access token**
   (`shpat_...`) or, for apps created via the newer Dev Dashboard flow, the **Client ID/Secret**.
3. Put the real values into `.continue/.env.local` (`SHOPIFY_ACCESS_TOKEN` +
   `MYSHOPIFY_DOMAIN=your-store.myshopify.com`, or uncomment and fill the
   `SHOPIFY_CLIENT_ID`/`SHOPIFY_CLIENT_SECRET` lines instead).

## 5. Zapier MCP — new bridge, needs the per-account MCP URL

Added as `zapier` → `.continue/mcp-zapier-bridge.mjs`, modeled directly on the working
`make-mcp-bridge.js` pattern (same SDK, same Streamable HTTP → stdio bridging), pointed at
`https://mcp.zapier.com/` instead of Make's endpoint. Zapier's hosted MCP issues one URL per
account that *is* the credential — there's no separate bearer token to configure, but that URL
can only be generated by logging into Zapier.

**What's still needed:**
1. Log into https://mcp.zapier.com/, connect the apps/actions you want exposed (this is the
   equivalent of Make's per-app credential requests, but self-service and immediate).
2. Copy the account's MCP URL (`https://mcp.zapier.com/api/mcp/s/<key>/mcp`) into
   `ZAPIER_MCP_URL` in `.continue/.env.local`, replacing the `YOUR_ZAPIER_MCP_URL` placeholder.

## 6. Make.com — bridge auth OK, four credential requests pending

**Bridge auth:** `web-search-mcp/scripts/make-mcp-bridge.js` requires `MAKE_MCP_AUTHORIZATION`
(a bearer token for `https://us2.make.com/mcp`), which is **not** in `.env.local` at all — it's
a separate variable from `MAKE_API_KEY`/`MAKE_TEAM_ID`. It is, however, already set as a
persistent **Windows User environment variable**, so the bridge itself should be able to start.
If it's still failing, confirm VS Code was fully restarted after that variable was set (env vars
set via `setx`/`[Environment]::SetEnvironmentVariable` only apply to *new* processes).

**Pending credential requests found in Make (org "PremeOS", team "My Team", id 2586938)** — via
live Make API, as of 2026-09-21:

| Created | Name | Apps | Status |
|---|---|---|---|
| 2026-09-21 23:25 | Request for credentials | (unnamed) | pending |
| 2026-09-21 23:24 | Request for credentials | (unnamed) | pending |
| 2026-09-21 22:05 | Request for credentials | (unnamed) | pending |
| 2026-09-21 21:44 | Request for credentials | (unnamed) | pending |
| 2026-09-15 23:12 | Reconnect OpenAI for PremeOS AI pipeline | openai-gpt-3 | pending |

The four unnamed same-day requests are almost certainly the Slack/Gmail/Airtable connections
Make needs to actually operate those scenarios (per the "Make is the integration gateway"
design in `CONTINUE_SETUP.md`). They have no description or app name set, so open each one in
the Make UI (Profile → Credential requests, or the link Make emailed/would have emailed —
`shouldSendEmail` is `false` on all of them, so no email went out) to see which app each is for
and approve/fill in the credential there. This step **must be done manually in the Make UI** —
it can't be approved via API without knowing which app/scopes each request wants.

**Fix:**
1. Log into Make (us2.make.com), go to the credential requests list, open each of the four
   pending "Request for credentials" entries, and complete them with the appropriate
   Slack/Gmail/Airtable (and OpenAI, if still needed) credentials.
2. Once approved, connections show up under **Connections** for team 2586938 and the
   `make-custom-mcp` bridge will expose their tools automatically — no restart needed for new
   Make-side connections, only for changes to `MAKE_MCP_AUTHORIZATION` itself.

## Summary of blockers

| Service | Local wiring | Remaining manual step |
|---|---|---|
| Slack | Correct (direct MCP server) | `SLACK_BOT_TOKEN` is a refresh token (`xoxe.`), not a bot token — reinstall Slack app, copy real `xoxb-` token, verify scopes (section 1) |
| Gmail | Fixed — repointed to OAuth launcher | Create real Google OAuth client, fill `GOOGLE_CLIENT_ID`/`SECRET`, run `gmail-mcp auth` (section 2) |
| Google Calendar | New — added this session | Same OAuth client as Gmail; enable Calendar API; one-time browser consent (section 3) |
| Google Drive | New — added this session | Same OAuth client as Gmail; enable Drive API; one-time browser consent (section 3) |
| Shopify | New — added this session | Create a custom app in the store admin, put token/domain in `.env.local` (section 4) |
| Zapier | New — added this session | Get the per-account MCP URL from mcp.zapier.com, put it in `.env.local` (section 5) |
| Make | Correct; bridge auth already set | 4 pending credential requests need manual approval in Make UI (section 6) |
| Airtable (context) | Correct; blocked externally | Monthly API quota exhausted — not fixable locally (see `preme-os/MAKE_AIRTABLE_LIMIT_BLUEPRINT.md`) |

No tokens were rotated. `config.yaml`, `.env.local` (placeholders only, no real secrets typed
in), and the launcher scripts above were the only files touched this session — see the "Done
locally" list at the top.
