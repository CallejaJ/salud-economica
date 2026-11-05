/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",
  testPathIgnorePatterns: ["/node_modules/", "/.next/", "/out/", "/tests/e2e/"],
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        // Transpile without type checking so tests never block the build.
        tsconfig: {
          module: "commonjs",
          moduleResolution: "node",
          esModuleInterop: true,
        },
      },
    ],
  },
};
