# Homepage focused deck: approved After A

November 13, 2026. This replaces the open desktop fan, not the hero or booking sheet.
The approval reference is the saved in-context After A desktop/phone preview.

- Desktop: centered 420px postcard, landscape photo, photo-only neighbors, manual
  Previous/Next and home-name selectors. No autoplay, drag experiment or scroll choreography.
- Phone: native horizontal home snap, a card 24px narrower than the track with a photo-only neighbor peek, active-card height and details.
- See all homes restores complete readable cards and the existing phone photo strips.
  Nested horizontal gestures cannot reliably choose both a home and a photo, so focused
  mode shows each home's first photo; open collection retains every original photo.
- Data, ratings, first-image eager loading, trip links and filters stay source-backed.
- The no-JavaScript layout is the complete list; all controls are hidden until initialized.
- Keyboard navigation is immediate, offscreen details cannot take focus, reduced motion
  keeps the static layout. Typography respects the 12px floor rather than the prototype's
  10–11px labels. Long names may increase the active-card height.

Source: `src/assets/js/home-deck.js`, `src/css/home-deck.css`, homepage template.
Proof: `home-focused-deck.test.js` and `home-focused-deck.spec.js`.
Rollback: revert this bounded change to restore base ada10a34; after approval, this A
revision becomes the rollback baseline for any later motion branch. No feature flags.

## Earlier verification checkpoint: November 13, 2026

Independent rendered critic: Approved with edge at 1440px, 393px and 320px.
The three low-impact edges (CTA arrow placement, missing swipe hint, and 4px
snap inset) were corrected and independently rechecked by the coordinator.
Phone track and selected card both start at x16; CTA arrow right gap is 0px.
The unchanged approved mock remains the design reference.

- Locked Node 24.22.2 install and build pass. No dependency or lockfile changes.
- Content lint: 41 tests pass.
- Focused deck browser tests: 10 pass, 2 device-specific skips.
- Broader selected browser run: 184 pass, 4 device-specific skips; two failures
  were an ambiguous span locator in the new fidelity test, corrected to the
  direct wrapper and passed in the focused rerun. No site regression was found.
- Unit/release suite: 1384 pass, 2 fail because macOS refuses to load the locked
  Sharp 0.35.5 native binary (library load disallowed by system policy).
- Full visual gate is blocked by the same native load error before tests run.
- Design lint, redirects, recovery checks, internal links and JSON-LD pass.
- No committed screenshot baselines or performance thresholds were changed.

Release is BLOCKED, not green. No push, PR, merge or production deployment.
Rerun full verification and the complete visual/performance gates in an
environment that can load the locked native dependency, then review any
intended homepage baseline difference through the existing workflow.
Physical phone and assistive-technology behavior have not been tested.

Next scope approved by Sawyer: A first, photo viewer next, shortlist polish
after that; booking calendar is a separate careful pass. No follow-up feature
is part of this branch.

The guarded local commit was also refused by the same proof-chain unit failure;
there is no A commit yet. All 11 task files remain isolated on the named branch.
TesterArmy's targeted booking journey could not start: its Oxc parser binding
is present but macOS rejects its native load, and the transform package's
referenced native file is missing. The existing Playwright booking journeys
above ran with intercepted checkout; they are not a substitute for this gate.
No native signing/security settings, lockfile, dependencies, or gates were changed.

## Environment repair: November 13, 2026

The earlier native-library blocker is resolved. Fresh npm-ci from a clean cache
restored all binaries, but Aside applied com.apple.quarantine to the downloaded
native libraries. All four affected binaries were byte-compared with registry
archives whose SHA-512 matched package-lock.json. Sawyer explicitly approved
clearing that attribute only from those four worktree files: Sharp, libvips,
Oxc parser and Oxc transform. No global macOS security policy, signature,
dependency version, lockfile or test gate changed. All three modules load.

`npm run verify:release -- --range origin/main` now passes, including the full
unit suite and content, design, recovery, links and schema gates. The normal
guarded checkpoint follows. Full visual, E2E and performance proof are separate
and must pass before publication; no release-green claim follows from this
repair alone. The photo viewer stays in a separate review prototype.

## Post-repair browser verification

The complete visual suite now executes: 663 passed, 94 intentional device skips,
and 13 failures. Eleven failures were old single-anchor test assumptions after
A introduced its separate Explore CTA. The three affected specs now select the
photo link explicitly, use See all homes when browsing the full collection,
and check both links' destinations/focus. Their focused rerun plus deck coverage
passes: 28 tests, 4 intentional skips. No runtime or visual assertions were removed.
The only outstanding visual failures are the intended desktop/phone homepage
snapshot changes; the required reviewed baseline workflow has not run. No local
baseline overwrite or tolerance relaxation was used. Publication remains held.

The repaired TesterArmy E2E suite passes 27 tests with 1 intentional skip.
The photo viewer is a separate offline review artifact, not part of this branch.
