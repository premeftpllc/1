# START HERE — PremeOS / PremeFTP handoff

**Last verified: 2026-09-23 (Windows box, DESKTOP-0FKQG33). Setup sections updated 2026-09-26.**
> **Setting up or resuming on a Mac (MacBook Neo, Mac mini)?** Do [docs/NEW-MACHINE-SETUP.md](docs/NEW-MACHINE-SETUP.md)
> first, then come back here for the business context. There is one branch, `main`; the PC is the reference setup.

If you are an agent picking this up on another machine, read this file completely before acting.
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
| `config.yaml` | **Secret-free since 2026-09-24**: the 4 literals are now `${{ secrets.X }}` resolved from `~/.continue/.env` (generated by `scripts/sync-secrets.ps1` from SOPS). Pre-swap backup: `~/.continue-backups/2026-09-24/`. Since 2026-09-26 it is rendered per machine from `config/continue/config.template.yaml`. |
| Rules | Since 2026-09-26: single copy in the repo's `.continue/rules/` (workspace rules); `~/.continue/rules` stays empty. Earlier: Continue loads global AND workspace rule dirs without de-duplicating, so the identical workspace copy doubled every rule (~5,800 wasted tokens/request). Workspace copy moved to `~/.continue-backups/2026-09-24/workspace-rules`. |
| SOPS recipients | PC **and** Mac (`age1ejegjy9m...`). The Mac uses its own key; the PC private key never leaves the PC. Adding a machine = add its public key to `.sops.yaml`, then `sops updatekeys -y secrets/premeos.env`. |
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
3. **Apply SKUs.** Use `premeos-handoff/shopify-sku-import.csv` (101 unique SKUs, format
   `SEASON-TYPE-ITEM-COLOR-SIZE`). **Replaced 2026-09-24 with the Mac's corrected version**: it adds
   `Title` (Shopify requires Handle + Title when updating) and `Option2 Name/Value` for the two
   products that really have a second option (`supreme-arabic-logo-hooded-sweatshirt`,
   `supreme-apes-tee`, Size/Color). The first version omitted those, which risked wiping their
   Option2. SKUs are unchanged (verified identical on all 101 rows). **Export a product backup
   first**, then import with **"Overwrite any current products that have the same handle"** ticked.
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

See **[docs/NEW-MACHINE-SETUP.md](docs/NEW-MACHINE-SETUP.md)** (PC, MacBook Neo, Mac mini). Secrets reach
each machine only through `secrets/premeos.env` (SOPS + age) and `python3 scripts/workspace.py secrets`.
Never email them, paste them into Notion/Slack, print them, or commit them.

## 7. Verification technique that actually works

Don't trust the UI's green dots. Run the raw MCP handshake for every shared server (prints tool counts
only; secrets are masked): `node scripts/mcp-probe.mjs` (or `node scripts/mcp-probe.mjs slack`).
The underlying technique, for any single server:

```bash
cd ~/PremeOS/1/.continue
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
- Do not run `git gc --prune=now` in the archived PC repo (`.continue-backups/2026-09-26-repo-move`) — 20+ dangling commits hold real abandoned work.
- Do not commit `config.yaml` or any `.env.local`.
- Do not build order-fulfilment automation at 0.5 orders/month.
- Do not make irreversible or bulk changes to the live store without the owner's explicit OK.

---

## 9. Machines, branches and Continue setup (2026-09-26)

**One branch: `main`.** On 2026-09-26 the PC's `main` and the Mac's `claude/worker-1-kz0ycj`
(which had no common history after the 2026-09-22 rewrite) were merged into `main` (`c2a3835`).
Every machine tracks `main`; the old Mac branch is merged and should not get new commits.

**The PC is the reference setup.** The MacBook Neo and the Mac mini are set up from it with
**[docs/NEW-MACHINE-SETUP.md](docs/NEW-MACHINE-SETUP.md)** — follow that, not older Mac docs.

| Machine | Repo | State (2026-09-26) |
|---|---|---|
| PC (DESKTOP-0FKQG33) | `C:\Users\Administrator\PremeOS\1` | Done: 8/8 MCP servers pass the handshake; config rendered from the template. |
| MacBook Neo (8 GB) | `~/PremeOS/1` | Switch to `main` and rerun setup (its earlier Gemma/DuckDuckGo/time setup is replaced). Already a SOPS recipient. |
| Mac mini | `~/PremeOS/1` | New. Needs its own age key added to `.sops.yaml` by the PC or MacBook. |

What moved where: the repo no longer lives in `~/.continue` (PC archive:
`C:\Users\Administrator\.continue-backups\2026-09-26-repo-move`, including its local-only refs
and dangling commits). Rules are in `.continue/rules/`; MCP servers in `config/continue/mcpServers/`;
models in `config/continue/config.template.yaml`; all applied by `scripts/workspace.py`.
`${{ secrets.NAME }}` resolves from `~/.continue/.env` locally (verified in the Continue 2.0.0
extension code); plain `${VAR}` never does.

Handoff log: Notion → Preme Work Sessions → "2026-09-26 · Continue.dev (PC) · One main branch; PC is
the reference; Mac setup guide". Each Mac adds a "Reply from <machine>" section there when done.

## 10. Service findings (live calls, 2026-09-24)

The "9 of 10 healthy" figure above counted **handshakes** (tools/list). Real read-only calls tell a
different story for two of them:

| Server | Handshake | Real call | Fix (owner) |
|---|---|---|---|
| gmail | 10 tools | **fails**: "Gmail API has not been used in project 851326606267 before or it is disabled" | Enable Gmail API in GCP project **851326606267** |
| google-calendar | 13 tools | **fails**: same error for the Google Calendar API | Enable the Calendar API in the same project |
| zapier | ok | only **1 tool** (`get_configuration_url`): no actions are enabled | Enable actions in the Zapier MCP config |
| make | was 150 tools | now **42** | Fixed in `a77a0d5` |

- **The project NUMBER is authoritative.** The OAuth client id starts with `851326606267`.
  `GOOGLE_PROJECT_ID` in the synced secrets says `prem-330719`, which setup notes describe as a
  different, inaccessible account's project - treat that value as stale.
- **Google tokens:** calendar `tokens.json` written 2026-09-23, gmail `credentials.json` 2026-09-22,
  both with refresh tokens. If the OAuth consent screen is still in **Testing** mode, Google expires
  those refresh tokens 7 days after issue (around 2026-09-29/30).
- **Make bridge bug (fixed):** it read its filter from `join(__dirname, "..", "..", ".continue", ...)`,
  which after the folder consolidation points at a file that does not exist; the loader fails open,
  so Continue silently exposed all ~150 Make tools. The 42-tool subset still includes 13
  write-capable tools (e.g. scenarios_delete, scenarios_run) - an owner decision.
- **Zapier endpoint** is `https://mcp.zapier.com/api/v1/connect?token=...` - streamable HTTP with a
  session id, neither `/sse` nor `/mcp`.
