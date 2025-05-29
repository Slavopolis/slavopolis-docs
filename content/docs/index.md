---
title: "Slavopolis 文档"
description: "Slavopolis 静态博客系统的完整文档"
toc: true
---

# Slavopolis 文档

欢迎使用 Slavopolis，一个基于 React、Next.js 和 TailwindCSS 构建的现代化静态博客系统。

## 快速开始

Slavopolis 旨在为开发者提供一个优雅、高性能的博客和文档平台。它具有以下特点：

- 🚀 **高性能** - 基于 Next.js 的静态站点生成
- 🎨 **现代化 UI** - 使用 TailwindCSS 和 Radix UI
- 📝 **MDX 支持** - 在 Markdown 中使用 React 组件
- 🔍 **全文搜索** - 内置高性能搜索引擎
- 🌙 **主题切换** - 支持明暗主题
- 📱 **响应式设计** - 完美适配各种设备
- ⚡ **类型安全** - 完全使用 TypeScript 开发

## 安装

### 系统要求

- Node.js 18.0 或更高版本
- npm 9.0 或更高版本

### 克隆项目

```bash
git clone https://github.com/slavopolis/slavopolis-docs.git
cd slavopolis-docs
```

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

现在你可以在 [http://localhost:3000](http://localhost:3000) 访问你的博客了。

## 项目结构

```
slavopolis-docs/
├── src/
│   ├── app/                    # Next.js App Router
│   ├── components/            # React 组件
│   ├── lib/                   # 工具函数和配置
│   ├── hooks/                 # 自定义 Hooks
│   ├── stores/                # 状态管理
│   ├── types/                 # TypeScript 类型定义
│   └── styles/                # 样式文件
├── content/                   # 内容目录
│   ├── blog/                  # 博客文章
│   ├── docs/                  # 技术文档
│   └── pages/                 # 静态页面
├── config/                    # 配置文件
├── public/                    # 静态资源
└── docs/                      # 项目文档
```

## 核心概念

### 内容管理

Slavopolis 使用基于文件的内容管理系统。所有内容都存储在 `content/` 目录中：

- `content/blog/` - 博客文章
- `content/docs/` - 文档页面
- `content/pages/` - 静态页面

### Front Matter

每个内容文件都包含 YAML front matter，用于定义元数据：

```yaml
---
title: "文章标题"
description: "文章描述"
date: "2024-01-01"
tags: ["React", "前端"]
categories: ["前端开发"]
author: "作者名称"
draft: false
featured: true
toc: true
---
```

### 路由系统

Slavopolis 使用 Next.js App Router，支持：

- 静态路由生成
- 动态路由参数
- 嵌套布局
- 路由组

## 配置

### 站点配置

在 `config/site.config.ts` 中配置站点基本信息：

```typescript
export const siteConfig = {
  name: "你的博客名称",
  title: "站点标题",
  description: "站点描述",
  url: "https://yourdomain.com",
  // ... 更多配置
};
```

### 导航配置

在 `config/nav.config.ts` 中配置导航菜单：

```typescript
export const navConfig = {
  main: [
    { title: "首页", href: "/" },
    { title: "博客", href: "/blog" },
    { title: "文档", href: "/docs" },
  ],
  // ... 更多配置
};
```

## 主题系统

Slavopolis 支持明暗主题切换，基于 CSS 变量实现：

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  /* ... 更多变量 */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... 更多变量 */
}
```

## 搜索功能

内置全文搜索功能，支持：

- 实时搜索
- 模糊匹配
- 关键词高亮
- 搜索历史

## 部署

### 构建项目

```bash
npm run build
```

### 部署到 Vercel

1. 将代码推送到 GitHub
2. 在 Vercel 中导入项目
3. 配置环境变量
4. 部署

### 部署到其他平台

Slavopolis 生成静态文件，可以部署到任何支持静态网站的平台：

- Netlify
- GitHub Pages
- AWS S3
- Cloudflare Pages

## 下一步

- [安装指南](./installation) - 详细的安装步骤
- [配置指南](./configuration) - 完整的配置选项
- [内容管理](./content-management) - 如何创建和管理内容
- [主题定制](./theming) - 自定义主题和样式
- [部署指南](./deployment) - 部署到各种平台

## 获取帮助

如果你遇到问题或需要帮助：

- 查看 [GitHub Issues](https://github.com/slavopolis/slavopolis-docs/issues)
- 阅读 [常见问题](./faq)
- 加入我们的 [Discord 社区](https://discord.gg/slavopolis) 