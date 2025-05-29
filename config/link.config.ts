export interface LinkItem {
  id: string;
  title: string;
  description?: string;
  url: string;
  icon?: string; // iconfont 图标类名
  fallbackIcon?: string; // 备用 emoji 图标
  category: string;
  // 如果提供了这些字段，则优先使用，否则自动解析
  customTitle?: string;
  customDescription?: string;
  customIcon?: string;
}

export interface LinkCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  order: number;
}

// 链接分类配置
export const linkCategories: LinkCategory[] = [
  {
    id: "frontend",
    name: "前端开发",
    description: "前端开发工具和资源",
        icon: "icon-qianduan-copy",
    color: "blue",
    order: 1,
  },
  {
    id: "backend",
    name: "后端开发",
    description: "后端开发工具和框架",
      icon: "icon-a-APPhouduanguanli",
    color: "green",
    order: 2,
  },
  {
    id: "design",
    name: "设计资源",
    description: "UI/UX 设计工具和素材",
      icon: "icon-UIIcon",
    color: "purple",
    order: 3,
  },
  {
    id: "devops",
    name: "DevOps",
    description: "云服务、容器和自动化工具",
      icon: "icon-server",
    color: "orange",
    order: 4,
  },
  {
    id: "ai",
    name: "AI 工具",
    description: "人工智能和机器学习资源",
      icon: "icon-AIshibie",
    color: "pink",
    order: 5,
  },
  {
    id: "productivity",
    name: "效率工具",
    description: "提升工作效率的实用工具",
      icon: "icon-ico_efficient",
    color: "blue",
    order: 6,
  },
  {
    id: "learning",
    name: "学习资源",
    description: "技术学习和文档资源",
      icon: "icon-icon_schedule_study_",
    color: "green",
    order: 7,
  },
  {
    id: "others",
    name: "其他",
    description: "其他有用的网站和服务",
      icon: "icon-qita",
    color: "gray",
    order: 999,
  },
];

// 预配置的常用网站
export const linkItems: LinkItem[] = [
  // 前端开发
  {
    id: "github",
    title: "GitHub",
    description: "全球最大的代码托管平台",
    url: "https://github.com",
    fallbackIcon: "🐙",
    category: "frontend",
  },
  {
    id: "vercel",
    title: "Vercel",
    description: "现代化的前端部署平台",
    url: "https://vercel.com",
    fallbackIcon: "▲",
    category: "frontend",
  },
  {
    id: "npm",
    title: "NPM",
    description: "Node.js 包管理器",
    url: "https://www.npmjs.com",
    fallbackIcon: "📦",
    category: "frontend",
  },
  {
    id: "stackoverlow",
    title: "Stack Overflow",
    description: "程序员问答社区",
    url: "https://stackoverflow.com",
    fallbackIcon: "💬",
    category: "others",
  },

  // 设计资源类
  {
    id: "figma",
    title: "Figma",
    description: "协作式设计工具",
    url: "https://figma.com",
    fallbackIcon: "🎨",
    category: "design",
  },
  {
    id: "dribbble",
    title: "Dribbble",
    description: "设计师作品展示平台",
    url: "https://dribbble.com",
    fallbackIcon: "🏀",
    category: "design",
  },
  {
    id: "unsplash",
    title: "Unsplash",
    description: "高质量免费图片素材",
    url: "https://unsplash.com",
    fallbackIcon: "📸",
    category: "design",
  },
  {
    id: "iconfont",
    title: "Iconfont",
    description: "阿里巴巴矢量图标库",
    url: "https://www.iconfont.cn",
    fallbackIcon: "🔣",
    category: "design",
  },

  // 效率工具类
  {
    id: "notion",
    title: "Notion",
    description: "一体化工作空间",
    url: "https://notion.so",
    fallbackIcon: "📝",
    category: "productivity",
  },
  {
    id: "claude",
    title: "Claude",
    description: "Anthropic AI 助手",
    url: "https://claude.ai",
    fallbackIcon: "🤖",
    category: "ai",
  },
  {
    id: "chatgpt",
    title: "ChatGPT",
    description: "OpenAI 对话AI",
    url: "https://chat.openai.com",
    fallbackIcon: "💭",
    category: "ai",
  },

  // 学习资源类
  {
    id: "mdn",
    title: "MDN Web Docs",
    description: "Web 开发权威文档",
    url: "https://developer.mozilla.org",
    fallbackIcon: "📚",
    category: "learning",
  },
  {
    id: "react-docs",
    title: "React 官方文档",
    description: "React 框架官方文档",
    url: "https://react.dev",
    fallbackIcon: "⚛️",
    category: "frontend",
  },
  {
    id: "nextjs-docs",
    title: "Next.js 文档",
    description: "Next.js 框架官方文档",
    url: "https://nextjs.org",
    fallbackIcon: "📄",
    category: "frontend",
  },
  {
    id: "tailwindcss",
    title: "Tailwind CSS",
    description: "实用优先的 CSS 框架",
    url: "https://tailwindcss.com",
    fallbackIcon: "🎯",
    category: "frontend",
  },

  // 前端开发新增
  {
    id: "vuejs",
    title: "Vue.js",
    description: "渐进式 JavaScript 框架",
    url: "https://vuejs.org",
    fallbackIcon: "🟢",
    category: "frontend",
  },
  {
    id: "typescript",
    title: "TypeScript",
    description: "JavaScript 的超集，添加了类型系统",
    url: "https://www.typescriptlang.org",
    fallbackIcon: "📘",
    category: "frontend",
  },
  {
    id: "vitejs",
    title: "Vite",
    description: "下一代前端构建工具",
    url: "https://vitejs.dev",
    fallbackIcon: "⚡",
    category: "frontend",
  },
  {
    id: "webpack",
    title: "Webpack",
    description: "静态模块打包工具",
    url: "https://webpack.js.org",
    fallbackIcon: "📦",
    category: "frontend",
  },
  {
    id: "babel",
    title: "Babel",
    description: "JavaScript 编译器",
    url: "https://babeljs.io",
    fallbackIcon: "🔄",
    category: "frontend",
  },
  {
    id: "eslint",
    title: "ESLint",
    description: "JavaScript 代码检查工具",
    url: "https://eslint.org",
    fallbackIcon: "🧹",
    category: "frontend",
  },
  {
    id: "prettier",
    title: "Prettier",
    description: "代码格式化工具",
    url: "https://prettier.io",
    fallbackIcon: "✨",
    category: "frontend",
  },
  {
    id: "angular",
    title: "Angular",
    description: "Google 的 Web 应用框架",
    url: "https://angular.io",
    fallbackIcon: "🅰️",
    category: "frontend",
  },
  {
    id: "svelte",
    title: "Svelte",
    description: "无虚拟 DOM 的前端框架",
    url: "https://svelte.dev",
    fallbackIcon: "🔥",
    category: "frontend",
  },
  {
    id: "solidjs",
    title: "SolidJS",
    description: "声明式、高效的前端框架",
    url: "https://www.solidjs.com",
    fallbackIcon: "🧱",
    category: "frontend",
  },

  // 后端开发
  {
    id: "spring-boot",
    title: "Spring Boot",
    description: "简化 Spring 应用开发的框架",
    url: "https://spring.io/projects/spring-boot",
    fallbackIcon: "🍃",
    category: "backend",
  },
  {
    id: "nodejs",
    title: "Node.js",
    description: "JavaScript 运行时环境",
    url: "https://nodejs.org",
    fallbackIcon: "🟢",
    category: "backend",
  },
  {
    id: "express",
    title: "Express",
    description: "Node.js Web 应用框架",
    url: "https://expressjs.com",
    fallbackIcon: "🚂",
    category: "backend",
  },
  {
    id: "django",
    title: "Django",
    description: "Python 高级 Web 框架",
    url: "https://www.djangoproject.com",
    fallbackIcon: "🐍",
    category: "backend",
  },
  {
    id: "flask",
    title: "Flask",
    description: "Python 轻量级 Web 框架",
    url: "https://flask.palletsprojects.com",
    fallbackIcon: "🧪",
    category: "backend",
  },
  {
    id: "laravel",
    title: "Laravel",
    description: "PHP Web 应用框架",
    url: "https://laravel.com",
    fallbackIcon: "🔺",
    category: "backend",
  },
  {
    id: "dotnet",
    title: ".NET",
    description: "Microsoft 开发平台",
    url: "https://dotnet.microsoft.com",
    fallbackIcon: "🟣",
    category: "backend",
  },
  {
    id: "go",
    title: "Go",
    description: "Google 开发的编程语言",
    url: "https://golang.org",
    fallbackIcon: "🐹",
    category: "backend",
  },
  {
    id: "rust",
    title: "Rust",
    description: "高性能、安全的系统编程语言",
    url: "https://www.rust-lang.org",
    fallbackIcon: "🦀",
    category: "backend",
  },
  {
    id: "ruby-on-rails",
    title: "Ruby on Rails",
    description: "Ruby 编程语言 Web 框架",
    url: "https://rubyonrails.org",
    fallbackIcon: "💎",
    category: "backend",
  },
  {
    id: "nestjs",
    title: "NestJS",
    description: "Node.js 服务端框架",
    url: "https://nestjs.com",
    fallbackIcon: "🐱",
    category: "backend",
  },
  {
    id: "graphql",
    title: "GraphQL",
    description: "API 查询语言",
    url: "https://graphql.org",
    fallbackIcon: "⚙️",
    category: "backend",
  },
  
  // DevOps 工具
  {
    id: "docker",
    title: "Docker",
    description: "容器化平台",
    url: "https://www.docker.com",
    fallbackIcon: "🐳",
    category: "devops",
  },
  {
    id: "kubernetes",
    title: "Kubernetes",
    description: "容器编排系统",
    url: "https://kubernetes.io",
    fallbackIcon: "⎈",
    category: "devops",
  },
  {
    id: "aws",
    title: "AWS",
    description: "亚马逊云服务",
    url: "https://aws.amazon.com",
    fallbackIcon: "☁️",
    category: "devops",
  },
  {
    id: "gitlab",
    title: "GitLab",
    description: "DevOps 平台",
    url: "https://about.gitlab.com",
    fallbackIcon: "🦊",
    category: "devops",
  },
  {
    id: "jenkins",
    title: "Jenkins",
    description: "开源自动化服务器",
    url: "https://www.jenkins.io",
    fallbackIcon: "🤵",
    category: "devops",
  },
  {
    id: "terraform",
    title: "Terraform",
    description: "基础设施即代码工具",
    url: "https://www.terraform.io",
    fallbackIcon: "🏗️",
    category: "devops",
  },
  {
    id: "prometheus",
    title: "Prometheus",
    description: "监控系统和时间序列数据库",
    url: "https://prometheus.io",
    fallbackIcon: "📊",
    category: "devops",
  },
  
  // AI 工具
  {
    id: "huggingface",
    title: "Hugging Face",
    description: "AI 社区和模型共享平台",
    url: "https://huggingface.co",
    fallbackIcon: "🤗",
    category: "ai",
  },
  {
    id: "tensorflow",
    title: "TensorFlow",
    description: "机器学习框架",
    url: "https://www.tensorflow.org",
    fallbackIcon: "🧠",
    category: "ai",
  },
  {
    id: "pytorch",
    title: "PyTorch",
    description: "开源机器学习库",
    url: "https://pytorch.org",
    fallbackIcon: "🔥",
    category: "ai",
  },
  {
    id: "midjourney",
    title: "Midjourney",
    description: "AI 图像生成工具",
    url: "https://www.midjourney.com",
    fallbackIcon: "🎨",
    category: "ai",
  },
  {
    id: "replicate",
    title: "Replicate",
    description: "AI 模型运行平台",
    url: "https://replicate.com",
    fallbackIcon: "🔄",
    category: "ai",
  },
  
  // 额外的学习资源
  {
    id: "coursera",
    title: "Coursera",
    description: "在线学习平台",
    url: "https://www.coursera.org",
    fallbackIcon: "🎓",
    category: "learning",
  },
  {
    id: "udemy",
    title: "Udemy",
    description: "在线课程平台",
    url: "https://www.udemy.com",
    fallbackIcon: "📚",
    category: "learning",
  },
  {
    id: "freecodecamp",
    title: "freeCodeCamp",
    description: "免费学习编程的社区",
    url: "https://www.freecodecamp.org",
    fallbackIcon: "🔥",
    category: "learning",
  },
  {
    id: "codecademy",
    title: "Codecademy",
    description: "交互式学习平台",
    url: "https://www.codecademy.com",
    fallbackIcon: "💻",
    category: "learning",
  },
  {
    id: "leetcode",
    title: "LeetCode",
    description: "编程题库和面试准备",
    url: "https://leetcode.com",
    fallbackIcon: "🧩",
    category: "learning",
  },
  {
    id: "geeksforgeeks",
    title: "GeeksforGeeks",
    description: "计算机科学资源",
    url: "https://www.geeksforgeeks.org",
    fallbackIcon: "👨‍💻",
    category: "learning",
  },
  
  // 额外的效率工具
  {
    id: "trello",
    title: "Trello",
    description: "项目管理工具",
    url: "https://trello.com",
    fallbackIcon: "📋",
    category: "productivity",
  },
  {
    id: "linear",
    title: "Linear",
    description: "软件开发项目管理",
    url: "https://linear.app",
    fallbackIcon: "📊",
    category: "productivity",
  },
  {
    id: "miro",
    title: "Miro",
    description: "在线协作白板",
    url: "https://miro.com",
    fallbackIcon: "🖌️",
    category: "productivity",
  },
  {
    id: "obsidian",
    title: "Obsidian",
    description: "知识库笔记软件",
    url: "https://obsidian.md",
    fallbackIcon: "📓",
    category: "productivity",
  },
  {
    id: "slack",
    title: "Slack",
    description: "团队协作平台",
    url: "https://slack.com",
    fallbackIcon: "💬",
    category: "productivity",
  },
];

// 工具函数
export const getLinksByCategory = (categoryId: string): LinkItem[] => {
  return linkItems.filter(link => link.category === categoryId);
};

export const searchLinks = (query: string): LinkItem[] => {
  const lowerQuery = query.toLowerCase();
  return linkItems.filter(link => 
    link.title.toLowerCase().includes(lowerQuery) ||
    link.description?.toLowerCase().includes(lowerQuery)
  );
};

export const getCategoryById = (categoryId: string): LinkCategory | undefined => {
  return linkCategories.find(cat => cat.id === categoryId);
};
 