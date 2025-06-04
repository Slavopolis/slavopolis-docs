# Spring AI 快速入门

> 在当前快速发展的 AI 技术浪潮中，Java 开发者迫切需要一个既符合 Spring 生态系统特点又能够快速上手的 AI 开发框架。Spring AI 作为 Spring 框架家族的新成员，为企业级 AI 应用开发提供了标准化的解决方案。本文将详细介绍 Spring AI 的环境搭建、项目配置和基础开发流程，帮助开发者快速掌握这一强大工具。
>
> Spring AI 的快速入门过程体现了 Spring 框架一贯的设计理念：约定优于配置、开箱即用的开发体验。通过规范化的项目初始化、依赖管理和配置流程，开发者可以在最短时间内构建出功能完整的 AI 应用原型。

## 系统环境与版本要求

### Spring Boot版本兼容性

Spring AI 当前支持 Spring Boot 3.4.x 版本系列，这确保了与最新 Spring 生态系统的完全兼容性。当 Spring Boot 3.5.x 正式发布时，Spring AI 团队将提供相应的支持更新。这种版本策略体现了 Spring AI 对稳定性和前瞻性的平衡考量。

选择 Spring Boot 3.4.x 作为基础平台具有重要意义。这个版本包含了对 Java 虚拟线程、GraalVM 原生镜像和现代 Java 特性的全面支持，为 AI 应用的高性能运行提供了技术保障。同时，Spring Boot 3.4.x 的安全性、监控能力和云原生特性也为企业级 AI 应用部署提供了坚实基础。

### Java版本要求与性能考量

Spring AI 要求 Java 17 或更高版本，这一要求并非任意选择，而是基于现代 AI 应用的性能和功能需求。Java 17 引入的记录类型、模式匹配和改进的垃圾收集器对于处理大量 AI 数据和复杂对象结构具有显著优势。

在实际项目中，建议使用 Java 21 LTS 版本。该版本提供的虚拟线程功能对于需要处理大量并发 AI 请求的应用场景具有革命性意义，能够显著提升应用的并发处理能力和资源利用效率。'

## 项目初始化与脚手架工具

### Spring Initializr的使用策略

Spring Initializr（start.spring.io）为 Spring AI 项目提供了直观的初始化界面。在创建新项目时，开发者需要重点关注 AI 模型和向量存储的选择，这些选择将直接影响项目的依赖配置和后续开发方向。

> 访问 Spring Initializr 时，建议采用以下配置策略：首先选择 Maven 或 Gradle 作为构建工具，建议企业项目使用 Maven 以获得更好的生态系统支持。项目元数据配置应遵循企业命名规范，包名建议采用 com.company.ai 的格式以体现项目的 AI 特性。

在依赖选择环节，Spring AI 提供了多种 AI 模型选项，包括 OpenAI、Anthropic、Google、Amazon 等主流提供商的集成。向量存储方面可以选择 Redis、PostgreSQL、Chroma 等不同的解决方案。初学者建议先选择 OpenAI 和 Redis 的组合，这种配置提供了良好的学习体验和丰富的文档支持。

> 选择特定的聊天模型依赖需要考虑多个因素：性能要求、成本预算、功能特性和数据隐私要求。OpenAI提供了最丰富的功能和最好的生态系统支持，适合快速原型开发。Anthropic Claude在安全性和长文本处理方面具有优势，适合企业级应用。Google和Amazon的解决方案则更适合已经深度使用这些云平台服务的企业。

1. 访问 https://start.spring.io/
2. 填写基本信息：

![image-20250531234444831](https://bxsb-dev.oss-cn-shanghai.aliyuncs.com/image-20250531234444831.png)

基于上述项目配置，你将得到一个基本的 POM XML 文件：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
	<modelVersion>4.0.0</modelVersion>

	<parent>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-starter-parent</artifactId>
		<version>3.5.0</version>
		<relativePath/> <!-- lookup parent from repository -->
	</parent>

	<groupId>club.slavopolis</groupId>
	<artifactId>boot-ai</artifactId>
	<version>1.0.0-SNAPSHOT</version>

	<name>boot-ai</name>
	<description>AI project for Spring Boot</description>

	<properties>
		<java.version>21</java.version>
		<spring-ai.version>1.0.0</spring-ai.version>
	</properties>

	<dependencies>
		<!-- Spring Boot Web 支持 -->
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-web</artifactId>
		</dependency>

		<!-- Spring AI 向量存储顾问模块，提供向量数据处理支持 -->
		<dependency>
			<groupId>org.springframework.ai</groupId>
			<artifactId>spring-ai-advisors-vector-store</artifactId>
		</dependency>

		<!-- Spring AI OpenAI 模型启动器，集成OpenAI模型服务 -->
		<dependency>
			<groupId>org.springframework.ai</groupId>
			<artifactId>spring-ai-starter-model-openai</artifactId>
		</dependency>

		<!-- Spring AI Redis 向量存储启动器，集成Redis作为向量存储后端 -->
		<dependency>
			<groupId>org.springframework.ai</groupId>
			<artifactId>spring-ai-starter-vector-store-redis</artifactId>
		</dependency>

		<!-- Lombok 依赖，用于简化代码 -->
		<dependency>
			<groupId>org.projectlombok</groupId>
			<artifactId>lombok</artifactId>
			<optional>true</optional>
		</dependency>

		<!-- Spring Boot Test 支持 -->
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-test</artifactId>
			<scope>test</scope>
		</dependency>
	</dependencies>

	<dependencyManagement>
		<!-- Spring AI BOM -->
		<dependencies>
			<dependency>
				<groupId>org.springframework.ai</groupId>
				<artifactId>spring-ai-bom</artifactId>
				<version>${spring-ai.version}</version>
				<type>pom</type>
				<scope>import</scope>
			</dependency>
		</dependencies>
	</dependencyManagement>

	<build>
		<plugins>
			<!-- Lombok 插件 -->
			<plugin>
				<groupId>org.apache.maven.plugins</groupId>
				<artifactId>maven-compiler-plugin</artifactId>
				<configuration>
					<annotationProcessorPaths>
						<path>
							<groupId>org.projectlombok</groupId>
							<artifactId>lombok</artifactId>
						</path>
					</annotationProcessorPaths>
				</configuration>
			</plugin>

			<!-- Spring Boot Maven Plugin -->
			<plugin>
				<groupId>org.springframework.boot</groupId>
				<artifactId>spring-boot-maven-plugin</artifactId>
				<configuration>
					<excludes>
						<exclude>
							<groupId>org.projectlombok</groupId>
							<artifactId>lombok</artifactId>
						</exclude>
					</excludes>
				</configuration>
			</plugin>
		</plugins>
	</build>

</project>
```

### 项目结构的最佳实践

通过 Spring Initializr 生成的项目具有标准的 Spring Boot 结构，但针对 AI 应用的特点，建议采用以下目录组织方式：

```java
src/main/java/com/company/ai/
├── config/           # AI模型和服务配置
├── controller/       # REST API控制器
├── service/          # 业务逻辑服务层
│   ├── chat/         # 聊天服务
│   ├── embedding/    # 嵌入向量服务
│   └── document/     # 文档处理服务
├── model/            # 数据模型和DTO
├── repository/       # 数据访问层
└── util/             # 工具类和辅助功能
```

这种结构设计充分考虑了 AI 应用的特殊性，将不同类型的 AI 功能进行合理分层，便于后续的维护和扩展。

## 依赖管理与版本控制

### Maven仓库配置策略

Spring AI 的版本发布遵循明确的仓库分发策略。从 1.0.0-M6 版本开始，所有正式发布版本都通过 Maven Central 进行分发，这简化了项目配置并提高了依赖获取的可靠性。

对于需要使用快照版本或早期里程碑版本的项目，需要在构建文件中添加特定的快照仓库配置：

```xml
<repositories>
    <repository>
        <id>spring-snapshots</id>
        <name>Spring Snapshots</name>
        <url>https://repo.spring.io/snapshot</url>
        <releases>
            <enabled>false</enabled>
        </releases>
    </repository>
    <repository>
        <name>Central Portal Snapshots</name>
        <id>central-portal-snapshots</id>
        <url>https://central.sonatype.com/repository/maven-snapshots/</url>
        <releases>
            <enabled>false</enabled>
        </releases>
        <snapshots>
            <enabled>true</enabled>
        </snapshots>
    </repository>
</repositories>
```

### 企业环境的仓库配置

在企业环境中，Maven 镜像配置需要特别注意。许多企业使用内部 Maven 仓库作为所有依赖的镜像，这可能导致无法访问 Spring 快照仓库。解决方案是修改镜像配置，排除 Spring 相关仓库：

```xml
<mirror>
    <id>enterprise-mirror</id>
    <mirrorOf>*,!spring-snapshots,!central-portal-snapshots</mirrorOf>
    <url>https://enterprise-repository.company.com/maven</url>
</mirror>
```

这种配置确保了企业内部依赖通过镜像获取，而 Spring AI 的快照版本可以直接从官方仓库下载，避免了依赖获取的问题。

### Spring AI BOM 的重要性

Spring AI Bill of Materials（BOM）是依赖管理的核心工具，它声明了特定 Spring AI 版本推荐使用的所有依赖版本。使用 BOM 可以避免版本冲突问题，确保所有 Spring AI 相关组件的版本兼容性。

```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.springframework.ai</groupId>
            <artifactId>spring-ai-bom</artifactId>
            <version>1.0.0</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```
