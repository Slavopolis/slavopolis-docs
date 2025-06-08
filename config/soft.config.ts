export interface SoftwareImage {
  url: string;
  alt: string;
  caption?: string;
}

export interface SoftwareLink {
  type: 'download' | 'official' | 'docs' | 'github';
  label: string;
  url: string;
  primary?: boolean; // 主要链接
}

export interface SoftwareItem {
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  icon: string; // iconfont 图标类名
  fallbackIcon: string; // 备用 emoji 图标
  category: string;
  images: SoftwareImage[]; // 软件截图轮播
  links: SoftwareLink[];
  tags: string[]; // 标签
  platform: string[]; // 支持平台：Windows, macOS, Linux, Web
  featured?: boolean; // 是否推荐
  free?: boolean; // 是否免费
  openSource?: boolean; // 是否开源
  rating?: number; // 评分 1-5
}

export interface SoftwareCategory {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  order: number;
}

// 软件分类配置
export const softwareCategories: SoftwareCategory[] = [
  {
    id: "ide",
    name: "IDE & 编辑器",
    description: "集成开发环境和代码编辑器",
        icon: "icon-bianjiqi",
    color: "blue",
    order: 1,
  },
  {
    id: "database",
    name: "数据库工具",
    description: "数据库管理和开发工具",
      icon: "icon-a-ziyuan19000",
    color: "green",
    order: 2,
  },
  {
    id: "version-control",
    name: "版本控制",
    description: "Git 客户端和版本管理工具",
      icon: "icon-git",
    color: "orange",
    order: 3,
  },
  {
    id: "api-testing",
    name: "接口测试",
    description: "API 测试和调试工具",
      icon: "icon-api",
    color: "purple",
    order: 4,
  },
  {
    id: "design",
    name: "设计工具",
    description: "UI/UX 设计和原型工具",
      icon: "icon-icon-design-",
    color: "pink",
    order: 5,
  },
  {
    id: "terminal",
    name: "终端工具",
    description: "命令行终端和Shell工具",
      icon: "icon-iTerm2",
    color: "gray",
    order: 6,
  },
  {
    id: "devops",
    name: "DevOps 工具",
    description: "容器、部署和运维工具",
      icon: "icon-DevOpsxiangguan",
    color: "indigo",
    order: 7,
  },
  {
    id: "productivity",
    name: "效率工具",
    description: "提升开发效率的实用工具",
      icon: "icon-ico_efficient",
    color: "emerald",
    order: 8,
  },
];

// 软件推荐列表
export const softwareItems: SoftwareItem[] = [
  // IDE & 编辑器
  {
    id: "vscode",
    name: "Visual Studio Code",
    description: "微软开源的轻量级代码编辑器，支持丰富的插件生态",
    longDescription: "Visual Studio Code是微软开发的免费、开源、轻量级的代码编辑器。它具有强大的智能感知、内置Git支持、丰富的扩展生态系统，是目前最受欢迎的代码编辑器之一。",
    icon: "icon-vscode",
    fallbackIcon: "💻",
    category: "ide",
    images: [
      {
        url: "https://code.visualstudio.com/assets/docs/getstarted/userinterface/hero.png",
        alt: "VS Code 主界面",
        caption: "简洁而强大的编辑界面"
      },
      {
        url: "https://code.visualstudio.com/assets/docs/editor/debugging/debugging_hero.png",
        alt: "VS Code 调试功能",
        caption: "强大的调试功能"
      }
    ],
    links: [
      {
        type: "download",
        label: "官方下载",
        url: "https://code.visualstudio.com/download",
        primary: true
      },
      {
        type: "official",
        label: "官方网站",
        url: "https://code.visualstudio.com"
      },
      {
        type: "docs",
        label: "使用文档",
        url: "https://code.visualstudio.com/docs"
      },
      {
        type: "github",
        label: "GitHub",
        url: "https://github.com/microsoft/vscode"
      }
    ],
    tags: ["代码编辑器", "JavaScript", "TypeScript", "Python", "Java"],
    platform: ["Windows", "macOS", "Linux"],
    featured: true,
    free: true,
    openSource: true,
    rating: 5
  },
  {
    id: "idea",
    name: "IntelliJ IDEA",
    description: "JetBrains 开发的强大 Java IDE，支持多种编程语言",
    longDescription: "IntelliJ IDEA 是 JetBrains 公司开发的 Java 集成开发环境，被认为是目前最智能的 Java IDE。它提供了强大的代码分析、重构、调试功能，以及对 Spring、Maven、Git 等工具的深度集成。",
      icon: "icon-Idea",
    fallbackIcon: "🧠",
    category: "ide",
    images: [
      {
        url: "https://bxsb-dev.oss-cn-shanghai.aliyuncs.com/20250608130551064.png",
        alt: "IDEA 主界面",
        caption: "智能的 Java 开发环境"
      }
    ],
    links: [
      {
        type: "download",
        label: "官方下载",
        url: "https://www.jetbrains.com/idea/download/",
        primary: true
      },
      {
        type: "official",
        label: "官方网站",
        url: "https://www.jetbrains.com/idea/"
      },
      {
        type: "docs",
        label: "使用文档",
        url: "https://www.jetbrains.com/help/idea/"
      }
    ],
    tags: ["Java", "Spring", "Maven", "Gradle", "Kotlin"],
    platform: ["Windows", "macOS", "Linux"],
    featured: true,
    free: false,
    openSource: false,
    rating: 5
  },
  {
    id: "webstorm",
    name: "WebStorm",
    description: "JetBrains 专为 JavaScript 开发优化的 IDE",
    longDescription: "WebStorm 是专门为 JavaScript 和相关技术设计的集成开发环境。它提供了对 React、Angular、Vue.js、Node.js 等现代前端框架的出色支持。",
      icon: "icon-logo",
    fallbackIcon: "🌐",
    category: "ide",
    images: [
      {
            url: "https://bxsb-dev.oss-cn-shanghai.aliyuncs.com/20250608130957222.png",
        alt: "WebStorm 界面",
        caption: "专业的前端开发环境"
      }
    ],
    links: [
      {
        type: "download",
        label: "官方下载",
        url: "https://www.jetbrains.com/webstorm/download/",
        primary: true
      },
      {
        type: "official",
        label: "官方网站",
        url: "https://www.jetbrains.com/webstorm/"
      }
    ],
    tags: ["JavaScript", "TypeScript", "React", "Vue.js", "Angular"],
    platform: ["Windows", "macOS", "Linux"],
    featured: true,
    free: false,
    openSource: false,
    rating: 5
  },

  // 数据库工具
  {
    id: "navicat",
    name: "Navicat Premium",
    description: "功能强大的数据库开发工具，支持多种数据库",
    longDescription: "Navicat Premium 是一套数据库开发工具，让你从单一应用程序中同时连接 MySQL、PostgreSQL、Oracle、SQLite、SQL Server 及 MongoDB 数据库。",
      icon: "icon-navicat",
    fallbackIcon: "🗄️",
    category: "database",
    images: [
      {
            url: "https://bxsb-dev.oss-cn-shanghai.aliyuncs.com/20250608131127514.png",
        alt: "Navicat 主界面",
            caption: "直观且精心设计的 GUI 简化了您的数据库管理和开发。"
      },
        {
            url: "https://bxsb-dev.oss-cn-shanghai.aliyuncs.com/20250608131222021.png",
            alt: "对象设计器",
            caption: "使用智能对象设计器管理所有数据库对象。"
        },
        {
            url: "https://bxsb-dev.oss-cn-shanghai.aliyuncs.com/20250608131303174.png",
            alt: "代码完成",
            caption: "通过从下拉列表中选择建议来在查询编辑器中构建查询。"
        },
        {
            url: "https://bxsb-dev.oss-cn-shanghai.aliyuncs.com/20250608131347691.png",
            alt: "人工智能助手",
            caption: "随时在 Navicat 中直接获取 AI 帮助。让你能够提出问题并立即获得解答。"
        },
        {
            url: "https://bxsb-dev.oss-cn-shanghai.aliyuncs.com/20250608131414757.png",
            alt: "模型",
            caption: "构建数据结构并可视化其关系。优化结构以方便分析。"
        }
    ],
    links: [
      {
        type: "download",
        label: "官方下载",
        url: "https://navicat.com/download",
        primary: true
      },
      {
        type: "official",
        label: "官方网站",
        url: "https://navicat.com"
      }
    ],
    tags: ["MySQL", "PostgreSQL", "Oracle", "MongoDB", "数据库管理"],
    platform: ["Windows", "macOS", "Linux"],
    featured: true,
    free: false,
    openSource: false,
    rating: 4
  },
  {
    id: "dbeaver",
    name: "DBeaver",
    description: "免费开源的通用数据库工具",
    longDescription: "DBeaver 是一个免费的开源数据库工具，为开发人员和数据库管理员提供了一个强大的数据库管理平台。支持所有流行的数据库。",
      icon: "icon-DBeaver",
    fallbackIcon: "🦫",
    category: "database",
    images: [
      {
            url: "https://bxsb-dev.oss-cn-shanghai.aliyuncs.com/20250608131507149.png",
        alt: "DBeaver 界面",
        caption: "免费强大的数据库工具"
      },
        {
            url: "https://bxsb-dev.oss-cn-shanghai.aliyuncs.com/20250608131550331.png",
            alt: "DBeaver 界面",
            caption: "免费强大的数据库工具"
        },
        {
            url: "https://bxsb-dev.oss-cn-shanghai.aliyuncs.com/20250608131601152.png",
            alt: "DBeaver 界面",
            caption: "免费强大的数据库工具"
        },
        {
            url: "https://bxsb-dev.oss-cn-shanghai.aliyuncs.com/20250608131615974.png",
            alt: "DBeaver 界面",
            caption: "免费强大的数据库工具"
        }
    ],
    links: [
      {
        type: "download",
        label: "官方下载",
        url: "https://dbeaver.io/download/",
        primary: true
      },
      {
        type: "official",
        label: "官方网站",
        url: "https://dbeaver.io"
      },
      {
        type: "github",
        label: "GitHub",
        url: "https://github.com/dbeaver/dbeaver"
      }
    ],
    tags: ["MySQL", "PostgreSQL", "SQLite", "免费", "开源"],
    platform: ["Windows", "macOS", "Linux"],
    featured: true,
    free: true,
    openSource: true,
    rating: 4
  },

  // 版本控制
  {
    id: "sourcetree",
    name: "Sourcetree",
    description: "Atlassian 的免费 Git 客户端，可视化 Git 操作",
    longDescription: "Sourcetree 是 Atlassian 提供的免费 Git 客户端，为 Git 和 Mercurial 版本控制系统提供了简单易用的可视化界面。",
      icon: "icon-sourcetree",
    fallbackIcon: "🌳",
    category: "version-control",
    images: [
      {
        url: "https://wac-cdn.atlassian.com/dam/jcr:580c367b-c240-453d-aa18-c7ced44324f9/hero-mac-screenshot.png",
        alt: "Sourcetree 界面",
        caption: "可视化的 Git 操作界面"
      }
    ],
    links: [
      {
        type: "download",
        label: "官方下载",
        url: "https://www.sourcetreeapp.com",
        primary: true
      },
      {
        type: "official",
        label: "官方网站",
        url: "https://www.sourcetreeapp.com"
      }
    ],
    tags: ["Git", "版本控制", "可视化", "免费"],
    platform: ["Windows", "macOS"],
    featured: true,
    free: true,
    openSource: false,
    rating: 4
  },
  {
    id: "github-desktop",
    name: "GitHub Desktop",
    description: "GitHub 官方桌面客户端，简化 Git 工作流",
    longDescription: "GitHub Desktop 是 GitHub 官方提供的桌面应用程序，让你通过图形界面而不是命令行来使用 Git 和 GitHub。",
      icon: "icon-github",
    fallbackIcon: "🐙",
    category: "version-control",
    images: [
      {
            url: "https://bxsb-dev.oss-cn-shanghai.aliyuncs.com/20250608131731865.png",
        alt: "GitHub Desktop 界面",
        caption: "简洁的 GitHub 桌面客户端"
      }
    ],
    links: [
      {
        type: "download",
        label: "官方下载",
        url: "https://desktop.github.com",
        primary: true
      },
      {
        type: "github",
        label: "GitHub",
        url: "https://github.com/desktop/desktop"
      }
    ],
    tags: ["Git", "GitHub", "版本控制", "免费", "开源"],
    platform: ["Windows", "macOS"],
    featured: true,
    free: true,
    openSource: true,
    rating: 4
  },

  // 接口测试
  {
    id: "postman",
    name: "Postman",
    description: "最流行的 API 开发和测试平台",
    longDescription: "Postman 是一个用于 API 开发的协作平台。简化了构建 API 的每个步骤，从设计、测试到文档编写和监控。",
      icon: "icon-postman",
    fallbackIcon: "📮",
    category: "api-testing",
    images: [
      {
            url: "https://bxsb-dev.oss-cn-shanghai.aliyuncs.com/20250608131923771.png",
        alt: "Postman 工作区",
        caption: "强大的 API 测试环境"
      }
    ],
    links: [
      {
        type: "download",
        label: "官方下载",
        url: "https://www.postman.com/downloads/",
        primary: true
      },
      {
        type: "official",
        label: "官方网站",
        url: "https://www.postman.com"
      }
    ],
    tags: ["API 测试", "REST", "GraphQL", "协作"],
    platform: ["Windows", "macOS", "Linux", "Web"],
    featured: true,
    free: true,
    openSource: false,
    rating: 5
  },
  {
    id: "insomnia",
    name: "Insomnia",
    description: "简洁优雅的 REST 和 GraphQL 客户端",
    longDescription: "Insomnia 是一个功能强大的 REST 和 GraphQL 客户端，专注于提供简洁、直观的用户体验。支持环境变量、代码生成等高级功能。",
      icon: "icon-insomnia",
    fallbackIcon: "😴",
    category: "api-testing",
    images: [
      {
            url: "https://bxsb-dev.oss-cn-shanghai.aliyuncs.com/20250608132008355.png",
        alt: "Insomnia 界面",
        caption: "简洁的 API 测试界面"
      }
    ],
    links: [
      {
        type: "download",
        label: "官方下载",
        url: "https://insomnia.rest/download",
        primary: true
      },
      {
        type: "official",
        label: "官方网站",
        url: "https://insomnia.rest"
      }
    ],
    tags: ["API 测试", "REST", "GraphQL", "开源"],
    platform: ["Windows", "macOS", "Linux"],
    featured: true,
    free: true,
    openSource: true,
    rating: 4
  },

  // 设计工具
  {
    id: "figma",
    name: "Figma",
    description: "基于浏览器的协作式设计工具",
    longDescription: "Figma 是一个基于云的设计工具，类似于 Sketch，但具有更强的协作功能。支持实时协作、原型设计、设计系统等功能。",
      icon: "icon-Figma",
    fallbackIcon: "🎨",
    category: "design",
    images: [
      {
            url: "https://bxsb-dev.oss-cn-shanghai.aliyuncs.com/20250608132056825.png",
        alt: "Figma 设计界面",
        caption: "现代化的设计协作平台"
      }
    ],
    links: [
      {
        type: "official",
        label: "在线使用",
        url: "https://figma.com",
        primary: true
      },
      {
        type: "download",
        label: "桌面版下载",
        url: "https://www.figma.com/downloads/"
      }
    ],
    tags: ["UI 设计", "原型设计", "协作", "云端"],
    platform: ["Web", "Windows", "macOS"],
    featured: true,
    free: true,
    openSource: false,
    rating: 5
  },
  {
    id: "sketch",
    name: "Sketch",
    description: "专业的 macOS 矢量设计工具",
    longDescription: "Sketch 是一个为 macOS 设计的矢量图形编辑器，主要用于用户界面和用户体验设计。是很多设计师的首选工具。",
      icon: "icon-Sketch",
    fallbackIcon: "✏️",
    category: "design",
    images: [
      {
            url: "https://bxsb-dev.oss-cn-shanghai.aliyuncs.com/20250608132234946.png",
        alt: "Sketch 设计界面",
        caption: "专业的矢量设计工具"
      }
    ],
    links: [
      {
        type: "download",
        label: "官方下载",
        url: "https://www.sketch.com/get/",
        primary: true
      },
      {
        type: "official",
        label: "官方网站",
        url: "https://www.sketch.com"
      }
    ],
    tags: ["UI 设计", "矢量图形", "原型", "macOS"],
    platform: ["macOS"],
    featured: true,
    free: false,
    openSource: false,
    rating: 4
  },

  // 终端工具
  {
    id: "iterm2",
    name: "iTerm2",
    description: "macOS 上功能强大的终端替代品",
    longDescription: "iTerm2 是 macOS 终端的替代品，具有分屏、搜索、自动完成、复制模式、即时重播等强大功能。",
      icon: "icon-iTerm2",
    fallbackIcon: "💻",
    category: "terminal",
    images: [
      {
        url: "https://iterm2.com/img/screenshots/split_panes.png",
        alt: "iTerm2 分屏功能",
        caption: "强大的分屏和标签功能"
      }
    ],
    links: [
      {
        type: "download",
        label: "官方下载",
        url: "https://iterm2.com/downloads.html",
        primary: true
      },
      {
        type: "official",
        label: "官方网站",
        url: "https://iterm2.com"
      }
    ],
    tags: ["终端", "命令行", "分屏", "macOS"],
    platform: ["macOS"],
    featured: true,
    free: true,
    openSource: true,
    rating: 5
  },
  {
    id: "hyper",
    name: "Hyper",
    description: "基于 Web 技术构建的现代终端",
    longDescription: "Hyper 是一个基于 Electron 构建的终端应用，使用 HTML、CSS 和 JavaScript 构建。支持丰富的插件生态系统。",
      icon: "icon-hyper1",
    fallbackIcon: "⚡",
    category: "terminal",
    images: [
      {
            url: "https://bxsb-dev.oss-cn-shanghai.aliyuncs.com/20250608132442659.png",
        alt: "Hyper 终端界面",
        caption: "现代化的终端界面"
      }
    ],
    links: [
      {
        type: "download",
        label: "官方下载",
        url: "https://hyper.is/#installation",
        primary: true
      },
      {
        type: "official",
        label: "官方网站",
        url: "https://hyper.is"
      },
      {
        type: "github",
        label: "GitHub",
        url: "https://github.com/vercel/hyper"
      }
    ],
    tags: ["终端", "Electron", "插件", "跨平台"],
    platform: ["Windows", "macOS", "Linux"],
    featured: true,
    free: true,
    openSource: true,
    rating: 4
  },

  // DevOps 工具
  {
    id: "docker-desktop",
    name: "Docker Desktop",
    description: "容器化应用的开发和部署平台",
    longDescription: "Docker Desktop 是在 Windows 和 macOS 上运行 Docker 的官方应用程序。它提供了一个简单的界面来管理 Docker 容器和镜像。",
      icon: "icon-docker1",
    fallbackIcon: "🐳",
    category: "devops",
    images: [
      {
            url: "https://bxsb-dev.oss-cn-shanghai.aliyuncs.com/20250608132518068.png",
        alt: "Docker Desktop 界面",
        caption: "直观的容器管理界面"
      }
    ],
    links: [
      {
        type: "download",
        label: "官方下载",
        url: "https://www.docker.com/products/docker-desktop/",
        primary: true
      },
      {
        type: "official",
        label: "官方网站",
        url: "https://www.docker.com"
      },
      {
        type: "docs",
        label: "使用文档",
        url: "https://docs.docker.com"
      }
    ],
    tags: ["容器", "微服务", "DevOps", "部署"],
    platform: ["Windows", "macOS", "Linux"],
    featured: true,
    free: true,
    openSource: false,
    rating: 5
  },

  // 效率工具
  {
    id: "raycast",
    name: "Raycast",
    description: "macOS 上的高效启动器和生产力工具",
    longDescription: "Raycast 是一个极快、完全可扩展的启动器。它允许你控制工具、计算、共享通用链接等等。",
      icon: "icon-Raycast",
    fallbackIcon: "🚀",
    category: "productivity",
    images: [
      {
            url: "https://bxsb-dev.oss-cn-shanghai.aliyuncs.com/20250608132635164.png",
        alt: "Raycast 界面",
        caption: "强大的启动器和生产力工具"
      }
    ],
    links: [
      {
        type: "download",
        label: "官方下载",
        url: "https://raycast.com",
        primary: true
      },
      {
        type: "official",
        label: "官方网站",
        url: "https://raycast.com"
      }
    ],
    tags: ["启动器", "效率", "插件", "macOS"],
    platform: ["macOS"],
    featured: true,
    free: true,
    openSource: false,
    rating: 5
  },
  {
    id: "alfred",
    name: "Alfred",
    description: "macOS 上的强大搜索和自动化工具",
    longDescription: "Alfred 是一个屡获殊荣的应用程序，通过热键、关键字、文本扩展等功能提升效率。Alfred 可以搜索你的 Mac 和网络。",
      icon: "icon-alfred",
    fallbackIcon: "🎩",
    category: "productivity",
    images: [
      {
            url: "https://bxsb-dev.oss-cn-shanghai.aliyuncs.com/20250608132710288.png",
        alt: "Alfred 搜索界面",
        caption: "智能搜索和工作流"
      }
    ],
    links: [
      {
        type: "download",
        label: "官方下载",
        url: "https://www.alfredapp.com",
        primary: true
      },
      {
        type: "official",
        label: "官方网站",
        url: "https://www.alfredapp.com"
      }
    ],
    tags: ["搜索", "自动化", "工作流", "macOS"],
    platform: ["macOS"],
    featured: true,
    free: true,
    openSource: false,
    rating: 5
  }
];

// 工具函数
export const getSoftwareByCategory = (categoryId: string): SoftwareItem[] => {
  return softwareItems.filter(software => software.category === categoryId);
};

export const searchSoftware = (query: string): SoftwareItem[] => {
  const lowerQuery = query.toLowerCase();
  return softwareItems.filter(software =>
    software.name.toLowerCase().includes(lowerQuery) ||
    software.description.toLowerCase().includes(lowerQuery) ||
    software.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
};

export const getFeaturedSoftware = (): SoftwareItem[] => {
  return softwareItems.filter(software => software.featured);
};

export const getFreeSoftware = (): SoftwareItem[] => {
  return softwareItems.filter(software => software.free);
};

export const getOpenSourceSoftware = (): SoftwareItem[] => {
  return softwareItems.filter(software => software.openSource);
};

export const getCategoryById = (categoryId: string): SoftwareCategory | undefined => {
  return softwareCategories.find(category => category.id === categoryId);
}; 