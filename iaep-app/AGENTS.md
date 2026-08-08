<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:journal-publishing-rules -->
# Aturan Penerbitan Jurnal & Sertifikat (Business Rules)

Harap patuhi aturan (rule) berikut saat merancang fitur penerbitan, penomoran jurnal, atau sertifikat:
1. **Titik Awal (Default):** Semua disiplin ilmu (termasuk Teknologi Komputer dan lainnya) HARUS selalu dimulai dari **Vol 1 No 1**.
2. **Aturan Volume (Vol):** Volume mengacu pada tahun terbit. Jika jurnal terbit 2 kali setiap tahun, maka per tahun akan ada 2 Volume (misal: Tahun Pertama = Vol 1 dan Vol 2).
3. **Aturan Nomor (No):** Nomor (Issue) terbitan tidak dibatasi (unlimited). Tidak ada batas maksimal artikel atau penomoran di dalam satu volume.
<!-- END:journal-publishing-rules -->

<!-- BEGIN:architecture-governance-rules -->
# Architecture Governance Rules

## RULE-API-001: Production API Boundary
Only certified production API routes may exist under `src/app/api/`.
Temporary, debug, migration, verification, and experimental routes must reside outside the Next.js routing tree (e.g., under `scratch/api-archive/`).

## RULE-META-002: APASIFIC Scholarly Metadata Interoperability Standard v1.0 (FROZEN)
To prevent downstream indexing failure, the scholarly metadata endpoints and formats are strictly locked:
1. **OAI-PMH Base URL**: Must remain `https://www.apasific.org/api/oai` (public, unauthenticated).
2. **OAI Identifier Format**: Must match `oai:apasific.org:article/[UUID]`.
3. **OAI-PMH GetRecord**: MUST resolve exactly one record specified by identifier. NEVER modify GetRecord to serve bulk, feed, or latest articles.
4. **OAI-PMH ListRecords**: Must serve all eligible published records, supporting resuming tokens if paginated.
5. **Published-Only Harvesting**: All metadata endpoints (JSON, BibTeX, DC, OAI-PMH) must filter strictly by `status = 'Published'` (case-insensitive). Drafts or private records must never be exposed.
6. **robots.txt Crawler Rules**: Explicitly allow `/api/oai/`, `/api/article/`, and `/api/publication/` before the general `Disallow: /api/` rule.
7. **Stable PDF Redirect**: All metadata endpoints must serve PDF links using the stable redirect path `/api/article/[id]/pdf` (which generates signed Supabase URLs on-demand), never long-term signed URLs directly.
8. **Changes & Regression**: Any future modification to the metadata interfaces requires a versioned change proposal, compatibility analysis, and regression verification check.
<!-- END:architecture-governance-rules -->
