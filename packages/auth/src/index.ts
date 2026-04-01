import type { BetterAuthOptions, BetterAuthPlugin } from "better-auth";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { db } from "@stamina/db/client";
import * as schema from "@stamina/db/schema";

export function initAuth<
  TExtraPlugins extends BetterAuthPlugin[] = [],
>(options: {
  // baseUrl: string;
  secret: string | undefined;

  disableSignUps: string;

  googleClientId: string;
  googleClientSecret: string;
  extraPlugins?: TExtraPlugins;
}) {
  const config = {
    database: drizzleAdapter(db, {
      provider: "pg",
      schema,
    }),
    // baseURL: options.baseUrl,
    secret: options.secret,
    // plugins: [
    //   oAuthProxy({
    //     productionURL: options.baseUrl,
    //     currentURL: "expo://",
    //   }),
    //   expo(),
    //   ...(options.extraPlugins ?? []),
    // ],
    socialProviders: {
      google: {
        clientId: options.googleClientId,
        clientSecret: options.googleClientSecret,
        redirectURI: `http://localhost:3000/api/auth/callback/google`,
        disableImplicitSignUp: options.disableSignUps === "true",
      },
    },
    trustedOrigins: ["expo://"],
    onAPIError: {
      onError(error, ctx) {
        console.error("BETTER AUTH API ERROR", error, ctx);
      },
    },
  } satisfies BetterAuthOptions;

  return betterAuth(config);
}

export type Auth = ReturnType<typeof initAuth>;
export type Session = Auth["$Infer"]["Session"];
