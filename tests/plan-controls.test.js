const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
class Node {
 constructor(tag='div'){this.tagName=tag.toUpperCase();this.children=[];this.attrs={};this.dataset={};this.events={};this.hidden=false;}
 append(...items){this.children.push(...items);}
 prepend(...items){this.children.unshift(...items);}
 replaceChildren(...items){this.children=items;}
 setAttribute(k,v){this.attrs[k]=v;}
 getAttribute(k){return this.attrs[k];}
 addEventListener(k,fn){(this.events[k]||=[]).push(fn);}
 fire(k){for(const fn of this.events[k]||[])fn();}
 querySelectorAll(s){return descendants(this).filter(n=>s.startsWith('#')?n.id===s.slice(1):s.startsWith('.')?n.className?.split(' ').includes(s.slice(1)):n.tagName===s.toUpperCase());}
 querySelector(s){return this.querySelectorAll(s)[0]||null;}
}
const descendants=n=>n.children.flatMap(c=>[c,...descendants(c)]);
for(const language of ['zh','en']) {
 test(`cardio alternatives switch cards but preserve the current energy budget (${language})`,()=>{
  const main=new Node(),root=new Node();main.append(root);
  const catalog=require('../_data/cardio_plans.json');
  const values={'cardio-plan-catalog':catalog,'metabolic-energy':{exerciseWeightRatio:0.98,dailyResting:1600,dailyActivity:320},'cardio-energy-baseline':{reference_strength_weekly:450,intake_daily:1900},'walking-energy':{weeklyKcal:280}};
  const document={getElementById:id=>id==='cardio-options'?root:id==='main'?main:values[id]?{textContent:JSON.stringify(values[id])}:null,createElement:t=>new Node(t),querySelector:()=>null,querySelectorAll:()=>[]};
  root.before=n=>main.prepend(n);
  const window={fitnessI18n:{language}};
  vm.runInNewContext(fs.readFileSync('assets/cardio-plans.js','utf8'),{window,document,Intl});
  const select=main.querySelector('#cardio-plan-select');
  assert.equal(select.value,catalog.default);
  assert.match(select.children[0].textContent,language==='zh'?/^当前/:/^Current/);
  assert.match(select.children[0].textContent,/200/);assert.match(select.children[1].textContent,/300/);
  assert.equal(root.children.length,4);
  assert.ok(root.querySelectorAll('a').some(n=>n.href.includes('tgm_QjUiwlk')));
  const budget=JSON.stringify(window.fitnessEnergyBudget);
  select.value=catalog.plans[1].id;select.fire('change');
  assert.equal(root.children.length,4);
  assert.ok(root.querySelectorAll('a').some(n=>n.href.includes('l54F-KHzKhA')));
  assert.ok(descendants(root).some(n=>n.textContent?.includes('growingannanas')));
  assert.equal(JSON.stringify(window.fitnessEnergyBudget),budget);
  assert.equal(window.fitnessCardioPlan.id,catalog.default);
 });
 test(`meal default is labeled current and switching preserves the other plan (${language})`,()=>{
  const main=new Node();const catalog=require('../_data/meal_plans.json');
  const location={origin:'https://example.test',pathname:'/fitness/plans/plan-2/diet/',href:'https://example.test/fitness/plans/plan-2/diet/',assign(url){this.assigned=url;}};
  const document={body:{dataset:{baseurl:'/fitness'}},getElementById:id=>id==='main'?main:id==='meal-plan-catalog'?{textContent:JSON.stringify(catalog)}:null,querySelectorAll:()=>[],createElement:t=>new Node(t)};
  const localStorage={getItem:key=>key==='yunhai-fitness-language'?language:'plan-2',setItem(){}};
  vm.runInNewContext(fs.readFileSync('assets/meal-plans.js','utf8'),{window:{},document,location,localStorage,URL});
  const select=main.querySelector('#meal-plan-select');
  assert.equal(select.children[0].textContent,language==='zh'?'当前':'Current');
  assert.equal(select.children[0].value,'plan-2');
  assert.equal(select.children[0].selected,true);
  assert.equal(select.children[1].value,'plan-1');
  select.value='plan-1';select.fire('change');assert.match(location.assigned,/\/fitness\/diet\/\?plan=plan-1$/);
 });
 test(`strength opens at home and switches its day panels (${language})`,()=>{
  const root=new Node();const wraps=[new Node(),new Node()];
  const tables=wraps.map(w=>({tBodies:[],closest:()=>w}));
  const document={querySelectorAll:()=>tables,querySelector:s=>s==='#strength-root'?root:null,createElement:t=>new Node(t),addEventListener(){}};
  const window={fitnessI18n:{language,titleCase:x=>x},addEventListener(){}};
  const localStorage={getItem:()=> 'gym',setItem(){throw Error('Browsing must not change current plan');}};
  vm.runInNewContext(fs.readFileSync('assets/visual-tables.js','utf8'),{window,document,location:{pathname:'/fitness/strength/'},localStorage,Date,setTimeout(){}});
  const select=root.querySelector('#strength-plan-select');
  assert.equal(select.value,'home');assert.equal(select.children.length,2);
  assert.match(select.children[0].textContent,language==='zh'?/当前.*在家/:/Current.*Home/);
  assert.equal(root.querySelector('#strength-home').hidden,false);
  assert.equal(root.querySelector('#strength-gym').hidden,true);
  select.value='gym';select.fire('change');
  assert.equal(root.querySelector('#strength-home').hidden,true);
  assert.equal(root.querySelector('#strength-gym').hidden,false);
  assert.equal(root.querySelector('#strength-gym').querySelectorAll('.visual-training-day').filter(n=>!n.hidden).length,1);
 });
}
