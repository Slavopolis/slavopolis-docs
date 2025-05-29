import { Button } from "@/components/common/ui/button";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import Link from "next/link";

const featuredPosts = [
  {
    id: "react-best-practices",
    title: "React 最佳实践指南",
    description: "深入探讨 React 开发中的最佳实践，包括组件设计、状态管理、性能优化等方面",
    date: "2024-01-15",
    readTime: "8 分钟",
    category: "前端开发",
    href: "/blog/frontend/react/best-practices",
    featured: true,
  },
  {
    id: "nodejs-performance",
    title: "Node.js 性能优化完全指南",
    description: "从内存管理到异步处理，全面提升 Node.js 应用性能的实用技巧",
    date: "2024-01-12",
    readTime: "12 分钟",
    category: "后端开发",
    href: "/blog/backend/nodejs/performance",
    featured: true,
  },
  {
    id: "typescript-advanced",
    title: "TypeScript 高级特性深度解析",
    description: "掌握 TypeScript 的高级类型系统，提升代码质量和开发效率",
    date: "2024-01-10",
    readTime: "15 分钟",
    category: "前端开发",
    href: "/blog/frontend/typescript/advanced",
    featured: true,
  },
];

export function FeaturedPosts() {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">精选文章</h2>
        <Button variant="outline" asChild>
          <Link href="/blog/featured">
            查看全部
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {featuredPosts.map((post) => (
          <article
            key={post.id}
            className="group relative overflow-hidden rounded-lg border bg-card hover:shadow-lg transition-all duration-200"
          >
            <div className="p-6 space-y-4">
              {/* 分类标签 */}
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                  {post.category}
                </span>
                {post.featured && (
                  <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">
                    精选
                  </span>
                )}
              </div>

              {/* 标题和描述 */}
              <div className="space-y-2">
                <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors">
                  <Link href={post.href} className="stretched-link">
                    {post.title}
                  </Link>
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {post.description}
                </p>
              </div>

              {/* 元信息 */}
              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>{post.date}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{post.readTime}</span>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
} 