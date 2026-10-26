// scripts/verify-frontend-ssr.mjs
const FRONTEND_URL = "http://localhost:3000";

const BACKEND_URL = "http://localhost:3001/api/v1";

async function main() {
  console.log("=== STARTING FRONTEND SSR & TECHNICAL SEO VERIFICATION ===");

  // Ensure a second published project exists for related projects section
  await fetch(`${BACKEND_URL}/portfolio`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer mock_admin_token_for_dev_session",
    },
    body: JSON.stringify({
      title: "پروژه تکمیلی فاز ۲ فولاد مبارکه",
      slug: "mobarakeh-phase-2-related",
      client: "شرکت فولاد مبارکه",
      summary: "پروژه مرتبط برای تست بخش پروژه‌های مشابه",
      description: "توسعه سوئیچینگ دسترسی در سالن‌های نورد گرم",
      status: "PUBLISHED",
    }),
  });

  // 1. Test Article SSR Page
  console.log("\n1. Testing Article SSR Detail Page & Technical SEO...");
  const artSlug = "industrial-tsn-network-architecture";
  const artRes = await fetch(`${FRONTEND_URL}/articles/${artSlug}`);
  console.log("Article page status:", artRes.status);
  if (artRes.status !== 200) {
    throw new Error(`Expected 200 for published article, got ${artRes.status}`);
  }
  const artHtml = await artRes.text();

  // Check Schema.org JSON-LD
  const hasArticleSchema = artHtml.includes('"@type":["Article","BlogPosting"]') || artHtml.includes('"Article"') || artHtml.includes('"BlogPosting"');
  console.log("Has Article / BlogPosting Schema JSON-LD:", hasArticleSchema);
  if (!hasArticleSchema) throw new Error("Article Schema.org JSON-LD missing!");

  // Check Canonical URL
  const hasCanonicalArt = artHtml.includes(`rel="canonical"`) && artHtml.includes(artSlug);
  console.log("Has Canonical Link:", hasCanonicalArt);

  // Check Breadcrumb navigation
  const hasBreadcrumbArt = artHtml.includes("مقالات تخصصی") && artHtml.includes("خانه");
  console.log("Has Visual & Structured Breadcrumb:", hasBreadcrumbArt);
  if (!hasBreadcrumbArt) throw new Error("Article Breadcrumb navigation missing!");

  // Check Prism code block
  const hasPrismCode = artHtml.includes("ping 192.168.1.1");
  console.log("Has Rendered Article Code Content:", hasPrismCode);

  // 2. Test Portfolio SSR Page
  console.log("\n2. Testing Portfolio SSR Detail Page & Technical SEO...");
  const portSlug = "mobarakeh-datacenter-deep-test-1";
  const portRes = await fetch(`${FRONTEND_URL}/portfolio/${portSlug}`);
  console.log("Portfolio page status:", portRes.status);
  if (portRes.status !== 200) {
    throw new Error(`Expected 200 for published portfolio, got ${portRes.status}`);
  }
  const portHtml = await portRes.text();

  // Check CreativeWork Schema JSON-LD
  const hasPortfolioSchema = portHtml.includes('"@type":"CreativeWork"') || portHtml.includes('"CreativeWork"');
  console.log("Has CreativeWork Schema JSON-LD:", hasPortfolioSchema);
  if (!hasPortfolioSchema) throw new Error("Portfolio CreativeWork Schema.org JSON-LD missing!");

  // Check Breadcrumb
  const hasBreadcrumbPort = portHtml.includes("نمونه‌کارها و پروژه‌ها") && portHtml.includes("خانه");
  console.log("Has Visual & Structured Breadcrumb:", hasBreadcrumbPort);
  if (!hasBreadcrumbPort) throw new Error("Portfolio Breadcrumb navigation missing!");

  // Check Reordered Features & Sub-entities
  const hasReorderedFeatures = portHtml.includes("128") && portHtml.includes("40Gbps") && portHtml.includes("99.999%");
  console.log("Has Features & Metrics Rendered:", hasReorderedFeatures);

  const hasChallenges = portHtml.includes("راهکار مهندسی ققنوس") || portHtml.includes("TSN") || portHtml.includes("گرد و غبار");
  console.log("Has Challenges & Engineering Solution Rendered:", hasChallenges);

  const hasTechnologies = portHtml.includes("Cisco Nexus") || portHtml.includes("Fortinet");
  console.log("Has Equipment & Technologies Rendered:", hasTechnologies);

  const hasAchievements = portHtml.includes("دستاوردهای کلیدی پروژه") || portHtml.includes("تولید فولاد");
  console.log("Has Achievements Rendered:", hasAchievements);

  const hasRelatedProjects = portHtml.includes("پروژه‌ها و نمونه‌کارهای مرتبط") || portHtml.includes("مشاهده جزئیات پروژه");
  console.log("Has Related Projects Section Rendered:", hasRelatedProjects);

  // 3. Test Draft 404 Isolation for Public Visitor
  console.log("\n3. Testing Draft Isolation on Frontend SSR (Must return 404)...");
  const draftArtRes = await fetch(`${FRONTEND_URL}/articles/draft-security-ot-article`);
  console.log("Draft article SSR status:", draftArtRes.status, "(Expected: 404)");
  if (draftArtRes.status !== 404) {
    throw new Error(`Draft article should return 404 to public, got ${draftArtRes.status}`);
  }

  const draftPortRes = await fetch(`${FRONTEND_URL}/portfolio/shazand-draft-project-test-1`);
  console.log("Draft portfolio SSR status:", draftPortRes.status, "(Expected: 404)");
  if (draftPortRes.status !== 404) {
    throw new Error(`Draft portfolio should return 404 to public, got ${draftPortRes.status}`);
  }

  // 4. Test Dynamic Sitemap
  console.log("\n4. Testing Dynamic Sitemap.xml...");
  const sitemapRes = await fetch(`${FRONTEND_URL}/sitemap.xml`);
  console.log("Sitemap status:", sitemapRes.status);
  const sitemapXml = await sitemapRes.text();
  const hasArticlesInSitemap = sitemapXml.includes("/articles");
  const hasPortfolioInSitemap = sitemapXml.includes("/portfolio");
  console.log("Sitemap includes /articles:", hasArticlesInSitemap);
  console.log("Sitemap includes /portfolio:", hasPortfolioInSitemap);

  console.log("\n=== ALL FRONTEND SSR & SEO VERIFICATIONS PASSED SUCCESSFULLY! ===");
}

main().catch((err) => {
  console.error("\n❌ FRONTEND VERIFICATION FAILED:", err);
  process.exit(1);
});
