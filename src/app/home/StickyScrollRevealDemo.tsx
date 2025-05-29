"use client";
import { StickyScroll } from "@/components/ui/sticky-scroll-reveal";

const content = [
    {
        title: "Markdown 智能渲染",
        description:
            "支持完整的Markdown语法和扩展功能，包括代码高亮、数学公式、图表绘制等高级特性。通过MDX技术，可以在文档中直接嵌入交互式React组件，让您的文档不再局限于静态内容，提供更丰富的阅读体验。",
        content: (
            <div className="flex h-full w-full items-center justify-center border">
                <div className="block dark:hidden">
                    <img
                        src="https://bxsb-dev.oss-cn-shanghai.aliyuncs.com/20250526214729913.png"
                        width={350}
                        height={300}
                        className="h-full w-full object-fit"
                        alt="Markdown 智能渲染-亮色模式"
                    />
                </div>
                <div className="hidden dark:block">
                    <img
                        src="https://bxsb-dev.oss-cn-shanghai.aliyuncs.com/20250526220056471.png"
                        width={350}
                        height={300}
                        className="h-full w-full object-fit"
                        alt="Markdown 智能渲染-暗色模式"
                    />
                </div>
            </div>
        ),
    },
    {
        title: "站点导航自定义",
        description:
            "通过简单的配置文件，您可以轻松定制网站的导航结构和菜单布局。系统会自动解析您的内容目录结构，生成对应的导航树，支持多级嵌套目录和自定义排序。无需手动维护导航链接，专注于创作优质内容。",
        content: (
            <div className="flex h-full w-full items-center justify-center border">
                <div className="block dark:hidden">
                    <img
                        src="https://bxsb-dev.oss-cn-shanghai.aliyuncs.com/20250526215036075.png"
                        width={350}
                        height={300}
                        className="h-full w-full object-fit"
                        alt="站点导航自定义-亮色模式"
                    />
                </div>
                <div className="hidden dark:block">
                    <img
                        src="https://bxsb-dev.oss-cn-shanghai.aliyuncs.com/20250526215036075.png"
                        width={350}
                        height={300}
                        className="h-full w-full object-fit"
                        alt="站点导航自定义-暗色模式"
                    />
                </div>
            </div>
        ),
    },
    {
        title: "DeepSeek AI 聊天助手",
        description:
            "集成强大的DeepSeek AI聊天功能，为您的博客访问者提供智能问答服务。AI助手可以理解您的全站内容，回答相关问题，提供上下文相关的建议，甚至可以基于您的文档生成新的内容。让您的静态博客拥有动态交互能力。",
        content: (
            <div className="flex h-full w-full items-center justify-center border">
                <div className="block dark:hidden">
                    <img
                        src="https://bxsb-dev.oss-cn-shanghai.aliyuncs.com/20250526215036075.png"
                        width={350}
                        height={300}
                        className="h-full w-full object-fit"
                        alt="DeepSeek AI 聊天助手-亮色模式"
                    />
                </div>
                <div className="hidden dark:block">
                    <img
                        src="https://bxsb-dev.oss-cn-shanghai.aliyuncs.com/20250526220403460.png"
                        width={350}
                        height={300}
                        className="h-full w-full object-fit"
                        alt="DeepSeek AI 聊天助手-暗色模式"
                    />
                </div>
            </div>
        ),
    },
    {
        title: "集成开发工具箱",
        description:
            "内置丰富的开发工具集合，包括代码格式化、JSON解析器、正则表达式测试、API请求测试等实用功能。这些工具可以直接在您的博客中使用，无需跳转到其他网站，提高开发效率。所有工具均支持浏览器端运行，保障数据安全。",
        content: (
            <div className="flex h-full w-full items-center justify-center border">
                <div className="block dark:hidden">
                    <img
                        src="https://bxsb-dev.oss-cn-shanghai.aliyuncs.com/20250526215036075.png"
                        width={350}
                        height={300}
                        className="h-full w-full object-fit"
                        alt="开发工具箱-亮色模式"
                    />
                </div>
                <div className="hidden dark:block">
                    <img
                        src="https://bxsb-dev.oss-cn-shanghai.aliyuncs.com/20250526215036075.png"
                        width={350}
                        height={300}
                        className="h-full w-full object-fit"
                        alt="开发工具箱-暗色模式"
                    />
                </div>
            </div>
        ),
    },
];

export function StickyScrollRevealDemo() {
    return (
        <div className="w-full py-4">
            <StickyScroll content={content} />
        </div>
    );
}
