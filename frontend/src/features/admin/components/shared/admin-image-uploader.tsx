"use client";

import * as React from "react";
import {
  UploadCloud,
  X,
  RefreshCw,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Trash2,
  Sparkles,
  Maximize2,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { apiClient } from "@/shared/lib/api-client";

export interface AdminImageUploaderProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  onUpload?: (file: File) => Promise<{ url: string }>;
  label?: string;
  hint?: string;
  accept?: string;
  maxSizeMb?: number;
  className?: string;
}

export function AdminImageUploader({
  value,
  onChange,
  onUpload,
  label = "تصویر یا لوگو",
  hint = "فرمت‌های مجاز: PNG, JPG, SVG, WebP (حداکثر ۵ مگابایت، بدون واترمارک)",
  accept = "image/png,image/jpeg,image/webp,image/svg+xml",
  maxSizeMb = 5,
  className,
}: AdminImageUploaderProps) {
  const [isDragOver, setIsDragOver] = React.useState<boolean>(false);
  const [isUploading, setIsUploading] = React.useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = React.useState<number>(0);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(value || null);
  const [isZoomOpen, setIsZoomOpen] = React.useState<boolean>(false);

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Sync external value
  React.useEffect(() => {
    setPreviewUrl(value || null);
  }, [value]);

  const handleProcessFile = async (file: File) => {
    setErrorMessage(null);

    // Validate type
    if (!file.type.startsWith("image/") && !file.name.endsWith(".svg")) {
      setErrorMessage("لطفاً یک فایل تصویری معتبر انتخاب فرمایید.");
      return;
    }

    // Validate size
    if (file.size > maxSizeMb * 1024 * 1024) {
      setErrorMessage(`حجم تصویر نباید بیشتر از ${maxSizeMb} مگابایت باشد.`);
      return;
    }

    const localBlob = URL.createObjectURL(file);
    setPreviewUrl(localBlob);
    setIsUploading(true);
    setUploadProgress(25);

    try {
      setUploadProgress(60);

      let serverUrl = "";
      if (onUpload) {
        const res = await onUpload(file);
        serverUrl = res.url;
      } else {
        // Default carrier icon upload endpoint
        const formData = new FormData();
        formData.append("file", file);
        try {
          const res = await apiClient.post<{ url: string }>("/shipping/admin/upload-icon", formData);
          serverUrl = res.url;
        } catch {
          const fallbackRes = await apiClient.post<{ url: string }>("/products/upload-icon", formData);
          serverUrl = fallbackRes.url;
        }
      }

      setUploadProgress(100);
      setPreviewUrl(serverUrl);
      onChange(serverUrl);
    } catch (err: unknown) {
      // In case network/server fails, retain local preview or warn
      const msg = err instanceof Error ? err.message : "خطا در آپلود تصویر به سرور";
      setErrorMessage(`${msg}. پیش‌نمایش محلی اعمال شد.`);
      onChange(localBlob);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleProcessFile(e.target.files[0]);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewUrl(null);
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    onChange(null);
  };

  return (
    <div className={cn("space-y-2 text-right", className)} dir="rtl">
      {label && (
        <label className="block text-xs font-semibold text-neutral-300">
          {label}
        </label>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleInputChange}
      />

      {/* Upload Zone / Preview Card */}
      {!previewUrl ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed transition-all cursor-pointer select-none",
            isDragOver
              ? "border-orange-500 bg-orange-950/20 shadow-lg shadow-orange-950/30"
              : "border-neutral-800 bg-[#161619] hover:border-neutral-700 hover:bg-[#1a1a1e]"
          )}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 mb-3 group-hover:scale-105 transition-transform">
            <UploadCloud className="h-6 w-6" />
          </div>

          <p className="text-xs font-bold text-white mb-1">
            جهت انتخاب تصویر کلیک کنید یا فایل را اینجا بکشید و رها کنید
          </p>
          <p className="text-[11px] text-neutral-400">{hint}</p>
        </div>
      ) : (
        <div className="relative rounded-2xl border border-neutral-800 bg-[#141417] p-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 overflow-hidden">
            <div className="relative h-14 w-14 rounded-xl border border-neutral-700/80 bg-black/40 overflow-hidden flex items-center justify-center shrink-0">
              <img
                src={previewUrl}
                alt="Uploaded"
                className="h-full w-full object-contain p-1.5"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
              <button
                type="button"
                onClick={() => setIsZoomOpen(true)}
                className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer"
                title="مشاهده بزرگ‌نمایی"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-1 overflow-hidden">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white truncate max-w-[200px] dir-ltr text-right">
                  {previewUrl.split("/").pop()}
                </span>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  بدون واترمارک
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                تصویر با ابعاد بهینه و پس‌زمینه شفاف ذخیره گردید
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1.5 rounded-xl border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5"
              title="جایگزینی با تصویر جدید"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">جایگزینی</span>
            </button>

            <button
              type="button"
              onClick={handleRemove}
              className="p-1.5 rounded-xl border border-red-500/20 bg-red-950/20 hover:bg-red-950/40 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
              title="حذف تصویر"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          {/* Uploading overlay */}
          {isUploading && (
            <div className="absolute inset-0 rounded-2xl bg-black/75 backdrop-blur-sm flex items-center justify-center gap-3 z-10 px-4">
              <Loader2 className="h-4 w-4 text-orange-400 animate-spin shrink-0" />
              <div className="flex-1 max-w-xs space-y-1">
                <div className="flex justify-between text-[10px] text-neutral-300">
                  <span>در حال آپلود و بهینه‌سازی...</span>
                  <span className="font-mono">{uploadProgress}%</span>
                </div>
                <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="p-2.5 rounded-xl border border-red-500/30 bg-red-950/20 flex items-center gap-2 text-xs text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Zoom Modal */}
      {isZoomOpen && previewUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in"
          onClick={() => setIsZoomOpen(false)}
        >
          <div
            className="relative max-w-md w-full rounded-2xl border border-neutral-800 bg-[#18181b] p-6 space-y-4 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <span className="text-xs font-bold text-white">پیش‌نمایش لوگو / آیکون</span>
              <button
                type="button"
                onClick={() => setIsZoomOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="h-56 w-full flex items-center justify-center bg-black/40 rounded-xl p-4">
              <img
                src={previewUrl}
                alt="Full Preview"
                className="max-h-full max-w-full object-contain"
              />
            </div>

            <p className="text-[11px] text-neutral-400">
              این تصویر به عنوان آیکون شیوه ارسال در پنل مدیریت و صفحه تسویه‌حساب مشتری نمایش داده خواهد شد (بدون واترمارک).
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
