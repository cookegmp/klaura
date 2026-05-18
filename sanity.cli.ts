import { defineCliConfig } from "sanity/cli";

/**
 * CLI configuration used by `sanity deploy`, `sanity dataset import`, etc.
 * Only relevant when a real Sanity project has been provisioned and the
 * NEXT_PUBLIC_SANITY_PROJECT_ID env is set.
 */
export default defineCliConfig({
  api: {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "placeholder",
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  },
});
