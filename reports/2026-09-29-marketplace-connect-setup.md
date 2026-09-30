# Marketplace Connect (eBay) setup — premeftp.shop

Prepared 2026-09-29. The Shopify side is done; these steps are the owner's (they need your Shopify and eBay logins).

## What was changed in Shopify (88 buyable products)

- Vendor set to **Supreme** (was "PremeFTP"), so the brand is right on eBay, Google and Meta.
- SKUs added to all 88 variants (from `reports/shopify-sku-import.checked.csv`; 22 FW26/NA codes corrected to real color/size).
- New product fields (Settings → Custom data → Products): **eBay title**, **eBay category ID**, **eBay size**, **Department**, **Size type**. Existing Size / Color / Season / Brand fields filled for the 15 FW26 products that were missing them.
- 17 descriptions that were copied from StockX replaced with short original ones.
- Shopify product category set on 6 products that had none.
- Titles, prices, photos and inventory were not touched.

Backup of the previous values: `reports/2026-09-29-shopify-products-BEFORE-mc-prep.json`.

## Your steps

1. **eBay account first.** In eBay Seller Hub → Account → Business policies, make sure you have a shipping policy, a return policy and a payment policy. Marketplace Connect asks for them.
2. **Install** Shopify Marketplace Connect from the Shopify App Store and connect your eBay account (eBay US).
3. **Attribute mapping** (Marketplace Connect → Settings → Attribute mapping, eBay):

   | eBay field | Map to Shopify field |
   |---|---|
   | Title | `custom.ebay_title` (or leave the default product title) |
   | Category | `custom.ebay_category_id` |
   | Brand | Vendor (now "Supreme") or `custom.brand` |
   | Size | `custom.ebay_size` |
   | Color | `custom.color` |
   | Department | `custom.department` |
   | Size Type | `custom.size_type` |
   | UPC / product ID | "Does not apply" (resale items have no barcode) |
   | Condition | Set a default (see below) |

4. **Condition.** Pick the default that is true for most pieces (New with tags = eBay 1000, New without tags = 1500, Pre-owned = 3000) and change the exceptions per listing.
5. **Choose what to publish.** Start with the 21 items marked "eBay" in `reports/2026-09-29-market-prices-all88.csv`, or publish all 88 (inventory syncs, so a sale anywhere removes the item everywhere). StockX listings are NOT synced; if something sells on StockX, set its Shopify stock to 0.

## eBay categories used (verified against live eBay category pages)

| Product type | eBay category |
|---|---|
| Tees, L/S tees, Hanes tees | 15687 Men's T-Shirts |
| Hoodies | 155183 Men's Hoodies & Sweatshirts |
| Beanies, 6-panels, camp caps, New Era | 52365 Men's Hats |
| Shoulder bags, neck pouch | 52357 Men's Bags |
| Skateboard decks | 16263 Skateboard Decks |
| Socks | 11511 Men's Socks |
| Boxer briefs | 11507 Men's Underwear |
| Umbro short | 15689 Men's Shorts |
| Umbro jersey | 185076 Men's Activewear Tops |
| Cross Track Jacket | 57988 Men's Coats, Jackets & Vests |
| Scarf | 52382 Men's Scarves |
| Opinel knife | 43333 Modern Folding Knives |
| Keychain | 52373 Men's Key Chains, Rings & Cases |
| Toothpaste | 67422 Toothpaste |

## Needs your input before listing

- **Size unknown:** Umbro Soccer Jersey (white), Float Tee (black), Champions Box Logo New Era (fitted size), Nike Lightweight Crew Socks ("Size 2" — check the tag's shoe-size range). Their eBay size field is blank.
- **Thrasher 6-Panel:** Shopify says size "Small", but 6-panels are normally one size; eBay size was set to One Size. Check the tag.
