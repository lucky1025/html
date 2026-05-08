// Auto 提色算法：从用户上传图片中提取 theme 参数
// 纯前端，用 canvas 读像素 + 简单量化聚类

import type { ThemeSchema } from '../templates/themes';

interface RGB { r: number; g: number; b: number }

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

function hexToRgb(hex: string): RGB {
  const n = parseInt(hex.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function luminance(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function colorDistance(a: RGB, b: RGB): number {
  return Math.sqrt((a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2);
}

// 简单 k-means 量化，k=6
function quantize(pixels: RGB[], k = 6, iterations = 20): RGB[] {
  if (pixels.length === 0) return [];
  // 随机选初始中心
  const centers: RGB[] = [];
  const step = Math.floor(pixels.length / k);
  for (let i = 0; i < k; i++) centers.push({ ...pixels[i * step] });

  let assignments = new Array(pixels.length).fill(0);

  for (let iter = 0; iter < iterations; iter++) {
    // 分配
    for (let i = 0; i < pixels.length; i++) {
      let minD = Infinity, best = 0;
      for (let j = 0; j < k; j++) {
        const d = colorDistance(pixels[i], centers[j]);
        if (d < minD) { minD = d; best = j; }
      }
      assignments[i] = best;
    }
    // 更新中心
    const sums = Array.from({ length: k }, () => ({ r: 0, g: 0, b: 0, count: 0 }));
    for (let i = 0; i < pixels.length; i++) {
      const c = assignments[i];
      sums[c].r += pixels[i].r;
      sums[c].g += pixels[i].g;
      sums[c].b += pixels[i].b;
      sums[c].count++;
    }
    for (let j = 0; j < k; j++) {
      if (sums[j].count > 0) {
        centers[j] = {
          r: Math.round(sums[j].r / sums[j].count),
          g: Math.round(sums[j].g / sums[j].count),
          b: Math.round(sums[j].b / sums[j].count),
        };
      }
    }
  }

  // 按出现频次排序
  const countMap = new Array(k).fill(0);
  for (const a of assignments) countMap[a]++;
  return centers
    .map((c, i) => ({ ...c, count: countMap[i] }))
    .sort((a, b) => (b as any).count - (a as any).count)
    .map(({ r, g, b }) => ({ r, g, b }));
}

// 采样图片像素，返回 downsampled pixels
function samplePixels(img: HTMLImageElement, sampleSize = 2000): RGB[] {
  const canvas = document.createElement('canvas');
  const size = 64;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, size, size);
  const data = ctx.getImageData(0, 0, size, size).data;
  const pixels: RGB[] = [];
  const total = size * size;
  const step = Math.max(1, Math.floor(total / sampleSize));
  for (let i = 0; i < total; i += step) {
    const idx = i * 4;
    if (data[idx + 3] < 128) continue; // 跳过透明
    pixels.push({ r: data[idx], g: data[idx + 1], b: data[idx + 2] });
  }
  return pixels;
}

// 推断渐变方向：比较 top-bottom 与 left-right 颜色差异
function inferGradientDir(img: HTMLImageElement): 'ttb' | 'ltr' {
  const canvas = document.createElement('canvas');
  canvas.width = 16; canvas.height = 16;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, 16, 16);
  const data = ctx.getImageData(0, 0, 16, 16).data;

  let topR = 0, topG = 0, topB = 0;
  let botR = 0, botG = 0, botB = 0;
  let leftR = 0, leftG = 0, leftB = 0;
  let rightR = 0, rightG = 0, rightB = 0;

  for (let x = 0; x < 16; x++) {
    const ti = (0 * 16 + x) * 4;
    topR += data[ti]; topG += data[ti + 1]; topB += data[ti + 2];
    const bi = (15 * 16 + x) * 4;
    botR += data[bi]; botG += data[bi + 1]; botB += data[bi + 2];
  }
  for (let y = 0; y < 16; y++) {
    const li = (y * 16 + 0) * 4;
    leftR += data[li]; leftG += data[li + 1]; leftB += data[li + 2];
    const ri = (y * 16 + 15) * 4;
    rightR += data[ri]; rightG += data[ri + 1]; rightB += data[ri + 2];
  }

  const tbDiff = Math.abs(topR - botR) + Math.abs(topG - botG) + Math.abs(topB - botB);
  const lrDiff = Math.abs(leftR - rightR) + Math.abs(leftG - rightG) + Math.abs(leftB - rightB);

  return tbDiff >= lrDiff ? 'ttb' : 'ltr';
}

function lightenHex(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex);
  const lr = Math.min(255, r + Math.round((255 - r) * amount));
  const lg = Math.min(255, g + Math.round((255 - g) * amount));
  const lb = Math.min(255, b + Math.round((255 - b) * amount));
  return rgbToHex(lr, lg, lb);
}

function darkenHex(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex);
  const dr = Math.max(0, r - Math.round(r * amount));
  const dg = Math.max(0, g - Math.round(g * amount));
  const db = Math.max(0, b - Math.round(b * amount));
  return rgbToHex(dr, dg, db);
}

function isLight(hex: string): boolean {
  const { r, g, b } = hexToRgb(hex);
  return luminance(r, g, b) > 128;
}

export async function extractThemeFromImage(file: File): Promise<ThemeSchema> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        const pixels = samplePixels(img);
        const palette = quantize(pixels, 6, 25);

        // 排序：按饱和度+亮度差选主色
        const withSat = palette.map(p => {
          const max = Math.max(p.r, p.g, p.b);
          const min = Math.min(p.r, p.g, p.b);
          const sat = max === 0 ? 0 : (max - min) / max;
          return { ...p, sat, lum: luminance(p.r, p.g, p.b) };
        });

        // 主色：饱和度最高，亮度适中
        const sorted = [...withSat].sort((a, b) => b.sat - a.sat);
        const primary = sorted[0] || withSat[0];
        const accent  = sorted[1] || withSat[1] || primary;

        // 背景色：使用出现最频繁且亮度高的颜色
        const bgCand = [...withSat].sort((a, b) => b.lum - a.lum);
        const bg = bgCand[0] || withSat[0];

        const primaryHex = rgbToHex(primary.r, primary.g, primary.b);
        const accentHex  = rgbToHex(accent.r,  accent.g,  accent.b);
        const bgHex      = rgbToHex(bg.r, bg.g, bg.b);

        const bgLight = isLight(bgHex);
        const primaryLight_ = isLight(primaryHex);

        const gradDir = inferGradientDir(img);

        const theme: ThemeSchema = {
          id: 'AUTO',
          name: 'Auto 自动',
          bgColor: bgHex,
          bgGradient: `linear-gradient(${gradDir === 'ttb' ? '180deg' : '90deg'}, ${bgHex} 0%, ${lightenHex(primaryHex, 0.7)} 100%)`,
          gradientDir: gradDir,
          primary: primaryHex,
          primaryLight: primaryHex + '18',
          primaryText: primaryLight_ ? '#1e293b' : '#ffffff',
          accent: accentHex,
          accentText: isLight(accentHex) ? '#1e293b' : '#ffffff',
          titleColor: bgLight ? darkenHex(primaryHex, 0.3) : '#ffffff',
          bodyTextColor: bgLight ? '#1e293b' : '#f1f5f9',
          mutedTextColor: bgLight ? '#6b7280' : '#94a3b8',
          cardBg: bgLight ? '#ffffff' : '#1e293b',
          cardBorderRadius: 12,
          cardShadow: 'medium',
          headerBg: primaryHex,
          headerText: primaryLight_ ? '#1e293b' : '#ffffff',
          rowOddBg: bgLight ? lightenHex(primaryHex, 0.93) : '#1e293b',
          rowEvenBg: bgLight ? '#ffffff' : '#263347',
          rowHoverBg: bgLight ? lightenHex(primaryHex, 0.85) : '#2d3f58',
          totalRowBg: primaryHex,
          totalRowText: primaryLight_ ? '#1e293b' : '#ffffff',
          dividerColor: bgLight ? '#e5e7eb' : '#334155',
          dividerStyle: 'solid',
          dividerWidth: 1,
          tableRadius: 10,
          leadBg: bgLight ? 'rgba(255,255,255,0.7)' : 'rgba(30,41,59,0.7)',
          leadBorderColor: bgLight ? '#e5e7eb' : '#334155',
          leadTextColor: bgLight ? '#1e293b' : '#f1f5f9',
          footerBg: bgLight ? 'rgba(255,255,255,0.5)' : 'rgba(15,23,42,0.5)',
          footerTextColor: bgLight ? '#6b7280' : '#94a3b8',
        };

        URL.revokeObjectURL(url);
        resolve(theme);
      } catch (err) {
        URL.revokeObjectURL(url);
        reject(err);
      }
    };
    img.onerror = reject;
    img.src = url;
  });
}
