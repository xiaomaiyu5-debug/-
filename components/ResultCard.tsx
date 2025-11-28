
import React from 'react';
import { AlertTriangle, CheckCircle2, BookOpen, Activity, Shield, BarChart3, FileText } from 'lucide-react';
import { ComplianceResult, RiskLevel } from '../types';

interface ResultCardProps {
  result: ComplianceResult;
}

const ResultCard: React.FC<ResultCardProps> = ({ result }) => {
  const isHit = result.hit;
  
  // Risk colors configuration
  const riskConfig = {
    [RiskLevel.HIGH]: {
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      border: 'border-rose-100',
      icon: <AlertTriangle className="w-6 h-6 text-rose-600" />,
      label: '高风险'
    },
    [RiskLevel.MEDIUM]: {
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-100',
      icon: <Activity className="w-6 h-6 text-amber-600" />,
      label: '中风险'
    },
    [RiskLevel.LOW]: {
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
      icon: <CheckCircle2 className="w-6 h-6 text-emerald-600" />,
      label: '低风险'
    }
  };

  const currentRisk = riskConfig[result.riskLevel] || riskConfig[RiskLevel.LOW];

  return (
    <div className="w-full bg-white rounded-2xl shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Status Section */}
      <div className={`p-6 ${currentRisk.bg} ${currentRisk.border} border-opacity-50`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg bg-white shadow-sm ${currentRisk.color}`}>
              {currentRisk.icon}
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {isHit ? "发现风险" : "合规通过"}
            </h2>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold bg-white shadow-sm ${currentRisk.color} border border-opacity-20 border-gray-200`}>
            {result["风险等级"]}风险
          </span>
        </div>
        <p className="text-gray-600 mt-2 text-sm leading-relaxed pl-[3.25rem]">
          {result.reason}
        </p>
      </div>

      {/* Stacked Sections: Legal then Industry */}
      <div className="flex flex-col divide-y divide-gray-100 border-t border-gray-100">
        
        {/* Section 1: Legal Quote */}
        <div className="p-6 space-y-4">
          <div className="flex items-center space-x-2 mb-3">
            <BookOpen className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                法律依据
            </span>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 h-full">
            <div className="text-sm font-bold text-gray-800 mb-1">{result.article}</div>
            <div className="text-xs text-gray-500 italic font-serif">"{result.quote}"</div>
          </div>
        </div>

        {/* Section 2: Industry Benchmarks */}
        <div className="p-6 space-y-4">
          <div className="flex items-center space-x-2 mb-3">
            <BarChart3 className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">行业水位参考</span>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <BenchmarkItem label="授权同意率" value={result.industryRef.consentRate} />
            <BenchmarkItem label="最大采集量" value={result.industryRef.maxCollect} />
            <BenchmarkItem label="脱敏方式" value={result.industryRef.anonMask} />
            <BenchmarkItem label="留存期限" value={result.industryRef.retention} />
          </div>
        </div>
      </div>

      {/* Footer: Suggestions */}
      <div className="p-6 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center space-x-2 mb-4">
          <Shield className="w-4 h-4 text-gray-400" />
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">优化建议</span>
        </div>
        <ul className="space-y-3">
          {result.suggest.map((suggestion, idx) => (
            <li key={idx} className="flex items-start text-sm text-gray-600 group">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white border border-gray-200 text-gray-400 text-[10px] font-bold mr-3 flex-shrink-0 group-hover:border-blue-300 group-hover:text-blue-500 transition-colors">
                {idx + 1}
              </span>
              <span className="mt-0.5">{suggestion}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const BenchmarkItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-[10px] text-gray-400 mb-1">{label}</span>
    <span className="text-sm font-medium text-gray-700 break-words leading-snug" title={value}>{value}</span>
  </div>
);

export default ResultCard;
