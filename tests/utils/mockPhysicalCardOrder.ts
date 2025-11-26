import type { Page } from "@playwright/test";
import type {
  PostApiV1OrderCreateResponse,
  PostApiV1OrderCreateError,
  PostApiV1OrderByOrderIdAttachCouponResponse,
  PostApiV1OrderByOrderIdAttachCouponError,
  PutApiV1OrderByOrderIdConfirmPaymentResponse,
  PutApiV1OrderByOrderIdConfirmPaymentError,
  PostApiV1OrderByOrderIdCreateCardResponse,
  PostApiV1OrderByOrderIdCreateCardError,
  PostApiV1OrderByOrderIdCancelResponse,
  PostApiV1OrderByOrderIdCancelError,
  GetApiV1OrderByOrderIdResponse,
  CardOrder,
} from "../../src/client/types.gen";
import { createOrder, OrderStatus } from "./mockOrder";

// Coupon code constant - defined here to avoid importing from src/constants which includes image imports
const COUPON_CODES = "GPUI100";

/**
 * Configuration for mocking physical card order API endpoints
 */
export interface PhysicalCardOrderMockOptions {
  /** Order ID to use for the created order */
  orderId?: string;
  /** Card token to return when creating the card */
  cardToken?: string;
  /** Initial order status (default: PENDINGTRANSACTION) */
  initialStatus?: CardOrder["status"];
  /** Whether order creation should fail */
  createOrderError?: boolean;
  /** Whether coupon attachment should fail */
  attachCouponError?: boolean;
  /** Whether payment confirmation should fail */
  confirmPaymentError?: boolean;
  /** Whether card creation should fail */
  createCardError?: boolean;
  /** Whether cancel order should fail */
  cancelOrderError?: boolean;
  /** Custom error response for order creation */
  createOrderErrorResponse?: PostApiV1OrderCreateError;
  /** Custom error response for coupon attachment */
  attachCouponErrorResponse?: PostApiV1OrderByOrderIdAttachCouponError;
  /** Custom error response for payment confirmation */
  confirmPaymentErrorResponse?: PutApiV1OrderByOrderIdConfirmPaymentError;
  /** Custom error response for card creation */
  createCardErrorResponse?: PostApiV1OrderByOrderIdCreateCardError;
  /** Custom error response for cancel order */
  cancelOrderErrorResponse?: PostApiV1OrderByOrderIdCancelError;
  /** Custom order data to return */
  orderData?: Partial<CardOrder>;
}

/**
 * Sets up mocks for physical card order API endpoints in Playwright tests.
 *
 * This function intercepts requests to physical card order endpoints and returns
 * appropriate responses based on the configuration.
 *
 * @param page - The Playwright page instance
 * @param options - Configuration options for the mocks
 *
 * @example
 * ```typescript
 * import { mockPhysicalCardOrder } from "./utils/mockPhysicalCardOrder";
 *
 * test("successful physical card order", async ({ page }) => {
 *   await mockPhysicalCardOrder(page, {
 *     orderId: "order-123",
 *     cardToken: "card-token-456"
 *   });
 *
 *   // Your test code here...
 * });
 * ```
 */
export async function mockPhysicalCardOrder(page: Page, options: PhysicalCardOrderMockOptions = {}): Promise<void> {
  const {
    orderId = "order-physical-test",
    cardToken = "card-token-physical-test",
    initialStatus = OrderStatus.PENDING_TRANSACTION,
    createOrderError = false,
    attachCouponError = false,
    confirmPaymentError = false,
    createCardError = false,
    cancelOrderError = false,
    createOrderErrorResponse,
    attachCouponErrorResponse,
    confirmPaymentErrorResponse,
    createCardErrorResponse,
    cancelOrderErrorResponse,
    orderData = {},
  } = options;

  // Mock POST /api/v1/order/create - Create physical card order
  await page.route("**/api/v1/order/create", async (route) => {
    if (route.request().method() === "POST") {
      if (createOrderError) {
        const errorResponse: PostApiV1OrderCreateError = createOrderErrorResponse || {
          error: "Error creating order",
        };
        await route.fulfill({
          status: 400,
          contentType: "application/json",
          body: JSON.stringify(errorResponse),
        });
      } else {
        // Mark order as created
        orderCreated = true;

        // Extract address data from request body
        const requestBody = route.request().postDataJSON();
        const shippingAddress = requestBody?.shippingAddress || {};

        // Store submitted address for use in GET requests
        submittedAddress = {
          address1: shippingAddress.address1 || orderData.address1 || "123 Test Street",
          address2: shippingAddress.address2 || orderData.address2,
          city: shippingAddress.city || orderData.city || "Test City",
          postalCode: shippingAddress.postalCode || orderData.postalCode || "12345",
          country: shippingAddress.country || orderData.country || "US",
        };

        const order: PostApiV1OrderCreateResponse = createOrder({
          id: orderId,
          userId: "test-user-id",
          status: initialStatus,
          personalizationSource: "KYC",
          address1: submittedAddress.address1,
          address2: submittedAddress.address2,
          city: submittedAddress.city,
          postalCode: submittedAddress.postalCode,
          country: submittedAddress.country,
          totalAmountEUR: orderData.totalAmountEUR ?? 25.0,
          totalDiscountEUR: orderData.totalDiscountEUR ?? 0.0,
          ...orderData,
        });
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(order),
        });
      }
    } else {
      await route.continue();
    }
  });

  // Track order state for dynamic updates
  let orderCreated = false;
  let currentOrderStatus = initialStatus;
  let currentCouponCode: string | undefined = orderData.couponCode;
  let currentTotalDiscountEUR = orderData.totalDiscountEUR ?? 0.0;
  // Track actual submitted address data
  let submittedAddress: {
    address1?: string;
    address2?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  } = {};

  // Mock POST /api/v1/order/{orderId}/attach-coupon - Attach coupon to order
  await page.route(`**/api/v1/order/${orderId}/attach-coupon`, async (route) => {
    if (route.request().method() === "POST") {
      if (attachCouponError) {
        const errorResponse: PostApiV1OrderByOrderIdAttachCouponError = attachCouponErrorResponse || {
          message: "Invalid coupon code",
        };
        await route.fulfill({
          status: 422,
          contentType: "application/json",
          body: JSON.stringify(errorResponse),
        });
      } else {
        // Update order state to reflect coupon application
        currentCouponCode = COUPON_CODES;
        currentTotalDiscountEUR = orderData.totalAmountEUR ?? 25.0; // Full discount

        const response: PostApiV1OrderByOrderIdAttachCouponResponse = {
          couponCode: COUPON_CODES,
        };
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(response),
        });
      }
    } else {
      await route.continue();
    }
  });

  // Mock PUT /api/v1/order/{orderId}/confirm-payment - Confirm payment
  await page.route(`**/api/v1/order/${orderId}/confirm-payment`, async (route) => {
    if (route.request().method() === "PUT") {
      if (confirmPaymentError) {
        const errorResponse: PutApiV1OrderByOrderIdConfirmPaymentError = confirmPaymentErrorResponse || {
          message: "Failed to confirm payment",
        };
        await route.fulfill({
          status: 400,
          contentType: "application/json",
          body: JSON.stringify(errorResponse),
        });
      } else {
        // Update order status after payment confirmation
        currentOrderStatus = OrderStatus.TRANSACTION_COMPLETE;

        const response: PutApiV1OrderByOrderIdConfirmPaymentResponse = {
          ok: true,
        };
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(response),
        });
      }
    } else {
      await route.continue();
    }
  });

  // Mock POST /api/v1/order/{orderId}/create-card - Create card from order
  await page.route(`**/api/v1/order/${orderId}/create-card`, async (route) => {
    if (route.request().method() === "POST") {
      if (createCardError) {
        const errorResponse: PostApiV1OrderByOrderIdCreateCardError = createCardErrorResponse || {
          error: "Failed to create card",
        };
        await route.fulfill({
          status: 400,
          contentType: "application/json",
          body: JSON.stringify(errorResponse),
        });
      } else {
        // Update order status after creation confirmation
        currentOrderStatus = OrderStatus.CARD_CREATED;

        const response: PostApiV1OrderByOrderIdCreateCardResponse = {
          success: true,
          cardToken: cardToken,
        };
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(response),
        });
      }
    } else {
      await route.continue();
    }
  });

  // Mock GET /api/v1/order/{orderId} - Get order by ID
  await page.route(`**/api/v1/order/${orderId}`, async (route) => {
    if (route.request().method() === "GET") {
      const baseOrder = createOrder({
        id: orderId,
        userId: "test-user-id",
        status: currentOrderStatus,
        personalizationSource: "KYC",
        address1: submittedAddress.address1 || orderData.address1 || "123 Test Street",
        address2: submittedAddress.address2 || orderData.address2,
        city: submittedAddress.city || orderData.city || "Test City",
        postalCode: submittedAddress.postalCode || orderData.postalCode || "12345",
        country: submittedAddress.country || orderData.country || "US",
        couponCode: currentCouponCode,
        totalAmountEUR: orderData.totalAmountEUR ?? 25.0,
        totalDiscountEUR: currentTotalDiscountEUR,
        ...orderData,
      });

      const order: GetApiV1OrderByOrderIdResponse = {
        id: baseOrder.id,
        transactionHash: baseOrder.transactionHash ?? null,
        embossedName: baseOrder.embossedName ?? null,
        address1: baseOrder.address1 ?? null,
        address2: baseOrder.address2 ?? null,
        city: baseOrder.city ?? null,
        postalCode: baseOrder.postalCode ?? null,
        state: baseOrder.state ?? null,
        country: baseOrder.country ?? null,
        userId: "test-user-id",
        status: baseOrder.status,
        personalizationSource: baseOrder.personalizationSource,
        couponCode: baseOrder.couponCode,
        totalAmountEUR: baseOrder.totalAmountEUR ?? null,
        totalDiscountEur: baseOrder.totalDiscountEUR,
        createdAt: baseOrder.createdAt,
      };
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(order),
      });
    } else {
      await route.continue();
    }
  });

  // Mock GET /api/v1/order/ - Get order list (empty initially, includes order after creation)
  // This route must be registered AFTER the individual order route to avoid conflicts
  // Match exact path to avoid matching /api/v1/order/{orderId}
  await page.route("**/api/v1/order/", async (route) => {
    const url = new URL(route.request().url());
    // Only handle the list endpoint, not individual order endpoints
    if (route.request().method() === "GET" && url.pathname === "/api/v1/order/") {
      // Return empty array if order hasn't been created yet
      if (!orderCreated) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([]),
        });
        return;
      }

      // Return order in list after it's been created
      const order: CardOrder = createOrder({
        id: orderId,
        userId: "test-user-id",
        status: currentOrderStatus,
        personalizationSource: "KYC",
        address1: submittedAddress.address1 || orderData.address1 || "123 Test Street",
        address2: submittedAddress.address2 || orderData.address2,
        city: submittedAddress.city || orderData.city || "Test City",
        postalCode: submittedAddress.postalCode || orderData.postalCode || "12345",
        country: submittedAddress.country || orderData.country || "US",
        couponCode: currentCouponCode,
        totalAmountEUR: orderData.totalAmountEUR ?? 25.0,
        totalDiscountEUR: currentTotalDiscountEUR,
        ...orderData,
      });
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([order]),
      });
    } else {
      await route.continue();
    }
  });

  // Mock POST /api/v1/order/{orderId}/cancel - Cancel order
  await page.route(`**/api/v1/order/${orderId}/cancel`, async (route) => {
    if (route.request().method() === "POST") {
      if (cancelOrderError) {
        const errorResponse: PostApiV1OrderByOrderIdCancelError = cancelOrderErrorResponse || {
          message: "Failed to cancel order",
        };
        await route.fulfill({
          status: 400,
          contentType: "application/json",
          body: JSON.stringify(errorResponse),
        });
      } else {
        // Update order status to cancelled
        // The order will still be in the list but with CANCELLED status,
        // which will be filtered out by pendingPhysicalOrders since CANCELLED
        // is not in the list of pending statuses
        currentOrderStatus = "CANCELLED" as CardOrder["status"];

        const response: PostApiV1OrderByOrderIdCancelResponse = {
          ok: true,
        };
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(response),
        });
      }
    } else {
      await route.continue();
    }
  });
}
