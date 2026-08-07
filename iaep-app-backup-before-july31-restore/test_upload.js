const fs = require('fs');

async function testUpload() {
  const formData = new FormData();
  formData.append('submissionId', 'test-123');
  // Need to append a Blob or File for Node.js fetch?
  // Let's just create a string blob
  formData.append('file', new Blob(['test content'], { type: 'text/plain' }), 'test.txt');

  try {
    const res = await fetch('http://localhost:3000/api/upload-galley', {
      method: 'POST',
      body: formData
    });
    
    if (!res.ok) {
      console.log('HTTP Error:', res.status, res.statusText);
      const text = await res.text();
      console.log('Response body:', text.substring(0, 500));
    } else {
      const data = await res.json();
      console.log('Success:', data);
    }
  } catch (err) {
    console.error('Fetch failed:', err);
  }
}

testUpload();
