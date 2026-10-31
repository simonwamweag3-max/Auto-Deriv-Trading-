import test from "node:test";
import assert from "node:assert/strict";
import {encryptSecret,decryptSecret} from "../src/security/crypto.js";

test("Deriv tokens encrypt and decrypt with authenticated AES-GCM",()=>{
  process.env.TOKEN_ENCRYPTION_KEY="0123456789abcdef".repeat(4);
  const token="deriv-personal-access-token-test-value";
  const ciphertext=encryptSecret(token);
  assert.notEqual(ciphertext,token);
  assert.equal(decryptSecret(ciphertext),token);
  const parts=ciphertext.split(".");
  parts[1]=Buffer.alloc(16).toString("base64");
  assert.throws(()=>decryptSecret(parts.join(".")));
});

test("token encryption rejects a missing or malformed key",()=>{
  const previous=process.env.TOKEN_ENCRYPTION_KEY;
  process.env.TOKEN_ENCRYPTION_KEY="invalid";
  assert.throws(()=>encryptSecret("secret"),/64 hexadecimal/);
  if(previous===undefined)delete process.env.TOKEN_ENCRYPTION_KEY;else process.env.TOKEN_ENCRYPTION_KEY=previous;
});
