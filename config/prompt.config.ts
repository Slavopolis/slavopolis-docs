/**
 * 提示词配置文件
 * 包含系统预设提示词和用户自定义提示词的配置
 */

export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  prompt: string;
  icon: string; // iconfont 图标类名
  category: string;
  tags: string[];
  isSystem: boolean; // 是否为系统预设
  createdAt?: string;
  updatedAt?: string;
}

// 存储在localStorage中的提示词数据结构
interface StoredPromptTemplate extends PromptTemplate {
  cacheExpiry?: number; // 缓存过期时间，-1表示永久
}

export interface PromptCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

// 提示词分类配置
export const PROMPT_CATEGORIES: PromptCategory[] = [
  {
    id: 'development',
    name: '开发助手',
    description: '编程、代码审查、技术咨询',
    icon: 'icon-code',
    color: 'blue'
  },
  {
    id: 'writing',
    name: '写作创意',
    description: '文案创作、内容优化、创意构思',
    icon: 'icon-edit',
    color: 'purple'
  },
  {
    id: 'analysis',
    name: '分析专家',
    description: '数据分析、逻辑推理、问题解决',
    icon: 'icon-chart',
    color: 'green'
  },
  {
    id: 'education',
    name: '学习导师',
    description: '知识讲解、学习指导、答疑解惑',
    icon: 'icon-book',
    color: 'orange'
  },
  {
    id: 'business',
    name: '商业顾问',
    description: '商业策略、市场分析、管理咨询',
    icon: 'icon-business',
    color: 'red'
  },
  {
    id: 'life',
    name: '生活助手',
    description: '日常咨询、生活建议、实用工具',
    icon: 'icon-life',
    color: 'cyan'
  }
];

// 系统预设提示词（只读，不可修改）
export const SYSTEM_PROMPT_TEMPLATES: PromptTemplate[] = [
  // 开发助手类
  {
    id: 'sys_senior_architect',
    name: 'icon-geshihua',
    description: '拥有20+年实战经验的全栈架构师，提供专业技术咨询',
    prompt: `你是一位拥有20+年实战经验的资深全栈架构师，具备以下核心特质：
* 精通多种编程语言和技术栈（Java、Python、JavaScript/TypeScript、Go等）
* 深度掌握企业级架构设计（微服务、DDD、事件驱动、响应式架构等）
* 熟练运用各种设计模式和架构原则（SOLID、DRY、KISS、YAGNI等）
* 严格遵循业界最佳实践和编码规范
* 具备丰富的线上系统调优和问题排查经验

请用中文回答，提供企业级生产就绪的完整代码实现，确保代码质量达到直接上线标准。`,
    icon: 'icon-code',
    category: 'development',
    tags: ['架构设计', '代码实现', '技术咨询'],
    isSystem: true
  },
  {
    id: 'sys_code_reviewer',
    name: '代码审查专家',
    description: '专业的代码审查和质量把控专家',
    prompt: `你是一位专业的代码审查专家，具备以下能力：
* 深度理解各种编程语言的最佳实践和编码规范
* 熟练掌握代码质量评估标准和安全审查要点
* 擅长发现潜在的性能问题、安全漏洞和可维护性问题
* 能够提供具体的改进建议和重构方案

请对提交的代码进行全面审查，包括：代码规范、性能优化、安全性、可维护性、测试覆盖率等方面。`,
    icon: 'icon-geshihua',
    category: 'development',
    tags: ['代码审查', '质量把控', '安全检查'],
    isSystem: true
  },
  {
    id: 'sys_creative_writer',
    name: '创意写作伙伴',
    description: '富有创意的写作伙伴，激发灵感协助创作',
    prompt: `你是一位富有创意的写作伙伴，具备以下特质：
* 拥有丰富的想象力和创造力
* 熟悉各种文体和写作技巧
* 善于头脑风暴和创意构思
* 能够提供个性化的写作建议

请以轻松、有趣的方式帮助用户激发灵感，提供创意构思和写作指导。`,
    icon: 'icon-edit',
    category: 'writing',
    tags: ['创意写作', '灵感激发', '文案创作'],
    isSystem: true
  },
  {
    id: 'sys_data_analyst',
    name: '数据分析专家',
    description: '逻辑思维严密的数据分析和洞察专家',
    prompt: `你是一位逻辑思维严密的数据分析专家，具备：
* 强大的数据分析和统计能力
* 敏锐的商业洞察和趋势判断
* 清晰的逻辑推理和问题拆解能力
* 丰富的数据可视化和报告经验

请基于数据和事实提供专业的分析洞察，给出可执行的建议。`,
    icon: 'icon-chart',
    category: 'analysis',
    tags: ['数据分析', '商业洞察', '逻辑推理'],
    isSystem: true
  },
  {
    id: 'sys_patient_tutor',
    name: '耐心导师',
    description: '耐心细致的学习导师，循序渐进教学',
    prompt: `你是一位耐心细致的学习导师，具备：
* 深厚的知识功底和教学经验
* 善于将复杂概念简化为易懂的语言
* 能够根据学习者水平调整教学方式
* 提供循序渐进的学习路径和练习建议

请用通俗易懂的方式进行讲解，确保学习者能够真正理解和掌握。`,
    icon: 'icon-teacher',
    category: 'education',
    tags: ['知识讲解', '学习指导', '教学辅导'],
    isSystem: true
  },
  {
    id: 'sys_business_consultant',
    name: '商业顾问',
    description: '经验丰富的商业策略和管理咨询专家',
    prompt: `你是一位经验丰富的商业顾问，具备：
* 深度的商业洞察和市场分析能力
* 丰富的企业管理和战略规划经验
* 熟悉各行业的商业模式和发展趋势
* 能够提供可执行的商业建议和解决方案

请基于商业逻辑和市场实际，提供专业的咨询建议。`,
    icon: 'icon-business',
    category: 'business',
    tags: ['商业策略', '市场分析', '管理咨询'],
    isSystem: true
  },
  {
    id: 'sys_life_advisor',
    name: '生活顾问',
    description: '贴心的生活助手，提供实用建议和指导',
    prompt: `你是一位贴心的生活顾问，能够：
* 提供实用的生活建议和解决方案
* 帮助解决日常生活中的各种问题
* 分享有用的生活技巧和经验
* 给出温暖贴心的建议和鼓励

请以友善、实用的方式提供生活指导，让生活更加美好。`,
    icon: 'icon-life',
    category: 'life',
    tags: ['生活建议', '实用技巧', '日常咨询'],
    isSystem: true
  }
];

// 用户自定义提示词的本地存储配置
export const USER_PROMPT_CONFIG = {
  // 本地存储键名
  STORAGE_KEY: 'slavopolis_user_prompts',
  // 缓存时间配置（毫秒）
  CACHE_DURATION: {
    DEFAULT: 30 * 24 * 60 * 60 * 1000, // 30天
    SHORT: 7 * 24 * 60 * 60 * 1000,    // 7天
    LONG: 90 * 24 * 60 * 60 * 1000,    // 90天
    PERMANENT: -1                       // 永久
  },
  // 最大存储数量
  MAX_USER_PROMPTS: 50,
  // 默认图标
  DEFAULT_ICON: 'icon-user'
};

// 获取所有提示词模板（系统 + 用户自定义）
export function getAllPromptTemplates(): PromptTemplate[] {
  const userPrompts = getUserPromptTemplates();
  return [...SYSTEM_PROMPT_TEMPLATES, ...userPrompts];
}

// 根据分类获取提示词
export function getPromptsByCategory(categoryId: string): PromptTemplate[] {
  return getAllPromptTemplates().filter(prompt => prompt.category === categoryId);
}

// 获取用户自定义提示词
export function getUserPromptTemplates(): PromptTemplate[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(USER_PROMPT_CONFIG.STORAGE_KEY);
    if (!stored) return [];
    
    const data = JSON.parse(stored);
    const now = Date.now();
    
    // 过滤过期的提示词
    const validPrompts = data.prompts?.filter((prompt: any) => {
      // 如果没有cacheExpiry字段，说明是旧数据，默认为永久缓存
      if (prompt.cacheExpiry === undefined || prompt.cacheExpiry === null) return true;
      if (prompt.cacheExpiry === -1) return true; // 永久缓存
      return now < prompt.cacheExpiry;
    }) || [];
    
    return validPrompts.map((prompt: any) => ({
      id: prompt.id,
      name: prompt.name,
      description: prompt.description,
      prompt: prompt.prompt,
      icon: prompt.icon,
      category: prompt.category,
      tags: prompt.tags,
      isSystem: false,
      createdAt: prompt.createdAt,
      updatedAt: prompt.updatedAt
    }));
  } catch (error) {
    console.error('Failed to load user prompts:', error);
    return [];
  }
}

// 保存用户自定义提示词
export function saveUserPromptTemplates(prompts: PromptTemplate[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    const data = {
      prompts: prompts,
      lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem(USER_PROMPT_CONFIG.STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save user prompts:', error);
  }
}

// 添加用户自定义提示词
export function addUserPromptTemplate(
  prompt: Omit<PromptTemplate, 'id' | 'isSystem' | 'createdAt' | 'updatedAt'>,
  cacheDuration: number = USER_PROMPT_CONFIG.CACHE_DURATION.DEFAULT
): boolean {
  const userPrompts = getUserPromptTemplates();
  
  // 检查数量限制
  if (userPrompts.length >= USER_PROMPT_CONFIG.MAX_USER_PROMPTS) {
    throw new Error(`最多只能创建 ${USER_PROMPT_CONFIG.MAX_USER_PROMPTS} 个自定义提示词`);
  }
  
  // 检查名称重复
  if (userPrompts.some(p => p.name === prompt.name)) {
    throw new Error('提示词名称已存在');
  }
  
  const now = new Date().toISOString();
  const cacheExpiry = cacheDuration === -1 ? -1 : Date.now() + cacheDuration;
  
  const newPrompt: StoredPromptTemplate = {
    ...prompt,
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    isSystem: false,
    createdAt: now,
    updatedAt: now,
    cacheExpiry: cacheExpiry
  };
  
  // 获取现有的存储数据
  const stored = localStorage.getItem(USER_PROMPT_CONFIG.STORAGE_KEY);
  const existingData = stored ? JSON.parse(stored) : { prompts: [] };
  
  // 添加新提示词到存储数据
  const updatedData = {
    prompts: [...existingData.prompts, newPrompt],
    lastUpdated: now
  };
  
  localStorage.setItem(USER_PROMPT_CONFIG.STORAGE_KEY, JSON.stringify(updatedData));
  
  return true;
}

// 更新用户自定义提示词
export function updateUserPromptTemplate(id: string, updates: any): boolean {
  const userPrompts = getUserPromptTemplates();
  const index = userPrompts.findIndex(p => p.id === id);
  
  if (index === -1) {
    throw new Error('提示词不存在');
  }
  
  // 检查名称重复（排除自己）
  if (updates.name && userPrompts.some((p, i) => i !== index && p.name === updates.name)) {
    throw new Error('提示词名称已存在');
  }
  
  const current = userPrompts[index];
  if (!current) {
    throw new Error('提示词不存在');
  }
  
  const updatedPrompt = {
    ...current,
    ...updates,
    id: current.id, // 保持ID不变
    isSystem: false, // 用户提示词始终为false
    updatedAt: new Date().toISOString()
  };
  
  userPrompts[index] = updatedPrompt;
  saveUserPromptTemplates(userPrompts);
  return true;
}

// 删除用户自定义提示词
export function deleteUserPromptTemplate(id: string): boolean {
  const userPrompts = getUserPromptTemplates();
  const filteredPrompts = userPrompts.filter(p => p.id !== id);
  
  if (filteredPrompts.length === userPrompts.length) {
    throw new Error('提示词不存在');
  }
  
  saveUserPromptTemplates(filteredPrompts);
  return true;
}

// 清除所有用户自定义提示词
export function clearUserPromptTemplates(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(USER_PROMPT_CONFIG.STORAGE_KEY);
}

// 导出用户提示词
export function exportUserPrompts(): string {
  const userPrompts = getUserPromptTemplates();
  return JSON.stringify({
    version: '1.0',
    exportTime: new Date().toISOString(),
    prompts: userPrompts
  }, null, 2);
}

// 导入用户提示词
export function importUserPrompts(jsonData: string): { success: number; failed: number; errors: string[] } {
  try {
    const data = JSON.parse(jsonData);
    const prompts = data.prompts || [];
    
    let success = 0;
    let failed = 0;
    const errors: string[] = [];
    
    for (const prompt of prompts) {
      try {
        addUserPromptTemplate(prompt);
        success++;
      } catch (error) {
        failed++;
        errors.push(`${prompt.name}: ${error instanceof Error ? error.message : '未知错误'}`);
      }
    }
    
    return { success, failed, errors };
  } catch (error) {
    throw new Error('无效的导入文件格式');
  }
} 