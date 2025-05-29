---
title: Canal 安装指南
description: Canal是阿里巴巴开源的一个数据同步工具，主要用于MySQL数据库增量日志解析
date: 2023-10-15
author: Slavopolis Team
tags: ["数据同步", "MySQL", "Canal", "数据库"]
---

# Canal 安装指南

Canal 是阿里巴巴开源的一个项目，主要用途是基于 MySQL 数据库增量日志解析，提供增量数据订阅和消费。Canal 的工作原理是伪装自己为 MySQL slave，从而获取 MySQL master 的 binlog 日志，再解析成增量数据供其他应用消费。

## 前置条件

在安装 Canal 之前，请确保满足以下条件：

1. Java 环境：JDK 1.8+
2. MySQL：开启 binlog，并且设置 binlog 格式为 ROW
3. MySQL 权限：Canal 需要授予 MySQL slave 的权限

## 安装步骤

### 1. 下载 Canal

访问 Canal 的 [GitHub 发布页面](https://github.com/alibaba/canal/releases)，下载最新版本的 canal.deployer-x.x.x.tar.gz 文件。

```bash
wget https://github.com/alibaba/canal/releases/download/canal-1.1.6/canal.deployer-1.1.6.tar.gz
```

### 2. 解压文件

```bash
mkdir -p /usr/local/canal
tar -zxvf canal.deployer-1.1.6.tar.gz -C /usr/local/canal
```

### 3. 配置 Canal

#### 修改 instance.properties

进入配置目录：

```bash
cd /usr/local/canal/conf/example
```

编辑 `instance.properties` 文件：

```properties
# MySQL 地址
canal.instance.master.address=127.0.0.1:3306
# MySQL 账号
canal.instance.dbUsername=canal
# MySQL 密码
canal.instance.dbPassword=canal
# 数据库/表的过滤规则
canal.instance.filter.regex=.*\\..*
```

### 4. 在 MySQL 中创建用户并授权

登录 MySQL，执行以下 SQL：

```sql
CREATE USER 'canal'@'%' IDENTIFIED BY 'canal';
GRANT SELECT, REPLICATION SLAVE, REPLICATION CLIENT ON *.* TO 'canal'@'%';
FLUSH PRIVILEGES;
```

### 5. 启动 Canal

```bash
cd /usr/local/canal/bin
sh startup.sh
```

### 6. 验证安装

检查日志确认 Canal 是否启动成功：

```bash
tail -f /usr/local/canal/logs/canal/canal.log
```

如果看到 "canal server running..." 的信息，表示 Canal 已经成功启动。

## 配置多实例

如果需要配置多个实例，可以复制 example 目录并修改配置：

```bash
cp -r /usr/local/canal/conf/example /usr/local/canal/conf/myinstance
```

然后修改 `myinstance` 下的 `instance.properties` 文件，调整相应的配置。

## 常见问题

1. **启动失败**：检查日志文件，确认 MySQL binlog 是否开启，以及 Canal 用户权限是否正确。
2. **无法同步数据**：检查过滤规则是否正确，MySQL binlog 格式是否为 ROW。
3. **性能问题**：调整 `canal.instance.parser.parallel` 参数来优化性能。

## 更多资源

- [Canal GitHub 仓库](https://github.com/alibaba/canal)
- [Canal 官方文档](https://github.com/alibaba/canal/wiki)