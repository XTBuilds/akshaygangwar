import { supabase } from "@/integrations/supabase/client";

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_url: string | null;
  external_url: string | null;
  tags: string[];
  published_at: string;
};

export type ProjectEntry = {
  id: string;
  name: string;
  slug: string;
  description: string;
  tech_stack: string[];
  live_url: string | null;
  repo_url: string | null;
  featured: boolean;
  sort_order: number;
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
    .select("id,name,slug,description,tech_stack,live_url,repo_url,featured,sort_order")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as ProjectEntry[];
}

export function formatPostDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}
