import React from 'react';
import styles from './page.module.css';

export default function InstitutionIntelligencePortal() {
  return (
    <div className={styles.portalContainer}>
      {/* 1. Global University Intelligence Header */}
      <header className={styles.institutionHeader}>
        <div className={styles.institutionMeta}>
          <div className={styles.crestPlaceholder}>
            <span className={styles.crestInitials}>UN</span>
          </div>
          <div className={styles.institutionDetails}>
            <h1 className={styles.institutionName}>University of Global Intelligence</h1>
            <p className={styles.federationId}>FED-ID: AP-INST-9904</p>
            <div className={styles.verificationBadges}>
              <span className={styles.badgeSuccess}>✓ VERIFIED APASIFIC INSTITUTION</span>
              <span className={styles.badgeSuccess}>✓ FEDERATION NODE ACTIVE</span>
            </div>
          </div>
        </div>
        
        {/* 2. Institutional Impact Score */}
        <div className={styles.impactCard}>
          <div className={styles.impactLabel}>Institutional Impact Score</div>
          <div className={styles.impactScore}>91.2</div>
          <div className={styles.impactRank}>Tier 1 Global Research Center</div>
          <div className={styles.impactTrend}>↗ Top 5% Momentum</div>
        </div>
      </header>

      <div className={styles.mainGrid}>
        
        <div className={styles.leftColumn}>
          {/* 3. Research Strength Map */}
          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>Research Strength Map</h2>
            <div className={styles.strengthMapMock}>
              <div className={styles.strengthNode} style={{top: '30%', left: '20%'}}>
                <span className={styles.nodeLabel}>Artificial Intelligence</span>
                <span className={styles.nodeValue}>98%</span>
              </div>
              <div className={styles.strengthNode} style={{top: '50%', left: '50%'}}>
                <span className={styles.nodeLabel}>Engineering</span>
                <span className={styles.nodeValue}>85%</span>
              </div>
              <div className={styles.strengthNode} style={{top: '30%', left: '80%'}}>
                <span className={styles.nodeLabel}>Data Science</span>
                <span className={styles.nodeValue}>92%</span>
              </div>
              <div className={styles.strengthNode} style={{top: '70%', left: '35%'}}>
                <span className={styles.nodeLabel}>Quantum Tech</span>
                <span className={styles.nodeValue}>78%</span>
              </div>
              <div className={styles.strengthNode} style={{top: '70%', left: '75%'}}>
                <span className={styles.nodeLabel}>Education</span>
                <span className={styles.nodeValue}>88%</span>
              </div>
              
              <svg className={styles.strengthEdges} width="100%" height="100%">
                <line x1="20%" y1="30%" x2="50%" y2="50%" stroke="var(--academic-gold-light)" />
                <line x1="80%" y1="30%" x2="50%" y2="50%" stroke="var(--academic-gold-light)" />
                <line x1="35%" y1="70%" x2="50%" y2="50%" stroke="var(--academic-gold-light)" />
                <line x1="75%" y1="70%" x2="50%" y2="50%" stroke="var(--academic-gold-light)" />
              </svg>
            </div>
          </section>

          {/* 5. Global Collaborations */}
          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>Global Collaboration Network</h2>
            <div className={styles.collaborationMetrics}>
              <div className={styles.collabStat}>
                <span className={styles.statNumber}>142</span>
                <span className={styles.statLabel}>Active International Projects</span>
              </div>
              <div className={styles.collabStat}>
                <span className={styles.statNumber}>36</span>
                <span className={styles.statLabel}>Partner Countries</span>
              </div>
            </div>
            <div className={styles.partnerList}>
              <span className={styles.partnerBadge}>MIT</span>
              <span className={styles.partnerBadge}>Oxford</span>
              <span className={styles.partnerBadge}>NUS</span>
              <span className={styles.partnerBadge}>Tsinghua</span>
              <span className={styles.partnerBadge}>Tokyo Univ</span>
            </div>
          </section>
        </div>

        <div className={styles.rightColumn}>
          {/* 4. Core Metrics */}
          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>Ecosystem Metrics</h2>
            <div className={styles.metricsList}>
              <div className={styles.metricItem}>
                <span className={styles.metricIcon}>👥</span>
                <div className={styles.metricContent}>
                  <strong>2,450</strong>
                  <span>Affiliated Researchers</span>
                </div>
              </div>
              <div className={styles.metricItem}>
                <span className={styles.metricIcon}>📄</span>
                <div className={styles.metricContent}>
                  <strong>18,200</strong>
                  <span>Total Publications</span>
                </div>
              </div>
              <div className={styles.metricItem}>
                <span className={styles.metricIcon}>📈</span>
                <div className={styles.metricContent}>
                  <strong>1.4M</strong>
                  <span>Citation Impact</span>
                </div>
              </div>
            </div>
          </section>

          {/* 6. AI Forecast Projection */}
          <section className={`${styles.panel} ${styles.aiPanel}`}>
            <div className={styles.aiHeader}>
              <h2 className={styles.panelTitle}>Digital Twin Forecast</h2>
              <span className={styles.confidenceBadge}>Simulated Projection</span>
            </div>
            <p className={styles.aiText}>
              "Based on current publication velocity and global collaboration density, this institution is projected to rise to <strong>Global Top 20</strong> in Artificial Intelligence Research within 18 months."
            </p>
            <div className={styles.aiRecommendation}>
              <strong>Strategic Action:</strong> Increase joint publications with Asia-Pacific Federation Nodes to accelerate impact growth.
            </div>
          </section>
        </div>

      </div>
    </div>
  );
}
