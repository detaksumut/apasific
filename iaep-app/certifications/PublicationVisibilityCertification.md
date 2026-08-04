# Publication Visibility Certification

## Status
CERTIFIED

## Scope
This certification covers the publication visibility pipeline for ASIA, including DOI registration, Zenodo deposition, discovery verification, and public indexing visibility.

## Architecture Reference
- ADR-ASIA-001
- Service layer: src/services/publication-federation
- Provider boundary: src/providers/zenodo and src/providers/openaire

## Validation Evidence
- Zenodo deposit service and provider boundary are implemented.
- OpenAIRE verification service is implemented.
- Google Scholar metadata and crawlability requirements are represented in the article layout and sitemap/robots configuration.
- Build verification completed successfully.

## Certification Result
The publication visibility flow remains compliant with the current architecture and provider-isolation requirements.
