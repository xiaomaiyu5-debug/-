export interface Notice {
  id: string;
  title: string;
  type: 'law' | 'leak' | 'tos';
  date: string;
  priority: 'high' | 'medium' | 'low';
  link?: string;
}

// Dates simulated for Nov 2025 context
export const MOCK_NOTICES: Notice[] = [
  {
    id: '1',
    title: '《生成式人工智能服务安全基本要求》正式发布，明确语料合规新标准',
    type: 'law',
    date: '2025-11-20',
    priority: 'high'
  },
  {
    id: '2',
    title: '某知名电商平台发生 API 越权访问漏洞，建议立即排查同类接口',
    type: 'leak',
    date: '2025-11-22',
    priority: 'high'
  },
  {
    id: '3',
    title: '微信小程序隐私保护指引更新：新增"剪切板"权限调用规范',
    type: 'tos',
    date: '2025-11-21',
    priority: 'medium'
  },
  {
    id: '4',
    title: '工信部通报 2025 年第三批侵害用户权益行为的 APP 名单',
    type: 'law',
    date: '2025-11-18',
    priority: 'high'
  },
  {
    id: '5',
    title: '抖音《隐私政策》更新，调整个性化广告推荐关闭入口',
    type: 'tos',
    date: '2025-11-19',
    priority: 'low'
  },
  {
    id: '6',
    title: '《网络数据安全管理条例》实施细则征求意见稿发布',
    type: 'law',
    date: '2025-11-15',
    priority: 'high'
  },
  {
    id: '7',
    title: '快手更新《用户服务协议》，加强未成年人模式保护措施',
    type: 'tos',
    date: '2025-11-10',
    priority: 'medium'
  }
];
