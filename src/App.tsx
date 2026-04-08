/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Video, Sparkles, Loader2, PlaySquare, FileText, AlertCircle } from 'lucide-react';
import Markdown from 'react-markdown';
import { ai } from './lib/gemini';
import { cn } from './lib/utils';

export default function App() {
  const [topic, setTopic] = useState('');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || isLoading) return;

    setIsLoading(true);
    setError('');
    setOutput('');

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: topic.trim(),
        config: {
          systemInstruction: "You are an expert social media manager. I will give you a topic, and you will return three chaotic, high-energy 10-second video hooks."
        }
      });
      
      if (response.text) {
        setOutput(response.text);
      } else {
        throw new Error("No output generated");
      }
    } catch (err: any) {
      console.error("Error generating hooks:", err);
      setError(err.message || "An error occurred while generating hooks.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-gray-300 hidden md:flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-400" />
            Automation Builder
          </h2>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Saved Automations</h3>
          <ul className="space-y-2">
            <li>
              <button className="w-full flex items-center gap-3 px-3 py-2 bg-gray-800 text-white rounded-md transition-colors">
                <Video className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium">Short-Form Hooks</span>
              </button>
            </li>
            <li>
              <button className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-800 rounded-md transition-colors">
                <PlaySquare className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium">YouTube Description</span>
              </button>
            </li>
            <li>
              <button className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-800 rounded-md transition-colors">
                <FileText className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium">Blog Post Generator</span>
              </button>
            </li>
          </ul>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
          <h1 className="text-xl font-semibold text-gray-900">Short-Form Hook Generator</h1>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto space-y-8">

            {/* Input Section */}
            <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 mb-4">What's your video about?</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="topic" className="sr-only">Topic</label>
                  <input
                    id="topic"
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., The secret to perfect espresso..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                    disabled={isLoading}
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!topic.trim() || isLoading}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-sm"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Generate Hooks
                      </>
                    )}
                  </button>
                </div>
              </form>
            </section>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Output Section */}
            {(output || isLoading) && (
              <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-lg font-medium text-gray-900 mb-4 border-b border-gray-100 pb-2">Generated Hooks</h2>
                <div className="prose prose-sm sm:prose-base max-w-none prose-p:leading-relaxed prose-headings:text-gray-900 prose-a:text-blue-600">
                  {isLoading && !output ? (
                    <div className="flex items-center justify-center py-12 text-gray-500 flex-col gap-3">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                      <p>Brainstorming chaotic hooks...</p>
                    </div>
                  ) : (
                    <Markdown>{output}</Markdown>
                  )}
                </div>
              </section>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
