// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("@expo/metro-config");
const path = require("path");

// Find the project and workspace directories
const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// ── Monorepo support ────────────────────────────────────────────────────────
// Watch all files within the monorepo (packages, tooling, etc.)
config.watchFolders = [monorepoRoot];

// Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
];

// Force resolving nested modules to the versions installed in this project
config.resolver.disableHierarchicalLookup = true;

// ── Source extensions ───────────────────────────────────────────────────────
// Ensure Metro handles TypeScript and JSON from shared packages
config.resolver.sourceExts = [
  ...config.resolver.sourceExts,
  "mjs",
  "cjs",
];

module.exports = config;
