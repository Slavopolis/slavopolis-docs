'use client';

import { cn } from "@/lib/utils";
import { Eye, EyeOff, Lock, Shield, Unlock } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";

interface PageProtectionProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlock: () => void;
  appName: string;
  appDescription?: string;
}

export function PageProtection({ 
  isOpen, 
  onClose, 
  onUnlock, 
  appName, 
  appDescription 
}: PageProtectionProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [pressedKey, setPressedKey] = useState<string | null>(null);

  // 重置状态
  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setError('');
      setAttempts(0);
      setShowPassword(false);
      setPressedKey(null);
    }
  }, [isOpen]);

  // 验证密码
  const verifyPassword = useCallback(async () => {
    if (!password.trim()) {
      setError('请输入访问密码');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // 模拟API调用验证密码
      const response = await fetch('/api/verify-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: password.trim() }),
      });

      if (response.ok) {
        // 密码正确，解锁页面
        onUnlock();
        onClose();
      } else {
        // 密码错误
        setAttempts(prev => prev + 1);
        setError('密码错误，请重试');
        setPassword('');
        
        // 多次尝试失败后的处理
        if (attempts >= 2) {
          setError('多次密码错误，请稍后再试');
          setTimeout(() => {
            onClose();
          }, 2000);
        }
      }
    } catch (err) {
      setError('验证失败，请检查网络连接');
    } finally {
      setIsLoading(false);
    }
  }, [password, onUnlock, onClose, attempts]);

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      verifyPassword();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  // 全局键盘事件监听
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (e.key === 'Escape') {
        e.preventDefault();
        setPressedKey('Escape');
        onClose();
      } else if (e.key === 'Enter' && !isLoading) {
        e.preventDefault();
        setPressedKey('Enter');
        verifyPassword();
      }
    };

    const handleGlobalKeyUp = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (e.key === 'Escape' || e.key === 'Enter') {
        // 延迟重置按键状态，让用户看到按下效果
        setTimeout(() => setPressedKey(null), 150);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleGlobalKeyDown);
      document.addEventListener('keyup', handleGlobalKeyUp);
    }

    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown);
      document.removeEventListener('keyup', handleGlobalKeyUp);
    };
  }, [isOpen, isLoading, onClose, verifyPassword]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center">
        {/* 背景遮罩 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* 解锁对话框 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md mx-4 bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden"
        >
          {/* 头部装饰 */}
          <div className="relative h-24 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 dark:from-blue-500/20 dark:via-purple-500/20 dark:to-pink-500/20">
            <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent dark:from-black/20 dark:to-transparent" />
            <div className="relative flex items-center justify-center h-full">
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
                className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg"
              >
                <Shield className="h-6 w-6 text-white" />
              </motion.div>
            </div>
          </div>

          {/* 内容区域 */}
          <div className="p-6 space-y-6">
            {/* 标题和描述 */}
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                访问受保护的内容
              </h2>
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  {appName}
                </p>
                {appDescription && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {appDescription}
                  </p>
                )}
              </div>
            </div>

            {/* 密码输入区域 */}
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="请输入访问密码"
                  className={cn(
                    "w-full h-12 pl-10 pr-12 rounded-xl border border-gray-200 dark:border-gray-700",
                    "bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100",
                    "placeholder:text-gray-400 dark:placeholder:text-gray-500",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500",
                    "transition-all duration-200",
                    error && "border-red-300 dark:border-red-700 focus:ring-red-500/30 focus:border-red-500"
                  )}
                  disabled={isLoading}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>

              {/* 错误信息 */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg border border-red-200 dark:border-red-800"
                  >
                    <div className="w-1 h-1 bg-red-500 rounded-full animate-pulse" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 尝试次数提示 */}
              {attempts > 0 && (
                <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  已尝试 {attempts}/3 次
                </div>
              )}
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 h-11 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                disabled={isLoading}
              >
                取消
              </button>
              <button
                onClick={verifyPassword}
                disabled={isLoading || !password.trim()}
                className={cn(
                  "flex-1 h-11 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium",
                  "hover:from-blue-600 hover:to-purple-700 transition-all duration-200",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "flex items-center justify-center gap-2"
                )}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    验证中...
                  </>
                ) : (
                  <>
                    <Unlock className="h-4 w-4" />
                    解锁访问
                  </>
                )}
              </button>
            </div>

            {/* 底部提示 */}
            <div className="text-center">
              <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center justify-center gap-2">
                <span>按</span>
                <kbd className={cn(
                  "inline-flex items-center justify-center min-w-[32px] h-7 px-2.5 text-xs font-mono font-semibold text-gray-800 dark:text-gray-200 bg-gradient-to-b border-2 border-gray-300 dark:border-gray-500 rounded-lg transition-all duration-150 transform",
                  pressedKey === 'Enter' 
                    ? "from-gray-200 via-gray-300 to-gray-400 dark:from-gray-700 dark:via-gray-800 dark:to-gray-900 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] scale-95 translate-y-0.5" 
                    : "from-white via-gray-50 to-gray-100 dark:from-gray-600 dark:via-gray-700 dark:to-gray-800 shadow-[0_2px_4px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.6)] dark:shadow-[0_2px_4px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.8)] dark:hover:shadow-[0_4px_8px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15)] hover:scale-110 hover:-translate-y-0.5 active:scale-95 active:translate-y-0"
                )}>
                  Enter
                </kbd>
                <span>确认，</span>
                <kbd className={cn(
                  "inline-flex items-center justify-center min-w-[32px] h-7 px-2.5 text-xs font-mono font-semibold text-gray-800 dark:text-gray-200 bg-gradient-to-b border-2 border-gray-300 dark:border-gray-500 rounded-lg transition-all duration-150 transform",
                  pressedKey === 'Escape' 
                    ? "from-gray-200 via-gray-300 to-gray-400 dark:from-gray-700 dark:via-gray-800 dark:to-gray-900 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] scale-95 translate-y-0.5" 
                    : "from-white via-gray-50 to-gray-100 dark:from-gray-600 dark:via-gray-700 dark:to-gray-800 shadow-[0_2px_4px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.6)] dark:shadow-[0_2px_4px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.8)] dark:hover:shadow-[0_4px_8px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15)] hover:scale-110 hover:-translate-y-0.5 active:scale-95 active:translate-y-0"
                )}>
                  Esc
                </kbd>
                <span>取消</span>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
} 