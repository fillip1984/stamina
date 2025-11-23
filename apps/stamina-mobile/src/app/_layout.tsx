import * as Network from "expo-network";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  focusManager,
  onlineManager,
  QueryClientProvider,
} from "@tanstack/react-query";

import "react-native-reanimated";
import "~/styles/global.css";

import { useEffect, useState } from "react";
import {
  AppState,
  AppStateStatus,
  Platform,
  useWindowDimensions,
} from "react-native";

import TopNav from "~/components/topNav";
import { AppContextProvider } from "~/contexts/AppContext";
import { queryClient } from "~/utils/api";
import { authClient } from "~/utils/auth";

export default function RootLayout() {
  const { height } = useWindowDimensions();

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
    setIsLoggedIn(!!session?.user);
  }, [session]);

  return (
    <QueryClientProvider client={queryClient}>
      <AppContextProvider>
        <Stack
          screenOptions={{
            header(props) {
              return isLoggedIn ? <TopNav stackProps={props} /> : null;
            },
          }}
        >
          <Stack.Screen name="+not-found" />
          <Stack.Screen name="index" />

          <Stack.Protected guard={isLoggedIn}>
            <Stack.Screen name="areas/index" />
            <Stack.Screen
              name="areas/[id]"
              options={{
                presentation: "formSheet",
                sheetAllowedDetents: height > 700 ? [0.5] : "fitToContents",
                sheetGrabberVisible: false,
                sheetCornerRadius: 10,
                headerShown: false,
                sheetExpandsWhenScrolledToEdge: false,
              }}
            />
            <Stack.Screen name="results/index" />
          </Stack.Protected>
        </Stack>
      </AppContextProvider>
      <StatusBar style="light" />
    </QueryClientProvider>
  );
}
