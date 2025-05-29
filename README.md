# Slavopolis Docs

一个基于 React、Next.js、TailwindCSS 构建的现代化静态博客系统。

## ✨ 特性

- 🚀 **高性能** - 基于 Next.js 14+ 的静态站点生成
- 🎨 **现代化 UI** - 使用 TailwindCSS 和 Radix UI 构建
- 📝 **MDX 支持** - 在 Markdown 中使用 React 组件
- 🔍 **全文搜索** - 内置高性能搜索引擎
- 🌙 **主题切换** - 支持明暗主题无缝切换
- 📱 **响应式设计** - 完美适配各种设备
- ⚡ **类型安全** - 完全使用 TypeScript 开发
- 🔧 **高度可配置** - 丰富的配置选项
- 📊 **SEO 优化** - 完善的 SEO 和元数据支持
- 🎯 **开发体验** - 热重载、代码分割、性能优化

## 🚀 快速开始

### 系统要求

- Node.js 18.0 或更高版本
- npm 9.0 或更高版本

### 安装

```bash
# 克隆项目
git clone https://github.com/slavopolis/slavopolis-docs.git
cd slavopolis-docs

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看你的博客。

## 🌐 部署指南

### 快速部署到 Linux 服务器

我们提供了多种部署方案，适合不同的需求和技术水平：

#### 方案一：一键快速部署（推荐新手）

```bash
# 在服务器上克隆项目
git clone https://github.com/slavopolis/slavopolis-docs.git
cd slavopolis-docs

# 运行快速部署脚本（需要 sudo 权限）
sudo ./scripts/quick-deploy.sh
```

脚本会自动完成：
- ✅ 安装 Node.js 和 Nginx
- ✅ 构建项目
- ✅ 配置 Nginx
- ✅ 申请 SSL 证书
- ✅ 配置防火墙

#### 方案二：Docker 容器部署

```bash
# 基础 Docker 部署
docker build -t slavopolis-docs .
docker run -d --name slavopolis-docs -p 80:80 slavopolis-docs

# 使用 Docker Compose（推荐）
docker-compose up -d

# 包含 SSL 和监控的完整部署
docker-compose --profile traefik --profile monitoring up -d
```

#### 方案三：静态站点部署

```bash
# 构建静态文件
npm run build

# 部署到 Web 服务器
sudo cp -r out/* /var/www/html/
```

### 📚 详细部署文档

查看完整的部署指南：**[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)**

包含以下内容：
- 🔧 系统要求和环境准备
- 📋 三种部署方案详细说明
- 🔒 SSL 证书配置
- 🌐 域名解析设置
- 📊 监控和维护
- 🔧 故障排除指南

### 部署配置文件

| 文件 | 说明 |
|------|------|
| `next.config.js` | Next.js 配置（已配置静态导出） |
| `Dockerfile` | Docker 镜像构建配置 |
| `docker-compose.yml` | 容器编排配置 |
| `scripts/deploy.sh` | 完整自动部署脚本 |
| `scripts/quick-deploy.sh` | 快速部署脚本 |
| `docker/nginx.conf` | Nginx 主配置 |
| `docker/default.conf` | Nginx 站点配置 |

## 📁 项目结构

```
slavopolis-docs/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # 认证相关页面组
│   │   ├── (blog)/            # 博客相关页面组
│   │   ├── admin/             # 管理后台
│   │   ├── api/               # API 路由
│   │   ├── globals.css        # 全局样式
│   │   ├── layout.tsx         # 根布局
│   │   └── page.tsx           # 首页
│   ├── components/            # 组件目录
│   │   ├── ui/                # 基础 UI 组件
│   │   ├── layout/            # 布局组件
│   │   ├── blog/              # 博客专用组件
│   │   ├── search/            # 搜索组件
│   │   ├── advanced/          # 高级功能组件
│   │   └── common/            # 通用组件
│   ├── lib/                   # 工具函数和配置
│   ├── hooks/                 # 自定义 Hooks
│   ├── stores/                # 状态管理
│   ├── types/                 # TypeScript 类型定义
│   └── styles/                # 样式文件
├── content/                   # 内容目录
│   ├── blog/                  # 博客文章
│   ├── docs/                  # 技术文档
│   └── pages/                 # 静态页面
├── config/                    # 配置文件目录
│   ├── site.config.ts         # 站点基本配置
│   ├── nav.config.ts          # 导航配置
│   ├── author.config.ts       # 作者信息配置
│   └── ...                    # 其他配置文件
├── public/                    # 静态资源
│   ├── icons/                 # 图标资源
│   ├── images/                # 图片资源
│   └── favicon/               # 网站图标
└── docs/                      # 项目文档
```

## 🛠️ 技术栈

### 核心框架
- **React 18+** - 主要前端框架
- **Next.js 14+** - 全栈 React 框架，支持 SSG
- **TypeScript** - 类型安全的开发语言

### 样式和 UI
- **TailwindCSS** - 原子化 CSS 框架
- **Radix UI** - 无样式 UI 组件库
- **Framer Motion** - 动画库
- **Lucide React** - 图标库

### 内容处理
- **Next-MDX-Remote** - MDX 内容处理
- **Gray-matter** - Front matter 解析
- **Reading-time** - 阅读时间估算

### 搜索功能
- **Flexsearch** - 轻量级全文搜索库
- **Fuse.js** - 模糊搜索算法

## 📝 内容管理

### 文件约定

```
content/
├── blog/
│   ├── 2024/
│   │   ├── 01-frontend/
│   │   │   ├── react-best-practices.md
│   │   │   └── vue-composition-api.mdx
│   │   └── 02-backend/
│   │       └── nodejs-performance.md
│   └── 2025/
├── docs/
│   ├── frontend/
│   │   ├── react/
│   │   └── vue/
│   └── backend/
└── pages/
    ├── about.md
    └── contact.md
```

### Front Matter 示例

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
cover: "/images/cover.jpg"
toc: true
encrypted: false
---
```

## ⚙️ 配置

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