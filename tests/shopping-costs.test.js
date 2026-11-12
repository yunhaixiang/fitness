const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { calculateShoppingCosts } = require('../assets/shopping-costs');
const config = require('../_data/shopping_fees.json');
function rows(file) {
  return [...fs.readFileSync(file, 'utf8').matchAll(/<tr\b[^>]*>/g)].map(([row]) => ({
    id: row.match(/data-price-id="([^"]+)"/)?.[1],
    weeklyCost: row.match(/data-weekly-cost="([^"]+)"/)?.[1]
  }));
}
test('shopping budgets follow each plan without taxing basic food or voluntary tips', () => {
  assert.deepEqual(calculateShoppingCosts(rows('shopping.md'), config), {
    goods: 15415, tip: 1000, delivery: 500, service: 1500, tax: 422, total: 18837
  });
  assert.deepEqual(calculateShoppingCosts(rows('plans/plan-2/shopping.md'), config), {
    goods: 14969, tip: 1000, delivery: 500, service: 1500, tax: 386, total: 18355
  });
  const base = calculateShoppingCosts([{id:'1',weeklyCost:100}], config);
  const moreTip = calculateShoppingCosts([{id:'1',weeklyCost:100}], {...config, tip_per_order_cad:20});
  assert.equal(base.tax, 260);
  assert.equal(moreTip.tax, base.tax);
  assert.equal(moreTip.total - base.total, 1000);
});
test('checkout config appears in both shopping plans and calculator loads before rendering', () => {
  for (const file of ['shopping.md', 'plans/plan-2/shopping.md']) {
    assert.match(fs.readFileSync(file, 'utf8'), /include shopping-fees.html/);
  }
  const layout = fs.readFileSync('_layouts/default.html', 'utf8');
  assert.ok(layout.indexOf('shopping-costs.js') < layout.indexOf('visual-tables.js'));
});
