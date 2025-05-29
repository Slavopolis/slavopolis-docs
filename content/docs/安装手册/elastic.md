# Elasticsearch 指南

相关文档：

* [官方网站](https://www.elastic.co/cn/)
* [官方2.x中文教程中安装教程](https://www.elastic.co/guide/cn/elasticsearch/guide/current/running-elasticsearch.html)
* [官方ElasticSearch下载地址](https://www.elastic.co/cn/downloads/elasticsearch)
* [官方Kibana下载地址](https://www.elastic.co/cn/downloads/kibana)

## Linux

下载地址：https://www.elastic.co/cn/downloads/elasticsearch

以 CURL 命令下载为例：

```bash
cd /opt && curl -O https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-7.12.0-linux-x86_64.tar.gz
```

解压压缩包：

```bash
tar zxvf elasticsearch-7.12.0-linux-x86_64.tar.gz
```

用户与权限设置：

> 注意：必须创建一个非 root 用户运行，因为 ElasticSearch 5.x+ 基于安全考虑，强制规定不能以 root 身份运行。

```bash
# 创建专用用户
useradd elasticsearch
passwd elasticsearch

# 授权安装目录
chown -R elasticsearch /opt/elasticsearch-7.12.0

# 创建数据与日志目录，并赋予 elasticsearch 用户权限
mkdir -p /data/es
chown -R elasticsearch /data/es

mkdir -p /var/log/es
chown -R elasticsearch /var/log/es
```

修改上述配置的 data 和 log 路径：

```bash
vi /opt/elasticsearch-7.12.0/config/elasticsearch.yml
```

修改为如下内容：

```bash
# ----------------------------------- Paths ------------------------------------
#
# Path to directory where to store the data (separate multiple locations by comma):
#
path.data: /data/es
#
# Path to log files:
#
path.logs: /var/log/es
```

系统限制修改：

> 注意：
>
> 1. 修改系统中允许应用最多创建多少文件等的限制权限，Linux 默认情况下一般限制应用最多创建的文件是 65535 个，但是 ES 至少需要 65536 的文件创建权限。
> 2. 修改系统中允许用户启动的进程开启多少个线程，Linux 默认情况下限制 root 用户开启的进程可以开启任意数量的线程，其他用户开启的进程可以开启 1024 个线程。这里必须修改限制数为 4096+，因为 ES 至少需要 4096 的线程池预备。ES 在 5.x 版本之后，强制要求在 Linux 中不能使用 root 用户启动 ES 进程，所以必须使用其他用户启动 ES 进程才可以。
> 3. Linux 低版本内核为线程分配的内存是 128K，4.x 版本的内核分配的内存更大。如果虚拟机的内存是 1G，最多只能开启 3000+ 个线程数。因此，至少为虚拟机分配 1.5G 以上的内存。

```bash
vi /etc/security/limits.conf
```

修改如下配置：

```bash
elasticsearch soft nofile 65536
elasticsearch hard nofile 65536
elasticsearch soft nproc 4096
elasticsearch hard nproc 4096
```

启动与验证：

```bash
# 切换用户启动
su elasticsearch

# 启动服务
./bin/elasticsearch -d
```

如果启动报错：

```bash
[elasticsearch@xxxxxx elasticsearch-7.12.0]$ ./bin/elasticsearch -d
warning: usage of JAVA_HOME is deprecated, use ES_JAVA_HOME
warning: usage of JAVA_HOME is deprecated, use ES_JAVA_HOME
```

这是因为 ES 7.x+ 默认要使用 JDK11+，但是我们平时开发使用的一般都是 JDK1.8，于是 ES7.2+ 就自带了，我们可以在不改名系统本身环境变量的同时，使用 ES 自带的 JDK。我们可以在 ES 的安装目录下看到 ES 自带的 JDK：

![](https://bxsb-dev.oss-cn-shanghai.aliyuncs.com/1742117421520-d6f9074e-42f4-497f-910d-7f9a89e04475.png)

建议通过修改 elasticsearch-env 配置文件实现更规范的配置：

```bash
vim /opt/elasticsearch-7.12.0/bin/elasticsearch-env
```

找到以下代码段：

![](https://bxsb-dev.oss-cn-shanghai.aliyuncs.com/1742117687617-da752a24-919a-4138-b44e-1e95b35ea8bb.png)

进行如下修改：

```bash
# now set the classpath
ES_CLASSPATH="$ES_HOME/lib/*"

# ========== 新增强制使用ES自带JDK的配置 ==========
# 强制指定ES自带的JDK路径（建议优先采用此方案）
export ES_JAVA_HOME="$ES_HOME/jdk"  # 关键配置项，覆盖其他环境变量
# =============================================

# now set the path to java
if [ ! -z "$ES_JAVA_HOME" ]; then
  # 由于上方已强制设置ES_JAVA_HOME，这里会进入该逻辑分支
  JAVA="$ES_JAVA_HOME/bin/java"
  JAVA_TYPE="ES_JAVA_HOME"
elif [ ! -z "$JAVA_HOME" ]; then
  # 以下原有逻辑将不再被执行（保留作为fallback）
  echo "warning: usage of JAVA_HOME is deprecated, use ES_JAVA_HOME" >&2
  JAVA="$JAVA_HOME/bin/java"
  JAVA_TYPE="JAVA_HOME"
else
  # 原默认逻辑（通常不会执行到这里）
  if [ "$(uname -s)" = "Darwin" ]; then
    JAVA="$ES_HOME/jdk.app/Contents/Home/bin/java"
  else
    JAVA="$ES_HOME/jdk/bin/java"
  fi
  JAVA_TYPE="bundled JDK"
fi
```

再次尝试启动后查看安装是否成功：（新开一个终端窗口）

```bash
[root@xxxxxx ~]# netstat -ntlp | grep 9200
tcp6       0      0 127.0.0.1:9200          :::*                    LISTEN      340348/java         
tcp6       0      0 ::1:9200                :::*                    LISTEN      340348/java         
[root@xxxxxx ~]# curl 127.0.0.1:9200
{
  "name" : "iZuf6ix48ftj80x6vh1cd4Z",
  "cluster_name" : "elasticsearch",
  "cluster_uuid" : "o5wlYcTjR-2vco1fN0V9xw",
  "version" : {
    "number" : "7.12.0",
    "build_flavor" : "default",
    "build_type" : "tar",
    "build_hash" : "78722783c38caa25a70982b5b042074cde5d3b3a",
    "build_date" : "2021-03-18T06:17:15.410153305Z",
    "build_snapshot" : false,
    "lucene_version" : "8.8.0",
    "minimum_wire_compatibility_version" : "6.8.0",
    "minimum_index_compatibility_version" : "6.0.0-beta1"
  },
  "tagline" : "You Know, for Search"
}
```

> 将 Elasticsearch 调整为 Systemd 服务化部署，便于后续管理。

创建 Systemd 服务文件：

```bash
sudo vi /etc/systemd/system/elasticsearch.service
```

写入以下内容：

```bash
[Unit]
Description=Elasticsearch
Documentation=https://www.elastic.co
After=network.target

[Service]
User=elasticsearch
Group=elasticsearch
Environment="ES_HOME=/opt/elasticsearch-7.12.0"
Environment="ES_PATH_CONF=/opt/elasticsearch-7.12.0/config"
Environment="JAVA_HOME=//opt/elasticsearch-7.12.0/jdk" # 需替换为实际JAVA路径
ExecStart=/opt/elasticsearch-7.12.0/bin/elasticsearch
Restart=always
LimitNOFILE=65535
LimitMEMLOCK=infinity

# 生产环境建议配置内存限制（根据服务器资源调整）
Environment="ES_JAVA_OPTS=-Xms2g -Xmx2g"

[Install]
WantedBy=multi-user.target
```

> 关键配置说明：
>
> * 用户权限：必须使用非 root 用户（如 elasticsearch）运行
> * 环境变量：
>   * ES_HOME：Elasticsearch 安装目录
>   * ES_PATH_CONF：配置文件目录
>   * JAVA_HOME：必须指向 JDK 安装路径
> * 资源限制：
>   * LimitNOFILE：解决 "max file descriptors" 错误
>   * LimitMEMLOCK：解除内存锁定限制

应用配置并启动服务：

```bash
# 重新加载systemd配置
sudo systemctl daemon-reload

# 启动服务
sudo systemctl start elasticsearch

# 设置开机自启
sudo systemctl enable elasticsearch

# 查看服务状态
sudo systemctl status elasticsearch
```

基础检查：（应返回包含 "tagline" : "You Know, for Search" 的 JSON 数据）

```bash
curl 127.0.0.1:9200
```

日志监控：

```bash
journalctl -u elasticsearch -f  # 实时日志
```

### MacOS ARM

前置【隐私与安全性】设置：

![](https://bxsb-dev.oss-cn-shanghai.aliyuncs.com/1742534117278-20c7210b-d74c-405e-9e43-1e68824b8a69.png)

下载 ElasticSearch：https://www.elastic.co/cn/downloads/elasticsearch

![](https://bxsb-dev.oss-cn-shanghai.aliyuncs.com/1742534061584-5d804635-9884-45ac-8866-cfa25a8600ee.png)

解压后进入安装目录执行：

```bash
./bin/elasticsearch
```

如果出现如下报错：

```bash
[2025-03-21T13:09:15,070][WARN ][o.e.h.n.Netty4HttpServerTransport] [Mac.local] received plaintext http traffic on an https channel, closing connection Netty4HttpChannel{localAddress=/127.0.0.1:9200, remoteAddress=/127.0.0.1:54781}
[2025-03-21T13:09:35,257][WARN ][o.e.h.n.Netty4HttpServerTransport] [Mac.local] received plaintext http traffic on an https channel, closing connection Netty4HttpChannel{localAddress=/127.0.0.1:9200, remoteAddress=/127.0.0.1:54836}
[2025-03-21T13:10:35,286][WARN ][o.e.h.n.Netty4HttpServerTransport] [Mac.local] received plaintext http traffic on an https channel, closing connection Netty4HttpChannel{localAddress=/127.0.0.1:9200, remoteAddress=/127.0.0.1:54990}
```

是因为 启用了 HTTPS，确保 Elasticsearch 配置了正确的 SSL/TLS 证书，并且客户端信任这些证书，否则请修改 config/elasticsearch.yml 禁用 HTTPS 并使用 HTTP：（或者直接访问 https://127.0.0.1:9200 也可以）

![](https://bxsb-dev.oss-cn-shanghai.aliyuncs.com/1742534255641-9e716c5e-2381-4004-b221-ba581af4b9f8.png)

重启 ElasticSearch，记住日中的初始账户信息：

```bash
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Elasticsearch security features have been automatically configured!
✅ Authentication is enabled and cluster connections are encrypted.

ℹ️  Password for the elastic user (reset with `bin/elasticsearch-reset-password -u elastic`):
  NKzpvTquGx1fruz+OlZ-

ℹ️  HTTP CA certificate SHA-256 fingerprint:
  ab48526e8756e7e3aee60738ea975f7a3009aaef25c47ef34a279da706a972e5

ℹ️  Configure Kibana to use this cluster:
• Run Kibana and click the configuration link in the terminal when Kibana starts.
• Copy the following enrollment token and paste it into Kibana in your browser (valid for the next 30 minutes):
  eyJ2ZXIiOiI4LjE0LjAiLCJhZHIiOlsiMTkyLjE2OC4wLjEwNTo5MjAwIl0sImZnciI6ImFiNDg1MjZlODc1NmU3ZTNhZWU2MDczOGVhOTc1ZjdhMzAwOWFhZWYyNWM0N2VmMzRhMjc5ZGE3MDZhOTcyZTUiLCJrZXkiOiJ0VGdadDVVQjFzTDgyTl9vWjNYWDpFYTMta21nX1QtQ09NWEpQOFgwdkpBIn0=

ℹ️  Configure other nodes to join this cluster:
• On this node:
  ⁃ Create an enrollment token with `bin/elasticsearch-create-enrollment-token -s node`.
  ⁃ Uncomment the transport.host setting at the end of config/elasticsearch.yml.
  ⁃ Restart Elasticsearch.
• On other nodes:
  ⁃ Start Elasticsearch with `bin/elasticsearch --enrollment-token <token>`, using the enrollment token that you generated.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

访问：127.0.0.1:9200

![](https://bxsb-dev.oss-cn-shanghai.aliyuncs.com/1742534475541-b28a0dca-1ad0-41df-88c2-cb0a4489bd61.png)

输出如下信息表示安装成功：

```json
{
  "name" : "Mac.local",
  "cluster_name" : "elasticsearch",
  "cluster_uuid" : "3KFP3NUtQu2-RJdVqMnQKA",
  "version" : {
    "number" : "8.17.3",
    "build_flavor" : "default",
    "build_type" : "tar",
    "build_hash" : "a091390de485bd4b127884f7e565c0cad59b10d2",
    "build_date" : "2025-02-28T10:07:26.089129809Z",
    "build_snapshot" : false,
    "lucene_version" : "9.12.0",
    "minimum_wire_compatibility_version" : "7.17.0",
    "minimum_index_compatibility_version" : "7.0.0"
  },
  "tagline" : "You Know, for Search"
}
```

下载 Kibaner：https://www.elastic.co/cn/downloads/kibana （注意下载版本要和 ES 保持一致）

![](https://bxsb-dev.oss-cn-shanghai.aliyuncs.com/1742535085699-9933c9c3-94eb-4ab3-b39b-44d6fb4050a5.png)

同样解压后在安装目录执行：

```bash
./bin/kibana
```

## 常见问题

### 启动报错：can not run elasticsearch as root

务必使用非 root 用户启动，检查目录权限。

### 无法访问 9200 端口

检查防火墙设置：

```bash
firewall-cmd --permanent --add-port=9200/tcp
firewall-cmd --reload
```

### 日志报内存不足

修改 config/jvm.options：

```bash
-Xms1g  # 根据机器内存调整
-Xmx1g
```

