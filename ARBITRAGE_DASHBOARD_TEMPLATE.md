# PREMEFTP Arbitrage Tracking Dashboard
**Automated Dashboard Template for Google Sheets & Airtable**

---

## Overview
This document provides configuration templates for setting up automated dashboards in Google Sheets or Airtable to track arbitrage operations in real-time. Use this for live KPI monitoring, weekly summaries, and data visualization.

---

## Google Sheets Setup

### Recommended Structure
Create a single Google Sheet with the following tabs:

1. **Daily Log** - Raw transaction entries
2. **Weekly Summary** - Auto-calculated metrics
3. **Dashboard** - Charts and KPIs
4. **Category Analysis** - Performance by category
5. **Profit Tracker** - Monthly rollup

---

### Tab 1: Daily Log

**Columns (A-H):**

| Column | Field | Data Type | Example | Formula/Notes |
|--------|-------|-----------|---------|--------------|
| A | Date | Date (YYYY-MM-DD) | 2026-09-22 | Use date picker |
| B | Source | Dropdown | StockX, eBay, Amazon | Data validation list |
| C | Item Name | Text | Nike Air Jordan 1 'Lost and Found' | Full product description |
| D | Cost | Currency | $285.45 | Format as currency (2 decimals) |
| E | List Price | Currency | $425.00 | Shopify listing price |
| F | Profit | Currency | $95.20 | =E2-D2-$9 (subtract $9 fulfillment avg) |
| G | Status | Dropdown | Sourced, Listed, Sold, Shipped, Completed | Data validation list |
| H | Notes | Text | Condition: DS. Listed with 48hr target. | Any relevant details |

**Sample Rows (Data Entry):**
```
2026-09-22 | StockX | Nike Air Jordan 1 Retro High OG 'Lost and Found' Size 10 | 285.45 | 425.00 | 95.20 | Listed | DS condition. 48hr turnaround target.
2026-09-22 | Amazon | Apple AirPods Pro (2nd Gen) - 2x units | 248.00 | 349.99 | 78.15 | Listed | Flash sale purchase. Bulk margin advantage.
2026-09-21 | StockX | Yeezy 450 'Resin' Size 11 | 215.30 | 315.00 | 68.90 | Sold | Same-day sale. Premium inventory velocity.
```

**Formatting Tips:**
- Freeze row 1 (header) for easy scrolling
- Apply conditional formatting to Status column (color-code by status)
- Set column widths: A=12, B=12, C=35, D=12, E=12, F=12, G=14, H=30
- Enable data validation dropdowns for Source and Status columns

---

### Tab 2: Weekly Summary

**Auto-Calculate from Daily Log using SUMIF/AVERAGEIF formulas:**

**Layout:**

```
WEEK OF [DATE RANGE] - AUTOMATED SUMMARY

Key Metrics:
├─ Total Transactions: =COUNTIF('Daily Log'!A:A,">=2026-09-15")-COUNTIF('Daily Log'!A:A,">=2026-09-22")
├─ Total Profit: =SUMIF('Daily Log'!A:A,">=2026-09-15",F:F)
├─ Average Margin: =AVERAGE(profit percentages)
├─ Avg Transaction Value: =AVERAGE profit per transaction
└─ Sale Completion Rate: =COUNTIF('Daily Log'!G:G,"Sold")/COUNTIF('Daily Log'!G:G,"Listed")*100%

Performance by Source:
┌─ StockX
│  ├─ Units: =COUNTIF('Daily Log'!B:B,"StockX")
│  ├─ Profit: =SUMIF('Daily Log'!B:B,"StockX",'Daily Log'!F:F)
│  └─ Avg Margin: =AVERAGE profit margin for StockX items
├─ eBay
│  ├─ Units: =COUNTIF('Daily Log'!B:B,"eBay")
│  ├─ Profit: =SUMIF('Daily Log'!B:B,"eBay",'Daily Log'!F:F)
│  └─ Avg Margin: =AVERAGE profit margin for eBay items
└─ Amazon
   ├─ Units: =COUNTIF('Daily Log'!B:B,"Amazon")
   ├─ Profit: =SUMIF('Daily Log'!B:B,"Amazon",'Daily Log'!F:F)
   └─ Avg Margin: =AVERAGE profit margin for Amazon items

Status Distribution:
├─ Sourced: =COUNTIF('Daily Log'!G:G,"Sourced")
├─ Listed: =COUNTIF('Daily Log'!G:G,"Listed")
├─ Sold: =COUNTIF('Daily Log'!G:G,"Sold")
├─ Shipped: =COUNTIF('Daily Log'!G:G,"Shipped")
└─ Completed: =COUNTIF('Daily Log'!G:G,"Completed")

Velocity Metrics:
├─ Avg Days to Sale: Calculate from date sourced to sale completion
├─ Fastest Turnaround: MIN formula on sale velocity
└─ Slowest Item: MAX formula on sale velocity
```

**Critical Formulas (Google Sheets):**

```
Total Profit:
=SUMIFS('Daily Log'!F:F,'Daily Log'!A:A,">="&DATE(2026,9,15),'Daily Log'!A:A,"<="&DATE(2026,9,21))

Average Margin %:
=AVERAGE(IF(('Daily Log'!E:E-'Daily Log'!D:D)/('Daily Log'!E:E),'Daily Log'!E:E-'Daily Log'!D:D)/('Daily Log'!E:E))

Completion Rate:
=COUNTIFS('Daily Log'!G:G,"Sold|Shipped|Completed")/COUNTIF('Daily Log'!G:G,"<>")*100

StockX Profit:
=SUMIF('Daily Log'!B:B,"StockX",'Daily Log'!F:F)
```

---

### Tab 3: Dashboard (Visual KPIs)

**Charts to Create:**

1. **Profit Trend Chart** (Line Graph)
   - X-axis: Date (from Daily Log)
   - Y-axis: Cumulative Profit (running total)
   - Shows: Day-by-day profit accumulation
   - Update: Daily
   - Formula: =SUMIF('Daily Log'!A:A,"<="&A2,'Daily Log'!F:F)

2. **Source Distribution** (Pie Chart)
   - Data: Total profit by source (StockX, eBay, Amazon)
   - Shows: Percentage contribution to total profit
   - Update: Weekly
   - Formula: =SUMIF('Daily Log'!B:B,"[Source]",'Daily Log'!F:F)

3. **Status Pipeline** (Horizontal Bar Chart)
   - Categories: Sourced → Listed → Sold → Shipped → Completed
   - Values: Count of items in each status
   - Shows: Current inventory flow
   - Update: Real-time
   - Formula: =COUNTIF('Daily Log'!G:G,"[Status]")

4. **Profit by Category** (Column Chart)
   - X-axis: Product categories (Footwear, Electronics, Luxury, Collectibles)
   - Y-axis: Total profit & margin % (dual-axis)
   - Shows: Category performance comparison
   - Update: Weekly
   - Formula: Filter & sum by product category keywords

5. **Margin % Histogram** (Bar Chart)
   - Shows: Distribution of profit margins across all items
   - Buckets: 10%, 15%, 20%, 25%, 30%+
   - Helps identify high-margin vs low-margin items
   - Formula: Calculate margin % per item, then create frequency distribution

6. **KPI Cards** (Text/Number Display)
   - **Today's Profit**: =SUMIF('Daily Log'!A:A,TODAY(),'Daily Log'!F:F)
   - **This Week Profit**: =SUMIF('Daily Log'!A:A,">="&TODAY()-7,'Daily Log'!F:F)
   - **Month Profit**: =SUMIF('Daily Log'!A:A,">="&DATE(YEAR(TODAY()),MONTH(TODAY()),1),'Daily Log'!F:F)
   - **Items Listed**: =COUNTIF('Daily Log'!G:G,"Listed")
   - **Avg Margin %**: Calculate from daily margins

---

### Tab 4: Category Analysis

**Layout:**

| Category | Units Sold | Total Profit | Avg Profit | Margin % | ROI | Status |
|----------|-----------|-------------|-----------|----------|-----|--------|
| Footwear/Sneakers | =COUNTIFS() | =SUMIFS() | =AVERAGEIFS() | =Formula | =Formula | On Track |
| Electronics | =COUNTIFS() | =SUMIFS() | =AVERAGEIFS() | =Formula | =Formula | Below Target |
| Luxury Goods | =COUNTIFS() | =SUMIFS() | =AVERAGEIFS() | =Formula | =Formula | Exceeding |
| Collectibles | =COUNTIFS() | =SUMIFS() | =AVERAGEIFS() | =Formula | =Formula | On Track |

**Key Formulas:**
```
Count (Category A): =COUNTIFS('Daily Log'!C:C,"*Footwear*",'Daily Log'!G:G,"Completed")
Profit (Category A): =SUMIFS('Daily Log'!F:F,'Daily Log'!C:C,"*Footwear*",'Daily Log'!G:G,"Completed")
Margin % (Category A): =(Total Profit / Total Cost)*100 for category
```

---

### Tab 5: Monthly Rollup

**Static Monthly Summary Table:**

| Month | Transactions | Profit | Margin % | Avg/Transaction | Trend | Notes |
|-------|-------------|--------|----------|-----------------|-------|-------|
| September 2026 | 48 | $5,680.30 | 23.5% | $103.38 | ↑ | In Progress |
| August 2026 | 38 | $5,120.80 | 21.3% | $134.76 | ↑ | Archived |
| July 2026 | 42 | $6,340.15 | 24.8% | $150.95 | ↑ | Archived |

**Projection Formula:**
```
Projected Month End = (Current Month Profit / Days Elapsed) * Days in Month
```

---

## Airtable Setup

### Recommended Structure
Create an Airtable Base with the following tables:

---

### Table 1: Transactions

**Fields:**

| Field Name | Type | Description | Configuration |
|------------|------|-------------|----------------|
| Date | Date | Transaction date | Format: YYYY-MM-DD |
| Source | Single Select | Where item came from | Options: StockX, eBay, Amazon, Other |
| Item Name | Single Line Text | Product name & details | Max 200 characters |
| Cost | Currency | Acquisition price | USD, 2 decimals |
| List Price | Currency | Shopify listing price | USD, 2 decimals |
| Profit | Currency | Calculated profit | Formula: {List Price} - {Cost} - 9 |
| Status | Single Select | Current order status | Options: Sourced, Listed, Sold, Shipped, Completed, Liquidated |
| Category | Single Select | Product category | Options: Footwear, Electronics, Luxury, Collectibles, Other |
| Margin % | Percent | Profit margin percentage | Formula: ({Profit} / {List Price}) * 100 |
| Days to Sale | Number | Days from sourcing to sale | Calculated field |
| Notes | Long Text | Additional details | No limit |
| Linked Records | Link to Records | Link to related weekly summaries | Links to Weekly Summary table |

**Views to Create:**

1. **Grid View - All Transactions** (Default)
   - Sort: Date descending
   - Filter: All records
   - Grouped by: Source (StockX, eBay, Amazon)

2. **Calendar View - Sourcing Timeline**
   - Field: Date
   - Shows: When items were acquired
   - Color by: Status

3. **Form View - Quick Entry**
   - Field order optimized for data entry
   - Pre-fill: Today's date
   - Read-only: Calculated fields (Profit, Margin %)

4. **Gallery View - High-Value Items**
   - Filter: Profit > $100
   - Sort: Profit descending
   - Shows high-margin opportunities

5. **Kanban View - Status Pipeline**
   - Stack by: Status
   - Cards show: Item Name, Profit, Days to Sale
   - Quick drag-and-drop status updates

---

### Table 2: Weekly Summary

**Fields:**

| Field Name | Type | Description |
|------------|------|-------------|
| Week Ending | Date | Sunday date of the week |
| Total Transactions | Count | =Count(linked Transactions) |
| Total Profit | Rollup | =Sum({Profit}) from linked Transactions |
| Avg Margin % | Rollup | =Avg({Margin %}) from linked Transactions |
| Completion Rate | Percent | Sold + Shipped + Completed / Total |
| StockX Units | Count | Filter: Source = StockX |
| StockX Profit | Rollup | Sum profit where Source = StockX |
| eBay Units | Count | Filter: Source = eBay |
| eBay Profit | Rollup | Sum profit where Source = eBay |
| Amazon Units | Count | Filter: Source = Amazon |
| Amazon Profit | Rollup | Sum profit where Source = Amazon |
| Notes | Long Text | Key insights & action items |
| Linked Transactions | Link to Records | Links to all transactions in the week |

**Views:**

1. **Grid View - Weekly Metrics** (Default)
   - Sort: Week Ending descending
   - Shows all summary metrics

2. **Summary View**
   - Chart: Total Profit by week (bar chart)
   - Chart: Avg Margin % by week (line chart)
   - Summary stats: Total profit YTD, avg transaction size

---

### Table 3: Categories

**Fields:**

| Field Name | Type | Description |
|------------|------|-------------|
| Category Name | Single Line Text | Product category |
| Target Margin % | Percent | Minimum acceptable margin |
| Target Min Profit | Currency | Minimum acceptable transaction profit |
| Items Sourced | Count | =Count(linked Transactions) |
| Total Profit | Rollup | =Sum({Profit}) from linked Transactions |
| Avg Profit | Rollup | =Avg({Profit}) from linked Transactions |
| Actual Margin % | Rollup | =Avg({Margin %}) from linked Transactions |
| Performance Status | Single Select | On Track, Exceeding, Below Target |
| Notes | Long Text | Category-specific insights |
| Linked Transactions | Link to Records | Links to all items in category |

**Sample Data:**
- Footwear/Sneakers: Target 24%, Min $50
- Electronics: Target 25%, Min $75
- Luxury Goods: Target 28%, Min $100
- Collectibles: Target 22%, Min $40

---

### Table 4: Sources

**Fields:**

| Field Name | Type | Description |
|------------|------|-------------|
| Source Name | Single Line Text | StockX, eBay, Amazon |
| Primary Contact | Email | Source contact/account |
| Total Items Sourced | Count | =Count(linked Transactions) |
| Total Profit | Rollup | =Sum({Profit}) from linked Transactions |
| Avg Margin % | Rollup | =Avg({Margin %}) from linked Transactions |
| Fastest Turnaround | Rollup | =Min({Days to Sale}) |
| Success Rate | Percent | Completed / Total * 100 |
| Notes | Long Text | Performance insights, sourcing tips |
| Linked Transactions | Link to Records | All transactions from this source |

---

## Automation Recipes

### Google Sheets Automations (via Zapier or IFTTT)

1. **Daily Email Summary**
   - Trigger: Every day at 5 PM
   - Action: Email yesterday's transactions + today's targets
   - Template: "Yesterday: $[Profit] profit from [Count] items"

2. **Weekly Report to Slack**
   - Trigger: Every Sunday at 6 PM
   - Action: Post weekly summary to #arbitrage-tracking channel
   - Format: Week profit, top item, completion rate

3. **Low Inventory Alert**
   - Trigger: When listed items < 5
   - Action: Slack notification
   - Message: "Listed inventory low - trigger sourcing run"

4. **High-Margin Notification**
   - Trigger: When new item added with profit > $150
   - Action: Slack message to team
   - Message: "High-margin opportunity: [Item Name] - $[Profit]"

---

### Airtable Automations

1. **Auto-Update Status Status when Sale Detected**
   - Trigger: New email received with Shopify order
   - Action: Find matching transaction, update Status → "Sold"
   - Set timestamp: Sold Date field

2. **Weekly Summary Auto-Create**
   - Trigger: Every Sunday at 11 PM
   - Action: Create new Weekly Summary record
   - Pre-fill: Week ending date, link all this week's transactions

3. **Category Performance Alert**
   - Trigger: Daily at 8 AM
   - Action: Compare each category's actual margin vs target
   - Notify if any category is 5%+ below target

4. **Profit Milestone Notification**
   - Trigger: Monthly rollup > $5,000
   - Action: Celebrate! Post to Slack with achievement badge

---

## Import Instructions

### Google Sheets
1. Open [Your Google Sheet Link]
2. Copy data from PREMEFTP_ARBITRAGE_LOG.md
3. Paste into Daily Log tab (Column A1)
4. Enable data validation (Data > Data validation)
5. Set up formulas in Summary & Dashboard tabs
6. Connect to Zapier for automations

### Airtable
1. Create new Base named "PREMEFTP Arbitrage"
2. Create tables per specifications above
3. Import transaction history from spreadsheet
4. Set up linked records between tables
5. Configure automations in Airtable
6. Create public dashboard view for stakeholders

---

## Real-Time KPI Display

**Recommended Metrics (Update Every Hour):**

```
┌──────────────────────────────────────────────┐
│  PREMEFTP ARBITRAGE DASHBOARD - LIVE          │
├──────────────────────────────────────────────┤
│                                              │
│  TODAY'S PROFIT: $287.45          ↑ 12%     │
│  THIS WEEK PROFIT: $1,240.50      ↑ 8%      │
│  MONTH PROFIT: $5,680.30          ↑ 15%     │
│                                              │
│  Items Listed: 23        Items Sold: 18     │
│  Avg Margin: 23.5%       Completion: 78%   │
│                                              │
│  Top Source: eBay ($492)                    │
│  Fastest Item: Jordan 4 (1.2 days)          │
│                                              │
│  ⚠ ACTION NEEDED: Electronics below target  │
│                                              │
└──────────────────────────────────────────────┘
```

**Setup Instructions:**
- Google Sheets: Use [INSERT > CHART] and filter charts to show live data
- Airtable: Use Interfaces or create public view with live filter blocks
- Alternative: Embed a custom dashboard using Looker Studio or similar BI tool

---

## Data Export & Backup

**Monthly Backup Schedule:**
- First of each month: Export all data to CSV
- Store in: `/arbitrage-logs/backups/[YYYY-MM].csv`
- Google Sheets: File > Download > CSV
- Airtable: Table > Download CSV

**Archive Strategy:**
- Keep current + previous 3 months in active dashboard
- Move older months to archive (folder: `/arbitrage-logs/archive/`)
- Retain for 12 months for annual reporting

---

## Quick Reference: Key Formulas

**Google Sheets:**
```
Daily Profit: =SUM(F2:F500)
Weekly Avg: =AVERAGE(F2:F52)
Margin %: =(E2-D2)/E2*100
Completion Rate: =COUNTIF(G2:G500,"Completed")/COUNTA(G2:G500)
Moving Average (7-day): =AVERAGE(F2:F8)
```

**Airtable:**
```
Profit: {List Price} - {Cost} - 9
Margin %: ({Profit} / {List Price}) * 100
Days to Sale: DATETIME_DIFF(IF({Status}="Completed",NOW(),BLANK()),{Date},"days")
Category Link: Link to Categories table
```

---

**Last Updated**: 2026-09-22  
**Template Version**: 1.0  
**Ready for Deployment**: Yes
