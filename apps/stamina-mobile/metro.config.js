// Learn more: https://docs.expo.dev/guides/monorepos/
const { getDefaultConfig } = require("expo/metro-config");
const { withNativewind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// required for better-auth (2025-11-22)
config.resolver.unstable_enablePackageExports = true;

/** @type {import('expo/metro-config').MetroConfig} */
module.exports = withNativewind(config);
