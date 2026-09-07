import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CosmicBackdrop } from "@/components/CosmicBackdrop";
import { Markdown } from "@/components/Markdown";
import {
  PROFILE_CONFIG,
  fetchGithubRepositories,
  fetchRepoReadme,
  findRepoBySlug,
  formatDate,
} from "@/services/github";

export const Route = createFileRoute("/work/$slug")({
  head: ({ params }) => {
    const title = `${params.slug} — Case File | XT BUILDS`;
    return {
      meta: [
        { title },
        {
          name: "description",
          content: `Case file for ${params.slug}, a build by Akshay Gangwar — stack, activity, README and live links.`,
        },
        { property: "og:title", content: title },
        {
          property: "og:description",
          content: `Deep dive into ${params.slug}: what it is, how it is built and where to see it live.`,
        },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: WorkDetail,
});

function WorkDetail() {
  const { slug } = Route.useParams();
  const repos = useQuery({
    queryKey: ["github", "repos"],
    queryFn: fetchGithubRepositories,
    retry: 0,
  });
  const repo = repos.data ? findRepoBySlug(repos.data, slug) : null;

  const readme = useQuery({
    queryKey: ["readme", repo?.full_name],
    queryFn: () => fetchRepoReadme(repo!),
    enabled: Boolean(repo),
    retry: 0,
  });

  return (
    <div className="min-h-screen">
      <CosmicBackdrop />
      <main className="mx-auto max-w-4xl px-5 py-16">
        <Link to="/" className="portal-link">
          ← Back to XT CORE
        </Link>

        {repos.isLoading ? (
          <p className="mt-10 font-mono text-sm text-muted-foreground">LOADING CASE FILE...</p>
        ) : !repo ? (
          <div className="mt-10">
            <h1 className="font-display text-3xl text-gradient">CASE FILE NOT FOUND</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              No build matches “{slug}”. Browse everything on{" "}
              <a href={PROFILE_CONFIG.links.github} target="_blank" rel="noreferrer" className="portal-link">
                GitHub
              </a>
              .
            </p>
          </div>
        ) : (
          <>
            <header className="mt-8">
              <p className="font-mono text-xs uppercase tracking-[0.4em] text-cyan">
                ● live from github · last commit {formatDate(repo.pushed_at)}
              </p>
              <h1 className="mt-2 font-display text-4xl text-gradient">{repo.name}</h1>
              <div className="mt-3 h-px w-24 rule-brand" />
              <p className="mt-5 text-muted-foreground">
                {repo.description || "No description provided."}
              </p>
            </header>

            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                ["Stars", repo.stargazers_count],
                ["Forks", repo.forks_count],
                ["Issues", repo.open_issues_count],
                ["Watchers", repo.watchers_count],
              ].map(([label, value]) => (
                <div key={String(label)} className="holo-panel p-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                    {label}
                  </p>
                  <p className="mt-1 font-display text-2xl text-foreground">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-3 font-mono text-[11px] text-muted-foreground">
              {repo.language && <span className="text-cyan">{repo.language}</span>}
              {repo.license && <span>{repo.license}</span>}
              <span>created {formatDate(repo.created_at)}</span>
              <span>branch {repo.default_branch}</span>
            </div>

            {repo.topics.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {repo.topics.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-cyan/25 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-cyan/80"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-7 flex flex-wrap gap-3">
              <a href={repo.html_url} target="_blank" rel="noreferrer" className="portal-link">
                View Source
              </a>
              {repo.homepage && (
                <a href={repo.homepage} target="_blank" rel="noreferrer" className="portal-link">
                  Live Demo
                </a>
              )}
              <Link to="/projects" className="portal-link">
                All Projects
              </Link>
            </div>

            <section className="mt-12">
              <h2 className="font-display text-xl text-gradient">README</h2>
              <div className="mt-4 holo-panel p-5">
                {readme.isLoading ? (
                  <p className="font-mono text-sm text-muted-foreground">STREAMING README...</p>
                ) : readme.data ? (
                  <Markdown source={readme.data} />
                ) : (
                  <p className="font-mono text-sm text-muted-foreground">NO README AVAILABLE</p>
                )}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
