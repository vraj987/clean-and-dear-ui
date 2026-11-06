export type PackageTheme = {
  surface: string;
  idle: string;
  accent: string;
  foreground: string;
  gradient: string;
  ctaSurface: string;
  ctaForeground: string;
  ctaBorder: string;
};

export const packageCtaClassName =
  "min-h-12 rounded-full border px-5 font-bold shadow-[0_8px_20px_rgba(11,42,85,0.16)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_26px_rgba(11,42,85,0.24)] disabled:opacity-80";

const packageTierOrder: Record<string, number> = {
  silver: 0,
  gold: 1,
  platinum: 2,
};

export function sortPackagesByTier<T extends { package_name: string }>(packages: readonly T[]) {
  return [...packages].sort((a, b) => {
    const aTier = packageTierOrder[a.package_name.trim().toLowerCase()] ?? Number.MAX_SAFE_INTEGER;
    const bTier = packageTierOrder[b.package_name.trim().toLowerCase()] ?? Number.MAX_SAFE_INTEGER;
    return aTier - bTier;
  });
}

export function getPackageCtaStyle(theme: PackageTheme) {
  return {
    backgroundColor: theme.ctaSurface,
    borderColor: theme.ctaBorder,
    color: theme.ctaForeground,
  };
}

const packageThemes: Record<string, PackageTheme> = {
  silver: {
    surface: "#09AEB4",
    idle: "#F8FAFC",
    accent: "#FFFFFF",
    foreground: "#FFFFFF",
    gradient: "linear-gradient(110deg, #12BEC1 0%, #078D96 100%)",
    ctaSurface: "#FFFFFF",
    ctaForeground: "#087F86",
    ctaBorder: "rgba(255,255,255,.72)",
  },
  gold: {
    surface: "#FFFDF0",
    idle: "#F8F0D2",
    accent: "#FFFFFF",
    foreground: "#FFFFFF",
    gradient: "linear-gradient(135deg, #FFB63D 0%, #FF8A26 52%, #F47722 100%)",
    ctaSurface: "#0B2A55",
    ctaForeground: "#FFFFFF",
    ctaBorder: "rgba(255,255,255,.5)",
  },
  platinum: {
    surface: "#7F59BE",
    idle: "#F8FAFC",
    accent: "#FFFFFF",
    foreground: "#FFFFFF",
    gradient: "linear-gradient(110deg, #9A78D0 0%, #7F59BE 52%, #623A9E 100%)",
    ctaSurface: "#FFFFFF",
    ctaForeground: "#7048AE",
    ctaBorder: "rgba(255,255,255,.72)",
  },
};

const fallbackTheme: PackageTheme = {
  surface: "#F8FAFC",
  idle: "#FAFAF8",
  accent: "#64748B",
  foreground: "#0B2A55",
  gradient: "linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 42%, #E2E8F0 72%, #FFFFFF 100%)",
  ctaSurface: "#0B2A55",
  ctaForeground: "#FFFFFF",
  ctaBorder: "#0B2A55",
};

export function getPackageTheme(name: string): PackageTheme {
  return packageThemes[name.trim().toLowerCase()] ?? fallbackTheme;
}

export function getPackageSurface(name: string, fallback?: string) {
  const normalized = name.trim().toLowerCase();
  if (normalized === "silver") return "rgb(250 251 253)";
  if (normalized === "gold") return "#F8F0D2";
  if (normalized === "platinum") return "rgb(7 16 30)";
  return fallback ?? getPackageTheme(name).surface;
}
