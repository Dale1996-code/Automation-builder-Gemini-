import { describe, it, vi, beforeEach, afterEach, expect } from 'vitest';
import React from 'react';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { ai } from './lib/gemini';

// Mock matchMedia for Lucide icons and others if needed
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('App Component', () => {
  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = '';
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders initial state correctly', () => {
    render(<App />);
    const heading = screen.getByText('Short-Form Hook Generator');
    expect(heading).toBeTruthy();

    const input = screen.getByPlaceholderText('e.g., The secret to perfect espresso...');
    expect(input).toBeTruthy();

    const button = screen.getByRole('button', { name: /Generate Hooks/i });
    expect(button.hasAttribute('disabled')).toBe(true);
  });

  it('allows typing a topic and enables submit button', async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByPlaceholderText('e.g., The secret to perfect espresso...');
    await user.type(input, 'Testing React Apps');

    expect((input as HTMLInputElement).value).toBe('Testing React Apps');

    const button = screen.getByRole('button', { name: /Generate Hooks/i });
    expect(button.hasAttribute('disabled')).toBe(false);
  });

  it('handles successful API submission', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Mock the API response
    const mockGenerateContent = vi.spyOn(ai.models, 'generateContent').mockResolvedValue({
      text: 'Here is a chaotic hook 1\nHere is a chaotic hook 2',
    } as any);

    const input = screen.getByPlaceholderText('e.g., The secret to perfect espresso...');
    await user.type(input, 'Coffee');

    const button = screen.getByRole('button', { name: /Generate Hooks/i });
    await user.click(button);

    // Wait for the result
    await waitFor(() => {
      expect(screen.getByText(/Here is a chaotic hook 1/i)).toBeTruthy();
    });

    // Verify mock was called with correct parameters
    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    const callArgs = mockGenerateContent.mock.calls[0][0];
    expect(callArgs.model).toBe('gemini-3.1-pro-preview');
    expect(callArgs.contents).toContain('Topic: Coffee');
  });

  it('handles API error correctly', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Mock the API to throw an error
    vi.spyOn(ai.models, 'generateContent').mockRejectedValue(new Error('API Rate Limit Exceeded'));

    const input = screen.getByPlaceholderText('e.g., The secret to perfect espresso...');
    await user.type(input, 'Tea');

    const button = screen.getByRole('button', { name: /Generate Hooks/i });
    await user.click(button);

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText('API Rate Limit Exceeded')).toBeTruthy();
    });
  });
});
