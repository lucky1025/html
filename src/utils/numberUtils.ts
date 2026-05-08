// 数字格式化工具

// 校验是否为合法数字输入（含空字符串）
export function isValidNumberInput(v: string): boolean {
  if (v === '' || v === '-') return true;
  return /^-?\d*\.?\d*$/.test(v);
}

// 失焦后格式化：最多2位小数，去除多余0
export function formatNumberOnBlur(v: string): string {
  if (v === '' || v === '-') return '';
  const n = parseFloat(v);
  if (isNaN(n)) return '';
  // 最多2位小数
  const str = n.toFixed(2).replace(/\.?0+$/, '');
  return str;
}

// 千分位格式化（仅显示用，不用于输入中）
export function formatWithCommas(v: string): string {
  if (!v) return '';
  const n = parseFloat(v);
  if (isNaN(n)) return v;
  return n.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

// 计算总计：discountPrice * quantity，两者任一为空则返回 ''
export function calcTotal(discountPrice: string, quantity: string): string {
  if (discountPrice === '' || quantity === '') return '';
  const p = parseFloat(discountPrice);
  const q = parseFloat(quantity);
  if (isNaN(p) || isNaN(q)) return '';
  const t = p * q;
  // 最多2位小数
  return t.toFixed(2).replace(/\.?0+$/, '');
}

// 生成唯一 id
export function genId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
