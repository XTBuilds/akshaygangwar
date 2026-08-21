import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { fetchBlogPosts } from "@/services/content";

export function BlogSection() {
  const posts = useQuery({ queryKey: ["blog-posts"], queryFn: fetchBlogPosts, retry: 0 });
  const list = posts.data ?? [];

  return (
    <section id="blog" className="mx-auto max-w-6xl px-5 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.4em] text-muted-foreground">
        // transmission log
      </p>
      <h2 className="mt-2 font-display text-3xl text-gradient sm:text-4xl">BLOG</h2>
      <div className="mt-3 h-px w-24 rule-brand" />

      {posts.isLoading ? (
        <p className="mt-8 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          LOADING ENTRIES...
        </p>
      ) : list.length === 0 ? (
        <p className="mt-8 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          ● NO ENTRIES PUBLISHED YET.
        </p>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {list.map((p) => (
            <Link
              key={p.id}
              to="/blog/$slug"
              params={{ slug: p.slug }}
              className="holo-panel block p-5 transition-transform duration-500 hover:-translate-y-1"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-violet">
                {p.published_at ? new Date(p.published_at).toLocaleDateString() : "DRAFT"}
              </p>
              <h3 className="mt-2 font-display text-lg text-foreground">{p.title}</h3>
              <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{p.excerpt ?? ""}</p>
              <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.2em] text-cyan">
                Read entry →
              </p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
