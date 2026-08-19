import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Markdown } from "@/components/Markdown";
import { CosmicBackdrop } from "@/components/CosmicBackdrop";
import { fetchBlogPost, formatPostDate } from "@/services/content";

export const Route = createFileRoute("/blog/$slug")({
  head: () => ({
    meta: [
      { title: "Blog — Akshay Gangwar | XT BUILDS" },
      {
        name: "description",
        content:
          "Notes on creative frontend engineering, motion systems and building live GitHub-powered interfaces.",
      },
      { property: "og:title", content: "Blog — Akshay Gangwar | XT BUILDS" },
      {
        property: "og:description",
        content: "Writing by Akshay Gangwar on interfaces, motion and frontend engineering.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BlogPostPage,
});

function BlogPostPage() {
  const { slug } = Route.useParams();
  const { data, isLoading, error } = useQuery({
    queryKey: ["blog-post", slug],
    queryFn: () => fetchBlogPost(slug),
    retry: 0,
  });

  return (
    <div className="min-h-screen">
      <CosmicBackdrop />
      <main className="mx-auto max-w-3xl px-5 py-16">
        <Link
          to="/"
          className="font-mono text-xs uppercase tracking-[0.25em] text-cyan hover:text-violet"
        >
          ← Back to XT CORE
        </Link>
        {isLoading ? (
          <p className="mt-10 font-mono text-sm text-muted-foreground">LOADING POST...</p>
        ) : error ? (
          <p className="mt-10 font-mono text-sm text-destructive">POST STREAM UNAVAILABLE</p>
        ) : !data ? (
          <p className="mt-10 font-mono text-sm text-muted-foreground">POST NOT FOUND.</p>
        ) : (
          <article className="mt-8">
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-violet">
              {formatPostDate(data.published_at)}
            </p>
            <h1 className="mt-3 font-display text-3xl leading-tight text-gradient sm:text-4xl">
              {data.title}
            </h1>
            <div className="mt-4 flex flex-wrap gap-2">
              {data.tags.map((t) => (
                <span key={t} className="chip">
                  #{t}
                </span>
              ))}
            </div>
            <div className="panel mt-8 space-y-4 p-6">
              <Markdown source={data.content || data.excerpt} />
            </div>
          </article>
        )}
      </main>
    </div>
  );
}
