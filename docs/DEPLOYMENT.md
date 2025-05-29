# Slavopolis Docs 部署指南

本文档提供了在Linux服务器上部署Slavopolis Docs的完整指南，包含多种部署方案。

## 📋 目录

- [系统要求](#系统要求)
- [方案一：静态站点部署](#方案一静态站点部署)
- [方案二：Docker容器部署](#方案二docker容器部署)
- [方案三：Node.js服务端渲染](#方案三nodejs服务端渲染)
- [域名和SSL配置](#域名和ssl配置)
- [监控和维护](#监控和维护)
- [故障排除](#故障排除)

## 🔧 系统要求

### 最低配置
- **CPU**: 1核心
- **内存**: 1GB RAM
- **存储**: 10GB 可用空间
- **操作系统**: Ubuntu 20.04+ / CentOS 8+ / Debian 11+

### 推荐配置
- **CPU**: 2核心
- **内存**: 2GB RAM
- **存储**: 20GB SSD
- **带宽**: 10Mbps+

### 软件依赖
- Node.js 18+
- npm 9+
- Nginx 1.18+
- Git
- Docker & Docker Compose（Docker部署方案）

## 🚀 方案一：静态站点部署

### 1.1 准备服务器环境

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装基础依赖
sudo apt install -y curl wget git nginx certbot python3-certbot-nginx

# 安装Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 验证安装
node --version
npm --version
```

### 1.2 克隆项目

```bash
# 克隆项目到服务器
cd /opt
sudo git clone https://github.com/your-username/slavopolis-docs.git
sudo chown -R $USER:$USER slavopolis-docs
cd slavopolis-docs
```

### 1.3 配置环境变量

```bash
# 创建环境变量文件
cat > .env.production << EOF
NODE_ENV=production
DEPLOY_PATH=
DOMAIN=your-domain.com
SSL_EMAIL=admin@your-domain.com
EOF
```

### 1.4 使用自动部署脚本

```bash
# 设置脚本权限
chmod +x scripts/deploy.sh

# 配置环境变量
export DOMAIN="your-domain.com"
export SSL_EMAIL="admin@your-domain.com"
export WEB_ROOT="/var/www/slavopolis-docs"

# 执行部署
sudo ./scripts/deploy.sh
```

### 1.5 手动部署步骤

如果不使用自动脚本，可以按以下步骤手动部署：

```bash
# 1. 安装项目依赖
npm ci

# 2. 构建项目
npm run build

# 3. 创建Web目录
sudo mkdir -p /var/www/slavopolis-docs

# 4. 复制构建文件
sudo cp -r out/* /var/www/slavopolis-docs/

# 5. 设置权限
sudo chown -R www-data:www-data /var/www/slavopolis-docs
sudo chmod -R 755 /var/www/slavopolis-docs
```

### 1.6 配置Nginx

```bash
# 创建Nginx配置文件
sudo tee /etc/nginx/sites-available/slavopolis-docs << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name your-domain.com www.your-domain.com;
    
    root /var/www/slavopolis-docs;
    index index.html;
    
    # Gzip压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # 静态文件缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
    
    # HTML文件缓存
    location ~* \.html$ {
        expires 1h;
        add_header Cache-Control "public, must-revalidate";
    }
    
    # 主要路由配置
    location / {
        try_files $uri $uri/ $uri.html /index.html;
    }
    
    # 安全配置
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
EOF

# 启用站点
sudo ln -s /etc/nginx/sites-available/slavopolis-docs /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启Nginx
sudo systemctl restart nginx
```

## 🐳 方案二：Docker容器部署

### 2.1 安装Docker

```bash
# 安装Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 安装Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 启动Docker服务
sudo systemctl enable docker
sudo systemctl start docker

# 将用户添加到docker组
sudo usermod -aG docker $USER
```

### 2.2 基础Docker部署

```bash
# 克隆项目
git clone https://github.com/your-username/slavopolis-docs.git
cd slavopolis-docs

# 构建镜像
docker build -t slavopolis-docs .

# 运行容器
docker run -d \
  --name slavopolis-docs \
  --restart unless-stopped \
  -p 80:80 \
  -v $(pwd)/logs:/var/log/nginx \
  slavopolis-docs
```

### 2.3 Docker Compose部署

```bash
# 修改docker-compose.yml中的域名配置
sed -i 's/your-domain.com/actual-domain.com/g' docker-compose.yml

# 启动基础服务
docker-compose up -d

# 启动包含Traefik的完整服务
docker-compose --profile traefik up -d

# 启动包含监控的完整服务
docker-compose --profile monitoring up -d
```

### 2.4 使用Traefik自动SSL

```bash
# 创建Traefik配置目录
mkdir -p traefik/acme
chmod 600 traefik/acme

# 修改docker-compose.yml中的邮箱地址
sed -i 's/admin@your-domain.com/your-email@domain.com/g' docker-compose.yml

# 启动Traefik服务
docker-compose --profile traefik up -d
```

## 🖥️ 方案三：Node.js服务端渲染

### 3.1 修改配置为SSR模式

```bash
# 修改next.config.js，注释掉静态导出配置
sed -i 's/output: '\''export'\'',/\/\/ output: '\''export'\'',/' next.config.js
sed -i 's/distDir: '\''out'\'',/\/\/ distDir: '\''out'\'',/' next.config.js
```

### 3.2 使用PM2部署

```bash
# 安装PM2
sudo npm install -g pm2

# 安装项目依赖
npm ci

# 构建项目
npm run build

# 创建PM2配置文件
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'slavopolis-docs',
    script: 'npm',
    args: 'start',
    cwd: '/opt/slavopolis-docs',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/pm2/slavopolis-docs-error.log',
    out_file: '/var/log/pm2/slavopolis-docs-out.log',
    log_file: '/var/log/pm2/slavopolis-docs.log',
    time: true
  }]
}
EOF

# 启动应用
pm2 start ecosystem.config.js

# 设置开机自启
pm2 startup
pm2 save
```

### 3.3 配置Nginx反向代理

```bash
# 创建Nginx配置
sudo tee /etc/nginx/sites-available/slavopolis-docs << 'EOF'
upstream slavopolis_docs {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    listen [::]:80;
    server_name your-domain.com www.your-domain.com;
    
    location / {
        proxy_pass http://slavopolis_docs;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# 启用站点
sudo ln -s /etc/nginx/sites-available/slavopolis-docs /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 🔒 域名和SSL配置

### 配置DNS记录

在您的域名提供商处添加以下DNS记录：

```
类型    名称    值
A       @       您的服务器IP地址
A       www     您的服务器IP地址
```

### 使用Certbot配置SSL

```bash
# 自动配置SSL证书
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# 测试自动续期
sudo certbot renew --dry-run

# 设置自动续期
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
```

## 📊 监控和维护

### 设置日志轮转

```bash
# 创建日志轮转配置
sudo tee /etc/logrotate.d/slavopolis-docs << 'EOF'
/var/log/nginx/slavopolis-docs*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        systemctl reload nginx
    endscript
}
EOF
```

### 设置监控脚本

```bash
# 创建健康检查脚本
sudo tee /usr/local/bin/health-check.sh << 'EOF'
#!/bin/bash
DOMAIN="your-domain.com"
LOG_FILE="/var/log/health-check.log"

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN")

if [[ "$HTTP_CODE" == "200" ]]; then
    echo "[$(date)] 网站正常 - HTTP $HTTP_CODE" >> "$LOG_FILE"
else
    echo "[$(date)] 网站异常 - HTTP $HTTP_CODE" >> "$LOG_FILE"
    # 发送告警邮件
    echo "网站 $DOMAIN 响应异常，HTTP状态码: $HTTP_CODE" | mail -s "网站告警" admin@your-domain.com
fi
EOF

sudo chmod +x /usr/local/bin/health-check.sh

# 添加定时任务
echo "*/5 * * * * /usr/local/bin/health-check.sh" | sudo crontab -
```

### 性能优化

```bash
# 优化Nginx配置
sudo tee -a /etc/nginx/nginx.conf << 'EOF'
# 性能优化
worker_processes auto;
worker_connections 1024;
keepalive_timeout 65;
client_max_body_size 50M;

# 缓存配置
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=10g 
                 inactive=60m use_temp_path=off;
EOF
```

## 🔧 故障排除

### 常见问题

#### 1. 构建失败
```bash
# 检查Node.js版本
node --version  # 应该是18+

# 清理缓存重新安装
rm -rf node_modules package-lock.json
npm install
```

#### 2. Nginx配置错误
```bash
# 测试Nginx配置
sudo nginx -t

# 查看错误日志
sudo tail -f /var/log/nginx/error.log
```

#### 3. SSL证书问题
```bash
# 检查证书状态
sudo certbot certificates

# 强制续期
sudo certbot renew --force-renewal
```

#### 4. Docker容器问题
```bash
# 查看容器日志
docker logs slavopolis-docs

# 重启容器
docker restart slavopolis-docs

# 重新构建镜像
docker build --no-cache -t slavopolis-docs .
```

### 日志查看

```bash
# Nginx访问日志
sudo tail -f /var/log/nginx/access.log

# Nginx错误日志
sudo tail -f /var/log/nginx/error.log

# 应用日志（PM2）
pm2 logs slavopolis-docs

# 系统日志
sudo journalctl -u nginx -f
```

### 性能监控

```bash
# 查看系统资源使用
htop
df -h
free -h

# 查看网络连接
netstat -tulpn | grep :80
netstat -tulpn | grep :443

# 测试网站响应时间
curl -w "@curl-format.txt" -o /dev/null -s "https://your-domain.com"
```

## 📝 维护清单

### 日常维护
- [ ] 检查网站可访问性
- [ ] 查看错误日志
- [ ] 监控服务器资源使用
- [ ] 检查SSL证书有效期

### 周期性维护
- [ ] 更新系统包
- [ ] 更新Node.js依赖
- [ ] 备份网站数据
- [ ] 清理日志文件
- [ ] 性能优化检查

### 安全维护
- [ ] 更新安全补丁
- [ ] 检查防火墙规则
- [ ] 审查访问日志
- [ ] 更新SSL证书

## 🆘 技术支持

如果在部署过程中遇到问题，可以通过以下方式获取帮助：

- 📧 邮箱: support@slavopolis.com
- 🐛 GitHub Issues: https://github.com/slavopolis/slavopolis-docs/issues
- 📖 文档: https://docs.slavopolis.com
- 💬 社区: https://community.slavopolis.com

---

**注意**: 请根据您的实际域名和服务器配置修改相关配置文件中的域名、邮箱等信息。 