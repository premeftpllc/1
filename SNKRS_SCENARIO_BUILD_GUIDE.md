# SNKRS Scenario Build Guide — Step-by-Step (15 min)

**Status:** Ready to build  
**Timeline:** ~15-20 minutes  
**Result:** Fully configured SNKRS automation ready for testing  

---

## PART 1: Scenario Setup (2 min)

### Step 1.1: Create New Scenario
1. Go to **Make.com** → **Scenarios**
2. Click **Create new scenario**
3. **Name:** `SNKRS Automation - Drops to Shopify`
4. **Description:** StockX SNKRS drops → Profit calc → Shopify listing → Discord alerts
5. Click **Create**

### Step 1.2: Add Trigger (Webhook)
1. Click **Add trigger** (or first module slot)
2. Search: **Webhooks**
3. Select: **Webhooks - Wait for a webhook**
4. Name it: `SNKRS Drop Webhook`
5. Click **Save**
6. **Copy the webhook URL** (you'll use this for StockX)
7. Click **OK**

---

## PART 2: Core Modules (Modules 1-9) — 10 min

### Module 2: Query Shopify Inventory

**What it does:** Check if product already listed (avoid duplicates)

1. Click **+** to add next module
2. Search: **Shopify**
3. Select: **Shopify - Search products**
4. **Configure:**
   - Connection: Click **Create new connection** → authenticate with your store
   - Store: `premeftpshop` (your subdomain)
   - Search query: Use mapper → `1.model` (from webhook)
5. Name: `Check Inventory - Search Products`
6. Click **Save**

---

### Module 3: Calculate Profit (OpenAI)

**What it does:** AI calculates profit margin and recommendation

1. Click **+** to add next module
2. Search: **OpenAI**
3. Select: **OpenAI - Create a completion**
4. **Configure:**
   - Connection: Use existing OpenAI connection
   - Model: `gpt-4-turbo` (or `gpt-3.5-turbo`)
   - **Prompt (COPY THIS):**
   ```
   You are a profit calculator for sneaker resale. 
   
   Input:
   - SNKRS Purchase Price: {{1.price}}
   - Market MSRP: {{1.msrp}}
   - Model: {{1.model}}
   - Size: {{1.size}}
   
   Calculate:
   1. Shipping cost (estimate $8-15)
   2. Platform fee (5% of sale price)
   3. Shopify fee (2.9% of sale price)
   4. Net profit
   
   Market price estimate: {{1.msrp}} * 1.2 (typical markup)
   
   Return ONLY valid JSON (no markdown, no extra text):
   {
     "profit_amount": NUMBER,
     "margin_percent": NUMBER,
     "recommendation": "BUY" or "WATCH" or "SKIP",
     "reasoning": "brief explanation"
   }
   ```
   - Temperature: `0.3`
5. Name: `Calculate Profit - OpenAI`
6. Click **Save**

---

### Module 4: Filter Decision Router

**What it does:** Route to BUY, WATCH, or SKIP based on profit

1. Click **+** to add module
2. Search: **Router**
3. Select: **Router** (basic conditional router)
4. **Configure Routes:**
   - **Route 1: BUY** 
     - Condition: `3.recommendation = "BUY"`
   - **Route 2: WATCH**
     - Condition: `3.recommendation = "WATCH"`
   - **Route 3: SKIP**
     - Condition: `3.recommendation = "SKIP"`
5. Name: `Filter Decision Router`
6. Click **Save**

---

### Module 5: Source Inventory (HTTP Request)

**What it does:** Place order with supplier (placed on BUY route)

1. On the **BUY** route, click **+** to add module
2. Search: **HTTP**
3. Select: **HTTP - Make a request**
4. **Configure:**
   - URL: `[YOUR_SUPPLIER_API_ENDPOINT]` (e.g., wholesaler API)
   - Method: `POST`
   - **Body (JSON):**
   ```json
   {
     "product_model": "{{1.model}}",
     "size": "{{1.size}}",
     "quantity": 1,
     "rush_order": true,
     "expected_delivery": "24-48 hours"
   }
   ```
   - Headers: Add `Authorization: Bearer [YOUR_API_KEY]`
5. Name: `Source from Supplier`
6. Click **Save**
7. **Note:** If you don't have a supplier API yet, skip this and manually add a **Text** module that says "Order sourced manually"

---

### Module 6: Create Shopify Listing

**What it does:** Automatically create product listing on Shopify (BUY route)

1. On **BUY** route, click **+** to add next module
2. Search: **Shopify**
3. Select: **Shopify - Create a product**
4. **Configure:**
   - Connection: Use the same Shopify connection from Module 2
   - **Title:** `{{1.model}} - {{1.size}} (SNKRS Drop)`
   - **Description:** `Authentic SNKRS drop. Condition: New. Authentic Nike/Brand.`
   - **Product Type:** `Sneakers`
   - **Vendor:** `PremeFTP`
   - **Price:** `{{1.msrp}}` (market price)
   - **SKU:** `SNKRS-{{1.model}}-{{1.size}}-{{now}}`
   - **Tags:** `snkrs,authentic,limited,nike`
5. Name: `Create Shopify Listing`
6. Click **Save**

---

### Module 7: Log Opportunity (Airtable)

**What it does:** Record all opportunities (BUY/WATCH) in Airtable for tracking

1. On **BUY** route (or both BUY and WATCH), click **+**
2. Search: **Airtable**
3. Select: **Airtable - Create a record**
4. **Configure:**
   - Connection: Use existing Airtable connection
   - Base: `PremeOS` (or your main base)
   - Table: `SNKRS Opportunities` (create this table first if needed)
   - **Fields to map:**
     - Date: `{{now | formatDate("YYYY-MM-DD")}}`
     - Item: `{{1.model}} {{1.size}}`
     - Source: `SNKRS Drop`
     - Cost: `{{1.price}}`
     - List Price: `{{1.msrp}}`
     - Expected Profit: `{{3.profit_amount}}`
     - Profit Margin: `{{3.margin_percent}}`
     - Status: `Listed` (or `Watch` for WATCH route)
     - Recommendation: `{{3.recommendation}}`
     - AI Score: `{{3.ai_score}}`
5. Name: `Log Opportunity - Airtable`
6. Click **Save**

---

### Module 8: Send Discord Alert

**What it does:** Send real-time notification to Discord (BUY route only)

1. On **BUY** route, click **+**
2. Search: **Discord**
3. Select: **Discord - Send a message**
4. **Configure:**
   - Connection: Use existing Discord connection
   - Channel: `#snkrs-drops` (create this channel in your Discord if needed)
   - **Message:**
   ```
   🚨 **SNKRS OPPORTUNITY - BUY SIGNAL**
   
   📦 {{1.model}} - {{1.size}}
   💰 SNKRS: ${{1.price}} | List: ${{1.msrp}}
   📈 Expected Profit: ${{3.profit_amount}} ({{3.margin_percent}}%)
   ⏰ Status: Listed
   🔗 [View Listing]
   
   AI Recommendation: {{3.recommendation}}
   ```
5. Name: `Discord Alert - Opportunity`
6. Click **Save**

---

### Module 9: Track Sales (Airtable Webhook)

**What it does:** Monitor when products sell (update Airtable with actual profit)

1. Click **+** to add module (after listing created)
2. Search: **Airtable**
3. Select: **Airtable - Watch records**
4. **Configure:**
   - Connection: Airtable
   - Base: `PremeOS`
   - Table: `SNKRS Opportunities`
   - Trigger on: Records where Status changes to `Sold`
5. Name: `Track Sales - Monitor for Completion`
6. Click **Save**

---

## PART 3: Error Handling & Resilience (Modules 10-15) — 3 min

### Module 10: Retry Logic

1. Click on **Module 6** (Create Shopify Listing)
2. Click the **3-dot menu** → **Set up error handling**
3. Add **Error handler: Retry**
   - Attempts: `3`
   - Interval: `30 seconds`
   - Backoff: `Exponential`

### Module 11-15: Error Consolidation

For any API calls (Shopify, Airtable, Discord), add similar retry logic:
- **On error:** Retry → Log to Airtable error table → Send Discord alert

**Skip this for MVP** — focus on getting core flow working first.

---

## PART 4: Testing & Deployment (5 min)

### Step 4.1: Test with Sample Data

1. Go to your scenario
2. Click **Run once**
3. Enter sample webhook data:
   ```json
   {
     "model": "Nike Air Max 90",
     "size": "US 10",
     "price": 85,
     "msrp": 130
   }
   ```
4. Click **Run**
5. Check results:
   - ✅ Profit calculated correctly?
   - ✅ Shopify listing created?
   - ✅ Airtable record logged?
   - ✅ Discord message sent?

### Step 4.2: Set Webhook Active

1. In your scenario, find Module 1 (Webhook)
2. Toggle **Active: ON**
3. This activates the webhook to receive real SNKRS drops

### Step 4.3: Set Polling (Backup)

1. Click **Scheduling** (top right)
2. Set: **Every 15 minutes** (as fallback if webhook fails)
3. Save scenario

---

## PART 5: Connection Setup

### When prompted to connect:

**Shopify:**
- You'll see "Create new connection"
- Click it
- Enter: `premeftpshop` (your subdomain)
- Click Authorize → Login → Install → Done

**OpenAI, Airtable, Discord:**
- Should already be connected from earlier setup
- If not, click "Create new" and authenticate

---

## Quick Checklist

- [ ] Scenario created
- [ ] Module 1: Webhook trigger (copy URL for later)
- [ ] Module 2: Shopify search (Shopify connection created)
- [ ] Module 3: OpenAI profit calc
- [ ] Module 4: Router (BUY/WATCH/SKIP)
- [ ] Module 5: HTTP supplier order (or manual note)
- [ ] Module 6: Create Shopify listing
- [ ] Module 7: Airtable logging
- [ ] Module 8: Discord alert
- [ ] Module 9: Sales tracking
- [ ] Test run successful
- [ ] Webhook active
- [ ] Polling set to 15 min

---

## Expected Timeline

| Step | Time |
|------|------|
| Scenario setup | 2 min |
| Modules 1-9 | 10 min |
| Error handling | 2 min |
| Testing | 3 min |
| **Total** | **~17 minutes** |

---

## Next Steps After Build

1. **Test with 3-5 sample drops** (manual test runs)
2. **Monitor 24 hours** for any issues
3. **Adjust profit threshold** if needed
4. **Friday:** Go live with real SNKRS feed
5. **Week 3:** Scale to 2-3 drops/day

---

**Status: READY TO BUILD**

Once you complete these steps, reply: **"Scenario built"** and I'll verify everything is connected and ready for Friday launch. 🚀
