import { DocsSidebar } from '@/components/docs/docs-sidebar';
import { ApiTester } from '@/components/toolbox/api-tester';
import { siteConfig } from '@/config/site.config';
import { parseDocsStructure } from '@/lib/docs';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'API 测试器 - ' + siteConfig.name,
  description: '强大的API接口测试工具，支持多种请求方式、参数配置、认证方式等',
  keywords: [
    'API测试',
    'HTTP请求', 
    'Postman',
    '接口调试',
    '开发工具',
    '接口测试',
    'REST API',
    'API调试',
    '前端工具'
  ],
  openGraph: {
    title: 'API 测试器 - ' + siteConfig.name,
    description: '强大的API接口测试工具，支持多种请求方式、参数配置、认证方式等',
    type: 'website',
    url: `${siteConfig.url}/toolbox/api-tester`,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'API 测试器 - ' + siteConfig.name,
    description: '强大的API接口测试工具，支持多种请求方式、参数配置、认证方式等',
  },
};

export default async function ApiTesterPage() {
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
                    <span className="text-foreground">API 测试器</span>
                  </nav>

                  {/* API 测试器内容 */}
                  <ApiTester />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 