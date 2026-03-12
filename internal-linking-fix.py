#!/usr/bin/env python3
"""Internal Linking Rebuild — 2026-03-12
Fixes orphan pages, broken links, and adds strategic internal links."""

import os
import re
from html.parser import HTMLParser
from collections import defaultdict
from urllib.parse import urljoin, urlparse

DEPLOY = "/Users/sawbeck/Projects/seascape-vacations-site/DEPLOY THIS FOLDER TO NETLIFY"

# ============================================================
# PHASE 1: Parse all pages and build link inventory
# ============================================================

class LinkParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []
        self._in_a = False
        self._href = None
        self._text_parts = []
    def handle_starttag(self, tag, attrs):
        if tag == 'a':
            d = dict(attrs)
            href = d.get('href', '')
            if href and not href.startswith(('mailto:', 'tel:', '#', 'javascript:')):
                if not href.startswith('http') or 'seascape-vacations.com' in href:
                    self._in_a = True
                    self._href = href
                    self._text_parts = []
    def handle_data(self, data):
        if self._in_a:
            self._text_parts.append(data.strip())
    def handle_endtag(self, tag):
        if tag == 'a' and self._in_a:
            anchor = ' '.join(self._text_parts).strip()
            self.links.append((self._href, anchor))
            self._in_a = False

pages = {}
for root, dirs, files in os.walk(DEPLOY):
    for f in files:
        if f.endswith('.html'):
            full = os.path.join(root, f)
            rel = full[len(DEPLOY):]
            if rel.endswith('/index.html'):
                url = rel[:-len('index.html')]
            else:
                url = rel
            pages[url] = full

inbound = defaultdict(list)
outbound = defaultdict(list)

def normalize_url(href, source_url):
    if 'seascape-vacations.com' in href:
        parsed = urlparse(href)
        href = parsed.path
    if not href.startswith('/'):
        href = urljoin(source_url, href)
    return href

for url, filepath in pages.items():
    with open(filepath, 'r', errors='ignore') as fh:
        content = fh.read()
    parser = LinkParser()
    try:
        parser.feed(content)
    except:
        continue
    for href, anchor in parser.links:
        target = normalize_url(href, url)
        outbound[url].append((target, anchor))
        inbound[target].append((url, anchor))

print(f"Parsed {len(pages)} pages")

# ============================================================
# PHASE 2: Define fixes
# ============================================================

# Track all edits: {filepath: [(old_string, new_string), ...]}
edits = defaultdict(list)
stats = {
    'orphans_fixed': 0,
    'broken_fixed': 0,
    'new_links_added': 0,
    'pages_modified': set(),
    'striking_distance_boosted': 0,
}

def add_link_before_faq_or_footer(filepath, link_html):
    """Add a paragraph with internal link before FAQ section or footer."""
    with open(filepath, 'r', errors='ignore') as f:
        content = f.read()
    
    # Try inserting before FAQ section
    insert_points = [
        '<section id="faq"',
        '<section class="faq"',
        '<div id="faq"',
        '<h2>Frequently Asked',
        '<h2>FAQ',
        '</main>',
        '<footer',
    ]
    
    for marker in insert_points:
        idx = content.find(marker)
        if idx > 0:
            new_p = f'\n<p style="margin-top:1em">{link_html}</p>\n'
            new_content = content[:idx] + new_p + content[idx:]
            with open(filepath, 'w') as f:
                f.write(new_content)
            return True
    return False

def add_contextual_link_in_body(filepath, link_html):
    """Add a link paragraph in the body content area."""
    with open(filepath, 'r', errors='ignore') as f:
        content = f.read()
    
    # Find last </p> before FAQ or footer
    insert_points = ['<section id="faq"', '</main>', '<footer']
    cutoff = len(content)
    for marker in insert_points:
        idx = content.find(marker)
        if idx > 0:
            cutoff = min(cutoff, idx)
            break
    
    # Find last </p> before cutoff
    body_section = content[:cutoff]
    last_p = body_section.rfind('</p>')
    if last_p > 0:
        insert_at = last_p + len('</p>')
        new_p = f'\n<p style="margin-top:1em">{link_html}</p>'
        new_content = content[:insert_at] + new_p + content[insert_at:]
        with open(filepath, 'w') as f:
            f.write(new_content)
        return True
    return False


# ============================================================
# FIX 1: Orphan pages — add links TO them from related pages
# ============================================================

orphan_fixes = {
    # book-direct-vs-airbnb-vrbo: Link from book-direct page and AMI vacation rentals
    '/stays/book-direct-vs-airbnb-vrbo/': [
        ('/book-direct/', 'See our <a href="/stays/book-direct-vs-airbnb-vrbo/">full cost breakdown comparing direct booking vs Airbnb and VRBO</a> — the savings are real.'),
        ('/stays/anna-maria-island-vacation-rentals/', 'Wondering about platform fees? Our <a href="/stays/book-direct-vs-airbnb-vrbo/">book direct vs Airbnb comparison</a> shows how much you save by skipping the middleman.'),
        ('/stays/vacation-rentals-bradenton-florida/', 'Before you book on Airbnb, check our <a href="/stays/book-direct-vs-airbnb-vrbo/">direct booking savings breakdown</a> — most guests save $50-150 per stay.'),
    ],
    # clearwater comparison: Link from AMI vs Siesta Key and other comparison guides
    '/guides/anna-maria-island-vs-clearwater-beach.html': [
        ('/guides/anna-maria-island-vs-siesta-key.html', 'Also considering Clearwater? Our <a href="/guides/anna-maria-island-vs-clearwater-beach.html">Anna Maria Island vs Clearwater Beach comparison</a> breaks down the 90-minute-apart alternatives.'),
        ('/guides/is-anna-maria-island-worth-visiting.html', 'Some visitors also weigh AMI against Clearwater Beach — our <a href="/guides/anna-maria-island-vs-clearwater-beach.html">honest comparison of Anna Maria Island and Clearwater</a> covers costs, crowds, and beaches.'),
        ('/stays/family-vacation-rentals-anna-maria-island/', 'Not sure about AMI yet? See how it stacks up in our <a href="/guides/anna-maria-island-vs-clearwater-beach.html">Anna Maria Island vs Clearwater Beach guide</a>.'),
    ],
    # book-direct page: Link from homepage and comparison pages
    '/book-direct/': [
        ('/stays/book-direct-vs-airbnb-vrbo/', 'Ready to skip the fees? <a href="/book-direct/">Book direct with Seascape Vacations</a> and save 10-15% on your Gulf Coast rental.'),
        ('/stays/vacation-rentals-bradenton-florida/', 'All our Bradenton properties are available to <a href="/book-direct/">book direct</a> — no Airbnb service fees, no VRBO booking fees.'),
        ('/stays/anna-maria-island-beachfront-rentals/', 'Skip the platform fees and <a href="/book-direct/">book direct with Seascape Vacations</a> to save on your beachfront stay.'),
    ],
}

# Also fix 2-inbound orphans
orphan_fixes['/stays/vacation-rentals-near-siesta-key-beach/'] = [
    ('/guides/anna-maria-island-vs-siesta-key.html', 'Planning a Siesta Key trip but want more space? Check our <a href="/stays/vacation-rentals-near-siesta-key-beach/">vacation rentals near Siesta Key Beach</a> — private pools, full kitchens, and way more room than a hotel.'),
]
orphan_fixes['/stays/vacation-rentals-with-elevator/'] = [
    ('/stays/family-vacation-rentals-anna-maria-island/', 'Traveling with grandparents or anyone with mobility needs? We have <a href="/stays/vacation-rentals-with-elevator/">vacation rentals with elevator access</a> for easy multi-level living.'),
]
orphan_fixes['/guides/flights-to-anna-maria-island/'] = [
    ('/guides/srq-airport-to-anna-maria-island.html', 'Planning your travel? Our <a href="/guides/flights-to-anna-maria-island/">complete flights to Anna Maria Island guide</a> covers the best airports, airlines, and routes.'),
    ('/guides/best-time-visit-anna-maria-island.html', 'Need flight info? Check our <a href="/guides/flights-to-anna-maria-island/">guide to flights to Anna Maria Island</a> for the best airports and seasonal pricing.'),
]

print("\n--- Fixing orphan pages ---")
for target_url, source_fixes in orphan_fixes.items():
    for source_url, link_sentence in source_fixes:
        # Find the filepath for source_url
        filepath = pages.get(source_url)
        if not filepath:
            print(f"  SKIP: Source {source_url} not found")
            continue
        success = add_link_before_faq_or_footer(filepath, link_sentence)
        if success:
            stats['new_links_added'] += 1
            stats['pages_modified'].add(source_url)
            stats['orphans_fixed'] += 1
            print(f"  Added link to {target_url} from {source_url}")
        else:
            # Try alternate insertion
            success = add_contextual_link_in_body(filepath, link_sentence)
            if success:
                stats['new_links_added'] += 1
                stats['pages_modified'].add(source_url)
                stats['orphans_fixed'] += 1
                print(f"  Added link (body) to {target_url} from {source_url}")
            else:
                print(f"  FAILED: Could not insert link in {source_url}")


# ============================================================
# FIX 2: Boost striking-distance pages (pos 4-15)
# ============================================================

# best-vacation-rental-companies-ami (pos 14.6, 753 impressions — money keyword)
# Need 3-5 MORE links pointing to it
striking_fixes = {
    '/guides/best-vacation-rental-companies-ami.html': [
        ('/stays/anna-maria-island-vacation-rentals/', 'Comparing rental companies? Our <a href="/guides/best-vacation-rental-companies-ami.html">guide to the best vacation rental companies on Anna Maria Island</a> ranks the top managers by fees, reviews, and property quality.'),
        ('/stays/anna-maria-island-beachfront-rentals/', 'Not sure which company to book with? Read our <a href="/guides/best-vacation-rental-companies-ami.html">best AMI vacation rental companies comparison</a> before you decide.'),
        ('/stays/holmes-beach-vacation-rentals/', 'Looking for the right rental manager on the island? Our <a href="/guides/best-vacation-rental-companies-ami.html">best vacation rental companies on Anna Maria Island</a> guide compares them all.'),
        ('/guides/anna-maria-island-vs-clearwater-beach.html', 'If you pick AMI, you will want to know the <a href="/guides/best-vacation-rental-companies-ami.html">best vacation rental companies on the island</a> — fees range from 8% to 20%.'),
    ],
    # SRQ airport guide (pos 6.7) — boost from related travel pages
    '/guides/srq-airport-to-anna-maria-island.html': [
        ('/guides/anna-maria-island-weather.html', 'Flying in? Our <a href="/guides/srq-airport-to-anna-maria-island.html">SRQ airport to Anna Maria Island guide</a> covers car rentals, drive times, and the best route from Sarasota-Bradenton International.'),
        ('/stays/easter-vacation-rentals-florida-gulf-coast/', 'Getting to your Easter rental is easy — check our <a href="/guides/srq-airport-to-anna-maria-island.html">SRQ airport to Anna Maria Island transfer guide</a> for the fastest route.'),
    ],
    # is-AMI-worth-visiting (pos 4.9) — close to top 3
    '/guides/is-anna-maria-island-worth-visiting.html': [
        ('/guides/anna-maria-island-weather.html', 'Still on the fence? Our honest take on <a href="/guides/is-anna-maria-island-worth-visiting.html">whether Anna Maria Island is worth visiting</a> might help you decide.'),
        ('/stays/easter-vacation-rentals-florida-gulf-coast/', 'First time visiting? Read our honest <a href="/guides/is-anna-maria-island-worth-visiting.html">is Anna Maria Island worth visiting</a> guide before you book.'),
    ],
    # best-time-visit-ami (pos 4.4) — very close to top 3
    '/guides/best-time-visit-anna-maria-island.html': [
        ('/stays/holmes-beach-vacation-rentals/', 'Timing matters — check our <a href="/guides/best-time-visit-anna-maria-island.html">best time to visit Anna Maria Island</a> guide for peak vs. off-season rates and weather.'),
    ],
}

print("\n--- Boosting striking-distance pages ---")
for target_url, source_fixes in striking_fixes.items():
    for source_url, link_sentence in source_fixes:
        filepath = pages.get(source_url)
        if not filepath:
            print(f"  SKIP: Source {source_url} not found")
            continue
        success = add_link_before_faq_or_footer(filepath, link_sentence)
        if success:
            stats['new_links_added'] += 1
            stats['pages_modified'].add(source_url)
            stats['striking_distance_boosted'] += 1
            print(f"  Added link to {target_url} from {source_url}")
        else:
            success = add_contextual_link_in_body(filepath, link_sentence)
            if success:
                stats['new_links_added'] += 1
                stats['pages_modified'].add(source_url)
                stats['striking_distance_boosted'] += 1
                print(f"  Added link (body) to {target_url} from {source_url}")
            else:
                print(f"  FAILED: Could not insert in {source_url}")


# ============================================================
# FIX 3: Fix broken content links (correct URLs)
# ============================================================

# Map of broken target -> correct target
broken_url_fixes = {
    '/guides/things-to-do-bradenton-fl/': '/guides/things-to-do-bradenton-fl.html',
    '/guides/bradenton-vs-sarasota/': '/guides/bradenton-vs-sarasota.html',
    '/guides/anna-maria-island-vs-siesta-key/': '/guides/anna-maria-island-vs-siesta-key.html',
    '/guides/bradenton-beach/': '/guides/bradenton-beach-area-guide/',
    '/guides/snowbirds-guide-extended-stays-florida/': None,  # Page doesn't exist, remove link
    '/guides/2026-bradenton-vacation-rental-market-analysis/': None,  # Doesn't exist
    '/guides/florida-gulf-coast-vacation-rental-market-report-2026/': None,  # Doesn't exist
    '/guides/anna-maria-island-beaches/': None,  # Doesn't exist
    '/guides/best-restaurants-anna-maria-island/': None,  # Doesn't exist
    '/guides/fishing-guide-anna-maria-sarasota/': None,  # Doesn't exist
    '/guides/where-to-stay-anna-maria-island/': None,  # Doesn't exist
    '/stays/luxury-vacation-rentals-bradenton-florida/': '/stays/luxury-vacation-rentals-bradenton/',
    '/stays/rentals-with-elevators/': '/stays/vacation-rentals-with-elevator/',
    '/guides/best-time-visit-anna-maria-island/': '/guides/best-time-visit-anna-maria-island.html',
    '/property-owners/': None,  # Doesn't exist
}

# Check which broken targets actually have correct versions
print("\n--- Checking broken URL corrections ---")
for broken, fix in broken_url_fixes.items():
    if fix:
        exists = fix in pages or fix.rstrip('/') in pages
        print(f"  {broken} -> {fix} (exists: {exists})")

# Fix broken links by doing string replacement in files
print("\n--- Fixing broken links ---")
broken_fixed_count = 0

# Fix the ones where we have a correct URL (simple href replacement)
simple_fixes = {
    'href="/guides/things-to-do-bradenton-fl/"': 'href="/guides/things-to-do-bradenton-fl.html"',
    'href="/guides/bradenton-vs-sarasota/"': 'href="/guides/bradenton-vs-sarasota.html"',
    'href="/guides/anna-maria-island-vs-siesta-key/"': 'href="/guides/anna-maria-island-vs-siesta-key.html"',
    'href="/stays/rentals-with-elevators/"': 'href="/stays/vacation-rentals-with-elevator/"',
    'href="/stays/luxury-vacation-rentals-bradenton-florida/"': 'href="/stays/luxury-vacation-rentals-bradenton/"',
    'href="/guides/best-time-visit-anna-maria-island/"': 'href="/guides/best-time-visit-anna-maria-island.html"',
    'href="/guides/bradenton-beach/"': 'href="/guides/bradenton-beach-area-guide/"',
    # Fix area guide self-referencing broken links
    'href="/guides/bradenton-area-guide/index.html"': 'href="/guides/bradenton-area-guide/"',
    'href="/guides/sarasota-area-guide/index.html"': 'href="/guides/sarasota-area-guide/"',
    'href="/guides/anna-maria-island-area-guide/index.html"': 'href="/guides/anna-maria-island-area-guide/"',
    'href="/guides/holmes-beach-area-guide/index.html"': 'href="/guides/holmes-beach-area-guide/"',
    'href="/guides/bradenton-beach-area-guide/index.html"': 'href="/guides/bradenton-beach-area-guide/"',
    'href="/guides/longboat-key-area-guide/index.html"': 'href="/guides/longboat-key-area-guide/"',
    'href="/guides/siesta-key-area-guide/index.html"': 'href="/guides/siesta-key-area-guide/"',
    # Fix trailing quote in URLs
    'href="/stays/bradenton-vacation-rentals-near-beaches/"/"': 'href="/stays/bradenton-vacation-rentals-near-beaches/"',
    'href="/stays/anna-maria-island-homes-with-pool/"/"': 'href="/stays/anna-maria-island-homes-with-pool/"',
}

for filepath in pages.values():
    with open(filepath, 'r', errors='ignore') as f:
        content = f.read()
    
    original = content
    for old, new in simple_fixes.items():
        if old in content:
            content = content.replace(old, new)
    
    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        rel = filepath[len(DEPLOY):]
        if rel.endswith('/index.html'):
            rel = rel[:-len('index.html')]
        stats['pages_modified'].add(rel)
        # Count individual fixes
        for old, new in simple_fixes.items():
            if old in original:
                broken_fixed_count += original.count(old)

stats['broken_fixed'] = broken_fixed_count
print(f"  Fixed {broken_fixed_count} broken link URLs across site")


# ============================================================
# FIX 4: Cross-link from top performers to underperformers
# ============================================================

# bradenton-vs-sarasota (89 clicks, pos 2.4) -> link to underperformers
top_performer_links = {
    '/guides/bradenton-vs-sarasota.html': [
        ('Looking for vacation rentals near Siesta Key? Our <a href="/stays/vacation-rentals-near-siesta-key-beach/">Siesta Key area vacation rentals</a> put you close to the sand without the hotel prices.', '/stays/vacation-rentals-near-siesta-key-beach/'),
    ],
    # AMI vs Siesta Key (69 clicks, pos 2.9)
    '/guides/anna-maria-island-vs-siesta-key.html': [
        ('Planning your stay? Compare the <a href="/guides/best-vacation-rental-companies-ami.html">top vacation rental companies on Anna Maria Island</a> to find the best deal.', '/guides/best-vacation-rental-companies-ami.html'),
    ],
}

print("\n--- Adding links from top performers ---")
for source_url, links in top_performer_links.items():
    filepath = pages.get(source_url)
    if not filepath:
        print(f"  SKIP: {source_url} not found")
        continue
    for link_sentence, target in links:
        success = add_link_before_faq_or_footer(filepath, link_sentence)
        if success:
            stats['new_links_added'] += 1
            stats['pages_modified'].add(source_url)
            print(f"  Added link from {source_url} to {target}")
        else:
            success = add_contextual_link_in_body(filepath, link_sentence)
            if success:
                stats['new_links_added'] += 1
                stats['pages_modified'].add(source_url)
                print(f"  Added link (body) from {source_url} to {target}")


# ============================================================
# SUMMARY
# ============================================================

print("\n" + "=" * 60)
print("INTERNAL LINKING REBUILD COMPLETE")
print("=" * 60)
print(f"New internal links added: {stats['new_links_added']}")
print(f"Orphan pages fixed: {stats['orphans_fixed']} links to orphan pages")
print(f"Broken links fixed: {stats['broken_fixed']}")
print(f"Striking distance pages boosted: {stats['striking_distance_boosted']}")
print(f"Pages modified: {len(stats['pages_modified'])}")
print(f"Modified pages: {sorted(stats['pages_modified'])}")
