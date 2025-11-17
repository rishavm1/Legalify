import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';
import type { AIMessage } from '@/lib/ai/types';
import { citationSystem } from '@/lib/ai/citation-system';
import { grammarChecker } from '@/lib/ai/grammar-checker';
import { AuditLogger } from '@/lib/audit-logger';
import { Encryption } from '@/lib/encryption';
import { PerformanceMonitor } from '@/lib/performance-monitor';

// Dynamic import for server-side only
let aiLoadBalancer: any = null;
if (typeof window === 'undefined') {
  import('@/lib/ai/load-balancer').then(module => {
    aiLoadBalancer = module.aiLoadBalancer;
  });
}

export async function POST(request: NextRequest) {
  const startTime = PerformanceMonitor.startTimer();
  try {
    const session = await getServerSession(authOptions);
    console.log('Chat API - Session:', session?.user);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, sessionId, fileContext } = await request.json();
    console.log('Chat API - Request:', { message, sessionId, userId: session.user.id });

    // Get user memory and chat history
    const { data: userMemory } = await supabaseAdmin
      .from('user_memory')
      .select('*')
      .eq('user_id', session.user.id);
    
    console.log('Chat API - User memory loaded:', userMemory?.length || 0, 'entries');

    const { data: chatHistory } = await supabaseAdmin
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .limit(20);

    // Build context for AI
    const context = {
      userMemory: userMemory || [],
      chatHistory: chatHistory || [],
      fileContext: fileContext || null,
      userProfile: {
        name: session.user.name,
        email: session.user.email
      }
    };

    // Generate AI response with load balancer
    const aiResponse = await generateAIResponseWithLoadBalancer(message, context);

    // Encrypt and save user message
    const encryptedUserMessage = Encryption.encrypt(message);
    await supabaseAdmin
      .from('chat_messages')
      .insert({
        session_id: sessionId,
        role: 'user',
        content: encryptedUserMessage,
        metadata: { fileContext, encrypted: true }
      });

    // Encrypt and save AI response
    const encryptedAIResponse = Encryption.encrypt(aiResponse);
    await supabaseAdmin
      .from('chat_messages')
      .insert({
        session_id: sessionId,
        role: 'assistant',
        content: encryptedAIResponse,
        metadata: { encrypted: true }
      });

    // Update session
    await supabaseAdmin
      .from('chat_sessions')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', sessionId);

    await AuditLogger.log({
      userId: session.user.id,
      action: 'chat_message',
      resourceType: 'chat',
      resourceId: sessionId,
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      metadata: { messageLength: message.length, hasFileContext: !!fileContext }
    });

    await PerformanceMonitor.recordMetric(startTime, '/api/ai/chat', 'POST', 200, session.user.id);
    return NextResponse.json({ response: aiResponse });
  } catch (error) {
    await PerformanceMonitor.recordMetric(startTime, '/api/ai/chat', 'POST', 500);
    return NextResponse.json({ error: 'Failed to process chat' }, { status: 500 });
  }
}

async function generateAIResponseWithLoadBalancer(message: string, context: any): Promise<string> {
  try {
    // Dynamic import for load balancer
    const { aiLoadBalancer } = await import('@/lib/ai/load-balancer');
    
    // Set strategy
    const strategy = (process.env.AI_STRATEGY as any) || 'intelligent';
    aiLoadBalancer.setStrategy(strategy);
    
    // Build system prompt with legal context
    const systemPrompt = buildSystemPrompt(context);
    
    // Format messages for AI
    const messages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
      ...context.chatHistory.slice(-5).map((m: any) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
      })),
      { role: 'user', content: message }
    ];

    // Use load balancer to get response
    const response = await aiLoadBalancer.generateResponse(messages, context);
    console.log(`AI Response from: ${response.provider} (${response.model})`);
    
    return response.content;
  } catch (error) {
    console.error('AI Load Balancer error:', error);
    // Fallback to rule-based response
    return generateAIResponse(message, context);
  }
}

function buildSystemPrompt(context: any): string {
  return `You are Legalify, an AI legal assistant specializing in Indian law.

Your role:
- Help users draft legal documents (agreements, notices, applications)
- Analyze uploaded legal documents
- Provide guidance based on Indian legal standards
- Explain legal procedures and rights
- Be professional, clear, and actionable

User Profile: ${context.userProfile.name || 'User'}

IMPORTANT - When user asks to download a document:
- Respond: "Sure! I've added download buttons below the document. Click 'Download Word' or 'Download PDF' to save it."
- Be brief and direct

Always:
✅ Be specific and actionable
✅ Ask for necessary information
✅ Provide step-by-step guidance
✅ Reference Indian laws when relevant
✅ Use clear, simple language

Never:
❌ Give vague responses
❌ Say "I can help" without explaining how
❌ Ignore user's specific requests
❌ Provide generic legal advice
❌ Say you cannot download - instead guide them to copy the text`;
}

async function generateAIResponse(message: string, context: any): Promise<string> {
  const messageLower = message.toLowerCase();
  
  // Check for file context
  if (context.fileContext) {
    return analyzeUploadedDocument(message, context.fileContext);
  }

  // Check for previous chat history context
  const recentMessages = context.chatHistory.slice(-10);
  const conversationContext = recentMessages.map((m: any) => `${m.role}: ${m.content}`).join('\n');

  // Handle specific instructions
  if (messageLower.includes('draft') || messageLower.includes('create') || messageLower.includes('write')) {
    if (messageLower.includes('agreement') || messageLower.includes('contract')) {
      return handleDraftRequest(message, conversationContext);
    }
    if (messageLower.includes('notice') || messageLower.includes('letter')) {
      return handleNoticeRequest(message, conversationContext);
    }
    return `I'll help you draft that document. To create a proper legal document, I need some information:

1. **Type of document**: What exactly do you need? (e.g., agreement, notice, application)
2. **Parties involved**: Who are the parties?
3. **Purpose**: What is the main purpose?
4. **Key terms**: Any specific terms or conditions?

Please provide these details, and I'll draft a comprehensive document for you based on Indian law.`;
  }

  // Handle agreement requests
  if (messageLower.includes('agreement') || messageLower.includes('contract')) {
    return handleAgreementRequest(message, conversationContext);
  }

  // Handle notice requests
  if (messageLower.includes('notice')) {
    return handleNoticeRequest(message, conversationContext);
  }

  // Handle court-related queries
  if (messageLower.includes('court') || messageLower.includes('case') || messageLower.includes('lawsuit')) {
    return handleCourtQuery(message, conversationContext);
  }

  // Handle research requests
  if (messageLower.includes('research') || messageLower.includes('case law') || messageLower.includes('statute')) {
    return handleResearchRequest(message, conversationContext);
  }

  // Handle review requests
  if (messageLower.includes('review') || messageLower.includes('check') || messageLower.includes('grammar')) {
    return handleReviewRequest(message, conversationContext);
  }

  // Handle legal advice requests
  if (messageLower.includes('advice') || messageLower.includes('help') || messageLower.includes('what should')) {
    return handleLegalAdvice(message, conversationContext);
  }

  // Handle follow-up questions
  if (recentMessages.length > 0) {
    return handleFollowUp(message, conversationContext);
  }

  // Default welcome message
  return `Hello! I'm your AI legal assistant for Indian law. I can help you:

✅ **Draft Legal Documents** - Agreements, notices, applications
✅ **Analyze Documents** - Upload PDFs/images for review
✅ **Legal Guidance** - Advice based on Indian law
✅ **Court Matters** - Understand procedures and documents

What do you need help with today?`;
}

function handleDraftRequest(message: string, context: string): string {
  const messageLower = message.toLowerCase();
  
  if (messageLower.includes('land') || messageLower.includes('builder') || messageLower.includes('construction')) {
    return `I'll draft a **Land Owner - Builder Agreement** for you.

To create this document, I need:

1. **Landowner's Name**: Full legal name
2. **Builder's Name**: Full legal name or company name
3. **Property Address**: Complete address with survey numbers if available
4. **Construction Type**: Residential/Commercial/Mixed use
5. **Project Duration**: Expected completion time
6. **Total Cost**: Estimated project cost
7. **Payment Terms**: How and when payments will be made

Please provide these details, and I'll create a comprehensive agreement compliant with Indian law.`;
  }
  
  if (messageLower.includes('rental') || messageLower.includes('lease') || messageLower.includes('rent')) {
    return `I'll draft a **Rental/Lease Agreement** for you.

Please provide:

1. **Landlord's Name**: Full name
2. **Tenant's Name**: Full name
3. **Property Address**: Complete address
4. **Monthly Rent**: Amount in INR
5. **Security Deposit**: Amount
6. **Lease Duration**: Months/Years
7. **Maintenance Terms**: Who pays for what

I'll create a legally binding rental agreement as per Indian law.`;
  }

  return `I'll help you draft that document. Please specify:

1. What type of document? (Agreement, Notice, Application, etc.)
2. Who are the parties involved?
3. What is the purpose?
4. Any specific terms or conditions?

Provide these details and I'll create a proper legal document for you.`;
}

function handleAgreementRequest(message: string, context: string): string {
  return `I can help you create various types of agreements:

📄 **Land Owner - Builder Agreement** - Construction projects
📄 **Rental/Lease Agreement** - Property rental
📄 **Partnership Agreement** - Business partnerships  
📄 **Service Agreement** - Professional services
📄 **Employment Agreement** - Job contracts
📄 **Sale Agreement** - Property/goods sale

Which type do you need? Or describe your specific requirement, and I'll guide you through creating it.`;
}

function handleNoticeRequest(message: string, context: string): string {
  return `I can help you draft legal notices:

📋 **Legal Notice (Section 80 CPC)** - Pre-litigation notice
📋 **Eviction Notice** - Tenant removal
📋 **Demand Notice** - Payment demand
📋 **Show Cause Notice** - Explanation request
📋 **Termination Notice** - Contract/employment end

Which notice do you need? Provide details about:
- Who is sending the notice
- Who is receiving it
- What is the issue/demand
- What action is required

I'll draft a proper legal notice for you.`;
}

function handleCourtQuery(message: string, context: string): string {
  return `I can assist with court-related matters:

⚖️ **Understanding Court Notices** - Explain what you received
⚖️ **Preparing Responses** - Draft replies to notices
⚖️ **Filing Applications** - Create court applications
⚖️ **Legal Procedures** - Explain next steps
⚖️ **Case Strategy** - Guidance on approach

Please tell me:
1. What court document/notice did you receive?
2. What is the case about?
3. What do you need to do?

You can also upload the document for detailed analysis.`;
}

function handleLegalAdvice(message: string, context: string): string {
  const messageLower = message.toLowerCase();
  
  if (messageLower.includes('property') || messageLower.includes('land')) {
    return `For property/land matters, I can help with:

🏠 **Property Disputes** - Boundary, ownership issues
🏠 **Sale/Purchase** - Documentation and process
🏠 **Rental Issues** - Tenant/landlord rights
🏠 **Property Registration** - Legal requirements

Please describe your specific situation, and I'll provide guidance based on Indian property laws.`;
  }
  
  return `I'll provide legal guidance. Please describe:

1. **Your Situation**: What happened?
2. **Your Concern**: What are you worried about?
3. **What You Want**: What outcome do you seek?
4. **Any Documents**: Do you have relevant papers?

I'll analyze your situation and provide advice based on Indian law.`;
}

async function handleResearchRequest(message: string, context: string): Promise<string> {
  try {
    const research = await citationSystem.conductResearch(message);
    const bibliography = citationSystem.generateBibliography(research.citations);
    return `📚 **Legal Research Results**

${research.summary}

${bibliography}

**Confidence Level**: ${(research.confidence * 100).toFixed(0)}%

Would you like me to:
- Generate a detailed legal memo on this topic
- Draft a document incorporating these legal provisions
- Provide more specific guidance on any particular aspect`;
  } catch (error) {
    return 'I can help you research Indian law. Please specify what legal topic, statute, or case law you need information about.';
  }
}

function handleReviewRequest(message: string, context: string): string {
  return `📝 **Document Review Service**

I can review your legal document for:

✅ **Grammar & Spelling** - Professional language check
✅ **Legal Errors** - Missing clauses, ambiguous terms
✅ **Compliance** - Indian law requirements
✅ **Structure** - Proper legal formatting

To review your document:
1. Upload it using the paperclip icon (📎)
2. Or paste the text directly in the chat

I'll provide a detailed analysis with suggestions for improvement.`;
}

function handleFollowUp(message: string, context: string): string {
  // Analyze context to provide relevant follow-up
  if (context.includes('agreement') || context.includes('draft')) {
    return `Based on our conversation, I'm ready to help you with that document.

Please provide the specific details I asked for, and I'll create the document for you. If you need clarification on any point, just ask!

Alternatively, you can click the "Draft Agreement" button below to use our guided questionnaire.`;
  }
  
  return `I'm here to help! Based on what we discussed, please provide more details so I can assist you better.

If you want to:
- **Draft a document** - Tell me the type and details
- **Analyze a document** - Upload it using the paperclip icon
- **Get legal advice** - Describe your situation
- **Research law** - Ask about statutes or case law
- **Review a draft** - Upload or paste your document`;
}

async function analyzeUploadedDocument(message: string, fileContext: any): Promise<string> {
  try {
    const { nerExtractor } = await import('@/lib/ai/ner-extractor');
    const extractedText = fileContext.extracted_text || '';
    
    // Extract facts and entities
    const facts = nerExtractor.extractFacts(extractedText);
    const summary = nerExtractor.generateSummary(facts);
    
    // Try AI analysis
    const { aiLoadBalancer } = await import('@/lib/ai/load-balancer');
    const systemPrompt = `You are a legal document analyzer. Analyze the uploaded document and provide:
1. Document type and purpose
2. Key legal points
3. Potential issues or risks
4. Recommendations

Document: ${fileContext.filename}
Extracted Facts:
${summary}`;

    const messages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message }
    ];

    const response = await aiLoadBalancer.generateResponse(messages);
    return `📄 **Document Analysis: ${fileContext.filename}**

${summary}

**AI Analysis**:
${response.content}

**Actions Available**:
✅ Review for grammar and legal errors
✅ Generate related legal documents
✅ Research relevant case law
✅ Draft a response or notice`;
  } catch (error) {
    console.error('AI document analysis failed, using fallback:', error);
    return analyzeUploadedDocumentFallback(message, fileContext);
  }
}

function analyzeUploadedDocumentFallback(message: string, fileContext: any): string {
  const analysis = fileContext.analysis_summary || 'Document uploaded for analysis';
  const filename = fileContext.filename || 'document';
  
  return `📄 **Document Analysis Complete**

**File**: ${filename}
**Analysis**: ${analysis}

**What I found**: ${fileContext.extracted_text ? 'Text extracted successfully' : 'Processing document content'}

**How can I help?**
✅ Explain what this document means
✅ Draft a response or related document
✅ Provide legal guidance on next steps
✅ Identify key legal points and risks
✅ Suggest modifications or improvements

Please ask me specific questions about this document or tell me what you'd like to do next.`;
}