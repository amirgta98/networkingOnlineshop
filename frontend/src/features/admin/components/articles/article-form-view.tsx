"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
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
  Clock,
  User,
  Globe,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Trash2,
  FileText,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { articlesApi } from "@/features/articles/api/articles-api";
import type {
  ArticleItem,
  ArticleFormData,
  ContentStatus,
  ArticleCategoryInfo,
  ArticleMediaItem,
} from "@/features/articles/types";
import { RichTextEditor } from "./rich-text-editor";
import { Button } from "@/shared/components/ui/button";
import { cn, toPersianDigits } from "@/shared/lib/utils";

interface ArticleFormViewProps {
  initialArticle?: ArticleItem | null;
  articleId?: string;
  isEditMode?: boolean;
}

export function ArticleFormView({
  initialArticle,
  articleId,
  isEditMode = false,
}: ArticleFormViewProps) {
  const router = useRouter();

  const [activeTab, setActiveTab] = React.useState<"general" | "content" | "media" | "seo">("general");
  const [categories, setCategories] = React.useState<ArticleCategoryInfo[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [isLoadingArticle, setIsLoadingArticle] = React.useState<boolean>(Boolean(articleId && !initialArticle));

  // Form Fields
  const [title, setTitle] = React.useState(initialArticle?.title || "");
  const [slug, setSlug] = React.useState(initialArticle?.slug || "");
  const [isSlugManual, setIsSlugManual] = React.useState(Boolean(initialArticle?.slug));
  const [categoryId, setCategoryId] = React.useState(initialArticle?.categoryId || "");
  const [status, setStatus] = React.useState<ContentStatus>(initialArticle?.status || "DRAFT");
  const [isFeatured, setIsFeatured] = React.useState<boolean>(initialArticle?.isFeatured || false);
  const [readTime, setReadTime] = React.useState(initialArticle?.readTime || "۸ دقیقه");

  // Author
  const [authorName, setAuthorName] = React.useState(initialArticle?.authorName || "مهندس علیرضا سلیمانی");
  const [authorRole, setAuthorRole] = React.useState(initialArticle?.authorRole || "معمار ارشد زیرساخت و امنیت");
  const [authorAvatar, setAuthorAvatar] = React.useState(initialArticle?.authorAvatar || "/images/authors/author-default.webp");

  // Content
  const [excerpt, setExcerpt] = React.useState(initialArticle?.excerpt || "");
  const [content, setContent] = React.useState(initialArticle?.content || "");

  // Tags
  const [tags, setTags] = React.useState<string[]>(initialArticle?.tags || []);
  const [tagInput, setTagInput] = React.useState<string>("");

  // Media
  const [featuredImage, setFeaturedImage] = React.useState(initialArticle?.featuredImage || initialArticle?.imageUrl || "");
  const [featuredImageAlt, setFeaturedImageAlt] = React.useState(initialArticle?.featuredImageAlt || "");
  const [gallery, setGallery] = React.useState<ArticleMediaItem[]>(
    (initialArticle?.gallery || []).filter((g: any) => g && (typeof g === "string" || (typeof g === "object" && !Array.isArray(g) && g.url)))
  );
  const [videos, setVideos] = React.useState<ArticleMediaItem[]>(
    (initialArticle?.videos || []).filter((v: any) => v && (typeof v === "string" || (typeof v === "object" && !Array.isArray(v) && v.url)))
  );
  const [isUploadingMedia, setIsUploadingMedia] = React.useState<boolean>(false);

  // SEO Fields
  const [metaTitle, setMetaTitle] = React.useState(initialArticle?.metaTitle || "");
  const [metaDescription, setMetaDescription] = React.useState(initialArticle?.metaDescription || "");
  const [focusKeyword, setFocusKeyword] = React.useState(initialArticle?.focusKeyword || "");
  const [seoKeywords, setSeoKeywords] = React.useState(initialArticle?.seoKeywords || "");
  const [canonicalUrl, setCanonicalUrl] = React.useState(initialArticle?.canonicalUrl || "");
  const [ogTitle, setOgTitle] = React.useState(initialArticle?.ogTitle || "");
  const [ogDescription, setOgDescription] = React.useState(initialArticle?.ogDescription || "");
  const [ogImage, setOgImage] = React.useState(initialArticle?.ogImage || "");
  const [isIndexable, setIsIndexable] = React.useState<boolean>(initialArticle?.isIndexable !== false);
  const [isFollowable, setIsFollowable] = React.useState<boolean>(initialArticle?.isFollowable !== false);

  // Toast
  const [toastMessage, setToastMessage] = React.useState<{ text: string; variant: "success" | "warning" } | null>(null);
  const showToast = (text: string, variant: "success" | "warning" = "success") => {
    setToastMessage({ text, variant });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Load categories
  React.useEffect(() => {
    articlesApi
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

  // Fetch article if editing via ID directly
  React.useEffect(() => {
    if (articleId && !initialArticle) {
      setIsLoadingArticle(true);
      articlesApi
        .getArticleBySlug(articleId)
        .then((art) => {
          if (art) {
            setTitle(art.title);
            setSlug(art.slug);
            setIsSlugManual(true);
            setCategoryId(art.categoryId || "");
            setStatus(art.status || "DRAFT");
            setIsFeatured(Boolean(art.isFeatured));
            setReadTime(art.readTime || "۸ دقیقه");
            setAuthorName(art.authorName || "");
            setAuthorRole(art.authorRole || "");
            setAuthorAvatar(art.authorAvatar || "");
            setExcerpt(art.excerpt || "");
            setContent(art.content || "");
            setTags(art.tags || []);
            setFeaturedImage(art.featuredImage || art.imageUrl || "");
            setFeaturedImageAlt(art.featuredImageAlt || "");
            const cleanG = (art.gallery || []).filter((g: any) => g && (typeof g === "string" || (typeof g === "object" && !Array.isArray(g) && g.url)));
            const cleanV = (art.videos || []).filter((v: any) => v && (typeof v === "string" || (typeof v === "object" && !Array.isArray(v) && v.url)));
            setGallery(cleanG);
            setVideos(cleanV);
            setMetaTitle(art.metaTitle || "");
            setMetaDescription(art.metaDescription || "");
            setFocusKeyword(art.focusKeyword || "");
            setSeoKeywords(art.seoKeywords || "");
            setCanonicalUrl(art.canonicalUrl || "");
            setOgTitle(art.ogTitle || "");
            setOgDescription(art.ogDescription || "");
            setOgImage(art.ogImage || "");
            setIsIndexable(art.isIndexable !== false);
            setIsFollowable(art.isFollowable !== false);
          }
        })
        .catch((err) => {
          console.error("Failed to fetch article:", err);
          showToast("خطا در دریافت اطلاعات مقاله", "warning");
        })
        .finally(() => setIsLoadingArticle(false));
    }
  }, [articleId, initialArticle]);

  // Auto slug generation if not manual
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

  // Media Uploads
  const handleFeaturedImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingMedia(true);
    try {
      const res = await articlesApi.uploadImage(file);
      setFeaturedImage(res.url);
      if (!ogImage) setOgImage(res.url);
      showToast("تصویر شاخص با موفقیت و بدون هیچ‌گونه واترمارک بهینه‌سازی و آپلود گردید.", "success");
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
      const res = await articlesApi.uploadImages(fileArr);
      const newItems: ArticleMediaItem[] = res.images.map((img) => ({
        type: "image",
        url: img.url,
        title: img.originalName,
      }));
      setGallery((prev) => [...prev, ...newItems]);
      showToast(`${res.images.length} تصویر بدون واترمارک افزوده شد`, "success");
    } catch (err) {
      console.error("Gallery upload error:", err);
      showToast("خطا در آپلود تصاویر گالری", "warning");
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingMedia(true);
    try {
      const res = await articlesApi.uploadVideo(file);
      const newVideo: ArticleMediaItem = {
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

  const moveGalleryItem = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= gallery.length) return;
    const updated = [...gallery];
    const item = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = item;
    setGallery(updated);
  };

  const updateGalleryItem = (index: number, field: keyof ArticleMediaItem, val: string) => {
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

  const updateVideoItem = (index: number, field: keyof ArticleMediaItem, val: string) => {
    const updated = [...videos];
    updated[index] = { ...updated[index], [field]: val };
    setVideos(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      showToast("عنوان مقاله الزامی است", "warning");
      setActiveTab("general");
      return;
    }

    if (!excerpt.trim()) {
      showToast("چکیده یا مقدمه مقاله الزامی است", "warning");
      setActiveTab("content");
      return;
    }

    if (!content.trim()) {
      showToast("متن مقاله الزامی است", "warning");
      setActiveTab("content");
      return;
    }

    setIsSubmitting(true);

    const formData: ArticleFormData = {
      title: title.trim(),
      slug: slug.trim() || undefined,
      excerpt: excerpt.trim(),
      content: content.trim(),
      featuredImage: featuredImage || undefined,
      featuredImageAlt: featuredImageAlt || undefined,
      gallery,
      videos,
      categoryId: categoryId || undefined,
      authorName: authorName.trim() || undefined,
      authorRole: authorRole.trim() || undefined,
      authorAvatar: authorAvatar.trim() || undefined,
      status,
      isFeatured,
      readTime: readTime.trim() || undefined,
      tags,
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
      if (isEditMode && (articleId || initialArticle?.id)) {
        const id = articleId || initialArticle!.id;
        await articlesApi.updateArticle(id, formData);
        showToast("تغییرات مقاله با موفقیت ذخیره گردید", "success");
      } else {
        await articlesApi.createArticle(formData);
        showToast("مقاله جدید با موفقیت ایجاد گردید", "success");
      }
      setTimeout(() => {
        router.push("/admin/articles");
      }, 1000);
    } catch (err: any) {
      console.error("Save article error:", err);
      showToast(err?.message || "خطا در ذخیره‌سازی مقاله در سرور", "warning");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingArticle) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        <span className="text-sm text-neutral-400">در حال دریافت مشخصات مقاله از سرور...</span>
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

      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-neutral-950/40 p-5 rounded-2xl border border-neutral-800/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/articles"
            className="p-2 rounded-xl bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-white">
              {isEditMode ? "ویرایش مقاله تخصصی" : "نگارش مقاله جدید در آکادمی"}
            </h1>
            <p className="text-xs text-neutral-400">
              محتوای باکیفیت مهندسی شبکه با پشتیبانی کامل از ویرایشگر غنی، هایلایت کد، سئو و تصاویر بدون واترمارک
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {slug && (
            <a
              href={`/articles/${slug}`}
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
                {isEditMode ? "بروزرسانی مقاله" : "ثبت و انتشار مقاله"}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-neutral-800 pb-3">
        {[
          { id: "general", label: "اطلاعات پایه و نویسنده", icon: BookOpen },
          { id: "content", label: "محتوا و متن کامل مقاله", icon: Sparkles },
          { id: "media", label: "رسانه و گالری (بدون واترمارک)", icon: ImageIcon },
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
                "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all",
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

      {/* TAB 1: General & Author */}
      {activeTab === "general" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-5 bg-neutral-950/40 p-6 rounded-2xl border border-neutral-800/80">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-500" />
              مشخصات محتوایی مقاله
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  عنوان مقاله <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="مثال: راهنمای انتخاب سوئیچ مدیریتی L2 و L3 در شبکه‌های سازمانی"
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
                    /articles/
                  </span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => {
                      setIsSlugManual(true);
                      setSlug(e.target.value);
                    }}
                    placeholder="l2-vs-l3-switch-guide"
                    dir="ltr"
                    className="w-full pl-24 pr-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-sm text-amber-400 font-mono focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <p className="text-[11px] text-neutral-500 mt-1">
                  آدرس نهایی صفحه در وب‌سایت: velox.ir/articles/{slug || "slug-sample"}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    دسته‌بندی مقاله
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
                    مدت زمان تقریبی مطالعه
                  </label>
                  <input
                    type="text"
                    value={readTime}
                    onChange={(e) => setReadTime(e.target.value)}
                    placeholder="مثال: ۸ دقیقه"
                    className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              {/* Tags Input */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  برچسب‌های تخصصی (Tags)
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
                    placeholder="افزودن برچسب (مثلاً: سیسکو، سوئیچینگ، فیبر نوری)"
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

          {/* Sidebar: Status & Author */}
          <div className="space-y-5">
            {/* Publication Status Card */}
            <div className="bg-neutral-950/40 p-5 rounded-2xl border border-neutral-800/80 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                وضعیت انتشار در آکادمی
              </h3>

              <div className="space-y-2">
                {[
                  { value: "PUBLISHED", label: "انتشار عمومی (در دسترس کاربران)", color: "text-emerald-400" },
                  { value: "DRAFT", label: "پیش‌نویس (فقط مدیریت)", color: "text-amber-400" },
                  { value: "ARCHIVED", label: "آرشیوشده (غیرفعال)", color: "text-neutral-400" },
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
                      name="status"
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
                  <span>نمایش در بخش «مقالات برگزیده» صفحه نخست</span>
                </label>
              </div>
            </div>

            {/* Author Card */}
            <div className="bg-neutral-950/40 p-5 rounded-2xl border border-neutral-800/80 space-y-4">
              <h3 className="text-xs font-bold text-white flex items-center gap-2">
                <User className="w-4 h-4 text-purple-400" />
                مشخصات نگارنده مقاله
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">نام نویسنده</label>
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">سمت یا تخصص فنی</label>
                  <input
                    type="text"
                    value={authorRole}
                    onChange={(e) => setAuthorRole(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">آدرس آواتار تصویر نویسنده</label>
                  <input
                    type="text"
                    value={authorAvatar}
                    onChange={(e) => setAuthorAvatar(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Content & Excerpt */}
      {activeTab === "content" && (
        <div className="space-y-6 bg-neutral-950/40 p-6 rounded-2xl border border-neutral-800/80">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-500" />
                چکیده و مقدمه کوتاه مقاله (Excerpt) <span className="text-red-400">*</span>
              </label>
              <span className="text-[11px] text-neutral-500">
                نمایش در کارت‌های وبلاگ و نتایج گوگل ({excerpt.length} کاراکتر)
              </span>
            </div>
            <textarea
              rows={3}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="خلاصه‌ای جذاب و فنی از مهم‌ترین نکات مقاله جهت جذب مخاطب در ۲ الی ۳ خط..."
              className="w-full p-4 bg-neutral-900 border border-neutral-800 rounded-xl text-xs leading-relaxed text-white focus:outline-none focus:border-amber-500/50"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-white mb-2">
              متن کامل مقاله و ویرایشگر پیشرفته (Rich Text + Syntax Highlighting)
            </label>
            <p className="text-[11px] text-neutral-400 mb-3">
              پشتیبانی از سرفصل‌های H1 تا H4، استایل‌های تایپوگرافی، لیست‌های نقطه‌ای و عددی، نقل‌قول، جداول مقایسه‌ای فنی و بلوک‌های کد با Syntax Highlighting (سیسکو، پایتون، لینوکس و Bash).
            </p>
            <RichTextEditor
              value={content}
              onChange={(newHtml) => setContent(newHtml)}
              placeholder="نگارش محتوای تخصصی مقاله را آغاز کنید..."
            />
          </div>
        </div>
      )}

      {/* TAB 3: Media & Gallery */}
      {activeTab === "media" && (
        <div className="space-y-6">
          {/* Watermark Policy Callout */}
          <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 text-emerald-300 text-xs flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <div>
              <span className="font-bold">قانون اکید عدم درج واترمارک: </span>
              کلیه تصاویر، دیاگرام‌ها و ویدیوهای بارگذاری‌شده برای مقالات و نمونه‌کارها با بالاترین کیفیت WebP ذخیره می‌شوند و هیچ‌گونه لوگو یا واترمارکی روی آن‌ها حک نمی‌شود.
            </div>
          </div>

          {/* Featured Image */}
          <div className="bg-neutral-950/40 p-6 rounded-2xl border border-neutral-800/80 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-amber-500" />
              تصویر شاخص مقاله (Featured Cover)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-neutral-300 mb-1.5">آدرس مستقیم تصویر شاخص</label>
                  <input
                    type="text"
                    value={featuredImage}
                    onChange={(e) => setFeaturedImage(e.target.value)}
                    placeholder="/uploads/articles/featured-sample.webp"
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs text-neutral-300 mb-1.5">متن جایگزین سئو (Alt Text)</label>
                  <input
                    type="text"
                    value={featuredImageAlt}
                    onChange={(e) => setFeaturedImageAlt(e.target.value)}
                    placeholder="نمای سوئیچ ماژولار کاتالیست ۹۶۰۰ سیسکو در رک"
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs text-neutral-300 mb-1.5">یا آپلود مستقیم از سیستم</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFeaturedImageUpload}
                    disabled={isUploadingMedia}
                    className="text-xs text-neutral-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-500/10 file:text-amber-400 hover:file:bg-amber-500/20 cursor-pointer"
                  />
                </div>
              </div>

              {/* Preview */}
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

          {/* Gallery Upload */}
          <div className="bg-neutral-950/40 p-6 rounded-2xl border border-neutral-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-purple-400" />
                گالری تصاویر داخل مقاله ({gallery.length} تصویر)
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
                      <img src={img.url} alt={img.title || "عکس مقاله"} className="w-full h-full object-cover" />
                      {featuredImage === img.url && (
                        <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-amber-500/90 text-black text-[10px] font-bold">
                          تصویر شاخص
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
                          showToast("این تصویر به عنوان کاور شاخص مقاله انتخاب شد", "success");
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
                تصاویر تکمیلی و دیاگرام‌های شبکه را در صورت نیاز اینجا بیفزایید.
              </p>
            )}
          </div>

          {/* Videos Upload */}
          <div className="bg-neutral-950/40 p-6 rounded-2xl border border-neutral-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Video className="w-4 h-4 text-sky-400" />
                ویدیوهای پیوست مقاله ({videos.length} ویدیو)
              </h3>
              <label className="cursor-pointer text-xs px-3 py-1.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 hover:bg-sky-500/20 flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5" />
                آپلود فایل ویدیویی (MP4/WebM)
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

      {/* TAB 4: Advanced SEO */}
      {activeTab === "seo" && (
        <div className="space-y-6">
          {/* Google Preview Snippet */}
          <div className="bg-neutral-950/40 p-6 rounded-2xl border border-neutral-800/80 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Globe className="w-4 h-4 text-amber-500" />
              پیش‌نمایش در نتایج جستجوی گوگل (SERP Snippet)
            </h3>

            <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 max-w-2xl space-y-1">
              <div className="text-[11px] text-neutral-400 font-mono truncate" dir="ltr">
                https://velox.ir/articles/{slug || "slug-example"}
              </div>
              <div className="text-sm font-semibold text-sky-400 hover:underline cursor-pointer truncate">
                {metaTitle || title || "عنوان متای سئو در این قسمت قرار می‌گیرد"} | ققنوس آکادمی
              </div>
              <div className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                {metaDescription || excerpt || "توضیحات متای مقاله که کاربر در صفحه نتایج موتورهای جستجو مشاهده خواهد نمود..."}
              </div>
            </div>
          </div>

          {/* SEO Input Fields */}
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
                  placeholder={title || "عنوان بهینه‌سازی‌شده برای گوگل"}
                  className="w-full px-3 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500/50"
                />
                <span className="text-[10px] text-neutral-500 mt-1 block">
                  طول پیشنهادی: ۵۰ تا ۶۰ کاراکتر (فعلی: {metaTitle.length})
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  کلمه کلیدی کانونی (Focus Keyword)
                </label>
                <input
                  type="text"
                  value={focusKeyword}
                  onChange={(e) => setFocusKeyword(e.target.value)}
                  placeholder="مثال: سوئیچ سیسکو L3"
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
                placeholder="توضیحات جذاب و خلاصه برای ترغیب کلیک در نتایج جستجو..."
                className="w-full p-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500/50"
              />
              <span className="text-[10px] text-neutral-500 mt-1 block">
                طول پیشنهادی: ۱۲۰ تا ۱۶۰ کاراکتر (فعلی: {metaDescription.length})
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  کلمات کلیدی ثانویه سئو (SEO Keywords)
                </label>
                <input
                  type="text"
                  value={seoKeywords}
                  onChange={(e) => setSeoKeywords(e.target.value)}
                  placeholder="سوئیچینگ, لایه ۳, روتینگ, دیتاسنتر"
                  className="w-full px-3 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  آدرس کانونیکال (Canonical URL)
                </label>
                <input
                  type="text"
                  value={canonicalUrl}
                  onChange={(e) => setCanonicalUrl(e.target.value)}
                  placeholder="https://velox.ir/articles/custom-canonical"
                  dir="ltr"
                  className="w-full px-3 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-amber-500/50"
                />
              </div>
            </div>

            {/* Social Cards (Open Graph) */}
            <div className="pt-4 border-t border-neutral-800 space-y-4">
              <h4 className="text-xs font-bold text-neutral-200">
                تنظیمات اشتراک‌گذاری در شبکه‌های اجتماعی (Open Graph)
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">OG Title</label>
                  <input
                    type="text"
                    value={ogTitle}
                    onChange={(e) => setOgTitle(e.target.value)}
                    placeholder={metaTitle || title}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">OG Image URL</label>
                  <input
                    type="text"
                    value={ogImage}
                    onChange={(e) => setOgImage(e.target.value)}
                    placeholder={featuredImage}
                    dir="ltr"
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">OG Description</label>
                <textarea
                  rows={2}
                  value={ogDescription}
                  onChange={(e) => setOgDescription(e.target.value)}
                  placeholder={metaDescription || excerpt}
                  className="w-full p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>
            </div>

            {/* Robots Directives */}
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
