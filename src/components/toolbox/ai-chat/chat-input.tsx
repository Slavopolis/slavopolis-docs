'use client';

import { WysiwygMarkdownEditor } from '@/components/advanced/wysiwyg-markdown-editor';
import { Icon } from '@/components/iconfont-loader';
import { SYSTEM_PROMPT_TEMPLATES, type PromptTemplate } from '@/config/prompt.config';
import { MODEL_CONFIGS, TEMPERATURE_PRESETS, type ChatSettings } from '@/lib/ai-chat';
import { cn } from '@/lib/utils';
import { Brain, ChevronDown, Cpu, Hash, Paperclip, Send, Settings, StopCircle, Thermometer, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface ChatInputProps {
  onSend: (message: string, useReasoning?: boolean, customSystemPrompt?: string) => void;
  onStop?: () => void;
  disabled?: boolean;
  isStreaming?: boolean;
  placeholder?: string;
  maxLength?: number;
  currentSettings?: ChatSettings;
  onSettingsChange?: (settings: Partial<ChatSettings>) => void;
}

export function ChatInput({
  onSend,
  onStop,
  disabled = false,
  isStreaming = false,
  placeholder = "输入消息... (Shift+Enter 换行，/ 选择提示词)",
  maxLength = 8000,
  currentSettings,
  onSettingsChange,
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [useReasoning, setUseReasoning] = useState(false);
  const [showQuickSettings, setShowQuickSettings] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  // 提示词选择相关状态
  const [showPromptSelector, setShowPromptSelector] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<PromptTemplate | null>(null);
  const [promptSelectorIndex, setPromptSelectorIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const promptSelectorRef = useRef<HTMLDivElement>(null);
  const promptItemsRef = useRef<HTMLButtonElement[]>([]);

  const currentModel = currentSettings?.model || 'deepseek-chat';
  const currentTemperature = currentSettings?.temperature || 1.3;

  // 过滤提示词列表
  const filteredPrompts = SYSTEM_PROMPT_TEMPLATES.filter(prompt =>
    prompt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prompt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prompt.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // 自动滚动到选中的提示词
  const scrollToSelectedPrompt = (index: number) => {
    const selectedElement = promptItemsRef.current[index];
    if (selectedElement) {
      selectedElement.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest'
      });
    }
  };

  // 点击外部关闭快速设置面板
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowQuickSettings(false);
      }
      if (promptSelectorRef.current && !promptSelectorRef.current.contains(event.target as Node)) {
        setShowPromptSelector(false);
        setSearchQuery('');
        setPromptSelectorIndex(0);
      }
    }

    if (showQuickSettings || showPromptSelector) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showQuickSettings, showPromptSelector]);

  // 监听消息变化，检测斜杠命令
  useEffect(() => {
    const trimmedMessage = message.trim();
    if (trimmedMessage.startsWith('/') && trimmedMessage.length > 0) {
      const query = trimmedMessage.slice(1).toLowerCase();
      setSearchQuery(query);
      setShowPromptSelector(true);
      setPromptSelectorIndex(0);
      // 清理旧的refs
      promptItemsRef.current = [];
    } else {
      setShowPromptSelector(false);
      setSearchQuery('');
      setPromptSelectorIndex(0);
      // 清理refs
      promptItemsRef.current = [];
    }
  }, [message]);

  // 监听选中索引变化，自动滚动（延迟执行确保DOM已更新）
  useEffect(() => {
    if (showPromptSelector && filteredPrompts.length > 0) {
      // 使用 setTimeout 确保 ref 已经设置
      const timer = setTimeout(() => {
        scrollToSelectedPrompt(promptSelectorIndex);
      }, 0);
      
      return () => clearTimeout(timer);
    }
  }, [promptSelectorIndex, showPromptSelector, filteredPrompts.length]);

  // 键盘导航
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showPromptSelector && filteredPrompts.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setPromptSelectorIndex(prev => (prev + 1) % filteredPrompts.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setPromptSelectorIndex(prev => (prev - 1 + filteredPrompts.length) % filteredPrompts.length);
      } else if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const selectedPromptItem = filteredPrompts[promptSelectorIndex];
        if (selectedPromptItem) {
          selectPrompt(selectedPromptItem);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setShowPromptSelector(false);
        setSearchQuery('');
        setPromptSelectorIndex(0);
        setMessage('');
      }
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage && !disabled && !isStreaming) {
      // 如果选择了提示词，使用自定义系统提示
      const customSystemPrompt = selectedPrompt ? selectedPrompt.prompt : undefined;
      onSend(trimmedMessage, useReasoning, customSystemPrompt);
      setMessage('');
      setSelectedPrompt(null); // 发送后清除选择的提示词
    }
  };

  const selectPrompt = (prompt: PromptTemplate) => {
    setSelectedPrompt(prompt);
    setShowPromptSelector(false);
    setSearchQuery('');
    setPromptSelectorIndex(0);
    setMessage(''); // 清空输入框中的斜杠命令
  };

  const clearSelectedPrompt = () => {
    setSelectedPrompt(null);
  };

  const handleModelChange = (model: ChatSettings['model']) => {
    onSettingsChange?.({ model });
    if (model === 'deepseek-reasoner') {
      setUseReasoning(true);
    }
  };

  const handleTemperatureChange = (temperature: number) => {
    onSettingsChange?.({ temperature });
  };

  const isMessageEmpty = message.trim().length === 0;
  const characterCount = message.length;
  const isNearLimit = characterCount > maxLength * 0.8;
  const modelConfig = MODEL_CONFIGS[currentModel];

  return (
    <div className="w-full">
      {/* 输入区域 */}
      <div className="relative">
        {/* 选中的提示词标记 */}
        {selectedPrompt && (
          <div className="mb-2 flex items-center gap-2 p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-700 rounded-xl">
            <div className="flex items-center gap-2 flex-1">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Icon 
                  name={selectedPrompt.icon}
                  className="text-white text-sm"
                  fallback="🤖"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  已选择：{selectedPrompt.name}
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-300 truncate">
                  {selectedPrompt.description}
                </div>
              </div>
            </div>
            <button
              onClick={clearSelectedPrompt}
              className="p-1 text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800/30 rounded-lg transition-colors"
              title="取消选择提示词"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 提示词选择器 */}
        {showPromptSelector && filteredPrompts.length > 0 && (
          <div 
            ref={promptSelectorRef}
            className="absolute bottom-full left-0 mb-2 w-full max-w-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 max-h-80 overflow-hidden"
          >
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Hash className="w-4 h-4" />
                <span>选择系统提示词 ({filteredPrompts.length})</span>
                <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  ↑↓ 导航 Enter 选择 Esc 取消
                </span>
              </div>
            </div>
            
            <div className="max-h-64 overflow-y-auto scrollbar-thin">
              {filteredPrompts.map((prompt, index) => (
                <button
                  key={prompt.id}
                  onClick={() => selectPrompt(prompt)}
                  ref={(el) => {
                    if (el) {
                      promptItemsRef.current[index] = el;
                    }
                  }}
                  className={cn(
                    "w-full text-left p-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors duration-150",
                    index === promptSelectorIndex
                      ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700"
                      : "hover:bg-gray-50 dark:hover:bg-gray-700"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                        index === promptSelectorIndex
                          ? "bg-blue-100 dark:bg-blue-900/30"
                          : "bg-gray-100 dark:bg-gray-700"
                      )}>
                        <Icon 
                          name={prompt.icon}
                          className={cn(
                            "text-lg",
                            index === promptSelectorIndex
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-gray-500 dark:text-gray-400"
                          )}
                          fallback="🤖"
                        />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={cn(
                        "font-medium text-sm mb-1",
                        index === promptSelectorIndex
                          ? "text-blue-900 dark:text-blue-100"
                          : "text-gray-900 dark:text-gray-100"
                      )}>
                        {prompt.name}
                      </div>
                      <div className={cn(
                        "text-xs line-clamp-2",
                        index === promptSelectorIndex
                          ? "text-blue-700 dark:text-blue-300"
                          : "text-gray-500 dark:text-gray-400"
                      )}>
                        {prompt.description}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        {prompt.tags.slice(0, 3).map(tag => (
                          <span
                            key={tag}
                            className={cn(
                              "px-1.5 py-0.5 text-xs rounded",
                              index === promptSelectorIndex
                                ? "bg-blue-200 dark:bg-blue-800 text-blue-700 dark:text-blue-300"
                                : "bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400"
                            )}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className={cn(
          "relative rounded-2xl border transition-all duration-200",
          "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700",
          "shadow-lg hover:shadow-xl",
          isFocused && "shadow-xl",
          selectedPrompt && "border-blue-300 dark:border-blue-600 ring-2 ring-blue-200 dark:ring-blue-700"
        )}>
          
          {/* 工具栏 */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <div className="relative" ref={settingsRef}>
                <button
                  onClick={() => setShowQuickSettings(!showQuickSettings)}
                  className={cn(
                    "flex items-center gap-1 px-2 py-1 text-xs rounded-md transition-all duration-200",
                    showQuickSettings
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-600"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-gray-200"
                  )}
                >
                  <Settings className="w-3 h-3" />
                  <span>快速设置</span>
                  <ChevronDown className={cn("w-3 h-3 transition-transform", showQuickSettings && "rotate-180")} />
                </button>

                {/* 快速设置下拉面板 */}
                {showQuickSettings && (
                  <div className="absolute bottom-full left-0 mb-1 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50">
                    <div className="p-4 space-y-4">
                      <div>
                        <label className="flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                          <Cpu className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                          AI 模型
                        </label>
                        <div className="space-y-2">
                          {Object.entries(MODEL_CONFIGS).map(([key, config]) => (
                            <label
                              key={key}
                              className={cn(
                                "flex items-center gap-3 p-2 rounded-lg border cursor-pointer transition-all duration-200",
                                currentModel === key
                                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-200 dark:ring-blue-700"
                                  : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                              )}
                            >
                              <input
                                type="radio"
                                name="quickModel"
                                value={key}
                                checked={currentModel === key}
                                onChange={(e) => handleModelChange(e.target.value as ChatSettings['model'])}
                                className="text-blue-600 focus:ring-blue-500 w-3 h-3"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {config.name}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {config.description}
                                </div>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                          <Thermometer className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                          创造性温度: {currentTemperature}
                        </label>
                        
                        {/* 温度预设按钮 - 显示所有预设 */}
                        <div className="grid grid-cols-2 gap-1 mb-3">
                          {Object.entries(TEMPERATURE_PRESETS).map(([key, preset]) => (
                            <button
                              key={key}
                              onClick={() => handleTemperatureChange(preset.value)}
                              className={cn(
                                "p-2 text-xs rounded-lg border text-center transition-all duration-200",
                                currentTemperature === preset.value
                                  ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300"
                                  : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                              )}
                            >
                              <div className="font-medium">{preset.label}</div>
                              <div className="text-gray-500 dark:text-gray-400 mt-0.5">{preset.value}</div>
                            </button>
                          ))}
                          {/* 如果预设数量是奇数，添加一个占位符来保持网格对齐 */}
                          {Object.keys(TEMPERATURE_PRESETS).length % 2 === 1 && <div></div>}
                        </div>

                        {/* 自定义温度滑块 */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span>自定义温度</span>
                            <span className="text-purple-600 dark:text-purple-400 font-medium">{currentTemperature}</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="2"
                            step="0.1"
                            value={currentTemperature}
                            onChange={(e) => handleTemperatureChange(parseFloat(e.target.value))}
                            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer temperature-slider"
                          />
                          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span>精确 0.0</span>
                            <span>平衡 1.0</span>
                            <span>创意 2.0</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button
                disabled
                className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400 dark:text-gray-500 cursor-not-allowed rounded-md"
                title="文件上传 (即将支持)"
              >
                <Paperclip className="w-3 h-3" />
                <span>文件</span>
              </button>
            </div>

            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
              {/* 当前模型显示 */}
              <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium">
                <Cpu className="w-3 h-3" />
                {modelConfig.name}
              </span>
              <span>•</span>
              
              {/* 温度显示 */}
              <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
                <Thermometer className="w-3 h-3" />
                {currentTemperature}
              </span>
              <span>•</span>

              {/* 选中的提示词显示 */}
              {selectedPrompt && (
                <>
                  <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
                    <Icon 
                      name={selectedPrompt.icon}
                      className="w-3 h-3"
                      fallback="🤖"
                    />
                    {selectedPrompt.name}
                  </span>
                  <span>•</span>
                </>
              )}

              {useReasoning && (
                <>
                  <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-medium">
                    <Brain className="w-3 h-3" />
                    深度思考模式
                  </span>
                  <span>•</span>
                </>
              )}
              <span className={cn(
                "transition-colors",
                isNearLimit && "text-amber-600 dark:text-amber-400"
              )}>
                {characterCount}/{maxLength}
              </span>
              <span>•</span>
              <span>Shift+Enter 换行{!selectedPrompt && " • / 选择提示词"}</span>
            </div>
          </div>

          {/* Markdown编辑器 */}
          <div className="p-4">
            <WysiwygMarkdownEditor
              value={message}
              onChange={setMessage}
              placeholder={placeholder}
              maxLength={maxLength}
              minHeight={60}
              maxHeight={200}
              showToolbar={false}
              showWordCount={false}
              disabled={disabled}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={handleKeyDown}
              enablePreview={true}
              className="border-0 shadow-none"
            />
          </div>

          {/* 底部操作区域 */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              {/* 深度思考按钮 */}
              <button
                onClick={() => setUseReasoning(!useReasoning)}
                disabled={disabled || isStreaming}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-all duration-200",
                  "border font-medium",
                  useReasoning
                    ? "bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-600 shadow-sm"
                    : "bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600",
                  (disabled || isStreaming) && "opacity-50 cursor-not-allowed"
                )}
                title={useReasoning ? "关闭深度思考模式" : "开启深度思考模式 (使用 deepseek-reasoner 模型)"}
              >
                <Brain className="w-4 h-4" />
                <span>深度思考</span>
                {useReasoning && (
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                )}
              </button>

              <div className="text-xs text-gray-500 dark:text-gray-400">
                {useReasoning ? (
                  <span className="text-purple-600 dark:text-purple-400">
                    将使用 {MODEL_CONFIGS['deepseek-reasoner'].name} 进行深度推理
                  </span>
                ) : selectedPrompt ? (
                  <span className="text-green-600 dark:text-green-400">
                    将使用 {selectedPrompt.name} 模式
                  </span>
                ) : (
                  <span>支持 Markdown 格式</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isStreaming && onStop && (
                <button
                  onClick={onStop}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors"
                  title="停止生成"
                >
                  <StopCircle className="w-4 h-4" />
                  <span>停止</span>
                </button>
              )}

              <button
                onClick={handleSubmit}
                disabled={disabled || isMessageEmpty || isStreaming}
                className={cn(
                  "flex items-center gap-1 px-4 py-1.5 text-sm rounded-lg transition-all duration-200",
                  "font-medium shadow-md hover:shadow-lg transform hover:scale-105",
                  disabled || isMessageEmpty || isStreaming
                    ? "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed shadow-none transform-none"
                    : selectedPrompt
                    ? "bg-green-600 text-white hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
                    : useReasoning
                    ? "bg-purple-600 text-white hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600"
                    : "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                )}
                title={
                  isMessageEmpty 
                    ? "请输入消息" 
                    : selectedPrompt 
                    ? `发送消息 (${selectedPrompt.name})` 
                    : useReasoning 
                    ? "发送消息 (深度思考模式)" 
                    : "发送消息 (Enter)"
                }
              >
                <Send className="w-4 h-4" />
                <span>发送</span>
                {selectedPrompt && (
                  <Icon 
                    name={selectedPrompt.icon}
                    className="w-4 h-4"
                    fallback="🤖"
                  />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 快速设置滑块样式 */}
      <style jsx>{`
        .temperature-slider {
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
          cursor: pointer;
        }

        .temperature-slider::-webkit-slider-track {
          height: 8px;
          background: linear-gradient(to right, #3b82f6, #8b5cf6, #ec4899);
          border-radius: 4px;
          border: none;
        }

        .temperature-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
          position: relative;
          top: -6px;
        }

        .temperature-slider::-moz-range-track {
          height: 8px;
          background: linear-gradient(to right, #3b82f6, #8b5cf6, #ec4899);
          border-radius: 4px;
          border: none;
        }

        .temperature-slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        }

        .dark .temperature-slider::-webkit-slider-track {
          background: linear-gradient(to right, #1e40af, #7c3aed, #be185d);
        }

        .dark .temperature-slider::-moz-range-track {
          background: linear-gradient(to right, #1e40af, #7c3aed, #be185d);
        }

        /* 通用range样式 - 为其他滑块保留 */
        input[type="range"]:not(.temperature-slider) {
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
          cursor: pointer;
        }

        input[type="range"]:not(.temperature-slider)::-webkit-slider-track {
          height: 6px;
          background: linear-gradient(to right, #e5e7eb, #a855f7);
          border-radius: 3px;
        }

        input[type="range"]:not(.temperature-slider)::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          height: 18px;
          width: 18px;
          border-radius: 50%;
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        input[type="range"]:not(.temperature-slider)::-moz-range-track {
          height: 6px;
          background: linear-gradient(to right, #e5e7eb, #a855f7);
          border-radius: 3px;
          border: none;
        }

        input[type="range"]:not(.temperature-slider)::-moz-range-thumb {
          height: 18px;
          width: 18px;
          border-radius: 50%;
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .dark input[type="range"]:not(.temperature-slider)::-webkit-slider-track {
          background: linear-gradient(to right, #374151, #8b5cf6);
        }

        .dark input[type="range"]:not(.temperature-slider)::-moz-range-track {
          background: linear-gradient(to right, #374151, #8b5cf6);
        }
      `}</style>
    </div>
  );
} 