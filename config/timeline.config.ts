/**
 * 时间线配置文件
 * @description 维护Slavopolis静态博客站点的开发时间线和功能历程
 * @author Slavopolis Team
 * @since 2024
 */

import React from 'react';

export interface TimelineItem {
  /** 时间节点标题 */
  title: string;
  /** 内容描述 */
  content: React.ReactNode;
}

/**
 * Slavopolis静态博客站点功能开发时间线
 */
export const timelineData: TimelineItem[] = [
  {
    title: "2025年6月 - AI聊天助手",
    content: React.createElement('div', null,
      React.createElement('p', { 
        className: "mb-8 text-xs font-normal text-neutral-800 md:text-sm dark:text-neutral-200" 
      }, "集成AI聊天助手功能，为用户提供智能问答和技术支持服务"),
      React.createElement('div', { className: "mb-6" },
        React.createElement('div', { 
          className: "flex items-center gap-2 text-xs text-neutral-700 md:text-sm dark:text-neutral-300" 
        }, "✅ OpenAI GPT集成"),
        React.createElement('div', { 
          className: "flex items-center gap-2 text-xs text-neutral-700 md:text-sm dark:text-neutral-300" 
        }, "✅ 实时对话功能"),
        React.createElement('div', { 
          className: "flex items-center gap-2 text-xs text-neutral-700 md:text-sm dark:text-neutral-300" 
        }, "✅ 上下文记忆能力"),
        React.createElement('div', { 
          className: "flex items-center gap-2 text-xs text-neutral-700 md:text-sm dark:text-neutral-300" 
        }, "✅ 技术文档智能检索")
      ),
      React.createElement('div', { className: "grid grid-cols-2 gap-4" },
        React.createElement('div', { 
          className: "h-20 w-full rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg md:h-44 lg:h-60 flex items-center justify-center" 
        },
          React.createElement('span', { className: "text-white font-semibold" }, "AI聊天界面")
        ),
        React.createElement('div', { 
          className: "h-20 w-full rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg md:h-44 lg:h-60 flex items-center justify-center" 
        },
          React.createElement('span', { className: "text-white font-semibold" }, "智能问答系统")
        )
      )
    ),
  },
  {
    title: "2025年5月 - 百宝箱工具集成",
    content: React.createElement('div', null,
      React.createElement('p', { 
        className: "mb-8 text-xs font-normal text-neutral-800 md:text-sm dark:text-neutral-200" 
      }, "开发并集成多个实用工具，提升开发者使用体验和工作效率"),
      React.createElement('div', { className: "mb-6" },
        React.createElement('div', { 
          className: "flex items-center gap-2 text-xs text-neutral-700 md:text-sm dark:text-neutral-300" 
        }, "✅ JSON格式化工具"),
        React.createElement('div', { 
          className: "flex items-center gap-2 text-xs text-neutral-700 md:text-sm dark:text-neutral-300" 
        }, "✅ LRC歌词生成器"),
        React.createElement('div', { 
          className: "flex items-center gap-2 text-xs text-neutral-700 md:text-sm dark:text-neutral-300" 
        }, "✅ 站点导航管理"),
        React.createElement('div', { 
          className: "flex items-center gap-2 text-xs text-neutral-700 md:text-sm dark:text-neutral-300" 
        }, "✅ 开发者工具箱"),
        React.createElement('div', { 
          className: "flex items-center gap-2 text-xs text-neutral-700 md:text-sm dark:text-neutral-300" 
        }, "✅ 实用组件展示")
      ),
      React.createElement('div', { className: "grid grid-cols-2 gap-4" },
        React.createElement('div', { 
          className: "h-20 w-full rounded-lg bg-gradient-to-br from-green-500 to-blue-500 shadow-lg md:h-44 lg:h-60 flex items-center justify-center" 
        },
          React.createElement('span', { className: "text-white font-semibold" }, "JSON工具")
        ),
        React.createElement('div', { 
          className: "h-20 w-full rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 shadow-lg md:h-44 lg:h-60 flex items-center justify-center" 
        },
          React.createElement('span', { className: "text-white font-semibold" }, "歌词生成器")
        ),
        React.createElement('div', { 
          className: "h-20 w-full rounded-lg bg-gradient-to-br from-pink-500 to-red-500 shadow-lg md:h-44 lg:h-60 flex items-center justify-center" 
        },
          React.createElement('span', { className: "text-white font-semibold" }, "站点导航")
        ),
        React.createElement('div', { 
          className: "h-20 w-full rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg md:h-44 lg:h-60 flex items-center justify-center" 
        },
          React.createElement('span', { className: "text-white font-semibold" }, "开发工具")
        )
      )
    ),
  },
  {
    title: "2025年5月 - 顶部悬浮菜单",
    content: React.createElement('div', null,
      React.createElement('p', { 
        className: "mb-8 text-xs font-normal text-neutral-800 md:text-sm dark:text-neutral-200" 
      }, "设计并实现响应式顶部导航菜单，支持暗黑模式切换和移动端适配"),
      React.createElement('div', { className: "mb-6" },
        React.createElement('div', { 
          className: "flex items-center gap-2 text-xs text-neutral-700 md:text-sm dark:text-neutral-300" 
        }, "✅ 响应式设计"),
        React.createElement('div', { 
          className: "flex items-center gap-2 text-xs text-neutral-700 md:text-sm dark:text-neutral-300" 
        }, "✅ 暗黑模式切换"),
        React.createElement('div', { 
          className: "flex items-center gap-2 text-xs text-neutral-700 md:text-sm dark:text-neutral-300" 
        }, "✅ 移动端汉堡菜单"),
        React.createElement('div', { 
          className: "flex items-center gap-2 text-xs text-neutral-700 md:text-sm dark:text-neutral-300" 
        }, "✅ 平滑动画效果")
      ),
      React.createElement('div', { className: "grid grid-cols-1 gap-4" },
        React.createElement('div', { 
          className: "h-20 w-full rounded-lg bg-gradient-to-r from-slate-700 to-slate-900 shadow-lg md:h-32 lg:h-40 flex items-center justify-center" 
        },
          React.createElement('span', { className: "text-white font-semibold" }, "悬浮导航菜单")
        )
      )
    ),
  },
  {
    title: "2025年4月 - Markdown自定义解析",
    content: React.createElement('div', null,
      React.createElement('p', { 
        className: "mb-8 text-xs font-normal text-neutral-800 md:text-sm dark:text-neutral-200" 
      }, "开发自定义Markdown解析器，支持扩展语法和代码高亮显示"),
      React.createElement('div', { className: "mb-6" },
        React.createElement('div', { 
          className: "flex items-center gap-2 text-xs text-neutral-700 md:text-sm dark:text-neutral-300" 
        }, "✅ 自定义语法扩展"),
        React.createElement('div', { 
          className: "flex items-center gap-2 text-xs text-neutral-700 md:text-sm dark:text-neutral-300" 
        }, "✅ 代码高亮支持"),
        React.createElement('div', { 
          className: "flex items-center gap-2 text-xs text-neutral-700 md:text-sm dark:text-neutral-300" 
        }, "✅ 数学公式渲染"),
        React.createElement('div', { 
          className: "flex items-center gap-2 text-xs text-neutral-700 md:text-sm dark:text-neutral-300" 
        }, "✅ 表格和图表支持"),
        React.createElement('div', { 
          className: "flex items-center gap-2 text-xs text-neutral-700 md:text-sm dark:text-neutral-300" 
        }, "✅ TOC自动生成")
      ),
      React.createElement('div', { className: "grid grid-cols-2 gap-4" },
        React.createElement('div', { 
          className: "h-20 w-full rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 shadow-lg md:h-44 lg:h-60 flex items-center justify-center" 
        },
          React.createElement('span', { className: "text-white font-semibold" }, "Markdown解析器")
        ),
        React.createElement('div', { 
          className: "h-20 w-full rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg md:h-44 lg:h-60 flex items-center justify-center" 
        },
          React.createElement('span', { className: "text-white font-semibold" }, "代码高亮")
        )
      )
    ),
  },
  {
    title: "2025年4月 - 侧边栏自动渲染",
    content: React.createElement('div', null,
      React.createElement('p', { 
        className: "mb-8 text-xs font-normal text-neutral-800 md:text-sm dark:text-neutral-200" 
      }, "实现智能侧边栏导航系统，根据文件结构自动生成导航菜单"),
      React.createElement('div', { className: "mb-6" },
        React.createElement('div', { 
          className: "flex items-center gap-2 text-xs text-neutral-700 md:text-sm dark:text-neutral-300" 
        }, "✅ 文件系统扫描"),
        React.createElement('div', { 
          className: "flex items-center gap-2 text-xs text-neutral-700 md:text-sm dark:text-neutral-300" 
        }, "✅ 层级结构展示"),
        React.createElement('div', { 
          className: "flex items-center gap-2 text-xs text-neutral-700 md:text-sm dark:text-neutral-300" 
        }, "✅ 搜索和过滤"),
        React.createElement('div', { 
          className: "flex items-center gap-2 text-xs text-neutral-700 md:text-sm dark:text-neutral-300" 
        }, "✅ 折叠展开功能")
      ),
      React.createElement('div', { className: "grid grid-cols-1 gap-4" },
        React.createElement('div', { 
          className: "h-20 w-full rounded-lg bg-gradient-to-r from-violet-500 to-purple-500 shadow-lg md:h-32 lg:h-40 flex items-center justify-center" 
        },
          React.createElement('span', { className: "text-white font-semibold" }, "智能侧边栏导航")
        )
      )
    ),
  },
  {
    title: "2025年4月 - 自研搜索引擎集成",
    content: React.createElement('div', null,
      React.createElement('p', { 
        className: "mb-8 text-xs font-normal text-neutral-800 md:text-sm dark:text-neutral-200" 
      }, "构建高效的全文搜索引擎，支持内容索引、分词和相关性排序"),
      React.createElement('div', { className: "mb-6" },
        React.createElement('div', { 
          className: "flex items-center gap-2 text-xs text-neutral-700 md:text-sm dark:text-neutral-300" 
        }, "✅ 全文索引构建"),
        React.createElement('div', { 
          className: "flex items-center gap-2 text-xs text-neutral-700 md:text-sm dark:text-neutral-300" 
        }, "✅ 中文分词支持"),
        React.createElement('div', { 
          className: "flex items-center gap-2 text-xs text-neutral-700 md:text-sm dark:text-neutral-300" 
        }, "✅ 相关性评分算法"),
        React.createElement('div', { 
          className: "flex items-center gap-2 text-xs text-neutral-700 md:text-sm dark:text-neutral-300" 
        }, "✅ 实时搜索建议"),
        React.createElement('div', { 
          className: "flex items-center gap-2 text-xs text-neutral-700 md:text-sm dark:text-neutral-300" 
        }, "✅ 搜索结果高亮")
      ),
      React.createElement('div', { className: "grid grid-cols-2 gap-4" },
        React.createElement('div', { 
          className: "h-20 w-full rounded-lg bg-gradient-to-br from-orange-500 to-red-500 shadow-lg md:h-44 lg:h-60 flex items-center justify-center" 
        },
          React.createElement('span', { className: "text-white font-semibold" }, "搜索引擎")
        ),
        React.createElement('div', { 
          className: "h-20 w-full rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 shadow-lg md:h-44 lg:h-60 flex items-center justify-center" 
        },
          React.createElement('span', { className: "text-white font-semibold" }, "索引系统")
        )
      )
    ),
  },
  {
    title: "2025年3月 - 项目初始化",
    content: React.createElement('div', null,
      React.createElement('p', { 
        className: "mb-8 text-xs font-normal text-neutral-800 md:text-sm dark:text-neutral-200" 
      }, "Slavopolis静态博客站点项目启动，基于Next.js 14和TypeScript构建现代化文档平台"),
      React.createElement('div', { className: "mb-6" },
        React.createElement('div', { 
          className: "flex items-center gap-2 text-xs text-neutral-700 md:text-sm dark:text-neutral-300" 
        }, "✅ Next.js 14 + TypeScript框架搭建"),
        React.createElement('div', { 
          className: "flex items-center gap-2 text-xs text-neutral-700 md:text-sm dark:text-neutral-300" 
        }, "✅ Tailwind CSS样式系统"),
        React.createElement('div', { 
          className: "flex items-center gap-2 text-xs text-neutral-700 md:text-sm dark:text-neutral-300" 
        }, "✅ 响应式设计架构"),
        React.createElement('div', { 
          className: "flex items-center gap-2 text-xs text-neutral-700 md:text-sm dark:text-neutral-300" 
        }, "✅ SEO优化配置"),
        React.createElement('div', { 
          className: "flex items-center gap-2 text-xs text-neutral-700 md:text-sm dark:text-neutral-300" 
        }, "✅ 多主题支持")
      ),
      React.createElement('div', { className: "grid grid-cols-2 gap-4" },
        React.createElement('div', { 
          className: "h-20 w-full rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg md:h-44 lg:h-60 flex items-center justify-center" 
        },
          React.createElement('span', { className: "text-white font-semibold" }, "Next.js 14")
        ),
        React.createElement('div', { 
          className: "h-20 w-full rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg md:h-44 lg:h-60 flex items-center justify-center" 
        },
          React.createElement('span', { className: "text-white font-semibold" }, "TypeScript")
        ),
        React.createElement('div', { 
          className: "h-20 w-full rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 shadow-lg md:h-44 lg:h-60 flex items-center justify-center" 
        },
          React.createElement('span', { className: "text-white font-semibold" }, "Tailwind CSS")
        ),
        React.createElement('div', { 
          className: "h-20 w-full rounded-lg bg-gradient-to-br from-emerald-500 to-green-500 shadow-lg md:h-44 lg:h-60 flex items-center justify-center" 
        },
          React.createElement('span', { className: "text-white font-semibold" }, "响应式设计")
        )
      )
    ),
  },
]; 