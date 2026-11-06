import { postApi } from "./client";
import type { FaqRecord } from "./models";
import { unwrapApiResult } from "./response";

export async function getFaqs(values: {
  faq_id?: string;
  search?: string;
  limit?: string | number;
  offset?: string | number;
} = {}) {
  return unwrapApiResult(
    await postApi<FaqRecord[]>("faqs", {
      faq_id: values.faq_id ?? "",
      search: values.search ?? "",
      limit: values.limit ?? "",
      offset: values.offset ?? "",
    }),
  );
}
