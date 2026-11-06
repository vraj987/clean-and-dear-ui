declare const __APP_BUILD_ID__: string;

export function versionedAssetUrl(url: string | undefined) {
  if (!url) return "";
  const buildId =
    typeof __APP_BUILD_ID__ === "string"
      ? __APP_BUILD_ID__
      : import.meta.env["VITE_VERSION_CODE_ID"] || "1";
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}v=${encodeURIComponent(buildId)}`;
}
