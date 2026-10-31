import test from "node:test";
import assert from "node:assert/strict";
import { TickAnalyzer } from "../src/engine/TickAnalyzer.js";
import { RiskManager } from "../src/engine/RiskManager.js";

test("rolling analyzer keeps only the latest window", () => {
  const a = new TickAnalyzer(3);
  a.push(1); a.push(2); a.push(1); a.push(3);
  assert.deepEqual(a.ticks, [2,1,3]);
  assert.equal(a.snapshot().ready, true);
  assert.deepEqual(a.frequencies(), [0,100/3,100/3,100/3,0,0,0,0,0,0].map(x=>x));
});

test("risk manager pauses after two consecutive losses", () => {
  const r = new RiskManager({baseStake:2,multiplier:2});
  assert.equal(r.stake(),2);
  r.settle(-1);
  assert.equal(r.stake(),4);
  r.settle(-1);
  assert.equal(r.canTrade(),false);
  assert.equal(r.snapshot().reason,"MAX_CONSECUTIVE_LOSSES");
});

test("risk manager stops after six settlements", () => {
  const r = new RiskManager();
  for(let i=0;i<6;i++) r.settle(1);
  assert.equal(r.canTrade(),false);
  assert.equal(r.snapshot().reason,"MAX_SESSION_TRADES");
});
