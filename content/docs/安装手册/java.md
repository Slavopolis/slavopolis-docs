# Java 指南

## 卸载环境

可以通过命令 `java -version` 来判断是否已安装环境，如果正确输出了 Java 版本信息，说明已安装了环境，如果当前环境不满足需求，可以参考下面的卸载环境。

使用 rpm 包管理器的系统（如 Alibaba Cloud Linux、CentOS、Fedora 等）可以通过如下命令列出所有已安装的 Java 相关包：

```bash
sudo rpm -qa | grep java
```

每个列出的包，可以使用以下命令删除（将包名替换为实际的 Java 包名）：

```bash
sudo rpm -e --nodeps 包名
```

---

使用 dpkg 包管理器的系统（如 Ubuntu，Debian 等）可以通过如下命令列出所有已安装的 Java 相关包：

```bash
sudo dpkg --list | grep java
```

每个列出的包，可以使用以下命令删除（将包名替换为实际的 Java 包名）：（注意：使用 `--purge` 选项可以彻底删除包及其配置文件）

```bash
sudo apt-get remove --purge 包名
```

## 安装环境

### 更新包管理工具

使用 dnf 工具的系统如（Alibaba Cloud Linux 3、CentOS 8 等）:

```bash
sudo dnf update
```

使用 yum 工具的系统（如 Alibaba Cloud Linux 2、CentOS 7 等）:

```bash
sudo yum update
```

使用 apt 工具的系统（如 Ubuntu，Debian 等）:

```bash
sudo apt update
```

### 查看当前系统支持的 OpenJDK

使用 dnf 工具的系统如（Alibaba Cloud Linux 3、CentOS 8 等）：

```bash
sudo dnf search openjdk
```

使用 yum 工具的系统（如 Alibaba Cloud Linux 2、CentOS 7 等）：

```bash
sudo yum search openjdk
```

使用 apt 工具的系统（如 Ubuntu，Debian 等）：

```bash
sudo apt search openjdk
```

### 安装指定版本的 OpenJDK

> 以下命令基于 Java 1.8 版本的 OpenJDK 环境，如果想使用其他版本的 Java，将命令中的包名称替换为其他搜索到的包名称。

使用 dnf 工具的系统如（Alibaba Cloud Linux 3、CentOS 8 等）：

```bash
sudo dnf install -y java-1.8.0-openjdk-devel
```

使用 yum 工具的系统（如 Alibaba Cloud Linux 2、CentOS 7 等）：

```bash
sudo yum install -y java-1.8.0-openjdk-devel
```

使用 apt 工具的系统（如 Ubuntu，Debian 等）：

```bash
sudo apt-get install -y openjdk-8-jdk
```

### 验证安装

执行以下命令以验证 Java 是否已成功安装，并且能够显示版本信息：

```
java -version
```

通过包管理工具安装 Java 环境已默认设置软链接，无需设置环境变量。
