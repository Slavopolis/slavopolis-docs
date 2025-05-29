'use client';

import { cn } from '@/lib/utils';
import { Hash } from 'lucide-react';
import { useEffect, useState } from 'react';

interface TableOfContentsProps {
  content: string;
  className?: string;
}

interface TocItem {
  id: string;
  title: string;
  level: number;
}

// 解析 Markdown 内容中的标题
function parseHeadings(content: string): TocItem[] {
  const headings: TocItem[] = [];
  
  // 首先移除代码块，避免误识别代码块中的 # 符号
  const contentWithoutCodeBlocks = content
    // 移除围栏代码块 ```
    .replace(/```[\s\S]*?```/g, '')
    // 移除行内代码块 `
    .replace(/`[^`\n]*`/g, '')
    // 移除 HTML 注释
    .replace(/<!--[\s\S]*?-->/g, '')
    // 移除引用块中的内容（避免引用中的 > 影响标题识别）
    .replace(/^>\s*.*$/gm, '');

  // 更严格的标题匹配正则：必须在行首，且 # 后必须有空格
  const headingRegex = /^(#{1,6})\s+([^\n\r]+)$/gm;
  let match;

  while ((match = headingRegex.exec(contentWithoutCodeBlocks)) !== null) {
    const level = match[1]?.length || 0;
    let title = match[2]?.trim() || '';
    
    // 清理标题中的 Markdown 语法
    title = title
      .replace(/\*\*(.*?)\*\*/g, '$1') // 粗体
      .replace(/\*(.*?)\*/g, '$1') // 斜体
      .replace(/`(.*?)`/g, '$1') // 内联代码
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // 链接
      .trim();
    
    // 过滤掉空标题、只有标点符号的标题，以及特殊情况
    if (!title || 
        title.length < 1 || 
        /^[#\-_=\s]*$/.test(title) || // 只包含标题符号、连字符、下划线、空格
        title.startsWith('TODO') || 
        title.startsWith('FIXME') ||
        title.startsWith('Note:') ||
        title.startsWith('注意：')) {
      continue;
    }
    
    // 生成 ID（与 rehype-slug 保持一致）
    const id = title
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fff\s-]/g, '') // 保留中文、英文、数字、空格、连字符
      .replace(/\s+/g, '-') // 空格转连字符
      .replace(/-+/g, '-') // 多个连字符合并为一个
      .replace(/^-|-$/g, ''); // 移除首尾连字符

    // 只显示二级及以上标题（过滤掉一级标题）
    if (level >= 2 && level <= 4 && title && id) {
      headings.push({
        id,
        title: title.substring(0, 80), // 增加标题长度限制
        level,
      });
    }
  }

  return headings;
}

export function TableOfContents({ content, className }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const tocItems = parseHeadings(content);
    setHeadings(tocItems);
  }, [content]);

  useEffect(() => {
    // 监听滚动，高亮当前可视区域的标题
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-80px 0px -80% 0px',
        threshold: 0.1,
      }
    );

    headings.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [headings]);

  if (headings.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="bg-background/95 backdrop-blur-xl rounded-2xl shadow-lg border border-border/50 p-6">
        {/* 标题 */}
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/30">
          <Hash className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm text-foreground uppercase tracking-wider">
            目录
          </h3>
        </div>

        {/* 目录列表 - 去除连线效果 */}
        <nav className="space-y-1">
          {headings.map((heading) => {
            return (
              <div key={heading.id}>
                <a
                  href={`#${heading.id}`}
                  className={cn(
                    "group relative block py-2 px-3 text-sm rounded-lg transition-all duration-200",
                    activeId === heading.id
                      ? "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400"
                      : "text-muted-foreground hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:text-blue-600 dark:hover:text-blue-400",
                    // 根据标题级别添加缩进
                    heading.level === 2 && "ml-0",
                    heading.level === 3 && "ml-4",
                    heading.level === 4 && "ml-8"
                  )}
                  onClick={(e) => {
                    e.preventDefault();
                    const element = document.getElementById(heading.id);
                    if (element) {
                      element.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start',
                      });
                      // 更新 URL hash
                      window.history.pushState(null, '', `#${heading.id}`);
                    }
                  }}
                >
                  <span className="line-clamp-2 leading-relaxed">
                    {heading.title}
                  </span>
                </a>
              </div>
            );
          })}
        </nav>

        {/* 回到顶部按钮 */}
        <div className="mt-6 pt-4 border-t border-border/30">
          <button
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              window.history.pushState(null, '', window.location.pathname);
            }}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 text-sm text-muted-foreground hover:text-foreground bg-accent/30 hover:bg-accent/50 rounded-lg transition-all duration-200"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 10l7-7m0 0l7 7m-7-7v18"
              />
            </svg>
            回到顶部
          </button>
        </div>
      </div>

      {/* 阅读进度条 */}
      <div className="bg-background/95 backdrop-blur-xl rounded-2xl shadow-lg border border-border/50 p-6">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/30">
          <svg
            className="h-4 w-4 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          <h3 className="font-semibold text-sm text-foreground uppercase tracking-wider">
            阅读进度
          </h3>
        </div>
        
        <ReadingProgress />
      </div>
    </div>
  );
}

function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const calculateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      setProgress(Math.min(100, Math.max(0, scrollPercent)));
    };

    calculateProgress();
    window.addEventListener('scroll', calculateProgress);

    return () => {
      window.removeEventListener('scroll', calculateProgress);
    };
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center text-sm">
        <span className="text-muted-foreground">进度</span>
        <span className="font-medium text-foreground">{Math.round(progress)}%</span>
      </div>
      
      <div className="relative">
        <div className="w-full h-2 bg-muted/50 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {/* 进度指示点 */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full border-2 border-background shadow-sm transition-all duration-300 ease-out"
          style={{ left: `calc(${progress}% - 6px)` }}
        />
      </div>
      
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>开始</span>
        <span>结束</span>
      </div>
    </div>
  );
} 