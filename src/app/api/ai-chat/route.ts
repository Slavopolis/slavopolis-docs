import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, model = 'deepseek-chat', stream = true, temperature = 1.3, max_tokens = 4096 } = body;

    // 从环境变量获取API Key
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'DeepSeek API Key not configured' },
        { status: 500 }
      );
    }

    // 构建请求参数
    const requestBody = {
      model,
      messages,
      stream,
      temperature,
      max_tokens,
    };

    // 调用DeepSeek API
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('DeepSeek API Error:', error);
      return NextResponse.json(
        { error: `DeepSeek API Error: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    // 如果是流式响应，直接转发流
    if (stream) {
      return new NextResponse(response.body, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    // 非流式响应
    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('AI Chat API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 