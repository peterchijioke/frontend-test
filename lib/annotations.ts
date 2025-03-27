// lib/annotations.ts
import { PDFDocument, rgb } from 'pdf-lib'

export type AnnotationType = 'highlight' | 'underline' | 'comment' | 'signature';

export interface Annotation {
  id: string;
  type: AnnotationType;
  color: string;
  position: { x: number; y: number };
  page: number;
  content?: string;
}

export async function exportPDF(
  pdfBuffer: Buffer | ArrayBuffer | Uint8Array,
  annotations: Annotation[]
): Promise<Uint8Array | null> {
  let bufferCopy: ArrayBuffer | null = null;

  try {
    // Process the input buffer
    if (pdfBuffer instanceof ArrayBuffer) {
      bufferCopy = pdfBuffer;
    } else if (pdfBuffer instanceof Buffer) {
      bufferCopy = new Uint8Array(
        pdfBuffer.buffer.slice(
          pdfBuffer.byteOffset,
          pdfBuffer.byteOffset + pdfBuffer.byteLength
        )
      ).buffer as ArrayBuffer;
    } else if (pdfBuffer instanceof Uint8Array) {
      bufferCopy = pdfBuffer.buffer.slice(
        pdfBuffer.byteOffset,
        pdfBuffer.byteOffset + pdfBuffer.byteLength
      ) as ArrayBuffer;
    } else {
      throw new Error(
        "Invalid pdfBuffer type. Expected Buffer, ArrayBuffer, or Uint8Array."
      );
    }
  } catch (error) {
    console.error("Error processing PDF buffer:", error);
    return null;
  }

  if (!bufferCopy) {
    console.error("Buffer copy is null or invalid.");
    return null;
  }

  try {
    // Ensure bufferCopy is a valid Uint8Array before loading
    const validBuffer = new Uint8Array(bufferCopy);

    // Attempt to load the PDF document to validate the buffer
    const pdfDoc = await PDFDocument.load(validBuffer);

    // Embed annotations into the PDF
    for (const annotation of annotations) {
      const page = pdfDoc.getPage(annotation.page - 1);
      const [r, g, b] = hexToRgb(annotation.color);

      if (annotation.type === "highlight") {
        page.drawRectangle({
          x: annotation.position.x,
          y: annotation.position.y,
          width: 100, // Example width
          height: 20, // Example height
          color: rgb(r, g, b),
          opacity: 0.5,
        });
      } else if (annotation.type === "underline") {
        page.drawLine({
          start: { x: annotation.position.x, y: annotation.position.y },
          end: { x: annotation.position.x + 100, y: annotation.position.y },
          thickness: 2,
          color: rgb(r, g, b),
        });
      } else if (annotation.type === "comment") {
        page.drawText(annotation.content || "", {
          x: annotation.position.x,
          y: annotation.position.y,
          size: 12,
          color: rgb(r, g, b),
        });
      } else if (annotation.type === "signature") {
        const path = JSON.parse(annotation.content || "[]") as {
          x: number;
          y: number;
        }[];
        for (let i = 1; i < path.length; i++) {
          page.drawLine({
            start: { x: path[i - 1].x, y: path[i - 1].y },
            end: { x: path[i].x, y: path[i].y },
            thickness: 2,
            color: rgb(r, g, b),
          });
        }
      }
    }

    // Serialize the PDF to a Uint8Array
    const modifiedPdf = await pdfDoc.save();
    return modifiedPdf;
  } catch (error) {
    console.error("Error processing or validating PDF buffer:", error);
    return null;
  }
}

function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return [r, g, b];
}