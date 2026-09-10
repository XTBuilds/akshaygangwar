import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { MessageCircle, X } from "lucide-react";
import mahiruMark from "@/assets/mahiru-mark.png";
import { Conversation, ConversationContent, ConversationScrollButton } from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { panel, presets, press } from "@/lib/motion";

const SUGGESTIONS = [
  "What does Akshay build?",
  "Show his most starred repos",
  "Which languages does he use most?",
  "How can I hire him?",
];

export function MahiruAssistant() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/chat" }), []);

  const { messages, sendMessage, status, stop } = useChat({
    id: "mahiru",
    transport,
    onError: (e) => setError(e.message || "Mahiru is unavailable right now."),
  });

  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => textareaRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [open, status]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const ask = (text: string) => {
    const t = text.trim();
    if (!t || busy) return;
    setError(null);
    void sendMessage({ text: t });
  };

  const onSubmit = (m: PromptInputMessage) => {
    ask(m.text ?? "");
  };

  return (
    <>
      <motion.button
        type="button"
        aria-label={open ? "Close Mahiru assistant" : "Open Mahiru assistant"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.06, y: -2 }}
        whileTap={press}
        transition={presets.ui}
        className="fixed bottom-5 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full holo-panel !rounded-full border-cyan/50 sm:bottom-8 sm:right-6"
      >
        {open ? (
          <X className="h-5 w-5 text-cyan" />
        ) : (
          <img src={mahiruMark} alt="" width={512} height={512} className="h-10 w-10" loading="lazy" />
        )}
        {!open && (
          <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-neon shadow-[0_0_10px_var(--neon)]" />
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.aside
            key="mahiru"
            role="dialog"
            aria-label="Mahiru AI assistant"
            variants={panel}
            initial="hidden"
            animate="show"
            exit="exit"
            className="fixed inset-x-3 bottom-40 z-40 flex max-h-[70vh] flex-col overflow-hidden holo-panel bg-background/85 sm:inset-x-auto sm:bottom-24 sm:right-6 sm:h-[600px] sm:max-h-[calc(100vh-8rem)] sm:w-[400px]"
          >
            <header className="flex items-center gap-3 border-b border-cyan/20 px-4 py-3">
              <img src={mahiruMark} alt="" width={512} height={512} className="h-9 w-9" loading="lazy" />
              <div className="min-w-0 flex-1">
                <p className="font-display text-sm tracking-[0.2em] text-gradient">MAHIRU</p>
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                  {busy ? "thinking" : "xt visitor assistant · online"}
                </p>
              </div>
              <span
                className={`h-2 w-2 rounded-full ${busy ? "bg-cyan animate-pulse" : "bg-neon"}`}
                aria-hidden
              />
            </header>

            <Conversation className="min-h-0 flex-1">
              <ConversationContent className="gap-5 px-4 py-4">
                {messages.length === 0 && (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Hi, I'm <span className="text-cyan">Mahiru</span>. Ask me anything about Akshay's
                      work — I answer from his live GitHub data and project list.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {SUGGESTIONS.map((s) => (
                        <button key={s} type="button" onClick={() => ask(s)} className="chip">
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {messages.map((m) => (
                  <Message key={m.id} from={m.role}>
                    <MessageContent
                      className={
                        m.role === "user"
                          ? "rounded-2xl bg-primary px-4 py-2.5 text-sm text-primary-foreground"
                          : "bg-transparent px-0 py-0 text-sm text-foreground"
                      }
                    >
                      {m.parts.map((part, i) =>
                        part.type === "text" ? (
                          <MessageResponse key={i}>{part.text}</MessageResponse>
                        ) : null,
                      )}
                    </MessageContent>
                  </Message>
                ))}
                {status === "submitted" && (
                  <Shimmer className="font-mono text-xs uppercase tracking-[0.25em]">
                    Mahiru is thinking...
                  </Shimmer>
                )}
                {error && (
                  <p role="alert" className="font-mono text-xs text-destructive">
                    ● {error}
                  </p>
                )}
              </ConversationContent>
              <ConversationScrollButton />
            </Conversation>

            <div className="border-t border-cyan/20 p-3">
              <PromptInput onSubmit={onSubmit} className="rounded-xl border-border bg-background/40">
                <PromptInputTextarea
                  ref={textareaRef}
                  placeholder="Ask Mahiru about repos, skills, hiring..."
                  className="min-h-[44px] text-sm"
                />
                <PromptInputFooter className="justify-end">
                  <PromptInputSubmit status={status} onStop={stop} size="icon-sm" />
                </PromptInputFooter>
              </PromptInput>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
