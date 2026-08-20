import { supabase } from "@/integrations/supabase/client";

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  cover_url: string | null;
  external_url: string | null;
  tags: string[] | null;
  published_at: string | null;
};

export type ProjectEntry = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  tech_stack: string[] | null;
  live_url: string | null;
  repo_url: string | null;
  cover_url: string | null;
  featured: boolean;
  sort_order: number;
};

export type InstagramPost = {
  id: string;
  permalink: string;
  media_url: string | null;
  caption: string | null;
  posted_at: string;
};

export async function fetchBlogPosts(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("id,title,slug,excerpt,content,cover_url,external_url,tags,published_at")
    .eq("published", true)
    .order("published_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as BlogPost[];
}

export async function fetchBlogPost(slug: string): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("id,title,slug,excerpt,content,cover_url,external_url,tags,published_at")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as BlogPost | null) ?? null;
}

export async function fetchProjects(): Promise<ProjectEntry[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("id,name,slug,description,tech_stack,live_url,repo_url,cover_url,featured,sort_order")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as ProjectEntry[];
}

export async function fetchInstagramPosts(): Promise<InstagramPost[]> {
  const { data, error } = await supabase
    .from("instagram_posts")
    .select("id,permalink,media_url,caption,posted_at")
    .order("posted_at", { ascending: false })
    .limit(8);
  if (error) throw new Error(error.message);
  return (data ?? []) as InstagramPost[];
}
