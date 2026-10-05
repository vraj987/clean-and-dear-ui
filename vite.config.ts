import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { loadEnv, type Plugin } from "vite";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const basePathFromEnv: Plugin = {
  name: "base-path-from-vite-env",
  config(_config, { mode }) {
    const env = loadEnv(mode, projectRoot, "VITE_");
    const apiUrl = env["VITE_API_URL"];
    const api = apiUrl ? new URL(apiUrl) : null;
    const apiPath = api?.pathname.endsWith("/") ? api.pathname : `${api?.pathname ?? ""}/`;
    return {
      base: env["VITE_BASE_PATH"] || "/",
      ...(api && {
        server: {
          proxy: {
            "/api": {
              target: api.origin,
              changeOrigin: true,
              rewrite: (requestPath: string) => `${apiPath}${requestPath.replace(/^\/api\/?/, "")}`,
            },
          },
        },
      }),
    };
  },
};

export default defineConfig({
  vite: {
    plugins: [basePathFromEnv],
    build: { outDir: "dist" },
    resolve: { alias: { "@": path.resolve(projectRoot, "src") } },
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
