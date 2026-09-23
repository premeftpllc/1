# PremeFTP Arbitrage Automation - Implementation Quick Start
**Date:** 2026-09-22  
**Estimated Time to Deploy:** 24-48 hours  
**Difficulty Level:** Intermediate (no coding required)  
**Status:** Ready to Execute

---

## Quick Navigation

- **Phase 1 Implementation:** 1-2 hours | Daily below-retail monitoring
- **Phase 2 Implementation:** 8-12 hours | Real-time spread detection
- **Phase 3 Implementation:** 4-6 hours | Trading card price tracking
- **Shopify Integration:** 2-3 hours | Auto product creation & fulfillment

---

## PHASE 1: Daily Monitoring (Start Here)

### Step 1: Get StockX API Key (15 min)

```
1. Go to https://developer.stockx.com
2. Sign up / Log in
3. Create project: "PremeFTP-Bot"
4. Generate API key
5. Save to: .env file as STOCKX_API_KEY=sk_...
```

**Verification:**
```bash
curl -X GET "https://api.stockx.com/products?limit=1" \
  -H "Authorization: Bearer YOUR_KEY"

Should return: 200 OK with product data
```

### Step 2: Create Google Sheet (10 min)

```
1. Go to https://sheets.google.com
2. Create new sheet: "StockX_Daily_Log"
3. Add columns:
   Date | SKU | Item | Category | Current Price | Retail | Margin | URL | Status
4. Copy sheet ID from URL
5. Save to: .env as GSHEET_STOCKX_LOG_ID=...
```

### Step 3: Set Up Slack Channel (5 min)

```
1. In Slack workspace, create: #arbitrage-deals
2. Go to https://api.slack.com/apps
3. Create new app: "PremeFTP Bot"
4. Enable Incoming Webhooks
5. Create webhook for #arbitrage-deals
6. Copy webhook URL
7. Save to: .env as SLACK_WEBHOOK_DEALS=https://hooks.slack.com/...
```

### Step 4: Create Make.com Scenario (30 min)

```
1. Go to make.com
2. Sign up / Log in
3. Create new scenario
4. Add trigger: Scheduler (Daily, 10 AM ET)
5. Add module 1: HTTP Request
   - GET: https://api.stockx.com/products?filter[below_retail]=true&limit=50
   - Header: Authorization: Bearer {{env.STOCKX_API_KEY}}
6. Add module 2: Transform Data (JavaScript)
   Copy code from ARBITRAGE_AUTOMATION_FRAMEWORK.md Part 1.4
7. Add module 3: Slack - Send Message (for high margin deals)
   - Channel: #arbitrage-deals
   - Condition: data.net_profit >= 75
8. Add module 4: Google Sheets - Append Row
   - Sheet: StockX_Daily_Log
   - Append all columns
9. Test with "Run once" button
```

### Step 5: Schedule Daily Run (5 min)

```
1. In Make scenario: Set trigger to 10 AM ET daily
2. Click: Enable
3. Save scenario

First run will execute tomorrow at 10 AM.
To test immediately: Click "Run now" in scenario.
```

### Phase 1 Verification (Next 7 Days)

- [ ] Make scenario running daily at 10 AM ET
- [ ] Slack alerts appearing in #arbitrage-deals
- [ ] Google Sheet logging all deals
- [ ] Manual spot-check: Verify 2-3 margins match actual prices
- [ ] Document first 3-5 real deals in PREMEFTP_ARBITRAGE_LOG.md

**Expected Output:** 3-5 alerts per day, 1-2 deals to source per week

---

## PHASE 2: Cross-Platform Spreads (After Phase 1 Stable)

### Prerequisite
- [ ] Phase 1 running smoothly for 1 week
- [ ] Team familiar with alert format
- [ ] Initial deals sourced and listed

### Step 1: Get GOAT API Key (1-2 hours)

```
Email: dev@goat.com
Subject: API Access Request for PremeFTP Arbitrage

They may take 24-48 hours to respond.
Use this time to prepare other components.
```

### Step 2: Create Zapier Workflows (4 hours)

**Workflow 1: StockX Price Sync**
```
Trigger: Zapier Scheduler (Every 30 min)
Action 1: HTTP to https://api.stockx.com/products?limit=100
Action 2: Google Sheets append to "stockx_prices_live"
```

**Workflow 2: GOAT Price Sync**
```
Trigger: Zapier Scheduler (Every 30 min)
Action 1: HTTP to https://api.goatapp.it/api/v1/products?limit=100
Action 2: Google Sheets append to "goat_prices_live"
```

**Workflow 3: Spread Detection**
```
Trigger: Google Sheets row added to "comparison_queue"
Action 1: Lookup StockX price in "stockx_prices_live"
Action 2: Lookup GOAT price in "goat_prices_live"
Action 3: Calculate spread (GOAT - StockX - Fees)
Action 4: IF spread >= $100: Slack alert
Action 5: Log to "arbitrage_spreads_log"
```

### Step 3: Create Google Sheets Tabs (20 min)

```
Add to existing sheet:
- stockx_prices_live
- goat_prices_live
- watched_products (with 50 high-volume SKUs)
- comparison_queue
- arbitrage_spreads_log
```

### Step 4: Populate Watched Products (30 min)

```
High-volume sneakers to monitor:
- Nike Air Jordan 11 Retro (gamma blue, bred, etc.)
- Nike SB Dunk Low (various colorways)
- Yeezy 350 V2 (earth, static, etc.)
- Supreme Box Logo (hoodies, accessories)
- Off-White Nike Collabs

Add 50 SKUs to "watched_products" sheet.
Format: SKU | Name | Category | Min Alert | Active
```

### Phase 2 Verification (Next 3 Days)

- [ ] Zapier workflows syncing prices every 30 min
- [ ] Slack alerts for spreads >= $100
- [ ] Google Sheets logging all detected spreads
- [ ] Caught at least 1 real spread (> 2 deals/week expected)
- [ ] Team has fulfilled at least 1 spread arbitrage

**Expected Output:** 2-3 spreads per week, 1-2 successful captures

---

## PHASE 3: Trading Card Monitoring (Optional, After Phase 1-2 Stable)

### Prerequisite
- [ ] Phases 1 & 2 running smoothly (2+ weeks)
- [ ] Team confidence with alert system
- [ ] Capital allocation confirmed for TCG inventory

### Step 1: Get TCGPlayer API Key (1 hour)

```
1. Go to https://tcgplayer.com/sellers
2. Sign up as seller
3. Create Application
4. Copy Public Key and Private Key
5. Generate Bearer Token (see API_CONFIGURATION_REFERENCE.md Part 6)
6. Save to .env: TCG_API_KEY=...
```

### Step 2: Create Make Scenario (2 hours)

```
Copy template from MAKE_WORKFLOW_TEMPLATES.json
Scenario: "phase3_tcg_monitor"

Trigger: Scheduler (Twice daily: 10 AM & 6 PM ET)
Module 1: Fetch sealed products from PokellectDex API
Module 2: Transform data, calculate price trends
Module 3: Detect liquidation windows (price drop > 10%)
Module 4: Slack alert if liquidation detected
Module 5: Google Sheets log all products
```

### Step 3: Configure TCG Monitoring Parameters (30 min)

```
Google Sheet: "tcg_sealed_product_log"

Columns:
- Timestamp
- Set Name
- Product Type
- Condition
- Current Price
- Price 7d Ago
- % Change
- Volume 24h
- Alert Type
- Notes

Monitor categories:
- Pokémon Base Set Booster Box
- Pokémon Jungle Booster Box
- Pokémon Fossil Booster Box
- High-value Charizard/Blastoise cards
```

### Step 4: Set Up Profit Tracking (20 min)

```
Add column to TCG log: "Profit if Sourced"

Formula: 
Price_7d_Ago - Current_Price - (Grading_Cost) - (Shipping)

Example:
$4,500 - $3,800 - $50 - $25 = $625 potential profit
```

### Phase 3 Verification (Next 1 Week)

- [ ] TCG monitor running twice daily
- [ ] Detecting liquidation windows (price drops 10%+)
- [ ] Slack alerts formatted correctly
- [ ] Google Sheets logging comprehensive data
- [ ] Sourced at least 1 TCG product from liquidation window

**Expected Output:** 2-4 liquidation windows per week, $500-1500 weekly profit potential

---

## SHOPIFY INTEGRATION (Optional, Phase 2+ Feature)

### Step 1: Get Shopify API Token (10 min)

```
1. Go to https://premeftp.myshopify.com/admin
2. Settings → Apps and integrations → Develop apps
3. Create new app: "PremeFTP Arbitrage Bot"
4. Set scopes: write_products, read_products, write_inventory, read_inventory
5. Copy API access token
6. Save to .env: SHOPIFY_ACCESS_TOKEN=...
```

### Step 2: Create Make Workflow for Auto-Product Creation (1 hour)

```
Trigger: Slack message reaction (✅ emoji on arbitrage alert)

Module 1: Extract alert data (Item name, price, margin)
Module 2: Calculate Shopify price (cost + 25% margin)
Module 3: HTTP POST to https://premeftp.myshopify.com/admin/api/2024-07/products.json
   Body:
   {
     "product": {
       "title": "{{item_name}}",
       "product_type": "{{category}}",
       "vendor": "StockX / GOAT",
       "variants": [{
         "price": "{{calculated_price}}",
         "sku": "{{sku}}"
       }]
     }
   }
Module 4: Google Sheets log (Sheet: "shopify_auto_created_products")
Module 5: Slack confirmation alert

Result: Product created in Shopify within 10 seconds of approval
```

### Step 3: Create Order Fulfillment Workflow (1 hour)

```
Trigger: Shopify order created

Module 1: Extract product SKU from order
Module 2: Get source platform from product metadata
   IF source == "StockX":
     Module 3a: HTTP POST to StockX API to purchase item
   ELSE IF source == "GOAT":
     Module 3b: HTTP POST to GOAT API to purchase item
Module 4: Update Shopify order fulfillment status
   POST: https://premeftp.myshopify.com/admin/api/2024-07/orders/{id}/fulfillments.json
Module 5: Track in Google Sheets "order_fulfillment_chain"
Module 6: Slack notification when fulfilled
```

### Shopify Verification

- [ ] Auto-create workflow functional
- [ ] Created 2-3 test products in Shopify
- [ ] Products visible in store
- [ ] Prices calculated correctly
- [ ] Auto-fulfillment workflow tested

---

## Environment Variables Setup (.env File)

Create file: `/Users/premeftpllc/PremeOS/1/.env`

```bash
# ===== STOCKX =====
STOCKX_API_KEY=sk_your_actual_key_here

# ===== GOAT =====
GOAT_API_KEY=Bearer_your_token_here

# ===== TCGPlayer =====
TCG_API_KEY=your_bearer_token_here

# ===== Shopify =====
SHOPIFY_STORE_URL=premeftp.myshopify.com
SHOPIFY_ACCESS_TOKEN=shpat_your_token_here

# ===== Google Sheets IDs =====
GSHEET_STOCKX_LOG_ID=1BxiMVs0XRA5nFMKUVfygk-Cjxelttmv3O3KfVaQVx_s
GSHEET_TRACKING_ID=1xFgHjK2pQrStUvWxYzAbCdEfGhIjKlMnOpQrStUv
GSHEET_TCG_LOG_ID=1vWxYzAbCdEfGhIjKlMnOpQrStUvWxYzAbCdEfGh

# ===== Slack Webhooks =====
SLACK_WEBHOOK_DEALS=https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX
SLACK_WEBHOOK_SPREADS=https://hooks.slack.com/services/T00000000/B00000001/XXXXXXXXXXXXXXXXXXXX
SLACK_WEBHOOK_TCG=https://hooks.slack.com/services/T00000000/B00000002/XXXXXXXXXXXXXXXXXXXX

# ===== Make.com =====
MAKE_API_KEY=your_make_api_key

# ===== Zapier =====
ZAPIER_API_KEY=your_zapier_api_key
```

**IMPORTANT:** Add to .gitignore
```bash
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
```

---

## Testing Checklist

### Test Suite 1: API Connectivity (15 min)

```bash
# Test StockX
curl -H "Authorization: Bearer $STOCKX_API_KEY" \
  https://api.stockx.com/products?limit=1

# Test Shopify
curl -H "X-Shopify-Access-Token: $SHOPIFY_ACCESS_TOKEN" \
  https://premeftp.myshopify.com/admin/api/2024-07/products.json?limit=1

# Test Slack Webhook
curl -X POST $SLACK_WEBHOOK_DEALS \
  -H 'Content-type: application/json' \
  -d '{"text":"✅ Test message"}'

Expected: All return 200 status
```

### Test Suite 2: Workflow Execution (30 min)

For each Make/Zapier workflow:

```
1. Click "Run once" or "Test" button
2. Check for errors in logs
3. Verify outputs:
   - Slack message appears in channel
   - Google Sheet row appended
   - Data is accurate
4. Document any issues
```

### Test Suite 3: End-to-End (2 hours)

```
Phase 1:
1. Run Make scenario manually
2. Verify Slack alert
3. Manually verify price data accuracy
4. Confirm Google Sheet update

Phase 2 (if enabled):
1. Wait 30 min for Zapier sync
2. Check "stockx_prices_live" sheet for data
3. Check "goat_prices_live" sheet for data
4. Verify spread calculation in comparison module

Phase 3 (if enabled):
1. Run TCG scenario manually
2. Check for liquidation window detection
3. Verify Slack alert format
4. Confirm Google Sheet logging
```

---

## Monitoring & Maintenance Schedule

### Daily (5 min)
- [ ] Check #arbitrage-deals Slack channel
- [ ] Review daily summary (4 PM)
- [ ] Note any alerts with margin >= $75

### Weekly (30 min)
- [ ] Update PREMEFTP_ARBITRAGE_LOG.md with deals captured
- [ ] Review profit/loss by pathway (Phase 1, 2, 3)
- [ ] Check API rate limits (not exceeded)
- [ ] Verify all workflows still running

### Monthly (1 hour)
- [ ] Cost/benefit analysis
  - Costs: Make ($15), Zapier ($25), APIs ($10) = ~$50/month
  - Revenue: (Deals/month × Profit/deal)
  - Calculate ROI
- [ ] Refresh API keys if rotated
- [ ] Update thresholds based on market conditions
- [ ] Optimize workflows (remove redundant steps)

### Quarterly (2 hours)
- [ ] Deep-dive metrics review
- [ ] Plan scaling strategy
- [ ] Security audit (are keys still secure?)
- [ ] Update documentation

---

## Troubleshooting Quick Fixes

### "StockX API returns 401 Unauthorized"
```
Solution: Check that STOCKX_API_KEY in .env is correct and active
  1. Go to https://developer.stockx.com
  2. Verify API key hasn't expired
  3. Check "Scopes" are set to products:read, orders:read
  4. Regenerate key if needed
```

### "Slack webhook not posting"
```
Solution: Verify webhook URL is correct
  1. Go to https://api.slack.com/apps → Your App
  2. Click "Incoming Webhooks"
  3. Copy webhook URL again
  4. Paste into Make.com Slack module
  5. Test with manual cURL command (see Testing section)
```

### "Google Sheets not updating"
```
Solution: Check sheet permissions
  1. Share sheet with service account email
  2. Verify correct Sheet ID (copy from URL)
  3. Verify column headers exist in row 1
  4. Check that Make/Zapier has Google Sheets permission
```

### "Make scenario errors but no clear message"
```
Solution: Enable detailed logging
  1. In scenario: Click "Settings"
  2. Toggle "Debug mode" ON
  3. Run scenario
  4. Check logs (click "Scenario Runs")
  5. Look for detailed error messages
```

---

## Success Metrics

### Phase 1 (Week 1-2)
- [ ] Alerts: 3-5 per day
- [ ] Deals Sourced: 1-2 per week
- [ ] Profit/Deal: $30-50
- [ ] Weekly Profit: $30-100
- [ ] Uptime: > 95%

### Phase 2 (Week 3-4)
- [ ] Spreads Detected: 2-3 per week
- [ ] Spreads Captured: 30-50%
- [ ] Profit/Capture: $50-100
- [ ] Weekly Profit: $75-150
- [ ] Alert Latency: < 30 min

### Phase 3 (Week 5+)
- [ ] Liquidation Windows: 2-4 per week
- [ ] Products Sourced: 1-2 per week
- [ ] Profit/Product: $50-150
- [ ] Weekly Profit: $100-300
- [ ] Uptime: > 99%

### Overall Monthly
- Target Month 1: $500-800
- Target Month 2: $1,200-1,800
- Target Month 3+: $2,000-3,500

---

## Advanced Customization (After Core Setup)

Once Phases 1-3 are stable, consider:

### A. Price Prediction Model
```
Add historical price data from Google Sheets
Use to predict liquidation windows before they happen
Optimize sourcing timing
```

### B. Automated Bulk Sourcing
```
Connect Make to StockX API for automatic purchases
Only source when:
  - Margin >= $75
  - Item < 24h old
  - Inventory available
  - Capital available
```

### C. Dynamic Margin Adjustment
```
Real-time price checking on GOAT/eBay
Adjust Shopify prices to stay competitive
Auto-discount slow-moving inventory
```

### D. Multi-Channel Listing
```
Beyond Shopify: eBay, Facebook Marketplace, Whatnot
Use Make.com to publish to multiple channels
Track inventory across all channels
```

---

## Quick Reference Links

| Resource | URL | Purpose |
|----------|-----|---------|
| Make.com | https://make.com | Automation workflows |
| Zapier | https://zapier.com | Automation workflows |
| StockX API | https://developer.stockx.com | Price data |
| Shopify Admin | https://premeftp.myshopify.com/admin | Store management |
| Google Sheets | https://sheets.google.com | Data logging |
| Slack | https://premeftpllc.slack.com | Alerts |
| Git Repo | /Users/premeftpllc/PremeOS/1 | Documentation |
| API Config Guide | API_CONFIGURATION_REFERENCE.md | API setup |
| Automation Framework | ARBITRAGE_AUTOMATION_FRAMEWORK.md | Detailed workflows |
| Workflow Templates | MAKE_WORKFLOW_TEMPLATES.json | Copy-paste templates |

---

## Getting Help

1. **Workflow not running?**
   - Check Make.com scenario status (should be "Active")
   - Check logs for error messages
   - Verify API keys in environment variables
   - Test API connection manually (see Testing section)

2. **Alerts not appearing in Slack?**
   - Verify webhook URL is correct
   - Check that bot has permission to post in channel
   - Test webhook manually with cURL
   - Check Slack audit log for errors

3. **Google Sheets not updating?**
   - Verify sheet ID matches GSHEET env variables
   - Check that sheet is shared with service account
   - Verify column headers exist
   - Check Make/Zapier Google Sheets connection

4. **API rate limits exceeded?**
   - Reduce call frequency (e.g., every 1 hour instead of 30 min)
   - Batch API calls where possible
   - Upgrade to higher API tier if available
   - Contact API provider for higher limits

---

## Final Deployment Checklist

- [ ] All API keys obtained and stored in .env
- [ ] Make.com scenarios created and tested
- [ ] Zapier workflows created and tested (if Phase 2+)
- [ ] Google Sheets created with all required tabs
- [ ] Slack channels created and webhooks configured
- [ ] Phase 1 scenario set to run daily at 10 AM
- [ ] Team trained on alert format
- [ ] First 48 hours of monitoring confirmed working
- [ ] Profit calculations verified on 2-3 real alerts
- [ ] Backup plan documented (manual monitoring if automation fails)
- [ ] Documentation shared with team

---

**Go Live Timeline:**

- **Day 1 (Today):** Set up Phase 1 APIs and Make scenario
- **Day 2:** Verify Phase 1 running; start Phase 2 setup
- **Day 3:** Phase 1 + 2 running; source first deals
- **Week 2:** All automation stable; measure results
- **Week 3:** Add Phase 3 if running smoothly
- **Month 1:** Full system optimization and scaling

**Let's go!** 🚀

