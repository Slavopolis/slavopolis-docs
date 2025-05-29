'use client';

import { ClientSearchResult, highlightText, useSearch } from '@/hooks/use-search';
import { DocItem } from '@/lib/docs';
import { cn } from '@/lib/utils';
import { ArrowUpDown, Clock, CornerDownLeft, FileText, Folder, Search, X, Zap } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

interface GlobalSearchDialogProps {
  documents: DocItem[];
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearchDialog({ documents, isOpen, onClose }: GlobalSearchDialogProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  
  const { results, isSearching, stats } = useSearch(documents, query, { limit: 8 });

  // 重置状态
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // 选中项改变时滚动到视图
  useEffect(() => {
    if (resultsRef.current && results.length > 0) {
      const selectedElement = resultsRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        });
      }
    }
  }, [selectedIndex, results.length]);

  // 键盘导航
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'Escape':
        onClose();
        break;
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (results[selectedIndex]) {
          handleSelect(results[selectedIndex]);
        }
        break;
    }
  }, [isOpen, results, selectedIndex, onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // 处理选择
  const handleSelect = (result: ClientSearchResult) => {
    onClose();
    // 导航将由Link组件处理
  };

  // 处理鼠标悬停
  const handleMouseEnter = (index: number) => {
    setSelectedIndex(index);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* 搜索对话框 */}
      <div className="relative w-full max-w-2xl mx-4 bg-background/95 backdrop-blur-lg border border-border/60 rounded-2xl shadow-2xl animate-in fade-in-0 zoom-in-95 duration-300">
        
        {/* 搜索输入框 */}
        <div className="flex items-center gap-3 p-4 border-b border-border/40">
          <Search className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="搜索文档、教程、配置..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
                      className="flex-1 bg-transparent border-none outline-none text-foreground placeholder-muted-foreground text-lg"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-accent/60 transition-colors"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* 搜索结果 */}
        <div className="max-h-[60vh] overflow-y-auto">
          {!query.trim() ? (
            /* 空状态 - 显示提示 */
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Search className="h-8 w-8 text-primary/60" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">搜索文档</h3>
              <p className="text-muted-foreground text-sm mb-4">
                快速找到您需要的技术文档、教程和配置指南
              </p>
              <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <ArrowUpDown className="h-3 w-3" />
                  <span>导航</span>
                </div>
                <div className="flex items-center gap-1">
                  <CornerDownLeft className="h-3 w-3" />
                  <span>选择</span>
                </div>
                <div className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 text-xs border border-border/40 rounded bg-muted/60">ESC</kbd>
                  <span>关闭</span>
                </div>
              </div>
            </div>
          ) : isSearching ? (
            /* 加载状态 */
            <div className="p-8 text-center">
              <div className="w-8 h-8 mx-auto mb-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              <p className="text-muted-foreground">正在搜索...</p>
            </div>
          ) : results.length > 0 ? (
            /* 搜索结果 */
            <div ref={resultsRef} className="p-2">
              {/* 搜索统计 */}
              {stats && (
                <div className="px-3 py-2 text-xs text-muted-foreground border-b border-border/30 mb-2">
                  找到 {stats.totalResults} 个结果 · 用时 {Math.round(stats.searchTime)}ms
                </div>
              )}
              
              {results.map((result, index) => (
                <Link
                  key={result.id}
                  href={`/docs/${result.href}`}
                  onClick={() => handleSelect(result)}
                  onMouseEnter={() => handleMouseEnter(index)}
                  className={cn(
                    "block p-4 rounded-xl transition-all duration-200 border border-transparent",
                    index === selectedIndex
                      ? "bg-primary/5 border-primary/20 shadow-sm"
                      : "hover:bg-accent/30"
                  )}
                >
                  <div className="flex items-start gap-3">
                    {/* 图标 */}
                    <div className={cn(
                      "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border",
                      index === selectedIndex
                        ? "bg-primary/10 border-primary/20 text-primary"
                        : "bg-muted/60 border-border/40 text-muted-foreground"
                    )}>
                      <FileText className="h-4 w-4" />
                    </div>
                    
                    {/* 内容 */}
                    <div className="flex-1 min-w-0">
                      {/* 标题 */}
                      <h3 
                        className={cn(
                          "font-medium text-sm mb-1 line-clamp-1",
                          index === selectedIndex ? "text-primary" : "text-foreground"
                        )}
                        dangerouslySetInnerHTML={{ 
                          __html: highlightText(result.title, query) 
                        }}
                      />
                      
                      {/* 描述或摘要 */}
                      {(result.description || result.excerpt) && (
                        <p 
                          className="text-xs text-muted-foreground line-clamp-2 mb-2"
                          dangerouslySetInnerHTML={{ 
                            __html: highlightText(result.description || result.excerpt || '', query) 
                          }}
                        />
                      )}
                      
                      {/* 分类和相关性 */}
                      <div className="flex items-center gap-2 text-xs">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Folder className="h-3 w-3" />
                          <span>{result.category}</span>
                        </div>
                        
                        {result.score > 50 && (
                          <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                            <Zap className="h-3 w-3" />
                            <span>高匹配</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* 相关性得分指示器 */}
                    <div className="flex-shrink-0">
                      <div 
                        className={cn(
                          "w-2 h-8 rounded-full",
                          result.score > 70 
                            ? "bg-emerald-500" 
                            : result.score > 40 
                            ? "bg-yellow-500" 
                            : "bg-gray-400"
                        )}
                        style={{ 
                          opacity: Math.min(result.score / 100, 1),
                        }}
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            /* 无结果状态 */
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/60 flex items-center justify-center">
                <Search className="h-8 w-8 text-muted-foreground/60" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">未找到相关内容</h3>
              <p className="text-muted-foreground text-sm mb-4">
                尝试使用不同的关键词或检查拼写
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-muted/60 rounded-lg text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>搜索词: "{query}"</span>
              </div>
            </div>
          )}
        </div>

        {/* 底部提示 */}
        <div className="border-t border-border/40 p-3 bg-muted/20">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 border border-border/40 rounded bg-background">↑↓</kbd>
                <span>导航</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 border border-border/40 rounded bg-background">↵</kbd>
                <span>打开</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <span>由</span>
              <Zap className="h-3 w-3 text-primary" />
              <span className="font-medium text-primary">Slavopolis Search</span>
              <span>驱动</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 