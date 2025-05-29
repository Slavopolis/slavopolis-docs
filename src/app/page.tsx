import { DocsSidebar } from "@/components/docs/docs-sidebar";
import { MorphingText } from "@/components/magicui/morphing-text";
import { TextAnimate } from "@/components/magicui/text-animate";
import { parseDocsStructure } from "@/lib/docs";
import { Metadata } from "next";
import { BentoHome } from "./home/BentoHome";
import { MacbookScrollDemo } from "./home/MacbookScrollDemo";
import { SafariHome } from "./home/SafariHome";
import { StickyScrollRevealDemo } from "./home/StickyScrollRevealDemo";

export const metadata: Metadata = {
    title: "文档",
    description: "技术文档，分享前端、后端、DevOps 等领域的最新技术和最佳实践",
};

export default async function DocsPage() {
    // 动态解析文档结构
    const docsStructure = await parseDocsStructure();

    return (
        <div className="min-h-screen from-slate-50 via-gray-50 to-blue-50 dark:from-slate-900 dark:via-gray-900 dark:to-blue-900">
            {/* 左侧导航栏 - 动态文档结构 */}
            <DocsSidebar items={docsStructure} />

            {/* 右侧主内容区 - 上浮卡片效果 */}
            <main className="min-h-screen lg:ml-80 transition-all duration-300" id="docs-main-content">
                <div className="p-6 lg:p-8">
                    <div className="max-w-8xl mx-auto" id="docs-container">
                        {/* 主要内容卡片 */}
                        <div className="bg-background/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-border/50 overflow-hidden" id="docs-content">
                            <div className="px-6 py-8 lg:px-10 lg:py-12">
                                {/* 面包屑导航 */}
                                <nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-8">
                                    <a href="#" className="hover:text-foreground transition-colors">Slavopolis</a>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="m9 18 6-6-6-6"></path>
                                    </svg>
                                    <span className="text-foreground">Home</span>
                                </nav>

                                {/* 主标题 */}
                                <div className="mb-12">
                                    <MorphingText texts={["Slavopolis", "Documentation"]}/>
                                    <TextAnimate animation="blurInUp" by="character" duration={5}>
                                        欢迎使用 Slavopolis 静态博客系统文档。这里包含了项目的完整技术文档、安装指南、使用教程和最佳实践。
                                    </TextAnimate>
                                </div>

                                <BentoHome />

                                {/* 快速开始部分 */}
                                <section className="mb-16">
                                    <h2 className="text-3xl font-semibold mb-4 text-foreground">快速开始</h2>
                                    <p className="text-muted-foreground mb-8 text-lg">快速了解平台的核心功能和使用方法。</p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {/* 安装指南 */}
                                        <div className="group relative overflow-hidden rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1">
                                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                            <div className="relative flex items-start space-x-4">
                                                <div className="flex-shrink-0">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-blue-500/25 transition-shadow duration-300">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-white">
                                                            <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                                        </svg>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <h3 className="font-semibold text-lg text-foreground">入门指南</h3>
                                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                                        了解如何快速搭建和配置 Slavopolis 博客系统。
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* 安装手册 */}
                                        <div className="group relative overflow-hidden rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 hover:shadow-xl hover:shadow-green-500/10 transition-all duration-300 hover:-translate-y-1">
                                            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                            <div className="relative flex items-start space-x-4">
                                                <div className="flex-shrink-0">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-green-500/25 transition-shadow duration-300">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-white">
                                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                                            <polyline points="7 10 12 15 17 10"></polyline>
                                                            <line x1="12" x2="12" y1="15" y2="3"></line>
                                                        </svg>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <h3 className="font-semibold text-lg text-foreground">安装手册</h3>
                                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                                        各种开发工具和服务的详细安装配置指南。
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* 建站手册 */}
                                        <div className="group relative overflow-hidden rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 hover:-translate-y-1">
                                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                            <div className="relative flex items-start space-x-4">
                                                <div className="flex-shrink-0">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-purple-500/25 transition-shadow duration-300">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-white">
                                                            <rect x="3" y="3" width="6" height="6" rx="1"></rect>
                                                            <rect x="15" y="3" width="6" height="6" rx="1"></rect>
                                                            <rect x="3" y="15" width="6" height="6" rx="1"></rect>
                                                            <rect x="15" y="15" width="6" height="6" rx="1"></rect>
                                                        </svg>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <h3 className="font-semibold text-lg text-foreground">建站手册</h3>
                                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                                        学习如何使用 Markdown 和 MDX 创建丰富的内容。
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* AI 文档 */}
                                        <div className="group relative overflow-hidden rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 hover:-translate-y-1">
                                            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                            <div className="relative flex items-start space-x-4">
                                                <div className="flex-shrink-0">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-orange-500/25 transition-shadow duration-300">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-white">
                                                            <path d="M9 12l2 2 4-4"></path>
                                                            <path d="M12 2a10 10 0 1 0 10 10"></path>
                                                        </svg>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <h3 className="font-semibold text-lg text-foreground">AI 文档</h3>
                                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                                        了解平台的 AI 功能和智能助手使用指南。
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* 配置指南 */}
                                        <div className="group relative overflow-hidden rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 hover:-translate-y-1">
                                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                            <div className="relative flex items-start space-x-4">
                                                <div className="flex-shrink-0">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-indigo-500/25 transition-shadow duration-300">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-white">
                                                            <circle cx="12" cy="12" r="3"></circle>
                                                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                                                        </svg>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <h3 className="font-semibold text-lg text-foreground">配置指南</h3>
                                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                                        深入了解系统配置选项和自定义设置。
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* 最佳实践 */}
                                        <div className="group relative overflow-hidden rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 hover:shadow-xl hover:shadow-teal-500/10 transition-all duration-300 hover:-translate-y-1">
                                            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                            <div className="relative flex items-start space-x-4">
                                                <div className="flex-shrink-0">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-teal-500/25 transition-shadow duration-300">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-white">
                                                            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
                                                        </svg>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <h3 className="font-semibold text-lg text-foreground">最佳实践</h3>
                                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                                        学习推荐的开发模式和优化技巧。
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                                
                                <MacbookScrollDemo />

                                <SafariHome />

                                <StickyScrollRevealDemo />

                                {/* 需要帮助部分 */}
                                <section className="bg-gradient-to-r from-primary/5 via-primary/10 to-accent/5 rounded-2xl p-8 border border-primary/20">
                                    <h3 className="font-semibold text-2xl mb-4 text-foreground">需要帮助？</h3>
                                    <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
                                        如果您在使用过程中遇到问题，或需要更多帮助和建议，请联系我们的支持团队。我们随时为您提供帮助！
                                    </p>
                                    <div className="flex flex-wrap items-center gap-4 text-sm">
                                        <a className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium" href="/help">
                                            获取帮助
                                        </a>
                                        <a className="inline-flex items-center gap-2 px-4 py-2 border border-border/60 text-muted-foreground hover:text-foreground hover:border-border rounded-lg transition-colors" href="https://github.com/slavopolis/slavopolis-docs" target="_blank">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                                            GitHub 仓库
                                        </a>
                                    </div>
                                </section>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
} 