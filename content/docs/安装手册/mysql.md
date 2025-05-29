---
title: "MySQL 指南"
description: "MySQL 数据库安装、配置与管理完整指南，支持多种操作系统"
toc: true
---

# MySQL 指南

## 前置条件

手动部署 MySQL 时，已有 ECS 实例必须满足以下条件：

* 实例已分配公网 IP 地址或绑定弹性公网 IP（EIP）。
* 操作系统：Alibaba Cloud Linux 3、Alibaba Cloud Linux 2、Ubuntu、Debian。
* 实例安全组的入方向规则已放行 22、80、443、3306 端口。

> 参考地址：[管理安全组规则](https://help.aliyun.com/zh/ecs/user-guide/add-a-security-group-rule?spm=a2c4g.11186623.0.0.16701345zUGm8O#concept-sm5-2wz-xdb)

## Alibaba Cloud Linux 3/2 & CentOS 7.x

当操作系统为 Alibaba Cloud Linux 3 时，执行如下命令，安装 MySQL 所需的库文件：

```bash
sudo rpm -Uvh https://mirrors.aliyun.com/alinux/3/updates/x86_64/Packages/compat-openssl10-1.0.2o-4.0.1.al8.x86_64.rpm
```

根据自己的需求选择 MySQL 的版本并安装 RPM 包，以下命令以安装更新 MySQL 社区版的 RPM 仓库为例：

```bash
sudo rpm -Uvh [MySQL版本对应的RPM包链接]
```

根据需要在 [MySQL 已归档版本仓库](https://downloads.mysql.com/archives/community/)中选择相应的版本链接即可：

![](https://bxsb-dev.oss-cn-shanghai.aliyuncs.com/image-20250404153730731.png)

对于 MySQL8.0，可以使用以下链接：

```bash
sudo rpm -Uvh https://dev.mysql.com/get/mysql80-community-release-el7-5.noarch.rpm
```

> MySQL 版本对应的 RPM 包链接中的 mysql80-community-release-el7-1 其中：
>
> * el7: 代表 RHEL 7 或与其兼容的系统版本，如 Alibaba Cloud Linux 2、CentOS 7。
> * el8: 代表 RHEL 8 或与其兼容的系统版本，如 Alibaba Cloud Linux 3、CentOS 8、AlmaLinux 8 或 Rocky Linux 8。
> * el9: 代表 RHEL 9 或与其兼容的系统版本，如 CentOS Stream 9 或其他基于 EL9 的发行版。

确保选择的仓库配置与操作系统版本相匹配，以避免安装过程中出现不必要的依赖问题或版本不兼容的错误。如果不确定系统版本，可以运行如下命令来查看详细信息：

```bash
[root@xxxx nginx]# cat /etc/os-release
NAME="Alibaba Cloud Linux"
VERSION="3 (OpenAnolis Edition)"
ID="alinux"
ID_LIKE="rhel fedora centos anolis"
VERSION_ID="3"
VARIANT="OpenAnolis Edition"
VARIANT_ID="openanolis"
ALINUX_MINOR_ID="2104"
ALINUX_UPDATE_ID="10"
PLATFORM_ID="platform:al8"
PRETTY_NAME="Alibaba Cloud Linux 3.2104 U10 (OpenAnolis Edition)"
ANSI_COLOR="0;31"
HOME_URL="https://www.aliyun.com/"
```

根据选择的 MySQL 版本，使用以下命令，安装 MySQL。将 [MySQL版本] 替换为实际的版本号：

```bash
sudo yum -y install mysql-community-server --enablerepo=mysql[MySQL版本]-community --nogpgcheck
```

例如，对于 MySQL8.0，可以使用以下命令安装 MySQL：

```bash
sudo yum -y install mysql-community-server --enablerepo=mysql80-community --nogpgcheck
```

如果**出现报错：Unknown repo: 'mysql[MySQL版本]-community'**

执行以下命令尝试清理 YUM 缓存并生成新的缓存，清理完成后再次尝试安装命令：

```bash
sudo yum clean all
sudo yum makecache
sudo yum -y install mysql-community-server --enablerepo=mysql[MySQL版本]-community --nogpgcheck
```

运行以下命令，查看 MySQL 版本号：

```bash
mysql -V
```

返回结果如下，表示 MySQL 安装成功：

```bash
mysql  Ver 8.0.39 for Linux on x86_64 (MySQL Community Server - GPL)
```

运行以下命令，启动并设置开机自启动 MySQL 服务：

```bash
sudo systemctl start mysqld
sudo systemctl enable mysqld
```

运行以下命令，查看 MySQL 服务状态：

```bash
sudo systemctl status mysqld
```

示例输出：

```bash
[root@xxxxxx ~]# sudo systemctl status mysqld
● mysqld.service - MySQL Server
   Loaded: loaded (/usr/lib/systemd/system/mysqld.service; enabled; vendor preset: disabled)
   Active: active (running) since Sun 2024-12-29 21:58:01 CST; 5s ago
     Docs: man:mysqld(8)
           http://dev.mysql.com/doc/refman/en/using-systemd.html
 Main PID: 117007 (mysqld)
   Status: "Server is operational"
    Tasks: 38 (limit: 11715)
   Memory: 442.5M
   CGroup: /system.slice/mysqld.service
           └─117007 /usr/sbin/mysqld

Dec 29 21:57:54 xxxxxx systemd[1]: Starting MySQL Server...
Dec 29 21:58:01 xxxxxx systemd[1]: Started MySQL Server.
```

MySQL  服务常见状态：

| 状态               | 描述                                                         |
| ------------------ | ------------------------------------------------------------ |
| active (running)   | MySQL 服务正在运行，并且一切正常。                           |
| active (exited)    | 此状态在 MySQL 等服务中并不常见，因为它通常表示服务已完成其任务并正常退出。而 MySQL 作为一个长期运行的服务，其期望状态应为 running，而非 exited。 |
| inactive (dead)    | 表明服务没有运行。这可能是因为它从未启动过，或者已经被停止。 |
| failed             | 如果服务启动失败或者运行过程中遇到严重错误导致终止，状态将会显示为 failed。 |
| reloading (reload) | 在极少数情况下，如果您恰好在服务重载配置时查看状态，可能会看到这个状态，但 MySQL 服务一般不使用 reload 操作。 |
| activating (start) | 当服务正在启动过程中，可能会短暂出现这个状态。               |

> 除了状态，输出还会包含服务的详细日志信息，比如服务启动时间、主进程 PID、以及可能的错误消息或警告，这些都能帮助诊断服务是否健康运行以及遇到问题时的原因。

运行以下命令，获取并记录 root 用户的初始密码：

```bash
sudo grep 'temporary password' /var/log/mysqld.log
```

执行命令结果示例如下：

```bash
2024-09-03T02:14:14.730031Z 6 [Note] [MY-010454] [Server] A temporary password is generated for root@localhost: D/B?W!4DwOua
```

> 示例末尾的 D/B?W!4DwOua 为初始密码，后续在对 MySQL 进行安全性配置时，需要使用该初始密码。

运行以下命令，对 MySQL 进行安全性配置：

```bash
sudo mysql_secure_installation
```

根据提示信息，重置 MySQL 数据库 root 用户的密码。在输入密码时，系统为了最大限度地保证数据安全，命令行将不做任何回显。只需要输入正确的密码信息，然后按 Enter 键即可。

输入已获取的 root 用户初始密码：

```bash
Securing the MySQL server deployment.
Enter password for user root:
```

重新设置 MySQL 服务密码：

```bash
The existing password for the user account root has expired. Please set a new password.
New password: 
Re-enter new password: 
```

查看密码强度并确认使用已设置的密码：

```bash
Estimated strength of the password: 100 
Do you wish to continue with the password provided?(Press y|Y for Yes, any other key for No) : y
```

根据提示信息，删除匿名用户：

```bash
Remove anonymous users? (Press y|Y for Yes, any other key for No) :
```

禁止 root 账号远程登录：

```bash
Disallow root login remotely? (Press y|Y for Yes, any other key for No) : Y
```

删除 test 库以及对 test 库的访问权限：

```bash
By default, MySQL comes with a database named 'test' that
anyone can access. This is also intended only for testing,
and should be removed before moving into a production
environment.


Remove test database and access to it? (Press y|Y for Yes, any other key for No) : 
```

重新加载授权表：

```bash
Reloading the privilege tables will ensure that all changes
made so far will take effect immediately.

Reload privilege tables now? (Press y|Y for Yes, any other key for No) : 
```

> 安全性配置的更多信息，请参见 [MySQL 官方文档](https://dev.mysql.com/doc/refman/5.7/en/mysql-secure-installation.html)。

## Ubuntu & Debian

运行如下命令导入 MySQL 的公钥以确保软件包的完整性和安全性：

```bash
wget https://dev.mysql.com/get/mysql-apt-config_0.8.32-1_all.deb
sudo dpkg -i mysql-apt-config_0.8.32-1_all.deb
```

运行上述命令后，会出现一个配置界面，使用空格键选择您需要的 MySQL 版本，并确保 "Ok" 被标记，然后按 Enter 键确认，本文中以 MySQL 8.0 为例:

![image-20250404180700330](https://bxsb-dev.oss-cn-shanghai.aliyuncs.com/image-20250404180700330.png)

更新 APT 源并安装 MySQL：

```bash
sudo apt-get update
sudo apt-get install mysql-server
```

运行以下命令，查看 MySQL 版本：

```bash
mysql -V
```

返回结果类似如下所示，表示 MySQL 已成功安装：

```bash
mysql  Ver 8.0.36-0ubuntu0.20.04.1 for Linux on x86_64 ((Ubuntu))
```

运行以下命令，进入 MySQL：

```bash
sudo mysql
```

运行以下命令，设置 root 用户密码：

```bash
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password by '<YOUR_NEW_PASSWORD>';
```

运行以下命令，退出 MySQL 数据库：

```bash
exit;
```

运行以下命令，对 MySQL 进行安全性配置：

```bash
sudo mysql_secure_installation
```

输入前面设置的 root 用户的密码，在输入密码时，系统为了最大限度地保证数据安全，命令行将不做任何回显。只需要输入正确的密码信息，然后按 Enter 键即可。

```bash
Securing the MySQL server deployment.
Enter password for user root: 
```

输入 Y，设置密码验证策略：

```bash
VALIDATE PASSWORD COMPONENT can be used to test passwords
and improve security. It checks the strength of password
and allows the users to set only those passwords which are
secure enough. Would you like to setup VALIDATE PASSWORD component?

Press y|Y for Yes, any other key for No: 
```

根据提示，为 MySQL 服务器配置密码强度验证策略：

```bash
Please enter 0 = LOW, 1 = MEDIUM and 2 = STRONG: 2
```

> 说明：
>
> * 0 = LOW （低级） 这个选项设置的密码策略较为宽松，仅要求密码长度至少为8个字符。没有其他关于必须包含数字、大小写字母或特殊字符的要求。适用于对安全性要求不高的环境，但这种设置容易使密码变得简单且易被破解。
> * 1 = MEDIUM（中级） 中等级别的密码策略不仅要求密码长度至少为8个字符，还强制要求密码必须包含以下元素以提高安全性：（这种策略能够有效阻止简单的密码被使用，提升账户安全性）
>   * 数字（0-9）
>   * 混合大小写字母（A-Z, a-z）
>   * 特殊字符（如 !@#$%^&* 等）
> * 2 = STRONG（高级） 最严格的密码策略，除了满足中等级别的所有条件外，还额外要求密码不能出现在字典文件中。这意味着密码不能是常见的单词或短语，进一步增强了密码的复杂度和安全性。这种策略最适合处理敏感数据或在高度安全要求的环境中使用。

输入Y，更改 root 用户密码：

```bash
Change the password for root ? ((Press y|Y for Yes, any other key for No) : Y
```

输入 root 用户密码并确认 root 密码：

```bash
Change the password for root ? ((Press y|Y for Yes, any other key for No) : y
New password: 
Re-enter new password: 
Estimated strength of the password: 100 
```

输入Y，确认使用已设置的密码：

```bash
vDo you wish to continue with the password provided?(Press y|Y for Yes, any other key for No) : Y
```

输入 Y 删除 MySQL 自带的匿名用户：

```bash
By default, a MySQL installation has an anonymous user,
allowing anyone to log into MySQL without having to have
a user account created for them. This is intended only for
testing, and to make the installation go a bit smoother.
You should remove them before moving into a production
environment.

Remove anonymous users? (Press y|Y for Yes, any other key for No) : Y
```

输入 Y，禁止 MySQL 的 root 用户的远程登录权限：

```bash
Normally, root should only be allowed to connect from
'localhost'. This ensures that someone cannot guess at
the root password from the network.

Disallow root login remotely? (Press y|Y for Yes, any other key for No) : Y
```

输入 Y，移除 test 数据库：

```bash
Remove test database and access to it? (Press y|Y for Yes, any other key for No) : 
```

输入 Y，重新加载授权表：

```bash
Reload privilege tables now? (Press y|Y for Yes, any other key for No) : y
```

## 远程访问 MySQL 数据库

运行以下命令后，输入 root 用户的密码登录 MySQL：

```bash
sudo mysql -uroot -p
```

依次运行以下命令，创建远程登录 MySQL 的账号，并允许远程主机使用该账号访问 MySQL。本示例账号为 `dmsTest`、密码为 `Ecs@123****`。

> 实际创建账号时，需将示例密码 `Ecs@123****` 更换为符合要求的密码，并妥善保存。
>
> 密码要求：长度为 8 至 30 个字符，必须同时包含大小写英文字母、数字和特殊符号。
>
> 可以使用以下特殊符号：`() ~!@#$%^&*-+=|{}[]:;‘<>,.?/`

```bash
# 创建数据库用户 dmsTest, 并授予远程连接权限。
create user 'dmsTest'@'%' identified by 'Ecs@123****'; 

# 为 dmsTest 用户授权数据库所有权限。
grant all privileges on *.* to 'dmsTest'@'%'; 

# 刷新权限。
flush privileges; 
```

执行以下命令，退出数据库：

```bash
exit
```

使用 dmsTest 账号远程登录 MySQL 即可。

如果访问失败，请检查是否开启了 3306 端口（或者你实际的数据库端口）：

![image-20250404180814247](https://bxsb-dev.oss-cn-shanghai.aliyuncs.com/image-20250404180814247.png)

## MacOS ARM

安装 homebrew：https://brew.sh/

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

查看是否已经安装了 mysql：

```bash
xxxx@Mac ~ % brew list -l
==> Formulae
drwxr-xr-x@ 3 liyao  admin  96 Apr  4 17:38 mysql
```

如果你想卸载，可以执行如下命令：

```bash
# 1. 停止所有 MySQL 服务
brew services stop mysql

# 2. 卸载通过 Homebrew 安装的 MySQL
brew uninstall mysql

# 3. 删除残留文件（M1芯片专属路径）
sudo rm -rf /opt/homebrew/var/mysql      # 数据库文件
sudo rm -rf /opt/homebrew/etc/my.cnf     # 配置文件
sudo rm -rf /opt/homebrew/var/log/mysql  # 日志文件

# 4. 清理旧版本链接
brew cleanup
```

安装 mysql：

```bash
brew install mysql@8.0
```

安装完成后会输出如下信息：

```bash
==> mysql@8.0
We've installed your MySQL database without a root password. To secure it run:
    mysql_secure_installation

MySQL is configured to only allow connections from localhost by default

To connect run:
    mysql -u root

mysql@8.0 is keg-only, which means it was not symlinked into /opt/homebrew,
because this is an alternate version of another formula.

If you need to have mysql@8.0 first in your PATH, run:
  echo 'export PATH="/opt/homebrew/opt/mysql@8.0/bin:$PATH"' >> ~/.zshrc

For compilers to find mysql@8.0 you may need to set:
  export LDFLAGS="-L/opt/homebrew/opt/mysql@8.0/lib"
  export CPPFLAGS="-I/opt/homebrew/opt/mysql@8.0/include"

To start mysql@8.0 now and restart at login:
  brew services start mysql@8.0
Or, if you don't want/need a background service you can just run:
  /opt/homebrew/opt/mysql@8.0/bin/mysqld_safe --datadir\=/opt/homebrew/var/mysql
```

根据上述信息提示，MySQL 被安装在了 `/opt/homebrew/opt/mysql@8.0`，配置环境变量：

```bash
echo 'export PATH="/opt/homebrew/opt/mysql@8.0/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

初始化数据库：

```bash
brew services start mysql@8.0
```

安全加固配置：

```bash
mysql_secure_installation
```

> 按序配置：
>
> 1. 选择密码强度策略（建议选 2: STRONG）
> 2. 设置 root 密码（示例：My$tr0ngP@ss!）
> 3. 移除匿名用户（Y）
> 4. 禁用远程 root 登录（Y）
> 5. 删除测试数据库（Y）
> 6. 立即刷新权限表（Y）

查看已安装版本：

```bash
mysql --version
```

预期输出：mysql  Ver 8.0.41 for macos15.2 on arm64 (Homebrew)

相关服务命令：

| 操作     | 命令                          |
| -------- | ----------------------------- |
| 启动服务 | brew services start mysql@8.0 |
| 停止服务 | brew services stop mysql@8.0  |
| 查看状态 | brew services list            |

连接测试：

```bash
mysql -u root -p -h 127.0.0.1 -P 3306
```

多版本共存管理（可选）:

```bash
# 查看可用版本
brew search mysql@

# 安装其他版本（如 5.7）
brew install mysql@5.7

# 切换版本
brew unlink mysql@8.0 && brew link --force mysql@5.7
```

如果需要修改配置文件，可以在如下文件修改：

```bash
vi /opt/homebrew/etc/my.cnf
```

常见配置如下：

```bash
[mysqld]
default-authentication-plugin=mysql_native_password
character-set-server=utf8mb4
collation-server=utf8mb4_unicode_ci
max_connections=200
innodb_buffer_pool_size=1G
```

---

<center><strong>常见问题</strong></center>

端口冲突：

```bash
sudo lsof -i :3306  # 查看端口占用
brew services stop mysql  # 停止冲突服务
```

忘记 root 密码：

```bash
# 停止服务
brew services stop mysql@8.0

# 登陆 MySQL
mysqld_safe --skip-grant-tables &
mysql -u root

# 在 MySQL Shell 中执行：
FLUSH PRIVILEGES;
ALTER USER 'root'@'localhost' IDENTIFIED BY '新密码';

# 推出 MySQL
exit;

# 种植进程
killall mysqld

# 重启服务
brew services start mysql@8.0
```

数据目录权限问题：

```bash
sudo chown -R _mysql:_mysql /opt/homebrew/var/mysql
```

## 相关文档

* 在 Windows 实例上手动部署 MySQL 数据库：https://help.aliyun.com/zh/ecs/use-cases/manually-deploy-a-mysql-database-on-an-ecs-windows-instance?spm=a2c4g.11186623.help-menu-25365.d_5_5_1_2.659e2736BI2YX4&scm=20140722.H_133671._.OR_help-T_cn~zh-V_1
* 使用云市场镜像部署 SQL Server 数据库（Windows）：https://help.aliyun.com/zh/ecs/use-cases/cloud-market-image-deployment-of-sql-server-database?spm=a2c4g.11186623.help-menu-25365.d_5_5_1_3.bf747969PyzVgO&scm=20140722.H_133669._.OR_help-T_cn~zh-V_1
* 部署 Oracle 数据库：https://help.aliyun.com/zh/ecs/use-cases/deploy-oracle-database?spm=a2c4g.11186623.help-menu-25365.d_5_5_1_4.1946fe72qDA2jd&scm=20140722.H_133675._.OR_help-T_cn~zh-V_1
* 创建并连接云数据库 RDS：https://help.aliyun.com/zh/ecs/use-cases/create-and-connect-to-an-apsaradb-rds-instance?spm=a2c4g.11186623.help-menu-25365.d_5_5_1_0.27d7134527H98c&scm=20140722.H_406340._.OR_help-T_cn~zh-V_1