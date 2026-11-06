const allowedTags = new Set([
  "p", "br", "hr", "h1", "h2", "h3", "h4", "strong", "b", "em", "i", "u",
  "ul", "ol", "li", "blockquote", "figure", "table", "thead", "tbody", "tr", "th", "td", "a",
]);
const voidTags = new Set(["br", "hr"]);

function sanitizeHtml(value: string) {
  const withoutActiveContent = value
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style|iframe|object|embed|svg|math|template)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, "")
    .replace(/<(script|style|iframe|object|embed|svg|math|template)\b[^>]*\/?>/gi, "");

  return withoutActiveContent.replace(/<\/?([a-z][\w-]*)\b([^>]*)>/gi, (tag, rawName: string, attributes: string) => {
    const name = rawName.toLowerCase();
    if (!allowedTags.has(name)) return "";
    const closing = /^<\//.test(tag);
    if (closing) return voidTags.has(name) ? "" : `</${name}>`;
    if (name !== "a") return `<${name}>`;

    const hrefMatch = attributes.match(/\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    const href = (hrefMatch?.[1] ?? hrefMatch?.[2] ?? hrefMatch?.[3] ?? "").replace(/&amp;/gi, "&").trim();
    if (!href || !/^(https?:|mailto:|\/|#)/i.test(href) || /^\/\//.test(href)) return "<a>";
    const safeHref = href.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
    return `<a href="${safeHref}" target="_blank" rel="noopener noreferrer">`;
  });
}

export function SafeRichHtml({ html, className = "" }: { html: string; className?: string }) {
  if (!html.trim()) return null;
  return <div className={className} dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }} />;
}
