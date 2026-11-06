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
  banner_type?: string;
  banner_product_id?: string | null;
};
export type BrandRecord = {
  brand_id: string;
  brand_name: string;
  brand_image: string;
  brand_image_url: string;
};
export type CategoryRecord = {
  category_id: string;
  product_category_id?: string;
  category_name: string;
  category_image?: string | null;
  category_image_url?: string | null;
  priority?: string;
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
export type FaqRecord = {
  faq_id: string;
  faq_title: string;
  faq_description: string;
  c_date_formatted?: string;
};
export type PartnerRecord = {
  partner_id: string;
  partner_name: string;
  partner_image?: string;
  partner_image_url?: string;
  partner_url?: string;
  partner_priority?: string;
};
export type ProductPackageQuote = {
  package_id: string;
  package_name: string;
  package_percentage: string;
  total_depreciation_pct?: string;
  depreciation_amount?: string;
  buyback_amount: string;
  package_price: string;
};
export type ProductVariantRecord = {
  product_id: string;
  product_variant: string;
  mrp?: string;
  retailer_price?: string;
  product_image?: string;
  product_image_url?: string;
  product_images?: string | string[];
  reference_id?: string;
  is_main?: number | string;
};
export type SubscriptionProduct = {
  product_id: string;
  product_type?: string | number;
  brand_id?: string;
  model_id?: string;
  product_variant: string;
  wishlist_id?: string | null;
  pro_name?: string;
  short_description?: string | null;
  long_description?: string | null;
  product_image?: string;
  product_image_url?: string;
  product_images?: string;
  product_images_url?: string;
  brand_name?: string;
  model_name?: string;
  category_name?: string;
  model_image?: string;
  model_image_url?: string;
  launch_date?: string;
  original_price?: string;
  mrp?: string;
  retailer_price?: string;
  retailer_price_monthly?: string;
  invoice_date?: string;
  months_elapsed?: string | number;
  purchase_price?: string;
  base_resale_amount?: string;
  packages?: ProductPackageQuote[];
  product_varient?: ProductVariantRecord[];
};
export type OfferProductListRecord = {
  offer_id: string;
  offer_name: string;
  offer_product_id_arr?: Array<string | number> | null;
  offer_product_ids?: string | null;
  offer_start_date?: string;
  offer_end_date?: string;
  offer_priority?: string;
  products?: SubscriptionProduct[];
};
export type StateRecord = { state_id: string; state_name: string };
export type CityRecord = { city_id: string; city_name: string; state_id: string };
export type CompanyDetailsRecord = {
  company_id: string;
  company_setting_id?: string;
  company_name?: string | null;
  company_favicon?: string | null;
  company_header_logo?: string | null;
  company_login_logo?: string | null;
  company_email?: string | null;
  company_website?: string | null;
  company_mobile?: string | null;
  company_landline?: string | null;
  company_address?: string | null;
  facebook_url?: string | null;
  instagram_url?: string | null;
  youtube_url?: string | null;
  company_terms_and_condition?: string | null;
  company_privacy_policy?: string | null;
  company_cancellation_and_refund?: string | null;
  company_shipping_policy?: string | null;
  company_about_us?: string | null;
};
