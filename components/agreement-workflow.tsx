"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, ArrowRight, FileText } from 'lucide-react';

interface Question {
  id: string;
  text: string;
  type: 'text' | 'textarea' | 'select' | 'number';
  options?: string[];
  required: boolean;
}

interface AgreementWorkflow {
  id: string;
  name: string;
  category: string;
  questions: Question[];
  template: string;
}

const agreementTypes = [
  {
    id: 'land-builder',
    name: 'Land Owner - Builder Agreement',
    description: 'Agreement between property owner and construction company',
    category: 'property',
    icon: '🏗️'
  },
  {
    id: 'rental',
    name: 'Rental Agreement',
    description: 'Lease agreement for residential or commercial property',
    category: 'property',
    icon: '🏠'
  },
  {
    id: 'partnership',
    name: 'Partnership Agreement',
    description: 'Business partnership between two or more parties',
    category: 'business',
    icon: '🤝'
  },
  {
    id: 'service',
    name: 'Service Agreement',
    description: 'Contract for professional services',
    category: 'business',
    icon: '💼'
  }
];

const landBuilderQuestions: Question[] = [
  { id: 'landowner_name', text: 'What is the landowner\'s full name?', type: 'text', required: true },
  { id: 'landowner_address', text: 'Landowner\'s complete address', type: 'textarea', required: true },
  { id: 'builder_name', text: 'What is the builder/contractor\'s full name?', type: 'text', required: true },
  { id: 'builder_address', text: 'Builder\'s complete address', type: 'textarea', required: true },
  { id: 'property_address', text: 'What is the complete property address where construction will take place?', type: 'textarea', required: true },
  { id: 'construction_type', text: 'What type of construction is planned?', type: 'select', options: ['Residential Building', 'Commercial Building', 'Mixed Use Development', 'Renovation', 'Other'], required: true },
  { id: 'project_duration', text: 'What is the expected project duration (in months)?', type: 'number', required: true },
  { id: 'total_cost', text: 'What is the total estimated cost (in INR)?', type: 'text', required: true },
  { id: 'advance_payment', text: 'What is the advance payment amount?', type: 'text', required: true },
  { id: 'payment_schedule', text: 'Describe the payment schedule and milestones', type: 'textarea', required: true }
];

const rentalQuestions: Question[] = [
  { id: 'landlord_name', text: 'What is the landlord\'s full name?', type: 'text', required: true },
  { id: 'landlord_address', text: 'Landlord\'s complete address', type: 'textarea', required: true },
  { id: 'tenant_name', text: 'What is the tenant\'s full name?', type: 'text', required: true },
  { id: 'tenant_address', text: 'Tenant\'s complete address', type: 'textarea', required: true },
  { id: 'property_address', text: 'What is the rental property address?', type: 'textarea', required: true },
  { id: 'property_type', text: 'What type of property is being rented?', type: 'select', options: ['Apartment', 'House', 'Commercial Space', 'Office', 'Shop'], required: true },
  { id: 'monthly_rent', text: 'What is the monthly rent amount (in INR)?', type: 'text', required: true },
  { id: 'security_deposit', text: 'What is the security deposit amount?', type: 'text', required: true },
  { id: 'lease_duration', text: 'What is the lease duration (in months)?', type: 'number', required: true },
  { id: 'start_date', text: 'When does the lease start? (DD/MM/YYYY)', type: 'text', required: true }
];

const partnershipQuestions: Question[] = [
  { id: 'partner1_name', text: 'First partner\'s full name', type: 'text', required: true },
  { id: 'partner1_address', text: 'First partner\'s address', type: 'textarea', required: true },
  { id: 'partner2_name', text: 'Second partner\'s full name', type: 'text', required: true },
  { id: 'partner2_address', text: 'Second partner\'s address', type: 'textarea', required: true },
  { id: 'business_name', text: 'What is the business/partnership name?', type: 'text', required: true },
  { id: 'business_type', text: 'What type of business?', type: 'select', options: ['Retail', 'Services', 'Manufacturing', 'Technology', 'Consulting', 'Other'], required: true },
  { id: 'capital_contribution', text: 'What is each partner\'s capital contribution?', type: 'textarea', required: true },
  { id: 'profit_sharing', text: 'What is the profit sharing ratio?', type: 'text', required: true },
  { id: 'roles', text: 'Describe each partner\'s roles and responsibilities', type: 'textarea', required: true },
  { id: 'duration', text: 'Partnership duration (years) or "Indefinite"', type: 'text', required: true }
];

const serviceQuestions: Question[] = [
  { id: 'provider_name', text: 'Service provider\'s full name/company', type: 'text', required: true },
  { id: 'provider_address', text: 'Service provider\'s address', type: 'textarea', required: true },
  { id: 'client_name', text: 'Client\'s full name/company', type: 'text', required: true },
  { id: 'client_address', text: 'Client\'s address', type: 'textarea', required: true },
  { id: 'service_type', text: 'What type of service will be provided?', type: 'select', options: ['Consulting', 'IT Services', 'Marketing', 'Design', 'Legal', 'Accounting', 'Other'], required: true },
  { id: 'scope_of_work', text: 'Describe the scope of work/services', type: 'textarea', required: true },
  { id: 'service_fee', text: 'What is the service fee (in INR)?', type: 'text', required: true },
  { id: 'payment_terms', text: 'Describe payment terms', type: 'textarea', required: true },
  { id: 'contract_duration', text: 'Contract duration (in months)', type: 'number', required: true },
  { id: 'start_date', text: 'Service start date (DD/MM/YYYY)', type: 'text', required: true }
];

interface Props {
  onDocumentGenerated: (document: string) => void;
  onBack: () => void;
}

export function AgreementWorkflow({ onDocumentGenerated, onBack }: Props) {
  const [stage, setStage] = useState<'select' | 'questions' | 'generating' | 'result'>('select');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);

  const getCurrentQuestions = (): Question[] => {
    switch (selectedType) {
      case 'land-builder': return landBuilderQuestions;
      case 'rental': return rentalQuestions;
      case 'partnership': return partnershipQuestions;
      case 'service': return serviceQuestions;
      default: return [];
    }
  };

  const handleTypeSelect = (typeId: string) => {
    setSelectedType(typeId);
    setStage('questions');
    setCurrentQuestionIndex(0);
    setAnswers({});
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    const questions = getCurrentQuestions();
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      generateDocument();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    } else {
      setStage('select');
    }
  };

  const generateDocument = async () => {
    setIsGenerating(true);
    setStage('generating');
    
    try {
      // Simulate document generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const selectedAgreement = agreementTypes.find(t => t.id === selectedType);
      let document = `${selectedAgreement?.name.toUpperCase()}\n\n`;
      document += `This Agreement is made on ${new Date().toLocaleDateString('en-IN')} between:\n\n`;
      
      if (selectedType === 'land-builder') {
        document += `LANDOWNER: ${answers.landowner_name}\nAddress: ${answers.landowner_address}\n\n`;
        document += `BUILDER/CONTRACTOR: ${answers.builder_name}\nAddress: ${answers.builder_address}\n\n`;
        document += `PROPERTY DETAILS:\nAddress: ${answers.property_address}\nConstruction Type: ${answers.construction_type}\n\n`;
        document += `TERMS AND CONDITIONS:\n\n`;
        document += `1. PROJECT DURATION: ${answers.project_duration} months from the date of commencement.\n\n`;
        document += `2. TOTAL COST: INR ${answers.total_cost}\n\n`;
        document += `3. ADVANCE PAYMENT: INR ${answers.advance_payment}\n\n`;
        document += `4. PAYMENT SCHEDULE:\n${answers.payment_schedule}\n\n`;
        document += `5. SCOPE OF WORK: The Builder agrees to construct ${answers.construction_type} as per approved plans and specifications.\n\n`;
        document += `6. MATERIALS: All materials shall be of good quality and as per specifications agreed upon.\n\n`;
        document += `7. COMPLETION: The work shall be completed within the stipulated time frame.\n\n`;
        document += `8. WARRANTY: The Builder provides a warranty of 1 year for structural defects.\n\n`;
        document += `9. DISPUTE RESOLUTION: Any disputes shall be resolved through arbitration as per Indian Arbitration Act.\n\n`;
        document += `IN WITNESS WHEREOF, the parties have executed this Agreement on the date first written above.\n\n`;
        document += `LANDOWNER: _________________    BUILDER: _________________\n${answers.landowner_name}              ${answers.builder_name}\n\nWITNESSES:\n1. _________________\n2. _________________`;
      } else if (selectedType === 'rental') {
        document += `LANDLORD: ${answers.landlord_name}\nAddress: ${answers.landlord_address}\n\n`;
        document += `TENANT: ${answers.tenant_name}\nAddress: ${answers.tenant_address}\n\n`;
        document += `PROPERTY DETAILS:\nAddress: ${answers.property_address}\nType: ${answers.property_type}\n\n`;
        document += `TERMS AND CONDITIONS:\n\n`;
        document += `1. LEASE PERIOD: ${answers.lease_duration} months starting from ${answers.start_date}\n\n`;
        document += `2. MONTHLY RENT: INR ${answers.monthly_rent} payable on or before the 5th of each month.\n\n`;
        document += `3. SECURITY DEPOSIT: INR ${answers.security_deposit} (refundable at the end of lease)\n\n`;
        document += `4. MAINTENANCE: Tenant shall maintain the property in good condition.\n\n`;
        document += `5. UTILITIES: Tenant shall pay all utility bills including electricity, water, and gas.\n\n`;
        document += `6. TERMINATION: Either party may terminate with 30 days written notice.\n\n`;
        document += `7. SUBLETTING: Tenant shall not sublet without written consent from Landlord.\n\n`;
        document += `8. GOVERNING LAW: This agreement is governed by Indian laws.\n\n`;
        document += `IN WITNESS WHEREOF, the parties have executed this Agreement on the date first written above.\n\n`;
        document += `LANDLORD: _________________    TENANT: _________________\n${answers.landlord_name}              ${answers.tenant_name}\n\nWITNESSES:\n1. _________________\n2. _________________`;
      } else if (selectedType === 'partnership') {
        document += `PARTNER 1: ${answers.partner1_name}\nAddress: ${answers.partner1_address}\n\n`;
        document += `PARTNER 2: ${answers.partner2_name}\nAddress: ${answers.partner2_address}\n\n`;
        document += `BUSINESS DETAILS:\nName: ${answers.business_name}\nType: ${answers.business_type}\n\n`;
        document += `TERMS AND CONDITIONS:\n\n`;
        document += `1. PARTNERSHIP DURATION: ${answers.duration}\n\n`;
        document += `2. CAPITAL CONTRIBUTION:\n${answers.capital_contribution}\n\n`;
        document += `3. PROFIT SHARING: ${answers.profit_sharing}\n\n`;
        document += `4. ROLES AND RESPONSIBILITIES:\n${answers.roles}\n\n`;
        document += `5. DECISION MAKING: All major decisions require mutual consent of both partners.\n\n`;
        document += `6. BANKING: All business transactions shall be conducted through a joint bank account.\n\n`;
        document += `7. DISSOLUTION: Partnership may be dissolved by mutual written consent.\n\n`;
        document += `8. DISPUTE RESOLUTION: Disputes shall be resolved through arbitration as per Indian Arbitration Act.\n\n`;
        document += `IN WITNESS WHEREOF, the parties have executed this Agreement on the date first written above.\n\n`;
        document += `PARTNER 1: _________________    PARTNER 2: _________________\n${answers.partner1_name}              ${answers.partner2_name}\n\nWITNESSES:\n1. _________________\n2. _________________`;
      } else if (selectedType === 'service') {
        document += `SERVICE PROVIDER: ${answers.provider_name}\nAddress: ${answers.provider_address}\n\n`;
        document += `CLIENT: ${answers.client_name}\nAddress: ${answers.client_address}\n\n`;
        document += `SERVICE DETAILS:\nType: ${answers.service_type}\nStart Date: ${answers.start_date}\n\n`;
        document += `TERMS AND CONDITIONS:\n\n`;
        document += `1. SCOPE OF WORK:\n${answers.scope_of_work}\n\n`;
        document += `2. CONTRACT DURATION: ${answers.contract_duration} months from the start date.\n\n`;
        document += `3. SERVICE FEE: INR ${answers.service_fee}\n\n`;
        document += `4. PAYMENT TERMS:\n${answers.payment_terms}\n\n`;
        document += `5. DELIVERABLES: Service Provider shall deliver all agreed services as per specifications.\n\n`;
        document += `6. CONFIDENTIALITY: Both parties agree to maintain confidentiality of sensitive information.\n\n`;
        document += `7. TERMINATION: Either party may terminate with 30 days written notice.\n\n`;
        document += `8. GOVERNING LAW: This agreement is governed by Indian laws.\n\n`;
        document += `IN WITNESS WHEREOF, the parties have executed this Agreement on the date first written above.\n\n`;
        document += `SERVICE PROVIDER: _________________    CLIENT: _________________\n${answers.provider_name}              ${answers.client_name}\n\nWITNESSES:\n1. _________________\n2. _________________`;
      }
      
      onDocumentGenerated(document);
    } catch (error) {
      console.error('Failed to generate document:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (stage === 'generating' || isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6 fade-in">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-amber-400/20 border-t-amber-400 shadow-lg shadow-amber-400/20"></div>
          <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-blue-500/20 border-b-blue-500 animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
        </div>
        <p className="text-white text-2xl font-semibold">Generating your agreement...</p>
        <p className="text-neutral-400 text-lg">Creating a comprehensive legal document</p>
      </div>
    );
  }

  if (stage === 'select') {
    return (
      <div className="space-y-8 fade-in">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-3">Select Agreement Type</h2>
          <p className="text-neutral-400 text-lg">Choose the type of agreement you want to create</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {agreementTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => handleTypeSelect(type.id)}
              className="glass-card card-hover glow-border border border-white/10 hover:border-amber-400/50 rounded-2xl p-8 transition-all text-left group shadow-xl hover:shadow-2xl hover:shadow-amber-400/20"
            >
              <div className="text-5xl mb-6 transition-transform duration-300 group-hover:scale-110">{type.icon}</div>
              <h3 className="text-white font-bold text-xl group-hover:text-amber-400 transition-colors mb-3">
                {type.name}
              </h3>
              <p className="text-neutral-400 text-base leading-relaxed">
                {type.description}
              </p>
            </button>
          ))}
        </div>

        <div className="flex justify-center">
          <Button onClick={onBack} variant="outline" className="premium-button glass-card border-white/20 hover:bg-white/10 rounded-xl px-6 py-3">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Chat
          </Button>
        </div>
      </div>
    );
  }

  if (stage === 'questions') {
    const questions = getCurrentQuestions();
    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
      <div className="space-y-8 fade-in">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            {agreementTypes.find(t => t.id === selectedType)?.name}
          </h2>
          <div className="w-full bg-neutral-800/50 rounded-full h-3 mb-4 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-amber-400 to-amber-600 h-3 rounded-full transition-all duration-500 shadow-lg shadow-amber-400/30"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-neutral-400 text-lg font-medium">
            Question {currentQuestionIndex + 1} of {questions.length}
          </p>
        </div>

        <div className="glass-card rounded-2xl p-8 border border-white/10 shadow-2xl">
          <label className="block text-white font-semibold mb-6 text-lg">
            {currentQuestion.text}
            {currentQuestion.required && <span className="text-amber-400 ml-2">*</span>}
          </label>

          {currentQuestion.type === 'text' && (
            <input
              type="text"
              value={answers[currentQuestion.id] || ''}
              onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
              className="w-full p-4 glass-card border border-white/20 rounded-xl text-white focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/20 focus:outline-none transition-all duration-300 font-medium"
              placeholder="Enter your answer..."
            />
          )}

          {currentQuestion.type === 'textarea' && (
            <Textarea
              value={answers[currentQuestion.id] || ''}
              onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
              className="w-full p-4 glass-card border border-white/20 rounded-xl text-white focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/20 focus:outline-none transition-all duration-300 font-medium"
              placeholder="Enter your answer..."
              rows={4}
            />
          )}

          {currentQuestion.type === 'select' && (
            <select
              value={answers[currentQuestion.id] || ''}
              onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
              className="w-full p-4 glass-card border border-white/20 rounded-xl text-white focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/20 focus:outline-none transition-all duration-300 font-medium"
            >
              <option value="">Select an option...</option>
              {currentQuestion.options?.map((option) => (
                <option key={option} value={option} className="bg-neutral-900">{option}</option>
              ))}
            </select>
          )}

          {currentQuestion.type === 'number' && (
            <input
              type="number"
              value={answers[currentQuestion.id] || ''}
              onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
              className="w-full p-4 glass-card border border-white/20 rounded-xl text-white focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/20 focus:outline-none transition-all duration-300 font-medium"
              placeholder="Enter number..."
            />
          )}
        </div>

        <div className="flex justify-between">
          <Button onClick={handlePrevious} variant="outline" className="premium-button glass-card border-white/20 hover:bg-white/10 rounded-xl px-6 py-3">
            <ArrowLeft className="w-5 h-5 mr-2" />
            {currentQuestionIndex === 0 ? 'Back' : 'Previous'}
          </Button>

          <Button 
            onClick={handleNext}
            disabled={currentQuestion.required && !answers[currentQuestion.id]}
            className="premium-button bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold rounded-xl px-6 py-3 shadow-lg hover:shadow-amber-400/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentQuestionIndex === questions.length - 1 ? (
              <>
                <FileText className="w-5 h-5 mr-2" />
                Generate Agreement
              </>
            ) : (
              <>
                Next
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  return null;
}