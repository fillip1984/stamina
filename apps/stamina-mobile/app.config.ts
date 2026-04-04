import type { ConfigContext, ExpoConfig } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "stamina",
  slug: "stamina",
  scheme: "expo",
  version: "0.1.0",
  orientation: "portrait",
  icon: "./src/assets/images/logo.png",
  userInterfaceStyle: "automatic",
  updates: {
    fallbackToCacheTimeout: 0,
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    bundleIdentifier: "com.fillip1984.stamina",
    supportsTablet: true,
    icon: {
      light: "./src/assets/images/logo.png",
      dark: "./src/assets/images/logo.png",
    },
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  experiments: {
    tsconfigPaths: true,
    typedRoutes: true,
    reactCompiler: true,
  },
  plugins: [
    "expo-router",
    "expo-secure-store",
    "expo-web-browser",
    [
      "expo-splash-screen",
      {
        backgroundColor: "#E4E4E7",
        image: "./src/assets/images/logo.png",
        dark: {
          backgroundColor: "#18181B",
          image: "./src/assets/images/logo.png",
        },
      },
    ],
  ],
  extra: {
    eas: {
      projectId: "e0d276b6-3409-49e4-a7d4-381f6b952aad",
    },
  },
});
