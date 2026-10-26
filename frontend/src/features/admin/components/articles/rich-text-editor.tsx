"use client";

import * as React from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  Video,
  Table as TableIcon,
  Eye,
  Edit3,
  Code2,
  Palette,
  Undo,
  Redo,
} from "lucide-react";
import { ArticleContentRenderer } from "@/features/articles/components/article-content-renderer";

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "متن کامل مقاله، توضیحات، جداول و کدهای نمونه را در این قسمت وارد نمایید...",
  className = "",
}: RichTextEditorProps) {
  const [activeTab, setActiveTab] = React.useState<"editor" | "html" | "preview">("editor");
  const editorRef = React.useRef<HTMLDivElement>(null);
  const isUpdatingFromProps = React.useRef(false);

  // Sync value from props to contentEditable element
  React.useEffect(() => {
    if (editorRef.current && !isUpdatingFromProps.current) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || "";
      }
    }
    isUpdatingFromProps.current = false;
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      isUpdatingFromProps.current = true;
      onChange(editorRef.current.innerHTML);
    }
  };

  const exec = (command: string, arg: string | undefined = undefined) => {
    document.execCommand(command, false, arg);
    handleInput();
    editorRef.current?.focus();
  };

  const insertHeading = (level: "h1" | "h2" | "h3" | "h4" | "p") => {
    exec("formatBlock", `<${level}>`);
  };

  const insertLink = () => {
    const url = prompt("آدرس لینک (URL) را وارد کنید:", "https://");
    if (url && url.trim()) {
      exec("createLink", url.trim());
    }
  };

  const insertImage = () => {
    const url = prompt("آدرس مستقیم تصویر (URL) را وارد کنید:", "https://");
    if (url && url.trim()) {
      const alt = prompt("متن جایگزین تصویر (Alt Text):", "تصویر مقاله") || "";
      const imgHtml = `<img src="${url.trim()}" alt="${alt}" class="rounded-xl border border-neutral-800 my-4 max-w-full h-auto" />`;
      exec("insertHTML", imgHtml);
    }
  };

  const insertVideo = () => {
    const url = prompt("آدرس فایل ویدیویی (MP4 یا WebM):", "https://");
    if (url && url.trim()) {
      const videoHtml = `
        <div class="my-6 rounded-2xl overflow-hidden border border-neutral-800 bg-black">
          <video src="${url.trim()}" controls class="w-full max-h-[480px]"></video>
        </div>
      `;
      exec("insertHTML", videoHtml);
    }
  };

  const insertTable = () => {
    const rows = parseInt(prompt("تعداد ردیف‌ها (Rows):", "3") || "3", 10);
    const cols = parseInt(prompt("تعداد ستون‌ها (Columns):", "3") || "3", 10);

    let html = `<table class="w-full my-4 border border-neutral-800 rounded-lg overflow-hidden"><thead><tr>`;
    for (let c = 0; c < cols; c++) {
      html += `<th class="p-3 bg-neutral-900 border-b border-neutral-800 text-right text-white">سرستون ${c + 1}</th>`;
    }
    html += `</tr></thead><tbody>`;

    for (let r = 0; r < rows; r++) {
      html += `<tr>`;
      for (let c = 0; c < cols; c++) {
        html += `<td class="p-3 border-b border-neutral-800 text-neutral-300">داده ${r + 1}-${c + 1}</td>`;
      }
      html += `</tr>`;
    }
    html += `</tbody></table><p><br></p>`;

    exec("insertHTML", html);
  };

  const insertCodeBlock = () => {
    const lang = prompt("زبان برنامه‌نویسی (bash, javascript, typescript, python, json, html, css):", "bash") || "bash";
    const code = prompt("کد مورد نظر را وارد نمایید یا پس از درج ویرایش کنید:", "# دستورات شبکه\nshow ip interface brief") || "";
    const escaped = code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    const blockHtml = `<pre><code class="language-${lang}">${escaped}</code></pre><p><br></p>`;
    exec("insertHTML", blockHtml);
  };

  const colors = [
    { label: "سفید", value: "#ffffff" },
    { label: "نارنجی ققنوس", value: "#ea580c" },
    { label: "سبز زمردی", value: "#10b981" },
    { label: "آبی آسمانی", value: "#38bdf8" },
    { label: "زرد کهربایی", value: "#f59e0b" },
    { label: "رز قرمز", value: "#f43f5e" },
    { label: "خاکستری روشن", value: "#d4d4d8" },
  ];

  return (
    <div className={`rounded-2xl border border-neutral-800 bg-neutral-950/80 overflow-hidden ${className}`}>
      {/* ── Toolbar Header ────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800 bg-neutral-900/90 p-2 sm:p-3">
        {/* Formatting Actions */}
        <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
          {/* Headings */}
          <div className="flex items-center gap-0.5 bg-neutral-800/60 p-0.5 rounded-lg border border-neutral-700/50">
            <button
              type="button"
              onClick={() => insertHeading("p")}
              title="متن عادی (Paragraph)"
              className="px-2 py-1 text-xs font-semibold text-neutral-300 hover:text-white rounded hover:bg-neutral-700/60 transition-colors"
            >
              P
            </button>
            <button
              type="button"
              onClick={() => insertHeading("h2")}
              title="عنوان اصلی (H2)"
              className="p-1 text-neutral-300 hover:text-orange-400 rounded hover:bg-neutral-700/60 transition-colors"
            >
              <Heading2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => insertHeading("h3")}
              title="زیرعنوان (H3)"
              className="p-1 text-neutral-300 hover:text-orange-400 rounded hover:bg-neutral-700/60 transition-colors"
            >
              <Heading3 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => insertHeading("h4")}
              title="تیتر فرعی (H4)"
              className="p-1 text-neutral-300 hover:text-orange-400 rounded hover:bg-neutral-700/60 transition-colors"
            >
              <Heading4 className="h-4 w-4" />
            </button>
          </div>

          <div className="h-5 w-px bg-neutral-800" />

          {/* Inline Styles */}
          <div className="flex items-center gap-0.5 bg-neutral-800/60 p-0.5 rounded-lg border border-neutral-700/50">
            <button
              type="button"
              onClick={() => exec("bold")}
              title="درشت (Bold)"
              className="p-1.5 text-neutral-300 hover:text-white rounded hover:bg-neutral-700/60 transition-colors"
            >
              <Bold className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => exec("italic")}
              title="مورب (Italic)"
              className="p-1.5 text-neutral-300 hover:text-white rounded hover:bg-neutral-700/60 transition-colors"
            >
              <Italic className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => exec("underline")}
              title="خط زیرین (Underline)"
              className="p-1.5 text-neutral-300 hover:text-white rounded hover:bg-neutral-700/60 transition-colors"
            >
              <Underline className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => exec("strikeThrough")}
              title="خط‌خورده (Strikethrough)"
              className="p-1.5 text-neutral-300 hover:text-white rounded hover:bg-neutral-700/60 transition-colors"
            >
              <Strikethrough className="h-4 w-4" />
            </button>
          </div>

          <div className="h-5 w-px bg-neutral-800" />

          {/* Color Palette */}
          <div className="relative group">
            <button
              type="button"
              title="رنگ متن"
              className="flex items-center gap-1 p-1.5 bg-neutral-800/60 border border-neutral-700/50 rounded-lg text-neutral-300 hover:text-white"
            >
              <Palette className="h-4 w-4 text-orange-400" />
            </button>
            <div className="absolute top-full right-0 mt-1 hidden group-hover:flex flex-col gap-1 p-2 bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl z-50 min-w-[140px]">
              {colors.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => exec("foreColor", c.value)}
                  className="flex items-center gap-2 px-2 py-1 text-xs text-right rounded hover:bg-neutral-800 transition-colors text-neutral-200"
                >
                  <span className="h-3 w-3 rounded-full border border-white/20" style={{ backgroundColor: c.value }} />
                  <span>{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="h-5 w-px bg-neutral-800" />

          {/* Lists & Quotes */}
          <div className="flex items-center gap-0.5 bg-neutral-800/60 p-0.5 rounded-lg border border-neutral-700/50">
            <button
              type="button"
              onClick={() => exec("insertUnorderedList")}
              title="لیست بولت‌دار"
              className="p-1.5 text-neutral-300 hover:text-white rounded hover:bg-neutral-700/60 transition-colors"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => exec("insertOrderedList")}
              title="لیست شماره‌دار"
              className="p-1.5 text-neutral-300 hover:text-white rounded hover:bg-neutral-700/60 transition-colors"
            >
              <ListOrdered className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => exec("formatBlock", "<blockquote>")}
              title="نقل‌قول (Quote)"
              className="p-1.5 text-neutral-300 hover:text-white rounded hover:bg-neutral-700/60 transition-colors"
            >
              <Quote className="h-4 w-4" />
            </button>
          </div>

          <div className="h-5 w-px bg-neutral-800" />

          {/* Rich Inserts: Link, Image, Video, Table, Code Block */}
          <div className="flex items-center gap-0.5 bg-neutral-800/60 p-0.5 rounded-lg border border-neutral-700/50">
            <button
              type="button"
              onClick={insertLink}
              title="درج لینک"
              className="p-1.5 text-neutral-300 hover:text-sky-400 rounded hover:bg-neutral-700/60 transition-colors"
            >
              <LinkIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={insertImage}
              title="درج تصویر با آدرس"
              className="p-1.5 text-neutral-300 hover:text-emerald-400 rounded hover:bg-neutral-700/60 transition-colors"
            >
              <ImageIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={insertVideo}
              title="درج ویدیو"
              className="p-1.5 text-neutral-300 hover:text-purple-400 rounded hover:bg-neutral-700/60 transition-colors"
            >
              <Video className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={insertTable}
              title="درج جدول استاندارد"
              className="p-1.5 text-neutral-300 hover:text-amber-400 rounded hover:bg-neutral-700/60 transition-colors"
            >
              <TableIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={insertCodeBlock}
              title="درج بلوک کد با Syntax Highlighting"
              className="p-1.5 text-neutral-300 hover:text-emerald-400 rounded hover:bg-neutral-700/60 transition-colors font-mono font-bold"
            >
              <Code className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab("editor")}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === "editor"
                ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span>ویرایشگر</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("html")}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === "html"
                ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Code2 className="h-3.5 w-3.5" />
            <span>کد HTML</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === "preview"
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            <span>پیش‌نمایش زنده</span>
          </button>
        </div>
      </div>

      {/* ── Editor Canvas / Body ──────────────────────────────────────── */}
      <div className="relative min-h-[420px] p-4 sm:p-6 bg-neutral-950 text-neutral-200">
        {activeTab === "editor" && (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            onBlur={handleInput}
            dir="rtl"
            className="article-content-body outline-none min-h-[380px] focus:outline-none"
            data-placeholder={placeholder}
          />
        )}

        {activeTab === "html" && (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            dir="ltr"
            className="w-full min-h-[380px] bg-neutral-900/60 font-mono text-sm text-emerald-400 p-4 rounded-xl border border-neutral-800 outline-none focus:border-orange-500/50 resize-y"
            placeholder="<html> کدهای HTML مقاله را در اینجا ویرایش نمایید... </html>"
          />
        )}

        {activeTab === "preview" && (
          <div className="min-h-[380px] rounded-xl border border-neutral-800/80 bg-neutral-900/40 p-6">
            <div className="text-xs font-mono text-emerald-400 mb-4 pb-2 border-b border-neutral-800 flex items-center justify-between">
              <span>● پیش‌نمایش خروجی واقعی با Syntax Highlighting و رندر XSS ایمن</span>
              <span className="text-neutral-500">{value?.length || 0} کاراکتر</span>
            </div>
            <ArticleContentRenderer content={value || "<p class='text-neutral-500 italic'>محتوایی جهت پیش‌نمایش وارد نشده است.</p>"} />
          </div>
        )}
      </div>
    </div>
  );
}
