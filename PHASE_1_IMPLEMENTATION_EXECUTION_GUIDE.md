# Scenario 6110933 - Phase 1 Delta Sync: Complete Implementation Execution Guide

**Project:** Shopify Inventory Sync Delta Optimization  
**Phase:** 1 - Change Detection via Hash Comparison  
**Status:** IMPLEMENTATION IN PROGRESS  
**Created:** 2026-09-23  
**Target Completion:** 2026-09-27  
**Execution Time:** 4-8 hours  

---

## PART 1: PRE-IMPLEMENTATION CHECKLIST

### Prerequisites Verification

- [ ] Make.com account access confirmed
- [ ] Shopify API connection active in Make.com
- [ ] Shopify store has 100+ products for testing
- [ ] Team ID for Make.com data store creation: **__________________**
- [ ] Current Scenario 6110933 identified in Make.com
- [ ] Backup of current scenario taken (if modifying existing)

### Access & Permissions

- [ ] Make.com admin access
- [ ] Shopify API access (GraphQL)
- [ ] Data store creation permissions
- [ ] Scenario modification permissions
- [ ] Approval signatures obtained from:
  - [ ] Technical Lead: ____________________
  - [ ] Operations Manager: ____________________
  - [ ] Backend Lead: ____________________

---

## PART 2: DATA STORE SETUP (Task 1.1)

### Step 1: Create Data Store in Make.com

**Data Store Name:** `sync_state_6110933`  
**Purpose:** Store product hashes and sync metadata

**Configuration Steps:**

1. Navigate to Make.com Dashboard → Data Stores
2. Click "Create New Data Store"
3. Enter Name: `sync_state_6110933`
4. Set Max Size: 100 MB (sufficient for 100+ products)
5. Create initial schema (flexible):
   - Allow JSON data structure
   - Allow nested objects
6. Click Create

**Data Store ID (Record for later):** ___________________

### Step 2: Initialize Data Store with Metadata Record

After creating the data store, add the initial metadata record:

```json
{
  "record_id": "sync_metadata",
  "last_sync_timestamp": "2026-01-01T00:00:00Z",
  "last_sync_id": "initial_setup",
  "products_synced_count": 0,
  "changed_products_count": 0,
  "sync_duration_ms": 0,
  "hash_version": "sha256_v1",
  "product_hashes": {}
}
```

**Steps to Add:**
1. Open `sync_state_6110933` data store
2. Click "Add Record"
3. Record ID: `sync_metadata`
4. Paste JSON above
5. Save

**Verification:**
- [ ] Record created successfully
- [ ] Record ID: `sync_metadata`
- [ ] JSON validates
- [ ] Data persists on reload

---

## PART 3: SCENARIO MODULE IMPLEMENTATION (Tasks 2.1-2.5)

### Overview: The 5 Modules

```
Module 1: Trigger (Timer)
    ↓ Every 6 hours
Module 2: Get Last Sync State (Data Store Read)
    ↓ Retrieve metadata and product hashes
Module 3: Fetch All Products (Shopify GraphQL)
    ↓ Get current products from Shopify
Module 4: Calculate Hashes & Detect Changes (JavaScript)
    ↓ Compare hashes, identify changes
Module 5: Update Data Store (Data Store Update)
    ↓ Save new hashes for next cycle
    ↓ Output: changed_products[]
```

---

## MODULE 1: TRIGGER (Timer)

**Type:** Trigger - Timer  
**Configuration:**

```
Interval: 6 hours (21600 seconds)
Timezone: UTC
Repeat: Indefinitely
```

**Implementation Steps:**

1. Create new scenario (or open existing 6110933)
2. Add first module: "Timer"
3. Configure:
   - Type: "Timer"
   - Interval: 6
   - Unit: "Hours"
   - Timezone: "UTC"
4. Save module

**Verification:**
- [ ] Module created
- [ ] Interval set to 6 hours
- [ ] Timezone: UTC
- [ ] Status: Ready

**Owner:** ________________  
**Completed:** ______________

---

## MODULE 2: GET LAST SYNC STATE

**Type:** Data Store - Get Record  
**Configuration:**

```
Data Store: sync_state_6110933
Record ID: sync_metadata
Fallback on Not Found: true
Fallback Value: {
  "last_sync_timestamp": "2026-01-01T00:00:00Z",
  "last_sync_id": "initial_sync",
  "products_synced_count": 0,
  "changed_products_count": 0,
  "product_hashes": {}
}
```

**Implementation Steps:**

1. Add new module after Timer: "Data Store - Get Record"
2. Configure:
   - Data Store: `sync_state_6110933`
   - Record ID: `sync_metadata`
   - On Record Not Found: Use fallback value (shown above)
3. Map Output Variables:
   - `last_sync_timestamp`
   - `last_sync_id`
   - `products_synced_count`
   - `changed_products_count`
   - `product_hashes`
4. Save module

**Output Variables (for next modules):**
- `1.last_sync_timestamp`
- `1.last_sync_id`
- `1.products_synced_count`
- `1.changed_products_count`
- `1.product_hashes` (map of product_id → {sku, current_hash, last_hash, hash_changed})

**Verification:**
- [ ] Module retrieves sync_metadata record
- [ ] Fallback works when record missing
- [ ] Output variables accessible
- [ ] Latency <500ms

**Owner:** ________________  
**Status:** ☐ Not Started ☐ In Progress ☐ Complete  
**Completed:** ______________

---

## MODULE 3: FETCH ALL PRODUCTS

**Type:** Shopify - GraphQL Query  
**Configuration:**

```graphql
query FetchAllProducts($first: Int!, $after: String) {
  products(first: $first, after: $after) {
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
        variants(first: 1) {
          edges {
            node {
              inventoryQuantity
              inventoryItem {
                tracked
              }
            }
          }
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

**Implementation Steps:**

1. Add new module: "Shopify - GraphQL Query"
2. Configure Connection: Select your Shopify store
3. Query Type: Paste GraphQL above
4. Query Parameters:
   - `first`: 250 (max per page)
   - `after`: null (for first page)
5. Add Pagination Handler:
   - If `pageInfo.hasNextPage` == true
   - Repeat with `after`: `pageInfo.endCursor`
6. Save module

**Output Mapping:**
```javascript
products: array of {
  id: "gid://shopify/Product/xxx",
  title: string,
  sku: string,
  handle: string,
  status: "active" | "archived" | "draft",
  price: number (from priceRange.minVariantPrice.amount),
  inventory_qty: number (from variants[0].inventoryQuantity),
  weight: number (from weight.value)
}
```

**Verification:**
- [ ] Query returns all products
- [ ] Pagination works (all 100+ products retrieved)
- [ ] All required fields present
- [ ] No duplicate products
- [ ] Latency <10s for 100+ products

**Owner:** ________________  
**Status:** ☐ Not Started ☐ In Progress ☐ Complete  
**Completed:** ______________

---

## MODULE 4: CALCULATE HASHES & DETECT CHANGES

**Type:** JavaScript Transformer  
**Configuration:**

**Input Mapping:**
```
products: from Module 3 (Shopify products)
product_hashes: from Module 2 (last sync state)
```

**JavaScript Code:**

```javascript
// ========================================
// PART 1: HASH CALCULATION
// ========================================

const crypto = require('crypto');

/**
 * Calculate SHA256 hash for product change detection
 * @param {Object} product - Product data from Shopify
 * @returns {string} SHA256 hash (hex format)
 */
function calculateProductHash(product) {
  // Extract only fields relevant for change detection
  const source = {
    title: product.title || '',
    sku: product.sku || '',
    price: product.price || 0,
    status: product.status || '',
    inventory_qty: product.inventory_qty || 0,
    weight: product.weight || null,
    supplier_id: product.supplier_id || null
  };
  
  // Create stable JSON (sorted keys)
  const json = JSON.stringify(source, Object.keys(source).sort());
  
  // Calculate SHA256 hash
  const hash = crypto.createHash('sha256').update(json).digest('hex');
  return hash;
}

// ========================================
// PART 2: CHANGE DETECTION
// ========================================

/**
 * Detect which products have changed since last sync
 * @param {Array} currentProducts - Current products from Shopify
 * @param {Object} lastHashes - Last known hashes from data store
 * @returns {Object} Changed products and statistics
 */
function detectChanges(currentProducts, lastHashes) {
  const changedProducts = [];
  const unchangedProducts = [];
  const newProductHashes = {};
  
  const lastHashMap = lastHashes || {};
  
  for (const product of currentProducts) {
    const productId = product.id;
    const currentHash = calculateProductHash(product);
    const lastHash = lastHashMap[productId]?.current_hash;
    
    // Store new hash for next sync
    newProductHashes[productId] = {
      sku: product.sku,
      current_hash: currentHash,
      hash_source_fields: [
        'title',
        'sku',
        'price',
        'status',
        'inventory_qty',
        'weight'
      ],
      last_hash: lastHash || null,
      hash_changed: currentHash !== lastHash,
      last_hash_timestamp: new Date().toISOString()
    };
    
    // Classify product
    if (lastHash === undefined) {
      // NEW product (never seen before)
      changedProducts.push({
        ...product,
        changeType: 'NEW',
        reason: 'Product not in last sync state',
        lastHash: null,
        currentHash: currentHash
      });
    } else if (currentHash !== lastHash) {
      // MODIFIED product
      changedProducts.push({
        ...product,
        changeType: 'MODIFIED',
        reason: `Hash changed: ${lastHash} → ${currentHash}`,
        lastHash: lastHash,
        currentHash: currentHash
      });
    } else {
      // UNCHANGED product
      unchangedProducts.push(product);
    }
  }
  
  // Calculate statistics
  const stats = {
    total_products: currentProducts.length,
    changed_count: changedProducts.length,
    unchanged_count: unchangedProducts.length,
    change_percentage: ((changedProducts.length / currentProducts.length) * 100).toFixed(1),
    ops_saved_this_run: unchangedProducts.length,
    sync_timestamp: new Date().toISOString()
  };
  
  return {
    changedProducts: changedProducts,
    unchangedProducts: unchangedProducts,
    newProductHashes: newProductHashes,
    stats: stats
  };
}

// ========================================
// PART 3: EXECUTE DETECTION
// ========================================

try {
  const result = detectChanges(input.products, input.product_hashes);
  
  return {
    changedProducts: result.changedProducts,
    newProductHashes: result.newProductHashes,
    stats: result.stats,
    successfulRun: true,
    errorMessage: null
  };
} catch (error) {
  // Error handling
  return {
    changedProducts: [],
    newProductHashes: input.product_hashes || {},
    stats: {
      total_products: 0,
      changed_count: 0,
      unchanged_count: 0,
      error: error.message
    },
    successfulRun: false,
    errorMessage: error.message
  };
}
```

**Implementation Steps:**

1. Add new module: "JavaScript Transformer"
2. Paste code above into the code editor
3. Map Input Variables:
   - `input.products`: from Module 3 output
   - `input.product_hashes`: from Module 2 output (product_hashes)
4. Save module

**Output Mapping:**
```
changedProducts: array of changed products
newProductHashes: map for data store update
stats: {
  total_products: number,
  changed_count: number,
  unchanged_count: number,
  change_percentage: string,
  ops_saved_this_run: number
}
```

**Verification:**
- [ ] Hash calculation produces 64-char hex strings (SHA256)
- [ ] Same product data = same hash (run 3 times)
- [ ] Different data = different hash
- [ ] New products detected (no last_hash)
- [ ] Changed products detected (hash mismatch)
- [ ] Unchanged products filtered out
- [ ] Performance: <100ms per product (1000ms for 100 products max)

**Test Hashing:**
```javascript
// Test data
const testProduct = {
  id: "gid://shopify/Product/1",
  sku: "TEST-001",
  title: "Test Product",
  price: 99.99,
  status: "active",
  inventory_qty: 50,
  weight: 2.0
};

// Should produce consistent hash
const hash1 = calculateProductHash(testProduct);
const hash2 = calculateProductHash(testProduct);
console.log(hash1 === hash2); // Should be true
```

**Owner:** ________________  
**Status:** ☐ Not Started ☐ In Progress ☐ Complete  
**Completed:** ______________

---

## MODULE 5: UPDATE DATA STORE

**Type:** Data Store - Update Record  
**Configuration:**

```
Data Store: sync_state_6110933
Record ID: sync_metadata
Update Type: Replace/Merge (use Merge for safety)
```

**Fields to Update:**

```json
{
  "last_sync_timestamp": "from Module 4: stats.sync_timestamp",
  "last_sync_id": "sync_6110933_" + NOW() timestamp,
  "products_synced_count": "from Module 4: stats.total_products",
  "changed_products_count": "from Module 4: stats.changed_count",
  "sync_duration_ms": "measured at scenario end",
  "product_hashes": "from Module 4: newProductHashes (complete map)"
}
```

**Implementation Steps:**

1. Add new module: "Data Store - Update Record"
2. Configure:
   - Data Store: `sync_state_6110933`
   - Record ID: `sync_metadata`
   - Update Type: "Merge" (safely update only changed fields)
3. Map Update Fields:
   - `last_sync_timestamp`: `4.stats.sync_timestamp`
   - `last_sync_id`: Create dynamic ID (timestamp-based)
   - `products_synced_count`: `4.stats.total_products`
   - `changed_products_count`: `4.stats.changed_count`
   - `product_hashes`: `4.newProductHashes`
4. Save module

**Verification:**
- [ ] Module updates data store record
- [ ] Timestamp reflects current sync time
- [ ] Product hashes persist correctly
- [ ] Counts accurate
- [ ] Update latency <500ms
- [ ] Data survives scenario restart

**Owner:** ________________  
**Status:** ☐ Not Started ☐ In Progress ☐ Complete  
**Completed:** ______________

---

## SCENARIO INTEGRATION & FINAL CONFIGURATION

### Step 1: Connect All Modules

Ensure all modules are connected in sequence:
```
Module 1 (Trigger) → Module 2 (Get State) → Module 3 (Fetch Products) → Module 4 (Detect Changes) → Module 5 (Update)
```

### Step 2: Add Router/Output (Optional but Recommended)

Add router logic to output changed products:
```
IF Module 4.changedProducts.length > 0
THEN output changed_products to next step (or webhook)
ELSE output empty array (no changes)
```

### Step 3: Add Scenario Metadata

- **Name:** Shopify Inventory Sync - Delta Phase 1
- **Description:** Change detection via SHA256 hash comparison
- **Schedule:** Every 6 hours, UTC timezone
- **Status:** ACTIVE (when ready)

### Step 4: Add Error Handling (Optional but Recommended)

For each module, add error route:
```
On Error: 
  - Log error message
  - Send alert to operations team
  - Continue (don't fail scenario)
  - Note: On next run, may attempt full sync as fallback
```

---

## PART 4: TESTING & VALIDATION

### Test Execution Preparation

**Before Running Tests:**
- [ ] All 5 modules implemented
- [ ] Scenario saved
- [ ] Data store initialized
- [ ] Shopify connection verified
- [ ] Make.com scenario ready to run manually

### Test Case Execution Log

Use this section to track each test case result.

**Test Case 1: No Changes (Baseline)**

Setup:
- [ ] Have 100 products in Shopify with known hashes
- [ ] Run scenario once to establish baseline hashes
- [ ] Ensure NO product changes between runs
- [ ] Wait at least 1 minute (data store refresh)
- [ ] Run scenario second time

Expected Result:
- `changed_count = 0`
- `unchanged_count = 100`
- `change_percentage = "0.0%"`
- No errors in execution history

Actual Result:
```
changed_count: ______
unchanged_count: ______
change_percentage: ______
duration: ______ seconds
status: ☐ PASS ☐ FAIL
```

Notes: _______________________________________________

**Test Case 2: New Product Added**

Setup:
- [ ] Start with 100 products with known hashes
- [ ] Add 1 new product to Shopify
- [ ] Run scenario

Expected Result:
- `changed_count = 1`
- `unchanged_count = 100`
- New product marked as `changeType = "NEW"`

Actual Result:
```
changed_count: ______
unchanged_count: ______
duration: ______ seconds
status: ☐ PASS ☐ FAIL
```

Notes: _______________________________________________

**Test Case 3: Modified Products**

Setup:
- [ ] Start with 100 products with known hashes
- [ ] Modify 5 product quantities
- [ ] Modify 3 product prices
- [ ] Run scenario

Expected Result:
- `changed_count = 8`
- `unchanged_count = 92`
- All 8 changes detected

Actual Result:
```
changed_count: ______
unchanged_count: ______
duration: ______ seconds
status: ☐ PASS ☐ FAIL
```

Notes: _______________________________________________

**Test Case 4: Deleted Product**

Setup:
- [ ] Start with 100 products with known hashes
- [ ] Delete 1 product from Shopify
- [ ] Run scenario

Expected Result:
- Scenario completes without error
- Returns 99 products
- No false errors

Actual Result:
```
products_returned: ______
changed_count: ______
duration: ______ seconds
status: ☐ PASS ☐ FAIL
```

Notes: _______________________________________________

**Test Case 5: High Change Rate (15%)**

Setup:
- [ ] Start with 100 products with known hashes
- [ ] Modify 15 products (mix of qty, price, status)
- [ ] Run scenario

Expected Result:
- `changed_count = 15`
- `change_percentage = "15.0%"`
- All 15 changes detected correctly

Actual Result:
```
changed_count: ______
change_percentage: ______
duration: ______ seconds
status: ☐ PASS ☐ FAIL
```

Notes: _______________________________________________

**Test Case 6: Hash Consistency**

Setup:
- [ ] Use same product data
- [ ] Run hash calculation 10 times
- [ ] Verify all hashes match

Expected Result:
- All 10 hashes identical
- No collisions detected
- 100% consistency

Actual Result:
```
run_1_hash: ______________________________
run_2_hash: ______________________________
run_3_hash: ______________________________
... (8 more runs)
consistency_percentage: ______%
status: ☐ PASS ☐ FAIL
```

Notes: _______________________________________________

**Test Case 7: Data Store Recovery**

Setup:
- [ ] Run scenario once (data stored)
- [ ] Delete `sync_metadata` record from data store
- [ ] Run scenario again

Expected Result:
- Scenario detects missing data store
- Treats all products as "NEW" (full sync)
- Data store rebuilt
- No errors

Actual Result:
```
fallback_activated: ☐ YES ☐ NO
changed_count: ______
behavior: _______________
status: ☐ PASS ☐ FAIL
```

Notes: _______________________________________________

### Performance Benchmarks

| Scenario | Expected | Actual | Status |
|----------|----------|--------|--------|
| No changes (100) | 3-5s | _____ | ☐ PASS |
| 1 new product | 4-6s | _____ | ☐ PASS |
| 8 modified | 5-8s | _____ | ☐ PASS |
| 15 changed (15%) | 6-10s | _____ | ☐ PASS |
| **MAX ACCEPTABLE** | **<15s** | **_____** | **☐** |

---

## PART 5: VALIDATION AGAINST SUCCESS CRITERIA

### Functional Validation

**Change Detection Accuracy >99%**
- [ ] All test cases show correct change detection
- [ ] No false positives (unchanged marked as changed)
- [ ] No false negatives (changed marked as unchanged)
- Accuracy: ______%
- Status: ☐ PASS ☐ FAIL

**Zero False Positives**
- [ ] Run Test Case 1 three times with no data changes
- [ ] All three runs: changed_count = 0
- [ ] Run 1: ☐ changed_count = 0
- [ ] Run 2: ☐ changed_count = 0
- [ ] Run 3: ☐ changed_count = 0
- Status: ☐ PASS ☐ FAIL

**Hash Consistency 100%**
- [ ] Test Case 6: All 10 runs produce same hash
- [ ] Consistency: ______%
- Status: ☐ PASS ☐ FAIL

**Scenario Duration <15 seconds**
- [ ] All test cases complete within time limits
- [ ] Max duration observed: ______ seconds
- Status: ☐ PASS ☐ FAIL

### Operational Validation

**Operations Reduction 30-50%**
- Baseline (current): 350 ops/month
- Phase 1 target: 175 ops/month
- Phase 1 actual: ______ ops/month
- Reduction: ______%
- Status: ☐ PASS ☐ FAIL

**Scenario Status: GREEN**
- [ ] No errors in Make.com execution history
- [ ] All recent runs successful
- [ ] No warnings or alerts
- Consecutive successful runs: ______
- Status: ☐ PASS ☐ FAIL

---

## PART 6: PRODUCTION DEPLOYMENT

### Pre-Deployment Checklist

- [ ] All 7 test cases passed
- [ ] Performance benchmarks met
- [ ] Success criteria validated
- [ ] Code reviewed and approved
- [ ] Rollback procedure documented
- [ ] Operations team briefed
- [ ] Monitoring dashboards prepared

### Deployment Steps

1. **Enable Scenario in Production**
   - [ ] Mark Scenario 6110933 as ACTIVE
   - [ ] Schedule: Every 6 hours, UTC
   - [ ] Save configuration

2. **First 24-Hour Monitoring**
   - [ ] Monitor execution every 2 hours
   - [ ] Check for errors in history
   - [ ] Verify change detection working
   - [ ] Verify data store persisting state
   - [ ] Alert if any failures occur

3. **Document Results**
   - [ ] Record actual ops saved
   - [ ] Record actual sync duration
   - [ ] Document any issues encountered
   - [ ] Note performance characteristics

### Deployment Sign-Off

**Deployment Date:** ______________  
**Deployment Time:** ______________  
**Deployed By:** ______________  

**First Run Status:** ☐ SUCCESS ☐ FAILURE  
**24-Hour Monitoring:** ☐ COMPLETE ☐ IN PROGRESS  
**Issues Encountered:** ☐ NONE ☐ YES (describe): ___________

---

## PART 7: POST-DEPLOYMENT MONITORING

### Daily Metrics to Track

```
Date: ____________

Morning Check (08:00 UTC):
  - Syncs last 24h: ______
  - Successful: ______
  - Failed: ______
  - Success Rate: ______%
  - Avg Duration: ______ seconds
  - Avg Change Rate: ______%
  - Ops Cost: $______
  
Issues: _______________________________________________

Afternoon Check (14:00 UTC):
  - Last sync status: ☐ SUCCESS ☐ FAILURE
  - Changed products detected: ______
  - Data store size: ______
  - No errors: ☐ YES ☐ NO
  
Issues: _______________________________________________
```

### Weekly Summary

```
Week of: ____________

Total Syncs: ______
Successful: ______
Failed: ______
Success Rate: ______%
Avg Sync Duration: ______ seconds
Total Ops: ______
Weekly Cost: $______

Vs Baseline:
  Baseline weekly ops: 350 ÷ 4 = 87.5 ops
  Phase 1 weekly ops: ______ ops
  Savings: ______ ops/week ($______/week)

Issues Encountered: _______________
Actions Taken: _______________
Owner: _______________
```

---

## PART 8: ROLLBACK PROCEDURE

**If Phase 1 fails or causes issues:**

### Quick Rollback (5 minutes)

1. Open Scenario 6110933 in Make.com
2. Disable all hash comparison logic
3. Set scenario to treat ALL products as changed
4. Save and activate
5. Scenario returns to full-sync behavior

### Complete Rollback

1. Disable Scenario 6110933
2. Activate backup of original scenario (if taken)
3. Resume normal operations
4. Investigate issues
5. No data loss (all products still sync)

---

## COMPLETION STATUS

### Implementation Checklist

**Phase 1 Setup:**
- [ ] Data store created
- [ ] Scenario framework ready

**Module Implementation:**
- [ ] Module 1 - Trigger: Complete
- [ ] Module 2 - Get State: Complete
- [ ] Module 3 - Fetch Products: Complete
- [ ] Module 4 - Calculate Hashes: Complete
- [ ] Module 5 - Update Store: Complete

**Testing:**
- [ ] Test Case 1 (No Changes): ☐ PASS ☐ FAIL
- [ ] Test Case 2 (New Product): ☐ PASS ☐ FAIL
- [ ] Test Case 3 (Modified): ☐ PASS ☐ FAIL
- [ ] Test Case 4 (Deleted): ☐ PASS ☐ FAIL
- [ ] Test Case 5 (High Change): ☐ PASS ☐ FAIL
- [ ] Test Case 6 (Hash Consistency): ☐ PASS ☐ FAIL
- [ ] Test Case 7 (Data Store Recovery): ☐ PASS ☐ FAIL

**Validation:**
- [ ] Success Criteria Met: ☐ YES ☐ NO
- [ ] Approvals Obtained: ☐ YES ☐ NO
- [ ] Deployment Ready: ☐ YES ☐ NO

**Deployment:**
- [ ] Deployed to Production: ☐ YES ☐ NO
- [ ] 24-Hour Monitoring Complete: ☐ YES ☐ NO
- [ ] Results Documented: ☐ YES ☐ NO

---

**Document Version:** 1.0  
**Status:** Implementation In Progress  
**Last Updated:** 2026-09-23  
**Prepared By:** Claude Haiku 4.5 <noreply@anthropic.com>

---

**FOR IMPLEMENTATION: Follow this guide step-by-step. Mark items complete as you progress. Document all results and findings.**
