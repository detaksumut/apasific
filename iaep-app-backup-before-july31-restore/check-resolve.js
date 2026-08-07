const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function resolveLegacyFallback(bucket, entityId) {
  try {
    const unhexedId = Buffer.from(entityId.replace(/-/g, ''), 'hex').toString('utf8');
    console.log("Unhexed ID:", unhexedId);
    if (unhexedId && unhexedId !== entityId) {
      const { data: files } = await supabase.storage.from(bucket).list(unhexedId + '/');
      if (files && files.length > 0) {
        const fileNode = files.find(f => !f.name.includes('.emptyFolderPlaceholder')) || files[0];
        if (fileNode && fileNode.name) {
          return { path: `${unhexedId}/${fileNode.name}`, fileNode };
        }
      }
    }
  } catch (err) {
    console.error(err);
  }
  return null;
}

async function testResolve() {
  const entityId = '7375625f-3137-3834-3533-303330323837';
  const bucket = 'manuscripts';
  let recoveredPath = null;
  
  const fallback = await resolveLegacyFallback(bucket, entityId);
  if (fallback) {
    recoveredPath = fallback.path;
    console.log("FOUND VIA LEGACY:", recoveredPath);
  } else {
    try {
      const { data: files } = await supabase.storage.from(bucket).list(entityId + '/');
      if (files && files.length > 0) {
        const fileNode = files.find(f => !f.name.includes('.emptyFolderPlaceholder')) || files[0];
        if (fileNode && fileNode.name) {
          recoveredPath = `${entityId}/${fileNode.name}`;
          console.log("FOUND VIA DIRECT ID FOLDER:", recoveredPath);
        }
      } else {
          console.log("DIRECT ID FOLDER EMPTY OR MISSING");
      }
    } catch (e) {
        console.error(e);
    }
  }
  
  if (!recoveredPath) {
      console.log("NO RECOVERED PATH FOUND AT ALL");
  } else {
      const parts = recoveredPath.split('/');
      const fileName = parts.pop() || '';
      const folderPath = parts.join('/');
      console.log(`Checking file exists: folder=${folderPath}, fileName=${fileName}`);
      const { data: files } = await supabase.storage.from(bucket).list(folderPath, { search: fileName });
      const fileNode = files?.find(f => f.name === fileName);
      if (fileNode && fileNode.id) {
          console.log("FILE EXISTS STRICT CHECK PASSED!");
      } else {
          console.log("FILE EXISTS STRICT CHECK FAILED!");
          console.log("Files found in search:", files);
      }
  }
}

testResolve();
