const targetZenodoIds = [
  '21633609',
  '21580255',
  '21535734',
  '21535711',
  '21535685',
  '21535656',
  '21436978',
  '21368192'
];

async function checkKeywords() {
  for (const id of targetZenodoIds) {
    try {
      const res = await fetch(`https://zenodo.org/api/records/${id}`);
      if (!res.ok) {
        console.log(`Zenodo ID ${id}: Failed HTTP ${res.status}`);
        continue;
      }
      const data = await res.json();
      const keywords = data.metadata?.keywords || [];
      console.log(`Zenodo ID: ${id}`);
      console.log(`  Title   : "${data.metadata?.title}"`);
      console.log(`  Keywords:`, JSON.stringify(keywords));
      console.log('--------------------------------------------------');
    } catch (e) {
      console.log(`Error ${id}: ${e.message}`);
    }
  }
}

checkKeywords();
