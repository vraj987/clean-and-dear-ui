import { useQuery } from "@tanstack/react-query";
import { apiConfig, setRuntimeCompanyId } from "./config";
import { getApi } from "./client";
import { apiQueryKeys } from "./query-keys";
import type { CompanyDetailsRecord } from "./models";

const COMPANY_DETAILS_CID = "45841";

export async function getCompanyDetails() {
  const response = await getApi<CompanyDetailsRecord[]>("companyDetails", {
    cid: COMPANY_DETAILS_CID,
  });
  setRuntimeCompanyId(response.result?.[0]?.company_id);
  return response;
}

export function useCompanyDetails() {
  return useQuery({
    queryKey: apiQueryKeys.companyDetails,
    queryFn: getCompanyDetails,
    staleTime: 30 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function resolveCompanyLogoUrl(filename?: string | null) {
  const file = filename?.trim();
  if (!file) return "";
  if (/^(?:https?:)?\/\//i.test(file) || file.startsWith("data:")) return file;

  const configuredLogo = import.meta.env["VITE_LOGO_URL"] || "";
  try {
    if (configuredLogo) {
      const configured = new URL(configuredLogo);
      const marker = "/uploads/logo/";
      const markerAt = configured.pathname.toLowerCase().lastIndexOf(marker);
      if (markerAt >= 0) {
        return `${configured.origin}${configured.pathname.slice(0, markerAt)}${marker}${file.replace(/^\//, "")}`;
      }
    }
    const api = new URL(apiConfig.baseUrl);
    const apiPath = api.pathname.replace(/\/?v1\/?$/i, "");
    return `${api.origin}${apiPath}/uploads/logo/${file.replace(/^\//, "")}`;
  } catch {
    return file;
  }
}

export function normalizeCompanyWebUrl(value?: string | null) {
  const url = value?.trim();
  if (!url) return "";
  const candidate = /^https?:\/\//i.test(url) ? url : `https://${url}`;
  try {
    const parsed = new URL(candidate);
    return parsed.protocol === "https:" || parsed.protocol === "http:" ? parsed.toString() : "";
  } catch {
    return "";
  }
}

export function companyPolicyContent(company: CompanyDetailsRecord | undefined, slug: string) {
  if (slug === "privacy-policy") return company?.company_privacy_policy?.trim() ?? "";
  if (slug === "terms-of-use") return company?.company_terms_and_condition?.trim() ?? "";
  if (slug === "cancellation-refund") return company?.company_cancellation_and_refund?.trim() ?? "";
  if (slug === "shipping-policy") return company?.company_shipping_policy?.trim() ?? "";
  return "";
}
