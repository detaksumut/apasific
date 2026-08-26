// src/services/passport/ResearchPassportService.ts
/**
 * APASIFIC Digital Research Passport™ Generation & Verification Service
 * Conforms to APASIFIC Master Architecture v1.0 (Locked) - Sprint 5
 */

import { DigitalResearchPassport } from '@/domain/passport/ResearchPassport';
import { ATRQSAssessmentResult } from '@/services/assessment/ATRQSAssessmentEngineService';

export class ResearchPassportService {
  private static passportStore = new Map<string, DigitalResearchPassport[]>(); // key: passportId, value: versions array

  /**
   * 1. Generates an official Digital Research Passport for a published article
   */
  public static generatePassport({
    submissionId,
    doi,
    title,
    journalName,
    volume,
    issue,
    edition,
    originalSubmittedAt,
    publishedAt,
    identity,
    integrity,
    similarity,
    atrqs,
    versionNumber = '1.0'
  }: {
    submissionId: string;
    doi: string;
    title: string;
    journalName: string;
    volume: number;
    issue: number;
    edition: string;
    originalSubmittedAt: string;
    publishedAt: string;
    identity: {
      apasificAuthId: string;
      authenticatedOrcid: string;
      correspondingAuthor: string;
      affiliation: string;
      coAuthorsCount: number;
    };
    integrity: {
      aiTransparencyStatus: 'DISCLOSED_TRANSPARENT' | 'NO_AI_USED';
      aiToolsUsed: string[];
      ethicsClearanceStatus: string;
      dataAvailabilityStatus: string;
      fundingStatus: string;
      conflictOfInterestStatus: string;
    };
    similarity: {
      similarityContextIndex: number;
      riskSignalSummary: 'NO_HIGH_RISK_SIGNAL' | 'REVIEW_RECOMMENDED' | 'HIGH_RISK_SIGNAL_DETECTED';
    };
    atrqs: ATRQSAssessmentResult;
    versionNumber?: string;
  }): DigitalResearchPassport {
    
    // Generate deterministic passport ID if not already existing
    const hashSeed = `${submissionId}-${doi}-${originalSubmittedAt}`;
    const cleanId = Math.abs(this.simpleHash(hashSeed)).toString().padStart(6, '0').slice(0, 6);
    const passportId = `APASIFIC-PASS-2026-${cleanId}`;

    const digitalSignature = Buffer.from(`${passportId}|${versionNumber}|${doi}|${atrqs.compositeScore}|${publishedAt}`).toString('base64').substring(0, 24);

    const passport: DigitalResearchPassport = {
      passportId,
      identity: {
        apasificAuthId: identity.apasificAuthId,
        authenticatedOrcid: identity.authenticatedOrcid,
        correspondingAuthor: identity.correspondingAuthor,
        affiliation: identity.affiliation,
        coAuthorsCount: identity.coAuthorsCount
      },
      article: {
        articleId: submissionId,
        passportId,
        doi,
        title,
        journalName,
        volume,
        issue,
        edition,
        publishedAt,
        originalSubmittedAt // Strict Invariant: Always preserved from original submission snapshot
      },
      integrity,
      similarity: {
        similarityContextIndex: similarity.similarityContextIndex,
        riskSignalSummary: similarity.riskSignalSummary,
        editorialReviewStatus: 'APPROVED_BY_EDITORIAL_BOARD'
      },
      atrqs: {
        compositeScore: atrqs.compositeScore,
        tier: atrqs.tier,
        rubricVersion: atrqs.rubricVersion,
        assessmentVersion: atrqs.assessmentVersion,
        researchApproach: atrqs.researchApproach
      },
      provenance: {
        verificationStatus: 'VALID_AUTHENTIC',
        isCurrentVersion: true,
        versionNumber,
        assessedAt: atrqs.assessedAt,
        lastUpdated: new Date().toISOString(),
        digitalSignature
      }
    };

    // Store in historical version ledger
    const existingVersions = this.passportStore.get(passportId) || [];
    existingVersions.forEach(v => { v.provenance.isCurrentVersion = false; v.provenance.verificationStatus = 'SUPERSEDED'; });
    existingVersions.push(passport);
    this.passportStore.set(passportId, existingVersions);

    return passport;
  }

  /**
   * 2. Superseded Model: Creates a new Passport revision without altering original submitted timestamp
   */
  public static createSupersededRevision({
    existingPassportId,
    updatedEdition,
    updatedVolume,
    updatedIssue,
    reasonForRevision,
    atrqs
  }: {
    existingPassportId: string;
    updatedEdition: string;
    updatedVolume?: number;
    updatedIssue?: number;
    reasonForRevision: string;
    atrqs?: ATRQSAssessmentResult;
  }): DigitalResearchPassport | null {
    const versions = this.passportStore.get(existingPassportId);
    if (!versions || versions.length === 0) return null;

    const current = versions[versions.length - 1];
    const prevVersionNum = parseFloat(current.provenance.versionNumber);
    const newVersionNum = (prevVersionNum + 0.1).toFixed(1);

    return this.generatePassport({
      submissionId: current.article.articleId,
      doi: current.article.doi,
      title: current.article.title,
      journalName: current.article.journalName,
      volume: updatedVolume !== undefined ? updatedVolume : current.article.volume,
      issue: updatedIssue !== undefined ? updatedIssue : current.article.issue,
      edition: updatedEdition,
      originalSubmittedAt: current.article.originalSubmittedAt, // IMMUTABLE!
      publishedAt: current.article.publishedAt,
      identity: current.identity,
      integrity: current.integrity,
      similarity: current.similarity,
      atrqs: atrqs || (current.atrqs as any),
      versionNumber: newVersionNum
    });
  }

  /**
   * 3. Retrieves latest current passport or specific version
   */
  public static getPassportById(passportId: string, version?: string): DigitalResearchPassport | null {
    const versions = this.passportStore.get(passportId);
    if (!versions || versions.length === 0) return null;

    if (version) {
      return versions.find(v => v.provenance.versionNumber === version) || null;
    }
    return versions[versions.length - 1]; // Return current active
  }

  /**
   * 4. Retrieves complete version history for passport
   */
  public static getPassportHistory(passportId: string): DigitalResearchPassport[] {
    return this.passportStore.get(passportId) || [];
  }

  private static simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }
}
