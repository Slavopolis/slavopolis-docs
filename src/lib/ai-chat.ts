// AI聊天相关的类型定义和工具函数

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  reasoning_content?: string; // 推理模型的思维链内容
  timestamp: number;
  model?: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    prompt_cache_hit_tokens?: number;
    prompt_cache_miss_tokens?: number;
  };
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
  settings: ChatSettings;
}

export interface ChatSettings {
  model: 'deepseek-chat' | 'deepseek-reasoner';
  temperature: number;
  maxTokens: number;
  systemMessage: string;
  apiKey?: string; // 添加API密钥字段
}

export const DEFAULT_CHAT_SETTINGS: ChatSettings = {
  model: 'deepseek-chat',
  temperature: 1.3,
  maxTokens: 4096,
  systemMessage: '你是一位拥有20+年实战经验的资深全栈架构师，精通多种编程语言和技术栈，能够提供专业的技术咨询和代码实现。请用中文回答。',
};

export const MODEL_CONFIGS = {
  'deepseek-chat': {
    name: 'DeepSeek-V3',
    description: '强大的通用对话模型',
    maxTokens: 8192,
    supportReasoning: false,
  },
  'deepseek-reasoner': {
    name: 'DeepSeek-R1',
    description: '具备推理能力的模型',
    maxTokens: 8192,
    supportReasoning: true,
  },
};

export const TEMPERATURE_PRESETS = {
  code: { value: 0.1, label: '代码生成', description: '精确、确定性的输出' },
  analysis: { value: 0.8, label: '数据分析', description: '平衡的分析能力' },
  chat: { value: 1.3, label: '通用对话', description: '自然的对话体验' },
  translation: { value: 0.3, label: '翻译', description: '准确的翻译质量' },
  creative: { value: 1.5, label: '创意写作', description: '富有创意的输出' },
};

// DeepSeek API配置
export const DEEPSEEK_API_CONFIG = {
  baseURL: 'https://api.deepseek.com',
  chatEndpoint: '/chat/completions',
  balanceEndpoint: '/user/balance',
};

// API密钥管理
export class ApiKeyManager {
  private static readonly API_KEY_STORAGE_KEY = 'deepseek-api-key';

  static getApiKey(): string | null {
    try {
      return localStorage.getItem(this.API_KEY_STORAGE_KEY);
    } catch {
      return null;
    }
  }

  static setApiKey(apiKey: string): void {
    try {
      localStorage.setItem(this.API_KEY_STORAGE_KEY, apiKey);
    } catch (error) {
      console.error('Failed to save API key:', error);
    }
  }

  static removeApiKey(): void {
    try {
      localStorage.removeItem(this.API_KEY_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to remove API key:', error);
    }
  }
}

// 生成唯一ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// 生成会话标题
export function generateSessionTitle(firstMessage: string): string {
  const title = firstMessage.trim().slice(0, 30);
  return title + (firstMessage.length > 30 ? '...' : '');
}

// 存储管理
export class ChatStorage {
  private static readonly SESSIONS_KEY = 'ai-chat-sessions';
  private static readonly CURRENT_SESSION_KEY = 'ai-chat-current-session';

  static getSessions(): ChatSession[] {
    try {
      const sessions = localStorage.getItem(this.SESSIONS_KEY);
      return sessions ? JSON.parse(sessions) : [];
    } catch {
      return [];
    }
  }

  static saveSession(session: ChatSession): void {
    try {
      const sessions = this.getSessions();
      const index = sessions.findIndex(s => s.id === session.id);
      
      if (index >= 0) {
        sessions[index] = { ...session, updatedAt: Date.now() };
      } else {
        sessions.unshift(session);
      }

      // 保持最多50个会话
      if (sessions.length > 50) {
        sessions.splice(50);
      }

      localStorage.setItem(this.SESSIONS_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  }

  static deleteSession(sessionId: string): void {
    try {
      const sessions = this.getSessions().filter(s => s.id !== sessionId);
      localStorage.setItem(this.SESSIONS_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  }

  static getCurrentSessionId(): string | null {
    try {
      return localStorage.getItem(this.CURRENT_SESSION_KEY);
    } catch {
      return null;
    }
  }

  static setCurrentSessionId(sessionId: string): void {
    try {
      localStorage.setItem(this.CURRENT_SESSION_KEY, sessionId);
    } catch (error) {
      console.error('Failed to set current session:', error);
    }
  }
}

// 流式聊天API调用
export async function streamChat(
  messages: ChatMessage[],
  settings: ChatSettings,
  onChunk: (chunk: string, reasoning?: string) => void,
  onComplete: (message: ChatMessage) => void,
  onError: (error: string) => void,
  signal?: AbortSignal
): Promise<void> {
  try {
    // 获取API密钥
    const apiKey = settings.apiKey || ApiKeyManager.getApiKey();
    if (!apiKey) {
      throw new Error('API密钥未配置，请在设置中添加DeepSeek API密钥');
    }

    // 构建API消息格式
    const apiMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));

    // 添加系统消息
    if (settings.systemMessage && apiMessages[0]?.role !== 'system') {
      apiMessages.unshift({
        role: 'system',
        content: settings.systemMessage,
      });
    }

    // 构建请求选项，直接请求DeepSeek API
    const requestOptions: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        messages: apiMessages,
        model: settings.model,
        stream: true,
        temperature: settings.temperature,
        max_tokens: settings.maxTokens,
      }),
    };

    // 只有当signal存在时才添加
    if (signal) {
      requestOptions.signal = signal;
    }

    // 直接请求DeepSeek API
    const response = await fetch(`${DEEPSEEK_API_CONFIG.baseURL}${DEEPSEEK_API_CONFIG.chatEndpoint}`, requestOptions);

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error?.message || errorData.error || errorMessage;
      } catch {
        // 如果无法解析错误响应，使用默认错误信息
      }
      throw new Error(errorMessage);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Failed to get response reader');
    }

    let content = '';
    let reasoningContent = '';
    let usage: ChatMessage['usage'];

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              // 流结束
              const message: ChatMessage = {
                id: generateId(),
                role: 'assistant',
                content,
                timestamp: Date.now(),
                model: settings.model,
              };

              // 只有当reasoning_content不为空时才添加
              if (reasoningContent) {
                message.reasoning_content = reasoningContent;
              }

              // 只有当usage存在时才添加
              if (usage) {
                message.usage = usage;
              }

              onComplete(message);
              return;
            }

            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta;
              
              if (delta) {
                // 处理常规内容
                if (delta.content) {
                  content += delta.content;
                  onChunk(delta.content);
                }
                
                // 处理推理内容 (仅deepseek-reasoner模型)
                if (delta.reasoning_content) {
                  reasoningContent += delta.reasoning_content;
                  onChunk('', delta.reasoning_content);
                }
              }

              // 获取使用统计
              if (parsed.usage) {
                usage = parsed.usage;
              }

            } catch (parseError) {
              console.warn('Failed to parse SSE data:', data);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

  } catch (error) {
    if (error instanceof Error) {
      onError(error.message);
    } else {
      onError('Unknown error occurred');
    }
  }
}

// 计算token使用情况的估算
export function estimateTokens(text: string): number {
  // 简单估算：中文字符约0.6token，英文字符约0.3token
  const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  const otherChars = text.length - chineseChars;
  return Math.ceil(chineseChars * 0.6 + otherChars * 0.3);
}

// 格式化token使用信息
export function formatTokenUsage(usage: ChatMessage['usage']): string {
  if (!usage) return '';
  
  const parts = [];
  parts.push(`总计: ${usage.total_tokens}`);
  parts.push(`输入: ${usage.prompt_tokens}`);
  parts.push(`输出: ${usage.completion_tokens}`);
  
  if (usage.prompt_cache_hit_tokens) {
    parts.push(`缓存命中: ${usage.prompt_cache_hit_tokens}`);
  }
  
  return parts.join(' | ');
}

// 导出消息为Markdown格式
export function exportMessagesToMarkdown(messages: ChatMessage[]): string {
  let markdown = `# AI对话记录\n\n`;
  markdown += `导出时间: ${new Date().toLocaleString()}\n\n`;
  
  messages.forEach((msg, index) => {
    if (msg.role === 'system') return;
    
    const roleLabel = msg.role === 'user' ? '👤 用户' : '🤖 AI助手';
    markdown += `## ${roleLabel}\n\n`;
    markdown += `${msg.content}\n\n`;
    
    if (msg.reasoning_content) {
      markdown += `### 💭 推理过程\n\n`;
      markdown += `${msg.reasoning_content}\n\n`;
    }
    
    if (msg.usage) {
      markdown += `*${formatTokenUsage(msg.usage)}*\n\n`;
    }
    
    markdown += `---\n\n`;
  });
  
  return markdown;
} 