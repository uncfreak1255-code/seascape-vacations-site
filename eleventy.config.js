const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

function formatDateLabel(isoString) {
  if (!isoString) return null;
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(isoString));
}

function toHostawayCdn(url, width = 800, quality = 82) {
  const value = String(url || "").trim();
  if (!value) return value;

  const cleanValue = value.split("?")[0];

  if (cleanValue.includes("bookingenginecdn.hostaway.com/")) {
    return `${cleanValue}?width=${width}&quality=${quality}&format=webp&v=2`;
  }

  const hostawayPrefix = "https://hostaway-platform.s3.us-west-2.amazonaws.com/";
  if (cleanValue.startsWith(hostawayPrefix)) {
    const assetPath = cleanValue.slice(hostawayPrefix.length);
    return `https://bookingenginecdn.hostaway.com/${assetPath}?width=${width}&quality=${quality}&format=webp&v=2`;
  }

  return value;
}

const ENTITY_COVERAGE_OUTPUT_PATHS = new Set([
  // Keep this list narrow to proven gaps from coverage checks.
  "/guides/index.html",
]);

const ORGANIZATION_ENTITY_SCHEMA = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Seascape Vacations",
  url: "https://seascape-vacations.com",
  logo: {
    "@type": "ImageObject",
    url: "https://seascape-vacations.com/logo-optimized.png",
  },
});

const SEO_PAGES_PATH = "src/_data/seoPages.json";

function hasEntityCoverageSchema(content) {
  return /"@type"\s*:\s*"(Organization|LocalBusiness)"/.test(content);
}

module.exports = function(eleventyConfig) {
  const root = process.cwd();
  const gitTimestampCache = new Map();
  const gitPatternTimestampCache = new Map();

  function readLatestGitTimestamp(...candidatePaths) {
    let latestTimestamp = null;

    for (const candidatePath of candidatePaths.flat().filter(Boolean)) {
      const resolvedPath = path.isAbsolute(candidatePath)
        ? candidatePath
        : path.join(root, candidatePath);

      if (!fs.existsSync(resolvedPath)) {
        continue;
      }

      let isoString = gitTimestampCache.get(resolvedPath);

      if (isoString === undefined) {
        try {
          const relativePath = path.relative(root, resolvedPath);
          isoString = execFileSync("git", ["log", "-1", "--format=%cI", "--", relativePath], {
            cwd: root,
            encoding: "utf8",
          }).trim();
        } catch {
          isoString = "";
        }

        if (!isoString) {
          isoString = new Date(fs.statSync(resolvedPath).mtimeMs).toISOString();
        }

        gitTimestampCache.set(resolvedPath, isoString);
      }

      if (!latestTimestamp || new Date(isoString) > new Date(latestTimestamp)) {
        latestTimestamp = isoString;
      }
    }

    return latestTimestamp;
  }

  function readLatestGitSearchTimestamp(pattern, candidatePath) {
    const cacheKey = `${pattern}\0${candidatePath}`;
    if (gitPatternTimestampCache.has(cacheKey)) {
      return gitPatternTimestampCache.get(cacheKey);
    }

    let isoString = "";
    try {
      const relativePath = path.relative(root, path.join(root, candidatePath));
      isoString = execFileSync(
        "git",
        ["log", "-1", "--format=%cI", `-S${pattern}`, "--", relativePath],
        { cwd: root, encoding: "utf8" }
      ).trim();
    } catch {
      isoString = "";
    }

    gitPatternTimestampCache.set(cacheKey, isoString || null);
    return isoString || null;
  }

  eleventyConfig.addNunjucksGlobal("gitLastModifiedIso", (...candidatePaths) =>
    readLatestGitTimestamp(...candidatePaths)
  );
  eleventyConfig.addNunjucksGlobal("gitLastModifiedDate", (...candidatePaths) => {
    const isoString = readLatestGitTiY\Ý[\
‹‹˜Ø[™Y]T]ÊNÂˆ™]\›ˆ\ÛÔÝš[™ÈÈ\ÛÔÝš[™ËœÛXÙJL
Hˆ[ÂˆJNÂˆ[]™[PÛÛ™šYË˜Y[šXÚÜÑÛØ˜[
™Ú]\Ý[ÙYšYYX™[‹
‹‹˜Ø[™Y]T]ÊHO‚ˆ›Ü›X]]SX™[
™XY]\ÝÚ][Y\Ý[\
‹‹˜Ø[™Y]T]ÊJBˆ
NÂ‚ˆ[˜Ý[Ûˆ]\Ý\ÛÔÝš[™Ê‹‹˜Ø[™Y]U[Y\Ý[\ÊHÂˆ]]\Ý[Y\Ý[\H[Âˆ›Üˆ
ÛÛœÝ\ÛÔÝš[™ÈÙˆØ[™Y]U[Y\Ý[\ÊHÂˆYˆ
ˆ\ÛÔÝš[™È	‰‚ˆ
[]\Ý[Y\Ý[\™]È]J\ÛÔÝš[™ÊHˆ™]È]J]\Ý[Y\Ý[\
JBˆ
HÂˆ]\Ý[Y\Ý[\H\ÛÔÝš[™ÎÂˆBˆBˆ™]\›ˆ]\Ý[Y\Ý[\ÂˆB‚ˆËÈ\‹Y[žHœ™\Ú™\ÜÈ›ÜˆH]KYš]™[ˆÝÛ™\ˆ[™Ý^HYÙ\ËˆH\ÝÜžBˆËÈØ[È
š\œÝ\\™[Ü™\š[™ËÚ[ÝËXÛÛ™HYÜ˜Y][Û‹˜]ÚY›Øˆ™XYÊBˆËÈ]™\È[ˆØÜš\ËÜÙ[ËÜÙ[Ë\YÙKZ\ÝÜžKšœÈÛÈH[™›Ü˜Ù[Y[ÝZ]HØ[‚ˆËÈ^\˜Ú\ÙH]YØZ[œÝÛÛ›ÛYš^\™H™\ÜÚ]ÜšY\Ë‚ˆËÂˆËÈ[X™\˜][H“Õ[˜ÛYYÚ[ˆ[žH\ÝÜžH^\ÝÎˆYÙK\™[]YÝ™\›^\ÂˆËÈÜˆÚ\™Y[\]KÙ]H[Y\Ý[\ËˆYX\Ý\™YYØZ[œÝH™X[]K›ÝˆËÈØ[ˆ™KY›][ˆÙ[™\˜]YYÙH˜[Z[Y\È[™™XÜ™X]HH^XÝYÈ\ÂˆËÈÚ[™ÙH^\ÝÈÈš^ˆHÚX›[™ÈØ\™	ÜÈ]HÙXZË[\]HY]Ü‚ˆËÈ˜[Z[K]ÚYH]HÝXÚ\È›ÝHYX[š[™Ù[Ú[™ÙHÈTÈYÙIÜÈš[X\žBˆËÈÛÛ[ÚXÚ\ÈÚ]Ú][X\\Ý[ÙÚYÛ˜[Ëˆ™[X\ÙKØZ[›ÛÙˆÛÝ™\œÂˆËÈÚ\™Y™[™\š[™ÈÚ[™Ù\ÎÈ\È[\ˆÙY\ÈÙ[™\˜]YÑSÈYÙH]\ÂˆËÈYÙKXÛÛ[\ÜXÚYšXË‚ˆÛÛœÝÈZ[Ù[ÔYÙR\ÝÜžNˆZ[Ù[ÔYÙQ[žR\ÝÜžHHBˆ™\]Z\™J‹‹ÜØÜš\ËÜÙ[ËÜÙ[Ë\YÙKZ\ÝÜžKšœÈŠNÂˆ]Ù[ÔYÙR\ÝÜžHH[Â‚ˆ[˜Ý[ÛˆÙ]Ù[ÔYÙR\ÝÜžJ
HÂˆYˆ
\Ù[ÔYÙR\ÝÜžJHÂˆÙ[ÔYÙR\ÝÜžHHZ[Ù[ÔYÙQ[žR\ÝÜžJÈÝÙˆ›ÛÝØ\›ŽˆÛÛœÛÛKØ\›ˆJNÂˆBˆ™]\›ˆÙ[ÔYÙR\ÝÜžNÂˆB‚ˆ[˜Ý[ÛˆÙ[ÔYÙU[Y\Ý[\
Ü›Ý\ÛYË‹‹™˜[˜XÚÔ]ÊHÂˆÛÛœÝ\ÝÜžHHÙ]Ù[ÔYÙR\ÝÜžJ
NÂˆÛÛœÝ]Q˜[˜XÚÈH\ÝÜžK™YÜ˜YYˆÈ™XY]\ÝÚ][Y\Ý[\
ÑS×ÔQÑT×ÔU
Bˆˆ[ÂˆÛÛœÝÛÝ™\›˜[˜ÙU[Y\Ý[\HÜ›Ý\OOH˜XØ][Û™\ˆ‚ˆÈ™XY]\ÝÚ]ÙX\˜Ú[Y\Ý[\
‰ÜÛYßH˜œÜ˜Ë×Ù]KÜÙ[ÑÛÝ™\›˜[˜ÙKšœÈŠBˆˆ[Â‚ˆ™]\›ˆ]\Ý\ÛÔÝš[™Êˆ\ÝÜžK™Ù]
	ÙÜ›Ý\KÉÜÛYßX
KˆÛÝ™\›˜[˜ÙU[Y\Ý[\ˆ]Q˜[˜XÚËˆ™XY]\ÝÚ][Y\Ý[\
‹‹™˜[˜XÚÔ]ÊBˆ
NÂˆB‚ˆ[]™[PÛÛ™šYË˜Y[šXÚÜÑÛØ˜[
œÙ[ÔYÙS\Ý[ÙYšYY\ÛÈ‹
Ü›Ý\ÛYË‹‹™˜[˜XÚÔ]ÊHO‚ˆÙ[ÔYÙU[Y\Ý[\
Ü›Ý\ÛYË‹‹™˜[˜XÚÔ]ÊBˆ
NÂˆ[]™[PÛÛ™šYË˜Y[šXÚÜÑÛØ˜[
œÙ[ÔYÙS\Ý[ÙYšYY]H‹
Ü›Ý\ÛYË‹‹™˜[˜XÚÔ]ÊHOˆÂˆÛÛœÝ\ÛÔÝš[™ÈHÙ[ÔYÙU[Y\Ý[\
Ü›Ý\ÛYË‹‹™˜[˜XÚÔ]ÊNÂˆ™]\›ˆ\ÛÔÝš[™ÈÈ\ÛÔÝš[™ËœÛXÙJL
Hˆ[ÂˆJNÂˆ[]™[PÛÛ™šYË˜Y[šXÚÜÑÛØ˜[
œÙ[ÔYÙS\Ý[ÙYšYYX™[‹
Ü›Ý\ÛYË‹‹™˜[˜XÚÔ]ÊHO‚ˆ›Ü›X]]SX™[
Ù[ÔYÙU[Y\Ý[\
Ü›Ý\ÛYË‹‹™˜[˜XÚÔ]ÊJBˆ
NÂ‚ˆËÈ\ÜÈ›ÝYÚÝ]XÈ\ÜÙ]È
™\Ù\™\ÈÝ\œ™[\ÚYÛŠBˆ[]™[PÛÛ™šYË˜Y\ÜÝ›ÝYÚÛÜJš[XYÙ\ÈŠNÂˆ[]™[PÛÛ™šYË˜Y\ÜÝ›ÝYÚÛÜJ˜ÜÜÈŠNÂˆ[]™[PÛÛ™šYË˜Y\ÜÝ›ÝYÚÛÜJÈœÜ˜ËØÜÜÈŽˆ˜ÜÜÈˆJNÂˆ[]™[PÛÛ™šYË˜Y\ÜÝ›ÝYÚÛÜJšœÈŠNÂˆ[]™[PÛÛ™šYË˜Y\ÜÝ›ÝYÚÛÜJš\›Ë[Ü[Z^™YšœÈŠNÂˆ[]™[PÛÛ™šYË˜Y\ÜÝ›ÝYÚÛÜJš\›Ë[[Øš[KšœÈŠNÂˆ[]™[PÛÛ™šYË˜Y\ÜÝ›ÝYÚÛÜJŠ‹œ™ÈŠNÂˆ[]™[PÛÛ™šYË˜Y\ÜÝ›ÝYÚÛÜJŠ‹ÙXœŠNÂˆ[]™[PÛÛ™šYË˜Y\ÜÝ›ÝYÚÛÜJŠ‹˜]šYˆŠNÂˆ[]™[PÛÛ™šYË˜Y\ÜÝ›ÝYÚÛÜJ—ÚXY\œÈŠNÂˆ[]™[PÛÛ™šYË˜Y\ÜÝ›ÝYÚÛÜJÈœÜ˜Ë×Ü™Y\™XÝÈŽˆ—Ü™Y\™XÝÈˆJNÂˆ[]™[PÛÛ™šYË˜Y\ÜÝ›ÝYÚÛÜJÈœÜ˜ËÛ\ËŽˆ›\ËˆJNÂˆ[]™[PÛÛ™šYË˜Y\ÜÝ›ÝYÚÛÜJÈœÜ˜ËÜ›Ø›ÝËŽˆœ›Ø›ÝËˆJNÂˆ[]™[PÛÛ™šYË˜Y\ÜÝ›ÝYÚÛÜJÈœÜ˜ËØ\ÜÙ]ÈŽˆ˜\ÜÙ]ÈˆJNÂˆ[]™[PÛÛ™šYËšYÛ›Ü™\Ë˜Y
œÜ˜ËÙÝZY\ËØ[›˜K[X\šXKZ\Û[™]˜X×F–öâÖ6÷7BÖwV–FRÓ##bò¢¢"“°¢VÆWfVçG”6öæf–ræ–væ÷&W2æFB‚'7&2öwV–FW2ö&W7B×F–ÖR×Fò×f—6—BÖææÖÖ&–Ö—6ÆæBò¢¢"“° ¢VÆWfVçG”6öæf–ræöâ‚&VÆWfVçG’ægFW""Â‚’Óâ°¢6öç7B&ö÷BÒ&ö6W72æ7vB‚“°¢f÷"†6öç7B·6÷W&6RÂF&vWEÒöb°¢·F‚æ¦ö–â‡&ö÷BÂ'7&2"Â%÷&VF—&V7G2"’ÂF‚æ¦ö–â‡&ö÷BÂ%÷6—FR"Â%÷&VF—&V7G2"•ÒÀ¢·F‚æ¦ö–â‡&ö÷BÂ'7&2"Â&ÆÆ×2çG‡B"’ÂF‚æ¦ö–â‡&ö÷BÂ%÷6—FR"Â&ÆÆ×2çG‡B"•ÒÀ¢·F‚æ¦ö–â‡&ö÷BÂ'7&2"Â'&ö&÷G2çG‡B"’ÂF‚æ¦ö–â‡&ö÷BÂ%÷6—FR"Â'&ö&÷G2çG‡B"•Ð¢Ò’°¢–b†g2æW†—7G57–æ2‡6÷W&6R’’°¢g2æ6÷”f–ÆU7–æ2‡6÷W&6RÂF&vWB“°¢Ð¢Ð¢Ò“°¢ ¢òòvF6‚f÷"6†ævW2GW&–ærFWfVÆ÷ÖVç@¢VÆWfVçG”6öæf–ræFEvF6…F&vWB‚"âõöFFò"“°¢ ¢òò6–×ÆRF—FÆRf–ÇFW"Ò§W7BVæG26—FRæÖR–bæ÷BÇ&VG’F†W&P¢VÆWfVçG”6öæf–ræFDf–ÇFW"‚'6VõF—FÆR"ÂgVæ7F–öâ‡F—FÆR’°¢–b‚F—FÆR’&WGW&â%6V66Rf6F–öç2ÂfÆ÷&–FwVÆb6ö7Bf6F–öâ&VçFÇ2#°¢–b‡F—FÆRæ–æ6ÇVFW2‚%6V66R"’’&WGW&âF—FÆS°¢&WGW&âG·F—FÆWÒÂ6V66Rf6F–öç6°¢Ò“°¢ ¢òò6–×ÆRFW67&—F–öâf–ÇFW"Ò&÷f–FW2fÆÆ&6°¢VÆWfVçG”6öæf–ræFDf–ÇFW"‚'6VôFW67&—F–öâ"ÂgVæ7F–öâ†FW67&—F–öâ’°¢–b‚FW67&—F–öâ’&WGW&â$ÇW‡W'’f6F–öâ&VçFÇ2öâfÆ÷&–Fw2wVÆb6ö7Bâ&öö²F—&V7BæB6fRâ#°¢&WGW&âFW67&—F–öã°¢Ò“° ¢VÆWfVçG”6öæf–ræFDf–ÇFW"‚'7G&—‡FÖÂ"ÂgVæ7F–öâ†–çWB’°¢&WGW&â7G&–ær†–çWBÇÂ""¢ç&WÆ6R‚óÅµãåÒ£âörÂ""¢ç&WÆ6R‚õÇ2²örÂ""¢çG&–Ò‚“°¢Ò“° ¢VÆWfVçG”6öæf–ræFDf–ÇFW"‚&§6öâ"ÂgVæ7F–öâ†–çWB’°¢&WGW&â¥4ôâç7G&–æv–g’†–çWBÇÂçVÆÂ“°¢Ò“° ¢VÆWfVçG”6öæf–ræFDf–ÇFW"‚&–Öu&÷‡’"ÂgVæ7F–öâ‡W&ÂÂv–GF‚Òƒ’°¢&WGW&âFô†÷7Fv”6Fâ‡W&ÂÂv–GF‚Âƒ"“°¢Ò“° ¢VÆWfVçG”6öæf–ræFEG&ç6f÷&Ò‚&VçF—G•66†VÖ6÷fW&vR"ÂgVæ7F–öâ†6öçFVçBÂ÷WGWEF‚’°¢–b‚÷WGWEF‚ÇÂ÷WGWEF‚æVæG5v—F‚‚"æ‡FÖÂ"’’°¢&WGW&â6öçFVçC°¢Ð ¢6öç7B&VÆF—fT÷WGWEF‚Ò÷WGWEF‚ç7Æ—B‡F‚ç6W’æ¦ö–â‚"ò"’ç&WÆ6R‚õââ¥Âõ÷6—FRòÂ""“°¢–b‚TåD•E•ô4õdU$tUôõUEUEõD…2æ†2‡&VÆF—fT÷WGWEF‚’’°¢&WGW&â6öçFVçC°¢Ð ¢–b††4VçF—G”6÷fW&vU66†VÖ†6öçFVçB’’°¢&WGW&â6öçFVçC°¢Ð ¢&WGW&â6öçFVçBç&WÆ6R€¢óÅÂö†VCâö’À¢Ç67&—BG—SÒ&Æ–6F–öâöÆB¶§6öâ#âG´õ$tä•¤D”ôåôTåD•E•õ44„TÔÓÂ÷67&—CãÂö†VCæ ¢“°¢Ò“° ¢&WGW&â°¢F—#¢°¢–çWC¢'7&2"À¢÷WGWC¢%÷6—FR"À¢–æ6ÇVFW3¢%ö–æ6ÇVFW2"À¢FF¢%öFF ¢ÒÀ¢FV×ÆFTf÷&ÖG3¢²&æ¦²"Â&‡FÖÂ"Â&ÖB%ÒÀ¢‡FÖÅFV×ÆFTVæv–æS¢&æ¦²"À¢Ö&¶F÷våFV×ÆFTVæv–æS¢&æ¦² ¢Ó°§Ó°