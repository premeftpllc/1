# PremeFTP Arbitrage - API Configuration Reference
**Date:** 2026-09-22  
**Purpose:** Step-by-step guide to obtaining and testing all required API keys and authentication tokens  
**Status:** Production Ready

---

## Part 1: StockX API Configuration

### 1.1 Register for StockX Developer Account

1. Go to: https://developer.stockx.com
2. Click: **Sign Up** (or Log In if existing account)
3. Complete registration with email and password
4. Verify email address

### 1.2 Create API Project

1. Navigate to: **Dashboard** → **Projects**
2. Click: **Create New Project**
3. Project Name: `PremeFTP-Arbitrage-Bot`
4. Description: `Automated price monitoring for arbitrage detection`
5. Click: **Create**

### 1.3 Generate API Key

1. In Project Settings → **API Keys**
2. Click: **Generate New Key**
3. Key Name: `premeftp_bot_key`
4. Scopes: Select:
   - [ ] `products:read` (required)
   - [ ] `orders:read` (required)
   - [ ] `account:read` (optional)
5. Click: **Generate**
6. **Copy the API Key immediately** (you won't be able to see it again)

### 1.4 Store API Key Securely

**Option A: Make.com Environment Variable**

```
1. Go to make.com → Your scenario
2. Click: Scenario Settings → Variables
3. Add Variable:
   Name: STOCKX_API_KEY
   Value: [paste your API key]
   Type: Secret
4. Save
```

**Option B: .env File (Local Testing)**

```bash
# Create file: .env
STOCKX_API_KEY=your_actual_api_key_here

# Add to .gitignore
echo ".env" >> .gitignore
```

### 1.5 Test StockX API Connection

**Method 1: cURL (Command Line)**

```bash
curl -X GET "https://api.stockx.com/products?limit=1" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json"

# Expected Response (200 OK):
{
  "data": {
    "products": [
      {
        "uuid": "550e8400-e29b-41d4-a716-446655440000",
        "title": "Nike Air Max 90",
        "category": "sneakers",
        "lowest_ask": 120.00,
        "highest_bid": 115.00
      }
    ]
  }
}
```

**Method 2: Postman**

1. Download: https://www.postman.com/downloads/
2. Create new request:
   - Method: GET
   - URL: https://api.stockx.com/products?limit=1
   - Headers:
     - Authorization: Bearer YOUR_API_KEY
     - Content-Type: application/json
3. Click: Send
4. Should see 200 status with product data

**Method 3: Make.com HTTP Module**

1. In Make.com scenario, add HTTP module
2. Method: GET
3. URL: https://api.stockx.com/products?limit=1
4. Headers:
   - Authorization: Bearer {{env.STOCKX_API_KEY}}
5. Click: Test
6. Should show success with data

### 1.6 Common StockX API Endpoints

```
Base URL: https://api.stockx.com
Rate Limit: 100 requests/minute

GET /products
  Description: List products
  Params: limit, sort, filter[below_retail]=true
  Example: https://api.stockx.com/products?filter[below_retail]=true&limit=50

GET /products/{id}
  Description: Get product details
  Params: None
  Example: https://api.stockx.com/products/550e8400-e29b-41d4-a716-446655440000

GET /products/{id}/orders
  Description: Get order book (price levels)
  Params: limit, filter[side]=ask|bid
  Example: https://api.stockx.com/products/{id}/orders?limit=20

GET /search
  Description: Search products
  Params: q (query), limit, sort
  Example: https://api.stockx.com/search?q=nike+air+max&limit=10

GET /products/{id}/price-history
  Description: Get historical prices
  Params: period (7d, 30d, 1y)
  Example: https://api.stockx.com/products/{id}/price-history?period=30d
```

### 1.7 Troubleshooting StockX API

| Error | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized | Invalid API key | Regenerate key at developer.stockx.com |
| 403 Forbidden | Missing scope | Add required scopes to project |
| 429 Too Many Requests | Rate limit exceeded | Reduce request frequency or contact support |
| 404 Not Found | Invalid product ID | Verify SKU/UUID format |
| 500 Server Error | StockX API down | Wait 5-10 min and retry |

---

## Part 2: GOAT API Configuration

### 2.1 Contact GOAT Developer Support

GOAT's public API requires business verification. Email: **dev@goat.com**

**Email Template:**

```
Subject: API Access Request for PremeFTP Arbitrage Bot

Hi GOAT Team,

I'm requesting API access for PremeFTP, a price monitoring and arbitrage 
detection service. I'd like to integrate real-time price feeds to monitor 
product spreads between GOAT and competitor platforms.

Use Cases:
- Fetch real-time product pricing and listings
- Monitor price changes on high-volume items
- Detect price spreads for arbitrage opportunities

Business Details:
- Company: PremeFTP LLC
- Use Case: Arbitrage price monitoring
- Expected API Calls: ~1000-5000/day
- Preferred Auth: Bearer token/OAuth2

Please let me know the requirements for API access and the onboarding process.

Thanks,
[Your Name]
```

### 2.2 GOAT API Endpoints (Once Approved)

```
Base URL: https://api.goatapp.it
Rate Limit: ~30 requests/minute (standard tier)

GET /api/v1/products
  Description: List products
  Query: limit, offset, sort
  Example: https://api.goatapp.it/api/v1/products?limit=50

GET /api/v1/products/{id}
  Description: Product details
  Example: https://api.goatapp.it/api/v1/products/nike-air-max-90

GET /api/v1/products/{id}/list
  Description: Ask prices (selling listings)
  Query: limit, filter[size]
  Example: https://api.goatapp.it/api/v1/products/{id}/list?limit=20

GET /api/v1/products/{id}/offers
  Description: Bid prices (buying offers)
  Query: limit
  Example: https://api.goatapp.it/api/v1/products/{id}/offers?limit=20

GET /api/v1/search
  Description: Search products
  Query: q (query)
  Example: https://api.goatapp.it/api/v1/search?q=jordan+retro+11

GET /api/v1/products/{id}/price-history
  Description: Historical price data
  Query: period
  Example: https://api.goatapp.it/api/v1/products/{id}/price-history?period=30d
```

### 2.3 Fallback: GOAT Web Scraping (If API Not Available)

If GOAT denies API access, use web scraping service:

**Option A: a2x.ai (Recommended)**

```bash
# a2x API Documentation
Base URL: https://api.a2x.ai

POST /scrape
Headers:
  Authorization: Bearer YOUR_A2X_API_KEY
  Content-Type: application/json

Body:
{
  "url": "https://goat.com/search?query=nike+air+jordan+11",
  "selector": ".product-tile",
  "fields": ["price", "title", "image"],
  "headless": true
}

Cost: $15-20/month for 10,000 requests/month
Signup: https://a2x.ai
```

**Option B: ScraperAPI**

```bash
# ScraperAPI Documentation
Base URL: https://api.scraperapi.com

GET /scrape
Query Params:
  api_key=YOUR_KEY
  url=https://goat.com/search?query=nike
  render=true (for JavaScript rendering)

Cost: $29/month for 10,000 requests
Signup: https://www.scraperapi.com/
```

---

## Part 3: Shopify API Configuration

### 3.1 Access Shopify Admin

1. Go to: https://premeftp.myshopify.com/admin
2. Log in with your Shopify credentials

### 3.2 Create Custom App

1. Navigate to: **Settings** → **Apps and integrations** → **Develop apps**
2. Click: **Create an app**
3. App name: `PremeFTP Arbitrage Bot`
4. Click: **Create app**

### 3.3 Configure API Scopes

1. In app settings → **Configuration**
2. Under Admin API Scopes, select:
   - [ ] `write_products` (required)
   - [ ] `read_products` (required)
   - [ ] `write_inventory` (required)
   - [ ] `read_inventory` (required)
   - [ ] `write_orders` (required)
   - [ ] `read_orders` (required)
   - [ ] `write_fulfillments` (required)
   - [ ] `read_fulfillments` (required)
3. Click: **Save**

### 3.4 Generate Access Token

1. In app settings → **API Credentials**
2. Copy: **Admin API access token**
3. Store securely (same as StockX API key)

### 3.5 Get API Version & Store URL

```
Store URL: premeftp.myshopify.com
API Version: 2024-07 (or latest stable)
API Endpoint: https://premeftp.myshopify.com/admin/api/2024-07

Check latest version: https://shopify.dev/api/admin-rest/latest
```

### 3.6 Test Shopify API Connection

**cURL Example:**

```bash
curl -X GET "https://premeftp.myshopify.com/admin/api/2024-07/products.json?limit=1" \
  -H "X-Shopify-Access-Token: YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"

# Expected Response (200 OK):
{
  "products": [
    {
      "id": 123456789,
      "title": "Product Name",
      "handle": "product-name",
      "price": "99.99"
    }
  ]
}
```

### 3.7 Common Shopify API Endpoints

```
Base URL: https://premeftp.myshopify.com/admin/api/2024-07

POST /products.json
  Create new product
  
GET /products.json
  List all products
  
PATCH /products/{product_id}.json
  Update product
  
POST /products/{product_id}/variants.json
  Create variant
  
POST /inventory_items/{item_id}/inventory_levels/adjust.json
  Update inventory
  
POST /orders/{order_id}/fulfillments.json
  Create fulfillment (shipment)
```

---

## Part 4: Google Sheets API Configuration

### 4.1 Create Google Cloud Project

1. Go to: https://console.cloud.google.com
2. Click: **Create Project**
3. Project name: `PremeFTP Arbitrage`
4. Click: **Create**

### 4.2 Enable Google Sheets API

1. In Cloud Console: **APIs & Services** → **Library**
2. Search: "Google Sheets API"
3. Click result → **Enable**

### 4.3 Create Service Account (For Automation)

1. **APIs & Services** → **Credentials**
2. Click: **Create Credentials** → **Service Account**
3. Fill details:
   - Service account name: `premeftp-bot`
   - Service account ID: `premeftp-bot@...`
4. Click: **Create and Continue**
5. Grant roles:
   - [ ] Editor (or Sheets Editor if available)
6. Click: **Continue** → **Done**

### 4.4 Create JSON Key

1. Go to: **APIs & Services** → **Service Accounts**
2. Click: **premeftp-bot**
3. Tab: **Keys**
4. Click: **Add Key** → **Create new key**
5. Type: **JSON**
6. Click: **Create**
7. Save file securely (this is your authentication)

### 4.5 Create Google Sheets

1. Go to: https://sheets.google.com
2. Create new sheet:
   - Name: `PremeFTP Arbitrage Tracking`
3. Add tabs (sheets):
   - `StockX_Daily_Log`
   - `arbitrage_spreads_log`
   - `tcg_sealed_product_log`
   - `shopify_auto_created_products`
   - `watched_products`
   - `order_fulfillment_chain`

### 4.6 Get Sheet ID

```
Sheet URL: https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit

Extract SHEET_ID from URL:
https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMKUVfygk-Cjxelttmv3O3KfVaQVx_s/edit

SHEET_ID = 1BxiMVs0XRA5nFMKUVfygk-Cjxelttmv3O3KfVaQVx_s
```

### 4.7 Share Sheet with Service Account

1. In Google Sheet: **Share**
2. Add email: `premeftp-bot@premeftp-arbitrage.iam.gserviceaccount.com`
3. Grant: **Editor** permission
4. Click: **Share**

### 4.8 Test Google Sheets Connection

**Using Google Sheets API (Python Example):**

```python
from google.oauth2 import service_account
import gspread

# Load credentials from JSON key
credentials = service_account.Credentials.from_service_account_file(
    'path/to/service-account-key.json',
    scopes=['https://www.googleapis.com/auth/spreadsheets']
)

# Authenticate
client = gspread.authorize(credentials)

# Open spreadsheet
sheet = client.open_by_key('YOUR_SHEET_ID')

# Access worksheet
worksheet = sheet.worksheet('StockX_Daily_Log')

# Append row
worksheet.append_row(['2026-09-22', 'Nike Air Max 90', '$100', 'Test'])

print("✅ Google Sheets connection successful!")
```

---

## Part 5: Slack Webhook Configuration

### 5.1 Create Slack Workspace (If Needed)

1. Go to: https://slack.com
2. Click: **Create a new workspace**
3. Complete setup

### 5.2 Create Slack Channels

In Slack workspace, create channels:

```
#arbitrage-deals        (Phase 1 alerts)
#arbitrage-spreads      (Phase 2 alerts)
#tcg-arbitrage          (Phase 3 alerts)
#arbitrage-summary      (Daily summaries)
#automation-status      (Workflow status)
```

### 5.3 Create Incoming Webhooks

1. Go to: https://api.slack.com/apps
2. Click: **Create New App** → **From scratch**
3. App name: `PremeFTP Arbitrage Bot`
4. Workspace: Select your workspace
5. Click: **Create App**

### 5.4 Configure Webhooks

1. In app → **Incoming Webhooks**
2. Toggle: **Activate Incoming Webhooks** (turn ON)
3. Click: **Add New Webhook to Workspace**
4. Select channel: `#arbitrage-deals`
5. Click: **Allow**
6. Copy the **Webhook URL**
7. Repeat for other channels

**Webhook URL Format:**
```
https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

### 5.5 Store Webhook URLs

**In Make.com:**

```
Scenario Settings → Variables
Add:
  SLACK_WEBHOOK_DEALS = https://hooks.slack.com/services/...
  SLACK_WEBHOOK_SPREADS = https://hooks.slack.com/services/...
  SLACK_WEBHOOK_TCG = https://hooks.slack.com/services/...
```

### 5.6 Test Slack Webhook

**cURL:**

```bash
curl -X POST 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL' \
  -H 'Content-type: application/json' \
  -d '{"text":"✅ Slack webhook working!"}'
```

**Expected Result:** Message appears in Slack channel

---

## Part 6: TCGPlayer API Configuration

### 6.1 Register as TCGPlayer Seller

1. Go to: https://tcgplayer.com/sellers
2. Click: **Sell with TCGPlayer**
3. Complete registration
4. Verify email

### 6.2 Request API Access

1. Log in to TCGPlayer
2. Go to: **Account** → **Applications**
3. Click: **Create New Application**
4. App name: `PremeFTP Arbitrage Bot`
5. Click: **Create**
6. Copy: **Public Key** and **Private Key**

### 6.3 Get API Token

```bash
# Obtain Bearer Token
curl -X POST "https://api.tcgplayer.com/oauth/authorize" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials" \
  -d "client_id=YOUR_PUBLIC_KEY" \
  -d "client_secret=YOUR_PRIVATE_KEY"

# Response:
{
  "access_token": "YOUR_BEARER_TOKEN",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

### 6.4 Store Token Securely

```
Make.com Environment Variable:
TCG_API_KEY = YOUR_BEARER_TOKEN
```

### 6.5 TCGPlayer API Endpoints

```
Base URL: https://api.tcgplayer.com/api/v2
Rate Limit: 30 req/min (free tier)

GET /products/search
  Description: Search products
  Query: q (query)
  Example: https://api.tcgplayer.com/api/v2/products/search?q=Charizard

GET /products/{id}
  Description: Get product details
  Example: https://api.tcgplayer.com/api/v2/products/123456

GET /pricing/{id}
  Description: Get pricing data
  Example: https://api.tcgplayer.com/api/v2/pricing/123456

GET /inventory
  Description: List active inventory
  Query: limit
  Example: https://api.tcgplayer.com/api/v2/inventory?limit=50
```

---

## Part 7: Security Best Practices

### 7.1 API Key Storage

**Do NOT:**
- Commit API keys to GitHub
- Share keys via Slack/email
- Store in plaintext files
- Use in client-side code

**Do:**
- Store in Make.com environment variables (encrypted)
- Use .env files (add to .gitignore)
- Rotate keys every 90 days
- Use separate keys for dev/prod

### 7.2 Access Control

```
File: .env
NEVER commit this file!

Add to .gitignore:
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
echo "*.key" >> .gitignore
```

### 7.3 Audit Logging

Track API usage:

```bash
# StockX API - Check usage in developer.stockx.com dashboard
# GOAT API - Included in API calls log
# Shopify API - Admin → Settings → Apps → Activity
# Google Sheets - File → Version history
# Slack - View message history
```

### 7.4 Rate Limiting Strategy

| API | Limit | Strategy |
|-----|-------|----------|
| StockX | 100 req/min | 1 request every 1 second |
| GOAT | 30 req/min | 1 request every 2 seconds |
| Shopify | Varies | Batch requests; respect bucket |
| Google Sheets | Varies | Batch append rows (max 100/min) |
| Slack | Unlimited | No limit; safe to use freely |

---

## Part 8: Environment Variables Template

Create `.env.example` (commit to GitHub) and `.env` (gitignored):

```bash
# .env.example (safe to commit)
STOCKX_API_KEY=your_key_here
GOAT_API_KEY=your_key_here
SHOPIFY_ACCESS_TOKEN=your_token_here
TCG_API_KEY=your_token_here

GSHEET_STOCKX_LOG_ID=sheet_id_here
GSHEET_TRACKING_ID=sheet_id_here
GSHEET_TCG_LOG_ID=sheet_id_here

SLACK_WEBHOOK_DEALS=webhook_url_here
SLACK_WEBHOOK_SPREADS=webhook_url_here
SLACK_WEBHOOK_TCG=webhook_url_here
```

```bash
# .env (DO NOT commit)
STOCKX_API_KEY=sk-abc123xyz789...
GOAT_API_KEY=Bearer xyz789abc123...
# etc.
```

---

## Part 9: Troubleshooting Checklist

### API Key Issues

- [ ] API key is active (check provider dashboard)
- [ ] API key has correct scopes/permissions
- [ ] API key is not expired or rate-limited
- [ ] Correct Authorization header format used
- [ ] Network access not blocked by firewall

### Integration Issues

- [ ] All required environment variables set
- [ ] API endpoints are correct and current
- [ ] Request/response format matches documentation
- [ ] Timezone settings correct (use ET for timestamps)
- [ ] Error messages logged for debugging

### Performance Issues

- [ ] API rate limits not exceeded
- [ ] Response timeouts configured (30 sec minimum)
- [ ] Batch requests used where possible
- [ ] Redundant API calls eliminated
- [ ] Caching implemented (where applicable)

---

## Part 10: Support Contacts

| Service | Contact | Response Time |
|---------|---------|-----------------|
| StockX Developer | support@developer.stockx.com | 24-48 hours |
| GOAT | dev@goat.com | 48-72 hours |
| Shopify | help@shopify.com | 24 hours |
| TCGPlayer | support@tcgplayer.com | 24-48 hours |
| Google Cloud | https://cloud.google.com/support | Varies by plan |
| Slack | https://slack.com/help | Community support |

---

**Document Version:** 1.0  
**Last Updated:** 2026-09-22  
**Status:** Ready for Use

