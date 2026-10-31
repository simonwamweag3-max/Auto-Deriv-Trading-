import{Router}from"express";import{nanoid}from"nanoid";import{DerivDigitBot}from"../engine/DerivDigitBot.js";import{DemoFeed}from"../engine/DemoFeed.js";
export const router=Router();const sessions=new Map();
router.get("/health",(_,res)=>res.json({ok:true,mode:"DEMO_ONLY"}));
router.post("/demo/sessions",(req,res)=>{const userId=String(req.body?.userId||nanoid());if(sessions.has(userId))return res.status(409).json({error:"Session already exists"});const events=[];const bot=new DerivDigitBot({userId,symbol:req.body?.symbol||"R_100",onEvent:e=>{events.push(e);if(events.length>250)events.shift();}});const feed=new DemoFeed(bot,Number(process.env.DEMO_TICK_INTERVAL_MS||350));sessions.set(userId,{bot,feed,events});res.status(201).json({userId,snapshot:bot.snapshot()});});
router.post("/demo/sessions/:id/start",(req,res)=>{const s=sessions.get(req.params.id);if(!s)return res.sendStatus(404);s.bot.start();s.feed.start();res.json(s.bot.snapshot());});
router.post("/demo/sessions/:id/stop",(req,res)=>{const s=sessions.get(req.params.id);if(!s)return res.sendStatus(404);s.feed.stop();s.bot.stop();res.json(s.bot.snapshot());});
router.get("/demo/sessions/:id",(req,res)=>{const s=sessions.get(req.params.id);if(!s)return res.sendStatus(404);res.json({snapshot:s.bot.snapshot(),events:s.events.slice(-60)});});
