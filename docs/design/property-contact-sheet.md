# Desktop listing contact sheet

**Design selected 2026-11-26:** B, the labeled contact sheet in the Dockside
Dreams Current / A / B private preview. The exact self-contained HTML reviewed
has SHA-256 `3e39ccd745e69548fdfe1f518d676071a3b12e36bd089f1974617263d290e809`
and filename `dockside-photo-viewer.html`. Open it with `?view=b`, then use
**Open viewer**. The artifact stays private. A is the filmstrip and was not
selected. The review picker is not guest-facing and is not part of B.

Independent rendered verdict: **Approved with edge**. Verified the 13-photo
Dockside sheet, 12-photo Coastal sheet, uncropped detail, focus return and the
original grid at 899px and 390px. Coastal exposed caption alignment; top-align
images and leave room for a two-line caption. Keep Waterline tokens and 4px
controls rather than copying the exploratory mock’s custom surfaces/radii.

## Implementation contract

- From 900px, keep the existing in-page booklet and the existing **View all
  photos** control. That button opens a native dialog with the Waterline paper
  contact sheet: four columns, labeled thumbnails, original listing photo order.
  The separate photo section farther down the page is unchanged.
- At full size, show the entire photo, its existing label and position, and
  previous/next controls. A photo selected in the booklet opens that exact photo
  in this view. **All photos** goes back to the sheet and returns focus to the
  selected tile. The arrow keys work without requiring a pointer. Close and
  Escape return focus to the actual opener. Respect reduced motion.
- Below 900px, keep the existing gallery and photo dialog. Keep the no-JavaScript
  links and existing dialog as fallbacks if the desktop enhancement fails.
- Derive tiles from the existing property photo list, with the same photo
  identity and alt text. No new photo assets, room classifications, booking,
  public property claims, or tracking. Defer sheet photo loading until open and
  load full-size photos on selection, not one request for every full-size photo.

Preview both Dockside Dreams (13 photos) and Coastal Stay (12) before a shared
rollout. Test photo counts and identity on all eight listing pages. This is not
adoption of the separate [Room by room lightbox](photo-lightbox.md), whose hold
still applies. Selecting B does not authorize merging or production publication.
