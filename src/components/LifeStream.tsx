import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getInstagramFeed } from "@/lib/instagram.functions";

const IG_USER = "raxx_xt";
const IG_URL = `https://instagram.com/${IG_USER}`;

/**
 * Instagram Life Stream — renders the real @raxx_xt feed (Graph API when a
 * token is configured, otherwise the posts stored in the backend).
 */
export function LifeStream() {
  const load = useServerFn(getInstagramFeed);
  const feed = useQuery({
    queryKey: ["instagram", IG_USER],
    queryFn: () => load(),
    staleTime: 5 * 60 * 1000,
    retry: 0,
  });

  const posts = feed.data?.posts ?? [];

  return (
    <section id="stream" className="mx-auto max-w-6xl px-5 py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.4em] text-muted-foreground">
            // life stream
          </p>
          <h2 className="mt-2 font-display text-3xl text-gradient sm:text-4xl">
            INSTAGRAM @{IG_USER.toUpperCase()}
          </h2>
          <div className="mt-3 h-px w-24 rule-brand" />
        </div>
        <a href={IG_URL} target="_blank" rel="noreferrer" className="portal-link">
          Open profile →
        </a>
      </div>

      {feed.isLoading ? (
        <p className="mt-8 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          STREAMING LATEST POSTS...
        </p>
      ) : posts.length === 0 ? (
        <p className="mt-8 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          ● NO POSTS SYNCED YET — connect the Instagram feed or add posts in the backend.
        </p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {posts.map((p, i) => (
            <a
              key={p.id}
              href={p.permalink}
              target="_blank"
              rel="noreferrer"
              className="holo-panel group flex h-64 flex-col justify-end overflow-hidden p-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-2"
            >
              {p.media_url ? (
                <img
                  src={p.media_url}
                  alt={p.caption?.slice(0, 90) || `Instagram post ${i + 1} by @${IG_USER}`}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover opacity-70 transition-opacity duration-500 group-hover:opacity-100"
                />
              ) : null}
              <div className="relative z-[1] w-full bg-gradient-to-t from-background via-background/80 to-transparent p-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-violet">
                  {new Date(p.posted_at).toLocaleDateString()}
                </p>
                <p className="mt-1 line-clamp-2 text-sm text-foreground">
                  {p.caption?.trim() || "View on Instagram"}
                </p>
              </div>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
