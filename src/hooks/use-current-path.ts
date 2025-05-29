'use client';

import { usePathname } from 'next/navigation';

export function useCurrentPath() {
  const pathname = usePathname();
  
  // 移除开头的 /docs/ 前缀，获取实际的文档路径
  const currentPath = pathname.startsWith('/docs/') 
    ? pathname.replace('/docs/', '') 
    : pathname.replace('/docs', '');
    
  return {
    pathname,
    currentPath,
    isActive: (href: string) => {
      if (!href) return false;
      
      // 精确匹配当前路径
      if (currentPath === href) return true;
      
      // 检查是否是父路径（对于目录）
      if (currentPath.startsWith(href + '/')) return true;
      
      return false;
    }
  };
} 