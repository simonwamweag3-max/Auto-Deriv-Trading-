import {Router} from "express";
import bcrypt from "bcryptjs";
import {requireDatabase} from "../db.js";
import {signToken,requireAuth} from "./auth.js";
export const authRouter=Router();
authRouter.post("/register",async(req,res,next)=>{try{const email=String(req.body?.email||"").trim().toLowerCase(),password=String(req.body?.password||"");if(!/^\S+@\S+\.\S+$/.test(email)||password.length<10)return res.status(400).json({error:"Enter a valid email and a password of at least 10 characters."});const db=requireDatabase(),hash=await bcrypt.hash(password,12);const r=await db.query("INSERT INTO app_users(email,password_hash) VALUES($1,$2) RETURNING id,email",[email,hash]);res.status(201).json({token:signToken(r.rows[0]),user:r.rows[0]});}catch(e){if(e.code==="23505")return res.status(409).json({error:"An account with this email already exists."});next(e);}});
authRouter.post("/login",async(req,res,next)=>{try{const email=String(req.body?.email||"").trim().toLowerCase(),password=String(req.body?.password||"");const db=requireDatabase(),r=await db.query("SELECT id,email,password_hash FROM app_users WHERE email=$1",[email]);if(!r.rowCount||!await bcrypt.compare(password,r.rows[0].password_hash))return res.status(401).json({error:"Email or password is incorrect."});const user={id:r.rows[0].id,email:r.rows[0].email};res.json({token:signToken(user),user});}catch(e){next(e);}});
authRouter.get("/me",requireAuth,(req,res)=>res.json({user:{id:req.user.sub,email:req.user.email}}));
