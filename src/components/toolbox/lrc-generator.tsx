'use client';

import { cn } from '@/lib/utils';
import {
    CheckCircle2,
    Clock,
    Download,
    Edit3,
    FileAudio,
    FileText,
    Keyboard,
    Music,
    Pause,
    Play,
    RefreshCw,
    Settings,
    SkipBack,
    SkipForward,
    Target,
    Timer,
    Upload,
    Volume2,
    VolumeX,
    X,
    Zap
} from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

interface LyricLine {
  id: string;
  text: string;
  startTime: number | null;
  endTime?: number | null;
  isMarked: boolean;
}

interface UploadedFile {
  file: File;
  url: string;
}

export function LrcGenerator() {
  // 文件状态
  const [audioFile, setAudioFile] = useState<UploadedFile | null>(null);
  const [dragOver, setDragOver] = useState(false);
  
  // 歌词编辑状态
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [lyricsText, setLyricsText] = useState('');
  
  // 音频播放状态
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  
  // UI 状态
  const [isProcessing, setIsProcessing] = useState(false);
  const [showKeyboardGuide, setShowKeyboardGuide] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [markedCount, setMarkedCount] = useState(0);
  const [autoAdvance, setAutoAdvance] = useState(true);
  
  // LRC编辑状态
  const [isEditingLrc, setIsEditingLrc] = useState(false);
  const [editableLrcContent, setEditableLrcContent] = useState('');
  
  // 确认对话框状态
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  // 实时预览状态
  const [previewCurrentLyricIndex, setPreviewCurrentLyricIndex] = useState(-1);
  const [userScrolledPreview, setUserScrolledPreview] = useState(false);
  const [previewScrollTimeout, setPreviewScrollTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  
  // 引用
  const audioRef = useRef<HTMLAudioElement>(null);
  const lyricsInputRef = useRef<HTMLTextAreaElement>(null);
  const currentLineRef = useRef<HTMLDivElement>(null);
  const previewAudioRef = useRef<HTMLAudioElement>(null);
  const previewLyricsRef = useRef<HTMLDivElement>(null);
  
  // 添加自定义滚动条样式
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .custom-scrollbar::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }
      
      .custom-scrollbar::-webkit-scrollbar-track {
        background: rgb(241 245 249);
        border-radius: 4px;
      }
      
      .dark .custom-scrollbar::-webkit-scrollbar-track {
        background: rgb(51 65 85);
      }
      
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: linear-gradient(135deg, rgb(59 130 246), rgb(147 51 234));
        border-radius: 4px;
        border: 1px solid rgb(226 232 240);
      }
      
      .dark .custom-scrollbar::-webkit-scrollbar-thumb {
        border-color: rgb(71 85 105);
      }
      
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(135deg, rgb(37 99 235), rgb(124 58 237));
        transform: scale(1.1);
      }
      
      .custom-scrollbar::-webkit-scrollbar-corner {
        background: transparent;
      }
      
      .custom-scrollbar {
        scrollbar-width: thin;
        scrollbar-color: rgb(59 130 246) rgb(241 245 249);
      }
      
      .dark .custom-scrollbar {
        scrollbar-color: rgb(147 51 234) rgb(51 65 85);
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  // 生成唯一ID
  const generateId = useCallback(() => {
    return Math.random().toString(36).substr(2, 9);
  }, []);
  
  // 处理文件上传
  const handleFileUpload = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    setAudioFile({ file, url });
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, []);

  // 文件拖拽处理
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const audioFile = files.find(file => file.type.startsWith('audio/'));
    
    if (audioFile) {
      handleFileUpload(audioFile);
    }
  }, [handleFileUpload]);

  // 移除文件
  const removeFile = useCallback(() => {
    if (audioFile?.url) {
      URL.revokeObjectURL(audioFile.url);
    }
    setAudioFile(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, [audioFile]);

  // 解析歌词文本
  const parseLyricsText = useCallback((text: string) => {
    const lines = text.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    const newLyrics: LyricLine[] = lines.map(text => ({
      id: generateId(),
      text,
      startTime: null,
      endTime: null,
      isMarked: false
    }));
    
    setLyrics(newLyrics);
    setCurrentLineIndex(0);
    setMarkedCount(0);
  }, [generateId]);

  // 处理歌词输入变化
  const handleLyricsChange = useCallback((value: string) => {
    setLyricsText(value);
    if (value.trim()) {
      parseLyricsText(value);
    } else {
      setLyrics([]);
      setCurrentLineIndex(0);
      setMarkedCount(0);
    }
  }, [parseLyricsText]);

  // 音频控制函数
  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      audioRef.current.playbackRate = playbackRate;
      audioRef.current.volume = volume;
    }
  }, [playbackRate, volume]);

  const handleSeek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const skipTime = useCallback((seconds: number) => {
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    handleSeek(newTime);
  }, [currentTime, duration, handleSeek]);

  const toggleMute = useCallback(() => {
    if (!audioRef.current) return;
    
    if (isMuted) {
      audioRef.current.volume = volume;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  }, [isMuted, volume]);

  // 标记当前行时间
  const markCurrentLine = useCallback(() => {
    if (currentLineIndex >= lyrics.length) return;
    
    const newLyrics = [...lyrics];
    const currentLine = newLyrics[currentLineIndex];
    
    if (currentLine && !currentLine.isMarked) {
      currentLine.startTime = currentTime;
      currentLine.isMarked = true;
      newLyrics[currentLineIndex] = currentLine;
      
      setLyrics(newLyrics);
      setMarkedCount(prev => prev + 1);
      
      // 自动跳转到下一行
      if (autoAdvance && currentLineIndex < lyrics.length - 1) {
        setCurrentLineIndex(prev => prev + 1);
      }
    }
  }, [currentLineIndex, lyrics, currentTime, autoAdvance]);

  // 清除标记
  const clearMark = useCallback((index: number) => {
    const newLyrics = [...lyrics];
    const line = newLyrics[index];
    
    if (line && line.isMarked) {
      line.startTime = null;
      line.isMarked = false;
      newLyrics[index] = line;
      
      setLyrics(newLyrics);
      setMarkedCount(prev => prev - 1);
    }
  }, [lyrics]);

  // 调整时间
  const adjustTime = useCallback((index: number, adjustment: number) => {
    const newLyrics = [...lyrics];
    const line = newLyrics[index];
    
    if (line && line.startTime !== null) {
      line.startTime = Math.max(0, line.startTime + adjustment);
      newLyrics[index] = line;
      setLyrics(newLyrics);
    }
  }, [lyrics]);

  // 生成LRC格式
  const generateLrcContent = useCallback(() => {
    const header = [
      `[ti:${audioFile?.file.name.replace(/\.[^/.]+$/, '') || '未知标题'}]`,
      '[ar:未知艺术家]',
      '[al:未知专辑]',
      '[by:LRC制作工具]',
      ''
    ];
    
    const lrcLines = lyrics
      .filter(line => line.isMarked && line.startTime !== null)
      .sort((a, b) => (a.startTime || 0) - (b.startTime || 0))
      .map(line => {
        const time = line.startTime || 0;
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        const centiseconds = Math.floor((time % 1) * 100);
        const timeTag = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
        return `[${timeTag}]${line.text}`;
      });
    
    return [...header, ...lrcLines].join('\n');
  }, [audioFile, lyrics]);

  // 下载LRC文件
  const downloadLrc = useCallback(() => {
    const content = editableLrcContent || generateLrcContent();
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${audioFile?.file.name.replace(/\.[^/.]+$/, '') || 'lyrics'}.lrc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [editableLrcContent, generateLrcContent, audioFile]);

  // 重置所有状态
  const resetAll = useCallback(() => {
    if (audioFile?.url) {
      URL.revokeObjectURL(audioFile.url);
    }
    
    // 清理定时器
    if (previewScrollTimeout) {
      clearTimeout(previewScrollTimeout);
      setPreviewScrollTimeout(null);
    }
    
    setAudioFile(null);
    setLyrics([]);
    setLyricsText('');
    setCurrentLineIndex(0);
    setMarkedCount(0);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setShowPreview(false);
    setPreviewCurrentLyricIndex(-1);
    setUserScrolledPreview(false);
    setIsPreviewPlaying(false);
    setIsAutoScrolling(false);
    setIsEditingLrc(false);
    setEditableLrcContent('');
    setShowConfirmDialog(false);
  }, [audioFile, previewScrollTimeout]);

  // 组件卸载时清理定时器
  useEffect(() => {
    return () => {
      if (previewScrollTimeout) {
        clearTimeout(previewScrollTimeout);
      }
    };
  }, [previewScrollTimeout]);

  // 格式化时间显示
  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  }, []);

  // 键盘快捷键
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // 如果焦点在输入框内，不处理快捷键
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) {
        return;
      }
      
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          if (audioFile) {
            if (e.shiftKey) {
              // Shift + Space: 播放/暂停
              togglePlay();
            } else {
              // Space: 标记当前行
              markCurrentLine();
            }
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (e.shiftKey) {
            skipTime(-1);
          } else {
            skipTime(-0.1);
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (e.shiftKey) {
            skipTime(1);
          } else {
            skipTime(0.1);
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          setCurrentLineIndex(prev => Math.max(0, prev - 1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setCurrentLineIndex(prev => Math.min(lyrics.length - 1, prev + 1));
          break;
        case 'Enter':
          e.preventDefault();
          if (currentLineIndex < lyrics.length - 1) {
            setCurrentLineIndex(prev => prev + 1);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [audioFile, togglePlay, markCurrentLine, skipTime, lyrics.length, currentLineIndex]);

  // 当前行变化时滚动到视野内
  useEffect(() => {
    if (currentLineRef.current) {
      currentLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [currentLineIndex]);

  // 实时预览相关函数
  const handlePreviewTimeUpdate = useCallback(() => {
    if (!previewAudioRef.current) return;
    
    const currentTime = previewAudioRef.current.currentTime;
    
    // 找到当前应该高亮的歌词
    const markedLyrics = lyrics.filter(line => line.isMarked && line.startTime !== null);
    let activeIndex = -1;
    
    for (let i = 0; i < markedLyrics.length; i++) {
      const lyric = markedLyrics[i];
      if (lyric && lyric.startTime !== null && currentTime >= lyric.startTime) {
        activeIndex = i;
      } else {
        break;
      }
    }
    
    if (activeIndex !== previewCurrentLyricIndex) {
      setPreviewCurrentLyricIndex(activeIndex);
    }
  }, [lyrics, previewCurrentLyricIndex]);

  // 预览歌词滚动到中心
  const scrollToActivePreviewLyric = useCallback(() => {
    if (!previewLyricsRef.current || previewCurrentLyricIndex === -1 || userScrolledPreview) return;
    
    const container = previewLyricsRef.current;
    const lyricsWrapper = container.querySelector('.preview-lyrics-wrapper') as HTMLElement;
    if (!lyricsWrapper) return;
    
    const activeLyric = lyricsWrapper.children[previewCurrentLyricIndex] as HTMLElement;
    
    if (activeLyric) {
      try {
        setIsAutoScrolling(true);
        activeLyric.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        });
        // 滚动完成后重置标志
        setTimeout(() => {
          setIsAutoScrolling(false);
        }, 1000);
      } catch (error) {
        console.error('预览滚动失败:', error);
        setIsAutoScrolling(false);
      }
    }
  }, [previewCurrentLyricIndex, userScrolledPreview]);

  // 处理预览用户手动滚动
  const handlePreviewLyricsScroll = useCallback(() => {
    // 如果是自动滚动，不标记为用户滚动
    if (isAutoScrolling) {
      return;
    }
    
    setUserScrolledPreview(true);
    
    if (previewScrollTimeout) {
      clearTimeout(previewScrollTimeout);
    }
    
    const timeout = setTimeout(() => {
      setUserScrolledPreview(false);
    }, 3000);
    
    setPreviewScrollTimeout(timeout);
  }, [previewScrollTimeout, isAutoScrolling]);

  // 当预览活跃歌词改变时滚动到中心
  useEffect(() => {
    if (previewCurrentLyricIndex !== -1) {
      const timer = setTimeout(() => {
        scrollToActivePreviewLyric();
      }, 50);
      
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [previewCurrentLyricIndex, scrollToActivePreviewLyric]);

  // 跳转到指定歌词时间
  const jumpToLyricTime = useCallback((index: number) => {
    const line = lyrics[index];
    if (line && line.isMarked && line.startTime !== null) {
      if (audioRef.current) {
        audioRef.current.currentTime = line.startTime;
        setCurrentTime(line.startTime);
      }
      setCurrentLineIndex(index);
    }
  }, [lyrics]);

  // 批量标记功能
  const markMultipleLines = useCallback((startIndex: number, endIndex: number, startTime: number, duration: number) => {
    const newLyrics = [...lyrics];
    const lineCount = endIndex - startIndex + 1;
    const timeInterval = duration / lineCount;
    
    for (let i = startIndex; i <= endIndex; i++) {
      const line = newLyrics[i];
      if (line && !line.isMarked) {
        line.startTime = startTime + (i - startIndex) * timeInterval;
        line.isMarked = true;
        newLyrics[i] = line;
      }
    }
    
    setLyrics(newLyrics);
    setMarkedCount(prev => prev + (endIndex - startIndex + 1));
  }, [lyrics]);

  // 确认清除所有标记
  const confirmClearAllMarks = useCallback(() => {
    const newLyrics = lyrics.map(line => ({
      ...line,
      startTime: null,
      isMarked: false
    }));
    setLyrics(newLyrics);
    setMarkedCount(0);
    setShowConfirmDialog(false);
  }, [lyrics]);

  return (
    <div className="space-y-6">
      {/* 标题区域 */}
      {/* <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30">
            <Music className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              专业 LRC 歌词制作工具
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              实时音频播放 • 手动精确标记 • 可视化编辑 • 专业制作
            </p>
          </div>
        </div>
      </div> */}

      {/* 工具栏 */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowKeyboardGuide(!showKeyboardGuide)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-sm"
          >
            <Keyboard className="h-4 w-4" />
            快捷键
          </button>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="autoAdvance"
              checked={autoAdvance}
              onChange={(e) => setAutoAdvance(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="autoAdvance" className="text-sm text-slate-700 dark:text-slate-300">
              自动下一行
            </label>
          </div>
          
          {/* 快捷操作 */}
          {lyrics.length > 0 && (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-600">
              <button
                onClick={() => setCurrentLineIndex(0)}
                className="px-2 py-1 rounded text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                title="跳转到第一行"
              >
                首行
              </button>
              
              <button
                onClick={() => {
                  const nextUnmarked = lyrics.findIndex((line, index) => index > currentLineIndex && !line.isMarked);
                  if (nextUnmarked !== -1) {
                    setCurrentLineIndex(nextUnmarked);
                  }
                }}
                className="px-2 py-1 rounded text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors"
                title="跳转到下一个未标记行"
              >
                下个空行
              </button>
              
              {markedCount > 0 && (
                <button
                  onClick={() => {
                    setShowConfirmDialog(true);
                  }}
                  className="px-2 py-1 rounded text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                  title="清除所有标记"
                >
                  清除全部
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            进度: {markedCount}/{lyrics.length}
          </div>
          
          {markedCount > 0 && (
            <>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors text-sm"
              >
                <Settings className="h-4 w-4" />
                {showPreview ? '关闭预览' : '实时预览'}
              </button>
              
              <button
                onClick={downloadLrc}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm"
              >
                <Download className="h-4 w-4" />
                下载 LRC
              </button>
            </>
          )}
          
          <button
            onClick={resetAll}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm"
          >
            <RefreshCw className="h-4 w-4" />
            重置
          </button>
        </div>
      </div>

      {/* 快捷键指南 */}
      {showKeyboardGuide && (
        <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">键盘快捷键</h3>
            <button
              onClick={() => setShowKeyboardGuide(false)}
              className="p-1 rounded hover:bg-blue-200/50 dark:hover:bg-blue-800/50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {/* 重要提示 */}
          <div className="mb-6">
            {/* <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              标记时机指导
            </h4> */}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 正确做法 */}
              <div className="relative bg-white dark:bg-slate-800 rounded-xl p-4 border border-green-200 dark:border-green-800">
                <div className="absolute -top-3 -left-3 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  ✓
                </div>
                <div className="pt-2">
                  <h5 className="font-semibold text-green-700 dark:text-green-300 mb-2">正确时机</h5>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    在每句歌词<span className="px-2 py-1 mx-1 bg-green-100 dark:bg-green-900/30 rounded text-green-700 dark:text-green-300 font-mono text-xs">开始唱第一个字</span>的瞬间按下空格键
                  </p>
                </div>
              </div>
              
              {/* 错误做法 */}
              <div className="relative bg-white dark:bg-slate-800 rounded-xl p-4 border border-red-200 dark:border-red-800">
                <div className="absolute -top-3 -left-3 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  ✗
                </div>
                <div className="pt-2">
                  <h5 className="font-semibold text-red-700 dark:text-red-300 mb-2">错误时机</h5>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    等到整句歌词唱完再标记，这会导致时间不准确，影响播放效果
                  </p>
                </div>
              </div>
              
              {/* 制作技巧 */}
              <div className="relative bg-white dark:bg-slate-800 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                <div className="absolute -top-3 -left-3 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  💡
                </div>
                <div className="pt-2">
                  <h5 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">制作技巧</h5>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    建议先完整听一遍歌曲，熟悉节奏和歌词后再开始精确制作
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { key: 'Space', action: '标记当前行时间', desc: '在歌词开始唱时按下' },
              { key: 'Shift + Space', action: '播放/暂停音频', desc: '控制音频播放状态' },
              { key: '←/→', action: '快进/快退 0.1秒', desc: '精确调整播放位置' },
              { key: 'Shift + ←/→', action: '快进/快退 1秒', desc: '快速调整播放位置' },
              { key: '↑/↓', action: '上一行/下一行', desc: '切换当前编辑行' },
              { key: 'Enter', action: '跳转下一行', desc: '快速移动到下一行' }
            ].map(({ key, action, desc }) => (
              <div key={key} className="flex flex-col gap-2 p-3 bg-white/60 dark:bg-slate-800/60 rounded-lg">
                <div className="flex items-center gap-3">
                  <kbd className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded text-xs font-mono min-w-[60px] text-center">
                    {key}
                  </kbd>
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{action}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 ml-1">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 主要工作区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 左侧：音频上传和歌词输入 */}
        <div className="lg:col-span-4 space-y-6">
          {/* 音频文件上传 */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FileAudio className="h-5 w-5" />
              音频文件
            </h3>
            
            <div
              className={cn(
                "relative border-2 border-dashed rounded-xl text-center transition-all duration-200 min-h-[120px] flex items-center justify-center",
                dragOver 
                  ? "border-blue-400 bg-blue-50 dark:bg-blue-950/20" 
                  : "border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500",
                audioFile && "border-green-400 bg-green-50 dark:bg-green-950/20"
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              
              {audioFile ? (
                <div className="space-y-2 p-4 w-full">
                  <div className="flex items-center justify-center gap-2">
                    <FileAudio className="h-6 w-6 text-green-600" />
                    <span className="font-medium text-green-700 dark:text-green-400 truncate max-w-[200px]">
                      {audioFile.file.name}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile();
                      }}
                      className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-500">
                    {(audioFile.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div className="space-y-2 p-6">
                  <Upload className="h-8 w-8 mx-auto text-slate-400" />
                  <div>
                    <p className="font-medium text-slate-700 dark:text-slate-300">上传音频文件</p>
                    <p className="text-xs text-slate-500">支持 MP3、WAV 等音频格式</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 歌词输入 */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5" />
              歌词文本
            </h3>
            
            <textarea
              ref={lyricsInputRef}
              value={lyricsText}
              onChange={(e) => handleLyricsChange(e.target.value)}
              placeholder="在此输入歌词文本，每行一句歌词..."
              className="w-full h-96 p-4 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent custom-scrollbar"
            />
            
            {lyrics.length > 0 && (
              <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                <span>共 {lyrics.length} 行歌词</span>
                <span>已标记 {markedCount} 行</span>
              </div>
            )}
          </div>
        </div>

        {/* 中间：音频播放器和歌词编辑 */}
        <div className="lg:col-span-5 space-y-6">
          {/* 音频播放器 */}
          {audioFile && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-lg">
              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-600">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                      <Music className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[250px]">
                        {audioFile.file.name}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {formatTime(duration)} • {playbackRate}x
                      </p>
                    </div>
                  </div>
                  
                  <select
                    value={playbackRate}
                    onChange={(e) => {
                      const rate = parseFloat(e.target.value);
                      setPlaybackRate(rate);
                      if (audioRef.current) {
                        audioRef.current.playbackRate = rate;
                      }
                    }}
                    className="text-xs bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded px-2 py-1"
                  >
                    <option value={0.5}>0.5x</option>
                    <option value={0.75}>0.75x</option>
                    <option value={1}>1x</option>
                    <option value={1.25}>1.25x</option>
                    <option value={1.5}>1.5x</option>
                  </select>
                </div>
              </div>
              
              <audio
                ref={audioRef}
                src={audioFile.url}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
              />
              
              <div className="p-4 space-y-4">
                {/* 进度条 */}
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={(e) => handleSeek(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>
                
                {/* 控制按钮 */}
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => skipTime(-1)}
                    className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
                    title="快退1秒"
                  >
                    <SkipBack className="h-4 w-4" />
                  </button>
                  
                  <button
                    onClick={togglePlay}
                    className="p-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-lg hover:shadow-xl"
                  >
                    {isPlaying ? (
                      <Pause className="h-5 w-5" />
                    ) : (
                      <Play className="h-5 w-5 ml-0.5" />
                    )}
                  </button>
                  
                  <button
                    onClick={() => skipTime(1)}
                    className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
                    title="快进1秒"
                  >
                    <SkipForward className="h-4 w-4" />
                  </button>
                  
                  <button
                    onClick={toggleMute}
                    className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
                  >
                    {isMuted ? (
                      <VolumeX className="h-4 w-4" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
                
                {/* 标记按钮 */}
                {lyrics.length > 0 && currentLineIndex < lyrics.length && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-600">
                    <button
                      onClick={markCurrentLine}
                      disabled={lyrics[currentLineIndex]?.isMarked}
                      className={cn(
                        "w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all",
                        lyrics[currentLineIndex]?.isMarked
                          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 cursor-not-allowed"
                          : "bg-red-600 text-white shadow-lg transform"
                      )}
                    >
                      {lyrics[currentLineIndex]?.isMarked ? (
                        <>
                          <CheckCircle2 className="h-5 w-5" />
                          已标记时间点
                        </>
                      ) : (
                        <>
                          <Target className="h-5 w-5" />
                          在歌词开始唱时标记 ({formatTime(currentTime)})
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 歌词列表和编辑 */}
          {lyrics.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-lg">
              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-600">
                <h3 className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Edit3 className="h-4 w-4" />
                  歌词编辑 ({currentLineIndex + 1}/{lyrics.length})
                </h3>
              </div>
              
              <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                {lyrics.map((line, index) => (
                  <div
                    key={line.id}
                    ref={index === currentLineIndex ? currentLineRef : null}
                    className={cn(
                      "p-4 border-b border-slate-100 dark:border-slate-700 transition-all cursor-pointer",
                      index === currentLineIndex && "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800",
                      line.isMarked && "bg-green-50/50 dark:bg-green-950/20"
                    )}
                    onClick={() => {
                      setCurrentLineIndex(index);
                      // 如果行已标记，跳转到对应时间
                      if (line.isMarked && line.startTime !== null) {
                        jumpToLyricTime(index);
                      }
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn(
                            "text-xs px-2 py-1 rounded",
                            index === currentLineIndex 
                              ? "bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200"
                              : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                          )}>
                            #{index + 1}
                          </span>
                          
                          {line.isMarked && (
                            <span className="text-xs px-2 py-1 rounded bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatTime(line.startTime || 0)}
                            </span>
                          )}
                        </div>
                        
                        <p className={cn(
                          "text-sm truncate",
                          index === currentLineIndex 
                            ? "text-blue-900 dark:text-blue-100 font-medium"
                            : "text-slate-700 dark:text-slate-300"
                        )}>
                          {line.text}
                        </p>
                      </div>
                      
                      {line.isMarked && (
                        <div className="flex items-center gap-1 ml-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              adjustTime(index, -0.1);
                            }}
                            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-500"
                            title="减少0.1秒"
                          >
                            -
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              adjustTime(index, 0.1);
                            }}
                            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-500"
                            title="增加0.1秒"
                          >
                            +
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              clearMark(index);
                            }}
                            className="p-1 rounded hover:bg-red-200 dark:hover:bg-red-900/30 text-red-500"
                            title="清除标记"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 右侧：LRC预览和导出 */}
        <div className="lg:col-span-3 space-y-6">
          {/* 制作进度 */}
          {lyrics.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-lg">
              <h3 className="font-medium text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                <Timer className="h-4 w-4" />
                制作进度
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">已标记</span>
                  <span className="font-medium">{markedCount}/{lyrics.length}</span>
                </div>
                
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-300"
                    style={{ width: `${lyrics.length ? (markedCount / lyrics.length) * 100 : 0}%` }}
                  />
                </div>
                
                <div className="text-center">
                  {markedCount === lyrics.length && markedCount > 0 ? (
                    <span className="text-sm text-green-600 dark:text-green-400 flex items-center justify-center gap-1">
                      <CheckCircle2 className="h-4 w-4" />
                      制作完成！
                    </span>
                  ) : (
                    <span className="text-xs text-slate-500">
                      还需标记 {lyrics.length - markedCount} 行
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* LRC预览 */}
          {markedCount > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-lg">
              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-600">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-slate-800 dark:text-slate-200">LRC 预览</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (isEditingLrc) {
                          // 保存编辑内容
                          const content = editableLrcContent || generateLrcContent();
                          setEditableLrcContent(content);
                          setIsEditingLrc(false);
                        } else {
                          // 开始编辑
                          setEditableLrcContent(generateLrcContent());
                          setIsEditingLrc(true);
                        }
                      }}
                      className={cn(
                        "px-2 py-1 rounded text-xs transition-colors",
                        isEditingLrc 
                          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50"
                          : "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-900/50"
                      )}
                      title={isEditingLrc ? "保存编辑" : "编辑LRC"}
                    >
                      {isEditingLrc ? '保存' : '编辑'}
                    </button>
                    
                    <button
                      onClick={() => {
                        const content = isEditingLrc ? editableLrcContent : generateLrcContent();
                        navigator.clipboard.writeText(content).then(() => {
                          const button = document.activeElement as HTMLButtonElement;
                          const originalText = button.textContent;
                          button.textContent = '已复制!';
                          setTimeout(() => {
                            button.textContent = originalText;
                          }, 1000);
                        }).catch(() => {
                          alert('复制失败，请手动复制');
                        });
                      }}
                      className="px-2 py-1 rounded text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                      title="复制LRC内容"
                    >
                      复制
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="max-h-80 p-4">
                {isEditingLrc ? (
                  <textarea
                    value={editableLrcContent}
                    onChange={(e) => setEditableLrcContent(e.target.value)}
                    className="w-full h-72 p-3 text-xs font-mono text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent custom-scrollbar"
                    placeholder="编辑 LRC 格式歌词..."
                  />
                ) : (
                  <div className="h-72 overflow-y-auto custom-scrollbar">
                    <pre className="text-xs font-mono text-slate-600 dark:text-slate-400 whitespace-pre-wrap leading-relaxed p-3">
                      {editableLrcContent || generateLrcContent()}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 实时预览播放器 - 跨越整个宽度 */}
      {showPreview && markedCount > 0 && audioFile && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xl">
          {/* 预览播放器头部 */}
          <div className="bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 dark:from-green-950/30 dark:via-blue-950/30 dark:to-purple-950/30 px-6 py-4 border-b border-slate-200 dark:border-slate-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-white dark:bg-slate-800 shadow-lg">
                  <Music className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                    实时预览播放器
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {audioFile.file.name} • 已标记 {markedCount} 行歌词
                  </p>
                </div>
              </div>
              
              {/* 预览播放器控制按钮组 */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded-lg px-3 py-2 shadow-sm">
                  <span className="text-xs text-slate-600 dark:text-slate-400">播放速度:</span>
                  <select
                    value={playbackRate}
                    onChange={(e) => {
                      const rate = parseFloat(e.target.value);
                      setPlaybackRate(rate);
                      if (previewAudioRef.current) {
                        previewAudioRef.current.playbackRate = rate;
                      }
                    }}
                    className="text-xs bg-transparent border-none outline-none cursor-pointer"
                  >
                    <option value={0.5}>0.5x</option>
                    <option value={0.75}>0.75x</option>
                    <option value={1}>1x</option>
                    <option value={1.25}>1.25x</option>
                    <option value={1.5}>1.5x</option>
                  </select>
                </div>
                
                <button
                  onClick={() => {
                    setShowPreview(false);
                    setPreviewCurrentLyricIndex(-1);
                    if (previewAudioRef.current) {
                      previewAudioRef.current.pause();
                    }
                  }}
                  className="p-2 rounded-lg hover:bg-white/70 dark:hover:bg-slate-700/70 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all duration-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
          
          <audio
            ref={previewAudioRef}
            src={audioFile.url}
            onTimeUpdate={handlePreviewTimeUpdate}
            onLoadedMetadata={() => {
              if (previewAudioRef.current) {
                previewAudioRef.current.volume = volume;
                previewAudioRef.current.playbackRate = playbackRate;
              }
            }}
            onEnded={() => {
              setPreviewCurrentLyricIndex(-1);
              setIsPreviewPlaying(false);
            }}
            onPlay={() => setIsPreviewPlaying(true)}
            onPause={() => setIsPreviewPlaying(false)}
            className="hidden"
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
            {/* 左侧：播放控制区 */}
            <div className="space-y-4">
              <h4 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Settings className="h-4 w-4" />
                播放控制
              </h4>
              
              {/* 播放按钮组 */}
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => {
                    if (previewAudioRef.current) {
                      previewAudioRef.current.currentTime = Math.max(0, previewAudioRef.current.currentTime - 10);
                    }
                  }}
                  className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all shadow-md hover:shadow-lg"
                  title="快退10秒"
                >
                  <SkipBack className="h-5 w-5" />
                </button>
                
                <button
                  onClick={() => {
                    if (previewAudioRef.current) {
                      if (previewAudioRef.current.paused) {
                        previewAudioRef.current.play();
                        setIsPreviewPlaying(true);
                      } else {
                        previewAudioRef.current.pause();
                        setIsPreviewPlaying(false);
                      }
                    }
                  }}
                  className="p-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-lg hover:shadow-xl"
                >
                  {isPreviewPlaying ? (
                    <Pause className="h-6 w-6" />
                  ) : (
                    <Play className="h-6 w-6 ml-0.5" />
                  )}
                </button>
                
                <button
                  onClick={() => {
                    if (previewAudioRef.current) {
                      previewAudioRef.current.currentTime = Math.min(previewAudioRef.current.duration, previewAudioRef.current.currentTime + 10);
                    }
                  }}
                  className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all shadow-md hover:shadow-lg"
                  title="快进10秒"
                >
                  <SkipForward className="h-5 w-5" />
                </button>
              </div>
              
              {/* 音量控制 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">音量</span>
                  <span className="text-xs text-slate-500">{Math.round(volume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={(e) => {
                    const vol = parseFloat(e.target.value);
                    setVolume(vol);
                    if (previewAudioRef.current) {
                      previewAudioRef.current.volume = vol;
                    }
                  }}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              
              {/* 进度信息 */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>当前歌词: {previewCurrentLyricIndex + 1}/{lyrics.filter(l => l.isMarked).length}</span>
                  <span>总时长: {formatTime(duration)}</span>
                </div>
              </div>
            </div>
            
            {/* 中间：歌词显示区域 */}
            <div className="lg:col-span-2">
              <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                <Music className="h-4 w-4" />
                同步歌词
              </h4>
              
              <div className="relative">
                <div 
                  ref={previewLyricsRef}
                  onScroll={handlePreviewLyricsScroll}
                  className="h-80 overflow-y-auto overflow-x-hidden custom-scrollbar bg-gradient-to-b from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 rounded-xl border border-slate-200 dark:border-slate-700"
                  style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: 'rgb(148 163 184) transparent'
                  }}
                >
                  {/* 顶部和底部填充 */}
                  <div className="h-40"></div>
                  
                  <div className="preview-lyrics-wrapper space-y-1 px-6">
                    {lyrics
                      .filter(line => line.isMarked && line.startTime !== null)
                      .sort((a, b) => (a.startTime || 0) - (b.startTime || 0))
                      .map((line, index) => (
                        <div
                          key={line.id}
                          className={cn(
                            "text-center py-2 px-4 transition-all duration-500 ease-out cursor-pointer relative",
                            index === previewCurrentLyricIndex 
                              ? "text-green-600 dark:text-green-400 font-semibold text-lg transform scale-105" 
                              : index < previewCurrentLyricIndex 
                                ? "text-slate-400 dark:text-slate-500 text-sm" 
                                : "text-slate-600 dark:text-slate-400 text-base hover:text-slate-800 dark:hover:text-slate-200"
                          )}
                          onClick={() => {
                            if (previewAudioRef.current && line.startTime !== null) {
                              previewAudioRef.current.currentTime = line.startTime;
                            }
                          }}
                        >
                          {/* 活跃指示器 - 放在左侧 */}
                          {index === previewCurrentLyricIndex && (
                            <div className="absolute left-1 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-green-500 rounded-full shadow-sm"></div>
                          )}
                          
                          {/* 时间标记 - 放在右上角 */}
                          <div className="absolute top-0.5 right-2">
                            <span className={cn(
                              "text-xs px-1.5 py-0.5 rounded font-medium",
                              index === previewCurrentLyricIndex
                                ? "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300"
                                : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                            )}>
                              {formatTime(line.startTime || 0)}
                            </span>
                          </div>
                          
                          {/* 歌词文本 */}
                          <div className="leading-relaxed">
                            {line.text}
                          </div>
                        </div>
                      ))}
                  </div>
                  
                  <div className="h-40"></div>
                </div>
                
                {/* 中心指示线 */}
                <div className="absolute left-4 right-4 top-1/2 transform -translate-y-1/2 pointer-events-none z-10">
                  <div className="h-0.5 bg-gradient-to-r from-transparent via-green-400 dark:via-green-500 to-transparent opacity-70 shadow-sm"></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* 底部状态栏 */}
          <div className="bg-slate-50 dark:bg-slate-800 px-6 py-3 border-t border-slate-200 dark:border-slate-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                <span>🎯 点击歌词行可跳转到对应时间</span>
                <span>🎨 当前播放模式：实时同步</span>
              </div>
              
              {userScrolledPreview && (
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  手动滚动中，3秒后自动复位
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 使用提示 */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-xl p-6 border border-blue-200/50 dark:border-blue-800/50">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
          <Zap className="h-4 w-4" />
          制作指南
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-200 dark:bg-blue-800 flex items-center justify-center text-xs font-bold text-blue-800 dark:text-blue-200 mt-0.5">1</div>
            <div>
              <p className="font-medium text-blue-800 dark:text-blue-200">上传音频</p>
              <p className="text-blue-600 dark:text-blue-300">选择要制作歌词的音频文件</p>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-200 dark:bg-blue-800 flex items-center justify-center text-xs font-bold text-blue-800 dark:text-blue-200 mt-0.5">2</div>
            <div>
              <p className="font-medium text-blue-800 dark:text-blue-200">输入歌词</p>
              <p className="text-blue-600 dark:text-blue-300">在左侧输入框中输入歌词文本</p>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-200 dark:bg-blue-800 flex items-center justify-center text-xs font-bold text-blue-800 dark:text-blue-200 mt-0.5">3</div>
            <div>
              <p className="font-medium text-blue-800 dark:text-blue-200">精确标记</p>
              <p className="text-blue-600 dark:text-blue-300">在每句歌词开始唱时按空格键标记</p>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-200 dark:bg-blue-800 flex items-center justify-center text-xs font-bold text-blue-800 dark:text-blue-200 mt-0.5">4</div>
            <div>
              <p className="font-medium text-blue-800 dark:text-blue-200">导出文件</p>
              <p className="text-blue-600 dark:text-blue-300">完成后下载标准 LRC 格式文件</p>
            </div>
          </div>
        </div>
      </div>

      {/* 确认对话框 */}
      {showConfirmDialog && (
        <div 
          className="fixed z-50"
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 9999
          }}
        >
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 w-96 max-w-[90vw]">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <X className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  清除所有标记
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  此操作无法撤销
                </p>
              </div>
            </div>
            
            <p className="text-slate-700 dark:text-slate-300 mb-6 leading-relaxed">
              确定要清除所有 <span className="font-semibold text-red-600 dark:text-red-400">{markedCount}</span> 个时间标记吗？
               这将删除您已经制作的所有歌词时间点，需要重新标记。
            </p>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                取消
              </button>
              <button
                onClick={confirmClearAllMarks}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors shadow-lg hover:shadow-xl"
              >
                确定清除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 