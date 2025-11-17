#!/usr/bin/env python3
"""
Prepare training data for Supervised Fine-Tuning (SFT) of Llama/Gemma
"""
import json
from pathlib import Path

OUTPUT_FILE = Path("data/sft_training_data.jsonl")
OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)

def create_training_examples():
    """Create instruction-following examples for legal AI"""
    examples = [
        {
            "instruction": "Draft a civil petition for recovery of money",
            "input": "Plaintiff: Rajesh Kumar, Defendant: Suresh Sharma, Amount: Rs. 5,00,000, Reason: Loan not repaid, Date of loan: 15/01/2023",
            "output": """IN THE COURT OF CIVIL JUDGE (SENIOR DIVISION)
AT NEW DELHI

CIVIL SUIT NO. _____ OF 2024

RAJESH KUMAR
S/o Late Sh. Ram Kumar
R/o 123, Model Town, Delhi
                                                    ...Plaintiff
VERSUS

SURESH SHARMA
S/o Sh. Mohan Sharma
R/o 456, Rohini, Delhi
                                                    ...Defendant

PLAINT FOR RECOVERY OF MONEY

1. The plaintiff states that he advanced a loan of Rs. 5,00,000 to the defendant on 15/01/2023.

2. The defendant promised to repay the amount within 6 months but has failed to do so.

3. Despite repeated demands, the defendant has not repaid the amount.

PRAYER: The plaintiff prays for a decree of Rs. 5,00,000 with interest."""
        },
        {
            "instruction": "Generate legal arguments for a bail application",
            "input": "Case: FIR 123/2024, Sections: 420, 406 IPC, Accused: First time offender, Age: 25 years",
            "output": """ARGUMENTS FOR BAIL:

1. NATURE OF OFFENCE: The offences under Sections 420 and 406 IPC are bailable and non-heinous in nature.

2. FIRST TIME OFFENDER: The applicant has no prior criminal record and is a first-time offender.

3. YOUNG AGE: The applicant is only 25 years old and has his entire life ahead.

4. ROOTS IN SOCIETY: The applicant has deep roots in society and will not abscond.

5. TRIAL DELAY: The trial may take considerable time and the applicant should not languish in jail.

6. PRESUMPTION OF INNOCENCE: The applicant is presumed innocent until proven guilty.

PRECEDENTS:
- Sanjay Chandra v. CBI (2012): Bail is the rule, jail is the exception
- Gudikanti Narasimhulu v. Public Prosecutor (1978): Bail should be granted unless there are compelling reasons"""
        },
        {
            "instruction": "Draft a legal notice for defamation",
            "input": "Client: Dr. Amit Verma, Defamer: News Channel XYZ, Defamatory statement: False allegations of medical negligence, Date: 10/03/2024",
            "output": """LEGAL NOTICE

To,
The Editor
News Channel XYZ
Mumbai

Dear Sir/Madam,

SUBJECT: LEGAL NOTICE FOR DEFAMATION

On behalf of my client Dr. Amit Verma, I hereby serve you this legal notice for the defamatory statements broadcast on 10/03/2024.

1. My client is a renowned medical practitioner with 20 years of experience.

2. Your channel falsely alleged medical negligence without any basis.

3. These false allegations have damaged my client's reputation and practice.

4. You are hereby called upon to:
   a) Broadcast an unconditional apology
   b) Pay compensation of Rs. 50,00,000
   c) Cease and desist from further defamation

Failing compliance within 15 days, my client will initiate legal proceedings.

Yours faithfully,
Advocate for Dr. Amit Verma"""
        },
        {
            "instruction": "Analyze judgment and extract key points",
            "input": "Case: Vishaka v. State of Rajasthan (1997), Topic: Sexual harassment at workplace",
            "output": """JUDGMENT ANALYSIS: Vishaka v. State of Rajasthan (1997)

COURT: Supreme Court of India

KEY HOLDING: The Supreme Court laid down guidelines for prevention of sexual harassment at workplace.

VISHAKA GUIDELINES:
1. Employers must prevent and deter sexual harassment
2. Complaints Committee must be constituted
3. Complaint mechanism must be established
4. Awareness programs must be conducted
5. Penalties for false complaints

LEGAL SIGNIFICANCE:
- First case to recognize sexual harassment as violation of fundamental rights
- Guidelines remained in force until Sexual Harassment Act 2013
- Landmark judgment for women's rights

APPLICABILITY: Binding on all employers in India until superseded by statute"""
        },
        {
            "instruction": "Draft counter arguments for opponent's petition",
            "input": "Opponent argues: Contract is void due to fraud. Our position: Contract is valid, no fraud committed",
            "output": """COUNTER ARGUMENTS:

1. BURDEN OF PROOF: The opponent has failed to discharge the burden of proving fraud as required under Section 19 of Indian Contract Act.

2. NO EVIDENCE OF FRAUD: The opponent has not produced any evidence of misrepresentation or concealment of facts.

3. VALID CONTRACT: All essential elements of a valid contract under Section 10 ICA are present.

4. ESTOPPEL: The opponent cannot now claim fraud after accepting benefits under the contract.

5. DELAY AND LACHES: The opponent's delay in raising fraud indicates the claim is an afterthought.

PRECEDENTS:
- Derry v. Peek: Fraud must be proved with clear evidence
- Radhakrishnan v. Babu: Mere non-disclosure is not fraud

PRAYER: The opponent's petition be dismissed with costs."""
        }
    ]
    
    return examples

def format_for_llama(examples):
    """Format data for Llama fine-tuning"""
    formatted = []
    for ex in examples:
        formatted.append({
            "text": f"<s>[INST] {ex['instruction']}\n\nInput: {ex['input']} [/INST]\n\n{ex['output']}</s>"
        })
    return formatted

def format_for_gemma(examples):
    """Format data for Gemma fine-tuning"""
    formatted = []
    for ex in examples:
        formatted.append({
            "prompt": f"Instruction: {ex['instruction']}\nInput: {ex['input']}\nOutput:",
            "completion": ex['output']
        })
    return formatted

def save_training_data(examples):
    # Save in JSONL format for training
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        for ex in examples:
            f.write(json.dumps(ex, ensure_ascii=False) + '\n')
    
    print(f"Saved {len(examples)} training examples to {OUTPUT_FILE}")
    
    # Also save formatted versions
    llama_file = OUTPUT_FILE.parent / "sft_llama_format.jsonl"
    with open(llama_file, 'w', encoding='utf-8') as f:
        for ex in format_for_llama(examples):
            f.write(json.dumps(ex, ensure_ascii=False) + '\n')
    print(f"Saved Llama format to {llama_file}")
    
    gemma_file = OUTPUT_FILE.parent / "sft_gemma_format.jsonl"
    with open(gemma_file, 'w', encoding='utf-8') as f:
        for ex in format_for_gemma(examples):
            f.write(json.dumps(ex, ensure_ascii=False) + '\n')
    print(f"Saved Gemma format to {gemma_file}")

def main():
    print("Preparing SFT training data...")
    examples = create_training_examples()
    save_training_data(examples)
    print(f"\nTraining data ready! Total examples: {len(examples)}")
    print("\nNext steps:")
    print("1. Collect 500+ more examples from templates")
    print("2. Upload to HuggingFace or use locally")
    print("3. Fine-tune using: python scripts/finetune_model.py")

if __name__ == "__main__":
    main()
