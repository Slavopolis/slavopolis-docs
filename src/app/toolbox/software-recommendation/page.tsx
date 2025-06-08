import { DocsSidebar } from '@/components/docs/docs-sidebar';
import { SoftwareRecommendation } from '@/components/toolbox/software-recommendation';
import { siteConfig } from '@/config/site.config';
import { parseDocsStructure } from '@/lib/docs';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '开发者软件推荐 - ' + siteConfig.name,
  description: '精选编程开发领域的优质软件工具，提升你的开发效率和体验',
  keywords: ['软件推荐', '开发工具', 'IDE', '编辑器', '数据库工具', '版本控制', 'API测试', '设计工具'],
  openGraph: {
    title: '开发者软件推荐 - ' + siteConfig.name,
    description: '精选编程开发领域的优质软件工具，提升你的开发效率和体验',
    type: 'website',
    url: `${siteConfig.url}/toolbox/software-recommendation`,
  },
  twitter: {
    card: 'summary_large_image',
    title: '开发者软件推荐 - ' + siteConfig.name,
    description: '精选编程开发领域的优质软件工具，提升你的开发效率和体验',
  },
};

export default async function SoftwareRecommendationPage() {
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
                    <span className="text-foreground">软件推荐</span>
                  </nav>

                  {/* 软件推荐内容 */}
                  <SoftwareRecommendation />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 