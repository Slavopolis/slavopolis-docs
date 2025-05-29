'use client';

import { Icon } from '@/components/iconfont-loader';
import {
    PROMPT_CATEGORIES,
    SYSTEM_PROMPT_TEMPLATES
} from '@/config/prompt.config';
import {
    ChatSettings,
    DEFAULT_CHAT_SETTINGS,
    MODEL_CONFIGS,
    TEMPERATURE_PRESETS
} from '@/lib/ai-chat';
import { cn } from '@/lib/utils';
import {
    AlertCircle,
    CheckCircle,
    Clock,
    Cpu,
    CreditCard,
    DollarSign,
    ExternalLink,
    Filter,
    Hash,
    Info,
    MessageSquare,
    RefreshCw,
    RotateCcw,
    Save,
    Search,
    Shield,
    Sliders,
    Sparkles,
    Thermometer,
    User,
    Wallet,
    X,
    XCircle
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

// 提示框类型定义
interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

// 确认对话框类型定义
interface ConfirmDialog {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel?: () => void;
}

interface BalanceInfo {
  currency: 'CNY' | 'USD';
  total_balance: string;
  granted_balance: string;
  topped_up_balance: string;
}

interface BalanceResponse {
  is_available: boolean;
  balance_infos: BalanceInfo[];
}

interface ChatSettingsProps {
  settings: ChatSettings;
  onSettingsChange: (settings: ChatSettings) => void;
  onClose?: () => void;
  className?: string;
}

export function ChatSettingsPanel({
  settings,
  onSettingsChange,
  onClose,
  className,
}: ChatSettingsProps) {
  const [activeTab, setActiveTab] = useState<'basic' | 'prompt' | 'balance'>('basic');
  const [localSettings, setLocalSettings] = useState<ChatSettings>(settings);
  const [balanceData, setBalanceData] = useState<BalanceResponse | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [balanceError, setBalanceError] = useState<string | null>(null);

  // 提示框管理状态
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // 确认对话框状态
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialog>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  // 提示词筛选相关状态
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 提示框管理函数
  const showToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: ToastMessage = {
      id,
      duration: 4000,
      ...toast
    };
    
    setToasts(prev => [...prev, newToast]);
    
    // 自动移除提示框
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, newToast.duration);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // 确认对话框管理函数
  const showConfirmDialog = useCallback((options: Omit<ConfirmDialog, 'isOpen'>) => {
    setConfirmDialog({
      ...options,
      isOpen: true
    });
  }, []);

  const hideConfirmDialog = useCallback(() => {
    setConfirmDialog(prev => ({
      ...prev,
      isOpen: false
    }));
  }, []);

  const handleSave = () => {
    onSettingsChange(localSettings);
  };

  const handleClose = () => {
    onClose?.();
  };

  const handleReset = () => {
    setLocalSettings(DEFAULT_CHAT_SETTINGS);
  };

  const updateSetting = <K extends keyof ChatSettings>(
    key: K,
    value: ChatSettings[K]
  ) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  // 获取余额信息
  const fetchBalance = useCallback(async () => {
    setBalanceLoading(true);
    setBalanceError(null);
    
    try {
      const response = await fetch('/api/ai-chat/balance', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data: BalanceResponse = await response.json();
      setBalanceData(data);
    } catch (error) {
      console.error('Failed to fetch balance:', error);
      setBalanceError(error instanceof Error ? error.message : '获取余额失败');
    } finally {
      setBalanceLoading(false);
    }
  }, []);

  // 当切换到余额Tab时自动获取余额
  useEffect(() => {
    if (activeTab === 'balance' && !balanceData && !balanceLoading) {
      fetchBalance();
    }
  }, [activeTab, balanceData, balanceLoading, fetchBalance]);

  const hasChanges = JSON.stringify(localSettings) !== JSON.stringify(settings);

  const tabs = [
    {
      id: 'basic' as const,
      label: '基础设置',
      icon: Sliders,
      description: '模型、温度、输出长度等基础参数'
    },
    {
      id: 'prompt' as const,
      label: 'Prompt 设置',
      icon: MessageSquare,
      description: '系统角色和提示词模板配置'
    },
    {
      id: 'balance' as const,
      label: '余额查询',
      icon: Wallet,
      description: '查看账户余额和充值记录'
    }
  ];

  const handleTopUp = () => {
    window.open('https://platform.deepseek.com/top_up', '_blank');
  };

  return (
    <div className={cn("relative", className)}>
      {/* 遮罩 */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 flex items-center justify-center p-4"
        onClick={handleClose}
      />

      {/* 面板内容 */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl overflow-hidden pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 头部 */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                <Sliders className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  聊天设置
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  自定义您的AI助手体验
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab导航 */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex-1 flex items-center gap-3 px-6 py-4 text-sm font-medium transition-all duration-200",
                    activeTab === tab.id
                      ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-white dark:bg-gray-900"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <div className="text-left">
                    <div>{tab.label}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-500 font-normal">
                      {tab.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* 内容区域 */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-280px)]">
            
            {/* 基础设置 Tab */}
            {activeTab === 'basic' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* 左列 - 模型设置 */}
                <div className="space-y-6">
                  {/* 模型选择 */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                      <Cpu className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      AI 模型
                    </label>
                    <div className="space-y-3">
                      {Object.entries(MODEL_CONFIGS).map(([key, config]) => (
                        <label
                          key={key}
                          className={cn(
                            "flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all duration-200",
                            localSettings.model === key
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-200 dark:ring-blue-700"
                              : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                          )}
                        >
                          <input
                            type="radio"
                            name="model"
                            value={key}
                            checked={localSettings.model === key}
                            onChange={(e) => updateSetting('model', e.target.value as any)}
                            className="text-blue-600 focus:ring-blue-500 w-4 h-4"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {config.name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {config.description}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* 最大令牌数 */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                      <Hash className="w-4 h-4 text-green-600 dark:text-green-400" />
                      最大输出长度
                    </label>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {localSettings.maxTokens} tokens
                        </span>
                        <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">
                          约 {Math.round(localSettings.maxTokens * 0.75)} 个中文字
                        </span>
                      </div>
                      <input
                        type="range"
                        min="100"
                        max="8192"
                        step="100"
                        value={localSettings.maxTokens}
                        onChange={(e) => updateSetting('maxTokens', parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>100</span>
                        <span>4096</span>
                        <span>8192</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 右列 - 温度设置 */}
                <div className="space-y-6">
                  {/* 温度设置 */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                      <Thermometer className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      创造性温度
                    </label>
                    
                    <div className="space-y-4">
                      {/* 当前值显示 */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          当前值: {localSettings.temperature}
                        </span>
                        <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">
                          {localSettings.temperature <= 0.3 ? '精确' : 
                           localSettings.temperature <= 1.0 ? '平衡' : 
                           localSettings.temperature <= 1.5 ? '创意' : '高创意'}
                        </span>
                      </div>

                      {/* 预设温度按钮 */}
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(TEMPERATURE_PRESETS).slice(0, 4).map(([key, preset]) => (
                          <button
                            key={key}
                            onClick={() => updateSetting('temperature', preset.value)}
                            className={cn(
                              "p-3 text-xs rounded-lg border text-center transition-all duration-200",
                              localSettings.temperature === preset.value
                                ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300"
                                : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                            )}
                          >
                            <div className="font-medium">{preset.label}</div>
                            <div className="text-gray-500 dark:text-gray-400 mt-1">{preset.value}</div>
                          </button>
                        ))}
                      </div>

                      {/* 自定义温度滑块 */}
                      <input
                        type="range"
                        min="0"
                        max="2"
                        step="0.1"
                        value={localSettings.temperature}
                        onChange={(e) => updateSetting('temperature', parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider-purple"
                      />
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>0.0</span>
                        <span>1.0</span>
                        <span>2.0</span>
                      </div>
                    </div>
                  </div>

                  {/* 温度说明 */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                    <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
                      温度设置说明
                    </h4>
                    <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                      <li>• <strong>0.0-0.3</strong>: 精确模式，适合代码生成、数学计算</li>
                      <li>• <strong>0.8-1.0</strong>: 平衡模式，适合日常对话、问答</li>
                      <li>• <strong>1.3-1.5</strong>: 创意模式，适合创作、头脑风暴</li>
                      <li>• <strong>1.8-2.0</strong>: 高创意模式，适合文学创作</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Prompt设置 Tab */}
            {activeTab === 'prompt' && (
              <div className="space-y-6">
                {/* 搜索和筛选栏 */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="搜索提示词..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">全部分类</option>
                      {PROMPT_CATEGORIES.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 当前系统消息预览 */}
                {localSettings.systemMessage && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-xl p-5 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          当前系统角色
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {(() => {
                            const currentTemplate = SYSTEM_PROMPT_TEMPLATES.find(t => t.prompt === localSettings.systemMessage);
                            return currentTemplate ? currentTemplate.name : '自定义系统消息';
                          })()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                      <div className="text-sm text-gray-700 dark:text-gray-300 max-h-32 overflow-y-auto leading-relaxed">
                        {localSettings.systemMessage}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-blue-600 dark:text-blue-400">
                        💡 系统角色定义AI的行为和能力
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {localSettings.systemMessage.length} 字符
                      </span>
                    </div>
                  </div>
                )}

                {/* 系统预设提示词 */}
                <div className="bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-900/10 dark:to-gray-900/10 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-600 to-gray-700 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          系统预设提示词
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          专业优化的提示词模板，点击选择应用
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <Shield className="w-4 h-4" />
                      <span>官方</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {SYSTEM_PROMPT_TEMPLATES
                      .filter(template => 
                        selectedCategory === 'all' || template.category === selectedCategory
                      )
                      .filter(template =>
                        searchQuery === '' || 
                        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
                      )
                      .map((template) => (
                        <button
                          key={template.id}
                          onClick={() => updateSetting('systemMessage', template.prompt)}
                          className={cn(
                            "text-left p-4 border rounded-lg transition-all duration-200 group relative",
                            localSettings.systemMessage === template.prompt
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-200 dark:ring-blue-700 shadow-lg"
                              : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/10 dark:hover:to-indigo-900/10 hover:shadow-md transform hover:scale-[1.02]"
                          )}
                        >
                                <div className="flex items-start gap-3">
                                  <div className="flex-shrink-0">
                                    <div className={cn(
                                "w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200",
                                      localSettings.systemMessage === template.prompt
                                  ? "bg-blue-100 dark:bg-blue-900/30 shadow-inner"
                                  : "bg-gray-100 dark:bg-gray-700 group-hover:bg-gradient-to-br group-hover:from-blue-100 group-hover:to-indigo-100 dark:group-hover:from-blue-900/30 dark:group-hover:to-indigo-900/30"
                                    )}>
                                      <Icon 
                                        name={template.icon}
                                        className={cn(
                                    "text-lg transition-all duration-200",
                                          localSettings.systemMessage === template.prompt
                                            ? "text-blue-600 dark:text-blue-400"
                                      : "text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                                        )}
                                        fallback="🤖"
                                      />
                                    </div>
                                  </div>
                            <div className="flex-1 min-w-0">
                              <div className={cn(
                                "font-medium text-sm mb-2 transition-colors duration-200",
                                localSettings.systemMessage === template.prompt
                                  ? "text-blue-900 dark:text-blue-100"
                                  : "text-gray-900 dark:text-gray-100 group-hover:text-blue-900 dark:group-hover:text-blue-100"
                              )}>
                                      {template.name}
                                    </div>
                              <div className={cn(
                                "text-xs line-clamp-3 transition-colors duration-200",
                                            localSettings.systemMessage === template.prompt
                                  ? "text-blue-700 dark:text-blue-300"
                                  : "text-gray-500 dark:text-gray-400 group-hover:text-blue-700 dark:group-hover:text-blue-300"
                              )}>
                                {template.description}
                                    </div>
                                </div>
                              </div>
                              
                              {/* 选中状态指示器 */}
                              {localSettings.systemMessage === template.prompt && (
                            <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
                              <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                <span>当前选择</span>
                                  </div>
                                </div>
                              )}
                        </button>
                      ))}
                  </div>
                </div>

                {/* 自定义提示词 - 即将推出 */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 rounded-xl p-5 border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          自定义提示词
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          创建和管理您的个人提示词模板
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400">
                      <Clock className="w-4 h-4" />
                      <span>即将推出</span>
                    </div>
                  </div>

                  <div className="text-center py-12">
                    <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center">
                      <Sparkles className="w-10 h-10 text-purple-600 dark:text-purple-400" />
                          </div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      自定义提示词功能即将上线
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 max-w-md mx-auto">
                      我们正在开发强大的自定义提示词功能，您将能够创建、编辑和管理个人专属的AI助手角色模板
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto text-left">
                      <div className="flex items-center gap-2 text-sm text-purple-700 dark:text-purple-300">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span>创建个人提示词模板</span>
                          </div>
                      <div className="flex items-center gap-2 text-sm text-purple-700 dark:text-purple-300">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span>分类管理和标签系统</span>
                        </div>
                      <div className="flex items-center gap-2 text-sm text-purple-700 dark:text-purple-300">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span>导入导出提示词库</span>
                        </div>
                      <div className="flex items-center gap-2 text-sm text-purple-700 dark:text-purple-300">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span>社区提示词分享</span>
                        </div>
                        </div>
                      </div>
                    </div>

                {/* 系统消息说明 */}
                {!localSettings.systemMessage && (
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-3 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <MessageSquare className="w-8 h-8 text-gray-400" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        暂未选择系统角色
                      </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                        请从上方提示词模板中选择一个系统角色，定义AI的行为和能力
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 余额查询 Tab */}
            {activeTab === 'balance' && (
              <div className="space-y-6">
                {/* 余额概览 */}
                <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/10 dark:to-blue-900/10 rounded-xl p-6 border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center">
                        <Wallet className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          账户余额
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          实时查看您的API使用额度
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleTopUp}
                        className="flex items-center gap-2 px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>充值</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                      <button
                        onClick={fetchBalance}
                        disabled={balanceLoading}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-all duration-200",
                          balanceLoading
                            ? "bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                            : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600"
                        )}
                      >
                        <RefreshCw className={cn("w-4 h-4", balanceLoading && "animate-spin")} />
                        刷新
                      </button>
                    </div>
                  </div>

                  {/* 加载状态 */}
                  {balanceLoading && (
                    <div className="flex items-center justify-center py-8">
                      <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>正在获取余额信息...</span>
                      </div>
                    </div>
                  )}

                  {/* 错误状态 */}
                  {balanceError && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                        <X className="w-4 h-4" />
                        <span className="text-sm font-medium">获取余额失败</span>
                      </div>
                      <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                        {balanceError}
                      </p>
                    </div>
                  )}

                  {/* 余额信息 */}
                  {balanceData && !balanceLoading && (
                    <div className="space-y-4">
                      {/* 可用状态 */}
                      <div className="flex items-center gap-2 mb-4">
                        <div className={cn(
                          "w-3 h-3 rounded-full",
                          balanceData.is_available ? "bg-green-500 animate-pulse" : "bg-red-500"
                        )} />
                        <span className={cn(
                          "text-sm font-medium",
                          balanceData.is_available 
                            ? "text-green-700 dark:text-green-400" 
                            : "text-red-700 dark:text-red-400"
                        )}>
                          {balanceData.is_available ? "账户可用" : "账户不可用"}
                        </span>
                      </div>

                      {/* 余额详情和饼图 */}
                      <div className="flex gap-6">
                        {/* 左侧：余额卡片 */}
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                          {balanceData.balance_infos.map((balance, index) => (
                            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                              <div className="flex items-center gap-2 mb-3">
                                <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  {balance.currency === 'CNY' ? '人民币余额' : '美元余额'}
                                </span>
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-gray-500 dark:text-gray-400">总余额</span>
                                  <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                    ¥{balance.total_balance}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-gray-500 dark:text-gray-400">赠金余额</span>
                                  <span className="text-sm text-orange-600 dark:text-orange-400">
                                    ¥{balance.granted_balance}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-gray-500 dark:text-gray-400">充值余额</span>
                                  <span className="text-sm text-blue-600 dark:text-blue-400">
                                    ¥{balance.topped_up_balance}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* 右侧：饼图 - 仅在有人民币余额时显示 */}
                        {(() => {
                          const cnyBalance = balanceData.balance_infos.find(b => b.currency === 'CNY');
                          if (!cnyBalance) return null;
                          
                          const total = parseFloat(cnyBalance.total_balance);
                          const granted = parseFloat(cnyBalance.granted_balance);
                          const toppedUp = parseFloat(cnyBalance.topped_up_balance);
                          
                          if (total === 0) return null;
                          
                          return (
                            <div className="flex-shrink-0 flex flex-col items-center">
                              <div className="relative w-24 h-24">
                                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                                  {/* 背景圆环 */}
                                  <path
                                    d="M18 2.0845
                                      a 15.9155 15.9155 0 0 1 0 31.831
                                      a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    className="text-gray-200 dark:text-gray-700"
                                  />
                                  
                                  {(() => {
                                    const grantedPercent = (granted / total) * 100;
                                    const toppedUpPercent = (toppedUp / total) * 100;
                                    
                                    const grantedStroke = grantedPercent * 0.31831;
                                    const toppedUpStroke = toppedUpPercent * 0.31831;
                                    
                                    return (
                                      <>
                                        {/* 充值余额 - 蓝色 */}
                                        {toppedUp > 0 && (
                                          <path
                                            d="M18 2.0845
                                              a 15.9155 15.9155 0 0 1 0 31.831
                                              a 15.9155 15.9155 0 0 1 0 -31.831"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="3"
                                            strokeDasharray={`${toppedUpStroke} 31.831`}
                                            className="text-blue-500"
                                          />
                                        )}
                                        
                                        {/* 赠金余额 - 橙色 */}
                                        {granted > 0 && (
                                          <path
                                            d="M18 2.0845
                                              a 15.9155 15.9155 0 0 1 0 31.831
                                              a 15.9155 15.9155 0 0 1 0 -31.831"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="3"
                                            strokeDasharray={`${grantedStroke} 31.831`}
                                            strokeDashoffset={`-${toppedUpStroke}`}
                                            className="text-orange-500"
                                          />
                                        )}
                                      </>
                                    );
                                  })()}
                                </svg>
                                
                                {/* 中心文字 */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="text-center">
                                    <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                      ¥{cnyBalance.total_balance}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      总余额
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              {/* 图例 */}
                              <div className="mt-3 space-y-2">
                                {toppedUp > 0 && (
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                    <span className="text-xs text-gray-600 dark:text-gray-400">
                                      充值 ¥{cnyBalance.topped_up_balance}
                                    </span>
                                  </div>
                                )}
                                {granted > 0 && (
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                                    <span className="text-xs text-gray-600 dark:text-gray-400">
                                      赠金 ¥{cnyBalance.granted_balance}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  )}
                </div>

                {/* 使用说明 */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-5 border border-blue-200 dark:border-blue-800">
                  <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-3">
                    💡 余额说明
                  </h4>
                  <div className="space-y-2 text-xs text-blue-700 dark:text-blue-300">
                    <div className="flex items-start gap-2">
                      <span className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span><strong>总余额</strong>：包括赠金和充值的所有可用余额</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-1 h-1 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span><strong>赠金余额</strong>：平台赠送的免费额度，有使用期限</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span><strong>充值余额</strong>：您充值的金额，无使用期限</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-1 h-1 bg-gray-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span>余额信息每5分钟更新一次，可能存在延迟</span>
                    </div>
                  </div>
                </div>

                {/* API使用统计 */}
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    📊 使用统计
                  </h4>
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <div className="w-16 h-16 mx-auto mb-3 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <Hash className="w-8 h-8" />
                    </div>
                    <p className="text-sm">使用统计功能即将推出</p>
                    <p className="text-xs mt-1">将显示API调用次数、Token消耗等详细信息</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 底部按钮 */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              重置为默认
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={!hasChanges}
                className={cn(
                  "flex items-center gap-2 px-6 py-2 text-sm rounded-lg transition-all duration-200",
                  hasChanges
                    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl transform hover:scale-105"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                )}
              >
                <Save className="w-4 h-4" />
                保存设置
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 自定义滑块样式 */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #10b981, #059669);
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          border: 2px solid white;
        }

        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #10b981, #059669);
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          border: 2px solid white;
        }

        .slider-purple::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          border: 2px solid white;
        }

        .slider-purple::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          border: 2px solid white;
        }
      `}</style>

      {/* Toast 提示框容器 */}
      {toasts.length > 0 && (
        <div className="fixed top-4 right-4 z-[100] space-y-2 pointer-events-none">
          {toasts.map((toast) => {
            const Icon = toast.type === 'success' ? CheckCircle :
                        toast.type === 'error' ? XCircle :
                        toast.type === 'warning' ? AlertCircle :
                        Info;
            
            const bgColor = toast.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' :
                           toast.type === 'error' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' :
                           toast.type === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' :
                           'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
            
            const iconColor = toast.type === 'success' ? 'text-green-600 dark:text-green-400' :
                             toast.type === 'error' ? 'text-red-600 dark:text-red-400' :
                             toast.type === 'warning' ? 'text-yellow-600 dark:text-yellow-400' :
                             'text-blue-600 dark:text-blue-400';
            
            const textColor = toast.type === 'success' ? 'text-green-900 dark:text-green-100' :
                             toast.type === 'error' ? 'text-red-900 dark:text-red-100' :
                             toast.type === 'warning' ? 'text-yellow-900 dark:text-yellow-100' :
                             'text-blue-900 dark:text-blue-100';

            return (
              <div
                key={toast.id}
                className={cn(
                  "pointer-events-auto max-w-sm w-full rounded-xl border shadow-lg backdrop-blur-sm transform transition-all duration-300 ease-out animate-in slide-in-from-right-full",
                  bgColor
                )}
              >
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <Icon className={cn("w-5 h-5", iconColor)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={cn("text-sm font-medium", textColor)}>
                        {toast.title}
                      </div>
                      {toast.message && (
                        <div className={cn("text-sm mt-1 opacity-80", textColor)}>
                          {toast.message}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => removeToast(toast.id)}
                      className={cn(
                        "flex-shrink-0 p-1 rounded-lg transition-colors",
                        toast.type === 'success' ? 'hover:bg-green-100 dark:hover:bg-green-800/30 text-green-500 dark:text-green-400' :
                        toast.type === 'error' ? 'hover:bg-red-100 dark:hover:bg-red-800/30 text-red-500 dark:text-red-400' :
                        toast.type === 'warning' ? 'hover:bg-yellow-100 dark:hover:bg-yellow-800/30 text-yellow-500 dark:text-yellow-400' :
                        'hover:bg-blue-100 dark:hover:bg-blue-800/30 text-blue-500 dark:text-blue-400'
                      )}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {/* 进度条 */}
                <div className="h-1 bg-black/5 dark:bg-white/5 rounded-b-xl overflow-hidden">
                  <div 
                    className={cn(
                      "h-full transition-all ease-linear",
                      toast.type === 'success' ? 'bg-green-500' :
                      toast.type === 'error' ? 'bg-red-500' :
                      toast.type === 'warning' ? 'bg-yellow-500' :
                      'bg-blue-500'
                    )}
                    style={{
                      animation: `toast-progress ${toast.duration}ms linear forwards`
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Toast 动画样式 */}
      <style jsx>{`
        @keyframes toast-progress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
        
        .animate-in {
          animation-fill-mode: both;
        }
        
        .slide-in-from-right-full {
          animation-name: slide-in-from-right;
        }
        
        @keyframes slide-in-from-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>

      {/* 确认对话框 */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          {/* 遮罩 */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={confirmDialog.onCancel || hideConfirmDialog}
          />

          {/* 对话框内容 */}
          <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl overflow-hidden transform transition-all duration-200 scale-100">
            {/* 头部 */}
            <div className={cn(
              "flex items-center gap-3 p-6 border-b border-gray-200 dark:border-gray-700",
              confirmDialog.type === 'danger' ? 'bg-red-50 dark:bg-red-900/20' :
              confirmDialog.type === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/20' :
              'bg-blue-50 dark:bg-blue-900/20'
            )}>
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                confirmDialog.type === 'danger' ? 'bg-red-100 dark:bg-red-900/30' :
                confirmDialog.type === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                'bg-blue-100 dark:bg-blue-900/30'
              )}>
                {confirmDialog.type === 'danger' ? (
                  <AlertCircle className={cn("w-5 h-5", "text-red-600 dark:text-red-400")} />
                ) : confirmDialog.type === 'warning' ? (
                  <AlertCircle className={cn("w-5 h-5", "text-yellow-600 dark:text-yellow-400")} />
                ) : (
                  <Info className={cn("w-5 h-5", "text-blue-600 dark:text-blue-400")} />
                )}
              </div>
              <div className="flex-1">
                <h3 className={cn(
                  "text-lg font-semibold",
                  confirmDialog.type === 'danger' ? 'text-red-900 dark:text-red-100' :
                  confirmDialog.type === 'warning' ? 'text-yellow-900 dark:text-yellow-100' :
                  'text-blue-900 dark:text-blue-100'
                )}>
                  {confirmDialog.title}
                </h3>
              </div>
              <button
                onClick={confirmDialog.onCancel || hideConfirmDialog}
                className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 内容 */}
            <div className="p-6">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {confirmDialog.message}
              </p>
            </div>

            {/* 底部按钮 */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <button
                onClick={confirmDialog.onCancel || hideConfirmDialog}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 rounded-lg transition-colors"
              >
                {confirmDialog.cancelText || '取消'}
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-all duration-200 font-medium",
                  confirmDialog.type === 'danger' 
                    ? "bg-red-600 text-white hover:bg-red-700 shadow-lg hover:shadow-xl" 
                    : confirmDialog.type === 'warning'
                    ? "bg-yellow-600 text-white hover:bg-yellow-700 shadow-lg hover:shadow-xl"
                    : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl"
                )}
              >
                {confirmDialog.confirmText || '确认'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 