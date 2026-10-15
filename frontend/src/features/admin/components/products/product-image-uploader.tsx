"use client";

import * as React from "react";
import {
  UploadCloud,
  X,
  Star,
  Crop,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Sparkles,
} from "lucide-react";
import { ProductImageEditorModal } from "./product-image-editor-modal";
import { productsApi } from "../../api/products-api";
import { cn, resolveProductImageUrl } from "@/shared/lib/utils";

export interface ManagedImageItem {
  id: string;
  file?: File;
  originalFile?: File;
  url: string; // Blob preview URL or server upload URL
  originalUrl?: string; // Untouched source image URL
  hasCustomCrop?: boolean;
  isServerUploaded?: boolean;
  isPrimary: boolean;
  uploadProgress?: number;
  isUploading?: boolean;
  error?: string;
}

export interface ProductImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxFiles?: number;
  maxSizeMb?: number;
}

export function ProductImageUploader({
  images,
  onChange,
  maxFiles = 10,
  maxSizeMb = 10,
}: ProductImageUploaderProps) {
  const [items, setItems] = React.useState<ManagedImageItem[]>(() =>
    images.map((url, index) => {
      const resolved = resolveProductImageUrl(url);
      return {
        id: `img-${index}-${Date.now()}`,
        url: resolved,
        originalUrl: resolved,
        hasCustomCrop: false,
        isServerUploaded: true,
        isPrimary: index === 0,
      };
    })
  );

  const [isDragOver, setIsDragOver] = React.useState<boolean>(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);

  // Editor Modal State
  const [editingItem, setEditingItem] = React.useState<ManagedImageItem | null>(null);
  const [isEditorOpen, setIsEditorOpen] = React.useState<boolean>(false);

  // Sync back to parent whenever items change (preserving primary image at index 0)
  const notifyParent = React.useCallback(
    (newItems: ManagedImageItem[]) => {
      // Primary image should always be first in the array
      const sorted = [...newItems].sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));
      const urls = sorted.map((i) => resolveProductImageUrl(i.url));
      onChange(urls);
    },
    [onChange]
  );

  // Process files
  const processSelectedFiles = async (fileList: FileList | File[]) => {
    setUploadError(null);
    const files = Array.from(fileList);

    if (items.length + files.length > maxFiles) {
      setUploadError(`حداکثر می‌توانید ${maxFiles} تصویر برای محصول بارگذاری نمایید.`);
      return;
    }

    const validFiles: File[] = [];
    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        setUploadError(`فایل ${file.name} از نوع تصویر معتبر نیست.`);
        return;
      }
      if (file.size > maxSizeMb * 1024 * 1024) {
        setUploadError(`حجم فایل ${file.name} بیشتر از ${maxSizeMb} مگابایت است.`);
        return;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    // Create temporary items for preview with loading state
    const newItems: ManagedImageItem[] = validFiles.map((f, idx) => {
      const previewUrl = URL.createObjectURL(f);
      return {
        id: `new-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 7)}`,
        file: f,
        originalFile: f,
        url: previewUrl,
        originalUrl: previewUrl,
        hasCustomCrop: false,
        isServerUploaded: false,
        isPrimary: items.length === 0 && idx === 0,
        isUploading: true,
        uploadProgress: 20,
      };
    });

    const combinedItems = [...items, ...newItems];
    setItems(combinedItems);

    // Attempt direct upload to backend API (which automatically processes 1:1 Sharp crop and watermarking)
    try {
      // simulate progress
      newItems.forEach((item) => {
        item.uploadProgress = 60;
      });
      setItems([...combinedItems]);

      const uploadResult = await productsApi.uploadImages(validFiles);

      if (uploadResult && uploadResult.images && uploadResult.images.length > 0) {
        const updated = combinedItems.map((item) => {
          const matchIdx = newItems.findIndex((n) => n.id === item.id);
          if (matchIdx !== -1 && uploadResult.images[matchIdx]) {
            return {
              ...item,
              url: uploadResult.images[matchIdx].url,
              isServerUploaded: true,
              isUploading: false,
              uploadProgress: 100,
            };
          }
          return item;
        });

        setItems(updated);
        notifyParent(updated);
      } else {
        // Fallback keep local object URLs
        const updated = combinedItems.map((it) => ({
          ...it,
          isUploading: false,
          uploadProgress: 100,
        }));
        setItems(updated);
        notifyParent(updated);
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "خطا در بارگذاری تصویر در سرور. لطفاً مجدداً تلاش کنید.";
      setUploadError(msg);
      // Clear failed temporary items so the admin doesn't inadvertently save non-persisted local blob URLs
      const cleaned = items.filter((it) => it.isServerUploaded || !it.isUploading);
      setItems(cleaned);
      notifyParent(cleaned);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processSelectedFiles(e.target.files);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processSelectedFiles(e.dataTransfer.files);
    }
  };

  const handleDelete = (id: string) => {
    const toDelete = items.find((i) => i.id === id);
    if (toDelete && toDelete.isServerUploaded && toDelete.url.startsWith("/uploads/products/")) {
      productsApi.deleteImage(toDelete.url).catch(() => {});
    }

    const remaining = items.filter((i) => i.id !== id);
    // If the primary image was deleted, make the first remaining primary
    if (remaining.length > 0 && !remaining.some((i) => i.isPrimary)) {
      remaining[0].isPrimary = true;
    }
    setItems(remaining);
    notifyParent(remaining);
  };

  const handleSetPrimary = (id: string) => {
    const updated = items.map((i) => ({
      ...i,
      isPrimary: i.id === id,
    }));
    setItems(updated);
    notifyParent(updated);
  };

  const handleMove = (index: number, direction: "prev" | "next") => {
    const targetIndex = direction === "prev" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const copy = [...items];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;

    // The first item should become primary
    copy.forEach((it, idx) => {
      it.isPrimary = idx === 0;
    });

    setItems(copy);
    notifyParent(copy);
  };

  const handleReplace = (id: string) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/png,image/jpeg,image/webp";
    input.onchange = async () => {
      if (input.files && input.files[0]) {
        const file = input.files[0];
        const localUrl = URL.createObjectURL(file);
        const prevItem = items.find((i) => i.id === id);
        if (prevItem && prevItem.isServerUploaded && prevItem.url.startsWith("/uploads/products/")) {
          productsApi.deleteImage(prevItem.url).catch(() => {});
        }

        // Upload single file
        try {
          const res = await productsApi.uploadImages([file]);
          const finalUrl = res.images[0]?.url || localUrl;
          const updated = items.map((i) =>
            i.id === id
              ? {
                  ...i,
                  file,
                  originalFile: file,
                  url: finalUrl,
                  originalUrl: localUrl,
                  hasCustomCrop: false,
                  isServerUploaded: true,
                }
              : i
          );
          setItems(updated);
          notifyParent(updated);
        } catch {
          const updated = items.map((i) =>
            i.id === id
              ? {
                  ...i,
                  file,
                  originalFile: file,
                  url: localUrl,
                  originalUrl: localUrl,
                  hasCustomCrop: false,
                }
              : i
          );
          setItems(updated);
          notifyParent(updated);
        }
      }
    };
    input.click();
  };

  const handleOpenEditor = (item: ManagedImageItem) => {
    setEditingItem(item);
    setIsEditorOpen(true);
  };

  const handleRevertToOriginal = async (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    if (item.originalFile) {
      try {
        const res = await productsApi.uploadImages([item.originalFile]);
        const finalUrl = res.images[0]?.url || item.originalUrl || item.url;
        const updated = items.map((i) =>
          i.id === id
            ? {
                ...i,
                file: item.originalFile,
                url: finalUrl,
                hasCustomCrop: false,
                isServerUploaded: true,
              }
            : i
        );
        setItems(updated);
        notifyParent(updated);
      } catch {
        const updated = items.map((i) =>
          i.id === id
            ? {
                ...i,
                file: item.originalFile,
                url: item.originalUrl || item.url,
                hasCustomCrop: false,
              }
            : i
        );
        setItems(updated);
        notifyParent(updated);
      }
    } else if (item.originalUrl) {
      const updated = items.map((i) =>
        i.id === id
          ? {
              ...i,
              url: item.originalUrl!,
              hasCustomCrop: false,
            }
          : i
      );
      setItems(updated);
      notifyParent(updated);
    }
  };

  const handleSaveCrop = async (croppedFile: File, previewUrl: string) => {
    if (!editingItem) return;

    // Try server upload of cropped file
    try {
      const res = await productsApi.uploadImages([croppedFile]);
      const finalUrl = res.images[0]?.url || previewUrl;
      const updated = items.map((i) =>
        i.id === editingItem.id
          ? {
              ...i,
              file: croppedFile,
              url: finalUrl,
              hasCustomCrop: true,
              isServerUploaded: true,
            }
          : i
      );
      setItems(updated);
      notifyParent(updated);
    } catch {
      const updated = items.map((i) =>
        i.id === editingItem.id
          ? {
              ...i,
              file: croppedFile,
              url: previewUrl,
              hasCustomCrop: true,
            }
          : i
      );
      setItems(updated);
      notifyParent(updated);
    }
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Upload Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-2xl p-6 transition-all duration-200 text-center flex flex-col items-center justify-center gap-3 cursor-pointer group",
          isDragOver
            ? "border-emerald-500 bg-emerald-500/10 scale-[1.005]"
            : "border-white/15 bg-[#141417] hover:border-emerald-500/50 hover:bg-[#18181c]"
        )}
      >
        <input
          type="file"
          id="product-image-input"
          multiple
          accept="image/png,image/jpeg,image/webp"
          onChange={handleFileInput}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        />

        <div className="p-3.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-2xl group-hover:scale-110 transition-transform">
          <UploadCloud className="w-7 h-7" />
        </div>

        <div>
          <p className="text-sm font-semibold text-white">
            تصاویر محصول را بکشید و رها کنید، یا{" "}
            <span className="text-emerald-400 underline decoration-emerald-500/50 underline-offset-4">
              انتخاب از سیستم
            </span>
          </p>
          <p className="text-xs text-neutral-400 mt-1">
            پشتیبانی از فرمت‌های PNG، JPG، WebP تا سقف ۱۰ مگابایت • برش ۱:۱ و اعمال واترمارک رسمی سرور
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[11px] text-neutral-300">
          <Sparkles className="w-3.5 h-3.5 text-orange-400" />
          واترمارک رسمی ققنوس آکادمی به صورت خودکار در پردازش بک‌اند اعمال می‌گردد
        </div>
      </div>

      {/* Error Message */}
      {uploadError && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Image Gallery Grid */}
      {items.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-neutral-300">
              تصاویر بارگذاری‌شده ({items.length} از {maxFiles})
            </span>
            <span className="text-[11px] text-neutral-400">
              اولین تصویر به عنوان تصویر شاخص محصول در فروشگاه نمایش داده می‌شود.
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
            {items.map((item, index) => (
              <div
                key={item.id}
                className={cn(
                  "relative aspect-square rounded-xl overflow-hidden border bg-[#18181b] group transition-all",
                  item.isPrimary
                    ? "border-emerald-500 ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-950/40"
                    : "border-white/10 hover:border-white/30"
                )}
              >
                {/* Image element */}
                <img
                  src={resolveProductImageUrl(item.url)}
                  alt={`Product view ${index + 1}`}
                  className="w-full h-full object-cover select-none"
                  onError={(e) => {
                    if (item.originalUrl && e.currentTarget.src !== item.originalUrl) {
                      e.currentTarget.src = resolveProductImageUrl(item.originalUrl);
                    }
                  }}
                />

                {/* Uploading overlay */}
                {item.isUploading && (
                  <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center gap-2 p-2 text-center">
                    <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
                    <span className="text-[10px] text-neutral-300 font-mono">
                      در حال پردازش ({item.uploadProgress}٪)
                    </span>
                    <div className="w-3/4 h-1 bg-neutral-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-300"
                        style={{ width: `${item.uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Primary Badge */}
                {item.isPrimary && (
                  <div className="absolute top-2 right-2 px-2 py-0.5 bg-emerald-500 text-black text-[10px] font-bold rounded-md shadow-md flex items-center gap-1 select-none">
                    <Star className="w-3 h-3 fill-current" />
                    تصویر اصلی
                  </div>
                )}

                {/* Quick Actions Hover Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                  {/* Top Bar: Reorder buttons */}
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-1">
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => handleMove(index, "prev")}
                          title="انتقال به قبل"
                          className="p-1 bg-white/20 hover:bg-white/40 text-white rounded-md backdrop-blur-sm transition-colors"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {index < items.length - 1 && (
                        <button
                          type="button"
                          onClick={() => handleMove(index, "next")}
                          title="انتقال به بعد"
                          className="p-1 bg-white/20 hover:bg-white/40 text-white rounded-md backdrop-blur-sm transition-colors"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      title="حذف تصویر"
                      className="p-1 bg-rose-600/80 hover:bg-rose-600 text-white rounded-md backdrop-blur-sm transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Bottom Bar: Set Primary, Crop, Replace */}
                  <div className="flex items-center justify-center gap-1.5 w-full">
                    {!item.isPrimary && (
                      <button
                        type="button"
                        onClick={() => handleSetPrimary(item.id)}
                        title="انتخاب به عنوان تصویر اصلی"
                        className="p-1.5 bg-white/20 hover:bg-emerald-600 text-white rounded-lg backdrop-blur-sm transition-colors text-[10px] flex items-center gap-1"
                      >
                        <Star className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleOpenEditor(item)}
                      title="برش و ویرایش ۱:۱"
                      className="p-1.5 bg-emerald-600/80 hover:bg-emerald-600 text-white rounded-lg backdrop-blur-sm transition-colors text-[10px] flex items-center gap-1"
                    >
                      <Crop className="w-3.5 h-3.5" />
                      <span>برش</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleReplace(item.id)}
                      title="جایگزینی تصویر"
                      className="p-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg backdrop-blur-sm transition-colors text-[10px]"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Image Editor Modal */}
      {editingItem && (
        <ProductImageEditorModal
          isOpen={isEditorOpen}
          onClose={() => {
            setIsEditorOpen(false);
            setEditingItem(null);
          }}
          imageUrl={editingItem.originalUrl || editingItem.url}
          imageName={editingItem.originalFile?.name || editingItem.file?.name || "product-image.webp"}
          hasCustomCrop={Boolean(editingItem.hasCustomCrop)}
          onSaveCrop={handleSaveCrop}
          onRevertToOriginal={() => handleRevertToOriginal(editingItem.id)}
        />
      )}
    </div>
  );
}
