#!/usr/bin/env python3
"""
Quick setup - Creates sample legal database without web scraping
"""
import json
import os
from pathlib import Path

# Sample Indian legal acts content
SAMPLE_LEGAL_ACTS = {
    "Indian Penal Code 1860 - Section 420": """
Section 420 in The Indian Penal Code
Cheating and dishonestly inducing delivery of property.—Whoever cheats and thereby dishonestly induces the person deceived to deliver any property to any person, or to make, alter or destroy the whole or any part of a valuable security, or anything which is signed or sealed, and which is capable of being converted into a valuable security, shall be punished with imprisonment of either description for a term which may extend to seven years, and shall also be liable to fine.
""",
    "Indian Contract Act 1872 - Section 10": """
Section 10 in The Indian Contract Act, 1872
What agreements are contracts.—All agreements are contracts if they are made by the free consent of parties competent to contract, for a lawful consideration and with a lawful object, and are not hereby expressly declared to be void.
""",
    "Code of Criminal Procedure 1973 - Section 154": """
Section 154 in The Code Of Criminal Procedure, 1973
Information in cognizable cases.—(1) Every information relating to the commission of a cognizable offence, if given orally to an officer in charge of a police station, shall be reduced to writing by him or under his direction, and be read over to the informant; and every such information, whether given in writing or reduced to writing as aforesaid, shall be signed by the person giving it, and the substance thereof shall be entered in a book to be kept by such officer in such form as the State Government may prescribe in this behalf.
""",
    "Code of Civil Procedure 1908 - Order 7 Rule 1": """
Order VII Rule 1 in The Code Of Civil Procedure, 1908
Plaint to contain facts, not evidence.—(1) Every plaint shall contain the following particulars:—
(a) the name of the Court in which the suit is brought;
(b) the name, description and place of residence of the plaintiff;
(c) the name, description and place of residence of the defendant, so far as they can be ascertained;
(d) where the plaintiff or the defendant is a minor or a person of unsound mind, a statement to that effect;
(e) the facts constituting the cause of action and when it arose;
(f) the facts showing that the Court has jurisdiction;
(g) the relief which the plaintiff claims;
(h) where the plaintiff has allowed a set-off or relinquished a portion of his claim, the amount so allowed or relinquished; and
(i) a statement of the value of the subject-matter of the suit for the purposes of jurisdiction and of court-fees, so far as the case admits.
""",
    "Indian Evidence Act 1872 - Section 3": """
Section 3 in The Indian Evidence Act, 1872
Interpretation clause.—In this Act the following words and expressions are used in the following senses, unless a contrary intention appears from the context:—
"Court".—"Court" includes all Judges and Magistrates and all persons, except arbitrators, legally authorised to take evidence.
"Fact".—"Fact" means and includes—
(1) any thing, state of things, or relation of things, capable of being perceived by the senses;
(2) any mental condition of which any person is conscious.
""",
    "Transfer of Property Act 1882 - Section 5": """
Section 5 in The Transfer Of Property Act, 1882
Transfer of property defined.—In the following sections "transfer of property" means an act by which a living person conveys property, in present or in future, to one or more other living persons, or to himself, or to himself and one or more other living persons; and "to transfer property" is to perform such act.
In this section "living person" includes a company or association or body of individuals, whether incorporated or not, but nothing herein contained shall affect any law for the time being in force relating to transfer of property to or by companies, associations or bodies of individuals.
""",
    "Constitution of India - Article 21": """
Article 21 in The Constitution Of India 1949
Protection of life and personal liberty.—No person shall be deprived of his life or personal liberty except according to procedure established by law.
""",
    "Consumer Protection Act 2019 - Section 2": """
Section 2 in The Consumer Protection Act, 2019
Definitions.—(1) In this Act, unless the context otherwise requires,—
(7) "consumer" means any person who—
(i) buys any goods for a consideration which has been paid or promised or partly paid and partly promised, or under any system of deferred payment and includes any user of such goods other than the person who buys such goods for consideration paid or promised or partly paid or partly promised, or under any system of deferred payment, when such use is made with the approval of such person, but does not include a person who obtains such goods for resale or for any commercial purpose;
""",
    "Information Technology Act 2000 - Section 43": """
Section 43 in The Information Technology Act, 2000
Penalty and Compensation for damage to computer, computer system, etc.—If any person without permission of the owner or any other person who is in charge of a computer, computer system or computer network,—
(a) accesses or secures access to such computer, computer system or computer network or computer resource;
(b) downloads, copies or extracts any data, computer data base or information from such computer, computer system or computer network including information or data held or stored in any removable storage medium;
commits the offence of hacking and shall be liable to pay damages by way of compensation to the person so affected.
""",
    "Arbitration and Conciliation Act 1996 - Section 7": """
Section 7 in The Arbitration And Conciliation Act, 1996
Arbitration agreement.—(1) In this Part, "arbitration agreement" means an agreement by the parties to submit to arbitration all or certain disputes which have arisen or which may arise between them in respect of a defined legal relationship, whether contractual or not.
(2) An arbitration agreement may be in the form of an arbitration clause in a contract or in the form of a separate agreement.
""",
}

def create_sample_legal_database():
    """Create sample legal database"""
    print("\n[INFO] Creating sample legal database...")
    
    # Create data directory
    data_dir = Path("data/legal_acts")
    data_dir.mkdir(parents=True, exist_ok=True)
    
    # Save each act as .txt file
    for title, content in SAMPLE_LEGAL_ACTS.items():
        filename = f"{title.replace('/', '_').replace(' ', '_')}.txt"
        filepath = data_dir / filename
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"[OK] Created: {filename}")
    
    print(f"\n[SUCCESS] Created {len(SAMPLE_LEGAL_ACTS)} legal documents")
    return len(SAMPLE_LEGAL_ACTS)

def build_rag_database():
    """Build RAG database with embeddings"""
    print("\n[INFO] Building RAG database...")
    
    data_dir = Path("data/legal_acts")
    rag_data = []
    
    # Load all documents
    for txt_file in data_dir.glob("*.txt"):
        with open(txt_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Create chunks
        chunks = [content[i:i+1000] for i in range(0, len(content), 800)]
        
        for idx, chunk in enumerate(chunks):
            # Simple embedding (768 dimensions)
            embedding = [0.0] * 768
            words = chunk.lower().split()
            for word in words[:100]:
                hash_val = hash(word) % 768
                embedding[hash_val] += 1.0
            
            # Normalize
            magnitude = sum(x**2 for x in embedding) ** 0.5
            if magnitude > 0:
                embedding = [x / magnitude for x in embedding]
            
            rag_data.append({
                'title': txt_file.stem,
                'content': chunk,
                'embedding': embedding,
                'chunk_id': len(rag_data)
            })
    
    # Save to JSON
    output_file = "data/rag_database.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(rag_data, f, indent=2)
    
    print(f"[SUCCESS] Created RAG database with {len(rag_data)} chunks")
    print(f"[OUTPUT] File: {output_file}")
    return output_file

def create_sample_templates():
    """Create sample legal templates"""
    print("\n[INFO] Creating sample templates...")
    
    templates_dir = Path("data/templates")
    templates_dir.mkdir(parents=True, exist_ok=True)
    
    templates = {
        "civil_petition": {
            "name": "Civil Petition Template",
            "content": """IN THE COURT OF {COURT_NAME}
AT {PLACE}

CIVIL SUIT NO. _____ OF {YEAR}

{PLAINTIFF_NAME}
                                                    ...Plaintiff
VERSUS

{DEFENDANT_NAME}
                                                    ...Defendant

PLAINT UNDER ORDER VII RULE 1 CPC

The Plaintiff most respectfully submits:

1. PARTIES: {PARTY_DETAILS}
2. FACTS: {FACTS}
3. CAUSE OF ACTION: {CAUSE_OF_ACTION}
4. RELIEF SOUGHT: {RELIEF}

Place: {PLACE}
Date: {DATE}
                                                    Plaintiff""",
            "fields": ["COURT_NAME", "PLACE", "YEAR", "PLAINTIFF_NAME", "DEFENDANT_NAME", "PARTY_DETAILS", "FACTS", "CAUSE_OF_ACTION", "RELIEF", "DATE"]
        },
        "bail_application": {
            "name": "Bail Application Template",
            "content": """IN THE COURT OF {COURT_NAME}

BAIL APPLICATION NO. _____ OF {YEAR}
IN FIR NO. {FIR_NUMBER}

{APPLICANT_NAME}
                                                    ...Applicant
VERSUS

STATE OF {STATE}
                                                    ...Respondent

APPLICATION FOR GRANT OF BAIL

The Applicant submits:
1. The applicant has been falsely implicated.
2. The applicant is innocent.
3. The applicant will abide by all conditions.

PRAYER: Grant bail to the applicant.

Date: {DATE}
                                                    Applicant""",
            "fields": ["COURT_NAME", "YEAR", "FIR_NUMBER", "APPLICANT_NAME", "STATE", "DATE"]
        },
        "legal_notice": {
            "name": "Legal Notice Template",
            "content": """LEGAL NOTICE

To,
{RECIPIENT_NAME}
{RECIPIENT_ADDRESS}

Dear Sir/Madam,

SUBJECT: {SUBJECT}

On behalf of my client {CLIENT_NAME}, I serve you this legal notice.

{NOTICE_CONTENT}

You are called upon to {DEMAND} within 15 days.

Failing which, legal action will be initiated.

Yours faithfully,
{ADVOCATE_NAME}
Advocate for {CLIENT_NAME}""",
            "fields": ["RECIPIENT_NAME", "RECIPIENT_ADDRESS", "SUBJECT", "CLIENT_NAME", "NOTICE_CONTENT", "DEMAND", "ADVOCATE_NAME"]
        }
    }
    
    output_file = templates_dir / "templates_collection.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(templates, f, indent=2)
    
    print(f"[SUCCESS] Created {len(templates)} templates")
    print(f"[OUTPUT] File: {output_file}")
    return len(templates)

def main():
    print("""
    ========================================================
    
            LEGALIFY - QUICK SETUP
            Sample Data Generation
    
    ========================================================
    """)
    
    # Step 1: Create sample legal database
    docs_count = create_sample_legal_database()
    
    # Step 2: Build RAG database
    rag_file = build_rag_database()
    
    # Step 3: Create templates
    templates_count = create_sample_templates()
    
    print("""
    ========================================================
    
                QUICK SETUP COMPLETE!
    
    ========================================================
    
    WHAT WAS CREATED:
    - 10 Indian legal acts (sample)
    - RAG database with embeddings
    - 3 legal templates
    - Training data (already exists)
    
    OUTPUT FILES:
    - data/legal_acts/*.txt (10 acts)
    - data/rag_database.json (RAG embeddings)
    - data/templates/templates_collection.json (3 templates)
    
    NEXT STEPS:
    
    1. Upload RAG database to Supabase:
       - Go to Supabase Dashboard
       - Table Editor -> legal_documents
       - Import data/rag_database.json
    
    2. Deploy to production:
       vercel --prod
    
    3. Test all features at:
       https://legalifylunatics.vercel.app
    
    Your AI Legal Companion is ready to use!
    """)

if __name__ == "__main__":
    main()
