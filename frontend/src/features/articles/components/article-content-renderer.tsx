"use client";

import * as React from "react";
import DOMPurify from "dompurify";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
// Components can load extra languages if needed
import "prismjs/components/prism-bash";
import "prismjs/components/prism-json";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-python";

interface ArticleContentRendererProps {
  content: string;
  className?: string;
}

export function ArticleContentRenderer({
  content,
  className = "",
}: ArticleContentRendererProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [sanitizedHtml, setSanitizedHtml] = React.useState<string>("");

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const clean = DOMPurify.sanitize(content, {
        ADD_TAGS: ["iframe", "video", "source", "table", "thead", "tbody", "tr", "th", "td", "pre", "code"],
        ADD_ATTR: [
          "allow",
          "allowfullscreen",
          "frameborder",
          "scrolling",
          "controls",
          "target",
          "rel",
          "class",
          "src",
          "alt",
          "width",
          "height",
        ],
      });
      setSanitizedHtml(clean);
    } else {
      setSanitizedHtml(content);
    }
  }, [content]);

  React.useEffect(() => {
    if (containerRef.current) {
      Prism.highlightAllUnder(containerRef.current);
    }
  }, [sanitizedHtml]);

  return (
    <div
      ref={containerRef}
      className={`article-content-body prose prose-invert max-w-none text-neutral-300 leading-relaxed ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml || content }}
    />
  );
}
