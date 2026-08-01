import React from 'react';
import styles from './page.module.css';

export default function CommandCenterDashboard() {
  return (
    <div className={styles.dashboardContainer}>
      <header className={styles.header}>
        <div className={styles.titleWrapper}>
          <h1 className={styles.title}>APASIFIC GLOBAL ACADEMIC OS</h1>
          <p className={styles.subtitle}>Executive Command Center</p>
        </div>
        <div className={styles.statusIndicator}>
          <span className={styles.pulse}></span>
          <span>SYSTEM ONLINE • AUTONOMOUS OS ACTIVE</span>
        </div>
      </header>

      <section className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Researchers</span>
          <span className={styles.metricValue}>250,000</span>
          <div className={styles.trendPositive}>+5.2% this month</div>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Institutions</span>
          <span className={styles.metricValue}>1,200</span>
          <div className={styles.trendPositive}>+12 new nodes</div>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Publications</span>
          <span className={styles.metricValue}>3.5M</span>
          <div className={styles.trendPositive}>+120K this month</div>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Citations</span>
          <span className={styles.metricValue}>25M</span>
          <div className={styles.trendPositive}>Velocity: High</div>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Collaborations</span>
          <span className={styles.metricValue}>18,400</span>
          <div className={styles.trendPositive}>+840 active projects</div>
        </div>
      </section>

      <div className={styles.mainContent}>
        <section className={styles.graphSection}>
          <h2 className={styles.sectionTitle}>GLOBAL KNOWLEDGE GRAPH</h2>
          <div className={styles.graphContainer}>
            <div className={styles.graphOverlay}>
              <div className={styles.node} style={{top: '20%', left: '30%'}}></div>
              <div className={styles.node} style={{top: '50%', left: '50%'}}></div>
              <div className={styles.node} style={{top: '70%', left: '20%'}}></div>
              <div className={styles.node} style={{top: '30%', left: '70%'}}></div>
              <div className={styles.node} style={{top: '80%', left: '80%'}}></div>
              <svg className={styles.edges} width="100%" height="100%">
                <line x1="30%" y1="20%" x2="50%" y2="50%" stroke="rgba(56, 189, 248, 0.4)" strokeWidth="2" />
                <line x1="50%" y1="50%" x2="70%" y2="30%" stroke="rgba(56, 189, 248, 0.4)" strokeWidth="2" />
                <line x1="20%" y1="70%" x2="50%" y2="50%" stroke="rgba(56, 189, 248, 0.4)" strokeWidth="2" />
                <line x1="50%" y1="50%" x2="80%" y2="80%" stroke="rgba(56, 189, 248, 0.4)" strokeWidth="2" />
              </svg>
              <div className={styles.graphOverlayText}>
                <span>Federation Network Projection Active</span>
                <p>Tracking 1.2K Institutional Nodes</p>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.insightsSection}>
          <h2 className={styles.sectionTitle}>AI INSIGHTS & FORECASTING</h2>
          <div className={styles.insightList}>
            <div className={styles.insightCard}>
              <div className={styles.insightIcon}>📈</div>
              <div className={styles.insightContent}>
                <span className={styles.insightTitle}>Knowledge Evolution Detected</span>
                <p>"AI Governance" research output has surged by <strong>+42%</strong> this quarter. Ontology drift warning queued for Council review.</p>
              </div>
            </div>
            <div className={styles.insightCard}>
              <div className={styles.insightIcon}>🌏</div>
              <div className={styles.insightContent}>
                <span className={styles.insightTitle}>Collaboration Shift</span>
                <p>Cross-border collaboration within the <strong>Asia-Pacific</strong> node is rising rapidly. 340 new Institutional matches predicted.</p>
              </div>
            </div>
            <div className={styles.insightCard}>
              <div className={styles.insightIcon}>⚠️</div>
              <div className={styles.insightContent}>
                <span className={styles.insightTitle}>Agent Recommendation</span>
                <p>ResearchAgent: Detected literature gap in "Sustainable Digital Education". 12 researchers flagged for potential collaboration opportunity.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
