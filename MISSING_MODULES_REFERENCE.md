# Missing Modules Reference Guide
**Scenario:** 5774991 - PremeOS Intelligence Opportunity Processing  
**Missing Modules:** 4 critical output modules  
**Guide Purpose:** Complete technical specifications for manual restoration

---

## Module 5: Create AI Opportunity

**Type:** Airtable → Create a Record  
**Designer Name:** Create AI Opportunity  
**Position:** x=1500, y=150

### Purpose
Creates a new opportunity record in the Opportunities table with AI analysis results.

### Configuration

**Connection:**
- Account: Airtable OAuth (User ID: usr1pQgCjqPm3iR4u)
- Scoped: true

**Target:**
- Base: PREMEOS (ID: appMgSuE6O4sXyxzE)
- Table: Opportunities (ID: tbl5Ae2A4L8SEOLoF)

### Field Mappings

| Field ID | Field Name | Source | Value |
|---|---|---|---|
| `fldwBz4I6N93oQWI2` | Product Name | AI Result | `{{3.result.product_name}}` |
| `fldK0umnvOdpqsq96` | Market | AI Result | `{{3.result.market}}` |
| `fldkNcSGmvsRNIq0u` | Category | AI Result | `{{3.result.category}}` |
| `fldTjx6oiJZGson8Q` | Estimated Cost | AI Result | `{{3.result.estimated_cost}}` |
| `fldYsNYcBo8pNnNMM` | Estimated Value | AI Result | `{{3.result.estimated_value}}` |
| `fldqUDk1Q7SR1gVx8` | AI Score | AI Result | `{{3.result.investment_score}}` |
| `fldbMcDpwIqmJ2rWZ` | AI Recommendation | AI Result | `{{3.result.recommendation}}` |
| `fldMhjlnVgmpqflWV` | Notes | AI Result | `{{3.result.reasoning}}` |
| `fldwhKTZbDPhTI8yr` | Source URL | Trigger | `{{2.URL}}` |

### Options
- Smart links (typecast): **true**
- Use Column ID: **false**

### Output
- Record ID (`5.id`) → Used by Module 31 to link opportunity
- Output fields: All mapped fields above

### Error Handling
- On error: Stop pipeline (no error routes configured)
- Critical: Must succeed for pipeline to continue

---

## Module 31: Update Datastore Record

**Type:** Data Store → Update a Record  
**Designer Position:** x=1800, y=150

### Purpose
Links the newly created Opportunity record back to the deduplication data store entry, establishing the relationship between AI Inbox input and created Opportunity.

### Configuration

**Data Store:**
- ID: 129932
- Name: My data store

**Record Key:**
- Key: `{{26.key}}`
- Format: `opportunity:v2:{url_hash}:{input_hash}`
- Source: From Module 26 (dedup hash)

### Field Updates

| Field Name | Value | Purpose |
|---|---|---|
| `Opportunity Record ID` | `{{5.id}}` | Link to newly created Airtable opportunity |
| `Created At` | (clear/empty) | Preserve original creation timestamp |
| `Source URL` | (clear/empty) | Preserve original URL reference |
| `AI Inbox Record ID` | (clear/empty) | Preserve original inbox link |

### Options
- Upsert (insert if missing): **false**
- Overwrite Arrays: **false**

### Output
- Status: Success/Error message
- Updates existing datastore record with opportunity linkage

### Critical Function
Without this module, duplicate detection fails on subsequent analysis of same URL+input combination.

---

## Module 11: Update AI Inbox Status

**Type:** Airtable → Update a Record  
**Designer Name:** Update AI Inbox Status  
**Position:** x=2100, y=150

### Purpose
Marks the source AI Inbox record as "Analyzed" and updates the AI Score field to complete the processing lifecycle.

### Configuration

**Connection:**
- Account: Airtable OAuth (User ID: usr1pQgCjqPm3iR4u)
- Scoped: true

**Target:**
- Base: PREMEOS (ID: appMgSuE6O4sXyxzE)
- Table: AI Inbox (ID: tblxl8ysG3kDjLcA9)
- Record ID: `{{2.id}}` (original trigger record)

### Field Mappings

| Field ID | Field Name | Source | Value |
|---|---|---|---|
| `fldQmozoteu5BGLuw` | AI Score | AI Result | `{{3.result.investment_score}}` |
| `fldkLjG4o4CeVI509` | Processing Status | Static | `"Analyzed"` |

### Options
- Smart links (typecast): **true**
- Use Column ID: **false**

### Output
- Status: Success/Error
- Updates 1-2 fields on source record

### Lifecycle Context
- Input: New → Processing → Analyzed
- Flags the input as processed and prevents re-analysis
- Score captured for analytics and filtering

---

## Module 16: Route Opportunity Alerts

**Type:** Built-in → Basic Router  
**Designer Name:** Route Opportunity Alerts  
**Position:** x=2400, y=150

### Purpose
Intelligently routes opportunity alerts to different Discord channels based on recommendation level and AI score.

### Configuration

**Router Type:** Conditional branching

**Routes:** 3 branches

### Route 1: BUY Opportunities (Module 14)
**Condition:**
```
{{3.result.recommendation}} = "BUY"
```

**Action:** Send to Discord
- Channel: #ideas (ID: 1528969647540670464)
- Message: Standard BUY alert format

**Flow:**
```
Route → Filter (recommendation == BUY) → Module 14 (Discord Message)
```

### Route 2: High-Value BUY (Module 17)
**Condition:**
```
{{3.result.investment_score}} >= 7
AND
{{3.result.recommendation}} = "BUY"
```

**Action:** Send to Discord
- Channel: #drop-alerts (ID: 1528968709920653382)
- Message: HIGH VALUE BUY ALERT format

**Flow:**
```
Route → Filter (score >= 7 AND recommendation == BUY) → Module 17 (Discord Message)
```

### Route 3: WATCH Signals (Module 18)
**Condition:**
```
{{3.result.recommendation}} = "WATCH"
```

**Action:** Send to Discord
- Channel: #ai-research (ID: 1528969012011208865)
- Message: WATCH - RESEARCH SIGNAL format

**Flow:**
```
Route → Filter (recommendation == WATCH) → Module 18 (Discord Message)
```

### Nested Discord Modules

#### Module 14: Post Buy Opportunity
- Channel: #ideas
- Content: Product name, Market, Category, Cost, Value, Score, Recommendation, Reasoning, Source URL
- Format: Markdown with emoji bullets

#### Module 17: Post High Value Alert
- Channel: #drop-alerts
- Content: Same as Module 14 with HIGH VALUE emphasis
- Format: Markdown with alarm emoji (🚨)

#### Module 18: Post Watch Signal
- Channel: #ai-research
- Content: Product, Market, Category, Metrics, Reasoning, Source
- Format: Markdown with magnifying glass emoji (🔎)

### Discord Connection
- Account: Discord (Make team1278341651986911253)
- Connection verified and active

### Output
- No direct output (routes to Discord)
- Success when message posted to channel
- Errors caught and logged by Discord module

---

## Module Execution Sequence

```
Start Trigger (Module 2)
    ↓
Parse AI Inbox Record
    ↓
Check Datastore Dedup (Module 26)
    ├─ If duplicate → Error path → Modules 28, 29, 30
    └─ If new → Continue
    ↓
AI Analysis (Module 3) [FIXED: numeric parameters]
    ↓
[RESTORE] Create Opportunity (Module 5)
    ↓
[RESTORE] Update Datastore (Module 31)
    ↓
[RESTORE] Update Inbox Status (Module 11)
    ↓
[RESTORE] Route Alerts (Module 16)
    ├─ Route 1 (BUY) → Module 14 → Discord #ideas
    ├─ Route 2 (High Value) → Module 17 → Discord #drop-alerts
    └─ Route 3 (WATCH) → Module 18 → Discord #ai-research
    ↓
End
```

---

## Integration Points

### Upstream Dependencies (Modules 2, 26, 3)
- Module 2 provides: Record data and trigger event
- Module 26 provides: Deduplication key
- Module 3 provides: AI analysis results (market, recommendation, score, etc.)

### Downstream Connections
- Module 5 output (Opportunity ID) → Module 31 input
- Module 31 output → Used by future runs for dedup checks
- Module 11 output → Updates source inbox record
- Module 16 routes to 3 Discord channels via nested modules 14, 17, 18

### Data Store Integration
- Module 26: Reads/writes dedup key
- Module 31: Links opportunity ID to stored key
- Future Runs: Reads same key to prevent duplicates

### Airtable Integration
- Module 5 writes to: Opportunities table
- Module 11 updates: AI Inbox table
- All using: PREMEOS base (appMgSuE6O4sXyxzE)

---

## Field ID Reference

### Opportunities Table (tbl5Ae2A4L8SEOLoF)
```
fldwBz4I6N93oQWI2 = Product Name
fldK0umnvOdpqsq96 = Market (single select)
fldkNcSGmvsRNIq0u = Category (single select)
fldTjx6oiJZGson8Q = Estimated Cost (number)
fldYsNYcBo8pNnNMM = Estimated Value (number)
fldqUDk1Q7SR1gVx8 = AI Score (number, 0-10)
fldbMcDpwIqmJ2rWZ = AI Recommendation (single select: BUY/WATCH/PASS)
fldMhjlnVgmpqflWV = Notes (long text)
fldwhKTZbDPhTI8yr = Source URL (text)
```

### AI Inbox Table (tblxl8ysG3kDjLcA9)
```
fldQmozoteu5BGLuw = AI Score (number, 0-10)
fldkLjG4o4CeVI509 = Processing Status (single select: New/Analyzed/Duplicate)
```

---

## Data Flow Example

**Input:** AI Inbox record created
- Title: "Nike Jordan 1 OG"
- URL: "https://supremecommunity.com/..."
- Input: "BUY SIGNAL - Limited 500 pairs..."
- Processing Status: "New"

**Trigger (Module 2):**
- Watches AI Inbox table for new/unanalyzed records
- Passes record data to next module

**Dedup Check (Module 26):**
- Creates key: `opportunity:v2:{md5(url)}:{md5(input)}`
- Stores in datastore to prevent duplicate analysis

**AI Analysis (Module 3):**
- Sends record to OpenAI GPT-5-nano
- Returns: market, category, cost, value, score (0-10), recommendation (BUY/WATCH/PASS), reasoning

**Create Opportunity (Module 5):**
- Creates new record in Opportunities table
- Maps all AI fields + source URL
- Returns new record ID (e.g., "rec123ABC")

**Update Datastore (Module 31):**
- Links datastore key to opportunity record ID
- Enables duplicate detection on future runs

**Update Inbox (Module 11):**
- Updates source AI Inbox record
- Sets Processing Status = "Analyzed"
- Stores AI Score for reference

**Route Alerts (Module 16):**
- Evaluates recommendation score
- If recommendation == "BUY" → Discord #ideas
- If score >= 7 AND recommendation == "BUY" → Discord #drop-alerts
- If recommendation == "WATCH" → Discord #ai-research

**Output:** Opportunity created, alerts posted, pipeline complete in 15-20 seconds

---

## Troubleshooting Guide

### If Module 5 Fails
**Symptoms:** Opportunity not created in Airtable
**Causes:**
- Airtable connection expired
- Target table/base IDs incorrect
- Field mappings invalid
**Resolution:**
- Verify Airtable OAuth connection
- Check field IDs in Opportunities table
- Validate AI result format from Module 3

### If Module 31 Fails
**Symptoms:** Datastore not updated with opportunity ID
**Causes:**
- Data store ID incorrect
- Key format mismatch
- Upsert flag misconfigured
**Resolution:**
- Verify datastore ID: 129932
- Check key generation in Module 26
- Ensure upsert = false

### If Module 11 Fails
**Symptoms:** AI Inbox status remains "New"
**Causes:**
- Record ID incorrect
- Airtable connection failed
- Processing Status field doesn't exist
**Resolution:**
- Verify record ID passed from Module 2
- Check Airtable connection auth
- Confirm field exists: fldkLjG4o4CeVI509

### If Module 16 Fails
**Symptoms:** No Discord alerts posted
**Causes:**
- Discord connection expired
- Channel IDs incorrect
- Message format invalid
**Resolution:**
- Reconnect Discord OAuth
- Verify channel IDs in Make
- Check message template syntax

---

## Testing the Restoration

### Pre-Test Checklist
- [ ] All 4 modules imported successfully
- [ ] Module connections verified (no warnings)
- [ ] Airtable connection active
- [ ] Discord connection active
- [ ] Data store accessible

### Test Record Creation

**In Airtable AI Inbox:**
```
Title: TEST - Nike Jordan 1 Low OG SP Travis Scott
URL: https://www.supremecommunity.com/next-drop/
Input: BUY SIGNAL - Jordan 1 Low OG SP Travis Scott dropping Sept 23 @ 11am EDT. Historical resale value $400-600. Limited to 500 pairs globally.
Processing Status: New
```

### Expected Test Results

**Module 5 (Create Opportunity):**
- ✓ New record in Opportunities table
- ✓ Fields: Product Name, Market, Category, Cost, Value, Score, Recommendation, Notes

**Module 31 (Update Datastore):**
- ✓ Opportunity Record ID field populated in datastore

**Module 11 (Update Inbox):**
- ✓ Processing Status changed to "Analyzed"
- ✓ AI Score populated

**Module 16 (Route Alerts):**
- ✓ Message posted to #ideas channel (BUY recommendation)
- ✓ Message includes: Product, Market, Score, Recommendation, URL

### Timeline
- Trigger → ~1 second
- AI Analysis → ~5-10 seconds
- Create Opportunity → ~2 seconds
- Updates → ~1 second
- Discord Alert → ~2 seconds
- **Total:** ~15-20 seconds

---

## File References

- **Source:** `/Users/premeftpllc/PremeOS/1/final-complete-blueprint.json`
- **Extracted Modules:** `/tmp/missing_modules.json`
- **Restoration Plan:** `/Users/premeftpllc/PremeOS/1/SCENARIO_5774991_RESTORATION_PLAN.md`
- **Repair Report:** `/Users/premeftpllc/PremeOS/1/scenario-repair-report.json`

