export const siteConfig = {
  name: "Slavopolis Docs",
  title: "Slavopolis - 现代化技术文档与博客系统",
  description: "基于 React、Next.js、TailwindCSS 构建的现代化静态博客系统，提供优雅的技术文档和博客展示平台",
    url: "https://github.com/slavopolis/slavopolis-docs",
  logo: "/logo.png",
  favicon: "/favicon.png",
  language: "zh-CN",
  timezone: "Asia/Shanghai",
  
  // SEO 配置
  seo: {
    keywords: [
      "博客",
      "技术文档", 
      "前端开发",
      "React",
      "Next.js",
      "TypeScript",
      "TailwindCSS",
      "静态站点生成器"
    ],
    ogImage: "/og-image.png",
    twitterHandle: "@slavopolis",
    author: "Slavopolis Team",
  },

  // 分析工具配置
  analytics: {
    googleAnalytics: process.env.NEXT_PUBLIC_GA_ID || "",
    baiduAnalytics: process.env.NEXT_PUBLIC_BAIDU_ID || "",
    umami: {
      websiteId: process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID || "",
      src: process.env.NEXT_PUBLIC_UMAMI_SRC || "",
    },
  },

  // 图标库配置
  icons: {
    // 阿里巴巴矢量图标库配置
    iconfont: {
      // 项目链接，用户可以配置自己的 iconfont 项目
          projectUrl: process.env.NEXT_PUBLIC_ICONFONT_URL || "//at.alicdn.com/t/c/font_4906716_wk1nps03939.js",
      // 是否启用
      enabled: true,
      // 前缀
      prefix: "icon-",
    },
    // 默认图标配置
    fallback: {
      website: "🌐",
      folder: "📁",
      file: "📄",
      link: "🔗",
      app: "📱",
    }
  },

  // 功能开关
  features: {
    search: true,
    darkMode: true,
    comments: true,
    rss: true,
    sitemap: true,
    analytics: true,
    pwa: false,
    // 新增百宝箱功能
    toolbox: true,
    siteNavigation: true,
  },

  // 百宝箱配置
  toolbox: {
    enabled: true,
    title: "百宝箱",
    description: "实用工具集合",
    // 应用列表
    apps: [
      {
        id: "ai-chat",
        name: "AI聊天助手",
        description: "与DeepSeek AI助手对话，支持代码生成、问题解答等",
            icon: "icon-deepseek", // iconfont 图标
        fallbackIcon: "🤖",
        href: "/toolbox/ai-chat",
        category: "AI工具",
        featured: true,
        protected: true, // 页面保护开关
        target: "_blank", // 新标签页打开
      },
      {
        id: "site-navigation",
        name: "站点导航",
        description: "常用网站快速导航",
          icon: "icon-baibaoxiangxuanzhongzhuangtai", // iconfont 图标
        fallbackIcon: "🧭",
        href: "/toolbox/site-navigation",
        category: "实用工具",
        featured: true,
        protected: false, // 页面保护开关 - 示例：此页面需要密码访问
        target: "_self", // 当前标签页打开
      },
      // 时间轴
      {
        id: "timeline",
        name: "时间轴",
        description: "系统更新发布时间轴",
          icon: "icon-shijian",
        fallbackIcon: "🕒",
          href: "/toolbox/timeline",
        category: "实用工具",
        featured: true,
        protected: false, // 页面保护开关 - 示例：此页面需要密码访问
        target: "_self", // 当前标签页打开
      },
      // LRC歌词生成器
      {
        id: "lrc-generator",
        name: "LRC歌词生成器",
        description: "上传音频和歌词文件，自动生成LRC格式歌词",
          icon: "icon-dongtaigeci", // iconfont 图标
        fallbackIcon: "🎵",
        href: "/toolbox/lrc-generator",
        category: "音频工具",
        featured: true,
        protected: false, // 页面保护开关
        target: "_self", // 当前标签页打开
      },
      // API 测试器
      {
        id: "api-tester",
        name: "API 测试器",
        description: "强大的API接口测试工具，支持多种请求方式、参数配置、认证方式等",
          icon: "icon-api",
        fallbackIcon: "🔧",
        href: "/toolbox/api-tester",
        category: "开发工具",
        featured: true,
        protected: false,
        target: "_self", // 当前标签页打开
      },
        // 软件推荐
        {
            id: "software-recommendation",
            name: "软件推荐",
            description: "精选开发软件工具",
            icon: "icon-software",
            fallbackIcon: "🔧",
            href: "/toolbox/software-recommendation",
            category: "开发工具",
            featured: true,
            protected: false,
            target: "_self", // 当前标签页打开
        },
      // 精选图集
    //   {
    //     id: "layout-grid",
    //     name: "精选图集",
    //     description: "精选图集",
    //       icon: "icon-unsplash",
    //     fallbackIcon: "🖼️",
    //     href: "/toolbox/layout-grid",
    //     category: "精选图集",
    //     featured: true,
    //     protected: false, // 页面保护开关
    //     target: "_self", // 当前标签页打开
    //   },
      // 后续可以添加更多应用
      {
        id: "json-formatter",
        name: "JSON 格式化",
        description: "专业的JSON格式化和验证工具，支持实时错误检测、一键复制导出",
          icon: "icon-json",
        fallbackIcon: "🔧",
        href: "/toolbox/json-formatter",
        category: "开发工具",
        featured: true,
        protected: false,
        target: "_self", // 当前标签页打开
      }
      // {
      //   id: "other-tool",
      //   name: "其他工具",
      //   description: "其他实用工具",
      //   icon: "icon-tool",
      //   fallbackIcon: "🛠️",
      //   href: "/toolbox/other-tool",
      //   category: "实用工具",
      //   featured: false,
      //   protected: false,
      //   target: "_self", // 当前标签页打开
      // }
    ]
  },

  // 内容配置
  content: {
    postsPerPage: 10,
    excerptLength: 200,
    dateFormat: "yyyy年MM月dd日",
    timeFormat: "HH:mm",
    showReadingTime: true,
    showTableOfContents: true,
    showLastModified: true,
  },

  // 社交媒体链接
  social: {
      github: "https://github.com/slavopolis/slavopolis-docs",
    twitter: "https://twitter.com/slavopolis",
    email: "slavopolis@gmail.com",
    rss: "/feed.xml",
  },

  // 版权信息
  copyright: {
    year: new Date().getFullYear(),
    owner: "Slavopolis Team",
    license: "MIT",
    message: "本站内容采用 CC BY-SA 4.0 协议，代码采用 MIT 协议",
  },
} as const;

// TypeScript 类型定义
export interface ToolboxApp {
  id: string;
  name: string;
  description: string;
  icon?: string;
  fallbackIcon: string;
  href: string;
  category: string;
  featured: boolean;
  protected: boolean;
  target: '_self' | '_blank'; // 跳转方式配置
}

export interface ToolboxConfig {
  enabled: boolean;
  title: string;
  description: string;
  apps: ToolboxApp[];
}

export type SiteConfig = typeof siteConfig; 