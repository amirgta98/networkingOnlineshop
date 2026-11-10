"use client";

import * as React from "react";
import { UploadCloud, FileText, CheckCircle2, X, Loader2, Download, ExternalLink, ZoomIn } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { ImageViewerModal } from "@/shared/components/ui";

export interface FileUploadBoxProps {
  label: string;
  description?: string;
  acceptedExtensions?: string;
  selectedFileName?: string | null;
  fileUrl?: string | null;
  isLoading?: boolean;
  onFileSelect: (fileName: string) => void;
  onFilesSelect?: (files: File[]) => void;
  onFileRemove?: () => void;
  className?: string;
}

export function FileUploadBox({
  label,
  description = "فرمت‌های مجاز: PDF, Excel, TXT (حداکثر ۲۰ مگابایت)",
  acceptedExtensions = ".pdf,.xlsx,.xls,.doc,.docx,.txt,.log,.png,.jpg",
  selectedFileName,
  fileUrl,
  isLoading = false,
  onFileSelect,
  onFilesSelect,
  onFileRemove,
  className,
}: FileUploadBoxProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [localPreviewUrl, setLocalPreviewUrl] = React.useState<string | null>(null);
  const [isViewerOpen, setIsViewerOpen] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Clean up local preview object URL on unmount or file change
  React.useEffect(() => {
    return () => {
      if (localPreviewUrl && localPreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(localPreviewUrl);
      }
    };
  }, [localPreviewUrl]);

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
      const filesArr = Array.from(e.dataTransfer.files);
      const file = filesArr[0];
      if (file.type.startsWith("image/")) {
        setLocalPreviewUrl(URL.createObjectURL(file));
      }
      onFileSelect(file.name);
      onFilesSelect?.(filesArr);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArr = Array.from(e.target.files);
      const file = filesArr[0];
      if (file.type.startsWith("image/")) {
        setLocalPreviewUrl(URL.createObjectURL(file));
      }
      onFileSelect(file.name);
      onFilesSelect?.(filesArr);
    }
  };

  const handleRemove = () => {
    if (localPreviewUrl && localPreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(localPreviewUrl);
    }
    setLocalPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onFileRemove?.();
  };

  const effectivePreviewUrl = fileUrl || localPreviewUrl;
  const isImage = Boolean(
    (effectivePreviewUrl && (effectivePreviewUrl.startsWith("data:image") || effectivePreviewUrl.startsWith("blob:") || /\.(jpe?g|png|webp|svg)($|\?)/i.test(effectivePreviewUrl))) ||
    (selectedFileName && /\.(jpe?g|png|webp|svg)$/i.test(selectedFileName))
  );

  return (
    <div className={cn("flex flex-col gap-1.5 text-right", className)} dir="rtl">
      <label className="text-xs font-semibold text-neutral-300">{label}</label>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-orange-500/50 bg-orange-500/5 text-center min-h-[110px] animate-pulse">
          <Loader2 className="h-6 w-6 animate-spin text-orange-400 mb-2" />
          <span className="text-xs font-bold text-orange-300">در حال آپلود و ذخیره فایل روی سرور...</span>
          <span className="text-[10px] text-neutral-400 mt-1">لطفاً تا اتمام انتقال شکیبا باشید</span>
        </div>
      ) : selectedFileName ? (
        <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs">
          <div className="flex items-center gap-3 min-w-0">
            {isImage && effectivePreviewUrl ? (
              <button
                type="button"
                onClick={() => setIsViewerOpen(true)}
                className="relative group shrink-0 cursor-zoom-in"
                title="مشاهده تصویر در نمایشگر پیشرفته (زوم و چرخش)"
              >
                <img
                  src={effectivePreviewUrl}
                  alt={selectedFileName || "تصویر"}
                  className="h-10 w-10 rounded-xl object-cover border border-emerald-500/40 group-hover:scale-105 group-hover:border-emerald-400 transition-all shadow-xs"
                />
              </button>
            ) : (
              <div className="h-9 w-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              </div>
            )}
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-emerald-300 font-mono text-[11px] truncate max-w-[180px] sm:max-w-xs">
                {selectedFileName}
              </span>
              <span className="text-[10px] text-emerald-400/80">فایل آماده و ثبت‌شده</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {effectivePreviewUrl && (
              isImage ? (
                <button
                  type="button"
                  onClick={() => setIsViewerOpen(true)}
                  className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg text-emerald-300 bg-emerald-500/20 hover:bg-emerald-500/30 transition-colors cursor-pointer"
                  title="مشاهده با امکانات زوم و چرخش"
                >
                  <ZoomIn className="h-3 w-3" />
                  <span>مشاهده</span>
                </button>
              ) : (
                <a
                  href={effectivePreviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg text-emerald-300 bg-emerald-500/20 hover:bg-emerald-500/30 transition-colors"
                  title="مشاهده در تب جدید"
                >
                  <ExternalLink className="h-3 w-3" />
                  <span>مشاهده</span>
                </a>
              )
            )}
            {effectivePreviewUrl && (
              <a
                href={effectivePreviewUrl}
                download={selectedFileName || "document"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg text-neutral-300 bg-neutral-800 hover:bg-neutral-700 transition-colors"
                title="دانلود فایل"
              >
                <Download className="h-3 w-3" />
              </a>
            )}
            {onFileRemove && (
              <button
                type="button"
                onClick={handleRemove}
                className="p-1 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 transition-colors cursor-pointer"
                title="حذف و تغییر فایل"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
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
      {/* Image Viewer Modal */}
      {isImage && effectivePreviewUrl && (
        <ImageViewerModal
          isOpen={isViewerOpen}
          onClose={() => setIsViewerOpen(false)}
          src={effectivePreviewUrl}
          title={selectedFileName || label}
          subtitle={label}
          fileName={selectedFileName || "document.jpg"}
        />
      )}
    </div>
  );
}
