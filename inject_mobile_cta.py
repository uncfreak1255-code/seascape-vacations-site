#!/usr/bin/env python3
"""Inject mobile CTA bar into all stays pages that don't already have one."""
import os
import glob

DEPLOY_DIR = os.path.join(os.path.dirname(__file__), "DEPLOY THIS FOLDER TO NETLIFY")

CTA_HTML = (
    '<div class="mobile-cta-bar">'
    '<a href="tel:9417048545" aria-label="Call us" style="display:flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:50%;background:var(--brand);color:white;flex-shrink:0;text-decoration:none">'
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
    '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>'
    '</svg></a>'
    '<div class="cta-info">'
    '<div class="cta-title">Book Direct &amp; Save</div>'
    '<div class="cta-subtitle">No booking fees · Best rates</div>'
    '</div>'
    '<button type="button" class="btn btn-gold" '
    "onclick='window.open(\"https://book.seascape-vacations.com\",\"_blank\")'>Book Now</button>"
    '</div>'
)

stays_dir = os.path.join(DEPLOY_DIR, "stays")
pages = glob.glob(os.path.join(stays_dir, "*/index.html"))

injected = 0
skipped = 0

for page_path in sorted(pages):
    with open(page_path, "r", encoding="utf-8") as f:
        content = f.read()

    if "mobile-cta-bar" in content:
        skipped += 1
        continue

    # Insert before </body>
    if "</body>" in content:
        content = content.replace("</body>", CTA_HTML + "\n</body>", 1)
        with open(page_path, "w", encoding="utf-8") as f:
            f.write(content)
        injected += 1
        print(f"  ✅ {os.path.relpath(page_path, DEPLOY_DIR)}")
    else:
        print(f"  ⚠️  No </body> tag: {os.path.relpath(page_path, DEPLOY_DIR)}")

print(f"\nDone: {injected} pages updated, {skipped} already had CTA bar.")
