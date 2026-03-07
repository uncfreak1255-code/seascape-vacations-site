#!/usr/bin/env python3
"""
Add Related Guides + Booking CTA sections to all guide pages.
Task 16 and Task 17 implementation.
"""

import os
import re
from pathlib import Path
from html.parser import HTMLParser


class TitleExtractor(HTMLParser):
    """Extract title from HTML head"""
    def __init__(self):
        super().__init__()
        self.title = None
        self.in_title = False

    def handle_starttag(self, tag, attrs):
        if tag == "title":
            self.in_title = True

    def handle_endtag(self, tag):
        if tag == "title":
            self.in_title = False

    def handle_data(self, data):
        if self.in_title:
            self.title = data.strip()


def get_title_from_file(file_path):
    """Extract title from HTML file"""
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
        parser = TitleExtractor()
        parser.feed(content)
        return parser.title or "Guide"
    except Exception as e:
        print(f"Error extracting title from {file_path}: {e}")
        return "Guide"


def get_filename_key(file_path):
    """Convert file path to cluster key"""
    # Get the filename without extension
    if file_path.endswith("index.html"):
        # For index.html, use parent directory name
        return Path(file_path).parent.name
    else:
        # For .html files, use filename without extension
        return Path(file_path).stem


def find_all_guides():
    """Find all guide HTML files and map them to their keys"""
    guides_dir = "/sessions/confident-adoring-johnson/repo/DEPLOY THIS FOLDER TO NETLIFY/guides/"
    guides_map = {}  # key -> file_path mapping
    guides_info = {}  # key -> {file_path, title} mapping

    for root, dirs, files in os.walk(guides_dir):
        for file in files:
            if file.endswith(".html"):
                file_path = os.path.join(root, file)
                key = get_filename_key(file_path)

                # Skip index.html at guides/ root level
                if file_path.endswith("/guides/index.html"):
                    continue

                guides_map[key] = file_path
                title = get_title_from_file(file_path)
                guides_info[key] = {"file_path": file_path, "title": title}

    return guides_map, guides_info


def get_relative_link(from_file, to_key):
    """Generate relative link from one guide to another"""
    guides_dir = "/sessions/confident-adoring-johnson/repo/DEPLOY THIS FOLDER TO NETLIFY/guides/"

    # If to_key ends with index.html, convert to directory path
    if to_key.endswith("index"):
        return f"/guides/{to_key.replace('index', '')}.html"
    else:
        return f"/guides/{to_key}.html"


def get_related_guides(current_key, clusters, guides_info, guides_map):
    """Get 4 related guides for the current guide"""
    # Find which cluster(s) the current guide belongs to
    current_clusters = []
    for cluster_name, cluster_guides in clusters.items():
        if current_key in cluster_guides:
            current_clusters.append(cluster_name)

    if not current_clusters:
        # If not in any cluster, return empty
        return []

    # Collect candidates from primary cluster
    primary_cluster = current_clusters[0]
    candidates = []
    for guide_key in clusters[primary_cluster]:
        if guide_key != current_key and guide_key in guides_info:
            candidates.append(guide_key)

    # If we have less than 4, pull from related clusters
    if len(candidates) < 4:
        for cluster_name in current_clusters[1:]:
            for guide_key in clusters[cluster_name]:
                if guide_key != current_key and guide_key not in candidates and guide_key in guides_info:
                    candidates.append(guide_key)

    # If still less than 4, pull from any cluster
    if len(candidates) < 4:
        for cluster_name, cluster_guides in clusters.items():
            if cluster_name not in current_clusters:
                for guide_key in cluster_guides:
                    if guide_key != current_key and guide_key not in candidates and guide_key in guides_info:
                        candidates.append(guide_key)
                        if len(candidates) >= 4:
                            break
            if len(candidates) >= 4:
                break

    # Return first 4
    return candidates[:4]


def generate_booking_cta_html():
    """Generate the booking CTA HTML"""
    return '''<div style="text-align:center;padding:40px 24px;background:linear-gradient(135deg,#5F8A8B,#3D5C5D);border-radius:16px;margin:40px auto;max-width:800px">
<h3 style="font-family:'Playfair Display',serif;color:#fff;font-size:1.5rem;margin-bottom:12px">Plan Your Gulf Coast Getaway</h3>
<p style="color:rgba(255,255,255,0.9);margin-bottom:20px">Browse our waterfront vacation rentals and book direct for the best rates.</p>
<a href="/properties/" style="display:inline-block;padding:14px 36px;background:#C9A962;color:#fff;text-decoration:none;border-radius:50px;font-weight:600">View Properties</a>
</div>'''


def generate_related_guides_html(related_guides, guides_info):
    """Generate the related guides HTML"""
    if not related_guides:
        return ""

    html = '''<section style="max-width:800px;margin:40px auto;padding:32px;background:#F5EED6;border-radius:16px">
<h2 style="font-family:'Playfair Display',serif;color:#3D5C5D;margin-bottom:16px;font-size:1.4rem">Related Guides</h2>
<ul style="list-style:none;padding:0;display:grid;grid-template-columns:1fr 1fr;gap:12px">
'''

    for guide_key in related_guides:
        if guide_key in guides_info:
            link = get_relative_link(None, guide_key)
            title = guides_info[guide_key]["title"]
            # Clean up title if it has extra info
            title = title.split("|")[0].strip()
            html += f'<li><a href="{link}" style="color:#5F8A8B;text-decoration:none;font-weight:500">{title}</a></li>\n'

    html += '''</ul>
</section>'''

    return html


def check_sections_exist(content):
    """Check if Related Guides or Booking CTA sections already exist"""
    has_related = "Related Guides" in content and '<section style="max-width:800px;margin:40px auto;padding:32px;background:#F5EED6;border-radius:16px">' in content
    has_booking = "Plan Your Gulf Coast Getaway" in content
    return has_related, has_booking


def add_sections_to_file(file_path, clusters, guides_info, guides_map):
    """Add Related Guides and Booking CTA to a single file"""
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()

        # Check if sections already exist
        has_related, has_booking = check_sections_exist(content)

        if has_related and has_booking:
            print(f"SKIP: {file_path} - both sections already exist")
            return False

        # Get the current guide's key
        current_key = get_filename_key(file_path)

        # Get related guides
        related_guides = get_related_guides(current_key, clusters, guides_info, guides_map)

        # Generate HTML sections
        booking_cta_html = generate_booking_cta_html()
        related_guides_html = generate_related_guides_html(related_guides, guides_info)

        # Find insertion point (before </body>)
        body_end_match = re.search(r'</body>', content, re.IGNORECASE)
        if not body_end_match:
            print(f"ERROR: No </body> tag found in {file_path}")
            return False

        # Insert before </body>
        insertion_point = body_end_match.start()

        # Build the sections to insert
        new_sections = ""

        # Only add booking CTA if it doesn't exist
        if not has_booking:
            new_sections += "\n" + booking_cta_html + "\n"

        # Only add related guides if they don't exist
        if not has_related and related_guides_html:
            new_sections += related_guides_html + "\n"

        # Skip if nothing new to add
        if not new_sections.strip():
            print(f"SKIP: {file_path} - all sections already exist")
            return False

        # Insert into content
        new_content = content[:insertion_point] + new_sections + content[insertion_point:]

        # Write back
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(new_content)

        print(f"SUCCESS: {file_path}")
        return True

    except Exception as e:
        print(f"ERROR: {file_path} - {e}")
        return False


def main():
    """Main function"""
    # Define clusters
    clusters = {
        "beaches": [
            "anna-maria-island-beaches",
            "siesta-key-beach-guide",
            "bradenton-beach",
            "holmes-beach",
            "anna-maria-island-vs-clearwater-beach"
        ],
        "activities": [
            "things-to-do-bradenton-fl",
            "dolphins-manatees-bradenton",
            "fishing-guide-anna-maria-sarasota",
            "shelling-guide-florida",
            "rainy-day-activities-bradenton-sarasota"
        ],
        "planning": [
            "best-time-visit-anna-maria-island",
            "family-vacation-anna-maria-island",
            "how-to-get-to-anna-maria-island",
            "do-you-need-a-car-anna-maria-island",
            "anna-maria-island-vacation-cost",
            "pet-friendly-anna-maria-island",
            "snowbirds-guide-extended-stays-florida"
        ],
        "dining": [
            "best-restaurants-anna-maria-island",
            "best-waterfront-restaurants-with-boat-dock"
        ],
        "comparison": [
            "anna-maria-island-vs-siesta-key-families",
            "anna-maria-island-vs-longboat-key",
            "anna-maria-island-vs-clearwater-beach",
            "bradenton-vs-sarasota",
            "holmes-beach-vs-bradenton-beach"
        ],
        "areas": [
            "bradenton-insider-guide",
            "anna-maria-city",
            "srq-airport-to-anna-maria-island"
        ],
        "investment": [
            "vacation-rental-income-anna-maria",
            "booking-direct-vacation-rentals",
            "best-vacation-rental-companies-ami"
        ]
    }

    # Find all guides
    print("Finding all guides...")
    guides_map, guides_info = find_all_guides()
    print(f"Found {len(guides_info)} guides")

    # Process each guide
    print("\nProcessing guides...")
    success_count = 0
    guides_dir = "/sessions/confident-adoring-johnson/repo/DEPLOY THIS FOLDER TO NETLIFY/guides/"

    for root, dirs, files in os.walk(guides_dir):
        for file in files:
            if file.endswith(".html"):
                file_path = os.path.join(root, file)

                # Skip index.html at guides/ root level
                if file_path.endswith("/guides/index.html"):
                    continue

                if add_sections_to_file(file_path, clusters, guides_info, guides_map):
                    success_count += 1

    print(f"\n✓ Updated {success_count} files")


if __name__ == "__main__":
    main()
