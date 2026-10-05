export type ApiAccount = Record<string, string | null | undefined>;
export type AccountType = "customer" | "vendor" | "employee";
export type AuthSession = {
  accountType: AccountType;
  accountId: string;
  mobile: string;
  name: string;
  authToken: string;
  account: ApiAccount;
  verifiedAt: string;
};

export type BannerRecord = {
  banner_id: string;
  banner_name: string;
  banner_image: string;
  banner_priority: string;
  banner_image_url: string;
};
export type BrandRecord = {
  brand_id: string;
  brand_name: string;
  brand_image: string;
  brand_image_url: string;
};
export type CategoryRecord = {
  category_id: string;
  category_name: string;
  category_image: string;
  category_image_url: string;
};
export type ModelRecord = {
  model_id: string;
  model_name: string;
  model_image: string;
  model_image_url: string;
};
export type PackageRecord = {
  package_id: string;
  package_name: string;
  package_percentage: string;
  package_description?: string;
  package_image_url?: string;
};
export type ProductPackageQuote = {
  package_id: string;
  package_name: string;
  package_percentage: string;
  buyback_amount: string;
  package_price: string;
};
export type SubscriptionProduct = {
  product_id: string;
  product_variant: string;
  launch_date?: string;
  original_price?: string;
  invoice_date?: string;
  months_elapsed?: string | number;
  purchase_price?: string;
  base_resale_amount?: string;
  packages: ProductPackageQuote[];
};
export type StateRecord = { state_id: string; state_name: string };
export type CityRecord = { city_id: string; city_name: string; state_id: string };
