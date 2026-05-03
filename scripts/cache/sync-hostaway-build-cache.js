const { syncHostawayCache } = require("../../netlify/functions/hostaway-sync");

async function main() {
  if (!process.env.HOSTAWAY_ID || !process.env.HOSTAWAY_SECRET) {
    console.log("[hostaway-cache] skipped: HOSTAWAY_ID/HOSTAWAY_SECRET not set");
    return;
  }

  try {
    const payload = await syncHostawayCache();
    console.log(`[hostaway-cache] refreshed ${payload.properties.length} properties before build`);
  } catch (error) {
    console.warn(`[hostaway-cache] skipped: ${error.message}`);
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.warn(`[hostaway-cache] skipped: ${error.message}`);
  });
}
