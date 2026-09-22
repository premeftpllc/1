# Phase 1 Pre-Launch Checklist: StockX Daily Arbitrage

**Project:** PremeFTP Shopify Arbitrage System  
**Phase:** 1 - Foundation & Daily Operations  
**Status:** Pre-Launch Preparation  
**Last Updated:** 2026-09-22

---

## Table of Contents
1. [Account Setup Checklist](#account-setup-checklist)
2. [Daily Workflow Checklist](#daily-workflow-checklist)
3. [Listing Checklist](#listing-checklist)
4. [Fulfillment Checklist](#fulfillment-checklist)
5. [Daily Close Checklist](#daily-close-checklist)
6. [Weekly Review Checklist](#weekly-review-checklist)
7. [Decision Trees](#decision-trees)
8. [Templates](#templates)
9. [Rollback Procedures](#rollback-procedures)

---

## Account Setup Checklist

### StockX Account Verification
- [ ] Create StockX seller account
- [ ] Verify email address
- [ ] Complete identity verification (ID + SSN)
- [ ] Confirm account status is "Verified Seller"
- [ ] Review StockX seller policies & fees (8-12% commission)
- [ ] Set up seller profile with business name
- [ ] Configure brand/category preferences (sneakers, streetwear, collectibles)
- [ ] Enable selling notifications
- [ ] Document account ID: `_______________`

### Payment Method Setup
- [ ] Add primary bank account for payouts
- [ ] Verify bank account (microdeposit confirmation)
- [ ] Set payout frequency preference (weekly/bi-weekly)
- [ ] Confirm minimum payout threshold ($100+)
- [ ] Add backup payment method (secondary account)
- [ ] Set up tax information (1099 tracking)
- [ ] Document payment account status: `_______________`

### Shipping Address Configuration
- [ ] Verify primary shipping address
- [ ] Confirm address matches StockX requirements
- [ ] Set up shipping label printer connection
- [ ] Test shipping label generation
- [ ] Configure carrier preferences (UPS/FedEx/USPS)
- [ ] Verify warehouse/storage location accessibility
- [ ] Document shipping provider API keys (encrypted)

### Authentication & Security Setup
- [ ] Enable 2-factor authentication (authenticator app)
- [ ] Set strong password (16+ characters, mixed case/numbers/symbols)
- [ ] Save recovery codes in secure location
- [ ] Set up IP whitelist (if available)
- [ ] Configure notification preferences for suspicious activity
- [ ] Review connected apps/integrations
- [ ] Document backup authentication method

**Account Setup Sign-Off:**
- [ ] All checklist items completed
- [ ] Account fully operational and tested
- [ ] Date Completed: `_______________`
- [ ] Verified By: `_______________`

---

## Daily Workflow Checklist

### 8 AM Morning Prep (Every Weekday)

#### Pre-Scan Setup
- [ ] Open StockX seller dashboard
- [ ] Check overnight order notifications
- [ ] Review pending shipments from yesterday
- [ ] Verify Shopify store is operational
- [ ] Check email for any alerts/notices
- [ ] Test StockX login + 2FA
- [ ] Review yesterday's closing metrics (if applicable)

#### Scan Preparation
- [ ] Clear workspace/preparation area
- [ ] Ensure shipping supplies ready (boxes, labels, tape)
- [ ] Charge phone/tablet if using for scanning
- [ ] Log into StockX mobile app
- [ ] Set filters for below-retail items
- [ ] Document start time: `_______________`

### Daily Scan Procedures (9 AM - 3 PM)

#### StockX Filter Configuration
```
StockX Search Filters:
- Category: [Sneakers/Streetwear/Collectibles]
- Condition: [DS (Deadstock) or VNDS]
- Price Range: [$0 - $150]
- Sort By: Lowest Price
- Show: Bid/Ask Spread
- Exclude: Account-flagged items
```

#### Item Evaluation Process
For each potential item:
1. [ ] Item passes below-retail filter
2. [ ] Verify StockX current ask price
3. [ ] Check Shopify/eBay recent sales comps
4. [ ] Calculate fees (8-12% StockX, Shopify ~3%, payment processing ~2.9%+$0.30)
5. [ ] Determine minimum resale price
6. [ ] Calculate profit margin (target: $50+)
7. [ ] Document in deal log

#### Deal Evaluation Criteria
- [ ] **Profit Threshold:** Minimum $50 net profit (after all fees)
- [ ] **Demand Signal:** Recent sold listings within last 7 days
- [ ] **Retail Status:** Item must be below original retail price
- [ ] **Authenticity:** StockX verified authentic items only
- [ ] **Condition:** DS or VNDS only (no defects)
- [ ] **Size:** Sellable sizing (avoid extremes unless high value)
- [ ] **Market Trend:** Not falling in price week-over-week
- [ ] **Time to Sell:** Estimated sale within 30 days

### Purchase Decision Framework

**Green Light (Purchase):**
- [ ] Profit > $75 and volume is good (3+ sold in 7 days)
- [ ] Profit $50-75 AND item sold in 3 days last sale
- [ ] Price is dropping <5% per week
- [ ] StockX bid/ask spread is <10%
- [ ] Item has 10+ sold listings this month

**Yellow Flag (Evaluate Carefully):**
- [ ] Profit $50-75 AND slow velocity (sold 1-2 times per month)
- [ ] Price dropping 5-10% per week
- [ ] StockX bid/ask spread is 10-20%
- [ ] Item has 5-10 sold listings this month
- Decision: Proceed only if profit + certainty warrant the risk

**Red Light (Pass):**
- [ ] Profit < $50
- [ ] No recent sales history (0 sold in 30 days)
- [ ] Price dropping >10% per week
- [ ] StockX bid/ask spread >20%
- [ ] Condition concerns or potential authenticity questions
- [ ] Size/model has consistently low sales

### Checkout Procedures

#### Pre-Purchase Verification
- [ ] Confirm item price hasn't changed since evaluation
- [ ] Verify resale target price is still achievable
- [ ] Confirm profit calculation is accurate
- [ ] Double-check shipping address
- [ ] Verify payment method has available funds

#### Purchase Execution
- [ ] Add item to StockX cart
- [ ] Review order summary
- [ ] Apply any available seller discounts/coupons
- [ ] Confirm shipping method (fastest for arbitrage)
- [ ] Complete payment
- [ ] Screenshot order confirmation
- [ ] Log order details in daily log

#### Post-Purchase
- [ ] Save order number: `_______________`
- [ ] Note estimated delivery date
- [ ] Set calendar reminder for expected delivery
- [ ] Document in tracking spreadsheet
- [ ] Move to "Pending Inventory" status in Shopify

**Daily Scan Summary:**
- Time Started: `_______________`
- Time Ended: `_______________`
- Items Evaluated: `_______________`
- Items Purchased: `_______________`
- Total Investment: `_______________`
- Projected Total Profit: `_______________`

---

## Listing Checklist

### Pre-Listing Preparation (Upon Item Receipt)

#### Item Inspection
- [ ] Item received and matches StockX description
- [ ] Packaging condition verified
- [ ] Product condition matches expected (DS/VNDS)
- [ ] All tags/materials present
- [ ] No defects visible
- [ ] Size/model matches listing
- [ ] Serial/authentication numbers noted

#### Photography Setup
- [ ] Clean, neutral background prepared
- [ ] Lighting optimized (natural or consistent)
- [ ] Photo backgrounds are white or light neutral
- [ ] Multiple angles captured (front, back, side, detail shots)
- [ ] Tags/labels clearly visible
- [ ] Size label visible in at least one photo
- [ ] High resolution images (2000+ pixels)
- [ ] Consistent image naming convention

### Shopify Product Setup

#### Basic Information
- [ ] Product title: `[Brand] [Model] [Size] [Colorway]`
- [ ] Product handle/URL slug: `brand-model-size-colorway` (no spaces)
- [ ] Product collection assigned: `[Category]`
- [ ] Vendor name: `PremeFTP` (or business name)
- [ ] Product type: `[Sneakers/Streetwear/Collectibles]`
- [ ] Tags assigned: `#brand #size #category #condition:deadstock`

#### Pricing Calculation

**Formula:**
```
Resale Price = Cost + (Desired Profit / (1 - Total Fees))
Total Fees = StockX Fees (8-12%) + Shopify Fees (2.9%) + Payment Processing (2.9% + $0.30)
Approximate Total Fees = ~15% + $0.30

Example:
Cost: $100 (from StockX)
Desired Profit: $75
Total Fees: ~18 ($100 × 15% + $0.30)
Resale Price = $100 + ($75 / (1 - 0.15)) = $100 + $88.24 = $188.24
Actual Profit: ~$70 (after fees)

ROUND TO: $188.99 or $189.99 (psychological pricing)
```

- [ ] Actual cost documented: $`_______________`
- [ ] Fee calculation verified: $`_______________`
- [ ] Target profit entered: $`_______________`
- [ ] Resale price calculated: $`_______________`
- [ ] Resale price set in Shopify: $`_______________`
- [ ] Sale price/discount (if any): $`_______________`

#### Description & SEO Optimization

**Product Description Template:**
```
[BRAND] [MODEL] - [COLORWAY]
Size: [US SIZE]
Condition: Deadstock (DS) - Brand New, Never Worn

DETAILS:
• Original Retail Price: $[XXX]
• Color: [Colorway Description]
• Release Year: [Year]
• Includes: Original Box, Tags, All Materials

AUTHENTICITY:
✓ 100% Authentic - Verified by StockX
✓ Original Materials & Construction
✓ Unaltered, Complete with all Tags

CONDITION:
Deadstock condition - unworn, pristine, complete with all original materials including box, tags, and insoles.

[Brand] History:
[2-3 sentences about brand/model significance]

Ships within 24 hours. Full tracking provided.
Questions? Message us anytime.
```

- [ ] Description is unique and detailed
- [ ] Key search terms included: brand, model, size, colorway
- [ ] Authenticity emphasized
- [ ] Condition clearly stated
- [ ] Pricing context provided (original retail price)
- [ ] Shipping terms mentioned
- [ ] Call-to-action included

#### Image Handling

- [ ] Main image: High-quality, well-lit product shot
- [ ] Image 2-3: Multiple angles of product
- [ ] Image 4: Size/label detail
- [ ] Image 5: Tags/authenticity details
- [ ] Image 6: Original box (if included)
- [ ] File names optimized: `brand-model-color-angle-01.jpg`
- [ ] All images compressed for web but high quality
- [ ] Alt text added: `[Brand] [Model] - [Colorway] - Size [X]`

### Inventory Management

- [ ] Item marked as "In Stock" in Shopify
- [ ] Quantity set to 1 (single item)
- [ ] SKU assigned: `[BRAND]-[MODEL]-[SIZE]-[DATE]`
- [ ] Barcode linked (if applicable)
- [ ] Tracking number saved in order notes
- [ ] Physical storage location noted: `_______________`
- [ ] Backup stored in internal database

### Listing Verification

- [ ] Preview listing in storefront
- [ ] All images load correctly
- [ ] Pricing displays correctly
- [ ] Description renders properly
- [ ] Mobile view tested
- [ ] SEO information complete
- [ ] Product is searchable and visible
- [ ] Announcement/collection page updated (if applicable)

**Listing Completion Sign-Off:**
- [ ] All items listed and verified
- [ ] Number of items listed: `_______________`
- [ ] Date Listed: `_______________`
- [ ] Listed By: `_______________`

---

## Fulfillment Checklist

### Order Receipt & Processing (Customer Places Order)

#### Immediate Actions (Within 1 Hour)
- [ ] Email notification received from Shopify
- [ ] Order details reviewed in Shopify admin
- [ ] Customer shipping address verified
- [ ] Payment confirmed and captured
- [ ] Customer contact info saved
- [ ] Order ID noted: `_______________`
- [ ] Payment amount verified: $`_______________`

#### Order Status Update
- [ ] Shopify order status updated to "Processing"
- [ ] Inventory quantity updated to 0
- [ ] Customer sent automated confirmation email
- [ ] Internal fulfillment log updated

### Shipping Label Creation

#### Before Creating Label
- [ ] Verify customer shipping address format
- [ ] Confirm address is eligible for shipping
- [ ] Check for any special shipping instructions
- [ ] Review signature required options (if needed)
- [ ] Determine shipping carrier (UPS/FedEx/USPS recommended)
- [ ] Select service level: Ground (3-5 business days) or Expedited

#### Label Generation
- [ ] Access Shopify shipping label tool
- [ ] Generate label via preferred carrier integration
- [ ] Verify carrier and service level
- [ ] Confirm delivery estimate
- [ ] Download and print shipping label
- [ ] Label number saved: `_______________`
- [ ] Tracking number saved: `_______________`
- [ ] Tracking added to Shopify order
- [ ] Backup tracking number saved in spreadsheet

#### Label Verification
- [ ] Tracking barcode is readable
- [ ] Customer name and address clear
- [ ] Return address correct
- [ ] Carrier information accurate
- [ ] Service level matches order expectations

### Package Preparation Procedures

#### Packing Materials Setup
- [ ] Box/mailer selected (appropriate size for product)
- [ ] Tissue paper or filler prepared
- [ ] Thank you card/insert prepared
- [ ] Branded packing tape ready
- [ ] Fragile stickers (if applicable)
- [ ] Desiccant packets (moisture control, if needed)

#### Product Preparation
- [ ] Product removed from storage
- [ ] Final condition inspection
- [ ] Product matches order details
- [ ] Protective wrapping applied
- [ ] Product placed in protective bag/tissue
- [ ] Product centered in box

#### Box Assembly
- [ ] Layer of filler at box bottom
- [ ] Product placed on filler
- [ ] Thank you card/insert included
- [ ] Additional filler around product
- [ ] Box sealed securely with branded tape
- [ ] Tape covers all seams
- [ ] Box feels stable, no shifting

#### Shipping Label Application
- [ ] Shipping label applied to largest surface
- [ ] Label is centered and straight
- [ ] Barcode is completely visible
- [ ] Label protected from moisture (clear tape layer)
- [ ] Return address visible
- [ ] No label obstructing barcode

#### Box Verification
- [ ] Box weight recorded: `_______________` lbs
- [ ] Dimensions match label expectations
- [ ] Box appearance professional
- [ ] All labels secure and readable
- [ ] Box ready for carrier pickup
- [ ] Final photo taken (proof of shipment)

#### Carrier Pickup
- [ ] Carrier notified of pickup
- [ ] Carrier confirms pickup time
- [ ] Box placed in designated area
- [ ] Pickup confirmation received
- [ ] Tracking status updated to "Shipped"
- [ ] Proof of shipment saved (receipt/photo)

### Tracking Updates

#### Day of Shipment
- [ ] Tracking number verified in carrier system
- [ ] Tracking added to Shopify order
- [ ] Customer sent "Order Shipped" email
- [ ] Estimated delivery date noted: `_______________`
- [ ] Tracking link shared with customer

#### During Transit
- [ ] Tracking monitored for status updates
- [ ] Any delays noted
- [ ] Customer notified of delays (if applicable)
- [ ] Expected delivery date confirmed

#### Delivery Day
- [ ] Tracking shows "Delivered"
- [ ] Delivery signature/photo (if applicable) confirmed
- [ ] Shopify order status updated to "Fulfilled"
- [ ] Customer experience survey sent (if applicable)
- [ ] Tracking marked as complete in internal log

### Customer Communication

#### Pre-Shipment Communication
- [ ] Shipping notification includes tracking number
- [ ] Estimated delivery timeline provided
- [ ] Brand messaging/thank you included
- [ ] Return policy referenced (if applicable)

#### During Transit
- [ ] Only notify if delivery delayed >2 days
- [ ] Update includes revised delivery estimate
- [ ] Professional and reassuring tone

#### Post-Delivery Follow-Up
- [ ] Thank you message sent
- [ ] Feedback/review request included
- [ ] Contact info provided for questions
- [ ] Social media follow encouragement
- [ ] Satisfaction confirmation

**Fulfillment Summary:**
- Orders Received Today: `_______________`
- Orders Shipped Today: `_______________`
- Average Fulfillment Time: `_______________` hours
- No Issues Orders: `_______________`

---

## Daily Close Checklist

### Transaction Logging (5 PM - 6 PM)

#### Shopify Order Reconciliation
- [ ] Access Shopify Orders dashboard
- [ ] Filter by date: Today's date
- [ ] Count total orders received: `_______________`
- [ ] Total revenue (before fees): $`_______________`
- [ ] Count fulfilled orders: `_______________`
- [ ] Count pending fulfillment: `_______________`
- [ ] Any payment issues noted: `_______________`

#### StockX Transaction Logging
- [ ] Access StockX seller dashboard
- [ ] Review today's purchase history
- [ ] Count items purchased: `_______________`
- [ ] Total amount spent: $`_______________`
- [ ] Commissions paid: $`_______________`
- [ ] Pending inventory value: $`_______________`

#### Internal Dashboard Update
- [ ] Open daily tracking spreadsheet
- [ ] Date entry: `_______________`
- [ ] StockX purchases logged (item details, cost, profit projection)
- [ ] Shopify sales logged (item name, sale price, profit)
- [ ] Running inventory count updated
- [ ] Running cash flow projection updated

### Profit Calculation & Verification

#### Sales Profit Verification
For each sale closed today:
```
Formula: 
Sale Price - Cost - All Fees = Net Profit

Fees Include:
- StockX Purchase Fees: 8-12% of purchase price
- Shopify Transaction Fee: 2.9% of sale price
- Payment Processing: 2.9% + $0.30
- Shipping: [Actual cost if you paid]

Example:
Sale Price: $188.99
- Cost (including StockX fees): $115
- Shopify Fee (2.9%): $5.48
- Payment Processing: $5.75
- Net Profit: $188.99 - $115 - $5.48 - $5.75 = $62.76
```

- [ ] Each sale profit calculation verified
- [ ] Total sales profit calculated: $`_______________`
- [ ] All fees accounted for
- [ ] Discrepancies investigated (if any)
- [ ] Profit entry logged in spreadsheet

#### Pending Inventory Valuation
- [ ] Count items in warehouse (physical or documented)
- [ ] Inventory count: `_______________` items
- [ ] Total cost of pending inventory: $`_______________`
- [ ] Projected profit on pending inventory: $`_______________`
- [ ] Inventory value logged

#### Daily Metrics Summary
- [ ] Gross profit (sales only): $`_______________`
- [ ] Gross margin (percentage): `_______________` %
- [ ] Cash invested (purchases): $`_______________`
- [ ] Cash received (sales): $`_______________`
- [ ] Net cash flow: $`_______________`
- [ ] Active inventory items: `_______________`
- [ ] Items waiting to ship: `_______________`

### Tomorrow Preparation

#### Pipeline Review
- [ ] Review items expected to arrive tomorrow
- [ ] Confirm receiving location is ready
- [ ] Prepare photography area for incoming items
- [ ] List items to prioritize photographing: `_______________`

#### Price Monitoring
- [ ] Identify top 5 items in inventory by value
- [ ] Check current market prices on each
- [ ] Any significant price drops noted: `_______________`
- [ ] Adjust Shopify prices if necessary (document changes)

#### Scan Planning
- [ ] Review yesterday's scan results
- [ ] Identify successful categories
- [ ] Note underperforming categories
- [ ] Plan focus areas for tomorrow's scan
- [ ] Scan schedule confirmed: `_______________` (time)

#### Issues & Notes
- [ ] Any orders with issues noted
- [ ] StockX account issues noted
- [ ] Shopify technical issues noted
- [ ] Customer service issues noted
- [ ] Follow-up items listed: `_______________`

### Performance Metrics Tracking

#### Daily KPIs
```
Date: [_______________]

SALES METRICS:
- Orders Received: [___]
- Items Sold: [___]
- Average Sale Price: $[___]
- Total Revenue: $[___]
- Total Costs (COGS): $[___]
- Gross Profit: $[___]
- Gross Margin %: [___]%

OPERATIONAL METRICS:
- Items Scanned: [___]
- Items Purchased: [___]
- Conversion Rate: [___]%
- Fulfillment Time (Avg): [___] hrs
- Inventory Turnover: [___] days

FINANCIAL METRICS:
- Cash Invested: $[___]
- Cash Received: $[___]
- Net Cash Flow: $[___]
- ROI (Daily): [___]%
- Runway (Days): [___]
```

- [ ] All KPIs calculated
- [ ] Metrics compared to previous day
- [ ] Trends identified
- [ ] Entry logged in master metrics file

### Daily Close Sign-Off
- [ ] All transactions logged
- [ ] Profit calculations verified
- [ ] Inventory accounted for
- [ ] Tomorrow prep complete
- [ ] Dashboard updated
- [ ] Time Completed: `_______________`
- [ ] Verified By: `_______________`
- [ ] Notes/Issues: `_______________`

---

## Weekly Review Checklist

### Performance Analysis (Friday 5 PM)

#### Weekly Sales Review
- [ ] Total orders received this week: `_______________`
- [ ] Total items sold: `_______________`
- [ ] Total revenue: $`_______________`
- [ ] Total COGS (cost of goods): $`_______________`
- [ ] Total gross profit: $`_______________`
- [ ] Weekly gross margin: `_______________` %
- [ ] Best-performing item: `_______________` (profit: $`_______________`)
- [ ] Slowest item: `_______________`

#### Weekly Scan Analysis
- [ ] Total items scanned: `_______________`
- [ ] Total items purchased: `_______________`
- [ ] Conversion rate (purchases/scanned): `_______________` %
- [ ] Total amount invested: $`_______________`
- [ ] Average profit per purchase: $`_______________`
- [ ] Most profitable category: `_______________`
- [ ] Underperforming category: `_______________`

#### Operational Efficiency
- [ ] Average fulfillment time: `_______________` hours
- [ ] On-time shipment rate: `_______________` %
- [ ] Customer feedback/complaints: `_______________` (number)
- [ ] Return requests: `_______________` (number)
- [ ] Issues resolved: `_______________` (number)

#### Inventory Status
- [ ] Starting inventory: `_______________` items
- [ ] Items received: `_______________`
- [ ] Items sold: `_______________`
- [ ] Ending inventory: `_______________` items
- [ ] Total inventory value: $`_______________`
- [ ] Oldest item in inventory: `_______________` (date received)
- [ ] Average days in inventory: `_______________` days
- [ ] Inventory turnover rate: `_______________` x/week

### Margin Verification

#### Cost Analysis
- [ ] Average purchase price (from StockX): $`_______________`
- [ ] Average purchase cost including fees: $`_______________`
- [ ] Average resale price: $`_______________`
- [ ] Average revenue per sale: $`_______________`

#### Fee Analysis
- [ ] Total StockX fees paid: $`_______________`
- [ ] Total Shopify transaction fees: $`_______________`
- [ ] Total payment processing fees: $`_______________`
- [ ] Total shipping costs: $`_______________`
- [ ] Total fees as % of revenue: `_______________` %

#### Margin Breakdown
- [ ] Average profit margin: $`_______________`
- [ ] Average profit margin percentage: `_______________` %
- [ ] Target margin: $`_______________` (minimum)
- [ ] Margin vs. target: `_______________` (on/below target)
- [ ] Margin trend (vs. last week): `_______________` (up/down)

#### Price Adjustments Review
- [ ] Items with prices adjusted: `_______________` (count)
- [ ] Average price adjustment: `_______________` %
- [ ] Reasons for adjustments: `_______________`
- [ ] Impact on profitability: `_______________`

### Pipeline Review

#### Inventory Aging Analysis
- [ ] Items in inventory >14 days: `_______________` (count)
- [ ] Items in inventory >21 days: `_______________` (count)
- [ ] Items in inventory >30 days: `_______________` (count)
- [ ] Action items for slow-moving inventory:
  - [ ] Review pricing for items >21 days
  - [ ] Consider promotional pricing
  - [ ] List on alternative platforms
  - [ ] Document reasons for poor performance

#### Upcoming Deliveries
- [ ] Items due to arrive this week: `_______________` (count)
- [ ] Items due to arrive next week: `_______________` (count)
- [ ] Highest-value item arriving: `_______________` (value: $`_______________`)
- [ ] Photography schedule prepared: Yes / No
- [ ] Storage capacity confirmed: Yes / No

#### Cash Flow Projection
- [ ] Current cash on hand: $`_______________`
- [ ] Expected payouts from Shopify/StockX: $`_______________`
- [ ] Planned purchases next week: $`_______________`
- [ ] Projected cash position (7 days): $`_______________`
- [ ] Cash runway (without new purchases): `_______________` days

### Issues & Learning

#### Customer Service Issues
- [ ] Issue descriptions: `_______________`
- [ ] Number of issues: `_______________`
- [ ] Issues resolved: `_______________`
- [ ] Outstanding issues: `_______________`
- [ ] Follow-up actions:
  - [ ] `_______________`
  - [ ] `_______________`

#### Operational Issues
- [ ] Shipping delays: Yes / No (count: `_______________`)
- [ ] Payment processing issues: Yes / No
- [ ] StockX account issues: Yes / No
- [ ] Shopify technical issues: Yes / No
- [ ] Product quality issues: Yes / No (count: `_______________`)
- [ ] Authentication concerns: Yes / No

#### Market Observations
- [ ] Top-performing brands/models: `_______________`
- [ ] Declining categories: `_______________`
- [ ] New opportunities identified: `_______________`
- [ ] Price trend observations: `_______________`
- [ ] Competitor activity noted: `_______________`

#### Action Items for Next Week
1. [ ] `_______________`
2. [ ] `_______________`
3. [ ] `_______________`
4. [ ] `_______________`
5. [ ] `_______________`

### Weekly Sign-Off
- [ ] All metrics calculated
- [ ] Performance analyzed
- [ ] Margin verified
- [ ] Issues documented
- [ ] Next week planned
- [ ] Review Completed By: `_______________`
- [ ] Date: `_______________`
- [ ] Next Review Date: `_______________`

---

## Decision Trees

### Deal Evaluation Decision Tree

```
POTENTIAL DEAL IDENTIFIED
        ↓
  [Check Price]
        ↓
Is Price < Original Retail?
  ├─ NO → PASS (arbitrage opportunity requires discount)
  └─ YES ↓
        ├─ [Check Demand]
        ├─ Has 3+ sales in last 7 days?
        │  ├─ NO → [Evaluate Carefully]
        │  │       └─ Is price dropping <5% weekly AND profit >$75?
        │  │          ├─ YES → PROCEED
        │  │          └─ NO → PASS
        │  └─ YES ↓
        │         ├─ [Calculate Fees & Profit]
        │         └─ Is Profit > $50?
        │            ├─ NO → PASS (below margin threshold)
        │            └─ YES ↓
        │                   ├─ Profit $50-75?
        │                   │  ├─ YES → [Check Market Velocity]
        │                   │  │        └─ Sold in 3 days?
        │                   │  │           ├─ YES → PURCHASE
        │                   │  │           └─ NO → PASS
        │                   │  └─ NO (Profit >$75) → PURCHASE
        │
        └─ [Verify Details]
           ├─ Authentic (StockX verified)?
           │  └─ NO → PASS
           ├─ Condition DS/VNDS?
           │  └─ NO → PASS
           ├─ No known defects?
           │  └─ NO → PASS
           └─ All checks pass?
              └─ YES → PROCEED TO PURCHASE
```

### Pricing Decision Tree

```
ITEM RECEIVED & READY TO LIST
        ↓
   [Calculate COGS]
   (Include StockX fees)
        ↓
   [Determine Target Profit]
   Target = $75+ for volume, $50+ minimum
        ↓
   [Calculate Resale Price]
   Formula: Cost + (Profit / (1 - Fee %))
        ↓
   [Check Market Comps]
   └─ Recent sales at similar price?
      ├─ NO → Adjust target profit down
      └─ YES ↓
             └─ Set Price 5-10% below highest
                recent comp (psychological
                pricing at .99 or .95)
        ↓
   [Final Price Review]
   └─ Price allows $50+ profit?
      ├─ NO → Renegotiate or
      │       consider alternative channel
      └─ YES → LIST ITEM
```

### Slow-Moving Inventory Decision Tree

```
ITEM IN INVENTORY >14 DAYS
        ↓
   [Review Sales Data]
   └─ Similar items selling?
      ├─ NO (Category unpopular) → [Option A]
      └─ YES (Price issue) → [Option B]
      
[OPTION A: Adjust Category Strategy]
- Remove from Shopify
- List on secondary platform (eBay, Depop, Grailed)
- OR accept loss, use for marketing/test
        ↓
   Sold?
   ├─ YES → Document learning
   └─ NO → [Rollback: Return to StockX resale if possible]

[OPTION B: Repricing Strategy]
- Reduce price 10-15%
- Ensure still covers costs + $25+ profit
- Monitor for 7 days
        ↓
   Sold within 7 days?
   ├─ YES → Price was issue, update future strategy
   └─ NO (Still >21 days) → [Option A]

FALLBACK (Item >30 days):
- Reduce price to cost + $10 (break-even+)
- List for clearance
- Document reason for failure
- Analyze if similar items should be avoided
```

### Fulfillment Issue Decision Tree

```
ORDER PLACED
        ↓
   [Verify Address]
   └─ Address valid & deliverable?
      ├─ NO → Contact Customer
      │       └─ Clarify/Correct Address
      │          → Update in Shopify
      └─ YES ↓
             └─ [Prepare Shipment]
                └─ Ship within 24 hrs
                   ↓
        [Package Delivered]
        ↓
   Customer satisfied?
   ├─ NO (Issue reported) → [Investigate]
   │                        ├─ Damaged item?
   │                        │  └─ Offer refund/replacement
   │                        ├─ Wrong item?
   │                        │  └─ Send correct item + return label
   │                        └─ Other?
   │                           └─ Contact customer, resolve
   └─ YES → Close Order, Request Review
```

---

## Templates

### Daily Deal Evaluation Log Template

```
DATE: _______________

ITEM #1
├─ StockX Price: $_______________
├─ Demand (sales/7 days): _______________
├─ Profit Projection: $_______________
├─ Decision: ☐ PURCHASE ☐ PASS ☐ HOLD
└─ Notes: _______________

ITEM #2
├─ StockX Price: $_______________
├─ Demand (sales/7 days): _______________
├─ Profit Projection: $_______________
├─ Decision: ☐ PURCHASE ☐ PASS ☐ HOLD
└─ Notes: _______________

[REPEAT AS NEEDED]

DAILY SUMMARY:
- Total Items Evaluated: _______________
- Items Purchased: _______________
- Items Passed: _______________
- Total Investment: $_______________
- Total Projected Profit: $_______________
- Conversion Rate: ________________%
```

### Order Fulfillment Template

```
ORDER DETAILS:
├─ Order ID: _______________
├─ Order Date: _______________
├─ Customer Name: _______________
├─ Shipping Address: _______________
└─ Order Total: $_______________

ITEM DETAILS:
├─ Item Name: _______________
├─ Item SKU: _______________
├─ Purchase Cost: $_______________
├─ Sale Price: $_______________
├─ Profit: $_______________
└─ Tracking: _______________

FULFILLMENT TIMELINE:
├─ Order Received: _______________
├─ Label Created: _______________
├─ Shipped: _______________
├─ Delivered: _______________
└─ Signature/Photo: _______________

NOTES:
_______________
```

### Weekly Performance Summary Template

```
WEEK OF: _______________

SALES METRICS:
├─ Orders: _______________
├─ Revenue: $_______________
├─ COGS: $_______________
├─ Gross Profit: $_______________
└─ Margin: ________________%

OPERATIONAL METRICS:
├─ Items Scanned: _______________
├─ Items Purchased: _______________
├─ Conversion Rate: ________________%
├─ Avg Profit/Item: $_______________
└─ Inventory Turnover: _______________x

ISSUES & LEARNINGS:
- Top Performer: _______________ ($_______________)
- Best Category: _______________
- Slowest Item: _______________ (Days: _______________)
- Issues: _______________
- Action Items: _______________

WEEK RATING: ☐ Excellent ☐ Good ☐ Needs Improvement
NOTES: _______________
```

### Pricing Calculation Template

```
ITEM: _______________
DATE: _______________

COST CALCULATION:
├─ StockX Purchase Price: $_______________
├─ StockX Fees (8-12%): $_______________
├─ Total Cost: $_______________

PROFIT TARGET: $_______________

FEE ASSUMPTIONS (Resale):
├─ Shopify Fee (2.9%): $_______________
├─ Payment Processing (2.9% + $0.30): $_______________
├─ Shipping (if included): $_______________
└─ Total Fees (15%): _______________% of sale price

CALCULATION:
├─ Target Revenue = Cost + (Profit / (1 - Fee %))
├─ Calculation: $___ + ($_____ / (1 - 0.15))
└─ Resale Price: $_______________

MARKET CHECK:
├─ Recent Comps: $_______________
├─ Price Within Range: ☐ YES ☐ NO
├─ Final Price (psychological): $_______________
└─ Actual Profit: $_______________

APPROVAL:
├─ Profit Acceptable: ☐ YES ☐ NO
├─ Approved By: _______________
└─ Listed Date: _______________
```

---

## Rollback Procedures

### Account Setup Rollback

If account setup fails or needs to be restarted:

1. **De-activation Sequence:**
   - [ ] Document current account status
   - [ ] Disable 2FA temporarily if needed
   - [ ] Export all account data/history
   - [ ] Contact StockX support if issue is account-related
   - [ ] Close existing sessions
   - [ ] Request account deletion/reset (if necessary)

2. **Recovery Steps:**
   - [ ] Restart identity verification process
   - [ ] Re-submit all documentation
   - [ ] Wait for verification (typically 24-48 hrs)
   - [ ] Re-enable security features
   - [ ] Verify payment method connection
   - [ ] Run test transaction (small purchase)

### Deal Rollback (Accidental Purchase)

If a purchase was made in error:

1. **Immediate Action (Within 15 minutes):**
   - [ ] Contact StockX support immediately
   - [ ] Provide order number
   - [ ] Request cancellation before shipment
   - [ ] Success rate: ~90% if within 15 mins

2. **If Cancelled Successfully:**
   - [ ] Confirm refund in payment method (3-5 business days)
   - [ ] Update tracking spreadsheet (mark as cancelled)
   - [ ] Document reason for cancellation
   - [ ] Analyze what caused the error

3. **If Cancellation Fails:**
   - [ ] Accept item upon receipt
   - [ ] Relist on Shopify or alternative platform
   - [ ] OR return/resell on StockX at loss
   - [ ] Document loss for accounting

### Pricing Correction

If item is priced incorrectly in Shopify:

1. **Before Any Sales:**
   - [ ] Update price immediately
   - [ ] Remove from search if priced too low
   - [ ] Update product description
   - [ ] Note correction in order log

2. **After Sale at Wrong Price:**
   - [ ] Assess profit impact
   - [ ] If still profitable: fulfill normally, document loss
   - [ ] If break-even or loss:
     - Contact customer
     - Offer upgrade (premium shipping, extras)
     - Request manual adjustment
     - OR accept loss, flag for future caution

### Fulfillment Rollback

If an order needs to be cancelled or reversed:

1. **Before Shipment:**
   - [ ] Cancel label/shipping if not yet shipped
   - [ ] Refund customer in Shopify
   - [ ] Update inventory (re-add item)
   - [ ] Document reason for cancellation
   - [ ] Item ready for re-listing

2. **After Shipment (Return Requested):**
   - [ ] Provide return shipping label
   - [ ] Monitor return shipment
   - [ ] Inspect returned item upon receipt
   - [ ] Assess condition (was it damaged in transit?)
   - [ ] Refund customer for full order
   - [ ] Re-list item or accept loss
   - [ ] Document in customer service log

### Inventory Loss Rollback

If an item goes missing or is damaged:

1. **Investigation:**
   - [ ] Verify item is truly missing (not just misplaced)
   - [ ] Check all storage locations
   - [ ] Review video surveillance (if available)
   - [ ] Check shipping records (verify shipment)

2. **Resolution:**
   - [ ] Accept inventory loss
   - [ ] Calculate financial impact
   - [ ] Update inventory count
   - [ ] Adjust accounting records
   - [ ] Document incident type
   - [ ] Implement prevention measures

---

## Launch Readiness Checklist

### Final Go/No-Go Decision

Before launching Phase 1, verify all of the following:

**Account & Setup (Critical)**
- [ ] StockX account fully verified and operational
- [ ] Payment method tested (test transaction completed)
- [ ] Shipping address configured
- [ ] 2FA enabled and backup codes saved
- [ ] Shopify store live and tested
- [ ] Inventory management system ready
- [ ] All staff trained on procedures

**Processes & Systems (Critical)**
- [ ] All checklists reviewed and customized
- [ ] Pricing formula tested with real items
- [ ] Profit calculation verified (sample calculation completed)
- [ ] Fulfillment process run through (mock order)
- [ ] Tracking system operational
- [ ] Daily logging system ready
- [ ] Dashboard/metrics system prepared

**Financial (Critical)**
- [ ] Startup capital secured: $`_______________`
- [ ] First week purchase budget: $`_______________`
- [ ] Cash flow projection completed
- [ ] Emergency fund allocated: $`_______________`
- [ ] Accounting/tax setup complete

**Staffing & Training (Critical)**
- [ ] Primary operator trained on all procedures
- [ ] Backup operator trained (if applicable)
- [ ] Support contacts documented
- [ ] Escalation procedures defined
- [ ] Time commitment verified (can dedicate 4-6 hours/day)

**Risk Mitigation**
- [ ] Insurance reviewed (if applicable)
- [ ] Return/refund policy drafted
- [ ] Customer communication templates ready
- [ ] Issue escalation procedures defined
- [ ] Rollback procedures documented

**Documentation**
- [ ] All checklists printed or digital access confirmed
- [ ] Templates accessible
- [ ] Decision trees available
- [ ] Policies documented
- [ ] Contact list prepared

**Final Signoff**
- [ ] All items above are COMPLETE ☐ YES ☐ NO
- [ ] Launch approved by: `_______________`
- [ ] Launch date: `_______________`
- [ ] Launch time: `_______________`

---

## Additional Resources

### Key Contact Information
- **StockX Seller Support:** support@stockx.com | 1-800-XXX-XXXX
- **Shopify Support:** help.shopify.com | In-app support
- **Payment Processor:** [Contact info]
- **Backup/Support:** [Name] - [Phone] - [Email]

### Useful Links
- StockX Seller Dashboard: https://stockx.com/sell
- Shopify Admin: https://admin.shopify.com
- Shipping Label Generator: [Link]
- Pricing Calculator (template): [Link]
- Daily Metrics Spreadsheet: [Link]

### Fee Reference
```
STANDARD FEE BREAKDOWN (as of Sept 2026):
- StockX Purchase Commission: 8-12% (varies by category)
- Shopify Transaction Fee: 2.9% of sale price
- Payment Processing: 2.9% + $0.30 per transaction
- Estimated Total Fees: ~15% of sale price + $0.30

Example:
Sale: $200
- Shopify: $5.80
- Payment: $6.10
- Total Fees: ~$12 (6% effective rate)
```

### Emergency Procedures
- **Account Locked:** Contact StockX support, provide identity verification
- **Payment Declined:** Verify funds, add backup payment method, retry
- **Item Lost in Shipping:** File claim with carrier, contact StockX
- **Customer Complaint:** Investigate immediately, offer resolution, document
- **System Outage:** Use backup manual processes, resume when online

---

**Document Version:** 1.0  
**Created:** 2026-09-22  
**Last Updated:** 2026-09-22  
**Next Review Date:** 2026-09-29 (after launch)  
**Owner:** PremeFTP Operations Team

---

*This checklist is a living document. Update based on actual operations, lessons learned, and market feedback. Review weekly during Phase 1 launch to optimize procedures.*
