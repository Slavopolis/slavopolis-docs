'use client';

import { Icon } from '@/components/iconfont-loader';
import {
    ChatMessage,
    ChatSession,
    ChatSettings,
    ChatStorage,
    DEFAULT_CHAT_SETTINGS,
    exportMessagesToMarkdown,
    generateId,
    generateSessionTitle,
    streamChat
} from '@/lib/ai-chat';
import {
    AlertCircle,
    Sidebar
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ChatInput } from './chat-input';
import { ChatMessageBubble } from './chat-message';
import { ChatSessions } from './chat-sessions';
import { ChatSettingsPanel } from './chat-settings';

export function AiChatContainer() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [settings, setSettings] = useState<ChatSettings>(DEFAULT_CHAT_SETTINGS);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [streamingReasoning, setStreamingReasoning] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 获取当前会话
  const currentSession = sessions.find(s => s.id === currentSessionId);

  // 初始化数据
  useEffect(() => {
    const loadedSessions = ChatStorage.getSessions();
    setSessions(loadedSessions);
    
    const savedCurrentId = ChatStorage.getCurrentSessionId();
    if (savedCurrentId && loadedSessions.find(s => s.id === savedCurrentId)) {
      setCurrentSessionId(savedCurrentId);
    } else if (loadedSessions.length > 0 && loadedSessions[0]) {
      setCurrentSessionId(loadedSessions[0].id);
    }
  }, []);

  // 自动滚动到底部
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages, streamingContent, scrollToBottom]);

  // 创建新会话
  const createNewSession = useCallback(() => {
    const newSession: ChatSession = {
      id: generateId(),
      title: '',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      settings: { ...settings },
    };

    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    ChatStorage.setCurrentSessionId(newSession.id);
    ChatStorage.saveSession(newSession);
    setError(null);
  }, [settings]);

  // 选择会话
  const selectSession = useCallback((sessionId: string) => {
    setCurrentSessionId(sessionId);
    ChatStorage.setCurrentSessionId(sessionId);
    setError(null);
    
    // 停止当前流式生成
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
      setStreamingContent('');
      setStreamingReasoning('');
    }
  }, []);

  // 删除会话
  const deleteSession = useCallback((sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    ChatStorage.deleteSession(sessionId);
    
    if (currentSessionId === sessionId) {
      const remainingSessions = sessions.filter(s => s.id !== sessionId);
      if (remainingSessions.length > 0) {
        const firstSession = remainingSessions[0];
        if (firstSession) {
          setCurrentSessionId(firstSession.id);
          ChatStorage.setCurrentSessionId(firstSession.id);
        }
      } else {
        setCurrentSessionId(null);
        ChatStorage.setCurrentSessionId('');
      }
    }
  }, [sessions, currentSessionId]);

  // 导出会话
  const exportSession = useCallback((session: ChatSession) => {
    const markdown = exportMessagesToMarkdown(session.messages);
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${session.title || '对话记录'}-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  // 更新会话
  const updateSession = useCallback((sessionId: string, updates: Partial<ChatSession>) => {
    setSessions(prev => 
      prev.map(session => 
        session.id === sessionId 
          ? { ...session, ...updates, updatedAt: Date.now() }
          : session
      )
    );
    
    const updatedSession = sessions.find(s => s.id === sessionId);
    if (updatedSession) {
      ChatStorage.saveSession({ ...updatedSession, ...updates, updatedAt: Date.now() });
    }
  }, [sessions]);

  // 发送消息
  const sendMessage = useCallback(async (content: string, useReasoning: boolean = false, customSystemPrompt?: string) => {
    if (!content.trim() || isStreaming) return;

    let session = currentSession;
    
    // 如果没有当前会话，创建新会话
    if (!session) {
      const newSession: ChatSession = {
        id: generateId(),
        title: generateSessionTitle(content),
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        settings: { ...settings },
      };
      
      setSessions(prev => [newSession, ...prev]);
      setCurrentSessionId(newSession.id);
      ChatStorage.setCurrentSessionId(newSession.id);
      session = newSession;
    }

    // 添加用户消息
    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    const updatedMessages = [...session.messages, userMessage];
    
    // 根据深度思考模式决定使用的设置
    const chatSettings: ChatSettings = useReasoning 
      ? { ...settings, model: 'deepseek-reasoner' as const }
      : settings;
    
    // 如果有自定义系统提示，临时使用它
    if (customSystemPrompt) {
      chatSettings.systemMessage = customSystemPrompt;
    }
    
    updateSession(session.id, { 
      messages: updatedMessages,
      title: session.title || generateSessionTitle(content),
      settings: chatSettings,
    });

    // 开始流式生成
    setIsStreaming(true);
    setStreamingContent('');
    setStreamingReasoning('');
    setError(null);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      await streamChat(
        updatedMessages,
        chatSettings,
        (chunk: string, reasoning?: string) => {
          if (reasoning) {
            setStreamingReasoning(prev => prev + reasoning);
          } else {
            setStreamingContent(prev => prev + chunk);
          }
        },
        (assistantMessage: ChatMessage) => {
          // 流式生成完成
          const finalMessages = [...updatedMessages, assistantMessage];
          updateSession(session!.id, { messages: finalMessages });
          
          setIsStreaming(false);
          setStreamingContent('');
          setStreamingReasoning('');
          abortControllerRef.current = null;
        },
        (error: string) => {
          setError(error);
          setIsStreaming(false);
          setStreamingContent('');
          setStreamingReasoning('');
          abortControllerRef.current = null;
        },
        controller.signal
      );
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err.message);
      }
      setIsStreaming(false);
      setStreamingContent('');
      setStreamingReasoning('');
      abortControllerRef.current = null;
    }
  }, [currentSession, settings, isStreaming, updateSession]);

  // 停止生成
  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
      setStreamingContent('');
      setStreamingReasoning('');
      abortControllerRef.current = null;
    }
  }, []);

  // 重新生成
  const regenerateMessage = useCallback(() => {
    if (!currentSession || currentSession.messages.length === 0) return;

    const lastUserMessage = currentSession.messages
      .filter(msg => msg.role === 'user')
      .slice(-1)[0];

    if (lastUserMessage) {
      // 移除最后一条AI回复（如果有）
      const messages = currentSession.messages.slice(0, -1);
      if (messages[messages.length - 1]?.role === 'assistant') {
        messages.pop();
      }
      
      updateSession(currentSession.id, { messages });
      
      // 检测是否使用了深度思考模式（通过检查会话设置中的模型）
      const wasUsingReasoning = currentSession.settings.model === 'deepseek-reasoner';
      
      // 重新发送最后一条用户消息，保持原有的深度思考模式
      setTimeout(() => {
        sendMessage(lastUserMessage.content, wasUsingReasoning);
      }, 100);
    }
  }, [currentSession, updateSession, sendMessage]);

  // 删除消息
  const deleteMessage = useCallback((messageId: string) => {
    if (!currentSession) return;

    const updatedMessages = currentSession.messages.filter(msg => msg.id !== messageId);
    updateSession(currentSession.id, { messages: updatedMessages });
  }, [currentSession, updateSession]);

  // 更新设置
  const updateSettings = useCallback((newSettings: Partial<ChatSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  // 快速更新当前会话的设置
  const updateCurrentSessionSettings = useCallback((newSettings: Partial<ChatSettings>) => {
    // 更新全局设置
    updateSettings(newSettings);
    
    // 如果有当前会话，也更新会话的设置
    if (currentSession) {
      updateSession(currentSession.id, {
        settings: { ...currentSession.settings, ...newSettings }
      });
    }
  }, [currentSession, updateSettings, updateSession]);

  // 处理设置面板
  const handleSettingsClick = useCallback(() => {
    setShowSettings(true);
  }, []);

  // 处理侧边栏切换
  const handleSidebarToggle = useCallback(() => {
    setShowSidebar(false);
  }, []);

  // 如果没有会话，创建第一个
  useEffect(() => {
    if (sessions.length === 0 && !currentSessionId) {
      createNewSession();
    }
  }, [sessions.length, currentSessionId, createNewSession]);

  const displayMessages = currentSession?.messages || [];
  
  // 添加流式消息用于显示
  let streamingMessage: ChatMessage | null = null;
  if (isStreaming && (streamingContent || streamingReasoning)) {
    streamingMessage = {
      id: 'streaming',
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      model: settings.model,
    };
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* 侧边栏 */}
      {showSidebar && (
        <div className="w-72 border-r border-gray-200 dark:border-gray-700 flex-shrink-0">
          <ChatSessions
            sessions={sessions}
            currentSessionId={currentSessionId}
            onSessionSelect={selectSession}
            onNewSession={createNewSession}
            onDeleteSession={deleteSession}
            onExportSession={exportSession}
            onSettingsClick={handleSettingsClick}
            onSidebarToggle={handleSidebarToggle}
          />
        </div>
      )}

      {/* 主聊天区域 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 简化的头部 - 仅在侧边栏隐藏时显示 */}
        {!showSidebar && (
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <button
              onClick={() => setShowSidebar(true)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="显示侧边栏"
            >
              <Sidebar className="w-5 h-5" />
            </button>
            
            <div className="text-center">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {currentSession?.title || '新对话'}
              </h1>
              {currentSession && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {currentSession.messages.filter(m => m.role !== 'system').length} 条消息
                  {currentSession.settings.model && ` • ${currentSession.settings.model}`}
                </p>
              )}
            </div>

            <div className="w-10"></div> {/* 占位符保持居中 */}
          </div>
        )}

        {/* 错误提示 */}
        {error && (
          <div className="mx-4 mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* 消息列表 */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="max-w-7xl mx-auto px-2 py-4 space-y-6 w-full">
            {displayMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[70vh] text-gray-500 dark:text-gray-400 py-12 animate-fadeIn">
                <div className="flex flex-col items-center max-w-3xl mx-auto text-center">
                  
                  {/* 标题和介绍 - 带图标 */}
                  <div className="flex flex-col items-center space-y-6 mb-10">
                    <div className="flex items-center gap-5 animate-slideInDown">
                      <Icon 
                        name="icon-deepseek" 
                        className="w-16 h-16 text-blue-600 dark:text-blue-400 transform hover:scale-110 transition-transform duration-300 hover:drop-shadow-[0_8px_16px_rgba(59,130,246,0.3)]" 
                        fallback="🐳"
                        style={{
                          width: '32px',
                          height: '32px',
                        }}
                      />
                      <h2 className="text-3xl font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                        我是 DeepSeek，很高兴见到你！
                      </h2>
                    </div>
                    <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl animate-slideInUp opacity-90">
                      我可以帮你写代码、读文件、写作各种创意内容，请把你的任务交给我吧~
                    </p>
                  </div>
                  
                  {/* 示例问题 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl animate-fadeIn animation-delay-300">
                    {[
                      "如何使用Spring Boot实现分布式事务管理？",
                      "设计一个高并发的Java微服务架构",
                      "编写一个基于Netty的TCP长连接服务器",
                      "解释JVM内存模型和垃圾回收机制"
                    ].map((question, index) => (
                      <button
                        key={index}
                        onClick={() => sendMessage(question)}
                        className={`group relative flex items-start p-5 text-left bg-white dark:bg-gray-800/90 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 shadow-sm hover:shadow-md hover:shadow-blue-100 dark:hover:shadow-blue-900/20 animate-fadeIn animation-delay-${index * 100 + 500}`}
                      >
                        <div className="w-8 h-8 mr-3 flex-shrink-0 bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 rounded-lg flex items-center justify-center text-white font-medium ring-4 ring-blue-50 dark:ring-blue-900/30 group-hover:scale-110 transition-transform duration-300">
                          {index + 1}
                        </div>
                        <span className="text-gray-700 dark:text-gray-200 font-medium group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300">
                          {question}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <>
                {displayMessages.map((message) => (
                  <ChatMessageBubble
                    key={message.id}
                    message={message}
                    {...(message.role === 'assistant' ? { onRegenerate: regenerateMessage } : {})}
                    onDelete={() => deleteMessage(message.id)}
                  />
                ))}
                
                {/* 流式消息 */}
                {streamingMessage && (
                  <ChatMessageBubble
                    message={streamingMessage}
                    isStreaming={true}
                    streamingContent={streamingContent}
                    streamingReasoning={streamingReasoning}
                  />
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* 输入区域 */}
        <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
          <div className="max-w-7xl mx-auto pr-16">
            <ChatInput
              onSend={sendMessage}
              onStop={stopGeneration}
              disabled={!currentSession}
              isStreaming={isStreaming}
              currentSettings={settings}
              onSettingsChange={updateCurrentSessionSettings}
            />
          </div>
        </div>
      </div>

      {/* 设置面板 */}
      {showSettings && (
        <ChatSettingsPanel
          settings={settings}
          onSettingsChange={(newSettings) => {
            updateSettings(newSettings);
            setShowSettings(false);
          }}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
} 