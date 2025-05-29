'use client';

import { WysiwygMarkdownEditor } from '@/components/advanced/wysiwyg-markdown-editor';
import { cn } from '@/lib/utils';
import { Brain, Paperclip, Send, StopCircle } from 'lucide-react';
import { useState } from 'react';

interface ChatInputProps {
  onSend: (message: string, useReasoning?: boolean) => void;
  onStop?: () => void;
  disabled?: boolean;
  isStreaming?: boolean;
  placeholder?: string;
  maxLength?: number;
}

export function ChatInput({
  onSend,
  onStop,
  disabled = false,
  isStreaming = false,
  placeholder = "输入消息... (Shift+Enter 换行)",
  maxLength = 8000,
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [useReasoning, setUseReasoning] = useState(false);

  const handleSubmit = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage && !disabled && !isStreaming) {
      onSend(trimmedMessage, useReasoning);
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const isMessageEmpty = message.trim().length === 0;
  const characterCount = message.length;
  const isNearLimit = characterCount > maxLength * 0.8;

  return (
    <div className="w-full">
      {/* 输入区域 */}
      <div className="relative">
        <div className={cn(
          "relative rounded-2xl border transition-all duration-200",
          "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700",
          "shadow-lg hover:shadow-xl",
          isFocused && "shadow-xl"
        )}>
          
          {/* 工具栏 */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2">
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
              <span>Shift+Enter 换行</span>
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
                    将使用 deepseek-reasoner 模型进行深度推理
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
                    : useReasoning
                    ? "bg-purple-600 text-white hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600"
                    : "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                )}
                title={isMessageEmpty ? "请输入消息" : useReasoning ? "发送消息 (深度思考模式)" : "发送消息 (Enter)"}
              >
                <Send className="w-4 h-4" />
                <span>发送</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 