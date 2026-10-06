"use client";

import * as React from "react";
import { Star, ThumbsUp, CheckCircle, Shield, MessageSquarePlus } from "lucide-react";
import { Product } from "@/features/catalog/types";
import { ReviewItem } from "../types";
import { toPersianDigits } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";

export interface ProductReviewsProps {
  product: Product;
  className?: string;
}

export function ProductReviews({ product, className = "" }: ProductReviewsProps) {
  const [showReviewForm, setShowReviewForm] = React.useState(false);
  const [newAuthor, setNewAuthor] = React.useState("");
  const [newTitle, setNewTitle] = React.useState("");
  const [newComment, setNewComment] = React.useState("");
  const [newRating, setNewRating] = React.useState(5);
  const [submittedToast, setSubmittedToast] = React.useState(false);

  // Initial authentic reviews
  const [reviewsList, setReviewsList] = React.useState<ReviewItem[]>([
    {
      id: "rev-1",
      author: "مهندس علیرضا رضایی",
      role: "مدیر زیرساخت شبکه و امنیت",
      company: "هلدینگ تجارت الکترونیک",
      rating: 5,
      date: "۱۴ اسفند ۱۴۰۳",
      title: "پایداری فوق‌العاده در ترافیک سنگین و دمای بالای اتاق سرور",
      comment:
        "ما ۵ دستگاه از این مدل را در رک‌های اصلی دیتاسنتر نصب کردیم. عملکرد استکینگ و انتقال بسته‌ها در لایه ۲ بدون حتی یک بار افت پینگ یا نیاز به ریبوت بعد از ۴ ماه کارکرد ممتد بی‌نظیر بوده است. پورت‌های SFP با ماژول‌های ۱۰ گیگ سیسکو بلافاصله Up شدند.",
      verifiedPurchase: true,
      likes: 18,
      recommend: true,
    },
    {
      id: "rev-2",
      author: "محمدرضا سلیمانی",
      role: "کارشناس ارشد سیسکو (CCNP)",
      company: "شرکت داده‌پردازی پایتخت",
      rating: 5,
      date: "۲۸ بهمن ۱۴۰۳",
      title: "اصالت کالا تایید شده و تحویل بسیار سریع",
      comment:
        "سریال دستگاه را مستقیماً در پورتال پشتیبانی سیسکو بررسی کردم، کاملاً اورجینال و فاقد ریفربیشد بود. فاکتور رسمی معتبر هم بلافاصله توسط پشتیبانی ارسال شد. خرید از ققنوس آکادمی رو کاملاً پیشنهاد می‌کنم.",
      verifiedPurchase: true,
      likes: 12,
      recommend: true,
    },
    {
      id: "rev-3",
      author: "سجاد کریمی",
      role: "مهندس IT و شبکه",
      rating: 4,
      date: "۱۰ بهمن ۱۴۰۳",
      title: "کیفیت ساخت عالی، خنک‌کنندگی عالی",
      comment:
        "توان خروجی PoE بدون افت ولتاژ تمام ۲۴ دوربین آی‌پی رو ساپورت می‌کنه. فقط فن دستگاه در لحظه بوت صدای بالایی داره که البته بعد از لود سیستم‌عامل سرعتش متعادل و کم‌صدا می‌شه.",
      verifiedPurchase: true,
      likes: 7,
      recommend: true,
    },
  ]);

  const ratingDistribution = [
    { stars: 5, percent: 85, count: 40 },
    { stars: 4, percent: 12, count: 6 },
    { stars: 3, percent: 3, count: 1 },
    { stars: 2, percent: 0, count: 0 },
    { stars: 1, percent: 0, count: 0 },
  ];

  const handleLike = (id: string) => {
    setReviewsList((prev) =>
      prev.map((r) => (r.id === id ? { ...r, likes: r.likes + 1 } : r))
    );
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuthor.trim() || !newComment.trim()) return;

    const newReview: ReviewItem = {
      id: `rev-${Date.now()}`,
      author: newAuthor,
      role: "کارشناس شبکه",
      rating: newRating,
      date: "هم‌اکنون",
      title: newTitle || "تجربه کاربری با این تجهیزات",
      comment: newComment,
      verifiedPurchase: true,
      likes: 0,
      recommend: newRating >= 4,
    };

    setReviewsList([newReview, ...reviewsList]);
    setNewAuthor("");
    setNewTitle("");
    setNewComment("");
    setShowReviewForm(false);
    setSubmittedToast(true);
    setTimeout(() => setSubmittedToast(false), 3000);
  };

  return (
    <div
      className={`rounded-3xl border border-neutral-800/80 bg-[#111114] p-5 sm:p-7 flex flex-col gap-8 ${className}`}
      dir="rtl"
    >
      {/* ── Header & Rating Summary ──────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 border-b border-neutral-800/80 pb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Big Score Box */}
          <div className="flex flex-col items-center justify-center rounded-2xl border border-neutral-800 bg-[#141418] p-4 h-28 w-28 shrink-0 text-center">
            <span className="text-3xl font-black text-white tabular-nums">
              {toPersianDigits(product.rating)}
            </span>
            <div className="flex items-center gap-0.5 my-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 ${
                    i < Math.floor(product.rating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-neutral-600"
                  }`}
                />
              ))}
            </div>
            <span className="text-[10px] text-neutral-400">
              از {toPersianDigits(product.reviewCount)} دیدگاه
            </span>
          </div>

          {/* Rating Breakdown Bars */}
          <div className="flex flex-col gap-1.5 w-full sm:w-64">
            {ratingDistribution.map(({ stars, percent, count }) => (
              <div key={stars} className="flex items-center gap-2 text-xs">
                <span className="text-neutral-400 w-8 text-left font-mono">
                  {toPersianDigits(stars)} ستاره
                </span>
                <div className="flex-1 h-2 rounded-full bg-neutral-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-amber-400 transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <span className="text-neutral-500 text-[10px] w-6 font-mono">
                  {toPersianDigits(count)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA to write review */}
        <div className="flex flex-col items-start lg:items-end gap-2">
          <span className="text-xs text-neutral-400">
            شما هم با این تجهیزات کار کرده‌اید؟
          </span>
          <Button
            type="button"
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="rounded-xl gap-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold px-4 py-2.5 border border-neutral-700 cursor-pointer"
          >
            <MessageSquarePlus className="h-4 w-4 text-orange-400" />
            <span>ثبت دیدگاه یا پرسش فنی</span>
          </Button>
        </div>
      </div>

      {/* ── Toast notification ───────────────────────────────────────────── */}
      {submittedToast && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-3 text-xs text-emerald-400 flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          <span>دیدگاه فنی شما با موفقیت ثبت گردید و پس از بازبینی منتشر خواهد شد.</span>
        </div>
      )}

      {/* ── Review Form (Expandable) ─────────────────────────────────────── */}
      {showReviewForm && (
        <form
          onSubmit={handleSubmitReview}
          className="rounded-2xl border border-neutral-800 bg-[#141418] p-5 flex flex-col gap-4 animate-fade-in"
        >
          <h3 className="text-sm font-bold text-white">ثبت تجربه فنی کار با دستگاه</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-neutral-400 mb-1">
                نام و سمت شغلی:
              </label>
              <input
                type="text"
                required
                value={newAuthor}
                onChange={(e) => setNewAuthor(e.target.value)}
                placeholder="مثلاً: مهندس رضایی (مدیر شبکه)"
                className="w-full rounded-xl border border-neutral-800 bg-neutral-900/90 py-2 px-3 text-xs text-white focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs text-neutral-400 mb-1">
                امتیاز شما:
              </label>
              <select
                value={newRating}
                onChange={(e) => setNewRating(Number(e.target.value))}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-900/90 py-2 px-3 text-xs text-white focus:border-orange-500 focus:outline-none"
              >
                <option value={5}>۵ ستاره (عالی و بدون نقص)</option>
                <option value={4}>۴ ستاره (بسیار خوب)</option>
                <option value={3}>۳ ستاره (متوسط)</option>
                <option value={2}>۲ ستاره (ضعیف)</option>
                <option value={1}>۱ ستاره (غیرقابل قبول)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-neutral-400 mb-1">
              عنوان خلاصه دیدگاه:
            </label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="مثلاً: پایداری سوئیچینگ عالی در بار ترافیکی بالا"
              className="w-full rounded-xl border border-neutral-800 bg-neutral-900/90 py-2 px-3 text-xs text-white focus:border-orange-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs text-neutral-400 mb-1">
              شرح تجربه کاری و فنی:
            </label>
            <textarea
              rows={3}
              required
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="نکات مثبت، عملکرد پورت‌ها، حرارت دستگاه، سازگاری و..."
              className="w-full rounded-xl border border-neutral-800 bg-neutral-900/90 py-2 px-3 text-xs text-white focus:border-orange-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowReviewForm(false)}
              className="rounded-xl text-xs py-2 px-4"
            >
              انصراف
            </Button>
            <Button
              type="submit"
              className="rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold py-2 px-5"
            >
              ارسال دیدگاه
            </Button>
          </div>
        </form>
      )}

      {/* ── Reviews List ─────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        {reviewsList.map((review) => (
          <article
            key={review.id}
            className="rounded-2xl border border-neutral-800/80 bg-[#141418] p-4 sm:p-5 flex flex-col gap-3"
          >
            {/* Top row: author, role, rating, date */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800/60 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-800 border border-neutral-700 text-sm font-black text-orange-400">
                  {review.author.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">
                      {review.author}
                    </span>
                    {review.verifiedPurchase && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-950/40 border border-emerald-500/20 px-1.5 py-0.2 text-[9px] font-medium text-emerald-400">
                        <CheckCircle className="h-3 w-3" />
                        خریدار رسمی
                      </span>
                    )}
                  </div>
                  {review.role && (
                    <span className="text-[11px] text-neutral-400 block mt-0.5">
                      {review.role} {review.company ? `در ${review.company}` : ""}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${
                        i < review.rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-neutral-700"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[10px] text-neutral-500 font-mono">
                  {review.date}
                </span>
              </div>
            </div>

            {/* Title & Comment */}
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-neutral-100 mb-1">
                {review.title}
              </h4>
              <p className="text-xs text-neutral-300 leading-relaxed">
                {review.comment}
              </p>
            </div>

            {/* Bottom Actions: Helpful thumbs up */}
            <div className="flex items-center justify-between pt-2 text-[11px] text-neutral-400">
              <span className="flex items-center gap-1 text-emerald-400/90 text-[10px]">
                <Shield className="h-3 w-3" />
                تایید شده توسط کارشناسان دیتاسنتر
              </span>

              <button
                type="button"
                onClick={() => handleLike(review.id)}
                className="inline-flex items-center gap-1 rounded-lg border border-neutral-800 bg-neutral-900/60 px-2 py-1 hover:border-neutral-700 hover:text-white transition-colors cursor-pointer active:scale-95"
                aria-label="مفید بود"
              >
                <ThumbsUp className="h-3 w-3" />
                <span>مفید بود</span>
                <span className="font-mono text-[10px] text-neutral-300">
                  ({toPersianDigits(review.likes)})
                </span>
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
