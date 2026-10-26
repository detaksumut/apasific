// APASIFIC integrity source-contract checks.
// These checks inspect the committed source; they are NOT a substitute for runtime/unit tests.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = (relativePath) => fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8');
const engine = read('src/services/at-rqs/ATRQSEngine.ts');
const editorRoute = read('src/app/api/editor/ultimateai-score/route.ts');
const provider = read('src/services/reviewer/AIProviderAdapter.ts');
const loa = read('src/services/LoAService.ts');
const adaptive = read('src/services/assessment/ATRQSAssessmentEngineService.ts');
const screening = read('src/services/reviewer/AIReviewerService.ts');

const checks = [
  ['SCREEN uses official (R - 1) / 4 normalization', engine.includes('(novRating - 1) / 4') && engine.includes('(metRating - 1) / 4') && engine.includes('(clarityRating - 1) / 4')],
  ['CLUE uses official CESS weights', engine.includes('0.30 * modelRobustness + 0.25 * samplingRigor + 0.15 * limitationOpenness + 0.15 * futureAgenda + 0.15 * practicalUtility')],
  ['AAC includes all three pairwise layer deviations', engine.includes('Math.abs(scoreNorm.overall - screenNorm.overall) + Math.abs(scoreNorm.overall - clueNorm.overall) + Math.abs(screenNorm.overall - clueNorm.overall)')],
  ['AECI requires limitations/bias evidence', engine.includes('if (c?.limitations || /keterbatasan|limitations|bias/i.test(abs)) detected++')],
  ['Score layer rejects missing criterion scores', engine.includes('Missing values cannot be inferred from overall_score')],
  ['Score layer recomputes mean from nine criteria', engine.includes('values.reduce((sum, value) => sum + value, 0) / values.length * 10')],
  ['Partial source fallbacks are disclosed', engine.includes('!input.scoreLayer || !input.screenLayer || !input.clueLayer')],
  ['Editor assessment route requires editor authorization', editorRoute.includes('requireEditor()') && editorRoute.includes('isEditorOrAbove')],
  ['Editor assessment verifies evidence quotes against manuscript text', editorRoute.includes('normalized.includes(normalizeText(quote))')],
  ['Editor score and recommendation are calculated server-side', editorRoute.includes('scores.reduce((a, b) => a + b, 0)') && editorRoute.includes('editor_decision_required: true')],
  ['Editor assessment uses SHA-256 manuscript provenance', editorRoute.includes("createHash('sha256').update(text, 'utf8').digest('hex')")],
  ['Failed persistence is not reported as success', editorRoute.includes('Penilaian gagal disimpan; tidak dilaporkan sebagai selesai.')],
  ['AI provider adapter contains no direct provider endpoints', !provider.includes('openrouter.ai') && !provider.includes('generativelanguage.googleapis.com')],
  ['AI schema rejects invalid ratings instead of substituting defaults', provider.includes('no fallback score is permitted') && !provider.includes('return 3;') && !provider.includes('80.00')],
  ['LoA validates official acceptance timestamp', loa.includes('invalid official timestamp') && loa.includes('getUTCFullYear()')],
  ['Adaptive rubric refuses missing scores and evidence', adaptive.includes('Missing evidence-backed score') && adaptive.includes('Missing evidence snippet')],
  ['Adaptive assessment uses SHA-256 provenance hash', adaptive.includes("createHash('sha256')")],
  ['Screening is explicitly labeled title/abstract-only', screening.includes("assessment_scope: 'title_and_abstract_only'") && screening.includes('bukan peer review penuh')],
];

let failed = 0;
for (const [label, passed] of checks) {
  if (passed) console.log('[PASS] ' + label);
  else {
    failed++;
    console.error('[FAIL] ' + label);
  }
}
console.log('\nSource-contract checks: ' + (checks.length - failed) + '/' + checks.length + ' passed.');
console.log('These checks do not run the application, contact 9Router/Supabase, or prove the academic correctness of a real manuscript assessment.');
if (failed) process.exitCode = 1;
