# Spring Boot Maven 构建

> 在 Java 应用开发中，构建效率直接影响开发团队的生产力和项目交付速度。传统的 Maven 构建过程虽然功能完善，但在大型项目和频繁构建场景下，其性能瓶颈日益凸显。Spring Boot 作为主流的企业级开发框架，对构建工具的性能要求更为严格，特别是在微服务架构和持续集成环境中。
>
> Apache Maven 社区针对这一痛点推出了 maven-mvnd 项目，通过创新的守护进程架构和 GraalVM 技术显著提升了构建性能。同时，Maven Wrapper 技术为项目提供了版本一致性和环境独立性的保障。

## maven-mvnd

### 技术原理

[maven-mvnd](https://github.com/apache/maven-mvnd) 是 Apache Maven 生态系统中的重要创新项目，其设计理念借鉴了 Gradle 的守护进程模式和 Takari 的智能构建技术。该项目的核心目标是在保持完全兼容 Maven 标准的前提下，通过架构优化实现显著的性能提升。

mvnd 的技术架构基于**长驻后台守护进程模式**。与传统 Maven 每次构建都需要启动新的 JVM 进程不同，mvnd 维护一个或多个持续运行的守护进程来处理构建请求。这种设计**消除了 JVM 启动开销，同时充分利用了 JVM 的运行时优化特性**。

守护进程的生命周期管理是 mvnd 的关键技术特性。系统会根据构建负载动态创建和销毁守护进程，确保资源的最优利用。每个守护进程都维护着独立的类加载器缓存和 JIT 编译优化结果，这些缓存在多次构建之间得以保留，显著减少了重复计算的开销。

### 性能优化

mvnd 的性能优势来源于多个层面的技术优化。首先，**JVM 启动成本的消除**是最直观的性能提升。传统 Maven 构建中，每次执行都需要启动新的 JVM 进程，这个过程通常需要几秒钟时间。在频繁构建的开发环境中，这种开销累积效应明显。

**类加载器缓存机制**是另一个重要的性能优化点。Maven 插件的类文件在首次加载后会被缓存在守护进程中，后续构建可以直接使用缓存的类定义，避免了重复的文件读取和类解析操作。这种缓存机制对于使用大量插件的复杂项目特别有效。

**JIT 编译优化**的保留是 mvnd 性能优势的深层技术原因。JVM 的即时编译器会将频繁执行的字节码编译为优化的本地机器码，这个过程在传统 Maven 中每次构建都需要重新进行。mvnd 的守护进程模式使得这些 JIT 优化结果得以在多次构建之间保留，显著提升了执行效率。

**并行构建能力**是 mvnd 的另一个重要特性。系统默认使用多核处理器的并行计算能力，构建线程数量由公式 `Math.max(Runtime.getRuntime().availableProcessors() - 1, 1)` 确定。这种并行策略在多模块项目中能够实现显著的时间节省。

![](https://bxsb-dev.oss-cn-shanghai.aliyuncs.com/103917178-94ee4500-510d-11eb-9abb-f52dae58a544.gif)

### 安装 mvnd

#### 使用 SDKMAN 安装

如果 SDKMAN! 支持您的操作系统，那么：

```bash
sdk install mvnd
```

> 如果您以前使用过手动安装，请确保中的设置 `~/.m2/mvnd.properties` 仍然有效。使用 SDKMAN! 时，`~/.m2/mvnd.properties` 通常根本不需要该文件，因为 `JAVA_HOME` 和  `MVND_HOME` 均由 SDKMAN! 管理。

#### 使用 Homebrew 安装（推荐）

```bash
brew install mvndaemon/homebrew-mvnd/mvnd
```

> 注意：有两个公式：`mvnd` 安装最新的公式和 `mvnd@1` 安装 1.x 行的公式。

#### 使用 MacPorts 安装

```bash
sudo port install mvnd
```

#### 手动安装

* [从https://downloads.apache.org/maven/mvnd/](https://downloads.apache.org/maven/mvnd/) 下载适合您平台的最新 ZIP
* 解压到您选择的目录
* 将目录添加 `bin` 到 `PATH`
* 或者，如果您不想费心设置环境变量，您可以创建 `~/.m2/mvnd.properties` 并设置该属性：`JAVA_HOME`
* 测试 `mvnd` 是否有效：

```bash
$ mvnd --version
Maven Daemon 0.0.11-linux-amd64 (native)
Terminal: org.jline.terminal.impl.PosixSysTerminal with pty org.jline.terminal.impl.jansi.osx.OsXNativePty
Apache Maven 3.6.3 (cecedd343002696d0abb50b32b541b8a6ba2883f)
Maven home: /home/ppalaga/orgs/mvnd/mvnd/daemon/target/maven-distro
Java version: 11.0.1, vendor: AdoptOpenJDK, runtime: /home/data/jvm/adopt-openjdk/jdk-11.0.1+13
Default locale: en_IE, platform encoding: UTF-8
OS name: "linux", version: "5.6.13-200.fc31.x86_64", arch: "amd64", family: "unix"
```

> 如果您使用的是 Windows 系统，并看到一条消息 `VCRUNTIME140.dll was not found`，则需要 `vc_redist.x64.exe` 从 https://support.microsoft.com/en-us/help/2977003/the-latest-supported-visual-c-downloads 安装。更多信息请参阅 [oracle/graal#1762 。](https://github.com/oracle/graal/issues/1762)

如果您使用的是 macOS，则需要在解压存档后从所有文件中删除隔离标志：

```bash
$ xattr -r -d com.apple.quarantine mvnd-xyz-darwin-amd64
```

### 使用方式

`mvnd` 旨在接受与 stock 相同的命令行选项 `mvn`（加上一些附加选项 - 见下文），例如：

```bash
mvnd verify
```

mvnd 具体选项：

* `--status`：列出正在运行的守护进程
* `--stop`：杀死所有正在运行的守护进程
* `mvnd --help`：打印完整的选项列表

## 配置说明

可以通过属性文件提供配置。mvnd 从以下位置读取属性文件：

* `MVND_PROPERTIES_PATH` 使用环境变量或 `mvnd.propertiesPath` 系统变量提供的属性路径
* 本地属性路径位于 `[PROJECT_HOME]/.mvn/mvnd.properties`
* 用户属性路径位于：`[USER_HOME]/.m2/mvnd.properties`
* 系统属性路径位于：`[MVND_HOME]/conf/mvnd.properties`

第一个文件中定义的属性将优先于较低排名的文件中指定的属性。

一些特殊属性不遵循上述机制：

* `mvnd.daemonStorage`：此属性定义 mvnd 存储其文件（注册表和守护进程日志）的位置。此属性只能在命令行中定义为系统属性
* `mvnd.id`：此属性在内部用于标识正在创建的守护进程
* `mvnd.extClasspath`：指定 Maven 扩展类路径的内部选项
* `mvnd.coreExtensionFilePath`：内部选项，指定maven扩展配置文件路径

> 有关可用属性的完整列表，请参阅 [/dist/src/main/distro/conf/mvnd.properties](https://github.com/apache/maven-mvnd/blob/master/dist/src/main/distro/conf/mvnd.properties)。

## Maven Wrapper

### 技术原理

[Maven Wrapper](https://maven.apache.org/wrapper/) 是 Maven 生态系统中解决版本一致性和环境独立性问题的重要工具。其设计理念是**将特定版本的 Maven 运行时与项目代码绑定，确保不同开发环境和构建环境使用相同的 Maven 版本进行构建**。

技术实现上，Maven Wrapper 通过一组脚本文件和配置实现自动化的 Maven 下载和管理。当开发者首次运行 mvnw 脚本时，系统会自动下载指定版本的 Maven 到本地缓存目录，后续构建直接使用缓存的 Maven 实例。这种设计消除了手动安装和配置 Maven 的复杂性。

版本控制集成是 Maven Wrapper 的重要特性。mvnw 脚本和相关配置文件可以提交到版本控制系统中，确保团队成员和 CI 环境使用完全一致的构建工具版本。这种一致性对于企业级项目的质量保障具有重要意义。

### Spring Boot 集成

Spring Boot 官方强烈推荐使用 Maven Wrapper，Spring Initializr 生成的项目默认包含完整的 Wrapper 配置。这种默认配置体现了 Spring Boot 团队对构建一致性的重视，也为开发团队提供了开箱即用的最佳实践。

![image-20250608200110277](https://bxsb-dev.oss-cn-shanghai.aliyuncs.com/image-20250608200110277.png)

在 Spring Boot 项目中，Maven Wrapper 的配置包含几个关键文件。`mvnw` 和 `mvnw.cmd` 脚本分别适用于类 Unix 系统和 Windows 系统，提供了跨平台的一致性支持。`.mvn/wrapper` 目录包含了 Maven 的具体版本配置和下载地址信息。

```properties
wrapperVersion=3.3.2
distributionType=only-script
distributionUrl=https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/3.9.9/apache-maven-3.9.9-bin.zip
```

版本升级策略是使用 Maven Wrapper 的重要考虑因素。当需要升级 Maven 版本时，只需要修改 `maven-wrapper.properties` 文件中的版本配置即可。这种方式确保了版本升级的可控性和可回滚性，降低了升级风险。

![image-20250608200230761](https://bxsb-dev.oss-cn-shanghai.aliyuncs.com/image-20250608200230761.png)

### 相关命令

```bash
# 安装依赖（MacOS）
./mvnw clean install

# 或者在 Windows 上
mvnw.cmd clean install
```

### IDEA 配置

在 IDEA 中的 Maven 配置界面可以设置使用 Maven Wrapper：

![image-20250608200958525](https://bxsb-dev.oss-cn-shanghai.aliyuncs.com/image-20250608200958525.png)

## mvnd 和 mvnw 总结

**mvnd vs mvnw 核心差异：**

| 特性         | mvnd (Maven Daemon)   | mvnw (Maven Wrapper) |
| ------------ | --------------------- | -------------------- |
| 核心定位     | 高性能构建工具        | 版本管理工具         |
| 启动方式     | 常驻后台进程          | 按需启动             |
| 构建速度     | 快（减少 JVM 冷启动） | 常规速度             |
| 内存占用     | 低（基于 GraalVM）    | 常规 JVM 内存占用    |
| 版本管理     | 需手动安装            | 自动下载指定版本     |
| 典型应用场景 | 大型项目/高频构建     | 多版本项目/协作开发  |

**推荐 mvnd 的场景：**

* 项目构建耗时较长（>30秒）
* 需要频繁执行 mvn clean install
* 使用持续集成环境（如 Jenkins）
* 本地开发机器内存充足

**推荐 mvnw 的场景：**

* 需要精确控制 Maven 版本
* 多项目使用不同 Maven 版本
* 新成员快速上手项目
* 部署环境限制（无 Maven 安装权限）