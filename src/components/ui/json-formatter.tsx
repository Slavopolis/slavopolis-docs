"use client";

import { cn } from '@/lib/utils';
import { useCallback, useState } from 'react';
import { Button } from './button';

interface JsonFormatterProps {
  className?: string;
}

interface JsonError {
  line: number;
  column: number;
  message: string;
  position: number;
}

export function JsonFormatter({ className }: JsonFormatterProps) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<JsonError | null>(null);
  const [indentSize, setIndentSize] = useState(2);
  const [showLearningCard, setShowLearningCard] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // JSON格式化逻辑
  const formatJson = useCallback((jsonString: string, indent: number = 2) => {
    try {
      if (!jsonString.trim()) {
        setOutput('');
        setError(null);
        return;
      }

      const parsed = JSON.parse(jsonString);
      const formatted = JSON.stringify(parsed, null, indent);
      setOutput(formatted);
      setError(null);
    } catch (err: any) {
      setOutput('');
      
      // 解析错误位置
      const errorMessage = err.message;
      let line = 1;
      let column = 1;
      let position = 0;

      // 尝试从错误消息中提取位置信息
      const positionMatch = errorMessage.match(/position (\d+)/);
      if (positionMatch) {
        position = parseInt(positionMatch[1]);
        const lines = jsonString.substring(0, position).split('\n');
        line = lines.length;
        const lastLine = lines[lines.length - 1];
        column = lastLine ? lastLine.length + 1 : 1;
      }

      setError({
        line,
        column,
        message: errorMessage,
        position
      });
    }
  }, []);

  // 处理输入变化
  const handleInputChange = useCallback((value: string) => {
    setInput(value);
    formatJson(value, indentSize);
  }, [formatJson, indentSize]);

  // 处理缩进大小变化
  const handleIndentChange = useCallback((size: number) => {
    setIndentSize(size);
    if (input.trim()) {
      formatJson(input, size);
    }
  }, [input, formatJson]);

  // 复制到剪贴板
  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  }, []);

  // 导出JSON文件
  const exportJson = useCallback(() => {
    if (!output) return;
    
    const blob = new Blob([output], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'formatted.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [output]);

  // 压缩JSON
  const compressJson = useCallback(() => {
    if (input.trim()) {
      formatJson(input, 0);
    }
  }, [input, formatJson]);

  // 展开JSON
  const expandJson = useCallback(() => {
    if (input.trim()) {
      formatJson(input, indentSize);
    }
  }, [input, formatJson, indentSize]);

  // 清空内容
  const clearAll = useCallback(() => {
    setInput('');
    setOutput('');
    setError(null);
  }, []);

  // 示例JSON
  const loadExample = useCallback(() => {
    const example = `{
  "name": "张三",
  "age": 30,
  "city": "北京",
  "hobbies": ["阅读", "旅行", "编程"],
  "address": {
    "street": "中关村大街1号",
    "zipCode": "100080"
  },
  "isActive": true,
  "balance": 1234.56
}`;
    setInput(example);
    formatJson(example, indentSize);
  }, [formatJson, indentSize]);

  // 获取行号
  const getLineNumbers = useCallback((text: string) => {
    const lines = text.split('\n');
    return lines.map((_, index) => index + 1);
  }, []);

  // JSON学习卡片内容
  const learningTips = [
    { title: "JSON基础", content: "JSON是一种轻量级的数据交换格式，易于人阅读和编写" },
    { title: "数据类型", content: "支持字符串、数字、布尔值、null、对象和数组" },
    { title: "语法规则", content: "键必须用双引号包围，字符串值也必须用双引号" },
    { title: "常见错误", content: "尾随逗号、单引号、未闭合的括号是常见的语法错误" }
  ];

  return (
    <div className={cn("w-full space-y-6", className)}>
      {/* 工具栏 */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-card rounded-lg border">
        <div className="flex items-center gap-2">
          <Button
            onClick={loadExample}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            加载示例
          </Button>
          <Button
            onClick={clearAll}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            清空
          </Button>
          <Button
            onClick={() => setShowLearningCard(!showLearningCard)}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            JSON学习
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground font-medium">缩进:</label>
            <select
              value={indentSize}
              onChange={(e) => handleIndentChange(Number(e.target.value))}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 min-w-[80px]"
            >
              <option value={0} className="py-2 px-3 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800">压缩</option>
              <option value={2} className="py-2 px-3 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800">2空格</option>
              <option value={4} className="py-2 px-3 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800">4空格</option>
              <option value={8} className="py-2 px-3 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800">8空格</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={compressJson}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              压缩
            </Button>
            <Button
              onClick={expandJson}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              格式化
            </Button>
          </div>
        </div>
      </div>

      {/* JSON学习卡片 */}
      {showLearningCard && (
        <div className="p-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/40 dark:via-indigo-950/40 dark:to-purple-950/40 rounded-xl border border-blue-200/60 dark:border-blue-800/60 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100">JSON 语法学习</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">掌握 JSON 的核心语法和最佳实践</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {learningTips.map((tip, index) => (
              <div 
                key={index} 
                className="group relative p-5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-white/60 dark:border-gray-700/60 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{index + 1}</span>
                </div>
                <div className="pr-10">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2 text-base">{tip.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{tip.content}</p>
                </div>
                
                {/* 底部装饰线 */}
                <div className="absolute bottom-0 left-5 right-5 h-0.5 bg-gradient-to-r from-blue-200 via-indigo-200 to-purple-200 dark:from-blue-800 dark:via-indigo-800 dark:to-purple-800 rounded-full opacity-60 group-hover:opacity-100 transition-opacity"></div>
              </div>
            ))}
          </div>
          
          {/* 关闭按钮 */}
          <div className="flex justify-center mt-6">
            <button
              onClick={() => setShowLearningCard(false)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              收起学习卡片
            </button>
          </div>
        </div>
      )}

      {/* 主要编辑区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 输入区域 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">输入 JSON</h3>
            <span className="text-sm text-muted-foreground">
              {input.length} 字符
            </span>
          </div>
          
          <div className="relative">
            <div className="flex h-[600px]">
              {/* 行号区域 */}
              <div className="flex-shrink-0 w-12 bg-muted/20 border border-r-0 rounded-l-lg overflow-hidden">
                <div className="h-full overflow-y-auto py-4 pl-2 pr-1">
                  <div className="flex flex-col text-xs text-muted-foreground/60 font-mono leading-5">
                    {getLineNumbers(input || '\n').map((num) => (
                      <span key={num} className="block h-5 text-right pr-2">
                        {num}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* 输入框 */}
              <textarea
                value={input}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="在此粘贴或输入您的 JSON 数据..."
                className={cn(
                  "flex-1 h-full p-4 font-mono text-sm border border-l-0 rounded-r-lg resize-none outline-none",
                  "bg-background",
                  error ? "border-red-500 bg-red-50/50 dark:bg-red-950/20" : "border-border"
                )}
                spellCheck={false}
              />
            </div>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div>
                  <h4 className="font-medium text-red-800 dark:text-red-200">JSON 语法错误</h4>
                  <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                    第 {error.line} 行，第 {error.column} 列: {error.message}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 输出区域 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">格式化结果</h3>
            <div className="flex items-center gap-2">
              {output && (
                <>
                  <Button
                    onClick={() => copyToClipboard(output)}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    {copySuccess ? '已复制!' : '复制'}
                  </Button>
                  <Button
                    onClick={exportJson}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    导出
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="relative">
            <div className="flex h-[600px]">
              {/* 行号区域 */}
              {output && (
                <div className="flex-shrink-0 w-12 bg-muted/20 border border-r-0 rounded-l-lg overflow-hidden">
                  <div className="h-full overflow-y-auto py-4 pl-2 pr-1">
                    <div className="flex flex-col text-xs text-muted-foreground/60 font-mono leading-5">
                      {getLineNumbers(output).map((num) => (
                        <span key={num} className="block h-5 text-right pr-2">
                          {num}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {/* 输出框 */}
              <textarea
                value={output}
                readOnly
                placeholder="格式化后的 JSON 将显示在这里..."
                className={cn(
                  "flex-1 h-full p-4 font-mono text-sm border resize-none bg-muted/30 outline-none",
                  output ? "border-l-0 rounded-r-lg" : "rounded-lg"
                )}
                spellCheck={false}
              />
            </div>
          </div>

          {/* 成功提示 */}
          {output && !error && (
            <div className="p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-green-800 dark:text-green-200 font-medium">
                  JSON 格式化成功! 共 {output.split('\n').length} 行
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 