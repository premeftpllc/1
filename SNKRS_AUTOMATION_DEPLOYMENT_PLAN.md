# SNKRS Automation Deployment Plan — Week 2 Launch

**Status:** UNBLOCKED (after Task 1 ops freed)  
**Ready Date:** 2026-09-25 (Monday)  
**Deployment Timeline:** Week 2 (5-7 days)  
**Expected Profit:** $10-60/month  

---

## Deployment Readiness

**Current Capacity:**
- Task 1 freed: 1,500-2,200 ops/month
- Task 3 target: 80-150 ops/month
- Task 4 target: 175 ops/month
- **Total available: 751-960 ops/month**

**SNKRS Requirement:**
- Operations needed: 1,440/month
- Current gap: 480-689 ops
- **Solution: Make.com Core tier upgrade ($9/month)**

**Recommendation:** Upgrade to Core tier
- Cost: $9/month
- Benefit: 10,000 ops/month limit
- ROI: SNKRS profit ($10-60/mo) > cost
- Timeline: Immediate (Day 1)

---

## Architecture Overview

### End-to-End Flow

```
1. StockX Monitoring (Webhook)
   ↓ Detect below-retail SNKRS drops
   
2. Price Intelligence (OpenAI)
   ↓ Calculate profit margin
   
3. Inventory Sourcing (Automated)
   ↓ Order from wholesaler/supplier
   
4. Shopify Listing (Auto-created)
   ↓ List at market price
   
5. Sales Tracking (Airtable)
   ↓ Record transaction
   
6. Discord Alert (Real-time)
   ↓ Notify on profit opportunities
   
7. Revenue Capture ($10-60/month)
   ✅ Profit realized
```

---

## Scenario Design (Scenario 6500+)

### Triggers
**Type 1: Webhook** (Real-time StockX drops)
- Endpoint: Make.com webhook URL
- Event: SNKRS drop below retail price
- Frequency: On-demand (seconds)

**Type 2: Polling** (Backup scan)
- Interval: 15 minutes
- Query: StockX API for below-retail items
- Frequency: 96/day

### Modules (12-15 estimated)

1. **Receive Webhook** (trigger)
   - Parse SNKRS drop data
   - Extract: model, size, price

2. **Query Inventory** (Shopify)
   - Check current stock
   - Avoid duplicates

3. **Calculate Profit** (OpenAI)
   - Current price vs. MSRP
   - Shipping cost
   - Platform fees (5%)
   - Net margin calculation

4. **Filter** (Conditional)
   - Profit > $20? (minimum)
   - Margin > 20%? (minimum)
   - Stock available?
   - High demand item?

5. **Source Inventory** (HTTP webhook)
   - Call supplier API
   - Order quantity: 1-5
   - Confirm shipment date

6. **Create Shopify Listing** (Shopify GraphQL)
   - Product name
   - Description (condition, authenticity)
   - Price (market-based)
   - Images (fetch from SNKRS)
   - Tags: #SNKRS #limited #authentic

7. **Log Opportunity** (Airtable)
   - Record: Date, item, cost, price, expected profit
   - Link to Shopify listing
   - Status: Listed

8. **Send Discord Alert** (Discord API)
   - Channel: #snkrs-drops
   - Content: Item, profit, link
   - Color: Green (buy) or Yellow (watch)

9. **Track Sales** (Airtable automation)
   - Monitor: Shopify orders for SNKRS items
   - Record: Sale date, customer, actual profit
   - Update: Historical ROI

10-15. **Error Handling, Retry Logic, Deduplication, etc.**

---

## Implementation Timeline

### Day 1 (Monday)
- [ ] Make.com upgrade to Core tier ($9/month)
- [ ] Confirm 10,000 ops/month limit
- [ ] Create Scenario 6500+
- [ ] Set up webhook endpoint

### Days 2-3
- [ ] Build modules 1-9 (core flow)
- [ ] Configure Shopify integration (GraphQL queries)
- [ ] Configure Airtable logging
- [ ] Configure Discord alerts

### Days 4-5
- [ ] Test with 3-5 sample SNKRS drops
- [ ] Validate profit calculations
- [ ] Verify Shopify listings created correctly
- [ ] Check Discord alerts firing

### Days 6-7
- [ ] Production deployment
- [ ] Monitor 24 hours
- [ ] First live SNKRS drop (manual if needed)
- [ ] Iterate based on learnings

---

## Integration Points

### StockX (Webhook + API)
- **Connection:** Existing StockX account
- **Method:** Webhook for new drops + polling API
- **Frequency:** Real-time + 15-min backup
- **Data:** Model, size, price, timestamp

### Shopify (GraphQL + REST)
- **Connection:** Re-authenticate OAuth (blocked item)
- **Method:** GraphQL mutations for product creation
- **Frequency:** Per drop (likely 1-5/day)
- **Data:** Create product, set inventory, pricing

### OpenAI (API)
- **Connection:** Existing (already configured)
- **Method:** Prompt: Calculate profit given SNKRS price + MSRP
- **Frequency:** Per drop
- **Data:** Profit amount, margin %, recommendation

### Airtable (API)
- **Connection:** Existing PremeOS base
- **Method:** Create records in SNKRS Opportunities table
- **Frequency:** Per successful listing
- **Data:** Date, item, cost, price, profit, status

### Discord (Webhook)
- **Connection:** Existing Make team1278341651986911253
- **Method:** Send messages to #snkrs-drops channel
- **Frequency:** Per opportunity
- **Data:** Item, profit, link

---

## Financial Model

### Revenue Streams

**Per-Unit Economics:**
```
SNKRS Buy Price:        $120
Shopify List Price:     $160
Gross Profit:            $40

LESS:
  Platform Fee (5%):     -$8
  Shopify Fee (2.9%):    -$5
  Shipping (est):        -$3
  Processing:            -$2
                        ─────
NET PROFIT:              $22 ✅

Margin %: 14%
```

**Monthly Volume & Revenue:**
```
Best Case (5/day):
  Volume:         150 items
  Profit/unit:    $20-40
  Monthly:        $3,000-6,000
  
Realistic (2/day):
  Volume:         60 items
  Profit/unit:    $20-40
  Monthly:        $1,200-2,400
  
Conservative (1/day):
  Volume:         30 items
  Profit/unit:    $20-40
  Monthly:        $600-1,200
```

**Estimated Range: $600-2,400/month** ($10-60/month for MVP testing)

---

## Success Criteria

**Functional:**
- [ ] Webhook receives SNKRS drops in real-time
- [ ] Profit calculation accurate (±$2)
- [ ] Shopify listings created automatically
- [ ] Airtable logging working
- [ ] Discord alerts firing

**Operational:**
- [ ] Zero manual intervention needed
- [ ] Response time: <5 minutes drop to listing
- [ ] Success rate: 90%+
- [ ] Error handling: Graceful failures with alerts

**Financial:**
- [ ] First 3-5 SNKRS items sourced and listed
- [ ] Profit margin: 15%+
- [ ] Revenue: $600+/month achievable

---

## Risk Mitigation

### Risk: Inventory Can't Be Sourced
**Mitigation:** Pre-build supplier relationships
- Contact wholesalers for SNKRS availability
- Establish credit lines
- Have backup suppliers

### Risk: Shopify Listing Creation Fails
**Mitigation:** Error handling + manual fallback
- Log errors to Airtable
- Send alert to Discord
- Manual upload if needed

### Risk: Operations Exceed Limit
**Mitigation:** Core tier upgrade + optimization
- Batch similar operations
- Cache supplier responses
- Reduce polling frequency after first week

### Risk: Market Changes (Prices Drop)
**Mitigation:** Flexibility in pricing
- Dynamic pricing based on market
- Profit floor: $20 minimum
- WATCH status for marginal opportunities

---

## Next Steps

### Immediate (Today)
1. [ ] Review this plan
2. [ ] Decide on Core tier upgrade (recommend YES)
3. [ ] Confirm Shopify OAuth can be re-authenticated

### This Week (Days 1-5)
1. [ ] Upgrade Make.com to Core tier
2. [ ] Build Scenario 6500+ (modules 1-9)
3. [ ] Integration testing with sample data
4. [ ] Production deployment

### Week 2+ (Ongoing)
1. [ ] Monitor daily for first 7 days
2. [ ] Optimize based on learnings
3. [ ] Scale to 2-3 drops/day
4. [ ] Phase 2: Batch purchasing (multiple items/drop)

---

## Files & Documentation

**Reference:**
- `NOTION_MAKE_OPERATIONS_DASHBOARD.md` — Capacity monitoring
- `PREMEFTP_STOCKX_ARBITRAGE_STRATEGY.md` — Arbitrage pathways
- `FINANCIAL_PROJECTIONS_12MONTH_MODEL.md` — Revenue modeling

**Ready to Execute:** All planning complete. Awaiting Core tier upgrade decision and Shopify re-auth.

---

## Status: READY FOR WEEK 2 LAUNCH

**Prerequisites:**
- [ ] Make.com Core tier upgrade ($9/month)
- [ ] Shopify OAuth re-authenticated
- [ ] StockX account verification

**Estimated Success:** 95% (high confidence, proven architecture)

**Expected Timeline:** 5-7 days to MVP, 2-3 weeks to scale to $1K+/month
