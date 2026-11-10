"use client";

import * as React from "react";
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  Sparkles,
  Download,
  ExternalLink,
  Printer,
  Maximize2,
  Minimize2,
  RefreshCw,
  FlipHorizontal,
  FileImage,
  FileText,
  Sliders,
  Check,
} from "lucide-react";
import { toPersianDigits } from "@/shared/lib/utils";

export type ImageEnhanceMode = "normal" | "contrast" | "doc_scan" | "invert" | "sharp";

export interface ImageViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  src?: string | null;
  title?: string;
  subtitle?: string;
  fileName?: string;
  downloadUrl?: string;
}

const ENHANCE_MODES: Array<{
  id: ImageEnhanceMode;
  label: string;
  description: string;
  filter: string;
}> = [
  {
    id: "normal",
    label: "عادی",
    description: "نمایش تصویر با رنگ و کنتراست پیش‌فرض",
    filter: "none",
  },
  {
    id: "contrast",
    label: "افزایش کنتراست",
    description: "تقویت کنتراست برای تفکیک خطوط کم‌رنگ",
    filter: "contrast(165%) brightness(105%) saturate(115%)",
  },
  {
    id: "doc_scan",
    label: "اسکن سند (سیاه‌سفید)",
    description: "تبدیل به حالت سند اداری و حذف سایه‌های پس‌زمینه",
    filter: "grayscale(100%) contrast(190%) brightness(108%)",
  },
  {
    id: "invert",
    label: "نگاتیو / معکوس",
    description: "معکوس کردن روشنایی جهت خواندن جوهرها و مهرهای فاقد وضوح",
    filter: "invert(100%) contrast(150%) hue-rotate(180deg)",
  },
  {
    id: "sharp",
    label: "شفاف‌سازی و شارپ",
    description: "تقویت لبه‌ها و خوانایی دست‌خط و ارقام فیش",
    filter: "contrast(140%) brightness(102%) saturate(110%) drop-shadow(0 0 1px rgba(0,0,0,0.6))",
  },
];

export function ImageViewerModal({
  isOpen,
  onClose,
  src,
  title = "مشاهده و اعتبارسنجی سند فیش",
  subtitle,
  fileName,
  downloadUrl,
}: ImageViewerModalProps) {
  const [zoom, setZoom] = React.useState<number>(1);
  const [rotation, setRotation] = React.useState<number>(0);
  const [flipH, setFlipH] = React.useState<boolean>(false);
  const [enhanceMode, setEnhanceMode] = React.useState<ImageEnhanceMode>("normal");
  const [showEnhanceMenu, setShowEnhanceMenu] = React.useState<boolean>(false);
  const [pan, setPan] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = React.useState<boolean>(false);
  const [dragStart, setDragStart] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Reset transforms whenever modal opens or src changes
  React.useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setRotation(0);
      setFlipH(false);
      setEnhanceMode("normal");
      setShowEnhanceMenu(false);
      setPan({ x: 0, y: 0 });
    }
  }, [isOpen, src]);

  // Keyboard controls
  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "+" || e.key === "=") {
        setZoom((z) => Math.min(4, Number((z + 0.25).toFixed(2))));
      } else if (e.key === "-" || e.key === "_") {
        setZoom((z) => Math.max(0.5, Number((z - 0.25).toFixed(2))));
      } else if (e.key === "0") {
        setZoom(1);
        setPan({ x: 0, y: 0 });
        setRotation(0);
      } else if (e.key.toLowerCase() === "r") {
        setRotation((r) => (r + 90) % 360);
      } else if (e.key.toLowerCase() === "e") {
        cycleEnhanceMode();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const cycleEnhanceMode = () => {
    const idx = ENHANCE_MODES.findIndex((m) => m.id === enhanceMode);
    const nextIdx = (idx + 1) % ENHANCE_MODES.length;
    setEnhanceMode(ENHANCE_MODES[nextIdx].id);
  };

  const handleZoomIn = () => {
    setZoom((z) => Math.min(4, Number((z + 0.25).toFixed(2))));
  };

  const handleZoomOut = () => {
    setZoom((z) => Math.max(0.5, Number((z - 0.25).toFixed(2))));
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setFlipH(false);
    setPan({ x: 0, y: 0 });
    setEnhanceMode("normal");
  };

  const handleRotateRight = () => {
    setRotation((r) => (r + 90) % 360);
  };

  const handleRotateLeft = () => {
    setRotation((r) => (r - 90 + 360) % 360);
  };

  const handleToggleFlip = () => {
    setFlipH((f) => !f);
  };

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
    if (e.deltaY < 0) {
      setZoom((z) => Math.min(4, Number((z + 0.15).toFixed(2))));
    } else {
      setZoom((z) => Math.max(0.5, Number((z - 0.15).toFixed(2))));
    }
  };

  // Mouse drag / pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleDownload = () => {
    if (!src) return;
    const a = document.createElement("a");
    a.href = downloadUrl || src;
    a.download = fileName || "receipt-document.jpg";
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePrint = () => {
    if (!src) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    const filterStyle = ENHANCE_MODES.find((m) => m.id === enhanceMode)?.filter || "none";
    printWindow.document.write(`
      <html dir="rtl">
        <head>
          <title>${title || "سند فیش"}</title>
          <style>
            body { margin: 0; display: flex; align-items: center; justify-content: center; height: 100vh; background: #fff; }
            img { max-width: 95%; max-height: 95%; object-fit: contain; filter: ${filterStyle}; transform: rotate(${rotation}deg); }
          </style>
        </head>
        <body>
          <img src="${src}" alt="سند" onload="window.print(); window.close();" />
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (!isOpen || !src) return null;

  const isPdf = Boolean(
    (src && (/\.pdf($|\?)/i.test(src) || src.startsWith("data:application/pdf"))) ||
    (fileName && /\.pdf$/i.test(fileName))
  );

  const currentModeObj = ENHANCE_MODES.find((m) => m.id === enhanceMode) || ENHANCE_MODES[0];

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-black/92 backdrop-blur-xl animate-in fade-in duration-200 select-none"
      dir="rtl"
      onMouseUp={handleMouseUp}
    >
      {/* ─── Top Header Toolbar ────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-neutral-800/80 bg-neutral-950/80 shrink-0 gap-3">
        {/* Left/Right: Title and Document Info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
            {isPdf ? <FileText className="w-5 h-5 text-sky-400" /> : <FileImage className="w-5 h-5" />}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white truncate">{title}</h2>
              {isPdf ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 font-bold shrink-0">
                  سند PDF
                </span>
              ) : enhanceMode !== "normal" && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold shrink-0">
                  {currentModeObj.label}
                </span>
              )}
            </div>
            <p className="text-[11px] text-neutral-400 truncate mt-0.5">
              {subtitle || fileName || (isPdf ? "پیش‌نمایش سند PDF با امکان چاپ و دانلود" : "نمایش با امکان چرخش، بزرگ‌نمایی و بهینه‌سازی خوانایی سند")}
            </p>
          </div>
        </div>

        {/* Right/Left: Action Buttons & Close */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={handleDownload}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            title="دانلود فایل اصلی"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">دانلود</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            title="چاپ سند"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">چاپ</span>
          </button>

          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5"
            title="باز کردن در تب جداگانه"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="hidden sm:inline">تب جدید</span>
          </a>

          <div className="w-[1px] h-6 bg-neutral-800 mx-1 hidden sm:block" />

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-all cursor-pointer border border-neutral-800"
            title="بستن (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ─── Main Viewport ─────────────────────────────────────────── */}
      <div
        className="flex-1 relative overflow-hidden flex items-center justify-center cursor-default"
        onWheel={!isPdf ? handleWheel : undefined}
        onMouseDown={!isPdf ? handleMouseDown : undefined}
        onMouseMove={!isPdf ? handleMouseMove : undefined}
      >
        {isPdf ? (
          <div className="w-full h-full p-2 sm:p-4 flex items-center justify-center">
            <iframe
              src={src}
              title={title}
              className="w-[92vw] max-w-5xl h-[78vh] rounded-2xl border border-neutral-800 bg-neutral-900 shadow-2xl"
            />
          </div>
        ) : (
          <div
            className={`transition-transform duration-100 ease-out flex items-center justify-center max-w-full max-h-full ${
              zoom > 1 ? (isDragging ? "cursor-grabbing" : "cursor-grab") : "cursor-default"
            }`}
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom}) rotate(${rotation}deg) scaleX(${
                flipH ? -1 : 1
              })`,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={title}
              draggable={false}
              className="max-h-[75vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl transition-all duration-150 pointer-events-none border border-neutral-800/80 bg-neutral-950"
              style={{
                filter: currentModeObj.filter,
              }}
            />
          </div>
        )}

        {/* Pan reset indicator when panned */}
        {!isPdf && (pan.x !== 0 || pan.y !== 0) && (
          <button
            type="button"
            onClick={() => setPan({ x: 0, y: 0 })}
            className="absolute bottom-20 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-neutral-900/90 border border-neutral-700 text-neutral-300 text-xs font-medium shadow-lg hover:text-white cursor-pointer"
          >
            بازنشانی موقعیت تصویر
          </button>
        )}
      </div>

      {/* ─── Bottom Floating Toolbar ────────────────────────────────── */}
      {!isPdf && (
        <div className="px-4 py-3 shrink-0 flex items-center justify-center relative">
          <div className="bg-neutral-900/95 border border-neutral-700/80 rounded-2xl p-1.5 sm:p-2 shadow-2xl flex flex-wrap items-center justify-center gap-1 sm:gap-2 max-w-full">
            {/* Zoom controls */}
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={zoom <= 0.5}
              className="p-2 rounded-xl text-neutral-300 hover:text-white hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
              title="کوچک‌نمایی (-)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <span
              className="px-2.5 py-1 rounded-xl bg-neutral-950 font-mono text-xs font-bold text-white min-w-[54px] text-center border border-neutral-800 cursor-pointer"
              onClick={() => setZoom(1)}
              title="کلیک برای بازنشانی زوم"
            >
              {toPersianDigits(Math.round(zoom * 100))}٪
            </span>

            <button
              type="button"
              onClick={handleZoomIn}
              disabled={zoom >= 4}
              className="p-2 rounded-xl text-neutral-300 hover:text-white hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
              title="بزرگ‌نمایی (+)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            <div className="w-[1px] h-5 bg-neutral-800 mx-1" />

            {/* Rotation controls */}
            <button
              type="button"
              onClick={handleRotateLeft}
              className="p-2 rounded-xl text-neutral-300 hover:text-white hover:bg-neutral-800 transition-all cursor-pointer flex items-center gap-1"
              title="چرخش ۹۰ درجه به چپ"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleRotateRight}
              className="p-2 rounded-xl text-neutral-300 hover:text-white hover:bg-neutral-800 transition-all cursor-pointer flex items-center gap-1"
              title="چرخش ۹۰ درجه به راست (R)"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleToggleFlip}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                flipH ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "text-neutral-300 hover:text-white hover:bg-neutral-800"
              }`}
              title="آینه / فلیپ افقی"
            >
              <FlipHorizontal className="w-4 h-4" />
            </button>

            <div className="w-[1px] h-5 bg-neutral-800 mx-1" />

            {/* Enhancement / Quality Boost Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowEnhanceMenu((prev) => !prev)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md ${
                  enhanceMode !== "normal"
                    ? "bg-amber-500 text-black shadow-amber-500/20"
                    : "bg-neutral-800 hover:bg-neutral-700 text-amber-300 hover:text-amber-200 border border-amber-500/30"
                }`}
                title="بهینه‌سازی کیفیت و افزایش وضوح متن و ارقام فیش"
              >
                <Sparkles className="w-4 h-4" />
                <span>افزایش کیفیت</span>
                <span className="text-[10px] opacity-80">({currentModeObj.label})</span>
              </button>

              {/* Enhancement Dropdown Menu */}
              {showEnhanceMenu && (
                <div className="absolute bottom-full mb-3 right-0 w-64 bg-[#18181c] border border-neutral-700 rounded-2xl p-2 shadow-2xl space-y-1 z-50 animate-in fade-in slide-in-from-bottom-2">
                  <div className="px-2 py-1 text-[11px] font-bold text-neutral-400 border-b border-neutral-800 mb-1">
                    حالت‌های پردازش تصویر فیش:
                  </div>
                  {ENHANCE_MODES.map((mode) => {
                    const isActive = enhanceMode === mode.id;
                    return (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => {
                          setEnhanceMode(mode.id);
                          setShowEnhanceMenu(false);
                        }}
                        className={`w-full text-right p-2 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer ${
                          isActive
                            ? "bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40"
                            : "text-neutral-300 hover:bg-neutral-800/80"
                        }`}
                      >
                        <div className="space-y-0.5">
                          <span className="block">{mode.label}</span>
                          <span className="text-[10px] text-neutral-500 block leading-tight">
                            {mode.description}
                          </span>
                        </div>
                        {isActive && <Check className="w-4 h-4 text-amber-400 shrink-0 mr-2" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="w-[1px] h-5 bg-neutral-800 mx-1" />

            {/* Reset All */}
            <button
              type="button"
              onClick={handleReset}
              className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all cursor-pointer"
              title="بازنشانی تمام تغییرات (0)"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
