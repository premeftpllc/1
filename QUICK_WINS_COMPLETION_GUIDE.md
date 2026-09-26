# Quick Wins Completion Guide
**Date:** 2026-09-15  
**Status:** 70% Complete - Follow guide below to finish

---

## Quick Win #1: Active Status (5 remaining minutes)

### Step 1: Bulk Update Active Items in Airtable (5 min)

**What's Done:**
✓ "Active Status" checkbox field created (ID: fld3xRPSTKGyCX7xo)
✓ 39 active inventory items identified

**What Needs to Be Done:**
Mark all 39 items with Active Status = true

**FASTEST METHOD - Airtable UI:**

1. Go to: https://airtable.com/app/appMgSuE6O4sXyxzE/tbla4c3FzE70sCP6B
   - Base: PREMEOS
   - Table: Inventory

2. Click the "Status" column header → "Filter"

3. Add filter: Status is empty/null
   (This will show 39 records)

4. Select all filtered records (checkbox at column header)

5. Click "Bulk edit" button

6. Find "Active Status" field

7. Check the checkbox for all selected records

8. Confirm and save

9. Clear filter to verify all records

**Expected Result:** 39 inventory items with Active Status = ✓ checked

---

## Quick Win #5: Archive Done Tasks (8 remaining minutes)

### Step 1: Add "archived" Property to Preme Tasks (1 min)

1. Go to: https://www.notion.so/fa41916eab6e4278888b86d8690daa20
   - Database: Preme Tasks

2. Click "+" (add property) at the end of the columns

3. Set up:
   - Name: `archived`
   - Type: Checkbox
   - Default: Unchecked

4. Create property

**Result:** New "archived" column appears in database

### Step 2: Archive Done Tasks (2 min)

1. In Preme Tasks database, view "Completed" view (shows Done tasks)

2. Identify ~6 Done tasks that are old/completed

3. For each task:
   - Click to open the task
   - Check the "archived" checkbox
   - Close

**Alternative - Bulk method (if Notion supports):**
- Select all 6 Done tasks
- Bulk check "archived" property

**Result:** 6 Done tasks have "archived" = ✓ checked

### Step 3: Create "Active Tasks" View (2 min)

1. Click "+" to add new view in Preme Tasks database

2. Create table view:
   - Name: `Active Tasks`
   - Filter: `Status != "Done" OR archived = false`
   - Sort: Priority ascending, Updated descending
   - **Set as default view** (optional, recommended)

3. Save view

### Step 4: Create "Archived Tasks" View (1 min)

1. Click "+" to add new view

2. Create table view:
   - Name: `Archived Tasks`
   - Filter: `archived = true`
   - Sort: Updated descending

3. Save view

### Step 5: Update Team (2 min)

- [ ] Notify team: "Active Tasks" is the new default view for daily work
- [ ] Explain: Archived tasks moved out of active view but still queryable
- [ ] Share: Historical views still available (All Tasks, Completed)

---

## Make.com Automation Update (15 minutes)

### IMPORTANT: Only do this AFTER completing Airtable update

**Location:** Make.com → PremeOS — Intelligence — Opportunity Processing

**Step 1: Access the Scenario (2 min)**
1. Log in to Make.com
2. Find scenario: "PremeOS — Intelligence — Opportunity Processing"
3. Click to open
4. Find module #16 "Route Opportunity Alerts"

**Step 2: Update Conditions (10 min)**
Replace all instances of:
```
{{inventory.Status == null}}
```

With:
```
{{inventory.'Active Status' == true}}
```

**Locations to update:**
- BUY branch condition
- WATCH branch condition  
- PASS branch condition
- Any other filters checking Status = null

**Step 3: Test (2 min)**
1. Create test opportunity
2. Make sure source inventory has Active Status = true
3. Run scenario manually
4. Verify opportunity processes correctly
5. Check Discord for test alert

**Step 4: Deploy (1 min)**
- Click "Save"
- Scenario is live

---

## Verification Checklist

### Quick Win #1 Verification
- [ ] Open Airtable Inventory table
- [ ] Filter by Status = empty → shows 39 items
- [ ] Verify "Active Status" column has ✓ for all 39 items
- [ ] Open Make.com automation
- [ ] Create test opportunity with active inventory
- [ ] Verify Discord alert fires
- [ ] Test WATCH and PASS routes also work

### Quick Win #5 Verification
- [ ] Open Notion Preme Tasks
- [ ] View "Completed" → verify 6 tasks have "archived" ✓
- [ ] View "Active Tasks" → should show ~10 tasks
- [ ] View "Archived Tasks" → should show 6 tasks
- [ ] Verify "All Tasks" still shows all 16 tasks
- [ ] Default view is set to "Active Tasks"

---

## Timeline to Completion

| Task | Duration | Cumulative |
|------|----------|-----------|
| Airtable bulk update | 5 min | 5 min |
| Notion "archived" property | 1 min | 6 min |
| Archive 6 Done tasks | 2 min | 8 min |
| Create Active Tasks view | 2 min | 10 min |
| Create Archived Tasks view | 1 min | 11 min |
| Update team | 2 min | 13 min |
| Make.com update | 15 min | 28 min |
| Testing & verification | 10 min | **38 min** |
| **TOTAL REMAINING** | - | **38 minutes** |

**Timeline:** Can be completed in 1 hour from now

---

## Rollback Instructions (If Needed)

### Rollback Quick Win #1

1. **Uncheck all items:**
   - Filter: Active Status = true (39 items)
   - Bulk edit: Uncheck Active Status
   - Verify all unchecked

2. **Revert Make.com automation:**
   - Version History → select pre-QW1 version
   - Deploy

3. **Delete field (optional):**
   - Right-click "Active Status" → Delete
   - Confirm

**Rollback time:** ~10 minutes

### Rollback Quick Win #5

1. **Delete "archived" property:**
   - Hover over "archived" column
   - Click → Delete
   - Confirm

2. **Delete new views:**
   - Right-click "Active Tasks" view → Delete
   - Right-click "Archived Tasks" view → Delete

3. **Reset default view:**
   - Set "All Tasks" as default

**Rollback time:** ~5 minutes

---

## Success Criteria

### Quick Win #1 Success
✓ Field created  
✓ Items identified  
**→ Update items** (5 min)  
**→ Update Make.com** (15 min)  
✓ Complete

### Quick Win #5 Success
✓ Schema analyzed  
**→ Add "archived" property** (1 min)  
**→ Archive 6 tasks** (2 min)  
**→ Create views** (3 min)  
**→ Update team** (2 min)  
✓ Complete

---

## Support & Questions

### If Airtable bulk edit doesn't work:
- Use API: Pass 39 record IDs with field fld3xRPSTKGyCX7xo = true
- Or do 5 records at a time manually

### If Notion views won't filter:
- Check filter syntax matches schema
- May need: `Status` instead of just the field reference

### If Make.com scenario breaks:
- Use version history to revert
- Fix conditions and test before deploying

---

**Status:** Ready for implementation  
**Estimated Completion:** 1 hour  
**Risk Level:** Very Low (fully reversible)

Good luck! 🚀
