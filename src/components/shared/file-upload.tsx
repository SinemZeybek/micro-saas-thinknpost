"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileText, X } from "lucide-react";

interface FileUploadProps {
  onUpload: (file: File) => void;
  isLoading: boolean;
  maxSizeMB?: number;
}

export function FileUpload({ onUpload, isLoading, maxSizeMB = 10 }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    const validTypes = ["application/pdf", "text/plain", "text/markdown"];
    const validExts = [".pdf", ".txt", ".md"];

    if (
      !validTypes.includes(file.type) &&
      !validExts.some((ext) => file.name.endsWith(ext))
    ) {
      return;
    }

    setSelectedFile(file);
  }

  return (
    <div className="space-y-3">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          dragOver
            ? "border-violet-400 bg-violet-50"
            : "border-gray-200 hover:border-violet-300 hover:bg-violet-50/50"
        }`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const file = e.dataTransfer.files[0];
          if (file) handleFile(file);
        }}
      >
        <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
        <p className="text-sm text-gray-600">
          Drag & drop a file, or <span className="text-violet-600 font-medium">browse</span>
        </p>
        <p className="text-xs text-gray-400 mt-1">PDF, TXT, or MD (max {maxSizeMB}MB)</p>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.txt,.md,application/pdf,text/plain,text/markdown"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </div>

      {selectedFile && (
        <div className="flex items-center justify-between rounded-lg border border-violet-100 bg-violet-50/50 px-3 py-2">
          <div className="flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4 text-violet-500" />
            <span className="text-gray-700">{selectedFile.name}</span>
            <span className="text-gray-400">
              ({(selectedFile.size / 1024).toFixed(0)} KB)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => {
                onUpload(selectedFile);
                setSelectedFile(null);
              }}
              disabled={isLoading}
              className="bg-violet-600 hover:bg-violet-700 text-white cursor-pointer"
            >
              {isLoading ? "Uploading..." : "Upload"}
            </Button>
            <button
              onClick={() => setSelectedFile(null)}
              className="text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
