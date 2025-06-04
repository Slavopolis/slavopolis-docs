# Common Module 使用指南

> Common Module 是一个企业级的 Spring Boot 基础模块，为微服务架构提供统一的基础组件和标准化支持。

Github 地址：[https://github.com/Slavopolis/Slavopolis-Boot/tree/master/slavopolis-common](https://github.com/Slavopolis/Slavopolis-Boot/tree/master/slavopolis-common)

## 技术栈

- JDK 21
- Spring Boot 3.5
- Jackson 2.18
- Lombok 1.18.36
- Jakarta Validation 3.1

### 1. 统一响应格式

所有 API 接口自动包装为统一的响应格式：

```java
{
    "code": 200,
    "message": "操作成功",
    "data": {
        // 业务数据
    },
    "timestamp": 1704067200000,
    "traceId": "trace-id-xxx"
}
```

### 2. 全局异常处理

自动捕获并处理各类异常，返回友好的错误信息：

```java
// 抛出业务异常
throw BusinessException.of(BusinessErrorCode.USER_NOT_FOUND);

// 自定义消息
throw new BusinessException("用户信息不存在");
```

### 3. 请求参数验证

```java
@RestController
@RequestMapping("/api/users")
public class UserController {
    
    @PostMapping
    public User createUser(@Valid @RequestBody CreateUserRequest request) {
        // 自动验证请求参数
        return userService.create(request);
    }
}
```

### 4. 分页查询支持

```java
@Data
@EqualsAndHashCode(callSuper = true)
public class UserQuery extends PageRequest {
    private String keyword;
    private Integer status;
}

// 使用
@GetMapping("/page")
public PageResult<User> page(UserQuery query) {
    return userService.page(query);
}
```

### 5. 统一常量管理

```java
// 使用通用常量
String charset = CommonConstants.CHARSET_UTF8;
int pageSize = CommonConstants.DEFAULT_PAGE_SIZE;

// 使用日期常量
String pattern = DateConstants.DATETIME_PATTERN;
```

### 6. 工具类支持

```java
// JSON工具
String json = JsonUtils.toJson(user);
User user = JsonUtils.fromJson(json, User.class);

// 字符串工具
if (StringUtils.isNotBlank(name)) {
    String camel = StringUtils.underscoreToCamel(name);
}

// 日期工具
String dateStr = DateUtils.formatDateTime(LocalDateTime.now());
LocalDateTime dateTime = DateUtils.parseDateTime("2025-01-01 12:00:00");

// 验证工具
ValidationUtils.notNull(userId, "用户ID不能为空");
ValidationUtils.isEmail(email, "邮箱格式不正确");
```

## 快速开始

### 1. 添加依赖

```xml
<parent>
    <groupId>club.slavopolis</groupId>
    <artifactId>slavopolis-common</artifactId>
    <version>1.0.0-SNAPSHOT</version>
</parent>
```

### 2. 配置扫描路径

如果你的包路径不是 `club.slavopolis.common`，需要配置组件扫描：

```java
@SpringBootApplication
@ComponentScan(basePackages = {"club.slavopolis.common", "your.package"})
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

### 3. 使用示例

```java
@RestController
@RequestMapping("/api/demo")
public class DemoController {
    
    @GetMapping("/{id}")
    public DemoVO getById(@PathVariable Long id) {
        // 自动包装为Result格式
        return demoService.getById(id);
    }
    
    @PostMapping
    public DemoVO create(@Valid @RequestBody DemoRequest request) {
        // 参数自动验证
        return demoService.create(request);
    }
    
    @GetMapping("/error")
    public void error() {
        // 抛出业务异常，自动处理
        throw BusinessException.of("演示异常");
    }
}
```

## 自定义配置

### 1. 关闭统一响应包装

对于特定接口不需要统一响应包装：

```java
@NoResponseWrap
@GetMapping("/raw")
public String raw() {
    return "raw response";
}
```

### 2. 自定义异常码

```java
// 定义业务错误码
public enum CustomErrorCode {
    CUSTOM_ERROR(30001, "自定义错误");
    
    private final int code;
    private final String message;
    // ... getter/constructor
}

// 使用
throw new BusinessException(CustomErrorCode.CUSTOM_ERROR.getCode(), 
                          CustomErrorCode.CUSTOM_ERROR.getMessage());
```

### 3. 扩展工具类

```java
public class MyStringUtils extends StringUtils {
    
    public static String customMethod(String str) {
        // 自定义实现
        return str;
    }
}
```

## 最佳实践

### 1. 异常处理

- 使用 `BusinessException `处理业务异常
- 使用 `SystemException` 处理系统异常
- 使用 `ValidationException` 处理参数验证异常
- 使用 `ThirdPartyException` 处理第三方服务异常

### 2. 响应码规范

- 2xx: 成功
- 4xx: 客户端错误
- 5xx: 服务端错误
- 10000-19999: 通用业务错误
- 20000+: 具体业务模块错误

### 3. 日志记录

全局异常处理器会自动记录异常日志，包含：

- 请求路径
- 请求方法
- 错误码
- 错误信息
- 异常堆栈（系统异常）

### 4. 请求追踪

通过 `traceId` 实现请求追踪：

```java
// 在日志中使用MDC
MDC.put(CommonConstants.TRACE_ID, traceId);
log.info("Processing request");
```

## 注意事项

1. **Jackson配置**：模块已配置 Jackson 序列化规则，如需自定义请继承现有配置
2. **验证器初始化**：`ValidationUtils` 需要 Spring 容器中的 `Validator` bean
3. **响应包装**：返回 `Result` 类型的接口不会再次包装
4. **异常处理优先级**：自定义异常处理器会覆盖默认处理器