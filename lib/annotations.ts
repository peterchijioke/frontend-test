// lib/annotations.ts
import { PDFDocument, rgb, Color } from 'pdf-lib';

export type AnnotationType = 'highlight' | 'underline' | 'comment' | 'signature';

export interface Annotation {
  id: string;
  type: AnnotationType;
  color: string;
  position: { x: number; y: number };
  content?: string;
  page: number;
}

export async function exportPDF(pdfBuffer: ArrayBuffer | null, annotations: Annotation[]) {
  if (!pdfBuffer) return;

  const pdfDoc = await PDFDocument.load(pdfBuffer);
  const pages = pdfDoc.getPages();

  annotations.forEach(annotation => {
    const page = pages[annotation.page - 1];
    const { x, y } = annotation.position;
    const color = hexToRgb(annotation.color);

    switch (annotation.type) {
      case 'highlight':
        page.drawRectangle({
          x,
          y: page.getHeight() - y - 20,
          width: 100,
          height: 20,
          color: color,
          opacity: 0.3,
        });
        break;
      case 'underline':
        page.drawLine({
          start: { x, y: page.getHeight() - y },
          end: { x: x + 100, y: page.getHeight() - y },
          thickness: 2,
          color: color,
        });
        break;
      case 'comment':
        page.drawText(annotation.content || '', {
          x,
          y: page.getHeight() - y,
          size: 12,
          color: color,
        });
        break;
      case 'signature':
        page.drawText('Signature', {
          x,
          y: page.getHeight() - y,
          size: 20,
          color: color,
        });
        break;
    }
  });

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'annotated_document.pdf';
  link.click();
  URL.revokeObjectURL(url);
}

function hexToRgb(hex: string): Color {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return rgb(r, g, b);
}