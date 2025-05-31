'use client';

import { siteConfig } from '@/config/site.config';
import { useCallback, useState } from 'react';

interface ProtectedApp {
  id: string;
  name: string;
  description: string;
  href: string;
}

export function usePageProtection() {
  const [isProtectionOpen, setIsProtectionOpen] = useState(false);
  const [currentApp, setCurrentApp] = useState<ProtectedApp | null>(null);
  const [unlockedApps, setUnlockedApps] = useState<Set<string>>(new Set());

  // 检查应用是否需要保护
  const isAppProtected = useCallback((appId: string) => {
    const app = siteConfig.toolbox.apps.find(app => app.id === appId);
    return app?.protected === true;
  }, []);

  // 检查应用是否已解锁
  const isAppUnlocked = useCallback((appId: string) => {
    return unlockedApps.has(appId);
  }, [unlockedApps]);

  // 尝试访问应用
  const tryAccessApp = useCallback((app: ProtectedApp) => {
    if (isAppProtected(app.id) && !isAppUnlocked(app.id)) {
      // 需要密码验证
      setCurrentApp(app);
      setIsProtectionOpen(true);
      return false; // 阻止访问
    }
    return true; // 允许访问
  }, [isAppProtected, isAppUnlocked]);

  // 解锁应用
  const unlockApp = useCallback(() => {
    if (currentApp) {
      setUnlockedApps(prev => new Set([...prev, currentApp.id]));
      
      // 获取应用配置以确定跳转方式
      const appConfig = siteConfig.toolbox.apps.find(app => app.id === currentApp.id);
      const targetWindow = appConfig?.target || '_self';
      
      // 根据target配置进行跳转
      if (targetWindow === '_blank') {
        // 新标签页打开
        window.open(currentApp.href, '_blank', 'noopener,noreferrer');
      } else {
        // 当前标签页打开
        window.location.href = currentApp.href;
      }
    }
  }, [currentApp]);

  // 关闭保护对话框
  const closeProtection = useCallback(() => {
    setIsProtectionOpen(false);
    setCurrentApp(null);
  }, []);

  return {
    isProtectionOpen,
    currentApp,
    tryAccessApp,
    unlockApp,
    closeProtection,
    isAppProtected,
    isAppUnlocked,
  };
} 