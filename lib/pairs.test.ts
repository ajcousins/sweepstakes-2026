import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  countsFromPlayers,
  normalisePair,
  pickBalancedPair,
} from './pairs';

describe('normalisePair', () => {
  it('orders codes lexicographically', () => {
    assert.equal(normalisePair('BRA', 'GER'), 'BRA_GER');
    assert.equal(normalisePair('GER', 'BRA'), 'BRA_GER');
  });
});

describe('pickBalancedPair', () => {
  it('picks a pair when league is empty', () => {
    const choice = pickBalancedPair(new Set(), countsFromPlayers([]));
    assert.ok(choice);
    assert.notEqual(choice!.team_a, choice!.team_b);
  });

  it('prefers teams below current max', () => {
    const counts = countsFromPlayers([
      { team_a: 'GER', team_b: 'BRA' },
    ]);
    const used = new Set([normalisePair('GER', 'BRA')]);
    const choice = pickBalancedPair(used, counts);
    assert.ok(choice);
    assert.equal(counts[choice!.team_a], 0);
    assert.equal(counts[choice!.team_b], 0);
  });
});
