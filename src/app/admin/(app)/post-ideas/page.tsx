export const instant = false;

import { PostIdeas } from "@/components/admin/PostIdeas";
import { requireUser } from "@/lib/auth";

export const metadata = { title: "Post ideas" };

export default async function PostIdeasPage() {
  const user = await requireUser();

  return (
    <div className="space-y-5">
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-shade/60">Tools</p>
        <h1 className="mt-1 font-display text-[28px] font-extrabold tracking-[-0.03em] text-shade sm:text-[32px]">
          Post ideas
        </h1>
        <p className="mt-1 text-[12.5px] text-shade/60">
          Never stare at a blank caption again. Pick an angle and make it yours.
        </p>
      </header>

      <PostIdeas username={user.username} />
    </div>
  );
}
