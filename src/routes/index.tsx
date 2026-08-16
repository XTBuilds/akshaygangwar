import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { XTLoader } from "@/components/XTLoader";
import { Nav, Hero, Identity, Work, Stack, Proof, Contact } from "@/components/Sections";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AkshayXT — Developer, Creator, Problem Solver" },
      {
        name: "description",
        content:
          "Portfolio of Akshay Gangwar (AkshayXT): futuristic interfaces, interactive frontend systems and creative engineering with clean code.",
      },
      { property: "og:title", content: "AkshayXT — Developer, Creator, Problem Solver" },
      {
        property: "og:description",
        content:
          "Futuristic interfaces, interactive frontend systems and creative engineering by Akshay Gangwar.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [booted, setBooted] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {!booted && <XTLoader onDone={() => setBooted(true)} />}
      <div className={booted ? "animate-rise" : "invisible"}>
        <Nav />
        <main>
          <Hero />
          <Identity />
          <Work />
          <Stack />
          <Proof />
          <Contact />
        </main>
      </div>
    </div>
  );
}
