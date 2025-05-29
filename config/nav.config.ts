export interface NavItem {
  title: string;
  href: string;
  description?: string;
  external?: boolean;
  disabled?: boolean;
}

export interface NavItemWithChildren extends NavItem {
  items?: NavItemWithChildren[];
}

export interface FooterNavGroup {
  title: string;
  items: NavItem[];
}

export interface SidebarNavItem {
  title: string;
  disabled?: boolean;
  external?: boolean;
  icon?: string;
  items?: SidebarNavItem[];
  href?: string;
}

export const navConfig = {
  // 主导航菜单
  main: [
    {
      title: "首页",
      href: "/",
      description: "返回首页",
    },
    {
      title: "博客",
      href: "/blog",
      description: "技术博客文章",
    },
    {
      title: "文档",
      href: "/docs",
      description: "技术文档",
    },
    {
      title: "关于",
      href: "/about",
      description: "关于我们",
    },
  ] satisfies NavItem[],

  // 侧边栏导航配置
  sidebar: {
    "/docs": [
      {
        title: "快速开始",
        items: [
          {
            title: "介绍",
            href: "/docs",
          },
          {
            title: "安装",
            href: "/docs/installation",
          },
          {
            title: "配置",
            href: "/docs/configuration",
          },
        ],
      },
      {
        title: "核心概念",
        items: [
          {
            title: "项目结构",
            href: "/docs/project-structure",
          },
          {
            title: "路由系统",
            href: "/docs/routing",
          },
          {
            title: "内容管理",
            href: "/docs/content-management",
          },
          {
            title: "主题系统",
            href: "/docs/theming",
          },
        ],
      },
      {
        title: "高级功能",
        items: [
          {
            title: "搜索功能",
            href: "/docs/search",
          },
          {
            title: "MDX 组件",
            href: "/docs/mdx-components",
          },
          {
            title: "插件系统",
            href: "/docs/plugins",
          },
          {
            title: "部署指南",
            href: "/docs/deployment",
          },
        ],
      },
      {
        title: "API 参考",
        items: [
          {
            title: "配置 API",
            href: "/docs/api/configuration",
          },
          {
            title: "组件 API",
            href: "/docs/api/components",
          },
          {
            title: "工具函数",
            href: "/docs/api/utilities",
          },
        ],
      },
    ],
    "/blog": [
      {
        title: "分类",
        items: [
          {
            title: "前端开发",
            href: "/blog/category/frontend",
          },
          {
            title: "后端开发",
            href: "/blog/category/backend",
          },
          {
            title: "DevOps",
            href: "/blog/category/devops",
          },
          {
            title: "人工智能",
            href: "/blog/category/ai",
          },
        ],
      },
      {
        title: "标签",
        items: [
          {
            title: "React",
            href: "/blog/tag/react",
          },
          {
            title: "Next.js",
            href: "/blog/tag/nextjs",
          },
          {
            title: "TypeScript",
            href: "/blog/tag/typescript",
          },
          {
            title: "TailwindCSS",
            href: "/blog/tag/tailwindcss",
          },
        ],
      },
    ],
  } satisfies Record<string, SidebarNavItem[]>,

  // 页脚导航
  footer: [
    {
      title: "产品",
      items: [
        {
          title: "文档",
          href: "/docs",
        },
        {
          title: "博客",
          href: "/blog",
        },
        {
          title: "更新日志",
          href: "/changelog",
        },
      ],
    },
    {
      title: "资源",
      items: [
        {
          title: "GitHub",
          href: "https://github.com/slavopolis",
          external: true,
        },
        {
          title: "示例",
          href: "/examples",
        },
        {
          title: "模板",
          href: "/templates",
        },
      ],
    },
    {
      title: "社区",
      items: [
        {
          title: "Discord",
          href: "https://discord.gg/slavopolis",
          external: true,
        },
        {
          title: "Twitter",
          href: "https://twitter.com/slavopolis",
          external: true,
        },
        {
          title: "讨论区",
          href: "https://github.com/slavopolis/discussions",
          external: true,
        },
      ],
    },
    {
      title: "法律",
      items: [
        {
          title: "隐私政策",
          href: "/privacy",
        },
        {
          title: "服务条款",
          href: "/terms",
        },
        {
          title: "许可证",
          href: "/license",
        },
      ],
    },
  ] satisfies FooterNavGroup[],
} as const;

export type NavConfig = typeof navConfig; 