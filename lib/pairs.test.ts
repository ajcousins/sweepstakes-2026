import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { TEAMS } from './teams';
import {
  buildPotBalancedPairs,
  countsFromPlayers,
  isPotBalancedPair,
  normalisePair,
  pickBalancedPair,
} from './pairs';

describe('normalisePair', () => {
  it('orders codes lexicographically', () => {
    assert.equal(normalisePair('BRA', 'GER'), 'BRA_GER');
    assert.equal(normalisePair('GER', 'BRA'), 'BRA_GER');
  });
});

describe('isPotBalancedPair', () => {
  it('allows one strong and one weak team', () => {
    assert.equal(isPotBalancedPair('BRA', 'ALG'), true);
    assert.equal(isPotBalancedPair('JPN', 'HAI'), true);
  });

  it('rejects two strong or two weak teams', () => {
    assert.equal(isPotBalancedPair('BRA', 'GER'), false);
    assert.equal(isPotBalancedPair('ALG', 'HAI'), false);
  });
});

describe('buildPotBalancedPairs', () => {
  it('has 576 valid strong/weak combinations for 48 teams', () => {
    assert.equal(buildPotBalancedPairs().length, 576);
  });
});

describe('pickBalancedPair', () => {
  it('picks a pot-balanced pair when league is empty', () => {
    const choice = pickBalancedPair(new Set(), countsFromPlayers([]));
    assert.ok(choice);
    assert.notEqual(choice!.team_a, choice!.team_b);
    assert.equal(isPotBalancedPair(choice!.team_a, choice!.team_b), true);
  });

  it('prefers teams below current max', () => {
    const counts = countsFromPlayers([
      { team_a: 'GER', team_b: 'ALG' },
    ]);
    const used = new Set([normalisePair('GER', 'ALG')]);
    const choice = pickBalancedPair(used, counts);
    assert.ok(choice);
    assert.equal(counts[choice!.team_a], 0);
    assert.equal(counts[choice!.team_b], 0);
    assert.equal(isPotBalancedPair(choice!.team_a, choice!.team_b), true);
  });

  it('only assigns pairs with one team from pots 1–2 and one from pots 3–4', () => {
    for (let i = 0; i < 50; i++) {
      const choice = pickBalancedPair(new Set(), countsFromPlayers([]));
      assert.ok(choice);
      const pots = [choice!.team_a, choice!.team_b].map(
        (c) => TEAMS[c as keyof typeof TEAMS].pot,
      );
      const strong = pots.filter((p) => p <= 2).length;
      const weak = pots.filter((p) => p >= 3).length;
      assert.equal(strong, 1);
      assert.equal(weak, 1);
    }
  });
});
