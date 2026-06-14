import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Sparkles } from 'lucide-react';

export default function EduGuideChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I am **EduGuide AI**, your built-in college admission counselor. \n\nI am here to help you navigate your options, choose between branches or colleges, understand placement statistics, and use our prediction features effectively.\n\nHow can I help you today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message to state
    const updatedMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ messages: updatedMessages })
      });

      if (!response.ok) {
        throw new Error('Failed to get counselor response.');
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev, 
        { 
          role: 'assistant', 
          content: 'Sorry, I encountered an issue connecting to my counseling systems. Please try again in a moment.' 
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Helper to format responses into paragraphs and bulleted lists
  const formatText = (text) => {
    if (!text) return null;
    
    // Process markdown-like bold tags **text** -> <strong>text</strong>
    const processBold = (str) => {
      const parts = str.split(/\*\*(.*?)\*\*/g);
      return parts.map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : part);
    };

    const lines = text.split('\n');
    const elements = [];
    let listItems = [];

    const flushList = (key) => {
      if (listItems.length > 0) {
        elements.push(<ul key={key} style={{ paddingLeft: '20px', marginBottom: '12px' }}>{listItems}</ul>);
        listItems = [];
      }
    };

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
        const itemText = trimmed.substring(2);
        listItems.push(<li key={`li-${idx}`} style={{ marginBottom: '4px' }}>{processBold(itemText)}</li>);
      } else {
        flushList(`list-before-${idx}`);
        if (trimmed) {
          elements.push(<p key={`p-${idx}`} style={{ marginBottom: '10px', fontSize: '0.92rem', lineHeight: '1.45' }}>{processBold(line)}</p>);
        } else if (elements.length > 0 && elements[elements.length - 1].type !== 'br') {
          // Add spacing for paragraph breaks
          elements.push(<div key={`space-${idx}`} style={{ height: '8px' }} />);
        }
      }
    });

    flushList('list-final');
    return elements;
  };

  return (
    <div style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 1000, fontFamily: 'var(--font-body)' }}>
      {/* Chat toggle button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary)',
            color: '#ffffff',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(37, 99, 235, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform var(--transition-fast), background-color var(--transition-fast)',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <Sparkles size={26} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          style={{
            width: '380px',
            height: '520px',
            borderRadius: 'var(--border-radius-lg)',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'fadeInUp 0.3s ease-out'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '16px 20px',
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '50%',
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Sparkles size={16} />
              </div>
              <div>
                <h4 style={{ color: '#ffffff', fontSize: '0.98rem', fontWeight: '700' }}>EduGuide AI</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', opacity: 0.9 }}>
                  <span style={{ width: '6px', height: '6px', backgroundColor: '#10b981', borderRadius: '50%' }} />
                  Counselor Online
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#ffffff',
                opacity: 0.8,
                cursor: 'pointer',
                padding: '4px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
              onMouseLeave={(e) => e.currentTarget.style.opacity = 0.8}
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages list */}
          <div
            style={{
              flex: 1,
              padding: '20px',
              overflowY: 'auto',
              backgroundColor: 'var(--bg-primary)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            {messages.map((msg, index) => {
              const isAssistant = msg.role === 'assistant';
              return (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    justifyContent: isAssistant ? 'flex-start' : 'flex-end',
                    width: '100%'
                  }}
                >
                  <div
                    style={{
                      maxWidth: '85%',
                      padding: '12px 16px',
                      borderRadius: isAssistant 
                        ? '0px 14px 14px 14px' 
                        : '14px 0px 14px 14px',
                      backgroundColor: isAssistant 
                        ? 'var(--bg-secondary)' 
                        : 'var(--primary)',
                      color: isAssistant 
                        ? 'var(--text-primary)' 
                        : '#ffffff',
                      boxShadow: isAssistant ? 'var(--shadow-sm)' : 'none',
                      border: isAssistant ? '1px solid var(--border-color)' : 'none'
                    }}
                  >
                    {formatText(msg.content)}
                  </div>
                </div>
              );
            })}

            {/* Loading/Typing animation */}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start', width: '100%' }}>
                <div
                  style={{
                    padding: '12px 20px',
                    borderRadius: '0px 14px 14px 14px',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-secondary)',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span>Counselor is thinking</span>
                  <span className="dot-pulse-1">.</span>
                  <span className="dot-pulse-2">.</span>
                  <span className="dot-pulse-3">.</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Message input */}
          <form
            onSubmit={handleSend}
            style={{
              padding: '15px 20px',
              backgroundColor: 'var(--bg-secondary)',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              gap: '10px',
              alignItems: 'center'
            }}
          >
            <input
              type="text"
              className="form-control"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about cutoffs, branches, placements..."
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '24px',
                border: '1px solid var(--border-color)',
                fontSize: '0.9rem',
                outline: 'none',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)'
              }}
              disabled={loading}
            />
            <button
              type="submit"
              style={{
                backgroundColor: 'var(--primary)',
                color: '#ffffff',
                border: 'none',
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'background-color var(--transition-fast)'
              }}
              disabled={!input.trim() || loading}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
