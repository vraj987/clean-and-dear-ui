export const apiQueryKeys = {
  banners: ["api", "banners"] as const,
  brands: ["api", "brands"] as const,
  categories: ["api", "categories"] as const,
  packages: ["api", "packages"] as const,
  faqs: ["api", "faqs"] as const,
  partners: ["api", "partners"] as const,
  companyDetails: ["api", "company-details", "45841"] as const,
  models: (brandId: string) => ["api", "models", brandId] as const,
  allModels: ["api", "models", "all"] as const,
  offers: (userId: string) => ["api", "offers", userId] as const,
  cart: (userId: string) => ["api", "cart", userId] as const,
  products: (userId: string, query: Record<string, string>) =>
    ["api", "products", userId, query] as const,
  productVariants: (brandId: string, modelId: string) =>
    ["api", "product-variants", brandId, modelId] as const,
};
