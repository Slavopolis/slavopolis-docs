# Spring AI 结构化输出

在企业级 AI 应用开发中，将大语言模型的文本输出转换为结构化数据格式是一项关键需求。下游应用需要可靠地解析AI模型的输出值，开发者希望快速将AI模型的结果转换为JSON、XML或Java类等数据类型，以便传递给其他应用程序功能和方法。

Spring AI框架通过Structured Output Converter组件提供了完整的结构化输出解决方案。该组件在LLM文本完成端点周围操作，通过在调用前向提示追加格式指令，并在调用后将模型输出转换为指定的结构化类型实例，确保实现期望的输出结构。

值得注意的是，自2024年5月2日起，Spring AI已将原有的OutputParser、BeanOutputParser、ListOutputParser和MapOutputParser类标记为已弃用，推荐使用新的StructuredOutputConverter、BeanOutputConverter、ListOutputConverter和MapOutputConverter实现。新的实现提供相同的功能，命名更加准确，并与Spring的org.springframework.core.convert.converter包保持一致，带来了改进的功能特性。

## 架构设计与工作原理

### 核心架构概述

Structured Output Converter的架构设计体现了Spring AI对企业级应用需求的深入理解。该架构围绕LLM文本完成端点操作，通过精心设计的转换流程确保输出结构的准确性和可靠性。

在LLM调用之前，转换器将格式指令追加到提示中，为模型生成期望的输出结构提供明确指导。这些指令充当蓝图，引导模型的响应符合指定格式。在LLM调用之后，转换器获取模型的输出文本并将其转换为结构化类型的实例。这种转换过程涉及解析原始文本输出并将其映射到相应的结构化数据表示，例如JSON、XML或特定领域的数据结构。

![结构化输出转换器架构](https://bxsb-dev.oss-cn-shanghai.aliyuncs.com/structured-output-architecture.jpg)

### 核心接口设计

StructuredOutputConverter接口允许从基于文本的AI模型输出中获得结构化输出，例如将输出映射到Java类或值数组。接口定义如下：

```java
public interface StructuredOutputConverter<T> extends Converter<String, T>, FormatProvider {
}
```

该接口结合了Spring的Converter<String, T>接口和FormatProvider接口：

```java
public interface FormatProvider {
    String getFormat();
}
```

下图显示了使用结构化输出 API 时的数据流：

![结构化输出 API](https://bxsb-dev.oss-cn-shanghai.aliyuncs.com/structured-output-api.jpg)

FormatProvider为AI模型提供特定的格式指导，使其能够产生文本输出，这些输出可以使用Converter转换为指定的目标类型T。格式指令的示例如下：

```
Your response should be in JSON format.
The data structure for the JSON should match this Java class: java.util.HashMap
Do not include any explanations, only provide a RFC8259 compliant JSON response following this format without deviation.
```

格式指令通常使用PromptTemplate追加到用户输入的末尾：

```java
StructuredOutputConverter outputConverter = ...
String userInputTemplate = """
    ... user text input ....
    {format}
    """; // 带有"format"占位符的用户输入
Prompt prompt = new Prompt(
   new PromptTemplate(
       this.userInputTemplate,
      Map.of(..., "format", outputConverter.getFormat()) // 用转换器的格式替换"format"占位符
   ).createMessage());
```

Converter<String, T>负责将模型的输出文本转换为指定类型T的实例。

## 可用转换器实现

Spring AI目前提供AbstractConversionServiceOutputConverter、AbstractMessageOutputConverter、BeanOutputConverter、MapOutputConverter和ListOutputConverter实现。这些实现形成了完整的转换器类层次结构，满足不同场景的结构化输出需求。

![结构化输出类层次结构](https://bxsb-dev.oss-cn-shanghai.aliyuncs.com/structured-output-hierarchy4.jpg)

### 抽象基础转换器

AbstractConversionServiceOutputConverter<T>为将LLM输出转换为期望格式提供预配置的GenericConversionService。该抽象类不提供默认的FormatProvider实现，允许子类根据特定需求定制格式提供逻辑。

AbstractMessageOutputConverter<T>提供预配置的MessageConverter，用于将LLM输出转换为期望格式。与AbstractConversionServiceOutputConverter类似，该类不提供默认的FormatProvider实现，为子类提供了充分的定制空间。

### 具体转换器实现

BeanOutputConverter<T>配置有指定的Java类或ParameterizedTypeReference，该转换器采用FormatProvider实现，指导AI模型生成符合从指定Java类派生的DRAFT_2020_12 JSON Schema的JSON响应。随后，它利用ObjectMapper将JSON输出反序列化为目标类的Java对象实例。

MapOutputConverter扩展AbstractMessageOutputConverter的功能，具有FormatProvider实现，指导AI模型生成符合RFC8259的JSON响应。此外，它还包含转换器实现，利用提供的MessageConverter将JSON有效负载转换为java.util.Map<String, Object>实例。

ListOutputConverter扩展AbstractConversionServiceOutputConverter，包含专为逗号分隔列表输出定制的FormatProvider实现。转换器实现采用提供的ConversionService将模型文本输出转换为java.util.List。

## Bean输出转换器的应用

### 基础使用示例

Bean输出转换器是最常用的结构化输出转换器之一。以下示例展示如何使用BeanOutputConverter为演员生成电影作品列表。

首先定义表示演员电影作品的目标记录：

```java
record ActorsFilms(String actor, List<String> movies) {
}
```

使用高级流畅的ChatClient API应用BeanOutputConverter：

```java
ActorsFilms actorsFilms = ChatClient.create(chatModel).prompt()
        .user(u -> u.text("Generate the filmography of 5 movies for {actor}.")
                    .param("actor", "Tom Hanks"))
        .call()
        .entity(ActorsFilms.class);
```

或者直接使用低级ChatModel API：

```java
BeanOutputConverter<ActorsFilms> beanOutputConverter =
    new BeanOutputConverter<>(ActorsFilms.class);
String format = this.beanOutputConverter.getFormat();
String actor = "Tom Hanks";
String template = """
        Generate the filmography of 5 movies for {actor}.
        {format}
        """;
Generation generation = chatModel.call(
    new PromptTemplate(this.template, Map.of("actor", this.actor, "format", this.format)).create()).getResult();
ActorsFilms actorsFilms = this.beanOutputConverter.convert(this.generation.getOutput().getText());
```

### 属性排序控制

BeanOutputConverter通过@JsonPropertyOrder注解支持生成的JSON模式中的自定义属性排序。该注解允许指定属性在模式中出现的确切顺序，而不考虑它们在类或记录中的声明顺序。

例如，确保ActorsFilms记录中属性的特定排序：

java

```java
@JsonPropertyOrder({"actor", "movies"})
record ActorsFilms(String actor, List<String> movies) {}
```

该注解适用于记录和常规Java类。

### 泛型Bean类型处理

使用ParameterizedTypeReference构造函数指定更复杂的目标类结构。例如，表示演员列表及其电影作品：

```java
List<ActorsFilms> actorsFilms = ChatClient.create(chatModel).prompt()
        .user("Generate the filmography of 5 movies for Tom Hanks and Bill Murray.")
        .call()
        .entity(new ParameterizedTypeReference<List<ActorsFilms>>() {});
```

或者直接使用低级ChatModel API：

```java
BeanOutputConverter<List<ActorsFilms>> outputConverter = new BeanOutputConverter<>(
        new ParameterizedTypeReference<List<ActorsFilms>>() { });
String format = this.outputConverter.getFormat();
String template = """
        Generate the filmography of 5 movies for Tom Hanks and Bill Murray.
        {format}
        """;
Prompt prompt = new PromptTemplate(this.template, Map.of("format", this.format)).create();
Generation generation = chatModel.call(this.prompt).getResult();
List<ActorsFilms> actorsFilms = this.outputConverter.convert(this.generation.getOutput().getText());
```

## Map输出转换器的应用

Map输出转换器提供了将AI模型输出转换为键值对映射的能力。以下代码片段展示如何使用MapOutputConverter将模型输出转换为映射中的数字列表：

```java
Map<String, Object> result = ChatClient.create(chatModel).prompt()
        .user(u -> u.text("Provide me a List of {subject}")
                    .param("subject", "an array of numbers from 1 to 9 under they key name 'numbers'"))
        .call()
        .entity(new ParameterizedTypeReference<Map<String, Object>>() {});
```

或者直接使用低级ChatModel API：

```java
MapOutputConverter mapOutputConverter = new MapOutputConverter();
String format = this.mapOutputConverter.getFormat();
String template = """
        Provide me a List of {subject}
        {format}
        """;
Prompt prompt = new PromptTemplate(this.template,
        Map.of("subject", "an array of numbers from 1 to 9 under they key name 'numbers'", "format", this.format)).create();
Generation generation = chatModel.call(this.prompt).getResult();
Map<String, Object> result = this.mapOutputConverter.convert(this.generation.getOutput().getText());
```

## List输出转换器的应用

List输出转换器专门处理列表格式的输出转换。以下代码片段展示如何使用ListOutputConverter将模型输出转换为冰淇淋口味列表：

```java
List<String> flavors = ChatClient.create(chatModel).prompt()
                .user(u -> u.text("List five {subject}")
                            .param("subject", "ice cream flavors"))
                .call()
                .entity(new ListOutputConverter(new DefaultConversionService()));
```

或者直接使用低级ChatModel API：

```java
ListOutputConverter listOutputConverter = new ListOutputConverter(new DefaultConversionService());
String format = this.listOutputConverter.getFormat();
String template = """
        List five {subject}
        {format}
        """;
Prompt prompt = new PromptTemplate(this.template,
        Map.of("subject", "ice cream flavors", "format", this.format)).create();
Generation generation = this.chatModel.call(this.prompt).getResult();
List<String> list = this.listOutputConverter.convert(this.generation.getOutput().getText());
```

## 支持的AI模型

Spring AI的结构化输出转换器已经在多个主要AI模型上进行了测试验证。经过测试支持List、Map和Bean结构化输出的AI模型包括OpenAI（通过OpenAiChatModelIT测试）、Anthropic Claude 3（通过AnthropicChatModelIT.java测试）、Azure OpenAI（通过AzureOpenAiChatModelIT.java测试）、Mistral AI（通过MistralAiChatModelIT.java测试）、Ollama（通过OllamaChatModelIT.java测试）以及Vertex AI Gemini（通过VertexAiGeminiChatModelIT.java测试）。

这种广泛的模型支持确保了企业在选择AI提供商时具有充分的灵活性，同时保持代码的一致性和可移植性。

## 内置JSON模式支持

某些AI模型提供专用的配置选项来生成结构化输出，通常是JSON格式。这些内置功能可以与Spring AI的结构化输出转换器协同工作，提供更高的输出质量保证。

OpenAI的结构化输出功能可以确保模型生成严格符合提供的JSON Schema的响应。开发者可以选择JSON_OBJECT模式，该模式保证模型生成的消息是有效的JSON，或者选择JSON_SCHEMA模式，通过提供的模式保证模型生成匹配指定模式的响应（通过spring.ai.openai.chat.options.responseFormat选项配置）。

Azure OpenAI提供spring.ai.azure.openai.chat.options.responseFormat选项，指定模型必须输出的格式。设置为{ "type": "json_object" }启用JSON模式，保证模型生成的消息是有效的JSON。

Ollama提供spring.ai.ollama.chat.options.format选项，指定返回响应的格式。目前，唯一接受的值是json。

Mistral AI提供spring.ai.mistralai.chat.options.responseFormat选项，指定返回响应的格式。将其设置为{ "type": "json_object" }启用JSON模式，保证模型生成的消息是有效的JSON。

## 技术考虑与最佳实践

### 转换可靠性

StructuredOutputConverter尽力将模型输出转换为结构化输出。AI模型不保证按请求返回结构化输出。模型可能不理解提示或无法按请求生成结构化输出。因此，建议实施验证机制以确保模型输出符合预期。

在企业级应用中，应该实施多层验证策略。首先在转换层验证输出格式的正确性，然后在业务逻辑层验证数据的语义正确性。这种分层验证方法可以最大限度地提高应用的健壮性。

### 工具调用场景

需要注意的是，StructuredOutputConverter不用于LLM工具调用，因为该功能本身默认提供结构化输出。工具调用机制已经内置了结构化输出的能力，因此无需额外的转换步骤。

### 性能优化建议

在使用结构化输出转换器时，应该考虑性能优化策略。对于频繁使用的转换器实例，建议将其配置为单例Bean，避免重复创建的开销。同时，合理设计JSON Schema的复杂度，避免过于复杂的嵌套结构影响AI模型的理解和生成效率。

对于大批量数据处理场景，建议实施异步处理机制，避免阻塞主要业务流程。可以结合Spring的异步处理能力和消息队列技术，构建高效的批量处理管道。

## 总结

Spring AI的Structured Output Converter为企业级AI应用提供了完整的结构化输出解决方案。通过精心设计的架构和丰富的转换器实现，该组件能够可靠地将AI模型的文本输出转换为应用程序可直接使用的结构化数据格式。

新的StructuredOutputConverter系列实现不仅保持了与原有OutputParser系列的功能兼容性，还提供了更准确的命名和改进的功能特性。广泛的AI模型支持和内置JSON模式集成进一步增强了该组件在企业环境中的实用性。

对于企业级AI应用开发者而言，深入理解和合理运用Structured Output Converter是构建可靠AI应用的关键技能。通过结合适当的验证机制和性能优化策略，开发者可以构建出既智能又健壮的企业级AI解决方案。