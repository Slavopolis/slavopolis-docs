'use client';

import { cn } from '@/lib/utils';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useCallback, useEffect, useRef, useState } from 'react';

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const timeoutRef = useRef<NodeJS.Timeout>();

  // 所有 hooks 必须在任何条件返回之前调用
  useEffect(() => {
    setMounted(true);
  }, []);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const themes = [
    { name: 'light', icon: Sun, label: '浅色模式' },
    { name: 'dark', icon: Moon, label: '深色模式' },
    { name: 'system', icon: Monitor, label: '跟随系统' }
  ];

  const currentThemeIndex = themes.findIndex(t => t.name === theme);
  const nextTheme = themes[(currentThemeIndex + 1) % themes.length];

  const handleThemeChange = useCallback(() => {
    if (nextTheme) {
      setTheme(nextTheme.name);
      setIsPopoverOpen(false); // 点击主按钮后关闭悬浮窗口
    }
  }, [nextTheme, setTheme]);

  const currentTheme = themes.find(t => t.name === theme) || themes[0];
  const CurrentIcon = currentTheme?.icon || Sun;

  // 处理悬浮窗口的显示/隐藏
  const handleMouseEnter = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsPopoverOpen(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    // 延迟关闭，给用户时间移动到悬浮窗口
    timeoutRef.current = setTimeout(() => {
      setIsPopoverOpen(false);
    }, 150);
  }, []);

  const handlePopoverMouseEnter = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsPopoverOpen(true);
  }, []);

  const handlePopoverMouseLeave = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      setIsPopoverOpen(false);
    }, 100);
  }, []);

  const handleThemeSelect = useCallback((themeName: string) => {
    setTheme(themeName);
    setIsPopoverOpen(false);
  }, [setTheme]);

  // 条件渲染放在所有 hooks 之后
  if (!mounted) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <div className="w-14 h-14 rounded-full bg-background/80 backdrop-blur-lg border border-border/60 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* 主按钮 */}
      <div 
        className="relative group"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <button
          onClick={handleThemeChange}
          className={cn(
            "relative w-14 h-14 rounded-full transition-all duration-300 ease-out",
            "bg-background/80 backdrop-blur-lg border border-border/60",
            "hover:bg-background/90 hover:border-border hover:scale-105",
            "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2 focus:ring-offset-background",
            "shadow-lg hover:shadow-xl hover:shadow-primary/10",
            "active:scale-95"
          )}
          title={nextTheme ? `切换到${nextTheme.label}` : '切换主题'}
        >
          {/* 背景渐变效果 */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* 图标容器 */}
          <div className="relative w-full h-full flex items-center justify-center">
            <CurrentIcon className={cn(
              "h-6 w-6 transition-all duration-300",
              "text-foreground group-hover:text-primary",
              "group-hover:scale-110"
            )} />
          </div>

          {/* 活跃状态指示器 */}
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full border-2 border-background animate-pulse opacity-80" />
        </button>

        {/* 简单悬浮提示（当popover关闭时显示） */}
        {!isPopoverOpen && (
          <div className={cn(
            "absolute bottom-full right-0 mb-2 px-3 py-2 rounded-lg",
            "bg-background/95 backdrop-blur-lg border border-border/60 shadow-lg",
            "text-sm font-medium text-foreground whitespace-nowrap",
            "opacity-0 group-hover:opacity-100 transition-all duration-200",
            "translate-y-2 group-hover:translate-y-0",
            "pointer-events-none"
          )}>
            {currentTheme?.label || '主题'}
            <div className="absolute top-full right-4 w-2 h-2 bg-background/95 border-r border-b border-border/60 transform rotate-45 -mt-1" />
          </div>
        )}
      </div>

      {/* 主题选择器（展开状态） */}
      {isPopoverOpen && (
        <div 
          className={cn(
            "absolute bottom-full right-0 mb-4 p-3 rounded-xl min-w-[180px]",
            "bg-background/95 backdrop-blur-lg border border-border/60 shadow-xl",
            "opacity-100 scale-100 transition-all duration-300",
            "animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2"
          )}
          onMouseEnter={handlePopoverMouseEnter}
          onMouseLeave={handlePopoverMouseLeave}
        >
          {/* 标题 */}
          <div className="px-1 pb-2 mb-2 border-b border-border/30">
            <h4 className="text-sm font-semibold text-foreground">选择主题</h4>
          </div>

          {/* 主题选项 */}
          <div className="space-y-1">
            {themes.map((themeOption) => {
              const Icon = themeOption.icon;
              const isActive = theme === themeOption.name;
              
              return (
                <button
                  key={themeOption.name}
                  onClick={() => handleThemeSelect(themeOption.name)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                    "text-sm font-medium text-left",
                    isActive
                      ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/60",
                    "hover:scale-[1.02] active:scale-[0.98]"
                  )}
                >
                  <Icon className={cn(
                    "h-4 w-4 transition-colors flex-shrink-0",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )} />
                  <span className="flex-1">{themeOption.label}</span>
                  {isActive && (
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
          
          {/* 快捷键提示 */}
          <div className="border-t border-border/30 mt-3 pt-3">
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-muted/60 rounded border border-border/40 font-mono text-xs">Alt</kbd>
                <span>+</span>
                <kbd className="px-1.5 py-0.5 bg-muted/60 rounded border border-border/40 font-mono text-xs">T</kbd>
              </div>
              <span>快速切换</span>
            </div>
          </div>

          {/* 箭头指示器 */}
          <div className="absolute top-full right-6 w-3 h-3 bg-background/95 border-r border-b border-border/60 transform rotate-45 -mt-1.5 backdrop-blur-lg" />
        </div>
      )}
    </div>
  );
}

// 快捷键支持
export function useThemeShortcut() {
  const { setTheme, theme } = useTheme();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === 't') {
        e.preventDefault();
        const themes = ['light', 'dark', 'system'];
        const currentIndex = themes.indexOf(theme || 'system');
        const nextTheme = themes[(currentIndex + 1) % themes.length];
        if (nextTheme) {
          setTheme(nextTheme);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [theme, setTheme]);
} 