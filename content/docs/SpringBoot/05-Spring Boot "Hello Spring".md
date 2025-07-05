# Spring Boot "Hello Spring"

> Spring Boot 的核心价值在于其简化 Java 应用开发的能力，而这种简化最直观的体现就是创建第一个 "Hello World" 应用的便捷性。从传统 Spring 应用需要大量 XML 配置和复杂的项目结构，到 Spring Boot 应用只需几行代码即可启动，这种转变代表了现代 Java 开发范式的重要进步。
>

## 环境准备

### Java 开发环境验证

在开始 Spring Boot 应用开发之前，需要确保本地环境已正确安装 Java 开发工具包。Spring Boot 3.x 系列要求 Java 17 或更高版本作为运行环境。

通过命令行验证 Java 安装状态：（本项目以 JDK21 LTS 为例，该版本提供了长期技术支持和稳定的性能表现）

```bash
lucky$ java -version
openjdk version "21.0.6" 2025-01-21 LTS
OpenJDK Runtime Environment Zulu21.40+17-CA (build 21.0.6+7-LTS)
OpenJDK 64-Bit Server VM Zulu21.40+17-CA (build 21.0.6+7-LTS, mixed mode, sharing)
```

### 构建工具安装配置

Spring Boot 支持 Maven 和 Gradle 两种主流构建工具。Maven 作为 Java 生态系统中最广泛使用的构建工具，提供了成熟的依赖管理和项目构建能力。

本项目以 Maven 进行演示，执行如下命令验证 Maven 安装状态：

```bash
lucky$ mvn -v
Apache Maven 3.9.9 (8e8579a9e76f7d015ee5ec7bfcdc97d260186937)
Maven home: /Users/lucky/develop/env/apache-maven-3.9.9
Java version: 21.0.6, vendor: Azul Systems, Inc., runtime: /Library/Java/JavaVirtualMachines/zulu-21.jdk/Contents/Home
Default locale: zh_CN_#Hans, platform encoding: UTF-8
OS name: "mac os x", version: "15.3.1", arch: "aarch64", family: "mac"
```

> Maven 3.6.3 或更高版本能够完全支持 Spring Boot 3.x 系列的构建需求。建议使用最新的稳定版本以获得最佳的构建性能和功能支持。

## Maven 项目配置与依赖管理

### 核心 POM 配置

Maven 项目的核心配置文件是 `pom.xml`，它定义了项目的基本信息、依赖关系和构建配置。在项目根目录下的 `pom.xml` 文件添加如下配置：（01-boot-hello/pom.xml）

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" 
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.example</groupId>
    <artifactId>spring-boot-hello-world</artifactId>
    <version>1.0.0-SNAPSHOT</version>
    <packaging>jar</packaging>
    
    <name>Spring Boot Hello World Application</name>
    <description>Spring Boot 快速启动示例应用</description>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.5.0</version>
        <relativePath/>
    </parent>

    <properties>
        <java.version>21</java.version>
        <maven.compiler.source>21</maven.compiler.source>
        <maven.compiler.target>21</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <dependencies>
       <!-- Spring Boot Starter Web -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
      
       <!-- Lombok -->
       <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <!-- Maven Compiler Plugin -->
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

上述基础配置中我们主要进行了如下几项关键配置：

1. 项目继承了 spring-boot-starter-parent 自动获得了 Spring Boot 的标准配置，包括依赖版本管理、插件配置和构建优化；
2. 引入了 Web 开发的关键 Spring Boot Starter，Spring Boot Starter Web 内部包含了 Web 开发所需的各种依赖支撑；
3. Lombok 在这里为非必需项，该以来是 Spring Boot 开发的常用工具依赖，主要用于简化一些场景下的代码开发；
4. 定义了 Maven 插件配置，包括编译器插件、资源插件和 Spring Boot 专用插件。这些插件的参数都经过优化，能够生成高质量的可执行 JAR 文件。

### 起步依赖分析

`spring-boot-starter-web` 是一个典型的起步依赖，它聚合了构建 Web 应用所需的所有核心组件。

通过依赖树分析可以查看具体包含的组件：

```bash
$ mvn dependency:tree
```

这个命令会显示完整的依赖关系树，包括 Spring MVC、嵌入式 Tomcat 服务器、Jackson JSON 处理库等关键组件。起步依赖的设计理念是按功能领域组织依赖，简化了开发者的选择过程。

当然，你也可以直接使用 IDEA 快速查看：

![image-20250608191950331](https://bxsb-dev.oss-cn-shanghai.aliyuncs.com/image-20250608191950331.png)

## 应用代码实现

### 源代码目录结构

按照 Maven 标准约定，Java 源代码应放置在 `src/main/java` 目录下。这种标准化的目录结构不仅符合 Maven 约定，也便于团队协作和项目维护。

完整的目录结构如下：

![](/Users/lucky/Library/Application Support/typora-user-images/image-20250618203150317.png)

### 主应用类实现

在 `club.slavopolis.hello.HelloWorldApplication.java` 文件中创建应用主类：

```java
package club.slavopolis.boot.hello;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * SpringBoot 服务启动入口
 *
 * @author slavopolis
 * @version 1.0.0
 * @since 2025/6/18
 * <p>
 * Copyright (c) 2025 slavopolis-boot-hub
 * All rights reserved.
 */
@RestController
@SpringBootApplication
public class HelloWorldApplication {

    public static void main(String[] args) {
        SpringApplication.run(HelloWorldApplication.class, args);
    }

    @GetMapping("/hello")
    public String hello() {
        return "Hello World! 欢迎使用 Spring Boot 3.5.0！";
    }
}
```

### 注解功能解析

#### @SpringBootApplication

`@SpringBootApplication` 是一个组合注解，它内部包含了三个重要的功能注解：

1. `@SpringBootConfiguration` ：标识这是一个配置类
2. `@EnableAutoConfiguration` ：启用自动配置机制
3. `@ComponentScan` ：启用组件扫描

> `@EnableAutoConfiguration` 注解触发了 Spring Boot 的核心特性——自动配置。基于类路径中的依赖，Spring Boot 会自动配置相应的功能组件。例如，当检测到 `spring-boot-starter-web` 依赖时，自动配置会启用嵌入式 Tomcat 服务器、Spring MVC 框架和 JSON 消息转换器。这种智能配置机制大大减少了手动配置的工作量。

该注解源码如下：

```java
@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Inherited
@SpringBootConfiguration // 标识这是一个配置类
@EnableAutoConfiguration // 启用自动配置机制
@ComponentScan( // 启用组件扫描
    excludeFilters = {@Filter(
    type = FilterType.CUSTOM,
    classes = {TypeExcludeFilter.class}
), @Filter(
    type = FilterType.CUSTOM,
    classes = {AutoConfigurationExcludeFilter.class}
)}
)
public @interface SpringBootApplication {...}
```

#### @RestController

`@RestController` 注解表明这个类是一个 REST 控制器，Spring 会将方法的返回值直接序列化为 HTTP 响应体。这种设计简化了 RESTful API 的开发过程。

该注解源码如下：

```java
@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Controller // 内部包含 @Controller
@ResponseBody // HTTP 响应体
public @interface RestController {
    @AliasFor(
        annotation = Controller.class
    )
    String value() default "";
}
```

#### @GetMapping

`@GetMapping` 注解用于映射 HTTP GET 请求到特定的处理方法（这里映射到了 `hello()` 方法）。路径参数（"/hello"）定义了请求的 URL 模式，Spring MVC 会自动处理请求路由和参数绑定。

```java
@Target({ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@RequestMapping(
    method = {RequestMethod.GET} // 映射 HTTP GET 请求
)
public @interface GetMapping {...}
```

## 应用运行与测试

### 开发模式运行

Spring Boot 提供了便捷的开发模式运行方式。通过 Maven 插件可以直接启动应用：

```bash
$ mvn spring-boot:run
```

启动过程中会显示 Spring Boot 的标志性启动日志，包括框架版本信息、自动配置报告和服务器启动信息。成功启动后，应用会监听默认的 8080 端口。

![](https://bxsb-dev.oss-cn-shanghai.aliyuncs.com/image-20250618204028566.png)

### 功能验证测试

通过浏览器或命令行工具验证应用功能：

```bash
$ curl http://localhost:8080/hello
Hello World! 欢迎使用 Spring Boot 3.5.0！
```

### 应用停止操作

在开发模式下，可以通过 `Ctrl+C` 组合键优雅地停止应用。Spring Boot 会执行必要的清理操作，确保资源的正确释放。

```java
2025-06-18T20:41:38.831+08:00  INFO 2965 --- [tomcat-shutdown] o.s.b.w.e.tomcat.GracefulShutdown        : Graceful shutdown complete
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time:  01:52 min
[INFO] Finished at: 2025-06-18T20:41:39+08:00
[INFO] ------------------------------------------------------------------------
```

## 开发工具集成

### IDE 支持配置

现代化的集成开发环境对 Spring Boot 提供了全面的支持。IntelliJ IDEA 和 Eclipse 都能识别 Spring Boot 项目结构，提供智能代码提示、自动配置分析和运行时调试功能。建议在 IDE 中安装 Spring Boot 相关插件，这些插件能够提供配置文件的智能提示、应用健康状态监控和热重载支持等高级功能。

默认情况下 IDEA 已经捆绑了相关插件，无需特意安装：

![](https://bxsb-dev.oss-cn-shanghai.aliyuncs.com/image-20250608193804077.png)

### 开发工具增强

在开发阶段，可以添加 Spring Boot DevTools 依赖来获得更好的开发体验：

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-devtools</artifactId>
    <scope>runtime</scope>
    <optional>true</optional>
</dependency>
```

DevTools 提供了自动重启、实时重载和远程调试等功能，能够显著提升开发效率。
