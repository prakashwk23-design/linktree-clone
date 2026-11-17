import { aiConfig, generateChatCompletion, type ChatMessage } from "@/lib/ai";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Log in to use Ask Linktree." }, { status: 401 });

  if (!aiConfig().configured) {
    return Response.json({ configured: false, error: "AI is not configured yet." });
  }

  let body: { message?: string; history?: { role?: string; content?: string }[] };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const message = (body.message ?? "").trim().slice(0, 1000);
  if (!message) return Response.json({ error: "Ask a question first." }, { status: 400 });

  const history = (Array.isArray(body.history) ? body.history : [])
    .filter(
      (entry): entry is { role: "user" | "assistant"; content: string } =>
        (entry?.role === "user" || entry?.role === "assistant") && typeof entry?.content === "string",
    )
    .slice(-8)
    .map((entry) => ({ role: entry.role, content: entry.content.slice(0, 1000) }));

  const messages: ChatMessage[] = [
    {
      role: "system",
      content: `You are "Ask Linktree", a friendly, concise assistant inside a Linktree-style link-in-bio tool.
The user's name is ${user.name || user.username} and their page is linktr.ee/${user.username}.
Help with link titles, profile design, analytics, growing traffic, and selling digital products.
Keep answers practical and under 120 words. Use plain text, no markdown headings.`,
    },
    ...history,
    { role: "user", content: message },
  ];

  try {
    const text = await generateChatCompletion(messages, { maxTokens: 320 });
    return Response.json({ configured: true, text });
  } catch (error) {
    return Response.json(
      { configured: true, error: error instanceof Error ? error.message : "AI is unavailable right now." },
      { status: 502 },
    );
  }
}
