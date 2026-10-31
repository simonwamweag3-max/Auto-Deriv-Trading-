import {Router} from "express";
export const router=Router();
router.get("/health",(_,res)=>res.json({ok:true,mode:process.env.ENABLE_LIVE_TRADING==="true"?"LIVE_ENABLED_BY_OPERATOR":"LIVE_DISABLED"}));
