import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type FeedPost = {
  id: string;
  permalink: string;
  media_url: string | null;
  caption: string | null;
  posted_at: string;
};

type GraphMedia = {
  id: string;
  permalink: string;
  media_url?: string;
  thumbnail_url?: string;
  caption?: string;
  timestamp?: string;
  media_type?: string;
};

async function fromGraphApi(token: string): Promise<FeedPost[]> {
  const url =
    "https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&limit=8&access_token=" +
    encodeURIComponent(token);
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text();
    console.error(`Instagram API failed [${res.status}]: ${body}`);
    return [];
  }
  const json = (await res.json()) as { data?: GraphMedia[] };
  return (json.data ?? []).map((m) => ({
    id: m.id,
    permalink: m.permalink,
    media_url: m.media_type === "VIDEO" ? (m.thumbnail_url ?? null) : (m.media_url ?? null),
    caption: m.caption ?? null,
    posted_at: m.timestamp ?? new Date().toISOString(),
  }));
}

async function fromDatabase(): Promise<FeedPost[]> {
  const { data, error } = await supabaseAdmin
    .from("instagram_posts")
    .select("id,permalink,media_url,caption,posted_at")
    .order("posted_at", { ascending: false })
    .limit(8);
  if (error) {
    console.error(`Instagram posts read failed: ${error.message}`);
    return [];
  }
  return (data ?? []) as FeedPost[];
}

export async function loadInstagramFeed(): Promise<{ posts: FeedPost[]; source: "api" | "db" }> {
  const token = process.env["INSTAGRAM_ACCESS_TOKEN"];
  if (token) {
    const posts = await fromGraphApi(token);
    if (posts.length) return { posts, source: "api" };
  }
  return { posts: await fromDatabase(), source: "db" };
}
