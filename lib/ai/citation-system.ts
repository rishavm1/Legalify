// Legal Citation System for Indian Law
export interface Citation {
  id: string;
  type: 'case' | 'statute' | 'article' | 'regulation';
  title: string;
  reference: string;
  year?: number;
  court?: string;
  url?: string;
  relevance: number;
}

export interface ResearchResult {
  query: string;
  citations: Citation[];
  summary: string;
  confidence: number;
}

export class CitationSystem {
  private indianStatutes = [
    { id: 'ICA1872', title: 'Indian Contract Act', year: 1872, reference: 'Act No. 9 of 1872' },
    { id: 'IPC1860', title: 'Indian Penal Code', year: 1860, reference: 'Act No. 45 of 1860' },
    { id: 'CPC1908', title: 'Code of Civil Procedure', year: 1908, reference: 'Act No. 5 of 1908' },
    { id: 'CrPC1973', title: 'Code of Criminal Procedure', year: 1973, reference: 'Act No. 2 of 1974' },
    { id: 'IEA1872', title: 'Indian Evidence Act', year: 1872, reference: 'Act No. 1 of 1872' },
    { id: 'TPA1882', title: 'Transfer of Property Act', year: 1882, reference: 'Act No. 4 of 1882' },
    { id: 'RA1949', title: 'Registration Act', year: 1949, reference: 'Act No. 16 of 1908' },
    { id: 'LA1894', title: 'Land Acquisition Act', year: 1894, reference: 'Act No. 1 of 1894' },
    { id: 'RERA2016', title: 'Real Estate (Regulation and Development) Act', year: 2016, reference: 'Act No. 16 of 2016' },
    { id: 'CA2013', title: 'Companies Act', year: 2013, reference: 'Act No. 18 of 2013' }
  ];

  private landmarkCases = [
    {
      id: 'KESAVANANDA1973',
      title: 'Kesavananda Bharati v. State of Kerala',
      year: 1973,
      court: 'Supreme Court of India',
      reference: 'AIR 1973 SC 1461',
      summary: 'Basic structure doctrine'
    },
    {
      id: 'MANEKA1978',
      title: 'Maneka Gandhi v. Union of India',
      year: 1978,
      court: 'Supreme Court of India',
      reference: 'AIR 1978 SC 597',
      summary: 'Right to life and personal liberty'
    },
    {
      id: 'VISHAKA1997',
      title: 'Vishaka v. State of Rajasthan',
      year: 1997,
      court: 'Supreme Court of India',
      reference: 'AIR 1997 SC 3011',
      summary: 'Sexual harassment at workplace'
    }
  ];

  async searchCitations(query: string, type?: 'case' | 'statute'): Promise<Citation[]> {
    const citations: Citation[] = [];
    const queryLower = query.toLowerCase();

    // Search statutes
    if (!type || type === 'statute') {
      this.indianStatutes.forEach(statute => {
        const relevance = this.calculateRelevance(queryLower, statute.title.toLowerCase());
        if (relevance > 0.3) {
          citations.push({
            id: statute.id,
            type: 'statute',
            title: statute.title,
            reference: statute.reference,
            year: statute.year,
            url: `https://www.indiacode.nic.in/`,
            relevance
          });
        }
      });
    }

    // Search cases
    if (!type || type === 'case') {
      this.landmarkCases.forEach(caseItem => {
        const relevance = this.calculateRelevance(queryLower, 
          `${caseItem.title} ${caseItem.summary}`.toLowerCase());
        if (relevance > 0.3) {
          citations.push({
            id: caseItem.id,
            type: 'case',
            title: caseItem.title,
            reference: caseItem.reference,
            year: caseItem.year,
            court: caseItem.court,
            url: `https://indiankanoon.org/`,
            relevance
          });
        }
      });
    }

    return citations.sort((a, b) => b.relevance - a.relevance).slice(0, 10);
  }

  async conductResearch(query: string): Promise<ResearchResult> {
    const citations = await this.searchCitations(query);
    
    const summary = this.generateResearchSummary(query, citations);
    const confidence = citations.length > 0 ? Math.min(0.95, citations[0].relevance + 0.2) : 0.5;

    return {
      query,
      citations,
      summary,
      confidence
    };
  }

  private calculateRelevance(query: string, text: string): number {
    const queryWords = query.split(/\s+/).filter(w => w.length > 3);
    const matches = queryWords.filter(word => text.includes(word)).length;
    return matches / Math.max(queryWords.length, 1);
  }

  private generateResearchSummary(query: string, citations: Citation[]): string {
    if (citations.length === 0) {
      return `No direct citations found for "${query}". Consider consulting with a legal professional for specific guidance.`;
    }

    const parts: string[] = [`**Legal Research Results for**: ${query}\n`];

    const statutes = citations.filter(c => c.type === 'statute');
    if (statutes.length > 0) {
      parts.push(`**Relevant Statutes**:`);
      statutes.slice(0, 3).forEach(s => {
        parts.push(`- ${s.title}, ${s.year} (${s.reference})`);
      });
      parts.push('');
    }

    const cases = citations.filter(c => c.type === 'case');
    if (cases.length > 0) {
      parts.push(`**Relevant Case Law**:`);
      cases.slice(0, 3).forEach(c => {
        parts.push(`- ${c.title} (${c.reference})`);
        if (c.court) parts.push(`  Court: ${c.court}`);
      });
      parts.push('');
    }

    parts.push(`**Recommendation**: Review the above legal provisions and precedents. For specific legal advice, consult a qualified attorney.`);

    return parts.join('\n');
  }

  formatCitation(citation: Citation): string {
    switch (citation.type) {
      case 'statute':
        return `${citation.title}, ${citation.year} (${citation.reference})`;
      case 'case':
        return `${citation.title}, ${citation.reference}${citation.court ? `, ${citation.court}` : ''}`;
      default:
        return `${citation.title} (${citation.reference})`;
    }
  }

  generateBibliography(citations: Citation[]): string {
    const parts: string[] = ['## Legal References\n'];

    const statutes = citations.filter(c => c.type === 'statute');
    if (statutes.length > 0) {
      parts.push('### Statutes');
      statutes.forEach((c, i) => {
        parts.push(`${i + 1}. ${this.formatCitation(c)}`);
      });
      parts.push('');
    }

    const cases = citations.filter(c => c.type === 'case');
    if (cases.length > 0) {
      parts.push('### Case Law');
      cases.forEach((c, i) => {
        parts.push(`${i + 1}. ${this.formatCitation(c)}`);
      });
    }

    return parts.join('\n');
  }
}

export const citationSystem = new CitationSystem();
