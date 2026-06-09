export async function askClaude(messages, system = "") {
  const res = await fetch("/.netlify/functions/claude-proxy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, system }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Claude proxy failed: " + res.status);
  }

  const data = await res.json();
  return data.content[0].text;
}