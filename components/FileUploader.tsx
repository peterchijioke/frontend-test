import { useDropzone } from "react-dropzone";

interface FileUploaderProps {
  onFileUpload: (file: File) => void;
}

export default function FileUploader({ onFileUpload }: FileUploaderProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        onFileUpload(acceptedFiles[0]);
      }
    },
    multiple: false,
  });

  return (
    <div {...getRootProps()} className="dropzone">
      <input {...getInputProps()} />
      {isDragActive ? (
        <p className="text-gray-600">Drop the PDF here...</p>
      ) : (
        <p className="text-gray-600">Drag & drop a PDF or click to select</p>
      )}
    </div>
  );
}
