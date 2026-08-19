import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchBlogPosts, formatPostDate } from "@/services/content";

export function BlogSection({ limit = 3 }: { limit?: number }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["blog-posts"],
    queryFn: fetchBlogPosts,
    retry: 0,
  });
  const posts = (data ?? []).slice(0, limit);

  return (
    <section id="blog" className="mx-auto max-w-6xl px-5 py-16">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.4em] text-muted-foreground">
          // transmissions
        </p>
        <h2 className="mt-2 font-display text-3xl text-gradient sm:text-4xl">BLOG</h2>
        <div className="mt-3 h-px w-24 rule-brand" />
      </div>

      {isLoading ? (
        <p className="mt-8 font-mono text-sm text-muted-foreground">LOADING POSTS...</p>
      ) : error ? (
        <p className="mt-8 font-mono text-sm text-destructive">POST STREAM UNAVAILABLE</p>
      ) : posts.length === 0 ? (
        <p className="mt-8 font-mono text-sm text-muted-foreground">NO POSTS PUBLISHED YET.</p>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {posts.map((p) => (
            <article key={p.id} className="panel flex flex-col p-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-violet">
                {formatPostDate(p.published_at)}
              </p>
              <h3 className="mt-3 font-display text-lg leading-snug text-foreground">{p.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                {p.excerpt}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {p.tags.slice(0, 3).map((t) => (
                  <span key={t} className="chip">
                    #{t}
                  </span>
                ))}
              </div>
              {p.external_url ? (
                <a
                  href={p.external_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 font-mono text-xs uppercase tracking-[0.2em] text-cyan hover:text-violet"
                >
                  Read more →
                </a>
              ) : (
                <Link
                  to="/blog/$slug"
                  params={{ slug: p.slug }}
                  className="mt-5 font-mono text-xs uppercase tracking-[0.2em] text-cyan hover:text-violet"
                >
                  Read more →
                </Link>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
