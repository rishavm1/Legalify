import Tesseract from 'tesseract.js';

export class OCRService {
  static async extractTextFromImage(imageBuffer: Buffer): Promise<string> {
    try {
      const { data: { text } } = await Tesseract.recognize(imageBuffer, 'eng', {
        logger: () => {} // Suppress logs
      });
      return text.trim();
    } catch (error) {
      console.error('OCR extraction failed:', error);
      return '';
    }
  }

  static async extractTextFromImageWithConfidence(imageBuffer: Buffer): Promise<{ text: string; confidence: number }> {
    try {
      const { data } = await Tesseract.recognize(imageBuffer, 'eng');
      return {
        text: data.text.trim(),
        confidence: data.confidence
      };
    } catch (error) {
      console.error('OCR extraction failed:', error);
      return { text: '', confidence: 0 };
    }
  }

  static async preprocessImage(imageBuffer: Buffer): Promise<Buffer> {
    // Basic preprocessing - can be enhanced with sharp library
    return imageBuffer;
  }
}
