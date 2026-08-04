# ASIA Provider Evidence Capture Procedure

## Purpose
This procedure moves the repository from provider readiness review to evidence capture preparation. It does not modify application code and does not claim certification. It only defines how to collect runtime evidence from the existing provider implementations and deployment environment.

## Existing validation paths and evidence producers
The following repository components already provide the runtime paths needed for evidence capture:

- Shared provider runtime: [src/providers/core/ProviderRuntimeManager.ts](src/providers/core/ProviderRuntimeManager.ts)
- Zenodo provider entry point: [src/providers/zenodo/ZenodoProvider.ts](src/providers/zenodo/ZenodoProvider.ts)
- OpenAlex provider entry point: [src/providers/openalex/OpenAlexProvider.ts](src/providers/openalex/OpenAlexProvider.ts)
- OpenAIRE provider entry point: [src/providers/openaire/OpenAIREProvider.ts](src/providers/openaire/OpenAIREProvider.ts)
- Project validation commands in [package.json](package.json): `npm run build` and `npm run lint`
- Existing validation guidance in [certifications/ASIA-Final-Environment-Validation-Runbook.md](certifications/ASIA-Final-Environment-Validation-Runbook.md) and [ASIA-Production-Evidence-Collection-Checklist.md](ASIA-Production-Evidence-Collection-Checklist.md)

## Evidence capture principles
1. Use the existing deployment runtime and provider paths rather than introducing new application logic.
2. Capture request, response, and log evidence for each provider execution.
3. Preserve trace identifiers and timestamps so the evidence is reviewable.
4. Keep the current status as READY FOR LIVE EVIDENCE until actual runtime evidence is attached.

## Recommended evidence bundle
For each provider execution, collect:
- timestamp
- provider name
- environment mode
- request endpoint or operation
- response payload or log excerpt
- trace identifier from the provider runtime
- outcome classification: success, controlled failure, or blocked by missing credentials

## Zenodo evidence procedure
### 1. Authentication test
- Execute the Zenodo provider path from the target deployment environment using the configured token.
- Capture the request details, response status, and the provider runtime log excerpt.
- Record whether the token was accepted or rejected.

### 2. Deposit validation
- Trigger a deposit request through the existing Zenodo provider operation.
- Capture the deposit response payload, deposit identifier, and runtime logs.
- Record whether the response is a valid deposit creation result.

### 3. DOI verification evidence
- Verify that the publish/deposit workflow returns a DOI and that the DOI is persisted in the application workflow output.
- Capture the DOI value, any related metadata, and the evidence that it was stored or surfaced to the publication workflow.

## OpenAlex evidence procedure
### 1. API request execution
- Execute the OpenAlex provider path for a known DOI from the target environment.
- Capture the request URL, polite email configuration, response status, and runtime log excerpt.

### 2. Response capture
- Save the response payload returned by the provider runtime.
- Record whether the response contained citation metrics or whether the workflow handled a controlled fallback.

### 3. Citation metric validation
- Confirm that the provider response is structurally valid for citation evidence.
- Record the citation metric returned or the controlled fallback behavior, together with the trace identifier.

## OpenAIRE evidence procedure
### 1. Discovery request
- Execute the OpenAIRE provider path using a DOI from the target publication workflow.
- Capture the request endpoint, response status, and runtime log excerpt.

### 2. Metadata response validation
- Validate that the response is a structured discovery result or a documented empty-result case.
- Record the payload shape and whether it was processed successfully by the workflow.

## Evidence handling notes
- Evidence should be stored in a reviewable artifact such as a log export, screenshot, JSON payload export, or deployment console capture.
- Do not replace runtime evidence with a code inspection statement.
- Status should remain READY FOR LIVE EVIDENCE until a real execution artifact exists.

## Completion condition
The provider evidence capture step is complete only when a real runtime artifact exists for the relevant provider path. Until that evidence is present, the correct status remains:

Architecture Certified.
Production Ready With Conditions.
Pending Final Environment Validation.
