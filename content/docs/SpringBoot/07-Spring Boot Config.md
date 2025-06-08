# Spring Boot 配置管理

> 在现代应用开发中，配置管理是一个至关重要的环节。随着微服务架构的普及和 DevOps 实践的深入，如何优雅地管理应用配置、实现环境隔离、保障配置安全已成为每个技术团队必须面对的挑战。Spring Boot 作为 Java 生态系统中最受欢迎的框架之一，提供了一套完整而强大的配置管理体系。
>
> 本文将深入解析 Spring Boot 配置管理的方方面面，从基础的配置类定义到高级的配置加密，从简单的属性绑定到复杂的多环境管理，呈现一个完整的 Spring Boot 配置管理知识体系。

## 第一章：Spring Boot 配置类基础

### 1.1 自定义配置类的演进

Spring 框架在 3.0 版本之前严重依赖 XML 配置文件，这种方式虽然功能强大，但存在配置冗余、类型安全性差等问题。Spring 3.0 引入的 `@Configuration` 注解彻底改变了这一现状，实现了 "**约定优于配置**" 的设计理念。

Spring Boot 在此基础上更进一步，提供了 `@SpringBootConfiguration` 注解，这是 Spring Boot 专用的配置类注解。虽然它本质上是对 `@Configuration` 注解的封装，但体现了 Spring Boot 的设计哲学：

```java
@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Configuration // 内部还是 @Configuration
@Indexed
public @interface SpringBootConfiguration {
    @AliasFor(
        annotation = Configuration.class
    )
    boolean proxyBeanMethods() default true;
}
```

在实际项目中，推荐使用 `@SpringBootConfiguration` 替代 `@Configuration`，这样能够更好地与 Spring Boot 生态系统集成：

```java
@SpringBootConfiguration
public class ApplicationConfiguration {

    @Bean
    @ConditionalOnMissingBean // 条件注解：不存在 RestTemplate 则配置
    public RestTemplate restTemplate() {
        RestTemplate restTemplate = new RestTemplate();
        // 配置连接超时和读取超时
        restTemplate.setRequestFactory(clientHttpRequestFactory());
        return restTemplate;
    }

    @Bean
    public ClientHttpRequestFactory clientHttpRequestFactory() {
        HttpComponentsClientHttpRequestFactory factory = new HttpComponentsClientHttpRequestFactory();
        factory.setConnectTimeout(5000);
        factory.setReadTimeout(10000);
        return factory;
    }

    @Bean
    @ConditionalOnProperty(name = "app.cache.enabled", havingValue = "true", matchIfMissing = true) // 条件注解：启用生效
    public CacheManager cacheManager() {
        return new ConcurrentMapCacheManager("userCache", "productCache");
    }
}
```

### 1.2 模块化配置管理

在大型项目中，将所有配置集中在一个类中会导致配置类过于臃肿，降低代码的可维护性。最佳实践是按照功能模块将配置拆分为多个专门的配置类：

```java
// 数据源配置
@SpringBootConfiguration
@EnableJpaRepositories(basePackages = "com.example.repository")
public class DataSourceConfiguration {

    @Bean
    @Primary
    @ConfigurationProperties("spring.datasource.primary")
    public DataSourceProperties primaryDataSourceProperties() {
        return new DataSourceProperties();
    }

    @Bean
    @Primary
    @ConfigurationProperties("spring.datasource.primary.hikari")
    public DataSource primaryDataSource() {
        return primaryDataSourceProperties()
                .initializeDataSourceBuilder()
                .type(HikariDataSource.class)
                .build();
    }

    @Bean
    @ConfigurationProperties("spring.datasource.secondary")
    public DataSourceProperties secondaryDataSourceProperties() {
        return new DataSourceProperties();
    }

    @Bean
    @ConfigurationProperties("spring.datasource.secondary.hikari")
    public DataSource secondaryDataSource() {
        return secondaryDataSourceProperties()
                .initializeDataSourceBuilder()
                .type(HikariDataSource.class)
                .build();
    }
}

// Redis配置
@SpringBootConfiguration
@EnableCaching
public class RedisConfiguration {

    @Bean
    @ConditionalOnMissingBean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);
        
        // 设置key序列化方式
        template.setKeySerializer(new StringRedisSerializer());
        template.setHashKeySerializer(new StringRedisSerializer());
        
        // 设置value序列化方式
        GenericJackson2JsonRedisSerializer jackson2JsonRedisSerializer = 
            new GenericJackson2JsonRedisSerializer();
        template.setValueSerializer(jackson2JsonRedisSerializer);
        template.setHashValueSerializer(jackson2JsonRedisSerializer);
        
        template.afterPropertiesSet();
        return template;
    }

    @Bean
    public CacheManager redisCacheManager(RedisConnectionFactory connectionFactory) {
        RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofHours(1))
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

### 1.3 配置导入机制

当配置类分布在不同的包或者外部依赖中时，需要使用导入机制将它们整合到应用上下文中。Spring 提供了多种导入方式：

```java
@SpringBootConfiguration
@Import({
    DataSourceConfiguration.class,
    RedisConfiguration.class,
    SecurityConfiguration.class
})
@ImportResource("classpath:legacy-config.xml") // 导入遗留的 XML 配置
public class MainConfiguration {

    // 主配置类内容
}

// 使用 ImportSelector 实现条件导入
public class CustomImportSelector implements ImportSelector {
    
    @Override
    public String[] selectImports(AnnotationMetadata importingClassMetadata) {
        List<String> configClasses = new ArrayList<>();
        
        // 根据环境变量决定导入哪些配置类
        if (isProductionEnvironment()) {
            configClasses.add("com.example.config.ProductionConfiguration");
        } else {
            configClasses.add("com.example.config.DevelopmentConfiguration");
        }
        
        // 根据类路径检查是否导入特定配置
        if (ClassUtils.isPresent("org.springframework.kafka.core.KafkaTemplate", null)) {
            configClasses.add("com.example.config.KafkaConfiguration");
        }
        
        return configClasses.toArray(new String[0]);
    }
    
    private boolean isProductionEnvironment() {
        return "production".equals(System.getProperty("spring.profiles.active"));
    }
}
```

## 第二章：Spring Boot 配置文件详解

### 2.1 配置文件类型与选择

Spring Boot 支持两种主要的配置文件格式：Properties 和 YAML。每种格式都有其适用场景和优缺点：

**Properties 格式特点：**

- 键值对结构简单明了
- 与传统 Java Properties 文件兼容
- 支持 `@PropertySource` 注解直接加载
- 适合简单的配置场景

**YAML 格式特点：（推荐）**

- 层次化结构清晰
- 支持复杂数据类型（列表、映射）
- 单个文件可定义多环境配置
- 更好的可读性和维护性

```yaml
# application.yml - 推荐的配置方式
server:
  port: 8080
  servlet:
    context-path: /api
  tomcat:
    max-threads: 200
    max-connections: 10000

spring:
  application:
    name: user-service
  
  datasource:
    primary:
      url: jdbc:mysql://localhost:3306/user_db
      username: ${DB_USERNAME:root}
      password: ${DB_PASSWORD:password}
      driver-class-name: com.mysql.cj.jdbc.Driver
      hikari:
        maximum-pool-size: 20
        minimum-idle: 5
        idle-timeout: 300000
        
  redis:
    host: ${REDIS_HOST:localhost}
    port: ${REDIS_PORT:6379}
    password: ${REDIS_PASSWORD:}
    timeout: 2000ms
    lettuce:
      pool:
        max-active: 200
        max-idle: 20
        min-idle: 5

logging:
  level:
    com.example: DEBUG
    org.springframework.security: DEBUG
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss} - %msg%n"
    file: "%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n"

# 应用自定义配置
app:
  security:
    jwt:
      secret: ${JWT_SECRET:mySecretKey}
      expiration: 86400000
  cache:
    enabled: true
    ttl: 3600
  notification:
    email:
      enabled: true
      smtp-host: smtp.gmail.com
      smtp-port: 587
```

### 2.2 配置文件加载机制

Spring Boot 采用约定优于配置的原则，按照特定的顺序加载配置文件。理解这个加载顺序对于配置管理至关重要：

**默认搜索路径（优先级从低到高）：**

1. `classpath:/`
2. `classpath:/config/`
3. `file:./`
4. `file:./config/`
5. `file:./config/*/`

**配置文件加载顺序：**

1. `application.properties/yml`（jar 包内）
2. `application-{profile}.properties/yml`（jar 包内）
3. `application.properties/yml`（jar 包外）
4. `application-{profile}.properties/yml`（jar 包外）

```java
// 自定义配置文件路径
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        System.setProperty("spring.config.location", "classpath:/config/,file:./config/,file:../config/");
        System.setProperty("spring.config.name", "application,database,cache");
        SpringApplication.run(Application.class, args);
    }
}
```

### 2.3 配置导入与外部化

Spring Boot 2.4+ 引入了配置导入功能，允许将配置拆分为多个文件：

```yaml
# application.yml
spring:
  config:
    import:
      - optional:classpath:database-config.yml
      - optional:classpath:cache-config.yml
      - optional:file:./external-config.yml

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

## 第三章：配置绑定与数据映射

### 3.1 传统配置注入的局限性

在 Spring 框架中，传统的 `@Value` 注解虽然可以注入配置值，但存在诸多局限性：

```java
// 不推荐的方式 - 代码冗余且不易维护
public class UserService {
    @Value("${app.user.default-page-size:10}")
    private int defaultPageSize;
    
    @Value("${app.user.max-page-size:100}")
    private int maxPageSize;
    
    @Value("${app.user.cache-enabled:true}")
    private boolean cacheEnabled;
    
    @Value("${app.user.cache-ttl:3600}")
    private long cacheTtl;
    
    // 大量重复的@Value注解...
}
```

这种方式的问题包括：代码重复性高、类型安全性差、不支持复杂数据结构、难以进行配置验证。

### 3.2 @ConfigurationProperties 高级应用

Spring Boot 的 `@ConfigurationProperties` 注解提供了更优雅的解决方案：

```java
@Data
@ConfigurationProperties(prefix = "app.user")
@Validated
public class UserProperties {
    
    /**
     * 默认分页大小
     */
    @Min(1)
    @Max(50)
    private int defaultPageSize = 10;
    
    /**
     * 最大分页大小
     */
    @Min(1)
    @Max(1000)
    private int maxPageSize = 100;
    
    /**
     * 是否启用缓存
     */
    private boolean cacheEnabled = true;
    
    /**
     * 缓存过期时间（秒）
     */
    @DurationUnit(ChronoUnit.SECONDS)
    private Duration cacheTtl = Duration.ofHours(1);
    
    /**
     * 用户角色配置
     */
    private Map<String, RoleConfig> roles = new HashMap<>();
    
    /**
     * 支持的语言列表
     */
    private List<String> supportedLanguages = Arrays.asList("zh", "en");
    
    /**
     * 安全配置
     */
    private Security security = new Security();
    
    @Data
    public static class Security {
        /**
         * 密码最小长度
         */
        @Min(6)
        private int passwordMinLength = 8;
        
        /**
         * 密码最大长度
         */
        @Max(50)
        private int passwordMaxLength = 32;
        
        /**
         * 密码复杂度要求
         */
        private PasswordComplexity complexity = PasswordComplexity.MEDIUM;
        
        /**
         * 登录失败最大尝试次数
         */
        @Min(1)
        @Max(10)
        private int maxLoginAttempts = 5;
        
        /**
         * 账户锁定时间
         */
        @DurationUnit(ChronoUnit.MINUTES)
        private Duration lockoutDuration = Duration.ofMinutes(30);
    }
    
    @Data
    public static class RoleConfig {
        private String name;
        private String description;
        private List<String> permissions;
        private int priority;
    }
    
    public enum PasswordComplexity {
        LOW, MEDIUM, HIGH
    }
}
```

对应的配置文件：

```yaml
app:
  user:
    default-page-size: 20
    max-page-size: 200
    cache-enabled: true
    cache-ttl: 7200s
    supported-languages:
      - zh
      - en
      - ja
    security:
      password-min-length: 10
      password-max-length: 50
      complexity: HIGH
      max-login-attempts: 3
      lockout-duration: 60m
    roles:
      admin:
        name: "系统管理员"
        description: "拥有系统最高权限"
        permissions:
          - "user:read"
          - "user:write"
          - "user:delete"
          - "system:manage"
        priority: 100
      user:
        name: "普通用户"
        description: "基础用户权限"
        permissions:
          - "user:read"
        priority: 1
```

### 3.3 构造器绑定模式

Spring Boot 2.2+ 引入了构造器绑定，支持创建不可变的配置对象：

```java
@ConfigurationProperties(prefix = "app.database")
public class DatabaseProperties {
    
    private final String url;
    private final String username;
    private final String password;
    private final HikariConfig hikari;
    private final int maxRetries;
    private final Duration connectionTimeout;
    
    public DatabaseProperties(
            String url,
            String username,
            String password,
            @DefaultValue("3") int maxRetries,
            @DefaultValue("30s") @DurationUnit(ChronoUnit.SECONDS) Duration connectionTimeout,
            HikariConfig hikari) {
        this.url = url;
        this.username = username;
        this.password = password;
        this.maxRetries = maxRetries;
        this.connectionTimeout = connectionTimeout;
        this.hikari = hikari;
    }
    
    // getter方法...
    
    public static class HikariConfig {
        private final int maximumPoolSize;
        private final int minimumIdle;
        private final Duration idleTimeout;
        
        public HikariConfig(
                @DefaultValue("20") int maximumPoolSize,
                @DefaultValue("5") int minimumIdle,
                @DefaultValue("10m") @DurationUnit(ChronoUnit.MINUTES) Duration idleTimeout) {
            this.maximumPoolSize = maximumPoolSize;
            this.minimumIdle = minimumIdle;
            this.idleTimeout = idleTimeout;
        }
        
        // getter方法...
    }
}
```

### 3.4 Bean 级别的配置绑定

对于第三方库的配置，可以在 Bean 定义级别使用 `@ConfigurationProperties`：

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

Spring Boot 的 Profile 机制是实现多环境配置的核心功能。在企业级应用中，通常需要维护开发、测试、预生产、生产等多套环境配置：

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
# 开发环境配置
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
# 测试环境配置
spring:
  config:
    activate:
      on-profile: "test"
      
server:
  port: 8081

spring:
  datasource:
    url: jdbc:mysql://test-db:3306/user_test
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
    
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
    
  redis:
    host: test-redis
    port: 6379

---
# 生产环境配置
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

在复杂的微服务架构中，可能需要更细粒度的 Profile 管理：

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

使用 `@Profile` 注解可以实现配置类的条件加载：

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
@Validated
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
@Constraint(validatedBy = DatabaseConfigValidator.class)
@Documented
public @interface ValidDatabaseConfig {
    String message() default "数据库配置验证失败";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}

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

// 应用到配置类
@Data
@Validated
@ValidDatabaseConfig
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

### 9.1 Jasypt集成与高级用法

Jasypt是Spring Boot应用中最流行的配置加密解决方案：

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

### 10.1 Spring Boot版本升级配置迁移

Spring Boot版本升级时的配置迁移是一个常见但复杂的任务：


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

基于多年的企业级应用开发经验，以下是Spring Boot配置管理的最佳实践：

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

## 总结与展望

Spring Boot 配置管理是构建现代企业级应用的基石。通过本文的深入分析，我们系统地探讨了从基础的配置类定义到高级的配置加密、从简单的属性绑定到复杂的多环境管理等各个方面。

核心要点回顾: 

1. **配置类设计**：使用 `@SpringBootConfiguration` 和模块化设计，提高配置的可维护性和可测试性。
2. **类型安全绑定**：通过 `@ConfigurationProperties` 实现类型安全的配置绑定，避免运行时错误。
3. **多环境管理**：合理使用 Profile 机制和配置文件优先级，实现环境间的配置隔离。
4. **配置验证**：集成 JSR-303 验证规范，确保配置的正确性和完整性。
5. **安全最佳实践**：使用配置加密、配置审计等手段保护敏感信息。
6. **扩展机制**：通过自定义 `PropertySourceLoader` 和 `EnvironmentPostProcessor` 实现高级定制。