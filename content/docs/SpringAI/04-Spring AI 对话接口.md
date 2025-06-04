# Spring AI 对话接口

> ChatClient API 是 Spring AI 框架的核心组件，为与 AI 模型的通信提供了流畅且直观的编程接口。该 API 同时支持同步和流式响应模式，通过构建器模式实现了高度的灵活性和可扩展性。本文将深入分析 ChatClient API 的设计理念、核心功能和实际应用场景。
>
> ChatClient API 的设计体现了 Spring 框架对开发者友好性的一贯追求。通过流畅的 API 设计，开发者可以自然地构建与 AI 模型交互的应用程序，而无需关注底层通信协议的复杂性。这种抽象层的设计使得 AI 功能可以无缝集成到现有的 Spring 应用架构中。

## ChatClient的核心架构

### 流畅API的设计理念

`ChatClient` 采用**流畅 API（Fluent API）设计模式**，允许开发者**通过方法链式调用构建完整的提示请求**。这种设计模式的核心优势在于提高代码的可读性和表达力，使得 AI 交互的意图更加明确。

流畅 API 的构建过程包含多个阶段。首先，开发者通过 `prompt()` 方法启动 API 调用链。该方法有三个重载版本：

1. 无参数版本用于从零开始构建提示
2. 接受 Prompt 参数的版本用于传入预构建的提示对象
3. 接受字符串参数的版本提供便捷的用户文本输入方式

提示构建过程中，API 支持**用户消息**和**系统消息**的分别设置。用户消息是来自用户的直接输入，而系统消息由系统生成以指导对话行为。这种消息类型的区分使得 AI 模型能够更好地理解对话上下文和预期行为模式。

### ChatClient的创建机制

`ChatClient` 通过**构建器模式**进行创建，Spring AI 提供了自动配置的 `ChatClient.Builder` 实例。在最简单的使用场景中，开发者可以直接注入自动配置的构建器实例。以下是基础使用示例：

```java
package club.slavopolis.ai.controller;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * ChatClient 基础构建示例
 *
 * @version 1.0.0
 * @author: slavopolis
 * @since: 2025/6/1
 */
@RestController
public class MyController {

    private final ChatClient chatClient;

    public MyController(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }

    @GetMapping("/ai")
    String generate(String userInput) {
        return this.chatClient.prompt()
                .user(userInput)
                .call()
                .content();
    }
}
```

该实现展示了 `ChatClient` 的基本使用流程：

1. 用户输入设置为用户消息内容
2. `call()` 方法向 AI 模型发送请求
3. `content()` 方法返回 AI 模型的字符串响应。

## 多模型支持与配置管理

### 多ChatClient实例的应用场景

企业级应用中经常需要与多个 AI 模型协同工作。这种需求来源于不同的业务场景：使用不同模型处理不同类型的任务，实现当某个模型服务不可用时的故障转移机制，进行 A/B 测试以比较不同模型的性能，为用户提供基于偏好的模型选择，以及结合专业化模型的特定能力。

为了支持多模型场景，需要通过设置 `spring.ai.chat.client.enabled=false` 禁用默认的 `ChatClient.Builder` 自动配置，然后手动创建多个 `ChatClient` 实例。

### 单一模型类型的多实例配置

当需要创建使用相同底层模型但具有不同配置的多个 `ChatClient` 实例时，可以采用以下方式：

```java
// 基于已自动配置的 ChatModel 创建 ChatClient 实例
ChatModel myChatModel = ... // Spring Boot自动配置的实例
ChatClient chatClient = ChatClient.create(myChatModel);

// 使用构建器获得更多控制
ChatClient.Builder builder = ChatClient.builder(myChatModel);
ChatClient customChatClient = builder
    .defaultSystemPrompt("You are a helpful assistant.")
    .build();
```

### 不同模型类型的配置策略

当应用需要集成多种不同的 AI 模型时，可以为每个模型定义独立的 `ChatClient` bean：

```java
import org.springframework.ai.chat.ChatClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ChatClientConfig {
    
    @Bean
    public ChatClient openAiChatClient(OpenAiChatModel chatModel) {
        return ChatClient.create(chatModel);
    }
    
    @Bean
    public ChatClient anthropicChatClient(AnthropicChatModel chatModel) {
        return ChatClient.create(chatModel);
    }
}
```

在应用组件中，通过 `@Qualifier` 注解注入特定的 `ChatClient` 实例：

```java
@Configuration
public class ChatClientExample {
    
    @Bean
    CommandLineRunner cli(
            @Qualifier("openAiChatClient") ChatClient openAiChatClient,
            @Qualifier("anthropicChatClient") ChatClient anthropicChatClient) {
        return args -> {
            var scanner = new Scanner(System.in);
            ChatClient chat;
            
            // 模型选择逻辑
            System.out.println("\nSelect your AI model:");
            System.out.println("1. OpenAI");
            System.out.println("2. Anthropic");
            System.out.print("Enter your choice (1 or 2): ");
            String choice = scanner.nextLine().trim();
            
            if (choice.equals("1")) {
                chat = openAiChatClient;
                System.out.println("Using OpenAI model");
            } else {
                chat = anthropicChatClient;
                System.out.println("Using Anthropic model");
            }
            
            // 使用选定的ChatClient
            System.out.print("\nEnter your question: ");
            String input = scanner.nextLine();
            String response = chat.prompt(input).call().content();
            System.out.println("ASSISTANT: " + response);
            scanner.close();
        };
    }
}
```

### OpenAI兼容API端点的多实例配置

`OpenAiApi` 和 `OpenAiChatModel` 类提供了 `mutate()` 方法，支持创建具有不同属性的实例变体。这一功能在需要与多个 OpenAI 兼容API 协同工作时特别有用：

```java
@Service
public class MultiModelService {
    private static final Logger logger = LoggerFactory.getLogger(MultiModelService.class);
    
    @Autowired
    private OpenAiChatModel baseChatModel;
    
    @Autowired
    private OpenAiApi baseOpenAiApi;
    
    public void multiClientFlow() {
        try {
            // 为Groq (Llama3)创建新的OpenAiApi实例
            OpenAiApi groqApi = baseOpenAiApi.mutate()
                .baseUrl("https://api.groq.com/openai")
                .apiKey(System.getenv("GROQ_API_KEY"))
                .build();
            
            // 为OpenAI GPT-4创建新的OpenAiApi实例
            OpenAiApi gpt4Api = baseOpenAiApi.mutate()
                .baseUrl("https://api.openai.com")
                .apiKey(System.getenv("OPENAI_API_KEY"))
                .build();
            
            // 为Groq创建新的OpenAiChatModel实例
            OpenAiChatModel groqModel = baseChatModel.mutate()
                .openAiApi(groqApi)
                .defaultOptions(OpenAiChatOptions.builder().model("llama3-70b-8192").temperature(0.5).build())
                .build();
            
            // 为GPT-4创建新的OpenAiChatModel实例
            OpenAiChatModel gpt4Model = baseChatModel.mutate()
                .openAiApi(gpt4Api)
                .defaultOptions(OpenAiChatOptions.builder().model("gpt-4").temperature(0.7).build())
                .build();
            
            // 对两个模型执行相同的提示
            String prompt = "What is the capital of France?";
            String groqResponse = ChatClient.builder(groqModel).build().prompt(prompt).call().content();
            String gpt4Response = ChatClient.builder(gpt4Model).build().prompt(prompt).call().content();
            
            logger.info("Groq (Llama3) response: {}", groqResponse);
            logger.info("OpenAI GPT-4 response: {}", gpt4Response);
        }
        catch (Exception e) {
            logger.error("Error in multi-client flow", e);
        }
    }
}
```

## 响应处理机制

### ChatResponse结构分析

AI 模型的响应是一个由 `ChatResponse` 类型定义的丰富结构。该结构不仅包含响应内容，还包含关于响应生成过程的元数据。`ChatResponse` 可以包含多个被称为 `Generations` 的响应，每个响应都有自己的元数据。元数据信息包括用于创建响应的 token 数量，这一信息对于成本控制具有重要意义，因为托管 AI 模型的收费基于每个请求使用的 token 数量。

获取 `ChatResponse` 对象的示例：

```java
ChatResponse chatResponse = chatClient.prompt()
    .user("Tell me a joke")
    .call()
    .chatResponse();
```

### 实体映射功能

在实际应用中，经常需要将 AI 模型返回的字符串映射到特定的实体类。`entity()` 方法提供了这一功能。例如，定义 Java 记录：

```java
record ActorFilms(String actor, List<String> movies) {}
```

可以使用 `entity()` 方法将 AI 模型输出映射到该记录：

```java
ActorFilms actorFilms = chatClient.prompt()
    .user("Generate the filmography for a random actor.")
    .call()
    .entity(ActorFilms.class);
```

对于泛型列表类型，可以使用重载的 `entity` 方法：

```java
List<ActorFilms> actorFilms = chatClient.prompt()
    .user("Generate the filmography of 5 movies for Tom Hanks and Bill Murray.")
    .call()
    .entity(new ParameterizedTypeReference<List<ActorFilms>>() {});
```

### 流式响应处理

`stream()` 方法支持异步响应处理，这对于需要实时显示 AI 生成内容的应用场景特别有用：

```java
Flux<String> output = chatClient.prompt()
    .user("Tell me a joke")
    .stream()
    .content();
```

同样可以通过 `stream()` 方法获取 `ChatResponse` 流：

```java
Flux<ChatResponse> chatResponse = chatClient.prompt()
    .user("Tell me a joke")
    .stream()
    .chatResponse();
```

对于需要将流式响应转换为 Java 实体的场景，目前需要使用结构化输出转换器显式转换聚合响应：

```java
var converter = new BeanOutputConverter<>(new ParameterizedTypeReference<List<ActorsFilms>>() {});

Flux<String> flux = this.chatClient.prompt()
    .user(u -> u.text("""
                    Generate the filmography for a random actor.
                    {format}
                  """)
        .param("format", this.converter.getFormat()))
    .stream()
    .content();

String content = this.flux.collectList().block().stream().collect(Collectors.joining());
List<ActorFilms> actorFilms = this.converter.convert(this.content);
```

## 提示模板系统

### 变量替换机制

`ChatClient` 流畅 API 支持将用户和系统文本作为模板提供，模板中的变量在运行时被替换。这一功能大大提高了提示的灵活性和可重用性：

```java
String answer = ChatClient.create(chatModel).prompt()
    .user(u -> u
            .text("Tell me the names of 5 movies whose soundtrack was composed by {composer}")
            .param("composer", "John Williams"))
    .call()
    .content();
```

`ChatClient` 内部使用 `PromptTemplate` 类处理用户和系统文本，并依赖特定的 `TemplateRenderer` 实现替换变量值。默认情况下， Spring AI 使用基于开源 `StringTemplate` 引擎的 `StTemplateRenderer` 实现。

### 模板渲染器配置

Spring AI 还提供了 `NoOpTemplateRenderer`，用于不需要模板处理的场景。直接在 `ChatClient` 上配置的 `TemplateRenderer` 仅适用于在 `ChatClient` 构建器链中直接定义的提示内容，不会影响 `Advisors` 内部使用的模板。

如果需要使用不同的模板引擎，可以直接向 `ChatClient` 提供 `TemplateRenderer` 接口的自定义实现。也可以继续使用默认的 `StTemplateRenderer`，但采用自定义配置。

例如，如果计划在提示中包含 JSON 内容，可能希望使用不同的语法以避免与 JSON 语法冲突。可以使用尖括号作为分隔符：

```java
String answer = ChatClient.create(chatModel).prompt()
    .user(u -> u
            .text("Tell me the names of 5 movies whose soundtrack was composed by <composer>")
            .param("composer", "John Williams"))
    .templateRenderer(StTemplateRenderer.builder().startDelimiterToken('<').endDelimiterToken('>').build())
    .call()
    .content();
```

## 默认配置机制

### 默认系统文本配置

在 `@Configuration` 类中创建具有默认系统文本的 `ChatClient` 可以简化运行时代码。通过设置默认值，在调用 `ChatClient` 时只需要指定用户文本，无需为每个请求设置系统文本。

以下示例配置系统文本始终以海盗的语调回复：

```java
@Configuration
class Config {
    @Bean
    ChatClient chatClient(ChatClient.Builder builder) {
        return builder.defaultSystem("You are a friendly chat bot that answers question in the voice of a Pirate")
                .build();
    }
}
```

相应的 `@RestController` 调用：

```java
@RestController
class AIController {
    private final ChatClient chatClient;
    
    AIController(ChatClient chatClient) {
        this.chatClient = chatClient;
    }
    
    @GetMapping("/ai/simple")
    public Map<String, String> completion(@RequestParam(value = "message", defaultValue = "Tell me a joke") String message) {
        return Map.of("completion", this.chatClient.prompt().user(message).call().content());
    }
}
```

### 参数化默认系统文本

可以在系统文本中使用占位符，在运行时指定完成的语调：

```java
@Configuration
class Config {
    @Bean
    ChatClient chatClient(ChatClient.Builder builder) {
        return builder.defaultSystem("You are a friendly chat bot that answers question in the voice of a {voice}")
                .build();
    }
}

@RestController
class AIController {
    private final ChatClient chatClient;
    
    AIController(ChatClient chatClient) {
        this.chatClient = chatClient;
    }
    
    @GetMapping("/ai")
    Map<String, String> completion(@RequestParam(value = "message", defaultValue = "Tell me a joke") String message, String voice) {
        return Map.of("completion",
                this.chatClient.prompt()
                        .system(sp -> sp.param("voice", voice))
                        .user(message)
                        .call()
                        .content());
    }
}
```

### ChatClient.Builder的其他默认配置

在 `ChatClient.Builder` 级别，可以指定多种默认配置：

`defaultOptions(ChatOptions chatOptions)` 方法用于传入 `ChatOptions` 类中定义的可移植选项或 `OpenAiChatOptions` 等模型特定选项。

`defaultFunction` 相关方法支持函数调用功能。`name` 参数用于在用户文本中引用函数，`description` 解释函数的目的并帮助 AI 模型选择正确的函数以获得准确的响应。

`defaultUser` 方法系列允许定义用户文本，`Consumer<UserSpec>` 参数支持使用 lambda 表达式指定用户文本和默认参数。

`defaultAdvisors` 方法系列用于配置 `Advisors`，这些组件可以修改用于创建提示的数据。`QuestionAnswerAdvisor` 实现支持检索增强生成模式，通过在提示中附加与用户文本相关的上下文信息来实现。

所有这些默认配置都可以在运行时使用不带 `default` 前缀的相应方法进行覆盖。

## Advisors API集成

### Advisors的配置机制

Advisors API 为拦截、修改和增强 AI 驱动的交互提供了灵活且强大的方式。与 AI 模型交互时的常见模式是在提示中附加或增强上下文数据。

`ChatClient` 流畅 API 提供了 `AdvisorSpec` 接口用于配置 `advisors`。该接口提供了添加参数、一次设置多个参数以及向链中添加一个或多个 `advisors` 的方法：

```java
interface AdvisorSpec {
    AdvisorSpec param(String k, Object v);
    AdvisorSpec params(Map<String, Object> p);
    AdvisorSpec advisors(Advisor... advisors);
    AdvisorSpec advisors(List<Advisor> advisors);
}
```

将 `advisors` 添加到链中的顺序至关重要，因为它决定了执行顺序。每个 `advisor` 以某种方式修改提示或上下文，一个 `advisor` 所做的更改会传递给链中的下一个 `advisor`：

```java
ChatClient.builder(chatModel)
    .build()
    .prompt()
    .advisors(
        MessageChatMemoryAdvisor.builder(chatMemory).build(),
        QuestionAnswerAdvisor.builder(vectorStore).build()
    )
    .user(userText)
    .call()
    .content();
```

在此配置中，`MessageChatMemoryAdvisor` 首先执行，将对话历史添加到提示中。然后，`QuestionAnswerAdvisor` 基于用户问题和添加的对话历史执行搜索，可能提供更相关的结果。

### 日志记录Advisor

`SimpleLoggerAdvisor` 是一个记录 `ChatClient` 请求和响应数据的 `advisor`。启用日志记录时，将 `SimpleLoggerAdvisor` 添加到 `advisor` 链中，建议将其添加到链的末尾：

```java
ChatResponse response = ChatClient.create(chatModel).prompt()
        .advisors(new SimpleLoggerAdvisor())
        .user("Tell me a joke?")
        .call()
        .chatResponse();
```

要查看日志，需要将 `advisor` 包的日志级别设置为 DEBUG：

```
logging.level.org.springframework.ai.chat.client.advisor=DEBUG
```

可以通过构造函数自定义从 `AdvisedRequest` 和 `ChatResponse` 记录的数据：

```java
SimpleLoggerAdvisor customLogger = new SimpleLoggerAdvisor(
    request -> "Custom request: " + request.userText,
    response -> "Custom response: " + response.getResult()
);
```

### 聊天记忆系统

`ChatMemory` 接口表示聊天对话记忆的存储。它提供了向对话添加消息、从对话检索消息以及清除对话历史的方法。

当前有一个内置实现：`MessageWindowChatMemory`。该实现维护指定最大大小的消息窗口，默认为20条消息。当消息数量超过此限制时，较旧的消息会被移除，但系统消息会被保留。如果添加新的系统消息，所有先前的系统消息都会从内存中移除。

`MessageWindowChatMemory` 由 `ChatMemoryRepository` 抽象支持，该抽象为聊天对话记忆提供存储实现。有多种实现可用，包括`InMemoryChatMemoryRepository`、`JdbcChatMemoryRepository`、`CassandraChatMemoryRepository` 和`Neo4jChatMemoryRepository`。

## 技术实现要点

### 编程模型的混合使用

`ChatClient` 中命令式和响应式编程模型的结合使用是 API 的独特方面。通常应用程序要么是响应式的，要么是命令式的，但不会同时采用两种模式。

在自定义模型实现的 HTTP 客户端交互时，必须同时配置 `RestClient` 和 `WebClient`。

由于 Spring Boot 3.4 中的错误，必须设置 "spring.http.client.factory=jdk" 属性。否则，默认设置为 "reactor"，这会破坏某些 AI 工作流程，如 `ImageModel`。

流式处理仅通过响应式堆栈支持。出于这个原因，命令式应用程序必须包含响应式堆栈。非流式处理仅通过 Servlet 堆栈支持。响应式应用程序必须包含 Servlet 堆栈，并期望某些调用是阻塞的。

工具调用是命令式的，导致阻塞工作流程。这也导致部分或中断的 Micrometer 观测。

内置 `advisors` 对标准调用执行阻塞操作，对流式调用执行非阻塞操作。用于 `advisor` 流式调用的 Reactor Scheduler 可以通过每个 `Advisor` 类的 `Builder` 进行配置。

## 总结

ChatClient API 体现了 Spring AI 框架对企业级 AI 应用开发需求的深入理解。通过流畅的 API 设计、灵活的配置机制和强大的扩展能力，ChatClient 为 Java 开发者提供了构建复杂 AI 应用的有力工具。

API 的设计充分考虑了实际应用中的多样化需求，从简单的单模型交互到复杂的多模型协同，从同步响应到流式处理，从基础功能到高级的 `Advisors` 集成。这种全面性使得 `ChatClient` 能够适应不同规模和复杂度的企业应用场景。

对于希望在应用中集成 AI 功能的 Java 开发者而言，深入理解 ChatClient API 的设计原理和使用方法是构建高质量 AI 应用的关键。通过合理利用 API 的各种特性，开发者可以构建出既强大又易于维护的 AI 驱动应用程序。