// src/providers/zenodo/IZenodoRecord.ts

export interface IZenodoRecord {
  zenodoRecordId: string;
  doi: string;
  conceptDoi?: string;
  recordUrl: string;
  publishedDate: string;
  metadataUrl?: string;
  filesCount?: number;
  status?: string;
}
