const fs = require('fs');

async function fetchDebug() {
  const res = await fetch('http://localhost:3000/api/debug-pkm');
  const data = await res.json();
  const ajite = data.firestore_by_journal['033cce77-8836-492c-8fff-a27a911b4701'];
  console.log(JSON.stringify(ajite, null, 2));
}

fetchDebug();
