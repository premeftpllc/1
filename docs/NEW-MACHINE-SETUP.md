# New machine setup — MacBook Neo, Mac mini (and any future machine)

**Written 2026-09-26 on the PC (DESKTOP-0FKQG33).** This is the one setup guide. If you are Claude
on a Mac, read it top to bottom, run the steps in order, and report back as described in
[Step 9](#9-report-back). Ignore older setup docs (`MACBOOK_NEO_SETUP.md`, `MAC_NEO_SETUP.md`,
`MAC_SYNC_GUIDE.md`, `CONTINUE_SETUP.md`, `SETUP_CHECKLIST.md`, `MCP_CREDENTIALS_SETUP.md`,
`docs/WORKSPACE.md`); they describe layouts that no longer exist.

## The model: the PC is the reference, git is the link

The **PC is the original, working setup**. Every other machine reproduces it from this repo:

| What | Where it lives | How it reaches each machine |
|---|---|---|
| This repo | `~/PremeOS/1` on Macs, `C:\Users\Administrator\PremeOS\1` on the PC | `git pull` on **`main`** (the only long-lived branch) |
| Continue rules (8) | `.continue/rules/` in this repo | Continue loads them whenever this repo is the open workspace |
| MCP servers (8) | `config/continue/mcpServers/*.yaml` | `workspace.py mcp --apply` copies them to `~/.continue/mcpServers/` |
| Models | `config/continue/config.template.yaml` | `workspace.py config --apply` renders `~/.continue/config.yaml` per machine |
| Secrets (18) | `secrets/premeos.env`, SOPS + age encrypted | `workspace.py secrets` decrypts to `~/.continue/.env` |
| VS Code tasks and settings | `.vscode/`, `PremeOS.code-workspace` | git |
| Personal VS Code settings/extensions | VS Code account | VS Code **Settings Sync** |

Never per-machine in git: `~/.continue/config.yaml`, `~/.continue/.env`, the age private key.
`~/.continue` is Continue's own folder: **do not clone this repo into it** (that was the old PC
layout, retired 2026-09-26).

### What is configured (verified on the PC 2026-09-26, `node scripts/mcp-probe.mjs`)

| Server | Block | Runs | Tools |
|---|---|---|---|
| clock | premeos-clock | `node .continue/mcp-clock.mjs` | 1 (`get_current_datetime`) |
| web-search | premeos-web-search | `node web-search-mcp/dist/index.js` (Playwright Chromium) | 3 |
| make-custom-mcp | premeos-make | `node .continue/mcp-make-bridge.js` (trims Make to 42 tools) | 42 |
| notion | premeos-notion | `npx @notionhq/notion-mcp-server@2.5.2` | 24 |
| airtable | premeos-airtable | Airtable hosted MCP (`https://mcp.airtable.com/mcp`) | 46 |
| slack | premeos-slack | `npx slack-mcp-server@1.3.0` with the **user** token (xoxp) | 15 |
| shopify | premeos-shopify | `npx shopify-mcp@1.0.8` (live store, write tools: keep "Ask first") | 14 |
| zapier | premeos-zapier | Zapier hosted MCP (URL from secrets) | 1 |

Model everywhere: `nvidia/nemotron-3-nano-4b` in LM Studio on port **1235** for chat, autocomplete,
edit and apply; `text-embedding-nomic-embed-text-v1.5` for embeddings; Voyage `rerank-2` (cloud).
Context: PC 400,000 (LM Studio loads 401,719); Macs **32,768 with parallel 1** (the setting that
loads on the 8 GB MacBook, verified 2026-09-24).

Not configured on any machine (owner decisions pending): Gmail and Google Calendar (Gmail and
Calendar APIs are disabled in GCP project `851326606267`), Google Drive (128 tools, ~34K tokens per
request). Their launchers stay in `.continue/` for later.

## 1. Install the tools (Mac)

```bash
xcode-select --install                 # if git is missing
brew install git node python sops age  # node 20+; nvm is fine instead
brew install --cask visual-studio-code lm-studio
```

Then: open LM Studio once (it installs `~/.lmstudio/bin/lms`), and in VS Code install the
**Continue** extension (2.0.0 or later). Claude Code is optional but recommended.

## 2. Get the repo on `main`

**Mac mini (fresh):**

```bash
mkdir -p ~/PremeOS && git clone git@github.com:premeftpllc/1.git ~/PremeOS/1
cd ~/PremeOS/1 && git checkout main
```

**MacBook Neo (already has `~/PremeOS/1` on the old branch `claude/worker-1-kz0ycj`):** that
branch is fully merged into `main` (merge commit `c2a3835`). Commit or stash anything local
first, then:

```bash
cd ~/PremeOS/1 && git status          # must be clean
git fetch origin
git log --oneline origin/main..claude/worker-1-kz0ycj   # anything listed was never pushed:
                                                        # merge it into main after the checkout below
git checkout main && git pull --ff-only
```

Work on `main` from now on (short-lived feature branches are fine; merge them back).

## 3. Encryption key (age) — one per machine, private key never leaves it

```bash
mkdir -p ~/.config/sops/age
[ -f ~/.config/sops/age/keys.txt ] || age-keygen -o ~/.config/sops/age/keys.txt
chmod 600 ~/.config/sops/age/keys.txt
age-keygen -y ~/.config/sops/age/keys.txt   # prints this machine's PUBLIC key
```

- **MacBook Neo:** must print `age1ejegjy9myh9sx6y9tkfw56ht266v0y5jee2a493ancrpzye3wa9szs9e07`.
  It is already a recipient; continue to step 4.
- **Mac mini:** it is a new recipient. Its public key must be added by a machine that can already
  decrypt (the PC or the MacBook):
  1. Put the Mac mini's public key into `.sops.yaml` (`age:` is a comma-separated list; keep the
     existing two keys).
  2. `sops updatekeys -y secrets/premeos.env`
  3. Commit (`Add Mac mini as a SOPS recipient`) and push to `main`.
  4. On the Mac mini: `git pull`.

  Public keys are safe to paste into Notion or chat; private keys never are.

## 4. Build and install

```bash
cd ~/PremeOS/1
python3 scripts/workspace.py setup     # npm ci, build web-search-mcp, Playwright Chromium
python3 scripts/workspace.py secrets   # decrypt to ~/.continue/.env (18 variables) + enable MCP blocks
python3 scripts/workspace.py config --apply   # write ~/.continue/config.yaml (old one backed up)
python3 scripts/workspace.py mcp       # expect: 8 blocks, 8 ACTIVE, no WARN lines
```

`secrets` never prints values. On the MacBook, `mcp --apply` also removes the old blocks from its
earlier setup (`premeos-time.yaml` and any other `premeos-*` file no longer in the repo).

Remove global rules if any exist, so rules are not loaded twice (Continue loads global and
workspace rules without de-duplicating): `ls ~/.continue/rules` should be empty or absent.

## 5. Local model

1. In LM Studio, download `nvidia/nemotron-3-nano-4b` and `text-embedding-nomic-embed-text-v1.5`.
2. `python3 scripts/workspace.py server` (starts LM Studio's server on port 1235)
3. `python3 scripts/workspace.py load` (loads Nemotron at 32,768 context, parallel 1)
4. `python3 scripts/workspace.py health && python3 scripts/workspace.py chat` → `PASS ... PREMEOS_OK`

**Mac mini with more than 8 GB:** 32,768 is the safe default. A larger context is the owner's call;
if they choose one, export `PREMEOS_CONTEXT=<n>` and rerun `config --apply` and `load` (unload the
model in LM Studio first).

## 6. Verify every MCP server

```bash
node scripts/mcp-probe.mjs
```

Expect 8 `OK` lines with the tool counts in the table above. `EXITED`/`MISSING` means a path or
dependency problem (rerun `setup`), not usually a credential problem. The probe prints tool
counts only and masks secret values in any error text; **never print `~/.continue/.env`**.

## 7. VS Code

1. **File → Open Workspace from File… → `~/PremeOS/1/PremeOS.code-workspace`.**
2. When VS Code asks about automatic tasks, allow them: they start the LM Studio server and load
   the model on folder open.
3. **Developer: Reload Window.** In Continue: pick **PremeOS (Nemotron 3 Nano 4B, local LM
   Studio)**, switch to **Agent** mode, and check the Tools list shows the 8 servers and the Rules
   list shows 8 rules.
4. Turn on **Settings Sync** (Accounts icon, bottom left) with the same account as the PC, so
   personal settings and extensions follow you. The PC must have it on too.

## 8. Daily routine on any machine

```bash
cd ~/PremeOS/1 && git pull
python3 scripts/workspace.py secrets   # or task "PremeOS: Sync MCP secrets"
```

Then **Developer: Reload Window**. To change something shared (a rule, an MCP block, the model
template), edit it in the repo, commit, push; other machines pull and run `secrets` (which also
re-applies blocks) and `config --apply` if the template changed.

To add or rotate a secret: on the PC or another recipient, `sops secrets/premeos.env`, commit,
push; every machine runs `secrets`. The owner has deferred rotating the Make token and the Google
key: record exposures factually, do not re-raise them.

## 9. Report back

When a machine is done, log it in Notion **Preme Work Sessions** (entry
"2026-09-26 · Continue.dev (PC) · One main branch; PC is the reference; Mac setup guide") under
a heading `Reply from <MacBook Neo | Mac mini>`: which steps passed, the `mcp-probe` output, and
anything that differed from this guide. Commit any fixes to this guide on `main`.

## Troubleshooting

- **Blank Models/Tools tab in Continue:** a schema error in `~/.continue/config.yaml` or a block;
  Continue fails silently. Rerun `config --apply` and `mcp --apply`.
- **`${VAR}` is never expanded by Continue.** Only `${{ secrets.NAME }}`, resolved from
  `~/.continue/.env`.
- **Slack `missing_scope`:** the bot token's scopes were added under User Token Scopes; the block
  uses the user token (xoxp) for that reason. To switch to the bot token, move the scopes to Bot
  Token Scopes, reinstall the Slack app, and change the block's env to `SLACK_MCP_XOXB_TOKEN`.
- **Make shows ~146 tools:** the bridge did not find `.continue/mcp-tool-filters.json`; it warns
  on stderr. `MAKE_MCP_TOOL_MODE=all` restores the full list deliberately.
