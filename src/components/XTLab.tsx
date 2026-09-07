import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { TiltCard } from "@/components/motion/TiltCard";
import { useGithub } from "@/hooks/useGithub";
import { formatDate, labRepos, repoSlug, type GithubRepo } from "@/services/github";
import { fadeUp, revealParent, viewport } from "@/lib/motion";

/** Bento spans — first two cells are hero-sized. */
const SPANS = [
  "sm:col-span-2 sm:row-span-2",
  "sm:col-span-2",
  "",
  "",
  "sm:col-span-2",
  "",
  "",
];

function LabCard({ repo, span }: { repo: GithubRepo; span: string }) {
  const big = span.includes("row-span-2");
  return (
    <motion.div variants={fadeUp} className={span}>
      <TiltCard className="holo-panel group flex h-full flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="truncate font-display text-base text-foreground" title={repo.name}>
            {repo.name}
          </h3>
          <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.25em] text-cyan">
            {repo.language ?? "lab"}
          </span>
        </div>
        <p
          className={`mt-3 text-sm text-muted-foreground ${big ? "line-clamp-6" : "line-clamp-3"}`}
        >
          {repo.description || "An experimental build from the XT lab."}
        </p>
        {big && repo.topics.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {repo.topics.slice(0, 6).map((t) => (
              <span
                key={t}
                className="rounded-full border border-cyan/25 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-cyan/80"
              >
                {t}
              </span>
            ))}
          </div>
        )}
        <div className="mt-auto pt-5">
          <div className="flex flex-wrap gap-3 font-mono text-[11px] text-muted-foreground">
            <span className="text-foreground">★ {repo.stargazers_count}</span>
            <span>⑂ {repo.forks_count}</span>
            <span>{formatDate(repo.pushed_at)}</span>
          </div>
          <Link
            to="/work/$slug"
            params={{ slug: repoSlug(repo.name) }}
            className="mt-4 inline-block rounded-md btn-brand px-4 py-2 font-mono text-[11px] uppercase tracking-[0.2em]"
          >
            Open Case File
          </Link>
        </div>
      </TiltCard>
    </motion.div>
  );
}

export function XTLab() {
  const { data, isLoading, errorMessage } = useGithub();
  const builds = data ? labRepos(data.repos, SPANS.length) : [];

  return (
    <section id="lab" className="mx-auto max-w-6xl px-5 py-16">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.4em] text-muted-foreground">
          // experimental builds, live from github
        </p>
        <h2 className="mt-2 font-display text-3xl text-gradient sm:text-4xl">XT LAB</h2>
        <div className="mt-3 h-px w-24 rule-brand" />
      </div>

      {errorMessage ? (
        <p className="mt-8 font-mono text-sm text-destructive">LAB FEED OFFLINE</p>
      ) : isLoading ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-xl bg-muted/40" />
          ))}
        </div>
      ) : builds.length === 0 ? (
        <p className="mt-8 font-mono text-sm text-muted-foreground">NO EXPERIMENTS INDEXED</p>
      ) : (
        <motion.div
          variants={revealParent}
          initial="hidden"
          whileInView="show"
          viewport={viewport}
          className="mt-8 grid auto-rows-[minmax(170px,auto)] gap-4 sm:grid-cols-4"
        >
          {builds.map((r, i) => (
            <LabCard key={r.id} repo={r} span={SPANS[i] ?? ""} />
          ))}
        </motion.div>
      )}
    </section>
  );
}
