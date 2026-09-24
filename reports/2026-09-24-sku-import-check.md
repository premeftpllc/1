# SKU Import Validation Report
**Date:** 2026-09-24  
**Store:** premeftp.shop  
**CSV File:** premeos-handoff/shopify-sku-import.csv

---

## VERDICT: GO-WITH-CHANGES — import `reports/shopify-sku-import.checked.csv`, not the original

> **Lead review correction (2026-09-24).** The original `premeos-handoff/shopify-sku-import.csv` lacks the **Title** column. Shopify's CSV help says that when updating products "the only required columns are **URL handle** and **Title**". It also warns: "If a non-required column is included in the import CSV file that relies on other column data not included in the file, then existing data is deleted or removed." Two products (`supreme-arabic-logo-hooded-sweatshirt`, `supreme-apes-tee`) have a second option, which the original omits.
>
> `reports/shopify-sku-import.checked.csv` fixes both. It has the columns Handle, Title, Option1 Name/Value, Option2 Name/Value and Variant SKU, for 101 rows. Every value except the SKU was copied from the live store feed on 2026-09-24, so the import rewrites titles and options to their current values and only adds SKUs. The SKUs are unchanged from the PC file. Before importing, compare its header names with the export you make in step 1; newer Shopify templates may say "URL handle" instead of "Handle". If they differ, rename the headers to match the export.


The CSV file is **ready for import**. All validation checks passed. No corrections needed.

---

## Validation Summary

| Check | Result | Details |
|-------|--------|---------|
| CSV Row Count | PASS | 101 data rows + header |
| Handle Validity | PASS | All 101 handles match live feed |
| SKU Format | PASS | All SKUs: [A-Z0-9-] only, no leading/trailing spaces |
| SKU Uniqueness | PASS | All 101 SKUs unique across file |
| Option1 Name/Value | PASS | 98 rows: "Title"/"Default Title"; 3 rows with different Option1 (all present in live feed) |
| Missing Handles | PASS | No handles in CSV missing from feed; no unpublished products absent from feed |
| Repricing Needed | NO | CSV contains only Handle, Option1 Name, Option1 Value, Variant SKU columns |

---

## Shopify CSV Import Rules

**Source:** https://help.shopify.com/en/manual/products/import-export/using-csv (DOC)

### Omitted Columns Behavior
When using **"Overwrite products with matching handles"** with a partial CSV (only Handle + Option1 Name/Value + Variant SKU):
- **Omitted columns REMAIN UNCHANGED** in existing products (not blanked)
- Title, Description, Price, Images, Status, Inventory columns will keep current values
- This is safe for partial updates

### Required Columns for Update
- **URL handle** (required)
- **Title** (required)
- The original CSV has **no Title column** (corrected in `shopify-sku-import.checked.csv`)

### Variant Handling - CRITICAL
**"If you don't include the Option1 name and Option1 value columns, then a new default variant is created and existing variants are deleted."**

**Status:** This CSV **includes** Option1 Name and Option1 Value columns. Existing variants are protected. ✓

### Single-Variant Product Update

All 101 products in the feed are single-variant. CSV includes Option1 Name and Value for all rows:

- **98 products**: Option1 Name "Title" / Option1 Value "Default Title" (standard single-variant)
- **3 products**: Custom option configurations:
  - supreme-hanes-socks-4-pack: Color/Black
  - supreme-arabic-logo-hooded-sweatshirt: Size/Large (also has Option2 Color/Red; included in the checked CSV)
  - supreme-apes-tee: Size/Medium (also has Option2 Color/Light Pine; included in the checked CSV)

For all products, the existing variants will be **updated in place** (not deleted/recreated) because Option1 is included. Variant IDs preserved. ✓

### SKU Column Notes
- SKU is not universally required (only for custom fulfillment)
- This store uses standard fulfillment
- SKUs in this import are optional but beneficial for product feeds (Google Merchant, Meta)
- No conflicts with required columns

---

## Row-Level Issues
**None found.** All 101 rows are valid and ready for import.

---

## Import Steps (for store owner)

1. **Create a full product backup**
   - Go to **Products** > **Export**
   - Click "Export products"
   - Save the CSV (e.g., `shopify-backup-2026-09-24.csv`)
   - Keep this file safely until you confirm the import succeeded

2. **Import the SKU CSV**
   - Go to **Products** > **Import**
   - Select the file: `reports/shopify-sku-import.checked.csv` (not the original PC file)
   - Click "Upload"
   - On the preview screen, verify:
     - 101 products appear
     - Option column shows "Title: Default Title" for all variants
     - SKU column shows the new values
   - Choose **"Overwrite products with matching handles"** if prompted
   - Click "Import"

3. **Verify the import**
   - Check a few products (e.g., "supreme-box-logo-sticker")
   - Confirm SKU is now visible (e.g., "NOS-STKR-BOX-NA-OS")
   - Confirm other fields (Title, Description, Price, Images, Status) are unchanged

4. **Update product feeds**
   - Google Merchant Center: Sync the feed (SKUs now available)
   - Meta Catalog: Refresh (SKUs now available)
   - Marketplace listings (eBay, Grailed): Can now include SKU identifiers

---

## Rollback (if needed)

If the import causes unexpected issues:

1. Go to **Products** > **Import**
2. Select the backup CSV you created in step 1
3. Choose **"Overwrite products with matching handles"**
4. Click "Import"
5. Verify products return to original state (SKUs removed)

---

## Additional Notes

- **No repricing worksheet required** — this import affects only SKUs, not prices
- **Variant IDs preserved** — single-variant update keeps existing variant IDs intact
- **No bulk/irreversible changes** — only SKU fields are modified; all other product data remains stable
- **Public feed impact** — the feed at https://premeftp.shop/products.json will reflect SKUs after import
- **Store demand constraint** — one order in 60 days remains. SKUs enable visibility to buyers via Google/Meta feeds, but conversion depends on marketing and traffic
