#!/usr/bin/env node
/**
 * Generate Supabase JWT keys for self-hosting.
 *
 * Usage:
 *   node scripts/generate-keys.js
 *   node scripts/generate-keys.js --secret "my-custom-32-char-secret"
 *
 * The script prints the three values you need to paste into your .env file:
 *   JWT_SECRET, ANON_KEY, SERVICE_ROLE_KEY
 *
 * Requires Node.js 18+ (uses built-in crypto and subtle).
 */

import crypto from "node:crypto";

// ── helpers ──────────────────────────────────────────────────────────────────

function base64url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

async function signJwt(payload, secret) {
  const header = { alg: "HS256", typ: "JWT" };
  const headerB64 = base64url(JSON.stringify(header));
  const payloadB64 = base64url(JSON.stringify(payload));
  const signingInput = `${headerB64}.${payloadB64}`;

  const key = await crypto.subtle.importKey(
    "raw",
    Buffer.from(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const sig = await crypto.subtle.sign("HMAC", key, Buffer.from(signingInput));
  return `${signingInput}.${base64url(Buffer.from(sig))}`;
}

// ── main ─────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const secretIdx = args.indexOf("--secret");
const jwtSecret =
  secretIdx !== -1 && args[secretIdx + 1]
    ? args[secretIdx + 1]
    : crypto.randomBytes(32).toString("base64");

if (jwtSecret.length < 32) {
  console.error("ERROR: JWT_SECRET must be at least 32 characters long.");
  process.exit(1);
}

// Tokens that never expire (exp = year 2100) – rotate them when you want.
const FAR_FUTURE = Math.floor(new Date("2100-01-01").getTime() / 1000);

const anonKey = await signJwt(
  { iss: "supabase", role: "anon", exp: FAR_FUTURE },
  jwtSecret
);

const serviceKey = await signJwt(
  { iss: "supabase", role: "service_role", exp: FAR_FUTURE },
  jwtSecret
);

console.log("# Paste the following into your .env file:\n");
console.log(`JWT_SECRET=${jwtSecret}`);
console.log(`ANON_KEY=${anonKey}`);
console.log(`SERVICE_ROLE_KEY=${serviceKey}`);
