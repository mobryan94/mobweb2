import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, File, X } from "lucide-react";

interface UploadZoneProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
  accept?: string;
  maxSizeMB?: number;
}

export function UploadZone({ 
  onFileSelect, 
  selectedFile, 
  accept = ".zip",
  maxSizeMB = 100 
}: UploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileSelection = (file: File) => {
    // Check file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      alert(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    // Check file type if accept is specified
    if (accept && !file.name.toLowerCase().endsWith(accept.replace(".", ""))) {
      alert(`Please select a ${accept} file`);
      return;
    }

    onFileSelect(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleRemoveFile = () => {
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (selectedFile) {
    return (
      <div className="border-2 border-primary/50 rounded-xl p-6 bg-primary/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
              <File className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">{selectedFile.name}</p>
              <p className="text-sm text-gray-400">{formatFileSize(selectedFile.size)}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRemoveFile}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
        isDragOver
          ? "border-primary bg-primary/10"
          : "border-gray-600 hover:border-primary/50 hover:bg-primary/5"
      }`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileInputChange}
        className="hidden"
      />
      
      <div className="space-y-4">
        <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center transition-colors duration-300 ${
          isDragOver ? "bg-primary/20" : "bg-gray-700"
        }`}>
          <Upload className={`w-8 h-8 transition-colors duration-300 ${
            isDragOver ? "text-primary" : "text-gray-400"
          }`} />
        </div>
        
        <div>
          <p className="text-lg font-medium mb-2">
            {isDragOver ? "Drop your file here" : "Drag & drop your ZIP file"}
          </p>
          <p className="text-gray-400 text-sm mb-4">
            or click to browse (max {maxSizeMB}MB)
          </p>
          
          <Button
            variant="outline"
            className="border-primary/50 hover:border-primary text-primary hover:bg-primary/10"
          >
            Choose File
          </Button>
        </div>
      </div>
    </div>
  );
}
