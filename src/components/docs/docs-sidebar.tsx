'use client';

import { useCurrentPath } from '@/hooks/use-current-path';
import { usePageProtection } from '@/hooks/use-page-protection';
import { ClientSearchResult, highlightText, useSearch } from '@/hooks/use-search';
import type { DocItem } from '@/lib/docs';
import { cn } from '@/lib/utils';
import {
    Book,
    BookOpen,
    Box,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    Code2,
    Cpu,
    Database,
    ExternalLink,
    FileCode,
    Folder,
    FolderOpen,
    Github,
    Globe,
    Hash,
    Mail,
    Menu,
    Palette,
    Search,
    SearchX,
    Settings,
    Shield,
    Sparkles,
    User,
    X,
    Zap
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { authorConfig } from '../../../config/author.config';
import { siteConfig } from '../../../config/site.config';
import { PageProtection } from '../auth/PageProtection';
import { Icon } from '../iconfont-loader';
import { GlobalSearchDialog } from '../search/global-search-dialog';

interface DocsSidebarProps {
  items: DocItem[];
  className?: string;
}

interface DocsSidebarItemProps {
  item: DocItem;
  level?: number;
  isCollapsed?: boolean;
}

interface ToolboxAppProps {
  app: any;
  isCollapsed: boolean;
  onClick: () => void;
}

function ToolboxApp({ app, isCollapsed, onClick }: ToolboxAppProps) {
  return (
    <div
      className={cn(
        "group relative rounded-lg transition-all duration-200 cursor-pointer",
        "hover:bg-gradient-to-r hover:from-primary/10 hover:to-purple-500/10",
        "border border-border/30 hover:border-primary/30",
        "active:scale-95"
      )}
      onClick={onClick}
    >
      <div className={cn(
        "flex items-center gap-3 p-3",
        isCollapsed && "justify-center"
      )}>
        <div className={cn(
          "flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center",
          "bg-background border border-border/40",
          "group-hover:border-primary/30",
          "transition-all duration-300"
        )}>
          {app.icon?.startsWith('icon-') ? (
            <Icon name={app.icon} className="text-xl text-muted-foreground group-hover:text-primary transition-colors duration-200" />
          ) : (
            <span className="text-lg text-muted-foreground group-hover:text-primary">{app.fallbackIcon}</span>
          )}
        </div>

        {!isCollapsed && (
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                {app.name}
              </h4>
              {app.protected && (
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              )}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
              {app.description}
            </p>
          </div>
        )}

        {!isCollapsed && (
          <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </div>

      {/* {app.featured && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse" />
      )} */}
      
      {app.protected && isCollapsed && (
        <div className="absolute bottom-2 right-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>
      )}
    </div>
  );
}

export function DocsSidebar({ items, className }: DocsSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isAuthorExpanded, setIsAuthorExpanded] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<'docs' | 'toolbox'>('docs');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
  const { results: searchResults, hasQuery } = useSearch(items, searchQuery, { limit: 10 });

  // 页面保护功能
  const {
    isProtectionOpen,
    currentApp,
    tryAccessApp,
    unlockApp,
    closeProtection,
  } = usePageProtection();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsGlobalSearchOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    
    const newCollapsed = !isCollapsed;
    
    const mainContents = document.querySelectorAll('#docs-main-content, [data-docs-main]');
    mainContents.forEach((mainContent) => {
      if (newCollapsed) {
        mainContent.classList.remove('lg:ml-80');
        mainContent.classList.add('lg:ml-16');
      } else {
        mainContent.classList.remove('lg:ml-16');
        mainContent.classList.add('lg:ml-80');
      }
    });
    
    const tocs = document.querySelectorAll('#docs-toc, [data-docs-toc]');
    tocs.forEach((toc) => {
      if (newCollapsed) {
        toc.classList.remove('w-56');
        toc.classList.add('w-64');
      } else {
        toc.classList.remove('w-64');
        toc.classList.add('w-56');
      }
    });
  };

  const closeMobile = () => {
    setIsMobileOpen(false);
  };

  const toggleAuthorExpanded = () => {
    setIsAuthorExpanded(!isAuthorExpanded);
  };

  const handleToolboxAppClick = (app: any) => {
    setIsMobileOpen(false);
    
    const protectedApp = {
      id: app.id,
      name: app.name,
      description: app.description,
      href: app.href,
    };

    // 尝试访问应用
    if (tryAccessApp(protectedApp)) {
      // 如果不需要保护或已解锁，直接跳转
      window.location.href = app.href;
    }
    // 如果需要保护，tryAccessApp会自动打开保护对话框
  };

  return (
    <>
      <button
        className="fixed top-4 left-4 z-[60] p-2 rounded-lg bg-background/80 backdrop-blur-sm border border-border/60 lg:hidden hover:bg-accent transition-all duration-200"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </button>

      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={closeMobile}
        />
      )}

      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 transition-all duration-300 ease-in-out",
          "flex flex-col border-r border-border/40",
          "bg-background/98 backdrop-blur-sm",
          isCollapsed ? "w-16" : "w-80",
          "lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          className
        )}
      >
        <div className="flex-shrink-0 p-4 border-b border-border/40">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <div className="relative group">
                <div className="w-10 h-10 border border-border/60 rounded-lg flex items-center justify-center bg-background hover:bg-accent/50 transition-colors duration-300 overflow-hidden">
                  {siteConfig.logo ? (
                    <img 
                      src={siteConfig.logo} 
                      alt={siteConfig.name}
                      className="w-6 h-6 object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const bookIcon = target.nextElementSibling as HTMLElement;
                        if (bookIcon) bookIcon.style.display = 'block';
                      }}
                    />
                  ) : null}
                  <BookOpen className="h-5 w-5 text-foreground" style={{ display: siteConfig.logo ? 'none' : 'block' }} />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-background animate-pulse" />
              </div>
              {!isCollapsed && (
                <div className="transition-all duration-300">
                  <h2 className="font-bold text-base bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                    {siteConfig.name}
                  </h2>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Hash className="h-3 w-3" />
                    v{siteConfig.features.search ? '2.0.0' : '1.0.0'}
                  </p>
                </div>
              )}
            </Link>
            
            <button
              className="hidden lg:flex p-2 rounded-lg hover:bg-accent/60 transition-all duration-200 group border border-transparent hover:border-border/40"
              onClick={handleCollapse}
            >
              <ChevronLeft className={cn(
                "h-4 w-4 transition-transform duration-300 text-muted-foreground group-hover:text-foreground",
                isCollapsed && "rotate-180"
              )} />
            </button>
          </div>
        </div>

        {!isCollapsed && (
          <div className="flex-shrink-0 p-4 border-b border-border/30">
            <div className="relative group">
              <div className="absolute inset-0 rounded-xl blur-sm"></div>
                          <div className="absolute inset-[1px] rounded-[11px] border border-black/5 dark:border-white/10 shadow-inner bg-muted/30 dark:bg-black/20"></div>              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors duration-200 z-10" />
              <input
                className={cn(
                  "relative w-full h-10 pl-10 pr-12 rounded-xl border border-transparent",
                  "bg-transparent placeholder:text-muted-foreground text-sm transition-all duration-200 z-10",
                  "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60",
                  "hover:border-primary/20"
                )}
                placeholder="搜索文档..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 h-6 px-2 rounded-md border border-border/40 bg-muted/60 text-xs font-mono text-muted-foreground hidden sm:inline-flex items-center hover:bg-accent/60 transition-colors z-10"
                onClick={() => setIsGlobalSearchOpen(true)}
              >
                ⌘K
              </button>
            </div>
          </div>
        )}

        {!isCollapsed && (
          <div className="flex-shrink-0 p-4 border-b border-border/30">
            <div className="relative flex rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 p-1.5 backdrop-blur-sm shadow-sm border border-border/20">
              {/* 活动指示器背景 */}
              <div 
                className={cn(
                  "absolute inset-y-1.5 w-[calc(50%-4px)] rounded-lg bg-background shadow-md border border-border/30 transition-all duration-300 ease-out",
                  "before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br before:from-background before:to-background/90 before:backdrop-blur-sm",
                  "after:absolute after:inset-0 after:rounded-lg after:bg-gradient-to-br after:from-primary/5 after:to-purple-500/5 after:opacity-80",
                  sidebarMode === 'docs' 
                    ? "left-1.5 translate-x-0" 
                    : "left-[calc(50%+2px)] translate-x-0"
                )}
              />
              
              <button
                onClick={() => setSidebarMode('docs')}
                className={cn(
                  "relative z-10 flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  "hover:shadow-sm group",
                  sidebarMode === 'docs'
                    ? "text-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Folder className={cn(
                  "h-4 w-4 transition-transform duration-300 ease-out",
                  sidebarMode === 'docs' 
                    ? "text-blue-600 dark:text-blue-400 scale-110" 
                    : "text-muted-foreground group-hover:text-foreground group-hover:scale-105"
                )} />
                <span className={cn(
                  "transition-all duration-300 ease-out",
                  sidebarMode === 'docs' && "translate-x-0.5"
                )}>
                  文档导航
                </span>
              </button>
              
              <button
                onClick={() => setSidebarMode('toolbox')}
                className={cn(
                  "relative z-10 flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  "hover:shadow-sm group",
                  sidebarMode === 'toolbox'
                    ? "text-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Box className={cn(
                  "h-4 w-4 transition-transform duration-300 ease-out",
                  sidebarMode === 'toolbox' 
                    ? "text-purple-600 dark:text-purple-400 scale-110" 
                    : "text-muted-foreground group-hover:text-foreground group-hover:scale-105"
                )} />
                <span className={cn(
                  "transition-all duration-300 ease-out",
                  sidebarMode === 'toolbox' && "translate-x-0.5"
                )}>
                  百宝箱
                </span>
              </button>
            </div>
          </div>
        )}

        <nav className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-border/30 scrollbar-track-transparent">
          <div className="p-3 space-y-1">
            {!isCollapsed && (
              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                {sidebarMode === 'docs' ? (
                  hasQuery ? (
                    <>
                      <SearchX className="h-3 w-3" />
                      搜索结果 ({searchResults.length})
                    </>
                  ) : (
                    <>
                      <Folder className="h-3 w-3" />
                      文档导航
                    </>
                  )
                ) : (
                  <>
                    <Sparkles className="h-3 w-3" />
                    实用工具
                  </>
                )}
              </div>
            )}
            
            {sidebarMode === 'docs' ? (
              hasQuery ? (
                <div className="space-y-1">
                  {searchResults.length > 0 ? (
                    searchResults.map((result, index) => (
                      <SearchResultItem key={result.id} result={result} query={searchQuery} />
                    ))
                  ) : (
                    <div className="px-3 py-8 text-center">
                      <SearchX className="h-12 w-12 mx-auto mb-3 text-muted-foreground/40" />
                      <p className="text-sm text-muted-foreground mb-1">未找到相关文档</p>
                      <p className="text-xs text-muted-foreground/60">
                        尝试使用不同的关键词
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                items.map((item, index) => (
                  <DocsSidebarItem key={index} item={item} isCollapsed={isCollapsed} />
                ))
              )
            ) : (
              <div className="space-y-2">
                {siteConfig.toolbox.apps.map((app) => (
                  <ToolboxApp
                    key={app.id}
                    app={app}
                    isCollapsed={isCollapsed}
                    onClick={() => handleToolboxAppClick(app)}
                  />
                ))}
                
                {!isCollapsed && (
                  <div className="mt-6 p-4 rounded-xl border border-dashed border-border/60 bg-muted/20 text-center space-y-2">
                    <div className="w-8 h-8 mx-auto rounded-lg bg-muted/60 flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      更多实用工具即将上线
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </nav>

        {!isCollapsed && (
          <div className="flex-shrink-0 p-4 border-t border-border/40">
            <div 
              className={cn(
                "relative overflow-hidden rounded-xl bg-gradient-to-br from-card/80 via-card to-card/90 border border-border/40 backdrop-blur-sm cursor-pointer transition-all duration-300",
                isAuthorExpanded ? "pb-4" : "hover:bg-accent/30"
              )}
              onClick={toggleAuthorExpanded}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5" />
              
              <div className="relative p-3">
                <div className="flex items-center space-x-3">
                  <div className="relative flex-shrink-0">
                    <img 
                      src={authorConfig.avatar} 
                      alt={authorConfig.name}
                      className="w-10 h-10 rounded-lg object-cover ring-2 ring-primary/20"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(authorConfig.name)}&background=3b82f6&color=fff&rounded=true`;
                      }}
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-background" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-sm text-foreground truncate">
                        {authorConfig.name}
                      </h4>
                      <div className="flex items-center gap-1">
                        {/* <Star className="h-3 w-3 text-yellow-500 fill-current" /> */}
                        {isAuthorExpanded ? (
                          <ChevronUp className="h-3 w-3 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-3 w-3 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {authorConfig.location} • {authorConfig.experience}
                    </p>
                  </div>
                </div>

                {isAuthorExpanded && (
                  <div className="mt-4 space-y-3 animate-in slide-in-from-top-2 duration-300">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {authorConfig.bio}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        {authorConfig.social.github && (
                          <Link 
                            href={authorConfig.social.github}
                            className="p-1.5 rounded-lg hover:bg-accent/60 transition-all duration-200 group border border-transparent hover:border-border/40"
                            target="_blank"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Github className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                          </Link>
                        )}
                        {authorConfig.social.email && (
                          <Link 
                            href={`mailto:${authorConfig.social.email}`}
                            className="p-1.5 rounded-lg hover:bg-accent/60 transition-all duration-200 group border border-transparent hover:border-border/40"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Mail className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                          </Link>
                        )}
                        {authorConfig.website && (
                          <Link 
                            href={authorConfig.website}
                            className="p-1.5 rounded-lg hover:bg-accent/60 transition-all duration-200 group border border-transparent hover:border-border/40"
                            target="_blank"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Globe className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                          </Link>
                        )}
                      </div>
                      
                      <button 
                        className="p-1.5 rounded-lg hover:bg-accent/60 transition-all duration-200 group border border-transparent hover:border-border/40"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Settings className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                      </button>
                    </div>
                    
                    <div className="pt-2 border-t border-border/30">
                      <div className="flex flex-wrap gap-1">
                        {authorConfig.skills?.slice(0, 6).map((skill, index) => (
                          <span 
                            key={index}
                            className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-md border border-primary/20"
                          >
                            {skill}
                          </span>
                        ))}
                        {authorConfig.skills && authorConfig.skills.length > 6 && (
                          <span className="px-2 py-1 text-xs font-medium bg-muted/60 text-muted-foreground rounded-md border border-border/40">
                            +{authorConfig.skills.length - 6}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className={cn(
          "flex-shrink-0 border-t border-border/30 bg-muted/10",
          isCollapsed ? "p-2" : "p-4"
        )}>
          {isCollapsed ? (
            <div className="text-center">
              <p className="text-xs text-muted-foreground">©</p>
            </div>
          ) : (
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                <User className="h-3 w-3" />
                <span>© {siteConfig.copyright.year} {siteConfig.copyright.owner}</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-xs">
                <span className="px-2 py-1 bg-muted/60 text-muted-foreground rounded-md border border-border/40">
                  {siteConfig.copyright.license}
                </span>
                <Link 
                  href="/license" 
                  className="text-primary hover:text-primary/80 transition-colors"
                >
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </aside>

      <GlobalSearchDialog 
        documents={items}
        isOpen={isGlobalSearchOpen}
        onClose={() => setIsGlobalSearchOpen(false)}
      />
      
      <PageProtection
        isOpen={isProtectionOpen}
        onClose={closeProtection}
        onUnlock={unlockApp}
        appName={currentApp?.name || ''}
        appDescription={currentApp?.description || ''}
      />
    </>
  );
}

function DocsSidebarItem({ item, level = 0, isCollapsed = false }: DocsSidebarItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const paddingLeft = isCollapsed ? 8 : level * 16 + 12;
  const { isActive } = useCurrentPath();
  
  // 确保 href 已经是编码后的格式，避免重复编码
  const itemHref = item.href || '';
  const isCurrentActive = itemHref ? isActive(itemHref) : false;
  const hasActiveChild = hasChildren && item.children?.some(child => 
    (child.href ? isActive(child.href) : false) || 
    (child.children && child.children.some(grandChild => grandChild.href ? isActive(grandChild.href) : false))
  );

  useEffect(() => {
    if (hasChildren && hasActiveChild) {
      setIsOpen(true);
    }
  }, [hasChildren, hasActiveChild]);

  const toggleOpen = () => {
    if (hasChildren) {
      setIsOpen(!isOpen);
    }
  };

  const getIcon = () => {
    if (hasChildren) {
      if (level === 0) {
        return isOpen ? (
          <FolderOpen className="h-4 w-4 text-blue-500" />
        ) : (
          <Folder className="h-4 w-4 text-blue-600" />
        );
      } else {
        return isOpen ? (
          <FolderOpen className="h-4 w-4 text-amber-500" />
        ) : (
          <Folder className="h-4 w-4 text-amber-600" />
        );
      }
    } else {
      const title = item.title.toLowerCase();
      const href = item.href?.toLowerCase() || '';
      
      if (title.includes('mysql') || title.includes('数据库') || href.includes('mysql')) {
        return <Database className="h-3.5 w-3.5 text-emerald-600" />;
      } else if (title.includes('markdown') || title.includes('语法') || href.includes('markdown')) {
        return <Code2 className="h-3.5 w-3.5 text-purple-600" />;
      } else if (title.includes('规则') || title.includes('配置') || title.includes('指南')) {
        return <Shield className="h-3.5 w-3.5 text-blue-600" />;
      } else if (title.includes('特性') || title.includes('功能')) {
        return <Zap className="h-3.5 w-3.5 text-yellow-600" />;
      } else if (title.includes('部署') || title.includes('构建')) {
        return <Cpu className="h-3.5 w-3.5 text-orange-600" />;
      } else if (title.includes('主题') || title.includes('样式') || title.includes('设计')) {
        return <Palette className="h-3.5 w-3.5 text-pink-600" />;
      } else if (title.includes('文档') || title.includes('教程') || title.includes('开发')) {
        return <Book className="h-3.5 w-3.5 text-indigo-600" />;
      } else {
        return <FileCode className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />;
      }
    }
  };

  const handleItemClick = () => {
    if (hasChildren) {
      toggleOpen();
    }
  };

    return (
    <div>
      {hasChildren ? (
        <div
          className={cn(
            "group flex items-center rounded-lg transition-all duration-200 cursor-pointer relative",
            "hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:text-blue-600 dark:hover:text-blue-400",
            "text-foreground font-medium",
            level === 0 && "py-1 font-semibold",
            hasActiveChild && "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400"
          )}
          style={{ 
            paddingLeft: `${paddingLeft}px`, 
            paddingRight: '12px', 
            paddingTop: '8px', 
            paddingBottom: '8px' 
          }}
          onClick={handleItemClick}
        >
          <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center mr-3">
            {getIcon()}
          </div>

          {!isCollapsed && (
            <div className="flex-1 min-w-0 flex items-center">
              <span className={cn(
                "truncate transition-colors duration-200",
                level === 0 ? "text-sm font-semibold" : "text-sm font-medium"
              )}>
                {item.title}
              </span>
            </div>
          )}

          {!isCollapsed && (
            <div className="flex-shrink-0 ml-2">
              <div className="p-1 rounded-md group-hover:bg-accent/50 transition-all duration-200">
                {isOpen ? (
                  <ChevronDown className="h-3 w-3 text-muted-foreground group-hover:text-foreground transition-colors" />
                ) : (
                  <ChevronRight className="h-3 w-3 text-muted-foreground group-hover:text-foreground transition-colors" />
                )}
              </div>
            </div>
          )}

          {!isCollapsed && item.badge && (
            <span className="ml-2 px-2 py-1 text-xs font-medium bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full animate-pulse">
              {item.badge}
            </span>
          )}
        </div>
      ) : (
        <Link 
          href={item.href ? `/docs/${item.href}` : '#'}
          className={cn(
            "group flex items-center rounded-lg transition-all duration-200 cursor-pointer relative",
            "hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:text-blue-600 dark:hover:text-blue-400",
            "text-muted-foreground",
            isCurrentActive && [
              "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 font-medium"
            ]
          )}
          style={{ 
            paddingLeft: `${paddingLeft}px`, 
            paddingRight: '12px', 
            paddingTop: '6px', 
            paddingBottom: '6px' 
          }}
        >
          <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center mr-3">
            {getIcon()}
          </div>

          {!isCollapsed && (
            <div className="flex-1 min-w-0 flex items-center">
              <span className={cn(
                "truncate transition-colors duration-200 text-sm",
                isCurrentActive 
                  ? "text-blue-600 dark:text-blue-400 font-medium" 
                  : "text-muted-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400"
              )}>
                {item.title}
              </span>
            </div>
          )}

          {!isCollapsed && item.badge && (
            <span className="ml-2 px-2 py-1 text-xs font-medium bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full animate-pulse">
              {item.badge}
            </span>
          )}
        </Link>
      )}

      {!isCollapsed && hasChildren && isOpen && (
        <div className="mt-1 space-y-1">
          {item.children!.map((child, index) => (
            <DocsSidebarItem 
              key={index} 
              item={child} 
              level={level + 1} 
              isCollapsed={isCollapsed}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SearchResultItem({ result, query }: { result: ClientSearchResult; query: string }) {
  const { isActive } = useCurrentPath();
  const isCurrentActive = isActive(result.href);

  return (
    <Link 
      href={`/docs/${result.href}`}
      className={cn(
        "group flex items-center rounded-lg transition-all duration-200 cursor-pointer relative",
        "hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:text-blue-600 dark:hover:text-blue-400",
        "text-muted-foreground px-3 py-2",
        isCurrentActive && [
          "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 font-medium"
        ]
      )}
    >
      {/* 图标 */}
      <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center mr-3">
        <FileCode className="h-3.5 w-3.5" />
      </div>

      {/* 内容 */}
      <div className="flex-1 min-w-0">
        <div 
          className="truncate text-sm"
          dangerouslySetInnerHTML={{ 
            __html: highlightText(result.title, query) 
          }}
        />
        {result.category && (
          <div className="text-xs text-muted-foreground/60 truncate">
            {result.category}
          </div>
        )}
      </div>

      {/* 相关性指示器 */}
      {result.score > 50 && (
        <div className="flex-shrink-0 ml-2">
          <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
        </div>
      )}
    </Link>
  );
} 