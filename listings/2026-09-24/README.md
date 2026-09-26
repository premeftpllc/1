# Marketplace listing drafts — 2026-09-24

These are drafts for eBay and Grailed. Nothing has been published. The data comes from the live public feed `https://premeftp.shop/products.json?limit=250`, which lists 101 published products. Only the **88 buyable** ones are included here: a product counts as buyable when at least one variant is `available`. Proposed SKUs come from `premeos-handoff/shopify-sku-import.csv` on `origin/main`.

Apply the SKUs in Shopify first; see [the SKU import check](../../reports/2026-09-24-sku-import-check.md). That puts the same SKU on the store and on both marketplaces.

## Files

| File | Rows | Use |
|---|---|---|
| `ebay-drafts.csv` | 88 | Starting point for an eBay Seller Hub bulk upload |
| `grailed-drafts.csv` | 88 | Copy-paste sheet for Grailed, which has no CSV bulk upload |

### ebay-drafts.csv

These columns are filled from the feed:

| Column | Source |
|---|---|
| `CustomLabel` | Proposed SKU |
| `Title` | Store title, cut to 80 characters or fewer |
| `StartPrice` | Current Shopify price, checked against the live feed on 2026-09-24 |
| `PicURL` | Shopify CDN image URLs |
| `Description` | Store description as plain text, plus the product URL |

`Action` is set to `Add`.

**You must fill:**

- `Quantity`: the public feed does not show inventory levels.
- `ConditionID`: this needs a physical check. Nothing here asserts new or used.
- `CategoryID`
- Listing format and duration, shipping, and returns: these are not in the file.

**Headers:** these are simplified names. Before uploading, download eBay's current template from Seller Hub → Reports → Uploads and map these columns onto its exact headers. eBay's template headers carry site and version parameters, for example `*Action(SiteID=US|...)`. Guide: <https://pages.ebay.com/sh/reports/help/create-listings-bulk/>

### grailed-drafts.csv

These columns are filled from the feed: Title, Price (the Shopify price), Description, Photo URLs, Product URL and Proposed SKU.

- **Designer** is "Supreme" only where the store's own product title says Supreme. Confirm it before listing.
- **Size** is filled only for the 2 products that have a Size option in Shopify. The rest are single-variant listings, so the size has to come from the item itself.

**You must fill:** Category, Condition, Size (where blank), and shipping.

**Bulk upload:** Grailed has no CSV bulk upload, so list items one at a time or use a cross-listing tool. This comes from Grailed's support articles; the site blocks automated fetches, so it was not re-checked on 2026-09-24.

## Before listing

- **Prices don't include fees.** They are store prices with no marketplace or payment fees and no shipping. Check each platform's current fee schedule before setting prices.
- **Avoid overselling.** Items will be for sale in two or three places at once. If one sells, delist or mark it sold everywhere else.
- **Vendor field.** The store's vendor field says "PremeFTP", the store name, rather than a brand. Brand fields on marketplaces should reflect the item itself.

## Verification (2026-09-24)

- The live feed returned 101 products, 88 of them buyable. Each draft row's price was checked against the feed programmatically.
- One automated check reported only 48 products. That came from a truncated web fetch; a direct `curl` of the feed shows 101.
