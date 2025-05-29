import { Button } from "@/components/common/ui/button";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import Link from "next/link";

const recentPosts = [
  {
    id: "vue3-composition-api",
    title: "Vue 3 Composition API 深度指南",
    description: "全面了解 Vue 3 Composition API 的使用方法和最佳实践",
    date: "2024-01-18",
    readTime: "10 分钟",
    category: "前端开发",
    href: "/blog/frontend/vue/composition-api",
  },
  {
    id: "docker-optimization",
    title: "Docker 容器优化实战",
    description: "从镜像构建到运行时优化，全面提升 Docker 容器性能",
    date: "2024-01-17",
    readTime: "12 分钟",
    category: "DevOps",
    href: "/blog/devops/docker",
  },
  {
    id: "mongodb-indexing",
    title: "MongoDB 索引优化策略",
    description: "深入理解 MongoDB 索引机制，提升查询性能",
    date: "2024-01-16",
    readTime: "14 分钟",
    category: "数据库",
    href: "/blog/backend/database/mongodb",
  },
  {
    id: "kubernetes-deployment",
    title: "Kubernetes 部署最佳实践",
    description: "从基础部署到高级配置，掌握 Kubernetes 部署技巧",
    date: "2024-01-14",
    readTime: "16 分钟",
    category: "DevOps",
    href: "/blog/devops/kubernetes",
  },
  {
    id: "machine-learning-intro",
    title: "机器学习入门指南",
    description: "从零开始学习机器学习的基本概念和实践方法",
    date: "2024-01-13",
    readTime: "20 分钟",
    category: "人工智能",
    href: "/blog/ai/machine-learning",
  },
];

export function RecentPosts() {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">最新文章</h2>
        <Button variant="outline" asChild>
          <Link href="/blog/recent">
            查看全部
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="space-y-4">
        {recentPosts.map((post) => (
          <article
            key={post.id}
            className="group flex flex-col sm:flex-row gap-4 p-4 rounded-lg border bg-card hover:shadow-md transition-all duration-200"
          >
            <div className="flex-1 space-y-3">
              {/* 分类标签 */}
              <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium">
                {post.category}
              </span>

              {/* 标题和描述 */}
              <div className="space-y-2">
                <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors">
                  <Link href={post.href}>
                    {post.title}
                  </Link>
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
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

            {/* 阅读按钮 */}
            <div className="flex items-center sm:items-start">
              <Button variant="ghost" size="sm" asChild>
                <Link href={post.href}>
                  阅读文章
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </div>
          </article>
        ))}
      </div>

      {/* 底部帮助信息 */}
      <div className="mt-12 p-6 rounded-lg bg-muted/50">
        <h3 className="font-semibold text-lg mb-2">需要帮助？</h3>
        <p className="text-muted-foreground mb-4">
          有问题、需要帮助或建议，请联系我们的支持团队。我们随时为您提供帮助！
        </p>
        <p className="text-sm text-muted-foreground">
          查看: <Link href="/help" className="text-primary hover:underline">获取帮助</Link>
        </p>
      </div>
    </section>
  );
} 