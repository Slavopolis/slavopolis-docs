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
      <main className="min-h-screen lg:ml-80 transition-all duration-300">
        <div className="p-4 lg:p-6">
          <div className="mx-auto transition-all duration-300 max-w-7xl">
            <div className="flex gap-8">
              {/* 主要内容区域 */}
              <div className="flex-1 min-w-0 transition-all duration-300">
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

                    {/* 页面头部 */}
                    <header className="mb-10">
                      {/* <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                          </svg>
                        </div>
                        <div>
                          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight bg-gradient-to-r from-gray-900 via-gray-800 to-gray-600 dark:from-white dark:via-gray-200 dark:to-gray-400 bg-clip-text text-transparent">
                            JSON 格式化工具
                          </h1>
                          <p className="text-lg lg:text-xl text-muted-foreground mt-2 leading-relaxed">
                            专业的JSON格式化和验证工具，支持实时错误检测、一键复制导出、语法学习等功能
                          </p>
                        </div>
                      </div> */}

                      {/* 功能特性 */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-lg border border-green-200 dark:border-green-800">
                          <div className="p-2 bg-green-500 rounded-lg">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="font-semibold text-green-800 dark:text-green-200">实时验证</h3>
                            <p className="text-xs text-green-600 dark:text-green-300">即时检测语法错误</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                          <div className="p-2 bg-blue-500 rounded-lg">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="font-semibold text-blue-800 dark:text-blue-200">一键复制</h3>
                            <p className="text-xs text-blue-600 dark:text-blue-300">快速复制格式化结果</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
                          <div className="p-2 bg-purple-500 rounded-lg">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="font-semibold text-purple-800 dark:text-purple-200">学习模式</h3>
                            <p className="text-xs text-purple-600 dark:text-purple-300">JSON语法快速学习</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 rounded-lg border border-orange-200 dark:border-orange-800">
                          <div className="p-2 bg-orange-500 rounded-lg">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="font-semibold text-orange-800 dark:text-orange-200">导出功能</h3>
                            <p className="text-xs text-orange-600 dark:text-orange-300">支持文件导出下载</p>
                          </div>
                        </div>
                      </div>
                    </header>

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