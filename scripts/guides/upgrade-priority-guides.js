const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "../../src/guides");

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function write(file, contents) {
  fs.writeFileSync(path.join(root, file), contents);
}

function replaceOnce(html, searchValue, replaceValue, label) {
  if (html.includes(replaceValue)) {
    return html;
  }

  if (!html.includes(searchValue)) {
    throw new Error(`Missing expected pattern for ${label}`);
  }

  return html.replace(searchValue, replaceValue);
}

function replaceRegexOnce(html, pattern, replaceValue, label) {
  if (pattern.test(html)) {
    return html.replace(pattern, replaceValue);
  }

  if (typeof replaceValue === "string" && html.includes(replaceValue)) {
    return html;
  }

  throw new Error(`Missing expected regex pattern for ${label}`);
}

function normalizeGuideLinks(html) {
  return html.replace(/href="(\/guides\/[^"]+)\.html"/g, 'href="$1/"');
}

function removeStickyBarAnimation(html) {
  return html
    .replace(
      /transform:translateY\(100%\);animation:slideUp \.4s ease \.5s forwards/g,
      "transform:none"
    )
    .replace(
      /<style>#sticky-book-bar\{transform:translateY\(100%\)\}@keyframes slideUp\{to\{transform:translateY\(0\)\}\}<\/style>/g,
      ""
    );
}

function upgradeArticleAuthor(html, label) {
  return replaceRegexOnce(
    html,
    /"author":\s*\{[\s\S]*?\},(\s*)"publisher"/,
    `"author": {
        "@type": "Person",
        "name": "Sawyer Beckett",
        "jobTitle": "Owner",
        "worksFor": {
            "@type": "Organization",
            "name": "Seascape Vacations",
            "url": "https://seascape-vacations.com"
        }
    },$1"publisher"`,
    `${label} article author`
  );
}

function upgradeBradentonVsSarasota() {
  const file = "bradenton-vs-sarasota.html";
  let html = read(file);

  html = replaceOnce(
    html,
    "<title>Bradenton vs Sarasota: Which Is Better for Your Vacation?</title>",
    "<title>Bradenton vs Sarasota: Which Is Better for Vacation?</title>",
    `${file} title`
  );
  html = replaceOnce(
    html,
    '<meta name="description" content="Bradenton is 25-35% cheaper than Sarasota with Anna Maria Island access. Side-by-side comparison of beaches, restaurants, nightlife, and vacation rental costs.">',
    '<meta name="description" content="Bradenton usually gives you lower nightly rates and easier Anna Maria Island access. Compare Bradenton vs Sarasota on beaches, dining, crowds, and which base fits your trip.">',
    `${file} meta description`
  );
  html = replaceOnce(
    html,
    '<meta name="author" content="Seascape Vacations">',
    '<meta name="author" content="Sawyer Beckett">',
    `${file} meta author`
  );
  html = replaceOnce(
    html,
    '<meta property="og:title" content="Bradenton vs Sarasota: Which Is Better for Your Vacation?">',
    '<meta property="og:title" content="Bradenton vs Sarasota: Which Is Better for Vacation?">',
    `${file} og title`
  );
  html = replaceOnce(
    html,
    '<meta property="og:description" content="Bradenton runs 25-35% cheaper with Anna Maria Island beach access. Costs, dining, nightlife, and lifestyle compared by a local rental manager.">',
    '<meta property="og:description" content="Bradenton is usually the better value base. Compare Bradenton vs Sarasota on cost, beaches, dining, and where your stay budget stretches further.">',
    `${file} og description`
  );
  html = replaceOnce(
    html,
    '<meta name="twitter:title" content="Bradenton vs Sarasota: Which Is Better for Your Vacation?">',
    '<meta name="twitter:title" content="Bradenton vs Sarasota: Which Is Better for Vacation?">',
    `${file} twitter title`
  );
  html = replaceOnce(
    html,
    '<meta name="twitter:description" content="Bradenton runs 25-35% cheaper with Anna Maria Island beach access. Costs, dining, nightlife, and lifestyle compared by a local rental manager.">',
    '<meta name="twitter:description" content="Bradenton is usually the better value base. Compare Bradenton vs Sarasota on cost, beaches, dining, and where your stay budget stretches further.">',
    `${file} twitter description`
  );
  html = replaceOnce(
    html,
    '"headline": "Bradenton vs Sarasota: Which Florida City Is Better?"',
    '"headline": "Bradenton vs Sarasota: Which Is Better for Vacation?"',
    `${file} article headline`
  );
  html = replaceOnce(
    html,
    '"description": "Comprehensive comparison of Bradenton and Sarasota covering beaches, cost of living, dining, nightlife, and which is better for families, retirees, and vacationers."',
    '"description": "Local comparison of Bradenton and Sarasota using Gulf Coast booking experience, U.S. Census data, public beach rankings, and first-party rate checks from March 2026."',
    `${file} article description`
  );
  html = replaceOnce(
    html,
    '"name": "Bradenton vs Sarasota: Which Florida City Is Better for Vacation?"',
    '"name": "Bradenton vs Sarasota: Which Is Better for Vacation?"',
    `${file} webpage name`
  );
  html = replaceOnce(
    html,
    '"dateModified": "2026-03-15T12:00:00-04:00"',
    '"dateModified": "2026-03-18T12:00:00-04:00"',
    `${file} date modified`
  );
  html = upgradeArticleAuthor(html, file);

  html = replaceRegexOnce(
    html,
    /<section class="hero">[\s\S]*?<h2>Quick Comparison<\/h2>/,
    `<section class="hero"><span class="hero-badge">⚖️ City Comparison</span><h1>Bradenton vs Sarasota:<br>Costs, Beaches, Dining, and Where to Stay</h1><p style="display:inline-block;background:#5F8A8B;color:#fff;font-size:0.85rem;padding:4px 12px;border-radius:4px;margin:8px 0 16px;font-weight:600;">Updated March 2026</p><p>A local comparison of Bradenton and Sarasota covering nightly rates, beach access, dining, crowds, and which base makes more sense for your trip.</p></section><article class="container section article-text"><div class="guide-intro" style="background:#f0f7f7;border-left:4px solid #5F8A8B;padding:1.25rem 1.5rem;margin:0 0 2rem;border-radius:0 8px 8px 0;font-size:16px;line-height:1.8;"><p style="margin:0 0 12px;"><strong>Direct answer:</strong> Bradenton is usually the better base if you care about lower nightly rates, easier parking, and faster access to Anna Maria Island. Sarasota is the better choice if polished dining, arts access, and a more upscale city feel matter more than budget.</p><p style="margin:0;">We built this comparison from March 2026 rate checks across Seascape-managed inventory, guest questions from homes we manage across the corridor, <a href="https://data.census.gov/profile/Bradenton_city,_Florida?g=160XX00US1207950" rel="nofollow">U.S. Census</a> city data, and public beach and attraction benchmarks such as <a href="https://www.tripadvisor.com/TravelersChoice-Beaches-cTop-g191" rel="nofollow">TripAdvisor beach rankings</a>.</p></div><div class="guide-author-card" data-guide-author="sawyer-beck" style="background:#fff;border:1px solid #d9e5e5;border-radius:16px;padding:18px 20px;margin:0 0 20px;"><p style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#5F8A8B;margin:0 0 6px;">Reviewed by</p><p style="font-weight:700;color:#3D5C5D;margin:0 0 6px;">Sawyer Beckett</p><p style="margin:0;color:#595959;font-size:14px;line-height:1.7;">Owner of Seascape Vacations, based in Bradenton and managing homes across Bradenton, Anna Maria Island, and Sarasota.</p></div><div class="evidence-card" style="background:#fff;border:1px solid #d9e5e5;border-radius:16px;padding:20px;margin:0 0 28px;"><h2 style="font-size:20px;color:#3D5C5D;margin:0 0 12px;">Why trust this comparison:</h2><ul style="margin:0;padding-left:20px;line-height:1.8;"><li>March 2026 rate checks across Seascape-managed homes on the Bradenton and Sarasota sides of the corridor</li><li><a href="https://data.census.gov/profile/Bradenton_city,_Florida?g=160XX00US1207950" rel="nofollow">U.S. Census</a> city data plus public attraction references already cited in this guide</li><li><a href="https://www.tripadvisor.com/TravelersChoice-Beaches-cTop-g191" rel="nofollow">TripAdvisor beach rankings</a> and public park or museum sources linked below</li></ul></div><p>Bradenton usually fits travelers who want the beach-first version of this corridor: easier Anna Maria Island access, quieter neighborhoods, and a lower total trip cost. Sarasota usually fits travelers who want the restaurant-and-culture version: Siesta Key, downtown dining, and stronger arts infrastructure.</p><p>The real tradeoff is not distance. It is what kind of friction you want. Bradenton reduces cost and crowd pressure. Sarasota buys you polish and nightlife.</p><h2>Quick Comparison</h2>`,
    `${file} opening rewrite`
  );

  html = normalizeGuideLinks(html);
  html = removeStickyBarAnimation(html);
  write(file, html);
}

function upgradeAmiVsSiestaKey() {
  const file = "anna-maria-island-vs-siesta-key.html";
  let html = read(file);

  html = replaceOnce(
    html,
    "<title>Anna Maria Island vs Siesta Key: Honest Beach Comparison</title>",
    "<title>Anna Maria Island vs Siesta Key: Beaches, Crowds, Parking, and Where to Stay</title>",
    `${file} title`
  );
  html = replaceOnce(
    html,
    '<meta name="description" content="Anna Maria Island has the small-town charm; Siesta Key has the famous quartz sand. We compare beaches, dining, costs, and which is better for families.">',
    '<meta name="description" content="Anna Maria Island is quieter and easier for families. Siesta Key has the famous quartz sand and busier social scene. Compare beaches, parking, dining, and costs.">',
    `${file} meta description`
  );
  html = replaceOnce(
    html,
    '<meta name="author" content="Seascape Vacations">',
    '<meta name="author" content="Sawyer Beckett">',
    `${file} meta author`
  );
  html = replaceOnce(
    html,
    '<meta property="og:title" content="Anna Maria Island vs Siesta Key: Honest Beach Comparison">',
    '<meta property="og:title" content="Anna Maria Island vs Siesta Key: Beaches, Crowds, Parking, and Where to Stay">',
    `${file} og title`
  );
  html = replaceOnce(
    html,
    '<meta property="og:description" content="Siesta Key has #1-ranked sand. AMI has no high-rises and 30% lower prices. We compare beaches, dining, nightlife and family-friendliness.">',
    '<meta property="og:description" content="Anna Maria Island is quieter and easier for families. Siesta Key has the famous quartz sand and busier nightlife. Compare beaches, parking, dining, and costs.">',
    `${file} og description`
  );
  html = replaceOnce(
    html,
    '<meta name="twitter:title" content="Anna Maria Island vs Siesta Key: Honest Beach Comparison">',
    '<meta name="twitter:title" content="Anna Maria Island vs Siesta Key: Beaches, Crowds, Parking, and Where to Stay">',
    `${file} twitter title`
  );
  html = replaceOnce(
    html,
    '<meta name="twitter:description" content="Siesta Key has #1-ranked sand. AMI has no high-rises and 30% lower prices. We compare beaches, dining, nightlife and family-friendliness.">',
    '<meta name="twitter:description" content="Anna Maria Island is quieter and easier for families. Siesta Key has the famous quartz sand and busier nightlife. Compare beaches, parking, dining, and costs.">',
    `${file} twitter description`
  );
  html = replaceOnce(
    html,
    '"headline": "Anna Maria Island vs Siesta Key: Which Beach Is Better for Your Vacation?"',
    '"headline": "Anna Maria Island vs Siesta Key: Beaches, Crowds, Parking, and Where to Stay"',
    `${file} article headline`
  );
  html = replaceOnce(
    html,
    '"description": "A comprehensive comparison of Anna Maria Island and Siesta Key covering beaches, dining, activities, family-friendliness, and vacation rental prices."',
    '"description": "Local comparison of Anna Maria Island and Siesta Key using Gulf Coast booking experience, public beach rankings, and first-party rate checks from March 2026."',
    `${file} article description`
  );
  html = replaceOnce(
    html,
    '"name": "Anna Maria Island vs Siesta Key: Which Beach Is Better?"',
    '"name": "Anna Maria Island vs Siesta Key: Beaches, Crowds, Parking, and Where to Stay"',
    `${file} webpage name`
  );
  html = replaceOnce(
    html,
    '"dateModified": "2026-03-15T12:00:00-04:00"',
    '"dateModified": "2026-03-18T12:00:00-04:00"',
    `${file} date modified`
  );
  html = upgradeArticleAuthor(html, file);
  html = replaceRegexOnce(
    html,
    /"cssSelector": \[\s*"\.article-text > p:first-of-type",\s*"meta\[name=description\]"\s*\]/,
    `"cssSelector": [
            ".guide-intro",
            "meta[name=description]"
        ]`,
    `${file} speakable selector`
  );

  html = replaceRegexOnce(
    html,
    /<section class="hero">[\s\S]*?<h2>Quick Comparison at a Glance<\/h2>/,
    `<section class="hero"><span class="hero-badge">🏖️ Destination Comparison</span><h1>Anna Maria Island vs Siesta Key<br>Beaches, Crowds, Parking, and Where to Stay</h1><p style="display:inline-block;background:#5F8A8B;color:#fff;font-size:0.85rem;padding:4px 12px;border-radius:4px;margin:8px 0 16px;font-weight:600;">Updated March 2026</p><p>A local comparison of Anna Maria Island and Siesta Key covering beach vibe, parking pressure, dining access, and where your stay budget stretches further.</p></section><article class="container section article-text"><div class="guide-intro" style="background:#f0f7f7;border-left:4px solid #5F8A8B;padding:1.25rem 1.5rem;margin:0 0 2rem;border-radius:0 8px 8px 0;font-size:16px;line-height:1.8;"><p style="margin:0 0 12px;"><strong>Direct answer:</strong> Anna Maria Island is usually the better choice for families, quieter beach days, and travelers who care more about easy logistics than buzz. Siesta Key is the better choice if you want the most famous sand, a busier social scene, and faster access to Sarasota dining.</p><p style="margin:0;">We built this comparison from March 2026 rate checks across Seascape-managed inventory, guest questions from families staying in the corridor, and public beach benchmarks such as <a href="https://www.tripadvisor.com/TravelersChoice-Beaches-cTop-g191" rel="nofollow">TripAdvisor</a> and <a href="http://drbeach.org/" rel="nofollow">Dr. Beach</a>.</p></div><div class="guide-author-card" data-guide-author="sawyer-beck" style="background:#fff;border:1px solid #d9e5e5;border-radius:16px;padding:18px 20px;margin:0 0 20px;"><p style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#5F8A8B;margin:0 0 6px;">Reviewed by</p><p style="font-weight:700;color:#3D5C5D;margin:0 0 6px;">Sawyer Beckett</p><p style="margin:0;color:#595959;font-size:14px;line-height:1.7;">Owner of Seascape Vacations, based in Bradenton and managing homes used by guests comparing Anna Maria Island, Bradenton, Sarasota, and Siesta Key.</p></div><div class="evidence-card" style="background:#fff;border:1px solid #d9e5e5;border-radius:16px;padding:20px;margin:0 0 28px;"><h2 style="font-size:20px;color:#3D5C5D;margin:0 0 12px;">What This Comparison Uses</h2><ul style="margin:0;padding-left:20px;line-height:1.8;"><li>March 2026 rate checks across Seascape-managed homes near Anna Maria Island, mainland Bradenton, and the Sarasota side of the corridor</li><li><a href="https://www.tripadvisor.com/TravelersChoice-Beaches-cTop-g191" rel="nofollow">TripAdvisor</a> and <a href="http://drbeach.org/" rel="nofollow">Dr. Beach</a> beach recognition data already cited in this guide</li><li>Repeated guest questions about parking, beach atmosphere, and dining access from trips that weigh both islands</li></ul></div><p>Anna Maria Island usually fits travelers who want calmer neighborhoods, easier family logistics, and a less frantic beach day. Siesta Key usually fits travelers who want status, nightlife, and the widest dining options once the beach ends.</p><p>The deciding factor is rarely sand quality alone. It is whether you want a quieter trip with less friction or a busier trip with more scene.</p><h2>Quick Comparison at a Glance</h2>`,
    `${file} opening rewrite`
  );

  html = normalizeGuideLinks(html);
  html = removeStickyBarAnimation(html);
  write(file, html);
}

function upgradeGuideIndex() {
  const file = "index.html";
  let html = read(file);

  html = html
    .replace(
      'href=/property-management/vacation-rental-management-anna-maria-island/',
      'href="/property-management/"'
    )
    .replace('<a" class="btn" href="/">Book Direct</a>', '<a class="btn" href="/properties/">Browse Homes</a>');

  write(file, html);
}

upgradeBradentonVsSarasota();
upgradeAmiVsSiestaKey();
upgradeGuideIndex();

console.log("upgrade-priority-guides: updated priority guide assets");
