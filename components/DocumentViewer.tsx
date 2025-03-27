// app/components/DocumentViewer.tsx
"use client";
import { useRef, useState, useEffect, MouseEvent, TouchEvent } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Annotation, AnnotationType } from "../lib/annotations";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface DocumentViewerProps {
  file: ArrayBuffer;
  annotations: Annotation[];
  onAnnotationChange: (annotations: Annotation[]) => void;
  activeTool: AnnotationType | null;
  color: string;
  onDeleteAnnotation: (id: string) => void;
  selectedAnnotation: string | null;
  onSelectAnnotation: (id: string | null) => void;
}

interface Position {
  x: number;
  y: number;
}

export default function DocumentViewer({
  file,
  annotations,
  onAnnotationChange,
  activeTool,
  color,
  onDeleteAnnotation,
  selectedAnnotation,
  onSelectAnnotation,
}: DocumentViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [scale, setScale] = useState<number>(1.0);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [signaturePath, setSignaturePath] = useState<Position[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [history, setHistory] = useState<Annotation[][]>([annotations]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const [draggingAnnotation, setDraggingAnnotation] = useState<string | null>(
    null
  );
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement | null>(null);

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      onAnnotationChange(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      onAnnotationChange(history[historyIndex + 1]);
    }
  };

  const handleAnnotationChange = (newAnnotations: Annotation[]) => {
    const uniqueNewAnnotations = Array.from(
      new Map(newAnnotations.map((ann) => [ann.id, ann])).values()
    );
    const newHistory = history.slice(0, historyIndex + 1);
    setHistory([...newHistory, uniqueNewAnnotations]);
    setHistoryIndex(newHistory.length);
    onAnnotationChange(uniqueNewAnnotations);
  };

  const getPosition = (e: MouseEvent | TouchEvent): Position => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) / scale,
      y: (clientY - rect.top) / scale,
    };
  };

  const handleAnnotation = (
    e: MouseEvent<HTMLDivElement> | TouchEvent<HTMLDivElement>,
    page: number
  ) => {
    if (!activeTool || !containerRef.current || draggingAnnotation) return;
    const { x, y } = getPosition(e);

    setCurrentPage(page);

    if (activeTool === "signature") {
      setIsDrawing(true);
      setSignaturePath([{ x, y }]);
    } else if (activeTool === "comment") {
      const content = prompt("Enter comment:")?.trim();
      if (!content) return;

      const newAnnotation: Annotation = {
        id: crypto.randomUUID(),
        type: "comment",
        color,
        position: { x, y },
        page,
        content,
      };
      handleAnnotationChange([...annotations, newAnnotation]);
    } else if (activeTool === "highlight" || activeTool === "underline") {
      const newAnnotation: Annotation = {
        id: crypto.randomUUID(),
        type: activeTool,
        color,
        position: { x, y },
        page,
      };
      handleAnnotationChange([...annotations, newAnnotation]);
    }
  };

  const handleMove = (
    e: MouseEvent<HTMLDivElement> | TouchEvent<HTMLDivElement>
  ) => {
    if (!containerRef.current) return;
    const { x, y } = getPosition(e);

    if (isDrawing && activeTool === "signature") {
      e.preventDefault();
      setSignaturePath((prev) => [...prev, { x, y }]);
    } else if (draggingAnnotation) {
      e.preventDefault();
      const updatedAnnotations = annotations.map((ann) =>
        ann.id === draggingAnnotation
          ? {
              ...ann,
              position: {
                x: x - dragOffset.x,
                y: y - dragOffset.y,
              },
            }
          : ann
      );
      onAnnotationChange(updatedAnnotations); // Update immediately for smooth dragging
    }
  };

  const handleEnd = (
    e: MouseEvent<HTMLDivElement> | TouchEvent<HTMLDivElement>
  ) => {
    if (isDrawing && signaturePath.length > 1) {
      const newAnnotation: Annotation = {
        id: crypto.randomUUID(),
        type: "signature",
        color,
        position: signaturePath[0],
        page: currentPage,
        content: JSON.stringify(signaturePath),
      };
      handleAnnotationChange([...annotations, newAnnotation]);
    } else if (draggingAnnotation) {
      const updatedAnnotations = annotations.map((ann) =>
        ann.id === draggingAnnotation ? { ...ann } : ann
      );
      handleAnnotationChange(updatedAnnotations); // Finalize in history
      setDraggingAnnotation(null);
    }
    setIsDrawing(false);
    setSignaturePath([]);
  };

  const startDragging = (
    e: MouseEvent<HTMLDivElement> | TouchEvent<HTMLDivElement>,
    annotationId: string
  ) => {
    e.stopPropagation();
    const ann = annotations.find((a) => a.id === annotationId);
    if (!ann || !containerRef.current) return;

    const { x, y } = getPosition(e);
    setDraggingAnnotation(annotationId);
    setDragOffset({
      x: x - ann.position.x,
      y: y - ann.position.y,
    });
    onSelectAnnotation(annotationId); // Select the annotation for potential deletion
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

  const getSignatureBounds = (
    path: Position[]
  ): { width: number; height: number } => {
    if (path.length === 0) return { width: 200, height: 100 };
    const xs = path.map((p) => p.x);
    const ys = path.map((p) => p.y);
    return {
      width: Math.max(...xs) - Math.min(...xs) + 10,
      height: Math.max(...ys) - Math.min(...ys) + 10,
    };
  };

  const uniqueAnnotations = Array.from(
    new Map(annotations.map((ann) => [ann.id, ann])).values()
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden"
      onMouseMove={handleMove}
      onTouchMove={handleMove}
      onMouseUp={handleEnd}
      onTouchEnd={handleEnd}
    >
      <div className="p-2 flex gap-2">
        <button
          onClick={undo}
          disabled={historyIndex === 0}
          className="px-2 py-1 bg-gray-200 rounded"
        >
          Undo
        </button>
        <button
          onClick={redo}
          disabled={historyIndex === history.length - 1}
          className="px-2 py-1 bg-gray-200 rounded"
        >
          Redo
        </button>
      </div>
      <Document
        file={file}
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
      >
        <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
          {Array.from({ length: numPages }, (_, index) => (
            <div
              key={index}
              className="relative mx-auto"
              onMouseDown={(e) => handleAnnotation(e, index + 1)}
              onTouchStart={(e) => handleAnnotation(e, index + 1)}
            >
              <Page
                pageNumber={index + 1}
                scale={scale}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
              <div
                className="absolute top-0 left-0 w-full h-full"
                style={{
                  transform: `scale(${scale})`,
                  transformOrigin: "top left",
                }}
              >
                {uniqueAnnotations
                  .filter((ann) => ann.page === index + 1)
                  .map((ann) => {
                    const isSignature = ann.type === "signature" && ann.content;
                    const path = isSignature
                      ? (JSON.parse(ann.content ?? "[]") as Position[])
                      : [];
                    const { width, height } = isSignature
                      ? getSignatureBounds(path)
                      : { width: 200, height: 100 };

                    return (
                      <div
                        key={ann.id}
                        style={{
                          position: "absolute",
                          left: ann.position.x,
                          top: ann.position.y,
                          backgroundColor:
                            ann.type === "highlight"
                              ? ann.color
                              : "transparent",
                          borderBottom:
                            ann.type === "underline"
                              ? `2px solid ${ann.color}`
                              : "none",
                          minWidth:
                            ann.type === "highlight" || ann.type === "underline"
                              ? 100
                              : "auto",
                          cursor:
                            ann.type === "signature" || ann.type === "comment"
                              ? "grab"
                              : "default",
                          userSelect: "none",
                          zIndex: draggingAnnotation === ann.id ? 10 : 1,
                          border:
                            selectedAnnotation === ann.id
                              ? "2px dashed red"
                              : "none",
                        }}
                        className="p-2"
                        onMouseDown={(e) =>
                          (ann.type === "signature" ||
                            ann.type === "comment") &&
                          startDragging(e, ann.id)
                        }
                        onTouchStart={(e) =>
                          (ann.type === "signature" ||
                            ann.type === "comment") &&
                          startDragging(e, ann.id)
                        }
                      >
                        {isSignature ? (
                          <svg
                            width={width}
                            height={height}
                            style={{ position: "absolute", top: 0, left: 0 }}
                          >
                            <polyline
                              points={path
                                .map(
                                  (p: Position) =>
                                    `${p.x - path[0].x},${p.y - path[0].y}`
                                )
                                .join(" ")}
                              fill="none"
                              stroke={ann.color}
                              strokeWidth="2"
                            />
                          </svg>
                        ) : (
                          ann.content
                        )}
                      </div>
                    );
                  })}
                {isDrawing &&
                  signaturePath.length > 0 &&
                  currentPage === index + 1 && (
                    <div
                      style={{
                        position: "absolute",
                        left: signaturePath[0].x,
                        top: signaturePath[0].y,
                      }}
                    >
                      <svg
                        width="200"
                        height="100"
                        style={{ position: "absolute", top: 0, left: 0 }}
                      >
                        <polyline
                          points={signaturePath
                            .map(
                              (p) =>
                                `${p.x - signaturePath[0].x},${
                                  p.y - signaturePath[0].y
                                }`
                            )
                            .join(" ")}
                          fill="none"
                          stroke={color}
                          strokeWidth="2"
                        />
                      </svg>
                    </div>
                  )}
              </div>
            </div>
          ))}
        </div>
      </Document>
    </div>
  );
}
