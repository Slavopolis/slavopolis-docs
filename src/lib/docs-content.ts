import fs from 'fs';
import matter from 'gray-matter';
import path from 'path';

export interface FrontMatter {
  title: string;
  description?: string;
  date?: string;
  author?: string;
  tags?: string[];
  categories?: string[];
  draft?: boolean;
  featured?: boolean;
  toc?: boolean;
}

export interface DocContent {
  frontMatter: FrontMatter;
  content: string;
  readingTime?: number;
  wordCount?: number;
}

/**
 * 计算阅读时间（基于中文每分钟200字的阅读速度）
 */
function calculateReadingTime(content: string): number {
  // 移除 Markdown 语法
  const plainText = content
    .replace(/```[\s\S]*?```/g, '') // 代码块
    .replace(/`[^`]*`/g, '') // 内联代码
    .replace(/!\[.*?\]\(.*?\)/g, '') // 图片
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // 链接
    .replace(/[#*_~`]/g, '') // Markdown 符号
    .replace(/\s+/g, ' ') // 多余空格
    .trim();

  const wordCount = plainText.length;
  const readingTime = Math.ceil(wordCount / 200); // 中文每分钟约200字
  
  return readingTime;
}

/**
 * 根据 slug 获取文档内容
 */
export async function getDocBySlug(slug: string): Promise<DocContent> {
  const docsDirectory = path.join(process.cwd(), 'content/docs');
  
  // 确保slug没有被编码
  const decodedSlug = decodeURIComponent(slug);
  
  // 尝试不同的文件路径
  const possiblePaths = [
    path.join(docsDirectory, `${decodedSlug}.md`),
    path.join(docsDirectory, `${decodedSlug}.mdx`),
    path.join(docsDirectory, decodedSlug, 'index.md'),
    path.join(docsDirectory, decodedSlug, 'index.mdx'),
  ];

  let filePath: string | null = null;
  for (const possiblePath of possiblePaths) {
    if (fs.existsSync(possiblePath)) {
      filePath = possiblePath;
      break;
    }
  }

  if (!filePath) {
    console.error(`文档未找到: ${decodedSlug}，尝试查找的路径:`, possiblePaths);
    throw new Error(`Document not found: ${decodedSlug}`);
  }

  const fileContents = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContents);

  // 如果没有标题，尝试从内容中提取第一个标题
  let title = data.title;
  if (!title) {
    const firstHeadingMatch = content.match(/^#\s+(.+)$/m);
    title = firstHeadingMatch ? firstHeadingMatch[1]?.trim() : '无标题';
  }

  const frontMatter: FrontMatter = {
    title,
    description: data.description,
    date: data.date,
    author: data.author,
    tags: data.tags || [],
    categories: data.categories || [],
    draft: data.draft || false,
    featured: data.featured || false,
    toc: data.toc !== false, // 默认开启目录
  };

  const readingTime = calculateReadingTime(content);

  return {
    frontMatter,
    content,
    readingTime,
    wordCount: content.length,
  };
}

/**
 * 获取文档内容（别名函数）
 */
export async function getDocContent(slug: string): Promise<DocContent> {
  return getDocBySlug(slug);
}

/**
 * 获取所有文档的 slug 列表
 */
export async function getAllDocSlugs(): Promise<string[]> {
  const docsDirectory = path.join(process.cwd(), 'content/docs');
  
  function getSlugFromDir(dir: string, basePath = ''): string[] {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    const slugs: string[] = [];

    for (const item of items) {
      if (item.isDirectory() && !item.name.startsWith('.')) {
        const subDir = path.join(dir, item.name);
        // 使用原始目录名（不做任何编码转换）
        const subPath = basePath ? `${basePath}/${item.name}` : item.name;
        
        // 检查是否有 index 文件
        const indexFiles = ['index.md', 'index.mdx'];
        const hasIndex = indexFiles.some(fileName => 
          fs.existsSync(path.join(subDir, fileName))
        );
        
        if (hasIndex) {
          slugs.push(subPath);
        }
        
        // 递归获取子目录
        slugs.push(...getSlugFromDir(subDir, subPath));
      } else if (item.isFile() && (item.name.endsWith('.md') || item.name.endsWith('.mdx'))) {
        if (item.name !== 'index.md' && item.name !== 'index.mdx') {
          const fileName = item.name.replace(/\.(md|mdx)$/, '');
          // 使用原始文件名（不做任何编码转换）
          const fullPath = basePath ? `${basePath}/${fileName}` : fileName;
          slugs.push(fullPath);
        }
      }
    }

    return slugs;
  }

  const slugs = getSlugFromDir(docsDirectory);
  console.log('Generated slugs:', slugs); // 调试信息
  return slugs;
}

/**
 * 检查文档是否存在
 */
export function docExists(slug: string): boolean {
  const docsDirectory = path.join(process.cwd(), 'content/docs');
  
  // 确保slug没有被编码
  const decodedSlug = decodeURIComponent(slug);
  
  const possiblePaths = [
    path.join(docsDirectory, `${decodedSlug}.md`),
    path.join(docsDirectory, `${decodedSlug}.mdx`),
    path.join(docsDirectory, decodedSlug, 'index.md'),
    path.join(docsDirectory, decodedSlug, 'index.mdx'),
  ];

  return possiblePaths.some(filePath => fs.existsSync(filePath));
} 