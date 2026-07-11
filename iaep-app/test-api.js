fetch("http://localhost:3000/api/users/list", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ action: "approve", userId: "123" })
}).then(r => r.json()).then(console.log);
