const endpoints = ["/login", "/legal/privacy", "/legal/terms"];

async function run() {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  for (const endpoint of endpoints) {
    const response = await fetch(`${base}${endpoint}`);
    if (!response.ok) {
      throw new Error(`Smoke test failed for ${endpoint}: ${response.status}`);
    }
  }
  console.log("Smoke tests passed.");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
