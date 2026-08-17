import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  fetchRepoCommitSeries,
  fetchRepoReadme,
  formatDate,
  readmeSnippet,
  type CommitPoint,
  type GithubRepo,
} from "@/services/github";

const PORTALS = ["Code", "Issues", "Pulls", "Actions", "Security", "Insights"] as const;
const PORTAL_PATH: Record<(typeof PORTALS)[number], string> = {
  Code: "",
  Issues: "/issues",
  Pulls: "/pulls",
  Actions: "/actions",
  Security: "/security",
  Insights: "/pulse",
};

function Sparkline({ points }: { points: CommitPoint[] }) {
  if (points.length < 2) {
    return (
      <p className="font-mono text-xs text-muted-foreground">NOT ENOUGH COMMIT DATA</p>
    );
  }
  const w = 460;
  const h = 120;
  const max = Math.max(...points.map((p) => p.count));
  const step = w / (points.length - 1);
  const coords = points.map((p, i) => [i * step, h - (p.count / max) * (h - 16) - 8] as const);
  const line = coords.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} L${w},${h} L0,${h} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img" aria-label="Commit activity">
      <defs>
        <linearGradient id="xt-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--cyan)" stopOpacity="0.45" />
          <stop offset="100%" stopColor="var(--cyan)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="xt-line" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--cyan)" />
          <stop offset="100%" stopColor="var(--violet)" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#xt-area)" />
      <path d={line} fill="none" stroke="url(#xt-line)" strokeWidth="2.5" strokeLinejoin="round" />
      {coords.map(([x, y], i) => (
        <g key={points[i]!.date} className="group">
          <circle cx={x} cy={y} r="8" fill="transparent" />
          <circle cx={x} cy={y} r="2.5" fill="var(--cyan)" />
          <title>{`${points[i]!.date} · ${points[i]!.count} commits · ${points[i]!.message ?? ""}`}</title>
        </g>
      ))}
    </svg>
  );
}

export function RepoDrawer({
  repo,
  avatar,
  onClose,
}: {
  repo: GithubRepo | null;
  avatar?: string | undefined;
  onClose: () => void;
}) {
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, [onClose]);

  const readme = useQuery({
    queryKey: ["readme", repo?.full_name],
    queryFn: () => fetchRepoReadme(repo!),
    enabled: Boolean(repo),
    retry: 0,
  });
  const commits = useQuery({
    queryKey: ["commits", repo?.full_name],
    queryFn: () => fetchRepoCommitSeries(repo!),
    enabled: Boolean(repo),
    retry: 0,
  });

  const open = Boolean(repo);

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden
        className={`fixed inset-0 z-40 bg-background/60 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        aria-label="Repository details"
        aria-hidden={!open}
        className={`holo-drawer fixed right-0 top-0 z-50 flex h-dvh w-full max-w-md flex-col overflow-y-auto p-6 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          open ? "translate-x-0" : "pointer-events-none translate-x-full"
        }`}
      >
        {repo && (
          <>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                {avatar && (
                  <img
                    src={avatar}
                    alt=""
                    className="h-11 w-11 rounded-full border border-cyan/40 animate-pulse-ring"
                  />
                )}
                <div>
                  <h3 className="font-display text-lg text-gradient">{repo.name}</h3>
                  <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-cyan">
                    ● LAST COMMIT {formatDate(repo.pushed_at)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-border px-3 py-1 font-mono text-xs text-muted-foreground hover:border-cyan hover:text-cyan"
              >
                ESC
              </button>
            </div>

            <p className="mt-5 text-sm text-muted-foreground">
              {repo.description || "No description provided."}
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {repo.language && <span className="chip chip-on">{repo.language}</span>}
              {repo.topics.map((t) => (
                <span key={t} className="chip">
                  #{t}
                </span>
              ))}
              <span className="chip">{repo.license ? `⚜ ${repo.license}` : "⚜ NO LICENSE"}</span>
            </div>

            <div className="panel mt-6 p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-violet">
                README STREAM
              </p>
              <p className="mt-3 text-sm leading-relaxed text-cyan/90 [text-shadow:0_0_18px_var(--cyan)]">
                {readme.isLoading
                  ? "DECODING README..."
                  : readmeSnippet(readme.data ?? "") || "NO README FOUND IN THIS REPOSITORY."}
              </p>
            </div>

            <div className="panel mt-4 p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-violet">
                COMMIT ACTIVITY
              </p>
              <div className="mt-3">
                {commits.isLoading ? (
                  <p className="font-mono text-xs text-muted-foreground">SCANNING COMMITS...</p>
                ) : commits.error ? (
                  <p className="font-mono text-xs text-destructive">COMMIT STREAM UNAVAILABLE</p>
                ) : (
                  <Sparkline points={commits.data ?? []} />
                )}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              {PORTALS.map((p) => (
                <a
                  key={p}
                  href={`${repo.html_url}${PORTAL_PATH[p]}`}
                  target="_blank"
                  rel="noreferrer"
                  className="portal-link text-center"
                >
                  {p}
                </a>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 font-mono text-[11px] text-muted-foreground">
              <div className="panel p-3">★ {repo.stargazers_count} stars</div>
              <div className="panel p-3">⑂ {repo.forks_count} forks</div>
              <div className="panel p-3">◎ {repo.open_issues_count} issues</div>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
