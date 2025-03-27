// app/components/AnnotationToolbar.tsx
"use client";
import { AnnotationType } from "../lib/annotations";

interface AnnotationToolbarProps {
  activeTool: AnnotationType | null;
  onToolChange: (tool: AnnotationType | null) => void;
  color: string;
  onColorChange: (color: string) => void;
  onExport: () => void;
  onDelete: () => void;
  selectedAnnotation: string | null;
}

export default function AnnotationToolbar({
  activeTool,
  onToolChange,
  color,
  onColorChange,
  onExport,
  onDelete,
  selectedAnnotation,
}: AnnotationToolbarProps) {
  const tools: { type: AnnotationType; label: string }[] = [
    { type: "highlight", label: "Highlight" },
    { type: "underline", label: "Underline" },
    { type: "comment", label: "Comment" },
    { type: "signature", label: "Signature" },
  ];

  return (
    <div className="toolbar flex flex-col md:flex-row gap-4 p-4 bg-gray-100 border-b shadow-sm">
      <div className="grid grid-cols-2 md:flex gap-2">
        {tools.map((tool) => (
          <button
            key={tool.type}
            className={`px-4 py-2 md:px-3 md:py-2 text-sm md:text-base rounded-md transition-colors
              ${
                activeTool === tool.type
                  ? "bg-blue-200 text-blue-800"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            onClick={() =>
              onToolChange(activeTool === tool.type ? null : tool.type)
            }
            aria-label={`Toggle ${tool.label} tool`}
            aria-pressed={activeTool === tool.type}
          >
            {tool.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-4 md:ml-auto">
        <input
          type="color"
          value={color}
          onChange={(e) => onColorChange(e.target.value)}
          className="w-12 h-12 md:w-8 md:h-8 rounded-full border-2 border-gray-300 cursor-pointer"
          title="Select annotation color"
        />
        <button
          className="px-4 py-2 md:px-3 md:py-2 bg-green-500 text-white text-sm md:text-base rounded-md hover:bg-green-600 transition-colors"
          onClick={onExport}
          aria-label="Export annotated PDF"
        >
          Export PDF
        </button>
        <button
          className={`px-4 py-2 md:px-3 md:py-2 text-sm md:text-base rounded-md transition-colors
            ${
              selectedAnnotation
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          onClick={onDelete}
          disabled={!selectedAnnotation}
          aria-label="Delete selected annotation"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
