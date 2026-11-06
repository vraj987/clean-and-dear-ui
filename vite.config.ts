// vite.config.ts
import path from "node:path";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { loadEnv, type OutputBundle, type Plugin } from "vite";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const appBuildId = Date.now().toString(36);

const hostingerStaticEntry: Plugin = {
  name: "hostinger-static-entry",
  apply: "build",
  async writeBundle(outputOptions, bundle: OutputBundle) {
    const outputDirectory = outputOptions.dir;
    const normalizedOutputDirectory = outputDirectory
      ? path.resolve(outputDirectory).split(path.sep).join("/").toLowerCase()
      : "";
    if (!normalizedOutputDirectory.endsWith("/dist/client")) return;

    const entryChunk = Object.values(bundle).find(
      (item) => item.type === "chunk" && item.isEntry,
    );
    if (!entryChunk || entryChunk.type !== "chunk") {
      throw new Error("Could not find the browser entry chunk for the static Hostinger build.");
    }

    const env = loadEnv("production", projectRoot, "VITE_");
    const basePath = env["VITE_BASE_PATH"] || "/";
    const assetUrl = (fileName: string) => `${basePath}${fileName.replace(/^\//, "")}`;
    const stylesheets = Object.values(bundle)
      .filter((item) => item.type === "asset" && item.fileName.endsWith(".css"))
      .map((item) => `    <link rel="stylesheet" href="${assetUrl(item.fileName)}" />`)
      .join("\n");
    const faviconUrl = env["VITE_FAV_ICON_URL"] || `${basePath}favicon.svg`;
    const faviconWithBuildId = `${faviconUrl}${faviconUrl.includes("?") ? "&" : "?"}v=${appBuildId}`;
    const title = env["VITE_PROJECT_NAME"] || "Kimaat Lock";
    const description = "Aaj phone lo, kal ki kimmat fix karo. Check your phone’s month-wise selling price and choose a Kavach plan with Kimaat Lock.";
    const logoUrl = env["VITE_LOGO_URL"] || faviconUrl;
    let siteUrl = basePath;
    try {
      const origin = env["VITE_API_URL"] ? new URL(env["VITE_API_URL"]).origin : "";
      if (origin) siteUrl = new URL(basePath, origin).href;
    } catch {
      // Keep the configured base path as a fallback when no valid API origin is set.
    }
    const escapeHtml = (value: string) => value
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    const organizationJsonLd = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: title,
      url: siteUrl,
      logo: logoUrl,
    }).replace(/</g, "\\u003c");
    const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#ffffff" />
    <meta name="author" content="${escapeHtml(title)}" />
    <meta name="description" content="${escapeHtml(description)}" />
    <link rel="canonical" href="${escapeHtml(siteUrl)}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${escapeHtml(title)}" />
    <meta property="og:title" content="${escapeHtml(`${title} — Aaj phone lo, kal ki kimmat fix karo`)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${escapeHtml(siteUrl)}" />
    <meta property="og:image" content="${escapeHtml(logoUrl)}" />
    <meta property="og:image:alt" content="${escapeHtml(`${title} logo`)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(`${title} — Aaj phone lo, kal ki kimmat fix karo`)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${escapeHtml(logoUrl)}" />
    <title>${escapeHtml(`${title} — Aaj phone lo, kal ki kimmat fix karo`)}</title>
    <link rel="icon" href="${faviconWithBuildId}" />
    <script type="application/ld+json">${organizationJsonLd}</script>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap" />
${stylesheets}
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="${assetUrl(entryChunk.fileName)}"></script>
  </body>
</html>
`;

    await mkdir(outputDirectory!, { recursive: true });
    await writeFile(path.join(outputDirectory!, "index.html"), html, "utf8");

    const precacheAssets = Object.values(bundle)
      .filter((item) => item.type === "chunk" || item.fileName.endsWith(".css") || item.fileName.endsWith(".svg") || item.fileName.endsWith(".ico"))
      .map((item) => item.fileName)
      .filter((fileName) => !fileName.endsWith(".mjs"));
    const serviceWorkerTemplate = await readFile(path.join(projectRoot, "public", "sw.js"), "utf8");
    const serviceWorker = serviceWorkerTemplate
      .replace("__APP_BUILD_ID__", appBuildId)
      .replace("__PRECACHE_ASSETS__", JSON.stringify(precacheAssets));
    await writeFile(path.join(outputDirectory!, "sw.js"), serviceWorker, "utf8");
  },
};

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

// `vite preview` does not automatically mount a subpath build's app shell at
// its configured base URL. Serve the static entry for the base path and
// extension-less client routes so local production previews behave like the
// Hostinger `.htaccess` deployment.
const previewSpaFallback: Plugin = {
  name: "preview-subpath-spa-fallback",
  configurePreviewServer(server) {
    const env = loadEnv("production", projectRoot, "VITE_");
    const basePath = env["VITE_BASE_PATH"] || "/";
    const normalizedBasePath = `/${basePath.split("/").filter(Boolean).join("/")}${basePath.endsWith("/") ? "/" : ""}`;
    const baseWithoutTrailingSlash = normalizedBasePath.replace(/\/$/, "");

    server.middlewares.use((request, _response, next) => {
      const requestUrl = request.url || "/";
      const pathname = new URL(requestUrl, "http://localhost").pathname;
      const isBaseRoute = pathname === baseWithoutTrailingSlash || pathname === normalizedBasePath;
      const isSubpathRoute = pathname.startsWith(normalizedBasePath) && !/\.[^/]+$/.test(pathname);

      if (isBaseRoute || isSubpathRoute) {
        const search = requestUrl.includes("?") ? requestUrl.slice(requestUrl.indexOf("?")) : "";
        request.url = `${normalizedBasePath}index.html${search}`;
      }
      next();
    });
  },
};

export default defineConfig({
  // This site is a browser-rendered React app that talks to PHP APIs.
  // Skip Nitro/server output so npm run build produces static files for Hostinger.
  nitro: false,
  vite: {
    define: { __APP_BUILD_ID__: JSON.stringify(appBuildId) },
    plugins: [basePathFromEnv, hostingerStaticEntry, previewSpaFallback],
    build: { outDir: "dist" },
    resolve: { alias: { "@": path.resolve(projectRoot, "src") } },
  },
  tanstackStart: {
    client: { entry: "client" },
  },
});
