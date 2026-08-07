import React from 'react';
import styles from './page.module.css';

export default function PublicationWorkflowUI() {
  return (
    <div className={styles.workflowContainer}>
      <header className={styles.workflowHeader}>
        <div className={styles.titleSection}>
          <span className={styles.typeLabel}>Research Article</span>
          <h1 className={styles.manuscriptTitle}>AI Ethics Framework in Higher Education</h1>
          <p className={styles.manuscriptMeta}>Submission ID: AP-PUB-2026-88942 • Last updated: 2 hours ago</p>
        </div>
        <div className={styles.actionSection}>
          <button className={styles.btnSecondary}>View Manuscript</button>
          <button className={styles.btnPrimary}>Contact Editor</button>
        </div>
      </header>

      <div className={styles.mainContent}>
        {/* Workflow Lifecycle */}
        <section className={styles.lifecycleSection}>
          <h2 className={styles.sectionTitle}>Scholarly Lifecycle Status</h2>
          
          <div className={styles.stepperContainer}>
            <div className={`${styles.step} ${styles.completed}`}>
              <div className={styles.stepCircle}>✓</div>
              <div className={styles.stepLabel}>Draft</div>
            </div>
            <div className={styles.stepLine}></div>
            <div className={`${styles.step} ${styles.completed}`}>
              <div className={styles.stepCircle}>✓</div>
              <div className={styles.stepLabel}>Submitted</div>
            </div>
            <div className={styles.stepLine}></div>
            <div className={`${styles.step} ${styles.completed}`}>
              <div className={styles.stepCircle}>✓</div>
              <div className={styles.stepLabel}>Screening</div>
            </div>
            <div className={styles.stepLine}></div>
            <div className={`${styles.step} ${styles.active}`}>
              <div className={styles.stepCircle}>
                <span className={styles.pulse}></span>
              </div>
              <div className={styles.stepLabel}>Peer Review</div>
            </div>
            <div className={styles.stepLine}></div>
            <div className={styles.step}>
              <div className={styles.stepCircle}></div>
              <div className={styles.stepLabel}>Decision</div>
            </div>
            <div className={styles.stepLine}></div>
            <div className={styles.step}>
              <div className={styles.stepCircle}></div>
              <div className={styles.stepLabel}>Published</div>
            </div>
          </div>
        </section>

        <div className={styles.gridPanels}>
          {/* Reviewer Status */}
          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>Reviewer Intelligence</h2>
            <div className={styles.reviewerList}>
              <div className={styles.reviewerItem}>
                <div className={styles.reviewerMeta}>
                  <strong>Reviewer 1</strong>
                  <span className={styles.badgePending}>Awaiting Review</span>
                </div>
                <div className={styles.matchScore}>AI Match: 94%</div>
              </div>
              <div className={styles.reviewerItem}>
                <div className={styles.reviewerMeta}>
                  <strong>Reviewer 2</strong>
                  <span className={styles.badgeSuccess}>Completed</span>
                </div>
                <div className={styles.matchScore}>AI Match: 88%</div>
              </div>
            </div>
          </section>

          {/* Provider Runtime Status (DOI & Indexing) */}
          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>Provider Runtime Status</h2>
            <div className={styles.providerList}>
              <div className={styles.providerItem}>
                <span className={styles.providerIcon}>🔗</span>
                <div className={styles.providerDetails}>
                  <strong>Crossref DOI</strong>
                  <span className={styles.statusWait}>Pending Publication</span>
                </div>
              </div>
              <div className={styles.providerItem}>
                <span className={styles.providerIcon}>📚</span>
                <div className={styles.providerDetails}>
                  <strong>Scopus Indexing</strong>
                  <span className={styles.statusWait}>Pending DOI</span>
                </div>
              </div>
            </div>
          </section>

          {/* AI Prediction */}
          <section className={`${styles.panel} ${styles.aiPanel}`}>
            <div className={styles.aiHeader}>
              <h2 className={styles.panelTitle}>AI Prediction</h2>
              <span className={styles.confidenceBadge}>High Confidence</span>
            </div>
            <p className={styles.aiText}>
              "Based on the manuscript's semantic density and current global research trends, this publication has a high probability of achieving <strong>Q1 indexing status</strong>."
            </p>
            <div className={styles.aiMetric}>
              <span>Predicted Citation Velocity:</span>
              <strong>Top 10%</strong>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
