const fs = require("fs");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");

const projectRoot = path.resolve(__dirname, "..", "..");
const stayPages = JSON.parse(
  fs.readFileSync(path.join(projectRoot, "src", "_data", "seoPages.json"), "utf8")
).vacationer;

function getStayPage(slug) {
  const page = stayPages.find((entry) => entry.slug === slug);
  assert.ok(page, `missing stay page ${slug}`);
  return page;
}

test("stays template exposes the shared modules required for money-page landers", () => {
  const staysTemplate = fs.readFileSync(path.join(projectRoot, "src", "stays", "stays.njk"), "utf8");

  for (const marker of [
    "seoPage.tripMatchCards",
    "seoPage.valueComparison",
    "seoPage.relatedGuideLinks",
    "This trip fits best when",
    "How this stay path compares",
    "Use these guides before you book"
  ]) {
    assert.equal(staysTemplate.includes(marker), true, `stays template missing ${marker}`);
  }
});

test("priority AMI stay money pages carry trip-match, value-comparison, and guide-routing data", () => {
  for (const slug of [
    "anna-maria-island-vacation-rentals",
    "anna-maria-island-beachfront-rentals"
  ]) {
    const page = getStayPage(slug);

    assert.equal(Array.isArray(page.tripMatchCards), true, `${slug} missing tripMatchCards`);
    assert.equal(page.tripMatchCards.length >= 3, true, `${slug} should carry at least 3 tripMatchCards`);
    assert.equal(typeof page.valueComparison, "object", `${slug} missing valueComparison`);
    assert.equal(Array.isArray(page.valueComparison?.rows), true, `${slug} missing valueComparison rows`);
    assert.equal(page.valueComparison.rows.length >= 3, true, `${slug} should carry at least 3 valueComparison rows`);
    assert.equal(Array.isArray(page.relatedGuideLinks), true, `${slug} missing relatedGuideLinks`);
    assert.equal(page.relatedGuideLinks.length >= 3, true, `${slug} should carry at least 3 relatedGuideLinks`);
  }
});

test("AMI beachfront page stays honest about near-island positioning instead of faking walk-out beachfront inventory", () => {
  const beachfrontPage = getStayPage("anna-maria-island-beachfront-rentals");
  const serialized = JSON.stringify(beachfrontPage).toLowerCase();

  assert.match(
    serialized,
    /(12-25 minutes|12\u201325 minutes|not directly on the beach|not directly on the sand|off-island|near-island)/,
    "beachfront page should explicitly explain the near-island tradeoff"
  );

  assert.equal(
    beachfrontPage.matchingProperties.includes("sarasota-luxe"),
    false,
    "beachfront alternative should not feature Sarasota Luxe as an AMI beach-base fit"
  );

  assert.equal(
    Array.isArray(beachfrontPage.propertyFacts),
    true,
    "beachfront alternative should expose source-backed beach distance facts"
  );
  assert.equal(beachfrontPage.propertyFacts.length >= 3, true);
  assert.match(serialized, /2\.9 mi|5\.4 mi|about 5 mi \/ 15 min/);
});

test("AMI vacation rentals page does not promise free water-sports gear that is not actually included", () => {
  const amiPage = getStayPage("anna-maria-island-vacation-rentals");
  const serialized = JSON.stringify(amiPage).toLowerCase();

  for (const staleClaim of [
    "complimentary kayaks",
    "complimentary beach gear, kayaks, and fishing equipment",
    "we also provide complimentary beach gear, kayaks, and fishing equipment"
  ]) {
    assert.equal(serialized.includes(staleClaim), false, `AMI stay page should not include ${staleClaim}`);
  }
});

test("AMI comparison and planning guides route into the rebuilt AMI stay money pages", () => {
  const guides = [
    "src/guides/anna-maria-island-vs-siesta-key.html",
    "src/guides/siesta-key-vs-a[K[X\љXKZ\Ы[™Y[Z[Y\Лљ[‹€њЬЛЩЭZY\ЛШ™\Э][YK]љ\Ъ]X[›K[X\љXKZ\Ы[™љ[‚€NВ‚€›Ь€
ЫЫњЭЭZYHЩ€ЭZY\КHВ€ЫЫњЭЫЭ\ЩHHњЛњ™XYљ[TЮ[К]љ›Ъ[Љ›Ъ™XЭ›ЫЭЭZYJKќ]ЋЉNВ‚€›Ь€
ЫЫњЭ™Y€Щ€В€‹ЬЭ^\ЛШ[›K[X\љXKZ\Ы[™]XШ][Ы‹\™[ќ[ЛИ‹€‹ЬЭ^\ЛШ[›K[X\љXKZ\Ы[™X™XXЪњ›Ыќ\™[ќ[ЛИ‚€JHВ€\ЬЩ\ќ™\]X[
ЫЭ\ЩKљ[ЫY\К™YЉKќYK	ЩЭZY_HЪЭ[[ЫYH	Ъ™YџX
NВ€B€BџJNВ‚ќ\Э
™\Э][YHЭZYH^ЬЩ\И[€X\›HXЪЩYЩX\ЫЫ[Э^HЪЪXЩH‹

HO€В€ЫЫњЭЭZYT]H]љ›Ъ[Љ€›Ъ™XЭ›ЫЭ€њЬИ‹€™ЭZY\И‹€™\Э][YK]љ\Ъ]X[›K[X\љXKZ\Ы[™љ[‚€
NВ€ЫЫњЭЫЭ\ЩHHњЛњ™XYљ[TЮ[КЭZYT]ќ]ЋЉNВ€ЫЫњЭXЪ\Ъ[Ы”Э\™XЩHHЫЭ\ЩK›X]Ъ
€ПЩXЭ[Ы–ЧЏ—J™]K\ЩX\ЫЫ‹\Э^KXЪЪXЩVЧЏ—JЏ–ЧЧЧJЏПЬЩXЭ[ЫЏ‹В€
NВ‚€\ЬЩ\ќ›ЪКXЪ\Ъ[Ы”Э\™XЩK™\Э][YHЭZYHЪЭ[^ЬЩH]K\ЩX\ЫЫ‹\Э^KXЪЪXЩHЉNВ‚€›Ь€
ЫЫњЭ™Y€Щ€В€‹ЬЭ^\ЛШ[›K[X\љXKZ\Ы[™]XШ][Ы‹\™[ќ[ЛИ‹€‹ЬЭ^\ЛШ[›K[X\љXKZ\Ы[™X™XXЪњ›Ыќ\™[ќ[ЛИ‚€JHВ€\ЬЩ\ќ›X]Ъ
XЪ\Ъ[Ы”Э\™XЩVМK™]И™YС^
™YЏVИ‰ЧIЪ™YџVИ‰ЧX
JNВ€B‚€\ЬЩ\ќ™\]X[
€
XЪ\Ъ[Ы”Э\™XЩVМK›X]Ъ
Щ]K]XЪЛY]™[ќH™ЭZYWШ›ЫЪЧЩ\™XЭШЫXЪИ‹ЩКHЧJK›[™Э€‹€›ЭЩX\ЫЫ[Э^HЪЪXЩ\ИЪЭ[[Z]ЭZYWШ›ЫЪЧЩ\™XЭШЫXЪИ‚€
NВ€\ЬЩ\ќ™\]X[
€
XЪ\Ъ[Ы”Э\™XЩVМK›X]Ъ
Щ]KYЭZYK\ЫYПH™\Э][YK]љ\Ъ]X[›K[X\љXKZ\Ы[™‹ЩКHЧJK›[™Э€‹€›ЭЩX\ЫЫ[Э^HЪЪXЩ\ИЪЭ[™]Z[€HЭZYHЫYИ‚€
NВ€\ЬЩ\ќ™\]X[
€
XЪ\Ъ[Ы”Э\™XЩVМK›X]Ъ
Щ]K\XЩ[Y[ќH™\ЭЭ[YWЬЩX\ЫЫ—ШЪЪXЩH‹ЩКHЧJK›[™Э€‹€›Ы›HHX\›HЩX\ЫЫ[ЪЪXЩ\ИЪЭ[Ш\њћHHШЫЬY™XYXЪИXЩ[Y[ќ‚€
NВ€\ЬЩ\ќ›X]Ъ
€XЪ\Ъ[Ы”Э\™XЩVМK€ЫЭ™\›\[™И™X\‹Z\Ы[™ЫY\ЦЧЧЧJ››Э\ИЩ\\]H[ќ™[ќЬћHЫЫЛЛ€ќH[Щ[H]\Э›Э[\H]HЫИ›Э]\И^ЬЩH\Э[Э[ќ™[ќЬћHЫЫИ‚€
NВџJNВ