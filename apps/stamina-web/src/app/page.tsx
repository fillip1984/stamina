"use client";

import { authClient } from "~/auth/client";
import MainView from "~/components/MainView";
import SignInView from "~/components/SignInView";

export default function Home() {
  const { data: session } = authClient.useSession();

  if (!session) {
    return <SignInView />;
  } else {
    return <MainView />;
  }
}
