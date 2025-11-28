
import React, { useState, useRef } from 'react';
import { Upload, X, FileText, Loader2, Library } from 'lucide-react';
import { FileData } from '../types';
import { processFile, formatFileSize } from '../utils/fileUtils';
import { MAX_FILE_SIZE_MB, MAX_FILE_COUNT, ALLOWED_FILE_TYPES } from '../constants';

interface InputAreaProps {
  text: string;
  setText: (text: string) => void;
  files: FileData[];
  setFiles: (files: FileData[]) => void;
  onAnalyze: () => void;
  onOpenLibrary: () => void; // New prop for library
  isLoading: boolean;
  modelName: string;
  onOpenConfig: () => void;
}

const InputArea: React.FC<InputAreaProps> = ({ 
  text, 
  setText, 
  files, 
  setFiles, 
  onAnalyze, 
  onOpenLibrary,
  isLoading,
  modelName,
  onOpenConfig
}) => {
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []) as File[];
    if (selectedFiles.length === 0) return;

    setError(null);

    // Check limits (unlimited count now, but keep sanity check if needed, logic removed per user request before)
    // if (files.length + selectedFiles.length > MAX_FILE_COUNT) ...

    const newFilesData: FileData[] = [];

    for (const file of selectedFiles) {
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
            setError(`文件 "${file.name}" 超过 ${MAX_FILE_SIZE_MB}MB`);
            return;
        }
        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
            setError(`文件 "${file.name}" 格式不支持`);
            return;
        }

        try {
            const { base64, mimeType } = await processFile(file);
            newFilesData.push({
                name: file.name,
                type: mimeType, 
                size: file.size,
                base64: base64
            });
        } catch (err: any) {
            setError(`文件 "${file.name}" 处理失败: ${err.message}`);
            return;
        }
    }

    setFiles([...files, ...newFilesData]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!text.trim() && files.length === 0) {
      setError('请输入问题或上传文件');
      return;
    }
    setError(null);
    onAnalyze();
  };

  return (
    <div className="relative w-full bg-white rounded-2xl shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] p-6 border border-gray-100 transition-all hover:shadow-[0_4px_12px_0_rgba(0,0,0,0.05)]">
      
      {/* Header with Model Config */}
      <div className="flex justify-end mb-2">
        <button 
          onClick={onOpenConfig}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-100 shadow-sm hover:bg-gray-100 hover:border-blue-200 transition-all duration-200 group"
        >
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-xs font-medium text-gray-500 group-hover:text-blue-600 transition-colors">
            {modelName}
          </span>
        </button>
      </div>

      {/* Text Input */}
      <div className="mb-4">
        <textarea
          className="w-full h-32 p-4 text-gray-700 placeholder-gray-400 bg-gray-50 rounded-xl border-none resize-none focus:ring-2 focus:ring-blue-100 focus:bg-white transition-colors text-base outline-none"
          placeholder="直接输入业务场景描述（例如：App 收集用户 IMEI 用于广告归因...），或上传文档进行自动检测"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={1000}
          disabled={isLoading}
        />
        <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-gray-400">{text.length}/1000 字</span>
            {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
        </div>
      </div>

      {/* File & Action Area */}
      <div className="space-y-4">
        
        {/* File List */}
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {files.map((f, idx) => (
              <div key={idx} className="flex items-center bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-sm animate-in fade-in slide-in-from-bottom-1">
                <FileText size={16} className="mr-2 flex-shrink-0" />
                <span className="truncate max-w-[150px]">{f.name}</span>
                <span className="mx-2 text-blue-400 text-xs">({formatFileSize(f.size)})</span>
                <button 
                  onClick={() => removeFile(idx)}
                  disabled={isLoading}
                  className="ml-1 p-1 hover:bg-blue-100 rounded-full transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Left Buttons: Library & Upload */}
            <div className="flex items-center space-x-3 flex-1">
                 {/* Library Button */}
                <button
                  onClick={onOpenLibrary}
                  disabled={isLoading}
                  className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-colors py-2 px-1 rounded-lg text-sm font-medium group"
                >
                  <div className="p-1.5 bg-gray-100 rounded-md group-hover:bg-blue-50 transition-colors">
                      <Library size={16} />
                  </div>
                  <span>
                    行业协议库
                  </span>
                </button>

                <div className="h-4 w-px bg-gray-200"></div>

                {/* Upload Button */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.docx,.txt"
                  multiple
                />
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-colors py-2 px-1 rounded-lg text-sm font-medium group"
                >
                  <div className="p-1.5 bg-gray-100 rounded-md group-hover:bg-blue-50 transition-colors">
                      <Upload size={16} />
                  </div>
                  <span>
                    上传文件 ({files.length})
                  </span>
                </button>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className={`w-full sm:w-auto px-8 py-3 rounded-xl font-semibold text-white transition-all flex items-center justify-center shadow-md shadow-blue-100
                ${isLoading 
                  ? 'bg-blue-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 active:transform active:scale-95'
                }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={18} />
                  <span>智检中...</span>
                </>
              ) : (
                <span>开始检测</span>
              )}
            </button>
        </div>
      </div>
    </div>
  );
};

export default InputArea;
