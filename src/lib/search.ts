import fs from 'fs';
import matter from 'gray-matter';
import path from 'path';

// 搜索结果类型
export interface SearchResult {
  id: string;
  title: string;
  description?: string | undefined;
  content: string;
  href: string;
  category: string;
  matches: SearchMatch[];
  score: number;
}

// 搜索匹配项
export interface SearchMatch {
  type: 'title' | 'content' | 'description';
  text: string;
  start: number;
  end: number;
}

// 文档项类型
export interface DocSearchItem {
  id: string;
  title: string;
  description?: string;
  content: string;
  href: string;
  category: string;
  tags?: string[];
  keywords?: string[];
}

// 搜索选项
export interface SearchOptions {
  limit?: number;
  threshold?: number;
  includeContent?: boolean;
  fuzzy?: boolean;
}

class SearchEngine {
  private documents: DocSearchItem[] = [];
  private index: Map<string, Set<string>> = new Map();

  constructor() {
    this.buildIndex();
  }

  // 构建搜索索引
  private async buildIndex() {
    try {
      const docs = await this.loadDocuments();
      this.documents = docs;
      this.buildWordIndex();
    } catch (error) {
      console.error('Failed to build search index:', error);
    }
  }

  // 加载所有文档
  private async loadDocuments(): Promise<DocSearchItem[]> {
    const docs: DocSearchItem[] = [];
    const docsPath = path.join(process.cwd(), 'content/docs');
    
    const processDirectory = async (dirPath: string, category: string = '') => {
      const items = fs.readdirSync(dirPath, { withFileTypes: true });
      
      for (const item of items) {
        const fullPath = path.join(dirPath, item.name);
        
        if (item.isDirectory()) {
          // 读取目录配置
          const categoryPath = path.join(fullPath, '_category_.json');
          let categoryName = item.name;
          
          if (fs.existsSync(categoryPath)) {
            try {
              const categoryData = JSON.parse(fs.readFileSync(categoryPath, 'utf-8'));
              categoryName = categoryData.label || categoryName;
            } catch (e) {
              // 忽略配置文件错误
            }
          }
          
          await processDirectory(fullPath, categoryName);
        } else if (item.name.endsWith('.md') || item.name.endsWith('.mdx')) {
          if (item.name.startsWith('_')) continue; // 跳过特殊文件
          
          try {
            const fileContent = fs.readFileSync(fullPath, 'utf-8');
            const { data: frontMatter, content } = matter(fileContent);
            
            const relativePath = path.relative(docsPath, fullPath);
            const href = relativePath.replace(/\.(md|mdx)$/, '').replace(/\\/g, '/');
            
            docs.push({
              id: href,
              title: frontMatter.title || path.basename(item.name, path.extname(item.name)),
              description: frontMatter.description || '',
              content: content,
              href: href,
              category: category || '文档',
              tags: frontMatter.tags || [],
              keywords: frontMatter.keywords || []
            });
          } catch (error) {
            console.error(`Error processing ${fullPath}:`, error);
          }
        }
      }
    };

    await processDirectory(docsPath);
    return docs;
  }

  // 构建词汇索引
  private buildWordIndex() {
    this.index.clear();
    
    this.documents.forEach(doc => {
      const words = this.extractWords(doc);
      words.forEach(word => {
        if (!this.index.has(word)) {
          this.index.set(word, new Set());
        }
        this.index.get(word)!.add(doc.id);
      });
    });
  }

  // 提取文档中的词汇
  private extractWords(doc: DocSearchItem): string[] {
    const allText = [
      doc.title,
      doc.description || '',
      doc.content,
      ...(doc.tags || []),
      ...(doc.keywords || [])
    ].join(' ');

    return this.tokenize(allText);
  }

  // 词汇分词
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s\u4e00-\u9fff]/g, ' ') // 保留中文、英文、数字
      .split(/\s+/)
      .filter(word => word.length > 1); // 过滤单字符
  }

  // 计算文档相关性得分
  private calculateScore(doc: DocSearchItem, query: string, matches: SearchMatch[]): number {
    let score = 0;
    const queryWords = this.tokenize(query);
    
    matches.forEach(match => {
      switch (match.type) {
        case 'title':
          score += 10; // 标题匹配权重最高
          break;
        case 'description':
          score += 5; // 描述匹配权重中等
          break;
        case 'content':
          score += 1; // 内容匹配权重最低
          break;
      }
    });
    
    // 完全匹配加分
    if (doc.title.toLowerCase().includes(query.toLowerCase())) {
      score += 20;
    }
    
    // 多词匹配加分
    const matchedWords = queryWords.filter(word => 
      doc.title.toLowerCase().includes(word) ||
      doc.content.toLowerCase().includes(word)
    );
    score += matchedWords.length * 2;
    
    return score;
  }

  // 查找匹配项
  private findMatches(doc: DocSearchItem, query: string): SearchMatch[] {
    const matches: SearchMatch[] = [];
    const queryLower = query.toLowerCase();
    
    // 标题匹配
    const titleLower = doc.title.toLowerCase();
    let titleIndex = titleLower.indexOf(queryLower);
    if (titleIndex !== -1) {
      matches.push({
        type: 'title',
        text: doc.title.substring(titleIndex - 10, titleIndex + query.length + 10),
        start: titleIndex,
        end: titleIndex + query.length
      });
    }
    
    // 描述匹配
    if (doc.description) {
      const descLower = doc.description.toLowerCase();
      let descIndex = descLower.indexOf(queryLower);
      if (descIndex !== -1) {
        matches.push({
          type: 'description',
          text: doc.description.substring(descIndex - 20, descIndex + query.length + 20),
          start: descIndex,
          end: descIndex + query.length
        });
      }
    }
    
    // 内容匹配（限制匹配数量）
    const contentLower = doc.content.toLowerCase();
    let contentIndex = 0;
    let matchCount = 0;
    
    while (matchCount < 3) { // 最多3个内容匹配
      contentIndex = contentLower.indexOf(queryLower, contentIndex);
      if (contentIndex === -1) break;
      
      const start = Math.max(0, contentIndex - 30);
      const end = Math.min(doc.content.length, contentIndex + query.length + 30);
      
      matches.push({
        type: 'content',
        text: doc.content.substring(start, end),
        start: contentIndex - start,
        end: contentIndex - start + query.length
      });
      
      contentIndex += query.length;
      matchCount++;
    }
    
    return matches;
  }

  // 执行搜索
  public search(query: string, options: SearchOptions = {}): SearchResult[] {
    const {
      limit = 10,
      threshold = 0.1,
      includeContent = true,
      fuzzy = true
    } = options;

    if (!query.trim()) return [];

    const results: SearchResult[] = [];
    const queryLower = query.toLowerCase();

    this.documents.forEach(doc => {
      const matches = this.findMatches(doc, query);
      
      if (matches.length > 0) {
        const score = this.calculateScore(doc, query, matches);
        
        if (score >= threshold) {
          const result: SearchResult = {
            id: doc.id,
            title: doc.title,
            content: includeContent ? doc.content.substring(0, 200) + '...' : '',
            href: doc.href,
            category: doc.category,
            matches,
            score
          };
          
          // 只有当description存在且不为空时才添加
          if (doc.description && doc.description.trim()) {
            result.description = doc.description;
          }
          
          results.push(result);
        }
      }
    });

    // 按相关性排序
    results.sort((a, b) => b.score - a.score);
    
    return results.slice(0, limit);
  }

  // 获取建议词汇
  public getSuggestions(query: string, limit: number = 5): string[] {
    if (!query.trim()) return [];
    
    const queryLower = query.toLowerCase();
    const suggestions = new Set<string>();
    
    // 从标题中提取建议
    this.documents.forEach(doc => {
      if (doc.title.toLowerCase().includes(queryLower)) {
        suggestions.add(doc.title);
      }
      
      // 从标签中提取建议
      doc.tags?.forEach(tag => {
        if (tag.toLowerCase().includes(queryLower)) {
          suggestions.add(tag);
        }
      });
    });
    
    return Array.from(suggestions).slice(0, limit);
  }

  // 获取所有文档（用于侧边栏过滤）
  public getAllDocuments(): DocSearchItem[] {
    return this.documents;
  }

  // 根据分类过滤文档
  public getDocumentsByCategory(category: string): DocSearchItem[] {
    return this.documents.filter(doc => doc.category === category);
  }
}

// 创建全局搜索引擎实例
let searchEngine: SearchEngine | null = null;

export function getSearchEngine(): SearchEngine {
  if (!searchEngine) {
    searchEngine = new SearchEngine();
  }
  return searchEngine;
}

// 客户端搜索函数
export function searchDocuments(query: string, options?: SearchOptions): SearchResult[] {
  // 在客户端，我们需要使用预构建的索引
  return clientSearch(query, options);
}

// 客户端搜索实现（简化版）
function clientSearch(query: string, options: SearchOptions = {}): SearchResult[] {
  // 这里需要从预构建的搜索数据中搜索
  // 在实际实现中，可以使用 lunr.js 或 flexsearch 等客户端搜索库
  return [];
}

// 高亮匹配文本
export function highlightMatches(text: string, query: string): string {
  if (!query.trim()) return text;
  
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">$1</mark>');
}

// 生成搜索摘要
export function generateExcerpt(content: string, query: string, maxLength: number = 150): string {
  if (!query.trim()) return content.substring(0, maxLength) + '...';
  
  const queryLower = query.toLowerCase();
  const contentLower = content.toLowerCase();
  const index = contentLower.indexOf(queryLower);
  
  if (index === -1) {
    return content.substring(0, maxLength) + '...';
  }
  
  const start = Math.max(0, index - 50);
  const end = Math.min(content.length, index + query.length + 100);
  
  let excerpt = content.substring(start, end);
  if (start > 0) excerpt = '...' + excerpt;
  if (end < content.length) excerpt = excerpt + '...';
  
  return excerpt;
} 