export type ChatHistoryMessage = {
  role: 'user' | 'model';
  parts: [{ text: string }];
};

export const sendMessageStream = async (message: string, history: ChatHistoryMessage[] = []) => {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message, history }),
  });

  if (!response.ok) {
    throw new Error('Failed to send message');
  }

  return response.body;
};
