export interface Question {
  id: string;
  question: string;
  type: "text" | "select" | "multiselect";
  options?: string[];
  required: boolean;
}

export interface Template {
  id: string;
  name: string;
  icon: string;
  questions: Question[];
  systemPrompt: string;
}

export const templates: Template[] = [
  {
    id: "legal-notice",
    name: "Legal Notice",
    icon: "FileText",
    systemPrompt: "You are a legal expert drafting a formal legal notice. Be precise, professional, and legally sound.",
    questions: [
      { id: "sender", question: "Sender's full name", type: "text", required: true },
      { id: "sender_address", question: "Sender's address", type: "text", required: true },
      { id: "recipient", question: "Recipient's full name", type: "text", required: true },
      { id: "recipient_address", question: "Recipient's address", type: "text", required: true },
      { id: "issue", question: "What is the legal issue?", type: "select", options: ["Breach of Contract", "Property Dispute", "Payment Default", "Other"], required: true },
      { id: "details", question: "Brief description of the matter", type: "text", required: true },
      { id: "action", question: "Action demanded", type: "text", required: true },
      { id: "deadline", question: "Response deadline (days)", type: "select", options: ["7", "15", "30"], required: true },
    ],
  },
  {
    id: "privacy-policy",
    name: "Privacy Policy",
    icon: "Shield",
    systemPrompt: "You are a legal expert drafting a comprehensive privacy policy compliant with GDPR and modern privacy laws.",
    questions: [
      { id: "company", question: "Company/Organization name", type: "text", required: true },
      { id: "website", question: "Website URL", type: "text", required: true },
      { id: "data_collected", question: "What data do you collect?", type: "multiselect", options: ["Email", "Name", "Phone", "Address", "Payment Info", "Usage Data", "Cookies"], required: true },
      { id: "data_usage", question: "How is data used?", type: "multiselect", options: ["Service Delivery", "Marketing", "Analytics", "Legal Compliance"], required: true },
      { id: "third_party", question: "Do you share data with third parties?", type: "select", options: ["Yes", "No"], required: true },
      { id: "contact_email", question: "Contact email for privacy concerns", type: "text", required: true },
    ],
  },
  {
    id: "terms-of-service",
    name: "Terms of Service",
    icon: "Building2",
    systemPrompt: "You are a legal expert drafting clear and enforceable terms of service.",
    questions: [
      { id: "company", question: "Company/Service name", type: "text", required: true },
      { id: "service_type", question: "Type of service", type: "select", options: ["SaaS", "E-commerce", "Marketplace", "Content Platform", "Other"], required: true },
      { id: "jurisdiction", question: "Governing jurisdiction", type: "text", required: true },
      { id: "payment", question: "Is this a paid service?", type: "select", options: ["Yes", "No", "Freemium"], required: true },
      { id: "user_content", question: "Do users create/upload content?", type: "select", options: ["Yes", "No"], required: true },
      { id: "age_restriction", question: "Minimum age requirement", type: "select", options: ["13+", "16+", "18+", "None"], required: true },
    ],
  },
  {
    id: "nda",
    name: "NDA",
    icon: "ScrollText",
    systemPrompt: "You are a legal expert drafting a mutual or unilateral non-disclosure agreement.",
    questions: [
      { id: "type", question: "NDA Type", type: "select", options: ["Mutual", "Unilateral"], required: true },
      { id: "party1", question: "First party name", type: "text", required: true },
      { id: "party2", question: "Second party name", type: "text", required: true },
      { id: "purpose", question: "Purpose of disclosure", type: "text", required: true },
      { id: "duration", question: "Confidentiality period (years)", type: "select", options: ["1", "2", "3", "5", "Indefinite"], required: true },
      { id: "jurisdiction", question: "Governing law jurisdiction", type: "text", required: true },
    ],
  },
  {
    id: "contract",
    name: "Contract",
    icon: "FileCheck",
    systemPrompt: "You are a legal expert drafting a professional service or business contract.",
    questions: [
      { id: "contract_type", question: "Contract type", type: "select", options: ["Service Agreement", "Sales Contract", "Employment Contract", "Consulting Agreement"], required: true },
      { id: "party1", question: "First party (Provider)", type: "text", required: true },
      { id: "party2", question: "Second party (Client)", type: "text", required: true },
      { id: "scope", question: "Scope of work/services", type: "text", required: true },
      { id: "payment", question: "Payment terms", type: "text", required: true },
      { id: "duration", question: "Contract duration", type: "text", required: true },
      { id: "termination", question: "Termination notice period", type: "select", options: ["7 days", "15 days", "30 days", "60 days"], required: true },
    ],
  },
  {
    id: "partnership",
    name: "Partnership Agreement",
    icon: "Users",
    systemPrompt: "You are a legal expert drafting a comprehensive partnership agreement.",
    questions: [
      { id: "partners", question: "Partner names (comma-separated)", type: "text", required: true },
      { id: "business_name", question: "Business/Partnership name", type: "text", required: true },
      { id: "business_type", question: "Type of business", type: "text", required: true },
      { id: "capital", question: "Initial capital contribution", type: "text", required: true },
      { id: "profit_split", question: "Profit sharing ratio", type: "text", required: true },
      { id: "roles", question: "Roles and responsibilities", type: "text", required: true },
      { id: "dispute", question: "Dispute resolution method", type: "select", options: ["Mediation", "Arbitration", "Court"], required: true },
    ],
  },
];
