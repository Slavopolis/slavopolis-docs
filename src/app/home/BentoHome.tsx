
import { BentoCard, BentoGrid } from "@/components/magicui/bento-grid";
import { Marquee } from "@/components/magicui/marquee";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { AnimatedBeamDemo } from "./AnimatedBeamDemo";
import { AnimatedListDemo } from "./AnimatedListDemo";

const files = [
    {
        name: "Spring Framework 核心.md",
        body: "深入剖析 Spring Framework 核心特性，包括 IoC 容器、AOP 切面编程、事务管理等企业级开发必备知识点。",
    },
    {
        name: "MySQL 性能优化.md",
        body: "MySQL 数据库性能调优实战指南，涵盖索引优化、查询优化、架构设计等生产环境最佳实践经验分享。",
    },
    {
        name: "JVM 调优实战.md",
        body: "JVM 虚拟机深度调优实战，包括内存管理、垃圾收集器选择、性能监控和问题排查等核心技能。",
    },
    {
        name: "微服务架构设计.md",
        body: "企业级微服务架构设计模式，包括服务拆分、分布式事务、服务治理和高可用架构设计等实践经验。",
    },
    {
        name: "分布式系统实践.md",
        body: "分布式系统核心理论与实践，涵盖 CAP 定理、一致性算法、分布式锁和消息队列等核心技术栈。",
    },
];

const features = [
    {
        Icon: "icon-java",
        name: "Java 生态技术文档",
        description: "深度解析 Java 生态核心技术栈，包括 Spring 全家桶、JVM 调优、分布式系统等企业级开发实战经验分享。",
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
        Icon: "icon-spring",
        name: "SpringBoot 项目框架快速入门",
        description: "SpringBoot、SpringCloud、SpringAI 等现代化框架快速上手指南，助力企业级项目快速开发与部署。",
        href: "#",
        cta: "Learn more",
        className: "col-span-3 lg:col-span-2",
        background: (
            <AnimatedListDemo className="absolute right-2 top-4 h-[300px] w-full scale-75 border-none transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)] group-hover:scale-90" />
        ),
    },
    {
        Icon: "icon-yingyongguanli",
        name: "不断完善日常Java生态技术栈",
        description: "持续更新 Java 生态技术栈内容，涵盖最新框架特性、最佳实践和生产环境解决方案。",
        href: "#",
        cta: "Learn more",
        className: "col-span-3 lg:col-span-2",
        background: (
            <AnimatedBeamDemo className="absolute right-2 top-4 h-[300px] border-none transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)] group-hover:scale-105" />
        ),
    },
    {
        Icon: "icon-icon--date",
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
