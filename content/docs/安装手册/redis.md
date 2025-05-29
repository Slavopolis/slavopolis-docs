# Redis 指南

## CentOS 7/8

安装 Redis：

```bash
# CentOS 7 需先启用 EPEL 仓库
sudo yum install epel-release -y

# CentOS 8/Alibaba Cloud Linux 3
sudo dnf install epel-release -y

# 安装 Redis
sudo yum install redis -y  # CentOS 7
sudo dnf install redis -y  # CentOS 8
```

修改配置文件：

```bash
sudo vim /etc/redis.conf
```

按照如下注释修改：

```bash
# 允许远程访问（注释 bind 或改为 0.0.0.0）
# bind 127.0.0.1

# 设置访问密码（取消注释并修改）
requirepass YourSecurePassword123!

# 修改端口（可选）
port 6379
```

防火墙放行端口：

```bash
# 开放 Redis 端口（默认 6379）
sudo firewall-cmd --permanent --add-port=6379/tcp
sudo firewall-cmd --reload
```

启动服务:

```bash
sudo systemctl enable redis
sudo systemctl start redis
```

## Ubuntu

安装 Redis：

```bash
sudo apt update
sudo apt install redis-server -y
```

修改配置文件：

```bash
sudo vim /etc/redis/redis.conf
```

按照如下注释修改：

```bash
# 允许远程访问
bind 0.0.0.0 ::0

# 设置密码
requirepass YourSecurePassword123!

# 修改端口（可选）
port 6379
```

防火墙放行端口:

```bash
sudo ufw allow 6379/tcp
sudo ufw reload
```

重启服务:

```bash
sudo systemctl restart redis-server
```

## Alibaba Cloud Linux 3

> 说明：Alibaba Cloud Linux 3 基于 CentOS 8，操作与 CentOS 8 一致，但需注意安全组配置。

安装 Redis:

```bash
sudo dnf install epel-release -y
sudo dnf install redis -y
```

配置修改（同 CentOS 部分）:

```bash
sudo vim /etc/redis.conf
```

按照如下注释修改：

```bash
# 允许远程访问（注释 bind 或改为 0.0.0.0）
# bind 127.0.0.1

# 设置访问密码（取消注释并修改）
requirepass YourSecurePassword123!

# 修改端口（可选）
port 6379
```

阿里云安全组配置:

1. 登录 [阿里云控制台](https://ecs.console.aliyun.com/)
2. 进入实例安全组 -> 手动添加规则：
   * 授权策略：允许
   * 协议类型：自定义 TCP
   * 端口范围：6379/6379
   * 授权对象：0.0.0.0/0（或指定IP）

![](https://bxsb-dev.oss-cn-shanghai.aliyuncs.com/image-20250404200239872.png)

启动服务:

```bash
sudo systemctl enable redis
sudo systemctl start redis
```

## 验证 Redis 连接

本地连接测试:

```bash
redis-cli
127.0.0.1:6379> AUTH YourSecurePassword123!
OK
127.0.0.1:6379> PING
PONG
```

远程连接测试:

```bash
# 从另一台服务器测试
redis-cli -h <目标服务器IP> -p 6379 -a YourSecurePassword123!
```

## 高级配置（可选）

### 持久化配置

配置修改:

```bash
sudo vim /etc/redis.conf
```

```bash
# 启用 RDB 快照（默认已启用）
save 900 1      # 15分钟内至少1次修改触发保存
save 300 10     # 5分钟内至少10次修改
save 60 10000   # 1分钟内至少10000次修改

# 启用 AOF 日志追加
appendonly yes
appendfilename "appendonly.aof"
```

### 内存管理

配置修改:

```bash
sudo vim /etc/redis.conf
```

```bash
maxmemory 2gb
maxmemory-policy allkeys-lru
```

## 故障排查

| 问题         | 解决方案                                                     |
| ------------ | ------------------------------------------------------------ |
| 无法远程连接 | 1、检查防火墙和安全组规则<br/>2、确认 bind 配置为 0.0.0.0<br/>3、检查 SELinux 状态（临时禁用：setenforce 0） |
| 密码认证失败 | 1、确认 `requirepass` 配置已生效<br/>2、重启 Redis 服务      |
| 服务启动失败 | 查看日志：journalctl -u redis -f                             |
