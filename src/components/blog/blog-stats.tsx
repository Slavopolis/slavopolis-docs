import { Book, Download, FileText, Play } from "lucide-react";

const stats = [
  {
    icon: Play,
    title: "快速开始",
    description: "通过我们的预构建组件和页面增强您的项目。",
  },
  {
    icon: Download,
    title: "安装指南",
    description: "通过我们的预构建组件和页面增强您的项目。",
  },
  {
    icon: FileText,
    title: "组件文档",
    description: "通过我们的预构建组件和页面增强您的项目。",
  },
  {
    icon: Book,
    title: "API 参考",
    description: "通过我们的预构建组件和页面增强您的项目。",
  },
];

export function BlogStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="group relative overflow-hidden rounded-lg border bg-background p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <Icon className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">{stat.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {stat.description}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
} 