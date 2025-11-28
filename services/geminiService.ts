
import { SYSTEM_INSTRUCTION_COMPLIANCE } from "../constants";
import { ComplianceResult, FileData, ModelConfig } from "../types";

// Helper to extract text from base64
const decodeBase64 = (base64: string): string => {
  try {
    return decodeURIComponent(escape(atob(base64)));
  } catch (e) {
    console.error("Base64 decode error", e);
    return "";
  }
};

// Helper to parse JSON from Markdown code blocks often returned by LLMs
const parseJsonFromResponse = (text: string): any => {
  try {
    // Try direct parse
    return JSON.parse(text);
  } catch (e) {
    // Try extracting from ```json ... ```
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        return JSON.parse(jsonMatch[1]);
      } catch (e2) {
        // Continue to error
      }
    }
    // Try extracting array format if the model returned text before/after
    const arrayMatch = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (arrayMatch) {
      try {
        return JSON.parse(arrayMatch[0]);
      } catch (e3) {
        // Continue
      }
    }
    throw new Error("无法从模型返回中解析 JSON 数据，请重试");
  }
};

// Helper to clean text of invisible/control characters that might break JSON payload or Model processing
const sanitizeText = (text: string): string => {
  if (!text) return "";
  // 1. Remove null bytes and control characters (keeping newlines \n \r and tabs \t)
  let clean = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, "");
  // 2. Collapse multiple spaces/newlines to save tokens
  clean = clean.replace(/\n{3,}/g, "\n\n").replace(/[ \t]{2,}/g, " ");
  return clean;
};

// Helper to truncate content to avoid token limits
// REDUCED TO 6000 chars per file (approx 3k tokens) to prevent 500 errors on large payloads
const truncateContent = (content: string, maxLength: number = 6000): string => {
  if (content.length <= maxLength) return content;
  const half = Math.floor(maxLength / 2);
  return content.substring(0, half) + `\n\n...[内容过长，为防止超出模型上限，中间 ${content.length - maxLength} 字已省略]...\n\n` + content.substring(content.length - half);
};

export const analyzeCompliance = async (
  text: string,
  files: FileData[],
  config?: ModelConfig
): Promise<ComplianceResult[]> => {
  try {
    // Default Config for Volcano Engine (Ark) if not provided
    const baseUrl = (config?.baseUrl || 'https://ark.cn-beijing.volces.com/api/v3').replace(/\/+$/, '');
    const apiKey = config?.apiKey;
    const modelId = config?.modelId;

    if (!apiKey) {
      throw new Error("请在模型配置中填写 API Key");
    }
    if (!modelId) {
      throw new Error("请在模型配置中填写模型 ID (Endpoint ID)");
    }

    // 1. Prepare System Message
    const messages = [
      {
        role: "system",
        content: SYSTEM_INSTRUCTION_COMPLIANCE
      }
    ];

    // 2. Prepare User Message (Combine text + file contents)
    let userContent = "";

    // Add Files Content
    if (files.length > 0) {
      userContent += `【待检测文件列表】\n`;
      files.forEach((file, index) => {
        if (file.type === 'text/plain') {
          let fileText = decodeBase64(file.base64);
          fileText = sanitizeText(fileText); // Sanitize control chars
          fileText = truncateContent(fileText); // Truncate strict limit

          // Double check text isn't empty after cleaning
          if (!fileText.trim()) {
            userContent += `\n--- 文件 ${index + 1}: ${file.name} ---\n(文件内容解析为空)\n----------------\n`;
          } else {
            userContent += `\n--- 文件 ${index + 1}: ${file.name} ---\n${fileText}\n----------------\n`;
          }
        } else {
          userContent += `\n--- 文件 ${index + 1}: ${file.name} ---\n(非文本文件，暂不支持内容解析，请仅参考文件名)\n`;
        }
      });
      userContent += `\n本次请求共包含 ${files.length} 个文件，请严格按照系统指令要求，输出包含 ${files.length} 个结果的 JSON 数组。\n\n`;
    }

    // Add User Text
    userContent += `【用户补充描述】\n${sanitizeText(text) || "无"}`;

    messages.push({
      role: "user",
      content: userContent
    });

    // Retry Logic for 500 Errors
    let retries = 1;
    let lastError: any = null;

    while (retries >= 0) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000); // 90s timeout for safer processing

      try {
        const response = await fetch(`${baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: modelId,
            messages: messages,
            temperature: 0.1, // Lower temp for more stable JSON
            stream: false
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errText = await response.text();
          let errMessage = `API 请求失败 (${response.status})`;

          // Try parsing JSON error
          try {
            const errJson = JSON.parse(errText);
            if (errJson.error?.message) {
              errMessage = `API 错误: ${errJson.error.message}`;
            }
          } catch (e) { }

          // Check for 500 Internal Server Error for retry
          if (response.status >= 500 && retries > 0) {
            console.warn(`Encountered ${response.status}, retrying...`);
            retries--;
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s before retry
            continue;
          }

          if (response.status === 500) {
            throw new Error("服务器内部错误 (500)。这通常是因为上传的文件内容过长或包含了特殊字符。请尝试减少文件数量或上传更小的文件。");
          }

          throw new Error(errMessage);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (!content) {
          throw new Error("模型返回内容为空");
        }

        // 4. Parse Result
        const result = parseJsonFromResponse(content) as ComplianceResult[];

        // Basic Validation
        if (!Array.isArray(result)) {
          throw new Error("模型返回格式错误: 需要 JSON 数组");
        }

        // Validate length match
        if (files.length > 0 && result.length !== files.length) {
          console.warn(`Warning: Expected ${files.length} results but got ${result.length}`);
          // We allow it, but log warning
        }

        return result;

      } catch (fetchError: any) {
        clearTimeout(timeoutId);

        if (fetchError.name === 'AbortError') {
          throw new Error("请求超时，请检查网络或减少文件数量");
        }

        if (fetchError.message === 'Failed to fetch') {
          throw new Error("网络请求失败。请检查：1. API 地址是否正确（需要 https）；2. 是否存在跨域限制；3. 网络连接是否正常。");
        }

        lastError = fetchError;
        // Only retry on specific network glitches if needed, but usually we break unless it's a 500 caught above
        break;
      }
    }

    throw lastError || new Error("未知错误");

  } catch (error: any) {
    console.error("Compliance analysis failed:", error);
    throw new Error(error.message || "检测过程发生未知错误");
  }
};

export const comparePolicyChanges = async (
  oldText: string,
  newText: string,
  config?: ModelConfig
): Promise<string> => {
  try {
    const baseUrl = (config?.baseUrl || 'https://ark.cn-beijing.volces.com/api/v3').replace(/\/+$/, '');
    const apiKey = config?.apiKey;
    const modelId = config?.modelId;

    if (!apiKey || !modelId) {
      throw new Error("请先配置模型 API Key 和 Endpoint ID");
    }

    const prompt = `
你是一个专业的法律合规专家。请对比以下两份隐私政策文本（旧版本 vs 新版本），并重点分析以下两点变化：
1. **第三方操作限制**：是否有新的限制或放宽？
2. **用户隐私保护**：保护措施是加强了还是减弱了？

【旧版本片段】
${oldText.substring(0, 2000)}...

【新版本片段】
${newText.substring(0, 2000)}...

请输出一段简短的分析报告（200字以内），直接指出核心变化，无需客套话。
`;

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: modelId,
        messages: [
          { role: 'system', content: '你是一个专业的隐私合规分析师。' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`API 请求失败: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "无法生成对比分析";

  } catch (error: any) {
    console.error("Policy comparison failed:", error);
    return "对比分析失败，请检查网络或模型配置。";
  }
};
