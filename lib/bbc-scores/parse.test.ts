import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it } from 'node:test';
import type { BbcEvent, BbcFixturesResponse } from './types';
import {
  parseCompletedEvent,
  parseCompletedWorldCupMatches,
} from './parse';

const samplePath = resolve(
  process.cwd(),
  'data/bbc-sample-completed.json',
);
const sample = JSON.parse(readFileSync(samplePath, 'utf8')) as BbcFixturesResponse;

describe('parseCompletedWorldCupMatches', () => {
  it('parses completed World Cup matches from sample data', () => {
    const results = parseCompletedWorldCupMatches(sample);
    const completed = results.filter((r) => r.ok);
    assert.equal(completed.length, 2);
  });

  it('parses 2022 final with penalties and extra time', () => {
    const results = parseCompletedWorldCupMatches(sample);
    const final = results.find(
      (r) => r.ok && r.data.home_team === 'ARG' && r.data.away_team === 'FRA',
    );
    assert.ok(final?.ok);
    assert.equal(final.data.home_score, 3);
    assert.equal(final.data.away_score, 3);
    assert.equal(final.data.home_penalties_score, 4);
    assert.equal(final.data.away_penalties_score, 2);
    assert.equal(final.data.went_to_extra_time, true);
    assert.equal(final.data.stage, 'Final');
  });

  it('parses semi-final won in 90 minutes', () => {
    const results = parseCompletedWorldCupMatches(sample);
    const semi = results.find(
      (r) => r.ok && r.data.home_team === 'ARG' && r.data.away_team === 'CRO',
    );
    assert.ok(semi?.ok);
    assert.equal(semi.data.home_score, 3);
    assert.equal(semi.data.away_score, 0);
    assert.equal(semi.data.home_penalties_score, null);
    assert.equal(semi.data.away_penalties_score, null);
    assert.equal(semi.data.went_to_extra_time, false);
    assert.equal(semi.data.stage, 'Semi-finals');
  });
});

describe('parseCompletedEvent', () => {
  it('ignores PreEvent fixtures', () => {
    const preEvent: BbcEvent = {
      home: { fullName: 'South Korea' },
      away: { fullName: 'Czech Republic' },
      startDateTime: '2026-06-12T02:00:00Z',
      status: 'PreEvent',
      round: { name: 'Group A' },
    };
    const result = parseCompletedEvent(preEvent);
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.reason, 'not completed');
    }
  });
});
