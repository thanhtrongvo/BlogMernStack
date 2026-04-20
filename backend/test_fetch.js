async function test() {
  const url = "https://thehackernews.com/2026/04/hackers-exploit-cve-2025-55182-to.html";
  const body = { url: url, extractMode: "markdown", maxChars: 50000 };
  const res = await fetch("http://127.0.0.1:18789/__openclaw__/web_fetch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!res.ok) { console.log(res.status, await res.text()); return; }
  const json = await res.json();
  console.log("Title:", json.title);
  console.log("Length:", json.text.length);
}
test().catch(console.error);
