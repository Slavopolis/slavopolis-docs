import { DocsSidebar } from '@/components/docs/docs-sidebar';
import { Timeline } from "@/components/ui/timeline";
import { siteConfig } from '@/config/site.config';
import { timelineData } from '@/config/timeline.config';
import { parseDocsStructure } from '@/lib/docs';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '时间线组件 - ' + siteConfig.name,
  description: '展示Slavopolis静态博客站点开发历程和功能演进的时间线',
  keywords: [
    '时间线',
    '时间轴',
    'Timeline',
    '开发历程',
    '项目历程',
    '功能演进',
    '里程碑',
    '博客开发',
    'Slavopolis'
  ],
  openGraph: {
    title: '时间线组件 - ' + siteConfig.name,
    description: '展示Slavopolis静态博客站点开发历程和功能演进',
    type: 'website',
    url: `${siteConfig.url}/toolbox/timeline`,
  },
  twitter: {
    card: 'summary_large_image',
    title: '时间线组件 - ' + siteConfig.name,
    description: '展示Slavopolis静态博客站点开发历程和功能演进',
  },
};

/**
 * 时间线演示组件
 * @description 展示Slavopolis静态博客站点的开发时间线
 */
export function TimelineDemo() {
    return (
        <div className="relative w-full overflow-clip">
            <Timeline data={timelineData} />
        </div>
    );
}

export default async function TimelinePage() {
  // 解析文档结构用于侧边栏
  const docsStructure = await parseDocsStructure();

  return (
    <div className="min-h-screen from-slate-50 via-gray-50 to-blue-50 dark:from-slate-900 dark:via-gray-900 dark:to-blue-900">
      {/* 左侧导航栏 */}
      <DocsSidebar items={docsStructure} />

      {/* 右侧主内容区 */}
      <main className="min-h-screen lg:ml-80 transition-all duration-300" id="docs-main-content">
        <div className="p-4 lg:p-6">
          <div className="mx-auto transition-all duration-300" id="docs-container">
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
                    <span className="text-foreground">时间线组件</span>
                  </nav>

                  {/* 页面标题和描述 */}
                  <div className="mb-10">
                    <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">
                      Slavopolis 开发时间线
                    </h1>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      回顾Slavopolis静态博客站点的开发历程，从项目初始化到AI聊天助手集成，见证每一个重要功能的诞生与演进。
                    </p>
                  </div>

                  {/* 时间线组件内容 */}
                  <div className="space-y-8">   
                    <div className="my-10">
                      <TimelineDemo />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
