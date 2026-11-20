import test from 'node:test';
import assert from 'node:assert/strict';
import { showValues } from '../src/lib/values.mjs';

test('proposed or draft values are hidden on the public build and shown in development', () => {
  assert.equal(showValues(false, { proposed: true, draft: false }), false);
  assert.equal(showValues(false, { proposed: false, draft: true }), false);
  assert.equal(showValues(true, { proposed: true, draft: true }), true);
});

test('values reappear publicly once the proposed flag is turned off', () => {
  assert.equal(showValues(false, { proposed: false, draft: false }), true);
});
