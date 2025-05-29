'use client';

import { authorConfig } from '@/config/author.config';
import { ChatSession, generateSessionTitle } from '@/lib/ai-chat';
import { cn } from '@/lib/utils';
import {
    ArrowLeft,
    Calendar,
    Download,
    MapPin,
    MessageSquare,
    MoreVertical,
    Plus,
    Search,
    Settings,
    SidebarClose,
    Trash2,
    User
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface ChatSessionsProps {
  sessions: ChatSession[];
  currentSessionId?: string | null | undefined;
  onSessionSelect: (sessionId: string) => void;
  onNewSession: () => void;
  onDeleteSession: (sessionId: string) => void;
  onExportSession?: (session: ChatSession) => void;
  onSettingsClick?: () => void;
  onSidebarToggle?: () => void;
  className?: string;
}

export function ChatSessions({
  sessions,
  currentSessionId,
  onSessionSelect,
  onNewSession,
  onDeleteSession,
  onExportSession,
  onSettingsClick,
  onSidebarToggle,
  className,
}: ChatSessionsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // 过滤会话
  const filteredSessions = sessions.filter(session =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.messages.some(msg => 
      msg.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  // 按日期分组
  const groupedSessions = filteredSessions.reduce((groups, session) => {
    const date = new Date(session.updatedAt);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    let group: string;
    if (date.toDateString() === today.toDateString()) {
      group = '今天';
    } else if (date.toDateString() === yesterday.toDateString()) {
      group = '昨天';
    } else if (date > weekAgo) {
      group = '本周';
    } else {
      group = '更早';
    }

    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group]!.push(session);
    return groups;
  }, {} as Record<string, ChatSession[]>);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return `${diffMins} 分钟前`;
    if (diffHours < 24) return `${diffHours} 小时前`;
    if (diffDays < 7) return `${diffDays} 天前`;
    return date.toLocaleDateString('zh-CN');
  };

  const getMessagePreview = (session: ChatSession) => {
    const lastUserMessage = session.messages
      .filter(msg => msg.role === 'user')
      .slice(-1)[0];
    
    if (lastUserMessage) {
      return lastUserMessage.content.slice(0, 50) + 
        (lastUserMessage.content.length > 50 ? '...' : '');
    }
    return '新对话';
  };

  const handleExport = (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    onExportSession?.(session);
    setActiveMenu(null);
  };

  const handleDelete = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('确定要删除这个对话吗？此操作无法撤销。')) {
      onDeleteSession(sessionId);
    }
    setActiveMenu(null);
  };

  return (
    <div className={cn("flex flex-col h-full bg-white dark:bg-gray-800", className)}>
      {/* 头部 */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        {/* 顶部控制按钮 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="返回博客系统"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <button
              onClick={onSidebarToggle}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="折叠侧边栏"
            >
              <SidebarClose className="w-4 h-4" />
            </button>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Slavopolis AI
          </h2>
        </div>

        <button
          onClick={onNewSession}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          title="新建对话"
        >
          <Plus className="w-4 h-4" />
          <span>新对话</span>
        </button>

        {/* 搜索框 */}
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="搜索对话..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* 会话列表 */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {Object.keys(groupedSessions).length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-500 dark:text-gray-400">
            <MessageSquare className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm">
              {searchQuery ? '没有找到匹配的对话' : '还没有对话记录'}
            </p>
          </div>
        ) : (
          <div className="p-2">
            {Object.entries(groupedSessions).map(([group, groupSessions]) => (
              <div key={group} className="mb-4">
                <div className="flex items-center gap-2 px-2 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  <Calendar className="w-3 h-3" />
                  <span>{group}</span>
                </div>
                
                <div className="space-y-1 mt-2">
                  {groupSessions.map((session) => (
                    <div
                      key={session.id}
                      className={cn(
                        "group relative flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200",
                        "hover:bg-gray-50 dark:hover:bg-gray-700",
                        currentSessionId === session.id
                          ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 border"
                          : "border border-transparent"
                      )}
                      onClick={() => onSessionSelect(session.id)}
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-transparent flex items-center justify-center shadow-sm">
                        <MessageSquare className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {session.title || generateSessionTitle(getMessagePreview(session))}
                          </h3>
                          
                          {/* 操作菜单 */}
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenu(activeMenu === session.id ? null : session.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded transition-all"
                            >
                              <MoreVertical className="w-3 h-3" />
                            </button>

                            {activeMenu === session.id && (
                              <>
                                <div 
                                  className="fixed inset-0 z-10"
                                  onClick={() => setActiveMenu(null)}
                                />
                                <div className="absolute right-0 top-6 w-32 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-20">
                                  {onExportSession && (
                                    <button
                                      onClick={(e) => handleExport(session, e)}
                                      className="flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 first:rounded-t-lg transition-colors"
                                    >
                                      <Download className="w-3 h-3" />
                                      导出
                                    </button>
                                  )}
                                  <button
                                    onClick={(e) => handleDelete(session.id, e)}
                                    className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 last:rounded-b-lg transition-colors"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    删除
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {getMessagePreview(session)}
                        </p>
                        
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-400">
                            {formatTime(session.updatedAt)}
                          </span>
                          <span className="text-xs text-gray-400">
                            {session.messages.filter(m => m.role !== 'system').length} 条消息
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 个人信息卡片 */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-600 flex-shrink-0">
              <img
                src={authorConfig.avatar}
                alt={authorConfig.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <div className="hidden w-full h-full flex items-center justify-center">
                <User className="w-5 h-5 text-gray-400" />
              </div>
            </div>
            <div className="flex-1 text-left">
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {authorConfig.name}
              </div>
              {authorConfig.location && (
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <MapPin className="w-3 h-3" />
                  <span>{authorConfig.location}</span>
                </div>
              )}
            </div>
            <MoreVertical className="w-4 h-4 text-gray-400" />
          </button>

          {/* 用户菜单 */}
          {showUserMenu && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg z-20">
                <div className="p-2">
                  <button
                    onClick={() => {
                      onSettingsClick?.();
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    <span>聊天设置</span>
                  </button>
                  {onExportSession && (
                    <button
                      onClick={() => {
                        const currentSession = sessions.find(s => s.id === currentSessionId);
                        if (currentSession) {
                          onExportSession(currentSession);
                        }
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>导出对话</span>
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 