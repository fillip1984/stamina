"use client";

import { authClient } from "apps/stamina-web/src/server/auth/client";
import MainView from "apps/stamina-web/src/components/MainView";
import SignInView from "apps/stamina-web/src/components/SignInView";

export default function Home() {
  const { data: session } = authClient.useSession();

  if (!session) {
    return <SignInView />;
  } else {
    return <MainView />;
  }
}
