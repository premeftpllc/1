const https = require('https');
const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN || '';
const BASE_ID = 'appMgSuE6O4sXyxzE';
const TABLE_ID = 'tbla4c3FzE70sCP6B';
if (!AIRTABLE_TOKEN) {
  console.error('❌ Error: AIRTABLE_TOKEN not set');
  process.exit(1);
}
function queryAirtable(endpoint = '', params = '') {
  return new Promise((resolve, reject) => {
    const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}${params}`;
    const options = {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
        'User-Agent': 'Preme-OS-Inventory-Query'
      }
    };
    https.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Invalid JSON: ${e.message}`));
        }
      });
    }).on('error', reject);
  });
}
async function main() {
  try {
    console.log('🔌 Preme OS Airtable Inventory Query');
    const response = await queryAirtable();
    if (response.error) {
      throw new Error(`Airtable API Error: ${response.error.type} - ${response.error.message}`);
    }
    const records = response.records || [];
    console.log(`✅ Connected! Found ${records.length} inventory items\n`);
    let matched = 0, unmatched = 0;
    let unmatchedItems = [];
    records.forEach((record) => {
      const fields = record.fields;
      const stockxId = fields['StockX Product ID'];
      if (stockxId) {
        matched++;
      } else {
        unmatched++;
        unmatchedItems.push({
          id: record.id,
          name: fields['Product name'] || 'Unknown',
          size: fields['Size'] || 'N/A',
          condition: fields['Condition'] || 'N/A',
          cost: fields['Cost'] || 'N/A'
        });
      }
    });
    console.log('📊 INVENTORY SUMMARY');
    console.log('====================');
    console.log(`✅ Matched to StockX:  ${matched} items`);
    console.log(`❌ Unmatched:          ${unmatched} items`);
    console.log(`📈 Total:              ${records.length} items\n`);
    if (unmatchedItems.length > 0) {
      console.log('🔗 UNMATCHED ITEMS (First 5):\n');
      unmatchedItems.slice(0, 5).forEach((item, idx) => {
        console.log(`${idx + 1}. ${item.name}`);
        console.log(`   Size: ${item.size} | Condition: ${item.condition} | Cost: $${item.cost}\n`);
      });
    }
    console.log('✅ Airtable MCP Connection: WORKING\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(`  - Token configured: ${AIRTABLE_TOKEN ? 'Yes' : 'No'}`);
    process.exit(1);
  }
}
main();