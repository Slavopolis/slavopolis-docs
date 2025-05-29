import { AiChatContainer } from '@/components/toolbox/ai-chat/chat-container';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI聊天助手 - Slavopolis',
  description: '与强大的AI助手对话，支持代码生成、问题解答、创意写作等多种场景。集成DeepSeek模型，支持流式响应和推理过程展示。',
  keywords: [
    'AI聊天',
    'DeepSeek',
    '人工智能',
    '代码助手',
    '问答系统',
    'Markdown支持',
    '流式响应',
    '推理模型'
  ],
};

export default function AiChatPage() {
  return (
    <div className="h-screen w-full">
      <AiChatContainer />
    </div>
  );
} 