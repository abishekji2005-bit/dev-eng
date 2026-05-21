import React, { useState, useRef, useEffect } from 'react';
import { api } from '../api';

export default function AiChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: 'user', content: text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setLoading(true);

    try {
      const { reply } = await api.aiChat(
        updated.map(m => ({ role: m.role, content: m.content }))
      );
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: `⚠ ${e.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-5 right-5 z-50 w-12 h-12 rounded-full bg-accent text-white shadow-lg
                   flex items-center justify-center text-lg hover:bg-accent-dim transition-all
                   active:scale-95"
        aria-label="AI Assistant"
      >
        {open ? '✕' : '✦'}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-20 right-5 z-50 w-[360px] max-h-[520px] flex flex-col
                        bg-ink-900 border border-ink-600 rounded-2xl shadow-2xl overflow-hidden
                        animate-fade-up">
          {/* Header */}
          <div className="px-4 py-3 border-b border-ink-700 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-accent/15 text-accent flex items-center justify-center text-sm font-bold">✦</span>
            <div>
              <p className="text-sm font-medium text-ink-100">Grok Assistant</p>
              <p className="text-xs text-ink-500">Code review & mentorship help</p>
            </div>
            {messages.length > 0 && (
              <button
                onClick={() => setMessages([])}
                className="ml-auto text-xs text-ink-500 hover:text-ink-300"
              >
                Clear
              </button>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-[200px] max-h-[360px]">
            {messages.length === 0 && (
              <div className="text-center py-8 space-y-2">
                <p className="text-ink-500 text-sm">Ask me anything about:</p>
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {['Code review tips', 'Debugging help', 'Best practices', 'Learning paths'].map(s => (
                    <button
                      key={s}
                      onClick={() => { setInput(s); }}
                      className="tag-chip text-xs cursor-pointer hover:bg-accent/20"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-accent text-white rounded-br-sm'
                    : 'bg-ink-800 text-ink-200 border border-ink-700 rounded-bl-sm'
                }`}>
                  <p className="whitespace-pre-wrap">{m.content}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-ink-800 border border-ink-700 rounded-xl rounded-bl-sm px-3 py-2">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-accent/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-accent/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-accent/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-3 pb-3 pt-1 border-t border-ink-700">
            <div className="flex gap-2 items-end">
              <textarea
                className="input text-sm py-2 resize-none flex-1"
                rows={1}
                placeholder="Ask something…"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
              />
              <button
                onClick={send}
                disabled={!input.trim() || loading}
                className="btn-primary py-2 px-3 text-xs shrink-0"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
