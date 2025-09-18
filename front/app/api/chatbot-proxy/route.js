import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { message } = await request.json();

    const chatbotResponse = await fetch(`${process.env.NEXT_PUBLIC_CHATBOT_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!chatbotResponse.ok) {
      const errorText = await chatbotResponse.text();
      throw new Error(`Chatbot API error: ${chatbotResponse.status} - ${errorText}`);
    }

    const data = await chatbotResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying to chatbot:', error);
    return NextResponse.json({ error: error.message || 'Failed to communicate with chatbot' }, { status: 500 });
  }
}
