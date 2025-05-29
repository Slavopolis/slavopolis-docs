export interface Author {
  name: string;
  avatar: string;
  bio: string;
  location?: string;
  website?: string;
  social: {
    github?: string;
    twitter?: string;
    linkedin?: string;
    email?: string;
    weibo?: string;
    zhihu?: string;
  };
  skills?: string[];
  experience?: string;
}

export const authorConfig: Author = {
  name: "都市隶人",
  avatar: "/avatar.png",
  bio: "专注于现代Java技术栈的开发和学习，致力于构建优雅、高效的 Web 应用程序。我们热爱开源，相信技术的力量能够改变世界。",
  location: "中国 · 上海",
  website: "/",
  social: {
      github: "https://github.com/slavopolis/slavopolis-docs",
    twitter: "https://twitter.com/slavopolis",
    email: "slavopolis@gmail.com",
    zhihu: "https://zhihu.com/people/slavopolis",
  },
  skills: [
    "Java",
    "SpringBoot", 
    "SpringCloud",
    "MySQL",
    "Redis",
    "Linux",
    "Docker",
    "Kubernetes",
    "Jenkins",
    "Git",
    "Nginx",
    "Elasticsearch",
    "Kafka",
    "RabbitMQ",
    "Docker",
    "Kubernetes",
    "微服务架构",
    "DevOps",
  ],
  experience: "1 年后端开发经验",
};

// 多作者支持
export const authorsConfig: Record<string, Author> = {
  "slavopolis-team": authorConfig,
  "frontend-dev": {
    name: "前端开发者",
    avatar: "/avatars/frontend-dev.jpg",
    bio: "专注于前端技术的开发者，热爱 React 生态系统",
    social: {
      github: "https://github.com/frontend-dev",
      email: "frontend@slavopolis.com",
    },
    skills: ["React", "Vue", "TypeScript", "CSS", "Webpack"],
  },
  "backend-dev": {
    name: "后端开发者", 
    avatar: "/avatars/backend-dev.jpg",
    bio: "后端架构师，专注于高性能、高可用系统设计",
    social: {
      github: "https://github.com/backend-dev",
      email: "backend@slavopolis.com",
    },
    skills: ["Node.js", "Python", "Go", "PostgreSQL", "Redis", "Docker"],
  },
  "devops-engineer": {
    name: "DevOps 工程师",
    avatar: "/avatars/devops-engineer.jpg", 
    bio: "DevOps 专家，专注于 CI/CD 和云原生技术",
    social: {
      github: "https://github.com/devops-engineer",
      email: "devops@slavopolis.com",
    },
    skills: ["Kubernetes", "Docker", "AWS", "Terraform", "Jenkins"],
  },
};

export type AuthorConfig = typeof authorConfig;
export type AuthorsConfig = typeof authorsConfig; 