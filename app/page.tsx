"use client";
import { useState, useCallback } from "react";
import { Annotation, AnnotationType, exportPDF } from "@/lib/annotations";
import AnnotationToolbar from "@/components/AnnotationToolbar";
import DocumentViewer from "@/components/DocumentViewer";
import FileUploader from "@/components/FileUploader";

export default function Home() {
  const [pdfFile, setPdfFile] = useState<ArrayBuffer | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [activeTool, setActiveTool] = useState<AnnotationType | null>(null);
  const [color, setColor] = useState("#FFFF00");

  const handleFileUpload = useCallback((file: File) => {
    file.arrayBuffer().then(setPdfFile);
  }, []);

  return (
    <main className="min-h-screen flex flex-col md:p-4">
      <AnnotationToolbar
        activeTool={activeTool}
        onToolChange={setActiveTool}
        color={color}
        onColorChange={setColor}
        onExport={() => exportPDF(pdfFile, annotations)}
      />
      <div className="flex-1 flex flex-col md:flex-row">
        {!pdfFile ? (
          <FileUploader onFileUpload={handleFileUpload} />
        ) : (
          <DocumentViewer
            file={pdfFile}
            annotations={annotations}
            onAnnotationChange={setAnnotations}
            activeTool={activeTool}
            color={color}
          />
        )}
      </div>
    </main>
  );
}
