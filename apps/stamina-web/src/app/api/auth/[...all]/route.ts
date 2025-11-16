import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "apps/stamina-web/src/server/auth/server";

export const { POST, GET } = toNextJsHandler(auth);
