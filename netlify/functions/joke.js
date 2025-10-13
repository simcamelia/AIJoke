// Netlify serverless function: /.netlify/functions/joke
export async function handler(event) {
  try {
    const topic = (new URLSearchParams(event.rawQuery || "").get("topic") || "").trim();
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Missing OPENAI_API_KEY" })
      };
    }

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.9,
        messages: [
          { role: "system", content: "You are a witty comedian. Keep jokes clean, 1–2 sentences max." },
          { role: "user", content: `Tell me a short, clean one-liner joke${topic ? ` about ${topic}` : ""}.` }
        ]
      })
    });

    if (!resp.ok) {
      const detail = await resp.text();
      return {
        statusCode: 502,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "OpenAI error", detail })
      };
    }

    const data = await resp.json();
    const joke = data?.choices?.[0]?.message?.content?.trim() || "No joke this time 😅";

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({ joke })
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Function failed", detail: String(e) })
    };
  }
}
