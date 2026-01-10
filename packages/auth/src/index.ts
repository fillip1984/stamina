import type { BetterAuthOptions } from "better-auth";
import { expo } from "@better-auth/expo";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { oAuthProxy } from "better-auth/plugins";

import { db } from "@stamina/db/client";

export function initAuth(options: {
  baseUrl: string;
  secret: string | undefined;
  disableSignUps: string | undefined;

  // githubClientId: string;
  // githubClientSecret: string;

  googleClientId: string;
  googleClientSecret: string;
}) {
  const config = {
    database: drizzleAdapter(db, {
      provider: "pg",
    }),
    baseURL: options.baseUrl,
    secret: options.secret,
    plugins: [
      oAuthProxy({
        /**
         * Auto-inference blocked by https://github.com/better-auth/better-auth/pull/2891
         */
        currentURL: options.baseUrl,
        productionURL: options.baseUrl,
      }),
      expo(),
    ],
    socialProviders: {
      // github: {
      // clientId: options.githubClientId,
      // clientSecret: options.githubClientSecret,
      // redirectURI: `${options.productionUrl}/api/auth/callback/github`,
      // },
      google: {
        disableImplicitSignUp: options.disableSignUps === "true" ? true : false,
        clientId: options.googleClientId,
        clientSecret: options.googleClientSecret,
        redirectURI: `${options.baseUrl}/api/auth/callback/google`,
      },
    },
    trustedOrigins: ["stamina://", "expo://"],
  } satisfies BetterAuthOptions;

  return betterAuth(config);
}

export type Auth = ReturnType<typeof initAuth>;
export type Session = Auth["$Infer"]["Session"];
