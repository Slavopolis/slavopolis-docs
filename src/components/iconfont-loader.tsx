'use client';

import { siteConfig } from '@/config/site.config';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

export function IconFontLoader() {
  useEffect(() => {
    // 检查是否启用了 iconfont
    if (!siteConfig.icons.iconfont.enabled || !siteConfig.icons.iconfont.projectUrl) {
      return;
    }

    // 检查是否已经加载过
    const existingScript = document.querySelector(`script[src="${siteConfig.icons.iconfont.projectUrl}"]`);
    if (existingScript) {
      return;
    }

    // 创建并加载 iconfont JS (Symbol方式)
    const script = document.createElement('script');
    script.src = siteConfig.icons.iconfont.projectUrl;
    script.async = true;
    
    // 添加错误处理
    script.onerror = () => {
      console.warn('Failed to load iconfont script:', siteConfig.icons.iconfont.projectUrl);
    };

    // 添加加载完成处理
    script.onload = () => {
      console.log('Iconfont script loaded successfully');
    };

    document.body.appendChild(script);

    // 清理函数
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return null; // 这个组件不渲染任何内容
}

// 图标组件 - 统一管理图标显示
interface IconProps {
  name: string;
  className?: string;
  fallback?: string;
  style?: React.CSSProperties;
}

export function Icon({ name, className = '', fallback, style }: IconProps) {
  const { iconfont } = siteConfig.icons;
  
  // 如果没有启用 iconfont 或者图标名称不是 iconfont 格式，显示备用图标
  if (!iconfont.enabled || !name.startsWith(iconfont.prefix)) {
    return fallback ? <span className={className} style={style}>{fallback}</span> : null;
  }

  // Symbol 方式使用 svg
  return (
    <svg 
      className={cn('iconfont', className)} 
      style={style} 
      aria-hidden="true"
    >
      <use xlinkHref={`#${name}`}></use>
    </svg>
  );
}

// Hook 用于检查图标是否可用
export function useIconAvailable(iconName: string): boolean {
  const { iconfont } = siteConfig.icons;
  
  if (!iconfont.enabled || !iconName.startsWith(iconfont.prefix)) {
    return false;
  }

  // 这里可以添加更复杂的检查逻辑，比如检查字体是否已加载
  return true;
} 