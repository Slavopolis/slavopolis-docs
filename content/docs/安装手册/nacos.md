# Nacos 指南

开源地址：https://github.com/alibaba/nacos

官方网站：https://nacos.io/zh-cn/index.html

---

## 架构决策记录（ADR）

| 方案       | 优势                 | 劣势                       | 适用场景               |
| ---------- | -------------------- | -------------------------- | ---------------------- |
| 单机模式   | 部署简单，资源消耗低 | 无高可用保障，性能受限     | 开发测试环境           |
| 集群模式   | 高可用，支持水平扩展 | 部署复杂度高，需要负载均衡 | 中小型生产环境         |
| 多集群模式 | 异地容灾，数据分区   | 运维成本高，网络延迟敏感   | 大型企业多数据中心场景 |

> **认知过渡**：对于刚接触服务发现的开发者，可以将 Nacos 类比为 "微服务的通讯录"。就像通讯录需要实时更新联系人信息，Nacos 负责维护服务实例的注册与发现。其核心设计采用了 Observer 模式，当服务状态变化时，所有订阅者会自动收到通知。

## 环境要求

以下是部署 Nacos Server 的最小系统要求，如果你的环境无法满足系统最小要求，可能会导致无法部署和启动 Nacos Server。

| 环境         | 说明                             |
| ------------ | -------------------------------- |
| **JDK/JRE**  | 8及以上                          |
| **CPU**      | 1核及以上，支持64位CPU           |
| **内存**     | 2G及以上                         |
| **硬盘**     | 无最小要求，根据保留日志自行调整 |
| **操作系统** | Linux, Mac OS X, Windows         |

## 版本选型

> 当前官方推荐的稳定版本为 `2.5.0`。Nacos 1.x 已经停止功能维护，请尽快升级到 2.x 版本（版本升级请参考 [升级指南](https://nacos.io/docs/v2/upgrading/version2-upgrading)）。

| 版本  | 二进制包                                                     | Docker镜像                                                   | MD5                              | 发布说明                                                     | 参考文档                                                     |
| ----- | ------------------------------------------------------------ | ------------------------------------------------------------ | -------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 2.5.1 | [2.5.1.zip](https://download.nacos.io/nacos-server/nacos-server-2.5.1.zip?spm=5238cd80.2ef5001f.0.0.3f613b7ccUbJXU&file=nacos-server-2.5.1.zip) | [nacos/nacos-server:v2.5.1](https://hub.docker.com/r/nacos/nacos-server/tags?page=1&name=2.5.1) | 11c15731f40894da23562a38a0cc9b70 | [发布说明](https://github.com/alibaba/nacos/releases/tag/2.5.1) | [快速开始](https://nacos.io/docs/latest/quickstart/quick-start/) |

## Linux 部署

下载指定版本（最新LTS版本）。进入 Nacos 官网[版本下载页面](https://nacos.io/download/nacos-server/)，选择 [稳定版本](https://nacos.io/download/nacos-server/#稳定版本)， 然后点击 `二进制包下载` 列中的 `${nacos.version}.zip` 进行下载。

![](https://bxsb-dev.oss-cn-shanghai.aliyuncs.com/image-20250404170906756.png)

执行如下命令进行下载：

```bash
wget https://download.nacos.io/nacos-server/nacos-server-2.5.1.zip?spm=5238cd80.2ef5001f.0.0.3f613b7ccUbJXU&file=nacos-server-2.5.1.zip
```

解压安装包：（解压后会得到一个 nacos 目录）

```bash
unzip nacos-server-2.5.1.zip

# 或者（根据实际安装包情况来）
tar -xvf nacos-server-$version.tar.gz
```

编辑配置文件：

```bash
vi nacos/conf/application.properties
```

根据注释进行配置即可：

```properties
# application.properties 配置
# 端口号
server.port=8848
# 自定义 content-path（可选，默认 /nacos）
server.servlet.contextPath=/javaflow

# 启用 mysql
spring.datasource.platform=mysql
spring.sql.init.platform=mysql

# 配置 mysql 链接信息
db.num = 1
db.url.0=jdbc:mysql://127.0.0.1:3306/nacos_config?characterEncoding=utf8&connectTimeout=1000&socketTimeout=3000&autoReconnect=true&useUnicode=true&useSSL=false&serverTimezone=Asia/Shanghai
db.user.0=nacos
db.password.0=nacos

# 鉴权配置
# 开启鉴权功能
nacos.core.auth.enabled=true
# 自定义密钥：需自定义JWT令牌的密钥，确保长度超过32字符，并使用Base64编码
nacos.core.auth.plugin.nacos.token.secret.key=VGhpc0lzTXlDdXN0b21TZWNyZXRLZXkwMTIzNDU2Nzg= # Base64编码的32位以上密钥
# 服务端身份标识（集群模式重要）
nacos.core.auth.server.identity.key=your_identity_key
nacos.core.auth.server.identity.value=your_identity_value
```

> 开启鉴权后，访问 Nacos 控制台或 API 时，需要提供有效的用户名和密码。登录凭证需基于正确的密钥生成，以通过 Nacos 的权限验证。

创建数据库：

```sql
CREATE DATABASE nacos_config CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

在你的 IDE 中执行 Nacos 提供的独立数据库脚本：（直接在 IDE 中执行 SQL 即可）

```bash
/nacos/conf/mysql-schema.sql
```

![](https://bxsb-dev.oss-cn-shanghai.aliyuncs.com/image-20250404183307089.png)

启动 Nacos：

```
# 启动 Nacos
sh ./nacos/bin/startup.sh -m standalone
```

访问 Nacos：

```http
http://IP:PORT/contentPath/#
```

![](https://bxsb-dev.oss-cn-shanghai.aliyuncs.com/image-20250404193527353.png)

默认 nacos/nacos，登陆后可自行修改密码：

![](https://bxsb-dev.oss-cn-shanghai.aliyuncs.com/image-20250404194101709.png)

停止命令如下：

```
sh ./nacos/bin/shutdown.sh
```

将 Nacos 注册为 Systemd 服务单元文件（nacos.service）：

```bash
vi /etc/systemd/system/nacos.service
```

填入如下内容：

```bash
[Unit]
Description=Nacos Server
After=network.target

[Service]
Type=forking
#User=nacos
#Group=nacos

# 环境变量配置
Environment="FUNCTION_MODE=all"
Environment="JAVA_OPT=-Xms1g -Xmx1g -XX:MetaspaceSize=256m -XX:MaxMetaspaceSize=512m -XX:+UseG1GC"

# 启动命令
ExecStart=/usr/bin/bash -c '\
  nohup $JAVA_HOME/bin/java $JAVA_OPT \
    -jar /develop/nacos/target/nacos-server.jar > /develop/nacos/logs/start.out 2>&1 &'

# 健康检查（Systemd 原生支持方式）
ExecStartPost=/usr/bin/bash -c '\
  sleep 30 && \
  curl -s http://localhost:8848/javaflow/v1/ns/operator/health | \
  jq -e ".status == \\"UP\\"" || { systemctl stop nacos; exit 1; }'

Restart=on-failure
RestartSec=10s

[Install]
WantedBy=multi-user.target
```

加载配置：

```bash
systemctl daemon-reload
```

启动服务、设置开机自启：

```bash
systemctl start nacos
systemctl enable nacos
```

## Docker

下载最新版 nacos 源码：

```bash
git clone https://github.com/nacos-group/nacos-docker.git
cd nacos-docker
```

> 如果没有安装 git，可以直接去 github 上下载压缩包，然后到服务上解压缩即可。

修改配置文件：

```bash
vi nacos-docker-2.5.1/env/nacos-standlone-mysql.env
```

主要修改数据库连接信息：

```bash
PREFER_HOST_MODE=hostname
MODE=standalone
SPRING_DATASOURCE_PLATFORM=mysql
MYSQL_SERVICE_HOST=localhost
MYSQL_SERVICE_DB_NAME=nacos_config
MYSQL_SERVICE_PORT=3306
MYSQL_SERVICE_USER=your_username
MYSQL_SERVICE_PASSWORD=your_password
MYSQL_SERVICE_DB_PARAM=characterEncoding=utf8&connectTimeout=1000&socketTimeout=3000&autoReconnect=true&useUnicode=true&useSSL=false&serverTimezone=Asia/Shanghai&allowPublicKeyRetrieval=true
```

配置说明：

| 配置项                 | 说明           | 示例              |
| ---------------------- | -------------- | ----------------- |
| MYSQL_SERVICE_HOST     | 数据库连接地址 |                   |
| MYSQL_SERVICE_PORT     | 数据库端口     | 默认 : **3306**   |
| MYSQL_SERVICE_DB_NAME  | 数据库库名     | 例如 nacos_config |
| MYSQL_SERVICE_USER     | 数据库用户名   |                   |
| MYSQL_SERVICE_PASSWORD | 数据库用户密码 |                   |

创建数据库：

```sql
CREATE DATABASE `nacos_config` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `nacos_config`;
```

创建数据库表：https://github.com/alibaba/nacos/blob/2.5.1/distribution/conf/mysql-schema.sql

> 将上述 2.5.1 切换为你实际的 Nacos 版本即可。

或者也可以在页面的右上角选择版本：

![](https://bxsb-dev.oss-cn-shanghai.aliyuncs.com/image-20250404162100014.png)

在 nacos-docker-2.5.1/example 目录下启动：

```bash
docker-compose -f standalone-mysql-8.yaml up
```

docker-compose 常用命令如下：

```bash
# 启动所有容器
docker-compose up

# 后台启动并运行
docker-compose up -d

# 停止容器
docker-compose stop

# 启动容器
docker-compose start

# 停止并销毁容器
docker-compose down
```

访问 nacos 配置控制台：

```html
http://你的公网ip地址:8848/nacos/index.html#
```

![](https://bxsb-dev.oss-cn-shanghai.aliyuncs.com/image-20250404194101709.png)

## 常见问题

### 控制台无法访问

确保 8848 端口已经加入安全策略组：

![](https://cdn.nlark.com/yuque/0/2023/png/5378072/1703496932195-32d42613-f8ec-437a-a1f1-d77ede7cb07a.png)

同时记得也要开启 9848、8848 以及 7848 三个端口。Nacos2.X 版本新增了 gRPC 的通信方式，因此需要增加2个端口。新增端口是在配置的主端口 (server.port，默认8848) 基础上，进行一定偏移量自动生成。

具体端口内容及偏移量请参考如下：

| 端口 | 与主端口的偏移量 | 描述                                                         |
| ---- | ---------------- | ------------------------------------------------------------ |
| 9848 | 1000             | 客户端 gRPC 请求服务端端口，用于客户端向服务端发起连接和请求 |
| 9849 | 1001             | 服务端 gRPC 请求服务端端口，用于服务间同步等                 |
| 7848 | -1000            | Jraft 请求服务端端口，用于处理服务端间的 Raft 相关请求       |

使用 VIP/nginx 请求时，需要配置成 TCP 转发，不能配置 http2 转发，否则连接会被 nginx 断开。对外暴露端口时，**只需要暴露主端口（默认 8848）和 gRPC 端口（默认 9848）**，其他端口为服务端之间的通信端口，请勿暴露其他端口，同时建议所有端口均不暴露在公网下。

![](https://bxsb-dev.oss-cn-shanghai.aliyuncs.com/deploy-port-export.svg)

客户端拥有相同的计算逻辑，用户如同 1.X 的使用方式，配置主端口(默认 8848)，通过相同的偏移量，计算对应 gRPC 端口(默认 9848)。因此如果客户端和服务端之前存在端口转发，或防火墙时，需要对端口转发配置和防火墙配置做相应的调整。

### No DataSource set

数据库或者表建的不对，按照要求表建好之后重启。

### ERROR [internal] load metadata for docker.io/library/mysql:8.0.31   

* 方案1：换源。
* 方案2：不要在这里依赖 mysql，而是自己部署一个 mysql 然后配置上相关的 url、username 等信息。

**方案一**：主要是 docker 镜像源的问题，需要更新成能用的国内的镜像。

```bash
vi /etc/docker/daemon.json 
```

加入如下信息：

```json
{
  "registry-mirrors": [
    "https://docker.anyhub.us.kg/"
	,"https://hub.uuuadc.top/"
	,"https://dockerhub.jobcher.com/"
	,"https://dockerhub.icu/"
	,"https://docker.ckyl.me/"
	,"https://docker.awsl9527.cn/"
	,"https://q7ta64ip.mirror.aliyuncs.com"
	,"https://hx983jf6.mirror.aliyuncs.com"
	,"https://docker.mirrors.ustc.edu.cn"
	,"https://hub-mirror.c.163.com"
	,"https://docker.m.daocloud.io"
	,"https://mirror.baidubce.com"
	,"https://docker.nju.edu.cn"
	,"https://jockerhub.com"
	,"https://dockerhub.azk8s.cn"
	,"https://dockerproxy.com"
	,"https://mirror.baidubce.com"
	,"https://docker.nju.edu.cn"
	,"https://mirror.iscas.ac.cn"
	,"https://dockerpull.org",
    "https://docker.1panel.dev",
    "https://docker.fxxk.dedyn.io",
    "https://docker.xn--6oq72ry9d5zx.cn",
    "https://docker.zhai.cm",
    "https://docker.5z5f.com",
    "https://a.ussh.net",
    "https://docker.cloudlayer.icu",
    "https://hub.littlediary.cn",
    "https://hub.crdz.gq",
    "https://docker.unsee.tech",
    "https://docker.kejilion.pro",
    "https://registry.dockermirror.com",
    "https://hub.rat.dev",
    "https://dhub.kubesre.xyz",
    "https://docker.nastool.de",
    "https://docker.udayun.com",
    "https://docker.rainbond.cc",
    "https://hub.geekery.cn",
    "https://docker.1panelproxy.com",
    "https://atomhub.openatom.cn",
    "https://docker.m.daocloud.io"
  ]
}
```

加载配置：

```bash
# 使配置生效
systemctl daemon-reload

# 重启 Docker
systemctl restart docker
```

> 更多源详见：https://github.com/dongyubin/DockerHub 

**方案二**：修改 nacos-docker-2.5.1/example/standalone-mysql-8.yaml 文件，把其中 mysql 的镜像和 nacos 对 mysql的依赖都去掉：

```dockerfile
version: "3.8"
services:
  nacos:
    image: nacos/nacos-server:${NACOS_VERSION}
    container_name: nacos-standalone-mysql
    env_file:
      - ../env/nacos-standlone-mysql.env
    volumes:
      - ./standalone-logs/:/home/nacos/logs
    ports:
      - "8848:8848"
      - "9848:9848"
    #depends_on: 从这里往下，全都注释掉即可
      #     mysql:
      # condition: service_healthy
    restart: always
      #  mysql:
      # container_name: mysql
      #build:
      #context: .
      #dockerfile: ./image/mysql/8/Dockerfile
      #image: example/mysql:8.0.30
      #env_file:
      # - ../env/mysql.env
      #volumes:
      # - ./mysql:/var/lib/mysql
      #ports:
      # - "3306:3306"
      #healthcheck:
      # test: [ "CMD", "mysqladmin" ,"ping", "-h", "localhost" ]
      # interval: 5s
      # timeout: 10s
      #retries: 10
```

### Caused by: java.lang.RuntimeException: java.lang.RuntimeException: [db-load-error]load jdbc.properties error

数据库的连接配置写错了，请检查下 url 地址，端口、用户名以及密码。

### error getting credentials - err: exit status 1, out: `Error calling StartServiceByName for org.freedesktop.secrets: Timeout was reached

安装 gnupg2：

```bash
sudo apt install gnupg2 pass
```

### Table 'nacos_config.config_info_gray' doesn't exist

安装的 nacos 是 2.5.1 及以后的版本，在这个版本种新增了这个表，需要执行以下 SQL 去 nacos_config 库建表：

https://github.com/alibaba/nacos/blob/2.5.1/distribution/conf/mysql-schema.sql
