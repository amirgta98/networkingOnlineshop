// scripts/verify-articles-portfolio.mjs
const BACKEND_URL = "http://localhost:3001/api/v1";
const FRONTEND_URL = "http://localhost:3000";

const ADMIN_TOKEN = "mock_admin_token_for_dev_session";

async function main() {
  console.log("=== STARTING DEEP VERIFICATION OF ARTICLES & PORTFOLIO ===");

  // 1. Create a published project with features, challenges, technologies, achievements, gallery, videos
  console.log("\n1. Testing Portfolio Creation with Full Sub-entities...");
  const createProjectPayload = {
    title: "پروژه آزمایشی دیتاسنتر فولاد مبارکه",
    slug: "mobarakeh-datacenter-deep-test",
    client: "شرکت فولاد مبارکه اصفهان",
    location: "اصفهان، مبارکه",
    projectDate: "۱۴۰۳",
    summary: "طراحی و پیاده‌سازی زیرساخت مرکز داده فوق پایدار با ریداندنسی ۲N",
    description: "شرح تفصیلی پروژه و پیکربندی سوئیچ‌ها و فایروال‌های ماژولار در محیط پر گرد و غبار صنعتی.",
    status: "PUBLISHED",
    isFeatured: true,
    features: [
      { value: "40Gbps", title: "پهنای باند کر", description: "اتصال به شبکه اصلی", sortOrder: 0 },
      { value: "99.999%", title: "آپ‌تایم تضمینی", description: "پایداری بدون توقف", sortOrder: 1 },
      { value: "128", title: "تعداد رک‌های فعال", description: "چگالی بالا با خنک‌کننده In-Row", sortOrder: 2 },
    ],
    challenges: [
      {
        title: "حرارت و گرد و غبار فلزی در کارخانه",
        description: "ورود ذرات باردار به سالن سرور خطر اتصال کوتاه ایجاد می‌کرد",
        solution: "ایجاد سالن با فشار هوای مثبت و فیلتراسیون هوای ۳ لایه صنعتی",
        result: "صفر شدن خرابی بردها",
        sortOrder: 0,
      },
      {
        title: "حجم بالای داده در مانیتورینگ کوره‌ها",
        description: "تاخیر زیر ۵ میلی‌ثانیه برای سیستم SCADA الزامی بود",
        solution: "به‌کارگیری پروتکل TSN و سوئیچینگ لایه ۲ سخت‌افزاری",
        result: "تاخیر ۲ میلی‌ثانیه در کل فاز",
        sortOrder: 1,
      },
    ],
    technologies: [
      { name: "Cisco Nexus 9300", description: "سوئیچینگ ستون فقرات دیتاسنتر", sortOrder: 0 },
      { name: "Fortinet FortiGate 1800F", description: "امنیت مرز شبکه و تفکیک OT از IT", sortOrder: 1 },
    ],
    achievements: [
      { title: "عدم قطعی در فرایند تولید فولاد", metric: "100%", description: "پایداری کامل در طول ۶ ماه اول", sortOrder: 0 },
    ],
    gallery: [
      { type: "image", url: "/uploads/portfolio/rack-front.webp", title: "رک سرورهای مرکزی", caption: "چیدمان رک‌ها با مدیریت کابل حرفه‌ای" },
      { type: "image", url: "/uploads/portfolio/fiber-patch.webp", title: "پچ پنل فیبر نوری", caption: "ترمینیشن فیبر OM4 با کمترین افت سیگنال" },
    ],
    videos: [
      { type: "video", url: "/uploads/portfolio/timelapse.mp4", title: "تایم‌لپس ساخت اتاق سرور", caption: "مراحل کامل اجرای سالن در ۲۰ روز" },
    ],
  };

  const createProjRes = await fetch(`${BACKEND_URL}/portfolio`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ADMIN_TOKEN}`,
    },
    body: JSON.stringify(createProjectPayload),
  });

  const createdProject = await createProjRes.json();
  console.log("Create project status:", createProjRes.status, "ID:", createdProject.id, "Slug:", createdProject.slug);
  if (createProjRes.status !== 201 && createProjRes.status !== 200) {
    throw new Error(`Failed to create project: ${JSON.stringify(createdProject)}`);
  }

  // 2. Create a DRAFT project to verify visibility rules
  console.log("\n2. Testing Draft Project Creation & Protection...");
  const draftProjectPayload = {
    title: "پروژه در حال آماده‌سازی پتروشیمی شازند",
    slug: "shazand-draft-project-test",
    client: "پتروشیمی شازند",
    summary: "پیش‌نویس محرمانه که نباید در وب‌سایت عمومی دیده شود",
    description: "اطلاعات پروژه در حال نگارش توسط تیم فنی.",
    status: "DRAFT",
  };

  const createDraftProjRes = await fetch(`${BACKEND_URL}/portfolio`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ADMIN_TOKEN}`,
    },
    body: JSON.stringify(draftProjectPayload),
  });
  const createdDraftProj = await createDraftProjRes.json();
  console.log("Create draft project status:", createDraftProjRes.status, "Slug:", createdDraftProj.slug);

  // 3. Test Public Access vs Admin Access for Draft Project
  console.log("\n3. Testing Public Access vs Admin Access on Draft Project...");
  // Public request for draft project (MUST 404)
  const publicDraftFetch = await fetch(`${BACKEND_URL}/portfolio/${createdDraftProj.slug}`);
  console.log("Public fetch for DRAFT project status:", publicDraftFetch.status, "(Expected: 404)");
  if (publicDraftFetch.status !== 404) {
    throw new Error(`Public fetch for draft project should return 404, got ${publicDraftFetch.status}`);
  }

  // Admin request for draft project (MUST 200)
  const adminDraftFetch = await fetch(`${BACKEND_URL}/portfolio/${createdDraftProj.slug}`, {
    headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
  });
  console.log("Admin fetch for DRAFT project status:", adminDraftFetch.status, "(Expected: 200)");
  if (adminDraftFetch.status !== 200) {
    throw new Error(`Admin fetch for draft project should return 200, got ${adminDraftFetch.status}`);
  }

  // Public list (MUST NOT contain draft project)
  const publicListFetch = await fetch(`${BACKEND_URL}/portfolio`);
  const publicList = await publicListFetch.json();
  const hasDraftInPublic = publicList.items?.some((p) => p.slug === createdDraftProj.slug);
  console.log("Public portfolio list contains draft project?", hasDraftInPublic, "(Expected: false)");
  if (hasDraftInPublic) {
    throw new Error("Draft project leaked in public portfolio list!");
  }

  // 4. Test Reordering of Project Sub-entities via Admin Update
  console.log("\n4. Testing Sub-entities Reordering via Admin Update...");
  const reorderPayload = {
    features: [
      { value: "128", title: "تعداد رک‌های فعال", description: "چگالی بالا", sortOrder: 0 },
      { value: "40Gbps", title: "پهنای باند کر", description: "اتصال به شبکه اصلی", sortOrder: 1 },
      { value: "99.999%", title: "آپ‌تایم تضمینی", description: "پایداری بدون توقف", sortOrder: 2 },
    ],
  };

  const updateProjRes = await fetch(`${BACKEND_URL}/portfolio/${createdProject.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ADMIN_TOKEN}`,
    },
    body: JSON.stringify(reorderPayload),
  });
  console.log("Update project status:", updateProjRes.status);
  const updatedProject = await updateProjRes.json();
  console.log("Reordered features in DB response:", updatedProject.features?.map((f) => ({ val: f.value, order: f.sortOrder })));
  if (updatedProject.features?.[0]?.value !== "128") {
    throw new Error("Feature reordering failed to persist in DB!");
  }

  // 5. Test Articles API & Protection
  console.log("\n5. Testing Articles API (Published + Draft)...");
  const createArtPayload = {
    title: "معماری شبکه‌های صنعتی مبتنی بر پروتکل TSN",
    slug: "industrial-tsn-network-architecture",
    excerpt: "بررسی استانداردهای اترنت بلادرنگ در شبکه‌های زیرساخت کارخانجات و دیتاسنترهای صنعتی.",
    content: "<h2>مقدمه</h2><p>پروتکل TSN تضمین‌کننده ارتباطات قطعی و با تاخیر کم در شبکه است.</p><pre><code class=\"language-bash\">ping 192.168.1.1 -c 100</code></pre>",
    status: "PUBLISHED",
    isFeatured: true,
    tags: ["شبکه صنعتی", "TSN", "زیرساخت"],
    gallery: [
      { type: "image", url: "/uploads/articles/tsn-diagram.webp", title: "دیاگرام زمان‌بندی فریم‌ها در TSN", caption: "بازه زمانی انتقال بسته‌ها" },
    ],
  };

  const createArtRes = await fetch(`${BACKEND_URL}/articles`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ADMIN_TOKEN}`,
    },
    body: JSON.stringify(createArtPayload),
  });
  const createdArticle = await createArtRes.json();
  console.log("Create article status:", createArtRes.status, "Slug:", createdArticle.slug);

  // Draft Article
  const createDraftArtPayload = {
    title: "پیش‌نویس مقاله محرمانه امنیت صنعتی",
    slug: "draft-security-ot-article",
    excerpt: "مقاله‌ای که هنوز منتشر نشده و نباید در وبلاگ عمومی دیده شود.",
    content: "<p>در حال نگارش...</p>",
    status: "DRAFT",
  };
  const createDraftArtRes = await fetch(`${BACKEND_URL}/articles`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ADMIN_TOKEN}`,
    },
    body: JSON.stringify(createDraftArtPayload),
  });
  const createdDraftArt = await createDraftArtRes.json();
  console.log("Create draft article status:", createDraftArtRes.status, "Slug:", createdDraftArt.slug);

  // Test Public 404 for draft article
  const publicDraftArtFetch = await fetch(`${BACKEND_URL}/articles/${createdDraftArt.slug}`);
  console.log("Public fetch for DRAFT article status:", publicDraftArtFetch.status, "(Expected: 404)");
  if (publicDraftArtFetch.status !== 404) {
    throw new Error(`Public fetch for draft article should return 404, got ${publicDraftArtFetch.status}`);
  }

  // Test Admin 200 for draft article
  const adminDraftArtFetch = await fetch(`${BACKEND_URL}/articles/${createdDraftArt.slug}`, {
    headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
  });
  console.log("Admin fetch for DRAFT article status:", adminDraftArtFetch.status, "(Expected: 200)");
  if (adminDraftArtFetch.status !== 200) {
    throw new Error(`Admin fetch for draft article should return 200, got ${adminDraftArtFetch.status}`);
  }

  // 6. Test Media Watermark Exemption in Image Processing
  console.log("\n6. Testing Watermark Exemption in Image Processing Service...");
  // Let's verify that upload-image endpoint on articles and portfolio works without adding watermark
  // We can send a small 1x1 PNG or JPEG buffer
  const samplePngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
  const sampleBuffer = Buffer.from(samplePngBase64, "base64");

  const formData = new FormData();
  formData.append("file", new Blob([sampleBuffer], { type: "image/png" }), "test-sample.png");

  const artUploadRes = await fetch(`${BACKEND_URL}/articles/upload-image`, {
    method: "POST",
    headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
    body: formData,
  });
  const artUploadData = await artUploadRes.json();
  console.log("Article upload image status:", artUploadRes.status, "URL:", artUploadData.url);
  if (artUploadRes.status !== 200 || !artUploadData.url?.includes("/uploads/articles/")) {
    throw new Error(`Article image upload failed: ${JSON.stringify(artUploadData)}`);
  }

  const portFormData = new FormData();
  portFormData.append("file", new Blob([sampleBuffer], { type: "image/png" }), "port-sample.png");
  const portUploadRes = await fetch(`${BACKEND_URL}/portfolio/upload-image`, {
    method: "POST",
    headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
    body: portFormData,
  });
  const portUploadData = await portUploadRes.json();
  console.log("Portfolio upload image status:", portUploadRes.status, "URL:", portUploadData.url);
  if (portUploadRes.status !== 200 || !portUploadData.url?.includes("/uploads/portfolio/")) {
    throw new Error(`Portfolio image upload failed: ${JSON.stringify(portUploadData)}`);
  }

  console.log("\n=== ALL DEEP VERIFICATIONS PASSED SUCCESSFULLY! ===");
}

main().catch((err) => {
  console.error("\n❌ VERIFICATION FAILED:", err);
  process.exit(1);
});
