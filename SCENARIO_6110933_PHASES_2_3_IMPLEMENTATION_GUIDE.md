# Scenario 6110933: Phases 2 & 3 Implementation Guide

**Status:** Phase 1 (Change Detection) → Week 1 | Phase 2 & 3 Ready to Execute  
**Created:** 2026-09-22  
**Target Completion:** Week 4 of optimization cycle  

---

## Quick Reference: Three-Phase Roadmap

```
WEEK 1: Phase 1 (Change Detection)
├─ Duration: 4-8 hours
├─ Ops Savings: 50% reduction (350 → 175 ops/month)
├─ Risk Level: LOW
└─ Status: IN PROGRESS ✓

WEEK 2: Phase 2 (Batch Updates)
├─ Duration: 3-5 hours
├─ Ops Savings: 30-40% additional (175 → 105 ops/month)
├─ Risk Level: MEDIUM
└─ Status: READY TO START

WEEK 3-4: Phase 3 (Error Handling & Monitoring)
├─ Duration: 4-6 hours + testing
├─ Ops Benefit: Reliability (99.5% sync success)
├─ Risk Level: LOW
└─ Status: DESIGN COMPLETE
```

**Total Effort:** 10-18 hours  
**Total Annual Savings:** $1,200-1,800  
**ROI:** 91-135% in Year 1  

---

## Phase 2: Batch Updates - Detailed Specification

### Overview
Replace individual product updates (1 per API call) with batched updates (25 per call). This reduces API overhead by 30-40% on top of Phase 1's change detection savings.

### Current Architecture
```
Phase 1 Output: changed_products[] = [product_1, product_2, ..., product_N]
                                           ↓
Current (No Phase 2): FOR EACH product IN changed_products
                          CALL shopify_api.update_product(product)  ← 1 call per product
                          
Problem: N products = N API calls
Example: 4 changed products = 4 API calls
```

### After Phase 2 Implementation
```
Phase 1 Output: changed_products[] = [product_1, product_2, ..., product_N]
                                           ↓
Phase 2 (Batch Updates): CHUNK changed_products INTO batches of 25
                           ↓
                         FOR EACH batch IN batches
                             CALL shopify_api.batch_update(batch)  ← 1 call per 25 products
                             
Benefit: N products = N/25 calls (75% fewer calls)
Example: 4 changed products = 1 call (75 products = 3 calls)
```

### Implementation Steps

#### Step 1: Batch Chunking Logic
```
Input: changed_products = [p1, p2, p3, ..., p100] (100 products)
Batch Size: 25

Process:
- Batch 1: [p1-p25]
- Batch 2: [p26-p50]
- Batch 3: [p51-p75]
- Batch 4: [p76-p100]

Output: 4 batches (vs 100 individual calls)
```

**In Make.com scenario:**
1. Use "Array Aggregator" to group changed_products into chunks
2. Configure with size=25
3. Pass each chunk to batch update module

#### Step 2: Batch Payload Construction

**GraphQL Mutation (Recommended)**
```graphql
mutation BatchUpdateInventory($adjustments: [InventoryItemAdjustmentInput!]!) {
  inventoryBulkAdjustQuantityAtLocation(input: {
    inventoryItemAdjustments: $adjustments
    locationId: "gid://shopify/Location/123456"
  }) {
    inventoryAdjustments {
      inventoryItemId
      inventoryItem { id sku }
      availableDelta
    }
    userErrors {
      field
      message
    }
  }
}

Variables: {
  "adjustments": [
    { "inventoryItemId": "gid://shopify/InventoryItem/111", "availableDelta": 50 },
    { "inventoryItemId": "gid://shopify/InventoryItem/222", "availableDelta": -25 },
    ...
  ]
}
```

**Payload Schema:**
```json
{
  "adjustments": [
    {
      "inventory_item_id": "string (from Shopify)",
      "available_delta": "number (qty change: positive=add, negative=reduce)",
      "location_id": "string (warehouse_id from our data)"
    },
    // ... up to 25 items per batch
  ]
}
```

**Payload Size Calculation:**
- Per product: ~100 bytes (IDs + delta)
- Per batch: 100 bytes × 25 = 2.5 KB
- Well within Shopify's 25 KB limit ✓

#### Step 3: Response Parsing

**Success Response:**
```json
{
  "data": {
    "inventoryBulkAdjustQuantityAtLocation": {
      "inventoryAdjustments": [
        { "inventoryItemId": "gid://shopify/InventoryItem/111", "availableDelta": 50 },
        { "inventoryItemId": "gid://shopify/InventoryItem/222", "availableDelta": -25 }
      ],
      "userErrors": []
    }
  }
}
```

**Partial Failure Response:**
```json
{
  "data": {
    "inventoryBulkAdjustQuantityAtLocation": {
      "inventoryAdjustments": [
        { "inventoryItemId": "gid://shopify/InventoryItem/111", "availableDelta": 50 }
        // Product 222 missing = failed update
      ],
      "userErrors": [
        {
          "field": "adjustments[1]",
          "message": "Inventory Item not found"
        }
      ]
    }
  }
}
```

**Parsing Logic:**
```python
succeeded_count = len(response.inventoryAdjustments)
failed_count = len(response.userErrors)

IF failed_count > 0:
  FOR error IN response.userErrors:
    extract product_id, error_message
    add to failed_products[] for Phase 3 retry
ELSE:
  batch succeeded, update data_store
```

#### Step 4: Testing Checklist

**Unit Tests:**
- [ ] Batch chunking: 100 products → 4 batches of 25
- [ ] Batch chunking: 24 products → 1 batch of 24
- [ ] Batch chunking: 1 product → 1 batch of 1
- [ ] Payload construction: correct GraphQL format
- [ ] Payload construction: delta calculations correct
- [ ] Response parsing: success case
- [ ] Response parsing: partial failure case
- [ ] Response parsing: complete failure case

**Integration Tests:**
- [ ] Test with Shopify staging environment
- [ ] Batch update 25 products successfully
- [ ] Batch update 25 products with 1 error (partial failure)
- [ ] Shopify inventory reflects all updates
- [ ] No duplicate updates across batches
- [ ] No data loss in transaction

**Performance Tests:**
- [ ] Batch 75 products (3 calls): <15 seconds
- [ ] Full sync cycle: <12 seconds
- [ ] Memory usage: <50 MB
- [ ] No memory leaks in repeated batching

### Success Criteria
- ✓ 25 products processed per batch call
- ✓ All changed products synced in <4 API calls (for typical 75-100 product catalog)
- ✓ 100% data accuracy (no loss/duplication)
- ✓ Response time <15 seconds for full sync
- ✓ Shopify inventory accurately reflects all updates
- ✓ Error responses handled correctly (see Phase 3)

### Common Pitfalls & Solutions

| Pitfall | Symptom | Solution |
|---------|---------|----------|
| **GraphQL syntax error** | "Parse error" in Shopify response | Validate GraphQL against schema first |
| **Wrong inventory_item_id format** | "Invalid ID format" error | Ensure using full `gid://shopify/InventoryItem/...` format |
| **Batch too large** | Request timeout or 413 error | Keep batch size ≤ 25 products |
| **Insufficient API quota** | 429 error (rate limited) | Add backoff logic (see Phase 3) |
| **Location ID incorrect** | "Location not found" error | Verify warehouse_id maps to correct Shopify location |
| **Partial batch failure not handled** | Some products silently skipped | Always check userErrors array in response |

---

## Phase 3: Error Handling & Monitoring - Detailed Specification

### Overview
Implement automatic retry logic, comprehensive logging, and real-time monitoring to ensure reliability and provide operational visibility.

### Error Scenarios Handled

#### Scenario 1: Transient Network Failure
```
Symptom: API call times out after 30 seconds
Status Code: 504 (or timeout)
Action: Retry entire batch with exponential backoff
Retry Policy: 2s, 4s, 8s delays (total 14s retry window)
```

#### Scenario 2: Shopify Rate Limiting
```
Symptom: Too many API calls in short period
Status Code: 429
Action: Wait 60 seconds, then retry batch
Details: Shopify API: 2 calls/second per app (40 calls/min)
Example: If syncing 100 products in batches of 25 = 4 calls
         Each batch must be spaced 500ms apart to stay under limit
```

#### Scenario 3: Partial Batch Failure
```
Symptom: Some products update, some fail (e.g., 23/25 succeed)
Status Code: 200 (success, but with errors)
Action: Log failures, add failed products to retry_queue
Recovery: Phase 3 retry logic attempts individual retries
```

#### Scenario 4: Complete Batch Failure
```
Symptom: All products in batch fail to update
Status Code: 400 (bad request) or 500 (server error)
Action: Log entire batch, add to retry_queue
Recovery: Retry entire batch, not individual products
Alert: Send MEDIUM severity alert to operations
```

#### Scenario 5: Authentication Failure
```
Symptom: API returns 401 or 403 error
Cause: Shopify token expired or permissions changed
Action: Stop sync immediately, alert P0
Recovery: Requires manual intervention (token refresh)
```

### Retry Logic Implementation

#### Retry Configuration
```json
{
  "retry_policy": {
    "max_attempts": 3,
    "backoff_strategy": "exponential",
    "backoff_multiplier": 2,
    "initial_delay_ms": 2000,
    "max_delay_ms": 8000,
    "retry_on_status_codes": [429, 500, 502, 503, 504]
  }
}
```

#### Retry Algorithm
```python
def retry_batch(batch, max_attempts=3):
    for attempt in range(1, max_attempts + 1):
        try:
            response = shopify_api.batch_update(batch)
            
            if response.success and not response.userErrors:
                return {"status": "success", "response": response}
            
            elif response.userErrors:
                # Partial failure: extract failed products
                failed = extract_failed_products(response)
                
                if attempt == max_attempts:
                    # Last attempt: log for manual review
                    log_permanent_failure(batch, failed)
                    return {"status": "partial_failure", "failed": failed}
                else:
                    # Not last attempt: retry next iteration
                    continue
            
        except Exception as e:
            # Network error or timeout
            if e.is_retryable() and attempt < max_attempts:
                wait_time = (2 ** attempt) * 1000  # 2s, 4s, 8s
                sleep(wait_time)
                continue
            else:
                raise
    
    # All retries exhausted
    return {"status": "failed", "error": "max_retries_exceeded"}
```

#### Retry Scenarios
```
Attempt 1: Immediate
  └─ Success → Done
  └─ Transient Error → Wait 2s, retry

Attempt 2: After 2s wait
  └─ Success → Done
  └─ Transient Error → Wait 4s, retry

Attempt 3: After 4s wait
  └─ Success → Done
  └─ Permanent Error or Transient → Flag for manual review

Total time: ~6s per batch (before escalation)
```

### Monitoring & Alerting

#### Key Metrics to Track

**Real-Time Metrics:**
```
- Sync Status: Running / Success / Failed
- Success Rate: % of batches succeeding on first attempt
- Retry Rate: % of batches requiring retries
- Error Rate: % of batches failing after 3 retries
- Avg Response Time: Average batch API response time
- API Call Count: Daily/monthly/yearly call count
```

**Aggregated Metrics:**
```
- Daily Success Rate: % of daily syncs fully successful
- Weekly Ops Cost: $ spent on Make.com operations
- Monthly Retry Count: Total retries needed
- Error Distribution: Breakdown by error type
```

#### Alert Rules

| Condition | Severity | Action | Threshold |
|-----------|----------|--------|-----------|
| **Auth Failed** | P0 | Slack @channel + SMS | Any 401/403 error |
| **Batch Fail Rate >10%** | MEDIUM | Slack #alerts | 5+ batches failed in run |
| **Sync Duration >60s** | LOW | Slack #sync-logs | Duration exceeds 60s |
| **Retry Rate >30%** | MEDIUM | Slack #alerts | 30%+ batches needed retry |
| **Inventory Anomaly** | HIGH | Slack + Notion task | Qty mismatch >1 unit |
| **API Quota >80%** | MEDIUM | Slack #alerts | Monthly quota usage |

#### Dashboard Queries

**Daily Summary:**
```
Date | Total Syncs | Successful | Failed | Retry Rate | Avg Duration
2026-09-22 | 24 | 23 | 1 | 8% | 9.2s
2026-09-21 | 24 | 24 | 0 | 4% | 8.8s
2026-09-20 | 24 | 24 | 0 | 3% | 8.5s
```

**Trend Analysis:**
```
7-Day Average Success Rate: 99.4%
7-Day Average Retry Rate: 5.2%
7-Day Average Duration: 8.9s
Cost Trend: Stable at $1.25/day
```

### Audit Logging

#### Log Entry Schema
```json
{
  "timestamp": "2026-09-22T14:32:15Z",
  "sync_id": "sync_6110933_20260922_143200",
  "sync_sequence": 15,
  "phase": "Phase 2 - Batch Updates",
  "batch": {
    "number": 1,
    "size": 25,
    "products": [
      { "product_id": "gid://shopify/Product/123", "sku": "ABC-001", "new_qty": 50 },
      { "product_id": "gid://shopify/Product/124", "sku": "ABC-002", "new_qty": 30 }
    ]
  },
  "request": {
    "api_endpoint": "POST /graphql.json",
    "payload_size_bytes": 2150
  },
  "response": {
    "status": "success",
    "duration_ms": 245,
    "http_code": 200,
    "succeeded_count": 25,
    "failed_count": 0,
    "errors": []
  },
  "retry": {
    "attempt": 1,
    "total_attempts": 1,
    "backoff_ms": 0
  },
  "operator": "scenario_6110933_automation"
}
```

#### Log Storage
- **Primary:** Make.com Data Store (queryable JSON records)
- **Backup:** Airtable audit_log table
- **Query Examples:**
  - Failed batches on 2026-09-22: `WHERE response.status = "failed"`
  - Products requiring retry: `WHERE response.failed_count > 0`
  - Hourly success rate: `GROUP BY DATE(timestamp) HAVING COUNT(*)`

#### Compliance Requirements
- ✓ Every product update logged
- ✓ Timestamp all operations (ISO 8601)
- ✓ Track all retry attempts
- ✓ Record error details with context
- ✓ 90-day retention for audit trail
- ✓ FTC/regulatory investigation support

### Manual Intervention Procedures

#### When to Intervene
1. **Auth failure (P0):** IMMEDIATE
2. **>3 consecutive failed syncs:** Within 1 hour
3. **Inventory anomaly detected:** Within 2 hours
4. **Batch stuck in retry loop:** Within 4 hours

#### Failed Batch Recovery Workflow

**Step 1: Alert Received**
```
Slack notification:
"⚠️ MEDIUM: Batch 2 failed to sync 25 products
Sync ID: sync_6110933_20260922_143200
Error: Rate limited (429)
Affected Products: ABC-001 through ABC-025"
```

**Step 2: Investigation**
- Open Notion dashboard
- Review failed batch details
- Check Shopify inventory status
- Compare against last successful sync
- Identify root cause (rate limit vs data error vs auth)

**Step 3: Resolution Options**
```
OPTION A: Auto-Retry (Recommended for transient errors)
  - Click "Retry Now" button in Notion
  - System retries batch immediately
  - Check result within 1 minute

OPTION B: Manual Fix (For data errors)
  - Investigate product details in Shopify
  - Fix issue (e.g., invalid SKU)
  - Click "Retry Now"

OPTION C: Override (For problematic products)
  - Identify problematic product(s)
  - Manually update in Shopify
  - Click "Mark Complete" to skip in future syncs

OPTION D: Escalate (For persistent failures)
  - Document error + context
  - Ticket to Shopify support
  - Pause batch from future syncs
```

### Implementation Checklist

- [ ] **Error Detection**
  - [ ] HTTP status code handling
  - [ ] Timeout detection (>30s)
  - [ ] GraphQL error parsing
  - [ ] Rate limit detection (429)

- [ ] **Retry Logic**
  - [ ] Exponential backoff implementation
  - [ ] Max attempts configuration (3)
  - [ ] Retry eligibility logic (only transient errors)

- [ ] **Monitoring**
  - [ ] Metrics collection infrastructure
  - [ ] Dashboard queries implemented
  - [ ] Alert rules configured in Slack
  - [ ] Real-time status display

- [ ] **Logging**
  - [ ] Log schema implemented
  - [ ] All sync events logged
  - [ ] Error context captured
  - [ ] Data store persistence working

- [ ] **Operations**
  - [ ] Notion dashboard created
  - [ ] Manual intervention workflows
  - [ ] Runbook documentation
  - [ ] Operations team trained

---

## Approval & Sign-Off

### Phase 2 Readiness Checklist
- [ ] Design reviewed by Technical Lead
- [ ] Architecture approved by Backend Team
- [ ] Batch API endpoint tested in staging
- [ ] Phase 1 (change detection) complete & verified
- [ ] Risk assessment approved
- [ ] Testing plan documented
- [ ] Rollback procedure documented

**Approvers:**
- Technical Lead: _______________
- Engineering Manager: _______________
- Operations Lead: _______________

### Phase 3 Readiness Checklist
- [ ] Error handling scenarios documented
- [ ] Retry logic tested under failure conditions
- [ ] Monitoring infrastructure ready
- [ ] Alert channels configured
- [ ] Audit logging implemented
- [ ] Compliance review passed
- [ ] Runbook documented for operations

**Approvers:**
- Technical Lead: _______________
- DevOps/SRE: _______________
- Compliance Officer: _______________
- Operations Lead: _______________

---

## Quick Start: Implementation Order

### For Phase 2 (This Week)
1. **Monday:** Design batch processing logic (2h)
2. **Tuesday:** Implement chunking + payload construction (2h)
3. **Wednesday:** Integration testing with Shopify staging (2h)
4. **Thursday:** Performance testing (1h)
5. **Friday:** Production deployment + monitoring (1h)

### For Phase 3 (Next Week)
1. **Monday:** Implement error detection + retry logic (3h)
2. **Tuesday:** Add monitoring + alerting (2h)
3. **Wednesday:** Audit logging implementation (2h)
4. **Thursday:** Operations training + runbook (2h)
5. **Friday:** Final validation + go-live (1h)

---

## Reference: Shopify API Documentation

**GraphQL Endpoint:**
- Staging: `https://staging-shop.myshopify.com/admin/api/2024-01/graphql.json`
- Production: `https://shop.myshopify.com/admin/api/2024-01/graphql.json`

**Rate Limits:**
- 2 calls/second per app
- 40 calls/minute
- Bucket refill: 32 points/second

**Batch Update Documentation:**
- https://shopify.dev/api/admin-rest/2024-01/resources/inventorylevel#put-inventory-levels-set

---

**Version:** 2.0  
**Status:** Ready for Phase 2 Implementation  
**Next Review:** Upon Phase 2 Completion  
**Last Updated:** 2026-09-22
