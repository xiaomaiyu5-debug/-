
export enum RiskLevel {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

export interface IndustryRef {
  consentRate: string;
  maxCollect: string;
  anonMask: string;
  retention: string;
}

export interface ComplianceResult {
  sourceName: string; // Name of the file or App analyzed
  hit: boolean;
  article: string;
  quote: string;
  reason: string;
  riskLevel: RiskLevel;
  "风险等级": string; // Mapping for Chinese display
  industryRef: IndustryRef;
  suggest: string[];
}

export interface FileData {
  name: string;
  type: string;
  base64: string;
  size: number;
}

export interface ModelConfig {
  modelName: string;
  modelId: string;
  apiKey: string;
  baseUrl: string;
}

// --- Monitoring Config Types ---

export interface MonitorTask {
  名称: string;
  类型: string;
  触发: string;
  关键词?: string[];
  关键词池?: string[];
  数据源?: string[];
  输出模板: any;
}

export interface MonitoringConfig {
  version: string;
  remark: string;
  check_interval: Record<string, string>;
  apps: string[];
  policy_urls_map: Record<string, string[]>;
  监测任务: MonitorTask[];
  receiver_map: Record<string, string>;
}
