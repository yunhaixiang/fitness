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
