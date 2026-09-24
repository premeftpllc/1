# PremeOS / PremeFTP — Findings & Completion Log, 2026-09-23

Status: **Round complete.** All claims below were verified with live tool calls, then put
through an adversarial pass that refuted 10 of 29 candidate findings. Confidence is marked.
Nothing here is sourced from the repo's markdown status docs — several of those are wrong.

---

## 1. The headline

**The store is not broken. It is demand-constrained.**

88 buyable products, healthy checkout, working fraud screening and a live Meta pixel produced
**one order in 60 days** (#1027, 2026-09-05, $143.26). No amount of repricing, SKU hygiene or
automation repair changes that. **Nobody has ever measured sessions** — that is the single
biggest gap.

Cheapest real lever, given a free/organic-only constraint: list the existing stock where
Supreme buyers already are (eBay, Grailed — free to list), fulfil from the same inventory, and
use premeftp.shop as the brand hub. One weekend, $0 up front.

---

## 2. Changes made (all verified, all reversible)

| Change | Result |
|---|---|
| Make `5774991` interval 480s → 14400s | Idle Airtable load **540% of cap → 18%**. Still inactive. |
| Make `6299332` interval 300s → 21600s | Was 864% of cap. Still inactive; also `isinvalid: true` independently. |
| Make `6373383` SNKRS scraper **deactivated** | Had created 4 ACTIVE products that same day |
| Archived 4 SNKRS scraper products | Admin 101 ACTIVE + 4 ARCHIVED; **0 `$0` ACTIVE products remain** |
| `config.yaml` untracked + gitignored | Was one `git add -A` from pushing live tokens to GitHub |
| Regression check | Storefront **88 buyable — unchanged**, 0 zero-priced |

---

## 3. Root cause of the Airtable 429

Airtable Free = **1,000 API calls / workspace / month** (~33/day), shared by Make, Zapier, MCP
and scripts. Plus 100 automation runs/month.

Scenario `5774991` was polling **every 480s** while its own description said 14400s. With 4
Airtable modules that is **~21,600 calls/month against a 1,000 cap**. `6299332` was at 300s.

**1,000 calls/month cannot support any polling design.** Polling every 15 min is 288% of the
cap before doing real work. This was structural, not bad luck.

**Airtable has since recovered** — `list_bases` returns 200. The monthly quota reset.

### Quota architecture going forward
- **Airtable** = low-volume system of record only. Never poll it. Batch writes 10 records/request.
- **Google Sheets** = all high-volume work: logs, scraped candidates, run history, **and all
  test fixtures**. Free, 300 req/min, no daily cap.
- **Make** = webhook-triggered only (polling burns ops while idle). On the paid **Core** plan:
  **10,000 ops/month**, not the free 1,000.
- **Discord** = all status output. Free, already wired into `5774991` and `5901110`.

`preme-os/MAKE_AIRTABLE_LIMIT_BLUEPRINT.md` already designs this pattern correctly.

---

## 4. Claims in existing docs that are FALSE

Correcting the record — these are repeated across several status docs:

- **"1000+ SKUs"** → the catalog is **105 products**.
- **"Storefront is a wall of sold-out items"** → 88 of 101 variants are buyable. The `Sold out`
  strings in the HTML are hidden template badges.
- **"Shopify MCP will 401 on every call"** → it works fine and returns real data.
- **Make scenario `6371060` "Shopify Refunds Investigation"** → **does not exist**. Fabricated,
  along with its `https://.myshopify.com` bug.
- **"$2,368 lifetime revenue" / "44% refund rate"** → **not reproducible** from live data. The
  API returns 1 order because of the 60-day app-scope window, not data loss. The merchant Admin
  has all 27. Do not chase the `read_all_orders` scope for this.
- **`5774991` died from the Airtable quota** → **no**. Live execution history shows a Gemini
  `[503]` model-overload on 2026-09-06, and an earlier OpenAI `[400] 'messages' must contain the
  word 'json'`. Gemini is no longer in the blueprint, so that parked DLQ item is orphaned
  against an old version — **do not replay it**. The OpenAI json bug is already fixed.

---

## 5. Security

`~/.continue/config.yaml` was tracked in a git repo with a live GitHub remote and was **not**
gitignored — live Notion and Airtable tokens were one `git add -A` from being pushed.
Now gitignored and untracked. **Verified no secrets in any committed revision → near-miss, not
a breach, no rotation needed.**

Continue v2.0.0 cannot expand `${VAR}` in `mcpServers[].env` (only `${{ secrets.NAME }}`), and
the MCP stdio transport does not inherit the shell environment. Credentials must therefore be
literal in config.yaml or loaded by a launcher's own `.env.local` — so that file can never be
safely tracked.

### ACTION REQUIRED
A **real GCP service account key** (`premeos@premeos.iam.gserviceaccount.com`, project `premeos`)
was committed in a now-**dangling** commit. It is not on any branch, not in `main`'s ancestry,
and was **never pushed**. It is unused — the working Google auth is OAuth, not a service account.
**Recommend revoking that key in GCP anyway**, then `git gc --prune=now` to purge the object.

---

## 6. Open items

**Shopify Admin (UI-only, ~30 min):**
1. Both `seon.io` and `nofraud` load on every page; only NoFraud is in the order path. Read the
   real charges under Settings → Billing, keep NoFraud, uninstall the duplicate.
2. Check `Include tax in prices`. Order #1027 maths out as tax-inclusive — $135.00 + $8.26
   shipping = $143.26 with $11.68 (8.875%, exact NYC rate) carved *out*. Worth ~8.8% per order.
   Sample size is one, so confirm on the Taxes page.
3. Export real order + dispute history: Analytics → Finances summary (all time); Orders → Export
   CSV; Settings → Payments → Disputes for actual chargeback reason codes. **Before any traffic work.**

**Catalog:** 101 SKUs generated and ready to import (0 of 101 variants currently have one, which
blocks every product feed). Import file uses `Handle, Option1 Name, Option1 Value, Variant SKU` —
omitting the Option columns would have **deleted variant options on all 101 products**.

**Repricing:** 19 buyable items over $100, $3,468 combined listed value. Needs a browser to
confirm live StockX/GOAT asks (server-side fetch is 403-blocked).

**`6373383`:** confirmed these are drop *alerts*, not owned stock. Should post to Discord rather
than create Shopify products at all; if it must create them, DRAFT only, with an `msrp > 0`
filter and title dedupe.

**Pipelines:** `5774991` and `5901509` deliberately left OFF pending verification. `5774991` now
sits at 18% of the Airtable cap idle with no outstanding blueprint bug.
