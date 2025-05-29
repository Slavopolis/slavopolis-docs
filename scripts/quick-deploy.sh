#!/bin/bash

# Slavopolis Docs 快速部署脚本
# 适用于快速部署到Linux服务器

set -e

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 显示欢迎信息
echo -e "${BLUE}"
cat << 'EOF'
   ____  _                            _ _     
  / ___|| | __ ___   ___  _ __   ___ | (_)___ 
  \___ \| |/ _` \ \ / / || '_ \ / _ \| | / __|
   ___) | | (_| |\ V /| || |_) | (_) | | \__ \
  |____/|_|\__,_| \_/ |_|| .__/ \___/|_|_|___/
                         |_|                  
  
  Slavopolis Docs 快速部署工具
  
EOF
echo -e "${NC}"

# 获取用户输入
read -p "请输入您的域名 (例如: example.com): " DOMAIN
read -p "请输入您的邮箱 (用于SSL证书): " EMAIL

if [[ -z "$DOMAIN" || -z "$EMAIL" ]]; then
    echo -e "${RED}域名和邮箱不能为空！${NC}"
    exit 1
fi

echo -e "${GREEN}开始部署到域名: $DOMAIN${NC}"

# 检查是否为root用户
if [[ $EUID -ne 0 ]]; then
    echo -e "${RED}请使用 sudo 运行此脚本${NC}"
    exit 1
fi

# 更新系统
echo -e "${YELLOW}更新系统包...${NC}"
apt update && apt upgrade -y

# 安装基础依赖
echo -e "${YELLOW}安装基础依赖...${NC}"
apt install -y curl wget git nginx certbot python3-certbot-nginx

# 安装Node.js
echo -e "${YELLOW}安装 Node.js 18...${NC}"
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# 验证安装
echo -e "${YELLOW}验证安装...${NC}"
node --version
npm --version

# 构建项目
echo -e "${YELLOW}构建项目...${NC}"
npm ci
npm run build

# 创建Web目录
echo -e "${YELLOW}部署文件...${NC}"
mkdir -p /var/www/slavopolis-docs
cp -r out/* /var/www/slavopolis-docs/
chown -R www-data:www-data /var/www/slavopolis-docs
chmod -R 755 /var/www/slavopolis-docs

# 配置Nginx
echo -e "${YELLOW}配置 Nginx...${NC}"
cat > /etc/nginx/sites-available/slavopolis-docs << EOF
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN www.$DOMAIN;
    
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
        try_files \$uri \$uri/ \$uri.html /index.html;
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
ln -sf /etc/nginx/sites-available/slavopolis-docs /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

# 配置SSL
echo -e "${YELLOW}配置 SSL 证书...${NC}"
certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --email "$EMAIL" --agree-tos --non-interactive

# 设置自动续期
echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -

# 配置防火墙
echo -e "${YELLOW}配置防火墙...${NC}"
ufw allow 'Nginx Full'
ufw allow OpenSSH
ufw --force enable

# 显示完成信息
echo -e "${GREEN}"
cat << EOF

🎉 部署完成！

📋 部署信息:
   域名: https://$DOMAIN
   网站目录: /var/www/slavopolis-docs
   Nginx配置: /etc/nginx/sites-available/slavopolis-docs

🔧 常用命令:
   查看Nginx状态: systemctl status nginx
   重启Nginx: systemctl restart nginx
   查看SSL证书: certbot certificates
   查看网站日志: tail -f /var/log/nginx/access.log

🌐 现在您可以访问: https://$DOMAIN

EOF
echo -e "${NC}" 