import { readFileSync } from "fs";

const env = readFileSync(".env.local", "utf8");
for (const line of env.split("\n")) {
  const m = line.match(/^([^=#]+)=(.*)$/);
  if (m) process.env[m[1].trim()] = m[2].trim();
}

async function main() {
  const { runDailyBatch } = await import("./lib/pipeline.js");
  console.log("Running daily batch...");
  const result = await runDailyBatch();
  console.log("\n✅ DONE");
  console.log(JSON.stringify(result, null, 2));
}

main().catch((e) => {
  console.error("\n❌ FAILED:", e);
  process.exit(1);
});
