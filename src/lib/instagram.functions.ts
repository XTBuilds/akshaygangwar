import { createServerFn } from "@tanstack/react-start";
import { loadInstagramFeed } from "./instagram.server";

/**
 * Returns the real @raxx_xt feed. Uses the Instagram Graph API when
 * INSTAGRAM_ACCESS_TOKEN is configured, otherwise the curated posts stored
 * in the database.
 */
export const getInstagramFeed = createServerFn({ method: "GET" }).handler(async () => {
  return loadInstagramFeed();
});
