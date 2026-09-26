# Manual Work Tracker
**Last Updated:** 2026-09-24  
**Status:** Active — Compile all manual tasks requiring human action

---

## 🔴 MANUAL TASKS — Complete When Ready

### 1. Make.com Scenario 5774991 Restoration
**Status:** ⚠️ NEEDS VERIFICATION / LIKELY STALE  
**Priority:** HIGH  
**Time:** TBD (blocked on owner decision)  
**Finding (2026-09-24):**
- Scenario 5774991 is inactive at a 14400s interval (verified live)
- Previous import failures: Gemini 503, OpenAI 400 errors (not size-related)
- PC briefing (START_HERE.md) recommends: **do not replay the parked DLQ execution**
- Do not import anything until the owner decides on next steps

**Why:** Failed imports indicate a logic or configuration issue beyond size limits. DLQ execution contains the error context needed for diagnosis.

---

### 2. Continue MCP Secret Sync (Mac Setup)
**Status:** 🔴 BLOCKED  
**Priority:** MEDIUM  
**Time:** < 5 minutes (once PC adds Mac key)  
**Current Status (2026-09-24):**
- Mac has its own age key (public key: age1ejegjy9myh9sx6y9tkfw56ht266v0y5jee2a493ancrpzye3wa9szs9e07)
- Public key posted on Notion; it's safe
- **BLOCKED:** Waiting for PC to add Mac public key to `.sops.yaml` and run `sops updatekeys`, then push

**Instructions (once PC pushes):**
1. Run VS Code task **PremeOS: Sync MCP secrets**
   - Decrypts PC's encrypted file (origin/main secrets/premeos.env, 16 vars) into `~/.continue/.env`
   - Enables Notion, Airtable, Slack MCP servers
   - Never prints secret values; warns if Slack token isn't a real `xoxb-`
2. Run **Developer: Reload Window**
3. Toggle Agent mode in Continue and test: `@notion`, `@airtable`, `@slack`

**Why:** Secrets now come from PC's SOPS+age encrypted file. Mac syncs via a one-way decryption; no private key leaves the Mac. See docs/CONTINUE-MCP-ARCHITECTURE.md for details.

---

### 3. Airtable API Quota — Wait Until Reset
**Status:** ⏸️ BLOCKED  
**Priority:** HIGH (blocks Tier 2)  
**Timeline:** Resets 2026-10-01  
**Verified (2026-09-24):**
- Free plan: 1,000 API calls/workspace/month (~33/day)
- Shared quota: Make, Zapier, MCP, and repo scripts all count against the same limit
- Single metadata call returned HTTP 200 on 2026-09-24 — service operational
- Rules: never poll, never test against Airtable, batch writes 10/request max

**Instructions:**
1. Wait for 2026-10-01 (monthly quota reset)
2. Then execute Tier 2 Remediation (22.5 hours of DQ fixes)
3. **Completion:** Will be noted when quota resets

**Why:** Hit monthly API limit on 2026-09-21. Cannot proceed with Airtable queries until next month.

---

### 4. Enable macOS Firewall
**Status:** 🔴 PENDING  
**Priority:** HIGH  
**Time:** 1 minute  
**Instructions:**
1. Run in Terminal (needs admin password):
   ```bash
   sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate on
   ```
2. Verify: `/usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate` → `enabled`
3. **Completion:** Update this tracker to ✅

**Why:** Dev environment scan (2026-09-24) found the application firewall disabled.

---

### 5. macOS 26.7 + Command Line Tools Update
**Status:** 🔴 PENDING  
**Priority:** MEDIUM  
**Time:** ~30 minutes + restart  
**Instructions:**
1. System Settings → General → Software Update
2. Install **macOS Tahoe 26.7**, **Safari 27.0**, and the newer **Command Line Tools for Xcode 26.6**
3. Hold off on **macOS 27** until current Make/SNKRS work is stable
4. Verify: `brew doctor` no longer warns about Command Line Tools
5. **Completion:** Update this tracker to ✅

**Why:** Pending security/tooling updates found in 2026-09-24 scan.

---

### 6. Fix Invalid JSON — SCENARIO_5901509_MODULE_SPECIFICATIONS.json
**Status:** ✅ DONE  
**Completed:** 2026-09-24 (commit 096404d)
**Also completed:** Continue config repair (same commit)

**Why:** The "PremeOS: Validate JSON" VS Code task failed on this file — JSON strings can't contain literal newlines. Now fixed.

---

### 7. Repo `.env.local` Setup
**Status:** ⏸️ CONDITIONAL  
**Priority:** MEDIUM  
**Updated (2026-09-24):**
- **Continue MCP now supersedes this:** Continue reads `~/.continue/.env` (from SOPS+age sync), not repo `.env.local`
- **Keep `.env.local` only if** repo scripts (e.g., query-airtable-inventory.js) need credentials
- **Warning:** query-airtable-inventory.js burns Airtable quota — never use for tests

**Instructions (if needed):**
1. `cp .env.example .env.local` in `/Users/premeftpllc/PremeOS/1`
2. Fill in OpenRouter, Airtable, Make, Notion, Slack, Google values
3. Confirm it's ignored: `git check-ignore .env.local` (already covered by `.gitignore`)
4. **Completion:** Update this tracker to ✅

**Why:** Determine if repo scripts actually need `.env.local` or if they should use the Airtable MCP instead.

---

### 8. Verify Local AI Stack (LM Studio)
**Status:** ⏸️ ON HOLD  
**Priority:** LOW  
**Owner Decision Required:** Model selection (target: nvidia/nemotron-3-nano-4b, not yet installed)
**Current Status (2026-09-24):**
- LM Studio server was not running
- No model loaded
- Owner will switch Mac to nvidia/nemotron-3-nano-4b
- Setup blocked on owner's model choice and installation

**Why:** Health check fails (server not running). MacBook Neo has 8 GB RAM, so a 131K context with 4 parallel slots may be tight. Wait for owner to install the target model.

---

### 9. (Optional) Activate Xcode.app for Swift/iOS Work
**Status:** ⚪ OPTIONAL  
**Priority:** LOW  
**Time:** 2 minutes  
**Instructions:**
1. Only needed if building Swift/iOS/macOS apps:
   ```bash
   sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
   sudo xcodebuild -license accept
   ```
2. Verify: `xcodebuild -version` → Xcode 26.6
3. **Completion:** Update this tracker to ✅

**Why:** Xcode 26.6 is installed but inactive — `xcode-select` points at Command Line Tools, so `xcodebuild` fails.

---

## ✅ COMPLETED TASKS

| Task | Date | Status |
|------|------|--------|
| MacBook Neo Dev Environment Setup (brew tools, git defaults, zsh) | 2026-09-24 | ✅ DONE |
| Fix Invalid JSON (SCENARIO_5901509_MODULE_SPECIFICATIONS.json) + Continue config repair | 2026-09-24 | ✅ DONE |
| Continue MCP Architecture Setup | 2026-09-22 | ✅ DONE |
| Notion Task Archiving (6 tasks) | 2026-09-22 | ✅ DONE |
| Phase 2 Execution (DQ-NEW-01) | 2026-09-14 | ✅ DONE |
| Tier 1 Investigation | 2026-09-14 | ✅ DONE |

---

## 🔄 AUTONOMOUS WORK COMPLETED (2026-09-22)

### ✅ Gmail Deep Audit
**Status:** COMPLETE
**Findings:**
- **Recent Purchases/Reservations (7 results, last 14 days):**
  - USPS Shipment tracking (Shein order Sept 10-11): Multiple tracking updates, delivered to Beacon, NY 12508
  - Google One Pro subscription renewal notice (Sept 12)
  - Anthropic Claude Pro receipt (Sept 12): $21.60 monthly charge
  - StockX inventory notifications (Sept 17, Sept 22): Product availability updates
  - Shopify Balance transfer confirmation (Sept 9): $100.00 transfer from Balance account
  - Shopify support chats and marketplace listing updates (Sept 20-21, ongoing)

- **Financial Summary (Last 30 days):**
  - Claude Pro: $21.60 (Sept 12)
  - Shopify store billing: $47.51 (Sept 2)
  - Shopify Balance: +$100.00 transfer out (Sept 9), +$0.25 deposited (Sept 5), August statements available
  - Shopify Balance card: Activated and ready Aug 29
  - Multiple Shopify support conversations logged (Sept 9, 29, Aug 26-29)

- **Operational Status:**
  - Shopify store: Active, billing current, support responsive
  - Store apps: 1 app scheduled for removal on 2026-10-26 (deprecation notice)
  - Inventory on secondary marketplaces: StockX listings active and updated
  - Shipping: USPS partner active, delivery confirmed

**Why:** Search for recent orders, payments, shipments, supplier communications, inventory updates

### ⏸️ Make Scenario Health Check
**Status:** BLOCKED
**Blocker:** Awaiting owner decision on scenario audit scope and methodology
**Impact:** Cannot determine full scenario health status without decision
**Resolution:** Define scope and approve audit plan before proceeding
**Note (2026-09-24):** Verified that task 5774991 is inactive at 14400s interval; requires owner review before any actions

### ✅ Notion Workspace Sync
**Status:** OPERATIONAL
**Verified (2026-09-24):** Successful Notion reads/writes confirmed on "2026-09-24 · Continue.dev (Mac)" page and MCP Configuration pages
**Updates Applied:** Continue MCP architecture documented, secret sync procedures recorded
**Why:** Keep Notion 100% up to date with Phase 2 completion and system audit findings

---

## 📊 AUTONOMOUS WORK SUMMARY

| Task | Status | Impact | Notes |
|------|--------|--------|-------|
| Gmail operational audit | ✅ COMPLETE | All financial & shipping data retrieved | Comprehensive 30-day history captured |
| Make scenario audit | ⏸️ BLOCKED | Cannot assess scenario health | Awaiting owner decision on audit scope; 5774991 verified inactive |
| Notion checkpoint sync | ✅ OPERATIONAL | Notion stays 100% synced | Reads/writes verified 2026-09-24 |

---

## 📋 SYSTEM ACCESSIBILITY AUDIT (2026-09-22)

| System | Status | Operational? | Details |
|--------|--------|---------------|---------|
| Gmail | ✅ Connected | YES | Search/query functional; retrieved 20+ recent messages with operational data |
| Airtable | ⏸️ BLOCKED | NO | API quota exceeded; reset 2026-10-01; free plan 1,000 calls/month (~33/day) shared by Make, Zapier, MCP |
| Notion | ✅ Connected | YES | Reads/writes verified 2026-09-24; "2026-09-24 · Continue.dev (Mac)" and MCP Configuration pages synced |
| Make | ⏸️ BLOCKED | NO | Awaiting owner decision on scenario 5774991 audit scope (verified inactive at 14400s interval) |
| Shopify | ⏸️ BLOCKED | NO | OAuth expired; requires user re-authentication |

---

## 🔐 Security Queue (Owner)

**Status:** ⏸️ AWAITING OWNER ACTION  
**Priority:** HIGH (affects credential rotation cycle)  
**Timeline:** Complete after current Make/SNKRS work stabilizes  

### Rotation Required (Secrets expire after rotation; each machine re-syncs)

1. **Make MCP Token**
   - **Location:** Plaintext on Notion page "MCP Configuration Sync - Windows to Mac"; also in encrypted secrets file (origin/main secrets/premeos.env)
   - **Action:** Generate new token in Make; update Notion and PC's secrets file
   - **Sync:** PC re-encrypts; Mac and PC both run "PremeOS: Sync MCP secrets"

2. **Google/YouTube Data API Key**
   - **Current:** Hardcoded in Make scenario 5901110 modules 9 and 11
   - **Action:** Generate new key in GCP console; edit modules in Make UI (not via scenarios_update)
   - **Remove:** From Notion page "Worker 1 — PremeOS Deep Audit Final Report — 2026-08-22"
   - **Sync:** PC re-encrypts secrets/premeos.env; each machine re-syncs

3. **GCP Service Account Key**
   - **Current:** premeos@premeos.iam.gserviceaccount.com key found in dangling, never-pushed PC commit
   - **Action:** Revoke in GCP console (Keys & credentials)
   - **Verify:** Confirm key is not in use anywhere (completed audit 2026-08-22 found it dangling)

4. **Post-Rotation Sync**
   - **PC:** Re-encrypt secrets/premeos.env with SOPS (sops updatekeys not needed)
   - **Mac & PC:** Each runs VS Code task "PremeOS: Sync MCP secrets"
   - **Verify:** All MCP servers remain operational

---

## 📦 Store (Owner, Production)

**Status:** 🟡 IN PROGRESS  
**Priority:** HIGH (ranked in PC briefing START_HERE.md §5)  
**Owner Decision Required:** SNKRS scraper 6373383 final approval  

### SKUs → Listings → Store Pass → SNKRS Decision

**Order (from PC briefing):**
1. ✅ SKU Import (reports/2026-09-24-sku-import-check.md) — CSV readiness verified; header must include Option1 Name/Value or it deletes variant options
2. ⏳ eBay + Grailed Listings (listings/2026-09-24/README.md) — Generate listings from 88 buyable products (101 total, 101 variants, 0 SKU-enabled)
3. ⏳ 30-Minute Shopify Admin Pass — Duplicate seon.io app; fix tax-inclusive pricing; export orders
4. ⏳ Navigation/Footer Fixes — Store appearance polish
5. ⏳ SNKRS Scraper 6373383 — **Awaiting owner decision** (is scraper active? Continue? Pause?)

### Shopify Store Status (2026-09-24, VERIFIED)
- **Public feed:** premeftp.shop/products.json?limit=250 → 101 published products, 101 variants
- **Buyable:** 88 variants (all have inventory > 0)
- **SKU Status:** 0 variants have SKU
- **Order frequency:** 1 order in last 60 days (demand-constrained)
- **API calls:** Airtable quota shared; never poll store, never test against store

### False Claims Removed
- **NOT $2,368 lifetime revenue** (unknown; not verified)
- **NOT 44% refund rate** (unknown; not verified)
- **NOT Make scenario 6371060 active** (not verified in live audit)

---

## 🔄 AUTOMATED WORK — Ongoing

### Notion Updates (Real-Time)
- Task status tracking (ready once checkpoint page is located)
- Project documentation (ready for Phase 2 completion)
- Decision logging (ready for autonomous audit results)
- Workspace sync (blocked on valid page URL)

**Status:** Ready to proceed once user provides Notion workspace details

---

## 📊 BLOCKER STATUS

| Blocker | Impact | Resolution | Timeline |
|---------|--------|-----------|----------|
| Airtable API Quota | Tier 2 Remediation blocked | Wait for reset | 2026-10-01 |
| Make Scenario 5774991 Audit | Decision needed on import/skip | Owner decides; DLQ holds error context | User action |
| MCP Secret Sync (Mac) | Continue MCP inactive | PC adds Mac public key to .sops.yaml and pushes | PC action, then Mac task |

---

## 🎯 PRIORITY QUEUE (Next Steps)

1. **PC Agent Task** — Add Mac public key (age1ejegjy9myh9sx6y9tkfw56ht266v0y5jee2a493ancrpzye3wa9szs9e07) to .sops.yaml, run `sops updatekeys`, and push — BLOCKS Mac MCP sync
2. **Mac MCP Secret Sync** — Run task "PremeOS: Sync MCP secrets" once PC pushes (then reload VS Code)
3. **Store Work** — SKU import → eBay/Grailed listings → 30-min Shopify admin pass (per PC briefing §5)
4. **Security Rotations** — Make token, Google/YouTube key, GCP service account (after Make/SNKRS work stabilizes)
5. **Tier 2 Execution** — After 2026-10-01 (Airtable quota reset)

---

## Notes
- All manual tasks are reversible
- Automated work proceeds in parallel
- Notion stays 100% synced with execution state
- Will track completion of each manual item below
