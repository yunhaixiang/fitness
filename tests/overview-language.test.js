const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const read = p => fs.readFileSync(p, 'utf8');
const window = {};
vm.runInNewContext(read('assets/i18n.js'), {
 window, localStorage: {getItem: () => 'zh'},
 document: {documentElement: {}, querySelectorAll: () => []}
});
const i18n = window.fitnessI18n;
const chinese = /[\u3400-\u9fff]/;
function node(tag, className, textContent = '') {
 return {tag, className, textContent, dataset: {}, children: [],
 append(...items) {this.children.push(...items);},
 replaceChildren() {this.children = [];}, setAttribute() {}};
}
function text(n) {return n.textContent + n.children.map(text).join(' ');}
const today = read('assets/today.js');
const render = today.slice(today.indexOf('  function addMeal('), today.indexOf('  function renderTraining('));
const {splitFoods, foodEmoji} = require('../assets/today');
for (const plan of ['plan-1', 'plan-2']) {
 const prefix = plan === 'plan-1' ? '' : 'meal-plans/plan-2/';
 const nutrition = JSON.parse(read(plan === 'plan-1' ? '_data/meal_nutrition.json' : '_data/meal_plan_content/plan-2/nutrition.json')).meals;
 const rows = [...read(`_includes/${prefix}diet-schedule.html`).matchAll(/<tr data-nutrition-key="([^"]+)"([^>]*)>([\s\S]*?)<\/tr>/g)].map(m => {
  const cells = [...m[3].matchAll(/<td([^>]*)>([\s\S]*?)<\/td>/g)].map(c => ({textContent: c[2], dataset: {en: c[1].match(/data-en="([^"]+)"/)?.[1]}}));
  cells[6].textContent = nutrition[m[1]].kcal;
  return {cells, dataset: {drink: m[2].match(/data-drink="([^"]+)"/)?.[1]}};
 });
 for (const language of ['en', 'zh']) test(`${plan} overview renders all seven days in ${language} without mixed-language food labels`, () => {
  for (let day = 0; day < 7; day++) {
   const mealsRoot = node('main');
   vm.runInNewContext(render + '\nrenderMeals(day);', {
    day, mealsRoot, nutrition, en: language === 'en', dietTable: {tBodies: [{rows}]},
    weekdays: ['周日','周一','周二','周三','周四','周五','周六'],
    cell: (row, index) => row.cells[index].textContent.trim(), element: node,
    translated: value => language === 'en' ? i18n.titleCase(i18n.translate(value)) : value,
    label: (zh, en) => language === 'en' ? en : zh,
    splitFoods, foodEmoji, window: {fitnessMealActivities: {append() {}}}
   });
   assert.ok(mealsRoot.children.some(n => n.dataset.meal === 'lunch'));
   assert.ok(mealsRoot.children.some(n => n.dataset.meal === 'dinner'));
   const displayed = text(mealsRoot);
   if (language === 'en') assert.doesNotMatch(displayed, chinese, `${plan} day ${day}: ${displayed}`);
   else assert.match(displayed, /早餐/);
  }
 });
}
test('both overview pages have English translations for static visible labels', () => {
 for (const file of ['index.html','plans/plan-2/index.html']) {
  const html = read(file).replace(/<script[\s\S]*?<\/script>|<template[\s\S]*?<\/template>/g, '');
  for (const m of html.matchAll(/<[^>]+>([^<>]+)<\//g)) {
   if (!chinese.test(m[1]) || m[1].includes('{%')) continue;
   const explicit = m[0].match(/data-en="([^"]+)"/);
   assert.doesNotMatch(explicit?.[1] || i18n.translate(m[1]), chinese, `${file}: ${m[1]}`);
  }
 }
});
