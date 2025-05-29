'use client';

import { useTheme as useNextTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export interface ThemeInfo {
  name: string;
  label: string;
  icon: string;
  description: string;
}

export const themes: ThemeInfo[] = [
  {
    name: 'light',
    label: '浅色模式',
    icon: '☀️',
    description: '适合白天使用的明亮主题'
  },
  {
    name: 'dark',
    label: '深色模式',
    icon: '🌙',
    description: '适合夜间使用的暗色主题'
  },
  {
    name: 'system',
    label: '跟随系统',
    icon: '🖥️',
    description: '根据系统设置自动切换'
  }
];

export function useTheme() {
  const { theme, setTheme, resolvedTheme, systemTheme } = useNextTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 获取当前主题信息
  const currentTheme = themes.find(t => t.name === theme) || themes[0];
  
  // 获取下一个主题
  const getNextTheme = () => {
    const currentIndex = themes.findIndex(t => t.name === theme);
    const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % themes.length : 0;
    return themes[nextIndex];
  };

  // 切换到下一个主题
  const toggleTheme = () => {
    const nextTheme = getNextTheme();
    if (nextTheme) {
      setTheme(nextTheme.name);
      
      // 显示切换提示
      showThemeChangeToast(nextTheme.label);
    }
  };

  // 检查是否为暗色主题
  const isDark = resolvedTheme === 'dark';

  // 检查是否为系统主题
  const isSystemTheme = theme === 'system';

  // 获取实际显示的主题
  const effectiveTheme = resolvedTheme || 'light';

  return {
    // 基础主题功能
    theme,
    setTheme,
    resolvedTheme,
    systemTheme,
    
    // 扩展功能
    mounted,
    currentTheme,
    themes,
    toggleTheme,
    getNextTheme,
    isDark,
    isSystemTheme,
    effectiveTheme,
    
    // 主题检测
    isLight: effectiveTheme === 'light',
    prefersDark: typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches,
  };
}

// 显示主题切换提示
function showThemeChangeToast(themeName: string) {
  if (typeof window === 'undefined') return;

  // 移除已存在的提示
  const existingToast = document.querySelector('#theme-change-toast');
  if (existingToast) {
    existingToast.remove();
  }

  const toast = document.createElement('div');
  toast.id = 'theme-change-toast';
  toast.innerHTML = `
    <div class="flex items-center gap-2">
      <div class="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
      <span>已切换到${themeName}</span>
    </div>
  `;
  toast.className = [
    'fixed top-4 right-4 z-[100]',
    'bg-background/90 backdrop-blur-lg border border-border/60 rounded-xl',
    'px-4 py-3 text-sm font-medium shadow-lg',
    'transition-all duration-300 ease-out',
    'animate-in slide-in-from-right-4 fade-in-0'
  ].join(' ');

  document.body.appendChild(toast);

  // 自动移除
  setTimeout(() => {
    toast.classList.add('animate-out', 'slide-out-to-right-4', 'fade-out-0');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, 2500);
}

// 监听系统主题变化
export function useSystemTheme() {
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return systemTheme;
}

// 主题预设
export const themePresets = {
  light: {
    name: '清新白',
    description: '清爽明亮，适合日间办公',
    colors: {
      primary: 'hsl(221.2 83.2% 53.3%)',
      background: 'hsl(0 0% 100%)',
      foreground: 'hsl(222.2 84% 4.9%)'
    }
  },
  dark: {
    name: '深邃黑',
    description: '沉稳优雅，护眼夜读',
    colors: {
      primary: 'hsl(217.2 91.2% 65.8%)',
      background: 'hsl(222.2 84% 4.9%)',
      foreground: 'hsl(210 40% 98%)'
    }
  },
  system: {
    name: '智能跟随',
    description: '随心而变，智能适配',
    colors: {
      primary: 'auto',
      background: 'auto',
      foreground: 'auto'
    }
  }
} as const; 