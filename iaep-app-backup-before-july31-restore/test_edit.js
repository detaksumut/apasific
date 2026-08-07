const http = require('http');

async function testEdit() {
  try {
    const res = await fetch('http://localhost:3000/api/users/list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'edit',
        user: {
          id: 'demo-user-1783775577127-0.14255337501447785',
          name: 'Dr.Wisang Candra Bintari.S.E.,M.M',
          email: 'binaricandra@gmail.com',
          role: 'Reviewer',
          status: 'Active',
          journal: 'APASIFIC IAEP'
        }
      })
    });
    const data = await res.json();
    console.log("Response:", data);
  } catch (err) {
    console.log("Error:", err);
  }
}

testEdit();
