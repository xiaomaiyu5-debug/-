import React, { useState, useEffect } from 'react';
import { Bell, ChevronRight, X, AlertTriangle, FileText, ShieldAlert, Check, Circle, ExternalLink } from 'lucide-react';
import { Notice } from '../data/mockNotices';
import { fetchLatestNews } from '../services/newsService';
import { ModelConfig } from '../types';

interface NoticeBarProps {
    modelConfig?: ModelConfig;
}

const NoticeBar: React.FC<NoticeBarProps> = ({ modelConfig }) => {
    const [notices, setNotices] = useState<Notice[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    // State for read status
    const [readNotices, setReadNotices] = useState<Set<string>>(new Set());
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Fetch notices on mount and every 30 minutes
    useEffect(() => {
        const loadNotices = async () => {
            try {
                const data = await fetchLatestNews(modelConfig);
                setNotices(data);
            } catch (error) {
                console.error('Failed to fetch news:', error);
            }
        };

        loadNotices();

        const intervalId = setInterval(loadNotices, 30 * 60 * 1000); // 30 minutes

        return () => clearInterval(intervalId);
    }, [modelConfig]);

    // Calculate unread count
    const unreadCount = notices.length - readNotices.size;
    const displayCount = unreadCount > 99 ? '99+' : unreadCount;

    useEffect(() => {
        if (!isHovered && notices.length > 1 && !isModalOpen) {
            const interval = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % notices.length);
            }, 4000);
            return () => clearInterval(interval);
        }
    }, [isHovered, isModalOpen, notices.length]);

    if (notices.length === 0) return null;

    const handleMarkAsRead = (id: string) => {
        const newRead = new Set(readNotices);
        newRead.add(id);
        setReadNotices(newRead);
    };

    const handleMarkAllAsRead = () => {
        const allIds = new Set(notices.map(n => n.id));
        setReadNotices(allIds);
    };

    const getTypeLabel = (type: Notice['type']) => {
        switch (type) {
            case 'law': return '法规动态';
            case 'leak': return '泄露预警';
            case 'tos': return '协议更新';
            default: return '公告';
        }
    };

    const getTypeColor = (type: Notice['type'], isRead: boolean) => {
        if (isRead) return 'bg-gray-100 text-gray-400 border-gray-200';
        switch (type) {
            case 'law': return 'bg-rose-50 text-rose-600 border-rose-100';
            case 'leak': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'tos': return 'bg-blue-50 text-blue-600 border-blue-100';
            default: return 'bg-gray-50 text-gray-600 border-gray-100';
        }
    };

    return (
        <>
            <div
                className="relative z-40 bg-white border-b border-gray-100 shadow-sm"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-10 flex items-center justify-between">

                    <div className="flex items-center flex-1 overflow-hidden">
                        <div className="flex items-center mr-4 flex-shrink-0 relative">
                            <span className="text-xs font-bold text-gray-900">合规快讯</span>
                        </div>

                        <div className="flex-1 relative h-6 overflow-hidden">
                            <div
                                className="absolute transition-all duration-500 ease-in-out flex flex-col"
                                style={{ transform: `translateY(-${currentIndex * 24}px)` }}
                            >
                                {notices.map((notice) => {
                                    const isRead = readNotices.has(notice.id);
                                    return (
                                        <div
                                            key={notice.id}
                                            className="h-6 flex items-center space-x-2 text-sm cursor-pointer group"
                                            onClick={() => {
                                                handleMarkAsRead(notice.id);
                                                if (notice.link) {
                                                    window.open(notice.link, '_blank');
                                                }
                                            }}
                                        >
                                            <span className={`px-1.5 py-0.5 text-[10px] rounded border ${getTypeColor(notice.type, isRead)}`}>
                                                {getTypeLabel(notice.type)}
                                            </span>
                                            <span className={`truncate max-w-md md:max-w-2xl lg:max-w-4xl transition-colors ${isRead
                                                ? 'text-gray-400 font-normal'
                                                : 'text-gray-900 font-bold group-hover:text-blue-600'
                                                }`}>
                                                {notice.title.length > 25 ? `${notice.title.substring(0, 25)}...` : notice.title}
                                            </span>
                                            {notice.link && (
                                                <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-all" />
                                            )}
                                            {!isRead && (
                                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-rose-100 text-rose-800 ml-2">
                                                    NEW
                                                </span>
                                            )}
                                            <span className="text-xs text-gray-400 flex-shrink-0 hidden sm:inline-block ml-2">
                                                {notice.date}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4 flex-shrink-0 ml-4">
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="text-xs text-gray-500 hover:text-blue-600 flex items-center transition-colors group"
                        >
                            查看全部
                            <div className="relative ml-2">
                                <Bell className={`w-4 h-4 ${unreadCount > 0 ? 'text-blue-600' : 'text-gray-400'}`} />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-[14px] flex items-center justify-center px-0.5 bg-rose-500 text-white text-[9px] font-bold rounded-full border border-white shadow-sm">
                                        {displayCount}
                                    </span>
                                )}
                            </div>
                            <ChevronRight className="w-3 h-3 ml-0.5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* View All Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col m-4 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <div className="flex items-center space-x-2">
                                <Bell className="w-5 h-5 text-blue-600" />
                                <h3 className="text-lg font-bold text-gray-900">合规快讯中心</h3>
                                {unreadCount > 0 && (
                                    <span className="bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full text-xs font-bold">
                                        {unreadCount} 条未读
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="text-xs text-blue-600 hover:text-blue-700 font-medium px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors flex items-center"
                                >
                                    <Check className="w-3 h-3 mr-1" />
                                    全部已读
                                </button>
                                <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
                            {notices.map((notice) => {
                                const isRead = readNotices.has(notice.id);
                                return (
                                    <div
                                        key={notice.id}
                                        onClick={() => {
                                            handleMarkAsRead(notice.id);
                                            if (notice.link) {
                                                window.open(notice.link, '_blank');
                                            }
                                        }}
                                        className={`
                                            relative p-4 rounded-xl transition-all cursor-pointer border group
                                            ${isRead
                                                ? 'bg-white border-gray-100 shadow-sm opacity-75 hover:opacity-100'
                                                : 'bg-white border-blue-100 shadow-md shadow-blue-50 hover:shadow-lg hover:border-blue-300 transform hover:-translate-y-0.5'
                                            }
                                        `}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center space-x-2">
                                                <span className={`px-2 py-0.5 text-[10px] font-medium rounded border ${getTypeColor(notice.type, isRead)}`}>
                                                    {getTypeLabel(notice.type)}
                                                </span>
                                                <span className="text-xs text-gray-400">{notice.date}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                {notice.link && (
                                                    <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                                )}
                                                {!isRead ? (
                                                    <span className="flex items-center text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full">
                                                        <Circle className="w-2 h-2 fill-current mr-1" />
                                                        未读
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center text-[10px] text-gray-400">
                                                        <Check className="w-3 h-3 mr-1" />
                                                        已读
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <h4 className={`text-sm leading-relaxed ${isRead ? 'text-gray-500 font-normal' : 'text-gray-900 font-bold'}`}>
                                            {notice.title}
                                        </h4>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default NoticeBar;
