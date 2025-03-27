import { AnnotationType } from "../lib/annotations";

interface AnnotationToolbarProps {
  activeTool: AnnotationType | null;
  onToolChange: (tool: AnnotationType | null) => void;
  color: string;
  onColorChange: (color: string) => void;
  onExport: () => void;
}

export default function AnnotationToolbar({
  activeTool,
  onToolChange,
  color,
  onColorChange,
  onExport,
}: AnnotationToolbarProps) {
  return (
    <div className="toolbar flex flex-col md:flex-row gap-2 md:gap-4">
      <div className="grid grid-cols-2 md:flex gap-2">
        <button
          className={`p-3 md:p-2 text-sm md:text-base ${
            activeTool === "highlight" ? "bg-blue-200" : ""
          }`}
          onClick={() =>
            onToolChange(activeTool === "highlight" ? null : "highlight")
          }
        >
          Highlight
        </button>
        <button
          className={`p-3 md:p-2 text-sm md:text-base ${
            activeTool === "underline" ? "bg-blue-200" : ""
          }`}
          onClick={() =>
            onToolChange(activeTool === "underline" ? null : "underline")
          }
        >
          Underline
        </button>
        <button
          className={`p-3 md:p-2 text-sm md:text-base ${
            activeTool === "comment" ? "bg-blue-200" : ""
          }`}
          onClick={() =>
            onToolChange(activeTool === "comment" ? null : "comment")
          }
        >
          Comment
        </button>
        <button
          className={`p-3 md:p-2 text-sm md:text-base ${
            activeTool === "signature" ? "bg-blue-200" : ""
          }`}
          onClick={() =>
            onToolChange(activeTool === "signature" ? null : "signature")
          }
        >
          Signature
        </button>
      </div>
      <div className="flex items-center gap-2 md:ml-auto">
        <input
          type="color"
          value={color}
          onChange={(e) => onColorChange(e.target.value)}
          className="w-12 h-12 md:w-auto md:h-auto"
        />
        <button
          className="p-3 md:p-2 bg-green-500 text-white text-sm md:text-base"
          onClick={onExport}
        >
          Export PDF
        </button>
      </div>
    </div>
  );
}
