// API配置文件
export const API_CONFIG = {
  // DeepSeek API配置
  DEEPSEEK: {
    BASE_URL: 'https://api.deepseek.com',
    ENDPOINTS: {
      CHAT: '/chat/completions',
      BALANCE: '/user/balance',
    },
  },
} as const;

// 环境检查
export const isProduction = process.env.NODE_ENV === 'production';
export const isDevelopment = process.env.NODE_ENV === 'development';

// API安全提醒
export const API_SECURITY_WARNING = {
  message: '⚠️ 安全提醒：API密钥将存储在本地浏览器中，请不要在公共设备上使用，也不要分享您的API密钥给他人。',
  recommendation: '生产环境建议使用后端代理来保护API密钥安全。'
} as const; 