
import React, { useCallback, useState } from 'react';
import { UploadIcon, FileIcon } from './icons';

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  file: File | null;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, file }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  }, [onFileSelect]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  const handleRemoveFile = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onFileSelect(null);
  };

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`relative w-full max-w-lg p-8 border-2 border-dashed rounded-lg text-center transition-all duration-300 cursor-pointer ${
        isDragging ? 'border-sky-400 bg-sky-500/10' : 'border-slate-600 hover:border-sky-500 hover:bg-slate-700/50'
      }`}
      onClick={() => document.getElementById('file-input')?.click()}
    >
      <input
        type="file"
        id="file-input"
        className="hidden"
        onChange={handleFileChange}
        accept=".xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      />
      {file ? (
        <div className="flex flex-col items-center gap-2">
            <FileIcon />
            <p className="font-semibold text-slate-100">{file.name}</p>
            <p className="text-sm text-slate-400">{(file.size / 1024).toFixed(2)} KB</p>
            <button
                onClick={handleRemoveFile}
                className="mt-2 text-xs text-red-400 hover:text-red-300 hover:underline"
            >
                Remove file
            </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
            <UploadIcon />
            <p className="text-xl font-semibold text-slate-300">
                Drag & drop your file here
            </p>
            <p className="text-slate-400">or</p>
            <span className="px-4 py-2 bg-slate-700 rounded-md font-medium">
                Click to browse
            </span>
            <p className="text-xs text-slate-500 mt-2">.xlsx files only</p>
        </div>
      )}
    </div>
  );
};
