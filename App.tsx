
import React, { useState } from 'react';
import { ArrowLeft, FileText, ShieldAlert, ShieldCheck, Shield, Loader2, Settings, X } from 'lucide-react';
import Header from './components/Header';
import InputArea from './components/InputArea';
import ResultCard from './components/ResultCard';
import PolicyLibraryModal from './components/PolicyLibraryModal';
import NoticeBar from './components/NoticeBar';
import AgreementLibrary from './components/AgreementLibrary';
import { MAX_FILE_SIZE_MB, MAX_FILE_COUNT, ALLOWED_FILE_TYPES, MONITORING_CONFIG } from './constants';
import { ComplianceResult, FileData, RiskLevel, ModelConfig } from './types';
import { analyzeCompliance } from './services/geminiService';

const LoadingView = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center animate-in fade-in duration-700">
    <div className="relative mb-10">
      {/* Pulsing Background */}
      <div className="absolute inset-0 bg-blue-50 rounded-full animate-ping opacity-75"></div>

      {/* Rotating Rings */}
      <div className="relative w-32 h-32">
        <div className="absolute inset-0 border-4 border-blue-100 rounded-full animate-[spin_3s_linear_infinite]"></div>
        <div className="absolute inset-0 border-4 border-transparent border-t-blue-600 rounded-full animate-[spin_1.5s_linear_infinite]"></div>

        {/* Central Shield */}
        <div className="absolute inset-0 flex items-center justify-center">
          <ShieldCheck className="w-12 h-12 text-blue-600" />
        </div>
      </div>
    </div>

    <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-3">
      隐私合规深度智检中
    </h2>
    <div className="flex items-center space-x-2 text-gray-500 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
      <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
      <span className="text-sm">正在解析文件内容并对比 PIPL 法规...</span>
    </div>
  </div>
);

const ConfigModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  config: ModelConfig;
  onSave: (cfg: ModelConfig) => void;
}> = ({ isOpen, onClose, config, onSave }) => {
  const [localConfig, setLocalConfig] = useState<ModelConfig>(config);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 m-4 scale-100 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900 flex items-center">
            <Settings className="w-5 h-5 mr-2 text-blue-600" />
            模型配置
          </h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">模型名称</label>
            <input
              type="text"
              value={localConfig.modelName}
              onChange={e => setLocalConfig({ ...localConfig, modelName: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
              placeholder="例如：Doubao-Pro"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">模型 ID (Endpoint ID)</label>
            <input
              type="text"
              value={localConfig.modelId}
              onChange={e => setLocalConfig({ ...localConfig, modelId: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm font-mono"
              placeholder="例如：ep-20240604..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">API Key</label>
            <input
              type="password"
              value={localConfig.apiKey}
              onChange={e => setLocalConfig({ ...localConfig, apiKey: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm font-mono"
              placeholder="请输入火山引擎 API Key"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">API Base URL</label>
            <input
              type="text"
              value={localConfig.baseUrl}
              onChange={e => setLocalConfig({ ...localConfig, baseUrl: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm font-mono"
              placeholder="默认: https://ark.cn-beijing.volces.com/api/v3"
            />
            <p className="mt-1 text-xs text-amber-600 bg-amber-50 p-2 rounded">
              注意：如遇 "Failed to fetch"，通常是因为浏览器跨域限制。请确保您的 API 代理服务支持跨域，或在后端转发请求。
            </p>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={() => { onSave(localConfig); onClose(); }}
            className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl shadow-md shadow-blue-200 hover:bg-blue-700 hover:shadow-lg transition-all active:scale-95"
          >
            保存配置
          </button>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  // Config State - Defaulting to Volcano Engine Settings
  const [modelConfig, setModelConfig] = useState<ModelConfig>({
    modelName: 'AutoGLM',
    modelId: '', // User must input this
    apiKey: '', // User must input this
    baseUrl: 'https://ark.cn-beijing.volces.com/api/v3'
  });
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  // Lifted state for persistence
  const [inputText, setInputText] = useState('');
  const [inputFiles, setInputFiles] = useState<FileData[]>([]);
  const [policyUrls, setPolicyUrls] = useState<Record<string, string[]>>(MONITORING_CONFIG.policy_urls_map);

  const [results, setResults] = useState<ComplianceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'input' | 'result'>('input');
  const [activeIndex, setActiveIndex] = useState(0);

  const handleAnalyze = async () => {
    if (!modelConfig.apiKey || !modelConfig.modelId) {
      setIsConfigOpen(true);
      setError("请先配置模型 API Key 和 Endpoint ID");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await analyzeCompliance(inputText, inputFiles, modelConfig);
      setResults(data);
      setActiveIndex(0);
      setView('result');
    } catch (err: any) {
      setError(err.message || "合规检测服务暂时不可用");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setView('input');
    // We deliberately do NOT clear inputText or inputFiles here
    setResults([]);
    setActiveIndex(0);
  };

  const handleSelectAppFromLibrary = (appName: string, urls: string[]) => {
    setIsLibraryOpen(false);
    const urlsText = urls.map(u => `• ${u}`).join('\n');
    const newText = `请对【${appName}】进行全方位隐私合规检测。\n\n参考官方协议链接：\n${urlsText}\n\n请重点关注：\n1. 是否存在超范围收集（如位置、通讯录）\n2. 隐私政策是否清晰易读\n3. 是否有严重的已知合规漏洞`;

    // Append to existing text or replace? Replace is cleaner for this specific action.
    setInputText(newText);
    // Optional: scroll to top or focus?
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdatePolicyUrls = (appName: string, newUrls: string[]) => {
    setPolicyUrls(prev => ({
      ...prev,
      [appName]: newUrls
    }));
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans pb-20 selection:bg-blue-100 selection:text-blue-900 relative">

      {/* Config Modal */}
      <ConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        config={modelConfig}
        onSave={setModelConfig}
      />

      {/* Library Modal */}
      <PolicyLibraryModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onSelectApp={handleSelectAppFromLibrary}
        policyUrls={policyUrls}
        onUpdatePolicyUrls={handleUpdatePolicyUrls}
      />

      {/* Notice Bar */}
      <NoticeBar modelConfig={modelConfig} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-2">

        <Header
          modelName={modelConfig.modelName}
          onOpenConfig={() => setIsConfigOpen(true)}
        />

        <main className="space-y-8">

          {/* INPUT VIEW */}
          {view === 'input' && !loading && (
            <section className="relative z-10 animate-in fade-in slide-in-from-left-4 duration-300">
              <InputArea
                text={inputText}
                setText={setInputText}
                files={inputFiles}
                setFiles={setInputFiles}
                onAnalyze={handleAnalyze}
                onOpenLibrary={() => setIsLibraryOpen(true)}
                isLoading={loading}
                modelName={modelConfig.modelName}
                onOpenConfig={() => setIsConfigOpen(true)}
              />

              {/* Error Message */}
              {error && (
                <div className="mt-4 p-4 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm text-center animate-in fade-in">
                  {error}
                </div>
              )}
            </section>
          )}

          {/* LOADING VIEW */}
          {loading && (
            <LoadingView />
          )}

          {/* RESULT VIEW */}
          {view === 'result' && !loading && results.length > 0 && (
            <section className="w-full animate-in fade-in slide-in-from-right-4 duration-300">

              {/* Top Navigation Bar */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={handleBack}
                  className="flex items-center text-gray-500 hover:text-gray-900 transition-colors text-sm font-medium"
                >
                  <ArrowLeft size={16} className="mr-1" />
                  返回检测页
                </button>
                <span className="text-xs font-semibold text-gray-400 uppercase">
                  共检测 {results.length} 个对象
                </span>
              </div>

              {/* Horizontal Tabs for Apps/Files */}
              {results.length > 0 && (
                <div className="flex overflow-x-auto gap-3 pb-4 mb-2 no-scrollbar snap-x">
                  {results.map((result, index) => {
                    const isActive = activeIndex === index;
                    const isHighRisk = result.riskLevel === RiskLevel.HIGH;
                    const isMediumRisk = result.riskLevel === RiskLevel.MEDIUM;

                    let Icon = ShieldCheck;
                    let iconColor = "text-emerald-500";
                    if (isHighRisk) { Icon = ShieldAlert; iconColor = "text-rose-500"; }
                    else if (isMediumRisk) { Icon = Shield; iconColor = "text-amber-500"; }

                    return (
                      <button
                        key={index}
                        onClick={() => setActiveIndex(index)}
                        className={`
                          relative flex items-center flex-shrink-0 px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200 snap-center
                          ${isActive
                            ? 'bg-white border-gray-200 shadow-[0_2px_8px_0_rgba(0,0,0,0.08)] text-gray-900 scale-100'
                            : 'bg-gray-50 border-transparent text-gray-500 hover:bg-gray-100 scale-95'
                          }
                        `}
                      >
                        <Icon className={`w-4 h-4 mr-2 ${isActive ? iconColor : 'text-gray-400'}`} />
                        <span className="truncate max-w-[120px]">{result.sourceName || `检测对象 ${index + 1}`}</span>

                        {isActive && (
                          <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-1.5 h-1.5 bg-gray-800 rounded-full opacity-0"></span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Active Result Card */}
              <div key={activeIndex}>
                <ResultCard result={results[activeIndex]} />
              </div>

            </section>
          )}
        </main>
      </div>

      {/* Agreement Library Section - Only show in Input View */}
      {view === 'input' && !loading && (
        <div className="mt-12 animate-in fade-in slide-in-from-bottom-8 duration-500 delay-100">
          <AgreementLibrary
            onSelectApp={handleSelectAppFromLibrary}
            onOpenLibrary={() => setIsLibraryOpen(true)}
            policyUrls={policyUrls}
          />
        </div>
      )}

      <footer className="mt-16 pb-8 text-center space-y-2">
        <p className="text-sm text-gray-500">
          基于中国《个人信息保护法》与 GB/T 35273 标准的行业级合规检测引擎
        </p>
        <p className="text-xs text-gray-300">
          © 2024 Privacy Compliance Guard. 仅供参考，不构成最终法律意见。
        </p>
      </footer>
    </div>
  );
};

export default App;
