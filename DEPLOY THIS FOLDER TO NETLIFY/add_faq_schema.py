#!/usr/bin/env python3
"""
Add FAQPage JSON-LD schema to guide pages that have FAQ content but lack FAQPage schema.
Scans guides/ directory for both .html files and */index.html files.
"""

import os
import re
import json
from pathlib import Path
from bs4 import BeautifulSoup
import sys

def check_has_faq_schema(html_content):
    """Check if page already has FAQPage schema"""
    return '"@type":"FAQPage"' in html_content or '"@type": "FAQPage"' in html_content

def detect_faq_content(html_content):
    """
    Detect if page has FAQ content by looking for:
    - FAQ, Frequently Asked, Common Questions headers
    - Q&A patterns (headings followed by paragraphs)
    """
    soup = BeautifulSoup(html_content, 'html.parser')
    
    # Look for FAQ-related headings
    faq_keywords = ['faq', 'frequently asked', 'common questions', 'q&a', 'questions']
    
    # Check for FAQ headers
    for heading in soup.find_all(['h2', 'h3', 'h4', 'h5']):
        if heading.get_text().lower().strip().startswith('frequently asked') or \
           'faq' in heading.get_text().lower() or \
           'common questions' in heading.get_text().lower() or \
           heading.get_text().lower().strip().startswith('q&a'):
            return True, heading.get_text().strip()
    
    return False, None

def extract_qa_pairs(html_content):
    """
    Extract question/answer pairs from HTML.
    Looks for h3/h4 followed by paragraphs (Q&A pattern).
    """
    soup = BeautifulSoup(html_content, 'html.parser')
    qa_pairs = []
    
    # Find FAQ-related heading
    faq_header = None
    for heading in soup.find_all(['h2', 'h3', 'h4', 'h5']):
        if heading.get_text().lower().startswith('frequently asked') or \
           'faq' in heading.get_text().lower() or \
           'common questions' in heading.get_text().lower() or \
           heading.get_text().lower().startswith('q&a'):
            faq_header = heading
            break
    
    if not faq_header:
        return []
    
    # Find all h3/h4 tags after FAQ header (these are questions)
    current = faq_header.find_next_sibling()
    while current:
        if current.name in ['h3', 'h4']:
            question = current.get_text().strip()
            
            # Remove common question markers
            question = re.sub(r'^[\d\.\-\)\s]*', '', question).strip()
            question = re.sub(r'^(Q:|Question:)\s*', '', question, flags=re.IGNORECASE).strip()
            
            if question:
                # Get next paragraph as answer
                answer_elem = current.find_next('p')
                if answer_elem:
                    answer = answer_elem.get_text().strip()
                    
                    # Clean up answer text
                    answer = re.sub(r'^(A:|Answer:)\s*', '', answer, flags=re.IGNORECASE).strip()
                    
                    if answer and len(answer) > 20:  # Only add meaningful answers
                        qa_pairs.append({
                            'question': question,
                            'answer': answer
                        })
        
        # Stop if we hit another h2 (next major section)
        if current.name == 'h2':
            break
        
        current = current.find_next_sibling()
    
    return qa_pairs

def create_faq_schema(qa_pairs):
    """Create FAQPage JSON-LD schema from Q&A pairs"""
    if not qa_pairs:
        return None
    
    main_entity = []
    for pair in qa_pairs:
        main_entity.append({
            "@type": "Question",
            "name": pair['question'],
            "acceptedAnswer": {
                "@type": "Answer",
                "text": pair['answer']
            }
        })
    
    schema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": main_entity
    }
    
    return schema

def insert_schema_before_head_close(html_content, schema_json):
    """Insert JSON-LD schema before </head> tag"""
    schema_str = f"<script type=\"application/ld+json\">\n{json.dumps(schema_json, indent=2)}\n</script>"
    
    # Find closing head tag
    head_close_match = re.search(r'</head>', html_content, re.IGNORECASE)
    if head_close_match:
        insert_pos = head_close_match.start()
        return html_content[:insert_pos] + schema_str + "\n" + html_content[insert_pos:]
    
    return html_content

def process_guide_file(file_path):
    """Process a single guide file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check if already has FAQPage schema
        if check_has_faq_schema(content):
            return 'SKIP', 'Already has FAQPage schema'
        
        # Detect FAQ content
        has_faq, faq_header = detect_faq_content(content)
        if not has_faq:
            return 'NO_FAQ', 'No FAQ content detected'
        
        # Extract Q&A pairs
        qa_pairs = extract_qa_pairs(content)
        if not qa_pairs:
            return 'NO_QA_PAIRS', f'FAQ header found ("{faq_header}") but no Q&A pairs extracted'
        
        # Create schema
        schema = create_faq_schema(qa_pairs)
        
        # Insert into HTML
        updated_content = insert_schema_before_head_close(content, schema)
        
        # Write back
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(updated_content)
        
        return 'ADDED', f'Added FAQPage schema with {len(qa_pairs)} Q&A pairs'
    
    except Exception as e:
        return 'ERROR', str(e)

def main():
    guides_dir = Path('guides')
    
    if not guides_dir.exists():
        print("Error: 'guides' directory not found")
        sys.exit(1)
    
    results = {
        'ADDED': [],
        'SKIP': [],
        'NO_FAQ': [],
        'NO_QA_PAIRS': [],
        'ERROR': []
    }
    
    # Find all HTML files in guides/
    html_files = list(guides_dir.glob('*.html')) + list(guides_dir.glob('*/index.html'))
    
    print(f"Found {len(html_files)} guide files to scan\n")
    
    for file_path in sorted(html_files):
        status, message = process_guide_file(str(file_path))
        
        results[status].append({
            'file': str(file_path),
            'message': message
        })
        
        status_symbol = {
            'ADDED': '✓',
            'SKIP': '→',
            'NO_FAQ': '-',
            'NO_QA_PAIRS': '!',
            'ERROR': 'X'
        }
        
        print(f"{status_symbol[status]} {file_path}: {message}")
    
    # Summary
    print("\n" + "="*60)
    print("SUMMARY")
    print("="*60)
    print(f"Added FAQPage schema:  {len(results['ADDED'])} files")
    print(f"Skipped (already has): {len(results['SKIP'])} files")
    print(f"No FAQ content:        {len(results['NO_FAQ'])} files")
    print(f"FAQ found, no Q&A:     {len(results['NO_QA_PAIRS'])} files")
    print(f"Errors:                {len(results['ERROR'])} files")
    
    if results['ADDED']:
        print(f"\nFiles with added FAQPage schema:")
        for item in results['ADDED']:
            print(f"  - {item['file']}")
    
    if results['NO_QA_PAIRS']:
        print(f"\nFiles with FAQ header but no extractable Q&A pairs:")
        for item in results['NO_QA_PAIRS']:
            print(f"  - {item['file']}: {item['message']}")
    
    if results['ERROR']:
        print(f"\nFiles with errors:")
        for item in results['ERROR']:
            print(f"  - {item['file']}: {item['message']}")

if __name__ == '__main__':
    main()
