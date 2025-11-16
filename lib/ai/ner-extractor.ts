// Named Entity Recognition for Legal Documents
export interface LegalEntity {
  type: 'person' | 'organization' | 'date' | 'money' | 'location' | 'case_number' | 'statute';
  value: string;
  confidence: number;
  position: { start: number; end: number };
}

export interface DocumentFacts {
  parties: string[];
  dates: string[];
  amounts: string[];
  locations: string[];
  caseNumbers: string[];
  statutes: string[];
  keyTerms: string[];
}

export class NERExtractor {
  extractEntities(text: string): LegalEntity[] {
    const entities: LegalEntity[] = [];

    // Extract persons (capitalized names)
    const personRegex = /\b([A-Z][a-z]+ [A-Z][a-z]+(?:\s[A-Z][a-z]+)?)\b/g;
    let match;
    while ((match = personRegex.exec(text)) !== null) {
      entities.push({
        type: 'person',
        value: match[1],
        confidence: 0.8,
        position: { start: match.index, end: match.index + match[1].length }
      });
    }

    // Extract organizations
    const orgKeywords = ['Ltd', 'Limited', 'Pvt', 'Private', 'Corporation', 'Company', 'Inc', 'LLC'];
    orgKeywords.forEach(keyword => {
      const orgRegex = new RegExp(`([A-Z][A-Za-z\\s]+${keyword}\\.?)`, 'g');
      while ((match = orgRegex.exec(text)) !== null) {
        entities.push({
          type: 'organization',
          value: match[1],
          confidence: 0.9,
          position: { start: match.index, end: match.index + match[1].length }
        });
      }
    });

    // Extract dates
    const datePatterns = [
      /\b(\d{1,2}[/-]\d{1,2}[/-]\d{4})\b/g,
      /\b(\d{4}-\d{2}-\d{2})\b/g,
      /\b(\d{1,2}(?:st|nd|rd|th)?\s+(?:January|February|March|April|May|June|July|August|September|October|November|December),?\s+\d{4})\b/gi
    ];
    
    datePatterns.forEach(pattern => {
      while ((match = pattern.exec(text)) !== null) {
        entities.push({
          type: 'date',
          value: match[1],
          confidence: 0.95,
          position: { start: match.index, end: match.index + match[1].length }
        });
      }
    });

    // Extract money amounts
    const moneyRegex = /(?:Rs\.?|INR|₹)\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/gi;
    while ((match = moneyRegex.exec(text)) !== null) {
      entities.push({
        type: 'money',
        value: match[0],
        confidence: 0.95,
        position: { start: match.index, end: match.index + match[0].length }
      });
    }

    // Extract locations (Indian cities and states)
    const indianLocations = [
      'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad',
      'Maharashtra', 'Karnataka', 'Tamil Nadu', 'West Bengal', 'Gujarat', 'Rajasthan', 'Uttar Pradesh'
    ];
    indianLocations.forEach(location => {
      const locationRegex = new RegExp(`\\b(${location})\\b`, 'gi');
      while ((match = locationRegex.exec(text)) !== null) {
        entities.push({
          type: 'location',
          value: match[1],
          confidence: 0.9,
          position: { start: match.index, end: match.index + match[1].length }
        });
      }
    });

    // Extract case numbers
    const caseRegex = /\b([A-Z]+\s+(?:No\.|Number)\s*\d+\/\d{4})\b/g;
    while ((match = caseRegex.exec(text)) !== null) {
      entities.push({
        type: 'case_number',
        value: match[1],
        confidence: 0.9,
        position: { start: match.index, end: match.index + match[1].length }
      });
    }

    // Extract statute references
    const statuteRegex = /\b((?:Section|Article|Rule)\s+\d+[A-Z]?(?:\(\d+\))?(?:\s+of\s+[A-Za-z\s,]+Act,?\s+\d{4})?)\b/gi;
    while ((match = statuteRegex.exec(text)) !== null) {
      entities.push({
        type: 'statute',
        value: match[1],
        confidence: 0.85,
        position: { start: match.index, end: match.index + match[1].length }
      });
    }

    return entities;
  }

  extractFacts(text: string): DocumentFacts {
    const entities = this.extractEntities(text);
    
    return {
      parties: [...new Set(entities.filter(e => e.type === 'person' || e.type === 'organization').map(e => e.value))],
      dates: [...new Set(entities.filter(e => e.type === 'date').map(e => e.value))],
      amounts: [...new Set(entities.filter(e => e.type === 'money').map(e => e.value))],
      locations: [...new Set(entities.filter(e => e.type === 'location').map(e => e.value))],
      caseNumbers: [...new Set(entities.filter(e => e.type === 'case_number').map(e => e.value))],
      statutes: [...new Set(entities.filter(e => e.type === 'statute').map(e => e.value))],
      keyTerms: this.extractKeyTerms(text)
    };
  }

  private extractKeyTerms(text: string): string[] {
    const legalTerms = [
      'plaintiff', 'defendant', 'petitioner', 'respondent', 'appellant', 'agreement',
      'contract', 'consideration', 'breach', 'damages', 'injunction', 'liability',
      'indemnity', 'warranty', 'covenant', 'arbitration', 'jurisdiction', 'force majeure',
      'termination', 'renewal', 'amendment', 'assignment', 'sublease', 'mortgage'
    ];

    const textLower = text.toLowerCase();
    return legalTerms.filter(term => textLower.includes(term));
  }

  generateSummary(facts: DocumentFacts): string {
    const parts: string[] = [];

    if (facts.parties.length > 0) {
      parts.push(`**Parties**: ${facts.parties.join(', ')}`);
    }
    if (facts.dates.length > 0) {
      parts.push(`**Key Dates**: ${facts.dates.slice(0, 3).join(', ')}`);
    }
    if (facts.amounts.length > 0) {
      parts.push(`**Amounts**: ${facts.amounts.join(', ')}`);
    }
    if (facts.locations.length > 0) {
      parts.push(`**Locations**: ${facts.locations.join(', ')}`);
    }
    if (facts.caseNumbers.length > 0) {
      parts.push(`**Case Numbers**: ${facts.caseNumbers.join(', ')}`);
    }
    if (facts.statutes.length > 0) {
      parts.push(`**Legal References**: ${facts.statutes.slice(0, 3).join(', ')}`);
    }
    if (facts.keyTerms.length > 0) {
      parts.push(`**Key Legal Terms**: ${facts.keyTerms.slice(0, 5).join(', ')}`);
    }

    return parts.join('\n\n');
  }
}

export const nerExtractor = new NERExtractor();
