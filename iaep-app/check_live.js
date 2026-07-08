const https = require('https');

https.get('https://apasific.vercel.app/main.js', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    if (data.includes('page = page.replace')) {
      console.log('✅ LIVE MAIN.JS IS UPDATED!');
    } else {
      console.log('❌ LIVE MAIN.JS IS STILL THE OLD VERSION!');
    }
    if (data.includes('asiacert:')) {
      console.log('✅ pageToBodyMap uses clean keys!');
    } else {
      console.log('❌ pageToBodyMap STILL uses .html keys!');
    }
  });
});
