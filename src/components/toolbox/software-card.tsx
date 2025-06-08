'use client';

import { Icon } from '@/components/iconfont-loader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SoftwareItem } from '@/config/soft.config';
import { cn } from '@/lib/utils';
import {
    Apple,
    BookOpen,
    ChevronLeft,
    ChevronRight,
    Download,
    ExternalLink,
    Eye,
    FileText,
    Github,
    Heart,
    Monitor,
    Star,
    Zap
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface SoftwareCardProps {
  software: SoftwareItem;
}

interface PlatformIconProps {
  platform: string;
}

function PlatformIcon({ platform }: PlatformIconProps) {
  const icons = {
    'Windows': Monitor,
    'macOS': Apple,
    'Linux': Monitor,
    'Web': Zap,
  };
  
  const IconComponent = icons[platform as keyof typeof icons] || Monitor;
  
  return <IconComponent className="h-3 w-3" />;
}

interface ImageCarouselProps {
  images: SoftwareItem['images'];
  software: SoftwareItem;
}

function ImageCarousel({ images, software }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!images || images.length === 0) {
    return (
      <div className="relative h-48 bg-gradient-to-br from-muted/30 to-muted/60 rounded-xl flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-2 bg-muted/50 rounded-full flex items-center justify-center">
            {software.icon && software.icon.startsWith('icon-') ? (
              <Icon name={software.icon} className="h-6 w-6 text-muted-foreground" fallback={software.fallbackIcon} />
            ) : (
              <span className="text-xl">{software.fallbackIcon}</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">暂无预览图</p>
        </div>
      </div>
    );
  }

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <>
      <div className="relative h-48 bg-muted/20 rounded-xl overflow-hidden group">
        {/* 主图片 */}
        <img
          src={images[currentIndex]?.url}
          alt={images[currentIndex]?.alt}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            target.nextElementSibling?.classList.remove('hidden');
          }}
        />
        
        {/* 图片加载失败时的备用显示 */}
        <div className="hidden absolute inset-0 bg-gradient-to-br from-muted/30 to-muted/60 rounded-xl flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-2 bg-muted/50 rounded-full flex items-center justify-center">
              {software.icon && software.icon.startsWith('icon-') ? (
                <Icon name={software.icon} className="h-6 w-6 text-muted-foreground" fallback={software.fallbackIcon} />
              ) : (
                <span className="text-xl">{software.fallbackIcon}</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">图片加载失败</p>
          </div>
        </div>

        {/* 轮播控制 */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-1.5 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
            >
              <ChevronLeft className="h-3 w-3" />
            </button>
            
            <button
              onClick={nextImage}
              className="absolute right-1.5 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
            >
              <ChevronRight className="h-3 w-3" />
            </button>

            {/* 指示器 */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-all duration-300",
                    index === currentIndex
                      ? "bg-white shadow-lg"
                      : "bg-white/50 hover:bg-white/70"
                  )}
                />
              ))}
            </div>
          </>
        )}

        {/* 查看大图按钮 */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="absolute top-2 right-2 w-6 h-6 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
        >
          <Eye className="h-3 w-3" />
        </button>

        {/* 图片标题 */}
        {images[currentIndex]?.caption && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
            <p className="text-white text-xs font-medium">
              {images[currentIndex].caption}
            </p>
          </div>
        )}
      </div>

      {/* 大图预览模态框 */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-2">
          <div className="relative">
            <img
              src={images[currentIndex]?.url}
              alt={images[currentIndex]?.alt}
              className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
            />
            
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all duration-300"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all duration-300"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
          
          {images[currentIndex]?.caption && (
            <div className="text-center mt-4">
              <p className="text-muted-foreground">
                {images[currentIndex].caption}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export function SoftwareCard({ software }: SoftwareCardProps) {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  const primaryLink = software.links.find(link => link.primary) || software.links[0];
  const isIconFont = software.icon && software.icon.startsWith('icon-');

  // 链接类型图标映射
  const linkIcons = {
    download: Download,
    official: ExternalLink,
    docs: FileText,
    github: Github,
  };

  // 处理卡片点击
  const handleCardClick = (e: React.MouseEvent) => {
    // 如果点击的是按钮或链接，不触发卡片点击
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a')) {
      return;
    }
    // 可以添加卡片点击行为，比如展开详情
    // setIsDetailOpen(true);
  };

  // 监听状态变化
  useEffect(() => {
    console.log('Dialog状态变化:', software.name, '详情开启:', isDetailOpen);
  }, [isDetailOpen, software.name]);

  return (
    <>
      <div 
        className={cn(
          "group relative bg-card/80 backdrop-blur-sm border border-border/60 rounded-xl overflow-hidden cursor-pointer",
          "transition-all duration-500 ease-out",
          "hover:border-border hover:bg-card/90 hover:shadow-xl hover:shadow-primary/10",
          "hover:scale-[1.01] hover:-translate-y-0.5"
        )}
        onClick={handleCardClick}
      >
        {/* 背景渐变 */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-purple-500/3 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* 轮播图 */}
        <div className="relative">
          <ImageCarousel images={software.images} software={software} />
          
          {/* 特色标签 */}
          <div className="absolute top-2 left-2 flex flex-wrap gap-1">
            {software.featured && (
              <Badge className="bg-orange-500/90 text-white border-0 shadow-lg text-xs">
                <Star className="h-2.5 w-2.5 mr-1" />
                推荐
              </Badge>
            )}
            {software.free && (
              <Badge className="bg-green-500/90 text-white border-0 shadow-lg text-xs">
                <Heart className="h-2.5 w-2.5 mr-1" />
                免费
              </Badge>
            )}
            {software.openSource && (
              <Badge className="bg-purple-500/90 text-white border-0 shadow-lg text-xs">
                <Github className="h-2.5 w-2.5 mr-1" />
                开源
              </Badge>
            )}
          </div>
        </div>

        {/* 软件信息 */}
        <div className="p-4">
          {/* 标题和图标 */}
          <div className="flex items-start gap-2.5 mb-3">
            <div className="flex-shrink-0 w-12 h-12 bg-muted/60 border border-border/40 rounded-lg flex items-center justify-center group-hover:bg-primary/10 group-hover:border-primary/30 transition-all duration-300">
              {isIconFont ? (
                <Icon name={software.icon} className="h-7 w-7 text-foreground group-hover:text-primary transition-colors" fallback={software.fallbackIcon} />
              ) : (
                <span className="text-2xl">{software.fallbackIcon}</span>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-1">
                {software.name}
              </h3>
              
              {/* 评分 */}
              {software.rating && (
                <div className="flex items-center gap-1 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-2.5 w-2.5",
                        i < software.rating!
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-muted-foreground"
                      )}
                    />
                  ))}
                  <span className="text-xs text-muted-foreground ml-1">
                    {software.rating}.0
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 描述 */}
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-3">
            {software.description}
          </p>

          {/* 平台支持 */}
          <div className="flex items-center gap-1 mb-3 text-xs">
            <span className="text-muted-foreground">平台:</span>
            {software.platform.slice(0, 3).map((platform, index) => (
              <div key={index} className="flex items-center gap-0.5">
                <PlatformIcon platform={platform} />
                <span className="text-muted-foreground">{platform}</span>
                {index < Math.min(software.platform.length, 3) - 1 && (
                  <span className="text-muted-foreground mx-1">•</span>
                )}
              </div>
            ))}
            {software.platform.length > 3 && (
              <span className="text-muted-foreground">+{software.platform.length - 3}</span>
            )}
          </div>

          {/* 标签 */}
          <div className="flex flex-wrap gap-1 mb-3">
            {software.tags.slice(0, 2).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs px-1.5 py-0.5">
                {tag}
              </Badge>
            ))}
            {software.tags.length > 2 && (
              <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                +{software.tags.length - 2}
              </Badge>
            )}
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center gap-2">
            {primaryLink && (
              <Button
                asChild
                className="flex-1 group/btn text-xs hover:scale-105 active:scale-95 transition-all duration-200 relative overflow-hidden"
                size="sm"
              >
                <a 
                  href={primaryLink.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 hover:shadow-lg hover:shadow-primary/20 relative z-10"
                  onClick={(e) => {
                    // 确保链接正常跳转
                    console.log('点击下载链接:', primaryLink.url);
                    // 添加视觉反馈
                    const button = e.currentTarget.parentElement;
                    if (button) {
                      button.classList.add('animate-pulse');
                      setTimeout(() => {
                        button.classList.remove('animate-pulse');
                      }, 200);
                    }
                  }}
                >
                  {/* 悬停背景效果 */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-purple-500/10 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                  
                  {linkIcons[primaryLink.type] && (
                    <span className="mr-1.5 relative z-10">
                      {React.createElement(linkIcons[primaryLink.type], { 
                        className: "h-3 w-3" 
                      })}
                    </span>
                  )}
                  <span className="relative z-10">{primaryLink.label}</span>
                  <ExternalLink className="h-2.5 w-2.5 ml-1.5 opacity-0 group-hover/btn:opacity-100 transform translate-x-0 group-hover/btn:translate-x-0.5 transition-all duration-300 relative z-10" />
                </a>
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('点击使用手册按钮 - 详情状态:', isDetailOpen);
                setIsDetailOpen(true);
                
                // 添加视觉反馈
                const button = e.currentTarget;
                button.classList.add('animate-pulse');
                setTimeout(() => {
                  button.classList.remove('animate-pulse');
                }, 200);
              }}
              className="px-3 text-xs hover:scale-105 active:scale-95 transition-all duration-200 hover:bg-muted/80 hover:border-primary/50 hover:text-primary relative overflow-hidden group/manual"
            >
              {/* 悬停背景效果 */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-blue-500/5 opacity-0 group-hover/manual:opacity-100 transition-opacity duration-300" />
              <BookOpen className="h-3 w-3 mr-1 relative z-10" />
              <span className="relative z-10">使用手册</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 详情对话框 */}
      <Dialog open={isDetailOpen} onOpenChange={(open) => {
        console.log('Dialog onOpenChange:', software.name, 'open:', open);
        setIsDetailOpen(open);
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl">
              <div className="w-12 h-12 bg-muted/60 border border-border/40 rounded-xl flex items-center justify-center">
                {isIconFont ? (
                  <Icon name={software.icon} className="h-6 w-6" fallback={software.fallbackIcon} />
                ) : (
                  <span className="text-xl">{software.fallbackIcon}</span>
                )}
              </div>
              {software.name} - 使用手册
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* 左侧：图片轮播 */}
            <div>
              <ImageCarousel images={software.images} software={software} />
            </div>
            
            {/* 右侧：详细信息 */}
            <div className="space-y-6">
              {/* 基本信息 */}
              <div>
                <h3 className="font-semibold text-lg mb-3">软件信息</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">描述</p>
                    <p className="text-sm">{software.longDescription || software.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">类型</p>
                      <div className="flex gap-1">
                        {software.free && <Badge variant="secondary">免费</Badge>}
                        {software.openSource && <Badge variant="secondary">开源</Badge>}
                        {!software.free && <Badge variant="outline">付费</Badge>}
                      </div>
                    </div>
                    
                    {software.rating && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">评分</p>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                "h-4 w-4",
                                i < software.rating!
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-muted-foreground"
                              )}
                            />
                          ))}
                          <span className="text-sm ml-1">{software.rating}.0</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">支持平台</p>
                    <div className="flex flex-wrap gap-1">
                      {software.platform.map((platform, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          <PlatformIcon platform={platform} />
                          <span className="ml-1">{platform}</span>
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">标签</p>
                    <div className="flex flex-wrap gap-1">
                      {software.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 相关链接 */}
              <div>
                <h3 className="font-semibold text-lg mb-3">相关链接</h3>
                <div className="grid grid-cols-1 gap-2">
                  {software.links.map((link, index) => {
                    const IconComponent = linkIcons[link.type];
                    return (
                      <Button
                        key={index}
                        asChild
                        variant={link.primary ? "default" : "outline"}
                        className="justify-start"
                      >
                        <a href={link.url} target="_blank" rel="noopener noreferrer">
                          {IconComponent && <IconComponent className="h-4 w-4 mr-2" />}
                          {link.label}
                          <ExternalLink className="h-3 w-3 ml-auto" />
                        </a>
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 