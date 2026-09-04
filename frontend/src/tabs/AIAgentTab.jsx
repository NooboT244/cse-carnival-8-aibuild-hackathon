import { useState, useRef, useEffect } from 'react';

const SparklesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3z"/>
  </svg>
);

export default function AIAgentTab({ context }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hello! I am CampusOS AI. Ask me about your class schedule, free labs, notices, or assignment deadlines.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (textToSend) => {
    const query = textToSend || input;
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

      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'assistant', text: data.reply || 'No response received.' }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'assistant', text: 'Failed to communicate with CampusOS AI backend.' }]);
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
        <div className="chat-history">
          {messages.map((msg, idx) => (
            <div key={idx} className={`chat-bubble ${msg.role}`}>
              {msg.text}
            </div>
          ))}
          {loading && <div style={{ color: 'var(--text-muted)' }}>CampusOS AI is thinking...</div>}
          <div ref={chatEndRef} />
        </div>

        <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['Which rooms are free?', 'What assignments are pending?', 'When is my next class?'].map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => sendMessage(prompt)}
              style={{
                padding: '6px 12px',
                borderRadius: '16px',
                border: '1px solid var(--border-light)',
                background: '#fff',
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              {prompt}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
          style={{ display: 'flex', gap: '12px', marginTop: '12px', paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question for CampusOS AI..."
            style={{ flex: 1, padding: '14px 16px', borderRadius: 'var(--radius-sm)', border: '2px solid var(--border-light)', fontSize: '1.05rem' }}
          />
          <button type="submit" disabled={loading} className="btn-primary">
            <SparklesIcon /> Send
          </button>
        </form>
      </div>
    </div>
  );
}