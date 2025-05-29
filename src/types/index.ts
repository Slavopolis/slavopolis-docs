import { type Author } from "@/config/author.config";

/**
 * 博客文章类型
 */
export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  content: string;
  date: string;
  lastModified?: string;
  tags: string[];
  categories: string[];
  author: string;
  authorData?: Author;
  draft: boolean;
  featured: boolean;
  cover?: string;
  toc: boolean;
  encrypted: boolean;
  password?: string;
  readingTime: {
    text: string;
    minutes: number;
    time: number;
    words: number;
  };
  excerpt: string;
  filePath: string;
}

/**
 * 文档页面类型
 */
export interface DocPage {
  slug: string;
  title: string;
  description: string;
  content: string;
  lastModified?: string;
  toc: boolean;
  order?: number;
  category?: string;
  tags?: string[];
  filePath: string;
}

/**
 * 页面元数据类型
 */
export interface PageMeta {
  title: string;
  description: string;
  keywords?: string[];
  author?: string;
  ogImage?: string;
  canonical?: string;
  noindex?: boolean;
  nofollow?: boolean;
}

/**
 * 搜索结果类型
 */
export interface SearchResult {
  id: string;
  title: string;
  description: string;
  url: string;
  type: "post" | "doc" | "page";
  tags?: string[];
  category?: string;
  date?: string;
  score: number;
  highlights?: {
    title?: string;
    description?: string;
    content?: string;
  };
}

/**
 * 搜索索引项类型
 */
export interface SearchIndexItem {
  id: string;
  title: string;
  description: string;
  content: string;
  url: string;
  type: "post" | "doc" | "page";
  tags: string[];
  category: string;
  date: string;
}

/**
 * 分页信息类型
 */
export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * 分页结果类型
 */
export interface PaginatedResult<T> {
  items: T[];
  pagination: PaginationInfo;
}

/**
 * 目录树节点类型
 */
export interface TocItem {
  id: string;
  title: string;
  level: number;
  children?: TocItem[];
}

/**
 * 导航面包屑类型
 */
export interface BreadcrumbItem {
  title: string;
  href: string;
  current?: boolean;
}

/**
 * 主题类型
 */
export type Theme = "light" | "dark" | "system";

/**
 * 语言类型
 */
export type Language = "zh-CN" | "en-US";

/**
 * 排序方式类型
 */
export type SortOrder = "asc" | "desc";

/**
 * 文章排序字段类型
 */
export type PostSortField = "date" | "title" | "readingTime" | "views";

/**
 * 过滤选项类型
 */
export interface FilterOptions {
  tags?: string[];
  categories?: string[];
  authors?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  featured?: boolean;
  draft?: boolean;
}

/**
 * 组件变体类型
 */
export type ComponentVariant = 
  | "default"
  | "primary" 
  | "secondary"
  | "destructive"
  | "outline"
  | "ghost"
  | "link";

/**
 * 组件尺寸类型
 */
export type ComponentSize = "sm" | "md" | "lg" | "xl";

/**
 * 响应式断点类型
 */
export type Breakpoint = "sm" | "md" | "lg" | "xl" | "2xl";

/**
 * 动画类型
 */
export type AnimationType = 
  | "fade"
  | "slide"
  | "scale"
  | "bounce"
  | "flip"
  | "zoom";

/**
 * 通知类型
 */
export interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * API 响应类型
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    requestId: string;
    version: string;
  };
}

/**
 * 错误类型
 */
export interface AppError {
  code: string;
  message: string;
  details?: any;
  stack?: string;
}

/**
 * 用户偏好设置类型
 */
export interface UserPreferences {
  theme: Theme;
  language: Language;
  fontSize: "sm" | "md" | "lg";
  reducedMotion: boolean;
  autoSave: boolean;
  notifications: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
}

/**
 * 统计数据类型
 */
export interface SiteStats {
  totalPosts: number;
  totalDocs: number;
  totalViews: number;
  totalTags: number;
  totalCategories: number;
  lastUpdated: string;
}

/**
 * 评论类型
 */
export interface Comment {
  id: string;
  author: {
    name: string;
    email: string;
    avatar?: string;
    website?: string;
  };
  content: string;
  date: string;
  parentId?: string;
  replies?: Comment[];
  approved: boolean;
  likes: number;
  dislikes: number;
}

/**
 * 表单字段类型
 */
export interface FormField {
  name: string;
  label: string;
  type: "text" | "email" | "password" | "textarea" | "select" | "checkbox" | "radio";
  placeholder?: string;
  required?: boolean;
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  };
  options?: Array<{
    label: string;
    value: string;
  }>;
}

/**
 * 表单配置类型
 */
export interface FormConfig {
  fields: FormField[];
  submitText?: string;
  resetText?: string;
  onSubmit: (data: Record<string, any>) => void | Promise<void>;
  onReset?: () => void;
} 