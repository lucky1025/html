// ============================================================
// 固定5套模板 theme 常量定义
// 所有参数明确固定，不允许 AI 随意发挥
// ============================================================

export type GradientDir = 'none' | 'ltr' | 'rtl' | 'ttb' | 'btt' | 'diagonal';
export type ShadowLevel = 'none' | 'light' | 'medium' | 'strong';
export type DividerStyle = 'solid' | 'dashed' | 'none';

export interface ThemeSchema {
  id: string;
  name: string;
  // 背景
  bgColor: string;
  bgGradient: string | null;          // CSS gradient string or null
  gradientDir: GradientDir;
  // 主色（表头、按钮、总计行）
  primary: string;
  primaryLight: string;               // 淡化版，用于奇数行底纹
  primaryText: string;                // 在 primary 背景上的文字颜色
  // 辅色
  accent: string;
  accentText: string;
  // 文字
  titleColor: string;
  bodyTextColor: string;
  mutedTextColor: string;
  // 卡片/表格容器
  cardBg: string;
  cardBorderRadius: number;           // px
  cardShadow: ShadowLevel;
  // 表格
  headerBg: string;
  headerText: string;
  rowOddBg: string;
  rowEvenBg: string;
  rowHoverBg: string;
  totalRowBg: string;
  totalRowText: string;
  dividerColor: string;
  dividerStyle: DividerStyle;
  dividerWidth: number;               // px
  // 圆角
  tableRadius: number;
  // 抬头区
  leadBg: string;
  leadBorderColor: string;
  leadTextColor: string;
  // 底部说明
  footerBg: string;
  footerTextColor: string;
}

// ──────────────────────────────────────────────────────────
// T01  紫蓝渐变（对标参考图风格）
// ──────────────────────────────────────────────────────────
export const T01: ThemeSchema = {
  id: 'T01',
  name: '商务紫蓝',
  bgColor: '#6366f1',
  bgGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  gradientDir: 'diagonal',
  primary: '#5b6af0',
  primaryLight: 'rgba(91,106,240,0.08)',
  primaryText: '#ffffff',
  accent: '#a78bfa',
  accentText: '#ffffff',
  titleColor: '#ffffff',
  bodyTextColor: '#1e1b4b',
  mutedTextColor: '#6b7280',
  cardBg: '#ffffff',
  cardBorderRadius: 16,
  cardShadow: 'medium',
  headerBg: '#5b6af0',
  headerText: '#ffffff',
  rowOddBg: '#f5f6ff',
  rowEvenBg: '#ffffff',
  rowHoverBg: '#ede9fe',
  totalRowBg: '#5b6af0',
  totalRowText: '#ffffff',
  dividerColor: '#e0e0f0',
  dividerStyle: 'solid',
  dividerWidth: 1,
  tableRadius: 12,
  leadBg: 'rgba(255,255,255,0.18)',
  leadBorderColor: 'rgba(255,255,255,0.4)',
  leadTextColor: '#ffffff',
  footerBg: 'rgba(255,255,255,0.12)',
  footerTextColor: 'rgba(255,255,255,0.85)',
};

// ──────────────────────────────────────────────────────────
// T12  深海蓝（深色专业风）— 强化渐变
// ──────────────────────────────────────────────────────────
export const T12: ThemeSchema = {
  id: 'T12',
  name: '深海蓝调',
  bgColor: '#0c1929',
  bgGradient: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 40%, #2563eb 100%)',
  gradientDir: 'diagonal',
  primary: '#3b82f6',
  primaryLight: 'rgba(59,130,246,0.1)',
  primaryText: '#ffffff',
  accent: '#38bdf8',
  accentText: '#0f172a',
  titleColor: '#f1f5f9',
  bodyTextColor: '#e2e8f0',
  mutedTextColor: '#94a3b8',
  cardBg: 'rgba(30,41,59,0.85)',
  cardBorderRadius: 12,
  cardShadow: 'strong',
  headerBg: '#2563eb',
  headerText: '#ffffff',
  rowOddBg: 'rgba(30,41,59,0.6)',
  rowEvenBg: 'rgba(38,51,71,0.5)',
  rowHoverBg: 'rgba(45,63,88,0.7)',
  totalRowBg: '#2563eb',
  totalRowText: '#ffffff',
  dividerColor: 'rgba(59,130,246,0.25)',
  dividerStyle: 'solid',
  dividerWidth: 1,
  tableRadius: 10,
  leadBg: 'rgba(37,99,235,0.2)',
  leadBorderColor: 'rgba(59,130,246,0.4)',
  leadTextColor: '#e0f2fe',
  footerBg: 'rgba(15,23,42,0.5)',
  footerTextColor: '#94a3b8',
};

// ──────────────────────────────────────────────────────────
// N02  清新绿（科技/环保风）— 强化渐变
// ──────────────────────────────────────────────────────────
export const N02: ThemeSchema = {
  id: 'N02',
  name: '清新绿意',
  bgColor: '#064e3b',
  bgGradient: 'linear-gradient(135deg, #065f46 0%, #059669 35%, #34d399 100%)',
  gradientDir: 'diagonal',
  primary: '#059669',
  primaryLight: 'rgba(5,150,105,0.1)',
  primaryText: '#ffffff',
  accent: '#10b981',
  accentText: '#ffffff',
  titleColor: '#ffffff',
  bodyTextColor: '#064e3b',
  mutedTextColor: '#6b7280',
  cardBg: 'rgba(255,255,255,0.92)',
  cardBorderRadius: 14,
  cardShadow: 'medium',
  headerBg: '#059669',
  headerText: '#ffffff',
  rowOddBg: 'rgba(209,250,229,0.45)',
  rowEvenBg: 'rgba(255,255,255,0.8)',
  rowHoverBg: 'rgba(167,243,208,0.6)',
  totalRowBg: '#059669',
  totalRowText: '#ffffff',
  dividerColor: 'rgba(5,150,105,0.2)',
  dividerStyle: 'solid',
  dividerWidth: 1,
  tableRadius: 12,
  leadBg: 'rgba(255,255,255,0.25)',
  leadBorderColor: 'rgba(167,243,208,0.6)',
  leadTextColor: '#ffffff',
  footerBg: 'rgba(255,255,255,0.15)',
  footerTextColor: 'rgba(255,255,255,0.9)',
};

// ──────────────────────────────────────────────────────────
// N17  暖橙金（高端/奢华风）— 强化渐变
// ──────────────────────────────────────────────────────────
export const N17: ThemeSchema = {
  id: 'N17',
  name: '暖橙金融',
  bgColor: '#78350f',
  bgGradient: 'linear-gradient(135deg, #92400e 0%, #d97706 40%, #fbbf24 100%)',
  gradientDir: 'diagonal',
  primary: '#d97706',
  primaryLight: 'rgba(217,119,6,0.1)',
  primaryText: '#ffffff',
  accent: '#f59e0b',
  accentText: '#ffffff',
  titleColor: '#ffffff',
  bodyTextColor: '#451a03',
  mutedTextColor: '#92400e',
  cardBg: 'rgba(255,254,247,0.93)',
  cardBorderRadius: 14,
  cardShadow: 'medium',
  headerBg: '#d97706',
  headerText: '#ffffff',
  rowOddBg: 'rgba(254,243,199,0.5)',
  rowEvenBg: 'rgba(255,255,255,0.8)',
  rowHoverBg: 'rgba(253,230,138,0.55)',
  totalRowBg: '#d97706',
  totalRowText: '#ffffff',
  dividerColor: 'rgba(217,119,6,0.2)',
  dividerStyle: 'solid',
  dividerWidth: 1,
  tableRadius: 12,
  leadBg: 'rgba(255,255,255,0.22)',
  leadBorderColor: 'rgba(251,191,36,0.5)',
  leadTextColor: '#fffbeb',
  footerBg: 'rgba(120,53,15,0.3)',
  footerTextColor: 'rgba(255,251,235,0.9)',
};

// ──────────────────────────────────────────────────────────
// N20  极简白（简洁/SaaS 风）— 增加微妙渐变
// ──────────────────────────────────────────────────────────
export const N20: ThemeSchema = {
  id: 'N20',
  name: '极简白调',
  bgColor: '#f1f5f9',
  bgGradient: 'linear-gradient(135deg, #e2e8f0 0%, #f8fafc 50%, #e2e8f0 100%)',
  gradientDir: 'diagonal',
  primary: '#475569',
  primaryLight: 'rgba(71,85,105,0.06)',
  primaryText: '#ffffff',
  accent: '#64748b',
  accentText: '#ffffff',
  titleColor: '#1e293b',
  bodyTextColor: '#334155',
  mutedTextColor: '#94a3b8',
  cardBg: '#ffffff',
  cardBorderRadius: 10,
  cardShadow: 'medium',
  headerBg: '#334155',
  headerText: '#ffffff',
  rowOddBg: '#f8fafc',
  rowEvenBg: '#ffffff',
  rowHoverBg: '#f1f5f9',
  totalRowBg: '#334155',
  totalRowText: '#ffffff',
  dividerColor: '#e2e8f0',
  dividerStyle: 'solid',
  dividerWidth: 1,
  tableRadius: 8,
  leadBg: '#ffffff',
  leadBorderColor: '#cbd5e1',
  leadTextColor: '#1e293b',
  footerBg: '#f1f5f9',
  footerTextColor: '#64748b',
};

export const FIXED_THEMES: ThemeSchema[] = [T01, T12, N02, N17, N20];

export const DEFAULT_THEME = T01;
