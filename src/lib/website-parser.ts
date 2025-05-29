export interface WebsiteInfo {
  title?: string;
  description?: string;
  icon?: string;
  favicon?: string;
  siteName?: string;
  url: string;
  ogImage?: string;  // 新增OpenGraph图片
  error?: string;
}

export interface ParseOptions {
  timeout?: number;
  useProxy?: boolean;
  fallbackIcon?: string;
  retryCount?: number;  // 新增重试次数选项
  preferredSource?: 'api' | 'client' | 'auto';  // 新增首选解析来源
}

class WebsiteParser {
  private cache = new Map<string, WebsiteInfo>();
  private cacheExpiry = new Map<string, number>();
  private readonly CACHE_DURATION = 1000 * 60 * 30; // 30分钟缓存
  private readonly KNOWN_SITES: Record<string, Partial<WebsiteInfo>>;

  constructor() {
    // 初始化已知网站信息库
    this.KNOWN_SITES = this.initKnownSites();
  }

  /**
   * 解析网站信息
   */
  async parseWebsite(url: string, options: ParseOptions = {}): Promise<WebsiteInfo> {
    const {
      timeout = 8000,  // 缩短默认超时时间以提高响应速度
      useProxy = true,
      fallbackIcon = '🌐',
      retryCount = 1,  // 默认重试1次
      preferredSource = 'auto'
    } = options;

    // 标准化URL
    const normalizedUrl = this.normalizeUrl(url);
    
    // 检查缓存
    const cached = this.getFromCache(normalizedUrl);
    if (cached) {
      return cached;
    }

    // 从域名快速获取已知网站信息
    const domain = this.extractDomain(normalizedUrl);
    const knownSiteInfo = this.getKnownSiteInfo(domain);
    
    try {
      let websiteInfo: WebsiteInfo;
      let error: Error | null = null;
      
      // 根据首选来源决定解析顺序
      if (preferredSource === 'client') {
        // 优先使用客户端解析
        websiteInfo = await this.parseWithClient(normalizedUrl, knownSiteInfo || undefined);
        
        // 如果客户端解析不完整，尝试API解析
        if (!websiteInfo.title || !websiteInfo.description) {
          try {
            const apiInfo = await this.parseWithAPI(normalizedUrl, timeout);
            websiteInfo = this.mergeWebsiteInfo(websiteInfo, apiInfo);
          } catch (e) {
            console.warn('API解析失败，使用客户端结果', e);
          }
        }
      } else if (preferredSource === 'api') {
        // 优先使用API解析
        try {
          websiteInfo = await this.parseWithAPI(normalizedUrl, timeout);
        } catch (e) {
          error = e as Error;
          // API失败时回退到客户端解析
          websiteInfo = await this.parseWithClient(normalizedUrl, knownSiteInfo || undefined);
        }
      } else {
        // 自动模式 - 并行尝试两种方法
        const [apiResult, clientResult] = await Promise.allSettled([
          this.parseWithAPI(normalizedUrl, timeout),
          this.parseWithClient(normalizedUrl, knownSiteInfo || undefined)
        ]);
        
        if (apiResult.status === 'fulfilled') {
          websiteInfo = apiResult.value;
          // 如果API成功但缺少某些字段，从客户端结果补充
          if (clientResult.status === 'fulfilled') {
            websiteInfo = this.mergeWebsiteInfo(websiteInfo, clientResult.value);
          }
        } else if (clientResult.status === 'fulfilled') {
          websiteInfo = clientResult.value;
          error = apiResult.reason;
        } else {
          // 两种方法都失败，尝试重试
          if (retryCount > 0) {
            console.warn(`两种解析方法都失败，正在重试(${retryCount})...`);
            return this.parseWebsite(url, {...options, retryCount: retryCount - 1});
          }
          throw new Error('All parsing methods failed');
        }
      }

      // 使用启发式方法补充信息
      websiteInfo = this.enrichWebsiteInfo(websiteInfo, normalizedUrl, fallbackIcon, knownSiteInfo || undefined);

      // 缓存结果
      this.setCache(normalizedUrl, websiteInfo);

      return websiteInfo;
    } catch (error) {
      console.error('Failed to parse website:', error);
      
      // 如果有已知网站信息，优先使用
      if (knownSiteInfo && Object.keys(knownSiteInfo).length > 0) {
        const fallbackInfo: WebsiteInfo = {
          url: normalizedUrl,
          ...knownSiteInfo,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
        this.setCache(normalizedUrl, fallbackInfo);
        return fallbackInfo;
      }
      
      // 完全失败时的基本回退
      const fallbackInfo: WebsiteInfo = {
        url: normalizedUrl,
        title: this.extractDomainName(normalizedUrl),
        icon: fallbackIcon,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      
      this.setCache(normalizedUrl, fallbackInfo);
      return fallbackInfo;
    }
  }

  /**
   * 合并两个网站信息对象，优先使用第一个对象的非空值
   */
  private mergeWebsiteInfo(primary: WebsiteInfo, secondary: WebsiteInfo): WebsiteInfo {
    const result: WebsiteInfo = {
      url: primary.url || secondary.url,
    };

    // 只添加有值的属性
    const title = primary.title || secondary.title;
    if (title) result.title = title;

    const description = primary.description || secondary.description;
    if (description) result.description = description;

    const icon = primary.icon || secondary.icon;
    if (icon) result.icon = icon;

    const favicon = primary.favicon || secondary.favicon;
    if (favicon) result.favicon = favicon;

    const siteName = primary.siteName || secondary.siteName;
    if (siteName) result.siteName = siteName;

    const ogImage = primary.ogImage || secondary.ogImage;
    if (ogImage) result.ogImage = ogImage;

    const error = primary.error;
    if (error) result.error = error;

    return result;
  }

  /**
   * 通过API解析网站信息
   */
  private async parseWithAPI(url: string, timeout: number): Promise<WebsiteInfo> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      // 使用自建的解析API
      const response = await fetch('/api/parse-website', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, timeout: timeout - 1000 }), // 给服务端留出1秒的缓冲时间
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      return {
        url,
        title: data.title,
        description: data.description,
        icon: data.icon,
        favicon: data.favicon,
        siteName: data.siteName,
        ogImage: data.ogImage,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      
      // 如果是中止错误，返回基础信息
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`API request timed out after ${timeout}ms`);
      }
      
      throw error;
    }
  }

  /**
   * 客户端解析
   */
  private async parseWithClient(url: string, knownSiteInfo?: Partial<WebsiteInfo>): Promise<WebsiteInfo> {
    // 如果有已知信息，先使用已知信息
    if (knownSiteInfo && Object.keys(knownSiteInfo).length > 0) {
      return { 
        url,
        title: knownSiteInfo.title || this.extractDomainName(url),
        description: knownSiteInfo.description,
        icon: knownSiteInfo.icon,
        favicon: knownSiteInfo.favicon,
        siteName: knownSiteInfo.siteName,
        ogImage: knownSiteInfo.ogImage
      };
    }

    // 尝试从元标签解析
    const metaInfo = await this.parseMetaTags(url);
    
    // 尝试从favicon获取图标
    let favicon: string | undefined = metaInfo.favicon;
    if (!favicon) {
      favicon = await this.getFavicon(url);
    }

    return {
      url,
      title: metaInfo.title || this.extractDomainName(url),
      description: metaInfo.description,
      icon: metaInfo.icon,
      favicon,
      siteName: metaInfo.siteName,
      ogImage: metaInfo.ogImage
    };
  }

  /**
   * 解析元标签信息 - 尝试使用客户端fetch直接提取元标签
   */
  private async parseMetaTags(url: string): Promise<Partial<WebsiteInfo>> {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SlavopolisBot/1.0; +https://slavopolis.com/bot)'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch URL: ${response.status}`);
      }
      
      const html = await response.text();
      
      // 提取标题
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const title = titleMatch?.[1]?.trim();
      
      // 提取元标签
      const metaTags: Record<string, string> = {};
      const metaMatches = html.matchAll(/<meta[^>]+>/gi);
      
      for (const match of metaMatches) {
        const meta = match[0];
        let name = meta.match(/name=["']([^"']+)["']/i)?.[1];
        const property = meta.match(/property=["']([^"']+)["']/i)?.[1];
        const content = meta.match(/content=["']([^"']+)["']/i)?.[1];
        
        if ((name || property) && content) {
          name = (name || property)?.toLowerCase();
          metaTags[name as string] = content;
        }
      }
      
      // 提取favicon
      let favicon: string | undefined;
      const faviconMatches = html.match(/<link[^>]+rel=["'](?:shortcut )?icon["'][^>]+>/gi);
      if (faviconMatches) {
        for (const match of faviconMatches) {
          const hrefMatch = match.match(/href=["']([^"']+)["']/i);
          if (hrefMatch?.[1]) {
            favicon = this.resolveUrl(url, hrefMatch[1]);
            break;
          }
        }
      }
      
      // 尝试找到apple-touch-icon
      if (!favicon) {
        const appleTouchIconMatch = html.match(/<link[^>]+rel=["']apple-touch-icon["'][^>]+>/i);
        if (appleTouchIconMatch) {
          const hrefMatch = appleTouchIconMatch[0].match(/href=["']([^"']+)["']/i);
          if (hrefMatch?.[1]) {
            favicon = this.resolveUrl(url, hrefMatch[1]);
          }
        }
      }
      
      // 获取OpenGraph图片
      const ogImage = metaTags['og:image'] || metaTags['twitter:image'];
      
      return {
        title,
        description: metaTags['description'] || metaTags['og:description'] || metaTags['twitter:description'],
        siteName: metaTags['og:site_name'] || metaTags['application-name'],
        favicon,
        ogImage: ogImage ? this.resolveUrl(url, ogImage) : undefined,
      };
    } catch (error) {
      console.warn('Failed to parse meta tags:', error);
      return {};
    }
  }

  /**
   * 解析相对URL为绝对URL
   */
  private resolveUrl(base: string, relative: string): string {
    try {
      return new URL(relative, base).href;
    } catch {
      return relative;
    }
  }

  /**
   * 获取网站favicon
   */
  private async getFavicon(url: string): Promise<string | undefined> {
    try {
      const domain = new URL(url).origin;
      const faviconUrls = [
        `${domain}/favicon.ico`,
        `${domain}/favicon.png`,
        `${domain}/apple-touch-icon.png`,
        `${domain}/android-chrome-192x192.png`,
        `${domain}/static/favicon.ico`, // 常见路径变体
        `${domain}/assets/favicon.ico`,
        `${domain}/img/favicon.ico`,
        `${domain}/images/favicon.ico`,
      ];

      // 并行检查所有可能的favicon URL
      const results = await Promise.allSettled(
        faviconUrls.map(faviconUrl => 
          fetch(faviconUrl, { method: 'HEAD' })
            .then(response => response.ok ? faviconUrl : null)
            .catch(() => null)
        )
      );
      
      // 返回第一个成功的URL
      for (const result of results) {
        if (result.status === 'fulfilled' && result.value) {
          return result.value;
        }
      }
    } catch {
      // 忽略错误
    }
    return undefined;
  }

  /**
   * 初始化已知网站信息库
   */
  private initKnownSites(): Record<string, Partial<WebsiteInfo>> {
    return {
      'github.com': {
        title: 'GitHub',
        description: '全球最大的代码托管平台',
        siteName: 'GitHub',
        favicon: 'https://github.com/favicon.ico',
      },
      'vercel.com': {
        title: 'Vercel',
        description: '现代化的前端部署平台',
        siteName: 'Vercel',
        favicon: 'https://vercel.com/favicon.ico',
      },
      'figma.com': {
        title: 'Figma',
        description: '协作式设计工具',
        siteName: 'Figma',
        favicon: 'https://figma.com/favicon.ico',
      },
      'notion.so': {
        title: 'Notion',
        description: '一体化工作空间',
        siteName: 'Notion',
        favicon: 'https://notion.so/favicon.ico',
      },
      'chat.openai.com': {
        title: 'ChatGPT',
        description: 'OpenAI 对话AI',
        siteName: 'OpenAI',
        favicon: 'https://chat.openai.com/favicon.ico',
      },
      'claude.ai': {
        title: 'Claude',
        description: 'Anthropic AI 助手',
        siteName: 'Anthropic',
        favicon: 'https://claude.ai/favicon.ico',
      },
      'deepseek.com': {
        title: 'DeepSeek | 深度求索',
        description: '专注于研究世界领先的通用人工智能底层模型与技术',
        siteName: 'DeepSeek',
        favicon: 'https://www.deepseek.com/favicon.ico',
      },
      'huggingface.co': {
        title: 'Hugging Face',
        description: 'AI 社区和模型共享平台',
        siteName: 'Hugging Face',
        favicon: 'https://huggingface.co/favicon.ico',
      },
      'replicate.com': {
        title: 'Replicate',
        description: 'AI 模型运行平台',
        siteName: 'Replicate',
        favicon: 'https://replicate.com/favicon.ico',
      },
      'anthropic.com': {
        title: 'Anthropic',
        description: '负责任的AI研究和产品公司',
        siteName: 'Anthropic',
        favicon: 'https://anthropic.com/favicon.ico',
      },
      'perplexity.ai': {
        title: 'Perplexity AI',
        description: '基于AI的搜索引擎',
        siteName: 'Perplexity',
        favicon: 'https://perplexity.ai/favicon.ico',
      },
      'youtube.com': {
        title: 'YouTube',
        description: '全球最大的视频分享平台',
        siteName: 'YouTube',
        favicon: 'https://youtube.com/favicon.ico',
      },
      'twitter.com': {
        title: 'Twitter',
        description: '实时社交网络和通讯平台',
        siteName: 'Twitter',
        favicon: 'https://twitter.com/favicon.ico',
      },
      'x.com': {
        title: 'X',
        description: '实时社交网络和通讯平台',
        siteName: 'X',
        favicon: 'https://x.com/favicon.ico',
      },
    };
  }

  /**
   * 获取已知网站信息
   */
  private getKnownSiteInfo(domain: string): Partial<WebsiteInfo> | null {
    return this.KNOWN_SITES[domain] || null;
  }

  /**
   * 丰富网站信息
   */
  private enrichWebsiteInfo(
    info: WebsiteInfo, 
    url: string, 
    fallbackIcon: string,
    knownInfo?: Partial<WebsiteInfo>
  ): WebsiteInfo {
    const domain = this.extractDomain(url);
    const domainName = this.extractDomainName(url);
    
    // 合并已知信息
    const enrichedInfo = { ...info };
    
    // 优先使用已有信息，如果没有则依次尝试其他来源
    enrichedInfo.title = info.title || 
                       (knownInfo?.title || 
                       info.siteName || 
                       domainName);
                        
    enrichedInfo.description = info.description || 
                             (knownInfo?.description || 
                             `${domainName} 网站`);
                              
    enrichedInfo.siteName = info.siteName || 
                          (knownInfo?.siteName || 
                          domainName);
                           
    // 图标处理逻辑
    enrichedInfo.favicon = info.favicon || knownInfo?.favicon;
    
    // 图标优先级: 显式图标 > favicon > og图像 > 备用图标
    enrichedInfo.icon = info.icon || 
                      info.favicon || 
                      info.ogImage || 
                      fallbackIcon;
    
    return enrichedInfo;
  }

  /**
   * 标准化URL
   */
  private normalizeUrl(url: string): string {
    try {
      // 如果没有协议，默认添加https
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      
      const urlObj = new URL(url);
      
      // 移除URL末尾的斜杠
      let normalizedUrl = urlObj.toString();
      if (normalizedUrl.endsWith('/') && urlObj.pathname === '/') {
        normalizedUrl = normalizedUrl.slice(0, -1);
      }
      
      return normalizedUrl;
    } catch {
      return url;
    }
  }

  /**
   * 提取域名
   */
  private extractDomain(url: string): string {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  }

  /**
   * 提取域名（友好显示）
   */
  private extractDomainName(url: string): string {
    try {
      const hostname = new URL(url).hostname;
      // 移除www前缀
      return hostname.replace(/^www\./, '');
    } catch {
      return url;
    }
  }

  /**
   * 缓存管理
   */
  private getFromCache(url: string): WebsiteInfo | null {
    const expiry = this.cacheExpiry.get(url);
    if (expiry && Date.now() < expiry) {
      return this.cache.get(url) || null;
    }
    
    // 清理过期缓存
    this.cache.delete(url);
    this.cacheExpiry.delete(url);
    return null;
  }

  private setCache(url: string, info: WebsiteInfo): void {
    this.cache.set(url, info);
    this.cacheExpiry.set(url, Date.now() + this.CACHE_DURATION);
  }

  /**
   * 清理缓存
   */
  public clearCache(): void {
    this.cache.clear();
    this.cacheExpiry.clear();
  }

  /**
   * 批量解析网站
   */
  async parseWebsites(urls: string[], options?: ParseOptions): Promise<WebsiteInfo[]> {
    // 使用限流批量处理，避免并发过高
    const batchSize = 5; // 每批处理5个网站
    const results: WebsiteInfo[] = [];
    
    for (let i = 0; i < urls.length; i += batchSize) {
      const batch = urls.slice(i, i + batchSize);
      const batchPromises = batch.map(url => this.parseWebsite(url, options));
      
      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          results.push({
            url: batch[index] || '',
            title: this.extractDomainName(batch[index] || ''),
            error: result.reason?.message || 'Parse failed',
            icon: options?.fallbackIcon || '🌐',
          });
        }
      });
    }
    
    return results;
  }
}

// 创建全局实例
export const websiteParser = new WebsiteParser();

// 便捷函数
export const parseWebsite = (url: string, options?: ParseOptions) =>
  websiteParser.parseWebsite(url, options);

export const parseWebsites = (urls: string[], options?: ParseOptions) =>
  websiteParser.parseWebsites(urls, options); 