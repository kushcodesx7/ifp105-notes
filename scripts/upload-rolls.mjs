#!/usr/bin/env node
// Upload all sections under the 2025-2026 batch to Supabase
// Run: node scripts/upload-rolls.mjs
//
// Requires:
//   - ADMIN_PASSWORD set in .env.local
//   - Dev server running on http://localhost:3000
//   - SQL migration already applied (section column exists)
//   - Batch '2025-2026' already created via SQL migration

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
const BATCH_ID = "2025-2026"; // All sections belong to this one batch

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
  console.log(`🚀 Uploading ${data.batches.length} sections under batch '${BATCH_ID}' to ${API_BASE}\n`);

  let totalRolls = 0;

  for (const section of data.batches) {
    console.log(`\n📦 Section: ${section.name} (${section.rolls.length} students)`);

    // Add rolls for this section under the main batch. Sending the full
    // {enrollment_no, name} objects so the teacher-verified names land in
    // roll_list.name — used by /admin/people to show "Xusanova Laylo"
    // instead of the auto-generated "201_laylo" display name. The API
    // accepts either plain strings (legacy) or these objects (new).
    const rollsToAdd = section.rolls.map((r) => ({
      enrollment_no: r.enrollment_no,
      name: r.name ?? null,
    }));
    const addRolls = await request({
      action: "add-rolls",
      batchId: BATCH_ID,
      section: section.name,
      rolls: rollsToAdd,
    });

    if (!addRolls.ok) {
      console.error(`   ❌ Failed: ${addRolls.json.error || addRolls.json.raw}`);
    } else {
      console.log(`   ✅ Added ${rollsToAdd.length} rolls to ${section.name}`);
      totalRolls += rollsToAdd.length;
    }
  }

  console.log(`\n\n🎉 Done! Uploaded ${totalRolls} total rolls to batch '${BATCH_ID}'.`);
  console.log("Check /admin/batch-progress to verify.");
}

main().catch((err) => {
  console.error("❌ Fatal error:", err);
  process.exit(1);
});
