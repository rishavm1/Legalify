const API_KEY = "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";
const API_URL = "https://openrouter.ai/api/v1/chat/completions";

export async function generateDocument(
  systemPrompt: string,
  userAnswers: Record<string, string>
): Promise<string> {
  const userMessage = Object.entries(userAnswers)
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
      "HTTP-Referer": "https://legalify.app",
      "X-Title": "Legalify",
    },
    body: JSON.stringify({
      model: "anthropic/claude-3.5-sonnet",
      messages: [
        {
          role: "system",
          content: systemPrompt + "\n\nGenerate a complete, professional legal document based on the provided information. Format it properly with sections, clauses, and legal language.",
        },
        {
          role: "user",
          content: `Generate a legal document with these details:\n\n${userMessage}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
