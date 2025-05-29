# Docker 指南

## 卸载 Docker

停止 Docker 服务：

```bash
systemctl stop docker.service docker.socket containerd
systemctl disable docker.service docker.socket
```

Debian/Ubuntu 系统（使用 apt）卸载：

```bash
# 列出已安装的 Docker 软件包
dpkg -l | grep docker

# 卸载 Docker 相关软件包(根据实际情况填写)
apt-get purge -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 清理依赖（可选）
apt-get autoremove -y --purge
```

Red Hat/CentOS 系统（使用 yum）卸载：

```bash
# 列出已安装的 Docker 软件包
yum list installed | grep docker

# 卸载 Docker 相关软件包(根据实际情况填写)
yum remove -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

删除残留数据和配置:

```bash
# 删除 Docker 相关目录
rm -rf /var/lib/docker
rm -rf /var/lib/containerd
rm -rf /etc/docker

# 删除 Docker 用户组（可选）
groupdel docker
```

移除 Docker 仓库源（可选）:

```bash
# Debian/Ubuntu
rm /etc/apt/sources.list.d/docker.list
apt-get update

# Red Hat/CentOS/Fedora
rm /etc/yum.repos.d/docker-ce.repo
```

验证卸载:

```bash
docker --version
```

如果提示 "docker: command not found"，则卸载成功。

## CentOS 7.x

下载 docker-ce 的 yum 源：

```bash
sudo wget -O /etc/yum.repos.d/docker-ce.repo https://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
```

安装 Docker：

```bash
sudo yum -y install docker-ce
```

检查 Docker 是否安装成功：

```bash
sudo docker -v
```

启动 Docker 服务，并设置开机自启：

```bash
systemctl start docker
systemctl enable docker
```

查看 Docker 是否启动：

```bash
systemctl status docker
```

安装 docker-compose：

```bash
pip3 install docker-compose
```

验证 docker-compose 是否安装成功：

```bash
docker-compose --version
```

## CentOS 8.x

> CentOS 8 操作系统版本结束了生命周期（EOL），如果在阿里云上继续使用默认配置的 CentOS 8 的源会发生报错。需要手动切换源地址，详见 [CentOS 8 EOL 切换源](https://help.aliyun.com/zh/ecs/user-guide/change-centos-8-repository-addresses#task-2182261)。

安装 DNF：

```bash
yum -y install dnf
```

安装 Docker 存储驱动的依赖包：

```bash
dnf install -y device-mapper-persistent-data lvm2
```

添加稳定的 Docker 软件源：

```bash
dnf config-manager --add-repo=https://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
```

检查 Docker 软件源是否已添加：

```bash
dnf list docker-ce
```

安装 Docker：

```bash
dnf install -y docker-ce --nobest
```

检查 Docker 是否安装成功：

```bash
docker -v
```

启动 Docker 服务，并设置开机自启：

```bash
systemctl start docker
systemctl enable docker
```

查看 Docker 是否启动：

```bash
systemctl status docker
```

安装 setuptools：

```bash
pip3 install -U pip setuptools
```

安装 docker-compose：

```bash
pip3 install docker-compose
```

验证 docker-compose 是否安装成功：

```bash
docker-compose --version
```

## Alibaba Cloud Linux 3 

添加 docker-ce 的 dnf 源：

```bash
dnf config-manager --add-repo=https://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
```

如果出现如下警告：

```bash
/usr/lib/python3.6/site-packages/OpenSSL/crypto.py:12: CryptographyDeprecationWarning: Python 3.6 is no longer supported...

Failed loading plugin "spacewalk": module 'lib' has no attribute 'X509_V_FLAG_CB_ISSUER_CHECK'
```

1. 表示系统中使用的 Python 3.6 已过时，`cryptography` 库不再支持 Python 3.6，因此抛出版本弃用警告。此警告不会直接导致命令失败，但长期可能引发兼容性问题。
2. `spacewalk` 插件依赖的 OpenSSL 库版本过旧，缺少 `X509_V_FLAG_CB_ISSUER_CHECK` 属性。

但是命令最终结果：

```bash
Adding repo from: https://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
```

表示虽然报错，但仓库已成功添加。可通过以下命令验证：

```bash
dnf repolist | grep docker-ce
```

出现如下内容表示成功：

```bash
[root@xxxx nginx]# dnf repolist | grep docker-ce
/usr/lib/python3.6/site-packages/OpenSSL/crypto.py:12: CryptographyDeprecationWarning: Python 3.6 is no longer supported by the Python core team. Therefore, support for it is deprecated in cryptography. The next release of cryptography will remove support for Python 3.6.
  from cryptography import x509

Failed loading plugin "spacewalk": module 'lib' has no attribute 'X509_V_FLAG_CB_ISSUER_CHECK'
docker-ce-stable           Docker CE Stable - x86_64
```

如果不想看到上述警告，可以通过如下命令修复：

```bash
# 更新所有软件包（包括 OpenSSL 和 Python 依赖）
dnf update -y

# 重新安装 cryptography 和 OpenSSL 相关包
dnf reinstall -y python3-cryptography openssl
```

安装 Alibaba Cloud Linux 3 专用的 dnf 源兼容插件：

```bash
dnf -y install dnf-plugin-releasever-adapter --repo alinux3-plus
```

安装 Docker：

```bash
dnf -y install docker-ce --nobest
```

检查 Docker 是否安装成功:

```bash
docker -v
```

启动 Docker 服务，并设置开机自启:

```bash
systemctl start docker
systemctl enable docker
```

查看 Docker 是否启动:

```bash
systemctl status docker
```

安装 setuptools:

```bash
pip3 install -U pip setuptools
```

安装 docker-compose:

```bash
pip3 install docker-compose
```

验证 docker-compose 是否安装成功:

```bash
docker-compose --version
```

