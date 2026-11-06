import { postApi } from "./client";
import { unwrapApiResult } from "./response";
import type { AuthSession } from "./models";

export type StaffCustomer = {
  customer_id: string;
  customer_name: string;
  customer_mobile: string;
};

function staffCredentials(session: AuthSession) {
  return {
    staff_id: session.accountId,
    staff_auth_token: session.authToken,
  };
}

export async function lookupCustomerForStaff(session: AuthSession, customerMobile: string) {
  const customers = unwrapApiResult(
    await postApi<StaffCustomer[]>("staffCustomer", {
      ...staffCredentials(session),
      action: "lookup",
      customer_mobile: customerMobile,
    }),
  );
  return customers[0] ?? null;
}

export async function saveCustomerForStaff(
  session: AuthSession,
  values: { customer_mobile: string; customer_name: string },
) {
  const customers = unwrapApiResult(
    await postApi<StaffCustomer[]>("staffCustomer", {
      ...staffCredentials(session),
      action: "save",
      ...values,
    }),
  );
  const customer = customers[0];
  if (!customer?.customer_id) throw new Error("Could not save the customer details.");
  return customer;
}
