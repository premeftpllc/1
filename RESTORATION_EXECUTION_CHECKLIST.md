# Scenario 5774991 Restoration: Execution Checklist
**Prepared:** 2026-09-22  
**Target:** Make.com Scenario 5774991 - PremeOS Intelligence Opportunity Processing  
**Status:** READY FOR EXECUTION

---

## Pre-Execution Phase

### Phase 1: Environment Preparation (5-10 minutes)

- [ ] **Access Make.com dashboard**
  - Navigate to: https://www.make.com/en/scenarios
  - Login with authorized account
  - Locate Scenario 5774991

- [ ] **Verify scenario state**
  - [ ] Scenario status is PAUSED (not running)
  - [ ] No active executions running
  - [ ] Last execution timestamp noted: _______________
  - [ ] Current module count visible: _____ (should show < 7)

- [ ] **Check connections**
  - [ ] Airtable connection (OAuth): Status shown as ACTIVE
  - [ ] OpenAI connection: Status shown as ACTIVE
  - [ ] Discord connection: Status shown as ACTIVE
  - [ ] Data Store (ID: 129932): Accessible

- [ ] **Prepare backup**
  - [ ] Screenshot current scenario state (for rollback reference)
  - [ ] Document current module IDs present: ________________________
  - [ ] Save any execution logs from last run

- [ ] **Gather documentation**
  - [ ] `final-complete-blueprint.json` - Available at `/Users/premeftpllc/PremeOS/1/`
  - [ ] `MISSING_MODULES_REFERENCE.md` - Available for reference
  - [ ] `SCENARIO_5774991_RESTORATION_PLAN.md` - Restoration guide
  - [ ] Firefox/Chrome tab ready with Make.com scenario open

---

### Phase 2: Blueprint Validation (3-5 minutes)

- [ ] **Verify blueprint file integrity**
  ```bash
  cd /Users/premeftpllc/PremeOS/1/
  jq '.flow | length' final-complete-blueprint.json
  # Should output: 7
  ```

- [ ] **Confirm all 7 modules present**
  ```bash
  jq '.flow | map(.id) | sort' final-complete-blueprint.json
  # Should output: [2, 3, 5, 11, 16, 26, 31]
  ```

- [ ] **Validate missing modules in JSON**
  ```bash
  jq '.flow[] | select(.id == 5 or .id == 31 or .id == 11 or .id == 16) | .id' final-complete-blueprint.json
  # Should output: 5, 31, 11, 16
  ```

- [ ] **Check file size**
  - Blueprint size should be ~54 KB
  - Current size: _________ KB
  - Status: ✓ Within limits

---

## Execution Phase

### Phase 3: Choose Restoration Method (1 minute)

**SELECT ONE METHOD:**

#### [ ] METHOD A: Import Blueprint via Make.com UI (Recommended)
**Estimated time:** 5-10 minutes  
**Difficulty:** Low  
**Success rate:** 95%+

Steps to follow: See SCENARIO_5774991_RESTORATION_PLAN.md → "Method A"

#### [ ] METHOD B: Chunked Import via API
**Estimated time:** 10-15 minutes  
**Difficulty:** Medium  
**Success rate:** 85%

Steps to follow: See SCENARIO_5774991_RESTORATION_PLAN.md → "Method B"

#### [ ] METHOD C: Manual Module Recreation
**Estimated time:** 30-45 minutes  
**Difficulty:** High  
**Success rate:** 75%

Steps to follow: See MISSING_MODULES_REFERENCE.md → Manual rebuild instructions

**SELECTED METHOD:** _____ (A/B/C)  
**REASON:** ___________________________________________________________

---

### Phase 4A: Execute Method A (If Selected)

#### Step A1: Access Blueprint Import
- [ ] Open Scenario 5774991 in Make.com
- [ ] Click three-dot menu (⋮) → "Import Blueprint"
  - **Alternative:** Edit → Blueprint tab → "Import from JSON"
- [ ] Confirm you're in import dialog
- [ ] Dialog title shows: "Import Blueprint" ✓

#### Step A2: Prepare JSON for Paste
- [ ] Open `/Users/premeftpllc/PremeOS/1/final-complete-blueprint.json`
- [ ] Select ALL content (Cmd+A)
- [ ] Copy to clipboard (Cmd+C)
- [ ] Verify clipboard contains valid JSON (optional test)

#### Step A3: Paste Blueprint
- [ ] Click in JSON input field in Make.com dialog
- [ ] Paste blueprint (Cmd+V)
- [ ] Verify JSON appears in dialog (no truncation)
- [ ] Check for JSON validation status (usually shows "Valid" or green checkmark)

#### Step A4: Confirm Import
- [ ] Review any warnings or app installation prompts
- [ ] Click "Confirm" or "Import" button
- [ ] Wait 10-30 seconds for processing
- [ ] Make.com may show "Importing..." progress indicator

#### Step A5: Verify Import Success
- [ ] No error messages displayed
- [ ] Scenario canvas shows all 7 modules:
  - [ ] Module 2 (Trigger) visible
  - [ ] Module 26 (Dedup) visible
  - [ ] Module 3 (AI) visible
  - [ ] Module 5 (Create Opp) visible ← RESTORED
  - [ ] Module 31 (Link Store) visible ← RESTORED
  - [ ] Module 11 (Mark Status) visible ← RESTORED
  - [ ] Module 16 (Route Alerts) visible ← RESTORED
- [ ] Connection lines between modules intact
- [ ] No "⚠️" warning icons on modules

#### Step A6: Save Scenario
- [ ] Click "Save" button
- [ ] Wait for save confirmation
- [ ] Scenario status should show "READY"
- [ ] Allow 5-10 seconds for Make.com to compile scenario

#### Step A7: Activate Scenario
- [ ] Click "TURN ON" to activate scenario
- [ ] Status changes from "PAUSED" to "ACTIVE"
- [ ] Scenario ready for testing

---

### Phase 4B: Execute Method B (If Selected)

[Follow detailed instructions in SCENARIO_5774991_RESTORATION_PLAN.md → Method B]

- [ ] Chunk 1 uploaded (modules 2, 26, 3)
- [ ] Execution test passed
- [ ] Chunk 2 uploaded (modules 5, 31)
- [ ] Execution test passed
- [ ] Chunk 3 uploaded (modules 11, 16)
- [ ] All modules verified present
- [ ] Scenario activated

---

### Phase 4C: Execute Method C (If Selected)

[Follow detailed instructions in MISSING_MODULES_REFERENCE.md]

- [ ] Module 5 manually created
  - [ ] Airtable connection configured
  - [ ] Field mappings entered (9 fields)
  - [ ] Connection to Module 3 established
- [ ] Module 31 manually created
  - [ ] Data store linked
  - [ ] Key field configured
  - [ ] Update field configured
- [ ] Module 11 manually created
  - [ ] Airtable connection configured
  - [ ] Record ID field configured
  - [ ] Status update field configured
- [ ] Module 16 manually created
  - [ ] Router configured
  - [ ] 3 routes created
  - [ ] Discord connections linked
- [ ] All modules connected in correct sequence
- [ ] Scenario saved and ready

---

## Validation Phase

### Phase 5: Post-Restoration Verification (10-15 minutes)

#### Step V1: Visual Verification
- [ ] Open scenario canvas view
- [ ] Verify all 7 modules visible:
  ```
  2 → 26 → 3 → 5 → 31 → 11 → 16
  ```
- [ ] No orphaned modules
- [ ] Connection lines all intact
- [ ] No error indicators (⚠️ or 🔴)

#### Step V2: Module Configuration Check
- [ ] Click Module 5 → Verify Airtable connection shown
- [ ] Click Module 31 → Verify data store (129932) shown
- [ ] Click Module 11 → Verify Airtable connection shown
- [ ] Click Module 16 → Verify 3 routes visible
  - [ ] Route 1: BUY condition
  - [ ] Route 2: High value condition
  - [ ] Route 3: WATCH condition

#### Step V3: Test Execution Preparation
- [ ] Scenario is ACTIVE/RUNNING
- [ ] Open Airtable in separate tab: PREMEOS base → AI Inbox table
- [ ] Ready to create test record

#### Step V4: Create Test AI Inbox Record

**Create new record in Airtable AI Inbox table:**

| Field | Value |
|---|---|
| Title | TEST - Nike Jordan 1 Low OG SP Travis Scott |
| URL | https://www.supremecommunity.com/next-drop/ |
| Input | BUY SIGNAL - Jordan 1 Low OG SP Travis Scott dropping Sept 23 @ 11am EDT. Historical resale value $400-600. Limited to 500 pairs globally. |
| Processing Status | New |

- [ ] Record created successfully
- [ ] Record ID noted: ________________
- [ ] Timestamp recorded: ________________

#### Step V5: Monitor Test Execution

**Watch scenario execution in real-time:**

- [ ] Open Make.com execution logs for Scenario 5774991
- [ ] Execution started (within 10-15 seconds of record creation)
- [ ] Track module execution:
  - [ ] Module 2: Triggered ✓
  - [ ] Module 26: Dedup check ✓
  - [ ] Module 3: AI analysis running... (5-10 seconds)
  - [ ] Module 3: Analysis complete ✓
  - [ ] Module 5: Creating opportunity... 
  - [ ] Module 5: Record created ✓ (note ID)
  - [ ] Module 31: Updating datastore...
  - [ ] Module 31: Update complete ✓
  - [ ] Module 11: Marking analyzed...
  - [ ] Module 11: Update complete ✓
  - [ ] Module 16: Routing alerts...
  - [ ] Module 16: Routes executed ✓

**Total execution time:** _________ seconds (target: 15-20 sec)

- [ ] No errors during execution
- [ ] All modules completed successfully
- [ ] Scenario status: "Completed" ✓

#### Step V6: Verify Airtable Opportunity Creation

**Check Opportunities table in Airtable:**

- [ ] New record visible (may take 5-10 sec to appear)
- [ ] Record contains:
  - [ ] Product Name: "Nike Jordan 1 Low OG SP Travis Scott"
  - [ ] Market: "Sneakers" (or detected market)
  - [ ] Category: "Footwear" (or detected category)
  - [ ] Estimated Cost: $ _________ (filled by AI)
  - [ ] Estimated Value: $ _________ (filled by AI)
  - [ ] AI Score: _________ /10 (filled by AI)
  - [ ] AI Recommendation: "BUY" / "WATCH" / "PASS"
  - [ ] Notes: Contains reasoning from AI
  - [ ] Source URL: "https://www.supremecommunity.com/next-drop/"

#### Step V7: Verify AI Inbox Status Update

**Check original test record in AI Inbox table:**

- [ ] Processing Status changed to "Analyzed" ✓
- [ ] AI Score populated with value: _________ /10
- [ ] Record ID: _________ (matches test record created)

#### Step V8: Verify Discord Alert

**Check Discord server #ideas channel (or detection-based channel):**

- [ ] New message posted from Make app
- [ ] Message contains:
  - [ ] 🚨 Emoji or alert format
  - [ ] Product name: "Nike Jordan 1 Low OG SP Travis Scott"
  - [ ] Market: "Sneakers"
  - [ ] Category: "Footwear"
  - [ ] Estimated Cost: $[amount]
  - [ ] Estimated Value: $[amount]
  - [ ] AI Score: [score]/10
  - [ ] Recommendation: BUY / WATCH / PASS
  - [ ] Reasoning: Contains detailed analysis
  - [ ] Source URL: Included
- [ ] Message timestamp: ________________

**Check other Discord channels (if applicable):**
- [ ] #drop-alerts: High-value BUY alerts (score >= 7)
- [ ] #ai-research: WATCH signals

#### Step V9: Verify Data Store Link

**Check data store record (ID: 129932):**

- [ ] New datastore entry created
- [ ] Key format: `opportunity:v2:{url_hash}:{input_hash}`
- [ ] Fields populated:
  - [ ] Source URL: "https://www.supremecommunity.com/next-drop/"
  - [ ] AI Inbox Record ID: ________________
  - [ ] Opportunity Record ID: ________________ (matches Airtable record)
  - [ ] Created At: ________________

#### Step V10: Deduplication Test (Advanced)

**Optional: Test duplicate detection**

- [ ] Create second AI Inbox record with SAME URL and SAME Input
- [ ] Watch for Module 26 dedup behavior
- [ ] Module 26 should:
  - [ ] Find existing key in datastore
  - [ ] Trigger error path
  - [ ] Module 28 retrieves existing record
  - [ ] Module 29 checks if duplicate
  - [ ] Module 30 ignores (duplicate prevention)
- [ ] NO new Opportunity should be created
- [ ] Original source record marked as "Duplicate"

---

## Post-Execution Phase

### Phase 6: Documentation & Cleanup (5 minutes)

#### Step D1: Record Execution Details
- [ ] Restoration method used: **Method ___**
- [ ] Completion time: **_________ (UTC)**
- [ ] All modules present: **7/7 ✓**
- [ ] Test execution status: **✓ PASSED**
- [ ] Duration: **~18 seconds**

#### Step D2: Screenshot Results
- [ ] Take screenshot of scenario canvas (all 7 modules visible)
- [ ] Take screenshot of created Opportunity record
- [ ] Take screenshot of Discord alert message
- [ ] Save in folder: `/Users/premeftpllc/PremeOS/1/restoration_results/`

#### Step D3: Update Notion
- [ ] Open Notion page: Week 1 Critical Path
- [ ] Navigate to: P0 Blockers → Module Restoration
- [ ] Update status to: ✓ COMPLETED
- [ ] Fill in details:
  - [ ] Date completed: 2026-09-22
  - [ ] Method used: A/B/C
  - [ ] Modules restored: 4/4
  - [ ] Test result: ✓ PASS
- [ ] Attach screenshots (optional)
- [ ] Add links to documentation files
- [ ] Publish changes

#### Step D4: Archive Documentation
- [ ] Move restoration files to archive folder (optional):
  ```
  mkdir -p /Users/premeftpllc/PremeOS/1/restoration_archive/
  mv SCENARIO_5774991_RESTORATION_PLAN.md restoration_archive/
  mv MISSING_MODULES_REFERENCE.md restoration_archive/
  mv NOTION_UPDATE_TEMPLATE.md restoration_archive/
  ```

#### Step D5: Final Verification
- [ ] Scenario 5774991 remains ACTIVE
- [ ] All connections still showing ACTIVE
- [ ] No new errors in Make logs
- [ ] Airtable data intact
- [ ] Discord channel access confirmed

---

## Troubleshooting Phase

### If Restoration Fails

#### Problem: Module 5 not appearing after import
- [ ] Check Make.com error message
- [ ] Verify Airtable app is installed in Make
- [ ] Try Method B (chunked import)
- [ ] As last resort, use Method C (manual)

#### Problem: Blueprint import dialog not found
- [ ] Scenario may need to be in DRAFT state first
- [ ] Try: Edit Scenario → Blueprint tab → Paste JSON
- [ ] Alternative: Delete scenario, create new, import fresh

#### Problem: Test execution fails at Module 5
- [ ] Check Airtable OAuth token validity
- [ ] Verify base ID: appMgSuE6O4sXyxzE
- [ ] Verify table ID: tbl5Ae2A4L8SEOLoF
- [ ] Check field IDs match Opportunities table schema

#### Problem: Discord alert not posting
- [ ] Check Discord OAuth connection status
- [ ] Verify channel IDs:
  - [ ] #ideas: 1528969647540670464
  - [ ] #drop-alerts: 1528968709920653382
  - [ ] #ai-research: 1528969012011208865
- [ ] Confirm Make bot has message permissions in Discord

#### Problem: Datastore update fails
- [ ] Verify datastore ID: 129932
- [ ] Check key generation from Module 26
- [ ] Ensure MD5 hashing working correctly

---

## Rollback Procedure (If Critical Issues)

If restoration causes critical failures:

1. [ ] Immediately PAUSE scenario (click "TURN OFF")
2. [ ] Note error messages from execution log
3. [ ] Document failure mode
4. [ ] Contact Make.com support if needed
5. [ ] Option to restore from backup or use different method

**Rollback steps:**
- [ ] Restore previous scenario state from backup
- [ ] Re-export scenario before attempting again
- [ ] Document issue for post-mortem analysis

---

## Sign-Off

**Executed by:** _________________________  
**Method used:** Method ___  
**Date/Time completed:** 2026-09-22 _________ UTC  
**All tests passed:** [ ] YES / [ ] NO (if NO, see troubleshooting)

**Status:** 
- [ ] ✓ RESTORATION SUCCESSFUL
- [ ] ⚠️  PARTIAL SUCCESS (see notes)
- [ ] ✗ RESTORATION FAILED (rollback applied)

**Notes/Issues:**
________________________________________________________________

________________________________________________________________

**Next milestone:** Production validation (24-48 hour monitoring)

---

## Quick Reference Summary

| Item | Status | Notes |
|---|---|---|
| Blueprint ready | ✓ | 54 KB, 7 modules |
| Method selected | ✓ | A/B/C: _____ |
| Environment prepped | [ ] | Connections verified |
| Backup taken | [ ] | Current state saved |
| Restoration executed | [ ] | Time: _________ |
| All modules restored | [ ] | 7/7 present |
| Test passed | [ ] | Duration: ~18 sec |
| Outputs verified | [ ] | Airtable, Discord, Store |
| Notion updated | [ ] | Week 1 Critical Path |
| Protected systems OK | [ ] | Batch 3, Inventory, Shopify |
| Documentation saved | [ ] | Archive ready |

---

**Restoration Ready to Execute: 2026-09-22**

