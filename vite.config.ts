import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  // pragmatic-drag-and-drop ships ESM subpath dirs that Node's SSR resolver
  // can't import (ERR_UNSUPPORTED_DIR_IMPORT); bundle it into the SSR build.
  ssr: {
    noExternal: ["@atlaskit/pragmatic-drag-and-drop"],
  },
  plugins: [
    tsconfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tanstackStart({
      srcDirectory: "app",
      spa: {
        enabled: true,
        prerender: {
          outputPath: "/_shell",
          crawlLinks: false,
        },
      },
      prerender: {
        enabled: true,
        autoStaticPathsDiscovery: false,
        crawlLinks: false,
      },
      // Self-hosted: no marketing pages to prerender. "/" is a client redirect
      // to the dashboard and is served by the SPA shell.
      pages: [],
    }),
    viteReact(),
  ],
});
