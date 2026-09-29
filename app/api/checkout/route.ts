import type { CheckoutRequest, CheckoutResponse } from "@/lib/api/contracts";
import { apiError, readJson } from "@/lib/api/respond";
import { parseCustomer, parsePaymentMethod } from "@/lib/api/validate";
import { createMockShopifyOrder, PaymentDeclinedError } from "@/lib/shopify/mock-shopify";

/**
 * MOCK checkout — simulates Shopify checkout + the `orders/paid` webhook in one call.
 * No payment provider is contacted and no real Shopify order is created.
 */
export async function POST(request: Request) {
  const body = await readJson<CheckoutRequest>(request);
  const customer = parseCustomer(body?.customer);
  const paymentMethod = parsePaymentMethod(body?.paymentMethod);
  const orderNumber = Number(body?.orderNumber);

  if (!body || !customer || !paymentMethod || !Number.isInteger(orderNumber) || orderNumber < 1000) {
    return apiError("BAD_REQUEST", "Please check your details and try again.");
  }

  try {
    const created = await createMockShopifyOrder({
      orderNumber,
      customer,
      paymentMethod,
      simulateDecline: body.simulateDecline === true,
    });
    const response: CheckoutResponse = created;
    return Response.json(response);
  } catch (err) {
    if (err instanceof PaymentDeclinedError) return apiError("PAYMENT_FAILED", err.message);
    throw err;
  }
}
