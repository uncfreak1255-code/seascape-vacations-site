# Manual Accessibility Checks

Use the checks relevant to the affected interaction. A full accessibility audit
covers all applicable checks; record unavailable assistive-technology proof.

### Manual testing

- [ ] **Keyboard navigation:** Tab through entire page, use Enter/Space to activate
- [ ] **Screen reader:** Test with VoiceOver (Mac), NVDA (Windows), or TalkBack (Android)
- [ ] **Zoom:** Content usable at 200% zoom
- [ ] **High contrast:** Test with Windows High Contrast Mode
- [ ] **Reduced motion:** Test with `prefers-reduced-motion: reduce`
- [ ] **Focus order:** Logical and follows visual order

Automated scans are a baseline, not the full audit. When reporting manual
accessibility findings, include:

- route, viewport, browser, and assistive technology checked
- keyboard path tested, including where focus starts, moves, and returns
- screen-reader readback for headings, landmarks, links, buttons, forms, and dynamic status changes
- zoom or high-contrast mode used, if the issue depends on visual scale or contrast
- issue severity by user impact: critical, serious, moderate, or minor
- current behavior, expected behavior, and the smallest verification step after the fix

For interactive components, verify the expected keyboard pattern before marking
the component accessible:

- menus and disclosures: Tab reaches the trigger, Enter or Space opens it, Escape closes it, and focus returns to the trigger
- modals: focus moves into the dialog, stays inside while open, Escape closes it, and focus returns to the opener
- forms: every input has a programmatic label, errors are associated with fields, and error or success states are announced
- carousels or sliders: controls are keyboard reachable, motion can be paused when needed, and the current state is announced
- custom buttons, cards, or CTAs: role, name, state, and action are clear without relying on pointer hover

### Screen reader commands

| Action | VoiceOver (Mac) | NVDA (Windows) |
|--------|-----------------|----------------|
| Start/Stop | ⌘ + F5 | Ctrl + Alt + N |
| Next item | VO + → | ↓ |
| Previous item | VO + ← | ↑ |
| Activate | VO + Space | Enter |
| Headings list | VO + U, then arrows | H / Shift + H |
| Links list | VO + U | K / Shift + K |

---
