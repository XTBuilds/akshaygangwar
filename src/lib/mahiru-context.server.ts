import { PROFILE_CONFIG } from "@/services/github";

const USER = "akshayxt";
const API = "https://api.github.com";
const TTL = 5 * 60 * 1000;

type Cached = { at: number; text: string };
let cache: Cached | null = null;

type Profile = {
  login: string;
  name: string | null;
  bio: string | null;
  location: string | null;
  company: string | null;
  blog: string | null;
  public_repos: number;
  followers: number;
  following: number;
  html_url: string;
  created_at: string;
};

type Repo = {
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  pushed_at: string;
  fork: boolean;
  archived: boolean;
  topics?: string[];
};

async function gh<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API}${path}`, {
      headers: { Accept: "application/vnd.github+json", "User-Agent": "xt-mahiru" },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

async function loadProjects() {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [{ data: projects }, { data: posts }] = await Promise.all([
      supabaseAdmin
        .from("projects")
        .select("name,description,tech_stack,live_url,repo_url,featured")
        .order("sort_order", { ascending: true }),
      supabaseAdmin
        .from("blog_posts")
        .select("title,slug,excerpt,published_at")
        .eq("published", true)
        .order("published_at", { ascending: false })
        .limit(10),
    ]);
    return { projects: projects ?? [], posts: posts ?? [] };
  } catch {
    return { projects: [], posts: [] };
  }
}

/** Builds (and caches for 5 min) the grounding text Mahiru answers from. */
export async function getMahiruContext(): Promise<string> {
  if (cache && Date.now() - cache.at < TTL) return cache.text;

  const [profile, repos, content] = await Promise.all([
    gh<Profile>(`/users/${USER}`),
    gh<Repo[]>(`/users/${USER}/repos?per_page=100&sort=updated`),
    loadProjects(),
  ]);

  const lines: string[] = [];
  lines.push(`OWNER: ${PROFILE_CONFIG.name} (brand: ${PROFILE_CONFIG.brand}, ${PROFILE_CONFIG.handle})`);
  lines.push(`ROLE: ${PROFILE_CONFIG.role}. ${PROFILE_CONFIG.tagline}`);
  lines.push(
    `LINKS: GitHub ${PROFILE_CONFIG.links.github}, Instagram ${PROFILE_CONFIG.links.instagram}, Telegram ${PROFILE_CONFIG.links.telegram}`,
  );
  lines.push("SITE SECTIONS: #command (GitHub Command Center), #projects, #lab (XT LAB bento of experimental builds), #repos, #stream (Instagram), #blog, #hire (hire form), #about, #contact (contact form), /projects page, /work/<repo-slug> case-file pages (one per GitHub project, slug = repo name lowercased with dashes), /blog/<slug> pages.");

  if (profile) {
    lines.push(
      `GITHUB PROFILE: @${profile.login}${profile.name ? ` (${profile.name})` : ""}; bio: ${profile.bio ?? "n/a"}; location: ${profile.location ?? "n/a"}; public repos: ${profile.public_repos}; followers: ${profile.followers}; following: ${profile.following}; member since ${profile.created_at.slice(0, 10)}.`,
    );
  } else {
    lines.push("GITHUB PROFILE: live fetch unavailable right now.");
  }

  if (repos && repos.length) {
    const own = repos.filter((r) => !r.fork);
    const stars = repos.reduce((a, r) => a + r.stargazers_count, 0);
    const forks = repos.reduce((a, r) => a + r.forks_count, 0);
    const langs = new Map<string, number>();
    repos.forEach((r) => r.language && langs.set(r.language, (langs.get(r.language) ?? 0) + 1));
    lines.push(
      `GITHUB TOTALS: ${repos.length} public repos (${own.length} original), ${stars} stars, ${forks} forks. Languages: ${[...langs.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([l, c]) => `${l} (${c})`)
        .join(", ")}.`,
    );
    lines.push("REPOSITORIES (name | language | stars | last push | description | url | live):");
    repos.slice(0, 80).forEach((r) => {
      lines.push(
        `- ${r.name} | ${r.language ?? "-"} | ★${r.stargazers_count} | ${r.pushed_at.slice(0, 10)} | ${(r.description ?? "no description").slice(0, 140)} | ${r.html_url}${r.homepage ? ` | ${r.homepage}` : ""}${r.archived ? " | archived" : ""}${r.fork ? " | fork" : ""}`,
      );
    });
  }

  if (content.projects.length) {
    lines.push("CURATED PROJECTS:");
    content.projects.forEach((p) =>
      lines.push(
        `- ${p.name}${p.featured ? " (featured)" : ""}: ${p.description ?? ""} [${(p.tech_stack ?? []).join(", ")}]${p.live_url ? ` live: ${p.live_url}` : ""}${p.repo_url ? ` repo: ${p.repo_url}` : ""}`,
      ),
    );
  }
  if (content.posts.length) {
    lines.push("BLOG POSTS:");
    content.posts.forEach((p) => lines.push(`- ${p.title} (/blog/${p.slug}): ${p.excerpt ?? ""}`));
  }

  const text = lines.join("\n");
  cache = { at: Date.now(), text };
  return text;
}
