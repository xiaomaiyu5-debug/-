
import { FileData } from '../types';

declare const pdfjsLib: any;

// Helper for safe base64 encoding of unicode strings
const utf8ToBase64 = (str: string): string => {
  return btoa(unescape(encodeURIComponent(str)));
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const processFile = async (file: File): Promise<{ base64: string; mimeType: string }> => {
  
  // 1. Handle DOCX files using Mammoth
  if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const mammoth = (window as any).mammoth;
        
        if (!mammoth) {
          reject(new Error("DOCX processing library not loaded"));
          return;
        }

        mammoth.extractRawText({ arrayBuffer: arrayBuffer })
          .then((result: any) => {
             const text = result.value || ""; 
             const base64 = utf8ToBase64(text);
             resolve({
               base64: base64,
               mimeType: 'text/plain' 
             });
          })
          .catch((err: any) => reject(new Error("Word 文档解析失败: " + err.message)));
      };
      reader.onerror = (err) => reject(err);
      reader.readAsArrayBuffer(file);
    });
  }

  // 2. Handle PDF files using PDF.js
  if (file.type === "application/pdf") {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          
          if (typeof pdfjsLib === 'undefined') {
            throw new Error("PDF processing library not loaded");
          }

          const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
          const pdf = await loadingTask.promise;
          
          let fullText = "";
          // Limit max pages to prevent browser freeze on huge PDFs
          const maxPages = Math.min(pdf.numPages, 20); 
          
          for (let i = 1; i <= maxPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item: any) => item.str).join(' ');
            fullText += pageText + "\n";
          }
          
          if (pdf.numPages > maxPages) {
            fullText += `\n... (Document too long, first ${maxPages} pages extracted) ...`;
          }

          const base64 = utf8ToBase64(fullText);
          resolve({
            base64: base64,
            mimeType: 'text/plain'
          });

        } catch (err: any) {
          reject(new Error("PDF 解析失败: " + err.message));
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsArrayBuffer(file);
    });
  }

  // 3. Handle Plain Text files
  if (file.type === "text/plain") {
     return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
          const text = e.target?.result as string;
          const base64 = utf8ToBase64(text);
          resolve({
              base64: base64,
              mimeType: 'text/plain'
          });
      };
      reader.onerror = (err) => reject(err);
      reader.readAsText(file);
     });
  }

  // 4. Fallback for others (should be filtered by input accept)
  return new Promise((resolve, reject) => {
    reject(new Error("不支持的文件格式"));
  });
};
