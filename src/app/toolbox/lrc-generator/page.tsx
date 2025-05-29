import { DocsSidebar } from '@/components/docs/docs-sidebar';
import { LrcGenerator } from '@/components/toolbox/lrc-generator';
import { siteConfig } from '@/config/site.config';
import { parseDocsStructure } from '@/lib/docs';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'LRC歌词制作工具 - ' + siteConfig.name,
  description: '专业的LRC歌词制作工具，支持实时音频播放，手动精确标记歌词时间轴，提供可视化编辑和实时预览功能',
  keywords: [
    'LRC歌词制作',
    '歌词时间轴',
    '手动制作歌词',
    '音频同步',
    '歌词编辑器',
    '实时预览',
    '精确标记',
    '可视化编辑',
    '专业工具'
  ],
  openGraph: {
    title: 'LRC歌词制作工具 - ' + siteConfig.name,
    description: '专业的LRC歌词制作工具，支持实时音频播放，手动精确标记歌词时间轴',
    type: 'website',
    url: `${siteConfig.url}/toolbox/lrc-generator`,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LRC歌词制作工具 - ' + siteConfig.name,
    description: '专业的LRC歌词制作工具，支持实时音频播放，手动精确标记歌词时间轴',
  },
};

export default async function LrcGeneratorPage() {
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
                    <span className="text-foreground">LRC歌词生成器</span>
                  </nav>

                  {/* LRC歌词生成器内容 */}
                  <LrcGenerator />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 