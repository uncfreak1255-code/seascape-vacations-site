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
  if (!html.includes(searchValue)) {
    throw new Error(`Missing expected pattern for ${label}`);
  }
  return html.replace(searchValue, replaceValue);
}

function upgradeBradentonVsSarasota() {
  const file = "bradenton-vs-sarasota.html";
  const trustBlock =
    '<p style="font-size:14px;color:#595959;margin:-8px 0 28px;"><strong>Why trust this comparison:</strong> Seascape Vacations manages homes across the Bradenton-Sarasota corridor, so this guide reflects the tradeoffs guests ask us about most often. Continue with our <a href="/guides/bradenton-area-guide/">Bradenton guide</a>, <a href="/guides/sarasota-area-guide/">Sarasota guide</a>, or compare actual <a href="/stays/anna-maria-island-vacation-rentals/">vacation rental options near Anna Maria Island</a>.</p>';

  let html = read(file);
  if (!html.includes("Why trust this comparison")) {
    html = replaceOnce(
      html,
      "Updated March 2026.</p></div><p>Bradenton and Sarasota sit just 15 miles apart",
      `Updated March 2026.</p></div>${trustBlock}<p>Bradenton and Sarasota sit just 15 miles apart`,
      `${file} trust block`
    );
  }

  write(file, html);
}

function upgradeAmiVsSiestaKey() {
  const file = "anna-maria-island-vs-siesta-key.html";
  const introBlock =
    '<div class="guide-intro" style="background:#f0f7f7;border-left:4px solid #5F8A8B;padding:1.25rem 1.5rem;margin:0 0 2rem;border-radius:0 8px 8px 0;font-size:16px;line-height:1.8;"><p style="margin:0 0 12px;"><strong>Direct answer:</strong> Anna Maria Island is usually the better choice for families, quieter beach days, and travelers who care more about charm than nightlife. Siesta Key is the better choice if your priority is famous quartz sand, a busier social scene, and easy access to Sarasota dining. The islands sit about 25 miles apart, and both are strong Gulf Coast picks, but they solve different vacation problems.</p><p style="margin:0;">The reason this comparison matters is that pricing, parking pressure, and beach atmosphere diverge fast in peak season. Siesta Key still carries the bigger national reputation thanks to its quartz sand and repeat rankings from <a href="https://www.tripadvisor.com/TravelersChoice-Beaches-cTop-g191" rel="nofollow">TripAdvisor</a>, while Anna Maria Island wins with lower-key neighborhoods, easier family logistics, and simpler day-to-day beach access. If you want the deeper planning layer next, use our <a href="/guides/anna-maria-island-area-guide/">Anna Maria Island guide</a>, <a href="/guides/siesta-key-area-guide/">Siesta Key guide</a>, and nearby <a href="/stays/vacation-rentals-near-siesta-key-beach/">stay options</a>.</p></div>';

  let html = read(file);
  if (!html.includes("Direct answer:")) {
    html = replaceOnce(
      html,
      '</section><article class="container section article-text"><p>Planning a Gulf Coast vacation and torn between Anna Maria Island and Siesta Key? You\'re not alone.',
      `</section><article class="container section article-text">${introBlock}<p>Planning a Gulf Coast vacation and torn between Anna Maria Island and Siesta Key? You're not alone.`,
      `${file} intro block`
    );
  }

  write(file, html);
}

function upgradeGuideIndex() {
  const file = "index.html";
  const startHere =
    '<section class="section" style="padding-top:0"><div class="section-card"><h2 class="section-title">Start Here</h2><p style="color:var(--stone-light);margin-bottom:16px;">These are the highest-value pages if you are comparing destinations, planning a direct booking, or evaluating Seascape as a local operator.</p><ul class="link-grid"><li><a href="/guides/bradenton-vs-sarasota/">Bradenton vs Sarasota</a></li><li><a href="/guides/anna-maria-island-vs-siesta-key/">Anna Maria Island vs Siesta Key</a></li><li><a href="/guides/booking-direct-vacation-rentals.html">Why Booking Direct Saves You Hundreds</a></li><li><a href="/property-management/">Property Management for Owners</a></li></ul></div></section>';

  let html = read(file);
  html = html
    .replace(
      'href=/property-management/vacation-rental-management-anna-maria-island/',
      'href="/property-management/"'
    )
    .replace('<a" class="btn" href="/">Book Direct</a>', '<a class="btn" href="/properties/">Browse Homes</a>');

  if (!html.includes(">Start Here<")) {
    html = replaceOnce(
      html,
      '</header><section class="section">',
      `</header>${startHere}<section class="section">`,
      `${file} start here section`
    );
  }

  write(file, html);
}

upgradeBradentonVsSarasota();
upgradeAmiVsSiestaKey();
upgradeGuideIndex();

console.log("upgrade-priority-guides: updated priority guide assets");
