const test = require('node:test');
const assert = require('node:assert/strict');
const {torontoWeekday, eventsForDay} = require('../assets/sleep');
test('daily selector follows Toronto calendar around midnight and DST', () => {
  assert.equal(torontoWeekday(new Date('2026-11-17T02:00:00Z')), 1);
  assert.equal(torontoWeekday(new Date('2026-11-17T05:00:00Z')), 2);
  assert.equal(torontoWeekday(new Date('2026-07-06T03:30:00Z')), 0);
});
test('weekday selection combines daily events with only the selected weekly activities', () => {
  const daily = {title:'Daily'}, shop = {title:'Shop',days:[6]}, prep = {title:'Prep',days:[0,3]}, exercise = {title:'Exercise',days:[1,2,4,5]};
  const events = [daily,shop,prep,exercise];
  assert.deepEqual(eventsForDay(events,6),[daily,shop]);
  assert.deepEqual(eventsForDay(events,3),[daily,prep]);
  assert.deepEqual(eventsForDay(events,1),[daily,exercise]);
  assert.equal(events.length,4);
});
