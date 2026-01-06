// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

config.resolver.blockList = [
  // Exclude problematic paths from being watched
  /\/android\/.*/,
  /\/ios\/.*/,
];

config.resolver.extraNodeModules = {
  // Add any missing modules here
  "react-is": require.resolve("react-is"),
};

module.exports = config;
