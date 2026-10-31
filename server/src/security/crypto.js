import crypto from "node:crypto";
const keyText=process.env.TOKEN_ENCRYPTION_KEY||"";
function key(){if(!/^[a-f0-9]{64}$/i.test(keyText))throw new Error("TOKEN_ENCRYPTION_KEY must be 64 hexadecimal characters (32 bytes).");return Buffer.from(keyText,"hex");}
export function encryptSecret(value){const iv=crypto.randomBytes(12),cipher=crypto.createCipheriv("aes-256-gcm",key(),iv);const encrypted=Buffer.concat([cipher.update(value,"utf8"),cipher.final()]);return [iv.toString("base64"),cipher.getAuthTag().toString("base64"),encrypted.toString("base64")].join(".");}
export function decryptSecret(value){const [iv,tag,data]=String(value).split(".");const decipher=crypto.createDecipheriv("aes-256-gcm",key(),Buffer.from(iv,"base64"));decipher.setAuthTag(Buffer.from(tag,"base64"));return Buffer.concat([decipher.update(Buffer.from(data,"base64")),decipher.final()]).toString("utf8");}
