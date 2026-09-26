# Scenario 6110933: Phase 1 - Delta Sync Implementation Guide

**Status:** Ready for Implementation | Week 1 Critical Path  
**Created:** 2026-09-23  
**Target Completion:** End of Week 1 (2026-09-27)  
**Expected Execution Time:** 4-8 hours  
**Expected Operations Savings:** 50% reduction (350 → 175 ops/month)

---

## Executive Summary

Phase 1 implements **change detection** to identify only modified products since the last sync, eliminating redundant full syncs. This is the foundation for all downstream optimizations.

**Key Metrics:**
- Current State: 350 ops/month (syncing all 100+ products every run)
- Target State: 175 ops/month (syncing only changed products)
- Reduction: 175 ops/month saved (50% of current baseline)
- Annual Savings: $252 (175 ops × $0.12 × 12 months)

---

## Algorithm: Change Detection via Hash Comparison

### Overview
Compare a cryptographic hash of current product data with the hash stored from the last successful sync. If hashes don't match, the product has changed.

### Implementation Strategy

#### Step 1: Data Store Setup

**Create a Make.com Data Store** (or use Airtable) to track sync state:

**Data Store Name:** `sync_state_6110933`  
**Purpose:** Track last sync timestamp and product hashes

**Record Schema:**

```json
{
  "sync_metadata": {
    "last_sync_timestamp": "2026-09-23T14:32:15Z",
    "last_sync_id": "sync_6110933_20260923_143200",
    "products_synced_count": 87,
    "changed_products_count": 12,
    "sync_duration_ms": 8450,
    "hash_version": "sha256_v1"
  },
  "product_hashes": {
    "gid://shopify/Product/123": {
      "sku": "ABC-001",
      "current_hash": "a1b2c3d4e5f6...",
      "hash_source_fields": ["title", "sku", "price", "status", "inventory_qty"],
      "last_hash": "z9y8x7w6v5u4...",
      "hash_changed": true,
      "last_hash_timestamp": "2026-09-22T10:15:00Z"
    },
    "gid://shopify/Product/124": {
      "sku": "ABC-002",
      "current_hash": "b2c3d4e5f6a7...",
      "hash_source_fields": ["title", "sku", "price", "status", "inventory_qty"],
      "last_hash": "b2c3d4e5f6a7...",
      "hash_changed": false,
      "last_hash_timestamp": "2026-09-23T08:45:00Z"
    }
  }
}
```

**Alternative: Airtable Schema** (if using Airtable instead of Make.com data store):

Table: `sync_state_6110933`

| Field Name | Type | Description |
|---|---|---|
| `product_id` | Text | Shopify product ID (gid://shopify/Product/...) |
| `sku` | Text | Product SKU for reference |
| `current_hash` | Text | MD5/SHA256 hash of current state |
| `last_hash` | Text | Hash from previous sync |
| `hash_changed` | Checkbox | True if current_hash != last_hash |
| `last_sync_timestamp` | Date | When this record was last updated |
| `sync_id` | Text | ID of last sync run |

#### Step 2: Hash Calculation Function

**Hash Source Fields** (use for change detection):
```
- title
- sku  
- price
- status (active/inactive)
- inventory_qty
- weight (if tracked)
- supplier_id (internal tracking)
```

**Hash Calculation Pseudocode:**

```javascript
function calculateProductHash(product) {
  // Extract only fields that indicate a "real" change
  const hashSource = {
    title: product.title,
    sku: product.sku,
    price: product.price?.amount || 0,
    status: product.status,
    inventory_qty: product.inventory?.available || 0,
    weight: product.weight?.value || null,
    supplier_id: product.supplier_id || null
  };
  
  // Serialize to stable JSON (sorted keys)
  const jsonString = JSON.stringify(hashSource, Object.keys(hashSource).sort());
  
  // Calculate SHA256 hash (or MD5 for faster, less collision-prone than random)
  const hash = SHA256(jsonString);
  
  return hash;
}

function detectChanges(currentProducts, lastSyncState) {
  const changedProducts = [];
  const unchanged Products = [];
  
  for (const product of currentProducts) {
    const productId = product.id;
    const currentHash = calculateProductHash(product);
    const lastHash = lastSyncState.product_hashes[productId]?.current_hash;
    
    if (lastHash === undefined) {
      // New product (never synced before)
      changedProducts.push({
        product,
        changeType: "NEW",
        reason: "Product not in last sync state"
      });
    } else if (currentHash !== lastHash) {
      // Changed product
      changedProducts.push({
        product,
        changeType: "MODIFIED",
        reason: `Hash mismatch: ${currentHash} vs ${lastHash}`
      });
    } else {
      // Unchanged
      unchangedProducts.push(product);
    }
  }
  
  return {
    changedProducts,
    unchangedProducts,
    changeStats: {
      total_products: currentProducts.length,
      changed_count: changedProducts.length,
      unchanged_count: unchangedProducts.length,
      change_percentage: ((changedProducts.length / currentProducts.length) * 100).toFixed(1)
    }
  };
}
```

#### Step 3: Make.com Scenario Flow

**Current Flow (Full Sync - To Be Replaced):**
```
Trigger (Timer: Every 6 hours)
  ↓
Shopify: Fetch All Products (100+)
  ↓
For Each Product:
  ↓
    Shopify: Update Product (15-20 API calls)
  ↓
Complete
```

**New Flow (Phase 1 - Delta Sync):**
```
Trigger (Timer: Every 6 hours)
  ↓
1. DATA STORE: Get Last Sync State
  ├─ Retrieve sync_metadata
  ├─ Retrieve product_hashes
  ↓
2. SHOPIFY: Fetch All Products (100+)
  ├─ Note: Still fetching all (Phase 2 will optimize)
  ↓
3. CALCULATE HASHES:
  ├─ For each product:
  │  ├─ Calculate SHA256 hash of key fields
  │  ├─ Compare with last_hash from data store
  │  ├─ Classify: NEW | MODIFIED | UNCHANGED
  ↓
4. FILTER CHANGED PRODUCTS:
  └─ Output: changed_products[] = [prod_1, prod_4, prod_12, ...]
    (Example: 87 total → 12 changed = 86% filtered out)
  ↓
5. DATA STORE: UPDATE METADATA
  ├─ Update last_sync_timestamp
  ├─ Update product_hashes with new current_hash
  ├─ Record sync_id, changed_count, duration
  ↓
6. SEND TO PHASE 2 (or directly to Shopify for Phase 1-only)
  └─ changed_products list for update processing
  ↓
Complete
  Stats: 12 products changed → 12 API calls (vs 100 before)
  Savings: 88 ops saved this run
```

---

## Scenario Configuration in Make.com

### Module 1: Initialize / Get Last Sync State

**Module Type:** Data Store - Get Record

```
Data Store: sync_state_6110933
Record ID: "sync_metadata"
Output Variables:
  - last_sync_timestamp
  - last_sync_id
  - products_synced_count
  - changed_products_count
  - product_hashes (full hash map)
```

**Fallback Logic (First Run):**
If no record exists (first run):
```
{
  "last_sync_timestamp": "2026-01-01T00:00:00Z",  // Very old date
  "last_sync_id": "initial_sync",
  "products_synced_count": 0,
  "changed_products_count": 0,
  "product_hashes": {}  // Empty - all products will be "new"
}
```

### Module 2: Fetch All Products from Shopify

**Module Type:** Shopify - GraphQL Query

```graphql
query FetchAllProducts($first: Int!) {
  products(first: $first) {
    edges {
      node {
        id
        title
        sku
        handle
        status
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        inventory {
          available
          reserved
          damaged
          quality_assurance
        }
        weight {
          value
          unit
        }
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

**Query Parameters:**
- `first`: 250 (max per page)
- Cursor-based pagination for products >250

### Module 3: Calculate Hashes

**Module Type:** JavaScript Transformer

```javascript
// Input: products[] (from Shopify), product_hashes (from data store)

const crypto = require('crypto');

function calculateHash(product) {
  const source = {
    title: product.title || '',
    sku: product.sku || '',
    price: product.priceRange?.minVariantPrice?.amount || 0,
    status: product.status || '',
    inventory_qty: product.inventory?.available || 0,
    weight: product.weight?.value || null
  };
  
  const json = JSON.stringify(source, Object.keys(source).sort());
  return crypto.createHash('sha256').update(json).digest('hex');
}

const currentProducts = input.products;
const lastHashes = input.product_hashes || {};

const changedProducts = [];
const newProductHashes = {};

for (const product of currentProducts) {
  const productId = product.id;
  const currentHash = calculateHash(product);
  const lastHash = lastHashes[productId]?.current_hash;
  
  // Store new hash
  newProductHashes[productId] = {
    sku: product.sku,
    current_hash: currentHash,
    hash_source_fields: ['title', 'sku', 'price', 'status', 'inventory_qty', 'weight'],
    last_hash: lastHash,
    hash_changed: currentHash !== lastHash,
    last_hash_timestamp: new Date().toISOString()
  };
  
  // Track if changed
  if (lastHash === undefined || currentHash !== lastHash) {
    changedProducts.push(product);
  }
}

return {
  changedProducts: changedProducts,
  newProductHashes: newProductHashes,
  stats: {
    total_products: currentProducts.length,
    changed_count: changedProducts.length,
    unchanged_count: currentProducts.length - changedProducts.length,
    change_percentage: ((changedProducts.length / currentProducts.length) * 100).toFixed(1)
  }
};
```

### Module 4: Update Data Store with New Hashes

**Module Type:** Data Store - Update Record

```
Data Store: sync_state_6110933
Record ID: "sync_metadata"
Update Fields:
  - last_sync_timestamp: NOW()
  - last_sync_id: "sync_6110933_" + TIMESTAMP()
  - products_synced_count: stats.total_products
  - changed_products_count: stats.changed_count
  - product_hashes: newProductHashes (full map)
```

### Module 5: Send Changed Products to Next Step

**Output for Phase 2 (or direct update for Phase 1-only):**

```javascript
return {
  sync_id: input.last_sync_id,
  sync_timestamp: input.last_sync_timestamp,
  changed_products: input.changedProducts,
  stats: input.stats,
  change_rate: input.stats.change_percentage
};
```

---

## Testing Strategy

### Test Case 1: No Changes (Baseline)

**Setup:**
- 100 products in Shopify
- All hashes match last sync
- Last sync: 6 hours ago

**Expected Result:**
- `changed_count = 0`
- `unchanged_count = 100`
- No API calls to update products
- Data store unchanged

**Validation:**
```
✓ changedProducts.length === 0
✓ product_hashes all match
✓ Duration < 5 seconds
```

### Test Case 2: New Product Added

**Setup:**
- 100 existing products (all hashes known)
- 1 new product added to Shopify
- Last sync: 6 hours ago

**Expected Result:**
- `changed_count = 1`
- `unchanged_count = 100`
- New product in changed_products[]
- New hash calculated and stored

**Validation:**
```
✓ changedProducts.length === 1
✓ Product changeType === "NEW"
✓ New hash in data store
✓ Duration < 8 seconds
```

### Test Case 3: Product Modified

**Setup:**
- 100 products
- 5 products have qty changes
- 3 products have price changes
- Last sync: 6 hours ago

**Expected Result:**
- `changed_count = 8`
- `unchanged_count = 92`
- Changed products identified correctly
- Hashes updated

**Validation:**
```
✓ changedProducts.length === 8
✓ All 8 products have hash_changed === true
✓ Each hash differs from last_hash
✓ Duration < 10 seconds
```

### Test Case 4: Product Deleted

**Setup:**
- 100 products last sync
- 1 product deleted from Shopify
- Last sync: 6 hours ago

**Expected Result:**
- `changed_count = 0 or 1` (depends on whether deleted product is returned by API)
- Shopify returns 99 products
- Next sync: 99 products in changed detection

**Validation:**
```
✓ changedProducts.length reflects current Shopify state
✓ Sync completes without error
```

### Test Case 5: High Change Rate (15% changed)

**Setup:**
- 100 products
- 15 products have changes (mix of qty, price, status)
- Last sync: 6 hours ago

**Expected Result:**
- `changed_count = 15`
- `change_rate = 15.0%`
- All 15 identified correctly
- Hashes updated

**Validation:**
```
✓ changedProducts.length === 15
✓ stats.change_percentage === "15.0"
✓ Duration < 12 seconds
```

### Test Case 6: Hash Collision Detection

**Setup:**
- Test hash calculation with intentional collisions
- Verify MD5 vs SHA256 collision rates

**Expected Result:**
- SHA256: 0 false positives (no collisions in 100 products)
- MD5: Potentially 1-2 false positives (acceptable)

**Validation:**
```
✓ No products incorrectly identified as unchanged
✓ No products incorrectly identified as changed
✓ Hash algorithm verified
```

### Test Case 7: Data Store Failure Recovery

**Setup:**
- Scenario runs successfully (sync state stored)
- Delete sync_metadata record from data store
- Run scenario again

**Expected Result:**
- Scenario detects missing sync state
- Treats all products as "new" (changed)
- Performs full sync (expected behavior for first run after data loss)
- Rebuilds data store

**Validation:**
```
✓ Scenario handles missing data store gracefully
✓ Fallback to full sync works
✓ Data store rebuilt correctly
```

### Performance Benchmarks

| Test | Expected Duration | Max Duration | Pass Threshold |
|---|---|---|---|
| No changes (100 products) | 3-5s | 8s | <8s ✓ |
| 1 new product | 4-6s | 10s | <10s ✓ |
| 8 changed products | 5-8s | 12s | <12s ✓ |
| High change (15%) | 6-10s | 15s | <15s ✓ |
| Full dataset (250 products) | 10-15s | 20s | <20s ✓ |

---

## Validation Criteria

### Functional Validation

- [ ] **Change Detection Accuracy >99%**
  - Test with 100+ products, verify each change detected
  - No false positives (unchanged marked as changed)
  - No false negatives (changed marked as unchanged)

- [ ] **Zero False Positives**
  - Unchanged products never included in changedProducts[]
  - Verification: Run 3 consecutive syncs with no data changes, changed_count must be 0

- [ ] **Hash Consistency**
  - Same product data = same hash across runs
  - Different data = different hash (no collisions)
  - Verification: Run hash on identical product 10 times, all hashes identical

- [ ] **New Product Detection**
  - New products always identified as changed
  - Verification: Add 5 new products, all appear in changedProducts[]

- [ ] **Deleted Product Handling**
  - Deleted products don't break scenario
  - Scenario completes successfully even if product_hashes contains stale entries

### Operational Validation

- [ ] **Operations Reduction 30-50%**
  - Measure ops before Phase 1: Baseline (350 ops/month)
  - Measure ops after Phase 1: Target (175-245 ops/month)
  - Reduction calculation: (Baseline - Phase1) / Baseline * 100

  **Measurement Method:**
  ```
  Current Cost: 350 ops/month × $0.12 = $42/month
  Target Cost: 175 ops/month × $0.12 = $21/month
  Savings: $21/month = 50% reduction
  ```

- [ ] **Performance <2% Overhead**
  - Current sync duration: ~2-3 seconds (Shopify fetch only)
  - Phase 1 overhead: Hash calculation + data store operations
  - Target: <6 seconds for full cycle (hash calc <3s additional)
  - Acceptance: Duration increase <2 seconds

- [ ] **Data Store Performance**
  - Data store queries <500ms
  - Data store writes <500ms
  - No timeouts

### Reliability Validation

- [ ] **99.5% Sync Success Rate**
  - Run 100 consecutive syncs
  - Expected failures: 0-1 failures acceptable
  - Any failure: captured in error log with timestamp

- [ ] **Scenario Status: GREEN**
  - No errors in Make.com scenario execution history
  - No warnings
  - All modules execute successfully

- [ ] **Data Integrity**
  - No products lost during detection process
  - No duplicates in changed_products[]
  - All product IDs remain valid Shopify GIDs

---

## Edge Cases & Mitigation

### Edge Case 1: First Run (Empty Data Store)

**Scenario:** Scenario runs for first time, sync_state_6110933 doesn't exist

**Behavior:**
- Scenario creates sync_metadata record with empty product_hashes
- All 100 products treated as "new"
- Full sync on first run (expected)

**Mitigation:** Document in runbook - first run = full sync, normal operation

**Code:**
```javascript
if (!input.product_hashes) {
  input.product_hashes = {};  // Empty object, treat all as new
}
```

### Edge Case 2: Data Store Corruption

**Scenario:** product_hashes contains invalid JSON or corrupted data

**Behavior:**
- JSON parse fails
- Scenario error occurs

**Mitigation:** Validate JSON on retrieval, fallback to full sync if corrupt

**Code:**
```javascript
try {
  const hashes = JSON.parse(input.product_hashes);
} catch (e) {
  console.error("Corrupted product_hashes, falling back to full sync");
  return { product_hashes: {}, fallback: true };
}
```

### Edge Case 3: Shopify API Timeout

**Scenario:** Shopify fetch takes >60 seconds, Make.com times out

**Behavior:**
- Scenario fails before reaching hash calculation
- Changed_products = empty or partial
- Next sync retries

**Mitigation:** Add timeout handling, log partial results, retry next cycle

### Edge Case 4: High Product Turnover (>50% changed per sync)

**Scenario:** 100 products, 50+ change per sync (high volatility)

**Behavior:**
- Change detection still works (hash changes detected)
- Performance impact: longer hash calculation for 50+ products
- Duration: ~8-10 seconds (still acceptable)

**Validation:** Test with 50 product changes, verify <12 second execution

### Edge Case 5: Duplicate Product IDs

**Scenario:** Shopify returns duplicate product IDs (shouldn't happen, but test)

**Behavior:**
- Last product hash overwrites previous (duplicate overwritten)
- Potential data loss if not caught

**Mitigation:** Add deduplication logic, log if detected

**Code:**
```javascript
const seenIds = new Set();
for (const product of products) {
  if (seenIds.has(product.id)) {
    console.error(`Duplicate product ID: ${product.id}`);
  }
  seenIds.add(product.id);
}
```

---

## Success Metrics (End of Phase 1)

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| **Change Detection Accuracy** | >99% | TBD | TBD |
| **False Positive Rate** | 0% | TBD | TBD |
| **False Negative Rate** | 0% | TBD | TBD |
| **Operations Reduction** | 30-50% | TBD | TBD |
| **Scenario Duration** | <15s | TBD | TBD |
| **Data Store Uptime** | >99.9% | TBD | TBD |
| **Sync Success Rate** | 99.5% | TBD | TBD |
| **Hash Consistency** | 100% | TBD | TBD |

---

## Rollback Procedure

**If Phase 1 fails or causes issues:**

1. **Disable Phase 1 Logic:** Set `CHANGE_DETECTION_ENABLED = false` in scenario config
2. **Revert to Full Sync:** All products synced regardless of hash state
3. **Recovery:** One scenario run to reestablish baseline
4. **Duration:** <5 minutes to disable and verify

**Code for Quick Disable:**
```javascript
if (process.env.CHANGE_DETECTION_ENABLED === 'false') {
  // Treat all products as changed (full sync)
  return { changedProducts: input.products, stats: { all_changed: true } };
}
```

---

## Implementation Checklist

### Phase 1: Design & Setup (Day 1-2)
- [ ] Design hash calculation algorithm
- [ ] Define data store schema
- [ ] Document Make.com scenario flow
- [ ] Create test cases

### Phase 1: Implementation (Day 2-3)
- [ ] Create sync_state_6110933 data store
- [ ] Build Module 1: Get Last Sync State
- [ ] Build Module 2: Fetch Products from Shopify
- [ ] Build Module 3: Calculate Hashes (JS Transformer)
- [ ] Build Module 4: Update Data Store
- [ ] Build Module 5: Output Changed Products
- [ ] Connect modules into complete scenario

### Phase 1: Testing (Day 4)
- [ ] Test Case 1: No Changes ✓
- [ ] Test Case 2: New Product ✓
- [ ] Test Case 3: Modified Products ✓
- [ ] Test Case 4: Product Deleted ✓
- [ ] Test Case 5: High Change Rate ✓
- [ ] Test Case 6: Hash Collision Detection ✓
- [ ] Test Case 7: Data Store Failure Recovery ✓

### Phase 1: Validation & Deployment (Day 5)
- [ ] Measure ops reduction
- [ ] Verify <2% performance overhead
- [ ] Confirm 99.5% success rate
- [ ] Deploy to production
- [ ] Monitor first 24 hours
- [ ] Document results

---

## Approvals

**Phase 1 Implementation Approval:**

Technical Lead: _________________ Date: _______
Operations Manager: _________________ Date: _______
Backend Lead: _________________ Date: _______

**Phase 1 Completion Approval (After Testing):**

Technical Lead: _________________ Date: _______
QA Lead: _________________ Date: _______
Operations Manager: _________________ Date: _______

---

## Next Steps (Phase 2 Readiness)

Once Phase 1 is complete and validated:

1. **Launch Phase 2:** Batch Updates (Week 2)
   - Implement batch chunking (25 products per call)
   - Expected additional 30-40% ops reduction
   - Cumulative savings: 70% total

2. **Parallel Planning:** Phase 3 (Weeks 3-4)
   - Error handling & retry logic
   - Monitoring & alerting
   - Audit logging

3. **Go/No-Go Decision Gate:**
   - Phase 1 accuracy >99%? ✓
   - Ops reduction >40%? ✓
   - Zero false positives? ✓
   - **APPROVED TO PROCEED TO PHASE 2**

---

**Document Version:** 1.0  
**Status:** Ready for Implementation  
**Created:** 2026-09-23  
**Last Updated:** 2026-09-23  
**Prepared By:** Claude Haiku 4.5 <noreply@anthropic.com>

---

## Appendix: Code References

### Full Hash Calculation Example

```javascript
const crypto = require('crypto');

/**
 * Calculate SHA256 hash for product change detection
 * @param {Object} product - Product data from Shopify
 * @returns {string} SHA256 hash
 */
function calculateProductHash(product) {
  const source = {
    title: product.title || '',
    sku: product.sku || '',
    price: product.priceRange?.minVariantPrice?.amount || 0,
    status: product.status || '',
    inventory_qty: product.inventory?.available || 0,
    weight: product.weight?.value || null,
    supplier_id: product.supplier_id || null
  };
  
  // Serialize with sorted keys for consistency
  const json = JSON.stringify(source, Object.keys(source).sort());
  return crypto.createHash('sha256').update(json).digest('hex');
}

/**
 * Detect changed products by comparing hashes
 * @param {Array} currentProducts - Current products from Shopify
 * @param {Object} lastSyncState - Previous sync state from data store
 * @returns {Object} Changed products and statistics
 */
function detectChanges(currentProducts, lastSyncState) {
  const changedProducts = [];
  const unchangedProducts = [];
  const newProductHashes = {};
  
  const lastHashes = lastSyncState?.product_hashes || {};
  
  for (const product of currentProducts) {
    const productId = product.id;
    const currentHash = calculateProductHash(product);
    const lastHash = lastHashes[productId]?.current_hash;
    
    // Store new hash for next sync
    newProductHashes[productId] = {
      sku: product.sku,
      current_hash: currentHash,
      hash_source_fields: ['title', 'sku', 'price', 'status', 'inventory_qty', 'weight', 'supplier_id'],
      last_hash: lastHash,
      hash_changed: currentHash !== lastHash,
      last_hash_timestamp: new Date().toISOString()
    };
    
    // Detect change
    if (lastHash === undefined) {
      changedProducts.push({
        ...product,
        changeType: 'NEW',
        reason: 'Product not in last sync'
      });
    } else if (currentHash !== lastHash) {
      changedProducts.push({
        ...product,
        changeType: 'MODIFIED',
        reason: 'Product data changed'
      });
    } else {
      unchangedProducts.push(product);
    }
  }
  
  return {
    changedProducts,
    unchangedProducts,
    newProductHashes,
    stats: {
      total_products: currentProducts.length,
      changed_count: changedProducts.length,
      unchanged_count: unchangedProducts.length,
      change_percentage: ((changedProducts.length / currentProducts.length) * 100).toFixed(1),
      ops_saved_this_run: unchangedProducts.length  // Each unchanged = 1 ops saved
    }
  };
}
```

### Make.com Scenario Export (JSON)

```json
{
  "scenario_id": 6110933,
  "scenario_name": "Shopify Inventory Sync - Delta Phase 1",
  "scenario_description": "Phase 1: Change Detection via Hash Comparison",
  "flow": [
    {
      "module_id": 1,
      "module_name": "Trigger - Timer",
      "type": "Trigger",
      "config": {
        "interval": "6 hours",
        "timezone": "UTC"
      }
    },
    {
      "module_id": 2,
      "module_name": "Get Last Sync State",
      "type": "DataStore - GetRecord",
      "config": {
        "datastore": "sync_state_6110933",
        "record_id": "sync_metadata"
      }
    },
    {
      "module_id": 3,
      "module_name": "Fetch All Products",
      "type": "Shopify - GraphQL",
      "config": {
        "query": "query FetchAllProducts...",
        "pagination": "cursor-based"
      }
    },
    {
      "module_id": 4,
      "module_name": "Calculate Hashes & Detect Changes",
      "type": "JavaScript Transformer",
      "config": {
        "script": "function detectChanges(...)..."
      }
    },
    {
      "module_id": 5,
      "module_name": "Update Sync State",
      "type": "DataStore - UpdateRecord",
      "config": {
        "datastore": "sync_state_6110933",
        "record_id": "sync_metadata",
        "fields": ["last_sync_timestamp", "product_hashes", "changed_products_count"]
      }
    },
    {
      "module_id": 6,
      "module_name": "Output Changed Products",
      "type": "Pass-through",
      "config": {
        "output": "changedProducts"
      }
    }
  ]
}
```

---

**End of Phase 1 Implementation Guide**
