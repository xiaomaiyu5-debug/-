import React from 'react';
import { ShieldCheck, Settings } from 'lucide-react';

interface HeaderProps {
  modelName: string;
  onOpenConfig: () => void;
}

const Header: React.FC<HeaderProps> = ({ modelName, onOpenConfig }) => {
  return (
    <header className="w-full py-4 flex items-center justify-between">
      {/* Left: Logo & Title */}
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-blue-50 rounded-xl">
          <ShieldCheck className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          AutoGLM合规智检
        </h1>
      </div>

      {/* Right: Model Config Button */}
      <button
        onClick={onOpenConfig}
        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50 hover:border-blue-200 transition-all duration-200 group"
      >
        <Settings size={14} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
        <span className="text-xs font-medium text-gray-600 group-hover:text-blue-600 transition-colors">
          {modelName}
        </span>
      </button>
    </header>
  );
};

export default Header;