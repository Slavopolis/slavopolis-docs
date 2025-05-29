import { DocsSidebar } from '@/components/docs/docs-sidebar';
import { SiteNavigation } from '@/components/toolbox/site-navigation';
import { siteConfig } from '@/config/site.config';
import { parseDocsStructure } from '@/lib/docs';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '站点导航 - ' + siteConfig.name,
  description: '发现优质网站，提升工作效率。精选常用开发工具、设计资源、效率工具等网站导航。',
  keywords: [
    '站点导航',
    '网站导航',
    '开发工具',
    '设计资源',
    '效率工具',
    '常用网站',
    '在线工具',
    '前端开发',
    'UI设计',
    '生产力工具'
  ],
  openGraph: {
    title: '站点导航 - ' + siteConfig.name,
    description: '发现优质网站，提升工作效率',
    type: 'website',
    url: `${siteConfig.url}/toolbox/site-navigation`,
  },
  twitter: {
    card: 'summary_large_image',
    title: '站点导航 - ' + siteConfig.name,
    description: '发现优质网站，提升工作效率',
  },
};

export default async function SiteNavigationPage() {
  // 解析文档结构用于侧边栏
  const docsStructure = await parseDocsStructure();

  return (
    <div className="min-h-screen from-slate-50 via-gray-50 to-blue-50 dark:from-slate-900 dark:via-gray-900 dark:to-blue-900">
      {/* 左侧导航栏 */}
      <DocsSidebar items={docsStructure} />

      {/* 右侧主内容区 */}
      <main className="min-h-screen lg:ml-80 transition-all duration-300" id="docs-main-content">
        <div className="p-4 lg:p-6">
          <div className="mx-auto transition-all duration-300 max-w-7xl" id="docs-container">
            <div className="flex-1 min-w-0 transition-all duration-300 max-w-none" id="docs-content">
              <div className="bg-background/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-border/50 overflow-hidden">
                <div className="px-8 py-8 lg:px-12 lg:py-10">
                  {/* 面包屑导航 */}
                  <nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-8">
                    <a href="/" className="hover:text-foreground transition-colors">Slavopolis</a>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m9 18 6-6-6-6"></path>
                    </svg>
                    <a href="/docs" className="hover:text-foreground transition-colors">Docs</a>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m9 18 6-6-6-6"></path>
                    </svg>
                    <span className="text-foreground">站点导航</span>
                  </nav>

                  {/* 站点导航内容 */}
                  <SiteNavigation />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 