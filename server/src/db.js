import pg from "pg";
const {Pool}=pg;
export const pool=process.env.DATABASE_URL?new Pool({connectionString:process.env.DATABASE_URL,ssl:process.env.PGSSL==="true"?{rejectUnauthorized:true}:undefined}):null;
export function requireDatabase(){if(!pool)throw Object.assign(new Error("Database is not configured. Set DATABASE_URL and run server/db/schema.sql."),{status:503});return pool;}
