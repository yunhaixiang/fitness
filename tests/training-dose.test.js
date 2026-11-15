const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const dose = require('../assets/training-dose');

test('dose bands keep fractional boundaries and distinguish stabilization from no work', () => {
  for (const [sets,status] of [[0,'none'],[4.5,'low'],[5,'moderate'],[9.5,'moderate'],[10,'adequate'],[20,'adequate'],[20.5,'high']]) {
    assert.equal(dose.assess({...dose.create(),primarySets:sets}).status,status);
  }
  const tally=dose.create(); dose.add(tally,'secondary',12,true);
  assert.deepEqual(dose.assess(tally),{status:'stabilizing',sets:0});
  dose.add(tally,'primary',3); dose.add(tally,'secondary',5);
  assert.deepEqual(dose.assess(tally),{status:'moderate',sets:5.5});
  assert.equal(dose.assess({...tally,primarySets:NaN}).status,'unknown');
});

// Lightweight DOM fixture renders the real exercise tables and production renderer.
class Element {
  constructor(tag='div',content=''){this.tagName=tag.toUpperCase();this.textContent=content;this.children=[];this.dataset={};this.style={};this.events={};this.attrs={};this.classList={toggle(){}};}
  append(...items){this.children.push(...items);}
  prepend(...items){this.children.unshift(...items);}
  replaceChildren(...items){this.children=items;}
  insertBefore(item,before){this.children.splice(this.children.indexOf(before),0,item);}
  setAttribute(k,v){this.attrs[k]=v;}
  getAttribute(k){return this.attrs[k];}
  addEventListener(k,v){this.events[k]=v;}
  getBoundingClientRect(){return {width:0,height:0,top:0,left:0};}
}
function table(mode){
  const html=fs.readFileSync(`_includes/strength-${mode}-table.html`,'utf8');
  return {tBodies:[...html.matchAll(/<tbody>([\s\S]*?)<\/tbody>/g)].map(([,body])=>({rows:[...body.matchAll(/<tr>([\s\S]*?)<\/tr>/g)].map(([,row])=>({cells:[...row.matchAll(/<(?:td|th)\b[^>]*>([\s\S]*?)<\/(?:td|th)>/g)].map(([,cell])=>{
    const plain=cell.replace(/<[^>]*>/g,''); const link=cell.match(/<a\b([^>]*)>([^<]*)<\/a>/);const action=link?{firstChild:{textContent:link[2]},dataset:{weight:link[1].match(/data-weight="([^"]+)"/)?.[1],weightKind:link[1].match(/data-weight-kind="([^"]+)"/)?.[1]}}:null;
    return {firstChild:{textContent:plain},textContent:plain,querySelector:()=>action};
  })}))}))};
}
function render(language,withWeight=false){
  const root=new Element(),toolbar=new Element(),buttons=[new Element('button'),new Element('button')];
  toolbar.querySelectorAll=()=>buttons;root.querySelector=()=>toolbar;
  const document={querySelector:()=>root,querySelectorAll:()=>[table('home'),table('gym')],createElement:tag=>new Element(tag),createElementNS:(_,tag)=>new Element(tag),body:{dataset:{}}};
  const window={fitnessTrainingDose:dose,fitnessI18n:{language,original:n=>n.textContent,translate:n=>n},addEventListener(){}};
  if(withWeight)window.fitnessBodyMetrics={weight:80}; // Synthetic fixture, not a personal record.
  const warnings=[];
  vm.runInNewContext(fs.readFileSync('assets/strength-volume.js','utf8'),{window,document,Intl,URL,location:{origin:'https://example.test'},requestAnimationFrame(){},console:{warn:m=>warnings.push(m)}});
  function all(node){return [node,...node.children.flatMap(all)];}
  return {buttons,mapBadges:()=>all(root).filter(n=>n.className?.startsWith('volume-photo-badge ')),cards:()=>all(root).filter(n=>n.className==='visual-card visual-volume-card'),all,warnings};
}
test('all muscles render ratings in both modes without requiring private body weight',()=>{
  const r=render('zh');assert.deepEqual(r.warnings,[]);assert.equal(r.cards().length,16);
  const chest=r.cards().find(c=>c.id==='volume-home-chest');
  assert.ok(r.all(chest).some(n=>n.textContent==='折算 8 组/周'));
  const back=r.cards().find(c=>c.id==='volume-home-lower-back');
  assert.ok(r.all(back).some(n=>n.textContent==='以稳定参与为主'));
  // Two unilateral sets of 3 per leg are six weekly calf sets, not twelve.
  const calves=r.cards().find(c=>c.id==='volume-home-calves');
  assert.ok(r.all(calves).some(n=>n.textContent==='折算 6 组/周'));
  r.buttons[1].events.click();assert.equal(r.cards().length,16);assert.ok(r.cards().every(c=>c.id.startsWith('volume-gym-')));
  assert.ok(r.cards().every(c=>r.all(c).filter(n=>n.className?.startsWith('volume-rating is-')).length===1));
  r.buttons[0].events.click();assert.equal(r.cards().length,16);assert.ok(r.cards().every(c=>c.id.startsWith('volume-home-')));
});
test('English ratings match Chinese classifications and remain independent of bodyweight tonnage',()=>{
  const zh=render('zh'),en=render('en',true);
  const badges=r=>r.cards().map(c=>r.all(c).find(n=>n.className?.startsWith('volume-rating is-')).className);
  assert.deepEqual(badges(zh),badges(en));
  assert.ok(en.cards().every(c=>en.all(c).some(n=>n.className==='volume-rating-sets'&&/Sets \/ Week/.test(n.textContent))));
  for (const r of [zh,en]) for (const mode of [0,1]) {
    r.buttons[mode].events.click();
    assert.equal(r.mapBadges().length,16);
    for (const badge of r.mapBadges()) {
      const name=badge.children.find(n=>n.className==='volume-photo-name').textContent;
      const card=r.cards().find(c=>r.all(c).some(n=>n.tagName==='H4'&&n.textContent===name));
      const detailRating=r.all(card).find(n=>n.className?.startsWith('volume-rating is-'));
      const mapRating=badge.children.find(n=>n.className?.startsWith('volume-rating volume-photo-rating'));
      assert.equal(mapRating.textContent,detailRating.textContent);
      assert.ok(badge.attrs['aria-label'].includes(mapRating.textContent));
    }
  }
});
