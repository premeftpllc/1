> **⚠ SUPERSEDED (2026-09-26) - NOT A SOURCE OF TRUTH.** Describes a machine layout that no longer exists. To set up the PC, MacBook Neo or Mac mini, follow [docs/NEW-MACHINE-SETUP.md](docs/NEW-MACHINE-SETUP.md); for current state see `START_HERE.md`.

# Continue + PremeOS MCP setup — MacBook Neo

Mirrors the working Windows setup. Every gotcha below was hit and solved for real on the
Windows box; following this in order should avoid re-debugging them.

**Verified working here:** web-search, clock, make-custom-mcp, notion, airtable, slack,
google-calendar, gmail, zapier, shopify. `google-drive` works over raw stdio but times out
through Continue — unresolved, low priority.

---

## 0. The one thing to understand first

> **SUPERSEDED 2026-09-24 — this file is a PC-side reference, NOT for the MacBook Neo.**
> The Mac already has a working, verified setup on branch `claude/worker-1-kz0ycj`
> (commit `096404d`, `config/continue/mcpServers/`, guide `docs/CONTINUE-MCP-ARCHITECTURE.md`).
> See `START_HERE.md` §9. Do not clone `main` into `~/.continue` on the Mac.

**Continue v2.0.0 does NOT expand `${VAR}` in `mcpServers[].env`.** Its template regex
(`TEMPLATE_VAR_REGEX = /\${{[\s]*([^}\s]+)[\s]*}}/g`) only matches the double-brace form.
A plain `${VAR}` is passed through as a literal string and silently fails.

**CORRECTION:** an earlier version of this file said `${{ secrets.NAME }}` requires a
hub.continue.dev login. **That is wrong.** Verified in the installed extension
(`out/extension.js`, `LocalPlatformClient.findSecretInEnvFiles`), Continue resolves it locally,
in this order: **`~/.continue/.env`** → `<workspace>/.continue/.env` → `<workspace>/.env` →
process env (`SecretType.LocalEnv`). No Hub account involved.

**So the preferred pattern is `${{ secrets.NOTION_TOKEN }}` in `config.yaml` with the value in
`~/.continue/.env`** — `config.yaml` then contains no secrets and is safe to track.

On top of that, the MCP stdio transport does not inherit your shell environment — it forwards
only a small allowlist (`PATH`, `HOME`, `USER`, `TMPDIR`, …). `NOTION_TOKEN` will never arrive
on its own.

So a credential reaches a server exactly two ways:

1. **Literal value** pasted into `config.yaml`'s `env:` block, or
2. **A `.env.local` that the launcher script loads itself.**

Which `.env.local` matters depends on how each launcher resolves it:

| Resolution | File that matters | Servers |
|---|---|---|
| `__dirname`-relative | `~/.continue/.continue/.env.local` | shopify, zapier, google-calendar, google-drive |
| CWD-relative | `<VS Code workspace>/.continue/.env.local` | slack, gmail, airtable |

Continue sets a spawned server's CWD to the **open VS Code workspace folder**.

> **Put an identical `.env.local` in both locations.** Then you never have to think about it.
> These loaders run *after* Continue's env merge and overwrite `process.env`, so they win.

---

## 1. Prerequisites

```bash
node --version      # v20+ (v24 is what Windows runs)
code --version      # VS Code
```

Install the **Continue** extension in VS Code. Install **LM Studio** and download
`nvidia/nemotron-3-nano-4b`, then start its local server on port **1235**.

## 2. Get the files

```bash
cd ~
git clone https://github.com/premeftpllc/1.git .continue    # or: cd ~/.continue && git pull
```

The nested `~/.continue/.continue/` directory is **not** cruft — it holds all the MCP launcher
scripts. Confirm:

```bash
ls ~/.continue/.continue/mcp-*.js ~/.continue/.continue/mcp-*.mjs
```

## 3. Config

```bash
cp ~/.continue/config.mac.example.yaml ~/.continue/config.yaml
```

Then edit `config.yaml`:

- Replace every `/Users/YOUR_USERNAME/` with your real home path (`echo $HOME`).
- Set `apiBase` — `http://127.0.0.1:1235/v1` for LM Studio on the Mac, or
  `http://192.168.1.25:1235/v1` to borrow the Windows box (same LAN only).
- Paste the literal values for `NOTION_TOKEN`, `MAKE_MCP_AUTHORIZATION`, the Airtable
  `apiKey`, and the Zapier `url`. These four **must** be literal — see §0.

`config.yaml` is **gitignored on purpose** — it holds live secrets. Never commit it.

## 4. Credentials

```bash
cp ~/.continue/.env.local.example ~/.continue/.continue/.env.local
# fill it in, then mirror it into your workspace:
mkdir -p /path/to/your/workspace/.continue
cp ~/.continue/.continue/.env.local /path/to/your/workspace/.continue/.env.local
chmod 600 ~/.continue/.continue/.env.local
```

Get the actual secret values from the Windows machine **out of band** — 1Password, AirDrop,
or typed by hand. Do **not** email them, paste them into Notion/Slack, or commit them.

## 5. Verify — the single most reliable technique

Don't trust the UI's green dots. Run the raw MCP handshake directly against each launcher.
This found every real root cause on Windows, usually in under a minute:

```bash
cd ~/.continue/.continue
printf '%s\n' \
 '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"probe","version":"1"}}}' \
 '{"jsonrpc":"2.0","method":"notifications/initialized"}' \
 '{"jsonrpc":"2.0","id":2,"method":"tools/list"}' \
 | node mcp-shopify-launcher.js
```

A real tool list back = working. `MODULE_NOT_FOUND` or instant exit = a path problem, not a
credential problem. Repeat per launcher.

> If a launcher fails, **run it directly from the real CWD** (`node <full path>`) and read the
> actual runtime error. Guessing from config alone wastes hours.

## 6. Per-service gotchas (all hit for real)

| Service | The trap | Fix |
|---|---|---|
| **Slack** | Launcher passes `SLACK_BOT_TOKEN`, but the Go binary reads `SLACK_MCP_XOXB_TOKEN` / `SLACK_MCP_XOXP_TOKEN`. Then: scopes added under **User** Token Scopes when **Bot** scopes were needed — the two sections look identical. | Use the **user token** (`xoxp-`) via `SLACK_USER_TOKEN`. To see what a token really has: `curl -H "Authorization: Bearer <tok>" https://slack.com/api/conversations.list` — the JSON names the exact missing scope, and `x-oauth-scopes` in the headers lists what's granted. |
| **Airtable** | `@airtable/mcp-cli` is **not a stdio server** — it's a CLI wrapper with no server mode. The whole stdio approach is architecturally wrong. | Use `type: streamable-http`, `url: https://mcp.airtable.com/mcp`, `apiKey: <PAT>`. |
| **Gmail** | Launcher was written for a **service account**; `@klodr/gmail-mcp` is **OAuth-only** and doesn't support them at all. | Set `GMAIL_OAUTH_PATH` to a `gcp-oauth.keys.json`, then `npx -y @klodr/gmail-mcp auth --scopes=gmail.readonly`. Reuse the calendar/drive OAuth client. |
| **Calendar / Drive** | Generated `gcp-oauth.keys.json` as `{web:{...}}`; the package only accepts `{installed:{...}}` or flat. Fails with a generic "credentials not found". | Write `{installed:{...}}`. Also the auth server hardcodes ports **3500–3505** — register all six `http://localhost:350{0-5}/oauth2callback` as redirect URIs. Add yourself as a **Test user** on the consent screen. |
| **Zapier** | Continue's built-in OAuth fails against Zapier ("Invalid authorization request"). | Use Zapier's **"Other"** generic-client option → gives a URL with the token embedded. Set as `type: streamable-http` with just that `url`. |
| **Shopify** | `SHOPIFY_SHOP_URL` is the wrong name — the package reads `MYSHOPIFY_DOMAIN`. | Use `MYSHOPIFY_DOMAIN` + client id/secret in `~/.continue/.continue/.env.local`. An `app_not_installed` error on first token exchange usually clears itself after the Dev Dashboard app version is released. |
| **Google Drive** | Works over raw stdio, times out through Continue. Never solved. | Low priority. If retrying, compare Continue's restricted spawn env against your shell's. |

## 7. If Models/Tools tabs are blank

That means `config.yaml` failed Continue's **strict** schema validation
(`additionalProperties: false`) and it silently fell back to empty state rather than erroring.

Real causes found here: a top-level `modelRoles:` block (not a field), a top-level `settings:`
block (not a field), and invalid entries in a model's `roles:`. Only these are valid:
`chat, autocomplete, embed, rerank, edit, apply, summarize, subagent`.

Validate against Continue's own shipped schema rather than guessing — extract
`config-yaml-schema.json` from the installed `continue.continue-*` extension folder, parse
`config.yaml` with a real YAML parser, and check it with ajv.

## 8. Notes

- `.continuerc.json` and `config.json` beside `config.yaml` are legacy/unused —
  `getPrimaryConfigFilePath()` prefers `config.yaml`. Don't edit them for global config.
- Keep long agent sessions short. Output quality degrades badly over many turns; prefer one
  well-specified prompt with real values baked in over correcting across many turns.
