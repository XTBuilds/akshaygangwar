const USER = "akshayxt";
const API = "https://api.github.com";

export const PROFILE_CONFIG = {
  name: "Akshay Gangwar",
  handle: "@akshayxt",
  brand: "XT",
  role: "Creative Frontend Engineer",
  tagline:
    "Building interactive digital experiences, high-impact interfaces and futuristic web systems.",
  links: {
    github: "https://github.com/akshayxt",
    instagram: "https://instagram.com/akshayxt",
    telegram: "https://t.me/akshay_xt",
  },
};

export type GithubProfile = {
  login: string;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  company: string | null;
  location: string | null;
  blog: string | null;
  public_repos: number;
  followers: number;
  following: number;
  html_url: string;
  created_at: string;
  updated_at: string;
};

export type GithubRepo = {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  watchers_count: number;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  default_branch: string;
  fork: boolean;
  archived: boolean;
  topics: string[];
  license: string | null;
  visibility: string;
};

export class GithubError extends Error {
  code: "RATE_LIMIT" | "NETWORK" | "API";
  constructor(code: GithubError["code"], message: string) {
    super(message);
    this.code = code;
  }
}

async function get<T>(path: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API}${path}`, {
      cache: "no-store",
      headers: { Accept: "application/vnd.github+json" },
    });
  } catch {
    throw new GithubError("NETWORK", "GITHUB CONNECTION LOST");
  }
  if (res.status === 403 || res.status === 429) {
    throw new GithubError("RATE_LIMIT", "GITHUB RATE LIMIT REACHED");
  }
  if (!res.ok) {
    throw new GithubError("API", `GITHUB CORE ERROR [${res.status}]`);
  }
  return (await res.json()) as T;
}

export async function fetchGithubProfile(): Promise<GithubProfile> {
  return get<GithubProfile>(`/users/${USER}`);
}

type RawRepo = Omit<GithubRepo, "license" | "topics"> & {
  license: { spdx_id?: string; name?: string } | null;
  topics?: string[];
};

export async function fetchGithubRepositories(): Promise<GithubRepo[]> {
  const raw = await get<RawRepo[]>(
    `/users/${USER}/repos?per_page=100&sort=updated&direction=desc`,
  );
  return raw.map((r) => ({
    ...r,
    topics: r.topics ?? [],
    license: r.license?.spdx_id ?? r.license?.name ?? null,
  }));
}

export async function fetchGithubData() {
  const [profile, repos] = await Promise.all([fetchGithubProfile(), fetchGithubRepositories()]);
  return { profile, repos, syncedAt: Date.now() };
}

export type GithubData = Awaited<ReturnType<typeof fetchGithubData>>;

export function totals(repos: GithubRepo[]) {
  return {
    stars: repos.reduce((a, r) => a + r.stargazers_count, 0),
    forks: repos.reduce((a, r) => a + r.forks_count, 0),
  };
}

export function featuredRepos(repos: GithubRepo[]) {
  return [...repos]
    .filter((r) => !r.fork)
    .sort((a, b) => {
      if (b.stargazers_count !== a.stargazers_count)
        return b.stargazers_count - a.stargazers_count;
      const home = Number(Boolean(b.homepage)) - Number(Boolean(a.homepage));
      if (home !== 0) return home;
      return +new Date(b.updated_at) - +new Date(a.updated_at);
    })
    .slice(0, 6);
}

export function languageMatrix(repos: GithubRepo[]) {
  const counts = new Map<string, number>();
  repos.forEach((r) => {
    if (r.language) counts.set(r.language, (counts.get(r.language) ?? 0) + 1);
  });
  const total = [...counts.values()].reduce((a, b) => a + b, 0);
  return [...counts.entries()]
    .map(([language, count]) => ({
      language,
      count,
      percent: total ? Math.round((count / total) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export async function fetchRepoReadme(repo: GithubRepo): Promise<string> {
  const base = `https://raw.githubusercontent.com/${repo.full_name}/${repo.default_branch}`;
  for (const file of ["README.md", "readme.md", "Readme.md"]) {
    try {
      const res = await fetch(`${base}/${file}`, { cache: "no-store" });
      if (res.ok) return await res.text();
    } catch {
      throw new GithubError("NETWORK", "README STREAM LOST");
    }
  }
  return "";
}

export function readmeSnippet(md: string, length = 400) {
  const text = md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#>*_`|-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > length ? `${text.slice(0, length)}...` : text;
}

export type CommitPoint = { date: string; count: number; message: string | null };

type RawCommit = { commit: { author: { date: string } | null; message: string } };

export async function fetchRepoCommitSeries(repo: GithubRepo): Promise<CommitPoint[]> {
  const raw = await get<RawCommit[]>(`/repos/${repo.full_name}/commits?per_page=60`);
  const buckets = new Map<string, { count: number; message: string }>();
  raw.forEach((c) => {
    const iso = c.commit.author?.date;
    if (!iso) return;
    const day = iso.slice(0, 10);
    const cur = buckets.get(day);
    buckets.set(day, {
      count: (cur?.count ?? 0) + 1,
      message: cur?.message ?? c.commit.message.split("\n")[0] ?? "",
    });
  });
  return [...buckets.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, v]) => ({ date, count: v.count, message: v.message }));
}
