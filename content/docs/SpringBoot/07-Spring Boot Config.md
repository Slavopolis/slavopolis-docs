# Spring Boot 配置管理

配置管理是每个 Spring Boot 项目都必须面对的核心问题。从最初的几行配置，到后来的多环境、多模块、配置加密，再到微服务架构下的配置中心集成，配置管理的复杂度在不断提升。

这篇文章将从实际开发场景出发，带你系统性地掌握 Spring Boot 配置管理的完整体系。我们不仅要学会如何写配置，更要理解为什么这样写，以及在什么场景下使用什么方案。

## 第一章：配置类基础

### 1.1 为什么需要配置类？

先看一个真实的问题：假设你正在开发一个电商系统，需要集成多个外部服务：支付网关、短信服务、邮件服务。传统的做法是什么？

**传统 XML 配置方式的痛点：**

```xml
<!-- 以前的做法 -->
<bean id="paymentService" class="com.example.PaymentServiceImpl">
    <property name="apiUrl" value="https://api.payment.com"/>
    <property name="apiKey" value="your-api-key"/>
    <property name="timeout" value="30000"/>
</bean>

<bean id="smsService" class="com.example.SmsServiceImpl">
    <property name="endpoint" value="https://sms.provider.com"/>
    <property name="username" value="sms-user"/>
    <property name="password" value="sms-pass"/>
</bean>
```

这种方式存在几个明显问题：
1. **配置分散**：Bean 定义和属性配置分离，维护困难
2. **类型不安全**：所有配置都是字符串，编译期无法检查
3. **IDE 支持差**：没有代码提示和重构支持
4. **测试困难**：很难为测试环境提供不同的配置

### 1.2 配置类的正确打开方式

Spring Boot 的配置类彻底解决了这些问题。让我们用配置类重新实现上面的需求：

```java
@Configuration
@EnableConfigurationProperties({PaymentProperties.class, SmsProperties.class})
public class ExternalServiceConfiguration {
    
    @Bean
    public PaymentService paymentService(PaymentProperties properties) {
        return PaymentServiceBuilder.newBuilder()
            .apiUrl(properties.getApiUrl())
            .apiKey(properties.getApiKey())
            .timeout(properties.getTimeout())
            .build();
    }
    
    @Bean
    @ConditionalOnProperty(name = "app.sms.enabled", havingValue = "true")
    public SmsService smsService(SmsProperties properties) {
        SmsServiceImpl service = new SmsServiceImpl();
        service.setEndpoint(properties.getEndpoint());
        service.setCredentials(properties.getUsername(), properties.getPassword());
        return service;
    }
}
```

**这样做的好处立刻显现：**

1. **集中管理**：相关的 Bean 配置集中在一个类中
2. **条件装配**：可以根据配置条件决定是否创建 Bean
3. **类型安全**：通过 Properties 类提供强类型支持
4. **易于测试**：可以轻松创建测试配置

### 1.3 @Configuration vs @SpringBootConfiguration

很多开发者对这两个注解的区别感到困惑。让我们来看看它们的实际差异：

```java
// @SpringBootConfiguration 的源码
@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Configuration
@Indexed
public @interface SpringBootConfiguration {
    @AliasFor(
        annotation = Configuration.class
    )
    boolean proxyBeanMethods() default true;
}
```

从源码可以看出，`@SpringBootConfiguration` 本质上就是 `@Configuration` 的封装。但是为什么 Spring Boot 要单独提供这个注解？

**实际的区别在于语义和工具支持：**

```java
// 应用主配置类 - 使用 @SpringBootConfiguration
@SpringBootConfiguration // 内部包含 @EnableAutoConfiguration、@ComponentScan 等
@EnableAutoConfiguration
@ComponentScan
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}

// 功能模块配置类 - 使用 @Configuration
@Configuration
@ConditionalOnClass(RedisTemplate.class)
public class RedisConfiguration {
    // Redis相关Bean配置
}
```

**选择原则：**
- **主应用类**：使用 `@SpringBootConfiguration`，表明这是 Spring Boot 应用的主配置
- **功能模块配置类**：使用 `@Configuration`，表明这是特定功能的配置

### 1.4 模块化配置

在实际项目中，我们通常需要按功能模块组织配置。这里展示一个真实项目的配置组织方式：

```java
// 数据库配置模块
@Configuration
@EnableJpaRepositories(basePackages = "com.example.repository")
@EnableTransactionManagement
public class DatabaseConfiguration {
    
    @Primary
    @Bean
    @ConfigurationProperties("spring.datasource.primary")
    public DataSource primaryDataSource() {
        return DataSourceBuilder.create().build();
    }
    
    @Bean
    @ConditionalOnProperty(name = "spring.datasource.readonly.enabled")
    public DataSource readOnlyDataSource() {
        return DataSourceBuilder.create().build();
    }
}

// 缓存配置模块
@Configuration
@EnableCaching
@ConditionalOnClass(RedisTemplate.class)
public class CacheConfiguration {
    
    @Bean
    public CacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
            .entryTtl(Duration.ofMinutes(30))
            .serializeKeysWith(RedisSerializationContext.SerializationPair
                .fromSerializer(new StringRedisSerializer()))
            .serializeValuesWith(RedisSerializationContext.SerializationPair
                .fromSerializer(new GenericJackson2JsonRedisSerializer()));
        
        return RedisCacheManager.builder(connectionFactory)
            .cacheDefaults(config)
            .build();
    }
}
```

**模块化配置的优势：**
1. **职责单一**：每个配置类只负责一个功能域
2. **易于维护**：修改某个功能的配置不会影响其他模块
3. **便于测试**：可以独立测试每个配置模块
4. **条件装配**：可以基于环境或条件选择性地加载配置

### 1.5 配置导入策略

当项目规模增大时，如何优雅地组织和导入配置成为关键问题。Spring 提供了多种导入方式，我们需要根据场景选择合适的策略。

**1. 静态导入 - 最常用的方式**

```java
@Configuration
@Import({
    DatabaseConfiguration.class,
    CacheConfiguration.class,
    SecurityConfiguration.class
})
public class ApplicationConfiguration {
    // 主配置逻辑
}
```

这种方式适合配置类比较固定的场景，编译期就能确定要导入哪些配置。

**2. 动态导入 - 基于条件的智能选择**

有时候我们需要根据运行时环境或条件来决定导入哪些配置。这就需要用到 `ImportSelector`：

```java
public class SmartConfigurationSelector implements ImportSelector {
    
    @Override
    public String[] selectImports(AnnotationMetadata metadata) {
        List<String> configurations = new ArrayList<>();
        
        // 根据 Profile 选择配置
        String activeProfile = System.getProperty("spring.profiles.active", "dev");
        switch (activeProfile) {
            case "prod":
                configurations.add("com.example.config.ProductionConfiguration");
                break;
            case "test":
                configurations.add("com.example.config.TestConfiguration");
                break;
            default:
                configurations.add("com.example.config.DevelopmentConfiguration");
        }
        
        // 根据 Classpath 动态选择
        if (ClassUtils.isPresent("org.springframework.kafka.core.KafkaTemplate", null)) {
            configurations.add("com.example.config.KafkaConfiguration");
        }
        
        if (ClassUtils.isPresent("org.springframework.data.redis.core.RedisTemplate", null)) {
            configurations.add("com.example.config.RedisConfiguration");
        }
        
        return configurations.toArray(new String[0]);
    }
}

// 使用动态导入
@Configuration
@Import(SmartConfigurationSelector.class)
public class ApplicationConfiguration {
    // 主配置逻辑
}
```

**3. 配置扫描 - 约定大于配置**

对于遵循命名约定的配置类，可以使用包扫描：

```java
@Configuration
@ComponentScan(basePackages = "com.example.config")
public class ApplicationConfiguration {
    // 自动扫描并注册所有 @Configuration 类
}
```

### 1.6 实战案例：构建一个电商系统的配置架构

让我们通过一个真实的电商系统来理解配置类的最佳实践。这个系统需要集成：数据库、Redis缓存、消息队列、支付服务、物流服务。

```java
// 主配置类 - 应用入口
@SpringBootApplication
@Import(SmartConfigurationSelector.class) // 使用智能选择器
public class ECommerceApplication {
    public static void main(String[] args) {
        SpringApplication.run(ECommerceApplication.class, args);
    }
}

// 数据持久化配置
@Configuration
@EnableJpaRepositories(basePackages = "com.example.repository")
@EnableTransactionManagement
public class PersistenceConfiguration {
    
    @Bean
    @Primary
    public DataSource primaryDataSource() {
        // 主数据源配置
        return DataSourceBuilder.create().build();
    }
    
    @Bean
    @ConditionalOnProperty(name = "app.database.read-replica.enabled")
    public DataSource readOnlyDataSource() {
        // 只读副本配置
        return DataSourceBuilder.create().build();
    }
}

// 外部服务集成配置
@Configuration
@EnableConfigurationProperties({PaymentProperties.class, ShippingProperties.class})
public class ExternalServiceConfiguration {
    
    @Bean
    @ConditionalOnProperty(name = "app.payment.provider", havingValue = "alipay")
    public PaymentService alipayService(PaymentProperties properties) {
        return new AlipayService(properties.getAlipay());
    }
    
    @Bean
    @ConditionalOnProperty(name = "app.payment.provider", havingValue = "wechat")
    public PaymentService wechatPayService(PaymentProperties properties) {
        return new WechatPayService(properties.getWechat());
    }
    
    @Bean
    public ShippingService shippingService(ShippingProperties properties) {
        return ShippingServiceFactory.create(properties);
    }
}
```

**这样设计的好处：**
1. **清晰的分层**：每个配置类负责一个业务域
2. **灵活的装配**：可以根据配置动态选择实现
3. **易于扩展**：新增服务只需要新增配置类
4. **便于测试**：可以为不同场景提供不同的配置

### 1.7 常见陷阱与最佳实践

**陷阱1：配置类过度拆分**
```java
// 错误的做法 - 过度拆分
@Configuration
public class RedisHostConfiguration {
    // 只配置一个属性
}

@Configuration  
public class RedisPortConfiguration {
    // 只配置一个属性
}

// 正确的做法 - 合理聚合
@Configuration
public class RedisConfiguration {
    // 完整的Redis配置
}
```

**陷阱2：循环依赖**
```java
// 可能导致循环依赖的配置
@Configuration
public class ServiceAConfiguration {
    @Bean
    public ServiceA serviceA(ServiceB serviceB) { // 依赖ServiceB
        return new ServiceA(serviceB);
    }
}

@Configuration
public class ServiceBConfiguration {
    @Bean
    public ServiceB serviceB(ServiceA serviceA) { // 依赖ServiceA
        return new ServiceB(serviceA);
    }
}
```

**最佳实践：**
1. **按功能域划分**：将相关的 Bean 配置放在同一个配置类中
2. **使用条件注解**：避免不必要的 Bean 创建
3. **合理使用 @Primary**：当有多个相同类型的 Bean 时明确主 Bean
4. **避免复杂的依赖关系**：配置类之间应该保持简单的依赖关系

## 第二章：配置文件的艺术

配置文件是 Spring Boot 应用的 "基因"，它决定了应用的行为特征。但是很多开发者对配置文件的理解还停留在 "能跑就行" 的阶段，缺乏系统性的认知。

### 2.1 Properties vs YAML

让我们从一个真实的痛点开始：假设你需要配置一个多数据源的应用，同时需要支持不同环境的配置。

**Properties 格式的挑战：**

```properties
# application.properties - 看起来很 "扁平"
spring.datasource.primary.url=jdbc:mysql://localhost:3306/primary_db
spring.datasource.primary.username=root
spring.datasource.primary.password=password
spring.datasource.primary.hikari.maximum-pool-size=20
spring.datasource.primary.hikari.minimum-idle=5

spring.datasource.secondary.url=jdbc:mysql://localhost:3306/secondary_db
spring.datasource.secondary.username=root
spring.datasource.secondary.password=password
spring.datasource.secondary.hikari.maximum-pool-size=10
spring.datasource.secondary.hikari.minimum-idle=2

spring.redis.host=localhost
spring.redis.port=6379
spring.redis.password=
spring.redis.lettuce.pool.max-active=200
spring.redis.lettuce.pool.max-idle=20
```

这种配置方式的问题显而易见：
1. **可读性差**：配置层次关系不清晰
2. **重复冗余**：前缀重复太多
3. **维护困难**：修改一个配置需要找很久

**YAML 格式的优雅：**

```yaml
# application.yml - 层次清晰
spring:
  datasource:
    primary:
      url: jdbc:mysql://localhost:3306/primary_db
      username: root
      password: password
      hikari:
        maximum-pool-size: 20
        minimum-idle: 5
    secondary:
      url: jdbc:mysql://localhost:3306/secondary_db
      username: root
      password: password
      hikari:
        maximum-pool-size: 10
        minimum-idle: 2
  
  redis:
    host: localhost
    port: 6379
    password: 
    lettuce:
      pool:
        max-active: 200
        max-idle: 20
```

**选择原则：**
- **小型项目**：Properties 足够，简单直接
- **中大型项目**：YAML 更适合，层次清晰，易于维护
- **配置复杂度高**：YAML 必选，支持复杂数据结构
- **团队协作**：YAML 更友好，减少配置冲突

### 2.2 环境变量替换

在实际项目中，不同环境的配置往往不同。硬编码配置值是大忌，我们需要让配置具备环境适应性。

**基础用法：**

```yaml
spring:
  datasource:
    url: jdbc:mysql://${DB_HOST:localhost}:${DB_PORT:3306}/${DB_NAME:myapp}
    username: ${DB_USERNAME:root}
    password: ${DB_PASSWORD:password}
  
  redis:
    host: ${REDIS_HOST:localhost}
    port: ${REDIS_PORT:6379}
    password: ${REDIS_PASSWORD:}

app:
  jwt:
    secret: ${JWT_SECRET:default-secret-key}
    expiration: ${JWT_EXPIRATION:86400000}
```

**语法说明：**
- `${VARIABLE_NAME}`：必须提供的环境变量，否则启动失败
- `${VARIABLE_NAME:default_value}`：可选环境变量，提供默认值

**高级用法 - 条件替换：**

```yaml
# 根据环境决定配置值
spring:
  profiles:
    active: ${SPRING_PROFILES_ACTIVE:dev}
  
  datasource:
    url: ${DATABASE_URL:jdbc:h2:mem:testdb}
    # 生产环境使用环境变量，开发环境使用默认值

logging:
  level:
    com.example: ${LOG_LEVEL:INFO}
    # 开发环境可能设置为DEBUG，生产环境保持INFO
```

### 2.3 配置的层次结构设计

好的配置文件应该像一本书的目录一样，结构清晰，层次分明。让我们看一个企业级应用的配置结构：

```yaml
# 服务器配置
server:
  port: ${SERVER_PORT:8080}
  servlet:
    context-path: /api/v1
  tomcat:
    max-threads: ${TOMCAT_MAX_THREADS:200}
    accept-count: ${TOMCAT_ACCEPT_COUNT:100}

# Spring框架配置
spring:
  application:
    name: ${APP_NAME:ecommerce-service}
  
  # 数据源配置
  datasource:
    primary:
      url: ${PRIMARY_DB_URL}
      username: ${PRIMARY_DB_USERNAME}
      password: ${PRIMARY_DB_PASSWORD}
      hikari:
        maximum-pool-size: ${PRIMARY_DB_POOL_SIZE:20}
        connection-timeout: ${PRIMARY_DB_TIMEOUT:30000}
  
  # JPA配置
  jpa:
    hibernate:
      ddl-auto: ${JPA_DDL_AUTO:validate}
    show-sql: ${JPA_SHOW_SQL:false}
    properties:
      hibernate:
        format_sql: true
        dialect: org.hibernate.dialect.MySQL8Dialect

  # Redis配置
  redis:
    host: ${REDIS_HOST:localhost}
    port: ${REDIS_PORT:6379}
    database: ${REDIS_DATABASE:0}
    timeout: ${REDIS_TIMEOUT:2000ms}
    lettuce:
      pool:
        max-active: ${REDIS_POOL_MAX_ACTIVE:200}
        max-idle: ${REDIS_POOL_MAX_IDLE:20}
        min-idle: ${REDIS_POOL_MIN_IDLE:5}

# 日志配置
logging:
  level:
    com.example: ${APP_LOG_LEVEL:INFO}
    org.springframework.security: ${SECURITY_LOG_LEVEL:WARN}
    org.hibernate.SQL: ${SQL_LOG_LEVEL:WARN}
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n"
    file: "%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n"

# 应用自定义配置
app:
  # 业务功能开关
  features:
    payment-enabled: ${FEATURE_PAYMENT:true}
    notification-enabled: ${FEATURE_NOTIFICATION:true}
    analytics-enabled: ${FEATURE_ANALYTICS:false}
  
  # 外部服务配置
  external:
    payment-gateway:
      url: ${PAYMENT_GATEWAY_URL}
      api-key: ${PAYMENT_GATEWAY_API_KEY}
      timeout: ${PAYMENT_GATEWAY_TIMEOUT:5000ms}
    
    notification-service:
      url: ${NOTIFICATION_SERVICE_URL}
      api-key: ${NOTIFICATION_SERVICE_API_KEY}
      timeout: ${NOTIFICATION_SERVICE_TIMEOUT:3000ms}
  
  # 安全配置
  security:
    jwt:
      secret: ${JWT_SECRET}
      expiration: ${JWT_EXPIRATION:86400000}
      refresh-expiration: ${JWT_REFRESH_EXPIRATION:604800000}
    
    cors:
      allowed-origins: ${CORS_ALLOWED_ORIGINS:*}
      allowed-methods: ${CORS_ALLOWED_METHODS:GET,POST,PUT,DELETE,OPTIONS}
      max-age: ${CORS_MAX_AGE:3600}

# 监控配置
management:
  endpoints:
    web:
      exposure:
        include: ${ACTUATOR_ENDPOINTS:health,info,metrics}
  endpoint:
    health:
      show-details: ${HEALTH_SHOW_DETAILS:when-authorized}
  metrics:
    export:
      prometheus:
        enabled: ${METRICS_PROMETHEUS_ENABLED:true}
```

**配置组织原则：**
1. **功能分组**：相关配置放在同一层级下
2. **层次清晰**：避免过深的嵌套（一般不超过4层）
3. **命名规范**：使用kebab-case命名，避免驼峰
4. **环境变量**：所有可能变化的配置都支持环境变量覆盖

### 2.4 配置文件加载机制

理解 Spring Boot 的配置加载机制非常重要，这关系到你的配置是否能按预期生效。让我们通过一个部署场景来理解这个机制。

**场景描述：**
你开发了一个 Spring Boot 应用，现在要部署到生产环境。你需要：

1. JAR 包内有默认配置
2. 生产环境有特定的数据库配置
3. 临时需要修改日志级别进行故障排查

**配置文件搜索路径（优先级从低到高）：**

```
1. classpath:/application.yml                 # JAR包内默认配置
2. classpath:/config/application.yml      # JAR包内config目录配置
3. file:./application.yml                         # JAR包同级目录配置
4. file:./config/application.yml              # JAR包同级config目录配置
5. file:./config/*/application.yml           # config子目录配置
```

**实际部署结构：**

```
production-server/
├── myapp.jar                                # 应用JAR包
├── application.yml                       # 生产环境基础配置（优先级3）
├── config/
│   ├── application.yml                 # 生产环境主配置（优先级4）
│   ├── database/
│   │   └── application.yml            # 数据库专用配置（优先级5）
│   └── logging/
│       └── application.yml             # 日志专用配置（优先级5）
└── logs/
```

**配置覆盖示例：**

```yaml
# JAR包内：src/main/resources/application.yml（优先级1）
server:
  port: 8080
logging:
  level:
    com.example: INFO
app:
  environment: development

---
# 生产服务器：./config/application.yml（优先级4）
server:
  port: 8443
  ssl:
    enabled: true
logging:
  level:
    com.example: WARN
app:
  environment: production

---
# 临时故障排查：./config/debug/application.yml（优先级5）
logging:
  level:
    com.example: DEBUG
    org.springframework: DEBUG
```

**最终生效配置：**
- `server.port`: 8443（被生产配置覆盖）
- `server.ssl.enabled`: true（生产配置新增）
- `logging.level.com.example`: DEBUG（被debug配置覆盖）
- `app.environment`: production（被生产配置覆盖）

**Profile 特定配置的加载：**

```yaml
# application.yml - 基础配置
spring:
  profiles:
    active: prod

---
# application-dev.yml - 开发环境配置
spring:
  config:
    activate:
      on-profile: dev
logging:
  level:
    com.example: DEBUG

---
# application-prod.yml - 生产环境配置  
spring:
  config:
    activate:
      on-profile: prod
logging:
  level:
    com.example: WARN
    root: ERROR
```

**自定义配置加载：**

有时候你需要更灵活的配置加载策略：

```java
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication app = new SpringApplication(Application.class);
        
        // 自定义配置文件位置
        app.setAdditionalProfiles("prod");
        
        // 自定义配置名称
        System.setProperty("spring.config.name", "myapp,database,cache");
        
        // 自定义配置位置
        System.setProperty("spring.config.location", 
            "classpath:/config/," +
            "file:./config/," +
            "file:/etc/myapp/config/");
        
        app.run(args);
    }
}
```

**配置加载最佳实践：**
1. **默认配置放在 JAR 包内**：确保应用有基础配置可以启动
2. **环境特定配置放在外部**：便于运维人员管理
3. **使用 config 子目录**：保持目录结构清晰
4. **合理使用 Profile**：避免配置文件过多
5. **配置文档化**：为运维人员提供配置说明

### 2.5 配置导入与外部化

Spring Boot 2.4+ 引入了配置导入功能，允许将配置拆分为多个文件：

1）在 application.yml 通过 spring.config.import 导入需要的外部配置：

```yaml
# application.yml
spring:
  config:
    import:
      - optional:classpath:database-config.yml
      - optional:classpath:cache-config.yml
      - optional:file:./external-config.yml
```

2）涉及到的外部配置示例

```yaml
# database-config.yml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/mydb
    username: ${DB_USER:admin}
    password: ${DB_PASSWORD:secret}
  
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
    properties:
      hibernate:
        format_sql: true
        use_sql_comments: true

# cache-config.yml
spring:
  cache:
    type: redis
    redis:
      time-to-live: 600000
      
  redis:
    host: ${REDIS_HOST:localhost}
    port: ${REDIS_PORT:6379}
    timeout: 2000ms
```

## 第三章：配置绑定

配置绑定是 Spring Boot 配置管理的核心功能。很多开发者还停留在使用 `@Value` 注解的阶段，但这种方式在面对复杂配置时显得力不从心。让我们看看如何优雅地处理配置绑定。

### 3.1 @Value 注解的困境

让我们从一个真实的案例开始：你正在开发一个邮件服务，需要配置 SMTP 服务器信息。

**传统 @Value 方式的代码：**

```java
@Service
public class EmailService {
    @Value("${email.smtp.host}")
    private String smtpHost;
    
    @Value("${email.smtp.port:587}")
    private int smtpPort;
    
    @Value("${email.smtp.username}")
    private String username;
    
    @Value("${email.smtp.password}")
    private String password;
    
    @Value("${email.smtp.auth:true}")
    private boolean enableAuth;
    
    @Value("${email.smtp.starttls:true}")
    private boolean enableStartTls;
    
    @Value("${email.smtp.ssl:false}")
    private boolean enableSsl;
    
    @Value("${email.retry.max-attempts:3}")
    private int maxRetryAttempts;
    
    @Value("${email.retry.delay:1000}")
    private long retryDelay;
    
    @Value("${email.template.path:classpath:/templates/email/}")
    private String templatePath;
    
    // 发送邮件的业务逻辑...
}
```

**这种方式的问题很明显：**

1. **配置分散**：配置分散在业务代码中，难以统一管理
2. **类型安全问题**：配置错误只有在运行时才能发现
3. **缺乏验证**：无法验证配置的有效性（比如端口范围、邮箱格式等）
4. **测试困难**：很难为测试提供不同的配置
5. **维护成本高**：新增配置项需要修改业务类

**更严重的问题 - 配置爆炸：**

想象一下，如果你的邮件服务需要支持多个 SMTP 提供商（Gmail、QQ邮箱、企业邮箱等），配置会变成什么样：

```java
// 噩梦般的配置代码
@Value("${email.providers.gmail.host}")
private String gmailHost;
@Value("${email.providers.gmail.port}")
private int gmailPort;
@Value("${email.providers.gmail.username}")
private String gmailUsername;
// ... 还有20多个Gmail相关配置

@Value("${email.providers.qq.host}")
private String qqHost;
@Value("${email.providers.qq.port}")
private int qqPort;
// ... 又是20多个QQ邮箱配置

// 这样下去，一个类可能有上百个 @Value 注解！
```

### 3.2 @ConfigurationProperties 的优雅解决方案

现在让我们用 `@ConfigurationProperties` 重新设计邮件服务的配置。对比之下，你会发现这是一个质的飞跃。

**重构后的邮件配置类：**

```java
@Data
@ConfigurationProperties(prefix = "email")
@Validated
public class EmailProperties {
    
    /**
     * 默认的邮件提供商
     */
    private String defaultProvider = "smtp";
    
    /**
     * 是否启用邮件功能
     */
    private boolean enabled = true;
    
    /**
     * 邮件提供商配置
     */
    private Map<String, SmtpConfig> providers = new HashMap<>();
    
    /**
     * 重试配置
     */
    @Valid
    private Retry retry = new Retry();
    
    /**
     * 模板配置
     */
    @Valid
    private Template template = new Template();
    
    @Data
    public static class SmtpConfig {
        
        @NotBlank(message = "SMTP服务器地址不能为空")
        private String host;
        
        @Min(value = 1, message = "端口号必须大于0")
        @Max(value = 65535, message = "端口号不能超过65535")
        private int port = 587;
        
        @Email(message = "用户名必须是有效的邮箱地址")
        private String username;
        
        @NotBlank(message = "密码不能为空")
        private String password;
        
        /**
         * 是否启用认证
         */
        private boolean auth = true;
        
        /**
         * 是否启用STARTTLS
         */
        private boolean starttls = true;
        
        /**
         * 是否启用SSL
         */
        private boolean ssl = false;
        
        /**
         * 连接超时时间
         */
        @DurationMin(seconds = 1)
        @DurationMax(minutes = 5)
        private Duration connectionTimeout = Duration.ofSeconds(30);
    }
    
    @Data
    public static class Retry {
        
        @Min(value = 0, message = "重试次数不能小于0")
        @Max(value = 10, message = "重试次数不能超过10")
        private int maxAttempts = 3;
        
        @DurationMin(milliseconds = 100)
        @DurationMax(minutes = 5)
        private Duration delay = Duration.ofSeconds(1);
        
        @DecimalMin(value = "1.0", message = "退避倍数不能小于1.0")
        @DecimalMax(value = "10.0", message = "退避倍数不能大于10.0")
        private double backoffMultiplier = 2.0;
    }
    
    @Data
    public static class Template {
        
        @NotBlank(message = "模板路径不能为空")
        private String basePath = "classpath:/templates/email/";
        
        @NotBlank(message = "默认编码不能为空")
        private String defaultEncoding = "UTF-8";
        
        /**
         * 支持的模板类型
         */
        private List<String> supportedTypes = Arrays.asList("html", "text");
        
        /**
         * 模板缓存配置
         */
        private boolean cacheEnabled = true;
        
        @DurationMin(minutes = 1)
        @DurationMax(hours = 24)
        private Duration cacheTtl = Duration.ofHours(1);
    }
}
```

**对应的配置文件：**

```yaml
email:
  enabled: true
  default-provider: gmail
  
  providers:
    gmail:
      host: smtp.gmail.com
      port: 587
      username: ${GMAIL_USERNAME}
      password: ${GMAIL_PASSWORD}
      auth: true
      starttls: true
      ssl: false
      connection-timeout: 30s
    
    qq:
      host: smtp.qq.com
      port: 587
      username: ${QQ_USERNAME}
      password: ${QQ_PASSWORD}
      auth: true
      starttls: true
      ssl: false
      connection-timeout: 30s
    
    enterprise:
      host: ${ENTERPRISE_SMTP_HOST}
      port: ${ENTERPRISE_SMTP_PORT:25}
      username: ${ENTERPRISE_SMTP_USERNAME}
      password: ${ENTERPRISE_SMTP_PASSWORD}
      auth: true
      starttls: false
      ssl: true
      connection-timeout: 60s
  
  retry:
    max-attempts: 3
    delay: 2s
    backoff-multiplier: 2.0
  
  template:
    base-path: classpath:/templates/email/
    default-encoding: UTF-8
    supported-types:
      - html
      - text
    cache-enabled: true
    cache-ttl: 2h
```

**在服务中使用配置：**

```java
@Service
@RequiredArgsConstructor
public class EmailService {
    
    private final EmailProperties emailProperties;
    
    public void sendEmail(String to, String subject, String content) {
        if (!emailProperties.isEnabled()) {
            log.info("邮件功能已禁用，跳过发送");
            return;
        }
        
        String providerName = emailProperties.getDefaultProvider();
        EmailProperties.SmtpConfig smtpConfig = emailProperties.getProviders().get(providerName);
        
        if (smtpConfig == null) {
            throw new IllegalStateException("未找到邮件提供商配置: " + providerName);
        }
        
        // 使用配置发送邮件
        sendEmailWithConfig(smtpConfig, to, subject, content);
    }
    
    private void sendEmailWithConfig(EmailProperties.SmtpConfig config, String to, String subject, String content) {
        Properties props = new Properties();
        props.put("mail.smtp.host", config.getHost());
        props.put("mail.smtp.port", config.getPort());
        props.put("mail.smtp.auth", config.isAuth());
        props.put("mail.smtp.starttls.enable", config.isStarttls());
        props.put("mail.smtp.ssl.enable", config.isSsl());
        props.put("mail.smtp.connectiontimeout", config.getConnectionTimeout().toMillis());
        
        // 邮件发送逻辑...
        log.info("通过{}发送邮件到{}", config.getHost(), to);
    }
}
```

**@ConfigurationProperties 的核心优势：**

1. **结构化配置**：相关配置组织在一起，层次清晰
2. **类型安全**：编译时检查，避免运行时类型错误
3. **验证支持**：集成 Bean Validation，确保配置有效性
4. **IDE 友好**：完整的代码提示和重构支持
5. **测试友好**：可以轻松创建测试配置
6. **文档化**：配置类本身就是最好的文档

**配置类的激活：**

```java
@Configuration
@EnableConfigurationProperties(EmailProperties.class)
public class EmailConfiguration {
    
    @Bean
    @ConditionalOnProperty(name = "email.enabled", havingValue = "true")
    public EmailService emailService(EmailProperties emailProperties) {
        return new EmailService(emailProperties);
    }
}
```

### 3.3 构造器绑定与不可变配置

前面我们看到了 `@ConfigurationProperties` 的强大功能，但还有一个更高级的用法：构造器绑定。这种方式可以创建不可变的配置对象，提供更好的线程安全性。

**什么时候使用构造器绑定？**

- 配置对象需要不可变性（final 字段）
- 希望在创建时就验证配置的完整性
- 需要更好的线程安全保证

**构造器绑定示例：**

```java
@ConfigurationProperties(prefix = "app.security")
@Validated
public class SecurityProperties {
    
    private final String jwtSecret;
    private final Duration jwtExpiration;
    private final CorsConfig cors;
    private final RateLimitConfig rateLimit;
    
    public SecurityProperties(
            @NotBlank String jwtSecret,
            @DefaultValue("PT24H") @DurationMin(hours = 1) Duration jwtExpiration,
            @Valid CorsConfig cors,
            @Valid RateLimitConfig rateLimit) {
        this.jwtSecret = jwtSecret;
        this.jwtExpiration = jwtExpiration;
        this.cors = cors;
        this.rateLimit = rateLimit;
    }
    
    // 只有 getter 方法，没有 setter
    public String getJwtSecret() { return jwtSecret; }
    public Duration getJwtExpiration() { return jwtExpiration; }
    public CorsConfig getCors() { return cors; }
    public RateLimitConfig getRateLimit() { return rateLimit; }
    
    public static class CorsConfig {
        private final List<String> allowedOrigins;
        private final List<String> allowedMethods;
        private final Duration maxAge;
        
        public CorsConfig(
                @DefaultValue("*") List<String> allowedOrigins,
                @DefaultValue("GET,POST,PUT,DELETE") List<String> allowedMethods,
                @DefaultValue("PT1H") Duration maxAge) {
            this.allowedOrigins = allowedOrigins;
            this.allowedMethods = allowedMethods;
            this.maxAge = maxAge;
        }
        
        // 只有getter方法
        public List<String> getAllowedOrigins() { return allowedOrigins; }
        public List<String> getAllowedMethods() { return allowedMethods; }
        public Duration getMaxAge() { return maxAge; }
    }
    
    public static class RateLimitConfig {
        private final int requestsPerSecond;
        private final int burstCapacity;
        
        public RateLimitConfig(
                @DefaultValue("100") @Min(1) int requestsPerSecond,
                @DefaultValue("200") @Min(1) int burstCapacity) {
            this.requestsPerSecond = requestsPerSecond;
            this.burstCapacity = burstCapacity;
        }
        
        public int getRequestsPerSecond() { return requestsPerSecond; }
        public int getBurstCapacity() { return burstCapacity; }
    }
}
```

**构造器绑定的优势：**
1. **不可变性**：一旦创建就不能修改，线程安全
2. **构造时验证**：在对象创建时就进行完整性检查
3. **明确的依赖关系**：构造器参数明确显示了必需的配置
4. **IDE支持更好**：构造器参数提供更好的代码提示

**不可变性原则**是构造器绑定模式的核心理念。通过将所有字段声明为 `final`，确保配置对象一旦创建就不能被修改。这种不可变性设计带来了多重好处：首先，它提高了线程安全性，因为不可变对象天然就是线程安全的；其次，它防止了意外的配置修改，确保了应用运行期间配置的稳定性；最后，它使得配置对象可以安全地在多个组件间共享，而不必担心状态被意外改变。

**明确的依赖关系**通过构造器参数明确地声明了配置对象的依赖关系。这种显式的依赖声明使得配置对象的创建过程更加透明，有助于理解配置项之间的关系和依赖。同时，这种方式也使得配置对象更容易进行单元测试，因为可以通过构造器直接创建具有特定配置的对象实例。

**默认值处理机制**通过 `@DefaultValue` 注解提供了优雅的默认值处理方案。这种机制允许开发者在构造器参数级别定义默认值，使得配置的默认行为更加明确和可控。相比于字段级别的默认值，构造器级别的默认值处理提供了更大的灵活性，可以根据其他参数的值动态计算默认值。

**编译时验证**构造器绑定模式提供了更强的编译时检查能力。由于所有的配置项都必须通过构造器传入，编译器可以确保所有必需的配置项都被正确提供。这种编译时验证大大减少了运行时错误的可能性，提高了应用的稳定性和可靠性。

### 3.4 Bean 级别的配置绑定

对于第三方库的配置，可以在 Bean 定义级别使用 `@ConfigurationProperties`。

**第三方库集成**是 Bean 级别配置绑定的主要应用场景。许多第三方库提供了自己的配置类或工厂类，这些类通常不支持 Spring Boot 的配置绑定注解。通过在 Bean 定义级别使用 `@ConfigurationProperties`，可以将 Spring Boot 的配置绑定能力扩展到这些第三方组件上，实现统一的配置管理体验。

**动态配置创建**允许在运行时根据配置动态创建和配置 Bean 实例。这种能力特别适用于需要根据不同配置创建不同实例的场景，如多数据源配置、多缓存配置等。通过结合条件注解如 `@ConditionalOnProperty`，可以实现更加灵活的条件化配置。

**配置后处理**在 Bean 级别进行配置绑定时，可以在配置绑定完成后对配置对象进行进一步的处理和验证。这种后处理能力使得可以实现复杂的配置逻辑，如配置项的交叉验证、动态配置计算、配置项的格式转换等。

**配置隔离与封装**通过为不同的功能模块创建独立的配置类和 Bean，可以实现配置的模块化管理。这种隔离机制不仅提高了配置的组织性，还降低了不同模块间的耦合度，使得系统更加易于维护和扩展。每个模块的配置变更不会影响其他模块，提高了系统的稳定性和可维护性。

```java
@Configuration
public class ThirdPartyConfiguration {
    
    @Bean
    @ConfigurationProperties(prefix = "app.elasticsearch")
    public ElasticsearchProperties elasticsearchProperties() {
        return new ElasticsearchProperties();
    }
    
    @Bean
    public ElasticsearchClient elasticsearchClient(ElasticsearchProperties properties) {
        return ElasticsearchClients.createDefault(
            ElasticsearchClientConfig.builder()
                .hosts(properties.getHosts())
                .username(properties.getUsername())
                .password(properties.getPassword())
                .timeout(properties.getTimeout())
                .build()
        );
    }
    
    @Bean
    @ConfigurationProperties(prefix = "app.rabbitmq")
    public CachingConnectionFactory rabbitConnectionFactory() {
        CachingConnectionFactory factory = new CachingConnectionFactory();
        factory.setPublisherConfirmType(CachingConnectionFactory.ConfirmType.CORRELATED);
        factory.setPublisherReturns(true);
        return factory;
    }
}
```

## 第四章：多环境配置管理

### 4.1 Profile 机制深度解析

Spring Boot 的 Profile 机制是实现多环境配置的核心功能。在企业级应用中，通常需要维护开发、测试、预生产、生产等多套环境配置。Profile 机制的核心价值体现在多个关键方面。

1. **环境隔离与配置分离**是 Profile 机制最基本也是最重要的功能。通过将不同环境的配置完全分离，可以确保每个环境具有独立的配置空间，避免了环境间的配置冲突和相互影响。这种隔离机制使得开发人员可以在开发环境中使用内存数据库和详细的调试日志，而在生产环境中使用高性能的数据库集群和精简的日志输出，各环境的配置需求都能得到最优化的满足。
2. **配置继承与覆盖机制**提供了高效的配置管理策略。基础配置文件中定义的通用配置项会被所有环境继承，而特定环境的配置会覆盖相应的基础配置。这种机制避免了配置的重复定义，减少了维护成本。例如，应用名称、API 路径前缀等通用配置只需要在基础配置中定义一次，而数据库连接、缓存配置等环境相关的配置则在各自的 Profile 中进行定制。
3. **运行时环境切换**能力使得同一套代码可以无缝地在不同环境中运行。通过简单地改变激活的 Profile，应用程序就能自动加载对应环境的配置，无需修改任何代码或重新编译。这种能力大大简化了部署流程，提高了部署的灵活性和可靠性。
4. **配置安全性增强**通过环境变量引用和外部化配置，Profile 机制还提供了重要的安全保障。敏感信息如数据库密码、API 密钥等不再需要硬编码在配置文件中，而是通过环境变量的方式在运行时注入，大大降低了敏感信息泄露的风险。

```yaml
# application.yml - 基础配置
spring:
  application:
    name: user-service
  profiles:
    active: @spring.profiles.active@  # Maven资源过滤

server:
  servlet:
    context-path: /api

logging:
  pattern:
    console: "%d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n"

---
# 开发环境配置 application-dev.yml 
spring:
  config:
    activate:
      on-profile: "dev"
      
server:
  port: 8080

spring:
  datasource:
    url: jdbc:h2:mem:testdb
    username: sa
    password: 
    driver-class-name: org.h2.Driver
  
  h2:
    console:
      enabled: true
      path: /h2-console
  
  jpa:
    hibernate:
      ddl-auto: create-drop
    show-sql: true
    
logging:
  level:
    com.example: DEBUG
    org.springframework.web: DEBUG

---
# 测试环境配置 application-test.yml 
spring:
  config:
    activate:
      on-profile: "test"
      
server:
  port: 8081

spring:
  datasource:
    url: jdbc:mysql://test-db:3306/user_test
    username: ${DB_USERNAME} # 环境变量
    password: ${DB_PASSWORD}
    
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
    
  redis:
    host: test-redis
    port: 6379

---
# 生产环境配置 application-prod.yml 
spring:
  config:
    activate:
      on-profile: "prod"
      
server:
  port: 8080

spring:
  datasource:
    url: jdbc:mysql://prod-db:3306/user_prod
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
    hikari:
      maximum-pool-size: 50
      minimum-idle: 10
    
  jpa:
    hibernate:
      ddl-auto: none
    show-sql: false
    
  redis:
    cluster:
      nodes:
        - prod-redis-1:6379
        - prod-redis-2:6379
        - prod-redis-3:6379

logging:
  level:
    com.example: INFO
  file:
    name: /var/log/user-service.log
```

### 4.2 Profile 分组与条件激活

在复杂的微服务架构中，可能需要更细粒度的 Profile 管理。

Profile 分组机制代表了 Spring Boot 配置管理的高级应用模式，为复杂企业应用提供了更加精细和灵活的配置管理能力。

**模块化配置设计**是 Profile 分组的核心理念。通过将功能相关的配置项组织成独立的 Profile 模块，可以实现更加清晰的配置架构。每个 Profile 模块专注于特定的功能领域，如数据库类型、缓存策略、外部服务集成方式等。这种模块化设计使得配置的职责分离更加明确，提高了配置的可读性和可维护性。

**组合式配置策略**通过 Profile 分组功能，可以将多个相关的 Profile 组合成一个逻辑单元。这种组合方式提供了极大的灵活性，使得可以根据不同的部署场景和业务需求，快速组装出合适的配置组合。例如，本地开发环境可能需要内存数据库、模拟外部服务和详细的调试配置的组合，而生产环境则需要集群数据库、真实外部服务和监控配置的组合。

**条件化激活机制**使得 Profile 的激活可以基于更加复杂的条件逻辑。不仅可以基于简单的 Profile 名称进行激活，还可以结合环境变量、系统属性、配置文件中的条件等进行更加智能的激活决策。这种灵活性使得同一套配置可以适应更多样的部署环境和运行条件。

**配置复用与继承优化**通过细粒度的 Profile 拆分和重组，可以最大化地实现配置的复用。公共的配置模块可以在不同的 Profile 组合中重复使用，避免了配置的重复定义。同时，这种设计也使得配置的变更影响范围更加可控，修改某个特定功能的配置不会影响到其他不相关的功能模块。

```yaml
spring:
  profiles:
    group:
      # 本地开发组合
      local:
        - dev
        - h2
        - mock-external
      
      # 集成测试组合  
      integration:
        - test
        - mysql
        - real-external
        
      # 生产组合
      production:
        - prod
        - mysql-cluster
        - redis-cluster
        - monitoring

---
# H2数据库配置
spring:
  config:
    activate:
      on-profile: "h2"
  datasource:
    url: jdbc:h2:mem:testdb
    driver-class-name: org.h2.Driver

---
# MySQL配置
spring:
  config:
    activate:
      on-profile: "mysql"
  datasource:
    url: jdbc:mysql://${DB_HOST:localhost}:${DB_PORT:3306}/${DB_NAME}
    driver-class-name: com.mysql.cj.jdbc.Driver

---
# 外部服务Mock配置
spring:
  config:
    activate:
      on-profile: "mock-external"
      
app:
  external-services:
    payment-service:
      url: http://localhost:9001/mock
    notification-service:
      url: http://localhost:9002/mock

---
# 监控配置
spring:
  config:
    activate:
      on-profile: "monitoring"
      
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
  endpoint:
    health:
      show-details: always
  metrics:
    export:
      prometheus:
        enabled: true
```

### 4.3 条件化配置类

使用 `@Profile` 注解可以实现配置类的条件加载。

条件化配置类机制提供了在代码级别实现环境差异化配置的强大能力，使得应用程序能够在不同环境中展现出完全不同的行为特征。

**环境特定的配置策略**通过 `@Profile` 注解，可以为不同的运行环境提供完全不同的配置实现。这种机制的价值在于它允许开发者针对特定环境的需求和约束条件，提供最优化的配置方案。开发环境可能需要宽松的安全策略以便于调试和测试，而生产环境则需要严格的安全控制和性能优化。通过条件化配置类，这些差异化的需求都能得到精确的满足。

**组件级别的环境隔离**不同于配置文件级别的环境区分，条件化配置类提供了更加精细的组件级别隔离。每个配置类可以独立地根据环境条件进行激活或禁用，使得应用程序的不同组件可以根据各自的环境需求进行独立配置。这种细粒度的控制能力使得复杂应用的环境管理变得更加精确和可控。

**代码级别的条件逻辑**通过在配置类中使用条件注解，可以实现复杂的激活逻辑。除了简单的 Profile 匹配外，还可以基于类路径中是否存在特定的类、系统属性的值、配置属性的存在与否等多种条件来决定配置类的激活。这种灵活性使得配置类能够适应更加复杂和动态的运行环境。

**配置类的组合与互斥**通过合理设计 Profile 条件，可以实现配置类之间的协调和互斥关系。某些配置类可能需要在特定的 Profile 组合下才能生效，而另一些配置类可能与某些 Profile 存在冲突关系。通过精心设计的条件逻辑，可以确保在任何给定的运行环境中，都只有合适的配置类被激活，避免了配置冲突和资源浪费。

```java
// 开发环境专用配置
@Profile("dev")
@Configuration
@EnableWebSecurity
public class DevSecurityConfiguration {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/h2-console/**").permitAll()
                .requestMatchers("/actuator/**").permitAll()
                .anyRequest().authenticated())
            .csrf(csrf -> csrf.disable())
            .headers(headers -> headers.frameOptions().sameOrigin())
            .httpBasic(Customizer.withDefaults())
            .build();
    }
}

// 生产环境安全配置
@Profile("prod")
@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class ProductionSecurityConfiguration {
    
    @Autowired
    private JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    
    @Autowired
    private JwtRequestFilter jwtRequestFilter;
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/actuator/health").permitAll()
                .anyRequest().authenticated())
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint(jwtAuthenticationEntryPoint))
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class)
            .csrf(csrf -> csrf.disable())
            .build();
    }
}

// 缓存配置 - 根据不同环境使用不同实现
@Profile("!prod")
@Configuration
public class LocalCacheConfiguration {
    
    @Bean
    public CacheManager cacheManager() {
        return new ConcurrentMapCacheManager("users", "products");
    }
}

@Profile("prod")
@Configuration
@EnableCaching
public class RedisCacheConfiguration {
    
    @Bean
    public CacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
            .entryTtl(Duration.ofMinutes(30))
            .computePrefixWith(CacheKeyPrefix.simple())
            .serializeKeysWith(RedisSerializationContext.SerializationPair
                .fromSerializer(new StringRedisSerializer()))
            .serializeValuesWith(RedisSerializationContext.SerializationPair
                .fromSerializer(new GenericJackson2JsonRedisSerializer()));
                
        return RedisCacheManager.builder(connectionFactory)
            .cacheDefaults(config)
            .build();
    }
}
```

## 第五章：配置验证与类型安全

### 5.1 JSR-303 配置验证

配置验证是确保应用稳定运行的重要环节。Spring Boot 集成了 JSR-303 规范，提供了强大的配置验证能力：

```java
@Data
@Validated // 启用配置验证
@ConfigurationProperties(prefix = "app.email")
public class EmailProperties {
    
    /**
     * SMTP服务器地址
     */
    @NotBlank(message = "SMTP服务器地址不能为空")
    @Pattern(regexp = "^[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$", message = "SMTP服务器地址格式不正确")
    private String smtpHost;
    
    /**
     * SMTP端口
     */
    @Min(value = 1, message = "端口号必须大于0")
    @Max(value = 65535, message = "端口号不能超过65535")
    private int smtpPort = 587;
    
    /**
     * 用户名
     */
    @NotBlank(message = "邮箱用户名不能为空")
    @Email(message = "邮箱格式不正确")
    private String username;
    
    /**
     * 密码
     */
    @NotBlank(message = "邮箱密码不能为空")
    @Size(min = 6, max = 50, message = "密码长度必须在6-50个字符之间")
    private String password;
    
    /**
     * 是否启用TLS
     */
    private boolean enableTls = true;
    
    /**
     * 连接超时时间
     */
    @DurationMin(seconds = 1)
    @DurationMax(minutes = 10)
    @DurationUnit(ChronoUnit.SECONDS)
    private Duration connectionTimeout = Duration.ofSeconds(30);
    
    /**
     * 邮件模板配置
     */
    @Valid
    @NotNull
    private Template template = new Template();
    
    /**
     * 重试配置
     */
    @Valid
    private Retry retry = new Retry();
    
    @Data
    public static class Template {
        
        @NotBlank(message = "模板路径不能为空")
        private String basePath = "classpath:/templates/email/";
        
        @NotBlank(message = "默认编码不能为空")
        private String defaultEncoding = "UTF-8";
        
        @Min(value = 1, message = "缓存大小必须大于0")
        private int cacheSize = 100;
        
        @DurationMin(minutes = 1)
        @DurationMax(hours = 24)
        @DurationUnit(ChronoUnit.MINUTES)
        private Duration cacheTtl = Duration.ofHours(1);
    }
    
    @Data
    public static class Retry {
        
        @Min(value = 0, message = "重试次数不能小于0")
        @Max(value = 10, message = "重试次数不能超过10")
        private int maxAttempts = 3;
        
        @DurationMin(milliseconds = 100)
        @DurationMax(minutes = 5)
        @DurationUnit(ChronoUnit.MILLISECONDS)
        private Duration backoffDelay = Duration.ofSeconds(1);
        
        @DecimalMin(value = "1.0", message = "退避倍数不能小于1.0")
        @DecimalMax(value = "10.0", message = "退避倍数不能大于10.0")
        private double backoffMultiplier = 2.0;
    }
}
```

### 5.2 自定义验证器

对于复杂的业务验证逻辑，可以创建自定义验证器：

```java
// 自定义验证注解
@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = DatabaseConfigValidator.class) // 应用 自定义验证器
@Documented
public @interface ValidDatabaseConfig {
    String message() default "数据库配置验证失败";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
```

```java
// 验证器实现
public class DatabaseConfigValidator implements ConstraintValidator<ValidDatabaseConfig, DatabaseProperties> {
    
    @Override
    public boolean isValid(DatabaseProperties config, ConstraintValidatorContext context) {
        boolean isValid = true;
        
        // 验证连接池配置的合理性
        if (config.getHikari().getMaximumPoolSize() < config.getHikari().getMinimumIdle()) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate("最大连接数不能小于最小空闲连接数")
                   .addPropertyNode("hikari.maximumPoolSize")
                   .addConstraintViolation();
            isValid = false;
        }
        
        // 验证URL格式
        if (!isValidJdbcUrl(config.getUrl())) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate("JDBC URL格式不正确")
                   .addPropertyNode("url")
                   .addConstraintViolation();
            isValid = false;
        }
        
        // 验证生产环境特殊要求
        if (isProductionProfile() && config.getJpa().isShowSql()) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate("生产环境不允许开启SQL日志")
                   .addPropertyNode("jpa.showSql")
                   .addConstraintViolation();
            isValid = false;
        }
        
        return isValid;
    }
    
    private boolean isValidJdbcUrl(String url) {
        return url != null && url.startsWith("jdbc:") && url.contains("://");
    }
    
    private boolean isProductionProfile() {
        return Arrays.asList(System.getProperty("spring.profiles.active", "").split(","))
                    .contains("prod");
    }
}
```

```java
// 应用到配置类
@Data
@Validated
@ValidDatabaseConfig // 自定义验证注解
@ConfigurationProperties(prefix = "spring.datasource")
public class DatabaseProperties {
    
    @NotBlank
    private String url;
    
    @NotBlank
    private String username;
    
    @NotBlank
    private String password;
    
    @Valid
    private HikariProperties hikari = new HikariProperties();
    
    @Valid
    private JpaProperties jpa = new JpaProperties();
    
    @Data
    public static class HikariProperties {
        @Min(1) @Max(200)
        private int maximumPoolSize = 20;
        
        @Min(0) @Max(50)
        private int minimumIdle = 5;
        
        @DurationMin(seconds = 10)
        @DurationMax(minutes = 30)
        private Duration idleTimeout = Duration.ofMinutes(10);
    }
    
    @Data
    public static class JpaProperties {
        private boolean showSql = false;
        
        @NotNull
        private HibernateDdlAuto ddlAuto = HibernateDdlAuto.VALIDATE;
    }
    
    public enum HibernateDdlAuto {
        NONE, VALIDATE, UPDATE, CREATE, CREATE_DROP
    }
}
```

### 5.3 配置元数据生成

Spring Boot 支持生成配置元数据，提供 IDE 智能提示和文档：

```java
// 在 pom.xml 中添加依赖
/*
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-configuration-processor</artifactId>
    <optional>true</optional>
</dependency>
*/

// 创建 META-INF/additional-spring-configuration-metadata.json
/*
{
  "properties": [
    {
      "name": "app.user.default-page-size",
      "type": "java.lang.Integer",
      "description": "用户列表默认分页大小",
      "defaultValue": 10,
      "deprecation": {
        "level": "warning",
        "reason": "建议使用app.pagination.default-size替代"
      }
    },
    {
      "name": "app.cache.strategy",
      "type": "com.example.config.CacheStrategy",
      "description": "缓存策略配置"
    }
  ],
  "hints": [
    {
      "name": "app.cache.strategy",
      "values": [
        {
          "value": "redis",
          "description": "使用Redis作为缓存"
        },
        {
          "value": "caffeine",
          "description": "使用Caffeine内存缓存"
        },
        {
          "value": "none",
          "description": "禁用缓存"
        }
      ]
    }
  ]
}
*/
```

## 第六章：外部化配置与优先级

### 6.1 配置源优先级体系

Spring Boot 的配置源优先级系统设计得非常灵活，理解这个优先级对于复杂应用的配置管理至关重要：

```java
@Component
@Slf4j
public class ConfigurationDiagnostics {
    
    @Autowired
    private Environment environment;
    
    @Autowired
    private ConfigurableApplicationContext applicationContext;
    
    @EventListener
    public void onApplicationReady(ApplicationReadyEvent event) {
        logConfigurationSources();
        logActiveProfiles();
        logKeyConfigurationValues();
    }
    
    private void logConfigurationSources() {
        log.info("=== 配置源分析 ===");
        
        ConfigurableEnvironment env = (ConfigurableEnvironment) environment;
        int index = 0;
        
        for (PropertySource<?> propertySource : env.getPropertySources()) {
            log.info("{}. {} (类型: {})", 
                ++index, 
                propertySource.getName(), 
                propertySource.getClass().getSimpleName());
                
            // 打印重要配置的来源
            if (propertySource.containsProperty("server.port")) {
                log.info("   └─ server.port = {} (来源: {})", 
                    propertySource.getProperty("server.port"),
                    propertySource.getName());
            }
        }
    }
    
    private void logActiveProfiles() {
        log.info("=== Profile配置 ===");
        log.info("Active Profiles: {}", Arrays.toString(environment.getActiveProfiles()));
        log.info("Default Profiles: {}", Arrays.toString(environment.getDefaultProfiles()));
    }
    
    private void logKeyConfigurationValues() {
        log.info("=== 关键配置值 ===");
        
        Map<String, String> keyConfigs = Map.of(
            "server.port", environment.getProperty("server.port", "8080"),
            "spring.application.name", environment.getProperty("spring.application.name", "unknown"),
            "spring.profiles.active", environment.getProperty("spring.profiles.active", "none"),
            "logging.level.com.example", environment.getProperty("logging.level.com.example", "INFO")
        );
        
        keyConfigs.forEach((key, value) -> {
            PropertySource<?> source = findPropertySource(key);
            log.info("{} = {} (来源: {})", key, value, 
                source != null ? source.getName() : "未找到");
        });
    }
    
    private PropertySource<?> findPropertySource(String propertyName) {
        ConfigurableEnvironment env = (ConfigurableEnvironment) environment;
        for (PropertySource<?> propertySource : env.getPropertySources()) {
            if (propertySource.containsProperty(propertyName)) {
                return propertySource;
            }
        }
        return null;
    }
}
```

### 6.2 命令行参数处理

命令行参数是优先级最高的配置源之一，在运维部署中特别有用：

```java
@SpringBootApplication
public class Application {
    
    public static void main(String[] args) {
        // 可以禁用命令行参数
        SpringApplication app = new SpringApplication(Application.class);
        app.setAddCommandLineProperties(false); // 禁用命令行参数
        
        // 或者自定义命令行参数处理
        app.run(preprocessArgs(args));
    }
    
    /**
     * 预处理命令行参数
     */
    private static String[] preprocessArgs(String[] args) {
        List<String> processedArgs = new ArrayList<>();
        
        for (String arg : args) {
            // 处理特殊的参数格式
            if (arg.startsWith("--env=")) {
                String env = arg.substring(6);
                processedArgs.add("--spring.profiles.active=" + env);
            } else if (arg.startsWith("--debug")) {
                processedArgs.add("--logging.level.com.example=DEBUG");
                processedArgs.add("--spring.jpa.show-sql=true");
            } else {
                processedArgs.add(arg);
            }
        }
        
        return processedArgs.toArray(new String[0]);
    }
}
```

### 6.3 环境变量配置

环境变量在容器化部署中是首选的配置方式：

```yaml
# docker-compose.yml示例
version: '3.8'
services:
  user-service:
    image: user-service:latest
    environment:
      # 基础配置
      SPRING_PROFILES_ACTIVE: prod
      SERVER_PORT: 8080
      
      # 数据库配置（支持松绑定）
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/userdb
      SPRING_DATASOURCE_USERNAME: ${DB_USER}
      SPRING_DATASOURCE_PASSWORD: ${DB_PASSWORD}
      
      # Redis配置
      SPRING_REDIS_HOST: redis
      SPRING_REDIS_PORT: 6379
      SPRING_REDIS_PASSWORD: ${REDIS_PASSWORD}
      
      # 应用自定义配置
      APP_USER_CACHE_ENABLED: true
      APP_USER_CACHE_TTL: 3600s
      APP_SECURITY_JWT_SECRET: ${JWT_SECRET}
      
      # JVM配置
      JAVA_OPTS: >
        -Xms512m -Xmx1024m
        -XX:+UseG1GC
        -XX:MaxGCPauseMillis=200
        -Dfile.encoding=UTF-8
        -Duser.timezone=Asia/Shanghai
```

### 6.4 配置加密与安全

对于敏感配置信息，需要特殊的安全处理：

```java
// 自定义配置解密器
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class ConfigurationDecryptor implements EnvironmentPostProcessor {
    
    private static final String ENCRYPTED_PREFIX = "{encrypted}";
    private final AESUtil aesUtil = new AESUtil();
    
    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, 
                                     SpringApplication application) {
        
        // 获取解密密钥
        String decryptionKey = environment.getProperty("app.config.decryption-key");
        if (decryptionKey == null) {
            decryptionKey = System.getenv("CONFIG_DECRYPTION_KEY");
        }
        
        if (decryptionKey != null) {
            decryptProperties(environment, decryptionKey);
        }
    }
    
    private void decryptProperties(ConfigurableEnvironment environment, String key) {
        for (PropertySource<?> propertySource : environment.getPropertySources()) {
            if (propertySource instanceof MapPropertySource) {
                Map<String, Object> source = ((MapPropertySource) propertySource).getSource();
                Map<String, Object> decryptedProperties = new HashMap<>();
                
                for (Map.Entry<String, Object> entry : source.entrySet()) {
                    Object value = entry.getValue();
                    if (value instanceof String && ((String) value).startsWith(ENCRYPTED_PREFIX)) {
                        String encryptedValue = ((String) value).substring(ENCRYPTED_PREFIX.length());
                        try {
                            String decryptedValue = aesUtil.decrypt(encryptedValue, key);
                            decryptedProperties.put(entry.getKey(), decryptedValue);
                        } catch (Exception e) {
                            throw new IllegalStateException("解密配置失败: " + entry.getKey(), e);
                        }
                    }
                }
                
                // 更新解密后的配置
                source.putAll(decryptedProperties);
            }
        }
    }
}

// AES加解密工具类
@Component
public class AESUtil {
    
    private static final String ALGORITHM = "AES/GCM/NoPadding";
    private static final int GCM_IV_LENGTH = 12;
    private static final int GCM_TAG_LENGTH = 16;
    
    public String encrypt(String plainText, String key) throws Exception {
        SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(), "AES");
        
        Cipher cipher = Cipher.getInstance(ALGORITHM);
        byte[] iv = new byte[GCM_IV_LENGTH];
        SecureRandom.getInstanceStrong().nextBytes(iv);
        
        GCMParameterSpec gcmSpec = new GCMParameterSpec(GCM_TAG_LENGTH * 8, iv);
        cipher.init(Cipher.ENCRYPT_MODE, secretKey, gcmSpec);
        
        byte[] encryptedData = cipher.doFinal(plainText.getBytes(StandardCharsets.UTF_8));
        
        // 组合IV和加密数据
        byte[] encryptedWithIv = new byte[GCM_IV_LENGTH + encryptedData.length];
        System.arraycopy(iv, 0, encryptedWithIv, 0, GCM_IV_LENGTH);
        System.arraycopy(encryptedData, 0, encryptedWithIv, GCM_IV_LENGTH, encryptedData.length);
        
        return Base64.getEncoder().encodeToString(encryptedWithIv);
    }
    
    public String decrypt(String encryptedText, String key) throws Exception {
        byte[] encryptedWithIv = Base64.getDecoder().decode(encryptedText);
        
        // 分离IV和加密数据
        byte[] iv = new byte[GCM_IV_LENGTH];
        byte[] encryptedData = new byte[encryptedWithIv.length - GCM_IV_LENGTH];
        
        System.arraycopy(encryptedWithIv, 0, iv, 0, GCM_IV_LENGTH);
        System.arraycopy(encryptedWithIv, GCM_IV_LENGTH, encryptedData, 0, encryptedData.length);
        
        SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(), "AES");
        Cipher cipher = Cipher.getInstance(ALGORITHM);
        GCMParameterSpec gcmSpec = new GCMParameterSpec(GCM_TAG_LENGTH * 8, iv);
        
        cipher.init(Cipher.DECRYPT_MODE, secretKey, gcmSpec);
        byte[] decryptedData = cipher.doFinal(encryptedData);
        
        return new String(decryptedData, StandardCharsets.UTF_8);
    }
}
```

## 第七章：随机值配置与动态配置

### 7.1 随机值生成器

Spring Boot 内置的 `RandomValuePropertySource` 提供了强大的随机值生成能力：

```yaml
# application.yml
app:
  security:
    # 生成32位随机字符串作为JWT密钥
    jwt-secret: ${random.value}
    
    # 生成UUID作为实例ID
    instance-id: ${random.uuid}
    
    # 生成指定范围的随机端口
    backup-port: ${random.int[9000,9999]}
    
    # 生成随机的session超时时间（秒）
    session-timeout: ${random.int[1800,7200]}
    
  database:
    # 随机连接池大小（适用于测试环境）
    pool-size: ${random.int[5,20]}
    
    # 随机超时时间
    connection-timeout: ${random.long[1000,10000]}
    
  cache:
    # 随机缓存键前缀
    key-prefix: cache_${random.value}_
    
    # 随机TTL
    default-ttl: ${random.int[300,3600]}

# 微服务发现中的随机配置
eureka:
  instance:
    instance-id: ${spring.application.name}:${random.uuid}
    
spring:
  cloud:
    loadbalancer:
      # 负载均衡随机种子
      random-seed: ${random.long}
```

### 7.2 自定义随机值生成器

对于特殊的随机值需求，可以扩展 `RandomValuePropertySource`：

```java
@Component
public class CustomRandomValueGenerator {
    
    private final SecureRandom secureRandom = new SecureRandom();
    private final Random random = new Random();
    
    /**
     * 生成指定长度的随机密码
     */
    public String generatePassword(int length, boolean includeSpecialChars) {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        if (includeSpecialChars) {
            chars += "!@#$%^&*()_+-=[]{}|;:,.<>?";
        }
        
        StringBuilder password = new StringBuilder();
        for (int i = 0; i < length; i++) {
            password.append(chars.charAt(secureRandom.nextInt(chars.length())));
        }
        return password.toString();
    }
    
    /**
     * 生成随机的API Key
     */
    public String generateApiKey() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return Base64.getEncoder().encodeToString(bytes);
    }
    
    /**
     * 生成随机端口（避开常用端口）
     */
    public int generateRandomPort() {
        int[] forbiddenPorts = {22, 80, 443, 3306, 5432, 6379, 8080, 8443};
        int port;
        do {
            port = random.nextInt(65535 - 10000) + 10000;
        } while (Arrays.stream(forbiddenPorts).anyMatch(p -> p == port));
        return port;
    }
}

// 自定义PropertySource
@Configuration
public class CustomRandomPropertySourceConfiguration {
    
    @Bean
    public CustomRandomPropertySource customRandomPropertySource() {
        return new CustomRandomPropertySource();
    }
    
    public static class CustomRandomPropertySource extends PropertySource<Random> {
        
        public static final String CUSTOM_RANDOM_PROPERTY_SOURCE_NAME = "customRandom";
        
        private final CustomRandomValueGenerator generator = new CustomRandomValueGenerator();
        
        public CustomRandomPropertySource() {
            super(CUSTOM_RANDOM_PROPERTY_SOURCE_NAME, new Random());
        }
        
        @Override
        public Object getProperty(String name) {
            if (!name.startsWith("custom.random.")) {
                return null;
            }
            
            String type = name.substring("custom.random.".length());
            
            switch (type) {
                case "password":
                    return generator.generatePassword(16, true);
                case "apikey":
                    return generator.generateApiKey();
                case "port":
                    return generator.generateRandomPort();
                default:
                    return null;
            }
        }
    }
}
```

### 7.3 动态配置更新

对于需要运行时更新的配置，可以实现动态配置机制：

```java
@Component
@RefreshScope  // Spring Cloud 提供的刷新作用域
@ConfigurationProperties(prefix = "app.dynamic")
@Slf4j
public class DynamicConfiguration {
    
    private int batchSize = 100;
    private Duration timeout = Duration.ofSeconds(30);
    private Map<String, String> features = new HashMap<>();
    
    @EventListener
    public void handleRefreshEvent(RefreshRemoteApplicationEvent event) {
        log.info("配置刷新事件: {}", event.getDestinationService());
        // 处理配置刷新后的逻辑
        validateConfiguration();
    }
    
    private void validateConfiguration() {
        if (batchSize <= 0 || batchSize > 10000) {
            log.warn("批处理大小配置异常: {}, 重置为默认值", batchSize);
            batchSize = 100;
        }
        
        if (timeout.toSeconds() < 1 || timeout.toSeconds() > 300) {
            log.warn("超时时间配置异常: {}, 重置为默认值", timeout);
            timeout = Duration.ofSeconds(30);
        }
    }
    
    // getter和setter方法
    public int getBatchSize() { return batchSize; }
    public void setBatchSize(int batchSize) { 
        this.batchSize = batchSize; 
        log.info("批处理大小更新为: {}", batchSize);
    }
    
    public Duration getTimeout() { return timeout; }
    public void setTimeout(Duration timeout) { 
        this.timeout = timeout; 
        log.info("超时时间更新为: {}", timeout);
    }
    
    public Map<String, String> getFeatures() { return features; }
    public void setFeatures(Map<String, String> features) { 
        this.features = features; 
        log.info("功能开关更新: {}", features);
    }
}

// 动态配置更新端点
@RestController
@RequestMapping("/admin/config")
@ConditionalOnProperty(name = "management.endpoints.web.exposure.include", havingValue = "configupdate")
public class ConfigUpdateController {
    
    @Autowired
    private DynamicConfiguration dynamicConfig;
    
    @Autowired
    private ConfigurableApplicationContext applicationContext;
    
    @PostMapping("/refresh")
    public ResponseEntity<Map<String, Object>> refreshConfig(@RequestBody Map<String, Object> updates) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            // 更新配置
            updateConfiguration(updates);
            
            // 触发配置刷新
            applicationContext.publishEvent(new RefreshRemoteApplicationEvent(this, 
                applicationContext.getId(), "manual-refresh"));
            
            result.put("status", "success");
            result.put("message", "配置更新成功");
            result.put("timestamp", Instant.now());
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            result.put("status", "error");
            result.put("message", "配置更新失败: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(result);
        }
    }
    
    private void updateConfiguration(Map<String, Object> updates) {
        updates.forEach((key, value) -> {
            switch (key) {
                case "batchSize":
                    if (value instanceof Number) {
                        dynamicConfig.setBatchSize(((Number) value).intValue());
                    }
                    break;
                case "timeout":
                    if (value instanceof String) {
                        dynamicConfig.setTimeout(Duration.parse((String) value));
                    }
                    break;
                case "features":
                    if (value instanceof Map) {
                        dynamicConfig.setFeatures((Map<String, String>) value);
                    }
                    break;
            }
        });
    }
}
```

## 第八章：配置加载机制与扩展

### 8.1 配置加载源码分析

理解 Spring Boot 配置加载的内部机制有助于进行高级定制：

```java
// 自定义配置加载监听器
@Component
public class CustomConfigurationLoadListener implements ApplicationListener<ApplicationEnvironmentPreparedEvent> {
    
    private static final Logger log = LoggerFactory.getLogger(CustomConfigurationLoadListener.class);
    
    @Override
    public void onApplicationEvent(ApplicationEnvironmentPreparedEvent event) {
        ConfigurableEnvironment environment = event.getEnvironment();
        
        // 添加自定义配置源
        addCustomPropertySources(environment);
        
        // 处理配置占位符
        processConfigurationPlaceholders(environment);
        
        // 验证必需的配置
        validateRequiredProperties(environment);
    }
    
    private void addCustomPropertySources(ConfigurableEnvironment environment) {
        // 添加外部配置源（如配置中心、数据库等）
        MutablePropertySources propertySources = environment.getPropertySources();
        
        // 从配置中心加载配置
        PropertySource<?> configCenterSource = loadFromConfigCenter();
        if (configCenterSource != null) {
            propertySources.addFirst(configCenterSource);
        }
        
        // 从数据库加载配置
        PropertySource<?> databaseSource = loadFromDatabase();
        if (databaseSource != null) {
            propertySources.addLast(databaseSource);
        }
    }
    
    private PropertySource<?> loadFromConfigCenter() {
        try {
            // 模拟从配置中心加载配置
            Map<String, Object> configCenterProps = new HashMap<>();
            configCenterProps.put("app.feature.payment.enabled", true);
            configCenterProps.put("app.feature.notification.enabled", false);
            configCenterProps.put("app.rate-limit.requests-per-second", 1000);
            
            log.info("从配置中心加载了 {} 个配置项", configCenterProps.size());
            return new MapPropertySource("configCenter", configCenterProps);
            
        } catch (Exception e) {
            log.warn("从配置中心加载配置失败", e);
            return null;
        }
    }
    
    private PropertySource<?> loadFromDatabase() {
        try {
            // 模拟从数据库加载配置
            Map<String, Object> dbProps = new HashMap<>();
            dbProps.put("app.business.max-order-amount", "50000");
            dbProps.put("app.business.shipping-fee", "15.00");
            
            log.info("从数据库加载了 {} 个配置项", dbProps.size());
            return new MapPropertySource("database", dbProps);
            
        } catch (Exception e) {
            log.warn("从数据库加载配置失败", e);
            return null;
        }
    }
    
    private void processConfigurationPlaceholders(ConfigurableEnvironment environment) {
        // 处理自定义占位符解析逻辑
        PropertySourcesPlaceholderConfigurer configurer = new PropertySourcesPlaceholderConfigurer();
        configurer.setEnvironment(environment);
        configurer.setIgnoreUnresolvablePlaceholders(false);
    }
    
    private void validateRequiredProperties(ConfigurableEnvironment environment) {
        String[] requiredProperties = {
            "spring.application.name",
            "server.port"
        };
        
        List<String> missingProperties = new ArrayList<>();
        for (String property : requiredProperties) {
            if (!environment.containsProperty(property)) {
                missingProperties.add(property);
            }
        }
        
        if (!missingProperties.isEmpty()) {
            throw new IllegalStateException("缺少必需的配置项: " + missingProperties);
        }
    }
}
```

### 8.2 自定义PropertySourceLoader

对于特殊格式的配置文件，可以实现自定义的 `PropertySourceLoader`：

```java
// JSON配置文件加载器
public class JsonPropertySourceLoader implements PropertySourceLoader {
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    @Override
    public String[] getFileExtensions() {
        return new String[]{"json"};
    }
    
    @Override
    public List<PropertySource<?>> load(String name, Resource resource) throws IOException {
        if (!resource.exists()) {
            return Collections.emptyList();
        }
        
        try (InputStream inputStream = resource.getInputStream()) {
            Map<String, Object> properties = loadJsonAsMap(inputStream);
            
            if (properties.isEmpty()) {
                return Collections.emptyList();
            }
            
            // 扁平化嵌套的JSON结构
            Map<String, Object> flattenedProperties = flattenProperties(properties);
            
            return Collections.singletonList(
                new MapPropertySource(name, flattenedProperties)
            );
        }
    }
    
    @SuppressWarnings("unchecked")
    private Map<String, Object> loadJsonAsMap(InputStream inputStream) throws IOException {
        TypeReference<Map<String, Object>> typeRef = new TypeReference<Map<String, Object>>() {};
        return objectMapper.readValue(inputStream, typeRef);
    }
    
    private Map<String, Object> flattenProperties(Map<String, Object> source) {
        Map<String, Object> result = new LinkedHashMap<>();
        flattenPropertiesRecursive(result, source, "");
        return result;
    }
    
    @SuppressWarnings("unchecked")
    private void flattenPropertiesRecursive(Map<String, Object> result, 
                                           Map<String, Object> source, 
                                           String prefix) {
        source.forEach((key, value) -> {
            String newKey = prefix.isEmpty() ? key : prefix + "." + key;
            
            if (value instanceof Map) {
                flattenPropertiesRecursive(result, (Map<String, Object>) value, newKey);
            } else if (value instanceof List) {
                List<?> list = (List<?>) value;
                for (int i = 0; i < list.size(); i++) {
                    Object listItem = list.get(i);
                    if (listItem instanceof Map) {
                        flattenPropertiesRecursive(result, (Map<String, Object>) listItem, 
                            newKey + "[" + i + "]");
                    } else {
                        result.put(newKey + "[" + i + "]", listItem);
                    }
                }
            } else {
                result.put(newKey, value);
            }
        });
    }
}

// 注册自定义PropertySourceLoader
// META-INF/spring.factories
/*
org.springframework.boot.env.PropertySourceLoader=\
com.example.config.JsonPropertySourceLoader
*/
```

### 8.3 配置后置处理器

实现 `EnvironmentPostProcessor` 接口可以对环境进行后置处理：

```java
@Component
public class SecurityConfigurationPostProcessor implements EnvironmentPostProcessor {
    
    private static final Logger log = LoggerFactory.getLogger(SecurityConfigurationPostProcessor.class);
    
    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        // 处理安全相关的配置
        processSecurityConfiguration(environment);
        
        // 处理数据源配置
        processDataSourceConfiguration(environment);
        
        // 添加运行时计算的配置
        addComputedProperties(environment);
    }
    
    private void processSecurityConfiguration(ConfigurableEnvironment environment) {
        // 确保生产环境的安全配置
        if (Arrays.asList(environment.getActiveProfiles()).contains("prod")) {
            Map<String, Object> securityProps = new HashMap<>();
            
            // 强制HTTPS
            securityProps.put("server.ssl.enabled", true);
            securityProps.put("security.require-ssl", true);
            
            // 安全头配置
            securityProps.put("security.headers.frame", "DENY");
            securityProps.put("security.headers.content-type", true);
            securityProps.put("security.headers.xss", true);
            
            // Session安全
            securityProps.put("server.servlet.session.cookie.secure", true);
            securityProps.put("server.servlet.session.cookie.http-only", true);
            securityProps.put("server.servlet.session.cookie.same-site", "strict");
            
            environment.getPropertySources().addFirst(
                new MapPropertySource("securityEnforcement", securityProps)
            );
            
            log.info("应用生产环境安全配置");
        }
    }
    
    private void processDataSourceConfiguration(ConfigurableEnvironment environment) {
        String profile = String.join(",", environment.getActiveProfiles());
        Map<String, Object> dbProps = new HashMap<>();
        
        // 根据环境动态设置连接池参数
        if (profile.contains("prod")) {
            dbProps.put("spring.datasource.hikari.maximum-pool-size", 50);
            dbProps.put("spring.datasource.hikari.minimum-idle", 10);
        } else if (profile.contains("test")) {
            dbProps.put("spring.datasource.hikari.maximum-pool-size", 20);
            dbProps.put("spring.datasource.hikari.minimum-idle", 5);
        } else {
            dbProps.put("spring.datasource.hikari.maximum-pool-size", 10);
            dbProps.put("spring.datasource.hikari.minimum-idle", 2);
        }
        
        environment.getPropertySources().addLast(
            new MapPropertySource("dynamicDataSource", dbProps)
        );
    }
    
    private void addComputedProperties(ConfigurableEnvironment environment) {
        Map<String, Object> computedProps = new HashMap<>();
        
        // 计算实例标识
        String instanceId = generateInstanceId(environment);
        computedProps.put("app.instance.id", instanceId);
        
        // 计算配置文件路径
        String configPath = computeConfigPath(environment);
        computedProps.put("app.config.path", configPath);
        
        // 计算日志文件名
        String logFileName = computeLogFileName(environment);
        computedProps.put("logging.file.name", logFileName);
        
        environment.getPropertySources().addFirst(
            new MapPropertySource("computed", computedProps)
        );
    }
    
    private String generateInstanceId(ConfigurableEnvironment environment) {
        String appName = environment.getProperty("spring.application.name", "unknown");
        String profile = String.join("-", environment.getActiveProfiles());
        String hostName = getHostName();
        String timestamp = String.valueOf(System.currentTimeMillis());
        
        return String.format("%s-%s-%s-%s", appName, profile, hostName, timestamp);
    }
    
    private String computeConfigPath(ConfigurableEnvironment environment) {
        String userHome = System.getProperty("user.home");
        String appName = environment.getProperty("spring.application.name", "app");
        return Paths.get(userHome, ".config", appName).toString();
    }
    
    private String computeLogFileName(ConfigurableEnvironment environment) {
        String appName = environment.getProperty("spring.application.name", "application");
        String profile = String.join("-", environment.getActiveProfiles());
        return String.format("/var/log/%s-%s.log", appName, profile);
    }
    
    private String getHostName() {
        try {
            return InetAddress.getLocalHost().getHostName();
        } catch (Exception e) {
            return "unknown-host";
        }
    }
}
```

## 第九章：配置加密与安全最佳实践

### 9.1 Jasypt 集成与高级用法

Jasypt 是 Spring Boot 应用中最流行的配置加密解决方案：

```xml
<!-- pom.xml -->
<dependency>
    <groupId>com.github.ulisesbocchio</groupId>
    <artifactId>jasypt-spring-boot-starter</artifactId>
    <version>3.0.5</version>
</dependency>

<plugin>
    <groupId>com.github.ulisesbocchio</groupId>
    <artifactId>jasypt-maven-plugin</artifactId>
    <version>3.0.5</version>
</plugin>
```

```java
// 自定义加密配置
@Configuration
public class JasyptConfiguration {
    
    @Bean("jasyptStringEncryptor")
    public StringEncryptor stringEncryptor() {
        PooledPBEStringEncryptor encryptor = new PooledPBEStringEncryptor();
        
        SimpleStringPBEConfig config = new SimpleStringPBEConfig();
        config.setPassword(getEncryptionPassword());
        config.setAlgorithm("PBEWITHHMACSHA512ANDAES_256");
        config.setKeyObtentionIterations("1000");
        config.setPoolSize("1");
        config.setProviderName("SunJCE");
        config.setSaltGeneratorClassName("org.jasypt.salt.RandomSaltGenerator");
        config.setIvGeneratorClassName("org.jasypt.iv.RandomIvGenerator");
        config.setStringOutputType("base64");
        
        encryptor.setConfig(config);
        return encryptor;
    }
    
    private String getEncryptionPassword() {
        // 优先级：系统属性 -> 环境变量 -> 配置文件
        String password = System.getProperty("jasypt.encryptor.password");
        if (password == null) {
            password = System.getenv("JASYPT_ENCRYPTOR_PASSWORD");
        }
        if (password == null) {
            throw new IllegalStateException("未找到加密密钥，请设置JASYPT_ENCRYPTOR_PASSWORD环境变量");
        }
        return password;
    }
    
    @Bean
    public PropertyDetector customPropertyDetector() {
        return new DefaultPropertyDetector("ENC(", ")");
    }
}

// 配置加密工具类
@Component
@Slf4j
public class ConfigurationEncryptionUtil {
    
    @Autowired
    @Qualifier("jasyptStringEncryptor")
    private StringEncryptor stringEncryptor;
    
    /**
     * 加密配置值
     */
    public String encrypt(String plainText) {
        try {
            String encrypted = stringEncryptor.encrypt(plainText);
            return "ENC(" + encrypted + ")";
        } catch (Exception e) {
            log.error("配置加密失败", e);
            throw new RuntimeException("配置加密失败", e);
        }
    }
    
    /**
     * 解密配置值
     */
    public String decrypt(String encryptedText) {
        try {
            if (encryptedText.startsWith("ENC(") && encryptedText.endsWith(")")) {
                String cipherText = encryptedText.substring(4, encryptedText.length() - 1);
                return stringEncryptor.decrypt(cipherText);
            }
            return encryptedText;
        } catch (Exception e) {
            log.error("配置解密失败", e);
            throw new RuntimeException("配置解密失败", e);
        }
    }
    
    /**
     * 批量加密配置文件
     */
    public void encryptConfigurationFile(String inputFile, String outputFile) {
        try {
            Properties properties = new Properties();
            properties.load(new FileInputStream(inputFile));
            
            Properties encryptedProperties = new Properties();
            
            for (String key : properties.stringPropertyNames()) {
                String value = properties.getProperty(key);
                
                // 判断是否需要加密（敏感信息）
                if (isSensitiveProperty(key)) {
                    encryptedProperties.setProperty(key, encrypt(value));
                    log.info("已加密配置项: {}", key);
                } else {
                    encryptedProperties.setProperty(key, value);
                }
            }
            
            encryptedProperties.store(new FileOutputStream(outputFile), 
                "Encrypted configuration file generated at " + new Date());
            
            log.info("配置文件加密完成: {} -> {}", inputFile, outputFile);
            
        } catch (Exception e) {
            log.error("配置文件加密失败", e);
            throw new RuntimeException("配置文件加密失败", e);
        }
    }
    
    private boolean isSensitiveProperty(String key) {
        String[] sensitivePatterns = {
            "password", "secret", "key", "token", "credential",
            "username", "user", "auth", "oauth", "jwt"
        };
        
        String lowerKey = key.toLowerCase();
        return Arrays.stream(sensitivePatterns)
                    .anyMatch(lowerKey::contains);
    }
}
```

### 9.2 配置审计与合规性

在企业环境中，配置的审计和合规性检查是必不可少的：

```java
@Component
@Slf4j
public class ConfigurationAuditor {
    
    @Autowired
    private Environment environment;
    
    @EventListener
    public void auditConfiguration(ApplicationReadyEvent event) {
        log.info("开始配置审计...");
        
        AuditReport report = new AuditReport();
        
        // 检查安全配置
        auditSecurityConfiguration(report);
        
        // 检查数据库配置
        auditDatabaseConfiguration(report);
        
        // 检查日志配置
        auditLoggingConfiguration(report);
        
        // 检查敏感信息泄露
        auditSensitiveInformationExposure(report);
        
        // 生成报告
        generateAuditReport(report);
        
        // 如果有严重问题，阻止应用启动
        if (report.hasCriticalIssues()) {
            throw new IllegalStateException("配置审计发现严重问题，应用启动被阻止");
        }
    }
    
    private void auditSecurityConfiguration(AuditReport report) {
        String[] activeProfiles = environment.getActiveProfiles();
        
        if (Arrays.asList(activeProfiles).contains("prod")) {
            // 生产环境安全检查
            checkProductionSecurityRequirements(report);
        }
        
        // 通用安全检查
        checkCommonSecurityRequirements(report);
    }
    
    private void checkProductionSecurityRequirements(AuditReport report) {
        // 检查HTTPS配置
        if (!environment.getProperty("server.ssl.enabled", Boolean.class, false)) {
            report.addCritical("生产环境必须启用HTTPS");
        }
        
        // 检查Session安全
        if (!environment.getProperty("server.servlet.session.cookie.secure", Boolean.class, false)) {
            report.addCritical("生产环境Session Cookie必须设置为secure");
        }
        
        // 检查管理端点暴露
        String exposedEndpoints = environment.getProperty("management.endpoints.web.exposure.include", "");
        if (exposedEndpoints.contains("*") || exposedEndpoints.contains("env")) {
            report.addCritical("生产环境不应暴露敏感的管理端点");
        }
    }
    
    private void checkCommonSecurityRequirements(AuditReport report) {
        // 检查默认密码
        checkForDefaultPasswords(report);
        
        // 检查弱加密算法
        checkForWeakEncryption(report);
        
        // 检查调试配置
        checkForDebugConfiguration(report);
    }
    
    private void checkForDefaultPasswords(AuditReport report) {
        String[] defaultPasswords = {"password", "admin", "root", "123456", "admin123"};
        
        Map<String, String> passwordProperties = new HashMap<>();
        passwordProperties.put("spring.datasource.password", 
            environment.getProperty("spring.datasource.password", ""));
        passwordProperties.put("spring.redis.password", 
            environment.getProperty("spring.redis.password", ""));
        
        passwordProperties.forEach((key, value) -> {
            if (Arrays.asList(defaultPasswords).contains(value.toLowerCase())) {
                report.addCritical(String.format("检测到默认密码: %s", key));
            }
        });
    }
    
    private void auditDatabaseConfiguration(AuditReport report) {
        // 检查连接池配置
        int maxPoolSize = environment.getProperty("spring.datasource.hikari.maximum-pool-size", 
            Integer.class, 10);
        if (maxPoolSize > 100) {
            report.addWarning("数据库连接池大小过大，可能导致资源耗尽");
        }
        
        // 检查连接超时配置
        long connectionTimeout = environment.getProperty("spring.datasource.hikari.connection-timeout", 
            Long.class, 30000L);
        if (connectionTimeout > 60000) {
            report.addWarning("数据库连接超时时间过长");
        }
    }
    
    private void auditLoggingConfiguration(AuditReport report) {
        // 检查生产环境日志级别
        if (Arrays.asList(environment.getActiveProfiles()).contains("prod")) {
            String rootLogLevel = environment.getProperty("logging.level.root", "INFO");
            if ("DEBUG".equalsIgnoreCase(rootLogLevel) || "TRACE".equalsIgnoreCase(rootLogLevel)) {
                report.addWarning("生产环境不建议使用DEBUG/TRACE日志级别");
            }
        }
        
        // 检查SQL日志
        boolean showSql = environment.getProperty("spring.jpa.show-sql", Boolean.class, false);
        if (showSql && Arrays.asList(environment.getActiveProfiles()).contains("prod")) {
            report.addCritical("生产环境不应开启SQL日志");
        }
    }
    
    private void auditSensitiveInformationExposure(AuditReport report) {
        // 检查是否暴露了敏感信息
        ConfigurableEnvironment env = (ConfigurableEnvironment) environment;
        
        for (PropertySource<?> propertySource : env.getPropertySources()) {
            if (propertySource instanceof EnumerablePropertySource) {
                EnumerablePropertySource<?> enumerable = (EnumerablePropertySource<?>) propertySource;
                
                for (String propertyName : enumerable.getPropertyNames()) {
                    Object value = enumerable.getProperty(propertyName);
                    
                    if (value instanceof String) {
                        String stringValue = (String) value;
                        
                        // 检查是否包含明文密码或密钥
                        if (isSensitiveProperty(propertyName) && !isEncrypted(stringValue)) {
                            report.addHigh(String.format("敏感配置未加密: %s", propertyName));
                        }
                    }
                }
            }
        }
    }
    
    private boolean isSensitiveProperty(String propertyName) {
        String[] sensitivePatterns = {
            "password", "secret", "key", "token", "credential", "auth"
        };
        
        String lowerName = propertyName.toLowerCase();
        return Arrays.stream(sensitivePatterns).anyMatch(lowerName::contains);
    }
    
    private boolean isEncrypted(String value) {
        return value.startsWith("ENC(") || value.startsWith("{cipher}");
    }
    
    private void generateAuditReport(AuditReport report) {
        log.info("=== 配置审计报告 ===");
        log.info("审计时间: {}", Instant.now());
        log.info("严重问题: {}", report.getCriticalIssues().size());
        log.info("高危问题: {}", report.getHighIssues().size());
        log.info("警告问题: {}", report.getWarningIssues().size());
        
        report.getCriticalIssues().forEach(issue -> log.error("严重: {}", issue));
        report.getHighIssues().forEach(issue -> log.warn("高危: {}", issue));
        report.getWarningIssues().forEach(issue -> log.info("警告: {}", issue));
        
        // 可以将报告发送到监控系统或保存到文件
    }
    
    // 审计报告数据结构
    public static class AuditReport {
        private final List<String> criticalIssues = new ArrayList<>();
        private final List<String> highIssues = new ArrayList<>();
        private final List<String> warningIssues = new ArrayList<>();
        
        public void addCritical(String issue) { criticalIssues.add(issue); }
        public void addHigh(String issue) { highIssues.add(issue); }
        public void addWarning(String issue) { warningIssues.add(issue); }
        
        public boolean hasCriticalIssues() { return !criticalIssues.isEmpty(); }
        
        // getter方法...
        public List<String> getCriticalIssues() { return criticalIssues; }
        public List<String> getHighIssues() { return highIssues; }
        public List<String> getWarningIssues() { return warningIssues; }
    }
}
```

### 9.3 配置版本控制与回滚

实现配置的版本控制和回滚机制：

```java
@Service
@Slf4j
public class ConfigurationVersionControl {
    
    private final ConfigurationRepository configRepository;
    private final ApplicationEventPublisher eventPublisher;
    
    public ConfigurationVersionControl(ConfigurationRepository configRepository,
                                     ApplicationEventPublisher eventPublisher) {
        this.configRepository = configRepository;
        this.eventPublisher = eventPublisher;
    }
    
    /**
     * 保存配置版本
     */
    public ConfigurationVersion saveConfigurationVersion(String environment, 
                                                        Map<String, String> configuration, 
                                                        String changeDescription) {
        ConfigurationVersion version = new ConfigurationVersion();
        version.setEnvironment(environment);
        version.setConfiguration(configuration);
        version.setChangeDescription(changeDescription);
        version.setTimestamp(Instant.now());
        version.setCreatedBy(getCurrentUser());
        version.setVersionNumber(generateVersionNumber());
        
        ConfigurationVersion saved = configRepository.save(version);
        
        // 发布配置变更事件
        eventPublisher.publishEvent(new ConfigurationChangedEvent(saved));
        
        log.info("配置版本已保存: {} - {}", saved.getVersionNumber(), changeDescription);
        return saved;
    }
    
    /**
     * 回滚到指定版本
     */
    public void rollbackToVersion(String environment, String versionNumber) {
        Optional<ConfigurationVersion> versionOpt = 
            configRepository.findByEnvironmentAndVersionNumber(environment, versionNumber);
            
        if (versionOpt.isEmpty()) {
            throw new IllegalArgumentException("未找到指定版本: " + versionNumber);
        }
        
        ConfigurationVersion targetVersion = versionOpt.get();
        
        // 创建回滚版本记录
        saveConfigurationVersion(environment, 
            targetVersion.getConfiguration(),
            "回滚到版本 " + versionNumber);
        
        // 应用配置
        applyConfiguration(targetVersion.getConfiguration());
        
        log.info("已回滚到版本: {}", versionNumber);
    }
    
    /**
     * 比较两个版本的配置差异
     */
    public ConfigurationDiff compareVersions(String environment, 
                                           String version1, 
                                           String version2) {
        ConfigurationVersion v1 = configRepository
            .findByEnvironmentAndVersionNumber(environment, version1)
            .orElseThrow(() -> new IllegalArgumentException("版本不存在: " + version1));
            
        ConfigurationVersion v2 = configRepository
            .findByEnvironmentAndVersionNumber(environment, version2)
            .orElseThrow(() -> new IllegalArgumentException("版本不存在: " + version2));
        
        return calculateDiff(v1.getConfiguration(), v2.getConfiguration());
    }
    
    private ConfigurationDiff calculateDiff(Map<String, String> config1, 
                                          Map<String, String> config2) {
        ConfigurationDiff diff = new ConfigurationDiff();
        
        // 查找新增的配置
        config2.keySet().stream()
            .filter(key -> !config1.containsKey(key))
            .forEach(key -> diff.addAdded(key, config2.get(key)));
        
        // 查找删除的配置
        config1.keySet().stream()
            .filter(key -> !config2.containsKey(key))
            .forEach(key -> diff.addRemoved(key, config1.get(key)));
        
        // 查找修改的配置
        config1.keySet().stream()
            .filter(config2::containsKey)
            .filter(key -> !Objects.equals(config1.get(key), config2.get(key)))
            .forEach(key -> diff.addModified(key, config1.get(key), config2.get(key)));
        
        return diff;
    }
    
    private void applyConfiguration(Map<String, String> configuration) {
        // 应用配置到运行时环境
        // 这里可以集成配置中心或动态配置更新机制
    }
    
    private String getCurrentUser() {
        // 获取当前用户信息
        return "system"; // 简化实现
    }
    
    private String generateVersionNumber() {
        return "v" + System.currentTimeMillis();
    }
    
    // 配置版本实体
    @Entity
    @Data
    public static class ConfigurationVersion {
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;
        
        private String environment;
        private String versionNumber;
        
        @ElementCollection
        @MapKeyColumn(name = "config_key")
        @Column(name = "config_value")
        private Map<String, String> configuration;
        
        private String changeDescription;
        private Instant timestamp;
        private String createdBy;
    }
    
    // 配置差异对象
    @Data
    public static class ConfigurationDiff {
        private final Map<String, String> added = new HashMap<>();
        private final Map<String, String> removed = new HashMap<>();
        private final Map<String, ConfigurationChange> modified = new HashMap<>();
        
        public void addAdded(String key, String value) {
            added.put(key, value);
        }
        
        public void addRemoved(String key, String value) {
            removed.put(key, value);
        }
        
        public void addModified(String key, String oldValue, String newValue) {
            modified.put(key, new ConfigurationChange(oldValue, newValue));
        }
        
        @Data
        @AllArgsConstructor
        public static class ConfigurationChange {
            private String oldValue;
            private String newValue;
        }
    }
    
    // 配置变更事件
    public static class ConfigurationChangedEvent extends ApplicationEvent {
        private final ConfigurationVersion version;
        
        public ConfigurationChangedEvent(ConfigurationVersion version) {
            super(version);
            this.version = version;
        }
        
        public ConfigurationVersion getVersion() {
            return version;
        }
    }
}
```

## 第十章：配置迁移与最佳实践

### 10.1 Spring Boot 版本升级配置迁移

Spring Boot 版本升级时的配置迁移是一个常见但复杂的任务：


```java
@Component
@Slf4j
public class ConfigurationMigrator {
    
    private final Map<String, String> migrationRules = initializeMigrationRules();
    
    /**
     * 执行配置迁移
     */
    public MigrationResult migrateConfiguration(Properties oldConfig) {
        MigrationResult result = new MigrationResult();
        Properties migratedConfig = new Properties();
        
        for (String key : oldConfig.stringPropertyNames()) {
            String value = oldConfig.getProperty(key);
            
            if (migrationRules.containsKey(key)) {
                // 应用迁移规则
                String newKey = migrationRules.get(key);
                if (newKey != null && !newKey.isEmpty()) {
                    migratedConfig.setProperty(newKey, value);
                    result.addMigrated(key, newKey, value);
                    log.info("配置迁移: {} -> {}", key, newKey);
                } else {
                    result.addDeprecated(key, value);
                    log.warn("配置已废弃: {}", key);
                }
            } else if (isDeprecatedProperty(key)) {
                result.addDeprecated(key, value);
                log.warn("发现废弃配置: {}", key);
            } else {
                migratedConfig.setProperty(key, value);
                result.addUnchanged(key, value);
            }
        }
        
        result.setMigratedConfiguration(migratedConfig);
        generateMigrationReport(result);
        
        return result;
    }
    
    private Map<String, String> initializeMigrationRules() {
        Map<String, String> rules = new HashMap<>();
        
        // Spring Boot 2.x -> 3.x 迁移规则
        rules.put("spring.jpa.hibernate.use-new-id-generator-mappings", "");
        rules.put("spring.jpa.properties.hibernate.id.new_generator_mappings", "");
        rules.put("spring.datasource.continue-on-error", "spring.sql.init.continue-on-error");
        rules.put("spring.datasource.data", "spring.sql.init.data-locations");
        rules.put("spring.datasource.initialization-mode", "spring.sql.init.mode");
        rules.put("spring.datasource.schema", "spring.sql.init.schema-locations");
        rules.put("spring.datasource.separator", "spring.sql.init.separator");
        
        // Security配置迁移
        rules.put("security.basic.enabled", "");
        rules.put("security.basic.path", "");
        rules.put("management.security.enabled", "");
        
        // Actuator配置迁移
        rules.put("management.port", "management.server.port");
        rules.put("management.address", "management.server.address");
        rules.put("management.context-path", "management.server.servlet.context-path");
        
        return rules;
    }
    
    private boolean isDeprecatedProperty(String key) {
        String[] deprecatedPatterns = {
            "security.basic",
            "management.security",
            "spring.jpa.hibernate.use-new-id-generator-mappings"
        };
        
        return Arrays.stream(deprecatedPatterns)
                    .anyMatch(key::startsWith);
    }
    
    private void generateMigrationReport(MigrationResult result) {
        log.info("=== 配置迁移报告 ===");
        log.info("迁移的配置: {}", result.getMigratedProperties().size());
        log.info("废弃的配置: {}", result.getDeprecatedProperties().size());
        log.info("未变更的配置: {}", result.getUnchangedProperties().size());
        
        if (!result.getMigratedProperties().isEmpty()) {
            log.info("迁移详情:");
            result.getMigratedProperties().forEach((oldKey, newKey) -> 
                log.info("  {} -> {}", oldKey, newKey));
        }
        
        if (!result.getDeprecatedProperties().isEmpty()) {
            log.warn("废弃配置:");
            result.getDeprecatedProperties().keySet().forEach(key -> 
                log.warn("  {}", key));
        }
    }
    
    // 迁移结果对象
    @Data
    public static class MigrationResult {
        private Properties migratedConfiguration;
        private final Map<String, String> migratedProperties = new HashMap<>();
        private final Map<String, String> deprecatedProperties = new HashMap<>();
        private final Map<String, String> unchangedProperties = new HashMap<>();
        
        public void addMigrated(String oldKey, String newKey, String value) {
            migratedProperties.put(oldKey, newKey);
        }
        
        public void addDeprecated(String key, String value) {
            deprecatedProperties.put(key, value);
        }
        
        public void addUnchanged(String key, String value) {
            unchangedProperties.put(key, value);
        }
    }
}
```

### 10.2 配置管理最佳实践总结

以下是 Spring Boot 配置管理的最佳实践：

```java
/**
 * 配置管理最佳实践示例
 * 
 * 这个类展示了在企业级应用中如何优雅地管理配置
 */
@Configuration
@EnableConfigurationProperties({
    ApplicationProperties.class,
    SecurityProperties.class,
    DatabaseProperties.class
})
@Slf4j
public class ConfigurationBestPractices {
    
    /**
     * 最佳实践1: 使用类型安全的配置绑定
     */
    @ConfigurationProperties(prefix = "app.feature")
    @Validated
    @Data
    public static class FeatureFlags {
        
        /**
         * 支付功能开关
         */
        @Builder.Default
        private boolean paymentEnabled = true;
        
        /**
         * 通知功能开关
         */
        @Builder.Default
        private boolean notificationEnabled = true;
        
        /**
         * 实验性功能开关
         */
        private Map<String, Boolean> experimental = new HashMap<>();
        
        /**
         * 功能配置
         */
        @Valid
        private AdvancedFeatures advanced = new AdvancedFeatures();
        
        @Data
        public static class AdvancedFeatures {
            @Min(1) @Max(1000)
            private int batchSize = 100;
            
            @DurationMin(seconds = 1) @DurationMax(minutes = 60)
            private Duration timeout = Duration.ofSeconds(30);
        }
    }
    
    /**
     * 最佳实践2: 环境特定的配置Bean
     */
    @Bean
    @Profile("!prod")
    public DataSource developmentDataSource() {
        HikariDataSource dataSource = new HikariDataSource();
        dataSource.setJdbcUrl("jdbc:h2:mem:testdb");
        dataSource.setUsername("sa");
        dataSource.setPassword("");
        dataSource.setMaximumPoolSize(5);
        return dataSource;
    }
    
    @Bean
    @Profile("prod")
    public DataSource productionDataSource(@Autowired DatabaseProperties dbProps) {
        HikariDataSource dataSource = new HikariDataSource();
        dataSource.setJdbcUrl(dbProps.getUrl());
        dataSource.setUsername(dbProps.getUsername());
        dataSource.setPassword(dbProps.getPassword());
        dataSource.setMaximumPoolSize(dbProps.getHikari().getMaximumPoolSize());
        dataSource.setMinimumIdle(dbProps.getHikari().getMinimumIdle());
        dataSource.setConnectionTimeout(dbProps.getHikari().getConnectionTimeout().toMillis());
        
        // 生产环境特定配置
        dataSource.setLeakDetectionThreshold(60000);
        dataSource.setConnectionTestQuery("SELECT 1");
        
        return dataSource;
    }
    
    /**
     * 最佳实践3: 配置验证和健康检查
     */
    @Component
    public static class ConfigurationHealthIndicator implements HealthIndicator {
        
        @Autowired
        private FeatureFlags featureFlags;
        
        @Override
        public Health health() {
            Health.Builder builder = Health.up();
            
            try {
                // 验证关键配置
                validateCriticalConfiguration();
                
                builder.withDetail("features", Map.of(
                    "payment", featureFlags.isPaymentEnabled(),
                    "notification", featureFlags.isNotificationEnabled(),
                    "experimental", featureFlags.getExperimental().size()
                ));
                
            } catch (Exception e) {
                builder.down()
                       .withDetail("error", e.getMessage());
            }
            
            return builder.build();
        }
        
        private void validateCriticalConfiguration() {
            if (featureFlags.getAdvanced().getBatchSize() <= 0) {
                throw new IllegalStateException("批处理大小配置无效");
            }
            
            if (featureFlags.getAdvanced().getTimeout().isNegative()) {
                throw new IllegalStateException("超时时间配置无效");
            }
        }
    }
    
    /**
     * 最佳实践4: 配置变更监听和响应
     */
    @Component
    public static class ConfigurationChangeHandler {
        
        @Autowired
        private FeatureFlags featureFlags;
        
        @EventListener
        @Async
        public void handleConfigurationRefresh(RefreshRemoteApplicationEvent event) {
            log.info("配置刷新事件: {}", event.getDestinationService());
            
            // 重新验证配置
            validateConfiguration();
            
            // 通知相关组件配置已更新
            notifyConfigurationChange();
        }
        
        private void validateConfiguration() {
            // 配置验证逻辑
            log.info("配置验证完成");
        }
        
        private void notifyConfigurationChange() {
            // 通知其他组件配置已更新
            log.info("配置变更通知已发送");
        }
    }
    
    /**
     * 最佳实践5: 配置文档生成
     */
    @Bean
    @ConditionalOnProperty(name = "app.config.documentation.enabled", havingValue = "true")
    public ConfigurationDocumentationGenerator documentationGenerator() {
        return new ConfigurationDocumentationGenerator();
    }
    
    public static class ConfigurationDocumentationGenerator {
        
        @PostConstruct
        public void generateDocumentation() {
            log.info("生成配置文档...");
            
            // 扫描所有@ConfigurationProperties类
            // 生成配置文档
            // 输出到指定位置
            
            log.info("配置文档生成完成");
        }
    }
}

/**
 * 配置管理工具类
 */
@Component
@Slf4j
public class ConfigurationManagementUtils {
    
    @Autowired
    private Environment environment;
    
    /**
     * 安全地获取配置值
     */
    public <T> Optional<T> getConfigSafely(String key, Class<T> targetType) {
        try {
            T value = environment.getProperty(key, targetType);
            return Optional.ofNullable(value);
        } catch (Exception e) {
            log.warn("获取配置失败: key={}, type={}, error={}", key, targetType.getSimpleName(), e.getMessage());
            return Optional.empty();
        }
    }
    
    /**
     * 获取配置值并提供默认值
     */
    public <T> T getConfigWithDefault(String key, Class<T> targetType, T defaultValue) {
        return getConfigSafely(key, targetType).orElse(defaultValue);
    }
    
    /**
     * 检查配置是否存在
     */
    public boolean hasConfig(String key) {
        return environment.containsProperty(key);
    }
    
    /**
     * 获取所有以指定前缀开头的配置
     */
    public Map<String, String> getConfigByPrefix(String prefix) {
        Map<String, String> result = new HashMap<>();
        
        if (environment instanceof ConfigurableEnvironment) {
            ConfigurableEnvironment configurableEnv = (ConfigurableEnvironment) environment;
            
            for (PropertySource<?> propertySource : configurableEnv.getPropertySources()) {
                if (propertySource instanceof EnumerablePropertySource) {
                    EnumerablePropertySource<?> enumerable = (EnumerablePropertySource<?>) propertySource;
                    
                    Arrays.stream(enumerable.getPropertyNames())
                          .filter(name -> name.startsWith(prefix))
                          .forEach(name -> {
                              Object value = enumerable.getProperty(name);
                              if (value != null) {
                                  result.put(name, value.toString());
                              }
                          });
                }
            }
        }
        
        return result;
    }
    
    /**
     * 配置变更检测
     */
    public boolean hasConfigurationChanged(String key, String expectedValue) {
        String currentValue = environment.getProperty(key);
        return !Objects.equals(currentValue, expectedValue);
    }
}
```

### 10.3 配置管理反模式与常见陷阱

```java
/**
 * 配置管理中需要避免的反模式和常见陷阱
 */
@Component
@Slf4j
public class ConfigurationAntiPatterns {
    
    /**
     * 反模式1: 硬编码配置值 ❌
     */
    public class BadExample1 {
        // 错误的做法
        private static final String DATABASE_URL = "jdbc:mysql://localhost:3306/mydb";
        private static final int MAX_CONNECTIONS = 20;
        
        // 正确的做法应该使用配置注入
    }
    
    /**
     * 反模式2: 过度使用@Value注解 ❌
     */
    public class BadExample2 {
        @Value("${database.url}")
        private String databaseUrl;
        
        @Value("${database.username}")
        private String username;
        
        @Value("${database.password}")
        private String password;
        
        @Value("${database.pool.max-size}")
        private int maxPoolSize;
        
        // 应该使用@ConfigurationProperties代替
    }
    
    /**
     * 反模式3: 配置类缺乏验证 ❌
     */
    public class BadExample3 {
        @ConfigurationProperties(prefix = "app")
        public static class UnsafeConfiguration {
            private String apiUrl;        // 没有验证URL格式
            private int threadPoolSize;   // 没有验证范围
            private String emailFormat;   // 没有验证邮箱格式
            
            // 缺少@Validated注解和验证规则
        }
    }
    
    /**
     * 反模式4: 在生产环境暴露敏感配置 ❌
     */
    public class BadExample4 {
        // 错误：在生产环境暴露所有配置端点
        // management.endpoints.web.exposure.include=*
        
        // 错误：敏感信息未加密
        // database.password=plainTextPassword
        
        // 错误：生产环境开启调试模式
        // logging.level.org.springframework=DEBUG
    }
    
    /**
     * 正确的配置管理示例 ✅
     */
    @ConfigurationProperties(prefix = "app.service")
    @Validated
    @Data
    public static class GoodConfigurationExample {
        
        @NotBlank(message = "服务名称不能为空")
        @Pattern(regexp = "^[a-zA-Z0-9-]+$", message = "服务名称只能包含字母、数字和连字符")
        private String name;
        
        @URL(message = "API地址格式不正确")
        private String apiUrl;
        
        @Min(value = 1, message = "线程池大小至少为1")
        @Max(value = 100, message = "线程池大小不能超过100")
        private int threadPoolSize = 10;
        
        @DurationMin(seconds = 1)
        @DurationMax(minutes = 10)
        private Duration timeout = Duration.ofSeconds(30);
        
        @Valid
        private Security security = new Security();
        
        @Data
        public static class Security {
            @NotBlank
            private String tokenEndpoint;
            
            @Min(300) @Max(7200)
            private int tokenTtl = 3600;
            
            private boolean enableSsl = true;
        }
    }
    
    /**
     * 配置陷阱检测器
     */
    @Component
    public static class ConfigurationTrapDetector {
        
        @Autowired
        private Environment environment;
        
        @EventListener
        public void detectConfigurationTraps(ApplicationReadyEvent event) {
            log.info("开始检测配置陷阱...");
            
            detectHardcodedValues();
            detectInsecureConfigurations();
            detectPerformanceIssues();
            detectMissingValidations();
            
            log.info("配置陷阱检测完成");
        }
        
        private void detectHardcodedValues() {
            // 检测硬编码值的逻辑
            String[] suspiciousValues = {
                "localhost", "127.0.0.1", "admin", "password", "secret"
            };
            
            // 扫描配置中是否包含可疑的硬编码值
        }
        
        private void detectInsecureConfigurations() {
            // 检测不安全的配置
            if (isProductionProfile() && isDebugEnabled()) {
                log.warn("配置陷阱: 生产环境开启了调试模式");
            }
            
            if (hasPlaintextPasswords()) {
                log.error("配置陷阱: 发现明文密码");
            }
        }
        
        private void detectPerformanceIssues() {
            // 检测可能导致性能问题的配置
            int poolSize = environment.getProperty("spring.datasource.hikari.maximum-pool-size", 
                Integer.class, 10);
            if (poolSize > 200) {
                log.warn("配置陷阱: 数据库连接池配置过大，可能导致资源耗尽");
            }
        }
        
        private void detectMissingValidations() {
            // 检测缺失的配置验证
            // 这部分可以通过静态代码分析工具实现
        }
        
        private boolean isProductionProfile() {
            return Arrays.asList(environment.getActiveProfiles()).contains("prod");
        }
        
        private boolean isDebugEnabled() {
            return "DEBUG".equals(environment.getProperty("logging.level.root"));
        }
        
        private boolean hasPlaintextPasswords() {
            // 检测明文密码的逻辑
            return false; // 简化实现
        }
    }
}
```
