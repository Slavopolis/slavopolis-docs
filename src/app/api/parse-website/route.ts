import { NextRequest, NextResponse } from 'next/server';

export interface WebsiteMetadata {
  title?: string;
  description?: string;
  icon?: string;
  favicon?: string;
  siteName?: string;
  ogImage?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // 验证URL格式
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // 解析网站元数据
    const metadata = await parseWebsiteMetadata(parsedUrl.toString());

    return NextResponse.json(metadata);
  } catch (error) {
    console.error('Website parsing error:', error);
    return NextResponse.json(
      { error: 'Failed to parse website' },
      { status: 500 }
    );
  }
}

async function parseWebsiteMetadata(url: string): Promise<WebsiteMetadata> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SiteParser/1.0)',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    const metadata = extractMetadata(html, url);

    return metadata;
  } catch (error) {
    console.error('Failed to fetch website:', error);
    
    // 返回基础信息作为fallback
    const domain = new URL(url).hostname.replace(/^www\./, '');
    return {
      title: domain,
      description: `${domain} 网站`,
      siteName: domain,
    };
  }
}

function extractMetadata(html: string, url: string): WebsiteMetadata {
  const metadata: WebsiteMetadata = {};
  const domain = new URL(url).origin;

  // 提取title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch && titleMatch[1]) {
    metadata.title = decodeHTMLEntities(titleMatch[1].trim());
  }

  // 提取meta标签
  const metaTags = html.match(/<meta[^>]+>/gi) || [];
  
  for (const tag of metaTags) {
    const nameMatch = tag.match(/name=["']([^"']+)["']/i);
    const propertyMatch = tag.match(/property=["']([^"']+)["']/i);
    const contentMatch = tag.match(/content=["']([^"']+)["']/i);

    if (!contentMatch || !contentMatch[1]) continue;

    const content = decodeHTMLEntities(contentMatch[1]);
    const key = nameMatch?.[1] || propertyMatch?.[1];

    if (!key) continue;

    switch (key.toLowerCase()) {
      case 'description':
        metadata.description = content;
        break;
      case 'og:title':
        if (!metadata.title) metadata.title = content;
        break;
      case 'og:description':
        if (!metadata.description) metadata.description = content;
        break;
      case 'og:site_name':
        metadata.siteName = content;
        break;
      case 'og:image':
        metadata.ogImage = resolveUrl(content, domain);
        break;
      case 'twitter:title':
        if (!metadata.title) metadata.title = content;
        break;
      case 'twitter:description':
        if (!metadata.description) metadata.description = content;
        break;
    }
  }

  // 提取favicon链接
  const linkTags = html.match(/<link[^>]+>/gi) || [];
  
  for (const tag of linkTags) {
    const relMatch = tag.match(/rel=["']([^"']+)["']/i);
    const hrefMatch = tag.match(/href=["']([^"']+)["']/i);

    if (!relMatch || !hrefMatch || !relMatch[1] || !hrefMatch[1]) continue;

    const rel = relMatch[1].toLowerCase();
    const href = hrefMatch[1];

    if (rel.includes('icon')) {
      metadata.favicon = resolveUrl(href, domain);
      if (!metadata.icon) {
        metadata.icon = metadata.favicon;
      }
    }
  }

  // 如果没有找到favicon，使用默认路径
  if (!metadata.favicon) {
    metadata.favicon = `${domain}/favicon.ico`;
  }

  // 如果没有siteName，使用域名
  if (!metadata.siteName) {
    metadata.siteName = new URL(url).hostname.replace(/^www\./, '');
  }

  return metadata;
}

function decodeHTMLEntities(text: string): string {
  const entities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
  };

  return text.replace(/&[a-zA-Z0-9#]+;/g, (entity) => {
    return entities[entity] || entity;
  });
}

function resolveUrl(url: string, base: string): string {
  try {
    return new URL(url, base).toString();
  } catch {
    return url;
  }
} 