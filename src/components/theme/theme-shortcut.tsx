'use client';

import { useTheme } from 'next-themes';
import { useEffect } from 'react';

export function ThemeShortcut() {
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
          
          // 显示简短提示
          const toast = document.createElement('div');
          toast.textContent = `切换到${nextTheme === 'light' ? '浅色' : nextTheme === 'dark' ? '深色' : '系统'}模式`;
          toast.className = 'fixed top-4 right-4 bg-background/90 backdrop-blur-lg border border-border rounded-lg px-4 py-2 text-sm font-medium shadow-lg z-[100] transition-all duration-300';
          document.body.appendChild(toast);
          
          setTimeout(() => {
            toast.classList.add('opacity-0', 'translate-x-4');
            setTimeout(() => {
              if (document.body.contains(toast)) {
                document.body.removeChild(toast);
              }
            }, 300);
          }, 2000);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [theme, setTheme]);

  return null;
} 