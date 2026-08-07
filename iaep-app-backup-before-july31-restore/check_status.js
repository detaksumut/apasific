const fs = require('fs'); 
const data = JSON.parse(fs.readFileSync('apasific_registered_users.json', 'utf8')); 
const statusCount = data.reduce((acc, user) => { 
  acc[user.status] = (acc[user.status] || 0) + 1; 
  return acc; 
}, {}); 
console.log('Total users:', data.length); 
console.log('Status counts:', statusCount);
