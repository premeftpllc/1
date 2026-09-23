# SNKRS Automation - Detailed Architecture & Implementation

**Status:** DESIGN PHASE (Week 2)  
**Target:** Deployment-ready by Friday  
**Expected ROI:** $600-2,400/month  

---

## 🏗️ System Architecture Overview

```
SNKRS Drops (StockX)
    ↓ (Webhook + Polling)
    ↓
Make.com Scenario 6500+
    ├─→ Module 1: Receive Data
    ├─→ Module 2: Query Inventory
    ├─→ Module 3: Calculate Profit
    ├─→ Module 4: Filter Thresholds
    ├─→ Module 5: Source Inventory
    ├─→ Module 6: Create Listing
    ├─→ Module 7: Log Opportunity
    ├─→ Module 8: Send Alert
    ├─→ Module 9: Track Sales
    └─→ Modules 10-15: Error handling, retry, dedup
    ↓
Output Streams:
├─ Shopify (Listed products)
├─ Airtable (Opportunity log)
├─ Discord (Real-time alerts)
└─ Revenue Stream ($600-2.4K/month)
```

---

## 📦 MODULE SPECIFICATIONS (15 Total)

### **CORE MODULES (1-9)**

#### **Module 1: Receive Webhook / Polling**
```
Type: Trigger
Input: SNKRS drop webhook OR StockX API poll
Output: {model, size, price, timestamp, msrp}

Configuration:
  - Webhook endpoint: /snkrs-drops
  - Polling interval: 15 minutes (backup)
  - Event filter: price < MSRP * 0.95
  
Data Flow:
  model: "Nike Air Max 90"
  size: "US 10"
  price: 85
  msrp: 120
  timestamp: 2026-09-25T14:30:00Z
```

#### **Module 2: Query Current Inventory**
```
Type: Shopify GraphQL Query
Input: {model, size}
Output: {exists: boolean, sku: string, current_price: number}

Purpose: Avoid duplicate listings
Query:
  query {
    products(first: 10, query: "Nike Air Max 90") {
      edges {
        node {
          sku
          title
          priceRange { minVariantPrice { amount } }
        }
      }
    }
  }

Decision Tree:
  - Product exists? → SKIP (avoid duplicate)
  - New product? → PROCEED to profit calc
```

#### **Module 3: Calculate Profit**
```
Type: OpenAI API Call
Input: {model, size, price, msrp}
Output: {profit_amount, margin_percent, recommendation}

Prompt:
  "Calculate profit: SNKRS buy ${price}, market MSRP ${msrp}.
   Include shipping ($8-15), platform fees (5%), Shopify fees (2.9%).
   Minimum profit threshold: $20.
   Return JSON: {profit_amount, margin_percent, recommendation}"

Example Response:
  {
    "profit_amount": 22,
    "margin_percent": 18.3,
    "recommendation": "BUY",
    "reasoning": "Good profit margin, high-demand model, quick turnover expected"
  }

Decision Gate:
  - Profit >= $20? → PASS to filter
  - Margin >= 15%? → PASS to filter
  - Demand high? → PASS to filter
  - Otherwise → SKIP (WATCH status only)
```

#### **Module 4: Filter Against Thresholds**
```
Type: Conditional Logic
Input: {profit_amount, margin_percent, recommendation}
Output: {action: "BUY" | "WATCH" | "SKIP"}

Thresholds (MUST ALL PASS):
  - Profit >= $20
  - Margin >= 15%
  - High-demand model (manually curated list OR AI scored >7)
  - Stock available from supplier
  - Supplier response time < 2 hours

Scoring Matrix:
  Score 8-10: BUY (aggressive pursuit)
  Score 5-7:  WATCH (research needed)
  Score 0-4:  SKIP (not worth effort)

Filter Output:
  {
    "action": "BUY",
    "score": 8.5,
    "reason": "Nike model, $22 profit, 18% margin, high demand"
  }
```

#### **Module 5: Source Inventory**
```
Type: HTTP Webhook / Supplier API
Input: {model, size, action}
Output: {order_id, sku, estimated_arrival, cost}

Supplier Integration:
  - API Endpoint: [Configured per supplier]
  - Auth: API key (stored in Make secure)
  - Method: POST /order
  
Payload:
  {
    "product_model": "Nike Air Max 90",
    "size": "US 10",
    "quantity": 1-3,
    "rush_order": true,
    "expected_delivery": "24-48 hours"
  }

Response:
  {
    "order_id": "ORD-20260925-001",
    "sku": "NIKE-AIRMAX90-10-BLK",
    "cost": 85,
    "estimated_arrival": "2026-09-26T18:00:00Z",
    "supplier_confidence": 0.95
  }

Error Handling:
  - Out of stock? → WATCH status, alert
  - High cost? → Recalc profit, may SKIP
  - Slow delivery? → Check market window, may SKIP
```

#### **Module 6: Create Shopify Listing**
```
Type: Shopify GraphQL Mutation
Input: {model, size, cost, market_price, sku, order_id}
Output: {product_id, listing_url, status}

GraphQL Mutation:
  mutation {
    productCreate(input: {
      title: "Nike Air Max 90 - US 10 (SNKRS Drop)",
      bodyHtml: "<p>Authentic SNKRS drop. Condition: New. Authentic Nike.</p>",
      productType: "Sneakers",
      vendor: "PremeFTP",
      handle: "nike-air-max-90-snkrs-20260925",
      tags: ["snkrs", "authentic", "nike", "limited"],
      variants: [{
        price: 145,
        sku: $sku,
        weight: { value: 400, unit: "g" }
      }]
    }) {
      product {
        id
        handle
        onlineStoreUrl
      }
    }
  }

Pricing Strategy:
  - Cost: $85 (SNKRS)
  - Market price: $145-160 (avg market value)
  - Target margin: 15-25%
  - Listing price: $145 (competitive)

Product Details:
  - Title: [Model] - Condition - Authentic
  - Images: Sourced from SNKRS/supplier
  - Description: Authenticity, condition, shipping info
  - Tags: snkrs, authentic, sneaker, limited
  
Response:
  {
    "product_id": "gid://shopify/Product/987654321",
    "listing_url": "https://premeftpshop.myshopify.com/products/nike-air-max-90-snkrs",
    "status": "published"
  }
```

#### **Module 7: Log Opportunity**
```
Type: Airtable Create Record
Input: {order_id, product_id, cost, price, expected_profit, status}
Output: {record_id}

Airtable Record:
  {
    "Date": "2026-09-25",
    "Item": "Nike Air Max 90 US 10",
    "Source": "SNKRS Drop",
    "Cost": 85,
    "List Price": 145,
    "Expected Profit": 22,
    "Profit Margin": 18.3,
    "Status": "Listed",
    "Shopify Link": [URL],
    "Order ID": "ORD-20260925-001",
    "AI Score": 8.5,
    "Notes": "High-demand model, quick turnover expected"
  }

Table: SNKRS Opportunities
Purpose: Historical tracking, ROI calculation, pattern analysis
```

#### **Module 8: Send Discord Alert**
```
Type: Discord Webhook
Input: {model, size, price, profit, listing_url, channel}
Output: {message_id, sent: true}

Message Format (by profit level):

HIGH PROFIT (>$40):
  🚨 **HIGH PROFIT SNKRS DROP**
  🏃 Nike Air Max 90 - US 10
  💰 SNKRS: $85 | List: $145
  📈 Expected Profit: $22 (18% margin)
  🔗 [View Listing](URL)
  ⏰ Order placed | Arrival: 24-48h

MEDIUM PROFIT ($20-40):
  ✅ **SNKRS Opportunity**
  🏃 Nike Air Max 90 - US 10
  💰 Profit: $22 | Margin: 18%
  🔗 [View](URL)

LOW PROFIT (<$20):
  📌 **WATCH: Marginal Opportunity**
  🏃 Nike Air Max 90
  💰 Profit: $8 | Margin: 8%
  ⚠️ Below threshold (may restock)

Channels:
  - #snkrs-drops (all opportunities)
  - #high-value-alerts (profit > $40)
  - #snkrs-log (archive)
```

#### **Module 9: Track Sales**
```
Type: Airtable + Shopify Webhook
Input: Order placed on Shopify
Output: {sale_record, actual_profit, roi}

On Sale:
  1. Capture order details
  2. Calculate actual profit (final price - all costs)
  3. Update Airtable record (status → "Sold")
  4. Send Discord notification
  5. Calculate ROI for that item

Tracking Fields:
  - Sale Date
  - Sale Price
  - Actual Profit (vs expected)
  - Days to Sale (time on shelf)
  - Return Rate
  - Customer Rating

Alert on Sale:
  🎉 **SOLD: Nike Air Max 90 - US 10**
  📊 Actual Profit: $23 (vs expected $22)
  ⏱️ Time to sale: 1.5 days
  ⭐ Rating: 5/5
```

### **ERROR HANDLING & RESILIENCE (Modules 10-15)**

#### **Module 10: Retry Logic**
```
Triggers:
  - Shopify API timeout → Retry 3x with backoff
  - Supplier API error → Fallback to alternative supplier
  - Profit calc failure → Manual review flag

Behavior:
  - 1st failure: Retry after 30s
  - 2nd failure: Retry after 2m
  - 3rd failure: Alert + manual queue
```

#### **Module 11: Deduplication**
```
Purpose: Avoid double-listing same SNKRS drop

Logic:
  - Hash: model + size + drop_date
  - Check: Airtable for duplicate within 24h
  - If exists: Skip (already listed or pending)
  - If new: Proceed

Prevents:
  - Multiple listings of same item
  - Supplier conflicts
  - Operational waste
```

#### **Module 12: Inventory Sync**
```
Monitors Shopify for stock changes
- Item sold out? → Mark as unavailable
- Item remains? → Keep active
- New stock? → Re-list if price favorable
```

#### **Module 13: Profit Recalculation**
```
Daily task:
  - Check market prices (StockX, Grailed)
  - If market drops: Update Shopify price
  - If profit < threshold: Mark as clearance
  - Maximize ROI through dynamic pricing
```

#### **Module 14: Dashboard Update**
```
Updates Notion dashboard real-time:
  - Items listed today
  - Items sold
  - Profit accumulated
  - Success rate
```

#### **Module 15: Comprehensive Error Handler**
```
Catches any failures:
  - Logs to Airtable (error table)
  - Sends alert to Discord
  - Queues for manual review
  - Prevents silent failures
```

---

## 🔄 DATA FLOWS & INTEGRATIONS

### **Flow 1: Happy Path (BUY Decision)**
```
SNKRS Alert
  ↓
Inventory Check (not duplicate)
  ↓
Profit Calculation ($22, 18%)
  ↓
Filter Pass (score 8.5)
  ↓
Source Inventory (Order placed)
  ↓
Create Shopify Listing (Published)
  ↓
Log Opportunity (Airtable)
  ↓
Discord Alert (High profit)
  ↓
Monitor for Sale
  ↓
Sale Occurs
  ↓
Update Actual Profit
  ↓
Revenue Captured ✅
```

**Time:** 5-15 minutes from alert to listing  
**Manual effort:** 0 (fully automated)  

### **Flow 2: Watch Path (Score 5-7)**
```
SNKRS Alert
  ↓
Profit Calc ($8, 8%)
  ↓
Filter: Score 5-7 → WATCH
  ↓
Log to Airtable (WATCH status)
  ↓
Discord Alert (#ai-research channel)
  ↓
Manual review (if desired)
  ↓
Decision: BUY later or SKIP
```

### **Flow 3: Skip Path (Score 0-4)**
```
SNKRS Alert
  ↓
Profit Calc ($0-5)
  ↓
Filter: Score 0-4 → SKIP
  ↓
Silent skip (no listing created)
  ↓
Optional: Discord log (archive)
```

---

## 📊 FINANCIAL MODEL

### **Unit Economics**
```
SNKRS Purchase: $85
Shopify List Price: $145
Gross Revenue: $145

COSTS:
  SNKRS Cost: $85
  Shipping (est): $8
  Shopify Fee (2.9%): $4.20
  Platform Fee (est): $2
  Processing: $1
  ─────────────────
  Total Cost: $100.20

NET PROFIT: $44.80
Margin: 31%
```

### **Monthly Projection**
```
Conservative (1 drop/day):
  Volume: 30 items
  Profit/item: $20-40
  Monthly: $600-1,200

Realistic (2 drops/day):
  Volume: 60 items
  Profit/item: $20-40
  Monthly: $1,200-2,400

Aggressive (3+ drops/day):
  Volume: 90+ items
  Profit/item: $20-40
  Monthly: $1,800-3,600
```

### **Year 1 Projection**
```
Conservative: $7.2K - $14.4K
Realistic: $14.4K - $28.8K
Aggressive: $21.6K - $43.2K

Plus SNKRS automation benefit:
  - Freed Make.com ops for other automation
  - Revenue foundation for Year 2 scaling
  - Proof of concept for drop arbitrage
```

---

## 🛠️ PREREQUISITES & DEPENDENCIES

### **Must Be Done Before Deployment**
- [ ] Make.com Core tier upgrade ($9/month) — **NEEDED**
- [ ] Shopify OAuth re-authenticated — **NEEDED**
- [ ] Supplier API credentials configured — **NEEDED**
- [ ] Discord webhook endpoints created — **Ready**
- [ ] Airtable table structure prepared — **Ready**

### **Optional But Recommended**
- [ ] Dynamic pricing rules configured
- [ ] Multiple supplier integration (fallback)
- [ ] Margin floor/ceiling rules
- [ ] Geographic/size filter rules

---

## ✅ DEPLOYMENT CHECKLIST

### **Pre-Launch (Thursday)**
- [ ] All 15 modules architected
- [ ] Module specifications finalized
- [ ] Integration tested (mock data)
- [ ] Error paths validated
- [ ] Discord alerts verified
- [ ] Airtable logging confirmed

### **Launch Day (Friday)**
- [ ] Core tier upgrade complete
- [ ] Scenario 6500+ created in Make.com
- [ ] All 15 modules deployed
- [ ] Webhook endpoint active
- [ ] Polling set to 15-minute interval
- [ ] Test run with sample SNKRS drop
- [ ] All alerts working
- [ ] 24-hour monitoring begins

### **Post-Launch (Week 1)**
- [ ] Monitor daily for issues
- [ ] Adjust thresholds based on results
- [ ] Verify profit calculations
- [ ] Track time-to-listing metrics
- [ ] Adjust filter scoring if needed
- [ ] Document learnings

---

## 🎯 SUCCESS CRITERIA

**Functional:**
- [ ] Webhook receives drops in real-time
- [ ] Profit calculation accurate (±$2)
- [ ] Shopify listings created automatically
- [ ] Airtable logging working
- [ ] Discord alerts firing
- [ ] No silent failures

**Operational:**
- [ ] Zero manual intervention needed (post-launch)
- [ ] Response time: <15 min alert to listing
- [ ] Success rate: 90%+
- [ ] Error handling: Graceful with alerts

**Financial:**
- [ ] First 3-5 items sourced & listed
- [ ] Profit margin: 15%+
- [ ] Revenue: $100+/week achievable
- [ ] SNKRS enables $600+/month scale

---

## 📅 WEEK 2 TIMELINE

**Monday-Wednesday:**
- Finalize all 15 module specifications
- Design error handling paths
- Prepare integration tests
- Get Core tier upgrade approval

**Thursday:**
- Architecture review & validation
- Prepare for launch
- Create launch checklist
- Notify stakeholders

**Friday:**
- Deploy all 15 modules
- Test with sample data
- Go live at 9 AM
- 24-hour monitoring begins
- Week 1 results captured

---

## 🚀 WEEK 3 READINESS

**By end of Week 2:**
- ✅ Full architecture finalized
- ✅ All modules tested & documented
- ✅ Deployment ready
- ✅ Financial model validated
- ✅ Team trained
- ✅ Go/no-go decision made

**Week 3 execution:** Full deployment + 1-week live monitoring

---

**STATUS: ARCHITECTURE DESIGN IN PROGRESS ✅**

Awaiting Task 3 & 4 completion, then final deployment readiness check Friday EOD.
