const fs = require('fs');
const path = require('path');
const sharp = require('../backend/node_modules/sharp');

const articleSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" width="1200" height="675">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0a0c14" />
      <stop offset="50%" stop-color="#121624" />
      <stop offset="100%" stop-color="#0d0f18" />
    </linearGradient>

    <radialGradient id="orangeGlow" cx="25%" cy="30%" r="50%">
      <stop offset="0%" stop-color="#ea580c" stop-opacity="0.35" />
      <stop offset="60%" stop-color="#c2410c" stop-opacity="0.08" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0" />
    </radialGradient>

    <radialGradient id="blueGlow" cx="75%" cy="70%" r="55%">
      <stop offset="0%" stop-color="#0284c7" stop-opacity="0.25" />
      <stop offset="60%" stop-color="#0369a1" stop-opacity="0.05" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0" />
    </radialGradient>

    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#ffffff" stroke-opacity="0.03" stroke-width="1" />
      <circle cx="40" cy="40" r="1.5" fill="#f97316" fill-opacity="0.25" />
    </pattern>

    <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e2235" stop-opacity="0.8" />
      <stop offset="100%" stop-color="#121522" stop-opacity="0.9" />
    </linearGradient>

    <linearGradient id="iconGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fb923c" />
      <stop offset="100%" stop-color="#ea580c" />
    </linearGradient>

    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="#000000" flood-opacity="0.6" />
    </filter>
  </defs>

  <!-- Background base -->
  <rect width="1200" height="675" fill="url(#bgGrad)" />

  <!-- Ambient Light Glows -->
  <rect width="1200" height="675" fill="url(#orangeGlow)" />
  <rect width="1200" height="675" fill="url(#blueGlow)" />

  <!-- Cyber Grid -->
  <rect width="1200" height="675" fill="url(#grid)" />

  <!-- Top Accent Line -->
  <rect x="0" y="0" width="1200" height="3" fill="url(#iconGrad)" />

  <!-- Decorative Network Nodes and Circuits -->
  <g opacity="0.4">
    <path d="M 120 180 L 260 180 L 320 240 L 480 240" fill="none" stroke="#ea580c" stroke-width="1.5" stroke-dasharray="6,6" />
    <circle cx="120" cy="180" r="4" fill="#f97316" />
    <circle cx="320" cy="240" r="4" fill="#f97316" />
    <circle cx="480" cy="240" r="5" fill="#ea580c" />

    <path d="M 1080 495 L 940 495 L 880 435 L 720 435" fill="none" stroke="#0284c7" stroke-width="1.5" stroke-dasharray="6,6" />
    <circle cx="1080" cy="495" r="4" fill="#38bdf8" />
    <circle cx="880" cy="435" r="4" fill="#38bdf8" />
    <circle cx="720" cy="435" r="5" fill="#0284c7" />
  </g>

  <!-- Central Glassmorphism Card -->
  <g transform="translate(360, 140)" filter="url(#shadow)">
    <rect width="480" height="395" rx="24" fill="url(#cardGrad)" stroke="#374151" stroke-width="1.5" stroke-opacity="0.6" />
    <rect width="480" height="395" rx="24" fill="none" stroke="url(#iconGrad)" stroke-width="1" stroke-opacity="0.3" />

    <!-- Brand Badge -->
    <rect x="165" y="32" width="150" height="30" rx="15" fill="#ea580c" fill-opacity="0.15" stroke="#f97316" stroke-width="1" stroke-opacity="0.4" />
    <text x="240" y="52" fill="#fb923c" font-family="Vazirmatn, Tahoma, sans-serif" font-size="12" font-weight="700" text-anchor="middle" letter-spacing="1">ققنوس آکادمی</text>

    <!-- Central Emblem (Book & Circuits) -->
    <g transform="translate(190, 85)">
      <!-- Outer Hex/Circle Glow -->
      <circle cx="50" cy="50" r="54" fill="#ea580c" fill-opacity="0.12" />
      <circle cx="50" cy="50" r="44" fill="#181b2a" stroke="url(#iconGrad)" stroke-width="2" />

      <!-- Open Book / Document Icon -->
      <g transform="translate(26, 26)" stroke="url(#iconGrad)" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M 4 28 C 4 22 10 20 24 20 C 38 20 44 22 44 28" />
        <path d="M 4 8 C 4 14 10 16 24 16 C 38 16 44 14 44 8" />
        <line x1="24" y1="16" x2="24" y2="40" />
        <path d="M 4 8 L 4 28" />
        <path d="M 44 8 L 44 28" />
        <line x1="12" y1="14" x2="18" y2="14" />
        <line x1="30" y1="14" x2="36" y2="14" />
      </g>
    </g>

    <!-- Main Title -->
    <text x="240" y="245" fill="#ffffff" font-family="Vazirmatn, Tahoma, sans-serif" font-size="22" font-weight="800" text-anchor="middle">دانشنامه و مقالات تخصصی</text>
    <text x="240" y="278" fill="#9ca3af" font-family="Vazirmatn, Tahoma, sans-serif" font-size="13" font-weight="500" text-anchor="middle">معماری شبکه، سوئیچینگ، دیتاسنتر و امنیت</text>

    <!-- Decorative Status Dot Pill -->
    <rect x="140" y="320" width="200" height="34" rx="10" fill="#0f121d" stroke="#1f2937" stroke-width="1" />
    <circle cx="160" cy="337" r="4" fill="#10b981" />
    <text x="245" y="342" fill="#d1d5db" font-family="Vazirmatn, Tahoma, sans-serif" font-size="12" font-weight="600" text-anchor="middle">مستندات و بررسی‌های فنی</text>
  </g>

  <!-- Corner Brackets -->
  <path d="M 40 70 L 40 40 L 70 40" fill="none" stroke="#ea580c" stroke-width="2" opacity="0.6" />
  <path d="M 1160 70 L 1160 40 L 1130 40" fill="none" stroke="#ea580c" stroke-width="2" opacity="0.6" />
  <path d="M 40 605 L 40 635 L 70 635" fill="none" stroke="#ea580c" stroke-width="2" opacity="0.6" />
  <path d="M 1160 605 L 1160 635 L 1130 635" fill="none" stroke="#ea580c" stroke-width="2" opacity="0.6" />
</svg>`;

const portfolioSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" width="1200" height="675">
  <defs>
    <linearGradient id="bgGradP" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#080c14" />
      <stop offset="50%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#0a101d" />
    </linearGradient>

    <radialGradient id="emeraldGlow" cx="20%" cy="30%" r="50%">
      <stop offset="0%" stop-color="#10b981" stop-opacity="0.3" />
      <stop offset="60%" stop-color="#047857" stop-opacity="0.08" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0" />
    </radialGradient>

    <radialGradient id="amberGlow" cx="80%" cy="70%" r="55%">
      <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.25" />
      <stop offset="60%" stop-color="#d97706" stop-opacity="0.05" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0" />
    </radialGradient>

    <pattern id="gridP" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#ffffff" stroke-opacity="0.03" stroke-width="1" />
      <circle cx="40" cy="40" r="1.5" fill="#10b981" fill-opacity="0.3" />
    </pattern>

    <linearGradient id="cardGradP" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#162032" stop-opacity="0.85" />
      <stop offset="100%" stop-color="#0d1522" stop-opacity="0.95" />
    </linearGradient>

    <linearGradient id="iconGradP" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#34d399" />
      <stop offset="100%" stop-color="#059669" />
    </linearGradient>

    <filter id="shadowP" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="#000000" flood-opacity="0.65" />
    </filter>
  </defs>

  <rect width="1200" height="675" fill="url(#bgGradP)" />
  <rect width="1200" height="675" fill="url(#emeraldGlow)" />
  <rect width="1200" height="675" fill="url(#amberGlow)" />
  <rect width="1200" height="675" fill="url(#gridP)" />

  <rect x="0" y="0" width="1200" height="3" fill="url(#iconGradP)" />

  <!-- Data Stream lines -->
  <g opacity="0.35">
    <path d="M 80 500 L 220 500 L 280 440 L 460 440" fill="none" stroke="#10b981" stroke-width="1.5" stroke-dasharray="6,6" />
    <circle cx="80" cy="500" r="4" fill="#34d399" />
    <circle cx="280" cy="440" r="4" fill="#34d399" />
    <circle cx="460" cy="440" r="5" fill="#10b981" />

    <path d="M 1120 180 L 980 180 L 920 240 L 760 240" fill="none" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="6,6" />
    <circle cx="1120" cy="180" r="4" fill="#fbbf24" />
    <circle cx="920" cy="240" r="4" fill="#fbbf24" />
    <circle cx="760" cy="240" r="5" fill="#f59e0b" />
  </g>

  <!-- Central Card -->
  <g transform="translate(360, 140)" filter="url(#shadowP)">
    <rect width="480" height="395" rx="24" fill="url(#cardGradP)" stroke="#1e293b" stroke-width="1.5" stroke-opacity="0.7" />
    <rect width="480" height="395" rx="24" fill="none" stroke="url(#iconGradP)" stroke-width="1" stroke-opacity="0.35" />

    <!-- Brand Badge -->
    <rect x="155" y="32" width="170" height="30" rx="15" fill="#10b981" fill-opacity="0.15" stroke="#34d399" stroke-width="1" stroke-opacity="0.4" />
    <text x="240" y="52" fill="#34d399" font-family="Vazirmatn, Tahoma, sans-serif" font-size="12" font-weight="700" text-anchor="middle" letter-spacing="1">مهندسی ققنوس آکادمی</text>

    <!-- Central Server Rack / Datacenter Emblem -->
    <g transform="translate(190, 85)">
      <circle cx="50" cy="50" r="54" fill="#10b981" fill-opacity="0.12" />
      <circle cx="50" cy="50" r="44" fill="#0f172a" stroke="url(#iconGradP)" stroke-width="2" />

      <!-- Server Rack Icon -->
      <g transform="translate(27, 26)" stroke="url(#iconGradP)" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <rect x="4" y="4" width="38" height="12" rx="3" fill="#10b981" fill-opacity="0.1" />
        <circle cx="12" cy="10" r="2" fill="#34d399" />
        <circle cx="18" cy="10" r="2" fill="#34d399" />
        <line x1="28" y1="10" x2="36" y2="10" />

        <rect x="4" y="19" width="38" height="12" rx="3" fill="#10b981" fill-opacity="0.1" />
        <circle cx="12" cy="25" r="2" fill="#34d399" />
        <circle cx="18" cy="25" r="2" fill="#34d399" />
        <line x1="28" y1="25" x2="36" y2="25" />

        <rect x="4" y="34" width="38" height="12" rx="3" fill="#10b981" fill-opacity="0.1" />
        <circle cx="12" cy="40" r="2" fill="#fbbf24" />
        <circle cx="18" cy="40" r="2" fill="#34d399" />
        <line x1="28" y1="40" x2="36" y2="40" />
      </g>
    </g>

    <!-- Main Title -->
    <text x="240" y="245" fill="#ffffff" font-family="Vazirmatn, Tahoma, sans-serif" font-size="22" font-weight="800" text-anchor="middle">پروژه‌های مهندسی و زیرساخت</text>
    <text x="240" y="278" fill="#94a3b8" font-family="Vazirmatn, Tahoma, sans-serif" font-size="13" font-weight="500" text-anchor="middle">طراحی، اجرا و مانیتورینگ اتاق سرور و شبکه‌های سازمانی</text>

    <!-- Decorative Metric Badge -->
    <rect x="135" y="320" width="210" height="34" rx="10" fill="#0b1320" stroke="#1e293b" stroke-width="1" />
    <circle cx="155" cy="337" r="4" fill="#34d399" />
    <text x="245" y="342" fill="#cbd5e1" font-family="Vazirmatn, Tahoma, sans-serif" font-size="12" font-weight="600" text-anchor="middle">پروژه فعال • نظارت مهندسی</text>
  </g>

  <!-- Corner Brackets -->
  <path d="M 40 70 L 40 40 L 70 40" fill="none" stroke="#10b981" stroke-width="2" opacity="0.6" />
  <path d="M 1160 70 L 1160 40 L 1130 40" fill="none" stroke="#10b981" stroke-width="2" opacity="0.6" />
  <path d="M 40 605 L 40 635 L 70 635" fill="none" stroke="#10b981" stroke-width="2" opacity="0.6" />
  <path d="M 1160 605 L 1160 635 L 1130 635" fill="none" stroke="#10b981" stroke-width="2" opacity="0.6" />
</svg>`;

const authorSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <defs>
    <linearGradient id="avatarBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#141824" />
      <stop offset="100%" stop-color="#0a0d16" />
    </linearGradient>

    <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f97316" />
      <stop offset="50%" stop-color="#ea580c" />
      <stop offset="100%" stop-color="#f59e0b" />
    </linearGradient>

    <linearGradient id="userGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#f97316" />
      <stop offset="100%" stop-color="#c2410c" />
    </linearGradient>

    <radialGradient id="ambientGlow" cx="50%" cy="40%" r="50%">
      <stop offset="0%" stop-color="#ea580c" stop-opacity="0.3" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0" />
    </radialGradient>
  </defs>

  <!-- Background Base Circle -->
  <circle cx="200" cy="200" r="198" fill="url(#avatarBg)" />

  <!-- Ambient Glow -->
  <circle cx="200" cy="200" r="198" fill="url(#ambientGlow)" />

  <!-- Outer Cyber Rings -->
  <circle cx="200" cy="200" r="185" fill="none" stroke="url(#ringGrad)" stroke-width="4" stroke-opacity="0.8" />
  <circle cx="200" cy="200" r="172" fill="none" stroke="#374151" stroke-width="1.5" stroke-dasharray="8,6" opacity="0.6" />

  <!-- Tech Indicator Dots -->
  <circle cx="200" cy="15" r="5" fill="#f97316" />
  <circle cx="200" cy="385" r="4" fill="#38bdf8" />
  <circle cx="15" cy="200" r="4" fill="#f59e0b" />
  <circle cx="385" cy="200" r="4" fill="#10b981" />

  <!-- User Silhouette with Tech Styling -->
  <g transform="translate(100, 75)">
    <!-- Head -->
    <circle cx="100" cy="75" r="52" fill="url(#userGrad)" stroke="#ffedd5" stroke-width="2.5" stroke-opacity="0.4" />
    
    <!-- Headphones / Tech headset band -->
    <path d="M 40 75 A 60 60 0 0 1 160 75" fill="none" stroke="#38bdf8" stroke-width="5" stroke-linecap="round" />
    <rect x="34" y="65" width="12" height="24" rx="5" fill="#0284c7" stroke="#38bdf8" stroke-width="1.5" />
    <rect x="154" y="65" width="12" height="24" rx="5" fill="#0284c7" stroke="#38bdf8" stroke-width="1.5" />

    <!-- Body / Shoulders -->
    <path d="M 12 215 C 12 155, 45 140, 100 140 C 155 140, 188 155, 188 215 Z" fill="url(#userGrad)" stroke="#ffedd5" stroke-width="2.5" stroke-opacity="0.3" />
    
    <!-- Collar / Badge -->
    <polygon points="100,165 82,142 118,142" fill="#1e2235" stroke="#f97316" stroke-width="1.5" />
    <circle cx="100" cy="180" r="4" fill="#38bdf8" />
  </g>
</svg>`;

async function main() {
  const rootDir = path.join(__dirname, '..');
  const defaultsDir = path.join(rootDir, 'frontend', 'public', 'images', 'defaults');
  const authorsDir = path.join(rootDir, 'frontend', 'public', 'images', 'authors');

  if (!fs.existsSync(defaultsDir)) fs.mkdirSync(defaultsDir, { recursive: true });
  if (!fs.existsSync(authorsDir)) fs.mkdirSync(authorsDir, { recursive: true });

  // 1. Write SVGs
  const artSvgPath = path.join(defaultsDir, 'article-default.svg');
  const portSvgPath = path.join(defaultsDir, 'portfolio-default.svg');
  const authSvgPath = path.join(authorsDir, 'author-default.svg');
  const authSvgDefPath = path.join(defaultsDir, 'author-default.svg');

  fs.writeFileSync(artSvgPath, articleSvg, 'utf8');
  fs.writeFileSync(portSvgPath, portfolioSvg, 'utf8');
  fs.writeFileSync(authSvgPath, authorSvg, 'utf8');
  fs.writeFileSync(authSvgDefPath, authorSvg, 'utf8');

  console.log('SVGs created successfully.');

  // 2. Convert to WebP using sharp
  const artWebpPath = path.join(defaultsDir, 'article-default.webp');
  const portWebpPath = path.join(defaultsDir, 'portfolio-default.webp');
  const authWebpPath = path.join(authorsDir, 'author-default.webp');
  const authWebpDefPath = path.join(defaultsDir, 'author-default.webp');

  await sharp(Buffer.from(articleSvg))
    .webp({ quality: 90 })
    .toFile(artWebpPath);

  await sharp(Buffer.from(portfolioSvg))
    .webp({ quality: 90 })
    .toFile(portWebpPath);

  await sharp(Buffer.from(authorSvg))
    .webp({ quality: 95 })
    .toFile(authWebpPath);

  await sharp(Buffer.from(authorSvg))
    .webp({ quality: 95 })
    .toFile(authWebpDefPath);

  console.log('WebP files generated successfully:');
  console.log(' - ' + artWebpPath);
  console.log(' - ' + portWebpPath);
  console.log(' - ' + authWebpPath);
  console.log(' - ' + authWebpDefPath);
}

main().catch(err => {
  console.error('Error generating images:', err);
  process.exit(1);
});
