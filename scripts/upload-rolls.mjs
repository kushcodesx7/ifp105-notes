#!/usr/bin/env node
// Upload all 6 sections to Supabase using admin API
// Run: node scripts/upload-rolls.mjs
//
// Requires:
//   ADMIN_PASSWORD set in .env.local
//   Dev server running on http://localhost:3000
//
// Uses the existing /api/batches/admin endpoint which supports:
//   - action: "add-batch"
//   - action: "add-rolls"

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env.local to get admin password
const envPath = path.join(__dirname, "..", ".env.local");
const envContent = fs.readFileSync(envPath, "utf8");
const adminPw = envContent
  .split("\n")
  .find((l) => l.startsWith("ADMIN_PASSWORD="))
  ?.split("=")[1]
  ?.trim();

if (!adminPw) {
  console.error("❌ ADMIN_PASSWORD not found in .env.local");
  process.exit(1);
}

// Read roll lists
const rollsPath = path.join(__dirname, "roll-lists.json");
const data = JSON.parse(fs.readFileSync(rollsPath, "utf8"));

const API_BASE = process.env.API_BASE || "http://localhost:3000";

async function request(body) {
  const res = await fetch(`${API_BASE}/api/batches/admin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-password": adminPw,
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }
  return { ok: res.ok, status: res.status, json };
}

async function main() {
  console.log(`🚀 Uploading ${data.batches.length} batches to ${API_BASE}\n`);

  for (const batch of data.batches) {
    console.log(`\n📦 Batch: ${batch.name} (${batch.rolls.length} students)`);

    // 1. Create batch (upsert)
    const addBatch = await request({
      action: "add-batch",
      id: batch.id,
      name: batch.name,
      accent: batch.accent,
    });

    if (!addBatch.ok) {
      // If batch already exists, that's fine — continue
      const err = addBatch.json.error || "";
      if (err.includes("duplicate") || err.includes("exists") || err.toLowerCase().includes("already")) {
        console.log(`   ℹ️  Batch "${batch.name}" already exists, continuing...`);
      } else {
        console.error(`   ❌ Failed to create batch: ${err}`);
        continue;
      }
    } else {
      console.log(`   ✅ Batch created`);
    }

    // 2. Add all roll numbers in one call
    const rollsToAdd = batch.rolls.map((r) => r.enrollment_no);
    const addRolls = await request({
      action: "add-rolls",
      batchId: batch.id,
      rolls: rollsToAdd,
    });

    if (!addRolls.ok) {
      console.error(`   ❌ Failed to add rolls: ${addRolls.json.error || addRolls.json.raw}`);
    } else {
      console.log(`   ✅ Added ${rollsToAdd.length} roll numbers`);
    }
  }

  console.log("\n\n🎉 Done! Check /admin/batches to verify.");
}

main().catch((err) => {
  console.error("❌ Fatal error:", err);
  process.exit(1);
});
