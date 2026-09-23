# Phase 2 & 3 Pre-Launch Checklists

**Date:** 2026-09-22  
**Purpose:** Comprehensive verification procedures before Phase 2 (Cross-Platform Automation) and Phase 3 (Pokémon TCG) go-live  
**Authority:** PremeOS Cross-Platform Arbitrage Automation Program

---

## TABLE OF CONTENTS

1. [Phase 2: Cross-Platform Automation Pre-Launch](#phase-2-cross-platform-automation-pre-launch)
2. [Phase 3: Pokémon TCG Arbitrage Pre-Launch](#phase-3-pokémon-tcg-arbitrage-pre-launch)
3. [Go/No-Go Decision Framework](#gono-go-decision-framework)
4. [Risk Mitigation & Failover Procedures](#risk-mitigation--failover-procedures)
5. [Launch Authority Sign-Off](#launch-authority-sign-off)

---

## PHASE 2: CROSS-PLATFORM AUTOMATION PRE-LAUNCH

### 2.1 API Credential Verification Checklist

**Objective:** Verify all third-party API credentials are valid, secure, and properly configured.

**Platforms:** StockX, GOAT, Make.com, Slack, Google Sheets

| # | Verification Task | Status | Evidence | Owner | Date |
|---|---|---|---|---|---|
| 2.1.1 | **StockX API Key** - Retrieve from secure vault | ☐ | Key ID: _______ | | |
| 2.1.2 | **StockX API Authentication Test** - Execute test call to `/auth/verify` | ☐ | Response time: ___ms | | |
| 2.1.3 | **StockX Rate Limits** - Confirm configured limits are 100 req/min | ☐ | Config file: _______ | | |
| 2.1.4 | **StockX Data Access Scopes** - Verify can query: product data, price history, inventory | ☐ | Test IDs: _______ | | |
| 2.1.5 | **GOAT API Key** - Retrieve from secure vault | ☐ | Key ID: _______ | | |
| 2.1.6 | **GOAT API Authentication Test** - Execute test call to `/api/auth/verify` | ☐ | Response time: ___ms | | |
| 2.1.7 | **GOAT Rate Limits** - Confirm configured limits are 80 req/min | ☐ | Config file: _______ | | |
| 2.1.8 | **GOAT Data Access Scopes** - Verify can query: product data, listings, inventory | ☐ | Test IDs: _______ | | |
| 2.1.9 | **Make.com API Token** - Retrieve webhook URL from Make account | ☐ | URL: _______ | | |
| 2.1.10 | **Make.com Webhook Test** - Send test payload and verify receipt | ☐ | Timestamp: _______ | | |
| 2.1.11 | **Slack Bot Token** - Verify token permissions include chat:write, channels:read | ☐ | Token scope: _______ | | |
| 2.1.12 | **Slack Channel Verification** - Confirm bot can post to: #alerts, #arbitrage-live | ☐ | Test message: _______ | | |
| 2.1.13 | **Google Sheets API** - Verify service account can read/write | ☐ | Service account ID: _______ | | |
| 2.1.14 | **Google Sheets Auth Test** - Execute test write to staging sheet | ☐ | Spreadsheet ID: _______ | | |
| 2.1.15 | **Credentials Rotation Schedule** - Verify quarterly rotation is scheduled | ☐ | Rotation date: _______ | | |
| 2.1.16 | **Secrets Manager Audit** - Confirm no credentials in code/logs | ☐ | Audit report: _______ | | |
| 2.1.17 | **API Key Expiration Monitoring** - Set calendar alerts for each credential | ☐ | Alert dates: _______ | | |
| 2.1.18 | **Fallback Credentials** - Verify secondary API keys exist in vault | ☐ | Backup IDs: _______ | | |

**Sign-Off:** ☐ All 18 items verified by: _____________ (Date: _______)

---

### 2.2 Make.com Workflow Setup Verification

**Objective:** Ensure all Make.com workflows are properly configured, tested, and ready for production.

**Workflows to Verify:**
- W1: StockX Price Monitor (trigger: 30min interval)
- W2: GOAT Price Monitor (trigger: 30min interval)
- W3: Arbitrage Opportunity Detector (trigger: on new price data)
- W4: Alert Dispatcher (trigger: on opportunity detected)
- W5: Inventory Manager (trigger: on sale confirmation)

| # | Workflow Task | Status | Evidence | Owner | Date |
|---|---|---|---|---|---|
| 2.2.1 | **W1: StockX Monitor - Trigger Test** - Execute once, verify fires correctly | ☐ | Execution ID: _______ | | |
| 2.2.2 | **W1: Data Parsing** - Verify StockX response parsed correctly to fields | ☐ | Sample output: _______ | | |
| 2.2.3 | **W1: Error Handling** - Test with invalid API response, verify fallback executes | ☐ | Error log: _______ | | |
| 2.2.4 | **W1: Rate Limit Handling** - Trigger 150 times rapidly, verify respects 100 req/min | ☐ | Throttle test: _______ | | |
| 2.2.5 | **W2: GOAT Monitor - Trigger Test** - Execute once, verify fires correctly | ☐ | Execution ID: _______ | | |
| 2.2.6 | **W2: Data Parsing** - Verify GOAT response parsed correctly to fields | ☐ | Sample output: _______ | | |
| 2.2.7 | **W2: Error Handling** - Test with invalid API response, verify fallback executes | ☐ | Error log: _______ | | |
| 2.2.8 | **W2: Rate Limit Handling** - Trigger 100 times rapidly, verify respects 80 req/min | ☐ | Throttle test: _______ | | |
| 2.2.9 | **W3: Opportunity Detector - Input Test** - Pass sample price data, verify detection logic | ☐ | Test results: _______ | | |
| 2.2.10 | **W3: Threshold Calculation** - Verify correctly calculates arbitrage margin >15% | ☐ | Formula test: _______ | | |
| 2.2.11 | **W3: Filter Logic** - Test edge cases (exactly 15%, below 15%, no data) | ☐ | Edge cases: _______ | | |
| 2.2.12 | **W4: Alert Dispatcher - Slack Test** - Trigger opportunity, verify alert posted | ☐ | Slack message: _______ | | |
| 2.2.13 | **W4: Sheets Update Test** - Trigger opportunity, verify row added to tracking sheet | ☐ | Sheet row: _______ | | |
| 2.2.14 | **W4: Deduplication Logic** - Send same opportunity 2x, verify only 1 alert sent | ☐ | Dedup test: _______ | | |
| 2.2.15 | **W5: Inventory Manager - Stock Decrement** - Simulate sale, verify inventory updated | ☐ | Inventory log: _______ | | |
| 2.2.16 | **W5: Low Stock Alert** - Reduce inventory below threshold, verify alert sent | ☐ | Alert log: _______ | | |
| 2.2.17 | **Workflow Dependencies** - Verify all workflows execute in correct sequence | ☐ | Dependency map: _______ | | |
| 2.2.18 | **Execution Timeout Handling** - Test timeout scenarios, verify graceful degradation | ☐ | Timeout test: _______ | | |
| 2.2.19 | **Logging & Monitoring** - Verify all workflows log execution to central dashboard | ☐ | Dashboard: _______ | | |
| 2.2.20 | **Workflow Documentation** - Each workflow has runbook and troubleshooting guide | ☐ | Doc location: _______ | | |

**Sign-Off:** ☐ All 20 items verified by: _____________ (Date: _______)

---

### 2.3 Alert Configuration Checklist

**Objective:** Verify all alerts are properly routed, throttled, and actionable.

**Alert Channels:** Slack, Google Sheets, Email (optional)

| # | Alert Configuration Task | Status | Evidence | Owner | Date |
|---|---|---|---|---|---|
| 2.3.1 | **Slack Alerts - Channel Subscriptions** - #alerts subscribed to: API errors, rate limits | ☐ | Channel ID: _______ | | |
| 2.3.2 | **Slack Alerts - Channel Subscriptions** - #arbitrage-live subscribed to: opportunities | ☐ | Channel ID: _______ | | |
| 2.3.3 | **Slack Alerts - Formatting** - Verify alerts include: timestamp, platform, price, margin | ☐ | Sample alert: _______ | | |
| 2.3.4 | **Slack Alerts - Throttling** - Verify same alert not sent more than 1x per 2 hours | ☐ | Throttle config: _______ | | |
| 2.3.5 | **Slack Alerts - Threading** - Related alerts grouped by opportunity ID | ☐ | Thread test: _______ | | |
| 2.3.6 | **Sheets Alerts - Opportunity Log** - Verify real-time row insertion | ☐ | Sheet ID: _______ | | |
| 2.3.7 | **Sheets Alerts - Status Tracking** - Create Status column (Pending→Active→Sold→Failed) | ☐ | Column exists: _______ | | |
| 2.3.8 | **Sheets Alerts - Timestamp** - Each row includes created_at and processed_at | ☐ | Format verified: _______ | | |
| 2.3.9 | **Sheets Alerts - Performance Columns** - Platform, buy_price, sell_price, margin_pct | ☐ | Columns verified: _______ | | |
| 2.3.10 | **Email Alerts - Critical Only** - Only API failures/system issues trigger email | ☐ | Email rules: _______ | | |
| 2.3.11 | **Email Alerts - Recipient List** - Verify primary + backup email addresses | ☐ | Recipients: _______ | | |
| 2.3.12 | **Alert Response SLAs** - Define: critical=15min, high=1hr, medium=4hr, low=24hr | ☐ | SLA document: _______ | | |
| 2.3.13 | **Alert Escalation Logic** - Critical alerts sent to multiple channels after 30 min | ☐ | Escalation config: _______ | | |
| 2.3.14 | **Alert Suppression** - Maintenance windows don't trigger false alerts | ☐ | Suppression rules: _______ | | |
| 2.3.15 | **Alert Testing** - Manual trigger all alert types, verify all channels receive | ☐ | Test results: _______ | | |

**Sign-Off:** ☐ All 15 items verified by: _____________ (Date: _______)

---

### 2.4 Testing Procedures (5 SKU Test Run)

**Objective:** Execute end-to-end workflow testing with real data from 5 representative SKUs.

**Test SKUs:** Nike Air Max 90 (size 10), Jordan 1 Retro High (size 11), Adidas Ultra Boost (size 9), Yeezy 350 (size 10), New Balance 990v6 (size 11)

| # | Testing Task | SKU 1 | SKU 2 | SKU 3 | SKU 4 | SKU 5 | Evidence | Date |
|---|---|---|---|---|---|---|---|---|
| 2.4.1 | **Initial Price Fetch** - Retrieve current prices from StockX | ☐ | ☐ | ☐ | ☐ | ☐ | Prices logged: _______ | |
| 2.4.2 | **Initial Price Fetch** - Retrieve current prices from GOAT | ☐ | ☐ | ☐ | ☐ | ☐ | Prices logged: _______ | |
| 2.4.3 | **Opportunity Detection** - Calculate margins, verify >15% threshold logic | ☐ | ☐ | ☐ | ☐ | ☐ | Margin calc: _______ | |
| 2.4.4 | **Alert Generation** - Opportunities trigger alerts to Slack | ☐ | ☐ | ☐ | ☐ | ☐ | Alert count: _______ | |
| 2.4.5 | **Sheets Logging** - Each opportunity added to tracking sheet | ☐ | ☐ | ☐ | ☐ | ☐ | Row count: _______ | |
| 2.4.6 | **Wait Test** - Run for 60 minutes, monitor price updates | ☐ | ☐ | ☐ | ☐ | ☐ | Update count: _______ | |
| 2.4.7 | **Error Handling** - Simulate API failure, verify fallback activates | ☐ | ☐ | ☐ | ☐ | ☐ | Error log: _______ | |
| 2.4.8 | **Performance Metric** - Average execution time per SKU <2 seconds | ☐ | ☐ | ☐ | ☐ | ☐ | Avg time: _______ | |
| 2.4.9 | **Data Accuracy** - Spot-check prices against live platforms (manual) | ☐ | ☐ | ☐ | ☐ | ☐ | Accuracy: _______ | |
| 2.4.10 | **No Duplicates** - Verify no duplicate alerts for same opportunity | ☐ | ☐ | ☐ | ☐ | ☐ | Duplication: _______ | |

**Test Run Duration:** 3 hours per SKU = 15 hours total (can run in parallel)  
**Test Window:** _________________ (Date)  
**Test Coordinator:** _________________________

**Overall Test Result:** ☐ PASS (all criteria met) | ☐ CONDITIONAL PASS (minor issues documented) | ☐ FAIL (blockers identified)

**Issues Identified:**
1. ___________________________________________________________________________
2. ___________________________________________________________________________
3. ___________________________________________________________________________

**Sign-Off:** ☐ Test results reviewed by: _____________ (Date: _______)

---

### 2.5 Performance Monitoring Setup

**Objective:** Establish real-time dashboards and KPI tracking for Phase 2 operations.

| # | Monitoring Task | Status | Evidence | Owner | Date |
|---|---|---|---|---|---|
| 2.5.1 | **Metric: API Response Time** - StockX (target: <500ms) | ☐ | Dashboard URL: _______ | | |
| 2.5.2 | **Metric: API Response Time** - GOAT (target: <500ms) | ☐ | Dashboard URL: _______ | | |
| 2.5.3 | **Metric: Workflow Execution Time** - Price Monitor (target: <2s per SKU) | ☐ | Dashboard URL: _______ | | |
| 2.5.4 | **Metric: Workflow Execution Time** - Opportunity Detector (target: <1s) | ☐ | Dashboard URL: _______ | | |
| 2.5.5 | **Metric: Error Rate** - API failures (target: <0.5%) | ☐ | Dashboard URL: _______ | | |
| 2.5.6 | **Metric: Error Rate** - Workflow failures (target: <1%) | ☐ | Dashboard URL: _______ | | |
| 2.5.7 | **Metric: Opportunity Detection Rate** - Avg opportunities per hour | ☐ | Dashboard URL: _______ | | |
| 2.5.8 | **Metric: Alert Latency** - Time from detection to Slack post (target: <10s) | ☐ | Dashboard URL: _______ | | |
| 2.5.9 | **Metric: Sheet Update Latency** - Time from detection to sheet row (target: <15s) | ☐ | Dashboard URL: _______ | | |
| 2.5.10 | **Metric: SKU Coverage** - Percentage of inventory with price updates (target: >90%) | ☐ | Dashboard URL: _______ | | |
| 2.5.11 | **Alerting Rules** - Email notification if response time > 1000ms | ☐ | Rule configured: _______ | | |
| 2.5.12 | **Alerting Rules** - Email notification if error rate > 2% | ☐ | Rule configured: _______ | | |
| 2.5.13 | **Alerting Rules** - Email notification if workflow execution time > 5s | ☐ | Rule configured: _______ | | |
| 2.5.14 | **Daily Report** - Auto-generated report sent to owner daily at 8am | ☐ | Report template: _______ | | |
| 2.5.15 | **Dashboard Backup** - Metrics exported weekly to Google Sheets | ☐ | Backup sheet: _______ | | |

**Sign-Off:** ☐ All monitoring configured by: _____________ (Date: _______)

---

### 2.6 Failover Procedures

**Objective:** Establish documented procedures for handling failures and recovery.

#### 2.6.1 StockX API Failure Scenario

| Step | Action | Verification | Owner | Status |
|------|--------|---|---|---|
| 1 | Detect: No response from StockX within 30s | Alert posted to #alerts | | ☐ |
| 2 | Log: Record failure with timestamp to error log | Error entry created | | ☐ |
| 3 | Notify: Email notification sent to ops team | Email received | | ☐ |
| 4 | Wait: Retry with exponential backoff (1s, 2s, 4s, 8s, 16s) | 5 retries completed | | ☐ |
| 5 | Fallback: If all retries fail, skip update for this cycle | Cycle skipped safely | | ☐ |
| 6 | Resume: Resume normal operation in next cycle (30 min) | Monitoring continues | | ☐ |
| 7 | Review: Manual inspection of missed data after recovery | Data integrity checked | | ☐ |
| 8 | Document: Incident logged with RCA | Incident doc created | | ☐ |

**Runbook Location:** _____________________

#### 2.6.2 Make.com Webhook Failure Scenario

| Step | Action | Verification | Owner | Status |
|------|--------|---|---|---|
| 1 | Detect: Webhook returns error status (5xx) | Alert posted to #alerts | | ☐ |
| 2 | Log: Record error with response body | Error entry with details | | ☐ |
| 3 | Queue: Store failed payload in DLQ (Dead Letter Queue) | Payload in queue | | ☐ |
| 4 | Notify: Slack alert sent to #operations | Alert confirmed | | ☐ |
| 5 | Retry: Automated retry every 5 minutes for 1 hour | Retry log visible | | ☐ |
| 6 | Manual Review: After 1 hour, queue reviewed by ops team | Manual review SOP | | ☐ |
| 7 | Resubmit: Ops manually resubmits DLQ payloads | Payloads reprocessed | | ☐ |
| 8 | Document: Incident and resolution documented | Incident doc created | | ☐ |

**Runbook Location:** _____________________

#### 2.6.3 Database/Sheets Write Failure Scenario

| Step | Action | Verification | Owner | Status |
|------|--------|---|---|---|
| 1 | Detect: Write to Google Sheets fails | Alert posted to #alerts | | ☐ |
| 2 | Log: Record error and attempted data | Error entry with payload | | ☐ |
| 3 | Cache: Store row in local cache/buffer | Cache file created | | ☐ |
| 4 | Notify: Email sent to owner | Email confirmed | | ☐ |
| 5 | Retry: Batch retry after 5 minutes | Retry scheduled | | ☐ |
| 6 | Manual Review: If retry fails, ops team investigates | Investigation SOP | | ☐ |
| 7 | Resubmit: Ops manually adds cached rows to sheet | Rows added | | ☐ |
| 8 | Verify: Spot-check data integrity in sheet | Data integrity OK | | ☐ |

**Runbook Location:** _____________________

#### 2.6.4 Rate Limit Exceeded Scenario

| Step | Action | Verification | Owner | Status |
|------|--------|---|---|---|
| 1 | Detect: API returns 429 (Too Many Requests) | Alert logged | | ☐ |
| 2 | Pause: Immediately stop sending requests to that API | Outgoing requests stopped | | ☐ |
| 3 | Log: Record retry-after header or default to 60s backoff | Backoff logged | | ☐ |
| 4 | Notify: Alert sent to ops (rate limit not critical) | Alert sent | | ☐ |
| 5 | Wait: Honor backoff duration before resuming | Backoff timer active | | ☐ |
| 6 | Resume: Gradually resume with reduced request rate | Request rate reduced | | ☐ |
| 7 | Monitor: Track rate limits for 24 hours | Monitoring logs | | ☐ |
| 8 | Analyze: Review usage patterns to prevent recurrence | RCA documented | | ☐ |

**Runbook Location:** _____________________

---

## PHASE 3: POKÉMON TCG ARBITRAGE PRE-LAUNCH

### 3.1 Sourcing Channel Activation Checklist

**Objective:** Activate and verify all sourcing channels for Pokémon TCG inventory acquisition.

**Channels:** Retail (Target, Walmart, Best Buy), Community (local trading groups), Wholesale (distributors)

| # | Sourcing Channel Task | Status | Evidence | Owner | Date |
|---|---|---|---|---|---|
| 3.1.1 | **Retail Partner: Target** - Verify account can be created online | ☐ | Account ID: _______ | | |
| 3.1.2 | **Retail Partner: Target** - Test product searches for Pokémon TCG sets | ☐ | Sample product: _______ | | |
| 3.1.3 | **Retail Partner: Target** - Document current inventory & pricing | ☐ | Price sheet: _______ | | |
| 3.1.4 | **Retail Partner: Target** - Establish purchase frequency (daily/weekly) | ☐ | Purchase plan: _______ | | |
| 3.1.5 | **Retail Partner: Target** - Identify local store for in-person pickup | ☐ | Store ID: _______ | | |
| 3.1.6 | **Retail Partner: Walmart** - Verify account can be created online | ☐ | Account ID: _______ | | |
| 3.1.7 | **Retail Partner: Walmart** - Test product searches for Pokémon TCG sets | ☐ | Sample product: _______ | | |
| 3.1.8 | **Retail Partner: Walmart** - Document current inventory & pricing | ☐ | Price sheet: _______ | | |
| 3.1.9 | **Retail Partner: Walmart** - Establish purchase frequency (daily/weekly) | ☐ | Purchase plan: _______ | | |
| 3.1.10 | **Retail Partner: Walmart** - Identify local store for in-person pickup | ☐ | Store ID: _______ | | |
| 3.1.11 | **Retail Partner: Best Buy** - Verify account can be created online | ☐ | Account ID: _______ | | |
| 3.1.12 | **Retail Partner: Best Buy** - Test product searches (limited TCG section) | ☐ | Sample product: _______ | | |
| 3.1.13 | **Retail Partner: Best Buy** - Document current inventory & pricing | ☐ | Price sheet: _______ | | |
| 3.1.14 | **Community Network: Local Trading Groups** - Identify 3+ Discord/Reddit TCG communities | ☐ | Groups listed: _______ | | |
| 3.1.15 | **Community Network: Introduction** - Join groups and introduce buying initiative | ☐ | Intro posts: _______ | | |
| 3.1.16 | **Community Network: Relationships** - Establish relationships with 5+ active traders | ☐ | Contacts: _______ | | |
| 3.1.17 | **Community Network: Offers** - Communicate buying price for common sets | ☐ | Price list: _______ | | |
| 3.1.18 | **Wholesale: Distributor Research** - Identify 3+ TCG distributors (Pokemon Company partners) | ☐ | Distributors: _______ | | |
| 3.1.19 | **Wholesale: Account Creation** - Apply for wholesale/reseller accounts | ☐ | Account IDs: _______ | | |
| 3.1.20 | **Wholesale: Verification** - Provide proof of business (resale license/EIN) | ☐ | Docs submitted: _______ | | |
| 3.1.21 | **Wholesale: Pricing** - Obtain wholesale price sheets & MOQ (minimum order quantity) | ☐ | Price sheet: _______ | | |
| 3.1.22 | **Wholesale: Payment Terms** - Establish payment method (credit card/ACH/invoice) | ☐ | Terms agreed: _______ | | |
| 3.1.23 | **Sourcing Tracking System** - Create spreadsheet to track inventory by source | ☐ | Tracker URL: _______ | | |
| 3.1.24 | **Sourcing SOP** - Document daily purchasing workflow for each channel | ☐ | SOP location: _______ | | |

**Sign-Off:** ☐ All 24 items verified by: _____________ (Date: _______)

---

### 3.2 Grading Service Setup Checklist

**Objective:** Establish accounts and workflows with professional grading services for TCG card authentication and valuation.

**Grading Services:** PSA (Professional Sports Authenticator), CGC (Certified Guaranty Company), BGS (Beckett Grading Services)

| # | Grading Service Task | Status | Evidence | Owner | Date |
|---|---|---|---|---|---|
| 3.2.1 | **PSA: Account Creation** - Create online account at PSA.com | ☐ | Account ID: _______ | | |
| 3.2.2 | **PSA: Submission Form** - Complete submission agreement and pricing options | ☐ | Form submitted: _______ | | |
| 3.2.3 | **PSA: Turnaround Options** - Verify available grading tiers (Standard/Express/Bulk) | ☐ | Tiers verified: _______ | | |
| 3.2.4 | **PSA: Pricing Confirmation** - Confirm grading fees per card ($20-100+) | ☐ | Price confirmed: _______ | | |
| 3.2.5 | **PSA: Shipping Setup** - Establish secure shipping method (insured/tracked) | ☐ | Method: _______ | | |
| 3.2.6 | **PSA: Card Insurance** - Verify all submissions insured for full value | ☐ | Insurance confirmed: _______ | | |
| 3.2.7 | **PSA: Tracking Integration** - Integrate PSA tracking API for status updates | ☐ | API connected: _______ | | |
| 3.2.8 | **PSA: Sample Submission** - Submit test batch of 3-5 cards for grading | ☐ | Batch ID: _______ | | |
| 3.2.9 | **PSA: Grade Receipt Verification** - Confirm grades received and documented | ☐ | Grades recorded: _______ | | |
| 3.2.10 | **CGC: Account Creation** - Create online account at CGCcards.com | ☐ | Account ID: _______ | | |
| 3.2.11 | **CGC: Submission Form** - Complete submission agreement and pricing options | ☐ | Form submitted: _______ | | |
| 3.2.12 | **CGC: Turnaround Options** - Verify available grading tiers | ☐ | Tiers verified: _______ | | |
| 3.2.13 | **CGC: Pricing Confirmation** - Confirm grading fees per card | ☐ | Price confirmed: _______ | | |
| 3.2.14 | **CGC: Shipping Setup** - Establish secure shipping method | ☐ | Method: _______ | | |
| 3.2.15 | **CGC: Card Insurance** - Verify all submissions insured | ☐ | Insurance confirmed: _______ | | |
| 3.2.16 | **CGC: Tracking Integration** - Integrate CGC tracking system | ☐ | Integration complete: _______ | | |
| 3.2.17 | **CGC: Sample Submission** - Submit test batch of 3-5 cards | ☐ | Batch ID: _______ | | |
| 3.2.18 | **BGS: Account Creation** - Create online account at BGSgrading.com | ☐ | Account ID: _______ | | |
| 3.2.19 | **BGS: Submission Form** - Complete submission agreement | ☐ | Form submitted: _______ | | |
| 3.2.20 | **BGS: Turnaround Options** - Verify available grading tiers | ☐ | Tiers verified: _______ | | |
| 3.2.21 | **BGS: Pricing Confirmation** - Confirm grading fees | ☐ | Price confirmed: _______ | | |
| 3.2.22 | **BGS: Shipping Setup** - Establish secure shipping method | ☐ | Method: _______ | | |
| 3.2.23 | **BGS: Card Insurance** - Verify all submissions insured | ☐ | Insurance confirmed: _______ | | |
| 3.2.24 | **BGS: Tracking Integration** - Integrate BGS tracking system | ☐ | Integration complete: _______ | | |
| 3.2.25 | **Grading SOP** - Document complete card submission workflow | ☐ | SOP location: _______ | | |
| 3.2.26 | **Grading Thresholds** - Define card grades that trigger grading service use | ☐ | Threshold doc: _______ | | |
| 3.2.27 | **Financial Tracking** - Calculate total grading costs by volume | ☐ | Cost model: _______ | | |
| 3.2.28 | **Graded Card Inventory** - Set up tracking for graded vs ungraded cards | ☐ | Tracking sheet: _______ | | |

**Sign-Off:** ☐ All 28 items verified by: _____________ (Date: _______)

---

### 3.3 Capital Allocation Verification Checklist

**Objective:** Verify sufficient capital is allocated and accessible for Phase 3 operations.

| # | Capital Allocation Task | Status | Amount | Evidence | Owner | Date |
|---|---|---|---|---|---|---|
| 3.3.1 | **Total Budget for Phase 3** - Determine total capital needed for first 90 days | ☐ | $_______ | Budget doc: _______ | | |
| 3.3.2 | **Retail Sourcing Budget** - Allocate capital for Target/Walmart/Best Buy purchases | ☐ | $_______ | Budget line: _______ | | |
| 3.3.3 | **Community Sourcing Budget** - Allocate capital for local trader purchases | ☐ | $_______ | Budget line: _______ | | |
| 3.3.4 | **Wholesale Sourcing Budget** - Allocate capital for distributor bulk purchases | ☐ | $_______ | Budget line: _______ | | |
| 3.3.5 | **Grading Service Budget** - Allocate capital for PSA/CGC/BGS fees | ☐ | $_______ | Budget line: _______ | | |
| 3.3.6 | **Shipping & Handling Budget** - Allocate capital for storage/packaging/shipping | ☐ | $_______ | Budget line: _______ | | |
| 3.3.7 | **Buffer/Contingency** - Allocate 15% contingency for unexpected costs | ☐ | $_______ | Budget line: _______ | | |
| 3.3.8 | **Cash Flow Verification** - Confirm capital available in operating account | ☐ | Account balance: $_______ | Bank statement: _______ | | |
| 3.3.9 | **Access Verification** - Verify authorized user can withdraw/transfer funds | ☐ | User: _______ | Auth confirmed: _______ | | |
| 3.3.10 | **Payment Methods Enabled** - Verify credit card, ACH, and wire transfer are active | ☐ | Methods: _______ | Confirmation: _______ | | |
| 3.3.11 | **Wholesale Terms** - Document payment terms (net 30, net 60, prepay) for each distributor | ☐ | Terms doc: _______ | Payment schedule: _______ | | |
| 3.3.12 | **Expense Tracking System** - Create spreadsheet to track all Phase 3 expenses | ☐ | Tracker URL: _______ | Columns: _______ | | |
| 3.3.13 | **ROI Projection** - Calculate expected return on investment based on market analysis | ☐ | ROI %: _______% | Analysis doc: _______ | | |
| 3.3.14 | **Break-Even Timeline** - Calculate days to break even on initial investment | ☐ | Days: _______ | Model: _______ | | |
| 3.3.15 | **Monthly Burn Rate** - Verify monthly operating costs are sustainable | ☐ | Monthly cost: $_______ | Sustainability: _______ | | |

**Sign-Off:** ☐ All 15 items verified by: _____________ (Date: _______)

---

### 3.4 Inventory Tracking System Setup Checklist

**Objective:** Establish comprehensive inventory management system for TCG cards from acquisition through liquidation.

| # | Inventory Tracking Task | Status | Evidence | Owner | Date |
|---|---|---|---|---|---|
| 3.4.1 | **Inventory Database** - Create spreadsheet or tool with columns: ID, Set, Condition, Purchase Price, Acquisition Date | ☐ | Sheet/DB URL: _______ | | |
| 3.4.2 | **Inventory Fields** - Add fields: Grading Status, Graded Score, Current Value, Holding Date, Margin % | ☐ | Fields added: _______ | | |
| 3.4.3 | **SKU System** - Define unique SKU for each card (Set+Card Number+Condition+Grade) | ☐ | SKU format: _______ | | |
| 3.4.4 | **Location Tracking** - Track physical storage location (storage box, shelf, secure storage) | ☐ | Location codes: _______ | | |
| 3.4.5 | **Photo Documentation** - Establish process to photograph cards upon receipt | ☐ | Photo storage: _______ | | |
| 3.4.6 | **Condition Assessment** - Define condition grading scale (Mint/NM/LP/MP/HP) | ☐ | Scale document: _______ | | |
| 3.4.7 | **Condition Assessment** - Document condition assessment process (light/dark, creases, corners) | ☐ | SOP location: _______ | | |
| 3.4.8 | **Real-Time Updates** - Test daily inventory updates (add purchases, record gradings) | ☐ | Test completed: _______ | | |
| 3.4.9 | **Alert Rules** - Set up alerts for: cards held >60 days, grading pending >30 days | ☐ | Rules configured: _______ | | |
| 3.4.10 | **Reorder Points** - Define reorder triggers for high-margin sets | ☐ | Triggers: _______ | | |
| 3.4.11 | **Inventory Accuracy** - Perform physical count of all inventory and reconcile with system | ☐ | Count completed: _______ | | |
| 3.4.12 | **Loss/Damage Tracking** - Document any damaged or lost cards | ☐ | Log created: _______ | | |
| 3.4.13 | **Inventory Reports** - Set up daily inventory status report | ☐ | Report template: _______ | | |
| 3.4.14 | **Valuation Method** - Document how current values are determined (market price API or manual lookup) | ☐ | Method documented: _______ | | |
| 3.4.15 | **Valuation Updates** - Configure daily market value updates for each card | ☐ | Update frequency: _______ | | |

**Sign-Off:** ☐ All 15 items verified by: _____________ (Date: _______)

---

### 3.5 Pricing Formula Configuration Checklist

**Objective:** Establish pricing strategy and automate pricing decisions for Shopify store listings.

| # | Pricing Configuration Task | Status | Evidence | Owner | Date |
|---|---|---|---|---|---|
| 3.5.1 | **Market Price Source** - Define source for market prices (TCGPlayer, eBay sold listings, Cardmarket) | ☐ | Source: _______ | | |
| 3.5.2 | **Market Price Integration** - Connect pricing tool to market data source (API or manual lookup) | ☐ | Integration: _______ | | |
| 3.5.3 | **Base Formula** - Define pricing formula: Market Price × (1 + Markup %) - Grading Premium | ☐ | Formula: _______ | | |
| 3.5.4 | **Markup % Configuration** - Set baseline markup for ungraded cards (15-25%) | ☐ | Markup: _______% | | |
| 3.5.5 | **Grading Premium** - Define premium for graded cards (PSA 9 = +20%, PSA 10 = +30%) | ☐ | Premiums: _______ | | |
| 3.5.6 | **Condition Adjustment** - Define price adjustments by condition (Mint = 0%, NM = -10%, LP = -25%) | ☐ | Adjustments: _______ | | |
| 3.5.7 | **Rarity Multiplier** - Define price multipliers for rare/promotional sets | ☐ | Multipliers: _______ | | |
| 3.5.8 | **Age Adjustment** - Define discount for cards held >120 days (reduce by 5-10% to move inventory) | ☐ | Discount: _______% | | |
| 3.5.9 | **Competitor Pricing** - Monitor competitor prices and define ceiling/floor prices | ☐ | Monitoring plan: _______ | | |
| 3.5.10 | **Seasonal Adjustment** - Define seasonal multipliers (holiday season +10%) | ☐ | Adjustments: _______ | | |
| 3.5.11 | **Min/Max Prices** - Define minimum and maximum prices per card to prevent errors | ☐ | Min: $_______ Max: $_______ | | |
| 3.5.12 | **Test Pricing** - Apply formula to 10 sample cards and verify prices are competitive | ☐ | Sample prices: _______ | | |
| 3.5.13 | **Shopify Integration** - Connect pricing formula to Shopify product listings | ☐ | Integration tested: _______ | | |
| 3.5.14 | **Automated Updates** - Set up daily price updates to Shopify catalog | ☐ | Update schedule: _______ | | |
| 3.5.15 | **Price History Log** - Track all price changes for analytics | ☐ | Log location: _______ | | |
| 3.5.16 | **Price Alert Rules** - Alert if formula produces prices >2x market price (sanity check) | ☐ | Alerts configured: _______ | | |
| 3.5.17 | **Manual Override Capability** - Allow ops team to manually adjust prices during errors | ☐ | Override process: _______ | | |
| 3.5.18 | **Margin Analysis** - Calculate average margin per card and track profitability | ☐ | Analysis: _______ | | |

**Sign-Off:** ☐ All 18 items verified by: _____________ (Date: _______)

---

### 3.6 Liquidation Window Monitoring Setup Checklist

**Objective:** Establish system to identify and execute optimal liquidation windows for inventory.

| # | Liquidation Window Task | Status | Evidence | Owner | Date |
|---|---|---|---|---|---|
| 3.6.1 | **Market Sentiment Tracking** - Monitor TCG market sentiment via social media, forums, Discord | ☐ | Tracking method: _______ | | |
| 3.6.2 | **Price Trend Analysis** - Track 30-day and 90-day price trends for each set | ☐ | Analysis tool: _______ | | |
| 3.6.3 | **Demand Monitoring** - Track demand signals (sold listings, bid activity, search volume) | ☐ | Data source: _______ | | |
| 3.6.4 | **Seasonality Calendar** - Document seasonal demand patterns for TCG (release dates, holidays) | ☐ | Calendar: _______ | | |
| 3.6.5 | **Holding Time Threshold** - Define optimal holding period before liquidation (60-120 days) | ☐ | Threshold: _______ days | | |
| 3.6.6 | **Margin Target** - Define minimum margin target before liquidation (20% ROI) | ☐ | Target: _______% | | |
| 3.6.7 | **Liquidation Triggers** - Define automatic triggers: age >120 days OR margin >25% OR market declining | ☐ | Triggers: _______ | | |
| 3.6.8 | **Price Drop Alerts** - Alert if market price drops >15% month-over-month | ☐ | Alerts configured: _______ | | |
| 3.6.9 | **Opportunity Alerts** - Alert if market price rises >20%, indicating liquidation window | ☐ | Alerts configured: _______ | | |
| 3.6.10 | **Inventory Aging Report** - Generate daily report of inventory by holding period | ☐ | Report template: _______ | | |
| 3.6.11 | **Liquidation Dashboard** - Create dashboard showing cards ready for liquidation | ☐ | Dashboard URL: _______ | | |
| 3.6.12 | **Multiple Sales Channels** - Verify Shopify listing + TCGPlayer + eBay are all active | ☐ | Channels active: _______ | | |
| 3.6.13 | **Multi-Channel Pricing Strategy** - Define pricing by channel (Shopify premium, TCGPlayer market, eBay clearance) | ☐ | Strategy doc: _______ | | |
| 3.6.14 | **Bulk Liquidation Option** - Establish process to bulk sell inventory to dealers if market weakens | ☐ | Process documented: _______ | | |
| 3.6.15 | **Liquidation SOP** - Document complete process from liquidation decision to sale execution | ☐ | SOP location: _______ | | |
| 3.6.16 | **Hold vs. Liquidate Decision Log** - Track all hold/liquidate decisions and outcomes for learning | ☐ | Log created: _______ | | |

**Sign-Off:** ☐ All 16 items verified by: _____________ (Date: _______)

---

## GO/NO-GO DECISION FRAMEWORK

### Pre-Launch Go/No-Go Criteria

**Launch Date Target:** _____________________

| Criteria Category | Metric | Threshold | Actual | Status | Owner |
|---|---|---|---|---|---|
| **Financial Health** | Minimum capital allocated | $_______ | $_______ | ☐ Go / ☐ No-Go | |
| **Financial Health** | Daily profit threshold (Phase 2) | $_______ / day | $_______ / day | ☐ Go / ☐ No-Go | |
| **Financial Health** | ROI projection (Phase 3, 90 days) | _______% | _______% | ☐ Go / ☐ No-Go | |
| **Operational Readiness** | API credential verification | 100% | _______% | ☐ Go / ☐ No-Go | |
| **Operational Readiness** | Make.com workflows tested | 100% of 5 | _______/5 | ☐ Go / ☐ No-Go | |
| **Operational Readiness** | Alert configuration complete | 100% | _______% | ☐ Go / ☐ No-Go | |
| **Testing Completion** | 5 SKU test run passed | All 10 criteria | _______/10 | ☐ Go / ☐ No-Go | |
| **Performance Metrics** | API response time target | <500ms | _______ms | ☐ Go / ☐ No-Go | |
| **Performance Metrics** | Workflow error rate | <1% | _______% | ☐ Go / ☐ No-Go | |
| **Performance Metrics** | Opportunity detection latency | <10s | _______s | ☐ Go / ☐ No-Go | |
| **Error Handling** | Failover procedures documented | 100% | _______% | ☐ Go / ☐ No-Go | |
| **Error Handling** | Error recovery tested | All scenarios | _______/4 | ☐ Go / ☐ No-Go | |
| **Monitoring Setup** | Performance dashboard live | Yes | ☐ Yes / ☐ No | ☐ Go / ☐ No-Go | |
| **Monitoring Setup** | Alert rules configured | 100% | _______% | ☐ Go / ☐ No-Go | |
| **Phase 3 Setup (TCG)** | Sourcing channels activated | All 3 channels | _______/3 | ☐ Go / ☐ No-Go | |
| **Phase 3 Setup (TCG)** | Grading service accounts created | All 3 services | _______/3 | ☐ Go / ☐ No-Go | |
| **Phase 3 Setup (TCG)** | Inventory system deployed | Live and tested | ☐ Yes / ☐ No | ☐ Go / ☐ No-Go | |
| **Phase 3 Setup (TCG)** | Pricing formula configured | Formula tested | ☐ Yes / ☐ No | ☐ Go / ☐ No-Go | |
| **Team Readiness** | Staff training completed | 100% of team | _______% | ☐ Go / ☐ No-Go | |
| **Team Readiness** | On-call support scheduled | 24/7 coverage | ☐ Yes / ☐ No | ☐ Go / ☐ No-Go | |
| **Documentation** | Runbooks complete and reviewed | All critical processes | _______ | ☐ Go / ☐ No-Go | |
| **Documentation** | Troubleshooting guides available | All major systems | _______ | ☐ Go / ☐ No-Go | |

### Go/No-Go Decision

**Phase 2 Pre-Launch Status:**

- Total Criteria: 23
- Go Criteria Met: _______
- No-Go Criteria: _______
- Outstanding Blockers:
  1. ___________________________________________________________________
  2. ___________________________________________________________________
  3. ___________________________________________________________________

**FINAL DECISION:**

☐ **GO FOR LAUNCH** - All criteria met, systems ready, proceed to Phase 2 deployment  
☐ **CONDITIONAL GO** - Minor issues identified, proceed with mitigation plan  
☐ **NO-GO** - Critical blockers identified, delay launch and address issues

**Decision Timestamp:** _________________ (Date/Time)  
**Authorized By:** _________________________ (Title)  
**Signature/Approval:** _________________________

---

**Phase 3 Pre-Launch Status:**

- Total Criteria: 23
- Go Criteria Met: _______
- No-Go Criteria: _______
- Outstanding Blockers:
  1. ___________________________________________________________________
  2. ___________________________________________________________________
  3. ___________________________________________________________________

**FINAL DECISION:**

☐ **GO FOR LAUNCH** - All criteria met, systems ready, proceed to Phase 3 deployment  
☐ **CONDITIONAL GO** - Minor issues identified, proceed with mitigation plan  
☐ **NO-GO** - Critical blockers identified, delay launch and address issues

**Decision Timestamp:** _________________ (Date/Time)  
**Authorized By:** _________________________ (Title)  
**Signature/Approval:** _________________________

---

## RISK MITIGATION & FAILOVER PROCEDURES

### Phase 2 Risk Register

| Risk | Severity | Probability | Mitigation Strategy | Fallback Plan | Owner |
|------|----------|-------------|--|--|---|
| StockX/GOAT API outages | High | Medium | Redundant data sources, retry logic | Manual data entry from web scraping | |
| Rate limiting on third-party APIs | Medium | High | Implement exponential backoff, queue system | Scale back to fewer SKUs, extend intervals | |
| Make.com webhook failures | High | Low | DLQ (Dead Letter Queue), retry logic | Manual webhook replay, alert on-call | |
| Google Sheets quota exceeded | Medium | Medium | Implement batch operations, compression | Secondary Sheet instance, local caching | |
| Slack API outages | Low | Low | Email notification fallback | Manual dashboard checks | |
| Margin calculation errors | High | Low | Unit tests, spot-check validation | Manual calculation audit | |
| Data loss / corruption | Critical | Very Low | Automated backups, transaction logging | Restore from backup, manual recovery | |

### Phase 3 Risk Register

| Risk | Severity | Probability | Mitigation Strategy | Fallback Plan | Owner |
|------|----------|-------------|--|--|---|
| Inventory sourcing shortfall | High | Medium | Diverse sourcing channels, supplier backup list | Reduce operational scale, liquidate existing | |
| Grading service delays (30+ days) | High | Medium | Multiple grading services, express options | Reduce grading volume, hold ungraded | |
| Capital constraints | Critical | Low | Monthly ROI reinvestment, emergency credit line | Reduce purchase volume, pause operations | |
| Market price collapse (>50% decline) | High | Low | Diversified product portfolio, market monitoring | Bulk liquidation to dealers, writeoff | |
| Condition assessment errors | Medium | Medium | Training & SOPs, independent audits | Regrading service, customer compensation | |
| Shipping/logistics delays | Medium | Medium | Multiple carriers, expedited options | Store pickup only, local sales | |
| Competitor oversaturation | Medium | High | Premium positioning, graded card focus | Pivot to rare/PSA 10 cards only | |
| Time commitment exceeded | High | High | Automation, outsourcing grading/shipping | Suspend new purchases, focus on liquidation | |

---

## LAUNCH AUTHORITY SIGN-OFF

**This document serves as the pre-launch verification checklist for Phases 2 and 3 of the PremeOS Cross-Platform Arbitrage Automation Program.**

### Phase 2 Launch Authority Sign-Off

**Program:** PremeOS Cross-Platform Arbitrage Automation  
**Phase:** Phase 2 (Cross-Platform Automation)  
**Launch Target Date:** _____________________

**I certify that:**
- ☐ All Phase 2 checklists have been completed and verified
- ☐ All testing criteria have been met
- ☐ All go/no-go decision criteria have been evaluated
- ☐ Failover procedures have been documented and tested
- ☐ Team is trained and on-call support is established
- ☐ Monitoring and alerting systems are live

**Authorized Launch Decision:** ☐ GO | ☐ CONDITIONAL GO | ☐ NO-GO

**Authorized By:** _________________________________ (Print Name & Title)

**Signature:** _________________________________ **Date:** _____________

---

### Phase 3 Launch Authority Sign-Off

**Program:** PremeOS Cross-Platform Arbitrage Automation  
**Phase:** Phase 3 (Pokémon TCG Arbitrage)  
**Launch Target Date:** _____________________

**I certify that:**
- ☐ All Phase 3 checklists have been completed and verified
- ☐ All sourcing channels are activated and verified
- ☐ Grading service accounts are established
- ☐ Capital allocation is verified and available
- ☐ Inventory tracking system is live and tested
- ☐ Pricing formula is configured and tested
- ☐ Liquidation monitoring system is active
- ☐ Team is trained and on-call support is established

**Authorized Launch Decision:** ☐ GO | ☐ CONDITIONAL GO | ☐ NO-GO

**Authorized By:** _________________________________ (Print Name & Title)

**Signature:** _________________________________ **Date:** _____________

---

**Document Version:** 1.0  
**Last Updated:** 2026-09-22  
**Next Review Date:** Pre-launch (15 days before target launch)

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>
