import { Notice, MOCK_NOTICES } from '../data/mockNotices';
import { MONITORING_CONFIG } from '../constants';
import { comparePolicyChanges } from './geminiService';
import { ModelConfig } from '../types';

const RSS_URL = 'https://news.google.com/rss/search?q=隐私合规+OR+数据安全+OR+个人信息保护+OR+网络安全法&hl=zh-CN&gl=CN&ceid=CN:zh-CN';
const RSS2JSON_API = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(RSS_URL)}`;

const KEYWORDS = [
    '合规', '隐私', '数据', '安全', '法', '规', '信安', '网信', '漏洞', '泄露', 'AI', '人工智能',
    '整治', '处罚', '通报', '监管', '政策', '标准'
];

interface RSSItem {
    title: string;
    pubDate: string;
    link: string;
    guid: string;
    description: string;
}

const determineType = (title: string): Notice['type'] => {
    if (title.includes('漏') || title.includes('泄') || title.includes('攻')) return 'leak';
    if (title.includes('协议') || title.includes('政策') || title.includes('条款')) return 'tos';
    return 'law';
};

const formatDate = (dateString: string): string => {
    try {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    } catch (e) {
        return new Date().toISOString().split('T')[0];
    }
};

// Simulated old and new policy text for demonstration
const OLD_POLICY_TEXT = `
1. 我们会收集您的位置信息用于提供导航服务。
2. 我们会与第三方合作伙伴共享您的订单信息以完成配送。
3. 我们采取严格的安全措施保护您的个人信息。
`;

const NEW_POLICY_TEXT = `
1. 我们会收集您的位置信息用于提供导航服务。
2. 我们会与第三方合作伙伴共享您的订单信息以完成配送。
3. 新增：为了提供更好的个性化推荐，我们会收集您的剪切板信息。
4. 我们采取严格的安全措施保护您的个人信息。
`;

export const fetchLatestNews = async (modelConfig?: ModelConfig): Promise<Notice[]> => {
    console.log(`[${new Date().toLocaleTimeString()}] Fetching real compliance news...`);

    let notices: Notice[] = [];

    // 1. Fetch from RSS (Real)
    try {
        const response = await fetch(RSS2JSON_API);
        if (response.ok) {
            const data = await response.json();
            if (data.status === 'ok' && Array.isArray(data.items)) {
                const items: RSSItem[] = data.items;
                // Google News RSS is already filtered by query, but we can do extra filtering if needed
                const relevantItems = items;

                notices = relevantItems.map((item, index) => ({
                    id: `rss-${index}-${Date.now()}`,
                    title: item.title,
                    type: determineType(item.title),
                    date: formatDate(item.pubDate),
                    priority: 'medium',
                    link: item.link
                }));
            }
        }
    } catch (error) {
        console.error('RSS fetch failed:', error);
    }

    // 2. Simulate App Policy Monitoring (Simulated Trigger)
    // Randomly select 1-2 apps from MONITORING_CONFIG to show as "updated"
    const apps = Object.keys(MONITORING_CONFIG.policy_urls_map);
    const numUpdates = Math.floor(Math.random() * 2) + 1; // 1 or 2 updates

    for (let i = 0; i < numUpdates; i++) {
        const randomApp = apps[Math.floor(Math.random() * apps.length)];
        const urls = MONITORING_CONFIG.policy_urls_map[randomApp];
        const randomUrl = urls[Math.floor(Math.random() * urls.length)];

        const updateTypes = [
            '隐私政策更新',
            '第三方SDK列表更新',
            '个人信息收集规则变更',
            '注销流程优化'
        ];
        const updateType = updateTypes[Math.floor(Math.random() * updateTypes.length)];

        const simulatedNotice: Notice = {
            id: `app-update-${i}-${Date.now()}`,
            title: `【监测预警】${randomApp} ${updateType}，建议复核`,
            type: 'tos', // Terms of Service update
            date: new Date().toISOString().split('T')[0],
            priority: 'high',
            link: randomUrl
        };

        // Add to the top
        notices.unshift(simulatedNotice);
    }

    // 3. Simulate Monitoring Specific Sources (Simulated Trigger + Real Analysis)
    // We simulate a "hit" on one of the monitored apps occasionally
    // For demo purposes, we increase the probability if modelConfig is present
    const shouldSimulateUpdate = modelConfig?.apiKey ? Math.random() > 0.3 : false;

    if (shouldSimulateUpdate && modelConfig?.apiKey) {
        console.log('Simulating policy update detection...');
        try {
            const analysis = await comparePolicyChanges(OLD_POLICY_TEXT, NEW_POLICY_TEXT, modelConfig);

            const simulatedNotice: Notice = {
                id: `sim-${Date.now()}`,
                title: `【深度分析】微信隐私政策更新：${analysis.substring(0, 20)}...`,
                type: 'tos',
                date: new Date().toISOString().split('T')[0],
                priority: 'high',
                link: 'https://weixin.qq.com/cgi-bin/readtemplate?lang=zh_CN&t=weixin_agreement&s=privacy'
            };

            notices.unshift(simulatedNotice);
        } catch (e) {
            console.error('Simulated analysis failed:', e);
        }
    }

    // 4. Fallback / Merge
    if (notices.length === 0) {
        return [...MOCK_NOTICES];
    }

    // Ensure we have enough items
    if (notices.length < 3) {
        return [...notices, ...MOCK_NOTICES.slice(0, 3 - notices.length)];
    }

    return notices;
};
