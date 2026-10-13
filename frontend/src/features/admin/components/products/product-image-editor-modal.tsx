"use client";

import * as React from "react";
import {
  Crop,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Check,
  X,
  Eye,
  Sliders,
  Move,
  Sparkles,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";

export interface ProductImageEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  imageName?: string;
  hasCustomCrop?: boolean;
  onSaveCrop: (croppedFile: File, previewUrl: string) => void;
  onRevertToOriginal?: () => void;
}

export function ProductImageEditorModal({
  isOpen,
  onClose,
  imageUrl,
  imageName = "product-image.webp",
  hasCustomCrop = false,
  onSaveCrop,
  onRevertToOriginal,
}: ProductImageEditorModalProps) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [scale, setScale] = React.useState<number>(1);
  const [offset, setOffset] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = React.useState<boolean>(false);
  const [dragStart, setDragStart] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showWatermarkPreview, setShowWatermarkPreview] = React.useState<boolean>(true);
  const [watermarkOpacity, setWatermarkOpacity] = React.useState<number>(0.4);

  const imageObjRef = React.useRef<HTMLImageElement | null>(null);
  const watermarkObjRef = React.useRef<HTMLImageElement | null>(null);
  const [isImageLoaded, setIsImageLoaded] = React.useState(false);

  // Reset state on open or image change
  React.useEffect(() => {
    if (isOpen && imageUrl) {
      setScale(1);
      setOffset({ x: 0, y: 0 });
      setIsImageLoaded(false);

      const ImageConstructor =
        typeof Image !== "undefined"
          ? Image
          : typeof window !== "undefined" && (window as any).Image
          ? (window as any).Image
          : null;

      if (!ImageConstructor) {
        setIsImageLoaded(true);
        return;
      }

      const img = new ImageConstructor();
      img.crossOrigin = "anonymous";
      img.src = imageUrl;
      img.onload = () => {
        imageObjRef.current = img;
        setIsImageLoaded(true);
      };

      const wm = new ImageConstructor();
      wm.crossOrigin = "anonymous";
      wm.src = "/images/watermark.png";
      wm.onload = () => {
        watermarkObjRef.current = wm;
      };
    }
  }, [isOpen, imageUrl]);

  // Redraw canvas whenever scale, offset, or watermark preview changes
  const drawCanvas = React.useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageObjRef.current;
    if (!canvas || !img || !isImageLoaded) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = canvas.width; // 600x600 square canvas
    ctx.clearRect(0, 0, size, size);

    // Save context for clipping & transforms
    ctx.save();

    // Calculate aspect fill
    const imgAspect = img.width / img.height;
    let drawWidth = size;
    let drawHeight = size;

    if (imgAspect > 1) {
      // Landscape: height matches size, width is scaled
      drawHeight = size;
      drawWidth = size * imgAspect;
    } else {
      // Portrait or square: width matches size, height is scaled
      drawWidth = size;
      drawHeight = size / imgAspect;
    }

    drawWidth *= scale;
    drawHeight *= scale;

    const centerX = size / 2 + offset.x;
    const centerY = size / 2 + offset.y;

    const drawX = centerX - drawWidth / 2;
    const drawY = centerY - drawHeight / 2;

    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

    // Optional Watermark Preview Overlay
    if (showWatermarkPreview && watermarkObjRef.current) {
      const wm = watermarkObjRef.current;
      const wmWidth = size * 0.32; // 32% of canvas width
      const wmAspect = wm.width / wm.height;
      const wmHeight = wmWidth / wmAspect;

      const wmX = (size - wmWidth) / 2;
      const wmY = (size - wmHeight) / 2;

      ctx.save();
      ctx.globalAlpha = watermarkOpacity;
      ctx.drawImage(wm, wmX, wmY, wmWidth, wmHeight);
      ctx.restore();
    }

    ctx.restore();
  }, [isImageLoaded, scale, offset, showWatermarkPreview, watermarkOpacity]);

  React.useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // Mouse / Touch handlers for panning
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      const touch = e.touches[0];
      setDragStart({ x: touch.clientX - offset.x, y: touch.clientY - offset.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setOffset({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleReset = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  const handleConfirmCrop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // We export cropped image WITHOUT client watermark (because backend applies the authoritative Sharp watermark)
    // To do that, we redraw once without watermark, export blob, then restore
    const wasWatermarkOn = showWatermarkPreview;
    setShowWatermarkPreview(false);

    // Execute export on next animation frame
    requestAnimationFrame(() => {
      const ctx = canvas.getContext("2d");
      const img = imageObjRef.current;
      if (!ctx || !img) return;

      const size = canvas.width;
      ctx.clearRect(0, 0, size, size);

      const imgAspect = img.width / img.height;
      let drawWidth = size;
      let drawHeight = size;

      if (imgAspect > 1) {
        drawHeight = size;
        drawWidth = size * imgAspect;
      } else {
        drawWidth = size;
        drawHeight = size / imgAspect;
      }

      drawWidth *= scale;
      drawHeight *= scale;

      const centerX = size / 2 + offset.x;
      const centerY = size / 2 + offset.y;
      const drawX = centerX - drawWidth / 2;
      const drawY = centerY - drawHeight / 2;

      ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const finalFileName = imageName.replace(/\.[^/.]+$/, "") + "-cropped.webp";
            const croppedFile = new File([blob], finalFileName, { type: "image/webp" });
            const previewUrl = URL.createObjectURL(blob);
            onSaveCrop(croppedFile, previewUrl);
            onClose();
          }
          setShowWatermarkPreview(wasWatermarkOn);
        },
        "image/webp",
        0.95
      );
    });
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      dir="rtl"
    >
      <div className="relative w-full max-w-2xl bg-[#111113] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#161619]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl">
              <Crop className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">ویرایش و برش تصویر (نسبت ۱:۱ مربع)</h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                تصویر را جابه‌جا کرده یا زوم کنید. نسبت ابعاد خروجی دقیقاً ۱:۱ است.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Canvas & Editor Area */}
        <div className="p-6 flex flex-col items-center justify-center gap-6 overflow-y-auto">
          {/* 1:1 Canvas Container */}
          <div className="relative w-[340px] sm:w-[420px] aspect-square rounded-xl overflow-hidden border-2 border-emerald-500/40 shadow-inner bg-black cursor-grab active:cursor-grabbing group">
            <canvas
              ref={canvasRef}
              width={600}
              height={600}
              className="w-full h-full object-contain"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            />

            {/* Corner Crop Marks for Professional UI Look */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-emerald-400 pointer-events-none" />
            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-emerald-400 pointer-events-none" />
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-emerald-400 pointer-events-none" />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-emerald-400 pointer-events-none" />

            {/* Drag hint */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/70 backdrop-blur-md rounded-full text-[11px] text-neutral-300 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 border border-white/10">
              <Move className="w-3.5 h-3.5 text-emerald-400" />
              برای جابه‌جایی درگ کنید
            </div>
          </div>

          {/* Controls Bar */}
          <div className="w-full max-w-lg bg-[#18181b] border border-white/5 rounded-xl p-4 flex flex-col gap-4">
            {/* Zoom Slider */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-neutral-300 min-w-28">
                <ZoomIn className="w-4 h-4 text-emerald-400" />
                <span>بزرگ‌نمایی ({Math.round(scale * 100)}٪)</span>
              </div>
              <div className="flex-1 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setScale((s) => Math.max(0.6, Number((s - 0.1).toFixed(1))))}
                  className="p-1.5 text-neutral-400 hover:text-white bg-white/5 rounded-lg border border-white/10 hover:bg-white/10"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <input
                  type="range"
                  min="0.6"
                  max="3"
                  step="0.05"
                  value={scale}
                  onChange={(e) => setScale(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-neutral-700 rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setScale((s) => Math.min(3, Number((s + 0.1).toFixed(1))))}
                  className="p-1.5 text-neutral-400 hover:text-white bg-white/5 rounded-lg border border-white/10 hover:bg-white/10"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Watermark and Reset Options */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5">
              <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showWatermarkPreview}
                  onChange={(e) => setShowWatermarkPreview(e.target.checked)}
                  className="accent-emerald-500 rounded cursor-pointer w-4 h-4"
                />
                <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                <span>پیش‌نمایش واترمارک رسمی ققنوس آکادمی</span>
              </label>

              <div className="flex items-center gap-2">
                {hasCustomCrop && onRevertToOriginal && (
                  <button
                    type="button"
                    onClick={() => {
                      onRevertToOriginal();
                      onClose();
                    }}
                    className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors"
                    title="حذف ویرایش‌ها و بازگشت به فایل اصلی پیش از برش"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    بازگشت به تصویر خام اولیه
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs text-neutral-400 hover:text-white flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 transition-colors"
                  title="بازنشانی زوم و موقعیت کادر به مرکز"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  بازنشانی کادربندی
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-[#161619]">
          <span className="text-xs text-neutral-400">
            واترمارک نهایی سرور با وضوح بالا و نسبت ۱:۱ در بک‌اند پردازش می‌شود.
          </span>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="bg-transparent border-white/10 text-neutral-300 hover:text-white hover:bg-white/5"
            >
              انصراف
            </Button>
            <Button
              type="button"
              onClick={handleConfirmCrop}
              className="bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2 font-medium"
            >
              <Check className="w-4 h-4" />
              تأیید و اعمال برش ۱:۱
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
