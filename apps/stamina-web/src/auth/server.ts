import "server-only";

import { cache } from "react";
import { headers } from "next/headers";

import { initAuth } from "@stamina/auth";

import { env } from "~/env";

const baseUrl =
  env.NODE_ENV === "production" && env.PRODUCTION_URL
    ? env.PRODUCTION_URL
    : "http://localhost:3000";

export const auth = initAuth({
  baseUrl,
  secret: env.AUTH_SECRET,
  disableSignUps: env.AUTH_DISABLE_SIGN_UPS,
  googleClientId: env.AUTH_GOOGLE_ID,
  googleClientSecret: env.AUTH_GOOGLE_SECRET,
});

export const getSession = cache(async () =>
  auth.api.getSession({ headers: await headers() }),
);
