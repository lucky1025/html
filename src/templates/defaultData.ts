import type { QuoteData, ColWidths } from '../types';

export const DEFAULT_QUOTE_DATA: QuoteData = {
  title: '报价单',
  company: '上海哈克雷斯新能源汽车有限公司',
  currency: '¥',
  rows: [
    {
      id: '1',
      name: '<strong>Ding Talk A1</strong>',
      originalPrice: '799',
      discountPrice: '769',
      quantity: '5',
      total: '3845',
      features: '5-8 米超长录音距离、超长待机 60 天、连续录音 12 天、上百种文档模板、自助生成会议纪要待办事项无需手动记录。支持多种语言实时翻译，有效解决沟通问题。',
    },
    {
      id: '2',
      name: '<u>悟空会员</u>',
      originalPrice: '99',
      discountPrice: '99',
      quantity: '5',
      total: '495',
      features: '新时代电脑办公助手，输入指令自动为您做事情。',
    },
    {
      id: '3',
      name: '<span style="text-decoration:underline">上门服务包</span>',
      originalPrice: '980',
      discountPrice: '550',
      quantity: '1',
      total: '550',
      features: '<span style="color:#f59e0b">上门解决企业流程搭建相关问题</span>',
    },
    {
      id: '4',
      name: '审批流系统搭建',
      originalPrice: '1800',
      discountPrice: '0',
      quantity: '1',
      total: '0',
      features: '购买上门服务包和 A1 以后，免费帮助创建审批流。',
    },
  ],
  footerNote: '感谢您的信任与支持！如有任何疑问，请随时联系我们。',
};

export const DEFAULT_COL_WIDTHS_INIT: ColWidths = {
  index:         50,
  name:          160,
  originalPrice: 110,
  discountPrice: 110,
  quantity:      70,
  total:         120,
  features:      400,
};
