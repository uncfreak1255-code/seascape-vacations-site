# Seascape control feature map

Reference map of site features and how to prove each. The skill that once ran it was retired on 2026-10-21; prove a feature with this repo's declared tests and a direct readback. Do not duplicate this map in Notion.

## site

| id | reach | good looks like | proof outline | owning repo |
|---|---|---|---|---|
| `site.home` | `/` | Featured properties render; hero intact; email modal dismissible without submit | Local preview or live-readonly; screenshot above fold; no console fatal | `seascape-vacations-site` |
| `site.property.river-house` | River House property URL | Approved hero; gallery count OK; Book CTA present | Open property page; screenshot hero + CTA; do not follow Hostaway past CTA here | `seascape-vacations-site` |
| `site.gallery.lightbox` | Open lightbox on a property | Lazy / `data-gallery-src` (or equivalent); close works; no full eager image set | Open lightbox; screenshot; check network not dumping full gallery eagerly | `seascape-vacations-site` |

## Hostaway

Do **not** walk Book CTA → Hostaway when proving a feature. Use `mobile-booking-handoff-proof` (observer, stop before submit).

## hub

Default off. Add a row here only when a task names a `seascape-hub` view and that repo owns the map entry.
