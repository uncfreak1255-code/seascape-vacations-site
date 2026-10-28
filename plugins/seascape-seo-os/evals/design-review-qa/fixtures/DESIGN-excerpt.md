# DESIGN.md excerpt (sample snapshot)

- Canvas: paper `#F6F3EB`; ink and primary controls: deep marine `#173D42`;
  supporting text `#52676A`; accent clay `#A4533E`; citron `#D6EB85`.
  Citron is a surface/accent, never small text on paper.
- Spacing steps: 4, 8, 12, 16, 24, 32, 44 (tap), 56px. New rules pick from this list.
- button-primary: ink background, white text, 4px radius, 14px 24px padding,
  min-height 48px, never below the 44px mobile floor.
- button-on-dark (citron with ink text) is only for the homepage header over the
  scene photo, the two sticky CTA bars and the near-black owner hero.
- Keep the conventional booking panel on property pages.
- F2 tap targets: on mobile (393px) every control has a hit box of at least 44x44px.
- Visual changes need `npm run test:visual` (desktop and mobile baselines plus an
  axe spec) and fresh desktop and mobile screenshots.
