/**
 * Seed script — push mock data into Supabase.
 * Run once: node scripts/seed-supabase.js
 *
 * Reads .env.local for Supabase credentials.
 */
require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");
const { getMockData } = require("../src/lib/data/mock");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

const BATCH_SIZE = 500;

async function insertBatch(table, rows) {
  if (!rows || rows.length === 0) return 0;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const chunk = rows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from(table).insert(chunk);
    if (error) {
      console.error(`❌ Error inserting into ${table}:`, error.message);
      throw error;
    }
  }
  return rows.length;
}

async function seed() {
  console.log("Seeding Supabase from mock data...");
  const mock = getMockData();

  const rows = await insertBatch("stocks", mock.stocks);
  console.log("✅ stocks:", rows);

  const salesRows = await insertBatch("sales", mock.sales);
  console.log("✅ sales:", salesRows);

  const expensesRows = await insertBatch("expenses", mock.expenses);
  console.log("✅ expenses:", expensesRows);

  const incomesRows = await insertBatch("incomes", mock.incomes);
  console.log("✅ incomes:", incomesRows);

  const purchasesRows = await insertBatch("purchases", mock.purchases);
  console.log("✅ purchases:", purchasesRows);

  const iklansRows = await insertBatch("iklans", mock.iklans);
  console.log("✅ iklans:", iklansRows);

  console.log("\n🎉 Seeding complete!");
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
