'use client';

import { cn } from '@/lib/utils';
import {
    Bold,
    Code,
    Eye,
    EyeOff,
    Heading1,
    Heading2,
    Heading3,
    Italic,
    Link,
    List,
    ListOrdered,
    Quote,
    Strikethrough
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  minHeight?: number;
  maxHeight?: number;
  showToolbar?: boolean;
  showWordCount?: boolean;
  className?: string;
  disabled?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  enablePreview?: boolean;
}

interface ToolbarButton {
  icon: React.ComponentType<any>;
  label: string;
  action: () => void;
  shortcut?: string;
}

export function WysiwygMarkdownEditor({
  value,
  onChange,
  placeholder = "开始输入... (支持 Markdown 格式)",
  maxLength = 10000,
  minHeight = 120,
  maxHeight = 400,
  showToolbar = true,
  showWordCount = true,
  className,
  disabled = false,
  onFocus,
  onBlur,
  onKeyDown,
  enablePreview = true,
}: MarkdownEditorProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 自动调整高度
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      const height = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
      textarea.style.height = height + 'px';
    }
  }, [value, minHeight, maxHeight]);

  // 处理输入变化
  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= maxLength) {
      onChange(newValue);
    }
  }, [onChange, maxLength]);

  // 处理键盘事件
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // 先调用父组件的键盘事件处理
    onKeyDown?.(e);
    
    // 如果事件已被阻止，则不处理快捷键
    if (e.defaultPrevented) return;
    
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          insertMarkdown('**', '**', '粗体文本');
          break;
        case 'i':
          e.preventDefault();
          insertMarkdown('*', '*', '斜体文本');
          break;
        case 'k':
          e.preventDefault();
          insertMarkdown('[', '](url)', '链接文本');
          break;
        case '`':
          e.preventDefault();
          insertMarkdown('`', '`', '代码');
          break;
      }
    }
  }, [onKeyDown]);

  // 插入Markdown格式
  const insertMarkdown = useCallback((before: string, after: string, placeholder: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const textToInsert = selectedText || placeholder;
    const newText = before + textToInsert + after;
    
    const newValue = value.substring(0, start) + newText + value.substring(end);
    onChange(newValue);

    // 设置新的光标位置
    setTimeout(() => {
      const newCursorPos = selectedText 
        ? start + newText.length 
        : start + before.length + textToInsert.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    }, 0);
  }, [value, onChange]);

  // 插入行级Markdown
  const insertLineMarkdown = useCallback((prefix: string, placeholder: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const lines = value.split('\n');
    let currentLine = 0;
    let charCount = 0;

    // 找到当前行
    for (let i = 0; i < lines.length; i++) {
      if (charCount + (lines[i]?.length || 0) >= start) {
        currentLine = i;
        break;
      }
      charCount += (lines[i]?.length || 0) + 1; // +1 for \n
    }

    const line = lines[currentLine] || '';
    const newLine = line.trim() ? `${prefix} ${line}` : `${prefix} ${placeholder}`;
    lines[currentLine] = newLine;
    
    const newValue = lines.join('\n');
    onChange(newValue);

    // 设置光标位置到行末
    setTimeout(() => {
      const newPos = charCount + newLine.length;
      textarea.setSelectionRange(newPos, newPos);
      textarea.focus();
    }, 0);
  }, [value, onChange]);

  // 工具栏按钮配置
  const toolbarButtons: ToolbarButton[] = [
    {
      icon: Bold,
      label: '粗体',
      action: () => insertMarkdown('**', '**', '粗体文本'),
      shortcut: 'Ctrl+B'
    },
    {
      icon: Italic,
      label: '斜体',
      action: () => insertMarkdown('*', '*', '斜体文本'),
      shortcut: 'Ctrl+I'
    },
    {
      icon: Strikethrough,
      label: '删除线',
      action: () => insertMarkdown('~~', '~~', '删除线文本')
    },
    {
      icon: Code,
      label: '行内代码',
      action: () => insertMarkdown('`', '`', '代码'),
      shortcut: 'Ctrl+`'
    },
    {
      icon: Heading1,
      label: '一级标题',
      action: () => insertLineMarkdown('#', '一级标题')
    },
    {
      icon: Heading2,
      label: '二级标题',
      action: () => insertLineMarkdown('##', '二级标题')
    },
    {
      icon: Heading3,
      label: '三级标题',
      action: () => insertLineMarkdown('###', '三级标题')
    },
    {
      icon: Quote,
      label: '引用',
      action: () => insertLineMarkdown('>', '引用内容')
    },
    {
      icon: List,
      label: '无序列表',
      action: () => insertLineMarkdown('-', '列表项')
    },
    {
      icon: ListOrdered,
      label: '有序列表',
      action: () => insertLineMarkdown('1.', '列表项')
    },
    {
      icon: Link,
      label: '链接',
      action: () => insertMarkdown('[', '](url)', '链接文本'),
      shortcut: 'Ctrl+K'
    }
  ];

  // 简化的Markdown渲染函数（仅用于预览）
  const renderMarkdown = useCallback((text: string) => {
    if (!text.trim()) return '';
    
    let html = text
      // 转义HTML特殊字符
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      // 代码块
      .replace(/```(\w+)?\n?([\s\S]*?)```/g, '<pre class="bg-gray-100 dark:bg-gray-800 p-3 rounded-md overflow-x-auto"><code>$2</code></pre>')
      // 行内代码
      .replace(/`([^`\n]+)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm">$1</code>')
      // 粗体
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')
      // 斜体
      .replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '<em class="italic">$1</em>')
      // 删除线
      .replace(/~~(.*?)~~/g, '<del class="line-through">$1</del>')
      // 链接
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 dark:text-blue-400 hover:underline">$1</a>')
      // 标题
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mt-4 mb-2">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>')
      // 列表项
      .replace(/^[\s]*[-*+] (.*)$/gm, '<li class="ml-4">• $1</li>')
      .replace(/^[\s]*\d+\. (.*)$/gm, '<li class="ml-4">$1</li>')
      // 引用
      .replace(/^> (.*)$/gm, '<blockquote class="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic text-gray-700 dark:text-gray-300">$1</blockquote>')
      // 换行
      .replace(/\n/g, '<br>');

    return html;
  }, []);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    onFocus?.();
  }, [onFocus]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    onBlur?.();
  }, [onBlur]);

  const wordCount = value.length;
  const isNearLimit = wordCount > maxLength * 0.8;

  return (
    <div className={cn("w-full", className)}>
      <div className={cn(
        "rounded-xl border transition-all duration-200",
        "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700",
        "shadow-sm",
        isFocused && "border-gray-300 dark:border-gray-600",
        disabled && "opacity-50 cursor-not-allowed"
      )}>
        
        {/* 工具栏 */}
        {showToolbar && (
          <div className="flex items-center justify-between p-3 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-1 flex-wrap">
              {toolbarButtons.map((button, index) => {
                const Icon = button.icon;
                return (
                  <button
                    key={index}
                    onClick={button.action}
                    disabled={disabled}
                    className={cn(
                      "p-2 rounded-md transition-colors",
                      "text-gray-600 dark:text-gray-400",
                      "hover:text-gray-900 dark:hover:text-gray-100",
                      "hover:bg-gray-100 dark:hover:bg-gray-700",
                      disabled && "cursor-not-allowed opacity-50"
                    )}
                    title={`${button.label}${button.shortcut ? ` (${button.shortcut})` : ''}`}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              {enablePreview && (
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  disabled={disabled || !value.trim()}
                  className={cn(
                    "flex items-center gap-1 px-2 py-1 text-xs rounded-md transition-colors",
                    showPreview
                      ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                      : "text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20",
                    (disabled || !value.trim()) && "opacity-50 cursor-not-allowed"
                  )}
                  title="切换预览模式"
                >
                  {showPreview ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>{showPreview ? '编辑' : '预览'}</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* 编辑/预览区域 */}
        <div className="relative">
          {showPreview ? (
            // 预览模式
            <div 
              className="p-4 min-h-[120px] prose prose-sm max-w-none dark:prose-invert overflow-auto"
              style={{ minHeight: minHeight, maxHeight: maxHeight }}
            >
              {value.trim() ? (
                <div 
                  className="markdown-preview"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(value) }}
                />
              ) : (
                <div className="text-gray-500 dark:text-gray-400 italic">
                  {placeholder}
                </div>
              )}
            </div>
          ) : (
            // 普通文本编辑模式
            <div className="p-4">
              <textarea
                ref={textareaRef}
                value={value}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder={placeholder}
                disabled={disabled}
                className={cn(
                  "w-full resize-none border-0 outline-none bg-transparent",
                  "text-sm leading-relaxed font-mono",
                  "text-gray-900 dark:text-gray-100",
                  "placeholder:text-gray-500 dark:placeholder:text-gray-400",
                  "focus:ring-0 focus:border-0 focus:outline-0",
                  disabled && "cursor-not-allowed"
                )}
                style={{ 
                  minHeight: minHeight,
                  maxHeight: maxHeight,
                  fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
                  boxShadow: 'none !important',
                  border: 'none !important',
                  lineHeight: '1.5',
                  padding: '0',
                  margin: '0',
                  backgroundColor: 'transparent'
                }}
              />
            </div>
          )}
        </div>

        {/* 底部状态栏 */}
        {showWordCount && (
          <div className="flex items-center justify-between px-4 py-2 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              支持 Markdown 格式 • 使用工具栏或快捷键快速格式化
            </div>
            
            <div className="flex items-center gap-2 text-xs">
              <span className={cn(
                "transition-colors",
                isNearLimit 
                  ? "text-amber-600 dark:text-amber-400" 
                  : "text-gray-500 dark:text-gray-400"
              )}>
                {wordCount}/{maxLength}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}