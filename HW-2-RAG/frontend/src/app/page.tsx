"use client";

import { useState, FormEvent, useRef, useEffect } from "react";

type Message = {
  role: "user" | "assistant";
  name: string;
  time: string;
  content: string;
  sources?: any[];
};

const initialMessages: Message[] = [];

export default function Home() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      role: "user",
      name: "You",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: input,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8002/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: input }),
      });

      if (!response.ok) throw new Error("Network response was not ok");

      const data = await response.json();
      const assistantMessage: Message = {
        role: "assistant",
        name: "Bot Fondos",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: data.content,
        sources: data.sources,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error fetching data:", error);
      const errorMessage: Message = {
        role: "assistant",
        name: "Bot Fondos",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: "Sorry, I'm having trouble connecting to the server.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#f0f2f5] font-sans">
      <header className="bg-white shadow-sm p-4 flex justify-center items-center">
        <h1 className="text-xl font-bold text-gray-800">Fondos</h1>
      </header>
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-end gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className="max-w-lg">
                <div className="flex items-baseline gap-2">
                  <p className="text-sm font-semibold text-gray-700">{msg.name}</p>
                  <p className="text-xs text-gray-500">{msg.time}</p>
                </div>
                <div className={`rounded-2xl p-3 text-sm ${msg.role === "user" ? "bg-blue-500 text-white" : "bg-white text-gray-800 shadow-sm"}`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-gray-200">
                      <div className="flex flex-wrap gap-2">
                        {msg.sources.map((source, i) => {
                          const url = source.source || '#';
                          const cleanedUrl = url.endsWith('/') ? url.slice(0, -1) : url;
                          const linkText = cleanedUrl.split('/').pop() || 'source';
                          return (
                            <a
                              key={i}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 bg-green-100 text-green-800 rounded-lg px-3 py-1 text-sm font-medium hover:bg-green-200 transition-colors"
                            >
                              <span className="h-2 w-2 bg-green-500 rounded-full"></span>
                              {linkText}
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center gap-3">
              <div>
                <p className="text-sm text-gray-500 italic">Bot Fondos is typing...</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>
      <footer className="bg-white p-4 sticky bottom-0">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="flex items-center gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Write your message..."
                className="w-full py-3 px-5 border-none rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              className="bg-teal-500 text-white rounded-full p-3 w-12 h-12 flex items-center justify-center hover:bg-teal-600 disabled:bg-teal-300 transition-colors"
              disabled={isLoading || !input.trim()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" /></svg>
            </button>
          </form>
        </div>
      </footer>
    </div>
  );
}
