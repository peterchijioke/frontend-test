"use client";
import { useRef, useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Annotation, AnnotationType } from "../lib/annotations";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface DocumentViewerProps {
  file: ArrayBuffer;
  annotations: Annotation[];
  onAnnotationChange: (annotations: Annotation[]) => void;
  activeTool: AnnotationType | null;
  color: string;
}

export default function DocumentViewer({
  file,
  annotations,
  onAnnotationChange,
  activeTool,
  color,
}: DocumentViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [scale, setScale] = useState(1.0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleAnnotation = (e: React.MouseEvent | React.TouchEvent) => {
    if (!activeTool || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const x = (clientX - rect.left) / scale;
    const y = (clientY - rect.top) / scale;

    const newAnnotation: Annotation = {
      id: crypto.randomUUID(),
      type: activeTool,
      color,
      position: { x, y },
      page: 1,
      content:
        activeTool === "comment" ? prompt("Enter comment:") || "" : undefined,
    };

    onAnnotationChange([...annotations, newAnnotation]);
  };

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        setScale(Math.min(1.5, Math.max(0.5, width / 800)));
      }
    };
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative flex-1 overflow-auto touch-pan-y"
      onClick={handleAnnotation}
      onTouchStart={handleAnnotation}
    >
      <Document
        file={file}
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
      >
        {Array.from(new Array(numPages), (_, index) => (
          <div key={index} className="relative mx-auto">
            <Page
              pageNumber={index + 1}
              scale={scale}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
            <div
              className="absolute top-0 left-0 w-full h-full pointer-events-none"
              style={{
                transform: `scale(${scale})`,
                transformOrigin: "top left",
              }}
            >
              {annotations
                .filter((ann) => ann.page === index + 1)
                .map((ann) => (
                  <div
                    key={ann.id}
                    style={{
                      position: "absolute",
                      left: ann.position.x,
                      top: ann.position.y,
                      backgroundColor:
                        ann.type === "highlight" ? ann.color : "transparent",
                      borderBottom:
                        ann.type === "underline"
                          ? `2px solid ${ann.color}`
                          : "none",
                      minWidth:
                        ann.type === "highlight" || ann.type === "underline"
                          ? 100
                          : "auto",
                    }}
                    className={
                      ann.type === "signature"
                        ? "text-xl font-signature p-2"
                        : "p-2"
                    }
                  >
                    {ann.type === "signature" ? "Signature" : ann.content}
                  </div>
                ))}
            </div>
          </div>
        ))}
      </Document>
    </div>
  );
}
