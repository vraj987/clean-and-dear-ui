export type PageSocialMetadata = {
  title: string;
  description: string;
  image: string;
  url: string;
  siteName: string;
  type?: "website" | "product";
};

function setMeta(attribute: "name" | "property", key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.content = content;
}

export function toAbsolutePageUrl(value: string) {
  try {
    return new URL(value, window.location.origin).href;
  } catch {
    return window.location.href;
  }
}

export function setPageSocialMetadata(metadata: PageSocialMetadata) {
  const image = toAbsolutePageUrl(metadata.image);
  const url = toAbsolutePageUrl(metadata.url);
  document.title = metadata.title;
  setMeta("name", "description", metadata.description);
  setMeta("name", "author", metadata.siteName);
  setMeta("property", "og:type", metadata.type ?? "website");
  setMeta("property", "og:site_name", metadata.siteName);
  setMeta("property", "og:title", metadata.title);
  setMeta("property", "og:description", metadata.description);
  setMeta("property", "og:image", image);
  setMeta("property", "og:image:alt", metadata.title);
  setMeta("property", "og:url", url);
  setMeta("name", "twitter:card", "summary_large_image");
  setMeta("name", "twitter:title", metadata.title);
  setMeta("name", "twitter:description", metadata.description);
  setMeta("name", "twitter:image", image);

  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.appendChild(canonical);
  }
  canonical.href = url;
}
