import { DocsSidebar } from "@/components/docs/docs-sidebar";
import { MarkdownRenderer } from "@/components/docs/markdown-renderer";
import { TableOfContents } from "@/components/docs/table-of-contents";
import { parseDocsStructure } from "@/lib/docs";
import { getDocBySlug } from "@/lib/docs-content";
import { Metadata } from "next";
import { notFound } from "next/navigation";

interface DocsPageProps {
  params: {
    slug: string[];
  };
}

export async function generateMetadata({ params }: DocsPageProps): Promise<Metadata> {
  const { slug } = params;
  const slugPath = slug.join("/");
  
  try {
    const doc = await getDocBySlug(slugPath);
    
    return {
      title: doc.frontMatter.title,
      description: doc.frontMatter.description || null,
      keywords: doc.frontMatter.tags?.join(", ") || null,
    };
  } catch {
    return {
      title: "文档未找到",
      description: "请求的文档页面不存在",
    };
  }
}

export async function generateStaticParams() {
  try {
    const { getAllDocSlugs } = await import('@/lib/docs-content');
    const slugs = await getAllDocSlugs();
    
    // 构建正确的参数格式
    const params = slugs.map((slug) => {
      const segments = slug.split('/');
      return { slug: segments };
    });
    
    // 调试信息
    console.log(`generateStaticParams 生成了 ${params.length} 个路径参数`);
    
    // 检查特定路径
    const specificPath = "人工智能/规则汇总";
    const hasPath = params.some(param => 
      param.slug.join('/') === specificPath
    );
    console.log(`是否包含路径 "${specificPath}": ${hasPath}`);
    
    // 手动添加可能缺失的中文路径
    const additionalPaths = [
      { slug: ['人工智能', '规则汇总'] },
      { slug: ['建站手册', '站点配置'] },
      { slug: ['开发指南', '主题定制'] },
    ];
    
    // 合并所有路径参数
    const allParams = [...params, ...additionalPaths];
    console.log(`添加额外路径后，总共 ${allParams.length} 个路径参数`);
    
    return allParams;
  } catch (error) {
    console.error('Error generating static params:', error);
    return [{ slug: ['getting-started'] }];
  }
}

export default async function DocsPage({ params }: DocsPageProps) {
  const { slug } = params;
  const slugPath = slug.join("/");
  
  // 解析文档结构
  const docsStructure = await parseDocsStructure();
  
  // 获取文档内容
  let doc;
  try {
    doc = await getDocBySlug(slugPath);
  } catch {
    notFound();
  }

  return (
    <div className="min-h-screen from-slate-50 via-gray-50 to-blue-50 dark:from-slate-900 dark:via-gray-900 dark:to-blue-900">
      {/* 左侧导航栏 */}
      <DocsSidebar items={docsStructure} />

      {/* 右侧主内容区 */}
      <main className="min-h-screen lg:ml-80 transition-all duration-300" id="docs-main-content">
              <div className="p-4 lg:p-6">
          <div className="mx-auto transition-all duration-300 max-w-7xl" id="docs-container">
            <div className="flex gap-8">
              {/* 主要内容区域 */}
              <div className="flex-1 min-w-0 transition-all duration-300 max-w-5xl" id="docs-content">
                <div className="bg-background/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-border/50 overflow-hidden">
                  <div className="px-8 py-8 lg:px-12 lg:py-10">
                    {/* 面包屑导航 */}
                    <nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-8">
                      <a href="/" className="hover:text-foreground transition-colors">Slavopolis</a>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m9 18 6-6-6-6"></path>
                      </svg>
                      <a href="/docs" className="hover:text-foreground transition-colors">Docs</a>
                      {slug.map((segment, index) => (
                        <div key={index} className="flex items-center space-x-1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m9 18 6-6-6-6"></path>
                          </svg>
                          <span className={index === slug.length - 1 ? "text-foreground" : "hover:text-foreground transition-colors"}>
                            {(() => {
                              // 解码URL编码的路径段
                              const decodedSegment = decodeURIComponent(segment);
                              // 首字母大写并替换连字符为空格
                              return decodedSegment.charAt(0).toUpperCase() + decodedSegment.slice(1).replace(/-/g, " ");
                            })()}
                          </span>
                        </div>
                      ))}
                    </nav>

                    {/* 文章头部信息 */}
                    <header className="mb-10">
                      <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-600 dark:from-white dark:via-gray-200 dark:to-gray-400 bg-clip-text text-transparent">
                        {doc.frontMatter.title}
                      </h1>
                      
                      {doc.frontMatter.description && (
                        <p className="text-lg lg:text-xl text-muted-foreground mb-6 leading-relaxed">
                          {doc.frontMatter.description}
                        </p>
                      )}
                      
                      {/* 文章元信息 */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        {doc.frontMatter.author && (
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span>{doc.frontMatter.author}</span>
                          </div>
                        )}
                        
                        {doc.frontMatter.date && (
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>{new Date(doc.frontMatter.date).toLocaleDateString('zh-CN')}</span>
                          </div>
                        )}
                        
                        {doc.readingTime && (
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>预计阅读 {doc.readingTime} 分钟</span>
                          </div>
                        )}
                      </div>
                      
                      {/* 标签 */}
                      {doc.frontMatter.tags && doc.frontMatter.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          {doc.frontMatter.tags.map((tag: string, index: number) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </header>

                    {/* Markdown 内容 */}
                    <article className="prose prose-lg max-w-full">
                      <MarkdownRenderer content={doc.content} />
                    </article>

                    {/* 页面导航 */}
                    <nav className="mt-16 pt-8 border-t border-border/30">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>上次更新:</span>
                          <span>{new Date().toLocaleDateString('zh-CN')}</span>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <button className="inline-flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                            收藏
                          </button>
                          
                          <button className="inline-flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                            </svg>
                            分享
                          </button>
                          
                          <a 
                            href={`https://github.com/slavopolis/slavopolis-docs/edit/main/content/docs/${slugPath}.md`}
                            target="_blank"
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            编辑此页
                          </a>
                        </div>
                      </div>
                    </nav>
                  </div>
                </div>
              </div>

              {/* 右侧目录 */}
              {doc.frontMatter.toc !== false && (
                <div className="hidden xl:block w-56 flex-shrink-0 transition-all duration-300" id="docs-toc">
                  <div className="sticky top-6">
                    <TableOfContents content={doc.content} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 