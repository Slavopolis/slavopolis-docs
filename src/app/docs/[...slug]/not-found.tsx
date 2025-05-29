import { FileQuestion, Home, Search } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen from-slate-50 via-gray-50 to-blue-50 dark:from-slate-900 dark:via-gray-900 dark:to-blue-900 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center px-4">
        <div className="bg-background/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-border/50 p-8">
          {/* 404 图标 */}
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
            <FileQuestion className="h-10 w-10 text-white" />
          </div>

          {/* 标题 */}
          <h1 className="text-2xl font-bold mb-4 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-600 dark:from-white dark:via-gray-200 dark:to-gray-400 bg-clip-text text-transparent">
            文档未找到
          </h1>

          {/* 描述 */}
          <p className="text-muted-foreground mb-8 leading-relaxed">
            抱歉，您访问的文档页面不存在或已被移动。请检查 URL 是否正确，或使用下方的链接导航到其他页面。
          </p>

          {/* 操作按钮 */}
          <div className="space-y-3">
            <Link
              href="/docs"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              <Home className="h-4 w-4" />
              返回文档首页
            </Link>

            <Link
              href="/"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border border-border/60 text-muted-foreground hover:text-foreground hover:border-border rounded-lg transition-colors"
            >
              <Search className="h-4 w-4" />
              回到主页
            </Link>
          </div>

          {/* 帮助信息 */}
          <div className="mt-8 pt-6 border-t border-border/30">
            <p className="text-xs text-muted-foreground">
              如果您认为这是一个错误，请
              <a
                href="https://github.com/slavopolis/slavopolis-docs/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 underline ml-1"
              >
                提交反馈
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 