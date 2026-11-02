const test = require('node:test');
const assert = require('node:assert/strict');
const { TRACKER_ID, requirePrivacy } = require('../owner-intelligence/mapping');

test('intake privacy approval does not require financial-method acceptance', () => {
  const now = '2026-11-01T12:00:00Z';
  const policy = {
    trackerId: TRACKER_ID, accessHash: 'synthetic-access', approvedBy: 'Sawyer',
    approvedAt: now, expiresAt: '2026-11-02T11:00:00Z',
    approvalEvidence: 'Synthetic intake approval only', retentionReviewDays: 90,
    automaticDeletion: false, singleWriterId: 'synthetic-writer',
    permissionScope: 'inbound_review_only',
  };
  assert.doesNotThrow(() => requirePrivacy(policy, 'synthetic-access', now, 'synthetic-writer'));
  for (const patch of [
    { accessHash: 'different' }, { automaticDeletion: true },
    { singleWriterId: 'different' }, { permissionScope: 'marketing' },
    { approvalEvidence: '' }, { expiresAt: now },
  ]) assert.throws(() => requirePrivacy({ ...policy, ...patch }, 'synthetic-access', now, 'synthetic-writer'), /not_approved/);
});
