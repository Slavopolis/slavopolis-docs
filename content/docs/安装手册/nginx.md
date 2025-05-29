# Nginx 指南

## nginx..conf

下面给出 Nginx Conf 的配置模版：

```nginx
# 用户和组设置，Nginx工作进程将以该用户身份运行
user nginx;
# 自动设置工作进程数量为CPU核心数
worker_processes auto;

# 错误日志路径和级别
error_log /var/log/nginx/error.log warn;
# 进程ID文件位置
pid /run/nginx.pid;

# 动态加载模块配置
include /usr/share/nginx/modules/*.conf;

# 工作进程连接设置
events {
    # 每个工作进程的最大连接数
    worker_connections 1024;
    # 启用多接受 - 提高高并发性能
    multi_accept on;
    # 使用高效的事件模型 - 自动选择最佳的事件处理方式
    use epoll;
}

http {
    # MIME类型定义
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # 日志格式定义
    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    # 访问日志配置
    access_log  /var/log/nginx/access.log  main buffer=16k;

    # 基础优化设置
    sendfile        on;   # 启用高效文件传输
    tcp_nopush      on;   # 仅在sendfile开启时有效，提高网络包传输效率
    tcp_nodelay     on;   # 禁用Nagle算法，减少小包延迟
    
    # 长连接设置
    keepalive_timeout  65;
    keepalive_requests 100;
    
    # 打开gzip压缩
    gzip  on;
    # 压缩级别（1-9，级别越高压缩比越大，也越消耗CPU）
    gzip_comp_level 6;
    # 压缩的最小文件大小
    gzip_min_length 1k;
    # 禁止对IE6进行gzip压缩
    gzip_disable "msie6";
    # 压缩缓冲区大小
    gzip_buffers 16 8k;
    # 允许压缩的MIME类型
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;
    gzip_vary on;

    # 客户端请求体的最大值
    client_max_body_size 1024m;
    
    # 安全性相关设置
    server_tokens off;  # 隐藏Nginx版本信息

    # 静态博客配置
    server {
        listen       3000;
        server_name  localhost;
        
        # 设置根目录
        root         /develop/web/build;
        index        index.html;
        
        # 安全响应头设置
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header X-Frame-Options SAMEORIGIN;
        add_header Referrer-Policy "strict-origin-when-cross-origin";
        
        # 缓存设置 - 静态资源长期缓存
        location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
            expires 30d;
            add_header Cache-Control "public, max-age=2592000, immutable";
            gzip_static on;
            access_log off;
        }
        
        # HTML文件禁止缓存
        location ~* \.html$ {
            add_header Cache-Control "no-cache, no-store, must-revalidate";
            add_header Pragma no-cache;
            add_header Expires 0;
        }
        
        # 前端路由处理 - SPA应用刷新问题解决方案
        location / {
            try_files $uri $uri/ /index.html;
            gzip_static on;
        }
        
        # XML文件处理 - 针对博客RSS和站点地图
        location ~* \.(xml|atom)$ {
            add_header Cache-Control "no-cache";
            add_header Content-Type "application/xml; charset=utf-8";
        }
        
        # 错误页面处理
        error_page 404 /404.html;
        location = /404.html {
            internal;
            add_header Cache-Control "no-cache";
        }
        
        error_page 500 502 503 504 /50x.html;
        location = /50x.html {
            internal;
            add_header Cache-Control "no-cache";
        }
        
        # 阻止访问隐藏文件和目录
        location ~ /\. {
            deny all;
            return 404;
            access_log off;
            log_not_found off;
        }
        
        # 防止恶意请求和敏感文件访问
        location ~ \.(md|yml|yaml|git|bak|old|orig|backup|sql|conf|log)$ {
            deny all;
            return 404;
            access_log off;
        }
        
        # 禁用某些HTTP方法
        if ($request_method !~ ^(GET|HEAD|OPTIONS)$) {
            return 405;
        }
    }

    # APP前端配置（H5版）
    server {
        listen       3001;
        server_name  localhost;

        # 设置根目录
        root         /develop/web/shard-office/app/dist/build/h5;
        index        index.html;

        # 安全响应头设置
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header X-Frame-Options SAMEORIGIN;
        
        # 缓存静态资源 - 1年缓存时间
        location /assets {
            expires 1y;
            add_header Cache-Control "public, max-age=31536000, immutable";
            # 添加跨域支持
            add_header Access-Control-Allow-Origin "*";
            # 开启gzip静态文件支持
            gzip_static on;
        }

        # 不缓存index.html，确保始终获取最新版本
        location = /index.html {
            add_header Cache-Control "no-cache, no-store, must-revalidate";
            add_header Pragma no-cache;
            add_header Expires 0;
        }

        # 处理前端路由 - 使用HTML5 History模式
        location / {
            try_files $uri $uri/ /index.html;
            # 添加gzip静态文件支持
            gzip_static on;
        }

        # 后端API代理 - 转发到后台服务
        location /api {
            proxy_pass http://localhost:8081/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            # 设置请求体缓存大小
            proxy_request_buffering on;
            client_body_buffer_size 10m;
            # 超时设置
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
            
            # 限制请求方法 - 使用条件判断替代proxy_method
            if ($request_method !~ ^(GET|POST|PUT|DELETE|OPTIONS)$) {
                return 405;
            }
        }

        # 自定义错误页面
        error_page 404 /404.html;
        location = /404.html {
            internal;
            add_header Cache-Control "no-cache";
        }

        error_page 500 502 503 504 /50x.html;
        location = /50x.html {
            internal;
            add_header Cache-Control "no-cache";
        }

        # 阻止访问隐藏文件
        location ~ /\. {
            deny all;
            return 404;
            access_log off;
            log_not_found off;
        }
        
        # 防止恶意请求
        location ~ \.(bak|old|orig|backup|sql|conf|md|log)$ {
            deny all;
            return 404;
        }
    }

    # Web管理后台配置
    server {
        listen       3002;
        server_name  localhost;

        # 设置根目录
        root         /develop/web/shard-office/web/dist;
        index        index.html;

        # 安全响应头设置
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header X-Frame-Options SAMEORIGIN;
        # 添加CSP策略，提升安全性
        add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self' http://localhost:8081";
        
        # 缓存静态资源 - 1年缓存时间
        location /assets {
            expires 1y;
            add_header Cache-Control "public, max-age=31536000, immutable";
            gzip_static on;
        }

        # 不缓存index.html，确保始终获取最新版本
        location = /index.html {
            add_header Cache-Control "no-cache, no-store, must-revalidate";
            add_header Pragma no-cache;
            add_header Expires 0;
        }

        # 处理前端路由 - 使用HTML5 History模式
        location / {
            try_files $uri $uri/ /index.html;
            gzip_static on;
        }

        # 后端API代理 - 转发到后台服务
        location /api {
            proxy_pass http://localhost:8081/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            # 设置请求体缓存大小
            proxy_request_buffering on;
            client_body_buffer_size 10m;
            # 超时设置
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
            # 添加CORS支持
            add_header 'Access-Control-Allow-Origin' '*' always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
            add_header 'Access-Control-Allow-Headers' 'DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Authorization' always;

            # 处理OPTIONS预检请求
            if ($request_method = 'OPTIONS') {
                add_header 'Access-Control-Max-Age' 1728000;
                add_header 'Content-Type' 'text/plain charset=UTF-8';
                add_header 'Content-Length' 0;
                return 204;
            }
            
            # 限制请求方法 - 使用条件判断替代proxy_method
            if ($request_method !~ ^(GET|POST|PUT|DELETE|OPTIONS)$) {
                return 405;
            }
        }

        # 自定义错误页面
        error_page 404 /404.html;
        location = /404.html {
            internal;
            add_header Cache-Control "no-cache";
        }

        error_page 500 502 503 504 /50x.html;
        location = /50x.html {
            internal;
            add_header Cache-Control "no-cache";
        }

        # 阻止访问隐藏文件
        location ~ /\. {
            deny all;
            return 404;
            access_log off;
            log_not_found off;
        }
        
        # 防止恶意请求
        location ~ \.(bak|old|orig|backup|sql|conf|md|log)$ {
            deny all;
            return 404;
        }
    }
}
```

