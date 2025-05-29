'use client';

import { Icon } from '@/components/iconfont-loader';
import { getLinksByCategory, linkCategories, LinkCategory, LinkItem, linkItems, searchLinks } from '@/config/link.config';
import { cn } from '@/lib/utils';
import { parseWebsite, WebsiteInfo } from '@/lib/website-parser';
import { ExternalLink, Plus, Search, Zap } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface SiteCardProps {
  link: LinkItem;
  websiteInfo?: WebsiteInfo | undefined;
  onRefresh?: () => void;
}

function SiteCard({ link, websiteInfo, onRefresh }: SiteCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const title = link.customTitle || websiteInfo?.title || link.title;
  const description = link.customDescription || websiteInfo?.description || link.description;
  const icon = link.customIcon || link.icon || websiteInfo?.icon || link.fallbackIcon;
  const isIconFont = icon && typeof icon === 'string' && icon.startsWith('icon-');

  const handleRefresh = async () => {
    if (!onRefresh || isLoading) return;
    setIsLoading(true);
    await onRefresh();
    setIsLoading(false);
  };

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm",
        "transition-all duration-300 ease-out",
        "hover:border-border hover:bg-card/90 hover:shadow-lg hover:shadow-primary/5",
        "hover:scale-[1.01] hover:-translate-y-0.5",
        isHovered && "ring-2 ring-primary/20"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 背景渐变 */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* 主要内容 */}
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="relative block p-4 h-full"
      >
        {/* 紧凑布局：图标+标题在同一行 */}
        <div className="flex items-start gap-3 mb-3">
          {/* 图标 */}
          <div className={cn(
            "flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center",
            "bg-muted/60 border border-border/40",
            "group-hover:bg-primary/10 group-hover:border-primary/30",
            "transition-all duration-300"
          )}>
            {isIconFont ? (
              <Icon name={icon} className="text-lg text-foreground group-hover:text-primary transition-colors" fallback={link.fallbackIcon || '🔗'} />
            ) : (
              <span className="text-lg">{icon}</span>
            )}
          </div>

          {/* 标题和外链图标 */}
          <div className="flex-1 min-w-0 flex items-start justify-between">
            <h3 className={cn(
              "font-semibold text-base line-clamp-1 pr-2",
              "text-foreground group-hover:text-primary transition-colors duration-300"
            )}>
              {title}
            </h3>
            
            {/* 外链图标 */}
            <ExternalLink className={cn(
              "h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 flex-shrink-0",
              "transform translate-x-2 group-hover:translate-x-0 transition-all duration-300"
            )} />
          </div>
        </div>

        {/* 描述 */}
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed pl-13">
          {description}
        </p>
        
        {/* 访问按钮 */}
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-background dark:bg-slate-800 text-primary shadow-lg backdrop-blur-sm border border-border/50 transform group-hover:translate-y-0 translate-y-2 transition-all duration-300 hover:scale-105">
            <span className="text-xs font-medium">Visit</span>
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="transform group-hover:translate-x-0.5 transition-transform duration-300">
              <path d="M1 7H13M13 7L7 1M13 7L7 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </a>

      {/* 刷新按钮 */}
      {onRefresh && (
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className={cn(
            "absolute top-2 right-2 w-7 h-7 rounded-md bg-background/80 backdrop-blur-sm",
            "border border-border/60 flex items-center justify-center",
            "opacity-0 group-hover:opacity-100 transition-all duration-300",
            "hover:bg-primary/10 hover:border-primary/30",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          <Zap className={cn(
            "h-3.5 w-3.5 text-muted-foreground",
            isLoading && "animate-spin"
          )} />
        </button>
      )}
    </div>
  );
}

interface CategorySectionProps {
  category: LinkCategory;
  links: LinkItem[];
  websiteInfoMap: Map<string, WebsiteInfo>;
  onRefreshLink: (linkId: string) => void;
}

function CategorySection({ category, links, websiteInfoMap, onRefreshLink }: CategorySectionProps) {
  if (links.length === 0) return null;

  const colorClasses = {
    blue: "from-blue-500/20 to-blue-600/20 border-blue-500/30",
    purple: "from-purple-500/20 to-purple-600/20 border-purple-500/30",
    green: "from-green-500/20 to-green-600/20 border-green-500/30",
    orange: "from-orange-500/20 to-orange-600/20 border-orange-500/30",
    pink: "from-pink-500/20 to-pink-600/20 border-pink-500/30",
    gray: "from-gray-500/20 to-gray-600/20 border-gray-500/30",
  };

  const gradientClass = colorClasses[category.color as keyof typeof colorClasses] || colorClasses.gray;
  const isIconFont = category.icon && category.icon.startsWith('icon-');

  return (
    <section className="space-y-4">
      {/* 分类标题 */}
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-10 h-10 rounded-xl bg-gradient-to-br border flex items-center justify-center",
          gradientClass
        )}>
          {isIconFont ? (
            <Icon name={category.icon!} className="text-lg text-foreground" fallback="📁" />
          ) : (
            <span className="text-lg">📁</span>
          )}
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">{category.name}</h2>
          {category.description && (
            <p className="text-sm text-muted-foreground">{category.description}</p>
          )}
        </div>
        <div className="ml-auto px-3 py-1 bg-muted/60 rounded-full text-xs font-medium text-muted-foreground">
          {links.length} 个站点
        </div>
      </div>

      {/* 站点网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {links.map((link) => (
          <SiteCard
            key={link.id}
            link={link}
            websiteInfo={websiteInfoMap.get(link.id)}
            onRefresh={() => onRefreshLink(link.id)}
          />
        ))}
      </div>
    </section>
  );
}

export function SiteNavigation() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [websiteInfoMap, setWebsiteInfoMap] = useState<Map<string, WebsiteInfo>>(new Map());
  const [isLoadingAll, setIsLoadingAll] = useState(false);

  // 过滤链接
  const filteredLinks = useCallback(() => {
    let links = linkItems;

    // 搜索过滤
    if (searchQuery.trim()) {
      links = searchLinks(searchQuery);
    }

    // 分类过滤
    if (selectedCategory !== 'all') {
      links = links.filter(link => link.category === selectedCategory);
    }

    return links;
  }, [searchQuery, selectedCategory]);

  // 按分类分组链接
  const groupedLinks = useCallback(() => {
    const links = filteredLinks();
    const groups = new Map<string, LinkItem[]>();

    // 如果有搜索或选择了特定分类，显示所有匹配的链接
    if (searchQuery.trim() || selectedCategory !== 'all') {
      // 按分类分组
      for (const link of links) {
        const categoryLinks = groups.get(link.category) || [];
        categoryLinks.push(link);
        groups.set(link.category, categoryLinks);
      }
    } else {
      // 默认显示所有分类
      for (const category of linkCategories) {
        const categoryLinks = getLinksByCategory(category.id);
        if (categoryLinks.length > 0) {
          groups.set(category.id, categoryLinks);
        }
      }
    }

    return groups;
  }, [filteredLinks, searchQuery, selectedCategory]);

  // 刷新单个链接信息
  const refreshLink = useCallback(async (linkId: string) => {
    const link = linkItems.find(l => l.id === linkId);
    if (!link) return;

    try {
      const info = await parseWebsite(link.url, { 
        fallbackIcon: link.fallbackIcon || '🌐',
        timeout: 10000 // 10秒超时
      });
      setWebsiteInfoMap(prev => new Map(prev).set(linkId, info));
    } catch (error) {
      console.warn(`Failed to refresh link ${linkId}:`, error);
      // 设置fallback信息
      setWebsiteInfoMap(prev => new Map(prev).set(linkId, {
        title: link.title,
        description: link.description,
        icon: link.icon || link.fallbackIcon || '🌐',
        url: link.url
      }));
    }
  }, []);

  // 批量加载网站信息
  const loadWebsiteInfo = useCallback(async () => {
    setIsLoadingAll(true);
    try {
      // 分批加载，每批5个，避免并发过多
      const batchSize = 5;
      const batches = [];
      for (let i = 0; i < linkItems.length; i += batchSize) {
        batches.push(linkItems.slice(i, i + batchSize));
      }

      const newMap = new Map<string, WebsiteInfo>();
      
      for (const batch of batches) {
        const results = await Promise.allSettled(
          batch.map(async (link) => {
            try {
              const info = await parseWebsite(link.url, { 
                fallbackIcon: link.fallbackIcon || '🌐',
                timeout: 8000 // 8秒超时
              });
              return { id: link.id, info };
            } catch (error) {
              console.warn(`Failed to parse ${link.url}:`, error);
              // 返回fallback信息
              return { 
                id: link.id, 
                info: {
                  title: link.title,
                  description: link.description,
                  icon: link.icon || link.fallbackIcon || '🌐',
                  url: link.url
                }
              };
            }
          })
        );

        results.forEach((result) => {
          if (result.status === 'fulfilled') {
            newMap.set(result.value.id, result.value.info);
          }
        });

        // 批次间延迟，避免过于频繁的请求
        if (batches.indexOf(batch) < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      setWebsiteInfoMap(newMap);
    } catch (error) {
      console.error('Failed to load website info:', error);
    } finally {
      setIsLoadingAll(false);
    }
  }, []);

  useEffect(() => {
    // 初始加载部分站点的信息，使用更保守的策略
    const loadInitialInfo = async () => {
      try {
        const results = await Promise.allSettled(
          linkItems.slice(0, 6).map(async (link) => {
            try {
              const info = await parseWebsite(link.url, { 
                fallbackIcon: link.fallbackIcon || '🌐',
                timeout: 5000 // 5秒超时
              });
              return { id: link.id, info };
            } catch (error) {
              console.warn(`Failed to parse ${link.url}:`, error);
              return { 
                id: link.id, 
                info: {
                  title: link.title,
                  description: link.description,
                  icon: link.icon || link.fallbackIcon || '🌐',
                  url: link.url
                }
              };
            }
          })
        );

        const newMap = new Map<string, WebsiteInfo>();
        results.forEach((result) => {
          if (result.status === 'fulfilled') {
            newMap.set(result.value.id, result.value.info);
          }
        });
        setWebsiteInfoMap(newMap);
      } catch (error) {
        console.error('Failed to load initial website info:', error);
      }
    };

    loadInitialInfo();
  }, []);

  const groups = groupedLinks();

  return (
    <div className="space-y-8">
      {/* 搜索和过滤 */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* 搜索框 */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="搜索网站名称或描述..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "w-full h-12 pl-10 pr-4 rounded-xl border border-border/60 bg-background/80 backdrop-blur-sm",
              "placeholder:text-muted-foreground text-sm transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60",
              "hover:border-border hover:bg-background/90"
            )}
          />
        </div>

        {/* 分类过滤 */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedCategory('all')}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
              "border border-border/60",
              selectedCategory === 'all'
                ? "bg-primary text-white border-primary"
                : "bg-background/80 text-foreground hover:bg-accent/60"
            )}
          >
            全部
          </button>
          {linkCategories.slice(0, 4).map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                "border border-border/60",
                selectedCategory === category.id
                  ? "bg-primary text-white border-primary"
                  : "bg-background/80 text-foreground hover:bg-accent/60"
              )}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* 批量加载按钮 */}
        <button
          onClick={loadWebsiteInfo}
          disabled={isLoadingAll}
          className={cn(
            "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
            "border border-border/60 bg-background/80 text-foreground",
            "hover:bg-accent/60 flex items-center gap-2",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          <Zap className={cn("h-4 w-4", isLoadingAll && "animate-spin")} />
          {isLoadingAll ? '加载中...' : '刷新全部'}
        </button>
      </div>

      {/* 站点列表 */}
      <div className="space-y-12">
        {groups.size === 0 ? (
          <div className="text-center py-16 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-muted/60 flex items-center justify-center">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground">未找到相关站点</h3>
            <p className="text-muted-foreground">尝试调整搜索关键词或选择其他分类</p>
          </div>
        ) : (
          Array.from(groups.entries()).map(([categoryId, links]) => {
            const category = linkCategories.find(c => c.id === categoryId);
            if (!category) return null;

            return (
              <CategorySection
                key={categoryId}
                category={category}
                links={links}
                websiteInfoMap={websiteInfoMap}
                onRefreshLink={refreshLink}
              />
            );
          })
        )}
      </div>

      {/* 添加站点提示 */}
      <div className="mt-16 p-6 rounded-xl border border-dashed border-border/60 bg-muted/20 text-center space-y-3">
        <div className="w-12 h-12 mx-auto rounded-xl bg-muted/60 flex items-center justify-center">
          <Plus className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="font-medium text-foreground">想要添加更多站点？</h3>
        <p className="text-sm text-muted-foreground">
          您可以在 <code className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">config/link.config.ts</code> 中添加更多网站配置
        </p>
      </div>
    </div>
  );
} 