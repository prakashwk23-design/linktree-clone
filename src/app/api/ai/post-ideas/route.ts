import { aiConfig, generateChatCompletion } from "@/lib/ai";
import { getCurrentUser } from "@/lib/auth";

const CATEGORIES = ["For you", "Behind the scenes", "Educational", "Promotional", "Personal"];

export type AiIdea = {
  title: string;
  hook: string;
  format: string;
  platform: string;
  category: string;
};

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Log in to generate ideas." }, { status: 401 });

  if (!aiConfig().configured) {
    return Response.json({ configured: false, error: "AI is not configured yet." });
  }

  let body: { category?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    body = {};
  }

  const category = CATEGORIES.includes(body.category ?? "") ? body.category! : "For you";

  const prompt = `Generate 4 social media post ideas for @${user.username}, a creator whose bio is: "${user.bio || user.name}".
Category: ${category}.
Return ONLY a JSON object of the form {"ideas":[{"title":"...","hook":"...","format":"...","platform":"...","category":"..."}]}.
- "title": short, punchy, max 7 words.
- "hook": one concrete sentence on how to open or execute the post.
- "format": e.g. "Reel · 30s", "Carousel · 5 slides", "Thread · 4 posts".
- "platform": one of Instagram, TikTok, YouTube, X, LinkedIn.
- "category": one of Behind the scenes, Educational, Promotional, Personal.`;

  try {
    const text = await generateChatCompletion([{ role: "user", content: prompt }], {
      maxTokens: 700,
      temperature: 0.9,
      json: true,
    });

    // The model is asked for JSON; tolerate code fences just in case.
    const cleaned = text.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
    const parsed = JSON.parse(cleaned) as { ideas?: AiIdea[] };
    const ideas = (Array.isArray(parsed.ideas) ? parsed.ideas : [])
      .filter((idea) => idea && typeof idea.title === "string" && idea.title.trim())
      .slice(0, 4)
      .map((idea) => ({
        title: idea.title.slice(0, 80),
        hook: String(idea.hook ?? "").slice(0, 220),
        format: String(idea.format ?? "Post").slice(0, 40),
        platform: String(idea.platform ?? "Instagram").slice(0, 20),
        category: String(idea.category ?? category).slice(0, 30),
      }));

    if (ideas.length === 0) throw new Error("The AI returned no usable ideas.");
    return Response.json({ configured: true, ideas });
  } catch (error) {
    return Response.json(
      { configured: true, error: error instanceof Error ? error.message : "Could not generate ideas." },
      { status: 502 },
    );
  }
}
