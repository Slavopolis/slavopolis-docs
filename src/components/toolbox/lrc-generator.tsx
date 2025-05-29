'use client';

import { cn } from '@/lib/utils';
import {
    Download,
    Edit3,
    Eye, EyeOff,
    FileAudio, FileText,
    List,
    Loader2,
    Maximize2,
    Music,
    Pause,
    Play,
    RefreshCw,
    Save,
    Settings,
    SkipBack, SkipForward,
    Upload,
    Volume1,
    Volume2,
    VolumeX,
    X
} from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

interface LyricLine {
  time: number;
  text: string;
}

interface UploadedFile {
  file: File;
  type: 'audio' | 'lyrics';
  url?: string;
}

export function LrcGenerator() {
  const [uploadedFiles, setUploadedFiles] = useState<{
    audio?: UploadedFile;
    lyrics?: UploadedFile;
  }>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedLrc, setGeneratedLrc] = useState<string>('');
  const [lrcLines, setLrcLines] = useState<LyricLine[]>([]);
  const [dragOver, setDragOver] = useState<'audio' | 'lyrics' | null>(null);
  
  // 歌词预览和编辑
  const [lyricsPreview, setLyricsPreview] = useState<string>('');
  const [showLyricsPreview, setShowLyricsPreview] = useState(false);
  const [isEditingLrc, setIsEditingLrc] = useState(false);
  const [editableLrc, setEditableLrc] = useState<string>('');
  
  // 弹窗预览
  const [showLyricsModal, setShowLyricsModal] = useState(false);
  const [showLrcModal, setShowLrcModal] = useState(false);
  
  // 音频播放器状态
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  
  // LRC测试播放器状态
  const [testPlayerVisible, setTestPlayerVisible] = useState(false);
  const [currentLyricIndex, setCurrentLyricIndex] = useState(-1);
  const [testIsPlaying, setTestIsPlaying] = useState(false);
  const [testCurrentTime, setTestCurrentTime] = useState(0);
  const [testDuration, setTestDuration] = useState(0);
  const [testVolume, setTestVolume] = useState(0.8);
  const [testIsMuted, setTestIsMuted] = useState(false);
  const [userScrolled, setUserScrolled] = useState(false);
  const [scrollTimeout, setScrollTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [lastAutoScrollTime, setLastAutoScrollTime] = useState(0);
  
  const audioInputRef = useRef<HTMLInputElement>(null);
  const lyricsInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const testAudioRef = useRef<HTMLAudioElement>(null);
  const lyricsContainerRef = useRef<HTMLDivElement>(null);

  // 添加自定义CSS样式
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .slider::-webkit-slider-thumb {
        appearance: none;
        height: 16px;
        width: 16px;
        border-radius: 50%;
        background: rgb(59 130 246);
        cursor: pointer;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        transition: all 0.2s ease;
      }
      
      .slider::-webkit-slider-thumb:hover {
        transform: scale(1.2);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
      }
      
      .slider::-moz-range-thumb {
        height: 16px;
        width: 16px;
        border-radius: 50%;
        background: rgb(59 130 246);
        cursor: pointer;
        border: none;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }
      
      .scrollbar-thin::-webkit-scrollbar {
        width: 6px;
      }
      
      .scrollbar-thin::-webkit-scrollbar-track {
        background: transparent;
      }
      
      .scrollbar-thin::-webkit-scrollbar-thumb {
        background-color: rgb(148 163 184);
        border-radius: 3px;
      }
      
      .scrollbar-thin::-webkit-scrollbar-thumb:hover {
        background-color: rgb(100 116 139);
      }
      
      .dark .scrollbar-thin::-webkit-scrollbar-thumb {
        background-color: rgb(71 85 105);
      }
      
      .dark .scrollbar-thin::-webkit-scrollbar-thumb:hover {
        background-color: rgb(51 65 85);
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // 处理文件拖拽
  const handleDragOver = useCallback((e: React.DragEvent, type: 'audio' | 'lyrics') => {
    e.preventDefault();
    setDragOver(type);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, type: 'audio' | 'lyrics') => {
    e.preventDefault();
    setDragOver(null);
    
    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    
    if (!file) return;
    
    if (type === 'audio' && file.type.startsWith('audio/')) {
      handleFileUpload(file, 'audio');
    } else if (type === 'lyrics' && file.type === 'text/plain') {
      handleFileUpload(file, 'lyrics');
    }
  }, []);

  // 处理文件上传
  const handleFileUpload = useCallback(async (file: File, type: 'audio' | 'lyrics') => {
    const url = URL.createObjectURL(file);
    setUploadedFiles(prev => ({
      ...prev,
      [type]: { file, type, url }
    }));
    
    // 如果是歌词文件，自动预览内容
    if (type === 'lyrics') {
      try {
        const content = await file.text();
        setLyricsPreview(content);
        setShowLyricsPreview(true);
      } catch (error) {
        console.error('读取歌词文件失败:', error);
      }
    }
    
    // 如果是音频文件，重置播放器状态
    if (type === 'audio') {
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
    }
  }, []);

  // 文件选择处理
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>, type: 'audio' | 'lyrics') => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file, type);
    }
  }, [handleFileUpload]);

  // 移除文件
  const removeFile = useCallback((type: 'audio' | 'lyrics') => {
    setUploadedFiles(prev => {
      const newFiles = { ...prev };
      if (newFiles[type]?.url) {
        URL.revokeObjectURL(newFiles[type]!.url!);
      }
      delete newFiles[type];
      return newFiles;
    });
    
    if (type === 'audio') {
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
    }
    
    if (type === 'lyrics') {
      setLyricsPreview('');
      setShowLyricsPreview(false);
    }
  }, []);

  // 音频播放器控制函数
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
    }
  }, [playbackRate]);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    setIsMuted(vol === 0);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
  }, []);

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

  const skipTime = useCallback((seconds: number) => {
    if (!audioRef.current) return;
    
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  }, [currentTime, duration]);

  const changePlaybackRate = useCallback((rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  }, []);

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // 解析歌词文件
  const parseLyricsFile = useCallback(async (file: File): Promise<string[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const lines = content.split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0);
        resolve(lines);
      };
      reader.onerror = () => reject(new Error('读取歌词文件失败'));
      reader.readAsText(file, 'utf-8');
    });
  }, []);

  // 获取音频时长
  const getAudioDuration = useCallback(async (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      const url = URL.createObjectURL(file);
      
      audio.onloadedmetadata = () => {
        URL.revokeObjectURL(url);
        resolve(audio.duration);
      };
      
      audio.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('读取音频文件失败'));
      };
      
      audio.src = url;
    });
  }, []);

  // 生成LRC格式歌词
  const generateLrc = useCallback(async () => {
    if (!uploadedFiles.audio || !uploadedFiles.lyrics) {
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      setProgress(20);
      const lyricsLines = await parseLyricsFile(uploadedFiles.lyrics.file);
      
      setProgress(40);
      const audioDuration = await getAudioDuration(uploadedFiles.audio.file);
      
      setProgress(60);
      const timePerLine = audioDuration / lyricsLines.length;
      
      setProgress(80);
      const lrcContent: LyricLine[] = lyricsLines.map((line, index) => ({
        time: index * timePerLine,
        text: line
      }));

      const formatLrcTime = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        const centiseconds = Math.floor((seconds % 1) * 100);
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
      };

      const lrcString = [
        '[ti:' + uploadedFiles.audio.file.name.replace(/\.[^/.]+$/, '') + ']',
        '[ar:Unknown Artist]',
        '[al:Unknown Album]',
        '[by:LRC Generator]',
        '',
        ...lrcContent.map(line => `[${formatLrcTime(line.time)}]${line.text}`)
      ].join('\n');

      setLrcLines(lrcContent);
      setGeneratedLrc(lrcString);
      setEditableLrc(lrcString);
      setProgress(100);
      
      setTimeout(() => {
        setIsProcessing(false);
        setProgress(0);
      }, 500);

    } catch (error) {
      console.error('生成LRC失败:', error);
      setIsProcessing(false);
      setProgress(0);
    }
  }, [uploadedFiles, parseLyricsFile, getAudioDuration]);

  // 保存编辑的LRC
  const saveLrcEdit = useCallback(() => {
    setGeneratedLrc(editableLrc);
    setIsEditingLrc(false);
    
    // 重新解析LRC内容
    const lines = editableLrc.split('\n');
    const newLrcLines: LyricLine[] = [];
    
    lines.forEach(line => {
      const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2})\](.*)/);
      if (match && match.length >= 5) {
        const minutes = parseInt(match[1]!);
        const seconds = parseInt(match[2]!);
        const centiseconds = parseInt(match[3]!);
        const text = match[4]!;
        const time = minutes * 60 + seconds + centiseconds / 100;
        newLrcLines.push({ time, text });
      }
    });
    
    setLrcLines(newLrcLines);
  }, [editableLrc]);

  // LRC测试播放器相关函数
  const toggleTestPlayer = useCallback(() => {
    setTestPlayerVisible(!testPlayerVisible);
    if (!testPlayerVisible && testAudioRef.current && uploadedFiles.audio) {
      testAudioRef.current.src = uploadedFiles.audio.url!;
    }
  }, [testPlayerVisible, uploadedFiles.audio]);

  // 测试播放器控制函数
  const toggleTestPlay = useCallback(() => {
    if (!testAudioRef.current) return;
    
    if (testIsPlaying) {
      testAudioRef.current.pause();
    } else {
      testAudioRef.current.play();
    }
    setTestIsPlaying(!testIsPlaying);
  }, [testIsPlaying]);

  const handleTestLoadedMetadata = useCallback(() => {
    if (testAudioRef.current) {
      setTestDuration(testAudioRef.current.duration);
      testAudioRef.current.volume = testVolume;
    }
  }, [testVolume]);

  const handleTestSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (testAudioRef.current) {
      testAudioRef.current.currentTime = time;
      setTestCurrentTime(time);
    }
  }, []);

  const handleTestVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setTestVolume(vol);
    setTestIsMuted(vol === 0);
    if (testAudioRef.current) {
      testAudioRef.current.volume = vol;
    }
  }, []);

  const toggleTestMute = useCallback(() => {
    if (!testAudioRef.current) return;
    
    if (testIsMuted) {
      testAudioRef.current.volume = testVolume;
      setTestIsMuted(false);
    } else {
      testAudioRef.current.volume = 0;
      setTestIsMuted(true);
    }
  }, [testIsMuted, testVolume]);

  const skipTestTime = useCallback((seconds: number) => {
    if (!testAudioRef.current) return;
    
    const newTime = Math.max(0, Math.min(testDuration, testCurrentTime + seconds));
    testAudioRef.current.currentTime = newTime;
    setTestCurrentTime(newTime);
  }, [testCurrentTime, testDuration]);

  // 歌词滚动到中心
  const scrollToActiveLyric = useCallback(() => {
    if (!lyricsContainerRef.current || currentLyricIndex === -1 || userScrolled) return;
    
    const container = lyricsContainerRef.current;
    const lyricsWrapper = container.querySelector('.lyrics-wrapper') as HTMLElement;
    if (!lyricsWrapper) return;
    
    const activeLyric = lyricsWrapper.children[currentLyricIndex] as HTMLElement;
    
    if (activeLyric) {
      // 设置自动滚动标志和时间戳
      const now = Date.now();
      setIsAutoScrolling(true);
      setLastAutoScrollTime(now);
      
      // 使用 scrollIntoView 方法实现精确居中
      try {
        activeLyric.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        });
      } catch (error) {
        // 降级方案：手动计算滚动位置
        const containerHeight = container.clientHeight;
        const activeLyricTop = activeLyric.offsetTop;
        const activeLyricHeight = activeLyric.clientHeight;
        
        // 计算歌词中心相对于 lyricsWrapper 的位置
        const lyricCenter = activeLyricTop + (activeLyricHeight / 2);
        
        // 计算需要滚动的距离（考虑顶部填充）
        const topPadding = 160; // h-40
        const scrollTop = lyricCenter + topPadding - (containerHeight / 2);
        
        container.scrollTo({
          top: Math.max(0, scrollTop),
          behavior: 'smooth'
        });
      }
      
      // 滚动完成后重置自动滚动标志
      setTimeout(() => {
        setIsAutoScrolling(false);
      }, 1000); // 给滚动动画足够的时间完成
    }
  }, [currentLyricIndex, userScrolled]);

  // 处理用户手动滚动
  const handleLyricsScroll = useCallback(() => {
    const now = Date.now();
    
    // 如果距离最后一次自动滚动时间小于1.5秒，认为是自动滚动触发的
    if (now - lastAutoScrollTime < 1500) {
      return;
    }
    
    setUserScrolled(true);
    
    // 清除之前的定时器
    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
    }
    
    // 3秒后自动复位
    const timeout = setTimeout(() => {
      setUserScrolled(false);
      // 立即触发滚动到当前活跃歌词
      setTimeout(() => {
        scrollToActiveLyric();
      }, 100);
    }, 3000);
    
    setScrollTimeout(timeout);
  }, [scrollTimeout, scrollToActiveLyric, lastAutoScrollTime]);

  // 监听测试播放器时间更新
  const handleTestTimeUpdate = useCallback(() => {
    if (!testAudioRef.current) return;
    
    const currentTime = testAudioRef.current.currentTime;
    setTestCurrentTime(currentTime);
    
    // 找到当前应该高亮的歌词
    let activeIndex = -1;
    for (let i = 0; i < lrcLines.length; i++) {
      const lyricLine = lrcLines[i];
      if (lyricLine && currentTime >= lyricLine.time) {
        activeIndex = i;
      } else {
        break;
      }
    }
    
    if (activeIndex !== currentLyricIndex) {
      setCurrentLyricIndex(activeIndex);
    }
  }, [lrcLines, currentLyricIndex]);

  // 当活跃歌词改变时滚动到中心
  useEffect(() => {
    if (currentLyricIndex !== -1) {
      // 延迟一点时间确保DOM已更新
      const timer = setTimeout(() => {
        scrollToActiveLyric();
      }, 50);
      
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [currentLyricIndex, scrollToActiveLyric]);

  // 组件卸载时清理定时器
  useEffect(() => {
    return () => {
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
    };
  }, [scrollTimeout]);

  // 下载LRC文件
  const downloadLrc = useCallback(() => {
    if (!generatedLrc) return;

    const blob = new Blob([generatedLrc], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${uploadedFiles.audio?.file.name.replace(/\.[^/.]+$/, '') || 'lyrics'}.lrc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [generatedLrc, uploadedFiles.audio]);

  // 重置所有状态
  const resetAll = useCallback(() => {
    Object.values(uploadedFiles).forEach(file => {
      if (file?.url) {
        URL.revokeObjectURL(file.url);
      }
    });
    
    // 清理定时器
    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
      setScrollTimeout(null);
    }
    
    setUploadedFiles({});
    setGeneratedLrc('');
    setEditableLrc('');
    setLrcLines([]);
    setLyricsPreview('');
    setShowLyricsPreview(false);
    setIsProcessing(false);
    setProgress(0);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setIsEditingLrc(false);
    setTestPlayerVisible(false);
    setCurrentLyricIndex(-1);
    setTestIsPlaying(false);
    setTestCurrentTime(0);
    setTestDuration(0);
    setUserScrolled(false);
    setIsAutoScrolling(false);
    setLastAutoScrollTime(0);
    
    if (audioInputRef.current) audioInputRef.current.value = '';
    if (lyricsInputRef.current) lyricsInputRef.current.value = '';
  }, [uploadedFiles, scrollTimeout]);

  return (
    <div className="space-y-6">
      {/* 简约标题区域 */}
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-3">
          <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
            <Music className="h-6 w-6 text-slate-700 dark:text-slate-300" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
              LRC 歌词生成器
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              上传音频和歌词文件，自动生成时间轴同步的 LRC 格式歌词
            </p>
          </div>
        </div>
      </div>

      {/* 文件上传区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 音频文件上传 */}
        <div className="space-y-3">
          <h3 className="text-base font-medium flex items-center gap-2 text-slate-800 dark:text-slate-200">
            <FileAudio className="h-4 w-4" />
            音频文件
          </h3>
          
          <div
            className={cn(
              "relative border-2 border-dashed rounded-lg text-center transition-all duration-200 min-h-[160px] flex items-center justify-center",
              dragOver === 'audio' 
                ? "border-blue-400 bg-blue-50 dark:bg-blue-950/20" 
                : "border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500",
              uploadedFiles.audio && "border-green-400 bg-green-50 dark:bg-green-950/20"
            )}
            onDragOver={(e) => handleDragOver(e, 'audio')}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, 'audio')}
          >
            <input
              ref={audioInputRef}
              type="file"
              accept="audio/mp3,audio/mpeg,audio/*"
              onChange={(e) => handleFileSelect(e, 'audio')}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            
            {uploadedFiles.audio ? (
              <div className="space-y-2 p-4 w-full">
                <div className="flex items-center justify-center gap-2">
                  <FileAudio className="h-6 w-6 text-green-600" />
                  <span className="font-medium text-green-700 dark:text-green-400 truncate max-w-[180px]">
                    {uploadedFiles.audio.file.name}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile('audio');
                    }}
                    className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-xs text-slate-500">
                  {(uploadedFiles.audio.file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div className="space-y-2 p-6">
                <Upload className="h-8 w-8 mx-auto text-slate-400" />
                <div>
                  <p className="font-medium text-slate-700 dark:text-slate-300">上传音频文件</p>
                  <p className="text-xs text-slate-500">支持 MP3 等音频格式</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 歌词文件上传 */}
        <div className="space-y-3">
          <h3 className="text-base font-medium flex items-center gap-2 text-slate-800 dark:text-slate-200">
            <FileText className="h-4 w-4" />
            歌词文件
          </h3>
          
          <div
            className={cn(
              "relative border-2 border-dashed rounded-lg text-center transition-all duration-200 min-h-[160px] flex items-center justify-center",
              dragOver === 'lyrics' 
                ? "border-green-400 bg-green-50 dark:bg-green-950/20" 
                : "border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500",
              uploadedFiles.lyrics && "border-green-400 bg-green-50 dark:bg-green-950/20"
            )}
            onDragOver={(e) => handleDragOver(e, 'lyrics')}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, 'lyrics')}
          >
            <input
              ref={lyricsInputRef}
              type="file"
              accept=".txt,text/plain,text/*"
              onChange={(e) => handleFileSelect(e, 'lyrics')}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            
            {uploadedFiles.lyrics ? (
              <div className="space-y-2 p-4 w-full">
                <div className="flex items-center justify-center gap-2">
                  <FileText className="h-6 w-6 text-green-600" />
                  <span className="font-medium text-green-700 dark:text-green-400 truncate max-w-[180px]">
                    {uploadedFiles.lyrics.file.name}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowLyricsPreview(!showLyricsPreview);
                    }}
                    className="p-1 rounded hover:bg-blue-100 dark:hover:bg-blue-900/20 text-blue-500"
                  >
                    {showLyricsPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile('lyrics');
                    }}
                    className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-xs text-slate-500">
                  {(uploadedFiles.lyrics.file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            ) : (
              <div className="space-y-2 p-6">
                <Upload className="h-8 w-8 mx-auto text-slate-400" />
                <div>
                  <p className="font-medium text-slate-700 dark:text-slate-300">上传歌词文件</p>
                  <p className="text-xs text-slate-500">每行一句歌词的 TXT 文件</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 歌词内容预览 */}
      {showLyricsPreview && lyricsPreview && (
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <List className="h-4 w-4" />
              歌词内容预览
            </h4>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">
                共 {lyricsPreview.split('\n').filter(line => line.trim()).length} 行
              </span>
              <button
                onClick={() => setShowLyricsModal(true)}
                className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400"
                title="放大查看"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-600 p-3 max-h-32 overflow-y-auto">
            <pre className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
              {lyricsPreview}
            </pre>
          </div>
        </div>
      )}

      {/* 专业音频播放器 */}
      {uploadedFiles.audio && (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          {/* 播放器头部 */}
          <div className="px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <Music className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[300px]">
                    {uploadedFiles.audio.file.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {(uploadedFiles.audio.file.size / 1024 / 1024).toFixed(2)} MB • {formatTime(duration)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">倍速:</span>
                <select
                  value={playbackRate}
                  onChange={(e) => changePlaybackRate(parseFloat(e.target.value))}
                  className="text-xs font-medium bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-1.5 text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 cursor-pointer"
                >
                  <option value={0.5} className="bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 py-2">0.5x</option>
                  <option value={0.75} className="bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 py-2">0.75x</option>
                  <option value={1} className="bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 py-2">1x</option>
                  <option value={1.25} className="bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 py-2">1.25x</option>
                  <option value={1.5} className="bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 py-2">1.5x</option>
                  <option value={2} className="bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 py-2">2x</option>
                </select>
              </div>
            </div>
          </div>
          
          <audio
            ref={audioRef}
            src={uploadedFiles.audio.url}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />
          
          {/* 播放器主体 */}
          <div className="p-4 space-y-4">
            {/* 进度条 */}
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-500">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
            
            {/* 控制按钮 */}
            <div className="flex items-center justify-center relative">
              <div className="flex items-center gap-3">
                {/* 快退 */}
                <button
                  onClick={() => skipTime(-10)}
                  className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-200 shadow-sm hover:shadow-md border border-slate-200 dark:border-slate-600"
                  title="快退10秒"
                >
                  <SkipBack className="h-4 w-4 text-slate-700 dark:text-slate-300" />
                </button>
                
                {/* 播放/暂停 */}
                <button
                  onClick={togglePlay}
                  className="p-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {isPlaying ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Play className="h-5 w-5 ml-0.5" />
                  )}
                </button>
                
                {/* 快进 */}
                <button
                  onClick={() => skipTime(10)}
                  className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-200 shadow-sm hover:shadow-md border border-slate-200 dark:border-slate-600"
                  title="快进10秒"
                >
                  <SkipForward className="h-4 w-4 text-slate-700 dark:text-slate-300" />
                </button>
              </div>
              
              {/* 音量控制 - 绝对定位到右侧 */}
              <div className="absolute right-0 flex items-center gap-3">
                <button
                  onClick={toggleMute}
                  className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-200 shadow-sm hover:shadow-md border border-slate-200 dark:border-slate-600"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="h-4 w-4 text-slate-500" />
                  ) : volume < 0.5 ? (
                    <Volume1 className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  ) : (
                    <Volume2 className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  )}
                </button>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-20 h-1 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-xs text-slate-500 min-w-[30px]">
                    {Math.round((isMuted ? 0 : volume) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={generateLrc}
          disabled={!uploadedFiles.audio || !uploadedFiles.lyrics || isProcessing}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200",
            "bg-blue-600 text-white hover:bg-blue-700",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              生成中...
            </>
          ) : (
            <>
              <Music className="h-4 w-4" />
              生成 LRC 歌词
            </>
          )}
        </button>

        <button
          onClick={resetAll}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          <RefreshCw className="h-4 w-4" />
          重置
        </button>
      </div>

      {/* 进度条 */}
      {isProcessing && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">处理进度</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-blue-600 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* LRC结果展示和编辑 */}
      {generatedLrc && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200">生成的 LRC 歌词</h3>
            <div className="flex items-center gap-2">
              {generatedLrc && (
                <button
                  onClick={toggleTestPlayer}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors text-sm"
                >
                  <Settings className="h-4 w-4" />
                  {testPlayerVisible ? '关闭测试' : '效果测试'}
                </button>
              )}
              <button
                onClick={() => {
                  setIsEditingLrc(!isEditingLrc);
                  if (!isEditingLrc) {
                    setEditableLrc(generatedLrc);
                  }
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition-colors text-sm"
              >
                <Edit3 className="h-4 w-4" />
                {isEditingLrc ? '取消编辑' : '编辑歌词'}
              </button>
              <button
                onClick={() => setShowLrcModal(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors text-sm"
                title="放大查看"
              >
                <Maximize2 className="h-4 w-4" />
                放大查看
              </button>
              <button
                onClick={downloadLrc}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm"
              >
                <Download className="h-4 w-4" />
                下载 LRC
              </button>
            </div>
          </div>

          {isEditingLrc ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-slate-700 dark:text-slate-300">编辑 LRC 歌词</h4>
                <button
                  onClick={saveLrcEdit}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors text-sm"
                >
                  <Save className="h-4 w-4" />
                  保存修改
                </button>
              </div>
              <textarea
                value={editableLrc}
                onChange={(e) => setEditableLrc(e.target.value)}
                className="w-full h-64 p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="编辑 LRC 格式歌词..."
              />
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <pre className="text-sm font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap break-words max-h-64 overflow-y-auto">
                {generatedLrc}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* LRC效果测试播放器 */}
      {testPlayerVisible && generatedLrc && uploadedFiles.audio && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xl">
          {/* 播放器头部 */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-700 px-6 py-4 border-b border-slate-200 dark:border-slate-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 shadow-sm">
                  <Music className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                    LRC 效果测试
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {uploadedFiles.audio.file.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setTestPlayerVisible(false)}
                className="p-2 rounded-lg hover:bg-white/50 dark:hover:bg-slate-700/50 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          <audio
            ref={testAudioRef}
            src={uploadedFiles.audio.url}
            onTimeUpdate={handleTestTimeUpdate}
            onLoadedMetadata={handleTestLoadedMetadata}
            onEnded={() => setTestIsPlaying(false)}
            className="hidden"
          />
          
          <div className="p-6 space-y-6">
            {/* 歌词显示区域 */}
            <div className="relative">
              <div 
                ref={lyricsContainerRef}
                onScroll={handleLyricsScroll}
                className="h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'rgb(148 163 184) transparent'
                }}
              >
                {/* 顶部和底部填充，确保第一行和最后一行可以居中 */}
                <div className="h-40"></div>
                
                <div className="lyrics-wrapper space-y-3 px-4">
                  {lrcLines.map((line, index) => (
                    <div
                      key={index}
                      className={cn(
                        "text-center py-3 px-4 rounded-lg transition-all duration-500 ease-out cursor-pointer",
                        index === currentLyricIndex 
                          ? "text-blue-600 dark:text-blue-400 font-semibold text-xl transform scale-105" 
                          : index < currentLyricIndex 
                            ? "text-slate-400 dark:text-slate-500 text-base" 
                            : "text-slate-600 dark:text-slate-400 text-base hover:text-slate-800 dark:hover:text-slate-200"
                      )}
                      onClick={() => {
                        if (testAudioRef.current && line.time) {
                          testAudioRef.current.currentTime = line.time;
                          setTestCurrentTime(line.time);
                        }
                      }}
                    >
                      {line.text}
                    </div>
                  ))}
                </div>
                
                <div className="h-40"></div>
              </div>
              
              {/* 中心指示线 */}
              <div className="absolute left-0 right-0 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <div className="h-px bg-gradient-to-r from-transparent via-blue-300 dark:via-blue-600 to-transparent opacity-30"></div>
              </div>
            </div>
            
            {/* 进度条 */}
            <div className="space-y-3">
              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max={testDuration || 0}
                  value={testCurrentTime}
                  onChange={handleTestSeek}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, rgb(59 130 246) 0%, rgb(59 130 246) ${(testCurrentTime / (testDuration || 1)) * 100}%, rgb(226 232 240) ${(testCurrentTime / (testDuration || 1)) * 100}%, rgb(226 232 240) 100%)`
                  }}
                />
              </div>
              <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400">
                <span>{formatTime(testCurrentTime)}</span>
                <span>{formatTime(testDuration)}</span>
              </div>
            </div>
            
            {/* 控制按钮区域 */}
            <div className="flex items-center justify-center gap-6">
              {/* 快退按钮 */}
              <button
                onClick={() => skipTestTime(-10)}
                className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                title="快退10秒"
              >
                <SkipBack className="h-5 w-5" />
              </button>
              
              {/* 播放/暂停按钮 */}
              <button
                onClick={toggleTestPlay}
                className={cn(
                  "p-4 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110",
                  testIsPlaying 
                    ? "bg-orange-500 hover:bg-orange-600 text-white" 
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                )}
              >
                {testIsPlaying ? (
                  <Pause className="h-7 w-7" />
                ) : (
                  <Play className="h-7 w-7 ml-0.5" />
                )}
              </button>
              
              {/* 快进按钮 */}
              <button
                onClick={() => skipTestTime(10)}
                className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                title="快进10秒"
              >
                <SkipForward className="h-5 w-5" />
              </button>
            </div>
            
            {/* 音量控制 */}
            <div className="flex items-center justify-center gap-4 pt-2">
              <button
                onClick={toggleTestMute}
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all duration-200"
              >
                {testIsMuted || testVolume === 0 ? (
                  <VolumeX className="h-4 w-4" />
                ) : testVolume < 0.5 ? (
                  <Volume1 className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </button>
              
              <div className="flex items-center gap-3 flex-1 max-w-xs">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={testIsMuted ? 0 : testVolume}
                  onChange={handleTestVolumeChange}
                  className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, rgb(59 130 246) 0%, rgb(59 130 246) ${(testIsMuted ? 0 : testVolume) * 100}%, rgb(226 232 240) ${(testIsMuted ? 0 : testVolume) * 100}%, rgb(226 232 240) 100%)`
                  }}
                />
                <span className="text-sm text-slate-500 dark:text-slate-400 min-w-[35px] text-right">
                  {Math.round((testIsMuted ? 0 : testVolume) * 100)}%
                </span>
              </div>
            </div>
            
            {/* 提示信息 */}
            {userScrolled && (
              <div className="text-center">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  手动滚动中，3秒后自动复位
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 使用说明 */}
      <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200/20 dark:border-blue-800/20">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">使用说明</h4>
        <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
          <li>• 上传 MP3 格式的音频文件和 TXT 格式的歌词文件</li>
          <li>• 歌词文件应该是每行一句歌词的纯文本格式</li>
          <li>• 上传后可预览歌词内容和音频播放</li>
          <li>• 生成 LRC 后可编辑调整时间轴和歌词内容</li>
          <li>• 使用效果测试功能查看歌词同步效果</li>
        </ul>
      </div>

      {/* 歌词预览弹窗 */}
      {showLyricsModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg max-w-4xl w-full max-h-[80vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-600">
              <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200">
                原始歌词内容
              </h3>
              <button
                onClick={() => setShowLyricsModal(false)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="rounded-lg p-4 border border-slate-200 dark:border-slate-600">
                <pre className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {lyricsPreview}
                </pre>
              </div>
            </div>
            <div className="p-4 border-t border-slate-200 dark:border-slate-600 text-center">
              <span className="text-sm text-slate-500">
                共 {lyricsPreview.split('\n').filter(line => line.trim()).length} 行歌词
              </span>
            </div>
          </div>
        </div>
      )}

      {/* LRC预览弹窗 */}
      {showLrcModal && generatedLrc && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg max-w-4xl w-full max-h-[80vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-600">
              <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200">
                LRC 歌词内容
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={downloadLrc}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm"
                >
                  <Download className="h-4 w-4" />
                  下载
                </button>
                <button
                  onClick={() => setShowLrcModal(false)}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="rounded-lg p-4 border border-slate-200 dark:border-slate-600">
                <pre className="text-sm font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {generatedLrc}
                </pre>
              </div>
            </div>
            <div className="p-4 border-t border-slate-200 dark:border-slate-600 text-center">
              <span className="text-sm text-slate-500">
                LRC 格式歌词文件
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 