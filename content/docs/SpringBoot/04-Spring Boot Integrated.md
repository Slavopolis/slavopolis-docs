# Spring Boot 集成方式

> 在 Java 应用开发中，Spring Boot 的 Maven 集成方式选择直接影响项目的依赖管理效率、构建流程的标准化程度以及长期维护的复杂性。Spring Boot 提供了两种主要的 Maven 集成策略：继承 `spring-boot-starter-parent` 父项目和导入 `spring-boot-dependencies` 依赖管理。这两种方式在依赖管理、插件配置、项目结构灵活性等方面存在显著差异，需要根据具体的环境和项目需求进行合理选择。
>

## 继承 spring-boot-starter-parent 方案

### 实现原理

继承 `spring-boot-starter-parent` 是 Spring Boot 官方推荐的标准集成方式。只需要在父项目的 POM XML 引入以下 parent 即可：

```xml
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.5.0</version>
    <relativePath/> <!-- lookup parent from repository -->
</parent>
```

该方案通过 **Maven 的项目继承机制**，将项目配置与 Spring Boot 的标准配置进行深度集成。**`spring-boot-starter-parent` 本身继承自 `spring-boot-dependencies`，并在此基础上添加了插件配置、资源过滤设置和构建参数优化**。

![image-20250608105838024](https://bxsb-dev.oss-cn-shanghai.aliyuncs.com/image-20250608105838024.png)

这种继承机制的核心价值在于配置的标准化和自动化。**当项目继承父项目时，所有 Spring Boot 相关依赖的版本号都由父项目统一管理，开发者在声明依赖时无需指定版本号。**

SpringBoot3.5.0 的 spring-boot-dependencies 默认维护的依赖版本号如下：

```xml
<properties>
  <activemq.version>6.1.6</activemq.version>
  <angus-mail.version>2.0.3</angus-mail.version>
  <artemis.version>2.40.0</artemis.version>
  <aspectj.version>1.9.24</aspectj.version>
  <assertj.version>3.27.3</assertj.version>
  <awaitility.version>4.3.0</awaitility.version>
  <zipkin-reporter.version>3.5.0</zipkin-reporter.version>
  <brave.version>6.1.0</brave.version>
  <build-helper-maven-plugin.version>3.6.0</build-helper-maven-plugin.version>
  <byte-buddy.version>1.17.5</byte-buddy.version>
  <cache2k.version>2.6.1.Final</cache2k.version>
  <caffeine.version>3.2.0</caffeine.version>
  <cassandra-driver.version>4.19.0</cassandra-driver.version>
  <classmate.version>1.7.0</classmate.version>
  <commons-codec.version>1.18.0</commons-codec.version>
  <commons-dbcp2.version>2.13.0</commons-dbcp2.version>
  <commons-lang3.version>3.17.0</commons-lang3.version>
  <commons-pool.version>1.6</commons-pool.version>
  <commons-pool2.version>2.12.1</commons-pool2.version>
  <couchbase-client.version>3.8.1</couchbase-client.version>
  <crac.version>1.5.0</crac.version>
  <cyclonedx-maven-plugin.version>2.9.1</cyclonedx-maven-plugin.version>
  <db2-jdbc.version>12.1.0.0</db2-jdbc.version>
  <dependency-management-plugin.version>1.1.7</dependency-management-plugin.version>
  <derby.version>10.16.1.1</derby.version>
  <ehcache3.version>3.10.8</ehcache3.version>
  <elasticsearch-client.version>8.18.1</elasticsearch-client.version>
  <flyway.version>11.7.2</flyway.version>
  <freemarker.version>2.3.34</freemarker.version>
  <git-commit-id-maven-plugin.version>9.0.1</git-commit-id-maven-plugin.version>
  <glassfish-jaxb.version>4.0.5</glassfish-jaxb.version>
  <glassfish-jstl.version>3.0.1</glassfish-jstl.version>
  <graphql-java.version>24.0</graphql-java.version>
  <groovy.version>4.0.26</groovy.version>
  <gson.version>2.13.1</gson.version>
  <h2.version>2.3.232</h2.version>
  <hamcrest.version>3.0</hamcrest.version>
  <hazelcast.version>5.5.0</hazelcast.version>
  <hibernate.version>6.6.15.Final</hibernate.version>
  <hibernate-validator.version>8.0.2.Final</hibernate-validator.version>
  <hikaricp.version>6.3.0</hikaricp.version>
  <hsqldb.version>2.7.3</hsqldb.version>
  <htmlunit.version>4.11.1</htmlunit.version>
  <httpasyncclient.version>4.1.5</httpasyncclient.version>
  <httpclient5.version>5.4.4</httpclient5.version>
  <httpcore.version>4.4.16</httpcore.version>
  <httpcore5.version>5.3.4</httpcore5.version>
  <infinispan.version>15.2.1.Final</infinispan.version>
  <influxdb-java.version>2.25</influxdb-java.version>
  <jackson-bom.version>2.19.0</jackson-bom.version>
  <jakarta-activation.version>2.1.3</jakarta-activation.version>
  <jakarta-annotation.version>2.1.1</jakarta-annotation.version>
  <jakarta-inject.version>2.0.1</jakarta-inject.version>
  <jakarta-jms.version>3.1.0</jakarta-jms.version>
  <jakarta-json.version>2.1.3</jakarta-json.version>
  <jakarta-json-bind.version>3.0.1</jakarta-json-bind.version>
  <jakarta-mail.version>2.1.3</jakarta-mail.version>
  <jakarta-management.version>1.1.4</jakarta-management.version>
  <jakarta-persistence.version>3.1.0</jakarta-persistence.version>
  <jakarta-servlet.version>6.0.0</jakarta-servlet.version>
  <jakarta-servlet-jsp-jstl.version>3.0.2</jakarta-servlet-jsp-jstl.version>
  <jakarta-transaction.version>2.0.1</jakarta-transaction.version>
  <jakarta-validation.version>3.0.2</jakarta-validation.version>
  <jakarta-websocket.version>2.1.1</jakarta-websocket.version>
  <jakarta-ws-rs.version>3.1.0</jakarta-ws-rs.version>
  <jakarta-xml-bind.version>4.0.2</jakarta-xml-bind.version>
  <jakarta-xml-soap.version>3.0.2</jakarta-xml-soap.version>
  <jakarta-xml-ws.version>4.0.2</jakarta-xml-ws.version>
  <janino.version>3.1.12</janino.version>
  <javax-cache.version>1.1.1</javax-cache.version>
  <javax-money.version>1.1</javax-money.version>
  <jaxen.version>2.0.0</jaxen.version>
  <jaybird.version>6.0.1</jaybird.version>
  <jboss-logging.version>3.6.1.Final</jboss-logging.version>
  <jdom2.version>2.0.6.1</jdom2.version>
  <jedis.version>5.2.0</jedis.version>
  <jersey.version>3.1.10</jersey.version>
  <jetty-reactive-httpclient.version>4.0.9</jetty-reactive-httpclient.version>
  <jetty.version>12.0.21</jetty.version>
  <jmustache.version>1.16</jmustache.version>
  <jooq.version>3.19.23</jooq.version>
  <json-path.version>2.9.0</json-path.version>
  <json-smart.version>2.5.2</json-smart.version>
  <jsonassert.version>1.5.3</jsonassert.version>
  <jtds.version>1.3.1</jtds.version>
  <junit.version>4.13.2</junit.version>
  <junit-jupiter.version>5.12.2</junit-jupiter.version>
  <kafka.version>3.9.1</kafka.version>
  <kotlin.version>1.9.25</kotlin.version>
  <kotlin-coroutines.version>1.8.1</kotlin-coroutines.version>
  <kotlin-serialization.version>1.6.3</kotlin-serialization.version>
  <lettuce.version>6.5.5.RELEASE</lettuce.version>
  <liquibase.version>4.31.1</liquibase.version>
  <log4j2.version>2.24.3</log4j2.version>
  <logback.version>1.5.18</logback.version>
  <lombok.version>1.18.38</lombok.version>
  <mariadb.version>3.5.3</mariadb.version>
  <maven-antrun-plugin.version>3.1.0</maven-antrun-plugin.version>
  <maven-assembly-plugin.version>3.7.1</maven-assembly-plugin.version>
  <maven-clean-plugin.version>3.4.1</maven-clean-plugin.version>
  <maven-compiler-plugin.version>3.14.0</maven-compiler-plugin.version>
  <maven-dependency-plugin.version>3.8.1</maven-dependency-plugin.version>
  <maven-deploy-plugin.version>3.1.4</maven-deploy-plugin.version>
  <maven-enforcer-plugin.version>3.5.0</maven-enforcer-plugin.version>
  <maven-failsafe-plugin.version>3.5.3</maven-failsafe-plugin.version>
  <maven-help-plugin.version>3.5.1</maven-help-plugin.version>
  <maven-install-plugin.version>3.1.4</maven-install-plugin.version>
  <maven-invoker-plugin.version>3.9.0</maven-invoker-plugin.version>
  <maven-jar-plugin.version>3.4.2</maven-jar-plugin.version>
  <maven-javadoc-plugin.version>3.11.2</maven-javadoc-plugin.version>
  <maven-resources-plugin.version>3.3.1</maven-resources-plugin.version>
  <maven-shade-plugin.version>3.6.0</maven-shade-plugin.version>
  <maven-source-plugin.version>3.3.1</maven-source-plugin.version>
  <maven-surefire-plugin.version>3.5.3</maven-surefire-plugin.version>
  <maven-war-plugin.version>3.4.0</maven-war-plugin.version>
  <micrometer.version>1.15.0</micrometer.version>
  <micrometer-tracing.version>1.5.0</micrometer-tracing.version>
  <mockito.version>5.17.0</mockito.version>
  <mongodb.version>5.4.0</mongodb.version>
  <mssql-jdbc.version>12.10.0.jre11</mssql-jdbc.version>
  <mysql.version>9.2.0</mysql.version>
  <native-build-tools-plugin.version>0.10.6</native-build-tools-plugin.version>
  <nekohtml.version>1.9.22</nekohtml.version>
  <neo4j-java-driver.version>5.28.5</neo4j-java-driver.version>
  <netty.version>4.1.121.Final</netty.version>
  <opentelemetry.version>1.49.0</opentelemetry.version>
  <oracle-database.version>23.7.0.25.01</oracle-database.version>
  <oracle-r2dbc.version>1.3.0</oracle-r2dbc.version>
  <pooled-jms.version>3.1.7</pooled-jms.version>
  <postgresql.version>42.7.5</postgresql.version>
  <prometheus-client.version>1.3.6</prometheus-client.version>
  <prometheus-simpleclient.version>0.16.0</prometheus-simpleclient.version>
  <pulsar.version>4.0.4</pulsar.version>
  <pulsar-reactive.version>0.6.0</pulsar-reactive.version>
  <quartz.version>2.5.0</quartz.version>
  <querydsl.version>5.1.0</querydsl.version>
  <r2dbc-h2.version>1.0.0.RELEASE</r2dbc-h2.version>
  <r2dbc-mariadb.version>1.3.0</r2dbc-mariadb.version>
  <r2dbc-mssql.version>1.0.2.RELEASE</r2dbc-mssql.version>
  <r2dbc-mysql.version>1.4.1</r2dbc-mysql.version>
  <r2dbc-pool.version>1.0.2.RELEASE</r2dbc-pool.version>
  <r2dbc-postgresql.version>1.0.7.RELEASE</r2dbc-postgresql.version>
  <r2dbc-proxy.version>1.1.6.RELEASE</r2dbc-proxy.version>
  <r2dbc-spi.version>1.0.0.RELEASE</r2dbc-spi.version>
  <rabbit-amqp-client.version>5.25.0</rabbit-amqp-client.version>
  <rabbit-stream-client.version>0.23.0</rabbit-stream-client.version>
  <reactive-streams.version>1.0.4</reactive-streams.version>
  <reactor-bom.version>2024.0.6</reactor-bom.version>
  <rest-assured.version>5.5.2</rest-assured.version>
  <rsocket.version>1.1.5</rsocket.version>
  <rxjava3.version>3.1.10</rxjava3.version>
  <saaj-impl.version>3.0.4</saaj-impl.version>
  <selenium.version>4.31.0</selenium.version>
  <selenium-htmlunit.version>4.30.0</selenium-htmlunit.version>
  <sendgrid.version>4.10.3</sendgrid.version>
  <slf4j.version>2.0.17</slf4j.version>
  <snakeyaml.version>2.4</snakeyaml.version>
  <spring-amqp.version>3.2.5</spring-amqp.version>
  <spring-authorization-server.version>1.5.0</spring-authorization-server.version>
  <spring-batch.version>5.2.2</spring-batch.version>
  <spring-data-bom.version>2025.0.0</spring-data-bom.version>
  <spring-framework.version>6.2.7</spring-framework.version>
  <spring-graphql.version>1.4.0</spring-graphql.version>
  <spring-hateoas.version>2.5.0</spring-hateoas.version>
  <spring-integration.version>6.5.0</spring-integration.version>
  <spring-kafka.version>3.3.6</spring-kafka.version>
  <spring-ldap.version>3.3.0</spring-ldap.version>
  <spring-pulsar.version>1.2.6</spring-pulsar.version>
  <spring-restdocs.version>3.0.3</spring-restdocs.version>
  <spring-retry.version>2.0.12</spring-retry.version>
  <spring-security.version>6.5.0</spring-security.version>
  <spring-session.version>3.5.0</spring-session.version>
  <spring-ws.version>4.1.0</spring-ws.version>
  <sqlite-jdbc.version>3.49.1.0</sqlite-jdbc.version>
  <testcontainers.version>1.21.0</testcontainers.version>
  <testcontainers-redis-module.version>2.2.4</testcontainers-redis-module.version>
  <thymeleaf.version>3.1.3.RELEASE</thymeleaf.version>
  <thymeleaf-extras-data-attribute.version>2.0.1</thymeleaf-extras-data-attribute.version>
  <thymeleaf-extras-springsecurity.version>3.1.3.RELEASE</thymeleaf-extras-springsecurity.version>
  <thymeleaf-layout-dialect.version>3.4.0</thymeleaf-layout-dialect.version>
  <tomcat.version>10.1.41</tomcat.version>
  <unboundid-ldapsdk.version>7.0.2</unboundid-ldapsdk.version>
  <undertow.version>2.3.18.Final</undertow.version>
  <versions-maven-plugin.version>2.18.0</versions-maven-plugin.version>
  <vibur.version>26.0</vibur.version>
  <webjars-locator-core.version>0.59</webjars-locator-core.version>
  <webjars-locator-lite.version>1.1.0</webjars-locator-lite.version>
  <wsdl4j.version>1.6.3</wsdl4j.version>
  <xml-maven-plugin.version>1.1.0</xml-maven-plugin.version>
  <xmlunit2.version>2.10.1</xmlunit2.version>
  <yasson.version>3.0.4</yasson.version>
</properties>
```

**插件配置也会自动继承，包括 Spring Boot Maven 插件、编译器插件、资源插件等关键构建组件的预配置参数**。

SpringBoot3.5.0 的 spring-boot-dependencies 默认维护的插件配置如下：

资源配置：

```xml
<resources>
  <resource>
    <directory>${basedir}/src/main/resources</directory>
    <filtering>true</filtering>
    <includes>
      <include>**/application*.yml</include>
      <include>**/application*.yaml</include>
      <include>**/application*.properties</include>
    </includes>
  </resource>
  <resource>
    <directory>${basedir}/src/main/resources</directory>
    <excludes>
      <exclude>**/application*.yml</exclude>
      <exclude>**/application*.yaml</exclude>
      <exclude>**/application*.properties</exclude>
    </excludes>
  </resource>
</resources>
```

Spring Boot Maven 插件配置：

```xml
<pluginManagement>
  <plugins>
    <plugin>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-maven-plugin</artifactId>
      <executions>
        <execution>
          <id>repackage</id>
          <goals>
            <goal>repackage</goal>
          </goals>
        </execution>
      </executions>
      <configuration>
        <mainClass>${spring-boot.run.main-class}</mainClass>
      </configuration>
    </plugin>
    <!-- ... -->
  </plugins>
</pluginManagement>
```

编译器插件配置：

```xml
<pluginManagement>
  <plugins>
    <plugin>
      <groupId>org.apache.maven.plugins</groupId>
      <artifactId>maven-compiler-plugin</artifactId>
      <configuration>
        <parameters>true</parameters>
      </configuration>
    </plugin>
    <!-- ... -->
  </plugins>
</pluginManagement>
```

资源插件配置：

```xml
<pluginManagement>
  <plugins>
    <plugin>
      <groupId>org.apache.maven.plugins</groupId>
      <artifactId>maven-resources-plugin</artifactId>
      <configuration>
        <propertiesEncoding>${project.build.sourceEncoding}</propertiesEncoding>
        <delimiters>
          <delimiter>${resource.delimiter}</delimiter>
        </delimiters>
        <useDefaultDelimiters>false</useDefaultDelimiters>
      </configuration>
    </plugin>
    <!-- ... -->
  </plugins>
</pluginManagement>
```

### 配置示例

通过继承 `spring-boot-starter-parent` 父项目的方式构建的项目，由于大部分版本、依赖、插件已经被默认维护，因此在使用时我们只需简单引入需要的 `<dependencyManagement>` 和 `<pluginManagement>` 管理的依赖或者插件即可，不需要制定版本号和其他配置，除非有特殊需求可以通过明确配置进行覆盖。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    
    <!-- 继承 Spring Boot 父项目 -->
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.5.0</version>
        <relativePath/>
    </parent>
    
    <groupId>club.slavopolis</groupId>
    <artifactId>slavopolis-springboot</artifactId>
    <version>1.0.0-SNAPSHOT</version>
  
    <name>Spring Boot Parent Integration Demo</name>
    
    <properties>
        <java.version>21</java.version>
    </properties>
    
    <dependencies>
        <!-- Spring Boot 相关依赖无需版本号，已经在 spring-boot-starter-parent 维护了兼容的版本号  -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
        
        <!-- 第三方依赖没有被 spring-boot-starter-parent 进行管理，需要指定版本 -->
        <dependency>
            <groupId>com.mysql</groupId>
            <artifactId>mysql-connector-j</artifactId>
            <scope>runtime</scope>
        </dependency>
    </dependencies>
    
    <build>
        <plugins>
            <!-- Spring Boot Maven 插件自动配置 -->
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
```

### 优势分析

继承方案的最大优势是配置简化。开发团队无需深入了解复杂的 Maven 配置细节，即可获得经过优化的构建环境。依赖版本管理完全自动化，**当 Spring Boot 发布新版本时，升级过程通常只需要修改父项目的版本号**。

插件配置的继承确保了构建过程的一致性。Spring Boot Maven 插件的预配置参数经过深度优化，能够生成高质量的可执行 JAR 文件。编译器插件、测试插件和资源处理插件的标准配置为项目提供了可靠的构建基础。资源过滤和多环境支持通过继承的配置自动启用。Maven 的资源过滤功能与 Spring Boot 的外部化配置相结合，实现了配置参数的动态替换和环境特定优化。

### 适用场景

继承方案最适合**新项目开发**和**标准化程度较高**的环境。对于没有复杂父项目结构约束的项目，这种方案提供了最佳的开发体验。中小型开发团队特别受益于这种简化的配置方式，能够将更多精力投入到业务逻辑实现中。

然而，继承方案在某些场景下存在明显限制。**已经存在复杂父项目结构的企业级应用无法直接采用这种方案，因为 Maven 不支持多重继承**。需要与现有企业级构建标准集成的项目可能发现继承方案的灵活性不足。对于需要精确控制每个依赖版本的安全敏感型应用，继承方案的自动版本管理可能被视为不够透明。这类应用通常需要对每个依赖进行独立的安全评估和版本控制。

## 导入 spring-boot-dependencies 方案

### 实现原理

导入 `spring-boot-dependencies` 方案通过 Maven 的依赖管理导入机制实现 Spring Boot 集成。该方案的核心在于将**依赖管理与项目继承解耦**，使得项目可以**继承自定义的企业级父项目，同时享受 Spring Boot 的依赖管理优势**。

技术实现上，这种方案利用了 **Maven 的 BOM（Bill of Materials）机制**。因为 `spring-boot-dependencies` 本质上是一个包含大量依赖版本定义的 POM 文件，通过 import scope 导入后，项目可以使用这些预定义的版本号，而无需在每个依赖声明中指定具体版本。

```xml
<!-- 依赖管理：导入 Spring Boot BOM -->
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-dependencies</artifactId>
            <version>${spring-boot.version}</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```

这种设计模式的优势在于其模块化特性。项目可以同时导入多个 BOM 文件，例如 Spring Boot BOM、企业框架 BOM 和第三方库 BOM，实现更加精细化的依赖管理。

### 配置示例

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    
    <!-- 继承企业父项目 -->
    <parent>
        <groupId>com.enterprise</groupId>
        <artifactId>enterprise-parent</artifactId>
        <version>2.1.0</version>
    </parent>
    
    <groupId>com.example</groupId>
    <artifactId>springboot-import-demo</artifactId>
    <version>1.0.0</version>
    <name>Spring Boot Import Integration Demo</name>
    
    <properties>
        <spring-boot.version>3.5.0</spring-boot.version>
        <java.version>21</java.version>
    </properties>
    
    <!-- 依赖管理：导入 Spring Boot BOM -->
    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-dependencies</artifactId>
                <version>${spring-boot.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>
    
    <dependencies>
        <!-- Spring Boot 依赖无需版本号 -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
        
        <dependency>
            <groupId>com.mysql</groupId>
            <artifactId>mysql-connector-j</artifactId>
            <scope>runtime</scope>
        </dependency>
    </dependencies>
    
    <build>
        <plugins>
            <!-- 因为没有集成 spring-boot-starter-parent，所以需要显式配置 Spring Boot Maven 插件 -->
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <version>${spring-boot.version}</version>
                <executions>
                    <execution>
                        <goals>
                            <goal>repackage</goal>
                        </goals>
                    </execution>
                </executions>
            </plugin>
        </plugins>
    </build>
</project>
```

在复杂的企业环境中，导入方案展现出更大的灵活性：

```xml
<dependencyManagement>
    <dependencies>
        <!-- 导入 Spring Boot 依赖管理 -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-dependencies</artifactId>
            <version>${spring-boot.version}</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
        
        <!-- 导入企业框架 BOM -->
        <dependency>
            <groupId>com.enterprise.framework</groupId>
            <artifactId>enterprise-framework-bom</artifactId>
            <version>${enterprise.framework.version}</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
        
        <!-- 导入第三方库 BOM -->
        <dependency>
            <groupId>org.testcontainers</groupId>
            <artifactId>testcontainers-bom</artifactId>
            <version>${testcontainers.version}</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
        
        <!-- 版本覆盖示例 -->
        <dependency>
            <groupId>com.mysql</groupId>
            <artifactId>mysql-connector-j</artifactId>
            <version>${mysql.version}</version>
        </dependency>
    </dependencies>
</dependencyManagement>
```

### 核心优势

导入方案的最大优势是灵活性。**项目可以继承现有的企业级父项目，同时通过导入机制获得 Spring Boot 的依赖管理支持**。这种分离式设计允许项目同时利用多个 BOM 文件的依赖管理能力。

版本控制的精确性是另一个重要优势。开发团队**可以选择性地导入不同的 BOM 文件，并且可以通过显式版本声明覆盖 BOM 中的版本定义**。这种精确控制能力对于安全敏感型应用特别重要。构建配置的完全控制权使得项目可以根据特定需求定制构建过程。虽然需要显式配置 Spring Boot Maven 插件，但这也提供了更大的定制空间。

### 适用场景

导入方案特别**适合已经存在复杂父项目结构的企业级应用**。当组织已经建立了标准化的企业级父项目时，导入方案允许在不破坏现有结构的前提下集成 Spring Boot。

需要精确依赖版本控制的项目也适合采用导入方案。通过多个 BOM 文件的组合使用，可以实现更加精细化的版本管理策略。大型组织中的多项目协作场景是导入方案的另一个典型应用场景。不同项目可以根据各自的需求选择不同的 BOM 组合，同时保持整体架构的一致性。

## 两种方案对比

| 类别           | 继承方案                                                     | 导入方案                                                     |
| -------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 依赖管理机制   | 通过项目继承获得完整的依赖管理，包括版本号、scope 定义和 exclusion 配置。依赖管理是全自动的，开发者很少需要关心版本兼容性问题。 | 仅获得版本管理，其他依赖属性需要项目自行定义。虽然提供了更精细的控制能力，但也要求开发者具备更深入的依赖管理知识。 |
| 插件配置差异   | 自动继承所有插件配置，包括 Spring Boot Maven 插件、编译器插件、资源插件等。这些插件的配置参数都经过了优化，无需额外配置即可使用。 | 需要显式配置所有必要的插件。虽然增加了配置工作量，但也提供了完全的定制自由度。项目可以根据具体需求调整插件配置参数。 |
| 项目结构灵活性 | 要求项目直接继承 `spring-boot-starter-parent`，这限制了项目的父项目选择。对于已有复杂父项目结构的企业应用，这种限制可能成为采用障碍。 | 允许项目继承任意父项目，同时通过导入机制获得 Spring Boot 支持。这种灵活性使得 Spring Boot 可以无缝集成到现有的企业级项目结构中。 |
| 版本升级策略   | 通常只需要修改父项目版本号，所有相关依赖会自动跟进升级。这种自动化升级简化了维护工作，但也可能引入未预期的变更。 | 需要明确指定 BOM 版本，并且可能需要检查和调整其他相关配置。虽然工作量较大，但提供了更好的变更控制能力。 |