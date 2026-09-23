# Scenario 5774991 Restoration Plan
**Status:** READY FOR EXECUTION  
**Date:** 2026-09-22  
**Scenario:** PremeOS — Intelligence — Opportunity Processing  
**Scenario ID:** 5774991  
**Root Cause:** API size limit (54KB) truncated blueprint on Aug 26 export

---

## Executive Summary

**Missing Modules:** 4 critical output modules (5, 31, 11, 16)  
**Impact:** Pipeline stalls after AI analysis; no opportunities created, no Discord alerts, no Airtable updates  
**Solution:** Re-import complete blueprint from `final-complete-blueprint.json`  
**Expected Timeline:** 15-30 minutes

---

## Module Status

### Expected Modules (7 total)

| ID | Module Type | Function | Status |
|:---:|---|---|:---:|
| **2** | airtable:TriggerWatchRecords | Watch AI Inbox for new inputs | ✓ Present |
| **26** | datastore:AddRecord | Create deduplication key in datastore | ✓ Present |
| **3** | openai-gpt-3:CreateCompletion | Analyze opportunity with AI | ✓ Present (fixed) |
| **5** | airtable:ActionCreateRecord | **Create AI Opportunity record** | ✗ MISSING |
| **31** | datastore:UpdateRecord | **Link opportunity to datastore** | ✗ MISSING |
| **11** | airtable:ActionUpdateRecords | **Update AI Inbox status** | ✗ MISSING |
| **16** | builtin:BasicRouter | **Route Discord alerts** | ✗ MISSING |

### Module Dependencies

```
Trigger (2)
  ↓
Dedup Check (26) → [IF EXISTS: 28-30 error path]
  ↓
AI Analysis (3) ← [REQUIRES FIX: numeric parameters]
  ↓
Create Opportunity (5) ← [MISSING]
  ↓
Update Datastore (31) ← [MISSING]
  ↓
Update Inbox (11) ← [MISSING]
  ↓
Route Alerts (16) → Discord channels (14, 17, 18) ← [MISSING]
```

---

## Restoration Method: Option A (Recommended)

### Using Make's Import Blueprint Feature

**Prerequisite Access:**
- Make.com account with admin access to Scenario 5774991
- Scenario currently in DRAFT or PAUSED state

**Steps:**

1. **Navigate to Scenario 5774991**
   - Go to Make.com → Scenarios
   - Open "PremeOS — Intelligence — Opportunity Processing"
   - Ensure scenario is PAUSED (not running)

2. **Access Blueprint Import**
   - Click the three-dot menu (⋮) → "Import Blueprint"
   - OR: Edit Scenario → Blueprint View → Import

3. **Paste Complete Blueprint**
   - Copy full content from: `/Users/premeftpllc/PremeOS/1/final-complete-blueprint.json`
   - Paste into Make blueprint import dialog
   - Click "Confirm" when prompted about app installation

4. **Verify Module Restoration**
   - Scenario should show all 7 modules in flow view
   - Check canvas for complete pipeline:
     - Trigger (2) → Dedup (26) → AI (3) → Create (5) → Update (31) → Status (11) → Router (16)
   - Verify no orphaned modules or broken connections

5. **Save & Activate**
   - Click "Save"
   - Allow 10 seconds for scenario compilation
   - Status should change to "READY"
   - Click "TURN ON" to activate

---

## Restoration Method: Option B (If Import Fails)

### Chunked Import via API

**Prepare chunks:**

```bash
# Split blueprint into smaller pieces to bypass size limits
# Script location: /Users/premeftpllc/PremeOS/1/split-blueprint.sh
```

**Upload chunks sequentially:**

1. Upload modules 2, 26, 3 (input/dedup/analysis pipeline)
2. Verify execution → then upload modules 5, 31 (opportunity creation)
3. Verify → then upload modules 11, 16 (output routing)

---

## Restoration Method: Option C (Manual Rebuild - Last Resort)

### If Options A & B fail, manually recreate each missing module:

#### Module 5: Create AI Opportunity
- **Type:** Airtable → Create a Record
- **Base:** PREMEOS (appMgSuE6O4sXyxzE)
- **Table:** Opportunities (tbl5Ae2A4L8SEOLoF)
- **Fields to map:**
  ```
  Product Name ← {{3.result.product_name}}
  Market ← {{3.result.market}}
  Estimated Cost ← {{3.result.estimated_cost}}
  Estimated Value ← {{3.result.estimated_value}}
  AI Score ← {{3.result.investment_score}}
  AI Recommendation ← {{3.result.recommendation}}
  Category ← {{3.result.category}}
  Notes ← {{3.result.reasoning}}
  Source URL ← {{2.URL}}
  ```

#### Module 31: Update Datastore
- **Type:** Data Store → Update a Record
- **Data Store:** My data store (129932)
- **Key:** `{{26.key}}`
- **Update Field:**
  ```
  Opportunity Record ID ← {{5.id}}
  ```

#### Module 11: Update AI Inbox Status
- **Type:** Airtable → Update a Record
- **Base:** PREMEOS (appMgSuE6O4sXyxzE)
- **Table:** AI Inbox (tblxl8ysG3kDjLcA9)
- **Record ID:** {{2.id}}
- **Fields to update:**
  ```
  AI Score ← {{3.result.investment_score}}
  Processing Status ← "Analyzed"
  ```

#### Module 16: Route Opportunity Alerts (BasicRouter)
- **Type:** Built-in → Basic Router
- **Routes:** 3 branches
  - **Route 1:** {{3.result.recommendation}} = "BUY" → Module 14 (Post to #ideas)
  - **Route 2:** {{3.result.investment_score}} >= 7 → Module 17 (Post to #drop-alerts)
  - **Route 3:** {{3.result.recommendation}} = "WATCH" → Module 18 (Post to #ai-research)

---

## Pre-Restoration Checklist

- [ ] Scenario 5774991 is PAUSED (not running)
- [ ] No new AI Inbox records are being processed (to avoid corruption)
- [ ] Connections verified:
  - [ ] Airtable (OAuth connection: user1pQgCjqPm3iR4u)
  - [ ] OpenAI (connection: Leonary's OpenAI)
  - [ ] Discord (connection: Make team1278341651986911253)
  - [ ] Data Store (ID: 129932)
- [ ] `final-complete-blueprint.json` is available and readable
- [ ] Backup of current (incomplete) scenario taken

---

## Post-Restoration Validation

### Step 1: Verify Module Presence
```
Check scenario canvas shows all 7 modules in flow:
2 → 26 → 3 → 5 → 31 → 11 → 16
```

### Step 2: Run Test Execution
Create a test AI Inbox record:
- **Title:** "TEST: Nike Jordan 1 Low OG SP Travis Scott"
- **URL:** "https://www.supremecommunity.com/next-drop/"
- **Input:** "BUY SIGNAL - Jordan 1 Low OG SP Travis Scott dropping Sept 23 @ 11am EDT. Historical resale value $400-600. Limited to 500 pairs globally."
- **Processing Status:** "New"

### Step 3: Monitor Execution
Watch Make scenario execution in real-time:
- Module 2: Triggers on new record
- Module 26: Creates dedup key
- Module 3: AI analysis runs (~5-10 seconds)
- Module 5: **Should create new Opportunity** ✓
- Module 31: **Should link opportunity to datastore** ✓
- Module 11: **Should mark AI Inbox as "Analyzed"** ✓
- Module 16: **Should route to Discord** ✓

### Step 4: Verify Outputs

**In Airtable "Opportunities" table:**
- New record created with analysis results
- Fields populated: Product Name, Market, AI Score, Recommendation, Category

**In Discord:**
- BUY signal → Post in #ideas or #drop-alerts channel
- Message includes: Product, Market, Score, Recommendation, Reasoning, URL

**In Make Data Store:**
- Opportunity key linked to newly created Airtable record ID

---

## Expected Test Results

**Success Criteria:**

| Component | Expected Result |
|---|---|
| **Opportunity created** | 1 new record in Opportunities table |
| **Discord alert posted** | Message in #ideas channel (BUY recommendation) |
| **AI Inbox updated** | Processing Status = "Analyzed" |
| **Datastore linked** | Opportunity Record ID populated |
| **No errors** | Scenario execution completes without errors |

**Timestamps:**
- Start: When test record created
- Complete: ~15-20 seconds
- All downstream systems updated: ~1 minute

---

## Rollback Plan (If Issues Occur)

If restoration causes failures:

1. **Pause Scenario** - Click "TURN OFF" immediately
2. **Restore Previous State** - Re-import last known working blueprint
3. **Contact Support** - Document error messages from execution logs

---

## Post-Validation Documentation

Once restoration is confirmed working:

1. **Update Notion** - "Week 1 Critical Path" with module restoration status
2. **Record Timestamp** - Time of successful restoration
3. **Document Method Used** - A, B, or C
4. **Archive Blueprint** - Save working blueprint copy

---

## File References

| File | Purpose | Size |
|---|---|---|
| `final-complete-blueprint.json` | Complete working blueprint (all 7 modules) | 54 KB |
| `scenario-repair-report.json` | Original Aug 26 repair analysis | 2.8 KB |
| `scenario-5774991-blueprint.json` | Original incomplete blueprint (backup) | 107 KB |

---

## Critical Notes

- **API Size Limit:** Do not export full blueprint to API directly (causes truncation)
- **Parameter Types:** Ensure OpenAI module uses numeric values (not strings)
- **Protected Boundaries:** Restoration does not affect:
  - Batch 3 (0 Orders - intentionally locked)
  - Inventory tracking (89 records, 50 Completed)
  - Shopify connections (no unauthorized writes)
- **Deduplication:** Module 26 maintains duplicate prevention (tested)

---

## Support Contacts

- **Make.com:** API/Scenario Support
- **Airtable:** PremeOS base admins
- **Discord:** Make team1278341651986911253 channel
- **Status:** P0 - Opportunity pipeline restoration

