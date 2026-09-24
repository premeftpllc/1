# START HERE — PremeOS / PremeFTP handoff

**Last verified: 2026-09-23 (Windows box, DESKTOP-0FKQG33).**
If you are an agent picking this up on the MacBook Neo, read this file completely before acting.
It is written to be self-contained. You should not need any other document to start.

---

## 0. RULE ZERO — do not trust the markdown in this repo

This project has a documented history of **stale AND fabricated** status documents. Several were
written by earlier agents that invented evidence. Known-unreliable, do **not** cite as current:

- `INVESTIGATION_REPORT.md` — describes a different workspace, claims a "security-restricted"
  file that reads fine, mislabels byte counts as line counts, ends mid-sentence.
- `PREMEOS_COMPLETE_BRIEFING.md`, `DIAGNOSTIC_REPORT.md`, `CURRENT_CONFIG.md`,
  `SETUP_CHECKLIST.md`, `CONTINUE_SETUP.md`, `MAC_SYNC_GUIDE.md`, any `*_COMPLETE.md`
  or `*_SUMMARY.md` — mutually contradictory. There are "COMPLETE" and "BROKEN" docs from the
  same day with nothing marking which supersedes which.

**Always prefer a live tool call over any markdown file — including this one if time has passed.**
When you verify something, say which call you made. Never write a status doc claiming success you
did not directly observe.

## 1. What this system is

**Continue (VS Code) → is tooling for → PremeOS → which runs → PremeFTP.**

- **PremeFTP** — live Shopify Supreme streetwear resale store, `premeftp.shop`
  (admin `premeftp.myshopify.com`). Real money, real customers.
- **PremeOS** — the automation layer: Make.com scenarios, an Airtable base, Notion trackers,
  Discord alerting.
- **This repo** — the dev tooling that builds and operates PremeOS.

Work here touches production. Treat it that way.

## 2. Verified ground truth (live calls, 2026-09-23)

**Store**

- Catalog: **105 products**, 101 published, **88 buyable**. (NOT "1000+ SKUs" — that claim is false.)
- Median price $80, range up to $385. **0 buyable products priced $0.**
- **0 of 101 variants have a SKU.** This blocks every product feed (Google Merchant, Meta catalog)
  and marketplace listing.
- Vendor is `PremeFTP` on 99 of 101; should be `Supreme` — buyers search the brand.
- Storefront is **healthy**: themed, cart, Shop Pay/Apple Pay/Google Pay, 3DS. The "Sold out"
  strings in the HTML are **hidden template badges**, not a wall of dead stock.
- Tracking already installed: Meta Pixel `1220089105178014` (CAPI on), Google `AW-17923805162`.

**The actual problem**

- **One order in 60 days** (#1027, 2026-09-05, $143.26) against 88 buyable products.
- This is a **demand problem, not a supply or tech problem.** Nobody has ever measured sessions.
- Do not "fix" your way out of it. The store needs buyers.

**Known-false claims to ignore**

- `$2,368 lifetime revenue` / `44% refund rate` — **not reproducible**. The Admin API returns only
  1 order because of the **60-day app-scope window**, not data loss. The merchant Admin has all 27.
  Do **not** pursue the `read_all_orders` scope; export the CSV from Admin instead.
- Make scenario `6371060` "Shopify Refunds Investigation" — **does not exist**. Fabricated.
- "`5774991` died from the Airtable quota" — **no**. Its execution history shows a Gemini `[503]`
  model-overload on 2026-09-06 and an earlier OpenAI `[400] messages must contain the word json`.
  Gemini is no longer in that blueprint, so its parked DLQ item is orphaned against an old version.
  **Do not replay it.** The OpenAI json bug is already fixed.

## 3. THE QUOTA BUDGET — most important operating constraint

| Service | Free allowance |
|---|---|
| **Airtable** | **1,000 API calls / workspace / month** (~33/day), shared by Make, Zapier, MCP and scripts. Plus 100 automation runs/month. Batch writes take 10 records/request. |
| **Make.com** | Paid **Core** plan: **10,000 ops/month**. Polling burns ops while idle; webhooks cost zero idle. |
| **Google Sheets** | Free, 300 req/min, **no daily cap**. |
| **Discord** | Free. Already wired into `5774991` and `5901110`. |

**1,000 calls/month cannot support ANY polling design.** Polling Airtable every 15 min is 2,880
calls — 288% of the cap before doing real work. This is what killed the pipelines.

**Rules:**

1. **Never test against Airtable.** Use a Google Sheet or a local fixture. Test runs caused the burn.
2. **Never poll Airtable.** Webhook/event-driven only.
3. **Batch Airtable writes 10 at a time.**
4. **Route all status output to Discord**, not Airtable rows.
5. Airtable = system of record. Sheets = logs, scratch, test fixtures. Make = webhooks. Discord = alerts.

`preme-os/MAKE_AIRTABLE_LIMIT_BLUEPRINT.md` designs this correctly and is worth reading.

## 4. Done on 2026-09-23 (do not redo)

| Change | State |
|---|---|
| Make `5774991` interval 480s to **14400s** | Idle Airtable load 540% of cap to **18%**. Left **inactive**. |
| Make `6299332` interval 300s to **21600s** | Left inactive; also `isinvalid: true` independently. |
| Make `6373383` SNKRS scraper | **Deactivated.** It was creating ACTIVE products daily. |
| 4 SNKRS scraper products | **Archived.** 0 `$0` ACTIVE products remain. |
| `config.yaml` | Untracked + gitignored because it currently holds **literal** secrets. It *could* be tracked if switched to `${{ secrets.X }}` + `~/.continue/.env` — see section 9. |
| Airtable quota | **Recovered** — returns 200, not 429. Monthly reset. |

## 5. Next actions, in priority order

**Highest value is demand, not more fixes.**

1. **List stock on eBay + Grailed.** Free, existing organic demand, about one weekend. This is the
   single biggest lever. Needs SKUs first (see item 3).
2. **Shopify Admin, ~30 min** (UI-only, cannot be done via MCP):
   - Both `seon.io` and `nofraud` load on every page; only NoFraud is in the order path
     (#1027 carries `nofraud_pass`). Cut the duplicate subscription.
   - Check **Include tax in prices**. Order #1027 maths as tax-inclusive: $135.00 + $8.26 shipping
     = $143.26 with $11.68 (8.875%, exact NYC rate) carved *out*. Worth ~8.8% per order.
   - Export real order + dispute history: Analytics → Finances summary (all time);
     Orders → Export CSV; Settings → Payments → Disputes for real chargeback reason codes.
3. **Apply SKUs.** A ready file exists: `shopify-sku-import.csv` (101 unique SKUs, format
   `SEASON-TYPE-ITEM-COLOR-SIZE`). Import with **"Overwrite any current products that have the
   same handle"** ticked.
   > **CRITICAL:** a Shopify CSV that includes a variant field (SKU/Price) but **omits
   > `Option1 Name` and `Option1 Value` DELETES the variant options**. The prepared file has all
   > four columns. Never hand-roll a Handle+SKU CSV.
4. **Nav fixes** — `/collections/jackets` holds the **$376 Cross Track Jacket** (highest-priced
   buyable item) and is **not in the menu**. `fw21`(23), `ss21`(15), `fw20`(12) are reachable only
   via sitemap. `Shirts` and `Shorts` are 1-product dead ends beside a 44-product T-Shirts link.
5. **Footer** links only `/search`, privacy, terms. Refund/shipping/contact/about are live but
   unlinked. The shipping policy gives `contact@premeftp.com` three times — **that domain does not
   resolve.** Confirm `support@premeftp.shop` receives mail, then fix.
6. **Repurpose `6373383`.** Owner confirmed SNKRS items are **drop alerts, not owned stock**.
   It should post to **Discord**, not create Shopify products. If it must create them: `DRAFT`
   only, `msrp > 0` filter, title dedupe. **Never** add auto-inventory/auto-publish to a scraper.

## 6. Setup on this machine

See **`MACBOOK_NEO_SETUP.md`** — full install, both `.env.local` locations, and every per-service
trap already solved (Slack token-name mismatch, Airtable not being a stdio server, Gmail being
OAuth-only, the `{installed:{...}}` OAuth shape, Zapier's "Other" connect option).

**The one thing to internalise:** Continue v2.0.0 does **not** expand `${VAR}` in
`mcpServers[].env` — only `${{ secrets.NAME }}`. And MCP stdio does not inherit your shell env.
So credentials must be **literal in config.yaml** or loaded by a **launcher's own `.env.local`**.
That is why `config.yaml` can never be committed, and why it is gitignored.

Secrets are **not** in this repo. Get them from the Windows machine out of band (1Password,
AirDrop, or typed). Never email, paste into Notion/Slack, or commit them.

## 7. Verification technique that actually works

Don't trust the UI's green dots. Run the raw MCP handshake against a launcher:

```bash
cd ~/.continue/.continue
printf '%s\n' \
 '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"probe","version":"1"}}}' \
 '{"jsonrpc":"2.0","method":"notifications/initialized"}' \
 '{"jsonrpc":"2.0","id":2,"method":"tools/list"}' \
 | node mcp-shopify-launcher.js
```

Real tool list = working. Instant exit or `MODULE_NOT_FOUND` = path problem, not credentials.
This single technique found nearly every root cause in this project's history.

Free read-only store data, no quota cost and no auth:
`https://premeftp.shop/products.json?limit=250`, `/collections.json`,
`/collections/<handle>/products.json`

## 8. DO NOT

- Do not add inventory-set or publish modules to the SNKRS scraper — it would sell goods that may
  not be owned, manufacturing refunds and chargebacks.
- Do not replay `5774991`'s parked DLQ execution.
- Do not reactivate `5901509` / `5900416` without checking the Airtable budget first.
- Do not upgrade the Airtable plan — the interval bug was the cause and is fixed.
- Do not run `git gc --prune=now` here — 20+ dangling commits hold real abandoned work.
- Do not commit `config.yaml` or any `.env.local`.
- Do not build order-fulfilment automation at 0.5 orders/month.
- Do not make irreversible or bulk changes to the live store without the owner's explicit OK.

---

## 9. MacBook Neo — the Mac is ALREADY FIXED. Do not follow the PC setup.

**Superseded 2026-09-24 by the Mac session.** Two things this file previously said were wrong;
both are corrected here.

### The Mac has its own working setup — use it

The MacBook Neo config was repaired and verified live (Continue parsed it with no schema errors
and is running an MCP server from it). It lives on:

- repo `premeftpllc/1`, branch **`claude/worker-1-kz0ycj`**, commit **`096404d`**
- folder **`config/continue/mcpServers/`** (secret-free blocks)
- guide **`docs/CONTINUE-MCP-ARCHITECTURE.md`**

**Do NOT clone `main` into `~/.continue` on the Mac**, and do NOT run
`cp config.mac.example.yaml config.yaml`. That would install Windows `C:/` paths and reference
`nvidia/nemotron-3-nano-4b`, which **is not installed on the Mac** (it has `google/gemma-4-e2b`
and `qwen3-4b-toolcalling-codex`, fixed at 131,072 context). `config.mac.example.yaml` is a
**PC-side reference only — not for the MacBook Neo.**

### CORRECTION: `${{ secrets.NAME }}` works locally, with no Hub login

Earlier versions of this file and `MACBOOK_NEO_SETUP.md` claimed `${{ secrets.NAME }}` requires a
hub.continue.dev login and that secrets therefore had to be literal in `config.yaml`. **That is
wrong.** Verified by reading the installed extension
(`.vscode/extensions/continue.continue-2.0.0-*/out/extension.js`, `LocalPlatformClient`):

```js
async findSecretInEnvFiles(fqsn) {
  const secretValue = this.findSecretInLocalEnvFile(fqsn)      // ~/.continue/.env
    ?? await this.findSecretInWorkspaceEnvFiles(fqsn, true)    // <ws>/.continue/.env
    ?? await this.findSecretInWorkspaceEnvFiles(fqsn, false);  // <ws>/.env
  ... secretType: SecretType.LocalEnv
```

So the correct pattern is `${{ secrets.NOTION_TOKEN }}` in `config.yaml` plus the value in
**`~/.continue/.env`**. `config.yaml` then holds **no secrets at all** and is safe to track.

Still true: plain `${VAR}` is never expanded (`TEMPLATE_VAR_REGEX = /\${{[\s]*([^}\s]+)[\s]*}}/g`
only matches the double-brace form), and the *launcher scripts* separately load their own
`.env.local` — a different mechanism from Continue's secret resolution.

### Mac packages that are verified working (by stdio handshake)

- `@notionhq/notion-mcp-server@2.5.2` — `NOTION_TOKEN` (24 tools)
- `airtable-mcp-server@1.14.0` — **`AIRTABLE_API_KEY`** (16 tools). `@airtable/mcp-cli` is a CLI, not a server.
- `slack-mcp-server@1.3.0 --transport stdio` — **`SLACK_MCP_XOXB_TOKEN`**, must be an `xoxb-` token.

Mac's remaining blocker is purely the three secret values in `~/.continue/.env`, then
`python3 scripts/workspace.py mcp --apply`.

### Why a blank Models/Tools tab still means "schema violation"

`config.mac.yaml` was deleted 2026-09-24 — it carried top-level `modelRoles:`/`settings:` blocks
(neither is a real field), invalid roles (`refactor`/`rewrite`/`explain`/`docs`), launcher paths
missing the nested `.continue/` segment, `~` inside `args`, and `SHOPIFY_SHOP_URL` instead of
`MYSHOPIFY_DOMAIN`. Continue fails schema validation **silently** and falls back to empty state,
so blank tabs almost always mean a malformed config, not a credential problem.

### TRAP: do not "fix" the launchers with `||` (verified 2026-09-24)

`config.yaml` contains **14 single-brace `${VAR}` entries**. Continue never expands these, so it
passes the **literal text** (e.g. `"${SHOPIFY_ACCESS_TOKEN}"`) into the spawned process env.

Three launchers - `mcp-shopify-launcher.js`, `mcp-calendar-launcher.js`, `mcp-drive-launcher.js` -
load `.env.local` and overwrite unconditionally:

```js
if (match) process.env[match[1].trim()] = match[2];   // unconditional
```

A tempting "fix" is `process.env[k] = process.env[k] || match[2]` so that `${{ secrets.X }}` would
win. **Do not apply that.** The literal string `"${SHOPIFY_ACCESS_TOKEN}"` is truthy, so the fix
would keep the garbage and never load the real credential - breaking Shopify, Calendar and Drive.

Any correct version must treat an unexpanded template as unset, e.g.:

```js
const k = match[1].trim(), cur = process.env[k];
if (!cur || /^\$\{\{?/.test(cur)) process.env[k] = match[2];
```

**Are the 14 dead entries harmful today? No - tested, not assumed.** The `??`-style launchers
(slack, gmail, airtable, zapier, notion, make) all read variable names that are *not* among the 14,
and the overwrite-style launchers clobber them regardless. Verified empirically: injecting
`SLACK_BOT_TOKEN='${SLACK_BOT_TOKEN}'` still yields a healthy 15-tool handshake, because that
launcher prefers `SLACK_USER_TOKEN`, which config.yaml does not set. So they are misleading, not
broken - leave them unless you are adopting `${{ secrets.X }}`, in which case remove them in the
same change as the launcher fix.

### Verified server health (raw stdio handshake, 2026-09-24)

9 of 10 healthy, ~353 tools: clock, web-search, make (150), notion (24), gmail (10),
google-calendar (13), **google-drive (128)**, shopify (14), slack (15).
The `airtable` stdio launcher is **orphaned by design** - config.yaml reaches Airtable over
`type: streamable-http`, so that launcher failing is expected, not a bug.
`google-drive` works perfectly over stdio but still times out *through Continue* - that remains the
one open connector issue, and it is a Continue-integration problem, not a server problem.

> When probing `slack`, `gmail` or `airtable`, run from the **VS Code workspace folder**. Those
> three resolve `.env.local` relative to CWD, so probing from `~/.continue/.continue/` reports a
> false failure.
