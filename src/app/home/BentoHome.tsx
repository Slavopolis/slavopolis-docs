import { CalendarIcon, FileTextIcon } from "@radix-ui/react-icons";
import { PackageIcon, Share2Icon } from "lucide-react";

import { BentoCard, BentoGrid } from "@/components/magicui/bento-grid";
import { Marquee } from "@/components/magicui/marquee";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { AnimatedBeamDemo } from "./AnimatedBeamDemo";
import { AnimatedListDemo } from "./AnimatedListDemo";

const files = [
    {
        name: "安装手册.md",
        body: "详细介绍如何在各种操作系统上安装和配置 Slavopolis 文档系统，包括环境要求和常见问题解决方案。",
    },
    {
        name: "MarkDown语法.md",
        body: "全面的 Markdown 语法指南，包括标题、列表、链接、图片、表格、代码块等元素的使用方法和最佳实践。",
    },
    {
        name: "配置手册.md",
        body: "Slavopolis 文档系统的高级配置选项说明，包括主题定制、插件扩展、自定义样式和性能优化等内容。",
    },
    {
        name: "内建组件.md",
        body: "系统预置的各类 UI 组件使用指南，包括按钮、表单、卡片、导航等元素的属性、事件和样式定制方法。",
    },
    {
        name: "搜索引擎.md",
        body: "强大的内置搜索功能使用说明，支持全文检索、语义分析、关键词过滤和高级查询语法，提升文档检索效率。",
    },
];

const features = [
    {
        Icon: FileTextIcon,
        name: "MarkDown 文档高效渲染",
        description: "自动解析渲染 content 下的各类 .md 和 .mdx 文档，只需要专注于创作.",
        href: "#",
        cta: "Learn more",
        className: "col-span-3 lg:col-span-1",
        background: (
            <Marquee
                pauseOnHover
                className="absolute top-10 [--duration:20s] [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)] "
            >
                {files.map((f, idx) => (
                    <figure
                        key={idx}
                        className={cn(
                            "relative w-32 cursor-pointer overflow-hidden rounded-xl border p-4",
                            "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
                            "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]",
                            "transform-gpu blur-[1px] transition-all duration-300 ease-out hover:blur-none",
                        )}
                    >
                        <div className="flex flex-row items-center gap-2">
                            <div className="flex flex-col">
                                <figcaption className="text-sm font-medium dark:text-white ">
                                    {f.name}
                                </figcaption>
                            </div>
                        </div>
                        <blockquote className="mt-2 text-xs">{f.body}</blockquote>
                    </figure>
                ))}
            </Marquee>
        ),
    },
    {
        Icon: PackageIcon,
        name: "百宝箱一站式集成",
        description: "集成各类实用工具，包括 AI 聊天、站点导航、时间轴、JSON 格式化等，提升工作效率。",
        href: "#",
        cta: "Learn more",
        className: "col-span-3 lg:col-span-2",
        background: (
            <AnimatedListDemo className="absolute right-2 top-4 h-[300px] w-full scale-75 border-none transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)] group-hover:scale-90" />
        ),
    },
    {
        Icon: Share2Icon,
        name: "不断集成完善 AI 能力",
        description: "不断集成各类实用工具，提升工作效率，完善 AI 能力。",
        href: "#",
        cta: "Learn more",
        className: "col-span-3 lg:col-span-2",
        background: (
            <AnimatedBeamDemo className="absolute right-2 top-4 h-[300px] border-none transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)] group-hover:scale-105" />
        ),
    },
    {
        Icon: CalendarIcon,
        name: "持续更新",
        description: "持续更新，保持最新状态。",
        className: "col-span-3 lg:col-span-1",
        href: "#",
        cta: "Learn more",
        background: (
            <Calendar
                mode="single"
                defaultMonth={new Date(2025, 4)}
                selected={new Date(2025, 4, 10)}
                className="absolute right-0 top-10 origin-top scale-75 rounded-md border shadow-md bg-white dark:bg-gray-900 transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)] group-hover:scale-90"
            />
        ),
    },
];

export function BentoHome() {
    return (
        <BentoGrid className="mb-12">
            {features.map((feature, idx) => (
                <BentoCard key={idx} {...feature} />
            ))}
        </BentoGrid>
    );
}
