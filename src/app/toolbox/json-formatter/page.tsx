import { DocsSidebar } from '@/components/docs/docs-sidebar';
import { JsonFormatter } from '@/components/ui/json-formatter';
import { siteConfig } from '@/config/site.config';
import { parseDocsStructure } from '@/lib/docs';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'JSON 格式化工具 - ' + siteConfig.name,
  description: '专业的JSON格式化和验证工具，支持实时错误检测、一键复制导出、语法学习等功能',
  keywords: [
    'JSON格式化',
    'JSON验证',
    'JSON工具',
    'JSON美化',
    'JSON压缩',
    '开发工具',
    '代码格式化',
    'JSON学习'
  ],
  openGraph: {
    title: 'JSON 格式化工具 - ' + siteConfig.name,
    description: '专业的JSON格式化和验证工具，支持实时错误检测、一键复制导出、语法学习等功能',
    type: 'website',
    url: `${siteConfig.url}/toolbox/json-formatter`,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JSON 格式化工具 - ' + siteConfig.name,
    description: '专业的JSON格式化和验证工具，支持实时错误检测、一键复制导出、语法学习等功能',
  },
};

export default async function JsonFormatterPage() {
  const docsStructure = await parseDocsStructure();

  return (
    <div className="min-h-screen from-slate-50 via-gray-50 to-blue-50 dark:from-slate-900 dark:via-gray-900 dark:to-blue-900">
      {/* 左侧导航栏 */}
      <DocsSidebar items={docsStructure} />

      {/* 右侧主内容区 */}
      <main className="min-h-screen lg:ml-80 transition-all duration-300" id="docs-main-content">
        <div className="p-4 lg:p-6">
          <div className="mx-auto transition-all duration-300" id="docs-container">
            <div className="flex gap-8">
              {/* 主要内容区域 */}
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
                      <span className="text-foreground">JSON 格式化工具</span>
                    </nav>
                    
                    {/* JSON格式化组件 */}
                    <JsonFormatter />

                    {/* 使用说明 */}
                    <div className="mt-12 p-6 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900/50 dark:to-slate-900/50 rounded-xl border">
                      <h3 className="text-lg font-semibold mb-4">使用说明</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium text-primary mb-2">基本操作</h4>
                          <ul className="space-y-1 text-sm text-muted-foreground">
                            <li>• 在左侧输入框粘贴或输入JSON数据</li>
                            <li>• 系统会实时验证并格式化JSON</li>
                            <li>• 右侧显示格式化后的结果</li>
                            <li>• 支持自定义缩进大小（2、4、8空格或压缩）</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-primary mb-2">高级功能</h4>
                          <ul className="space-y-1 text-sm text-muted-foreground">
                            <li>• 精确的错误位置提示和说明</li>
                            <li>• 一键复制格式化结果到剪贴板</li>
                            <li>• 导出JSON文件到本地</li>
                            <li>• JSON语法学习卡片帮助理解</li>
                          </ul>
                        </div>
                      </div>
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