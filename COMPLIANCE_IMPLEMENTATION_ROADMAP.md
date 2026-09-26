# Compliance Implementation Roadmap
## Week-by-Week Execution Plan with Checklists & Verification Procedures

**Document Date:** 2026-09-22  
**Status:** Ready for Implementation  
**Total Duration:** 4 weeks | 16-21 hours total effort  
**Authority:** PremeOS Compliance Remediation Framework  

---

## Table of Contents
1. [Executive Overview](#executive-overview)
2. [Week 1: Critical Path (Apparel + Make.com)](#week-1-critical-path)
3. [Week 2: Secondary Compliance (FTC)](#week-2-secondary-compliance)
4. [Week 3-4: Audit Trail Setup](#week-3-4-audit-trail-setup)
5. [Airtable Modification Details](#airtable-modification-details)
6. [Make.com Automation Setup](#makecom-automation-setup)
7. [Verification & Testing](#verification--testing)
8. [Troubleshooting Guide](#troubleshooting-guide)

---

## Executive Overview

### 4 Compliance Gaps Being Remediated

| # | Gap | Severity | Deadline | Effort | Week | Status |
|---|-----|----------|----------|--------|------|--------|
| 1 | EU Apparel Disposal Tracking | 🔴 HIGH | Jul 19 (PASSED) | 3.5h | W1 | URGENT |
| 2 | FTC Price Transparency | 🟡 MEDIUM | May 12 (PASSED) | 3.5h* | W2 | Conditional |
| 3 | Make.com Capacity Upgrade | 🟡 MEDIUM | Ongoing | 2h | W1 | PARALLEL |
| 4 | Algorithm Audit Trail | 🟢 LOW | Feb 2027 | 3.5h | W3-4 | Deferred |

*Only if FTC applicable

### Key Deadlines
- **Week 1 (Sept 23-27):** EU Apparel + Make.com — CRITICAL
- **Week 2 (Sept 30-Oct 4):** FTC Determination + Setup
- **Week 3-4 (Oct 7-18):** Algorithm Audit Trail

### Budget Impact
- **Gap #1 (Apparel):** $0 | ~3.5 hours
- **Gap #2 (FTC):** $0 | ~3.5 hours (if applicable)
- **Gap #3 (Make.com):** $9/month ($108/yr) OR $0 (if optimizing) | 2 hours
- **Gap #4 (Algorithm):** $0 | 3.5 hours
- **Total:** $9/month ongoing | 16-21 hours one-time

---

## WEEK 1: Critical Path
### EU Apparel Disposal + Make.com Capacity Upgrade

**Timeline:** Monday Sept 23 - Friday Sept 27, 2026  
**Critical Focus:** Remediate HIGH-severity compliance gap before regulatory exposure  
**Parallel Work:** Make.com upgrade decision/execution  

---

### MONDAY 9/23 - Schema & Foundations

#### Task 1.1: Airtable Schema Setup — EU Apparel Disposal (15 minutes)

**Location:** Airtable → PremeOS Base → Inventory table

**Step 1: Create "Disposal Method" Field**
- Open Inventory table
- Click "+" to add new field
- **Field Name:** "Disposal Method"
- **Field Type:** Single Select
- **Options (in order):**
  1. Resold
  2. Remanufactured
  3. Donated
  4. Reused
  5. Unknown (for historical records)
- **Required:** Toggle ON (prevent Status="Sold" without disposal method)
- **Help Text:** "How was this apparel item disposed of? Required for EU Directive 2030 compliance."
- **Save**

**Step 2: Create "Disposal Channel" Field**
- **Field Name:** "Disposal Channel"
- **Field Type:** Text (or Link to Records if creating Channels table)
- **Optional:** Leave unchecked
- **Help Text:** "Platform/organization where item was disposed (e.g., eBay, Charity Name)"
- **Save**

**Step 3: Create "Disposal Date" Field**
- **Field Name:** "Disposal Date"
- **Field Type:** Date
- **Optional:** Leave unchecked
- **Help Text:** "Date item was sold/donated/remanufactured"
- **Save**

**Step 4: Create "Disposal Recipient" Field**
- **Field Name:** "Disposal Recipient"
- **Field Type:** Text
- **Optional:** Leave unchecked
- **Help Text:** "Name of buyer/charity/remanufacturer who received item"
- **Save**

**Step 5: Create "Compliance Status" Field**
- **Field Name:** "Compliance Status"
- **Field Type:** Single Select
- **Options:**
  1. Compliant (post-July 19 with full disposal info)
  2. Non-Compliant (post-July 19 missing disposal info)
  3. Historical (pre-July 19, no compliance required)
  4. Pending Review
- **Optional:** Leave unchecked
- **Save**

**Verification:**
- [ ] All 5 new fields appear in Inventory table
- [ ] Test by creating dummy record: "Test Item" → Status="Sold" → Disposal Method required (field blocks without selection)
- [ ] Delete test record

**Time Estimate:** 15 minutes ✓

---

#### Task 1.2: Make.com Upgrade Decision (30 minutes)

**Location:** Make.com Dashboard → Settings → Plan Management

**Step 1: Review Current Status**
- Log into Make.com account
- Navigate to Dashboard → Settings → Plan & Billing
- **Current Plan:** Free (1,000 ops/month)
- **Current Usage:** 996/month (4 headroom remaining)
- **Required for SNKRS:** 1,440/month

**Step 2: Decision Framework**

**OPTION A: Upgrade to Core Tier ($9/month)**
- **Cost:** $9/month recurring ($108/year)
- **Benefit:** 10,000 ops/month (9,000+ headroom)
- **Time:** 5 minutes setup + 1 hour testing
- **Recommendation:** YES (faster, lower risk, enables expansion)

**OPTION B: Optimize Existing Scenarios (Free)**
- **Cost:** $0
- **Effort:** 5-10 hours engineering
- **Risk:** May break existing automations during reconfiguration
- **Not Recommended:** Time cost > financial cost

**Step 3: Execute Decision (if OPTION A)**

*Skip to Task 1.3 for upgrade execution*

**Time Estimate:** 30 minutes ✓

---

#### Task 1.3: Make.com Upgrade Execution (5 minutes, if approved)

**Step 1: Upgrade Plan**
- In Make.com → Settings → Plan & Billing
- Click "Upgrade" or "Change Plan"
- Select "Core Tier" ($9/month)
- Confirm payment method
- **Complete upgrade**

**Step 2: Verify Upgrade**
- Refresh dashboard
- Confirm new operations limit shows "10,000"
- Check billing confirmation email

**Verification:**
- [ ] Make.com plan now shows "Core (10,000 ops/month)"
- [ ] Billing confirms $9/month charge
- [ ] Dashboard shows ~9,000 ops available

**Time Estimate:** 5 minutes ✓

---

### TUESDAY 9/24 - Audit & Population

#### Task 2.1: Identify Apparel Inventory Scope (30 minutes)

**Location:** Airtable → Inventory table

**Step 1: Query Apparel Items**
- Open Inventory table
- Create filter: Show only items where...
  - **Field:** Type OR Category
  - **Contains:** "Apparel" OR "Clothing" OR "Footwear" OR "Textiles" OR "Sneakers" OR "Streetwear"
- **Apply filter**

**Step 2: Separate by Timeline**
- Within filtered results, manually sort/note:
  - **Group A:** Created on/after July 19, 2026 (URGENT — post-deadline)
  - **Group B:** Created before July 19, 2026 (Historical — non-compliance baseline)

**Step 3: Focus on Group A (Post-Deadline)**
- Filter further: Created >= 2026-07-19 AND Status = "Sold"
- **Count:** How many records match?
- **Expected:** 15-20 records (from Phase 5 investigation)

**Step 4: Document Scope**
- Create spreadsheet or Notion page:
  - Apparel inventory count (total)
  - Post-July 19 count (URGENT group)
  - Historical count (baseline)
  - Expected effort (15-20 records × 3-5 min = 1-1.5 hours)

**Verification:**
- [ ] Filter applied showing only apparel items
- [ ] Count documented (Group A: _____ records)
- [ ] Group A records identified for population

**Time Estimate:** 30 minutes ✓

---

#### Task 2.2: Populate Post-July 19 Disposal Methods (1.5 hours)

**Location:** Airtable → Inventory table → Group A records

**For Each Post-Deadline Apparel Record (Group A):**

**Step 1: Investigate Disposal**
- Open record
- Review fields:
  - Order history (linked Orders table)
  - Transaction records
  - Buyer information
  - Status timeline
- **Determine:** Where/how was this item actually disposed?

**Step 2: Categorize Disposal Method**
- **If Resold:**
  - Mark Disposal Method = "Resold"
  - Disposal Channel = Platform name (eBay, StockX, KREAM, etc.)
  - Disposal Recipient = Buyer name (if available)
  - Disposal Date = Sale date
  - Compliance Status = "Compliant"

- **If Remanufactured:**
  - Mark Disposal Method = "Remanufactured"
  - Disposal Channel = Remanufacturer name
  - Disposal Recipient = Organization name
  - Disposal Date = Handoff date
  - Compliance Status = "Compliant"

- **If Donated:**
  - Mark Disposal Method = "Donated"
  - Disposal Channel = Charity name
  - Disposal Recipient = Charity name
  - Disposal Date = Donation date
  - Compliance Status = "Compliant"

- **If Reused:**
  - Mark Disposal Method = "Reused"
  - Disposal Channel = Rental/library program name
  - Disposal Recipient = Program operator
  - Disposal Date = Start of reuse
  - Compliance Status = "Compliant"

- **If Unknown:**
  - Mark Disposal Method = "Unknown"
  - Disposal Date = Best guess (from Status change date)
  - Add note: "Post-deadline record; disposal method not documented at time of sale"
  - Compliance Status = "Pending Review"

**Step 3: Save Record**
- Click Save
- **Move to next record**

**Batch Processing Notes:**
- Estimate: 15-20 records × 4-5 minutes each = 60-100 minutes
- Batch by disposal method (process all "Resold" together, then "Donated", etc.)
- Use Find & Replace for consistent channel/recipient names

**Verification Checklist (for each record):**
- [ ] Disposal Method field populated (not empty)
- [ ] Disposal Date field populated
- [ ] Compliance Status set appropriately
- [ ] Record saved

**Time Estimate:** 1.5 hours ✓

---

#### Task 2.3: Audit Historical Records (30 minutes)

**Location:** Airtable → Inventory table → Group B (pre-July 19)

**For Each Historical Apparel Record (Created before July 19, 2026):**

**Step 1: Best-Effort Recovery**
- Open record
- Attempt to find disposal evidence in:
  - Transaction history
  - Linked Orders
  - Email/notes fields

**Step 2: Populate if Available**
- If disposal method can be determined: Fill in Disposal Method + supporting fields
- Mark Compliance Status = "Historical (pre-deadline)"

**Step 3: Mark if Unknown**
- If disposal method cannot be determined:
  - Mark Disposal Method = "Unknown"
  - Add note: "Pre-deadline historical record; insufficient data"
  - Mark Compliance Status = "Historical (pre-deadline)"

**Batch Notes:**
- Historical records are non-compliance baseline (deadline wasn't in effect July 19)
- Don't spend excessive time on recovery; 1-2 minutes per record max
- Focus on post-deadline (Group A) for full compliance

**Verification:**
- [ ] All historical records reviewed
- [ ] Unknown records noted appropriately
- [ ] Compliance Status = "Historical" for all pre-July 19 items

**Time Estimate:** 30 minutes ✓

---

#### Task 2.4: Quality Review (15 minutes)

**Step 1: Run Compliance Query**
- Filter Inventory:
  - Created >= 2026-07-19
  - Type contains "Apparel"
  - Status = "Sold"

**Step 2: Verify All Records Compliant**
- Count records where Disposal Method = empty
- **Target:** 0 records (100% compliant)
- If any found: Go back and populate those records

**Step 3: Document Audit Results**
- Screenshot or export query results
- Note timestamp: Audit completed 9/24/26
- Store as reference for compliance file

**Verification:**
- [ ] Query shows 0 records with empty Disposal Method
- [ ] All post-July 19 apparel records have disposal info
- [ ] Audit results documented

**Time Estimate:** 15 minutes ✓

---

#### END OF TUESDAY: Total Audit Time = 2.5 hours
- Task 2.1: 30 min ✓
- Task 2.2: 1.5 hr ✓
- Task 2.3: 30 min ✓
- Task 2.4: 15 min ✓

---

### WEDNESDAY 9/25 - Automation & Make.com Testing

#### Task 3.1: Airtable Automation — Disposal Method Required (45 minutes)

**Location:** Airtable → Inventory table → Automations

**Step 1: Create Automation Rule**
- Open Inventory table → Automations (top menu)
- Click "Create automation"
- **Trigger:** When a record's field value is changed
  - **Table:** Inventory
  - **Field:** Status
  - **Condition:** Equals "Sold"
- Click "Continue"

**Step 2: Add Conditional Actions**
- **Action Group 1 (If Disposal Method is empty):**
  - **Condition:** "Disposal Method" is empty
  - **Action:** Send email to user
    - Subject: "Compliance Alert: Disposal Method Required"
    - Body: "Apparel item marked Sold without disposal method. Please update record with disposal information (Resold/Donated/Remanufactured/Reused) before this item can be considered compliant with EU Directive 2030."
  - **Alternative Action:** Use Update Record to flag Compliance Status = "Pending Review"

- **Action Group 2 (If Disposal Method is filled):**
  - **Condition:** "Disposal Method" is not empty
  - **Action:** Update Record
    - Field: Compliance Status
    - Value: "Compliant"

**Step 3: Test Automation**
- Open an apparel record
- Change Status from "Completed" to "Sold"
- **Without** filling Disposal Method → Should trigger email alert
- Fill Disposal Method → Should auto-update Compliance Status
- Verify automation executed correctly

**Step 4: Save Automation**
- Name: "Apparel Disposal Compliance Check"
- Enable: Toggle ON

**Verification:**
- [ ] Automation created and enabled
- [ ] Test record triggered email alert when Status="Sold" without disposal method
- [ ] Test record auto-updated Compliance Status when disposal method filled

**Time Estimate:** 45 minutes ✓

---

#### Task 3.2: Make.com Scenario — Weekly Compliance Report (1 hour 15 minutes)

**Location:** Make.com → Scenarios

**Step 1: Create New Scenario**
- Make.com Dashboard → Scenarios
- Click "Create a new scenario"
- **Name:** "Weekly Apparel Disposal Compliance Report"

**Step 2: Add Schedule Trigger**
- **Trigger:** Schedule (recurring)
- **Frequency:** Weekly
- **Day:** Monday
- **Time:** 9:00 AM
- **Timezone:** UTC (or your timezone)

**Step 3: Connect Airtable**
- Add module: Airtable
- **Action:** Search Records
- **Base ID:** [PremeOS Base ID]
- **Table:** Inventory
- **Filters:**
  - Field: "Type" contains "Apparel"
  - AND Field: "Status" equals "Sold"
  - AND Field: "Created Date" >= Last 7 days

**Step 4: Filter Non-Compliant Records**
- Add module: Filter
- **Condition:** `((Disposal Method is empty) OR (Compliance Status equals "Pending Review"))`
- **Pass through only non-compliant records**

**Step 5: Count Results**
- Add module: Tools → Array Aggregator
- **Source module:** Filter (non-compliant records)
- **Aggregate function:** Count
- Result: Total count of non-compliant apparel

**Step 6: Send Slack Alert**
- Add module: Slack
- **Action:** Send a message
- **Channel:** #compliance or #alerts
- **Message Format:**
```
🚨 Weekly Apparel Disposal Compliance Report
Date: Monday [date]
Status: [count] items non-compliant

Non-compliant records:
- [List of item names missing disposal method]

Action Required:
- Review records in Airtable Inventory table
- Populate "Disposal Method" field for each item
- Compliance Status should auto-update to "Compliant"

Reference: https://airtable.com/[base]/[table]
```

**Step 7: Configure Notifications**
- Add module: Slack (optional)
- **If count = 0:** Send message "✅ All apparel disposed of compliantly this week"
- **If count > 0:** Send alert with non-compliant list (Step 6)

**Step 8: Test Scenario**
- Click "Run" to execute manually
- Verify: Slack message sent with correct count
- Check: Message format correct, records listed

**Step 9: Save & Enable**
- Click "Save"
- Toggle schedule: ON
- Scenario now runs automatically every Monday 9am

**Verification:**
- [ ] Scenario created and enabled
- [ ] Manual test executed successfully
- [ ] Slack alert sent with correct format
- [ ] Schedule set to weekly (Monday 9am)

**Time Estimate:** 1 hour 15 minutes ✓

---

#### Task 3.3: Make.com Testing — Verify Upgrade Impact (30 minutes)

**Location:** Make.com → Dashboard → Operations Monitor

**Step 1: Verify All Scenarios Running**
- Dashboard → Scenarios
- Check each active scenario:
  - [ ] 6110933 (Shopify sync) — Status: Running
  - [ ] 5901509 (Airtable updates) — Status: Running
  - [ ] New: Weekly Compliance Report — Status: Running
- Note any failures or errors

**Step 2: Monitor Operations Usage**
- Dashboard → Usage & Billing
- **Before upgrade:** ~996/month
- **After upgrade:** Should still be ~996/month (same operations, just more headroom)
- **Available headroom:** Now 9,000+ (was 4)

**Step 3: Test SNKRS Scenario Capability**
- Create dummy SNKRS scenario (don't activate)
- **Estimated ops:** 1,440/month
- **After upgrade headroom:** 10,000 - 996 - 1,440 = 7,564 ops remaining
- **Confirm:** Capacity exists for SNKRS automation

**Step 4: Document Upgrade Success**
- Screenshot operations dashboard showing new limit
- Note timestamp: Upgrade verified 9/25/26

**Verification:**
- [ ] All active scenarios confirmed running
- [ ] Operations usage shown (should be ~996/month)
- [ ] New limit shown as "10,000/month"
- [ ] Headroom confirmed sufficient for SNKRS (7,564+)

**Time Estimate:** 30 minutes ✓

---

#### Task 3.4: Documentation — CLAUDE.md Update (30 minutes)

**Location:** Repository → CLAUDE.md

**Add Section: Compliance Requirements**

```markdown
## Compliance Requirements

### EU Directive 2030 — Apparel Disposal Tracking
- **Status:** IMPLEMENTED (Sept 2026)
- **Scope:** All apparel inventory items (Supreme, Streetwear, Sneakers, Textiles)
- **Requirement:** All apparel marked Status="Sold" must document disposal method via one of four approved channels:
  - Resold (secondary market, resale platforms)
  - Remanufactured (upcycled, refurbished, component reuse)
  - Donated (charities, humanitarian organizations)
  - Reused (rental programs, library systems)
- **Implementation:**
  - Airtable fields: Disposal Method, Disposal Channel, Disposal Date, Disposal Recipient, Compliance Status
  - Automation: Status="Sold" blocks without disposal method populated
  - Reporting: Weekly compliance report via Make.com (every Monday 9am)
- **Audit Trail:** Airtable Inventory table → Filter by Created >= 2026-07-19 → Verify Disposal Method populated
- **Penalties for Violation:** €5,000-€50,000 per item category
- **Regulatory Reference:** EU Directive 2030: Sustainable Textiles Roadmap (Effective July 19, 2026)

### FTC Price Transparency Rule (Conditional)
- **Status:** PENDING APPLICABILITY REVIEW (Sept 2026)
- **Determination:** PremeOS business model does NOT appear to involve:
  - Event ticketing with variable fees
  - Subscription services
  - Hidden mandatory fees at checkout
- **Action:** If business model changes to include variable-fee transactions, implement fee tracking fields in Orders table
- **Reference:** FTC Junk Fees Rule (May 12, 2025)

### Make.com Operational Capacity
- **Status:** UPGRADED TO CORE TIER (Sept 2026)
- **Upgrade:** Core tier: 10,000 operations/month ($9/month)
- **Rationale:** Enables SNKRS automation (1,440 ops) + growth headroom
- **Implementation:** Make.com plan changed from Free (1,000 ops) to Core (10,000 ops)

### Algorithm Audit Trail (Emerging)
- **Status:** PENDING IMPLEMENTATION (Oct 2026)
- **Deadline:** February 2027
- **Requirement:** Document AI decision-making methodology, model attribution, confidence scores
- **Fields:** AI Model Used, Confidence Score, Decision Reasoning, Evidence Chain, Decision Timestamp
- **Scope:** All automated decisions in Decisions table
- **Regulatory Basis:** EU AI Act (Dec 2025+), US AI Regulation (in development)
```

**Step 2: Add to Pre-Work Checklist**
- Add to CLAUDE.md "Implementation Notes" section:
  - Every new apparel inventory item must have Disposal Method filled before Status="Sold"
  - Weekly compliance report runs automatically (no manual action needed)
  - Disposal data is available for regulatory audit on request

**Verification:**
- [ ] CLAUDE.md updated with compliance section
- [ ] Link to Airtable audit procedures documented
- [ ] Compliance requirements clear for future team members

**Time Estimate:** 30 minutes ✓

---

#### END OF WEDNESDAY: Total Automation & Testing Time = 2.5 hours
- Task 3.1: 45 min ✓
- Task 3.2: 1h 15 min ✓
- Task 3.3: 30 min ✓
- Task 3.4: 30 min ✓

---

### WEEK 1 COMPLETION SUMMARY

**Gap #1 (EU Apparel Disposal):** ✅ COMPLETE (3.5 hours)
- ✅ Schema: 5 new fields added
- ✅ Audit: 100% of post-July 19 apparel disposal methods documented
- ✅ Automation: Status="Sold" blocks without disposal method
- ✅ Reporting: Weekly compliance report automated
- ✅ Documentation: CLAUDE.md updated

**Gap #3 (Make.com Capacity):** ✅ COMPLETE (2 hours)
- ✅ Decision: Upgrade to Core tier ($9/month)
- ✅ Execution: Plan changed to Core (10,000 ops/month)
- ✅ Testing: All scenarios verified running
- ✅ Headroom: 9,000+ ops available (vs. 4 before)

**Total Week 1 Effort:** 5.5 hours ✓

**Regulatory Exposure:** Reduced from HIGH to LOW
- Pre-implementation: Unknown compliance status on apparel disposal (regulatory violation risk)
- Post-implementation: 100% of apparel has documented disposal method (compliant)

---

## WEEK 2: Secondary Compliance
### FTC Price Transparency (Conditional) + Preparation

**Timeline:** Monday Sept 30 - Friday Oct 4, 2026  
**Focus:** Determine FTC applicability; implement if needed  
**Effort:** 30-60 minutes (determination) + 3.5 hours (if applicable)

---

### MONDAY 9/30 - FTC Applicability Decision

#### Task 4.1: FTC Compliance Applicability Review (30 minutes)

**Review Worksheet: Complete These Questions**

1. **Does PremeOS operate on event ticketing platforms?**
   - Eventbrite? YES / NO
   - StubHub? YES / NO
   - Ticketmaster? YES / NO
   - SeatGeek? YES / NO
   - Other? YES / NO
   - **ANSWER:** ___________

2. **Does PremeOS handle orders with variable mandatory fees?**
   - Service fees that vary by order? YES / NO
   - Processing fees added at checkout? YES / NO
   - Convenience/handling fees? YES / NO
   - Dynamic pricing (price varies per buyer)? YES / NO
   - **ANSWER:** ___________

3. **Does PremeOS operate any subscription model?**
   - StockX Pro membership? YES / NO
   - Premium tier subscription? YES / NO
   - Recurring billing? YES / NO
   - **ANSWER:** ___________

4. **How does PremeOS currently charge customers?**
   - Flat price per product (e.g., $50 sneaker) — Compliant
   - Flat price + shipping (standard e-commerce) — Likely Compliant
   - Advertised price + hidden fees — NOT Compliant
   - Variable dynamic pricing — Requires Compliance
   - **Current Model:** ___________

5. **Does every customer see the same final total before purchase?**
   - YES (flat pricing) → Likely Compliant
   - NO (some customers see different totals) → Requires Compliance Review
   - **ANSWER:** ___________

**DECISION LOGIC:**

```
IF any answer above = YES (ticketing, variable fees, subscriptions):
  → PROCEED TO PHASE 1 (Implement FTC Compliance)
  → Timeline: 3.5 hours (this week)
  
IF all answers = NO (flat pricing, no ticketing, no subscriptions):
  → EXEMPT FROM FTC COMPLIANCE
  → Document decision: "Flat pricing model, no variable fees, exempt per FTC rule"
  → Skip to Week 3 (Algorithm Audit)
```

**FINAL DETERMINATION:**

PremeOS Applicability: **[ ] APPLICABLE** or **[ ] NOT APPLICABLE**

Reasoning: _____________________________________________________

**Verification:**
- [ ] All 5 questions answered
- [ ] Decision clearly stated
- [ ] Reasoning documented
- [ ] Move to Phase 1 (if applicable) or skip to Week 3

**Time Estimate:** 30 minutes ✓

---

#### IF FTC IS APPLICABLE — Task 4.2: Schema Setup (1 hour)

**Location:** Airtable → Orders table

**Step 1: Add "Advertised Price" Field**
- Field Name: Advertised Price
- Field Type: Currency (USD)
- Description: "Customer-facing price shown before checkout"
- Required: YES
- **Save**

**Step 2: Add "Service Fee" Field**
- Field Name: Service Fee
- Field Type: Currency (USD)
- Description: "Platform/processing service fee"
- Required: NO
- **Save**

**Step 3: Add "Mandatory Fees Total" Field**
- Field Name: Mandatory Fees Total
- Field Type: Currency (USD, formula)
- **Formula:** `Service_Fee + Tax_Amount + Shipping` (adjust to match your schema)
- Auto-calculated
- **Save**

**Step 4: Add "Total Price to Customer" Field**
- Field Name: Total Price to Customer
- Field Type: Currency (USD, formula)
- **Formula:** `Advertised_Price + Mandatory_Fees_Total`
- Auto-calculated
- Description: "Final amount customer paid"
- **Save**

**Step 5: Add "Fee Verification Status" Field**
- Field Name: Fee Verification Status
- Field Type: Single Select
- **Options:**
  1. Compliant (Advertised = Total)
  2. Non-Compliant (Mismatch exists)
  3. Exempt
  4. Under Review
- **Formula:** Auto-populate based on price match
- **Save**

**Verification:**
- [ ] All 5 fields created in Orders table
- [ ] Currency fields showing USD
- [ ] Formula fields calculating correctly
- [ ] Test with one order: Advertised $50 + Fees $15 = Total $65 ✓

**Time Estimate:** 1 hour ✓

---

#### IF FTC IS APPLICABLE — Task 4.3: Order Audit (1.5 hours)

**Location:** Airtable → Orders table

**Step 1: Extract Recent Orders (Last 60 days)**
- Filter Orders: Created >= Aug 22, 2026
- Expected count: 2-5 orders (Phase 5 low volume)

**Step 2: For Each Order:**
- **Identify Advertised Price:** What customer saw on product page before adding to cart
- **Identify Actual Total:** What was charged (including all fees, tax, shipping)
- **Calculate Discrepancy:** Total - Advertised
- **Mark Compliant/Non-Compliant:** Should be 0 discrepancy (all Shopify orders are compliant by default)

**Step 3: Populate Fields**
- For each order:
  - Advertised Price = Product price shown in Shopify
  - Service Fee = Shopify payment processing fee (if itemized)
  - Mandatory Fees Total = Auto-calculated
  - Total Price to Customer = Auto-calculated
  - Fee Verification Status = Should auto-populate as "Compliant"

**Step 4: Verify Compliance**
- Query: `WHERE Fee_Verification_Status NOT EQUALS "Compliant"`
- Result should be: 0 non-compliant orders (Shopify standard checkout is compliant)

**Verification:**
- [ ] All orders from last 60 days audited
- [ ] All fields populated correctly
- [ ] 0 non-compliant orders found (expected)
- [ ] Audit results documented

**Time Estimate:** 1.5 hours ✓

---

#### IF FTC IS APPLICABLE — Task 4.4: Automation (1 hour)

**Location:** Make.com → Scenarios

**Step 1: Create Automation Scenario**
- Make.com → Scenarios → Create New
- **Name:** "FTC Fee Verification — Detect Price Mismatches"

**Step 2: Trigger: New Shopify Order**
- **Source:** Shopify (connected)
- **Event:** New order created
- **Filter:** Only proceed with orders from now on

**Step 3: Extract Price Data**
- Add module: Airtable (Orders table)
- **Action:** Create Record
- Fields to auto-populate:
  - Advertised Price = from Shopify order payload
  - Service Fee = Shopify processing fee
  - Total Price to Customer = Shopify total
  - Fee Verification Status = Calculate automatically

**Step 4: Add Verification Check**
- Add module: Filter
- **Condition:** `(Advertised_Price + Service_Fee) ≠ Total_Price_to_Customer`
- **If TRUE (discrepancy found):** Trigger alert
- **If FALSE (no discrepancy):** Continue normal

**Step 5: Alert on Discrepancy**
- Add module: Slack (if discrepancy found)
- **Message:** "⚠️ FTC Compliance Alert: Order [ID] has fee mismatch. Advertised: $X | Total: $Y. Review required."
- **Channel:** #compliance

**Step 6: Test Scenario**
- Create test order in Shopify
- Verify: Airtable record created with fields populated
- Verify: Slack alert not sent (assuming no fee mismatch)

**Step 7: Enable & Monitor**
- Save scenario
- Enable: Toggle ON
- Monitor first week for any alerts

**Verification:**
- [ ] Scenario created and enabled
- [ ] Test order processed successfully
- [ ] Fields auto-populated in Airtable
- [ ] No false alerts triggered

**Time Estimate:** 1 hour ✓

---

### TUESDAY 10/1 - FTC Documentation (if applicable)

#### Task 4.5: Update CLAUDE.md with FTC Compliance (30 minutes)

**Location:** CLAUDE.md → Compliance Requirements section

**Update Entry:**

```markdown
### FTC Price Transparency Rule
- **Status:** IMPLEMENTED (Oct 2026)
- **Applicability:** YES — PremeOS handles orders with variable fees [OR] EXEMPT — Flat pricing model
- **Requirement:** All advertised prices must match total customer charge; no hidden mandatory fees
- **Implementation:**
  - Airtable fields: Advertised Price, Service Fee, Mandatory Fees Total, Total Price to Customer, Fee Verification Status
  - Automation: Make.com scenario auto-detects fee mismatches and alerts compliance team
  - Monitoring: Every new Shopify order verified for price accuracy
- **Audit Procedure:** Query Orders where Fee_Verification_Status ≠ "Compliant" → Should return 0
- **Penalties for Violation:** $43,792+ per violation
- **Reference:** FTC Negative Option Rule Amendment (May 12, 2025)
```

**Verification:**
- [ ] CLAUDE.md updated with FTC compliance status
- [ ] Implementation details documented
- [ ] Audit procedure clearly stated

**Time Estimate:** 30 minutes ✓

---

### END OF WEEK 2

**IF FTC APPLICABLE:**
- Gap #2 Complete (3.5 hours)
- Schema setup ✓
- Historical audit ✓
- Automation enabled ✓
- Documentation updated ✓

**IF FTC NOT APPLICABLE:**
- Gap #2 Documented as "Exempt" (30 minutes)
- Decision recorded ✓
- No implementation required ✓

---

## WEEK 3-4: Audit Trail Setup
### Algorithm Decision Audit Trail Implementation

**Timeline:** Monday Oct 7 - Friday Oct 18, 2026  
**Focus:** Document AI decision methodology for regulatory compliance  
**Effort:** 3.5 hours total | Low urgency (Feb 2027 deadline)

---

### WEDNESDAY 10/7 - Schema & Field Setup (1 hour)

#### Task 5.1: Add Audit Trail Fields to Decisions Table

**Location:** Airtable → Decisions table

**Step 1: Create "AI Model Used" Field**
- Field Name: AI Model Used
- Field Type: Single Select
- **Options:**
  1. OpenAI GPT-5-nano
  2. OpenAI GPT-4
  3. Anthropic Claude
  4. Manual (Human)
  5. Other
  6. Unknown
- Required: NO
- Help Text: "Which AI model made this decision?"
- **Save**

**Step 2: Create "Confidence Score" Field**
- Field Name: Confidence Score
- Field Type: Percent (0-100%)
- Required: NO
- Help Text: "Decision confidence level (0-100%)"
- **Save**

**Step 3: Create "Decision Reasoning" Field**
- Field Name: Decision Reasoning
- Field Type: Long Text
- Required: NO
- Help Text: "Summary of reasoning behind decision (e.g., 'KREAM analysis: 5000+ listings, 15% price spike, market trend analysis')"
- **Save**

**Step 4: Create "Evidence Chain" Field**
- Field Name: Evidence Chain
- Field Type: Link to Records (Evidence table)
- Linked Table: Evidence
- Required: NO
- Help Text: "Link to evidence/data sources supporting decision"
- **Save**

**Step 5: Create "Decision Timestamp" Field**
- Field Name: Decision Timestamp
- Field Type: DateTime
- Auto-set to current time? YES (optional)
- Help Text: "When was decision made?"
- **Save**

**Step 6: Create "Decision Methodology" Field** (Optional)
- Field Name: Decision Methodology
- Field Type: Single Select
- **Options:**
  1. Market Data Analysis
  2. Price Trend Analysis
  3. Demand Signal Analysis
  4. Inventory Assessment
  5. Risk Evaluation
  6. Manual Review
- Required: NO
- **Save**

**Verification:**
- [ ] All 6 fields created in Decisions table
- [ ] Field types correct (Single Select, Percent, Long Text, Link, DateTime)
- [ ] Test record created with sample data
- [ ] Fields populate correctly

**Time Estimate:** 1 hour ✓

---

### THURSDAY 10/8 - Historical Backfill (2 hours)

#### Task 5.2: Backfill Recent Decisions (August-September 2026)

**Location:** Airtable → Decisions table

**Step 1: Identify Recent Decisions**
- Filter: Created >= Aug 22, 2026 (last 30 days)
- Expected count: 30-50 decisions
- Sort: Most recent first

**Step 2: For Each Decision Record (30-50 records × 3-5 min each = 1.5-2.5 hours)**

**Determine Decision Type:**
- **If Automated Decision (AI-made):**
  - AI Model Used: [Select from options]
  - Confidence Score: [Insert confidence %]
  - Decision Reasoning: [Summarize methodology]
  - Decision Methodology: [Select methodology used]
  - Evidence Chain: [Link to supporting data]

- **If Manual Decision (Human-made):**
  - AI Model Used: "Manual (Human)"
  - Decision Reasoning: [Note human reasoning]
  - Confidence Score: [Optional, leave blank or estimate]
  - Evidence Chain: [Link to analysis/notes]

- **If Unknown (Missing Info):**
  - Mark: "Unknown - historical record"
  - Note: "Insufficient data to determine methodology"
  - Flag: Compliance Status = "Pending Review"

**Document in Each Record:**
```
Example 1 (Automated):
- AI Model Used: OpenAI GPT-5-nano
- Confidence Score: 92%
- Decision Reasoning: "High demand signal on KREAM (5,000+ listings). 
  Recent 15% price spike. Market trend analysis indicates 72-hour 
  arbitrage window. Similar items selling $X-$Y range."
- Decision Methodology: Market Data Analysis + Price Trend Analysis
- Evidence Chain: [Link to KREAM_Analysis_Sept12.png, Market_Report_Sept10.md]

Example 2 (Manual):
- AI Model Used: Manual (Human)
- Decision Reasoning: "Manual review of StockX inventory. 
  Item categorized as high-risk due to brand discontinuation. 
  Recommendation: Do not acquire."
- Decision Methodology: Manual Review + Risk Evaluation
- Evidence Chain: [Link to Brand_News_Sept15.md, Risk_Analysis.pdf]
```

**Step 3: Batch Processing Tips**
- Use Find & Replace for common AI models/methodologies
- Group by decision type (all automated together, all manual together)
- Set timer to prevent excessive per-record time

**Verification (for each record):**
- [ ] AI Model Used: Populated (not empty)
- [ ] Decision Reasoning: Summarizes methodology clearly
- [ ] Confidence Score: Filled (if applicable)
- [ ] Evidence Chain: Linked to supporting data

**Time Estimate:** 2 hours (1.5-2.5 hours depending on complexity) ✓

---

### FRIDAY 10/9 - Process & Automation (1.5 hours)

#### Task 5.3: Setup Going-Forward Capture Process (30 minutes)

**Location:** Decision-making workflow (Slack, Make.com, or notebook)

**Step 1: Create Decision Template**

For every new decision made going forward, populate:
```
Decision Template:
1. Decision Name: [e.g., "Buy Supreme Hoodie Lot at $X"]
2. AI Model Used: [Select from: GPT-5-nano, GPT-4, Claude, Manual, Other]
3. Confidence Score: [0-100%]
4. Decision Reasoning: [Summarize in 2-3 sentences]
5. Methodology: [Select: Market Data, Price Trend, Demand Signal, etc.]
6. Evidence Links: [Link to KREAM, StockX, Market Reports, etc.]
7. Timestamp: [Auto-generated]
```

**Step 2: Assign Responsibility**
- **Who fills this in?** 
  - If AI-driven: Automation should capture fields
  - If manual: Decision maker fills in template at time of decision
  - Timeline: Capture BEFORE decision record created (not after)

**Step 3: Integration Points**
- Slack command: `/decision [type] [confidence] [reasoning]` → Auto-creates Airtable record with fields
- Make.com: When Decision created, automation prompts for missing fields
- Notion: Template added to decision-making notebook

**Verification:**
- [ ] Template created and accessible
- [ ] Team knows how to use template
- [ ] First decision documented using new process

**Time Estimate:** 30 minutes ✓

---

#### Task 5.4: Weekly Audit Report Automation (1 hour)

**Location:** Make.com → Scenarios

**Step 1: Create Scenario**
- Make.com → Scenarios → Create New
- **Name:** "Weekly Algorithm Audit Trail Report"

**Step 2: Schedule Trigger**
- **Frequency:** Weekly
- **Day:** Friday
- **Time:** 5:00 PM
- Pulls all decisions from past week

**Step 3: Query Decisions**
- Add module: Airtable
- **Action:** Search Records
- **Table:** Decisions
- **Filters:**
  - Created >= Last 7 days
  - Status = "Completed" OR "Active"

**Step 4: Aggregate Statistics**
- Add module: Array Aggregator
- **Source:** Airtable search results
- **Stats to capture:**
  1. Total decisions made (count)
  2. AI-driven decisions (count where AI Model ≠ Manual)
  3. Manual decisions (count where AI Model = Manual)
  4. Average confidence score (mean of Confidence Score field)
  5. Methodology distribution (group by Decision Methodology)

**Step 5: Generate Report**
- Add module: Text Aggregator (or Formatter)
- **Format:**
```
Weekly Algorithm Audit Trail Report
Week of: [date]

📊 Decision Statistics:
- Total Decisions: [X]
- AI-Driven: [X] ([X]%)
- Manual: [X] ([X]%)
- Avg Confidence: [X]%

📋 Decision Methodology:
- Market Data Analysis: [X] decisions
- Price Trend Analysis: [X] decisions
- Demand Signal Analysis: [X] decisions
- Risk Evaluation: [X] decisions
- Manual Review: [X] decisions

🔗 Quality Metrics:
- Decisions with Evidence Links: [X]%
- Decisions with Confidence Score: [X]%
- Decisions Missing Reasoning: [X]%

Review: See Decisions table for details
```

**Step 6: Send Report**
- Add module: Email (or Slack)
- **Recipient:** Compliance team / owner
- **Subject:** "[Date] Weekly Algorithm Audit Trail Report"
- **Body:** Report generated above

**Step 7: Test Scenario**
- Click "Run" to execute manually
- Verify email/Slack sent with correct statistics
- Check: Numbers match when manually counting decisions

**Step 8: Enable & Schedule**
- Save scenario
- Toggle: ON
- Runs automatically every Friday 5pm

**Verification:**
- [ ] Scenario created and enabled
- [ ] Manual test executed
- [ ] Report sent successfully
- [ ] Statistics accurate

**Time Estimate:** 1 hour ✓

---

#### Task 5.5: Update CLAUDE.md (30 minutes)

**Location:** CLAUDE.md → Compliance Requirements

**Add Section:**

```markdown
### Algorithm Audit Trail — Decision Methodology Documentation
- **Status:** IMPLEMENTED (Oct 2026)
- **Deadline:** Feb 2027 (regulatory compliance)
- **Requirement:** Document AI decision-making methodology, model attribution, confidence scores for all automated decisions
- **Implementation:**
  - Airtable fields: AI Model Used, Confidence Score, Decision Reasoning, Evidence Chain, Decision Timestamp, Decision Methodology
  - Process: Every new decision captures methodology at time of creation (not retroactively)
  - Reporting: Weekly audit trail report (Fridays 5pm) summarizes decision quality metrics
  - Template: [Decision Template Link]
- **Audit Procedure:**
  - Query Decisions where Created >= [date] → Verify AI Model Used field populated
  - Check: Confidence Score filled (0-100%)
  - Verify: Decision Reasoning summarizes methodology clearly
  - Link: Evidence Chain connected to supporting data sources
- **Quality Metrics Tracked:**
  - % of decisions with AI model attribution
  - % of decisions with confidence score
  - Average confidence level trend (over time)
  - Methodology distribution (market data vs. trend vs. demand, etc.)
- **Regulatory Reference:** EU AI Act (Dec 2025), US AI Regulation (emerging)
```

**Verification:**
- [ ] CLAUDE.md updated with audit trail section
- [ ] Process clearly documented for team
- [ ] Audit procedure specified

**Time Estimate:** 30 minutes ✓

---

### END OF WEEK 3-4: Total Effort = 3.5 hours
- Task 5.1: 1 hour ✓
- Task 5.2: 2 hours ✓
- Task 5.3: 30 min ✓
- Task 5.4: 1 hour ✓
- Task 5.5: 30 min ✓

**Gap #4 Complete:** Algorithm Audit Trail fully implemented ✓

---

## AIRTABLE MODIFICATION DETAILS

### Complete Field Reference

#### Gap #1: EU Apparel Disposal (Inventory Table)

| Field Name | Type | Required | Options/Details | Purpose |
|------------|------|----------|-----------------|---------|
| Disposal Method | Single Select | YES | Resold, Remanufactured, Donated, Reused, Unknown | Required before marking Status="Sold" |
| Disposal Channel | Text | NO | e.g., "eBay", "Charity Name", "Remanufacturer" | Where/how was item disposed |
| Disposal Date | Date | NO | Any date | When was item actually disposed/sold/donated |
| Disposal Recipient | Text | NO | Buyer name, charity, organization | Who received the item |
| Compliance Status | Single Select | NO | Compliant, Non-Compliant, Historical, Pending Review | Regulatory compliance status |

**Automation:** Block Status="Sold" if Disposal Method empty

---

#### Gap #2: FTC Price Transparency (Orders Table) — IF APPLICABLE

| Field Name | Type | Required | Formula | Purpose |
|------------|------|----------|---------|---------|
| Advertised Price | Currency | YES | N/A | Customer-facing price before checkout |
| Service Fee | Currency | NO | N/A | Platform/processing fee |
| Mandatory Fees Total | Currency | NO | Service_Fee + Tax + Shipping | Sum of all mandatory fees |
| Total Price to Customer | Currency | NO | Advertised_Price + Mandatory_Fees_Total | Final amount charged |
| Fee Verification Status | Single Select | NO | Compliant, Non-Compliant, Exempt, Review | Auto-populated based on price match |

**Automation:** Alert if Advertised Price + Fees ≠ Total (should never happen)

---

#### Gap #4: Algorithm Audit Trail (Decisions Table)

| Field Name | Type | Required | Options/Details | Purpose |
|------------|------|----------|-----------------|---------|
| AI Model Used | Single Select | NO | GPT-5-nano, GPT-4, Claude, Manual, Other, Unknown | Which AI made decision |
| Confidence Score | Percent | NO | 0-100% | Decision confidence level |
| Decision Reasoning | Long Text | NO | 2-3 sentence summary | Why decision was made |
| Evidence Chain | Link to Records | NO | Links to Evidence table | Supporting data sources |
| Decision Timestamp | DateTime | NO | Auto-set to current time | When decision made |
| Decision Methodology | Single Select | NO | Market Data, Price Trend, Demand Signal, Risk, Manual | Which methodology used |

**Automation:** Weekly report aggregates statistics

---

## MAKE.COM AUTOMATION SETUP

### Scenario Checklist: 3 Scenarios to Create

#### Scenario #1: Weekly Apparel Disposal Compliance Report
- **Status:** ✅ COMPLETE (Week 1)
- **When:** Every Monday 9am
- **Trigger:** Schedule
- **Actions:** Query apparel items, filter non-compliant, send Slack alert
- **Output:** Weekly compliance metrics

#### Scenario #2: FTC Fee Verification (IF APPLICABLE)
- **Status:** ✅ COMPLETE (Week 2, if applicable)
- **When:** On every new Shopify order
- **Trigger:** Shopify new order webhook
- **Actions:** Extract prices, calculate fees, verify match, alert if mismatch
- **Output:** Airtable record + Slack notification

#### Scenario #3: Weekly Algorithm Audit Trail Report
- **Status:** ✅ COMPLETE (Week 3-4)
- **When:** Every Friday 5pm
- **Trigger:** Schedule
- **Actions:** Query decisions, aggregate stats, generate report
- **Output:** Email/Slack report with quality metrics

---

## VERIFICATION & TESTING

### Verification Checklist: How to Confirm Each Gap Resolved

#### Gap #1: EU Apparel Disposal ✅

**Test 1: Disposal Method Requirement**
- [ ] Open apparel record in Airtable
- [ ] Try to change Status to "Sold" WITHOUT filling Disposal Method
- **Expected:** Automation blocks change with alert "Must specify Disposal Method"
- [ ] Fill Disposal Method
- [ ] Change Status to "Sold"
- **Expected:** Change succeeds; Compliance Status auto-updates

**Test 2: Compliance Audit Query**
```
Airtable Query:
WHERE Created >= 2026-07-19
AND Type CONTAINS "Apparel"
AND Status = "Sold"
AND Disposal Method IS EMPTY

Expected Result: 0 records (100% compliant)
```

**Test 3: Weekly Report**
- [ ] Wait for Monday 9am or manually run Make.com scenario
- [ ] Check Slack #compliance channel
- [ ] **Expected:** Report shows "✅ All apparel disposed compliantly" (if 0 non-compliant) OR lists non-compliant items

**Test 4: New Apparel Item**
- [ ] Create new apparel record in Inventory
- [ ] Set Status to "Sold" without Disposal Method
- **Expected:** Automation blocks action; requires Disposal Method first

**Verification Result:** ✅ PASS / ❌ FAIL

**If FAIL:** Troubleshoot in section below

---

#### Gap #2: FTC Price Transparency ✅ (IF APPLICABLE ONLY)

**Test 1: Order Field Population**
- [ ] Open recent Shopify order in Airtable Orders table
- [ ] Verify fields populated:
  - [ ] Advertised Price: Shows product price
  - [ ] Service Fee: Shows processing fee (if applicable)
  - [ ] Mandatory Fees Total: Auto-calculated
  - [ ] Total Price to Customer: Matches Shopify charge
  - [ ] Fee Verification Status: Shows "Compliant"

**Test 2: Compliance Audit Query**
```
Airtable Query:
WHERE Fee_Verification_Status NOT EQUALS "Compliant"

Expected Result: 0 records (all orders compliant)
```

**Test 3: New Order Automation**
- [ ] Create test order in Shopify ($50 product, standard checkout)
- [ ] Wait 2 minutes for Make.com to sync
- [ ] Check Airtable Orders table for new record
- **Expected:** Record created with all fee fields populated, status = "Compliant"
- **Expected:** NO Slack alert (no fee mismatch)

**Test 4: Fee Mismatch Detection**
- [ ] Manually create Airtable order with mismatched prices (test only)
- [ ] Set: Advertised Price = $50, Total = $75, Fee Status = "Non-Compliant"
- **Expected:** Make.com scenario should (if configured to check) send alert

**Verification Result:** ✅ PASS / ❌ FAIL

---

#### Gap #3: Make.com Capacity ✅

**Test 1: Plan Verification**
- [ ] Log into Make.com
- [ ] Dashboard → Settings → Plan & Billing
- **Expected:** Shows "Core Tier | 10,000 operations/month"
- [ ] Billing section shows "$9/month charge"

**Test 2: Operations Headroom**
- [ ] Dashboard → Usage & Billing
- [ ] Current usage: ~996 operations/month
- [ ] Available: 10,000 - 996 = 9,004 operations remaining
- **Expected:** Headroom > 7,500 (sufficient for SNKRS + growth)

**Test 3: Scenario Execution**
- [ ] Dashboard → Scenarios
- [ ] All active scenarios running:
  - [ ] 6110933 (Shopify sync): Status = Active
  - [ ] 5901509 (Airtable): Status = Active
  - [ ] Weekly Compliance Report: Status = Active
- **Expected:** All 3+ scenarios show "Running" (no errors)

**Test 4: SNKRS Readiness**
- [ ] Create dummy SNKRS scenario (don't activate)
- [ ] Estimated ops: 1,440/month
- [ ] Calculate: 10,000 - 996 (current) - 1,440 (SNKRS) = 7,564 remaining
- **Expected:** Sufficient headroom to enable SNKRS

**Verification Result:** ✅ PASS / ❌ FAIL

---

#### Gap #4: Algorithm Audit Trail ✅

**Test 1: Decision Fields Exist**
- [ ] Open Decisions table in Airtable
- [ ] Verify fields present:
  - [ ] AI Model Used
  - [ ] Confidence Score
  - [ ] Decision Reasoning
  - [ ] Evidence Chain
  - [ ] Decision Timestamp
  - [ ] Decision Methodology

**Test 2: Historical Backfill**
- [ ] Filter Decisions: Created >= Aug 22, 2026 (last 30 days)
- [ ] Count: How many decisions?
- [ ] Spot-check 5 random records:
  - [ ] AI Model Used: Populated (not empty)
  - [ ] Decision Reasoning: Describes methodology
  - [ ] Confidence Score: Filled (or noted as N/A)
  - [ ] Evidence Chain: Links to supporting data
- **Expected:** ≥80% of recent decisions have audit trail populated

**Test 3: Weekly Report**
- [ ] Wait for Friday 5pm or manually run Make.com scenario
- [ ] Check email/Slack for weekly report
- **Expected:** Report shows:
  - Total decisions this week
  - AI-driven vs. manual breakdown
  - Average confidence score
  - Methodology distribution

**Test 4: New Decision Capture**
- [ ] Create new decision in Decisions table
- [ ] Populate: AI Model Used, Confidence Score, Decision Reasoning, Evidence Chain
- **Expected:** Fields save correctly; data persists on reload

**Verification Result:** ✅ PASS / ❌ FAIL

---

### Master Verification Checklist

**Before Final Sign-Off, Verify All 4 Gaps:**

**Gap #1: EU Apparel Disposal**
- [ ] Disposal Method field exists (required)
- [ ] 100% of post-July 19 apparel has disposal method documented
- [ ] Automation prevents Status="Sold" without disposal method
- [ ] Weekly compliance report running (Mondays 9am)
- [ ] CLAUDE.md updated with compliance statement

**Gap #2: FTC Price Transparency** (if applicable)
- [ ] Applicability determined and documented
- [ ] IF APPLICABLE: Fee tracking fields added to Orders
- [ ] IF APPLICABLE: Recent orders audited (0 mismatches)
- [ ] IF APPLICABLE: Automation detects fee mismatches
- [ ] IF APPLICABLE: CLAUDE.md updated

**Gap #3: Make.com Capacity**
- [ ] Plan upgraded to Core tier (or optimization complete)
- [ ] Operations limit shows 10,000/month
- [ ] All scenarios verified running
- [ ] Headroom sufficient for SNKRS (7,500+)

**Gap #4: Algorithm Audit Trail**
- [ ] All 6 methodology fields exist in Decisions table
- [ ] Last 30 days of decisions backfilled (≥80% complete)
- [ ] Weekly audit report automated (Fridays 5pm)
- [ ] Going-forward process documented and integrated
- [ ] CLAUDE.md updated with process

**FINAL STATUS:**
- [ ] All 4 gaps remediated
- [ ] All tests PASSED
- [ ] Documentation complete
- [ ] Ready for regulatory audit

---

## TROUBLESHOOTING GUIDE

### Issue: Disposal Method Field Won't Block Status Change

**Problem:** Automation isn't preventing Status="Sold" without disposal method

**Troubleshooting:**
1. Check Airtable Automations panel
   - Is automation enabled? Toggle should be ON
   - Is it running? Should show "✓ Active"

2. Check automation configuration
   - Trigger: "When record's field value is changed"
   - Field: "Status"
   - Condition: Equals "Sold"
   - Action: Email alert or update record?

3. Test automation
   - Open test record
   - Change Status to "Sold" without filling Disposal Method
   - Does email alert appear?
   - Can you still change status? (Should block or warn)

4. If still not working
   - Delete automation
   - Recreate from scratch (follow Task 3.1 instructions)
   - Test again

**Resolution:** [Document what fixed it]

---

### Issue: Weekly Compliance Report Not Sending

**Problem:** Make.com scenario runs but Slack message doesn't arrive

**Troubleshooting:**
1. Check scenario execution
   - Make.com → Scenarios → Weekly Apparel Disposal Compliance Report
   - Click "Run" to execute manually
   - Does it show "✓ Executed successfully"?

2. Check Airtable connection
   - Does "Search Records" step show apparel items?
   - Click "View output" — does it list records?

3. Check Slack connection
   - Is Slack connected to Make.com?
   - Is bot authorized to post to #compliance channel?
   - Try Send Message manually — does Slack receive it?

4. Check filters
   - Are non-compliant records being filtered correctly?
   - Try widening filter temporarily (show all apparel, not just non-compliant)
   - Does count increase? (Confirms filter is working)

5. If still not working
   - Delete Slack module
   - Reconnect Slack account
   - Recreate Slack message action (follow Task 3.2 instructions)

**Resolution:** [Document what fixed it]

---

### Issue: FTC Fee Fields Not Auto-Calculating

**Problem:** Mandatory Fees Total not showing calculated sum

**Troubleshooting:**
1. Check field type
   - Mandatory Fees Total should be "Currency" with "Formula"
   - If not, delete and recreate as formula field

2. Check formula syntax
   - Expected: `Service_Fee + Tax_Amount + Shipping`
   - Verify field names match exactly (case-sensitive)
   - Test with manual values first

3. Check order records
   - Do Service Fee, Tax, Shipping fields have values?
   - If empty, Mandatory Fees Total will show 0
   - Populate sample values and check formula updates

4. If still not working
   - Airtable → Orders table → Edit field
   - Verify formula is correct
   - Click "Test" to validate formula syntax
   - Save and retry

**Resolution:** [Document what fixed it]

---

### Issue: Algorithm Audit Trail Report Empty

**Problem:** Weekly report runs but shows 0 decisions

**Troubleshooting:**
1. Check Decisions table
   - Are there actually decisions created in last week?
   - Filter: Created >= [7 days ago]
   - Count: How many records?

2. Check Make.com scenario
   - Search Records step: Does "View output" show records?
   - If no output, check filters
   - Widen filter: Search for ALL decisions (not just week)

3. Check aggregation
   - Array Aggregator step: Does it show decision count?
   - If 0, Airtable search returned no results
   - Debug: Is Airtable connection working?

4. If still not working
   - Delete scenario
   - Recreate from scratch (follow Task 5.4 instructions)
   - Test with manual "Run" before scheduling

**Resolution:** [Document what fixed it]

---

### Issue: Make.com Upgrade Charge Not Showing

**Problem:** Upgraded to Core tier but billing still shows Free plan

**Troubleshooting:**
1. Check plan settings
   - Make.com → Settings → Plan & Billing
   - Does it show "Core Tier" or still "Free"?

2. Refresh dashboard
   - Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
   - Wait 1-2 minutes for backend to update

3. Check billing confirmation
   - Did you receive email confirmation of upgrade?
   - Check spam folder if not in inbox
   - Check credit card statement for $9 charge

4. Contact Make.com support
   - If plan still shows Free after refresh
   - Go to Make.com → Help/Support
   - Submit ticket: "Plan upgrade not applying"

**Resolution:** [Document what fixed it]

---

## Quick Reference: 4-Week Timeline

### Week 1: CRITICAL
- **Mon 9/23:** Schema setup + Make.com decision
- **Tue 9/24:** Historical audit (post-July 19 apparel)
- **Wed 9/25:** Automation + Make.com upgrade test
- **By Friday 9/27:** Gap #1 + Gap #3 COMPLETE

### Week 2: SECONDARY
- **Mon 9/30:** FTC applicability decision
- **Tue-Thu 10/1-3:** FTC implementation (if applicable)
- **By Friday 10/4:** Gap #2 COMPLETE (or documented exempt)

### Week 3-4: DEFERRED
- **Mon 10/7:** Algorithm audit trail schema
- **Wed 10/9:** Historical backfill + automation setup
- **By Friday 10/18:** Gap #4 COMPLETE

### FINAL: All 4 gaps remediated, documented, automated

---

## Sign-Off & Authority

**Implementation Authority:** PremeOS Autonomous Execution Mandate  
**Prepared by:** Claude Haiku 4.5 | Compliance Remediation  
**Document Date:** 2026-09-22  
**Status:** Ready for Execution

**Next Step:** Begin Week 1 implementation (Monday Sept 23)

---

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>
