
import React, { useState } from 'react';
import { X, Search, BookOpen, ExternalLink, Activity, Eye, FileText, Bell, Pencil, Trash2, Plus, Save } from 'lucide-react';
import { MONITORING_CONFIG } from '../constants';

interface PolicyLibraryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectApp: (appName: string, urls: string[]) => void;
    policyUrls: Record<string, string[]>;
    onUpdatePolicyUrls: (appName: string, newUrls: string[]) => void;
}

const PolicyLibraryModal: React.FC<PolicyLibraryModalProps> = ({ isOpen, onClose, onSelectApp, policyUrls, onUpdatePolicyUrls }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'apps' | 'monitor'>('apps');
    const [editingApp, setEditingApp] = useState<string | null>(null);
    const [editUrls, setEditUrls] = useState<string[]>([]);
    const [newUrlInput, setNewUrlInput] = useState('');

    if (!isOpen) return null;

    const filteredApps = MONITORING_CONFIG.apps.filter(app =>
        app.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleEditClick = (e: React.MouseEvent, app: string) => {
        e.stopPropagation();
        setEditingApp(app);
        setEditUrls([...(policyUrls[app] || [])]);
        setNewUrlInput('');
    };

    const handleAddUrl = () => {
        if (newUrlInput.trim()) {
            setEditUrls([...editUrls, newUrlInput.trim()]);
            setNewUrlInput('');
        }
    };

    const handleDeleteUrl = (index: number) => {
        const newUrls = [...editUrls];
        newUrls.splice(index, 1);
        setEditUrls(newUrls);
    };

    const handleSaveEdit = () => {
        if (editingApp) {
            onUpdatePolicyUrls(editingApp, editUrls);
            setEditingApp(null);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col m-4 overflow-hidden animate-in zoom-in-95 duration-200 relative">

                {/* Edit Overlay */}
                {editingApp && (
                    <div className="absolute inset-0 z-10 bg-white flex flex-col animate-in slide-in-from-right duration-200">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center">
                                <Pencil className="w-5 h-5 mr-2 text-blue-600" />
                                编辑监测链接 - {editingApp}
                            </h3>
                            <button onClick={() => setEditingApp(null)} className="p-2 rounded-full hover:bg-gray-200 text-gray-500 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            <div className="space-y-3">
                                {editUrls.map((url, index) => (
                                    <div key={index} className="flex items-center space-x-2 group">
                                        <div className="flex-1 p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-600 break-all font-mono">
                                            {url}
                                        </div>
                                        <button
                                            onClick={() => handleDeleteUrl(index)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="删除链接"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))}
                                {editUrls.length === 0 && (
                                    <div className="text-center py-8 text-gray-400 text-sm">
                                        暂无监测链接，请添加
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 border-t border-gray-100">
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">添加新链接</label>
                                <div className="flex space-x-2">
                                    <input
                                        type="text"
                                        value={newUrlInput}
                                        onChange={(e) => setNewUrlInput(e.target.value)}
                                        placeholder="输入以 https:// 开头的协议链接"
                                        className="flex-1 px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddUrl()}
                                    />
                                    <button
                                        onClick={handleAddUrl}
                                        disabled={!newUrlInput.trim()}
                                        className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                                    >
                                        <Plus size={18} className="mr-1" /> 添加
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3">
                            <button
                                onClick={() => setEditingApp(null)}
                                className="px-5 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-xl transition-colors"
                            >
                                取消
                            </button>
                            <button
                                onClick={handleSaveEdit}
                                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-xl shadow-md hover:bg-blue-700 hover:shadow-lg transition-all flex items-center"
                            >
                                <Save size={18} className="mr-2" />
                                保存更改
                            </button>
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center space-x-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <BookOpen className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">行业合规协议库</h3>
                            <p className="text-xs text-gray-500">版本: {MONITORING_CONFIG.version} | {MONITORING_CONFIG.remark}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Tabs & Search */}
                <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setActiveTab('apps')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'apps' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            App 协议库
                        </button>
                        <button
                            onClick={() => setActiveTab('monitor')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'monitor' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            合规监控看板
                        </button>
                    </div>

                    {activeTab === 'apps' && (
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="搜索 App..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                            />
                        </div>
                    )}
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">

                    {/* APP LIST VIEW */}
                    {activeTab === 'apps' && (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {filteredApps.map((app) => (
                                <div
                                    key={app}
                                    className="flex flex-col items-start p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group text-left relative"
                                >
                                    <div className="flex items-center justify-between w-full mb-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-lg font-bold text-gray-500 group-hover:from-blue-100 group-hover:to-blue-200 group-hover:text-blue-600 transition-colors">
                                            {app.substring(0, 1)}
                                        </div>
                                        <button
                                            onClick={(e) => handleEditClick(e, app)}
                                            className="p-1.5 rounded-lg text-gray-300 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                            title="编辑监测链接"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <h4 className="text-gray-900 font-bold mb-1 group-hover:text-blue-700">{app}</h4>
                                    <p className="text-xs text-gray-500 line-clamp-1">
                                        包含 {(policyUrls[app] || []).length} 份监测协议
                                    </p>
                                </div>
                            ))}
                            {filteredApps.length === 0 && (
                                <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400">
                                    <Search className="w-12 h-12 mb-4 opacity-20" />
                                    <p>未找到匹配的 App</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* MONITOR DASHBOARD VIEW */}
                    {activeTab === 'monitor' && (
                        <div className="space-y-6">
                            {/* Top Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {MONITORING_CONFIG.监测任务.map((task, idx) => {
                                    let icon = <BookOpen className="w-6 h-6 text-indigo-600" />;
                                    let bg = "bg-indigo-50";
                                    if (task.类型 === '3rd_leak') { icon = <Activity className="w-6 h-6 text-rose-600" />; bg = "bg-rose-50"; }
                                    if (task.类型 === 'tos_update') { icon = <FileText className="w-6 h-6 text-amber-600" />; bg = "bg-amber-50"; }

                                    return (
                                        <div key={idx} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-start space-x-4">
                                            <div className={`p-3 rounded-lg ${bg} flex-shrink-0`}>
                                                {icon}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900">{task.名称}</h4>
                                                <div className="text-xs text-gray-500 mt-1 flex items-center">
                                                    <Bell className="w-3 h-3 mr-1" />
                                                    {task.触发}
                                                </div>
                                                <div className="mt-2 flex flex-wrap gap-1">
                                                    {task.数据源?.slice(0, 2).map((src, i) => (
                                                        <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] rounded-full">{src}</span>
                                                    ))}
                                                    {task.数据源 && task.数据源.length > 2 && <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] rounded-full">+{task.数据源.length - 2}</span>}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Check Interval */}
                            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                                <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                                    <Eye className="w-5 h-5 mr-2 text-blue-600" />
                                    实时监测频率配置
                                </h4>
                                <div className="grid grid-cols-3 gap-6">
                                    {Object.entries(MONITORING_CONFIG.check_interval).map(([key, val]) => (
                                        <div key={key} className="flex flex-col">
                                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{key} Check</span>
                                            <span className="text-lg font-mono font-medium text-gray-800">{val}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Receiver Map */}
                            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                                <h4 className="font-bold text-gray-900 mb-4">预警接收人映射</h4>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                                    {Object.entries(MONITORING_CONFIG.receiver_map).map(([email, role]) => (
                                        <div key={email} className="p-3 bg-gray-50 rounded-lg">
                                            <div className="text-sm font-bold text-gray-900">{role}</div>
                                            <div className="text-xs text-gray-500 truncate" title={email}>{email}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PolicyLibraryModal;
