import { customerCheck } from "./customer-check.service";
import { customerLogin } from "./customer-login.service";
import { customerRegister } from "./customer-register.service";
import { customerVerify } from "./customer-verify.service";
import { customerUpdate, type CustomerUpdateValues } from "./customer-update.service";
import { customerLogout } from "./customer-logout.service";
import type { AccountType, ApiAccount, AuthSession } from "./models";

export type { AccountType, ApiAccount, AuthSession } from "./models";
export { customerLogin } from "./customer-login.service";
export { customerVerify } from "./customer-verify.service";
export { customerRegister } from "./customer-register.service";
export { customerUpdate } from "./customer-update.service";
export type { CustomerUpdateValues } from "./customer-update.service";
export { customerCheck } from "./customer-check.service";
export { customerLogout } from "./customer-logout.service";

const STORAGE_KEY = "kimaat-lock-auth-session";
const BILLING_STORAGE_KEY = "kimaat-lock-billing-address";

function accountTypeFromResponse(account: ApiAccount): AccountType {
  const type = String(account["customer_type"] ?? "").toLowerCase();
  if (type === "1" || type === "employee") return "employee";
  if (type === "3" || type === "vendor") return "vendor";
  return "customer";
}

export function accountTypeLabel(accountType: AccountType) {
  return accountType.charAt(0).toUpperCase() + accountType.slice(1);
}

export function readAuthSession(): AuthSession | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (!value) return null;
    const session = JSON.parse(value) as AuthSession;
    if (!session.accountId || !session.authToken) return null;
    const accountType = accountTypeFromResponse(session.account);
    const normalizedSession = { ...session, accountType };
    if (session.accountType !== accountType) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedSession));
    }
    return normalizedSession;
  } catch {
    return null;
  }
}

export function saveAuthSession(account: ApiAccount) {
  const accountType = accountTypeFromResponse(account);
  const accountId = account["customer_id"] ?? "";
  const authToken = account["customer_auth_token"] ?? "";
  if (!accountId || !authToken)
    throw new Error("The account response did not include a session token.");
  const session: AuthSession = {
    accountType,
    accountId,
    authToken,
    mobile: account["customer_mobile"] ?? "",
    name: account["customer_name"] ?? "",
    account,
    verifiedAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  return session;
}

export function updateSavedAuthAccount(updates: ApiAccount) {
  const session = readAuthSession();
  if (!session) return null;
  const account = { ...session.account, ...updates };
  const updated: AuthSession = {
    ...session,
    account,
    name: account["customer_name"] ?? session.name,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  localStorage.removeItem(BILLING_STORAGE_KEY);
  return updated;
}

export function updateCustomerProfile(values: CustomerUpdateValues) {
  return customerUpdate(values);
}

export function clearAuthSession() {
  localStorage.removeItem(STORAGE_KEY);
}

export function clearSavedAccountData() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(BILLING_STORAGE_KEY);
}

export async function logoutSavedSession(session: AuthSession) {
  const request = customerLogout(session);
  clearSavedAccountData();
  await request;
}

export function requestLoginOtp(mobile: string) {
  return customerLogin(mobile);
}

export function verifyLoginOtp(mobile: string, otp: string) {
  return customerVerify(mobile, otp);
}

export async function registerCustomer(values: {
  customer_mobile: string;
  customer_email: string;
  customer_name: string;
  state_id: string;
  city_id: string;
}) {
  return customerRegister(values);
}

export function checkSavedSession(session: AuthSession) {
  return customerCheck(session);
}
