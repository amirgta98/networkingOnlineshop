"use client";

import * as React from "react";
import { UploadCloud, FileText, CheckCircle2, X } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export interface FileUploadBoxProps {
  label: string;
  description?: string;
  acceptedExtensions?: string;
  selectedFileName?: string | null;
  onFileSelect: (fileName: string) => void;
  onFileRemove?: () => void;
  className?: string;
}

export function FileUploadBox({
  label,
  description = "فرمت‌های مجاز: PDF, Excel, TXT (حداکثر ۲۰ مگابایت)",
  acceptedExtensions = ".pdf,.xlsx,.xls,.doc,.docx,.txt,.log,.png,.jpg",
  selectedFileName,
  onFileSelect,
  onFileRemove,
  className,
}: FileUploadBoxProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files[0].name);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0].name);
    }
  };

  return (
    <div className={cn("flex flex-col gap-1.5 text-right", className)} dir="rtl">
      <label className="text-xs font-semibold text-neutral-300">{label}</label>

      {selectedFileName ? (
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <div className="flex flex-col">
              <span className="font-bold text-emerald-300 font-mono text-[11px] truncate max-w-[200px] sm:max-w-xs">
                {selectedFileName}
              </span>
              <span className="text-[10px] text-emerald-400/80">فایل آماده ارسال</span>
            </div>
          </div>

          {onFileRemove && (
            <button
              type="button"
              onClick={onFileRemove}
              className="p-1 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center",
            isDragging
              ? "border-orange-500 bg-orange-500/10 scale-[1.01]"
              : "border-neutral-800 bg-neutral-900/40 hover:border-neutral-700 hover:bg-neutral-900/80"
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedExtensions}
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 mb-2">
            <UploadCloud className="h-5 w-5" />
          </div>

          <span className="text-xs font-bold text-neutral-200 mb-0.5">
            کلیک کنید یا فایل را به اینجا بکشید
          </span>
          <span className="text-[11px] text-neutral-400">{description}</span>
        </div>
      )}
    </div>
  );
}
