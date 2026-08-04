import { ZenodoProvider } from '../src/providers/zenodo/ZenodoProvider.ts';
import { OpenAlexProvider } from '../src/providers/openalex/OpenAlexProvider.ts';
import { OpenAIREProvider } from '../src/providers/openaire/OpenAIREProvider.ts';

const doi = '10.5281/zenodo.21633609';

async function main() {
  console.log('===== ZENODO =====');
  try {
    const provider = new ZenodoProvider();
    const result = await provider.createDeposit({
      title: 'Evidence Capture Test',
      upload_type: 'dataset',
      creators: [{ name: 'Evidence Capture' }],
      description: 'Runtime evidence collection preparation'
    });
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.log(err instanceof Error ? err.message : String(err));
  }

  console.log('===== OPENALEX =====');
  try {
    const provider = new OpenAlexProvider();
    const result = await provider.fetchCitationCount(doi);
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.log(err instanceof Error ? err.message : String(err));
  }

  console.log('===== OPENAIRE =====');
  try {
    const provider = new OpenAIREProvider();
    const result = await provider.searchResearchGraphByDOI(doi);
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.log(err instanceof Error ? err.message : String(err));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
