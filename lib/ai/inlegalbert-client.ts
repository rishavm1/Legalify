// InLegalBERT Client using HuggingFace Inference API
export interface LegalEntity {
  text: string;
  type: 'PERSON' | 'ORG' | 'GPE' | 'DATE' | 'STATUTE' | 'CASE' | 'COURT';
  score: number;
  start: number;
  end: number;
}

export interface SemanticSegment {
  type: 'PREAMBLE' | 'FACTS' | 'ARGUMENTS' | 'ANALYSIS' | 'STATUTE' | 'PRECEDENT' | 'RATIO' | 'RULING';
  text: string;
  start: number;
  end: number;
  confidence: number;
}

export interface StatuteIdentification {
  statute: string;
  relevance: number;
  sections: string[];
  reasoning: string;
}

export class InLegalBERTClient {
  private apiUrl = 'https://api-inference.huggingface.co/models/law-ai/InLegalBERT';
  private apiKey = process.env.HUGGINGFACE_API_KEY || '';

  async extractLegalEntities(text: string): Promise<LegalEntity[]> {
    try {
      if (!this.apiKey) {
        return this.fallbackNER(text);
      }

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ inputs: text })
      });

      if (!response.ok) {
        return this.fallbackNER(text);
      }

      const result = await response.json();
      return this.parseNERResult(result);
    } catch (error) {
      console.error('InLegalBERT NER failed:', error);
      return this.fallbackNER(text);
    }
  }

  async segmentDocument(text: string): Promise<SemanticSegment[]> {
    const segments: SemanticSegment[] = [];
    const lines = text.split('\n');
    let currentSegment: SemanticSegment | null = null;
    let currentText = '';
    let startLine = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const segmentType = this.identifySegmentType(line);
      
      if (segmentType && (!currentSegment || segmentType !== currentSegment.type)) {
        if (currentSegment && currentText) {
          segments.push({ ...currentSegment, text: currentText.trim() });
        }
        currentSegment = {
          type: segmentType,
          text: '',
          start: startLine,
          end: i,
          confidence: 0.85
        };
        currentText = line + '\n';
        startLine = i;
      } else if (currentSegment) {
        currentText += line + '\n';
        currentSegment.end = i;
      }
    }

    if (currentSegment && currentText) {
      segments.push({ ...currentSegment, text: currentText.trim() });
    }

    return segments;
  }

  async identifyStatutes(caseFacts: string): Promise<StatuteIdentification[]> {
    const statutes: StatuteIdentification[] = [];
    const factsLower = caseFacts.toLowerCase();

    const statuteMap = [
      { keywords: ['contract', 'agreement', 'breach'], statute: 'Indian Contract Act, 1872', sections: ['Section 73', 'Section 74'] },
      { keywords: ['property', 'land', 'sale', 'transfer'], statute: 'Transfer of Property Act, 1882', sections: ['Section 54', 'Section 55'] },
      { keywords: ['criminal', 'theft', 'assault', 'murder'], statute: 'Indian Penal Code, 1860', sections: ['Section 302', 'Section 379'] },
      { keywords: ['civil', 'suit', 'decree', 'appeal'], statute: 'Code of Civil Procedure, 1908', sections: ['Order 7', 'Order 21'] },
      { keywords: ['evidence', 'witness', 'document'], statute: 'Indian Evidence Act, 1872', sections: ['Section 3', 'Section 45'] },
      { keywords: ['company', 'director', 'shareholder'], statute: 'Companies Act, 2013', sections: ['Section 166', 'Section 241'] },
      { keywords: ['consumer', 'deficiency', 'service'], statute: 'Consumer Protection Act, 2019', sections: ['Section 2', 'Section 35'] },
      { keywords: ['real estate', 'builder', 'promoter'], statute: 'RERA, 2016', sections: ['Section 11', 'Section 18'] }
    ];

    statuteMap.forEach(({ keywords, statute, sections }) => {
      const matches = keywords.filter(kw => factsLower.includes(kw)).length;
      if (matches > 0) {
        const relevance = Math.min(matches / keywords.length, 1);
        statutes.push({
          statute,
          relevance,
          sections,
          reasoning: `Identified based on keywords: ${keywords.filter(kw => factsLower.includes(kw)).join(', ')}`
        });
      }
    });

    return statutes.sort((a, b) => b.relevance - a.relevance);
  }

  private identifySegmentType(line: string): SemanticSegment['type'] | null {
    const lineLower = line.toLowerCase();
    
    if (lineLower.match(/^(in the|before the|supreme court|high court)/)) return 'PREAMBLE';
    if (lineLower.match(/^(facts?|background|case background)/)) return 'FACTS';
    if (lineLower.match(/^(argument|submission|contention|petitioner|respondent)/)) return 'ARGUMENTS';
    if (lineLower.match(/^(analysis|discussion|consideration)/)) return 'ANALYSIS';
    if (lineLower.match(/^(section|article|act|statute)/)) return 'STATUTE';
    if (lineLower.match(/^(precedent|case law|relied upon)/)) return 'PRECEDENT';
    if (lineLower.match(/^(ratio|held|finding)/)) return 'RATIO';
    if (lineLower.match(/^(order|judgment|decree|ruling)/)) return 'RULING';
    
    return null;
  }

  private fallbackNER(text: string): LegalEntity[] {
    const entities: LegalEntity[] = [];
    
    // Person names
    const personRegex = /\b([A-Z][a-z]+ [A-Z][a-z]+)\b/g;
    let match;
    while ((match = personRegex.exec(text)) !== null) {
      entities.push({
        text: match[1],
        type: 'PERSON',
        score: 0.75,
        start: match.index,
        end: match.index + match[1].length
      });
    }

    // Statutes
    const statuteRegex = /\b(Section \d+[A-Z]?(?:\(\d+\))?(?:\s+of\s+[A-Za-z\s,]+Act,?\s+\d{4})?)\b/gi;
    while ((match = statuteRegex.exec(text)) !== null) {
      entities.push({
        text: match[1],
        type: 'STATUTE',
        score: 0.9,
        start: match.index,
        end: match.index + match[1].length
      });
    }

    return entities;
  }

  private parseNERResult(result: any): LegalEntity[] {
    if (!Array.isArray(result)) return [];
    
    return result.map((entity: any) => ({
      text: entity.word || entity.entity_group || '',
      type: this.mapEntityType(entity.entity_group || entity.entity),
      score: entity.score || 0.8,
      start: entity.start || 0,
      end: entity.end || 0
    }));
  }

  private mapEntityType(type: string): LegalEntity['type'] {
    const typeMap: Record<string, LegalEntity['type']> = {
      'PER': 'PERSON',
      'PERSON': 'PERSON',
      'ORG': 'ORG',
      'ORGANIZATION': 'ORG',
      'LOC': 'GPE',
      'GPE': 'GPE',
      'DATE': 'DATE',
      'STATUTE': 'STATUTE',
      'CASE': 'CASE',
      'COURT': 'COURT'
    };
    return typeMap[type.toUpperCase()] || 'ORG';
  }
}

export const inlegalbert = new InLegalBERTClient();
