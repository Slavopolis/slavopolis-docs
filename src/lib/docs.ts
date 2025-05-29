import fs from 'fs';
import matter from 'gray-matter';
import path from 'path';

export interface DocItem {
  title: string;
  href: string;
  description?: string;
  icon?: string;
  badge?: string;
  children?: DocItem[];
}

export interface CategoryConfig {
  label: string;
  position: number;
  link?: {
    type: string;
    description?: string;
  };
}

/**
 * 解析文档目录结构
 */
export async function parseDocsStructure(): Promise<DocItem[]> {
  const docsPath = path.join(process.cwd(), 'content/docs');
  
  if (!fs.existsSync(docsPath)) {
    return [];
  }

  const items = await parseDirectory(docsPath, '');
  
  // 根据 position 排序
  return items.sort((a, b) => {
    // 需要根据实际的目录名称来查找配置，而不是显示标题
    const entries = fs.readdirSync(docsPath, { withFileTypes: true });
    const aDirName = entries.find(entry => entry.isDirectory() && 
      (getCategoryConfig(path.join(docsPath, entry.name))?.label === a.title || 
       formatDirName(entry.name) === a.title))?.name || '';
    const bDirName = entries.find(entry => entry.isDirectory() && 
      (getCategoryConfig(path.join(docsPath, entry.name))?.label === b.title || 
       formatDirName(entry.name) === b.title))?.name || '';
    
    const aPosition = aDirName ? getCategoryPosition(path.join(docsPath, aDirName)) : 999;
    const bPosition = bDirName ? getCategoryPosition(path.join(docsPath, bDirName)) : 999;
    return aPosition - bPosition;
  });
}

/**
 * 递归解析目录
 */
async function parseDirectory(dirPath: string, baseHref: string): Promise<DocItem[]> {
  const items: DocItem[] = [];
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  
  // 首先处理目录
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const categoryPath = path.join(dirPath, entry.name);
      const categoryConfig = getCategoryConfig(categoryPath);
      
      // 使用原始目录名作为URL路径部分，不进行URL编码
      const children = await parseDirectory(categoryPath, `${baseHref}${baseHref ? '/' : ''}${entry.name}`);
      
      const item: DocItem = {
        title: categoryConfig?.label || formatDirName(entry.name),
        href: `${baseHref}${baseHref ? '/' : ''}${entry.name}`,
      };
      
      if (categoryConfig?.link?.description) {
        item.description = categoryConfig.link.description;
      }
      
      if (children.length > 0) {
        item.children = children;
      }
      
      items.push(item);
    }
  }
  
  // 然后处理文件
  for (const entry of entries) {
    if (entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.mdx'))) {
      // 跳过 _category_.json 等配置文件
      if (entry.name.startsWith('_')) continue;
      
      const filePath = path.join(dirPath, entry.name);
      const fileName = entry.name.replace(/\.(md|mdx)$/, '');
      
      // 保留原始文件名，不进行URL编码
      
      // 如果是 index 文件，使用父目录名称
      const isIndex = fileName === 'index';
      const href = isIndex ? baseHref : `${baseHref}${baseHref ? '/' : ''}${fileName}`;
      
      try {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const { data: frontMatter } = matter(fileContent);
        
        // 只有非 index 文件或者没有对应目录的 index 文件才添加
        if (!isIndex) {
          const item: DocItem = {
            title: frontMatter.title || formatFileName(fileName),
            href,
          };
          
          if (frontMatter.description) {
            item.description = frontMatter.description;
          }
          
          items.push(item);
        }
      } catch (error) {
        console.error(`Error parsing file ${filePath}:`, error);
      }
    }
  }
  
  return items;
}

/**
 * 获取分类配置
 */
function getCategoryConfig(categoryPath: string): CategoryConfig | null {
  const configPath = path.join(categoryPath, '_category_.json');
  
  if (fs.existsSync(configPath)) {
    try {
      const content = fs.readFileSync(configPath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      console.error(`Error parsing category config ${configPath}:`, error);
    }
  }
  
  return null;
}

/**
 * 获取分类位置
 */
function getCategoryPosition(categoryPath: string): number {
  const config = getCategoryConfig(categoryPath);
  return config?.position || 999;
}

/**
 * 格式化目录名称
 */
function formatDirName(dirName: string): string {
  return dirName
    .replace(/-/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * 格式化文件名称
 */
function formatFileName(fileName: string): string {
  return fileName
    .replace(/-/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * 获取文档内容
 */
export async function getDocContent(slug: string[]): Promise<{
  content: string;
  frontMatter: any;
} | null> {
  // 解码URL路径中的中文和特殊字符
  const decodedSlug = slug.map(segment => decodeURIComponent(segment));
  const filePath = path.join(process.cwd(), 'content/docs', ...decodedSlug);
  
  // 尝试不同的文件扩展名
  for (const ext of ['.md', '.mdx']) {
    const fullPath = filePath + ext;
    if (fs.existsSync(fullPath)) {
      try {
        const fileContent = fs.readFileSync(fullPath, 'utf-8');
        const { data: frontMatter, content } = matter(fileContent);
        return { content, frontMatter };
      } catch (error) {
        console.error(`Error reading file ${fullPath}:`, error);
      }
    }
  }
  
  // 尝试查找 index 文件
  const indexPath = path.join(filePath, 'index.md');
  if (fs.existsSync(indexPath)) {
    try {
      const fileContent = fs.readFileSync(indexPath, 'utf-8');
      const { data: frontMatter, content } = matter(fileContent);
      return { content, frontMatter };
    } catch (error) {
      console.error(`Error reading index file ${indexPath}:`, error);
    }
  }
  
  return null;
} 