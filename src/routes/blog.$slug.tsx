import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Markdown } from "@/components/Markdown";
import { CosmicBackdrop } from "@/components/CosmicBackdrop";
import { fetchBlogPost } from "@/services/content";

export const Route = createFileRoute("/blog/$slug")({
  head: () => ({
    meta: [
      { title: "Blog Entry — XT BUILDS | Akshay Gangwar" },
      {
        name: "description",
        content:
          "A transmission log entry from Akshay Gangwar (XT BUILDS) on frontend engineering, motion and interface systems.",
      },
      { property: "og:title", content: "Blog Entry — XT BUILDS" },
      {
        property: "og:description",
        content: "Notes on frontend engineering, motion and futuristic interface design.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BlogPostPage,
});

function BlogPostPage() {
  const { slug } = Route.useParams();
  const post = useQuery({
    queryKey: ["blog-post", slug],
    queryFn: () => fetchBlogPost(slug),
    retry: 0,
  });

  return (
    <div className="min-h-screen">
      <CosmicBackdrop />
      <main className="mx-auto max-w-3xl px-5 py-16">
        <Link to="/" className="portal-link">
          ← Back to XT CORE
        </Link>
        {post.isLoading ? (
          <p className="mt-10 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            LOADING ENTRY...
          </p>
        ) : !post.data ? (
          <p className="mt-10 font-mono text-xs uppercase tracking-[0.2em] text-destructive">
            ● ENTRY NOT FOUND.
          </p>
        ) : (
          <article className="mt-8">
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-violet">
              {post.data.published_at
                ? new Date(post.data.published_at).toLocaleDateString()
                : "UNPUBLISHED"}
            </p>
            <h1 className="mt-3 font-display text-3xl text-gradient sm:text-4xl">
              {post.data.title}
            </h1>
            <div className="mt-4 h-px w-24 rule-brand" />
            {post.data.cover_url && (
              <img
                src={post.data.cover_url}
                alt={post.data.title}
                className="mt-8 w-full rounded-2xl border border-border"
              />
            )}
            <div className="holo-panel mt-8 space-y-3 p-6">
              <Markdown source={post.data.content ?? post.data.excerpt ?? ""} />
            </div>
          </article>
        )}
      </main>
    </div>
  );
}
