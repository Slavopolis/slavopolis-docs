'use client';

import { MarkdownRenderer } from '@/components/docs/markdown-renderer';
import { Icon } from '@/components/iconfont-loader';
import { authorConfig } from '@/config/author.config';
import { ChatMessage, formatTokenUsage } from '@/lib/ai-chat';
import { cn } from '@/lib/utils';
import { Brain, Check, Copy, RotateCcw, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

interface ChatMessageProps {
  message: ChatMessage;
  onRegenerate?: () => void;
  onDelete?: () => void;
  isStreaming?: boolean;
  streamingContent?: string;
  streamingReasoning?: string;
}

export function ChatMessageBubble({
  message,
  onRegenerate,
  onDelete,
  isStreaming = false,
  streamingContent = '',
  streamingReasoning = '',
}: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const [showReasoning, setShowReasoning] = useState(false);

  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  // 获取要显示的内容
  const displayContent = isStreaming ? streamingContent : message.content;
  const displayReasoning = isStreaming ? streamingReasoning : message.reasoning_content;
  const hasReasoning = displayReasoning && displayReasoning.trim().length > 0;

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (message.role === 'system') {
    return null; // 不显示系统消息
  }

  return (
    <div className={cn(
      "flex gap-4 group w-full",
      isUser ? "justify-end" : "justify-start"
    )}>
      {/* AI头像 */}
      {isAssistant && (
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 flex items-center justify-center shadow-sm">
          <Icon 
            name="icon-deepseek" 
            className="w-6 h-6 text-blue-600 dark:text-blue-400" 
            fallback="🤖"
          />
        </div>
      )}

      {/* 消息内容 */}
      <div className={cn(
        "flex flex-col gap-2 min-w-0",
        isUser ? "items-end max-w-[65%] ml-4" : "items-start flex-1 mr-16"
      )}>
        {/* 消息主体 */}
        <div className={cn(
          "relative rounded-2xl px-4 py-3 shadow-sm border transition-all duration-200 w-full",
          isUser 
            ? "bg-blue-400 text-white border-blue-300/30 ring-1 ring-blue-300/50" 
            : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700",
          "hover:shadow-md"
        )}>
          {/* 消息内容渲染 */}
          <div className={cn(
            "w-full",
            isUser ? "text-white" : "text-gray-900 dark:text-gray-100"
          )}>
            {isUser ? (
              <div className="whitespace-pre-wrap break-words">
                {displayContent}
              </div>
            ) : (
              <>
                {/* AI响应内容 */}
                {displayContent ? (
                  <MarkdownRenderer 
                    content={displayContent} 
                    className="w-full"
                  />
                ) : isStreaming ? (
                  // 当正在流式生成但还没有内容时，显示占位符
                  <div className="flex items-center gap-3 py-2 text-gray-500 dark:text-gray-400">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    </div>
                    <span className="text-sm">
                      {message.model === 'deepseek-reasoner' ? (
                        <>
                          <Brain className="w-4 h-4 inline mr-1 text-purple-500" />
                          DeepSeek 正在深度思考中...
                        </>
                      ) : (
                        'DeepSeek 正在思考中...'
                      )}
                    </span>
                  </div>
                ) : (
                  // 非流式状态下的空内容（通常不会出现）
                  <MarkdownRenderer 
                    content={displayContent} 
                    className="w-full"
                  />
                )}
              </>
            )}
          </div>

          {/* 流式输入指示器 - 仅在有内容时显示 */}
          {isStreaming && isAssistant && displayContent && (
            <div className="mt-2 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"></div>
              </div>
              <span>正在生成中...</span>
            </div>
          )}

          {/* 消息操作按钮 */}
          {!isUser && !isStreaming && (
            <div className="absolute -right-2 -bottom-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-1 shadow-lg">
                <button
                  onClick={copyToClipboard}
                  className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                  title="复制内容"
                >
                  {copied ? (
                    <Check className="w-3 h-3 text-green-500" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
                {onRegenerate && (
                  <button
                    onClick={onRegenerate}
                    className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    title="重新生成"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={onDelete}
                    className="p-1.5 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                    title="删除消息"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 推理内容 */}
        {hasReasoning && (
          <div className="w-full">
            <button
              onClick={() => setShowReasoning(!showReasoning)}
              className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              <Brain className="w-3 h-3" />
              <span>{showReasoning ? '隐藏' : '查看'}推理过程</span>
              <span className="text-gray-400">({displayReasoning.length} 字符)</span>
              {isStreaming && displayReasoning && (
                <span className="text-purple-500 animate-pulse">• 思考中</span>
              )}
            </button>

            {showReasoning && (
              <div className="mt-2 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10 p-4">
                <div className="flex items-center gap-2 mb-2 text-sm font-medium text-amber-700 dark:text-amber-400">
                  <Brain className="w-4 h-4" />
                  <span>AI推理过程</span>
                  {isStreaming && displayReasoning && (
                    <div className="flex items-center gap-1 ml-auto">
                      <div className="flex space-x-1">
                        <div className="w-1 h-1 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-1 h-1 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-1 h-1 bg-purple-500 rounded-full animate-bounce"></div>
                      </div>
                      <span className="text-xs text-purple-600 dark:text-purple-400">实时思考</span>
                    </div>
                  )}
                </div>
                <div className="w-full">
                  <MarkdownRenderer 
                    content={displayReasoning} 
                    className="w-full"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* 当推理模式且正在思考但还没有显示推理内容时的特殊提示 */}
        {isStreaming && message.model === 'deepseek-reasoner' && !hasReasoning && !displayContent && (
          <div className="w-full">
            <div className="mt-2 rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-900/10 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-purple-700 dark:text-purple-400">
                <Brain className="w-4 h-4 animate-pulse" />
                <span>启动深度推理模式...</span>
                <div className="flex space-x-1 ml-auto">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce"></div>
                </div>
              </div>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                AI正在进行深层次的逻辑分析和推理，请稍候...
              </p>
            </div>
          </div>
        )}

        {/* 消息元信息 */}
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span>{formatTime(message.timestamp)}</span>
          
          {message.model && (
            <>
              <span>•</span>
              <span className="font-medium">{message.model}</span>
            </>
          )}
          
          {message.usage && (
            <>
              <span>•</span>
              <span className="font-mono" title={formatTokenUsage(message.usage)}>
                {message.usage.total_tokens} tokens
              </span>
            </>
          )}
        </div>
      </div>

      {/* 用户头像 */}
      {isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-white dark:bg-gray-800 border border-blue-300 dark:border-blue-300 flex items-center justify-center shadow-sm ring-1 ring-blue-200/50 dark:ring-blue-400/30 overflow-hidden">
          <Image
            src={authorConfig.avatar}
            alt={authorConfig.name}
            width={40}
            height={40}
            className="w-full h-full object-cover rounded-2xl"
            unoptimized
          />
        </div>
      )}
    </div>
  );
} 