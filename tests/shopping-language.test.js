const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const read = file => fs.readFileSync(file, 'utf8');
const window = {};
vm.runInNewContext(read('assets/i18n.js'), {
  window, localStorage: {getItem: () => 'zh'},
  document: {documentElement: {}, querySelectorAll: () => []}
});
const chinese = /[\u3400-\u9fff]/;
for (const file of ['shopping.md', 'plans/plan-2/shopping.md']) {
  test(`${file}: English shopping names, quantities, packaging and controls contain no Chinese`, () => {
    const html = read(file).replace(/^---[\s\S]*?---/, '');
    const stack = [];
    for (const token of html.match(/<[^>]*>|[^<]+/g) || []) {
      if (token.startsWith('</')) stack.pop();
      else if (token.startsWith('<')) {
        for (const attr of token.matchAll(/(?:placeholder|aria-label|title)="([^"]*)"/g)) {
          assert.doesNotMatch(window.fitnessI18n.translate(attr[1]), chinese);
        }
        if (!/^<(?:br|input|hr)\b/.test(token)) stack.push(token);
      } else if (chinese.test(token)) {
        const explicit = stack.at(-1)?.match(/data-en="([^"]*)"/)?.[1];
        assert.doesNotMatch(explicit ?? window.fitnessI18n.translate(token), chinese, token.trim());
      }
    }
  });
}
test('Plan 2 uses whole little-potato bags and the same weekly drink as Plan 1', () => {
  const shopping = read('plans/plan-2/shopping.md');
  assert.match(shopping, /The Little Potato Company Little Yellows/);
  assert.match(shopping, /2 Bags \/ Week \(1.36 kg\); Four Meals of 340 g/);
  assert.match(read('plans/plan-2/cooking.md'), /Wash one 680 g bag/);
  assert.doesNotMatch(shopping + read('plans/plan-2/diet.md'), /Fuze|Organic Yellow Potatoes/);
  const row = html => html.match(/<tr data-price-id="8"[\s\S]*?<\/tr>/)[0];
  assert.equal(row(shopping), row(read('shopping.md')));
});
