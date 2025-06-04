'use client';

import { cn } from '@/lib/utils';
import {
    AlertCircle,
    CheckCircle2,
    ChevronDown,
    Clock,
    Code,
    Copy,
    Download,
    FileText,
    Globe,
    Key,
    Pause,
    Play,
    Send,
    Settings,
    Volume2,
    VolumeX
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AuthEditor, BodyEditor, KeyValueEditor } from './api-tester-components';

// HTTP 方法配置
const HTTP_METHODS = [
  { value: 'GET', color: 'text-green-600 dark:text-green-400' },
  { value: 'POST', color: 'text-blue-600 dark:text-blue-400' },
  { value: 'PUT', color: 'text-orange-600 dark:text-orange-400' },
  { value: 'PATCH', color: 'text-yellow-600 dark:text-yellow-400' },
  { value: 'DELETE', color: 'text-red-600 dark:text-red-400' },
  { value: 'HEAD', color: 'text-purple-600 dark:text-purple-400' },
  { value: 'OPTIONS', color: 'text-indigo-600 dark:text-indigo-400' },
];

// Body 类型配置
const BODY_TYPES = [
  { id: 'none', label: 'none' },
  { id: 'form-data', label: 'form-data' },
  { id: 'x-www-form-urlencoded', label: 'x-www-form-urlencoded' },
  { id: 'json', label: 'json' },
  { id: 'xml', label: 'xml' },
  { id: 'raw', label: 'raw' },
  { id: 'binary', label: 'binary' },
  { id: 'graphql', label: 'GraphQL' },
  { id: 'msgpack', label: 'msgpack' },
];

// 认证方式配置
const AUTH_TYPES = [
  { id: 'none', label: '无认证' },
  { id: 'basic', label: 'Basic Auth' },
  { id: 'bearer', label: 'Bearer Token' },
  { id: 'api-key', label: 'API Key' },
  { id: 'oauth2', label: 'OAuth 2.0' },
  { id: 'custom', label: '自定义' },
];

// 默认Headers
const DEFAULT_HEADERS = [
  { key: 'User-Agent', value: 'Slavopolis-API-Tester/1.0', enabled: true },
  { key: 'Accept', value: '*/*', enabled: true },
  { key: 'Accept-Encoding', value: 'gzip, deflate, br', enabled: true },
  { key: 'Connection', value: 'keep-alive', enabled: true },
];

interface KeyValuePair {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
  description?: string;
}

interface ApiRequest {
  method: string;
  url: string;
  params: KeyValuePair[];
  headers: KeyValuePair[];
  cookies: KeyValuePair[];
  body: {
    type: string;
    content: string;
    formData: KeyValuePair[];
  };
  auth: {
    type: string;
    config: Record<string, string>;
  };
}

interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: string;
  time: number;
  size: number;
  blob?: Blob;
  isStream?: boolean;
}

// 音量控制组件
function VolumeControl({ 
  volume, 
  onVolumeChange, 
  disabled 
}: { 
  volume: number; 
  onVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}) {
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const volumeRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭音量控制器
  useEffect(() => {
    if (!showVolumeSlider) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (volumeRef.current && !volumeRef.current.contains(event.target as Node)) {
        setShowVolumeSlider(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showVolumeSlider]);

  return (
    <div className="relative" ref={volumeRef}>
      <button
        onClick={() => !disabled && setShowVolumeSlider(!showVolumeSlider)}
        disabled={disabled}
        className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {volume === 0 ? (
          <VolumeX className="w-4 h-4" />
        ) : (
          <Volume2 className="w-4 h-4" />
        )}
      </button>

      {showVolumeSlider && !disabled && (
        <div className="absolute bottom-full right-0 mb-2 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
          <div className="flex flex-col items-center gap-2 h-24">
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={onVolumeChange}
              className="h-16 w-1 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              style={{
                writingMode: 'vertical-lr',
                direction: 'rtl',
                background: `linear-gradient(to top, #3B82F6 ${volume * 100}%, #E5E7EB ${volume * 100}%)`
              }}
            />
            <span className="text-xs text-gray-500 dark:text-gray-400 min-w-[2ch] text-center">
              {Math.round(volume * 100)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// 响应数据流预览组件
function ResponseStreamPreview({ 
  response 
}: { 
  response: ApiResponse;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // 确保音频/视频元素初始化后设置音量
  useEffect(() => {
    const media = audioRef.current || videoRef.current;
    if (media) {
      media.volume = volume;
    }
  }, [volume]);

  const getContentType = () => {
    const contentType = response.headers['content-type'] || response.headers['Content-Type'] || '';
    return contentType.toLowerCase();
  };

  const getStreamType = () => {
    const contentType = getContentType();
    if (contentType.includes('image/')) return 'image';
    if (contentType.includes('video/')) return 'video'; 
    if (contentType.includes('audio/')) return 'audio';
    if (contentType.includes('application/pdf')) return 'pdf';
    if (contentType.includes('text/') || contentType.includes('application/json') || contentType.includes('application/xml')) return 'text';
    return 'binary';
  };

  const streamType = getStreamType();
  const contentType = getContentType();
  const blobUrl = response.blob ? URL.createObjectURL(response.blob) : '';

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDownload = () => {
    if (!response.blob) return;
    
    const url = URL.createObjectURL(response.blob);
    const a = document.createElement('a');
    a.href = url;
    
    // 尝试从Content-Disposition获取文件名
    const disposition = response.headers['content-disposition'] || response.headers['Content-Disposition'] || '';
    let filename = 'download';
    
    const filenameMatch = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
    if (filenameMatch && filenameMatch[1]) {
      filename = filenameMatch[1].replace(/['"]/g, '');
    } else {
      // 根据content-type生成默认文件名
      const ext = contentType.split('/')[1]?.split(';')[0] || 'bin';
      filename = `response-${Date.now()}.${ext}`;
    }
    
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePlayPause = () => {
    const media = audioRef.current || videoRef.current;
    if (media) {
      if (isPlaying) {
        media.pause();
        setIsPlaying(false);
      } else {
        // 尝试播放并处理可能的权限错误
        const playPromise = media.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('Media playback started successfully');
              setIsPlaying(true);
            })
            .catch((error) => {
              console.error('Media playback failed:', error);
              setIsPlaying(false);
              // 如果是权限错误，提示用户需要交互
              if (error.name === 'NotAllowedError') {
                alert('媒体播放需要用户交互。请再次点击播放按钮。');
              }
            });
        }
      }
    }
  };

  const handleTimeUpdate = () => {
    const media = audioRef.current || videoRef.current;
    if (media) {
      setCurrentTime(media.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    const media = audioRef.current || videoRef.current;
    if (media) {
      setDuration(media.duration);
      media.volume = volume;
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const media = audioRef.current || videoRef.current;
    if (media) {
      const newTime = parseFloat(e.target.value);
      media.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    const media = audioRef.current || videoRef.current;
    if (media) {
      media.volume = newVolume;
      setVolume(newVolume);
    }
  };

  if (!response.blob || !response.isStream) {
    return null;
  }

  return (
    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
      {/* 数据流信息头 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-500" />
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              数据流预览
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {formatFileSize(response.size)} • {contentType || '未知类型'}
            </p>
          </div>
        </div>
        <button
          onClick={handleDownload}
          className="flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          <Download className="w-3 h-3" />
          下载文件
        </button>
      </div>

      {/* 预览内容 */}
      <div className="space-y-3">
        {streamType === 'image' && (
          <div className="text-center">
            <img
              src={blobUrl}
              alt="Response Image"
              className="max-w-full max-h-96 rounded-md shadow-sm border border-gray-200 dark:border-gray-600"
              onError={() => console.error('Failed to load image')}
            />
          </div>
        )}

        {streamType === 'video' && (
          <div className="space-y-2">
            <video
              ref={videoRef}
              src={blobUrl}
              className="w-full max-h-96 rounded-md shadow-sm border border-gray-200 dark:border-gray-600"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onError={(e) => console.error('Video playback error:', e)}
              preload="metadata"
            />
            <div className="flex items-center gap-3 p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600">
              <button
                onClick={handlePlayPause}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors disabled:opacity-50"
                disabled={!duration}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                disabled={!duration}
                className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <span className="text-xs text-gray-500 dark:text-gray-400 min-w-[60px]">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
              <VolumeControl 
                volume={volume} 
                onVolumeChange={handleVolumeChange} 
                disabled={!duration} 
              />
            </div>
          </div>
        )}

        {streamType === 'audio' && (
          <div className="space-y-2">
            <audio
              ref={audioRef}
              src={blobUrl}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onError={(e) => console.error('Audio playback error:', e)}
              preload="metadata"
              className="hidden"
            />
            <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600">
              <button
                onClick={handlePlayPause}
                className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors disabled:opacity-50"
                disabled={!duration}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <div className="flex-1 space-y-1">
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onChange={handleSeek}
                  disabled={!duration}
                  className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
              <VolumeControl 
                volume={volume} 
                onVolumeChange={handleVolumeChange} 
                disabled={!duration} 
              />
            </div>
          </div>
        )}

        {streamType === 'pdf' && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-sm font-medium">PDF文档</p>
            <p className="text-xs mt-1">点击下载按钮查看PDF内容</p>
          </div>
        )}

        {streamType === 'text' && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500 dark:text-gray-400">文本内容预览</span>
              <span className="text-xs text-gray-400">{response.data.length} 字符</span>
            </div>
            <pre className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded p-3 text-xs text-gray-800 dark:text-gray-200 max-h-64 overflow-auto whitespace-pre-wrap break-words font-mono">
              {response.data}
            </pre>
          </div>
        )}

        {streamType === 'binary' && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-sm font-medium">二进制数据</p>
            <p className="text-xs mt-1">无法预览此类型的数据流，可以下载文件查看</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function ApiTester() {
  // 核心状态
  const [request, setRequest] = useState<ApiRequest>({
    method: 'GET',
    url: '',
    params: [],
    headers: DEFAULT_HEADERS.map((h, index) => ({ ...h, id: `header-${index}` })),
    cookies: [],
    body: {
      type: 'none',
      content: '',
      formData: [],
    },
    auth: {
      type: 'none',
      config: {},
    },
  });

  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('params');
  const [error, setError] = useState<string | null>(null);

  // UI 状态
  const [showMethodDropdown, setShowMethodDropdown] = useState(false);
  const [showAuthDropdown, setShowAuthDropdown] = useState(false);
  const [responseTab, setResponseTab] = useState('body');

  const methodDropdownRef = useRef<HTMLDivElement>(null);
  const authDropdownRef = useRef<HTMLDivElement>(null);

  // 生成唯一ID
  const generateId = () => Math.random().toString(36).substr(2, 9);

  // 发送HTTP请求的函数
  const sendRequest = useCallback(async () => {
    if (!request.url.trim()) {
      setError('请输入API地址');
      return;
    }

    setLoading(true);
    setError(null);
    const startTime = Date.now();

    try {
      // 构建请求URL（包含查询参数）
      const url = new URL(request.url);
      request.params
        .filter(p => p.enabled && p.key && p.value)
        .forEach(p => url.searchParams.append(p.key, p.value));

      // 构建请求头
      const headers = new Headers();
      
      // 添加用户自定义的headers
      request.headers
        .filter(h => h.enabled && h.key)
        .forEach(h => headers.append(h.key, h.value));

      // 根据认证类型添加认证头
      if (request.auth.type === 'basic' && request.auth.config.username) {
        const credentials = btoa(`${request.auth.config.username}:${request.auth.config.password || ''}`);
        headers.append('Authorization', `Basic ${credentials}`);
      } else if (request.auth.type === 'bearer' && request.auth.config.token) {
        headers.append('Authorization', `Bearer ${request.auth.config.token}`);
      } else if (request.auth.type === 'api-key') {
        const { keyName, keyValue, location } = request.auth.config;
        if (keyName && keyValue) {
          if (location === 'header') {
            headers.append(keyName, keyValue);
          } else if (location === 'query') {
            url.searchParams.append(keyName, keyValue);
          }
        }
      }

      // 构建请求体
      let body: string | FormData | undefined;
      if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
        if (request.body.type === 'json') {
          body = request.body.content;
          if (!headers.has('Content-Type')) {
            headers.append('Content-Type', 'application/json');
          }
        } else if (request.body.type === 'xml') {
          body = request.body.content;
          if (!headers.has('Content-Type')) {
            headers.append('Content-Type', 'application/xml');
          }
        } else if (request.body.type === 'raw') {
          body = request.body.content;
          if (!headers.has('Content-Type')) {
            headers.append('Content-Type', 'text/plain');
          }
        } else if (request.body.type === 'x-www-form-urlencoded') {
          const formData = new URLSearchParams();
          request.body.formData
            .filter(item => item.enabled && item.key)
            .forEach(item => formData.append(item.key, item.value));
          body = formData.toString();
          if (!headers.has('Content-Type')) {
            headers.append('Content-Type', 'application/x-www-form-urlencoded');
          }
        } else if (request.body.type === 'form-data') {
          const formData = new FormData();
          request.body.formData
            .filter(item => item.enabled && item.key)
            .forEach(item => formData.append(item.key, item.value));
          body = formData;
          // FormData会自动设置Content-Type，包含boundary
        } else if (request.body.type === 'graphql') {
          body = JSON.stringify({ query: request.body.content });
          if (!headers.has('Content-Type')) {
            headers.append('Content-Type', 'application/json');
          }
        }
      }

      // 添加Cookies
      const cookies = request.cookies
        .filter(c => c.enabled && c.key && c.value)
        .map(c => `${c.key}=${c.value}`)
        .join('; ');
      if (cookies) {
        headers.append('Cookie', cookies);
      }

      // 发送请求
      const response = await fetch(url.toString(), {
        method: request.method,
        headers,
        body,
        mode: 'cors',
      });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // 获取响应头
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      // 检测是否为二进制数据流
      const contentType = response.headers.get('content-type') || '';
      const isStream = contentType.includes('image/') || 
                       contentType.includes('video/') || 
                       contentType.includes('audio/') || 
                       contentType.includes('application/pdf') ||
                       contentType.includes('application/octet-stream') ||
                       contentType.includes('application/') && !contentType.includes('json') && !contentType.includes('xml') && !contentType.includes('text');

      let responseText = '';
      let responseBlob: Blob | undefined;

      if (isStream) {
        // 对于二进制数据，保存为Blob
        responseBlob = await response.blob();
        // 对于某些类型，尝试读取为文本用于显示
        if (contentType.includes('text/') || contentType.includes('application/json') || contentType.includes('application/xml')) {
          responseText = await responseBlob.text();
        } else {
          responseText = `[二进制数据] ${responseBlob.size} 字节`;
        }
      } else {
        // 对于文本数据，正常读取
        responseText = await response.text();
      }

      const responseSize = responseBlob?.size || new Blob([responseText]).size;

      // 设置响应数据
      setResponse({
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        data: responseText,
        time: responseTime,
        size: responseSize,
        blob: responseBlob,
        isStream,
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : '请求失败');
    } finally {
      setLoading(false);
    }
  }, [request]);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (methodDropdownRef.current && !methodDropdownRef.current.contains(event.target as Node)) {
        setShowMethodDropdown(false);
      }
      if (authDropdownRef.current && !authDropdownRef.current.contains(event.target as Node)) {
        setShowAuthDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 格式化响应数据
  const formatResponseData = (data: string, contentType?: string) => {
    try {
      if (contentType?.includes('application/json')) {
        return JSON.stringify(JSON.parse(data), null, 2);
      }
    } catch (e) {
      // 如果不是有效的JSON，返回原始数据
    }
    return data;
  };

  // 复制响应数据
  const copyResponseData = useCallback(() => {
    if (response?.data) {
      navigator.clipboard.writeText(response.data);
      // TODO: 显示复制成功提示
    }
  }, [response?.data]);

  // 下载响应数据
  const downloadResponse = useCallback(() => {
    if (response?.data) {
      const blob = new Blob([response.data], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `api-response-${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }, [response?.data]);

  return (
    <div className="space-y-4">
      {/* 请求配置区域 */}
      <div className="space-y-4">
        {/* 请求行 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            {/* 方法选择器 */}
            <div className="relative" ref={methodDropdownRef}>
              <button
                onClick={() => setShowMethodDropdown(!showMethodDropdown)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md border transition-all duration-200 min-w-[100px] justify-between text-sm font-medium",
                  "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600",
                  "hover:bg-gray-100 dark:hover:bg-gray-600",
                  HTTP_METHODS.find(m => m.value === request.method)?.color || 'text-gray-700 dark:text-gray-300'
                )}
              >
                <span>{request.method}</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {showMethodDropdown && (
                <>
                  <div 
                    className="fixed inset-0 z-40"
                    onClick={() => setShowMethodDropdown(false)}
                  />
                  <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50 min-w-[100px]">
                    {HTTP_METHODS.map((method) => (
                      <button
                        key={method.value}
                        onClick={() => {
                          setRequest(prev => ({ ...prev, method: method.value }));
                          setShowMethodDropdown(false);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 first:rounded-t-md last:rounded-b-md transition-colors",
                          method.color
                        )}
                      >
                        {method.value}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* URL 输入框 */}
            <div className="flex-1">
              <input
                type="text"
                value={request.url}
                onChange={(e) => setRequest(prev => ({ ...prev, url: e.target.value }))}
                placeholder="请输入 API 地址，例如：https://api.example.com/users"
                className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            {/* 发送按钮 */}
            <button
              onClick={sendRequest}
              disabled={!request.url || loading}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md disabled:shadow-none"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  发送中...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  发送
                </>
              )}
            </button>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            </div>
          )}
        </div>

        {/* 请求配置标签页 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-visible">
          {/* 标签页导航 */}
          <div className="border-b border-gray-200 dark:border-gray-700 px-4">
            <nav className="flex space-x-6" aria-label="Tabs">
              {[
                { id: 'params', label: 'Params', icon: Settings },
                { id: 'body', label: 'Body', icon: FileText },
                { id: 'headers', label: 'Headers', icon: Code },
                { id: 'cookies', label: 'Cookies', icon: Globe },
                { id: 'auth', label: 'Auth', icon: Key },
              ].map((tab) => {
                const Icon = tab.icon;
                const getTabCount = () => {
                  switch (tab.id) {
                    case 'params':
                      return request.params.filter(p => p.enabled).length;
                    case 'headers':
                      return request.headers.filter(h => h.enabled).length;
                    case 'cookies':
                      return request.cookies.filter(c => c.enabled).length;
                    default:
                      return 0;
                  }
                };
                const count = getTabCount();

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center gap-2 py-3 text-sm font-medium border-b-2 transition-colors",
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600 dark:text-blue-400"
                        : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                    {count > 0 && (
                      <span className="px-1.5 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* 标签页内容 */}
          <div className="p-4 relative overflow-visible">
            {activeTab === 'params' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">
                    Query 参数
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    这些参数将添加到URL查询字符串中
                  </p>
                </div>
                <KeyValueEditor
                  items={request.params}
                  onChange={(params) => setRequest(prev => ({ ...prev, params }))}
                  placeholder={{ key: '参数名', value: '参数值' }}
                  showDescription={true}
                  showType={true}
                />
              </div>
            )}

            {activeTab === 'body' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">
                    请求体
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {['GET', 'HEAD', 'OPTIONS'].includes(request.method) 
                      ? '当前请求方法通常不包含请求体' 
                      : '选择合适的请求体格式'}
                  </p>
                </div>
                <BodyEditor
                  type={request.body.type}
                  content={request.body.content}
                  formData={request.body.formData}
                  onChange={(updates) => 
                    setRequest(prev => ({ 
                      ...prev, 
                      body: { ...prev.body, ...updates } 
                    }))
                  }
                />
              </div>
            )}

            {activeTab === 'headers' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">
                    请求头
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    自定义HTTP请求头信息
                  </p>
                </div>
                <KeyValueEditor
                  items={request.headers}
                  onChange={(headers) => setRequest(prev => ({ ...prev, headers }))}
                  placeholder={{ key: 'Header名', value: 'Header值' }}
                  showDescription={false}
                />
              </div>
            )}

            {activeTab === 'cookies' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">
                    Cookies
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    随请求发送的Cookie信息
                  </p>
                </div>
                <KeyValueEditor
                  items={request.cookies}
                  onChange={(cookies) => setRequest(prev => ({ ...prev, cookies }))}
                  placeholder={{ key: 'Cookie名', value: 'Cookie值' }}
                />
              </div>
            )}

            {activeTab === 'auth' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">
                    身份验证
                  </h3>
                  <div className="relative" ref={authDropdownRef}>
                    <button
                      onClick={() => setShowAuthDropdown(!showAuthDropdown)}
                      className="flex items-center gap-2 px-3 py-1.5 text-xs bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[120px] cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors justify-between"
                    >
                      <span>{AUTH_TYPES.find(type => type.id === request.auth.type)?.label || '无认证'}</span>
                      <ChevronDown className="w-3 h-3 text-gray-400" />
                    </button>

                    {showAuthDropdown && (
                      <>
                        <div 
                          className="fixed inset-0 z-40"
                          onClick={() => setShowAuthDropdown(false)}
                        />
                        <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50 min-w-[120px] py-1">
                          {AUTH_TYPES.map((type) => (
                            <button
                              key={type.id}
                              onClick={() => {
                                setRequest(prev => ({
                                  ...prev,
                                  auth: { ...prev.auth, type: type.id, config: {} }
                                }));
                                setShowAuthDropdown(false);
                              }}
                              className={cn(
                                "w-full text-left px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors",
                                request.auth.type === type.id 
                                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" 
                                  : "text-gray-700 dark:text-gray-300"
                              )}
                            >
                              {type.label}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <AuthEditor
                  auth={request.auth}
                  onChange={(auth) => setRequest(prev => ({ ...prev, auth }))}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 响应结果区域 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 min-h-[400px]">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <h3 className="font-medium text-gray-900 dark:text-gray-100">
              响应结果
            </h3>
            {response && (
              <div className="flex items-center gap-3 text-sm">
                <span className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium",
                  response.status >= 200 && response.status < 300
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : response.status >= 400
                    ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                )}>
                  {response.status >= 200 && response.status < 300 ? (
                    <CheckCircle2 className="w-3 h-3" />
                  ) : (
                    <AlertCircle className="w-3 h-3" />
                  )}
                  {response.status} {response.statusText}
                </span>
                <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-xs">
                  <Clock className="w-3 h-3" />
                  {response.time}ms
                </span>
                <span className="text-gray-500 dark:text-gray-400 text-xs">
                  {(response.size / 1024).toFixed(2)} KB
                </span>
              </div>
            )}
          </div>
          {response && (
            <div className="flex items-center gap-1">
              <button
                onClick={copyResponseData}
                className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                title="复制响应数据"
              >
                <Copy className="w-3 h-3" />
              </button>
              <button
                onClick={downloadResponse}
                className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                title="下载响应数据"
              >
                <Download className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
        
        <div className="p-4">
          {response ? (
            <div>
              {/* 响应标签页 */}
              <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
                <nav className="flex space-x-6" aria-label="Tabs">
                  {[
                    { id: 'body', label: 'Body', count: response.data ? 1 : 0 },
                    { id: 'headers', label: 'Headers', count: Object.keys(response.headers).length },
                    { id: 'cookies', label: 'Cookies', count: 0 },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setResponseTab(tab.id)}
                      className={cn(
                        "flex items-center gap-2 py-2 text-sm font-medium border-b-2 transition-colors",
                        responseTab === tab.id
                          ? "border-blue-500 text-blue-600 dark:text-blue-400"
                          : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                      )}
                    >
                      {tab.label}
                      {tab.count > 0 && (
                        <span className="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                          {tab.count}
                        </span>
                      )}
                    </button>
                  ))}
                </nav>
              </div>

              {/* 响应内容 */}
              <div>
                {responseTab === 'body' && (
                  <div>
                    {response.data ? (
                      <pre className="bg-gray-50 dark:bg-gray-900 p-3 rounded-md text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words border border-gray-200 dark:border-gray-700 font-mono max-h-96 overflow-auto">
                        {formatResponseData(response.data, response.headers['content-type'])}
                      </pre>
                    ) : (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                        无响应数据
                      </div>
                    )}
                  </div>
                )}
                {responseTab === 'headers' && (
                  <div className="space-y-2 max-h-96 overflow-auto">
                    {Object.entries(response.headers).length > 0 ? (
                      Object.entries(response.headers).map(([key, value]) => (
                        <div key={key} className="flex bg-gray-50 dark:bg-gray-900 rounded-md p-2 border border-gray-200 dark:border-gray-700">
                          <span className="font-medium text-gray-900 dark:text-gray-100 w-32 flex-shrink-0 text-xs">
                            {key}:
                          </span>
                          <span className="text-gray-600 dark:text-gray-400 break-all text-xs">
                            {value}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                        无响应头信息
                      </div>
                    )}
                  </div>
                )}
                {responseTab === 'cookies' && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                    <p>暂无Cookie信息</p>
                    <p className="text-xs mt-1">响应中的Set-Cookie头会显示在Headers标签页中</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center min-h-[300px]">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <Send className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                  等待发送请求
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  配置好请求参数后，点击发送按钮查看响应结果
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 响应数据流预览组件 */}
      {response && (
        <ResponseStreamPreview response={response} />
      )}
    </div>
  );
} 