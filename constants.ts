
import { MonitoringConfig } from "./types";

export const SYSTEM_INSTRUCTION_COMPLIANCE = `
你是一个世界级的"AutoGLM 隐私合规智检"引擎。你的任务是根据用户提供的操作描述或上传的文件内容，判断是否触及隐私红线。

## 核心准则
1. **适用法律**：仅基于中国现行《个人信息保护法》(PIPL)、《数据安全法》(DSL)、《网络安全法》(CSL) 及国标 GB/T 35273。
2. **多文件处理**：如果用户上传了多个文件（通常代表不同 App 的隐私政策或业务文档），请**分别**对每个文件进行独立的合规分析，不要合并结果。**输出数组的长度必须严格等于输入文件的数量**。
3. **判断逻辑**：
   - 涉及敏感个人信息（生物识别、金融账户、行踪轨迹等）未授权采集为"高风险"。
   - 违反最小必要原则为"中/高风险"。
   - 仅仅是通用操作且合规则为"低风险"。

## 输出 JSON 结构定义
必须返回一个 **JSON 数组**，数组中的每个对象对应一个分析结果：

[
  {
    "sourceName": "string", // 被分析的文件名或App名称。必须准确对应输入文件的名称。
    "hit": boolean, // true 表示触碰红线/存在风险，false 表示合规
    "article": "string", // 例如：个人信息保护法 第六条
    "quote": "string", // 条款原文，不超过30字
    "reason": "string", // 一句话解释，简明扼要
    "riskLevel": "high" | "medium" | "low",
    "风险等级": "高" | "中" | "低",
    "industryRef": {
      "consentRate": "string", // 例如：≥95%（金融类 App 行业均值）
      "maxCollect": "string", // 例如：≤5 类敏感信息
      "anonMask": "string", // 例如：IMEI 前 8 位掩码
      "retention": "string" // 例如：≤90 天
    },
    "suggest": ["string", "string", "string"] // 3条具体建议
  }
]

请确保行业参考数据 (industryRef) 看起来专业、具体，符合当前中国移动互联网合规现状。
如果用户输入的是 URL 链接，请尝试基于你已有的知识库分析该链接对应的隐私政策内容。
`;

export const MAX_FILE_SIZE_MB = 10;
export const MAX_FILE_COUNT = 5;
export const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "text/plain"
];

export const MONITORING_CONFIG: MonitoringConfig = {
  "version": "v3.0_20251123",
  "remark": "法律/泄密/条款变更三合一监测配置",
  "check_interval": {
    "law": "09:00/21:00+实时",
    "leak": "30min",
    "tos": "6h"
  },
  "apps": [
    "微信", "美团", "淘宝", "京东", "饿了么", "抖音", "QQ音乐", "小红书", "汽水音乐",
    "网易云音乐", "今日头条", "腾讯新闻", "QQ", "大众点评", "红果短剧", "同花顺",
    "携程旅行", "12306", "去哪儿", "番茄免费小说", "Keep", "高德地图", "哔哩哔哩",
    "快手", "支付宝", "芒果TV", "贝壳找房", "爱奇艺", "滴滴出行", "微博", "喜马拉雅",
    "拼多多", "肯德基"
  ],
  "policy_urls_map": {
    "微信": [
      "https://weixin.qq.com/agreement/weixin_external_links_content_management_specification",
      "https://weixin.qq.com/cgi-bin/readtemplate?lang=zh_CN&t=weixin_agreement&s=privacy",
      "https://open.weixin.qq.com/cgi-bin/frame?t=news/protocol_developer"
    ],
    "美团": [
      "https://rules-center.meituan.com/rules-detail/4",
      "https://www.meituan.com/about/privacy",
      "https://developer.meituan.com/help/doc?id=7"
    ],
    "淘宝": [
      "https://rulechannel.taobao.com/index.htm",
      "https://terms.alicdn.com/legal-agreement/terms/suit_bu1_taobao/suit_bu1_taobao201703241622_61002.html",
      "https://open.taobao.com/doc.htm?docId=108104"
    ],
    "京东": [
      "https://in.m.jd.com/help/app/private_policy.html",
      "https://open.jd.com/#/doc",
      "https://about.jd.com/privacy/"
    ],
    "饿了么": [
      "https://rulechannel.taobao.com/index.htm?type=eleme",
      "https://terms.alicdn.com/legal-agreement/terms/suit_bu1_eleme/suit_bu1_eleme202003131754_78968.html"
    ],
    "抖音": [
      "https://www.douyin.com/agreements/?id=6772506169485691648",
      "https://open.douyin.com/platform/management",
      "https://www.douyin.com/draft/douyin_agreement/"
    ],
    "QQ音乐": [
      "https://y.qq.com/m/client/intro/privacy.html",
      "https://y.qq.com/m/client/intro/service.html"
    ],
    "小红书": [
      "https://www.xiaohongshu.com/protocols/user_protocol",
      "https://www.xiaohongshu.com/protocols/privacy_policy",
      "https://school.xiaohongshu.com/rule/"
    ],
    "汽水音乐": [
      "https://www.qishui.com/privacy",
      "https://www.qishui.com/terms"
    ],
    "网易云音乐": [
      "https://music.163.com/html/m3_privacy/",
      "https://music.163.com/html/m3_agreement/"
    ],
    "今日头条": [
      "https://www.toutiao.com/privacy/",
      "https://www.toutiao.com/user_agreement/",
      "https://open.toutiao.com/platform"
    ],
    "腾讯新闻": [
      "https://news.qq.com/privacy.htm",
      "https://news.qq.com/agreement.htm"
    ],
    "QQ": [
      "https://ti.qq.com/agreement/index.html",
      "https://ti.qq.com/privacy/index.html"
    ],
    "大众点评": [
      "https://rules-center.meituan.com/rules-detail/5",
      "https://www.dianping.com/about/privacy"
    ],
    "红果短剧": [
      "https://h5.ippzone.com/privacy.html",
      "https://h5.ippzone.com/terms.html"
    ],
    "同花顺": [
      "https://cdn.10jqka.com.cn/privacy/",
      "https://cdn.10jqka.com.cn/terms/"
    ],
    "携程旅行": [
      "https://pages.ctrip.com/ctrip-rule/privacy/",
      "https://pages.ctrip.com/ctrip-rule/terms/"
    ],
    "12306": [
      "https://www.12306.cn/mormhweb/privacy_policy/",
      "https://www.12306.cn/mormhweb/terms/"
    ],
    "去哪儿": [
      "https://www.qunar.com/privacy.htm",
      "https://www.qunar.com/protocol.htm"
    ],
    "番茄免费小说": [
      "https://fanqienovel.com/privacy",
      "https://fanqienovel.com/terms"
    ],
    "Keep": [
      "https://www.gotokeep.com/privacy",
      "https://www.gotokeep.com/terms"
    ],
    "高德地图": [
      "https://lbs.amap.com/home/privacy/",
      "https://lbs.amap.com/home/terms/"
    ],
    "哔哩哔哩": [
      "https://www.bilibili.com/protocal/privacy",
      "https://www.bilibili.com/protocal/"
    ],
    "快手": [
      "https://www.kuaishou.com/privacy",
      "https://www.kuaishou.com/protocol"
    ],
    "支付宝": [
      "https://opendocs.alipay.com/rules",
      "https://render.alipay.com/p/c/k2cx0tg8",
      "https://opendocs.alipay.com/open/00rilo"
    ],
    "芒果TV": [
      "https://www.mgtv.com/privacy",
      "https://www.mgtv.com/protocol"
    ],
    "贝壳找房": [
      "https://www.ke.com/privacy/",
      "https://www.ke.com/terms/"
    ],
    "爱奇艺": [
      "https://www.iqiyi.com/privacy",
      "https://www.iqiyi.com/user_agreement"
    ],
    "滴滴出行": [
      "https://www.didiglobal.com/privacy/",
      "https://www.didiglobal.com/terms/"
    ],
    "微博": [
      "https://weibo.com/signup/v5/privacy",
      "https://weibo.com/signup/v5/protocol"
    ],
    "喜马拉雅": [
      "https://www.ximalaya.com/privacy",
      "https://www.ximalaya.com/terms"
    ],
    "拼多多": [
      "https://mobile.yangkeduo.com/privacy_policy.html",
      "https://mobile.yangkeduo.com/terms_policy.html"
    ],
    "肯德基": [
      "https://www.kfc.com.cn/privacy",
      "https://www.kfc.com.cn/terms"
    ]
  },
  "监测任务": [
    {
      "名称": "CN_Law_Watcher",
      "类型": "law_update",
      "触发": "定时09:00/21:00+关键词实时",
      "关键词池": [
        "个人信息保护法", "数据安全法", "网络安全法", "生成式AI管理办法",
        "APP违法违规收集使用个人信息行为认定方法", "个人信息出境标准合同办法",
        "人脸识别技术应用管理办法", "未成年人网络保护条例"
      ],
      "数据源": [
        "全国人大网", "工信部官网及公众号", "网信办官网及公众号",
        "国家标准委", "北上广深通管局"
      ],
      "输出模板": {}
    },
    {
      "名称": "Leak_Hot_Tracker",
      "类型": "3rd_leak",
      "触发": "每30min；阅读量/转发量>1万立即",
      "关键词": ["泄露", "脱库", "暗网", "Telegram频道", "样本数据", "用户数据", "手机号", "身份证"],
      "数据源": [
        "微博热搜榜top50", "知乎热榜top30", "百度热搜top20",
        "微信公众号新榜24h爆文", "CNNVD/CNVD"
      ],
      "输出模板": {}
    },
    {
      "名称": "ToS_Change_Monitor",
      "类型": "tos_update",
      "触发": "每6h抓取policy_urls_map内所有URL，页面哈希或关键词变化>5%",
      "输出模板": {}
    }
  ],
  "receiver_map": {
    "legal@company.com": "法务",
    "product@company.com": "产品",
    "algo@company.com": "算法",
    "security@company.com": "安全",
    "crisis@company.com": "公关"
  }
};
