import "server-only";

/**
 * Provider-agnostic AI client. Talks to any OpenAI-compatible
 * /chat/completions endpoint (OpenAI, OpenRouter, Groq, Together, Gemini's
 * OpenAI-compatible endpoint, Azure, a local Ollama, …).
 *
 * Configure with:
 *   AI_API_KEY   – required to enable real responses
 *   AI_MODEL     – e.g. "gpt-4o-mini" (default), "openrouter/auto", "llama-3.3-70b"
 *   AI_BASE_URL  – defaults to https://api.openai.com/v1
 *
 * Without a key the app falls back to its built-in, offline responses.
 */
export function aiConfig() {
  const apiKey = (process.env.AI_API_KEY ?? process.env.OPENAI_API_KEY ?? "").trim();
  const model = (process.env.AI_MODEL ?? "gpt-4o-mini").trim() || "gpt-4o-mini";
  const baseUrl = (process.env.AI_BASE_URL ?? "https://api.openai.com/v1").trim().replace(/\/$/, "");
  return { apiKey, model, baseUrl, configured: Boolean(apiKey) };
}

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export async function generateChatCompletion(
  messages: ChatMessage[],
  options: { maxTokens?: number; temperature?: number; json?: boolean } = {},
): Promise<string> {
  const { apiKey, model, baseUrl, configured } = aiConfig();
  if (!configured) throw new Error("AI is not configured. Set AI_API_KEY to enable real responses.");

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
    signal: AbortSignal.timeout(30000),
    body: JSON.stringify({
      model,
      messages,
      max_tokens: options.maxTokens ?? 400,
      temperature: options.temperature ?? 0.7,
      ...(options.json ? { response_format: { type: "json_object" } } : {}),
    }),
  });

  type CompletionResponse = { choices?: { message?: { content?: string } }[]; error?: { message?: string } };
  let data: CompletionResponse | null = null;
  try {
    data = (await response.json()) as CompletionResponse;
  } catch {
    data = null;
  }

  const text = data?.choices?.[0]?.message?.content?.trim();
  if (!response.ok || !text) {
    throw new Error(data?.error?.message ?? "The AI provider could not answer right now.");
  }
  return text;
}
