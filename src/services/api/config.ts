const baseUrl = import.meta.env["VITE_API_URL"] || "";

export const apiConfig = {
  baseUrl: baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`,
  companyId: import.meta.env["VITE_COMPANY_ID"] || "",
  projectName: import.meta.env["VITE_PROJECT_NAME"] || "Kimaat Lock",
  versionCode: import.meta.env["VITE_VERSION_CODE_ID"] || "1.0.0.1",
  razorpayKeyId: import.meta.env["VITE_RAZORPAY_KEY_ID"] || "",
  endpoints: {
    banners: "banner.php",
    brands: "brand.php",
    categories: "category.php",
    models: "model.php",
    packages: "package.php",
    products: "product.php",
    productVariants: "product_variant.php",
    cart: "cart_manage.php",
    offers: "offer_product_list.php",
    faqs: "faq_list.php",
    partners: "partner_list.php",
    companyDetails: "company_details.php",
    wishlist: "wishlist.php",
    myWishlist: "my_wishlist.php",
    vendorProducts: import.meta.env["VITE_VENDOR_PRODUCT_API"] || "vendor_product.php",
    orderList: "order_list.php",
    orderDetailList: "order_detail_list.php",
    purchaseKavach: "purchase_kavach.php",
    verifyKavachPayment: "kavach_razorpay_verify.php",
    purchaseCart: "purchase_cart.php",
    verifyCartPayment: "cart_razorpay_verify.php",
    states: "state.php",
    cities: "city.php",
    customerLogin: "customer_login.php",
    customerVerify: "customer_verify.php",
    customerRegister: "customer_register.php",
    customerUpdate: "update_customer.php",
    customerCheck: "check_customer.php",
    staffCustomer: "customer_for_staff.php",
    customerLogout: "customer_logout.php",
  },
} as const;

export type ApiEndpoint = keyof typeof apiConfig.endpoints;

let runtimeCompanyId = apiConfig.companyId;

export function getRuntimeCompanyId() {
  return runtimeCompanyId;
}

export function setRuntimeCompanyId(companyId?: string | null) {
  const normalized = companyId?.trim();
  if (normalized) runtimeCompanyId = normalized;
}
