import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CosmicBackdrop } from "@/components/CosmicBackdrop";
import { fetchProjects } from "@/services/content";
import { GithubProvider, useGithub } from "@/hooks/useGithub";
import { featuredRepos, formatDate } from "@/services/github";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Projects — Akshay Gangwar | XT BUILDS" },
      {
        name: "description",
        content:
          "Selected projects and live GitHub repositories by Akshay Gangwar — interactive interfaces, motion systems and creative frontend engineering.",
      },
      { property: "og:title", content: "Projects — Akshay Gangwar | XT BUILDS" },
      {
        property: "og:description",
        content: "Curated builds plus live GitHub repositories from @akshayxt.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <GithubProvider>
      <ProjectsPage />
    </GithubProvider>
  ),
});

function ProjectsPage() {
  const curated = useQuery({ queryKey: ["projects"], queryFn: fetchProjects, retry: 0 });
  const { data } = useGithub();
  const repos = data ? featuredRepos(data.repos) : [];
  const list = curated.data ?? [];

  return (
    <div className="min-h-screen">
      <CosmicBackdrop />
      <main className="mx-auto max-w-6xl px-5 py-16">
        <Link to="/" className="portal-link">
          ← Back to XT CORE
        </Link>
        <h1 className="mt-8 font-display text-4xl text-gradient">PROJECTS</h1>
        <div className="mt-3 h-px w-24 rule-brand" />

        {list.length > 0 && (
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {list.map((p) => (
              <div key={p.id} className="holo-panel p-5">
                <h2 className="font-display text-lg text-foreground">{p.name}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{p.description}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(p.tech_stack ?? []).map((t) => (
                    <span key={t} className="chip">
                      {t}
                    </span>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {p.repo_url && (
                    <a href={p.repo_url} target="_blank" rel="noreferrer" className="portal-link">
                      Repository
                    </a>
                  )}
                  {p.live_url && (
                    <a href={p.live_url} target="_blank" rel="noreferrer" className="portal-link">
                      Live
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <h2 className="mt-16 font-display text-2xl text-gradient">LIVE GITHUB REPOSITORIES</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {repos.map((r) => (
            <a
              key={r.id}
              href={r.html_url}
              target="_blank"
              rel="noreferrer"
              className="holo-panel block p-5 transition-transform duration-500 hover:-translate-y-1"
            >
              <h3 className="font-display text-base text-foreground">{r.name}</h3>
              <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                {r.description || "No description provided."}
              </p>
              <p className="mt-4 font-mono text-[11px] text-muted-foreground">
                ★ {r.stargazers_count} · {formatDate(r.updated_at)}
              </p>
            </a>
          ))}
        </div>
      </main>
    </div>
  );
}
