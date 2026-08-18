import { useEffect, useMemo, useRef, useState } from "react";
import { MagneticButton, MagneticLink } from "@/components/motion/MagneticButton";
import { TiltCard } from "@/components/motion/TiltCard";
import { Parallax } from "@/components/motion/Parallax";
import profileAsset from "@/assets/profile.png.asset.json";
import { useGithub } from "@/hooks/useGithub";
import {
  PROFILE_CONFIG,
  featuredRepos,
  formatDate,
  languageMatrix,
  totals,
  type GithubRepo,
} from "@/services/github";

const GH = PROFILE_CONFIG.links.github;

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}

function Counter({ value }: { value: number | undefined }) {
  const reduced = useReducedMotion();
  const [n, setN] = useState(0);
  useEffect(() => {
    if (value === undefined) return;
    if (reduced) {
      setN(value);
      return;
    }
    const start = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / 900);
      setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, reduced]);
  if (value === undefined) return <span className="text-muted-foreground">--</span>;
  return <span>{n.toLocaleString()}</span>;
}

function SectionTitle({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.4em] text-muted-foreground">{kicker}</p>
      <h2 className="mt-2 font-display text-3xl text-gradient sm:text-4xl">{title}</h2>
      <div className="mt-3 h-px w-24 rule-brand" />
    </div>
  );
}

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  const items = [
    ["Command", "#command"],
    ["Projects", "#projects"],
    ["All Repos", "#repos"],
    ["Matrix", "#matrix"],
    ["About", "#about"],
    ["Contact", "#contact"],
  ];
  return (
    <header
      className={`sticky top-0 z-30 border-b transition-all duration-300 ${
        scrolled
          ? "border-cyan/25 bg-background/60 backdrop-blur-2xl shadow-[0_10px_40px_-24px_var(--cyan)]"
          : "border-border/60 bg-background/40 backdrop-blur-xl"
      }`}
    >
      <div
        className={`mx-auto flex max-w-6xl items-center justify-between px-5 transition-all duration-300 ${
          scrolled ? "py-2.5" : "py-4"
        }`}
      >
        <a href="#top" className="font-display text-lg tracking-widest text-gradient">
          {PROFILE_CONFIG.brand}
        </a>
        <nav
          aria-label="Primary"
          className="hidden gap-6 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground lg:flex"
        >
          {items.map(([l, h]) => (
            <a key={h} href={h} className="hover:text-cyan focus-visible:text-cyan">
              {l}
            </a>
          ))}
        </nav>
        <MagneticLink
          href={GH}
          target="_blank"
          rel="noreferrer"
          className="rounded-full border border-cyan/40 px-4 py-1.5 font-mono text-xs uppercase tracking-widest text-cyan transition-colors hover:bg-cyan/10"
        >
          GitHub
        </MagneticLink>
      </div>
    </header>
  );
}


export function Hero() {
  const { data } = useGithub();



  const t = data ? totals(data.repos) : undefined;
  const stats: [string, number | undefined][] = [
    ["Repositories", data?.profile.public_repos],
    ["Followers", data?.profile.followers],
    ["Following", data?.profile.following],
    ["Total Stars", t?.stars],
  ];

  return (
    <section id="top" className="relative overflow-hidden">
      <Parallax depth={3} className="absolute -inset-6 grid-bg opacity-30" aria-hidden />
      <Parallax
        depth={10}
        className="pointer-events-none absolute -left-32 top-10 h-96 w-96 rounded-full bg-primary/20 blur-[120px]"
        aria-hidden
      />
      <Parallax
        depth={12}
        invert
        className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-accent/20 blur-[130px]"
        aria-hidden
      />
      <div className="pointer-glow pointer-events-none absolute inset-0" aria-hidden />

      <div className="relative mx-auto grid max-w-6xl gap-10 px-5 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:py-24">
        <Parallax depth={4} className="animate-rise">
          <p className="font-mono text-xs uppercase tracking-[0.45em] text-muted-foreground">
            Turning ideas into <span className="text-cyan caret">code</span>
          </p>
          <h1 className="mt-5 font-display text-5xl leading-[0.95] sm:text-7xl">
            <span className="block text-foreground">AKSHAY</span>
            <span className="block text-gradient">GANGWAR</span>
          </h1>
          <p className="mt-4 font-mono text-sm uppercase tracking-[0.3em] text-cyan">
            {PROFILE_CONFIG.handle}
          </p>
          <p className="mt-2 font-mono text-sm uppercase tracking-[0.3em] text-muted-foreground">
            {PROFILE_CONFIG.role}
          </p>
          <div className="mt-4 h-px w-72 max-w-full rule-brand" />
          <p className="mt-6 max-w-lg border-l-2 border-primary pl-4 text-lg text-muted-foreground">
            {PROFILE_CONFIG.tagline}
          </p>

          <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map(([k, v]) => (
              <div key={k} className="panel p-4">
                <dt className="font-mono text-[10px] uppercase tracking-[0.25em] text-violet">
                  {k}
                </dt>
                <dd className="mt-1 font-display text-2xl text-foreground">
                  <Counter value={v} />
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-8 flex flex-wrap gap-3">
            <MagneticLink
              href="#projects"
              className="rounded-md btn-brand px-6 py-3 font-mono text-xs uppercase tracking-[0.2em]"
            >
              View Projects
            </MagneticLink>
            <MagneticLink
              href={GH}
              target="_blank"
              rel="noreferrer"
              className="rounded-md border border-border px-6 py-3 font-mono text-xs uppercase tracking-[0.2em] text-foreground transition-colors hover:border-cyan hover:text-cyan"
            >
              GitHub
            </MagneticLink>
          </div>
        </Parallax>

        <Parallax depth={14} className="animate-rise space-y-6">
          <div className="panel relative overflow-hidden">
            <img
              src={data?.profile.avatar_url ?? profileAsset.url}
              alt="Akshay Gangwar, creative frontend engineer"
              className="h-[360px] w-full object-cover object-top"
              loading="lazy"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background to-transparent p-4">
              <p className="font-display text-sm tracking-widest text-cyan">{PROFILE_CONFIG.brand}</p>
              <p className="font-mono text-xs text-muted-foreground">
                {data?.profile.bio?.replace(/\.{2,}/g, "") || "Creative frontend engineering."}
              </p>
            </div>
          </div>
        </Parallax>
      </div>
    </section>
  );
}

export function CommandCenter() {
  const { data, isLoading, isFetching, errorMessage, refresh } = useGithub();
  const t = data ? totals(data.repos) : undefined;
  const cells: [string, number | undefined][] = [
    ["Public Repositories", data?.profile.public_repos],
    ["Followers", data?.profile.followers],
    ["Following", data?.profile.following],
    ["Total Stars", t?.stars],
    ["Total Forks", t?.forks],
  ];

  return (
    <section id="command" className="mx-auto max-w-6xl px-5 py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionTitle kicker="// live data" title="GITHUB COMMAND CENTER" />
        <button
          type="button"
          onClick={refresh}
          className="rounded-md border border-cyan/40 px-5 py-2 font-mono text-xs uppercase tracking-[0.2em] text-cyan transition-colors hover:bg-cyan/10 disabled:opacity-50"
          disabled={isFetching}
        >
          {isFetching ? "Syncing..." : "Refresh GitHub"}
        </button>
      </div>

      <p
        className={`mt-5 font-mono text-xs uppercase tracking-[0.3em] ${
          errorMessage ? "text-destructive" : "text-neon"
        }`}
        role="status"
      >
        {errorMessage
          ? `● ${errorMessage}`
          : isLoading
            ? "SYNCING GITHUB DATA..."
            : "● GITHUB CORE ONLINE — CONNECTION: ONLINE"}
      </p>
      {data && (
        <p className="mt-1 font-mono text-xs text-muted-foreground">
          LAST SYNC: {new Date(data.syncedAt).toLocaleString()}
        </p>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {cells.map(([k, v]) => (
          <div key={k} className="panel p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-violet">{k}</p>
            <p className="mt-2 font-display text-3xl text-foreground">
              <Counter value={v} />
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function RepoCard({
  repo,
  onSelect,
  dense,
}: {
  repo: GithubRepo;
  onSelect?: ((r: GithubRepo) => void) | undefined;
  dense?: boolean | undefined;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null);

  const onMove = (e: React.MouseEvent) => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const rx = ((e.clientY - r.top) / r.height - 0.5) * -6;
    const ry = ((e.clientX - r.left) / r.width - 0.5) * 6;
    el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`;
  };
  const reset = () => {
    if (ref.current) ref.current.style.transform = "";
  };

  return (
    <article
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      className={`holo-panel animate-dissolve group flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        dense ? "p-4" : "p-5"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="truncate font-display text-base text-foreground" title={repo.name}>
          {repo.name}
        </h3>
        <span
          className="mt-1 h-2 w-2 shrink-0 rounded-full bg-neon animate-pulse-ring"
          title={`Last commit ${formatDate(repo.pushed_at)}`}
        />
      </div>
      {!dense && (
        <p className="mt-2 line-clamp-3 min-h-[3.5rem] text-sm text-muted-foreground">
          {repo.description || "No description provided."}
        </p>
      )}
      <div className="mt-4 flex flex-wrap gap-3 font-mono text-[11px] text-muted-foreground">
        {repo.language && <span className="text-cyan">{repo.language}</span>}
        <span className="text-foreground">★ {repo.stargazers_count}</span>
        <span>⑂ {repo.forks_count}</span>
        <span>{formatDate(repo.updated_at)}</span>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {onSelect && (
          <button
            type="button"
            onClick={() => onSelect(repo)}
            className="rounded-md btn-brand px-4 py-2 font-mono text-[11px] uppercase tracking-[0.2em]"
          >
            Open Details
          </button>
        )}
        <a
          href={repo.html_url}
          target="_blank"
          rel="noreferrer"
          className="portal-link"
        >
          View Source
        </a>
        {repo.homepage && (
          <a href={repo.homepage} target="_blank" rel="noreferrer" className="portal-link">
            Live Demo
          </a>
        )}
      </div>
    </article>
  );
}

export function FeaturedProjects({ onSelect }: { onSelect?: ((r: GithubRepo) => void) | undefined }) {
  const { data, isLoading, errorMessage } = useGithub();
  const featured = data ? featuredRepos(data.repos) : [];
  return (
    <section id="projects" className="mx-auto max-w-6xl px-5 py-16">
      <SectionTitle kicker="// auto-ranked from github" title="SELECTED PROJECTS" />
      {errorMessage ? (
        <p className="mt-8 font-mono text-sm text-destructive">GITHUB SYNC FAILED</p>
      ) : isLoading ? (
        <p className="mt-8 font-mono text-sm text-muted-foreground">SCANNING GITHUB...</p>
      ) : featured.length === 0 ? (
        <p className="mt-8 font-mono text-sm text-muted-foreground">NO REPOSITORIES FOUND</p>
      ) : (
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((r) => (
            <RepoCard key={r.id} repo={r} onSelect={onSelect} />
          ))}
        </div>
      )}
    </section>
  );
}


type Sort = "updated" | "stars" | "forks" | "az";

export function RepositoryExplorer({
  onSelect,
  showFilters = true,
  density = "comfortable",
}: {
  onSelect?: ((r: GithubRepo) => void) | undefined;
  showFilters?: boolean;
  density?: "comfortable" | "dense";
}) {
  const { data, isLoading, errorMessage } = useGithub();
  const [q, setQ] = useState("");
  const [langs, setLangs] = useState<string[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [licenses, setLicenses] = useState<string[]>([]);
  const [sort, setSort] = useState<Sort>("updated");
  const [limit, setLimit] = useState(12);

  const repos = data?.repos ?? [];
  const allLangs = useMemo(
    () => [...new Set(repos.map((r) => r.language).filter(Boolean))].sort() as string[],
    [repos],
  );
  const allTopics = useMemo(
    () => [...new Set(repos.flatMap((r) => r.topics))].sort().slice(0, 24),
    [repos],
  );
  const allLicenses = useMemo(
    () => [...new Set(repos.map((r) => r.license).filter(Boolean))].sort() as string[],
    [repos],
  );

  const toggle = (setter: typeof setLangs) => (value: string) => {
    setLimit(12);
    setter((cur) => (cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value]));
  };

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    const out = repos.filter((r) => {
      const matchLang = langs.length === 0 || (r.language ? langs.includes(r.language) : false);
      const matchTopic = topics.length === 0 || r.topics.some((t) => topics.includes(t));
      const matchLicense =
        licenses.length === 0 || (r.license ? licenses.includes(r.license) : false);
      const matchTerm =
        !term ||
        r.name.toLowerCase().includes(term) ||
        (r.description ?? "").toLowerCase().includes(term) ||
        r.topics.some((t) => t.includes(term));
      return matchLang && matchTopic && matchLicense && matchTerm;
    });
    out.sort((a, b) => {
      if (sort === "stars") return b.stargazers_count - a.stargazers_count;
      if (sort === "forks") return b.forks_count - a.forks_count;
      if (sort === "az") return a.name.localeCompare(b.name);
      return +new Date(b.updated_at) - +new Date(a.updated_at);
    });
    return out;
  }, [repos, q, langs, topics, licenses, sort]);

  const chipRow = (
    label: string,
    values: string[],
    active: string[],
    onToggle: (v: string) => void,
    prefix = "",
  ) =>
    values.length > 0 && (
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-violet">
          {label}
        </span>
        {values.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onToggle(v)}
            aria-pressed={active.includes(v)}
            className={`chip ${active.includes(v) ? "chip-on" : ""}`}
          >
            {prefix}
            {v}
          </button>
        ))}
      </div>
    );

  return (
    <section id="repos" className="mx-auto max-w-6xl px-5 py-16">
      <SectionTitle kicker="// live repository explorer" title="ALL PROJECTS" />

      {showFilters && (
        <div className="holo-panel mt-8 flex flex-col gap-4 p-5">
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="sr-only" htmlFor="repo-search">
              Search projects
            </label>
            <input
              id="repo-search"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setLimit(12);
              }}
              placeholder="SEARCH PROJECTS..."
              className="panel w-full px-4 py-3 font-mono text-xs uppercase tracking-[0.2em] text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-cyan"
            />
            <label className="sr-only" htmlFor="repo-sort">
              Sort projects
            </label>
            <select
              id="repo-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="panel px-4 py-3 font-mono text-xs uppercase tracking-[0.2em] text-foreground outline-none focus-visible:border-cyan"
            >
              <option value="updated">Recently Updated</option>
              <option value="stars">Most Starred</option>
              <option value="forks">Most Forked</option>
              <option value="az">A-Z</option>
            </select>
          </div>

          {chipRow("Languages", allLangs, langs, toggle(setLangs))}
          {chipRow("Topics", allTopics, topics, toggle(setTopics), "#")}
          {chipRow("Licenses", allLicenses, licenses, toggle(setLicenses))}

          {(langs.length || topics.length || licenses.length) > 0 && (
            <button
              type="button"
              onClick={() => {
                setLangs([]);
                setTopics([]);
                setLicenses([]);
              }}
              className="self-start font-mono text-[11px] uppercase tracking-[0.25em] text-cyan hover:underline"
            >
              Clear filters ({list.length} matched)
            </button>
          )}
        </div>
      )}

      {errorMessage ? (
        <p className="mt-8 font-mono text-sm text-destructive">GITHUB SYNC ERROR — {errorMessage}</p>
      ) : isLoading ? (
        <p className="mt-8 font-mono text-sm text-muted-foreground">
          SCANNING GITHUB REPOSITORIES...
        </p>
      ) : list.length === 0 ? (
        <p className="mt-8 font-mono text-sm text-muted-foreground">NO REPOSITORIES FOUND</p>
      ) : (
        <>
          <div
            className={`mt-8 grid gap-5 md:grid-cols-2 ${
              density === "dense" ? "lg:grid-cols-4" : "lg:grid-cols-3"
            }`}
          >
            {list.slice(0, limit).map((r) => (
              <RepoCard key={r.id} repo={r} onSelect={onSelect} dense={density === "dense"} />
            ))}
          </div>

          {limit < list.length && (
            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={() => setLimit((n) => n + 12)}
                className="rounded-md border border-cyan/40 px-6 py-3 font-mono text-xs uppercase tracking-[0.2em] text-cyan hover:bg-cyan/10"
              >
                Load More ({list.length - limit})
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}

export function TechnologyMatrix() {
  const { data, isLoading, errorMessage } = useGithub();
  const langs = data ? languageMatrix(data.repos) : [];
  return (
    <section id="matrix" className="mx-auto max-w-6xl px-5 py-16">
      <SectionTitle kicker="// derived from repositories" title="TECHNOLOGY MATRIX" />
      {errorMessage ? (
        <p className="mt-8 font-mono text-sm text-destructive">GITHUB SYNC FAILED</p>
      ) : isLoading ? (
        <p className="mt-8 font-mono text-sm text-muted-foreground">ANALYZING LANGUAGES...</p>
      ) : (
        <div className="panel mt-8 space-y-4 p-6">
          {langs.map((l) => (
            <div key={l.language}>
              <div className="flex justify-between font-mono text-xs uppercase tracking-[0.2em]">
                <span className="text-foreground">{l.language}</span>
                <span className="text-cyan">
                  {l.percent}% · {l.count} repos
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rule-brand transition-[width] duration-700"
                  style={{ width: `${l.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export function Activity() {
  const { data } = useGithub();
  const latest = data?.repos[0];
  const rows: [string, string][] = [
    ["Account Created", data ? formatDate(data.profile.created_at) : "--"],
    ["Public Repositories", data ? String(data.profile.public_repos) : "--"],
    ["Followers", data ? String(data.profile.followers) : "--"],
    ["Following", data ? String(data.profile.following) : "--"],
    ["Latest Repository Update", latest ? `${latest.name} · ${formatDate(latest.updated_at)}` : "--"],
  ];
  return (
    <section className="mx-auto max-w-6xl px-5 py-16">
      <SectionTitle kicker="// public metrics" title="GITHUB ACTIVITY" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map(([k, v]) => (
          <div key={k} className="panel p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-violet">{k}</p>
            <p className="mt-2 truncate font-mono text-sm text-foreground">{v}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

const SKILLS: [string, string[]][] = [
  ["Core", ["HTML", "CSS", "JavaScript", "TypeScript", "Frontend Engineering", "UI Systems"]],
  ["Experimental", ["React", "Motion / Animation", "Interactive Design", "Python", "C#"]],
  ["Tools", ["Git", "Figma"]],
];

export function About() {
  return (
    <section id="about" className="mx-auto max-w-6xl px-5 py-16">
      <SectionTitle kicker="// identity" title="ABOUT XT" />
      <p className="mt-8 max-w-2xl border-l-2 border-primary pl-4 text-lg text-muted-foreground">
        I build interactive digital experiences where frontend engineering, motion, interface design
        and visual storytelling come together.
      </p>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {SKILLS.map(([group, items]) => (
          <div key={group} className="panel p-6">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-cyan">{group}</p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {items.map((s) => (
                <li key={s}>› {s}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Contact() {
  const links: [string, string][] = [
    ["GitHub", PROFILE_CONFIG.links.github],
    ["Instagram", PROFILE_CONFIG.links.instagram],
    ["Telegram", PROFILE_CONFIG.links.telegram],
  ];
  return (
    <section id="contact" className="mx-auto max-w-6xl px-5 py-20">
      <SectionTitle kicker="// contact" title="CONNECT WITH XT" />
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {links.map(([k, href]) => (
          <a
            key={k}
            href={href}
            target="_blank"
            rel="noreferrer"
            className="panel p-5 transition-colors hover:border-cyan"
          >
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-violet">{k}</p>
            <p className="mt-2 truncate font-mono text-sm text-foreground">{href}</p>
          </a>
        ))}
      </div>
      <p className="mt-14 text-center font-display text-lg text-gradient">
        Not here to compete. Here to be remembered.
      </p>
      <p className="mt-3 text-center font-mono text-xs text-muted-foreground">
        © {new Date().getFullYear()} XT — {PROFILE_CONFIG.name}
      </p>
    </section>
  );
}
