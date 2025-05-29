#!/bin/bash

# Slavopolis Docs 部署脚本
# 适用于 Linux 服务器静态站点部署

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置变量
PROJECT_NAME="slavopolis-docs"
BUILD_DIR="out"
BACKUP_DIR="/var/backups/${PROJECT_NAME}"
LOG_FILE="/var/log/${PROJECT_NAME}-deploy.log"

# 默认配置（可通过环境变量覆盖）
WEB_ROOT=${WEB_ROOT:-"/var/www/${PROJECT_NAME}"}
NGINX_CONFIG_PATH=${NGINX_CONFIG_PATH:-"/etc/nginx/sites-available/${PROJECT_NAME}"}
DOMAIN=${DOMAIN:-"your-domain.com"}
SSL_EMAIL=${SSL_EMAIL:-"admin@your-domain.com"}

# 日志函数
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

# 检查是否为root用户
check_root() {
    if [[ $EUID -ne 0 ]]; then
        error "此脚本需要root权限运行，请使用 sudo"
    fi
}

# 检查系统依赖
check_dependencies() {
    log "检查系统依赖..."
    
    # 检查Node.js
    if ! command -v node &> /dev/null; then
        error "Node.js 未安装，请先安装 Node.js 18+"
    fi
    
    # 检查npm
    if ! command -v npm &> /dev/null; then
        error "npm 未安装"
    fi
    
    # 检查nginx
    if ! command -v nginx &> /dev/null; then
        warning "Nginx 未安装，将自动安装"
        install_nginx
    fi
    
    # 检查certbot（用于SSL证书）
    if ! command -v certbot &> /dev/null; then
        warning "Certbot 未安装，将自动安装"
        install_certbot
    fi
    
    log "依赖检查完成"
}

# 安装Nginx
install_nginx() {
    log "安装 Nginx..."
    
    if command -v apt-get &> /dev/null; then
        # Ubuntu/Debian
        apt-get update
        apt-get install -y nginx
    elif command -v yum &> /dev/null; then
        # CentOS/RHEL
        yum install -y epel-release
        yum install -y nginx
    elif command -v dnf &> /dev/null; then
        # Fedora
        dnf install -y nginx
    else
        error "不支持的包管理器，请手动安装 Nginx"
    fi
    
    systemctl enable nginx
    systemctl start nginx
    log "Nginx 安装完成"
}

# 安装Certbot
install_certbot() {
    log "安装 Certbot..."
    
    if command -v apt-get &> /dev/null; then
        # Ubuntu/Debian
        apt-get install -y certbot python3-certbot-nginx
    elif command -v yum &> /dev/null; then
        # CentOS/RHEL
        yum install -y certbot python3-certbot-nginx
    elif command -v dnf &> /dev/null; then
        # Fedora
        dnf install -y certbot python3-certbot-nginx
    else
        warning "无法自动安装 Certbot，请手动安装"
    fi
    
    log "Certbot 安装完成"
}

# 创建备份
create_backup() {
    if [[ -d "$WEB_ROOT" ]]; then
        log "创建备份..."
        mkdir -p "$BACKUP_DIR"
        
        BACKUP_NAME="${PROJECT_NAME}-$(date +%Y%m%d-%H%M%S).tar.gz"
        tar -czf "${BACKUP_DIR}/${BACKUP_NAME}" -C "$(dirname "$WEB_ROOT")" "$(basename "$WEB_ROOT")"
        
        log "备份已创建: ${BACKUP_DIR}/${BACKUP_NAME}"
        
        # 保留最近5个备份
        cd "$BACKUP_DIR"
        ls -t ${PROJECT_NAME}-*.tar.gz | tail -n +6 | xargs -r rm
    fi
}

# 构建项目
build_project() {
    log "开始构建项目..."
    
    # 安装依赖
    info "安装项目依赖..."
    npm ci --production=false
    
    # 类型检查
    info "执行类型检查..."
    npm run type-check
    
    # 代码检查
    info "执行代码检查..."
    npm run lint
    
    # 构建项目
    info "构建生产版本..."
    NODE_ENV=production npm run build
    
    # 检查构建结果
    if [[ ! -d "$BUILD_DIR" ]]; then
        error "构建失败，未找到输出目录: $BUILD_DIR"
    fi
    
    log "项目构建完成"
}

# 部署文件
deploy_files() {
    log "部署文件到服务器..."
    
    # 创建Web根目录
    mkdir -p "$WEB_ROOT"
    
    # 复制构建文件
    info "复制构建文件..."
    rsync -av --delete "$BUILD_DIR/" "$WEB_ROOT/"
    
    # 设置文件权限
    chown -R www-data:www-data "$WEB_ROOT"
    find "$WEB_ROOT" -type d -exec chmod 755 {} \;
    find "$WEB_ROOT" -type f -exec chmod 644 {} \;
    
    log "文件部署完成"
}

# 配置Nginx
configure_nginx() {
    log "配置 Nginx..."
    
    # 创建Nginx配置文件
    cat > "$NGINX_CONFIG_PATH" << EOF
# Slavopolis Docs Nginx 配置
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN www.$DOMAIN;
    
    # 重定向到HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;
    
    # SSL配置（将由Certbot自动配置）
    
    # 网站根目录
    root $WEB_ROOT;
    index index.html;
    
    # 安全头
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self';" always;
    
    # Gzip压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;
    
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
    
    # 404页面
    error_page 404 /404.html;
    
    # 安全配置
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
    
    # 禁止访问敏感文件
    location ~* \.(env|log|htaccess)$ {
        deny all;
        access_log off;
        log_not_found off;
    }
}
EOF
    
    # 启用站点
    ln -sf "$NGINX_CONFIG_PATH" "/etc/nginx/sites-enabled/"
    
    # 测试Nginx配置
    nginx -t || error "Nginx 配置测试失败"
    
    # 重载Nginx
    systemctl reload nginx
    
    log "Nginx 配置完成"
}

# 配置SSL证书
configure_ssl() {
    log "配置 SSL 证书..."
    
    if command -v certbot &> /dev/null; then
        # 使用Certbot自动配置SSL
        certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --email "$SSL_EMAIL" --agree-tos --non-interactive
        
        # 设置自动续期
        (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
        
        log "SSL 证书配置完成"
    else
        warning "Certbot 未安装，跳过SSL配置"
    fi
}

# 配置防火墙
configure_firewall() {
    log "配置防火墙..."
    
    if command -v ufw &> /dev/null; then
        # Ubuntu/Debian UFW
        ufw allow 'Nginx Full'
        ufw allow OpenSSH
        ufw --force enable
    elif command -v firewall-cmd &> /dev/null; then
        # CentOS/RHEL firewalld
        firewall-cmd --permanent --add-service=http
        firewall-cmd --permanent --add-service=https
        firewall-cmd --permanent --add-service=ssh
        firewall-cmd --reload
    else
        warning "未检测到防火墙管理工具，请手动配置防火墙"
    fi
    
    log "防火墙配置完成"
}

# 设置监控
setup_monitoring() {
    log "设置基础监控..."
    
    # 创建健康检查脚本
    cat > "/usr/local/bin/${PROJECT_NAME}-health-check.sh" << 'EOF'
#!/bin/bash

DOMAIN="$1"
LOG_FILE="/var/log/slavopolis-docs-health.log"

if [[ -z "$DOMAIN" ]]; then
    echo "用法: $0 <domain>"
    exit 1
fi

# 检查网站响应
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN")

if [[ "$HTTP_CODE" == "200" ]]; then
    echo "[$(date)] 网站正常 - HTTP $HTTP_CODE" >> "$LOG_FILE"
else
    echo "[$(date)] 网站异常 - HTTP $HTTP_CODE" >> "$LOG_FILE"
    # 这里可以添加告警逻辑，如发送邮件或短信
fi
EOF
    
    chmod +x "/usr/local/bin/${PROJECT_NAME}-health-check.sh"
    
    # 添加定时健康检查
    (crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/${PROJECT_NAME}-health-check.sh $DOMAIN") | crontab -
    
    log "监控设置完成"
}

# 显示部署信息
show_deployment_info() {
    log "部署完成！"
    echo
    echo -e "${GREEN}=== 部署信息 ===${NC}"
    echo -e "项目名称: ${BLUE}$PROJECT_NAME${NC}"
    echo -e "域名: ${BLUE}$DOMAIN${NC}"
    echo -e "网站根目录: ${BLUE}$WEB_ROOT${NC}"
    echo -e "Nginx配置: ${BLUE}$NGINX_CONFIG_PATH${NC}"
    echo -e "日志文件: ${BLUE}$LOG_FILE${NC}"
    echo -e "备份目录: ${BLUE}$BACKUP_DIR${NC}"
    echo
    echo -e "${GREEN}=== 访问地址 ===${NC}"
    echo -e "HTTP: ${BLUE}http://$DOMAIN${NC}"
    echo -e "HTTPS: ${BLUE}https://$DOMAIN${NC}"
    echo
    echo -e "${GREEN}=== 常用命令 ===${NC}"
    echo -e "查看Nginx状态: ${BLUE}systemctl status nginx${NC}"
    echo -e "重载Nginx配置: ${BLUE}systemctl reload nginx${NC}"
    echo -e "查看部署日志: ${BLUE}tail -f $LOG_FILE${NC}"
    echo -e "查看网站日志: ${BLUE}tail -f /var/log/nginx/access.log${NC}"
    echo
}

# 主函数
main() {
    log "开始部署 Slavopolis Docs..."
    
    # 检查权限
    check_root
    
    # 检查依赖
    check_dependencies
    
    # 创建备份
    create_backup
    
    # 构建项目
    build_project
    
    # 部署文件
    deploy_files
    
    # 配置Nginx
    configure_nginx
    
    # 配置SSL
    configure_ssl
    
    # 配置防火墙
    configure_firewall
    
    # 设置监控
    setup_monitoring
    
    # 显示部署信息
    show_deployment_info
}

# 脚本入口
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi 