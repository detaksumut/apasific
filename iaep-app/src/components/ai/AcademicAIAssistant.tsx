import React, { useState } from 'react';
import styles from './AcademicAIAssistant.module.css';

export default function AcademicAIAssistant() {
  const [query, setQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I am your APASIFIC AI Academic Assistant. How can I help you explore the global academic ecosystem today?',
      type: 'greeting'
    }
  ]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    // Add user query
    setMessages(prev => [...prev, { role: 'user', content: query, type: 'query' }]);
    const currentQuery = query;
    setQuery('');
    setIsTyping(true);

    // Mock AI response logic
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `Analysis complete for: "${currentQuery}".`,
          type: 'insight',
          confidence: '94%',
          evidence: [
            'Knowledge Graph Traversal Complete',
            'Cross-matched 1.2M Publications',
            'Reputation Engine Verified'
          ],
          result: 'Found 12 highly qualified researchers matching your criteria in the Asia-Pacific federation node.'
        }
      ]);
    }, 1500);
  };

  return (
    <div className={styles.assistantContainer}>
      <header className={styles.assistantHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.aiAvatar}>
            <span className={styles.pulse}></span>
            🤖
          </div>
          <div className={styles.headerTitles}>
            <h2 className={styles.title}>APASIFIC AI Assistant</h2>
            <p className={styles.subtitle}>Autonomous Ecosystem Advisor</p>
          </div>
        </div>
        <div className={styles.governanceBadge}>
          Advisor Mode Active
        </div>
      </header>

      <div className={styles.chatArea}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`${styles.messageWrapper} ${msg.role === 'user' ? styles.wrapperUser : styles.wrapperAi}`}>
            <div className={`${styles.messageBubble} ${msg.role === 'user' ? styles.bubbleUser : styles.bubbleAi}`}>
              {msg.type === 'insight' ? (
                <div className={styles.insightContent}>
                  <p className={styles.insightMain}>{msg.result}</p>
                  <div className={styles.confidenceRow}>
                    <span className={styles.confidenceLabel}>AI Confidence Level:</span>
                    <span className={styles.confidenceValue}>{msg.confidence}</span>
                  </div>
                  <div className={styles.evidenceBox}>
                    <strong>Evidence Trail:</strong>
                    <ul>
                      {msg.evidence?.map((item, i) => (
                        <li key={i}>✓ {item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <p>{msg.content}</p>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className={`${styles.messageWrapper} ${styles.wrapperAi}`}>
            <div className={`${styles.messageBubble} ${styles.bubbleAi} ${styles.typingIndicator}`}>
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
      </div>

      <div className={styles.suggestionsContainer}>
        <button className={styles.suggestionChip}>"Find AI Ethics experts in Asia"</button>
        <button className={styles.suggestionChip}>"Recommend reviewers for my draft"</button>
        <button className={styles.suggestionChip}>"What are the emerging trends in Education Tech?"</button>
      </div>

      <form onSubmit={handleSend} className={styles.inputArea}>
        <input 
          type="text" 
          className={styles.textInput} 
          placeholder="Ask anything about the academic network..." 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" className={styles.sendBtn} disabled={!query.trim() || isTyping}>
          Send
        </button>
      </form>
      
      <div className={styles.governanceFooter}>
        <strong>Governance Rule:</strong> AI serves as an advisor. All final decisions require Human Authorization.
      </div>
    </div>
  );
}
