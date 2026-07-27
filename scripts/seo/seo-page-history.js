"use strict";

/**
 * Per-entry modification history for the data-driven owner and stay pages.
 *
 * gitLastModifiedDate() resolves the mtime of whole FILES. Every owner page is
 * generated from the same three files, so all 27 owner URLs used to emit one
 * identical <lastmod>, and all 58 stay URLs another. This module resolves the
 * last commit that touched each entry's own JSON in seoPages.json instead, by
 * walking that file's history once and comparing serialized entries against
 * the actual first parent of each revision.
 *
 * Correctness notes, each of which exists because a review caught the naive
 * version being wrong:
 *
 * - The walk uses `git log --first-parent`. Plain `git log -- <path>` interleaves
 *   sibling commits from merged branches, and consecutive rows are then not
 *   parent/child, so a blob diff between them attributes one branch's change to
 *   its sibling's timestamp. First-parent rows on the deployed branch ARE
 *   consecutive states of that branch, so the comparison is sound, and a side
 *   branch's changes land with its merge commit's date - which is when they
 *   actually reached the deployed branch.
 *
 * - A SHALLOW clone exposes only the truncated tip of history. Walking it would
 *   fabricate one uniform date for every entry while looking healthy. In that
 *   case this module returns an empty map so callers fall back to the old
 *   per-file behaviour: degraded but honest, never invented.
 *
 * - Blobs are fetched through ONE `git cat-file --batch` process. Spawning
 *   `git show` per revision costs ~100ms each inside a loaded build process
 *   (vs ~9ms standalone) and added ~6.4s to the site build.
 */

const { execFileSync } = require("node:child_process");

const SEO_PAGES_PATH = "src/_data/seoPages.json";
const SEO_PAGE_GROUPS = ["owner", "vacationer"];

// Git hooks export repo-location variables (GIT_DIR, GIT_INDEX_FILE, ...).
// Inherited, they override `cwd` discovery and silently point every git call
// here at the HOOK'S repository instead of the requested one â€” which is how a
// pre-commit run once aimed a caller's `git init` at the main repo and flipped
// its config to bare=true. Location vars are stripped; everything else
// (credentials, tracing) passes through.
const GIT_LOCATION_VARS = new Set([
  "GIT_DIR",
  "GIT_WORK_TREE",
  "GIT_INDEX_FILE",
  "GIT_OBJECT_DIRECTORY",
  "GIT_COMMON_DIR",
]);

function cleanGitEnv() {
  return Object.fromEntries(
    Object.entries(process.env).filter(([key]) => !GIT_LOCATION_VARS.has(key))
  );
}

function git(cwd, args, options = {}) {
  return execFileSync("git", args, { cwd, encoding: "utf8", env: cleanGitEnv(), ...options });
}

function isShallowRepository(cwd) {
  try {
    return git(cwd, ["rev-parse", "--is-shallow-repository"]).trim() === "true";
  } catch {
    return false;
  }
}

// Resolve many git objects in a single subprocess. `git cat-file --batch`
// takes one revision spec per line on stdin and replies with
// "<oid> <type> <size>\n<contents>\n" per hit, or "<spec> missing\n".
// Returns contents positionally, with null for anything missing.
function readBlobBatch(cwd, specs) {
  if (!specs.length) {
    return [];
  }

  let stdout;
  try {
    stdout = execFileSync("git", ["cat-file", "--batch"], {
      cwd,
      input: `${specs.join("\n")}\n`,
      maxBuffer: 512 * 1024 * 1024,
      env: cleanGitEnv(),
    });
  } catch {
    return specs.map(() => null);
  }

  const results = [];
  let cursor = 0;
  for (let index = 0; index < specs.length; index += 1) {
    const newline = stdout.indexOf(0x0a, cursor);
    if (newline === -1) {
      results.push(null);
      continue;
    }

    const header = stdout.toString("utf8", cursor, newline);
    if (headeK™[™ÕÚ]
ˆZ\ÜÚ[™ÈŠJHÂˆ™\Ý[Ëœ\Ú
[
NÂˆÝ\œÛÜˆH™]Û[™H
ÈNÂˆÛÛ[YNÂˆB‚ˆÛÛœÝÚ^™HH[X™\‹œ\œÙR[
XY\‹œÛXÙJXY\‹›\Ý[™^ÙŠˆŠH
ÈJKL
NÂˆYˆ
S[X™\‹š\Ñš[š]JÚ^™JJHÂˆ™\Ý[Ëœ\Ú
[
NÂˆÝ\œÛÜˆH™]Û[™H
ÈNÂˆÛÛ[YNÂˆB‚ˆÛÛœÝÝ\H™]Û[™H
ÈNÂˆ™\Ý[Ëœ\Ú
ÝÝ]ÔÝš[™Ê]Ž‹Ý\Ý\
ÈÚ^™JJNÂˆÝ\œÛÜˆHÝ\
ÈÚ^™H
ÈNÈËÈ˜Z[[™È™]Û[™HY\ˆÛÛ[ÂˆB‚ˆ™]\›ˆ™\Ý[ÎÂŸB‚™[˜Ý[Ûˆ[žSX\
ØÊHÂˆÛÛœÝ[šY\ÈH™]ÈX\

NÂˆ›Üˆ
ÛÛœÝÜ›Ý\ÙˆÑS×ÔQÑWÑÔ“ÕTÊHÂˆ›Üˆ
ÛÛœÝ[žHÙˆØÏË–ÙÜ›Ý\H×JHÂˆYˆ
[žOËœÛYÊHÂˆ[šY\ËœÙ]
	ÙÜ›Ý\KÉÙ[žKœÛYßX”ÓÓ‹œÝš[™ÚYžJ[žJJNÂˆBˆBˆBˆ™]\›ˆ[šY\ÎÂŸB‚‹ÊŠ‚ˆ
ˆX\Ùˆ™Ü›Ý\ÜÛYÈˆOˆTÓÈ[Y\Ý[\ÙˆH™]Ù\Ýš\œÝ\\™[™]š\Ú[Ûˆ[‚ˆ
ˆÚXÚ][žIÜÈÙ\šX[^™Y”ÓÓˆY™™\œÈœ›ÛHH™]š[Ý\È™]š\Ú[Û‹‚ˆ
ˆ™]\›œÈ[ˆ[\HX\
Ú]YÜ˜YYˆYXÛˆH™\Ý[
HÚ[ˆ\ÝÜžH\Âˆ
ˆ[˜]˜Z[X›HÜˆÚ[ÝËÛÈØ[\œÈØ[ˆ˜[˜XÚÈ˜]\ˆ[ˆ˜XœšXØ]K‚ˆ
‹Â™[˜Ý[ÛˆZ[Ù[ÔYÙR\ÝÜžJÈÝÙÙ[ÔYÙ\Ô]HÑS×ÔQÑT×ÔUØ\›ˆH

HOˆßHHHßJHÂˆÛÛœÝ\ÝÜžHH™]ÈX\

NÂ‚ˆYˆ
\ÔÚ[ÝÔ™\ÜÚ]ÜžJÝÙ
JHÂˆØ\›ŠˆÙ[Ë\YÙKZ\ÝÜžNˆ	ØÝÙH\ÈHÚ[ÝÈÛÛ™NÈ\‹Y[žH\Ý[Ù]\ÈØ[››Ý™H\š]™Y
Âˆ™œ›ÛH[˜Ø]Y\ÝÜžKˆ˜[[™È˜XÚÈÈ\‹Yš[H]\Ëˆ™]Ú[\ÝÜžHˆ
ÂˆŠÚ]™]ÚK][œÚ[ÝÊHÈ™\ÝÜ™H\‹\YÙH\ØÜš[Z[˜][Û‹ˆ‚ˆ
NÂˆ\ÝÜžK™YÜ˜YYHYNÂˆ™]\›ˆ\ÝÜžNÂˆB‚ˆ]ÙÎÂˆžHÂˆÙÈHÚ]
ÝÙÈ›ÙÈ‹‹KYš\œÝ\\™[‹‹KY›Ü›X]IR	T	XÒH‹‹KH‹Ù[ÔYÙ\Ô]KÂˆX^Y™™\ŽˆMˆ
ˆL
ˆLˆJKš[J
NÂˆHØ]ÚÂˆ\ÝÜžK™YÜ˜YYHYNÂˆ™]\›ˆ\ÝÜžNÂˆBˆYˆ
[ÙÊHÂˆ\ÝÜžK™YÜ˜YYHYNÂˆ™]\›ˆ\ÝÜžNÂˆB‚ˆÛÛœÝ™]š\Ú[ÛœÈHÙËœÜ]
—ˆŠK›X\

[™JHOˆÂˆÛÛœÝ\ÈH[™Kš[J
KœÜ]
×ÊËÊNÂˆ™]\›ˆÂˆÚNˆ\ÖÌKˆ\™[Îˆ\ËœÛXÙJKLJKˆ\ÛÎˆ\ÖÜ\Ë›[™ÝHWKˆNÂˆJNÂ‚ˆÛÛœÝÜXÜÈH×NÂˆ›Üˆ
ÛÛœÝ™]š\Ú[ÛˆÙˆ™]š\Ú[ÛœÊHÂˆÜXÜËœ\Ú
	Ü™]š\Ú[Û‹œÚ_N‰ÜÙ[ÔYÙ\Ô]X
NÂˆYˆ
™]š\Ú[Û‹œ\™[ÖÌJHÂˆÜXÜËœ\Ú
	Ü™]š\Ú[Û‹œ\™[ÖÌ_N‰ÜÙ[ÔYÙ\Ô]X
NÂˆBˆBˆÛÛœÝ›ØœÈH™XY›Ø˜]Ú
ÝÙÜXÜÊNÂˆÛÛœÝ›ØžTÜXÈH™]ÈX\
ÜXÜË›X\

ÜXË[™^
HOˆÜÜXË›ØœÖÚ[™^WJJNÂ‚ˆËÈÛÛ\\™HXXÚ™]š\Ú[ÛˆÚ]]ÈXÝX[š\œÝ\™[ˆÛÛœÙXÝ]]™H›ÝÜÈœ›ÛBˆËÈH][[Z]YÙÈ\™H›ÝHØY™HÝXœÝ]]H›Üˆ\™[™[][ÛœÚ\Ë‚ˆ›Üˆ
ÛÛœÝ™]š\Ú[ÛˆÙˆ™]š\Ú[ÛœÊHÂˆÛÛœÝÝ\œ™[›ØˆH›ØžTÜXË™Ù]
	Ü™]š\Ú[Û‹œÚ_N‰ÜÙ[ÔYÙ\Ô]X
NÂˆYˆ
XÝ\œ™[›ØŠHÂˆÛÛ[YNÂˆB‚ˆ]Ý\œ™[ØÝ[Y[ÂˆžHÂˆÝ\œ™[ØÝ[Y[H”ÓÓ‹œ\œÙJÝ\œ™[›ØŠNÂˆHØ]ÚÂˆÛÛ[YNÂˆB‚ˆ]\™[ØÝ[Y[H[ÂˆYˆ
™]š\Ú[Û‹œ\™[ÖÌJHÂˆÛÛœÝ\™[›ØˆH›ØžTÜXË™Ù]
	Ü™]š\Ú[Û‹œ\™[ÖÌ_N‰ÜÙ[ÔYÙ\Ô]X
NÂˆYˆ
\\™[›ØŠHÂˆÛÛ[YNÂˆBˆžHÂˆ\™[ØÝ[Y[H”ÓÓ‹œ\œÙJ\™[›ØŠNÂˆHØ]ÚÂˆËÈHZ\ÜÚ[™È\™[›ØˆØ[››Ý›Ý™H[ˆ[žHÚ[™ÙY]\È™]š\Ú[Û‹‚ˆÛÛ[YNÂˆBˆB‚ˆÛÛœÝÝ\œ™[[šY\ÈH[žSX\
Ý\œ™[ØÝ[Y[
NÂˆÛÛœÝ\™[[šY\ÈH[žSX\
\™[ØÝ[Y[
NÂˆ›Üˆ
ÛÛœÝÚÙ^K˜[YWHÙˆÝ\œ™[[šY\Ë™[šY\Ê
JHÂˆYˆ
\™[[šY\Ë™Ù]
Ù^JHOOH˜[YH	‰ˆZ\ÝÜžKš\ÊÙ^JJHÂˆ\ÝÜžKœÙ]
Ù^K™]š\Ú[Û‹š\ÛÊNÂˆBˆBˆB‚ˆ™]\›ˆ\ÝÜžNÂŸB‚›[Ù[K™^ÜÈHÂˆÑS×ÔQÑT×ÔUˆÑS×ÔQÑWÑÔ“ÕTËˆZ[Ù[ÔYÙR\ÝÜžKˆ\ÔÚ[ÝÔ™\ÜÚ]ÜžKˆ™XY›Ø˜]ÚŸNÂ