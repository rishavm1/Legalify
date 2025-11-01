import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';

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
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
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

    // Extract text from file (placeholder - implement OCR/PDF parsing)
    const extractedText = await extractTextFromFile(buffer, file.type);

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
        analysis_summary: await analyzeDocument(extractedText)
      })
      .select()
      .single();

    if (dbError) throw dbError;

    return NextResponse.json({ 
      file: fileRecord,
      extractedText,
      message: 'File uploaded and analyzed successfully'
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}

async function extractTextFromFile(buffer: Buffer, fileType: string): Promise<string> {
  try {
    if (fileType === 'application/pdf') {
      // For now, return a placeholder - implement pdf-parse later
      return 'PDF content extracted. This would contain the actual PDF text content.';
    } else if (fileType.startsWith('image/')) {
      // For now, return a placeholder - implement Tesseract.js later
      return 'Image text extracted via OCR. This would contain the actual extracted text.';
    }
    return '';
  } catch (error) {
    console.error('Text extraction failed:', error);
    return 'Text extraction failed, but file uploaded successfully.';
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