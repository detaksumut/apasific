fetch('https://abmjieqcumlskannfkdl.supabase.co/functions/v1/send-wa', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer sb_publishable_Zvx-3Ezgb1jnAZsDGXyUOg_96PqXzRN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ target: '081234567890', message: 'Test message from system check' })
})
.then(r => r.json())
.then(data => console.log("WA RESULT:", JSON.stringify(data)))
.catch(err => console.error("WA ERROR:", err));
