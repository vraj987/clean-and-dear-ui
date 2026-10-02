const baseUrl = import.meta.env["VITE_API_URL"] || "";

export const apiConfig = {
  baseUrl: baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`,
  companyId: import.meta.env["VITE_COMPANY_ID"] || "",
  projectName: import.meta.env["VITE_PROJECT_NAME"] || "Kimaat Lock",
  versionCode: import.meta.env["VITE_VERSION_CODE_ID"] || "1.0.0.1",
  endpoints: {
    banners: "banner.php",
    brands: "brand.php",
    categories: "category.php",
    models: "model.php",
    packages: "package.php",
    products: "product.php",
    states: "state.php",
    cities: "city.php",
    customerLogin: "customer_login.php",
    customerVerify: "customer_verify.php",
    customerRegister: "customer_register.php",
    customerUpdate: "update_customer.php",
    customerCheck: "check_customer.php",
    customerLogout: "customer_logout.php",
  },
} as const;

export type ApiEndpoint = keyof typeof apiConfig.endpoints;
