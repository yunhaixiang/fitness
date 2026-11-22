const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('assets/cooking-flow.js','utf8');
const context={};
vm.runInNewContext(source.slice(source.indexOf('  const cookingNumber ='),source.indexOf('  const appendCookingText ='))+'this.tokens=cookingTokens;',context);
const tokens=text=>[...text.matchAll(context.tokens)].map(m=>({text:m[0],kind:Object.keys(m.groups).find(k=>m.groups[k]!==undefined)}));
test('whole time ranges with intervening words and storage times are highlighted',()=>{
 for(const value of ['5–7 more minutes','1–2 additional minutes','14–16 minutes','2 hours','3–4 days','5 – 7 minutes','5 to 7 minutes','再炸5–7分钟','2小时','3–4天','≤4°C','400°F','1分半','1½ minutes','30秒','30-second','2–3分钟']) {
  const match=tokens(value); assert.equal(match.length,1,value); assert.equal(match[0].kind,'heat',value);
  assert.equal(match[0].text,value.replace('再炸',''),value);
 }
});
test('fractions, mixed numbers, thickness and containers stay intact',()=>{
 for(const value of ['1/16 tsp','1¼ tsp','1 1/2 tsp','3–5 mm','½茶匙','half a jar','half-can','quarter can','半瓶','300 mL','3 slices','⅖包','半包','1汤匙','15 mL','3茶匙','⅖','¼']) {
  assert.deepEqual(tokens(value),[{text:value,kind:'amount'}],value);
 }
});
test('current foods and meal destinations are not partially highlighted',()=>{
 for(const value of ['罗非鱼','tilapia','Catelli番茄罗勒意面酱','Catelli Tomato & Basil sauce','Hellmann’s Light ½ Fat mayonnaise','橄榄油','油','盐','pasta water','broccoli','西兰花','咖喱汁','咖喱','curry sauce','roux','Catelli Tomato & Basil Pasta Sauce','hot water']) {
  assert.deepEqual(tokens(value),[{text:value,kind:'ingredient'}],value);
 }
 for(const value of ['plate 5','meals 3, 5, 6 and 7','第3、6盘','meal container 4','第1、4、5盘']) assert.deepEqual(tokens(value),[{text:value,kind:'portion'}]);
 assert.deepEqual(tokens('minutes later, colourful cookware'),[]);
});
test('every numeric duration and temperature in both cooking plans has full coverage',()=>{
 for(const file of ['cooking.md','plans/plan-2/cooking.md']) {
  const content=fs.readFileSync(file,'utf8');
  const candidates=[...content.matchAll(/(?:[≤≥<>]\s*)?\d+(?:\s*[–—-]\s*\d+)?\s*(?:°[FC]|分钟|小时|天|(?:(?:more|additional)\s+)?(?:minutes?|hours?|days?)\b)/g)].map(m=>m[0]);
  assert.ok(candidates.length>20);
  for(const text of candidates) assert.deepEqual(tokens(text),[{text,kind:'heat'}],`${file}: ${text}`);
 }
});

test('new cooking phrases keep complete meaningful highlights',()=>{
 assert.deepEqual(tokens('⅖ of the 90 g curry pack'),[
  {text:'⅖',kind:'amount'},{text:'90 g',kind:'amount'},{text:'curry',kind:'ingredient'}
 ]);
 assert.deepEqual(tokens('加热1分半后检查，追加30秒'),[
  {text:'1分半',kind:'heat'},{text:'30秒',kind:'heat'}
 ]);
 assert.deepEqual(tokens('microwave on high for 2 minutes; add 30-second intervals'),[
  {text:'2 minutes',kind:'heat'},{text:'30-second',kind:'heat'}
 ]);
});
