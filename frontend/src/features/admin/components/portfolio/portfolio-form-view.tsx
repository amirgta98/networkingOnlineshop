"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Briefcase,
  Save,
  ArrowRight,
  Eye,
  Sparkles,
  Upload,
  Image as ImageIcon,
  Video,
  X,
  Plus,
  Tag,
  Calendar,
  Building2,
  MapPin,
  Globe,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Trash2,
  Cpu,
  Layers,
  Award,
  Zap,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { portfolioApi } from "@/features/portfolio/api/portfolio-api";
import type {
  ProjectItem,
  PortfolioFormData,
  ContentStatus,
  PortfolioCategory,
  PortfolioFeatureItem,
  PortfolioChallengeItem,
  PortfolioTechnologyItem,
  PortfolioAchievementItem,
  PortfolioMediaItem,
} from "@/features/portfolio/types";
import { Button } from "@/shared/components/ui/button";
import { cn, toPersianDigits } from "@/shared/lib/utils";

interface PortfolioFormViewProps {
  initialProject?: ProjectItem | null;
  projectId?: string;
  isEditMode?: boolean;
}

export function PortfolioFormView({
  initialProject,
  projectId,
  isEditMode = false,
}: PortfolioFormViewProps) {
  const router = useRouter();

  const [activeTab, setActiveTab] = React.useState<
    "general" | "features" | "challenges" | "technologies" | "achievements" | "media" | "seo"
  >("general");

  const [categories, setCategories] = React.useState<PortfolioCategory[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [isLoadingProject, setIsLoadingProject] = React.useState<boolean>(Boolean(projectId && !initialProject));

  // Basic Info
  const [title, setTitle] = React.useState(initialProject?.title || "");
  const [slug, setSlug] = React.useState(initialProject?.slug || "");
  const [isSlugManual, setIsSlugManual] = React.useState(Boolean(initialProject?.slug));
  const [client, setClient] = React.useState(initialProject?.client || "");
  const [location, setLocation] = React.useState(initialProject?.location || "");
  const [year, setYear] = React.useState(initialProject?.year || "۱۴۰۲");
  const [categoryId, setCategoryId] = React.useState(initialProject?.categoryId || "");
  const [projectStatusLabel, setProjectStatusLabel] = React.useState(
    initialProject?.projectStatusLabel || "تحویل نهایی و پشتیبانی ۲۴/۷"
  );
  const [status, setStatus] = React.useState<ContentStatus>(
    (initialProject?.status as ContentStatus) || "DRAFT"
  );
  const [isFeatured, setIsFeatured] = React.useState<boolean>(initialProject?.isFeatured || false);

  // Content
  const [summary, setSummary] = React.useState(initialProject?.summary || "");
  const [description, setDescription] = React.useState(initialProject?.description || "");

  // Tags
  const [tags, setTags] = React.useState<string[]>(initialProject?.tags || []);
  const [tagInput, setTagInput] = React.useState<string>("");

  // Sub-entities
  const [features, setFeatures] = React.useState<PortfolioFeatureItem[]>(
    initialProject?.features || []
  );
  const [challenges, setChallenges] = React.useState<PortfolioChallengeItem[]>(
    initialProject?.challenges || []
  );
  const [technologies, setTechnologies] = React.useState<PortfolioTechnologyItem[]>(
    initialProject?.technologies || []
  );
  const [achievements, setAchievements] = React.useState<PortfolioAchievementItem[]>(
    initialProject?.achievements || []
  );

  // Media
  const [featuredImage, setFeaturedImage] = React.useState(
    initialProject?.featuredImage || initialProject?.imageUrl || ""
  );
  const [featuredImageAlt, setFeaturedImageAlt] = React.useState(
    initialProject?.featuredImageAlt || ""
  );
  const [gallery, setGallery] = React.useState<PortfolioMediaItem[]>(
    (initialProject?.gallery || []).filter((g: any) => g && (typeof g === "string" || (typeof g === "object" && !Array.isArray(g) && g.url)))
  );
  const [videos, setVideos] = React.useState<PortfolioMediaItem[]>(
    (initialProject?.videos || []).filter((v: any) => v && (typeof v === "string" || (typeof v === "object" && !Array.isArray(v) && v.url)))
  );
  const [isUploadingMedia, setIsUploadingMedia] = React.useState<boolean>(false);

  // SEO Fields
  const [metaTitle, setMetaTitle] = React.useState(initialProject?.metaTitle || "");
  const [metaDescription, setMetaDescription] = React.useState(initialProject?.metaDescription || "");
  const [focusKeyword, setFocusKeyword] = React.useState(initialProject?.focusKeyword || "");
  const [seoKeywords, setSeoKeywords] = React.useState(initialProject?.seoKeywords || "");
  const [canonicalUrl, setCanonicalUrl] = React.useState(initialProject?.canonicalUrl || "");
  const [ogTitle, setOgTitle] = React.useState(initialProject?.ogTitle || "");
  const [ogDescription, setOgDescription] = React.useState(initialProject?.ogDescription || "");
  const [ogImage, setOgImage] = React.useState(initialProject?.ogImage || "");
  const [isIndexable, setIsIndexable] = React.useState<boolean>(initialProject?.isIndexable !== false);
  const [isFollowable, setIsFollowable] = React.useState<boolean>(initialProject?.isFollowable !== false);

  // Toast
  const [toastMessage, setToastMessage] = React.useState<{
    text: string;
    variant: "success" | "warning";
  } | null>(null);
  const showToast = (text: string, variant: "success" | "warning" = "success") => {
    setToastMessage({ text, variant });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Load categories
  React.useEffect(() => {
    portfolioApi
      .getCategories()
      .then((res: any) => {
        if (Array.isArray(res)) {
          setCategories(res);
          if (!categoryId && res.length > 0) {
            setCategoryId(res[0].id);
          }
        }
      })
      .catch((err) => console.error("Failed to load categories:", err));
  }, []);

  // Fetch project if editing via direct ID
  React.useEffect(() => {
    if (projectId && !initialProject) {
      setIsLoadingProject(true);
      portfolioApi
        .getPortfolioBySlug(projectId)
        .then((p) => {
          if (p) {
            setTitle(p.title);
            setSlug(p.slug);
            setIsSlugManual(true);
            setClient(p.client || "");
            setLocation(p.location || "");
            setYear(p.year || "۱۴۰۲");
            setCategoryId(p.categoryId || "");
            setProjectStatusLabel(p.projectStatusLabel || "تحویل نهایی");
            setStatus((p.status as ContentStatus) || "DRAFT");
            setIsFeatured(Boolean(p.isFeatured));
            setSummary(p.summary || "");
            setDescription(p.description || "");
            setTags(p.tags || []);
            setFeatures(p.features || []);
            setChallenges(p.challenges || []);
            setTechnologies(p.technologies || []);
            setAchievements(p.achievements || []);
            setFeaturedImage(p.featuredImage || p.imageUrl || "");
            setFeaturedImageAlt(p.featuredImageAlt || "");
            const cleanG = (p.gallery || []).filter((g: any) => g && (typeof g === "string" || (typeof g === "object" && !Array.isArray(g) && g.url)));
            const cleanV = (p.videos || []).filter((v: any) => v && (typeof v === "string" || (typeof v === "object" && !Array.isArray(v) && v.url)));
            setGallery(cleanG);
            setVideos(cleanV);
            setMetaTitle(p.metaTitle || "");
            setMetaDescription(p.metaDescription || "");
            setFocusKeyword(p.focusKeyword || "");
            setSeoKeywords(p.seoKeywords || "");
            setCanonicalUrl(p.canonicalUrl || "");
            setOgTitle(p.ogTitle || "");
            setOgDescription(p.ogDescription || "");
            setOgImage(p.ogImage || "");
            setIsIndexable(p.isIndexable !== false);
            setIsFollowable(p.isFollowable !== false);
          }
        })
        .catch((err) => {
          console.error("Failed to fetch project:", err);
          showToast("خطا در دریافت مشخصات پروژه", "warning");
        })
        .finally(() => setIsLoadingProject(false));
    }
  }, [projectId, initialProject]);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isSlugManual) {
      const generated = val
        .trim()
        .toLowerCase()
        .replace(/[\s\-_]+/g, "-")
        .replace(/[^\u0600-\u06FFa-zA-Z0-9\-]/g, "");
      setSlug(generated);
    }
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Sub-entities handlers
  // 1. Features
  const addFeature = () => {
    setFeatures([...features, { value: "", title: "", description: "", sortOrder: features.length }]);
  };
  const updateFeature = (index: number, field: keyof PortfolioFeatureItem, val: string) => {
    const updated = [...features];
    updated[index] = { ...updated[index], [field]: val };
    setFeatures(updated);
  };
  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };
  const moveFeature = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= features.length) return;
    const updated = [...features];
    const item = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = item;
    setFeatures(updated.map((f, i) => ({ ...f, sortOrder: i })));
  };

  // 2. Challenges
  const addChallenge = () => {
    setChallenges([
      ...challenges,
      { title: "", description: "", solution: "", result: "", sortOrder: challenges.length },
    ]);
  };
  const updateChallenge = (index: number, field: keyof PortfolioChallengeItem, val: string) => {
    const updated = [...challenges];
    updated[index] = { ...updated[index], [field]: val };
    setChallenges(updated);
  };
  const removeChallenge = (index: number) => {
    setChallenges(challenges.filter((_, i) => i !== index));
  };
  const moveChallenge = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= challenges.length) return;
    const updated = [...challenges];
    const item = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = item;
    setChallenges(updated.map((c, i) => ({ ...c, sortOrder: i })));
  };

  // 3. Technologies
  const addTechnology = () => {
    setTechnologies([
      ...technologies,
      { name: "", description: "", iconUrl: "", sortOrder: technologies.length },
    ]);
  };
  const updateTechnology = (index: number, field: keyof PortfolioTechnologyItem, val: string) => {
    const updated = [...technologies];
    updated[index] = { ...updated[index], [field]: val };
    setTechnologies(updated);
  };
  const removeTechnology = (index: number) => {
    setTechnologies(technologies.filter((_, i) => i !== index));
  };
  const moveTechnology = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= technologies.length) return;
    const updated = [...technologies];
    const item = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = item;
    setTechnologies(updated.map((t, i) => ({ ...t, sortOrder: i })));
  };
  const handleTechIconUpload = async (index: number, file: File) => {
    setIsUploadingMedia(true);
    try {
      const res = await portfolioApi.uploadImage(file);
      updateTechnology(index, "iconUrl", res.url);
      showToast("آیکون تجهیز بدون واترمارک ذخیره شد", "success");
    } catch (err) {
      console.error(err);
      showToast("خطا در آپلود آیکون تجهیز", "warning");
    } finally {
      setIsUploadingMedia(false);
    }
  };

  // 4. Achievements
  const addAchievement = () => {
    setAchievements([
      ...achievements,
      { title: "", description: "", metric: "", sortOrder: achievements.length },
    ]);
  };
  const updateAchievement = (index: number, field: keyof PortfolioAchievementItem, val: string) => {
    const updated = [...achievements];
    updated[index] = { ...updated[index], [field]: val };
    setAchievements(updated);
  };
  const removeAchievement = (index: number) => {
    setAchievements(achievements.filter((_, i) => i !== index));
  };
  const moveAchievement = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= achievements.length) return;
    const updated = [...achievements];
    const item = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = item;
    setAchievements(updated.map((a, i) => ({ ...a, sortOrder: i })));
  };

  // 5. Media & Gallery
  const moveGalleryItem = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= gallery.length) return;
    const updated = [...gallery];
    const item = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = item;
    setGallery(updated);
  };

  const updateGalleryItem = (index: number, field: keyof PortfolioMediaItem, val: string) => {
    const updated = [...gallery];
    updated[index] = { ...updated[index], [field]: val };
    setGallery(updated);
  };

  const moveVideo = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= videos.length) return;
    const updated = [...videos];
    const item = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = item;
    setVideos(updated);
  };

  const updateVideoItem = (index: number, field: keyof PortfolioMediaItem, val: string) => {
    const updated = [...videos];
    updated[index] = { ...updated[index], [field]: val };
    setVideos(updated);
  };

  // Media Uploads
  const handleFeaturedImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingMedia(true);
    try {
      const res = await portfolioApi.uploadImage(file);
      setFeaturedImage(res.url);
      if (!ogImage) setOgImage(res.url);
      showToast("تصویر شاخص پروژه بدون واترمارک با کیفیت بالا ذخیره شد", "success");
    } catch (err) {
      console.error("Upload error:", err);
      showToast("خطا در آپلود تصویر شاخص", "warning");
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploadingMedia(true);
    try {
      const fileArr = Array.from(files);
      const res = await portfolioApi.uploadImages(fileArr);
      const newItems: PortfolioMediaItem[] = res.images.map((img) => ({
        type: "image",
        url: img.url,
        title: img.originalName,
      }));
      setGallery((prev) => [...prev, ...newItems]);
      showToast(`${res.images.length} تصویر باکیفیت بدون واترمارک به گالری پروژه اضافه شد`, "success");
    } catch (err) {
      console.error("Gallery upload error:", err);
      showToast("خطا در آپلود گالری", "warning");
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingMedia(true);
    try {
      const res = await portfolioApi.uploadVideo(file);
      const newVideo: PortfolioMediaItem = {
        type: "video",
        url: res.url,
        title: res.originalName,
      };
      setVideos((prev) => [...prev, newVideo]);
      showToast("ویدیو با موفقیت بارگذاری شد", "success");
    } catch (err) {
      console.error("Video upload error:", err);
      showToast("خطا در آپلود ویدیو", "warning");
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      showToast("عنوان پروژه الزامی است", "warning");
      setActiveTab("general");
      return;
    }

    if (!client.trim()) {
      showToast("نام کارفرما الزامی است", "warning");
      setActiveTab("general");
      return;
    }

    if (!summary.trim()) {
      showToast("خلاصه پروژه الزامی است", "warning");
      setActiveTab("general");
      return;
    }

    setIsSubmitting(true);

    const formData: PortfolioFormData = {
      title: title.trim(),
      slug: slug.trim() || undefined,
      client: client.trim(),
      location: location.trim() || undefined,
      projectDate: year.trim() || undefined,
      summary: summary.trim(),
      description: description.trim() || summary.trim(),
      featuredImage: featuredImage || undefined,
      featuredImageAlt: featuredImageAlt || undefined,
      gallery,
      videos,
      categoryId: categoryId || undefined,
      status,
      isFeatured,
      projectStatusLabel: projectStatusLabel.trim() || undefined,
      tags,
      features: features.filter((f) => f.title.trim() || f.value.trim()),
      challenges: challenges.filter((c) => c.title.trim()),
      technologies: technologies.filter((t) => t.name.trim()),
      achievements: achievements.filter((a) => a.title.trim()),
      metaTitle: metaTitle.trim() || undefined,
      metaDescription: metaDescription.trim() || undefined,
      focusKeyword: focusKeyword.trim() || undefined,
      seoKeywords: seoKeywords.trim() || undefined,
      canonicalUrl: canonicalUrl.trim() || undefined,
      ogTitle: ogTitle.trim() || undefined,
      ogDescription: ogDescription.trim() || undefined,
      ogImage: ogImage.trim() || undefined,
      isIndexable,
      isFollowable,
    };

    try {
      if (isEditMode && (projectId || initialProject?.id)) {
        const id = projectId || initialProject!.id;
        await portfolioApi.updatePortfolio(id, formData);
        showToast("اطلاعات پروژه با موفقیت بروزرسانی شد", "success");
      } else {
        await portfolioApi.createPortfolio(formData);
        showToast("پروژه جدید با موفقیت ثبت گردید", "success");
      }
      setTimeout(() => {
        router.push("/admin/portfolio");
      }, 1000);
    } catch (err: any) {
      console.error("Save project error:", err);
      showToast(err?.message || "خطا در ذخیره پروژه در سرور", "warning");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingProject) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        <span className="text-sm text-neutral-400">در حال دریافت اطلاعات پروژه از سرور...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div
          className={cn(
            "fixed bottom-6 left-6 z-50 px-4 py-3 rounded-xl border shadow-xl flex items-center gap-3 animate-in slide-in-from-bottom duration-300",
            toastMessage.variant === "success" && "bg-neutral-900 border-emerald-500/50 text-emerald-300",
            toastMessage.variant === "warning" && "bg-neutral-900 border-amber-500/50 text-amber-300"
          )}
        >
          {toastMessage.variant === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          {toastMessage.variant === "warning" && <AlertTriangle className="w-5 h-5 text-amber-400" />}
          <span className="text-sm font-medium">{toastMessage.text}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-neutral-950/40 p-5 rounded-2xl border border-neutral-800/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/portfolio"
            className="p-2 rounded-xl bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-white">
              {isEditMode ? "ویرایش پروژه مهندسی" : "ثبت پروژه و نمونه‌کار جدید"}
            </h1>
            <p className="text-xs text-neutral-400">
              ثبت مشخصات، شاخص‌های فنی، چالش‌ها و راهکارها، تجهیزات سخت‌افزاری و تصاویر پروژه
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {slug && (
            <a
              href={`/portfolio/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl text-xs font-medium border border-neutral-800 bg-neutral-900 text-neutral-300 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <Eye className="w-4 h-4" />
              پیش‌نمایش در سایت
            </a>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 sm:flex-initial bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-neutral-950 font-bold shadow-lg shadow-amber-500/10"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                در حال ذخیره‌سازی...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 ml-2" />
                {isEditMode ? "بروزرسانی پروژه" : "ثبت و انتشار پروژه"}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-neutral-800 pb-3">
        {[
          { id: "general", label: "اطلاعات پروژه و شرح", icon: Briefcase },
          { id: "features", label: `شاخص‌های فنی (${features.length})`, icon: Zap },
          { id: "challenges", label: `چالش‌ها و راهکارها (${challenges.length})`, icon: Layers },
          { id: "technologies", label: `تجهیزات و فناوری‌ها (${technologies.length})`, icon: Cpu },
          { id: "achievements", label: `دستاوردهای کلیدی (${achievements.length})`, icon: Award },
          { id: "media", label: "رسانه و مستندات (بدون واترمارک)", icon: ImageIcon },
          { id: "seo", label: "تنظیمات پیشرفته سئو (SEO)", icon: Globe },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all",
                isActive
                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-sm"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-900"
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: General Info */}
      {activeTab === "general" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5 bg-neutral-950/40 p-6 rounded-2xl border border-neutral-800/80">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-amber-500" />
              مشخصات اجرایی و کارفرما
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  عنوان کامل پروژه <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="مثال: پیاده‌سازی ستون فقرات دیتاسنتر پتروشیمی زاگرس با سوئیچینگ 100G"
                  className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500/50"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-neutral-300">
                    اسلاگ یکتای URL (Slug)
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsSlugManual(!isSlugManual)}
                    className="text-[11px] text-amber-400 hover:underline"
                  >
                    {isSlugManual ? "تولید خودکار از عنوان" : "تنظیم دستی اسلاگ"}
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 font-mono text-xs" dir="ltr">
                    /portfolio/
                  </span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => {
                      setIsSlugManual(true);
                      setSlug(e.target.value);
                    }}
                    placeholder="zagros-petrochemical-datacenter"
                    dir="ltr"
                    className="w-full pl-24 pr-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-sm text-amber-400 font-mono focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    کارفرما / سازمان <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={client}
                    onChange={(e) => setClient(e.target.value)}
                    placeholder="مثال: پتروشیمی زاگرس"
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500/50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    موقعیت جغرافیایی
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="مثال: عسلویه، منطقه ویژه پارس"
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    سال اجرا
                  </label>
                  <input
                    type="text"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    placeholder="۱۴۰۲"
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    دسته‌بندی پروژه
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500/50"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    برچسب وضعیت مهندسی
                  </label>
                  <input
                    type="text"
                    value={projectStatusLabel}
                    onChange={(e) => setProjectStatusLabel(e.target.value)}
                    placeholder="مثال: تحویل نهایی و پشتیبانی ۲۴/۷"
                    className="w-full px-3 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  خلاصه پروژه (Summary) <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={2}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="خلاصه‌ای یک یا دو پاراگرافی از اهداف و دستاوردهای پروژه برای کارت‌های صفحه اصلی..."
                  className="w-full p-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs leading-relaxed text-white focus:outline-none focus:border-amber-500/50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  شرح کامل جزئیات اجرایی (Description)
                </label>
                <textarea
                  rows={6}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="توضیحات تکمیلی پیرامون توپولوژی، تجهیزات، سناریوهای افزونگی و فرآیند استقرار..."
                  className="w-full p-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs leading-relaxed text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  برچسب‌های پروژه (Tags)
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="افزودن برچسب (مثلاً: دیتاسنتر، فیبر نوری، سیسکو)"
                    className="flex-1 px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500/50"
                  />
                  <Button
                    type="button"
                    onClick={handleAddTag}
                    size="sm"
                    className="bg-neutral-800 hover:bg-neutral-700 text-white"
                  >
                    <Plus className="w-4 h-4 ml-1" />
                    افزودن
                  </Button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-neutral-300"
                    >
                      <Tag className="w-3 h-3 text-amber-500" />
                      {t}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(t)}
                        className="text-neutral-500 hover:text-red-400 mr-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <div className="bg-neutral-950/40 p-5 rounded-2xl border border-neutral-800/80 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                وضعیت انتشار
              </h3>

              <div className="space-y-2">
                {[
                  { value: "PUBLISHED", label: "منتشر شده در سایت", color: "text-emerald-400" },
                  { value: "DRAFT", label: "پیش‌نویس (فقط مدیریت)", color: "text-amber-400" },
                  { value: "ARCHIVED", label: "آرشیوشده", color: "text-neutral-400" },
                ].map((s) => (
                  <label
                    key={s.value}
                    className={cn(
                      "flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-colors text-xs",
                      status === s.value
                        ? "bg-neutral-900 border-amber-500/40 text-white font-medium"
                        : "border-neutral-900 text-neutral-400 hover:bg-neutral-900/40"
                    )}
                  >
                    <input
                      type="radio"
                      name="projectStatus"
                      value={s.value}
                      checked={status === s.value}
                      onChange={() => setStatus(s.value as ContentStatus)}
                      className="accent-amber-500"
                    />
                    <span className={s.color}>{s.label}</span>
                  </label>
                ))}
              </div>

              <div className="pt-3 border-t border-neutral-800">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-300">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded accent-amber-500 w-4 h-4"
                  />
                  <span>نمایش در بخش پروژه‌های ویژه صفحه اصلی</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Features & Metrics */}
      {activeTab === "features" && (
        <div className="space-y-4 bg-neutral-950/40 p-6 rounded-2xl border border-neutral-800/80">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                شاخص‌ها و ویژگی‌های کلیدی پروژه (Key Metrics & Features)
              </h3>
              <p className="text-xs text-neutral-400">
                شاخص‌های عددی، ظرفیت‌ها و معیارهای چشمگیر پروژه که در کارت‌های برجسته نمایش داده می‌شوند.
              </p>
            </div>
            <Button
              type="button"
              onClick={addFeature}
              size="sm"
              className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold"
            >
              <Plus className="w-4 h-4 ml-1" />
              افزودن شاخص جدید
            </Button>
          </div>

          {features.length === 0 ? (
            <div className="text-center py-8 text-neutral-500 border border-dashed border-neutral-800 rounded-xl">
              هنوز هیچ شاخصی تعریف نشده است. بر روی «افزودن شاخص جدید» کلیک کنید.
            </div>
          ) : (
            <div className="space-y-3">
              {features.map((feat, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/60 grid grid-cols-1 md:grid-cols-12 gap-3 items-center"
                >
                  <div className="md:col-span-3">
                    <label className="block text-[10px] text-neutral-400 mb-1">مقدار یا عدد شاخص</label>
                    <input
                      type="text"
                      value={feat.value}
                      onChange={(e) => updateFeature(idx, "value", e.target.value)}
                      placeholder="مثال: 100G یا 4,800+"
                      className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-amber-400 font-bold"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-[10px] text-neutral-400 mb-1">عنوان شاخص</label>
                    <input
                      type="text"
                      value={feat.title}
                      onChange={(e) => updateFeature(idx, "title", e.target.value)}
                      placeholder="مثال: ستون فقرات شبکه"
                      className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white"
                    />
                  </div>

                  <div className="md:col-span-5">
                    <label className="block text-[10px] text-neutral-400 mb-1">توضیح مختصر</label>
                    <input
                      type="text"
                      value={feat.description}
                      onChange={(e) => updateFeature(idx, "description", e.target.value)}
                      placeholder="مثال: اتصال مستقیم Core به Access بدون افت سرعت"
                      className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-neutral-300"
                    />
                  </div>

                  <div className="md:col-span-1 flex items-center justify-end gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveFeature(idx, "up")}
                      className="p-1 rounded text-neutral-400 hover:text-white disabled:opacity-25 disabled:hover:text-neutral-400"
                      title="انتقال به بالا"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === features.length - 1}
                      onClick={() => moveFeature(idx, "down")}
                      className="p-1 rounded text-neutral-400 hover:text-white disabled:opacity-25 disabled:hover:text-neutral-400"
                      title="انتقال به پایین"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeFeature(idx)}
                      className="p-1 rounded text-neutral-400 hover:text-red-400 hover:bg-red-500/10"
                      title="حذف شاخص"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Challenges & Solutions */}
      {activeTab === "challenges" && (
        <div className="space-y-4 bg-neutral-950/40 p-6 rounded-2xl border border-neutral-800/80">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-500" />
                چالش‌ها و راهکارهای مهندسی ققنوس (Challenges & Engineering Solutions)
              </h3>
              <p className="text-xs text-neutral-400">
                بررسی چالش‌های فنی پیچیده پروژه و نحوه حل مهندسی آن‌ها توسط متخصصین ققنوس.
              </p>
            </div>
            <Button
              type="button"
              onClick={addChallenge}
              size="sm"
              className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold"
            >
              <Plus className="w-4 h-4 ml-1" />
              افزودن چالش و راهکار
            </Button>
          </div>

          {challenges.length === 0 ? (
            <div className="text-center py-8 text-neutral-500 border border-dashed border-neutral-800 rounded-xl">
              هیچ چالش فنی ثبت نشده است.
            </div>
          ) : (
            <div className="space-y-4">
              {challenges.map((ch, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/60 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400">
                      چالش شماره {toPersianDigits(idx + 1)}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => moveChallenge(idx, "up")}
                        className="p-1 rounded text-neutral-400 hover:text-white disabled:opacity-25 disabled:hover:text-neutral-400"
                        title="انتقال به بالا"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === challenges.length - 1}
                        onClick={() => moveChallenge(idx, "down")}
                        className="p-1 rounded text-neutral-400 hover:text-white disabled:opacity-25 disabled:hover:text-neutral-400"
                        title="انتقال به پایین"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeChallenge(idx)}
                        className="p-1 rounded text-neutral-500 hover:text-red-400"
                        title="حذف چالش"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] text-neutral-300 mb-1 font-semibold">
                        عنوان چالش فنی
                      </label>
                      <input
                        type="text"
                        value={ch.title}
                        onChange={(e) => updateChallenge(idx, "title", e.target.value)}
                        placeholder="مثال: الزام آپ‌تایم ۱۰۰٪ در محیط داغ صنعتی عسلویه"
                        className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-neutral-300 mb-1 font-semibold">
                        نتیجه پیاده‌سازی (Result)
                      </label>
                      <input
                        type="text"
                        value={ch.result}
                        onChange={(e) => updateChallenge(idx, "result", e.target.value)}
                        placeholder="مثال: صفر شدن قطعی و کارکرد پایدار در دمای ۵۵ درجه"
                        className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-emerald-400 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">
                      شرح و ماهیت چالش کارفرما
                    </label>
                    <textarea
                      rows={2}
                      value={ch.description}
                      onChange={(e) => updateChallenge(idx, "description", e.target.value)}
                      placeholder="توضیح شرایط دشوار پروژه، ریسک‌ها و محدودیت‌ها..."
                      className="w-full p-2.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-amber-400/90 mb-1 font-semibold">
                      راهکار مهندسی ارائه شده توسط ققنوس
                    </label>
                    <textarea
                      rows={2}
                      value={ch.solution}
                      onChange={(e) => updateChallenge(idx, "solution", e.target.value)}
                      placeholder="طراحی معماری خاص، تجهیزات صنعتی مقاوم یا مکانیزم‌های افزونگی..."
                      className="w-full p-2.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Technologies & Equipment */}
      {activeTab === "technologies" && (
        <div className="space-y-4 bg-neutral-950/40 p-6 rounded-2xl border border-neutral-800/80">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-sky-400" />
                تجهیزات و فناوری‌های به کار رفته (Technologies & Equipment)
              </h3>
              <p className="text-xs text-neutral-400">
                سوییچ‌ها، کابل‌ها، پچ‌پنل‌ها و استانداردهای سخت‌افزاری پیاده‌سازی شده در پروژه.
              </p>
            </div>
            <Button
              type="button"
              onClick={addTechnology}
              size="sm"
              className="bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 font-bold"
            >
              <Plus className="w-4 h-4 ml-1" />
              افزودن تجهیز / فناوری
            </Button>
          </div>

          {technologies.length === 0 ? (
            <div className="text-center py-8 text-neutral-500 border border-dashed border-neutral-800 rounded-xl">
              تجهیزی ثبت نشده است.
            </div>
          ) : (
            <div className="space-y-3">
              {technologies.map((tech, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/60 grid grid-cols-1 md:grid-cols-12 gap-3 items-center"
                >
                  <div className="md:col-span-4">
                    <label className="block text-[10px] text-neutral-400 mb-1">نام تجهیز / تکنولوژی</label>
                    <input
                      type="text"
                      value={tech.name}
                      onChange={(e) => updateTechnology(idx, "name", e.target.value)}
                      placeholder="مثال: Cisco Catalyst 9606R"
                      className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white font-medium"
                    />
                  </div>

                  <div className="md:col-span-5">
                    <label className="block text-[10px] text-neutral-400 mb-1">شرح کاربرد در پروژه</label>
                    <input
                      type="text"
                      value={tech.description || ""}
                      onChange={(e) => updateTechnology(idx, "description", e.target.value)}
                      placeholder="مثال: سوییچ Core مرکزی با توان 25.6Tbps"
                      className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-neutral-300"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[10px] text-neutral-400 mb-1">آیکون / تصویر</label>
                    <label className="cursor-pointer block text-center px-2 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-[11px] truncate">
                      {tech.iconUrl ? "تصویر بارگذاری شد" : "انتخاب فایل"}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleTechIconUpload(idx, f);
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="md:col-span-1 flex items-center justify-end gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveTechnology(idx, "up")}
                      className="p-1 rounded text-neutral-400 hover:text-white disabled:opacity-25 disabled:hover:text-neutral-400"
                      title="انتقال به بالا"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === technologies.length - 1}
                      onClick={() => moveTechnology(idx, "down")}
                      className="p-1 rounded text-neutral-400 hover:text-white disabled:opacity-25 disabled:hover:text-neutral-400"
                      title="انتقال به پایین"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeTechnology(idx)}
                      className="p-1 rounded text-neutral-400 hover:text-red-400"
                      title="حذف تجهیز"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: Achievements */}
      {activeTab === "achievements" && (
        <div className="space-y-4 bg-neutral-950/40 p-6 rounded-2xl border border-neutral-800/80">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-400" />
                دستاوردهای کلیدی پروژه (Key Achievements)
              </h3>
              <p className="text-xs text-neutral-400">
                افتخارات مهندسی، رضایت کارفرما، گواهینامه‌های اخذ شده و دستاوردهای عددی پروژه.
              </p>
            </div>
            <Button
              type="button"
              onClick={addAchievement}
              size="sm"
              className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold"
            >
              <Plus className="w-4 h-4 ml-1" />
              افزودن دستاورد
            </Button>
          </div>

          {achievements.length === 0 ? (
            <div className="text-center py-8 text-neutral-500 border border-dashed border-neutral-800 rounded-xl">
              دستاوری ثبت نشده است.
            </div>
          ) : (
            <div className="space-y-3">
              {achievements.map((ach, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/60 grid grid-cols-1 md:grid-cols-12 gap-3 items-center"
                >
                  <div className="md:col-span-3">
                    <label className="block text-[10px] text-neutral-400 mb-1">عنوان دستاورد</label>
                    <input
                      type="text"
                      value={ach.title}
                      onChange={(e) => updateAchievement(idx, "title", e.target.value)}
                      placeholder="مثال: پایداری بدون قطعی"
                      className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white font-medium"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[10px] text-neutral-400 mb-1">متریک عددی</label>
                    <input
                      type="text"
                      value={ach.metric || ""}
                      onChange={(e) => updateAchievement(idx, "metric", e.target.value)}
                      placeholder="Zero Downtime"
                      className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-emerald-400 font-bold"
                    />
                  </div>

                  <div className="md:col-span-6">
                    <label className="block text-[10px] text-neutral-400 mb-1">شرح دستاورد</label>
                    <input
                      type="text"
                      value={ach.description}
                      onChange={(e) => updateAchievement(idx, "description", e.target.value)}
                      placeholder="توضیح تاثیر این دستاورد بر سازمان..."
                      className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-neutral-300"
                    />
                  </div>

                  <div className="md:col-span-1 flex items-center justify-end gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveAchievement(idx, "up")}
                      className="p-1 rounded text-neutral-400 hover:text-white disabled:opacity-25 disabled:hover:text-neutral-400"
                      title="انتقال به بالا"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === achievements.length - 1}
                      onClick={() => moveAchievement(idx, "down")}
                      className="p-1 rounded text-neutral-400 hover:text-white disabled:opacity-25 disabled:hover:text-neutral-400"
                      title="انتقال به پایین"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeAchievement(idx)}
                      className="p-1 rounded text-neutral-400 hover:text-red-400"
                      title="حذف دستاورد"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 6: Media & Gallery */}
      {activeTab === "media" && (
        <div className="space-y-6">
          {/* Watermark Policy Callout */}
          <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 text-emerald-300 text-xs flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <div>
              <span className="font-bold">قانون اکید عدم درج واترمارک: </span>
              کلیه تصاویر، عکس‌های رک و تجهیزات پروژه و ویدیوها بدون هیچ‌گونه واترمارک ذخیره می‌شوند و اصالت بصری نمونه‌کارها حفظ خواهد گردید.
            </div>
          </div>

          {/* Featured Image */}
          <div className="bg-neutral-950/40 p-6 rounded-2xl border border-neutral-800/80 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-amber-500" />
              تصویر کاور و شاخص پروژه (Featured Cover)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-neutral-300 mb-1.5">آدرس مستقیم تصویر</label>
                  <input
                    type="text"
                    value={featuredImage}
                    onChange={(e) => setFeaturedImage(e.target.value)}
                    placeholder="/uploads/portfolio/project-cover.webp"
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs text-neutral-300 mb-1.5">متن جایگزین سئو (Alt Text)</label>
                  <input
                    type="text"
                    value={featuredImageAlt}
                    onChange={(e) => setFeaturedImageAlt(e.target.value)}
                    placeholder="نمای کلی رک‌های دیتاسنتر پروژه"
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs text-neutral-300 mb-1.5">آپلود مستقیم از سیستم (WebP بهینه)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFeaturedImageUpload}
                    disabled={isUploadingMedia}
                    className="text-xs text-neutral-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-500/10 file:text-amber-400 hover:file:bg-amber-500/20 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex flex-col items-center justify-center border border-dashed border-neutral-800 rounded-2xl p-4 bg-neutral-900/50 min-h-[160px]">
                {featuredImage ? (
                  <img
                    src={featuredImage}
                    alt={featuredImageAlt || "پیش‌نمایش"}
                    className="max-h-48 rounded-xl object-contain"
                  />
                ) : (
                  <div className="text-center text-neutral-500 space-y-1">
                    <ImageIcon className="w-8 h-8 mx-auto text-neutral-600" />
                    <span className="text-xs">هیچ تصویری انتخاب نشده است</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Gallery */}
          <div className="bg-neutral-950/40 p-6 rounded-2xl border border-neutral-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-purple-400" />
                گالری تصاویر اجرایی پروژه ({gallery.length} تصویر)
              </h3>
              <label className="cursor-pointer text-xs px-3 py-1.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5" />
                آپلود چندگانه تصاویر
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleGalleryUpload}
                  disabled={isUploadingMedia}
                  className="hidden"
                />
              </label>
            </div>

            {gallery.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {gallery.map((img, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-neutral-800 bg-neutral-900/70 flex flex-col gap-2.5"
                  >
                    <div className="relative rounded-lg overflow-hidden border border-neutral-800 aspect-video bg-black/40">
                      <img src={img.url} alt={img.title || "عکس پروژه"} className="w-full h-full object-cover" />
                      {featuredImage === img.url && (
                        <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-amber-500/90 text-black text-[10px] font-bold">
                          تصویر کاور
                        </span>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <input
                        type="text"
                        value={img.title || ""}
                        onChange={(e) => updateGalleryItem(idx, "title", e.target.value)}
                        placeholder="عنوان / متن جایگزین (Alt)"
                        className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white placeholder:text-neutral-500"
                      />
                      <input
                        type="text"
                        value={img.caption || ""}
                        onChange={(e) => updateGalleryItem(idx, "caption", e.target.value)}
                        placeholder="توضیح زیرنویس تصویر (اختیاری)"
                        className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-[11px] text-neutral-300 placeholder:text-neutral-500"
                      />
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-neutral-800/60">
                      <button
                        type="button"
                        onClick={() => {
                          setFeaturedImage(img.url);
                          if (!featuredImageAlt && img.title) setFeaturedImageAlt(img.title);
                          showToast("این تصویر به عنوان کاور شاخص پروژه انتخاب شد", "success");
                        }}
                        className={cn(
                          "text-[11px] font-medium transition-colors",
                          featuredImage === img.url
                            ? "text-amber-400 font-bold"
                            : "text-neutral-400 hover:text-amber-300"
                        )}
                      >
                        {featuredImage === img.url ? "★ کاور شاخص انتخاب شده" : "☆ انتخاب به عنوان کاور"}
                      </button>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveGalleryItem(idx, "up")}
                          className="p-1 rounded text-neutral-400 hover:text-white disabled:opacity-25"
                          title="انتقال به قبل"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === gallery.length - 1}
                          onClick={() => moveGalleryItem(idx, "down")}
                          className="p-1 rounded text-neutral-400 hover:text-white disabled:opacity-25"
                          title="انتقال به بعد"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setGallery(gallery.filter((_, i) => i !== idx))}
                          className="p-1 rounded text-neutral-400 hover:text-red-400"
                          title="حذف تصویر"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-neutral-500 text-center py-4">
                عکس‌های آرایش رک، سوئیچ‌ها و کابل‌کشی فیبر را در صورت نیاز اینجا بیفزایید.
              </p>
            )}
          </div>

          {/* Video */}
          <div className="bg-neutral-950/40 p-6 rounded-2xl border border-neutral-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Video className="w-4 h-4 text-sky-400" />
                ویدیوهای مستندات پروژه ({videos.length} ویدیو)
              </h3>
              <label className="cursor-pointer text-xs px-3 py-1.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 hover:bg-sky-500/20 flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5" />
                آپلود فایل ویدیویی
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  disabled={isUploadingMedia}
                  className="hidden"
                />
              </label>
            </div>

            {videos.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {videos.map((vid, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl border border-neutral-800 bg-neutral-900/80 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-neutral-400 truncate max-w-[200px]">{vid.url}</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveVideo(idx, "up")}
                          className="p-1 rounded text-neutral-400 hover:text-white disabled:opacity-25"
                          title="انتقال به بالا"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === videos.length - 1}
                          onClick={() => moveVideo(idx, "down")}
                          className="p-1 rounded text-neutral-400 hover:text-white disabled:opacity-25"
                          title="انتقال به پایین"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setVideos(videos.filter((_, i) => i !== idx))}
                          className="p-1 rounded text-neutral-400 hover:text-red-400"
                          title="حذف ویدیو"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <video src={vid.url} controls className="w-full rounded-lg max-h-40 bg-black" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                      <input
                        type="text"
                        value={vid.title || ""}
                        onChange={(e) => updateVideoItem(idx, "title", e.target.value)}
                        placeholder="عنوان ویدیو"
                        className="px-2.5 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white placeholder:text-neutral-500"
                      />
                      <input
                        type="text"
                        value={vid.caption || ""}
                        onChange={(e) => updateVideoItem(idx, "caption", e.target.value)}
                        placeholder="توضیح ویدیو (اختیاری)"
                        className="px-2.5 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-[11px] text-neutral-300 placeholder:text-neutral-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 7: SEO */}
      {activeTab === "seo" && (
        <div className="space-y-6">
          {/* SERP Snippet */}
          <div className="bg-neutral-950/40 p-6 rounded-2xl border border-neutral-800/80 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Globe className="w-4 h-4 text-amber-500" />
              پیش‌نمایش در گوگل (SERP Snippet)
            </h3>

            <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 max-w-2xl space-y-1">
              <div className="text-[11px] text-neutral-400 font-mono truncate" dir="ltr">
                https://velox.ir/portfolio/{slug || "slug-example"}
              </div>
              <div className="text-sm font-semibold text-sky-400 hover:underline cursor-pointer truncate">
                {metaTitle || title || "پروژه مهندسی ققنوس"} | نمونه‌کارها
              </div>
              <div className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                {metaDescription || summary || "شرح خلاصه مشخصات پروژه در صفحه نتایج موتورهای جستجو..."}
              </div>
            </div>
          </div>

          <div className="bg-neutral-950/40 p-6 rounded-2xl border border-neutral-800/80 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  عنوان متا سئو (Meta Title)
                </label>
                <input
                  type="text"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder={title}
                  className="w-full px-3 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  کلمه کلیدی کانونی (Focus Keyword)
                </label>
                <input
                  type="text"
                  value={focusKeyword}
                  onChange={(e) => setFocusKeyword(e.target.value)}
                  placeholder="مثال: دیتاسنتر پتروشیمی"
                  className="w-full px-3 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                توضیحات متا سئو (Meta Description)
              </label>
              <textarea
                rows={3}
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="توضیحات متا برای موتورهای جستجو..."
                className="w-full p-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  کلمات کلیدی ثانویه
                </label>
                <input
                  type="text"
                  value={seoKeywords}
                  onChange={(e) => setSeoKeywords(e.target.value)}
                  placeholder="دیتاسنتر, سوئیچینگ, سیسکو, فیبر نوری"
                  className="w-full px-3 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  آدرس کانونیکال
                </label>
                <input
                  type="text"
                  value={canonicalUrl}
                  onChange={(e) => setCanonicalUrl(e.target.value)}
                  placeholder="https://velox.ir/portfolio/custom-canonical"
                  dir="ltr"
                  className="w-full px-3 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-amber-500/50"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-800 flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-300">
                <input
                  type="checkbox"
                  checked={isIndexable}
                  onChange={(e) => setIsIndexable(e.target.checked)}
                  className="rounded accent-amber-500 w-4 h-4"
                />
                <span>اجازه ایندکس به ربات‌ها (Index)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-300">
                <input
                  type="checkbox"
                  checked={isFollowable}
                  onChange={(e) => setIsFollowable(e.target.checked)}
                  className="rounded accent-amber-500 w-4 h-4"
                />
                <span>دنبال کردن لینک‌ها (Follow)</span>
              </label>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
