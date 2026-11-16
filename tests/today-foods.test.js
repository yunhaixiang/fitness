const test = require('node:test');
const assert = require('node:assert/strict');
const {splitFoods,foodEmoji} = require('../assets/today');
test('food rows preserve quantities, parentheses and bilingual separators',()=>{
 assert.deepEqual(splitFoods('2 Boiled Eggs, vitamin D (1,000 IU), Peas, Carrots'),['2 Boiled Eggs','vitamin D (1,000 IU)','Peas','Carrots']);
 assert.deepEqual(splitFoods('菠菜10 g，水煮蛋2个、豆奶270 g · 核桃6瓣（约12 g）'),['菠菜10 g','水煮蛋2个','豆奶270 g','核桃6瓣（约12 g）']);
 assert.deepEqual(splitFoods('1,000 g potatoes, 1 egg'),['1,000 g potatoes','1 egg']);
 assert.equal(foodEmoji('Crispy Breaded Haddock Fillet'),'🐟');
 assert.equal(foodEmoji('Chicken Spaghetti'),'🍝');
});
