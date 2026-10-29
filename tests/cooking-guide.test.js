const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require.resolve('../assets/cooking-guide.js'), 'utf8');
const adjustSource = source.slice(source.indexOf('  const adjust ='), source.indexOf('  const stirred ='));
const remainingSource = source.slice(source.indexOf('  const remainingSeconds ='), source.indexOf('  const stirSeconds ='));
const now = 1000000;
function setup(run) {
  const record = { running: { rice: run }, done: [], startedAt: 10000 };
  const context = { Date: { now: () => now }, batch: () => record,
    save: () => { context.saved = JSON.parse(JSON.stringify(record)); }, render: () => {} };
  vm.runInNewContext(remainingSource + adjustSource + 'this.adjust = adjust;', context);
  return { record, context };
}
test('adding time after expiry starts a full minute now, even after a long delay', () => {
  for (const overdue of [0, 30000, 300000]) {
    const { context, record } = setup({ startedAt: now - 8 * 60000 - overdue, minutes: 8, alerted: true });
    context.adjust('rice', 1);
    const run = record.running.rice;
    assert.equal(run.startedAt + run.minutes * 60000, now + 60000);
    assert.equal(run.alerted, false);
    assert.deepEqual(record.done, []);
    assert.equal(record.startedAt, 10000);
    assert.equal(context.saved.running.rice.minutes, 1);
    context.adjust('rice', 1);
    assert.equal(run.startedAt + run.minutes * 60000, now + 120000);
  }
});
test('adding time before expiry extends the existing deadline', () => {
  const { context, record } = setup({ startedAt: now - 30000, minutes: 1 });
  context.adjust('rice', 1);
  assert.equal(record.running.rice.startedAt + record.running.rice.minutes * 60000, now + 90000);
});
test('untimed tasks are not turned into timers', () => {
  const { context, record } = setup({ startedAt: now });
  context.adjust('rice', 1);
  assert.equal(record.running.rice.minutes, undefined);
});

test('completion alarm repeats until extended or completed, and re-arms at the new deadline', () => {
  let clock = now, sounds = 0, stops = 0;
  const state = { batches: { first: { running: { rice: { startedAt: now - 60000, minutes: 1 } }, done: [] },
    second: { running: {}, done: [] } } };
  const context = { Date: { now: () => clock }, state, batch: () => state.batches.first,
    byId: new Map([['rice', {}]]), tasks: [{ id: 'rice' }],
    running: id => Boolean(state.batches.first.running[id]), save: () => {},
    playAlert: () => { sounds++; return true; }, stopAlert: () => { stops++; },
    render: () => context.updateAlarm() };
  const alarmSource = source.slice(source.indexOf("  let completionAlarmKey ="), source.indexOf('  const taskCard ='));
  const completeSource = source.slice(source.indexOf('  const complete ='), source.indexOf('  const adjust ='));
  vm.runInNewContext(remainingSource + alarmSource + adjustSource + completeSource +
    'this.updateAlarm = updateCompletionAlarm; this.adjust = adjust; this.complete = complete;', context);
  context.updateAlarm(); assert.equal(sounds, 1);
  clock += 4999; context.updateAlarm(); assert.equal(sounds, 1);
  clock++; context.updateAlarm(); assert.equal(sounds, 2);
  context.adjust('rice', 1); assert.equal(stops, 1);
  clock += 59000; context.updateAlarm(); assert.equal(sounds, 2);
  clock += 1000; context.updateAlarm(); assert.equal(sounds, 3);
  context.complete('rice'); assert.equal(stops, 2);
  clock += 5000; context.updateAlarm(); assert.equal(sounds, 3);
});

test('overdue timers in either batch share a reminder and untimed boiling stays silent', () => {
  let sounds = 0;
  const expired = { startedAt: now - 60000, minutes: 1, alerted: true };
  const state = { batches: { first: { running: { rice: expired } }, second: { running: { salmon: expired, water: { startedAt: 0 } } } } };
  const context = { Date: { now: () => now }, state,
    byId: new Map([['rice', {}], ['salmon', {}], ['water', { manual: true }]]),
    playAlert: () => { sounds++; return true; }, stopAlert: () => {} };
  const alarmSource = source.slice(source.indexOf("  let completionAlarmKey ="), source.indexOf('  const taskCard ='));
  vm.runInNewContext(remainingSource + alarmSource + 'this.updateAlarm = updateCompletionAlarm;', context);
  context.updateAlarm(); assert.equal(sounds, 1);
  delete state.batches.first.running.rice;
  context.updateAlarm(); assert.equal(sounds, 2);
  delete state.batches.second.running.salmon;
  context.updateAlarm(); assert.equal(sounds, 2);
});
