import { Document, Packer, Paragraph, TextRun, AlignmentType } from 'docx';

export async function exportToDocx(content: string, filename: string) {
  const paragraphs = content.split('\n').map(line => 
    new Paragraph({
      children: [new TextRun(line)],
      spacing: { after: 200 },
    })
  );

  const doc = new Document({
    sections: [{
      properties: {},
      children: paragraphs,
    }],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
