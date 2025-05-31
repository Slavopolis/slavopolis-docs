import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // 获取API密钥
      const apiKey = process.env.DEEPSEEK_API_KEY || 'sk-d24747e6b2e742c39dbdf853562ec486';
    if (!apiKey) {
      return NextResponse.json(
        { error: 'DeepSeek API key not configured' },
        { status: 500 }
      );
    }

    // 调用DeepSeek余额API
    const response = await fetch('https://api.deepseek.com/user/balance', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek balance API error:', response.status, errorText);
      
      return NextResponse.json(
        { 
          error: response.status === 401 
            ? 'API密钥无效或已过期' 
            : response.status === 403
            ? 'API密钥权限不足'
            : response.status === 429
            ? '请求过于频繁，请稍后再试'
            : `获取余额失败: ${response.status}`
        },
        { status: response.status }
      );
    }

    const balanceData = await response.json();
    
    return NextResponse.json(balanceData);
  } catch (error) {
    console.error('Balance API error:', error);
    return NextResponse.json(
      { error: '网络错误，请检查网络连接' },
      { status: 500 }
    );
  }
} 