'use client';

import { cn } from '@/lib/utils';
import { Check, Copy, ExternalLink } from 'lucide-react';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import Link from 'next/link';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeKatex from 'rehype-katex';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkToc from 'remark-toc';

// KaTeX CSS (需要在全局样式中引入)
import 'katex/dist/katex.min.css';

// 创建列表上下文
const ListContext = createContext<'ul' | 'ol' | null>(null);

interface MarkdownRendererProps {
    content: string;
    className?: string;
}

interface CodeBlockProps {
    children?: React.ReactNode;
    className?: string;
    inline?: boolean;
}

// Mermaid 图表组件
function MermaidChart({ chart }: { chart: string }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const { theme } = useTheme();
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [error, setError] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    // 确保组件完全挂载后再开始渲染
    useEffect(() => {
        setMounted(true);
    }, []);

    // 渲染图表的函数
    const renderChart = useCallback(async () => {
        if (!mounted || !containerRef.current || !chart?.trim()) {
            console.log('[Mermaid] 渲染条件不满足', { 
                mounted, 
                hasContainer: !!containerRef.current, 
                hasChart: !!chart?.trim() 
            });
            return;
        }

        console.log('[Mermaid] 开始渲染流程');
        setStatus('loading');
        setError(null);

        try {
            // 等待一个宏任务，确保DOM完全稳定
            await new Promise(resolve => setTimeout(resolve, 100));

            // 再次检查容器是否仍然存在
            if (!containerRef.current) {
                throw new Error('容器在渲染过程中丢失');
            }

            console.log('[Mermaid] 动态导入mermaid');
            const mermaidModule = await import('mermaid');
            const mermaid = mermaidModule.default;

            // 初始化mermaid
            console.log('[Mermaid] 初始化mermaid');
            mermaid.initialize({
                startOnLoad: false,
                theme: theme === 'dark' ? 'dark' : 'default',
                securityLevel: 'loose',
                // 添加图表尺寸配置
                flowchart: {
                    useMaxWidth: true,
                    htmlLabels: true,
                    nodeSpacing: 50,
                    rankSpacing: 50
                },
                sequence: {
                    useMaxWidth: true,
                    width: 600,
                    height: 400,
                    boxMargin: 10,
                    boxTextMargin: 5,
                    noteMargin: 10,
                    messageMargin: 35
                },
                gantt: {
                    useMaxWidth: true,
                    fontSize: 12,
                    sectionFontSize: 24,
                    numberSectionStyles: 4
                },
                pie: {
                    useMaxWidth: true,
                    textPosition: 0.75
                },
                state: {
                    useMaxWidth: true
                },
                class: {
                    useMaxWidth: true
                },
                journey: {
                    useMaxWidth: true
                },
                timeline: {
                    useMaxWidth: true
                },
                // 全局配置
                maxTextSize: 90000,
                maxEdges: 1000,
                fontSize: 14
            });

            // 创建一个临时的div来渲染
            const tempDiv = document.createElement('div');
            tempDiv.style.visibility = 'hidden';
            tempDiv.style.position = 'absolute';
            tempDiv.style.top = '-9999px';
            document.body.appendChild(tempDiv);

            console.log('[Mermaid] 在临时容器中渲染');
            const id = 'mermaid-temp-' + Date.now();
            
            try {
                const renderResult = await mermaid.render(id, chart.trim());
                console.log('[Mermaid] 渲染成功');

                // 确保容器仍然存在
                if (!containerRef.current) {
                    throw new Error('目标容器已丢失');
                }

                // 清空容器并插入新内容
                containerRef.current.innerHTML = renderResult.svg;
                
                // 优化SVG样式和尺寸
                const svgElement = containerRef.current.querySelector('svg');
                if (svgElement) {
                    // 基础样式
                    svgElement.style.maxWidth = '100%';
                    svgElement.style.height = 'auto';
                    svgElement.style.display = 'block';
                    svgElement.style.margin = '0 auto';
                    
                    // 根据图表类型设置合理的尺寸
                    const chartLines = chart.trim().split('\n');
                    const chartType = chartLines.length > 0 ? chartLines[0]?.toLowerCase() || '' : '';
                    
                    if (chartType.includes('graph') || chartType.includes('flowchart')) {
                        // 流程图
                        svgElement.style.maxWidth = '800px';
                        svgElement.style.maxHeight = '500px';
                    } else if (chartType.includes('sequencediagram')) {
                        // 序列图
                        svgElement.style.maxWidth = '700px';
                        svgElement.style.maxHeight = '400px';
                    } else if (chartType.includes('gantt')) {
                        // 甘特图
                        svgElement.style.maxWidth = '900px';
                        svgElement.style.maxHeight = '400px';
                    } else if (chartType.includes('pie')) {
                        // 饼图
                        svgElement.style.maxWidth = '400px';
                        svgElement.style.maxHeight = '400px';
                    } else if (chartType.includes('statediagram') || chartType.includes('state')) {
                        // 状态图
                        svgElement.style.maxWidth = '600px';
                        svgElement.style.maxHeight = '450px';
                    } else if (chartType.includes('classdiagram') || chartType.includes('class')) {
                        // 类图
                        svgElement.style.maxWidth = '700px';
                        svgElement.style.maxHeight = '500px';
                    } else if (chartType.includes('journey')) {
                        // 用户旅程图
                        svgElement.style.maxWidth = '800px';
                        svgElement.style.maxHeight = '350px';
                    } else if (chartType.includes('timeline')) {
                        // 时间轴图
                        svgElement.style.maxWidth = '750px';
                        svgElement.style.maxHeight = '400px';
                    } else {
                        // 默认尺寸
                        svgElement.style.maxWidth = '700px';
                        svgElement.style.maxHeight = '500px';
                    }
                    
                    // 移除可能的固定尺寸属性
                    svgElement.removeAttribute('width');
                    svgElement.removeAttribute('height');
                    
                    // 确保viewBox存在以保持比例
                    if (!svgElement.getAttribute('viewBox')) {
                        try {
                            const bbox = svgElement.getBBox();
                            if (bbox && bbox.width > 0 && bbox.height > 0) {
                                svgElement.setAttribute('viewBox', `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`);
                            }
                        } catch (e) {
                            // getBBox可能在某些情况下失败，忽略错误
                            console.log('[Mermaid] 无法获取SVG边界框，跳过viewBox设置');
                        }
                    }
                }

                setStatus('success');
                console.log('[Mermaid] 渲染完成');
            } finally {
                // 清理临时div
                document.body.removeChild(tempDiv);
            }

        } catch (err) {
            console.error('[Mermaid] 渲染错误:', err);
            setError(err instanceof Error ? err.message : '未知错误');
            setStatus('error');
        }
    }, [chart, theme, mounted]);

    // 当依赖改变时重新渲染
    useEffect(() => {
        if (mounted) {
            renderChart();
        }
    }, [renderChart]);

    // 如果未挂载，显示占位符
    if (!mounted) {
    return (
            <div className="flex justify-center">
                <div className="max-w-full p-8 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    <div className="flex items-center justify-center gap-3">
                        <div className="w-6 h-6 border-2 border-gray-300 dark:border-gray-600 rounded-full"></div>
                        <span className="text-gray-600 dark:text-gray-400">初始化图表...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex justify-center">
            <div className="mermaid-chart max-w-4xl w-full overflow-auto bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200/60 dark:border-gray-700/60 transition-all duration-300 min-h-[200px]">
                
                {/* 错误状态 */}
                {status === 'error' && (
                    <div className="flex flex-col items-center justify-center h-full">
                        <div className="p-6 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 max-w-full">
                            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                </svg>
                                <span className="font-semibold">图表渲染错误</span>
                            </div>
                            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                            <details className="mt-3">
                                <summary className="text-red-600 dark:text-red-400 text-xs cursor-pointer hover:underline">查看原始代码</summary>
                                <pre className="mt-2 text-xs bg-red-100 dark:bg-red-900/30 p-2 rounded overflow-x-auto">
                                    <code>{chart}</code>
                                </pre>
                            </details>
                            <button 
                                onClick={renderChart}
                                className="mt-3 px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                            >
                                重试
                            </button>
                        </div>
                    </div>
                )}

                {/* 加载状态 */}
                {status === 'loading' && (
                    <div className="flex items-center justify-center h-full">
                        <div className="flex items-center gap-3">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                            <span className="text-gray-600 dark:text-gray-400">正在渲染图表...</span>
                        </div>
                    </div>
                )}

                {/* 图表容器 */}
                <div 
                    ref={containerRef}
                    className={cn(
                        "w-full flex justify-center",
                        status === 'success' ? 'block' : 'hidden'
                    )}
                />

                {/* 初始状态 */}
                {status === 'idle' && (
                    <div className="flex items-center justify-center h-full">
                        <div className="flex items-center gap-3">
                            <div className="w-6 h-6 border-2 border-gray-300 dark:border-gray-600 rounded-full"></div>
                            <span className="text-gray-600 dark:text-gray-400">准备渲染图表...</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function CodeBlock({ children, className, inline, ...props }: CodeBlockProps) {
    const { theme } = useTheme();
    const [copied, setCopied] = useState(false);

    // 移除inline检查，因为所有inline代码现在都在ReactMarkdown组件级别处理
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : '';

    const codeString = String(children).replace(/\n$/, '');

    // 处理 Mermaid 图表
    if (language === 'mermaid') {
        return <MermaidChart chart={codeString} />;
    }

    const copyToClipboard = async () => {
        await navigator.clipboard.writeText(codeString);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

        return (
            <div className="relative group my-2 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 transition-shadow duration-200 max-w-full bg-white dark:bg-gray-900">
            {/* 代码块头部 */}
            <div className="relative flex items-center justify-between px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-750 border-b border-gray-200 dark:border-gray-700">
                {/* 左侧装饰圆点和语言标签 */}
                <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-sm"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm"></div>
                    </div>
                    {/* 语言标签靠左显示 */}
                    {language && (
                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide px-2 py-1 rounded-md">
                            {language}
                        </span>
                    )}
                </div>

                {/* 右侧复制按钮 */}
                <button
                    onClick={copyToClipboard}
                    className="opacity-70 hover:opacity-100 transition-opacity duration-200 p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                    title="复制代码"
                >
                    {copied ? (
                        <Check className="h-4 w-4 text-green-500" />
                    ) : (
                        <Copy className="h-4 w-4" />
                    )}
                </button>
            </div>

            {/* 代码内容 */}
            <div className="overflow-x-auto bg-gray-50/30 dark:bg-gray-900/50">
                <SyntaxHighlighter
                    style={theme === 'dark' ? oneDark : oneLight}
                    language={language}
                    PreTag="div"
                    customStyle={{
                        margin: 0,
                        padding: '1.25rem',
                        background: 'transparent',
                        border: 'none',
                        borderRadius: 0,
                        fontSize: '15px',
                        lineHeight: '1.7',
                        fontFamily: '"JetBrains Mono", "Fira Code", "SF Mono", Monaco, Inconsolata, "Roboto Mono", monospace',
                        whiteSpace: 'pre',
                        wordBreak: 'break-all',
                        overflowWrap: 'break-word',
                        textIndent: '0',
                    }}
                    codeTagProps={{
                        style: {
                            background: 'transparent !important',
                            fontFamily: '"JetBrains Mono", "Fira Code", "SF Mono", Monaco, Inconsolata, "Roboto Mono", monospace',
                            textIndent: '0',
                        },
                    }}
                    lineProps={{
                        style: { 
                            background: 'transparent !important',
                            display: 'block',
                            width: '100%',
                            textIndent: '0',
                            paddingLeft: '0',
                            marginLeft: '0',
                        }
                    }}
                    wrapLines={false}
                    showLineNumbers={false}
                >
                    {codeString}
                </SyntaxHighlighter>
            </div>
        </div>
    );
}

interface CustomImageProps {
    src?: string;
    alt?: string;
    title?: string;
    width?: string | number;
    height?: string | number;
}

function CustomImage({ src, alt, title, ...props }: CustomImageProps) {
    if (!src) return null;

    const isExternal = src.startsWith('http');

    return (
        <span className="my-6 block">
            <span className="relative overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 inline-block max-w-full">
                {isExternal ? (
                    <img
                        src={src}
                        alt={alt || ''}
                        title={title}
                        className="w-full h-auto max-w-full block"
                        loading="lazy"
                        style={{ background: 'transparent' }}
                        {...props}
                    />
                ) : (
                    <Image
                        src={src}
                        alt={alt || ''}
                        title={title}
                        width={800}
                        height={400}
                        className="w-full h-auto max-w-full block"
                        style={{ background: 'transparent' }}
                    />
                )}
            </span>
            {alt && (
                <span className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400 italic block">
                    {alt}
                </span>
            )}
        </span>
    );
}

interface CustomLinkProps {
    href?: string;
    children?: React.ReactNode;
    title?: string;
}

function CustomLink({ href, children, title, ...props }: CustomLinkProps) {
    if (!href) return <span>{children}</span>;

    const isExternal = href.startsWith('http') || href.startsWith('//');
    const isAnchor = href.startsWith('#');

    if (isAnchor) {
        return (
            <a
                href={href}
                title={title}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200 font-medium underline decoration-blue-600/30 dark:decoration-blue-400/30 hover:decoration-blue-600 dark:hover:decoration-blue-400 underline-offset-2"
                {...props}
            >
                {children}
            </a>
        );
    }

    if (isExternal) {
        return (
            <a
                href={href}
                title={title}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200 font-medium underline decoration-blue-600/30 dark:decoration-blue-400/30 hover:decoration-blue-600 dark:hover:decoration-blue-400 underline-offset-2"
                {...props}
            >
                {children}
                <ExternalLink className="h-3 w-3 ml-0.5" />
            </a>
        );
    }

    return (
        <Link
            href={href}
            title={title}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200 font-medium underline decoration-blue-600/30 dark:decoration-blue-400/30 hover:decoration-blue-600 dark:hover:decoration-blue-400 underline-offset-2"
            {...props}
        >
            {children}
        </Link>
    );
}

interface CustomTableProps {
    children?: React.ReactNode;
}

function CustomTable({ children }: CustomTableProps) {
    return (
        <div className="my-8 overflow-hidden rounded-lg">
            <div className="overflow-x-auto max-w-full">
                <table className="w-full border-collapse bg-white dark:bg-gray-900 min-w-full table-auto rounded-lg overflow-hidden">
                    {children}
                </table>
            </div>
        </div>
    );
}

interface CustomBlockquoteProps {
    children?: React.ReactNode;
}

function CustomBlockquote({ children }: CustomBlockquoteProps) {
    return (
        <blockquote className="my-8 relative px-6 py-5 bg-blue-50/70 dark:bg-blue-950/20 rounded-xl shadow-sm">
            {/* 顶部装饰线条 */}
            <div className="absolute -top-0.5 left-6 right-6 h-0.5 bg-gradient-to-r from-blue-400/50 via-blue-300/30 to-transparent rounded-full" />
            <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {children}
            </div>
        </blockquote>
    );
}

interface HeadingProps {
    children?: React.ReactNode;
    id?: string;
    level: 1 | 2 | 3 | 4 | 5 | 6;
}

function CustomHeading({ children, id, level }: HeadingProps) {
    const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;

    const baseClasses = "font-bold tracking-tight text-gray-900 dark:text-white scroll-mt-20 relative";
    const sizeClasses = {
        1: "text-4xl lg:text-5xl mt-12 mb-6 pb-4",
        2: "text-3xl lg:text-4xl mt-10 mb-5 pb-3",
        3: "text-2xl lg:text-3xl mt-8 mb-4",
        4: "text-xl lg:text-2xl mt-6 mb-3",
        5: "text-lg lg:text-xl mt-4 mb-2",
        6: "text-base lg:text-lg mt-4 mb-2",
    };

    return (
        <HeadingTag
            id={id}
            className={cn(baseClasses, sizeClasses[level], "break-words w-full max-w-full overflow-hidden")}
        >
            <span className="break-words overflow-hidden text-ellipsis">{children}</span>
            {id && (
                <a
                    href={`#${id}`}
                    className="inline-block ml-1 opacity-0 hover:opacity-100 transition-opacity duration-200 text-gray-400 dark:text-gray-500 text-sm no-underline"
                    aria-label={`链接到 ${children}`}
                >
                        #
                </a>
            )}
        </HeadingTag>
    );
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
    return (
        <div className={cn("markdown-content max-w-full overflow-hidden break-words", className)}>
            <style jsx global>{`
        /* 全局字体优化 */
        .markdown-content {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          line-height: 1.7;
          color: rgb(55, 65, 81);
          word-wrap: break-word !important;
          overflow-wrap: break-word !important;
          max-width: 100% !important;
          overflow-x: hidden !important;
          container-type: inline-size;
        }
        
        .dark .markdown-content {
          color: rgb(229, 231, 235);
        }
        
        /* 覆盖标题链接样式，确保不受.prose a影响 */
        .markdown-content h1 a, 
        .markdown-content h2 a, 
        .markdown-content h3 a, 
        .markdown-content h4 a, 
        .markdown-content h5 a, 
        .markdown-content h6 a {
          color: inherit !important;
          text-decoration: none !important;
        }
        
        .markdown-content h1 a:hover, 
        .markdown-content h2 a:hover, 
        .markdown-content h3 a:hover, 
        .markdown-content h4 a:hover, 
        .markdown-content h5 a:hover, 
        .markdown-content h6 a:hover {
          color: rgb(37, 99, 235) !important;
          text-decoration: none !important;
        }
        
        .dark .markdown-content h1 a:hover, 
        .dark .markdown-content h2 a:hover, 
        .dark .markdown-content h3 a:hover, 
        .dark .markdown-content h4 a:hover, 
        .dark .markdown-content h5 a:hover, 
        .dark .markdown-content h6 a:hover {
          color: rgb(96, 165, 250) !important;
        }
        
        /* 强制行内代码样式 - 确保不被全局样式覆盖 */
        .markdown-content code:not(pre code) {
          padding: 2px 6px !important;
          margin: 0 2px !important;
          font-size: 0.9em !important;
          font-family: "JetBrains Mono", "Fira Code", "SF Mono", Monaco, Consolas, monospace !important;
          background-color: rgb(243, 244, 246) !important;
          color: rgb(59, 130, 246) !important;
          border-radius: 4px !important;
          font-weight: 600 !important;
          word-break: break-all !important;
          display: inline !important; /* 确保行内显示 */
          white-space: normal !important; /* 允许在行内换行 */
          vertical-align: baseline !important;
          box-decoration-break: clone !important; /* 多行时保持样式 */
          -webkit-box-decoration-break: clone !important;
        }
        
        /* 专门为行内代码添加的类，确保能覆盖全局样式 */
        .markdown-inline-code {
          padding: 2px 6px !important;
          margin: 0 2px !important;
          font-size: 0.9em !important;
          font-family: "JetBrains Mono", "Fira Code", "SF Mono", Monaco, Consolas, monospace !important;
          background-color: rgb(243, 244, 246) !important;
          color: rgb(59, 130, 246) !important;
          border-radius: 4px !important;
          font-weight: 600 !important;
          word-break: break-all !important;
          display: inline !important;
          white-space: normal !important;
          vertical-align: baseline !important;
          box-decoration-break: clone !important;
          -webkit-box-decoration-break: clone !important;
          border: none !important;
        }
        
        .dark .markdown-inline-code {
          background-color: rgb(31, 41, 55) !important;
          color: rgb(96, 165, 250) !important;
        }
        
        .dark .markdown-content code:not(pre code) {
          background-color: rgb(31, 41, 55) !important;
          color: rgb(96, 165, 250) !important;
        }
        
        /* 代码块字体 */
        .markdown-content pre {
          font-family: "JetBrains Mono", "Fira Code", "SF Mono", Monaco, Consolas, monospace !important;
          font-feature-settings: "liga" 1, "calt" 1 !important; /* 启用连字和上下文替换 */
        }
        
        /* 强制移除SyntaxHighlighter的行背景色和其他样式干扰 */
        .markdown-content .group pre,
        .markdown-content .group pre *,
        .markdown-content .group code,
        .markdown-content .group code *,
        .markdown-content .group .token {
          background: transparent !important;
          background-color: transparent !important;
        }
        
        /* 确保代码块行无背景色 */
        .markdown-content .group span[style*="background"] {
          background: transparent !important;
          background-color: transparent !important;
        }
        
        /* 代码块优化样式 */
        .markdown-content .group {
          /* 让 Tailwind 的 shadow-md 生效，不强制覆盖 */
        }
        
        .dark .markdown-content .group {
          /* 暗色模式下仍使用 Tailwind 的阴影 */
        }
        
        /* 代码块悬停效果 */
        .markdown-content .group:hover {
          /* 让 Tailwind 的 hover:shadow-lg 生效 */
        }
        
        /* 确保标题不受代码块样式影响 - 加强样式清除 */
        .markdown-content h1,
        .markdown-content h2,
        .markdown-content h3,
        .markdown-content h4,
        .markdown-content h5,
        .markdown-content h6 {
          box-shadow: none !important;
          border: none !important;
          border-bottom: none !important;
          border-top: none !important;
          border-left: none !important;
          border-right: none !important;
          background: transparent !important;
          backdrop-filter: none !important;
          filter: none !important;
          text-shadow: none !important;
        }
        
        /* 确保标题内的链接也不受影响 */
        .markdown-content h1 a,
        .markdown-content h2 a,
        .markdown-content h3 a,
        .markdown-content h4 a,
        .markdown-content h5 a,
        .markdown-content h6 a {
          box-shadow: none !important;
          border: none !important;
          background: transparent !important;
          backdrop-filter: none !important;
          filter: none !important;
          text-shadow: none !important;
        }
        
        /* 标题字体 */
        .markdown-content h1,
        .markdown-content h2,
        .markdown-content h3,
        .markdown-content h4,
        .markdown-content h5,
        .markdown-content h6 {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
          letter-spacing: -0.025em !important;
          overflow-wrap: break-word !important;
          word-wrap: break-word !important;
          word-break: break-word !important;
          max-width: 100% !important;
          hyphens: auto !important;
        }
        
        /* 特别处理二级标题，防止滚动条 */
        .markdown-content h2 {
          display: block !important;
          width: 100% !important;
          overflow-x: hidden !important;
          text-overflow: ellipsis !important;
          white-space: normal !important; /* 确保文本换行 */
          line-height: 1.3 !important;
        }
        
        /* 确保标题内链接正确显示 */
        .markdown-content h1 a,
        .markdown-content h2 a,
        .markdown-content h3 a,
        .markdown-content h4 a,
        .markdown-content h5 a,
        .markdown-content h6 a {
          display: inline-block !important;
          max-width: 100% !important;
          overflow-wrap: break-word !important;
          word-wrap: break-word !important;
          word-break: break-word !important;
        }
        
        /* 数学公式优化 */
        .katex {
          font-size: 1.1em !important;
          max-width: 100% !important;
          overflow-x: auto !important;
        }
        
        .katex-display {
          margin: 1.5rem 0 !important;
          padding: 1rem !important;
          background: rgb(248, 250, 252) !important;
          border: 1px solid rgb(226, 232, 240) !important;
          border-radius: 0.5rem !important;
          overflow-x: auto !important;
          max-width: 100% !important;
        }
        
        .dark .katex-display {
          background: rgb(15, 23, 42) !important;
          border-color: rgb(51, 65, 85) !important;
        }
        
        /* 移除代码块多余背景 */
        .markdown-content pre,
        .markdown-content pre[class*="language-"] {
          background: transparent !important;
          margin: 0 !important;
          padding: 0 !important;
          max-width: 100% !important;
          overflow-x: auto !important;
          word-wrap: normal !important;
        }
        
        .markdown-content pre code {
          background: transparent !important;
          padding: 0 !important;
          margin: 0 !important;
          color: inherit !important;
        }
        
        /* 图片优化 - 覆盖prose样式 */
        .markdown-content img {
          background: transparent !important;
          max-width: 100% !important;
          height: auto !important;
          margin-top: 0 !important;
          margin-bottom: 0 !important;
        }
        
        /* 强制覆盖prose和prose-lg的图片样式 */
        .prose img, 
        .prose-lg img,
        .prose :where(img):not(:where([class~="not-prose"],[class~="not-prose"] *)),
        .prose-lg :where(img):not(:where([class~="not-prose"],[class~="not-prose"] *)) {
          margin-top: 0 !important;
          margin-bottom: 0 !important;
          margin: 0 !important;
        }
        
        /* 图片容器优化 */
        .markdown-content figure {
          margin: 1.5rem 0 !important;
        }
        
        /* 图片边框hover效果 */
        .markdown-content figure > div:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }
        
        .dark .markdown-content figure > div:hover {
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
        }
        
        /* 表格优化 - 更严格的宽度控制和移除prose边距 */
        .markdown-content table {
          background: transparent !important;
          table-layout: fixed !important;
          width: 100% !important;
          max-width: 100% !important;
          word-wrap: break-word !important;
          border-collapse: collapse !important;
          margin-top: 0 !important;
          margin-bottom: 0 !important;
          margin: 0 !important;
        }
        
        /* 强制覆盖prose和prose-lg的表格样式 */
        .prose table,
        .prose-lg table,
        .prose :where(table):not(:where([class~="not-prose"],[class~="not-prose"] *)),
        .prose-lg :where(table):not(:where([class~="not-prose"],[class~="not-prose"] *)) {
          margin-top: 0 !important;
          margin-bottom: 0 !important;
          margin: 0 !important;
        }
        
        .markdown-content td,
        .markdown-content th {
          word-wrap: break-word !important;
          overflow-wrap: break-word !important;
          max-width: 300px !important;
          padding: 0.75rem !important;
          vertical-align: top !important;
          hyphens: auto !important;
          border-left: none !important;
          border-right: none !important;
        }
        
        /* 表头样式 - 只保留底部边框 */
        .markdown-content th {
          border-bottom: 1px solid rgb(229, 231, 235) !important;
        }
        
        .dark .markdown-content th {
          border-bottom: 1px solid rgb(55, 65, 81) !important;
        }
        
        /* 表格单元格 - 无边框 */
        .markdown-content td {
          border: none !important;
        }
        
        /* 表格容器强制宽度控制 */
        .markdown-content table + div,
        .markdown-content div:has(table) {
          max-width: 100% !important;
          overflow-x: auto !important;
        }
        
        /* 引用块样式优化 - 强制移除所有边框 */
        .markdown-content blockquote {
          border: none !important;
          border-left: none !important;
          border-right: none !important;
          border-top: none !important;
          border-bottom: none !important;
        }
        
        .markdown-content blockquote p {
          margin: 0 !important;
          text-align: left !important;
        }
        
        .markdown-content blockquote p:first-of-type {
          margin-top: 0 !important;
        }
        
        .markdown-content blockquote p:last-of-type {
          margin-bottom: 0 !important;
        }
        
        /* 列表优化 - 简化样式，确保有序列表正确显示 */
        .markdown-content ul,
        .markdown-content ol {
          max-width: 100% !important;
          overflow-wrap: break-word !important;
        }
        
        /* 无序列表 - 移除默认样式 */
        .markdown-content ul {
          list-style: none !important;
          list-style-type: none !important;
          padding-left: 0 !important;
          margin-left: 0 !important;
        }
        
        .markdown-content ul li {
          list-style: none !important;
          list-style-type: none !important;
          padding-left: 0 !important;
          margin-left: 0 !important;
          margin: 0.25rem 0 !important;
        }
        
        /* 有序列表 - 确保数字显示 */
        .markdown-content ol {
          list-style: decimal !important;
          list-style-type: decimal !important;
          padding-left: 1.5rem !important;
          margin-left: 0 !important;
        }
        
        .markdown-content ol li {
          list-style: decimal !important;
          list-style-type: decimal !important;
          list-style-position: outside !important;
          margin: 0.25rem 0 !important;
          padding-left: 0 !important;
          margin-left: 0 !important;
        }
        
        /* 任务列表特殊处理 */
        .markdown-content ul li:has(input[type="checkbox"]),
        .markdown-content ol li:has(input[type="checkbox"]),
        .markdown-content li[data-task-list-item],
        .markdown-content li[data-task-list-item="true"],
        .markdown-content .task-list-item {
          list-style: none !important;
          list-style-type: none !important;
          padding-left: 0 !important;
          margin-left: 0 !important;
        }
        
        /* 覆盖可能的伪元素样式，但不影响有序列表的数字 */
        .markdown-content ul li::before,
        .markdown-content ul li::after {
          content: none !important;
          display: none !important;
        }
        
        /* 任务列表项的特殊处理 */
        .markdown-content li[data-task-list-item]::before,
        .markdown-content li[data-task-list-item]::after {
          content: none !important;
          display: none !important;
        }
        
        /* 段落优化 */
        .markdown-content p {
          text-align: justify;
          hyphens: auto;
          word-wrap: break-word !important;
          overflow-wrap: break-word !important;
          max-width: 100% !important;
        }
        
        /* 强制防止内容溢出 */
        .markdown-content * {
          max-width: 100% !important;
          box-sizing: border-box !important;
          word-wrap: break-word !important;
          overflow-wrap: break-word !important;
        }
        
        /* 强制所有文本元素换行 */
        .markdown-content h1,
        .markdown-content h2,
        .markdown-content h3,
        .markdown-content h4,
        .markdown-content h5,
        .markdown-content h6,
        .markdown-content p,
        .markdown-content span,
        .markdown-content div {
          word-break: break-word !important;
          overflow-wrap: break-word !important;
          hyphens: auto !important;
        }
        
        /* 确保代码块不会溢出 */
        .markdown-content div[class*="language-"],
        .markdown-content .group {
          max-width: 100% !important;
          overflow-x: auto !important;
        }
        
        /* 特殊处理长文本 */
        .markdown-content a {
          word-break: break-all !important;
          overflow-wrap: break-word !important;
        }
        
        /* 确保所有直接子元素都不溢出 */
        .markdown-content > * {
          max-width: 100% !important;
          overflow-x: auto !important;
        }
        
        /* 确保代码块内没有文本缩进 */
        .markdown-content .group pre,
        .markdown-content .group code,
        .markdown-content .group pre div,
        .markdown-content .group pre span,
        .markdown-content .group pre code,
        .markdown-content .group code span,
        .markdown-content .group span {
          text-indent: 0 !important;
          padding-left: 0 !important;
          margin-left: 0 !important;
        }
        
        /* 确保代码块第一行无缩进 */
        .markdown-content .group pre > div > span:first-child,
        .markdown-content .group pre > div > code > span:first-child {
          text-indent: 0 !important;
          padding-left: 0 !important;
          margin-left: 0 !important;
        }
        
        /* Mermaid 图表优化样式 */
        .mermaid-chart {
          --mermaid-font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
        
        .mermaid-chart svg {
          max-width: 100% !important;
          height: auto !important;
          font-family: var(--mermaid-font-family) !important;
          /* 限制图表的最大尺寸 */
          max-height: 600px !important;
        }

        /* 针对不同类型图表的尺寸优化 */
        
        /* 流程图尺寸控制 */
        .mermaid-chart svg[id*="flowchart"],
        .mermaid-chart svg g.graph {
          max-width: 800px !important;
          max-height: 500px !important;
        }
        
        /* 序列图尺寸控制 */
        .mermaid-chart svg[id*="sequence"] {
          max-width: 700px !important;
          max-height: 400px !important;
        }
        
        /* 甘特图尺寸控制 */
        .mermaid-chart svg[id*="gantt"] {
          max-width: 900px !important;
          max-height: 400px !important;
        }
        
        /* 饼图尺寸控制 */
        .mermaid-chart svg[id*="pie"] {
          max-width: 400px !important;
          max-height: 400px !important;
        }
        
        /* 状态图尺寸控制 */
        .mermaid-chart svg[id*="state"] {
          max-width: 600px !important;
          max-height: 450px !important;
        }
        
        /* 类图尺寸控制 */
        .mermaid-chart svg[id*="class"] {
          max-width: 700px !important;
          max-height: 500px !important;
        }
        
        /* 用户旅程图尺寸控制 */
        .mermaid-chart svg[id*="journey"] {
          max-width: 800px !important;
          max-height: 350px !important;
        }
        
        /* 时间轴图尺寸控制 */
        .mermaid-chart svg[id*="timeline"] {
          max-width: 750px !important;
          max-height: 400px !important;
        }
        
        /* 确保图表容器响应式 */
        .mermaid-chart {
          width: 100% !important;
          overflow-x: auto !important;
        }
        
        /* 响应式设计 */
        @media (max-width: 1024px) {
          .mermaid-chart svg {
            max-width: 90vw !important;
          }
          
          .mermaid-chart svg[id*="flowchart"],
          .mermaid-chart svg g.graph {
            max-width: 90vw !important;
            max-height: 450px !important;
          }
          
          .mermaid-chart svg[id*="gantt"] {
            max-width: 90vw !important;
            max-height: 350px !important;
          }
        }
        
        @media (max-width: 768px) {
          .mermaid-chart {
            padding: 1rem !important;
          }
          
          .mermaid-chart svg {
            max-width: 85vw !important;
            min-width: 280px !important;
          }
          
          .mermaid-chart svg[id*="flowchart"],
          .mermaid-chart svg g.graph {
            max-width: 85vw !important;
            max-height: 400px !important;
          }
          
          .mermaid-chart svg[id*="sequence"] {
            max-width: 85vw !important;
            max-height: 350px !important;
          }
          
          .mermaid-chart svg[id*="gantt"] {
            max-width: 85vw !important;
            max-height: 300px !important;
          }
          
          .mermaid-chart svg[id*="pie"] {
            max-width: 320px !important;
            max-height: 320px !important;
          }
        }
        
        @media (max-width: 480px) {
          .mermaid-chart {
            padding: 0.75rem !important;
          }
          
          .mermaid-chart svg {
            max-width: 95vw !important;
            min-width: 250px !important;
          }
          
          .mermaid-chart svg[id*="pie"] {
            max-width: 280px !important;
            max-height: 280px !important;
          }
        }
      `}</style>

            <ReactMarkdown
                remarkPlugins={[
                    remarkGfm,
                    remarkMath,
                    [remarkToc, { heading: '目录|table of contents?|toc', maxDepth: 3, tight: true }]
                ]}
                rehypePlugins={[
                    rehypeSlug,
                    [rehypeAutolinkHeadings, { behavior: 'wrap' }],
                    rehypeKatex
                ]}
                components={{
                    // 代码处理 - 彻底修复行内代码和代码块的区分问题
                    code: ({ node, inline, className, children, ...props }: any) => {
                        // 移除调试日志
                        // console.log('Code component called:', { inline, className, children: String(children) });
                        
                        // 更准确的行内代码判断逻辑
                        // 1. 如果有语言标识符(className)，那肯定是代码块
                        // 2. 如果内容包含换行符，那肯定是代码块
                        // 3. 检查父节点是否为paragraph，如果是则为行内代码
                        const hasLanguageClass = className && className.startsWith('language-');
                        const hasNewlines = String(children).includes('\n');
                        const isInParagraph = node?.type === 'element' && node?.tagName === 'code' && !hasLanguageClass;
                        
                        const isInlineCode = !hasLanguageClass && !hasNewlines && (inline !== false);
                        
                        if (isInlineCode) {
                            return (
                                <code 
                                    className="markdown-inline-code"
                                    {...props}
                                >
                                    {children}
                                </code>
                            );
                        }
                        
                        // 代码块处理
                        return (
                            <CodeBlock 
                                children={children} 
                                className={className || ''} 
                                inline={false} 
                                {...props} 
                            />
                        );
                    },

                    // 标题 - 跳过一级标题
                    h1: () => null,
                    h2: ({ children, id }: any) => <CustomHeading level={2} id={id || ''}>{children}</CustomHeading>,
                    h3: ({ children, id }: any) => <CustomHeading level={3} id={id || ''}>{children}</CustomHeading>,
                    h4: ({ children, id }: any) => <CustomHeading level={4} id={id || ''}>{children}</CustomHeading>,
                    h5: ({ children, id }: any) => <CustomHeading level={5} id={id || ''}>{children}</CustomHeading>,
                    h6: ({ children, id }: any) => <CustomHeading level={6} id={id || ''}>{children}</CustomHeading>,

                    // 链接
                    a: ({ href, children, title, ...props }: any) => (
                        <CustomLink href={href || ''} children={children} title={title} {...props} />
                    ),

                    // 图片
                    img: ({ src, alt, title, ...props }: any) => (
                        <CustomImage src={src || ''} alt={alt} title={title} {...props} />
                    ),

                    // 表格
                    table: CustomTable,
                    thead: ({ children }) => (
                        <thead className="bg-gray-50 dark:bg-gray-800">
                            {children}
                        </thead>
                    ),
                    th: ({ children }) => (
                        <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 text-sm uppercase tracking-wider max-w-[300px] truncate">
                            {children}
                        </th>
                    ),
                    tbody: ({ children }) => (
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {children}
                        </tbody>
                    ),
                    td: ({ children }) => (
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300 border-0 max-w-[300px] break-words">
                            {children}
                        </td>
                    ),
                    tr: ({ children }) => (
                        <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-150">
                            {children}
                        </tr>
                    ),

                    // 引用
                    blockquote: CustomBlockquote,

                    // 列表
                    ul: ({ children }) => (
                        <ListContext.Provider value="ul">
                            <ul className="my-3 space-y-1.5 list-none" style={{ paddingLeft: 0, marginLeft: 0 }}>
                                {children}
                            </ul>
                        </ListContext.Provider>
                    ),
                    ol: ({ children }) => (
                        <ListContext.Provider value="ol">
                            <ol className="my-5 space-y-1.5 list-decimal text-gray-700 dark:text-gray-300" style={{ paddingLeft: '1.5rem' }}>
                                {children}
                            </ol>
                        </ListContext.Provider>
                    ),
                    li: ({ children, checked, ...props }: any) => {
                        const listType = useContext(ListContext);
                        
                        // 检查是否是任务列表项 (有 checked 属性)
                        if (checked !== undefined) {
                            return (
                                <li 
                                    className="text-gray-700 dark:text-gray-300 leading-relaxed flex items-start gap-2" 
                                    style={{ 
                                        listStyle: 'none', 
                                        listStyleType: 'none', 
                                        paddingLeft: 0, 
                                        marginLeft: 0 
                                    }}
                                >
                                    <input 
                                        type="checkbox" 
                                        checked={checked} 
                                        readOnly 
                                        className="mt-1.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span>{children}</span>
                                </li>
                            );
                        }
                        
                        // 使用上下文来判断列表类型
                        if (listType === 'ol') {
                            // 有序列表项 - 保持简单，让浏览器处理数字
                            return (
                                <li className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                    {children}
                                </li>
                            );
                        } else {
                            // 无序列表项 - 简单的圆点设计
                            return (
                                <li 
                                    className="text-gray-700 dark:text-gray-300 leading-relaxed flex items-start" 
                                    style={{ paddingLeft: 0, marginLeft: 0 }}
                                >
                                    <span className="inline-block w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full mr-3 mt-2.5 flex-shrink-0"></span>
                                    <span className="flex-1">{children}</span>
                                </li>
                            );
                        }
                    },

                    // 段落
                    p: ({ children }) => (
                        <p className="my-1 leading-relaxed text-gray-700 dark:text-gray-300 text-base">
                            {children}
                        </p>
                    ),

                    // 分割线
                    hr: () => (
                        <hr className="my-12 border-0 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent" />
                    ),

                    // 强调
                    strong: ({ children }) => (
                        <strong className="font-bold text-gray-900 dark:text-white">
                            {children}
                        </strong>
                    ),
                    em: ({ children }) => (
                        <em className="italic text-gray-800 dark:text-gray-200">
                            {children}
                        </em>
                    ),

                    // 删除线
                    del: ({ children }) => (
                        <del className="line-through text-gray-500 dark:text-gray-400">
                            {children}
                        </del>
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}