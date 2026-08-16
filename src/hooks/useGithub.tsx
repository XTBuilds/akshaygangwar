import { createContext, useContext, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchGithubData, GithubError, type GithubData } from "@/services/github";

type Ctx = {
  data: GithubData | undefined;
  isLoading: boolean;
  isFetching: boolean;
  errorMessage: string | null;
  refresh: () => void;
};

const GithubContext = createContext<Ctx | null>(null);

export function GithubProvider({ children }: { children: ReactNode }) {
  const query = useQuery({
    queryKey: ["github", "akshayxt"],
    queryFn: fetchGithubData,
    staleTime: 0,
    gcTime: 0,
    retry: 0,
    refetchOnWindowFocus: false,
  });

  const err = query.error;
  const errorMessage = err
    ? err instanceof GithubError
      ? err.message
      : "GITHUB SYNC FAILED"
    : null;

  return (
    <GithubContext.Provider
      value={{
        data: query.data,
        isLoading: query.isLoading,
        isFetching: query.isFetching,
        errorMessage,
        refresh: () => void query.refetch(),
      }}
    >
      {children}
    </GithubContext.Provider>
  );
}

export function useGithub() {
  const ctx = useContext(GithubContext);
  if (!ctx) throw new Error("useGithub must be used within GithubProvider");
  return ctx;
}
