import profileAsset from "@/assets/profile.png.asset.json";

const GH = "https://github.com/Akshayxt";

export function Nav() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <a href="#top" className="font-display text-lg tracking-widest text-gradient">
          &lt;/&gt; AKSHAYXT
        </a>
        <nav className="hidden gap-7 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground md:flex">
          <a href="#identity" className="hover:text-cyan">Identity</a>
          <a href="#work" className="hover:text-cyan">Work</a>
          <a href="#stack" className="hover:text-cyan">Stack</a>
          <a href="#proof" className="hover:text-cyan">Proof</a>
          <a href="#contact" className="hover:text-cyan">Contact</a>
        </nav>
        <a
          href={GH}
          target="_blank"
          rel="noreferrer"
          className="rounded-full border border-cyan/40 px-4 py-1.5 font-mono text-xs uppercase tracking-widest text-cyan transition-colors hover:bg-cyan/10"
        >
          GitHub
        </a>
      </div>
    </header>
  );
}

const CODE = [
  ["const", " developer = {"],
  ["  name:", ' "Akshay Gangwar",'],
  ["  passion:", ' "Code",'],
  ["  focus:", ' "Building Digital Experiences",'],
  ["  goal:", ' "Create Impact"'],
  ["};", ""],
];

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="pointer-events-none absolute -left-32 top-10 h-96 w-96 rounded-full bg-primary/20 blur-[120px]" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-accent/20 blur-[130px]" />

      <div className="relative mx-auto grid max-w-6xl gap-10 px-5 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:py-24">
        <div className="animate-rise">
          <p className="font-mono text-xs uppercase tracking-[0.45em] text-muted-foreground">
            Turning ideas into <span className="text-cyan caret">code</span>
          </p>
          <h1 className="mt-5 font-display text-5xl leading-[0.95] sm:text-7xl">
            <span className="block text-foreground">AKSHAY</span>
            <span className="block text-gradient">GANGWAR</span>
          </h1>
          <p className="mt-5 font-mono text-sm uppercase tracking-[0.3em] text-muted-foreground">
            Developer <span className="text-violet">•</span> Creator{" "}
            <span className="text-violet">•</span> Problem Solver
          </p>
          <div className="mt-4 h-px w-72 max-w-full rule-brand" />
          <p className="mt-6 max-w-lg border-l-2 border-primary pl-4 text-lg text-muted-foreground">
            Passionate about building modern, interactive and user-friendly digital experiences with{" "}
            <span className="text-cyan">clean code</span> and{" "}
            <span className="text-violet">creative solutions</span>.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#contact"
              className="rounded-md btn-brand px-6 py-3 font-mono text-xs uppercase tracking-[0.2em]"
            >
              Let&apos;s Build
            </a>
            <a
              href="#work"
              className="rounded-md border border-border px-6 py-3 font-mono text-xs uppercase tracking-[0.2em] text-foreground transition-colors hover:border-cyan hover:text-cyan"
            >
              Selected Work
            </a>
          </div>
        </div>

        <div className="animate-rise space-y-6" style={{ animationDelay: "120ms" }}>
          <div className="panel overflow-hidden">
            <div className="flex items-center gap-2 border-b border-border/60 px-4 py-2 font-mono text-xs text-muted-foreground">
              <span className="text-cyan">&lt;/&gt;</span> developer.ts
            </div>
            <pre className="overflow-x-auto p-4 font-mono text-xs leading-6 sm:text-sm">
              {CODE.map((l, i) => (
                <div key={i}>
                  <span className="mr-4 text-muted-foreground/50">{i + 1}</span>
                  <span className="text-violet">{l[0]}</span>
                  <span className="text-cyan">{l[1]}</span>
                </div>
              ))}
            </pre>
          </div>
          <div className="panel relative overflow-hidden">
            <img
              src={profileAsset.url}
              alt="Akshay Gangwar, developer and creator"
              className="h-[380px] w-full object-cover object-top"
              loading="lazy"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background to-transparent p-4">
              <p className="font-display text-sm tracking-widest text-cyan">AKSHAYXT</p>
              <p className="font-mono text-xs text-muted-foreground">
                &quot;Code is not just what I do, it&apos;s how I think.&quot;
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const STACK = [
  { n: "HTML", c: "#e34f26" },
  { n: "CSS", c: "#2965f1" },
  { n: "JavaScript", c: "#f7df1e" },
  { n: "React", c: "#61dafb", s: "Exploring" },
  { n: "Electron", c: "#9feaf9" },
  { n: "Python", c: "#3776ab" },
  { n: "TypeScript", c: "#3178c6" },
  { n: "C#", c: "#a179dc" },
  { n: "Git", c: "#f05032" },
  { n: "Figma", c: "#f24e1e" },
];

export function Stack() {
  return (
    <section id="stack" className="mx-auto max-w-6xl px-5 py-16">
      <SectionTitle kicker="// stack (focused)" title="TECH STACK" />
      <div className="panel mt-8 grid grid-cols-2 gap-px overflow-hidden bg-border/40 sm:grid-cols-3 lg:grid-cols-5">
        {STACK.map((t) => (
          <div
            key={t.n}
            className="group flex flex-col items-center gap-2 bg-card px-4 py-7 transition-colors hover:bg-secondary"
          >
            <span
              className="flex h-11 w-11 items-center justify-center rounded-lg font-display text-sm transition-transform group-hover:scale-110"
              style={{ background: `${t.c}22`, color: t.c, boxShadow: `0 0 24px -8px ${t.c}` }}
            >
              {t.n.slice(0, 2).toUpperCase()}
            </span>
            <span className="font-mono text-xs text-foreground">{t.n}</span>
            {t.s && <span className="font-mono text-[10px] text-muted-foreground">({t.s})</span>}
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-4 font-mono text-sm sm:grid-cols-3">
        {[
          ["Frontend", "HTML · CSS · JavaScript"],
          ["Tools", "Git · Figma"],
          ["Next", "React · Motion Systems"],
        ].map(([k, v]) => (
          <div key={k} className="panel p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan">{k}</p>
            <p className="mt-2 text-muted-foreground">{v}</p>
          </div>
        ))}
      </div>
    </section>
  );
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

export function Identity() {
  return (
    <section id="identity" className="mx-auto max-w-6xl px-5 py-16">
      <SectionTitle kicker="// identity" title="NOT WEBSITES — EXPERIENCES" />
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[
          ["Experiences that hold attention", "I don't build \"websites\". I build interfaces people remember."],
          ["Intentional interfaces", "Every pixel, motion curve and state has a reason to exist."],
          ["Work that lasts", "Not here to compete. Here to be remembered."],
        ].map(([t, d]) => (
          <div key={t} className="panel p-6 transition-transform hover:-translate-y-1">
            <h3 className="font-display text-base text-cyan">{t}</h3>
            <p className="mt-3 text-muted-foreground">{d}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          ["CLEAN CODE", "Scalable & Maintainable"],
          ["PERFORMANCE", "Optimized & Fast"],
          ["RESPONSIVE", "Mobile First Approach"],
          ["CREATIVE UI", "Design Meets Functionality"],
          ["PROBLEM SOLVER", "Turning Challenges into Solutions"],
        ].map(([t, d]) => (
          <div key={t} className="panel p-4">
            <p className="font-mono text-xs tracking-[0.2em] text-violet">{t}</p>
            <p className="mt-1 text-sm text-muted-foreground">{d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Work() {
  const items = [
    {
      t: "UI Experiment",
      q: "Built to hook attention instantly",
      d: "Motion-driven interface studies exploring depth, particles and micro-interaction timing.",
      tags: ["JavaScript", "Canvas", "Motion"],
    },
    {
      t: "Landing Experience",
      q: "Smooth. Fast. Designed to convert",
      d: "A high-performance landing system with cinematic scroll choreography and tight typography.",
      tags: ["HTML", "CSS", "UX"],
    },
  ];
  return (
    <section id="work" className="mx-auto max-w-6xl px-5 py-16">
      <SectionTitle kicker="// selected work" title="PROJECTS" />
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {items.map((p) => (
          <article key={p.t} className="panel group overflow-hidden">
            <div className="relative h-52 overflow-hidden grid-bg">
              <div className="absolute inset-0 bg-[var(--gradient-core)]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="animate-pulse-ring rounded-full border border-cyan/40 p-10 font-display text-xl text-cyan">
                  XT
                </span>
              </div>
            </div>
            <div className="p-6">
              <h3 className="font-display text-lg text-foreground">{p.t}</h3>
              <p className="mt-1 border-l-2 border-cyan pl-3 font-mono text-xs text-cyan">{p.q}</p>
              <p className="mt-3 text-muted-foreground">{p.d}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {p.tags.map((tg) => (
                  <span
                    key={tg}
                    className="rounded-full border border-border px-3 py-1 font-mono text-[11px] text-muted-foreground"
                  >
                    {tg}
                  </span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="panel mt-8 p-6">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-cyan">// current direction</p>
        <ul className="mt-4 grid gap-2 text-muted-foreground sm:grid-cols-3">
          <li>› Advanced UI animation systems</li>
          <li>› Portfolio-grade projects</li>
          <li>› Creative frontend engineering</li>
        </ul>
      </div>
    </section>
  );
}

export function Proof() {
  return (
    <section id="proof" className="mx-auto max-w-6xl px-5 py-16">
      <SectionTitle kicker="// proof" title="GITHUB ACTIVITY" />
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="panel overflow-hidden p-4">
          <img
            src="https://github-readme-stats.vercel.app/api?username=Akshayxt&show_icons=true&theme=radical&hide_border=true&bg_color=00000000"
            alt="Akshayxt GitHub stats"
            className="w-full"
            loading="lazy"
          />
        </div>
        <div className="panel overflow-hidden p-4">
          <img
            src="https://github-readme-streak-stats.herokuapp.com/?user=Akshayxt&theme=radical&hide_border=true&background=00000000"
            alt="Akshayxt GitHub contribution streak"
            className="w-full"
            loading="lazy"
          />
        </div>
        <div className="panel overflow-hidden p-4 lg:col-span-2">
          <img
            src="https://github-readme-stats.vercel.app/api/top-langs/?username=Akshayxt&layout=compact&theme=radical&hide_border=true&bg_color=00000000"
            alt="Akshayxt most used languages"
            className="mx-auto w-full max-w-md"
            loading="lazy"
          />
        </div>
      </div>
      <p className="mt-4 text-center font-mono text-xs text-muted-foreground">
        Live data from{" "}
        <a href={GH} target="_blank" rel="noreferrer" className="text-cyan underline">
          github.com/Akshayxt
        </a>
      </p>
    </section>
  );
}

export function Contact() {
  const links = [
    ["GitHub", "AKSHAYXT", GH],
    ["LinkedIn", "/IN/AKSHAYXT", "https://www.linkedin.com/in/akshayxt"],
    ["Telegram", "@AKSHAY_XT", "https://t.me/akshay_xt"],
    ["Email", "AKSHAYXT.DEV@GMAIL.COM", "mailto:akshayxt.dev@gmail.com"],
  ];
  return (
    <section id="contact" className="relative mx-auto max-w-6xl px-5 py-20">
      <SectionTitle kicker="// contact" title="LET'S BUILD SOMETHING AMAZING" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {links.map(([k, v, href]) => (
          <a
            key={k}
            href={href}
            target="_blank"
            rel="noreferrer"
            className="panel p-5 transition-colors hover:border-cyan"
          >
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-violet">{k}</p>
            <p className="mt-2 truncate font-mono text-sm text-foreground">{v}</p>
          </a>
        ))}
      </div>
      <p className="mt-14 text-center font-display text-lg text-gradient">
        Not here to compete. Here to be remembered.
      </p>
      <p className="mt-3 text-center font-mono text-xs text-muted-foreground">
        © {new Date().getFullYear()} AkshayXT — Built with clean code.
      </p>
    </section>
  );
}
