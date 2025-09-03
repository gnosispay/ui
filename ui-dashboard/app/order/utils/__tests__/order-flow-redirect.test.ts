import { redirect } from "next/navigation";
import * as getUserModule from "@/lib/get-user";
import * as verifyActions from "@/app/order/verify/kyc/actions";
import { OrderFlowSteps, orderFlowRedirect } from "../order-flow-redirect";

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

vi.mock("@/lib/get-user");
vi.mock("@/app/order/verify/kyc/actions");

describe("order-flow-redirect", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("redirects to KYC step if user has not started KYC, and user is at a different step", async () => {
    vi.spyOn(getUserModule, "getUser").mockResolvedValue({
      phoneVerified: true,
      sourceOfFunds: [],
      cardOrders: [],
    } as any);
    vi.spyOn(verifyActions, "getKycUser").mockResolvedValue(null);

    await orderFlowRedirect(OrderFlowSteps.deposit);

    expect(redirect).toHaveBeenCalledWith("/order/kyc");
  });

  it("redirects to shipping & phone verification step if user's phone is not verified, and user is at a different step", async () => {
    vi.spyOn(getUserModule, "getUser").mockResolvedValue({
      phoneVerified: false,
      sourceOfFunds: [],
      cardOrders: [
        {
          id: "123",
          status: "PENDINGTRANSACTION",
          address1: "123 Main St",
          city: "New York",
          country: "US",
          postalCode: undefined,
        },
      ],
    } as any);
    vi.spyOn(verifyActions, "getKycUser").mockResolvedValue({
      approved: true,
    } as any);

    await orderFlowRedirect(OrderFlowSteps.deposit);

    expect(redirect).toHaveBeenCalledWith("/order/details/shipping/123");
  });

  it("redirects to shipping & phone verification step if user's has address fields missing, and user is at a different step", async () => {
    vi.spyOn(getUserModule, "getUser").mockResolvedValue({
      phoneVerified: false,
      sourceOfFunds: [],
      cardOrders: [
        {
          id: "123",
          status: "PENDINGTRANSACTION",
        },
      ],
    } as any);
    vi.spyOn(verifyActions, "getKycUser").mockResolvedValue({
      approved: true,
    } as any);

    await orderFlowRedirect(OrderFlowSteps.deposit);

    expect(redirect).toHaveBeenCalledWith("/order/details/shipping/123");
  });

  it("redirects to source of funds step if user has no source of funds, and user is at a different step", async () => {
    vi.spyOn(getUserModule, "getUser").mockResolvedValue({
      phoneVerified: true,
      sourceOfFunds: [],
      cardOrders: [
        {
          id: "123",
          status: "PENDINGTRANSACTION",
          address1: "123 Main St",
          city: "New York",
          country: "US",
          postalCode: "12345",
        },
      ],
    } as any);

    vi.spyOn(verifyActions, "getKycUser").mockResolvedValue({
      approved: true,
    } as any);

    await orderFlowRedirect(OrderFlowSteps.deposit);

    expect(redirect).toHaveBeenCalledWith("/order/verify/source-of-funds");
  });

  it("redirects to deposit step if user has a pending card order, and user is at a different step", async () => {
    vi.spyOn(getUserModule, "getUser").mockResolvedValue({
      phoneVerified: true,
      sourceOfFunds: [1],
      cardOrders: [
        {
          id: "123",
          status: "PENDINGTRANSACTION",
          address1: "123 Main St",
          city: "New York",
          country: "US",
          postalCode: "12345",
        },
      ],
    } as any);

    vi.spyOn(verifyActions, "getKycUser").mockResolvedValue({
      approved: true,
    } as any);

    await orderFlowRedirect(OrderFlowSteps.status);

    expect(redirect).toHaveBeenCalledWith("/order/deposit/123");
  });

  it("redirects to status step if user has a ready card order, and user is at a different step", async () => {
    vi.spyOn(getUserModule, "getUser").mockResolvedValue({
      phoneVerified: true,
      sourceOfFunds: [1],
      cardOrders: [
        {
          id: "123",
          status: "READY",
          address1: "123 Main St",
          city: "New York",
          country: "US",
          postalCode: "12345",
        },
      ],
    } as any);

    vi.spyOn(verifyActions, "getKycUser").mockResolvedValue({
      approved: true,
    } as any);

    await orderFlowRedirect(OrderFlowSteps.deposit);

    expect(redirect).toHaveBeenCalledWith("/order/status/123");
  });

  it("redirects to questionnaire step from kycAuthorize if user has no source of funds, but is approved", async () => {
    vi.spyOn(getUserModule, "getUser").mockResolvedValue({
      phoneVerified: true,
      sourceOfFunds: [],
      cardOrders: [],
    } as any);

    vi.spyOn(verifyActions, "getKycUser").mockResolvedValue({
      approved: true,
    } as any);

    await orderFlowRedirect(OrderFlowSteps.kycAuthorize);

    expect(redirect).toHaveBeenCalledWith("/order/verify/source-of-funds");
  });

  it("redirects to customize step from kycAuthorize if user has a source of funds and is approved", async () => {
    vi.spyOn(getUserModule, "getUser").mockResolvedValue({
      phoneVerified: true,
      sourceOfFunds: [1],
      cardOrders: [],
    } as any);

    vi.spyOn(verifyActions, "getKycUser").mockResolvedValue({
      approved: true,
    } as any);

    await orderFlowRedirect(OrderFlowSteps.kycAuthorize);

    expect(redirect).toHaveBeenCalledWith("/order/details/customize");
  });

  it("does not redirect from kycAuthorize if user is not approved", async () => {
    vi.spyOn(getUserModule, "getUser").mockResolvedValue({
      phoneVerified: true,
      sourceOfFunds: [1],
      cardOrders: [],
    } as any);

    vi.spyOn(verifyActions, "getKycUser").mockResolvedValue({
      approved: false,
    } as any);

    await orderFlowRedirect(OrderFlowSteps.kycAuthorize);

    expect(redirect).not.toHaveBeenCalled();
  });

  it("does not redirect if user is at the correct step", async () => {
    vi.spyOn(getUserModule, "getUser").mockResolvedValue({
      phoneVerified: true,
      sourceOfFunds: [1],
      cardOrders: [
        {
          id: "123",
          status: "READY",
        },
      ],
    } as any);

    vi.spyOn(verifyActions, "getKycUser").mockResolvedValue({
      approved: true,
    } as any);

    await orderFlowRedirect(OrderFlowSteps.status);

    expect(redirect).not.toHaveBeenCalled();
  });
});
