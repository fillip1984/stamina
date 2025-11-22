// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");
const { withNativewind } = require("nativewind/metro");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// required for better-auth (2025-11-22)
config.resolver.unstable_enablePackageExports = true;

module.exports = withNativewind(config);
