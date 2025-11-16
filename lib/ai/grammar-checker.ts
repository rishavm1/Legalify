// Grammar and Legal Error Detection Service
export interface GrammarError {
  message: string;
  offset: number;
  length: number;
  replacements: string[];
  rule: string;
  category: string;
}

export interface LegalError {
  type: 'missing_clause' | 'ambiguous_term' | 'invalid_format' | 'compliance_issue';
  message: string;
  location: string;
  severity: 'high' | 'medium' | 'low';
  suggestion: string;
}

export class GrammarChecker {
  async checkGrammar(text: string): Promise<GrammarError[]> {
    try {
      // LanguageTool API integration
      const response = await fetch('https://api.languagetool.org/v2/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          text,
          language: 'en-US',
          enabledOnly: 'false'
        })
      });

      const data = await response.json();
      return data.matches.map((match: any) => ({
        message: match.message,
        offset: match.offset,
        length: match.length,
        replacements: match.replacements.map((r: any) => r.value).slice(0, 3),
        rule: match.rule.id,
        category: match.rule.category.name
      }));
    } catch (error) {
      console.error('Grammar check failed:', error);
      return [];
    }
  }

  async checkLegalErrors(text: string): Promise<LegalError[]> {
    const errors: LegalError[] = [];
    const textLower = text.toLowerCase();

    // Check for essential clauses in agreements
    const essentialClauses = [
      { term: 'parties', message: 'Missing parties identification' },
      { term: 'consideration', message: 'Missing consideration clause' },
      { term: 'term', message: 'Missing agreement term/duration' },
      { term: 'termination', message: 'Missing termination clause' },
      { term: 'dispute', message: 'Missing dispute resolution clause' }
    ];

    essentialClauses.forEach(clause => {
      if (!textLower.includes(clause.term)) {
        errors.push({
          type: 'missing_clause',
          message: clause.message,
          location: 'Document',
          severity: 'high',
          suggestion: `Add a ${clause.term} clause to make the agreement legally binding`
        });
      }
    });

    // Check for ambiguous terms
    const ambiguousTerms = ['reasonable', 'appropriate', 'timely', 'soon', 'promptly'];
    ambiguousTerms.forEach(term => {
      if (textLower.includes(term)) {
        errors.push({
          type: 'ambiguous_term',
          message: `Ambiguous term found: "${term}"`,
          location: `Contains "${term}"`,
          severity: 'medium',
          suggestion: `Replace "${term}" with specific timeframes or measurable criteria`
        });
      }
    });

    // Check for proper date format
    if (!text.match(/\d{1,2}[/-]\d{1,2}[/-]\d{4}/) && !text.match(/\d{4}-\d{2}-\d{2}/)) {
      errors.push({
        type: 'invalid_format',
        message: 'No proper date format found',
        location: 'Document',
        severity: 'medium',
        suggestion: 'Include execution date in DD/MM/YYYY or YYYY-MM-DD format'
      });
    }

    // Check for Indian law compliance
    if (textLower.includes('agreement') && !textLower.includes('indian contract act')) {
      errors.push({
        type: 'compliance_issue',
        message: 'Missing reference to Indian Contract Act, 1872',
        location: 'Document',
        severity: 'low',
        suggestion: 'Add reference to Indian Contract Act, 1872 for legal validity'
      });
    }

    return errors;
  }
}

export const grammarChecker = new GrammarChecker();
