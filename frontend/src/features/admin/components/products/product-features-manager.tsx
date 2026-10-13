"use client";

import * as React from "react";
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Upload,
  X,
  Image as ImageIcon,
  Cpu,
  Layers,
  Wifi,
  Server,
  Zap,
  ShieldCheck,
  Activity,
  HardDrive,
  Radio,
  Cable,
  Gauge,
  Network,
  Sparkles,
} from "lucide-react";
import type { AdminProductFeature } from "../../types/admin-products.types";
import { productsApi } from "../../api/products-api";
import { Button } from "@/shared/components/ui/button";
import { cn, resolveProductImageUrl } from "@/shared/lib/utils";

// Curated network & hardware system icon presets
export const PRESET_SYSTEM_ICONS = [
  { name: "cpu", label: "پردازنده", icon: Cpu },
  { name: "network", label: "شبکه", icon: Network },
  { name: "server", label: "سرور", icon: Server },
  { name: "wifi", label: "وایرلس", icon: Wifi },
  { name: "layers", label: "لایه ۳", icon: Layers },
  { name: "shield", label: "امنیت", icon: ShieldCheck },
  { name: "zap", label: "توان برق / PoE", icon: Zap },
  { name: "cable", label: "کابل و پسیو", icon: Cable },
  { name: "harddrive", label: "حافظه ذخیره", icon: HardDrive },
  { name: "gauge", label: "سرعت / پینگ", icon: Gauge },
  { name: "activity", label: "عملکرد", icon: Activity },
  { name: "radio", label: "آنتن رادیویی", icon: Radio },
] as const;

export interface ProductFeaturesManagerProps {
  features: AdminProductFeature[];
  onChange: (features: AdminProductFeature[]) => void;
}

export function ProductFeaturesManager({
  features,
  onChange,
}: ProductFeaturesManagerProps) {
  const [items, setItems] = React.useState<AdminProductFeature[]>(features || []);
  const [activeIconPickerIndex, setActiveIconPickerIndex] = React.useState<number | null>(null);

  // Sync internal items with incoming props if changed from outside
  React.useEffect(() => {
    if (features && features !== items) {
      setItems(features);
    }
  }, [features]);

  const updateItems = (newItems: AdminProductFeature[]) => {
    // Ensure sequential sortOrder
    const sorted = newItems.map((item, idx) => ({
      ...item,
      sortOrder: idx,
    }));
    setItems(sorted);
    onChange(sorted);
  };

  const handleAddFeature = () => {
    const newFeature: AdminProductFeature = {
      id: `feat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: "",
      description: "",
      iconName: "network",
      sortOrder: items.length,
    };
    updateItems([...items, newFeature]);
  };

  const handleRemoveFeature = (index: number) => {
    const updated = items.filter((_, idx) => idx !== index);
    updateItems(updated);
  };

  const handleFieldChange = (
    index: number,
    field: keyof AdminProductFeature,
    value: string
  ) => {
    const updated = items.map((it, idx) => (idx === index ? { ...it, [field]: value } : it));
    updateItems(updated);
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const copy = [...items];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;

    updateItems(copy);
  };

  const handleUploadIcon = async (index: number, file: File) => {
    const localUrl = URL.createObjectURL(file);
    // Optimistic update
    const optimistic = items.map((it, idx) =>
      idx === index ? { ...it, iconUrl: localUrl, iconName: undefined } : it
    );
    updateItems(optimistic);

    try {
      const res = await productsApi.uploadFeatureIcon(file);
      if (res && res.url) {
        const confirmed = items.map((it, idx) =>
          idx === index ? { ...it, iconUrl: res.url, iconName: undefined } : it
        );
        updateItems(confirmed);
      }
    } catch {
      // Retain localUrl
    }
  };

  const handleRemoveIcon = (index: number) => {
    const toRemove = items[index];
    if (toRemove && toRemove.iconUrl && toRemove.iconUrl.startsWith("/uploads/icons/")) {
      productsApi.deleteFeatureIcon(toRemove.iconUrl).catch(() => {});
    }

    const updated = items.map((it, idx) =>
      idx === index ? { ...it, iconUrl: undefined, iconName: "network" } : it
    );
    updateItems(updated);
  };

  const handleSelectPresetIcon = (index: number, iconName: string) => {
    const updated = items.map((it, idx) =>
      idx === index ? { ...it, iconName, iconUrl: undefined } : it
    );
    updateItems(updated);
    setActiveIconPickerIndex(null);
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            ویژگی‌های فنی و داینامیک محصول
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
              {items.length} ویژگی
            </span>
          </h4>
          <p className="text-xs text-neutral-400 mt-0.5">
            می‌توانید هر تعداد مشخصه یا قابلیت دلخواه را همراه با عنوان، توضیحات و آیکون اختصاصی تعریف کنید.
          </p>
        </div>

        <Button
          type="button"
          onClick={handleAddFeature}
          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs flex items-center gap-1.5 h-8 px-3 rounded-lg"
        >
          <Plus className="w-4 h-4" />
          افزودن ویژگی جدید
        </Button>
      </div>

      {/* Feature List */}
      {items.length === 0 ? (
        <div className="border border-dashed border-white/10 rounded-2xl p-8 text-center bg-[#141417] flex flex-col items-center justify-center gap-3">
          <div className="p-3 bg-white/5 text-neutral-400 rounded-xl border border-white/10">
            <Sparkles className="w-6 h-6 text-emerald-400" />
          </div>
          <div className="max-w-md">
            <p className="text-sm font-semibold text-white">هنوز ویژگی داینامیکی ثبت نشده است</p>
            <p className="text-xs text-neutral-400 mt-1">
              با کلیک روی دکمه «افزودن ویژگی جدید»، مواردی مانند پورت‌ها، استانداردها، گواهینامه‌ها یا قابلیت‌های خاص این محصول را درج کنید.
            </p>
          </div>
          <Button
            type="button"
            onClick={handleAddFeature}
            variant="outline"
            className="text-xs border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 mt-1"
          >
            <Plus className="w-3.5 h-3.5 ml-1" />
            افزودن اولین ویژگی
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => {
            const PresetIconComponent =
              PRESET_SYSTEM_ICONS.find((p) => p.name === item.iconName)?.icon || Network;

            return (
              <div
                key={item.id}
                className="bg-[#141417] border border-white/10 rounded-xl p-4 hover:border-emerald-500/30 transition-all flex flex-col md:flex-row items-start md:items-center gap-4 group"
              >
                {/* Sort Order Reorder Controls */}
                <div className="flex md:flex-col items-center gap-1 shrink-0">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => handleMove(index, "up")}
                    className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent"
                    title="انتقال به بالا"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <span className="text-[11px] font-mono text-neutral-500 px-1">
                    {index + 1}
                  </span>
                  <button
                    type="button"
                    disabled={index === items.length - 1}
                    onClick={() => handleMove(index, "down")}
                    className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent"
                    title="انتقال به پایین"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>

                {/* Icon Section (Custom Upload or Preset System Icon) */}
                <div className="relative shrink-0 flex items-center gap-2">
                  <div
                    onClick={() =>
                      setActiveIconPickerIndex(activeIconPickerIndex === index ? null : index)
                    }
                    className="w-12 h-12 rounded-xl bg-[#1c1c20] border border-white/15 flex items-center justify-center cursor-pointer hover:border-emerald-500/60 transition-colors overflow-hidden group/icon relative"
                    title="کلیک برای تغییر یا انتخاب آیکون"
                  >
                    {item.iconUrl ? (
                      <img
                        src={resolveProductImageUrl(item.iconUrl)}
                        alt={item.title || "Icon"}
                        className="w-8 h-8 object-contain"
                      />
                    ) : (
                      <PresetIconComponent className="w-6 h-6 text-emerald-400" />
                    )}

                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/icon:opacity-100 flex items-center justify-center transition-opacity text-[10px] text-white">
                      تغییر
                    </div>
                  </div>

                  {/* Icon Selector Popover */}
                  {activeIconPickerIndex === index && (
                    <div className="absolute top-14 right-0 z-30 w-72 bg-[#1c1c20] border border-white/15 rounded-xl shadow-2xl p-3.5 space-y-3">
                      <div className="flex items-center justify-between border-b border-white/10 pb-2">
                        <span className="text-xs font-semibold text-white">انتخاب آیکون ویژگی</span>
                        <button
                          type="button"
                          onClick={() => setActiveIconPickerIndex(null)}
                          className="text-neutral-400 hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Upload Custom Icon */}
                      <div>
                        <label className="flex items-center justify-center gap-2 p-2 border border-dashed border-emerald-500/40 rounded-lg bg-emerald-500/5 hover:bg-emerald-500/10 cursor-pointer text-xs text-emerald-400 transition-colors">
                          <Upload className="w-3.5 h-3.5" />
                          <span>آپلود آیکون از سیستم (PNG/SVG)</span>
                          <input
                            type="file"
                            accept="image/png,image/svg+xml,image/webp"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleUploadIcon(index, e.target.files[0]);
                                setActiveIconPickerIndex(null);
                              }
                            }}
                          />
                        </label>
                      </div>

                      {/* Preset Icons Grid */}
                      <div>
                        <span className="text-[11px] text-neutral-400 block mb-1.5">
                          آیکون‌های آماده شبکه:
                        </span>
                        <div className="grid grid-cols-4 gap-1.5">
                          {PRESET_SYSTEM_ICONS.map((preset) => {
                            const IconCmp = preset.icon;
                            return (
                              <button
                                key={preset.name}
                                type="button"
                                onClick={() => handleSelectPresetIcon(index, preset.name)}
                                className={cn(
                                  "p-2 rounded-lg flex flex-col items-center gap-1 border transition-all text-neutral-300 hover:text-white hover:bg-white/10",
                                  item.iconName === preset.name && !item.iconUrl
                                    ? "border-emerald-500 bg-emerald-500/20 text-emerald-400"
                                    : "border-white/5 bg-white/5"
                                )}
                                title={preset.label}
                              >
                                <IconCmp className="w-4 h-4" />
                                <span className="text-[9px] truncate w-full text-center">
                                  {preset.label}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Remove Icon action */}
                      {item.iconUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            handleRemoveIcon(index);
                            setActiveIconPickerIndex(null);
                          }}
                          className="w-full text-center text-[11px] text-rose-400 hover:text-rose-300 pt-1 border-t border-white/5"
                        >
                          حذف آیکون اختصاصی
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Form Fields: Title and Description */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-3 w-full">
                  <div className="md:col-span-4">
                    <label className="text-[11px] text-neutral-400 mb-1 block">عنوان ویژگی</label>
                    <input
                      type="text"
                      placeholder="مثال: پهنای باند سوئیچینگ"
                      value={item.title}
                      onChange={(e) => handleFieldChange(index, "title", e.target.value)}
                      className="w-full h-9 px-3 text-xs bg-[#18181b] border border-white/10 rounded-lg text-white focus:border-emerald-500 focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="md:col-span-8">
                    <label className="text-[11px] text-neutral-400 mb-1 block">
                      مقدار یا توضیحات ویژگی
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: ۲۱۶ گیگابیت بر ثانیه با بافر فوق‌سریع ۳۲ مگابایت"
                      value={item.description}
                      onChange={(e) => handleFieldChange(index, "description", e.target.value)}
                      className="w-full h-9 px-3 text-xs bg-[#18181b] border border-white/10 rounded-lg text-white focus:border-emerald-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => handleRemoveFeature(index)}
                  className="p-2 text-neutral-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors shrink-0"
                  title="حذف ویژگی"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
