import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/dashboard/", "/partner/"],
    },
    sitemap: "https://fonix-accademic.ir/sitemap.xml",
  };
}
