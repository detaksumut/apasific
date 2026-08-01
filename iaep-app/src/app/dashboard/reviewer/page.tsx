import React from 'react';
import styles from './page.module.css';

export default function ReviewerIntelligenceWorkspace() {
  return (
    <div className={styles.workspaceContainer}>
      <header className={styles.workspaceHeader}>
        <div className={styles.headerInfo}>
          <h1 className={styles.workspaceTitle}>Reviewer Intelligence Workspace</h1>
          <p className={styles.workspaceSubtitle}>AI-Assisted Peer Review Dashboard</p>
        </div>
        <div className={styles.reputationSummary}>
          <div className={styles.repScore}>
            <span className={styles.repValue}>92</span>
            <span className={styles.repLabel}>Review Quality</span>
          </div>
          <div className={styles.repScore}>
            <span className={styles.repValue}>100%</span>
            <span className={styles.repLabel}>Reliability</span>
          </div>
        </div>
      </header>

      <div className={styles.mainGrid}>
        
        <div className={styles.leftColumn}>
          {/* Active Assignments */}
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}>Active Review Assignments</h2>
              <span className={styles.countBadge}>1 Pending</span>
            </div>
            
            <div className={styles.assignmentCard}>
              <div className={styles.assignmentMeta}>
                <span className={styles.typeLabel}>Research Article • Double Blind</span>
                <span className={styles.deadlineUrgent}>Deadline: 3 Days</span>
              </div>
              <h3 className={styles.manuscriptTitle}>Manuscript ID: AP-PUB-2026-88942</h3>
              <p className={styles.manuscriptDomain}>Domain: AI Ethics in Higher Education</p>
              
              <div className={styles.intelligenceChecks}>
                <div className={styles.checkItem}>
                  <div className={styles.checkIcon}>🧠</div>
                  <div className={styles.checkDetails}>
                    <strong>AI Match Score</strong>
                    <span className={styles.textSuccess}>94% Expertise Alignment</span>
                  </div>
                </div>
                <div className={styles.checkItem}>
                  <div className={styles.checkIcon}>🛡️</div>
                  <div className={styles.checkDetails}>
                    <strong>Conflict of Interest</strong>
                    <span className={styles.textSuccess}>Cleared (0 Overlaps)</span>
                  </div>
                </div>
              </div>

              <div className={styles.actionButtons}>
                <button className={styles.btnPrimary}>Enter Review Workspace</button>
                <button className={styles.btnSecondary}>Decline</button>
              </div>
            </div>
          </section>

          {/* Historical Record */}
          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>Reviewer Reputation Record</h2>
            <div className={styles.historyList}>
              <div className={styles.historyItem}>
                <div className={styles.historyMeta}>
                  <strong>AP-PUB-2025-44211</strong>
                  <span>Completed: 2 months ago</span>
                </div>
                <div className={styles.impactScore}>+12 Impact Points</div>
              </div>
              <div className={styles.historyItem}>
                <div className={styles.historyMeta}>
                  <strong>AP-PUB-2025-11094</strong>
                  <span>Completed: 5 months ago</span>
                </div>
                <div className={styles.impactScore}>+15 Impact Points</div>
              </div>
            </div>
          </section>
        </div>

        <div className={styles.rightColumn}>
          {/* AI Review Assistant */}
          <section className={`${styles.panel} ${styles.aiPanel}`}>
            <div className={styles.aiHeader}>
              <h2 className={styles.panelTitle}>AI Review Assistant</h2>
              <span className={styles.assistantBadge}>Active</span>
            </div>
            
            <div className={styles.aiContent}>
              <p className={styles.aiIntro}>
                Contextual analysis complete for <strong>AP-PUB-2026-88942</strong>. Double-blind integrity maintained.
              </p>
              
              <div className={styles.aiSuggestionGroup}>
                <h4 className={styles.suggestionTitle}>Evidence Suggestions</h4>
                <ul className={styles.suggestionList}>
                  <li>The authors claim a 40% efficiency increase in AI adoption. Request underlying dataset for validation.</li>
                  <li>Citation #12 is outdated (2018). Recommend authors update with recent 2025 frameworks on AI Ethics.</li>
                </ul>
              </div>

              <div className={styles.aiSuggestionGroup}>
                <h4 className={styles.suggestionTitle}>Methodology Checklist</h4>
                <div className={styles.checklist}>
                  <label className={styles.checkRow}>
                    <input type="checkbox" disabled /> <span>Sample size validity confirmed</span>
                  </label>
                  <label className={styles.checkRow}>
                    <input type="checkbox" disabled /> <span>Control variables identified</span>
                  </label>
                  <label className={styles.checkRow}>
                    <input type="checkbox" disabled /> <span>Reproducibility standards met</span>
                  </label>
                </div>
              </div>
              
              <div className={styles.aiDisclaimer}>
                <strong>Governance Rule:</strong> AI Assistant cannot submit or determine the final decision. Human review is mandatory.
              </div>
            </div>
          </section>
        </div>

      </div>
    </div>
  );
}
