import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { processUserChatQuery } from '../utils/chatbotEngine';

export default function Chatbot() {
  const { products, addToCart, navigateTo } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      type: 'help',
      text: "👋 Hi there! I'm **Apex AI**, your intelligent shopping and price comparison assistant. Ask me to find products or compare our prices against **Amazon, Best Buy, and Walmart**!",
      suggestions: [
        'Compare AcoustiPro with Amazon & Best Buy',
        'Find headphones under $300',
        'Show laptops for coding',
        'Compare Smartwatch with other platforms',
        'What coupons can I use?'
      ]
    }
  ]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  const handleSendMessage = (textToSend) => {
    const query = (textToSend || inputText).trim();
    if (!query) return;

    // Add user message
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: query
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI thinking & processing delay (600ms)
    setTimeout(() => {
      const botResponse = processUserChatQuery(query, products);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          ...botResponse
        }
      ]);
      setIsTyping(false);
    }, 650);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* 1. Floating Launcher Button */}
      {!isOpen && (
        <div
          className="position-fixed"
          style={{ bottom: '24px', right: '24px', zIndex: 1040 }}
        >
          <button
            onClick={() => setIsOpen(true)}
            className="btn btn-primary rounded-pill p-3 shadow-lg d-flex align-items-center gap-2 border-2 border-white"
            style={{
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              boxShadow: '0 10px 25px rgba(79, 70, 229, 0.4)'
            }}
            title="Open Apex AI Shopping Assistant"
          >
            <div className="position-relative">
              <i className="bi bi-robot fs-4 text-white"></i>
              <span className="position-absolute top-0 start-100 translate-middle p-1 bg-success border border-light rounded-circle"></span>
            </div>
            <span className="fw-bold small text-white pe-1 d-none d-sm-inline">
              Ask AI Assistant
            </span>
          </button>
        </div>
      )}

      {/* 2. Expanded Chatbot Window */}
      {isOpen && (
        <div
          className="position-fixed shadow-lg rounded-4 overflow-hidden d-flex flex-column bg-white border"
          style={{
            bottom: '24px',
            right: '24px',
            width: '92vw',
            maxWidth: '430px',
            height: '600px',
            maxHeight: '85vh',
            zIndex: 1050
          }}
        >
          {/* Header */}
          <div
            className="p-3 text-white d-flex align-items-center justify-content-between"
            style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)' }}
          >
            <div className="d-flex align-items-center gap-2">
              <div
                className="rounded-circle bg-primary bg-opacity-25 d-flex align-items-center justify-content-center text-white"
                style={{ width: '38px', height: '38px' }}
              >
                <i className="bi bi-robot fs-5 text-warning"></i>
              </div>
              <div>
                <h6 className="fw-bold mb-0 text-white">Apex AI Assistant</h6>
                <small className="text-light opacity-75" style={{ fontSize: '0.72rem' }}>
                  Product Discovery & Platform Comparison
                </small>
              </div>
            </div>

            <div className="d-flex align-items-center gap-1">
              <button
                onClick={() =>
                  setMessages([
                    {
                      id: Date.now(),
                      sender: 'bot',
                      type: 'help',
                      text: "Conversation reset. How can I help you find or compare products today?",
                      suggestions: [
                        'Compare AcoustiPro with Amazon & Best Buy',
                        'Find headphones under $300',
                        'Show laptops for coding',
                        'Compare Smartwatch with other platforms'
                      ]
                    }
                  ])
                }
                className="btn btn-sm text-light p-1"
                title="Reset conversation"
              >
                <i className="bi bi-arrow-counterclockwise"></i>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="btn btn-sm text-light p-1"
                title="Minimize chat"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-grow-1 p-3 overflow-auto bg-light d-flex flex-column gap-3">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`d-flex ${msg.sender === 'user' ? 'justify-content-end' : 'justify-content-start'}`}
              >
                <div
                  className={`p-3 rounded-4 shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-primary text-white rounded-bottom-end-0'
                      : 'bg-white text-dark rounded-bottom-start-0 border'
                  }`}
                  style={{ maxWidth: '90%' }}
                >
                  {/* Text content with simple markdown formatting */}
                  <div className="small mb-2" style={{ whiteSpace: 'pre-line', lineHeight: '1.45' }}>
                    {msg.text}
                  </div>

                  {/* 1. PRODUCT CARDS (When user asks to find a product) */}
                  {msg.type === 'products' && msg.products && (
                    <div className="d-flex flex-column gap-2 mt-2">
                      {msg.products.map(prod => (
                        <div key={prod.id} className="card border rounded-3 p-2 bg-light">
                          <div className="d-flex align-items-center gap-2 mb-2">
                            <img
                              src={prod.images[0]}
                              alt={prod.name}
                              className="rounded-2"
                              style={{ width: '52px', height: '52px', objectFit: 'cover' }}
                            />
                            <div className="flex-grow-1 overflow-hidden">
                              <h6 className="fw-bold small text-dark mb-0 text-truncate" title={prod.name}>
                                {prod.name}
                              </h6>
                              <div className="d-flex align-items-center gap-2 small">
                                <span className="fw-bold text-primary">${prod.price.toFixed(2)}</span>
                                <span className="text-warning">★ {prod.rating}</span>
                              </div>
                            </div>
                          </div>

                          <div className="d-flex gap-2">
                            <button
                              onClick={() => {
                                setIsOpen(false);
                                navigateTo('product-detail', { productId: prod.id, step: 5 });
                              }}
                              className="btn btn-outline-secondary btn-sm py-1 flex-grow-1 rounded-pill"
                              style={{ fontSize: '0.72rem' }}
                            >
                              Inspect Details
                            </button>
                            <button
                              onClick={() => addToCart(prod, 1)}
                              className="btn btn-primary btn-sm py-1 flex-grow-1 rounded-pill fw-semibold"
                              style={{ fontSize: '0.72rem' }}
                            >
                              + Add to Cart
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 2. CROSS-PLATFORM COMPARISON MATRIX (When user asks to compare with other platforms) */}
                  {msg.type === 'comparison' && msg.comparison && (
                    <div className="mt-2">
                      <div className="table-responsive rounded-3 border bg-white mb-2">
                        <table className="table table-sm table-bordered mb-0 align-middle" style={{ fontSize: '0.75rem' }}>
                          <thead className="table-light">
                            <tr>
                              <th>Platform</th>
                              <th>Price</th>
                              <th>Shipping</th>
                              <th>Warranty</th>
                            </tr>
                          </thead>
                          <tbody>
                            {msg.comparison.platforms.map((plat, i) => (
                              <tr key={i} className={plat.name === 'ApexMart' ? 'table-primary fw-bold' : ''}>
                                <td>
                                  {plat.name === 'ApexMart' ? (
                                    <span className="text-primary fw-bold">✓ {plat.name}</span>
                                  ) : (
                                    plat.name
                                  )}
                                </td>
                                <td>
                                  ${plat.price.toFixed(2)}
                                  {plat.badge && (
                                    <span className={`badge ms-1 ${plat.name === 'ApexMart' ? 'bg-success' : 'bg-secondary'}`} style={{ fontSize: '0.62rem' }}>
                                      {plat.badge}
                                    </span>
                                  )}
                                </td>
                                <td className="text-muted">{plat.shipping}</td>
                                <td className="text-muted">{plat.warranty}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="p-2 bg-success bg-opacity-10 rounded-2 border border-success-subtle small text-success">
                        <i className="bi bi-check-circle-fill me-1"></i>
                        <strong>Savings Verdict: </strong>{msg.comparison.verdict}
                      </div>

                      {msg.product && (
                        <div className="d-flex gap-2 mt-2">
                          <button
                            onClick={() => {
                              setIsOpen(false);
                              navigateTo('product-detail', { productId: msg.product.id, step: 5 });
                            }}
                            className="btn btn-outline-primary btn-sm w-100 rounded-pill"
                            style={{ fontSize: '0.75rem' }}
                          >
                            View Product Page
                          </button>
                          <button
                            onClick={() => addToCart(msg.product, 1)}
                            className="btn btn-primary btn-sm w-100 rounded-pill fw-semibold"
                            style={{ fontSize: '0.75rem' }}
                          >
                            Add to Cart (${msg.product.price.toFixed(2)})
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 3. ACTION LINK BUTTONS (e.g. Go to Live Order Tracking) */}
                  {msg.type === 'action' && msg.actionLink && (
                    <div className="mt-2">
                      <button
                        onClick={() => {
                          setIsOpen(false);
                          navigateTo(msg.actionLink);
                        }}
                        className="btn btn-primary btn-sm rounded-pill w-100 fw-semibold"
                        style={{ fontSize: '0.75rem' }}
                      >
                        <i className="bi bi-box-seam me-1"></i> {msg.actionLabel}
                      </button>
                    </div>
                  )}

                  {/* 4. SUGGESTION CHIPS */}
                  {msg.suggestions && (
                    <div className="d-flex flex-wrap gap-1 mt-3">
                      {msg.suggestions.map((sug, i) => (
                        <button
                          key={i}
                          onClick={() => handleSendMessage(sug)}
                          className="btn btn-sm btn-outline-primary py-1 px-2 rounded-pill bg-light"
                          style={{ fontSize: '0.72rem' }}
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="d-flex justify-content-start">
                <div className="p-3 rounded-4 bg-white border shadow-sm small text-muted d-flex align-items-center gap-2">
                  <span className="spinner-grow spinner-grow-sm text-primary" role="status"></span>
                  <span>Apex AI is analyzing prices and specs...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Box Footer */}
          <div className="p-2 border-top bg-white">
            <div className="input-group">
              <input
                type="text"
                className="form-control border-0 shadow-none ps-3 small"
                placeholder="Ask about products or compare prices..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{ fontSize: '0.85rem' }}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim()}
                className="btn btn-primary rounded-pill px-3 m-1 d-flex align-items-center justify-content-center"
                style={{ width: '38px', height: '38px' }}
                title="Send query"
              >
                <i className="bi bi-send-fill" style={{ fontSize: '0.85rem' }}></i>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
