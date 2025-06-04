# Spring AI Prompts

> 在 Spring AI 框架中，Prompts 承担着指导 AI 模型生成特定输出的关键角色。提示的设计和措辞方式直接影响模型的响应质量，因此掌握 Spring AI 的提示管理机制对于构建高质量 AI 应用至关重要。
>
> Spring AI 将提示处理的概念类比为 Spring MVC 中的 "视图" 管理。这种设计理念涉及创建包含动态内容占位符的扩展文本，然后根据用户请求或应用程序中的其他代码替换这些占位符。另一个恰当的类比是包含特定表达式占位符的 SQL 语句。
>
> 随着 Spring AI 的发展演进，框架将引入更高级别的抽象层来与 AI 模型交互。当前描述的基础类可以类比为 JDBC 在数据访问层的角色和功能。ChatModel 类相当于 JDK 中的核心 JDBC 库，而 ChatClient 类则类似于构建在 ChatModel 之上的 JdbcClient，通过 Advisor 提供更高级的构造来考虑与模型的过往交互、使用额外的上下文文档增强提示，并引入代理行为。

## 提示结构的演进历程

AI 领域中提示的结构随时间不断演进。最初，提示仅仅是简单的字符串。随着时间推移，提示开始包含特定输入的占位符，例如 AI 模型能够识别的 "USER:" 标记。OpenAI 进一步为提示引入了更多结构化元素，在 AI 模型处理之前将多个消息字符串分类为不同的角色。

这种结构化的演进反映了 AI 交互复杂性的不断增长。现代 AI 应用需要处理多轮对话、上下文信息传递和角色区分等复杂场景，因此需要更加精细化的提示管理机制。

## Prompt类的核心架构

### 基础结构分析

`Prompt` 类作为有序 `Message` 对象系列和请求 `ChatOptions` 的容器发挥作用。每个 `Message` 都体现了提示中的独特角色，在内容和意图方面存在差异。这些角色可以涵盖各种元素，从用户查询到 AI 生成的响应再到相关的背景信息。这种安排使得能够与 AI 模型进行复杂而详细的交互，因为提示是由多个消息构建的，每个消息都被分配特定的角色来参与对话。

以下是 `Prompt` 类的精简版本，为简洁起见省略了构造函数和实用方法：

```java
public class Prompt implements ModelRequest<List<Message>> {
    private final List<Message> messages;
    private ChatOptions chatOptions;
}
```

这种设计体现了 Spring AI 对结构化提示管理的重视。通过将多个消息组织到单一的 `Prompt` 实例中，框架能够支持复杂的对话场景和多角色交互。

### Message接口的设计理念

`Message` 接口封装了提示的文本内容、元数据属性集合以及称为 `MessageType` 的分类机制。该接口定义如下：

```java
public interface Content {
    String getContent();
    Map<String, Object> getMetadata();
}

public interface Message extends Content {
    MessageType getMessageType();
}
```

多模态消息类型还实现了 `MediaContent` 接口，提供 `Media` 内容对象列表：

```java
public interface MediaContent extends Content {
    Collection<Media> getMedia();
}
```

`Message` 接口的各种实现对应于 AI 模型可以处理的不同类别消息。模型根据对话角色来区分消息类别，这种角色区分机制是现代 AI 交互的核心特征。

![Spring AI 消息 API](https://bxsb-dev.oss-cn-shanghai.aliyuncs.com/spring-ai-message-api.jpg)

## 消息角色体系

### 角色分类机制

每个消息都被分配特定的角色。这些角色对消息进行分类，为 AI 模型澄清提示中每个段落的上下文和目的。这种结构化方法增强了与 AI 通信的细致度和有效性，因为提示的每个部分在交互中都发挥着独特而明确的作用。

主要角色包括：

* **系统角色（System Role）**：指导 AI 的行为和响应风格，为 AI 如何解释和回复输入设置参数或规则。这类似于在开始对话之前向 AI 提供指令。
* **用户角色（User Role）**：代表用户的输入，包括他们对 AI 的问题、命令或陈述。这个角色是基础性的，因为它构成了 AI 响应的基础。
* **助手角色（Assistant Role）**：AI 对用户输入的响应。这不仅仅是答案或反应，它对于维持对话流程至关重要。通过跟踪 AI 的先前响应（其 "助手角色" 消息），系统确保连贯且上下文相关的交互。助手消息还可能包含功能工具调用请求信息。
* **工具/功能角色（Tool/Function Role）**：工具/功能角色专注于响应工具调用助手消息返回额外信息。

### 角色枚举表示

角色在 Spring AI 中表示为枚举，如下所示：

```java
public enum MessageType {
    USER("user"),
    ASSISTANT("assistant"),
    SYSTEM("system"),
    TOOL("tool");
    // 其他实现细节
}
```

这种枚举设计确保了角色类型的一致性和类型安全性，避免了字符串常量可能带来的错误风险。

## PromptTemplate模板系统

### 核心设计原理

Spring AI 中提示模板的关键组件是 `PromptTemplate` 类，旨在促进创建结构化提示，然后将其发送到 AI 模型进行处理：

```java
public class PromptTemplate implements PromptTemplateActions, PromptTemplateMessageActions {
    // 其他方法稍后讨论
}
```

该类使用 TemplateRenderer API 来渲染模板。默认情况下，Spring AI 使用基于 Terence Parr 开发的开源 `StringTemplate` 引擎的 `StTemplateRenderer` 实现。模板变量通过 `{}` 语法识别，但您也可以配置分隔符以使用其他语法。

### TemplateRenderer接口

`TemplateRenderer` 接口定义了模板渲染的标准行为：

```java
public interface TemplateRenderer extends BiFunction<String, Map<String, Object>, String> {
    @Override
    String apply(String template, Map<String, Object> variables);
}
```

Spring AI 使用 `TemplateRenderer` 接口处理变量到模板字符串的实际替换。默认实现使用 `StringTemplate`。如果需要自定义逻辑，您可以提供自己的 `TemplateRenderer` 实现。对于不需要模板渲染的场景（例如，模板字符串已经完整），您可以使用提供的 `NoOpTemplateRenderer`。

### 自定义分隔符配置

使用带有 `'<'` 和 `'>'` 分隔符的自定义 `StringTemplate` 渲染器示例：

```java
PromptTemplate promptTemplate = PromptTemplate.builder()
    .renderer(StTemplateRenderer.builder().startDelimiterToken('<').endDelimiterToken('>').build())
    .template("""
            Tell me the names of 5 movies whose soundtrack was composed by <composer>.
            """)
    .build();
String prompt = promptTemplate.render(Map.of("composer", "John Williams"));
```

这种灵活的分隔符配置特别有用于包含 JSON 内容的提示，可以避免与 JSON 语法产生冲突。

### 接口功能分层

`PromptTemplate` 类实现的接口支持提示创建的不同方面：

**PromptTemplateStringActions** 专注于创建和渲染提示字符串，代表最基本的提示生成形式：

```java
public interface PromptTemplateStringActions {
    String render();
    String render(Map<String, Object> model);
}
```

`render()` 方法将提示模板渲染为最终字符串格式，无需外部输入，适用于没有占位符或动态内容的模板。`render(Map<String, Object> model)` 方法增强渲染功能以包含动态内容，使用 `Map<String, Object>`，其中映射键是提示模板中的占位符名称，值是要插入的动态内容。

**PromptTemplateMessageActions** 专门用于通过生成和操作 `Message` 对象进行提示创建：

```java
public interface PromptTemplateMessageActions {
    Message createMessage();
    Message createMessage(List<Media> mediaList);
    Message createMessage(Map<String, Object> model);
}
```

`createMessage()` 方法创建不带附加数据的 `Message` 对象，用于静态或预定义的消息内容。`createMessage(List<Media> mediaList)` 方法创建带有静态文本和媒体内容的 `Message` 对象。`createMessage(Map<String, Object> model)` 方法扩展消息创建以集成动态内容。

**PromptTemplateActions** 旨在返回可以传递给 `ChatModel` 以生成响应的 `Prompt` 对象：

```java
public interface PromptTemplateActions extends PromptTemplateStringActions {
    Prompt create();
    Prompt create(ChatOptions modelOptions);
    Prompt create(Map<String, Object> model);
    Prompt create(Map<String, Object> model, ChatOptions modelOptions);
}
```

这些方法提供了不同级别的 `Prompt` 创建功能，从无外部数据输入的基础生成到包含动态内容和特定聊天选项的高级创建。

## 实际应用示例

### 基础模板使用

从 AI Workshop 关于 `PromptTemplates` 的简单示例：

```java
PromptTemplate promptTemplate = new PromptTemplate("Tell me a {adjective} joke about {topic}");
Prompt prompt = promptTemplate.create(Map.of("adjective", adjective, "topic", topic));
return chatModel.call(prompt).getResult();
```

这个示例展示了基础的模板变量替换机制，通过简单的占位符语法实现动态内容注入。

### 角色组合应用

从 AI Workshop 关于角色的示例：

```java
String userText = """
    Tell me about three famous pirates from the Golden Age of Piracy and why they did.
    Write at least a sentence for each pirate.
    """;
Message userMessage = new UserMessage(userText);

String systemText = """
  You are a helpful AI assistant that helps people find information.
  Your name is {name}
  You should reply to the user's request with your name and also in the style of a {voice}.
  """;
SystemPromptTemplate systemPromptTemplate = new SystemPromptTemplate(systemText);
Message systemMessage = systemPromptTemplate.createMessage(Map.of("name", name, "voice", voice));

Prompt prompt = new Prompt(List.of(userMessage, systemMessage));
List<Generation> response = chatModel.call(prompt).getResults();
```

此示例展示了如何使用 `SystemPromptTemplate` 创建具有系统角色的消息，通过传入占位符值来构建 `Prompt` 实例。用户角色的消息然后与系统角色的消息结合形成提示，该提示传递给 `ChatModel` 以获得生成性响应。

### 自定义模板渲染器

您可以通过实现 `TemplateRenderer` 接口并将其传递给 `PromptTemplate` 构造函数来使用自定义模板渲染器。您也可以继续使用默认的 `StTemplateRenderer`，但采用自定义配置：

```java
PromptTemplate promptTemplate = PromptTemplate.builder()
    .renderer(StTemplateRenderer.builder().startDelimiterToken('<').endDelimiterToken('>').build())
    .template("""
            Tell me the names of 5 movies whose soundtrack was composed by <composer>.
            """)
    .build();
String prompt = promptTemplate.render(Map.of("composer", "John Williams"));
```

### 资源文件支持

Spring AI 支持 `org.springframework.core.io.Resource` 抽象，因此您可以将提示数据放在文件中，该文件可以直接在 `PromptTemplate` 中使用。例如，您可以在 Spring 管理的组件中定义字段来检索 `Resource`：

```java
@Value("classpath:/prompts/system-message.st")
private Resource systemResource;
```

然后将该资源直接传递给 `SystemPromptTemplate`：

```java
SystemPromptTemplate systemPromptTemplate = new SystemPromptTemplate(systemResource);
```

这种方法支持将复杂的提示内容外部化管理，便于维护和版本控制。

## 提示工程的最佳实践

### 核心设计原则

在生成式 AI 中，提示的创建是开发者的关键任务。这些提示的质量和结构显著影响 AI 输出的有效性。在设计深思熟虑的提示上投入时间和精力可以大大改善 AI 的结果。

在 AI 社区中，分享和讨论提示是常见做法。这种协作方法不仅创造了共享学习环境，还导致识别和使用高效提示。该领域的研究通常涉及分析和比较不同提示以评估它们在各种情况下的有效性。例如，一项重要研究表明，以 "深呼吸，逐步解决这个问题" 开始提示显著提高了问题解决效率。

### 有效提示的构成要素

开发提示时，整合几个关键组件以确保清晰度和有效性是重要的：

* **指令**：向 AI 提供清晰直接的指令，就像您与人交流一样。这种清晰度对于帮助 AI "理解" 期望内容至关重要。
* **外部上下文**：在必要时包含相关背景信息或 AI 响应的特定指导。这种 "外部上下文" 为提示提供框架，帮助 AI 掌握整体场景。
* **用户输入**：这是直接部分，即用户的直接请求或问题，构成提示的核心。
* **输出指示器**：这个方面可能很棘手。它涉及指定 AI 响应的期望格式，例如 JSON。但是，要注意 AI 可能不总是严格遵守这种格式。例如，它可能在实际 JSON 数据之前添加诸如 "这是您的 JSON" 之类的短语，或者有时生成不准确的 JSON 类似结构。

在制作提示时，为 AI 提供预期问答格式的示例可能非常有益。这种做法帮助AI "理解" 查询的结构和意图，从而产生更精确和相关的响应。

### 技术方法分类

**简单技术**包括文本摘要，将广泛文本减少为简洁摘要，捕获关键点和主要思想，同时省略不太重要的细节。问答专注于根据用户提出的问题从提供的文本中得出特定答案。文本分类系统地将文本分类为预定义类别或组。对话创建交互式对话，AI 可以与用户进行来回交流。代码生成基于特定用户要求或描述生成功能代码片段。

**高级技术**包括零样本和少样本学习，使模型能够在对特定问题类型很少或没有先验示例的情况下做出准确预测或响应。思维链将多个AI响应链接起来创建连贯且上下文感知的对话。ReAct（推理+行动）方法中，AI首先分析（推理）输入，然后确定最合适的行动过程或响应。

Microsoft提供了结构化的提示创建和优化框架方法。该框架指导用户创建有效的提示，从AI模型中引出期望的响应，优化交互的清晰度和效率。

## Token机制的深入理解

### Token的基本概念

Token 在 AI 模型处理文本的方式中至关重要，充当将单词（我们理解的）转换为 AI 模型可以处理的格式的桥梁。这种转换发生在两个阶段：输入时单词转换为 token，输出时这些 token 转换回单词。

分词（将文本分解为 token 的过程）是AI模型理解和处理语言的基础。AI模型使用这种分词格式来理解和响应提示。为了更好地理解token，可以将它们视为单词的部分。通常，一个 token 代表大约四分之三的单词。例如，莎士比亚的完整作品总共约90万词，将转换为大约120万个 token。

### Token的实际影响

Token 除了在 AI 处理中的技术角色外，还具有实际意义，特别是在计费和模型能力方面：

1. **计费考虑**：AI模型服务通常基于token使用量计费。输入（提示）和输出（响应）都计入总token数，使较短的提示更具成本效益。
2. **模型限制**：不同的AI模型具有不同的token限制，定义了它们的"上下文窗口"，即它们一次可以处理的最大信息量。例如，GPT-3的限制是4K token，而Claude 2和Meta Llama 2等其他模型的限制为10万token，一些研究模型可以处理多达100万token。
3. **上下文窗口**：模型的token限制决定其上下文窗口。超过此限制的输入不被模型处理。发送最小有效信息集进行处理至关重要。例如，当询问"哈姆雷特"时，不需要包含莎士比亚其他所有作品的token。
4. **响应元数据**：来自AI模型的响应元数据包括使用的token数量，这是管理使用量和成本的重要信息。

这种token机制的理解对于有效使用AI模型和控制相关成本具有重要意义。开发者需要在功能需求和token消耗之间找到平衡点，以优化应用性能和经济效益。

## 总结

Spring AI 的 Prompts 系统为企业级AI应用提供了全面而灵活的提示管理解决方案。通过结构化的消息角色体系、强大的模板系统和深入的 token 管理机制，开发者能够构建出高质量且成本可控的AI应用。

深入理解提示工程的原理和最佳实践对于充分发挥 Spring AI 框架的潜力至关重要。随着AI技术的持续发展，掌握这些基础概念将为开发者在构建下一代智能应用时提供坚实的技术基础。通过合理运用 Spring AI 的提示管理功能，开发者可以创建出既智能又可维护的企业级AI解决方案。

