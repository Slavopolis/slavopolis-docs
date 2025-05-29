'use client';

import { PageProtection } from "@/components/auth/PageProtection";
import { Icon } from "@/components/iconfont-loader";
import { FloatingDock } from "@/components/ui/floating-dock";
import { siteConfig } from "@/config/site.config";
import { usePageProtection } from "@/hooks/use-page-protection";
import { IconHome } from "@tabler/icons-react";

export function GlobalMenu() {
    const {
        isProtectionOpen,
        currentApp,
        tryAccessApp,
        unlockApp,
        closeProtection,
    } = usePageProtection();

    // 处理应用点击
    const handleAppClick = (app: any) => {
        const protectedApp = {
            id: app.id || app.href.split('/').pop() || 'unknown',
            name: app.name || app.title,
            description: app.description || '',
            href: app.href,
        };

        // 尝试访问应用
        if (tryAccessApp(protectedApp)) {
            // 如果不需要保护或已解锁，直接跳转
            window.location.href = app.href;
        }
        // 如果需要保护，tryAccessApp会自动打开保护对话框
    };

    // 创建链接数组，保持首页不变，其他链接从site.config.ts获取
    const links = [
        {
            title: "首页",
            icon: (
                <IconHome className="h-full w-full text-neutral-500 dark:text-neutral-300" />
            ),
            href: "/",
            onClick: () => window.location.href = "/",
        },
        // 添加site.config.ts中的应用
        ...siteConfig.toolbox.apps.map(app => ({
            title: app.name,
            icon: app.icon?.startsWith(siteConfig.icons.iconfont.prefix) 
                ? <Icon name={app.icon} className="h-full w-full text-neutral-500 dark:text-neutral-300" />
                : <span className="text-lg text-neutral-500 dark:text-neutral-300">{app.fallbackIcon}</span>,
            href: app.href,
            onClick: () => handleAppClick(app),
        }))
    ];
    
    return (
        <>
            <FloatingDock items={links} />
            <PageProtection
                isOpen={isProtectionOpen}
                onClose={closeProtection}
                onUnlock={unlockApp}
                appName={currentApp?.name || ''}
                appDescription={currentApp?.description || ''}
            />
        </>
    );
} 