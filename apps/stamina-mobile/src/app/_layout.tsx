import * as Network from "expo-network";
import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  focusManager,
  onlineManager,
  QueryClientProvider,
} from "@tanstack/react-query";

import "react-native-reanimated";
import "~/styles/global.css";

import { useEffect, useState } from "react";
import { AppState, AppStateStatus, Platform } from "react-native";

import { queryClient } from "~/utils/api";
import { authClient } from "~/utils/auth";

export default function RootLayout() {
  // refetch when network connection is restored
  onlineManager.setEventListener((setOnline) => {
    const eventSubscription = Network.addNetworkStateListener((state) => {
      setOnline(!!state.isConnected);
    });
    return () => eventSubscription.remove();
  });

  // refetch when app is made active again
  function onAppStateChange(status: AppStateStatus) {
    if (Platform.OS !== "web") {
      focusManager.setFocused(status === "active");
    }
  }
  useEffect(() => {
    const subscription = AppState.addEventListener("change", onAppStateChange);
    return () => subscription.remove();
  }, []);

  //auth
  const { data: session } = authClient.useSession();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    console.log({ session, settingLoggedIn: !!session?.user });
    const newState = !!session?.user;

    setIsLoggedIn(!!session?.user);
    if (newState) {
      router.replace("/");
    }
  }, [session]);

  return (
    <QueryClientProvider client={queryClient}>
      <Stack>
        <Stack.Protected guard={isLoggedIn}>
          <Stack.Screen
            name="index"
            options={{ title: "Main", headerShown: false }}
          />
        </Stack.Protected>

        {/* <Stack.Screen name="+not-found" /> */}
        <Stack.Screen
          name="social-sign-in"
          options={{
            title: "Social Sign In",
            headerShown: false,
          }}
        />
      </Stack>
      <StatusBar style="light" />
    </QueryClientProvider>
  );
}
