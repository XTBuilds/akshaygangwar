import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { ScrollVelocity } from "@/components/motion/ScrollVelocity";
import { CustomCursor } from "@/components/motion/CustomCursor";
import { usePointerField } from "@/hooks/usePointerField";
import { XTLoader } from "@/components/XTLoader";
import { CosmicBackdrop } from "@/components/CosmicBackdrop";
import { CommandOrb } from "@/components/CommandOrb";
import { RepoDrawer } from "@/components/RepoDrawer";
import { LifeStream } from "@/components/LifeStream";
import { BlogSection } from "@/components/BlogSection";
import { HireSection } from "@/components/HireSection";
import { Toaster } from "@/components/ui/sonner";
import type { GithubRepo } from "@/services/github";
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
  const [selected, setSelected] = useState<GithubRepo | null>(null);
  const [showFilters, setShowFilters] = useState(true);
  const [density, setDensity] = useState<"comfortable" | "dense">("comfortable");
  const { data, isLoading, errorMessage } = useGithub();
  usePointerField();

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
    <div className="min-h-screen">
      <CosmicBackdrop />
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
          <ScrollReveal>
            <CommandCenter />
          </ScrollReveal>
          <ScrollReveal>
            <FeaturedProjects onSelect={setSelected} />
          </ScrollReveal>
          <ScrollReveal>
            <RepositoryExplorer
              onSelect={setSelected}
              showFilters={showFilters}
              density={density}
            />
          </ScrollReveal>
          <ScrollReveal>
            <LifeStream />
          </ScrollReveal>
          <ScrollReveal>
            <TechnologyMatrix />
          </ScrollReveal>
          <ScrollReveal>
            <Activity />
          </ScrollReveal>
          <ScrollReveal>
            <BlogSection />
          </ScrollReveal>
          <ScrollReveal>
            <About />
          </ScrollReveal>
          <ScrollReveal>
            <HireSection />
          </ScrollReveal>
          <ScrollReveal>
            <Contact />
          </ScrollReveal>
        </main>
        <HUD />
        <CommandOrb
          onToggleFilters={() => setShowFilters((v) => !v)}
          density={density}
          onToggleDensity={() => setDensity((d) => (d === "dense" ? "comfortable" : "dense"))}
        />
        <RepoDrawer
          repo={selected}
          avatar={data?.profile.avatar_url}
          onClose={() => setSelected(null)}
        />
        <ScrollVelocity />
        <Toaster position="bottom-right" />
        <CustomCursor />
      </div>
    </div>
  );
}
