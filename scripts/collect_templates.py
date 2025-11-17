#!/usr/bin/env python3
"""
Collect legal templates from Supreme Court and eCourts for fine-tuning
"""
import requests
from bs4 import BeautifulSoup
import json
import time
from pathlib import Path

OUTPUT_DIR = Path("data/templates")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

TEMPLATE_SOURCES = [
    {
        "name": "Supreme Court Forms",
        "url": "https://main.sci.gov.in/forms",
        "type": "petition"
    },
    {
        "name": "Delhi High Court Forms",
        "url": "https://delhihighcourt.nic.in/forms.asp",
        "type": "petition"
    },
]

TEMPLATE_TYPES = [
    "Civil Petition",
    "Criminal Petition",
    "Writ Petition",
    "Special Leave Petition",
    "Review Petition",
    "Bail Application",
    "Anticipatory Bail",
    "Vakalatnama",
    "Affidavit",
    "Written Statement",
    "Reply",
    "Rejoinder",
    "Legal Notice",
    "Counter Notice",
    "Memorandum of Appeal",
]

def scrape_templates():
    templates = []
    
    for source in TEMPLATE_SOURCES:
        print(f"Scraping {source['name']}...")
        try:
            response = requests.get(source['url'], timeout=10)
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Find PDF links
            pdf_links = soup.find_all('a', href=lambda x: x and x.endswith('.pdf'))
            
            for link in pdf_links[:10]:  # Limit to 10 per source
                pdf_url = link.get('href')
                if not pdf_url.startswith('http'):
                    pdf_url = source['url'].rsplit('/', 1)[0] + '/' + pdf_url
                
                template_name = link.text.strip() or link.get('title', 'Unknown')
                
                templates.append({
                    "name": template_name,
                    "url": pdf_url,
                    "source": source['name'],
                    "type": source['type']
                })
                
            time.sleep(2)
        except Exception as e:
            print(f"Error scraping {source['name']}: {e}")
    
    return templates

def create_manual_templates():
    """Create manual templates for common legal documents"""
    manual_templates = [
        {
            "type": "Civil Petition",
            "name": "Civil Suit Template",
            "content": """IN THE COURT OF {COURT_NAME}
AT {PLACE}

CIVIL SUIT NO. _____ OF {YEAR}

{PLAINTIFF_NAME}
S/o {FATHER_NAME}
R/o {ADDRESS}
                                                    ...Plaintiff

VERSUS

{DEFENDANT_NAME}
S/o {FATHER_NAME}
R/o {ADDRESS}
                                                    ...Defendant

PLAINT UNDER ORDER VII RULE 1 CPC

The Plaintiff most respectfully submits as under:

1. PARTIES:
{PARTY_DETAILS}

2. FACTS:
{FACTS}

3. CAUSE OF ACTION:
{CAUSE_OF_ACTION}

4. JURISDICTION:
{JURISDICTION}

5. VALUATION:
{VALUATION}

6. RELIEF SOUGHT:
{RELIEF}

VERIFICATION:
I, {PLAINTIFF_NAME}, the plaintiff above named, do hereby verify that the contents of the above plaint are true to my knowledge and belief.

Place: {PLACE}
Date: {DATE}
                                                    Plaintiff""",
            "fields": ["COURT_NAME", "PLACE", "YEAR", "PLAINTIFF_NAME", "FATHER_NAME", "ADDRESS", "DEFENDANT_NAME", "PARTY_DETAILS", "FACTS", "CAUSE_OF_ACTION", "JURISDICTION", "VALUATION", "RELIEF", "DATE"]
        },
        {
            "type": "Bail Application",
            "name": "Bail Application Template",
            "content": """IN THE COURT OF {COURT_NAME}
AT {PLACE}

BAIL APPLICATION NO. _____ OF {YEAR}
IN
FIR NO. {FIR_NUMBER}
U/S {SECTIONS}
P.S. {POLICE_STATION}

{APPLICANT_NAME}
S/o {FATHER_NAME}
R/o {ADDRESS}
                                                    ...Applicant

VERSUS

STATE OF {STATE}
                                                    ...Respondent

APPLICATION FOR GRANT OF BAIL

The Applicant most respectfully submits:

1. That the applicant has been falsely implicated in FIR No. {FIR_NUMBER}.

2. That the applicant is innocent and has been falsely implicated.

3. That the applicant is ready to abide by any conditions imposed by this Hon'ble Court.

4. That the applicant has deep roots in society and will not abscond.

5. That the applicant is willing to furnish bail bonds and sureties.

PRAYER:
It is therefore most respectfully prayed that this Hon'ble Court may be pleased to grant bail to the applicant.

Place: {PLACE}
Date: {DATE}
                                                    Applicant""",
            "fields": ["COURT_NAME", "PLACE", "YEAR", "FIR_NUMBER", "SECTIONS", "POLICE_STATION", "APPLICANT_NAME", "FATHER_NAME", "ADDRESS", "STATE", "DATE"]
        }
    ]
    
    return manual_templates

def save_templates(templates):
    output_file = OUTPUT_DIR / "templates_collection.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(templates, f, indent=2, ensure_ascii=False)
    print(f"Saved {len(templates)} templates to {output_file}")

def main():
    print("Starting template collection...")
    
    # Scrape online templates
    scraped = scrape_templates()
    print(f"Scraped {len(scraped)} templates")
    
    # Add manual templates
    manual = create_manual_templates()
    print(f"Created {len(manual)} manual templates")
    
    all_templates = {
        "scraped_templates": scraped,
        "manual_templates": manual,
        "total_count": len(scraped) + len(manual)
    }
    
    save_templates(all_templates)
    print("Template collection complete!")

if __name__ == "__main__":
    main()
