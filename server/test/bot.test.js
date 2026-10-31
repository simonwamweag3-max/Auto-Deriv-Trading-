import test from "node:test";
import assert from "node:assert/strict";
import {DerivDigitBot} from "../src/engine/DerivDigitBot.js";

test("live mode refuses to start without an execution adapter",()=>{
  assert.throws(()=>new DerivDigitBot({userId:"user-1",mode:"LIVE"}),/execution adapter/);
});

test("settlement updates risk only for a tracked open contract",()=>{
  const bot=new DerivDigitBot({userId:"user-1",mode:"LIVE",executeOrder:async()=>({contractId:"123"})});
  bot.openContracts.set("123",{id:"trade-1"});
  const risk=bot.settleContract("123",-1);
  assert.equal(risk.trades,1);
  assert.equal(risk.consecutiveLosses,1);
  assert.equal(bot.settleContract("not-open",1),null);
});
