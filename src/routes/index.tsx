import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { XTLoader } from "@/components/XTLoader";
import { HUD } from "@/components/HUD";
import { GithubProvider, useGithub } from "@/hooks/useGithub";
import {
  Nav,
  Hero,
  CommandCenter,
  FeaturedProjects,
  RepositoryExplorer,
  TechnologyMatrix,
  Activity,
  About,
  Contact,
} from "@/components/XTSections";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Akshay Gangwar — Creative Frontend Engineer | XT" },
      {
        name: "description",
        content:
          "Akshay Gangwar — Creative Frontend Engineer building interactive digital experiences, futuristic interfaces and creative web systems.",
      },
      { property: "og:title", content: "Akshay Gangwar — Creative Frontend Engineer | XT" },
      {
        property: "og:description",
        content:
          "Live GitHub-powered portfolio of Akshay Gangwar (@akshayxt): interactive interfaces, futuristic web systems and creative frontend engineering.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <GithubProvider>
      <XTCore />
    </GithubProvider>
  ),
});

function XTCore() {
  const [booted, setBooted] = useState(false);
  const { data, isLoading, errorMessage } = useGithub();

  const status = [
    "INITIALIZING XT CORE...",
    "LOADING DIGITAL ENVIRONMENT...",
    "CONNECTING TO GITHUB...",
    "AUTHENTICATING AKSHAYXT...",
    "FETCHING PUBLIC REPOSITORIES...",
  ];
  if (data) {
    status.push(
      `FOUND ${data.repos.length} PUBLIC REPOSITORIES`,
      "INDEXING PROJECTS...",
      "ANALYZING LANGUAGES...",
      "GITHUB CORE SYNCHRONIZED",
      "SYSTEM READY",
    );
  } else if (errorMessage) {
    status.push(errorMessage, "GITHUB SYNC FAILED", "CONTINUING IN OFFLINE MODE");
  }

  return (
    <div className="min-h-screen bg-background">
      {!booted && (
        <XTLoader
          onDone={() => setBooted(true)}
          statusLines={status}
          ready={!isLoading}
        />
      )}
      <div className={booted ? "animate-rise" : "invisible"}>
        <Nav />
        <main>
          <Hero />
          <CommandCenter />
          <FeaturedProjects />
          <RepositoryExplorer />
          <TechnologyMatrix />
          <Activity />
          <About />
          <Contact />
        </main>
        <HUD />
      </div>
    </div>
  );
}
