import { Fragment, type ReactNode } from "react";

/** Inline markdown: code, bold, italic, links. */
function inline(src: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*]+\*|_[^_]+_)|(\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(src))) {
    if (m.index > last) out.push(src.slice(last, m.index));
    const token = m[0];
    const key = `${keyBase}-${i++}`;
    if (token.startsWith("`")) {
      out.push(
        <code key={key} className="rounded bg-cyan/10 px-1 py-0.5 font-mono text-[12px] text-cyan">
          {token.slice(1, -1)}
        </code>,
      );
    } else if (token.startsWith("**")) {
      out.push(
        <strong key={key} className="text-foreground">
          {token.slice(2, -2)}
        </strong>,
      );
    } else if (token.startsWith("[")) {
      const label = token.slice(1, token.indexOf("]"));
      const href = token.slice(token.indexOf("](") + 2, -1);
      out.push(
        <a
          key={key}
          href={href}
          target="_blank"
          rel="noreferrer"
          className="text-cyan underline underline-offset-4 hover:text-violet"
        >
          {label}
        </a>,
      );
    } else {
      out.push(
        <em key={key} className="italic">
          {token.slice(1, -1)}
        </em>,
      );
    }
    last = m.index + token.length;
  }
  if (last < src.length) out.push(src.slice(last));
  return out;
}

/** Minimal, dependency-free markdown renderer for README content. */
export function Markdown({ source }: { source: string }) {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let list: string[] = [];
  let code: string[] | null = null;

  const flushList = (key: string) => {
    if (!list.length) return;
    blocks.push(
      <ul key={key} className="ml-4 list-disc space-y-1 text-sm text-muted-foreground">
        {list.map((li, i) => (
          <li key={`${key}-${i}`}>{inline(li, `${key}-${i}`)}</li>
        ))}
      </ul>,
    );
    list = [];
  };

  lines.forEach((raw, idx) => {
    const key = `md-${idx}`;
    const line = raw.trimEnd();

    if (line.trim().startsWith("```")) {
      if (code) {
        blocks.push(
          <pre
            key={key}
            className="overflow-x-auto rounded-lg border border-border/70 bg-background/60 p-3 font-mono text-[11px] leading-relaxed text-cyan/90"
          >
            <code>{code.join("\n")}</code>
          </pre>,
        );
        code = null;
      } else {
        flushList(`${key}-l`);
        code = [];
      }
      return;
    }
    if (code) {
      code.push(raw);
      return;
    }

    const heading = /^(#{1,6})\s+(.*)$/.exec(line);
    if (heading) {
      flushList(`${key}-l`);
      const level = heading[1]!.length;
      const text = heading[2]!;
      blocks.push(
        level <= 2 ? (
          <h4 key={key} className="mt-2 font-display text-sm tracking-wide text-gradient">
            {inline(text, key)}
          </h4>
        ) : (
          <h5 key={key} className="mt-1 font-mono text-[11px] uppercase tracking-[0.2em] text-violet">
            {inline(text, key)}
          </h5>
        ),
      );
      return;
    }

    if (/^\s*([-*+]|\d+\.)\s+/.test(line)) {
      list.push(line.replace(/^\s*([-*+]|\d+\.)\s+/, ""));
      return;
    }

    if (!line.trim()) {
      flushList(`${key}-l`);
      return;
    }

    if (/^\s*(<[^>]+>|\|)/.test(line)) return; // skip raw HTML / tables

    flushList(`${key}-l`);
    blocks.push(
      <p key={key} className="text-sm leading-relaxed text-muted-foreground">
        {inline(line, key)}
      </p>,
    );
  });
  flushList("md-tail");

  if (code) {
    blocks.push(
      <pre
        key="md-code-tail"
        className="overflow-x-auto rounded-lg border border-border/70 bg-background/60 p-3 font-mono text-[11px] text-cyan/90"
      >
        <code>{(code as string[]).join("\n")}</code>
      </pre>,
    );
  }

  return <Fragment>{blocks}</Fragment>;
}
