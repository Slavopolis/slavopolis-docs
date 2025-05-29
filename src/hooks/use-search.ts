'use client';

import { DocItem } from '@/lib/docs';
import { useEffect, useMemo, useState } from 'react';

// 简化的搜索结果类型（客户端使用）
export interface ClientSearchResult {
  id: string;
  title: string;
  description?: string | undefined;
  href: string;
  category: string;
  score: number;
  excerpt?: string;
}

// 搜索统计
export interface SearchStats {
  totalResults: number;
  searchTime: number;
  query: string;
}

// 搜索钩子
export function useSearch(documents: DocItem[], query: string, options: {
  limit?: number;
  debounceMs?: number;
} = {}) {
  const { limit = 20, debounceMs = 300 } = options;
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [isSearching, setIsSearching] = useState(false);
  const [stats, setStats] = useState<SearchStats | null>(null);

  // 防抖查询
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  // 执行搜索
  const results = useMemo(() => {
    if (!debouncedQuery.trim()) {
      setStats(null);
      setIsSearching(false);
      return [];
    }

    setIsSearching(true);
    const startTime = performance.now();

    const searchResults = performSearch(documents, debouncedQuery, limit);
    
    const endTime = performance.now();
    setStats({
      totalResults: searchResults.length,
      searchTime: endTime - startTime,
      query: debouncedQuery
    });
    
    setIsSearching(false);
    return searchResults;
  }, [documents, debouncedQuery, limit]);

  return {
    results,
    isSearching,
    stats,
    hasQuery: debouncedQuery.trim().length > 0
  };
}

// 执行搜索的核心函数
function performSearch(documents: DocItem[], query: string, limit: number): ClientSearchResult[] {
  const queryLower = query.toLowerCase();
  const queryWords = tokenize(query);
  const results: ClientSearchResult[] = [];

  // 遍历所有文档进行搜索
  const processItems = (items: DocItem[], category: string = ''): void => {
    items.forEach(item => {
      if (item.children && item.children.length > 0) {
        // 递归处理子目录
        processItems(item.children, item.title);
      } else if (item.href) {
        // 搜索文档
        const score = calculateDocumentScore(item, queryLower, queryWords);
        if (score > 0) {
          const result: ClientSearchResult = {
            id: item.href,
            title: item.title,
            href: item.href,
            category: category || '文档',
            score,
            excerpt: generateExcerpt(item.title, query)
          };
          
          // 只有当description存在且不为空时才添加
          if (item.description && item.description.trim()) {
            result.description = item.description;
          }
          
          results.push(result);
        }
      }
    });
  };

  processItems(documents);

  // 按相关性排序
  results.sort((a, b) => b.score - a.score);
  
  return results.slice(0, limit);
}

// 计算文档得分
function calculateDocumentScore(item: DocItem, queryLower: string, queryWords: string[]): number {
  let score = 0;
  const titleLower = item.title.toLowerCase();
  const descLower = item.description?.toLowerCase() || '';

  // 完全匹配标题
  if (titleLower === queryLower) {
    score += 100;
  } else if (titleLower.includes(queryLower)) {
    score += 50;
  }

  // 标题开头匹配
  if (titleLower.startsWith(queryLower)) {
    score += 30;
  }

  // 描述匹配
  if (descLower.includes(queryLower)) {
    score += 20;
  }

  // 单词匹配
  queryWords.forEach(word => {
    if (titleLower.includes(word)) {
      score += 10;
    }
    if (descLower.includes(word)) {
      score += 5;
    }
  });

  // Badge 匹配
  if (item.badge?.toLowerCase().includes(queryLower)) {
    score += 15;
  }

  return score;
}

// 词汇分词
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s\u4e00-\u9fff]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 1);
}

// 生成搜索摘要
function generateExcerpt(text: string, query: string, maxLength: number = 100): string {
  if (!query.trim()) return text.substring(0, maxLength);
  
  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();
  const index = textLower.indexOf(queryLower);
  
  if (index === -1) {
    return text.substring(0, maxLength);
  }
  
  const start = Math.max(0, index - 20);
  const end = Math.min(text.length, index + query.length + 30);
  
  let excerpt = text.substring(start, end);
  if (start > 0) excerpt = '...' + excerpt;
  if (end < text.length) excerpt = excerpt + '...';
  
  return excerpt;
}

// 高亮匹配文本
export function highlightText(text: string, query: string): string {
  if (!query.trim()) return text;
  
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800 px-1 rounded text-yellow-900 dark:text-yellow-100">$1</mark>');
} 