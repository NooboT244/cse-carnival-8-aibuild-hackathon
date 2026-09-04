import { useState, useRef, useEffect } from 'react';

const SparklesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3z" />
  </svg>
);

export default function AIAgentTab({ context = {} }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Hello! I am CampusOS AI. Ask me about your class schedule, free labs, notices, or assignment deadlines.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (textToSend) => {
    const query = typeof textToSend === 'string' ? textToSend : input;
    if (!query.trim() || loading) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: query }]);
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query, context }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Server returned HTTP ${res.status}: ${errText || res.statusText}`);
      }

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: data.reply || 'No response received from model.' },
      ]);
    } catch (err) {
      console.error('CampusOS AI Fetch Error:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: `⚠️ Connection Error: ${err.message}. Please verify backend is running on http://localhost:5000.`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="operations-bar">
        <div className="operations-title">
          <h2>CampusOS AI Assistant</h2>
          <p>Query live schedules, room availability, deadlines, and announcements</p>
        </div>
      </div>

      <div className="card chat-container">
        <div className="chat-history" style={{ minHeight: '320px', maxHeight: '500px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`chat-bubble ${msg.role}`}
              style={{
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                background: msg.role === 'user' ? 'var(--primary, #2563eb)' : '#f1f5f9',
                color: msg.role === 'user' ? '#fff' : '#1e293b',
                padding: '10px 16px',
                borderRadius: '12px',
                maxWidth: '80%',
                lineHeight: '1.5',
                whiteSpace: 'pre-wrap',
              }}
            >
              {msg.text}
            </div>
          ))}
          {loading && (
            <div style={{ color: 'var(--text-muted, #64748b)', fontStyle: 'italic', fontSize: '0.9rem' }}>
              CampusOS AI is thinking...
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['Which rooms are free?', 'What assignments are pending?', 'When is my next class?'].map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => sendMessage(prompt)}
              style={{
                padding: '6px 12px',
                borderRadius: '16px',
                border: '1px solid var(--border-light, #e2e8f0)',
                background: '#fff',
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          style={{
            display: 'flex',
            gap: '12px',
            marginTop: '12px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-light, #e2e8f0)',
          }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question for CampusOS AI..."
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: '6px',
              border: '1px solid var(--border-light, #cbd5e1)',
              fontSize: '1rem',
            }}
          />
          <button type="submit" disabled={loading} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '12px 20px', cursor: 'pointer' }}>
            <SparklesIcon /> Send
          </button>
        </form>
      </div>
    </div>
  );
}