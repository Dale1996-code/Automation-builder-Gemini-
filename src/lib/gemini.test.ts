import test from 'node:test';
import assert from 'node:assert';
import { createChat, ai } from './gemini.js';
import { ThinkingLevel } from "@google/genai";

test('createChat calls ai.chats.create with correct parameters', (t) => {
  // Save original function
  const originalCreate = ai.chats.create;

  let callArgs: any;
  ai.chats.create = (args: any) => {
    callArgs = args;
    return 'mockChatInstance' as any;
  };

  try {
    const result = createChat();

    assert.strictEqual(result, 'mockChatInstance');
    assert.ok(callArgs, 'ai.chats.create was not called');
    assert.strictEqual(callArgs.model, 'gemini-3.1-pro-preview');
    assert.ok(callArgs.config.systemInstruction.includes('You are an expert automation engineer'));
    assert.deepStrictEqual(callArgs.config.thinkingConfig, { thinkingLevel: ThinkingLevel.HIGH });
  } finally {
    // Restore original function
    ai.chats.create = originalCreate;
  }
});
