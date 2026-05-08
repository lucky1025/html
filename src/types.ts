// 全局数据类型定义

export interface QuoteRow {
  id: string;
  name: string;              // 富文本 HTML
  originalPrice: string;     // 数字字符串，可空
  discountPrice: string;     // 数字字符串，可空
  quantity: string;          // 数字字符串，可空
  total: string;             // 自动计算，展示用
  features: string;          // 富文本 HTML
}

export interface QuoteData {
  title: string;             // 报价单标题，默认"报价单"
  company: string;           // 抬头公司名
  rows: QuoteRow[];
  footerNote: string;        // 底部说明（纯文本，最多30字）
  currency: string;          // 货币符号，默认 ¥
}

// 列宽配置
export interface ColWidths {
  index: number;
  name: number;
  originalPrice: number;
  discountPrice: number;
  quantity: number;
  total: number;
  features: number;
}

// 列对齐方式配置（表头 + 数据单元格）
export type AlignOption = 'left' | 'center' | 'right';

export interface ColAligns {
  index: AlignOption;         // 序号
  name: AlignOption;          // 名称
  originalPrice: AlignOption; // 原价格
  discountPrice: AlignOption; // 优惠价格
  quantity: AlignOption;      // 数量
  total: AlignOption;         // 总计
  features: AlignOption;      // 内容功能
}

export const COL_WIDTH_LIMITS: Record<keyof ColWidths, { min: number; max: number }> = {
  index:         { min: 36,  max: 80 },
  name:          { min: 100, max: 280 },
  originalPrice: { min: 60,  max: 160 },
  discountPrice: { min: 60,  max: 160 },
  quantity:      { min: 40,  max: 110 },
  total:         { min: 60,  max: 160 },
  features:      { min: 200, max: 500 },
};

export const DEFAULT_COL_WIDTHS: ColWidths = {
  index:         50,
  name:          160,
  originalPrice: 110,
  discountPrice: 110,
  quantity:      70,
  total:         120,
  features:      400,
};

export const DEFAULT_COL_ALIGNS: ColAligns = {
  index:         'center',
  name:          'left',
  originalPrice: 'right',
  discountPrice: 'right',
  quantity:      'right',
  total:         'right',    // 总计默认右对齐
  features:      'left',
};

// 导出画布尺寸
export const EXPORT_WIDTH  = 2560;
export const EXPORT_HEIGHT = 1440;
export const EXPORT_SCALE  = 2;
