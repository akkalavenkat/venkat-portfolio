import type { Config } from "jest";

const config: Config = {
  testEnvironment: "node",
  roots: ["<rootDir>/__tests__"],
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: {
          // Jest needs CommonJS + classic Node resolution.
          // These two settings override the Next.js-specific
          // "module: esnext" and "moduleResolution: bundler" in tsconfig.json.
          module: "CommonJS",
          moduleResolution: "Node",
          esModuleInterop: true,
        },
      },
    ],
  },
  moduleNameMapper: {
    // Mirror the "@/*" path alias from tsconfig.json
    "^@/(.*)$": "<rootDir>/$1",
  },
  collectCoverageFrom: [
    "app/lib/**/*.{ts,tsx}",
    "app/api/**/*.{ts,tsx}",
    "app/data/**/*.{ts,tsx}",
    "!**/node_modules/**",
    "!**/.next/**",
    "!app/components/**",
  ],
  coverageReporters: ["text", "lcov"],
};

export default config;
