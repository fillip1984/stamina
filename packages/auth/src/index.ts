import type { BetterAuthOptions } from "better-auth";
import { expo } from "@better-auth/expo";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { oAuthProxy } from "better-auth/plugins";

import { db } from "@stamina/db";

export function initAuth(options: {
  baseUrl: string;
  secret: string | undefined;

  // githubClientId: string;
  // githubClientSecret: string;

  googleClientId: string;
  googleClientSecret: string;
}) {
  const config = {
    database: prismaAdapter(db, {
      provider: "postgresql",
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
        clientId: options.googleClientId,
        clientSecret: options.googleClientSecret,
        redirectURI: `${options.baseUrl}/api/auth/callback/google`,
        disableImplicitSignUp: true,
      },
    },
    trustedOrigins: ["stamina://", "expo://"],
  } satisfies BetterAuthOptions;

  return betterAuth(config);
}

export type Auth = ReturnType<typeof initAuth>;
export type Session = Auth["$Infer"]["Session"];
