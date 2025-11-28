import React from 'react';
import { ExternalLink, Activity, FileText, BookOpen, Bell, ArrowRight } from 'lucide-react';
import { MONITORING_CONFIG } from '../constants';

interface AgreementLibraryProps {
    onSelectApp: (appName: string, urls: string[]) => void;
    onOpenLibrary: () => void;
    policyUrls: Record<string, string[]>;
}

const AgreementLibrary: React.FC<AgreementLibraryProps> = ({ onSelectApp, onOpenLibrary, policyUrls }) => {
    return (
        <section className="py-8 bg-white border-t border-gray-100 overflow-hidden">
            <style>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    animation: marquee 60s linear infinite;
                }
                .animate-marquee:hover {
                    animation-play-state: paused;
                }
            `}</style>
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                            <BookOpen className="w-6 h-6 mr-3 text-blue-600" />
                            行业协议库与合规监测
                        </h2>
                        <p className="mt-2 text-gray-500 max-w-2xl">
                            实时追踪 {MONITORING_CONFIG.apps.length}+ 头部应用隐私政策变更，覆盖 {Object.keys(MONITORING_CONFIG.check_interval).length} 类合规监测维度
                        </p>
                    </div>
                </div>


                {/* Always-on Carousel */}
                <div className="w-full overflow-hidden py-4 relative group">
                    <div className="flex animate-marquee w-max">
                        {/* Duplicate list for seamless loop */}
                        {[...MONITORING_CONFIG.apps, ...MONITORING_CONFIG.apps].map((app, index) => (
                            <button
                                key={`${app}-${index}`}
                                onClick={() => onSelectApp(app, policyUrls[app] || [])}
                                className="flex flex-col items-center justify-center p-4 mx-2 w-32 h-32 bg-gray-50 rounded-xl border border-transparent hover:bg-white hover:border-blue-200 hover:shadow-md transition-all group/item text-center flex-shrink-0"
                            >
                                <div className="w-10 h-10 mb-3 rounded-full bg-white shadow-sm flex items-center justify-center text-sm font-bold text-gray-500 group-hover/item:text-blue-600 group-hover/item:scale-110 transition-all">
                                    {app.substring(0, 1)}
                                </div>
                                <h4 className="text-sm font-medium text-gray-900 group-hover/item:text-blue-700 truncate w-full px-2">{app}</h4>
                                <div className="mt-2 flex items-center text-[10px] text-gray-400 group-hover/item:text-blue-400 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                    <span>查看协议</span>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Gradient Masks */}
                    <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
                    <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>
                </div>

                <div className="mt-6 text-center">
                    <button
                        onClick={onOpenLibrary}
                        className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 font-medium transition-colors"
                    >
                        查看全部 {MONITORING_CONFIG.apps.length} 款应用 <ArrowRight className="w-4 h-4 ml-1" />
                    </button>
                </div>

            </div>
        </section>
    );
};

export default AgreementLibrary;
