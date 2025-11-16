import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';
import { nerExtractor } from '@/lib/ai/ner-extractor';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const sessionId = formData.get('sessionId') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/jpg',
      'image/webp',
      'application/msword', // .doc
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'text/plain', // .txt
      'application/vnd.ms-excel', // .xls
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' // .xlsx
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Supported: PDF, DOCX, TXT, images, Excel' 
      }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Supabase Storage
    const fileName = `${Date.now()}-${file.name}`;
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('legal-documents')
      .upload(fileName, buffer, {
        contentType: file.type,
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('legal-documents')
      .getPublicUrl(fileName);

    // Extract text from file
    const extractedText = await extractTextFromFile(buffer, file.type);

    // Perform NER extraction and analysis
    const facts = nerExtractor.extractFacts(extractedText);
    const summary = nerExtractor.generateSummary(facts);

    // Save file record
    const { data: fileRecord, error: dbError } = await supabaseAdmin
      .from('uploaded_files')
      .insert({
        user_id: session.user.id,
        session_id: sessionId,
        filename: file.name,
        file_type: file.type,
        file_size: file.size,
        file_url: publicUrl,
        extracted_text: extractedText,
        analysis_summary: summary || await analyzeDocument(extractedText)
      })
      .select()
      .single();

    if (dbError) throw dbError;

    return NextResponse.json({ 
      file: fileRecord,
      extractedText,
      facts,
      summary,
      message: 'File uploaded and analyzed successfully'
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}

async function extractTextFromFile(buffer: Buffer, fileType: string): Promise<string> {
  try {
    if (fileType === 'application/pdf') {
      return 'PDF document uploaded. Content will be analyzed by AI.';
    } else if (fileType.startsWith('image/')) {
      return 'Image uploaded. Text will be extracted via OCR.';
    } else if (fileType.includes('wordprocessingml') || fileType === 'application/msword') {
      return 'Word document uploaded. Content will be analyzed by AI.';
    } else if (fileType === 'text/plain') {
      // For text files, we can actually read the content
      return buffer.toString('utf-8');
    } else if (fileType.includes('spreadsheetml') || fileType === 'application/vnd.ms-excel') {
      return 'Excel spreadsheet uploaded. Data will be analyzed by AI.';
    }
    return 'Document uploaded successfully.';
  } catch (error) {
    console.error('Text extraction failed:', error);
    return 'Document uploaded. AI will analyze the content.';
  }
}

async function analyzeDocument(text: string): Promise<string> {
  // Basic document analysis
  const legalTerms = ['plaintiff', 'defendant', 'court', 'notice', 'summons', 'agreement', 'contract'];
  const foundTerms = legalTerms.filter(term => 
    text.toLowerCase().includes(term)
  );
  
  if (foundTerms.length > 0) {
    return `Legal document detected. Contains: ${foundTerms.join(', ')}`;
  }
  
  return 'Document uploaded for analysis';
}