// app/page.tsx
"use client";
import { useState, DragEvent } from "react";
import { Annotation, AnnotationType, exportPDF } from "../lib/annotations";
import AnnotationToolbar from "@/components/AnnotationToolbar";
import DocumentViewer from "@/components/DocumentViewer";

export default function Home() {
  const [file, setFile] = useState<ArrayBuffer | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [activeTool, setActiveTool] = useState<AnnotationType | null>(null);
  const [color, setColor] = useState<string>("#000000");
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(
    null
  );
  const [isDragging, setIsDragging] = useState<boolean>(false); // For drop zone visual feedback

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      selectedFile.arrayBuffer().then((buffer) => setFile(buffer));
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === "application/pdf") {
      droppedFile.arrayBuffer().then((buffer) => setFile(buffer));
    }
  };

  const handleExport = () => {
    if (file) {
      const processedAnnotations = JSON.stringify(annotations); // Example processing
      exportPDF(file, annotations); // Pass annotations as the second argument
      console.log("Annotations exported:", processedAnnotations);
    }
  };

  const handleDelete = () => {
    if (selectedAnnotation) {
      const updatedAnnotations = annotations.filter(
        (ann) => ann.id !== selectedAnnotation
      );
      setAnnotations(updatedAnnotations);
      setSelectedAnnotation(null);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <AnnotationToolbar
        activeTool={activeTool}
        onToolChange={setActiveTool}
        color={color}
        onColorChange={setColor}
        onExport={handleExport}
        onDelete={handleDelete}
        selectedAnnotation={selectedAnnotation}
      />
      {!file ? (
        <div
          className={`flex-1 flex flex-col items-center justify-center m-4 border-2 border-dashed rounded-lg transition-colors ${
            isDragging
              ? "border-blue-500 bg-blue-100"
              : "border-gray-300 bg-gray-50"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <p className="text-lg text-gray-600 mb-4">
            Drag and drop a PDF here, or use the button below
          </p>
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="p-2 border rounded bg-white"
          />
        </div>
      ) : (
        <DocumentViewer
          file={file}
          annotations={annotations}
          onAnnotationChange={setAnnotations}
          activeTool={activeTool}
          color={color}
          onDeleteAnnotation={handleDelete}
          selectedAnnotation={selectedAnnotation}
          onSelectAnnotation={setSelectedAnnotation}
        />
      )}
    </div>
  );
}
