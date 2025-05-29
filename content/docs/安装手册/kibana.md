# Kibana 指南

## 下载安装包

官方下载地址：https://www.elastic.co/cn/downloads/kibana

* 版本匹配原则：Kibana 版本必须与 Elasticsearch 严格一致（例如均为 7.12.0），否则可能出现兼容性问题。
* 官方下载：建议从 [Elastic 官网下载中心](https://www.elastic.co/cn/downloads/kibana)直接获取对应版本。

```bash
cd /opt

wget https://artifacts.elastic.co/downloads/kibana/kibana-7.12.0-linux-x86_64.tar.gz
```

## 解压与权限配置

```bash
# 解压到/opt目录（-v参数可省略以减少输出冗余）
tar -xzf kibana-7.12.0-linux-x86_64.tar.gz -C /opt

# 确保使用专用用户运行（需提前创建elasticsearch用户）
chown -R elasticsearch /opt/kibana-7.12.0-linux-x86_64
```

## 远程访问配置

修改 config/kibana.yml：

```bash
vi /opt/kibana-7.12.0-linux-x86_64/config/kibana.yml

server.host: "0.0.0.0"  # 允许所有IP访问
elasticsearch.hosts: ["http://localhost:9200"]  # 明确指定ES地址
```

## 服务启动与管理

```bash
# 切换至elasticsearch用户
su elasticsearch

# 前台启动（调试推荐）
cd /opt/kibana-7.12.0-linux-x86_64/
./bin/kibana

# 后台启动（生产环境建议）
nohup ./bin/kibana > kibana.log 2>&1 &
```

服务化部署（推荐）：

```bash
# 创建 Systemd 服务文件（需root权限）
cat <<EOF > /etc/systemd/system/kibana.service
[Unit]
Description=Kibana
After=network.target

[Service]
User=elasticsearch
ExecStart=/opt/kibana-7.12.0-linux-x86_64/bin/kibana
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# 启用服务
systemctl daemon-reload
systemctl start kibana
systemctl enable kibana
```

## 验证安装

端口监听检查：

```bash
netstat -tnlp | grep 5601
```

界面访问： 浏览器访问 `http://<服务器IP>:5601`，出现 Kibana 欢迎页面即成功。

![](https://bxsb-dev.oss-cn-shanghai.aliyuncs.com/1742817068204-f5856a45-9b37-46cf-98b9-ef62348489af.png)

## 安全加固配置（公网必做）

> 注意：使用基本许可证时，默认情况下禁用 Elasticsearch 安全功能。由于测试环境是放在公网上的，所以需要设置下密码访问。(详见 [Set up minimal security for Elasticsearch](https://www.elastic.co/guide/en/elasticsearch/reference/7.12/security-minimal-setup.html))

Elasticsearch 端启用安全认证：

```bash
# 修改 elasticsearch.yml
xpack.security.enabled: true
xpack.security.transport.ssl.enabled: true
```

```bash
# 重启 Elasticsearch 后设置密码（交互式模式）
./bin/elasticsearch-setup-passwords interactive

# 记录生成的密码（特别是elastic用户）
```

Kibana 对接认证：

```bash
# 修改 kibana.yml
elasticsearch.username: "elastic"

# 密码通过keystore管理（更安全）
```

```bash
# 创建并配置 keystore
./bin/kibana-keystore create
echo "your_elastic_password" | ./bin/kibana-keystore add elasticsearch.password --stdin

# 重启 Kibana 服务
systemctl restart kibana
```

访问 Kibana 界面后，使用用户名 elastic 和设置的密码登录:

![](https://bxsb-dev.oss-cn-shanghai.aliyuncs.com/1742817486337-3ac59bf5-caa6-44cf-b786-fc9172ea8033.png)

> 首次登录建议：
>
> * 进入 Stack Management > Security 创建只读用户
> * 避免使用超级账号进行日常操作

## 数据导入与探索

1. 登录后进入 Home > Try sample data
2. 选择 "Sample eCommerce orders" 或 "Sample flight data”
3. 点击 Add data 自动创建索引和仪表盘
4. 通过 Discover 和 Dashboard 进行数据探索

## 常见问题

### Kibana 无法连接 Elasticsearch

1. 检查 elasticsearch.hosts 配置
2. 确认 ES 安全组放行 9200 端口
3. 查看 ES 日志 /var/log/elasticsearch/elasticsearch.log

### 密码认证失败

```bash
# 手动测试ES连接
curl -u elastic:password http://localhost:9200
```

