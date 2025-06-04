'use client';

import { cn } from '@/lib/utils';
import { ChevronDown, Download, Eye, EyeOff, FileText, Pause, Play, Plus, Trash2, Upload, Volume2, VolumeX, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface KeyValuePair {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
  description?: string;
  type?: string;
  file?: File;
}

// 数据类型选项
const DATA_TYPES = [
  { id: 'string', label: 'string', color: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' },
  { id: 'integer', label: 'integer', color: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800' },
  { id: 'number', label: 'number', color: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800' },
  { id: 'boolean', label: 'boolean', color: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800' },
  { id: 'array', label: 'array', color: 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800' },
  { id: 'file', label: 'file', color: 'bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/30 dark:text-pink-400 dark:border-pink-800' },
];

interface KeyValueEditorProps {
  items: KeyValuePair[];
  onChange: (items: KeyValuePair[]) => void;
  placeholder?: {
    key: string;
    value: string;
  };
  suggestions?: {
    keys: string[];
    values: Record<string, string[]>;
  };
  showDescription?: boolean;
  showType?: boolean;
}

// 类型选择器组件
function TypeSelector({ 
  value, 
  onChange, 
  disabled 
}: { 
  value: string; 
  onChange: (type: string) => void; 
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedType = DATA_TYPES.find(type => type.id === value) || DATA_TYPES[0]!;

  const handleSelect = (typeId: string) => {
    onChange(typeId);
    setIsOpen(false);
  };

  // 点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleScroll = () => {
      setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border transition-colors",
          selectedType.color,
          disabled && "opacity-50 cursor-not-allowed",
          !disabled && "hover:opacity-80 cursor-pointer"
        )}
      >
        <span>{selectedType.label}</span>
        {!disabled && <ChevronDown className="w-3 h-3" />}
      </button>

      {isOpen && !disabled && (
        <>
          <div 
            className="fixed inset-0 z-[100]"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-[101] min-w-[100px] py-1">
            {DATA_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => handleSelect(type.id)}
                className={cn(
                  "w-full text-left px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2",
                  value === type.id && "bg-blue-50 dark:bg-blue-900/20"
                )}
              >
                <span className={cn("px-1.5 py-0.5 rounded text-xs font-medium border", type.color)}>
                  {type.label}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
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
    const handleClickOutside = (event: MouseEvent) => {
      if (volumeRef.current && !volumeRef.current.contains(event.target as Node)) {
        setShowVolumeSlider(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMute = () => {
    const event = {
      target: { value: volume > 0 ? '0' : '1' }
    } as React.ChangeEvent<HTMLInputElement>;
    onVolumeChange(event);
  };

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
              className="h-16 w-1 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 vertical-slider"
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

// 键值对编辑器组件
export function KeyValueEditor({
  items,
  onChange,
  placeholder = { key: 'Key', value: 'Value' },
  suggestions,
  showDescription = false,
  showType = false
}: KeyValueEditorProps) {
  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addItem = () => {
    const newItem: KeyValuePair = {
      id: generateId(),
      key: '',
      value: '',
      enabled: true,
      type: showType ? 'string' : undefined,
      description: showDescription ? '' : undefined,
    };
    onChange([...items, newItem]);
  };

  const updateItem = (id: string, updates: Partial<KeyValuePair>) => {
    onChange(items.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const removeItem = (id: string) => {
    onChange(items.filter(item => item.id !== id));
  };

  // 计算列宽
  const getColumnLayout = () => {
    if (showDescription && showType) {
      return {
        checkbox: 'col-span-1',
        key: 'col-span-3',
        value: 'col-span-3',
        type: 'col-span-2',
        description: 'col-span-2',
        action: 'col-span-1'
      };
    } else if (showDescription) {
      return {
        checkbox: 'col-span-1',
        key: 'col-span-4',
        value: 'col-span-4',
        description: 'col-span-2',
        action: 'col-span-1'
      };
    } else if (showType) {
      return {
        checkbox: 'col-span-1',
        key: 'col-span-4',
        value: 'col-span-4',
        type: 'col-span-2',
        action: 'col-span-1'
      };
    } else {
      return {
        checkbox: 'col-span-1',
        key: 'col-span-5',
        value: 'col-span-5',
        action: 'col-span-1'
      };
    }
  };

  const layout = getColumnLayout();

  return (
    <div className="border border-gray-200 dark:border-gray-600 rounded-lg">
      {/* 表头 */}
      <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-600">
        <div className="grid grid-cols-12 gap-3 items-center px-4 py-3">
          <div className={cn(layout.checkbox, "flex justify-center")}>
            <div className="w-4 h-4"></div>
          </div>
          <div className={layout.key}>
            <span className="text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wide">
              {placeholder.key}
            </span>
          </div>
          <div className={layout.value}>
            <span className="text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wide">
              {placeholder.value}
            </span>
          </div>
          {showType && (
            <div className={layout.type}>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                类型
              </span>
            </div>
          )}
          {showDescription && (
            <div className={layout.description}>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                描述
              </span>
            </div>
          )}
          <div className={cn(layout.action, "flex justify-center")}>
            <span className="text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wide">
              操作
            </span>
          </div>
        </div>
      </div>

      {/* 项目列表 */}
      <div className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700 overflow-visible">
        {items.map((item, index) => (
          <div key={item.id} className={cn(
            "group hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors",
            !item.enabled && "bg-gray-50/50 dark:bg-gray-800/50 opacity-60"
          )}>
            <div className="grid grid-cols-12 gap-3 items-center px-4 py-3">
              {/* 启用/禁用开关 */}
              <div className={cn(layout.checkbox, "flex justify-center")}>
                <input
                  type="checkbox"
                  checked={item.enabled}
                  onChange={(e) => updateItem(item.id, { enabled: e.target.checked })}
                  className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
                />
              </div>

              {/* Key 输入框 */}
              <div className={layout.key}>
                <input
                  type="text"
                  value={item.key}
                  onChange={(e) => updateItem(item.id, { key: e.target.value })}
                  placeholder={placeholder.key}
                  className={cn(
                    "w-full px-3 py-2 text-sm bg-transparent border-0 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500",
                    "focus:outline-none focus:ring-0 focus:border-0",
                    !item.enabled && "text-gray-500 dark:text-gray-400"
                  )}
                />
              </div>

              {/* Value 输入框 */}
              <div className={cn(layout.value, "space-y-2")}>
                {item.type === 'file' ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            updateItem(item.id, { value: file.name, file });
                          }
                        }}
                        disabled={!item.enabled}
                        className={cn(
                          "flex-1 text-sm text-gray-900 dark:text-gray-100",
                          "file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium",
                          "file:bg-blue-50 file:text-blue-700 dark:file:bg-blue-900/30 dark:file:text-blue-400",
                          "hover:file:bg-blue-100 dark:hover:file:bg-blue-900/50 file:cursor-pointer cursor-pointer",
                          "focus:outline-none focus:ring-0",
                          !item.enabled && "opacity-50 cursor-not-allowed file:cursor-not-allowed"
                        )}
                      />
                      {item.file && (
                        <button
                          onClick={() => updateItem(item.id, { value: '', file: undefined })}
                          className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                          title="清除文件"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    {item.file && (
                      <FilePreview 
                        file={item.file} 
                        onClose={() => updateItem(item.id, { value: '', file: undefined })}
                      />
                    )}
                  </div>
                ) : (
                  <input
                    type="text"
                    value={item.value}
                    onChange={(e) => updateItem(item.id, { value: e.target.value })}
                    placeholder={placeholder.value}
                    className={cn(
                      "w-full px-3 py-2 text-sm bg-transparent border-0 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500",
                      "focus:outline-none focus:ring-0 focus:border-0",
                      !item.enabled && "text-gray-500 dark:text-gray-400"
                    )}
                  />
                )}
              </div>

              {/* 类型选择器 */}
              {showType && (
                <div className={cn(layout.type, "relative")}>
                  <div className="flex items-center gap-2">
                    <TypeSelector
                      value={item.type || 'string'}
                      onChange={(type) => updateItem(item.id, { type })}
                      disabled={!item.enabled}
                    />
                    <span className="text-xs text-red-500">*</span>
                  </div>
                </div>
              )}

              {/* 描述输入框 */}
              {showDescription && (
                <div className={layout.description}>
                  <input
                    type="text"
                    value={item.description || ''}
                    onChange={(e) => updateItem(item.id, { description: e.target.value })}
                    placeholder="描述"
                    className={cn(
                      "w-full px-3 py-2 text-sm bg-transparent border-0 text-gray-600 dark:text-gray-400 placeholder:text-gray-400 dark:placeholder:text-gray-500",
                      "focus:outline-none focus:ring-0 focus:border-0",
                      !item.enabled && "text-gray-500 dark:text-gray-400"
                    )}
                  />
                </div>
              )}

              {/* 删除按钮 */}
              <div className={cn(layout.action, "flex justify-center")}>
                <button
                  onClick={() => removeItem(item.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-all"
                  title="删除"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* 添加按钮行 */}
        <div className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
          <div className="grid grid-cols-12 gap-3 items-center px-4 py-3">
            <div className="col-span-1"></div>
            <div className="col-span-11">
              <button
                onClick={addItem}
                className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors font-medium"
              >
                <Plus className="w-4 h-4" />
                添加{placeholder.key.toLowerCase()}
              </button>
            </div>
          </div>
        </div>
      </div>

      {items.length === 0 && (
        <div className="px-4 py-12 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800">
          <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <FileText className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-sm font-medium">还没有添加任何{placeholder.key.toLowerCase()}</p>
          <p className="text-xs mt-1 text-gray-400 dark:text-gray-500">点击"添加{placeholder.key.toLowerCase()}"开始配置</p>
        </div>
      )}
    </div>
  );
}

// Body类型选择器
const BODY_TYPES = [
  { id: 'none', label: 'none', description: '无请求体' },
  { id: 'form-data', label: 'form-data', description: '表单数据（支持文件上传）' },
  { id: 'x-www-form-urlencoded', label: 'x-www-form-urlencoded', description: 'URL编码表单' },
  { id: 'json', label: 'JSON', description: 'JSON格式数据' },
  { id: 'xml', label: 'XML', description: 'XML格式数据' },
  { id: 'raw', label: 'Raw', description: '原始文本数据' },
  { id: 'binary', label: 'Binary', description: '二进制文件' },
  { id: 'graphql', label: 'GraphQL', description: 'GraphQL查询' },
];

interface BodyEditorProps {
  type: string;
  content: string;
  formData: KeyValuePair[];
  onChange: (updates: { type?: string; content?: string; formData?: KeyValuePair[] }) => void;
}

export function BodyEditor({ type, content, formData, onChange }: BodyEditorProps) {
  const [showPasswordValues, setShowPasswordValues] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          onChange({ content: result });
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-3">
      {/* Body类型选择器 */}
      <div className="flex items-center gap-2">
        <div className="flex flex-wrap gap-1">
          {BODY_TYPES.map((bodyType) => (
            <button
              key={bodyType.id}
              onClick={() => onChange({ type: bodyType.id })}
              className={cn(
                "px-2.5 py-1 text-xs rounded-md transition-all duration-200 border font-medium",
                type === bodyType.id
                  ? "bg-blue-500 text-white border-blue-500"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500"
              )}
              title={bodyType.description}
            >
              {bodyType.label}
            </button>
          ))}
        </div>
      </div>

      {/* Body内容编辑器 */}
      <div className="space-y-3">
        {type === 'none' && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p className="text-xs">当前请求不包含请求体</p>
          </div>
        )}

        {type === 'form-data' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                表单数据
              </h4>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                支持文件上传，选择文件类型时会显示文件选择器
              </div>
            </div>
            <KeyValueEditor
              items={formData}
              onChange={(items) => onChange({ formData: items })}
              placeholder={{ key: 'Key', value: 'Value' }}
              showDescription={true}
              showType={true}
            />
          </div>
        )}

        {type === 'x-www-form-urlencoded' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                URL编码表单数据
              </h4>
            </div>
            <KeyValueEditor
              items={formData}
              onChange={(items) => onChange({ formData: items })}
              placeholder={{ key: 'Key', value: 'Value' }}
              showDescription={true}
              showType={true}
            />
          </div>
        )}

        {(type === 'json' || type === 'xml' || type === 'raw') && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {type === 'json' ? 'JSON 数据' : type === 'xml' ? 'XML 数据' : '原始数据'}
              </h4>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                >
                  <Upload className="w-3 h-3" />
                  从文件导入
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,.xml,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>
            <textarea
              value={content}
              onChange={(e) => onChange({ content: e.target.value })}
              placeholder={
                type === 'json' 
                  ? '{\n  "key": "value"\n}'
                  : type === 'xml'
                  ? '<?xml version="1.0" encoding="UTF-8"?>\n<root>\n  <element>value</element>\n</root>'
                  : '输入原始数据...'
              }
              className="w-full h-48 px-3 py-2 text-xs font-mono bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
            />
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
              <span>{content.length} 字符</span>
              {type === 'json' && (
                <button
                  onClick={() => {
                    try {
                      const formatted = JSON.stringify(JSON.parse(content), null, 2);
                      onChange({ content: formatted });
                    } catch (e) {
                      // 忽略格式化错误
                    }
                  }}
                  className="hover:text-blue-500 transition-colors"
                >
                  格式化JSON
                </button>
              )}
            </div>
          </div>
        )}

        {type === 'graphql' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                GraphQL 查询
              </h4>
            </div>
            <textarea
              value={content}
              onChange={(e) => onChange({ content: e.target.value })}
              placeholder="query {\n  users {\n    id\n    name\n    email\n  }\n}"
              className="w-full h-48 px-3 py-2 text-xs font-mono bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
            />
          </div>
        )}

        {type === 'binary' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                二进制文件
              </h4>
            </div>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md p-6 text-center">
              <input
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                id="binary-file"
              />
              <label htmlFor="binary-file" className="cursor-pointer">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  点击或拖拽文件到此处上传
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  支持所有文件类型
                </p>
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// 认证配置组件
interface AuthConfig {
  type: string;
  config: Record<string, string>;
}

interface AuthEditorProps {
  auth: AuthConfig;
  onChange: (auth: AuthConfig) => void;
}

export function AuthEditor({ auth, onChange }: AuthEditorProps) {
  const [showPassword, setShowPassword] = useState(false);

  const updateConfig = (key: string, value: string) => {
    onChange({
      ...auth,
      config: { ...auth.config, [key]: value }
    });
  };

  return (
    <div className="space-y-3">
      {auth.type === 'none' && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p className="text-xs">未设置身份验证</p>
        </div>
      )}

      {auth.type === 'basic' && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Basic Authentication
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                用户名
              </label>
              <input
                type="text"
                value={auth.config.username || ''}
                onChange={(e) => updateConfig('username', e.target.value)}
                placeholder="输入用户名"
                className="w-full px-2 py-1.5 text-xs bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                密码
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={auth.config.password || ''}
                  onChange={(e) => updateConfig('password', e.target.value)}
                  placeholder="输入密码"
                  className="w-full px-2 py-1.5 pr-8 text-xs bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {auth.type === 'bearer' && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Bearer Token
          </h4>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Token
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={auth.config.token || ''}
                onChange={(e) => updateConfig('token', e.target.value)}
                placeholder="输入 Bearer Token"
                className="w-full px-2 py-1.5 pr-8 text-xs bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {auth.type === 'api-key' && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            API Key
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Key名称
              </label>
              <input
                type="text"
                value={auth.config.keyName || ''}
                onChange={(e) => updateConfig('keyName', e.target.value)}
                placeholder="例如: X-API-Key"
                className="w-full px-2 py-1.5 text-xs bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                位置
              </label>
              <select
                value={auth.config.location || 'header'}
                onChange={(e) => updateConfig('location', e.target.value)}
                className="w-full px-2 py-1.5 text-xs bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="header">Header</option>
                <option value="query">Query参数</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              API Key值
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={auth.config.keyValue || ''}
                onChange={(e) => updateConfig('keyValue', e.target.value)}
                placeholder="输入API Key"
                className="w-full px-2 py-1.5 pr-8 text-xs bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 文件预览组件
function FilePreview({ 
  file, 
  onClose 
}: { 
  file: File; 
  onClose: () => void;
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

  const getFileType = (file: File) => {
    const type = file.type.toLowerCase();
    if (type.startsWith('image/')) return 'image';
    if (type.startsWith('video/')) return 'video';
    if (type.startsWith('audio/')) return 'audio';
    if (type.includes('text/') || type.includes('json') || type.includes('xml') || 
        file.name.endsWith('.txt') || file.name.endsWith('.md') || 
        file.name.endsWith('.json') || file.name.endsWith('.xml') ||
        file.name.endsWith('.js') || file.name.endsWith('.ts') ||
        file.name.endsWith('.css') || file.name.endsWith('.html')) return 'text';
    if (type.includes('pdf')) return 'pdf';
    return 'unknown';
  };

  const fileType = getFileType(file);
  const fileUrl = URL.createObjectURL(file);

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

  const handlePlayPause = () => {
    const media = audioRef.current || videoRef.current;
    if (media) {
      if (isPlaying) {
        media.pause();
      } else {
        media.play();
      }
      setIsPlaying(!isPlaying);
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

  return (
    <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
      {/* 文件信息头 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-[200px]" title={file.name}>
              {file.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {formatFileSize(file.size)} • {file.type || '未知类型'}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 预览内容 */}
      <div className="space-y-3">
        {fileType === 'image' && (
          <div className="text-center">
            <img
              src={fileUrl}
              alt={file.name}
              className="max-w-full max-h-64 rounded-md shadow-sm border border-gray-200 dark:border-gray-600"
              onLoad={() => URL.revokeObjectURL(fileUrl)}
            />
          </div>
        )}

        {fileType === 'video' && (
          <div className="space-y-2">
            <video
              ref={videoRef}
              src={fileUrl}
              className="w-full max-h-64 rounded-md shadow-sm border border-gray-200 dark:border-gray-600"
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

        {fileType === 'audio' && (
          <div className="space-y-2">
            <audio
              ref={audioRef}
              src={fileUrl}
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
                className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors"
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

        {fileType === 'text' && <TextFilePreview file={file} />}

        {fileType === 'pdf' && (
          <div className="text-center py-6 text-gray-500 dark:text-gray-400">
            <FileText className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">PDF预览功能</p>
            <p className="text-xs mt-1">点击下载查看完整内容</p>
            <a
              href={fileUrl}
              download={file.name}
              className="inline-flex items-center gap-1 mt-2 px-3 py-1 text-xs bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              <Download className="w-3 h-3" />
              下载PDF
            </a>
          </div>
        )}

        {fileType === 'unknown' && (
          <div className="text-center py-6 text-gray-500 dark:text-gray-400">
            <FileText className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">无法预览此文件类型</p>
            <p className="text-xs mt-1">支持图片、视频、音频、文本等常见格式</p>
          </div>
        )}
      </div>
    </div>
  );
}

// 文本文件预览组件
function TextFilePreview({ file }: { file: File }) {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        setContent(result);
      }
      setLoading(false);
    };
    reader.onerror = () => {
      setError('读取文件失败');
      setLoading(false);
    };
    
    // 限制文件大小，避免读取过大文件
    if (file.size > 1024 * 1024) { // 1MB
      setError('文件过大，无法预览（限制1MB）');
      setLoading(false);
      return;
    }
    
    reader.readAsText(file);
  }, [file]);

  if (loading) {
    return (
      <div className="text-center py-6 text-gray-500 dark:text-gray-400">
        <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
        <p className="text-sm">正在读取文件...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-6 text-gray-500 dark:text-gray-400">
        <FileText className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-500 dark:text-gray-400">文件内容预览</span>
        <span className="text-xs text-gray-400">{content.length} 字符</span>
      </div>
      <pre className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded p-3 text-xs text-gray-800 dark:text-gray-200 max-h-48 overflow-auto whitespace-pre-wrap break-words font-mono">
        {content}
      </pre>
    </div>
  );
} 