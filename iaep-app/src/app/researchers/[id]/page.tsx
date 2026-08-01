import React from 'react';
import styles from './page.module.css';

export default function ResearcherIntelligenceProfile() {
  return (
    <div className={styles.profileContainer}>
      {/* 1. Academic Digital Identity Card Header */}
      <header className={styles.identityHeader}>
        <div className={styles.identityMeta}>
          <div className={styles.avatarPlaceholder}>
            <span className={styles.avatarInitials}>MR</span>
          </div>
          <div className={styles.identityDetails}>
            <h1 className={styles.researcherName}>Dr. Muhammad Researcher</h1>
            <p className={styles.researcherId}>AP-2026-000123</p>
            <div className={styles.verificationBadges}>
              <span className={styles.badgeSuccess}>✓ ORCID VERIFIED</span>
              <span className={styles.badgeSuccess}>✓ INSTITUTION VERIFIED</span>
            </div>
          </div>
        </div>
        
        {/* 2. Academic Reputation Score Card */}
        <div className={styles.reputationCard}>
          <div className={styles.reputationLabel}>Academic Reputation Score</div>
          <div className={styles.reputationScore}>87.5</div>
          <div className={styles.reputationRank}>Distinguished Researcher</div>
          <div className={styles.reputationBreakdown}>
            <span>Identity 10%</span> • <span>Cert 25%</span> • <span>Pub 30%</span> • <span>Impact 35%</span>
          </div>
        </div>
      </header>

      <div className={styles.mainGrid}>
        
        <div className={styles.leftColumn}>
          {/* 3. Expertise Knowledge Graph */}
          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>Expertise Graph</h2>
            <div className={styles.expertiseGraphMock}>
              <div className={styles.graphNode} style={{top: '20%', left: '20%'}}>AI Ethics</div>
              <div className={styles.graphNode} style={{top: '50%', left: '50%'}}>Researcher</div>
              <div className={styles.graphNode} style={{top: '20%', left: '80%'}}>Education</div>
              <div className={styles.graphNode} style={{top: '80%', left: '30%'}}>Data Science</div>
              <div className={styles.graphNode} style={{top: '80%', left: '70%'}}>Machine Learning</div>
              
              <svg className={styles.graphEdges} width="100%" height="100%">
                <line x1="20%" y1="20%" x2="50%" y2="50%" stroke="var(--academic-blue-light)" />
                <line x1="80%" y1="20%" x2="50%" y2="50%" stroke="var(--academic-blue-light)" />
                <line x1="30%" y1="80%" x2="50%" y2="50%" stroke="var(--academic-blue-light)" />
                <line x1="70%" y1="80%" x2="50%" y2="50%" stroke="var(--academic-blue-light)" />
              </svg>
            </div>
          </section>

          {/* 6. Research Impact Panel */}
          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>Research Impact</h2>
            <div className={styles.impactMetrics}>
              <div className={styles.impactItem}>
                <span>Citations</span>
                <strong>450</strong>
                <div className={styles.progressBar}><div className={styles.progressFill} style={{width: '75%'}}></div></div>
              </div>
              <div className={styles.impactItem}>
                <span>H-Index</span>
                <strong>18</strong>
                <div className={styles.progressBar}><div className={styles.progressFill} style={{width: '60%'}}></div></div>
              </div>
              <div className={styles.impactItem}>
                <span>Publications</span>
                <strong>65</strong>
                <div className={styles.progressBar}><div className={styles.progressFill} style={{width: '85%'}}></div></div>
              </div>
            </div>
            <div className={styles.trendUp}>↗ +24% Growth Trend</div>
          </section>

          {/* 7. Collaboration Network */}
          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>Global Collaboration</h2>
            <div className={styles.collaborationFlex}>
              <div className={styles.collabScore}>
                <span className={styles.scoreNumber}>82</span>
                <span className={styles.scoreLabel}>Global Score</span>
              </div>
              <div className={styles.collabInstitutions}>
                <span className={styles.instBadge}>Uni A</span>
                <span className={styles.instBadge}>Uni B</span>
                <span className={styles.instBadge}>Institute C</span>
              </div>
            </div>
          </section>
        </div>

        <div className={styles.rightColumn}>
          {/* 8. AI Insight Panel */}
          <section className={`${styles.panel} ${styles.aiPanel}`}>
            <div className={styles.aiHeader}>
              <h2 className={styles.panelTitle}>AI Intelligence Insight</h2>
              <span className={styles.confidenceBadge}>91% Confidence</span>
            </div>
            <p className={styles.aiText}>
              "This researcher demonstrates strong emerging expertise in <strong>Artificial Intelligence Ethics</strong>."
            </p>
            <div className={styles.aiRecommendation}>
              <strong>Recommended Action:</strong> International collaboration with Data Governance researchers.
            </div>
          </section>

          {/* 4. Publication Intelligence Timeline */}
          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>Publication Intelligence</h2>
            <div className={styles.timeline}>
              <div className={styles.timelineItem}>
                <div className={styles.timelineYear}>2026</div>
                <div className={styles.timelineContent}>Citation Growth Detected</div>
              </div>
              <div className={styles.timelineItem}>
                <div className={styles.timelineYear}>2024</div>
                <div className={styles.timelineContent}>DOI Registered (Crossref)</div>
              </div>
              <div className={styles.timelineItem}>
                <div className={styles.timelineYear}>2021</div>
                <div className={styles.timelineContent}>Indexed in Scopus</div>
              </div>
              <div className={styles.timelineItem}>
                <div className={styles.timelineYear}>2019</div>
                <div className={styles.timelineContent}>First Article Published</div>
              </div>
            </div>
          </section>

          {/* 5. Certification Intelligence Timeline */}
          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>Verified Credentials</h2>
            <div className={styles.credentialList}>
              <div className={styles.credentialItem}>
                <span className={styles.checkIcon}>✓</span>
                <div className={styles.credentialDetails}>
                  <strong>AI Research Certification</strong>
                  <span>Issued: 2026 • SHA256 Verified</span>
                </div>
              </div>
              <div className={styles.credentialItem}>
                <span className={styles.checkIcon}>✓</span>
                <div className={styles.credentialDetails}>
                  <strong>Research Methodology Certification</strong>
                  <span>Issued: 2024 • SHA256 Verified</span>
                </div>
              </div>
              <div className={styles.credentialItem}>
                <span className={styles.checkIcon}>✓</span>
                <div className={styles.credentialDetails}>
                  <strong>Professional Lecturer Certification</strong>
                  <span>Issued: 2021 • SHA256 Verified</span>
                </div>
              </div>
            </div>
          </section>
        </div>

      </div>
    </div>
  );
}
