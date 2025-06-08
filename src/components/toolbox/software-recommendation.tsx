'use client';

import { Icon } from '@/components/iconfont-loader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getSoftwareByCategory, searchSoftware, softwareCategories, SoftwareCategory, softwareItems } from '@/config/soft.config';
import { cn } from '@/lib/utils';
import { Filter, Github, Heart, Search, Star, Zap } from 'lucide-react';
import { useCallback, useState } from 'react';
import { SoftwareCard } from './software-card';

interface CategoryFilterProps {
  categories: SoftwareCategory[];
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

function CategoryFilter({ categories, selectedCategory, onCategoryChange }: CategoryFilterProps) {
  const colorClasses = {
    blue: "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-300",
    green: "bg-green-50 border-green-200 text-green-700 hover:bg-green-100 dark:bg-green-950/30 dark:border-green-800 dark:text-green-300",
    purple: "bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100 dark:bg-purple-950/30 dark:border-purple-800 dark:text-purple-300",
    orange: "bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100 dark:bg-orange-950/30 dark:border-orange-800 dark:text-orange-300",
    pink: "bg-pink-50 border-pink-200 text-pink-700 hover:bg-pink-100 dark:bg-pink-950/30 dark:border-pink-800 dark:text-pink-300",
    gray: "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-950/30 dark:border-gray-800 dark:text-gray-300",
    indigo: "bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/30 dark:border-indigo-800 dark:text-indigo-300",
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-300",
  };

  const selectedClasses = {
    blue: "bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/25",
    green: "bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/25",
    purple: "bg-purple-500 border-purple-500 text-white shadow-lg shadow-purple-500/25",
    orange: "bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/25",
    pink: "bg-pink-500 border-pink-500 text-white shadow-lg shadow-pink-500/25",
    gray: "bg-gray-600 border-gray-600 text-white shadow-lg shadow-gray-500/25",
    indigo: "bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-500/25",
    emerald: "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/25",
  };

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <button
        onClick={() => onCategoryChange('all')}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 font-medium transition-all duration-300 text-sm",
          "hover:scale-105 active:scale-95",
          selectedCategory === 'all'
            ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/25"
            : "bg-muted/50 border-border text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        <Filter className="h-4 w-4" />
        全部软件
        <Badge variant="secondary" className="ml-1 text-xs">
          {softwareItems.length}
        </Badge>
      </button>
      
      {categories
        .sort((a, b) => a.order - b.order)
        .map((category) => {
          const isSelected = selectedCategory === category.id;
          const colorKey = category.color as keyof typeof colorClasses;
          const normalClass = colorClasses[colorKey] || colorClasses.gray;
          const selectedClass = selectedClasses[colorKey] || selectedClasses.gray;
          const isIconFont = category.icon && category.icon.startsWith('icon-');
          const itemCount = getSoftwareByCategory(category.id).length;

          return (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 font-medium transition-all duration-300 text-sm",
                "hover:scale-105 active:scale-95",
                isSelected ? selectedClass : normalClass
              )}
            >
              {isIconFont ? (
                <Icon name={category.icon} className="h-4 w-4" fallback="📁" />
              ) : (
                <span className="text-sm">📁</span>
              )}
              {category.name}
              <Badge 
                variant={isSelected ? "secondary" : "outline"} 
                className={cn(
                  "ml-1 text-xs",
                  isSelected && "bg-white/20 text-inherit border-white/30"
                )}
              >
                {itemCount}
              </Badge>
            </button>
          );
        })}
    </div>
  );
}

interface SoftwareStatsProps {
  totalCount: number;
  freeCount: number;
  openSourceCount: number;
  featuredCount: number;
}

function SoftwareStats({ totalCount, freeCount, openSourceCount, featuredCount }: SoftwareStatsProps) {
  const stats = [
    {
      label: "软件总数",
      value: totalCount,
      icon: Zap,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/30"
    },
    {
      label: "免费软件",
      value: freeCount,
      icon: Heart,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-950/30"
    },
    {
      label: "开源项目",
      value: openSourceCount,
      icon: Github,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-950/30"
    },
    {
      label: "编辑推荐",
      value: featuredCount,
      icon: Star,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-950/30"
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={cn(
            "p-3 rounded-lg border border-border/60 transition-all duration-300",
            "hover:scale-105 hover:shadow-md",
            stat.bgColor
          )}
        >
          <div className="flex items-center gap-2">
            <div className={cn("p-1.5 rounded-md", stat.bgColor)}>
              <stat.icon className={cn("h-5 w-5", stat.color)} />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function SoftwareRecommendation() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // 过滤软件
  const filteredSoftware = useCallback(() => {
    let software = softwareItems;

    // 分类过滤
    if (selectedCategory !== 'all') {
      software = getSoftwareByCategory(selectedCategory);
    }

    // 搜索过滤
    if (searchQuery.trim()) {
      const searchResults = searchSoftware(searchQuery);
      software = software.filter(s => searchResults.some(sr => sr.id === s.id));
    }

    return software;
  }, [searchQuery, selectedCategory]);

  const displayedSoftware = filteredSoftware();
  
  // 统计数据
  const stats = {
    total: softwareItems.length,
    free: softwareItems.filter(s => s.free).length,
    openSource: softwareItems.filter(s => s.openSource).length,
    featured: softwareItems.filter(s => s.featured).length,
  };

  return (
    <div className="space-y-6">
      {/* 页面标题和描述 */}
      <div className="space-y-3">
        <h1 className="text-3xl font-bold text-foreground">
          开发者软件推荐
        </h1>
        <p className="text-muted-foreground">
          精选编程开发领域的优质软件工具，提升你的开发效率和体验
        </p>
      </div>

      {/* 搜索框 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="搜索软件名称、标签或描述..."
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          className="pl-12 pr-4 py-2 rounded-lg border border-border/60 bg-background/80 backdrop-blur-sm focus:border-primary transition-all duration-300"
        />
      </div>

      {/* 统计信息 */}
      <SoftwareStats
        totalCount={stats.total}
        freeCount={stats.free}
        openSourceCount={stats.openSource}
        featuredCount={stats.featured}
      />

      {/* 分类筛选 */}
      <CategoryFilter
        categories={softwareCategories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      {/* 结果统计 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            {selectedCategory === 'all' ? '全部软件' : softwareCategories.find(c => c.id === selectedCategory)?.name}
          </h2>
          <p className="text-sm text-muted-foreground">
            找到 {displayedSoftware.length} 个软件
            {searchQuery && (
              <span className="ml-2">
                匹配 "<span className="text-primary font-medium">{searchQuery}</span>"
              </span>
            )}
          </p>
        </div>
      </div>

      {/* 软件网格 */}
      {displayedSoftware.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {displayedSoftware.map((software) => (
            <SoftwareCard key={software.id} software={software} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-muted/30 rounded-full flex items-center justify-center">
            <Search className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            未找到相关软件
          </h3>
          <p className="text-muted-foreground mb-4">
            尝试调整搜索关键词或选择其他分类
          </p>
          <Button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            variant="outline"
            size="sm"
          >
            重置筛选条件
          </Button>
        </div>
      )}
    </div>
  );
} 