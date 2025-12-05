import { test, expect } from "@playwright/test";
import { setupMockWallet } from "./utils/mockWallet";
import { mockAuthChallenge } from "./utils/mockAuthChallenge";
import { mockUser } from "./utils/mockUser";
import { mockSafeConfig } from "./utils/mockSafeConfig";
import { setupAllMocks } from "./utils/setupMocks";
import {
  USER_NOT_SIGNED_UP,
  USER_SIGNED_UP_NO_KYC,
  USER_KYC_APPROVED_NO_SOF,
  BASE_USER,
  USER_DEACTIVATED,
  USER_KYC_REJECTED,
} from "./utils/testUsers";
import { mockKycIntegration } from "./utils/mockKycIntegration";

test.describe("AuthGuard - Different User States", () => {
  test("Shows signup screen when user is not signed up and button redirects to /register", async ({ page }) => {
    // Set up wallet mock
    await setupMockWallet(page);

    // Mock auth challenge for user not signed up (no userId in JWT)
    await mockAuthChallenge({ page, testUser: USER_NOT_SIGNED_UP });

    // Mock user endpoint (though it won't be called until after signup)
    await mockUser({ page, testUser: USER_NOT_SIGNED_UP });

    // Navigate to home page
    await page.goto("/");

    // Wait for the signup screen to appear
    await expect(page.getByRole("heading", { name: "Welcome to Gnosis Pay" })).toBeVisible();
    await expect(page.getByText("You need to complete the signup process to use the app.")).toBeVisible();
    const signupButton = page.getByRole("button", { name: "Complete Signup" });
    await expect(signupButton).toBeVisible();

    // Verify the help link is visible
    await expect(page.getByText("Trouble logging in? Get help")).toBeVisible();

    // Click the signup button and verify navigation
    await signupButton.click();
    await expect(page).toHaveURL("/register");
    await expect(page.getByRole("heading", { name: "Welcome to Gnosis Pay" })).not.toBeVisible();
    await expect(page.getByText("Type your email")).toBeVisible();
  });

  test("Shows KYC screen when user has signed up but no KYC and button redirects to /kyc", async ({ page }) => {
    // Set up wallet mock
    await setupMockWallet(page);

    // Mock auth challenge for signed up user (with userId in JWT)
    await mockAuthChallenge({ page, testUser: USER_SIGNED_UP_NO_KYC });

    // Mock user endpoint to return user without KYC
    await mockUser({ page, testUser: USER_SIGNED_UP_NO_KYC });

    // Mock safe config (not needed for KYC screen but prevents errors)
    await mockSafeConfig({
      page,
      testUser: USER_SIGNED_UP_NO_KYC,
      configOverrides: {
        isDeployed: false,
        accountStatus: 1, // SafeNotDeployed
      },
    });

    await mockKycIntegration(page);

    // Navigate to home page
    await page.goto("/");

    // Wait for the KYC screen to appear
    await expect(page.getByRole("heading", { name: "Identity Verification" })).toBeVisible();
    await expect(page.getByText("We need to verify your identity to comply with regulations.")).toBeVisible();
    const kycButton = page.getByRole("button", { name: "Complete KYC Verification" });
    await expect(kycButton).toBeVisible();

    // Click the KYC button and verify navigation
    await kycButton.click();
    await expect(page).toHaveURL("/kyc");
    await expect(page.getByRole("heading", { name: "Identity Verification" })).not.toBeVisible();
    await expect(page.getByTestId("kyc-iframe")).toBeVisible();
  });

  test("Shows safe deployment screen when user has KYC but no safe deployed and button redirects to /safe-deployment", async ({
    page,
  }) => {
    // Set up wallet mock
    await setupMockWallet(page);

    // Mock auth challenge
    await mockAuthChallenge({ page, testUser: USER_KYC_APPROVED_NO_SOF });

    // Mock user endpoint
    await mockUser({ page, testUser: USER_KYC_APPROVED_NO_SOF });

    // Mock safe config with safe not deployed
    await mockSafeConfig({
      page,
      testUser: USER_KYC_APPROVED_NO_SOF,
      configOverrides: {
        isDeployed: false,
        accountStatus: 1, // SafeNotDeployed
      },
    });

    // Navigate to home page
    await page.goto("/");

    // Wait for the safe deployment screen to appear
    await expect(page.getByRole("heading", { name: "Safe Setup" })).toBeVisible();
    await expect(page.getByText("We need to deploy your Safe to secure your funds.")).toBeVisible();
    const safeButton = page.getByRole("button", { name: "Setup Safe" });
    await expect(safeButton).toBeVisible();

    // Click the safe deployment button and verify navigation
    await safeButton.click();
    await expect(page).toHaveURL("/safe-deployment");
    await expect(page.getByRole("heading", { name: "Safe Setup" })).not.toBeVisible();
    await expect(page.getByTestId("source-of-funds-step")).toBeVisible();
  });

  test("Shows deactivated account screen when user account is deactivated and button redirects to /withdraw", async ({
    page,
  }) => {
    // Set up wallet mock
    await setupMockWallet(page);

    // Mock auth challenge
    await mockAuthChallenge({ page, testUser: USER_DEACTIVATED });

    // Mock user endpoint
    await mockUser({ page, testUser: USER_DEACTIVATED });

    // Mock safe config
    await mockSafeConfig({
      page,
      testUser: USER_DEACTIVATED,
    });

    // Navigate to home page
    await page.goto("/");

    // Wait for the deactivated account screen to appear
    await expect(page.getByRole("heading", { name: "Account deactivated" })).toBeVisible();
    await expect(page.getByText("Your account has been deactivated.")).toBeVisible();
    const withdrawButton = page.getByRole("button", { name: "Withdraw funds" });
    await expect(withdrawButton).toBeVisible();

    // Verify the help link is visible
    await expect(page.getByText("Trouble logging in? Get help")).toBeVisible();

    // Click the withdraw button and verify navigation
    await withdrawButton.click();
    await expect(page).toHaveURL("/withdraw");
    await expect(page.getByRole("heading", { name: "Account deactivated" })).not.toBeVisible();
    await expect(page.getByTestId("withdraw-funds-form")).toBeVisible();
  });

  test("Shows login screen when wallet is connected but not authenticated", async ({ page }) => {
    // Set up wallet mock
    await setupMockWallet(page);

    // we can't really test the sign button bc our wallet is connecting and signing everything
    // right away, so all we can do is delay a bit the mock to see the signing button
    await setupAllMocks(page, BASE_USER);

    // override the auth challenge mock to delay by 200ms
    await mockAuthChallenge({ page, testUser: BASE_USER, options: { delay: 200 } });

    // Navigate to home page
    await page.goto("/");

    // Wait for the login screen to appear
    await expect(page.getByRole("heading", { name: "Login" })).toBeVisible();
    await expect(page.getByText("Please sign the message request to login.")).toBeVisible();

    // Verify we're on the home page by checking for home page content
    await expect(page).toHaveURL("/");
    await expect(page.getByRole("heading", { name: "Balance" })).toBeVisible();
  });

  test("Shows connect wallet screen when no wallet is connected", async ({ page }) => {
    // Don't set up wallet mock - simulates no wallet connection

    // Navigate to home page
    await page.goto("/");

    // Wait for the connect wallet screen to appear
    await expect(page.getByRole("heading", { name: "Connect your wallet" })).toBeVisible();
    await expect(page.getByText("Please connect your wallet to continue.")).toBeVisible();
    const connectButton = page.getByRole("button", { name: "Connect wallet" });
    await expect(connectButton).toBeVisible();

    // Click the connect button - this opens the AppKit modal, doesn't navigate
    await connectButton.click();

    // Verify the AppKit modal appears
    await expect(page.getByTestId("w3m-modal-card")).toBeVisible();

    // Verify the Zendesk widget is visible
    await expect(page.getByTitle("Button to launch messaging window")).toBeVisible();
  });

  test("Allows access to app when user is fully onboarded", async ({ page }) => {
    // Set up wallet mock
    await setupMockWallet(page);

    // Set up all mocks for fully onboarded user
    await setupAllMocks(page, BASE_USER);

    // Navigate to home page
    await page.goto("/");

    // Should not see any auth guard screens
    await expect(page.getByRole("heading", { name: "Welcome to Gnosis Pay" })).not.toBeVisible();
    await expect(page.getByRole("heading", { name: "Identity Verification" })).not.toBeVisible();
    await expect(page.getByRole("heading", { name: "Safe Setup" })).not.toBeVisible();
    await expect(page.getByRole("heading", { name: "Account deactivated" })).not.toBeVisible();
    await expect(page.getByRole("heading", { name: "Login" })).not.toBeVisible();
    await expect(page.getByRole("heading", { name: "Connect your wallet" })).not.toBeVisible();

    // Verify we're on the home page by checking for home page content
    await expect(page).toHaveURL("/");
    await expect(page.getByRole("heading", { name: "Balance" })).toBeVisible();
  });

  test("Reset page is accessible to deactivated users without auth guard screens", async ({ page }) => {
    // Set up wallet mock
    await setupMockWallet(page);

    // Mock auth challenge
    await mockAuthChallenge({ page, testUser: USER_DEACTIVATED });

    // Mock user endpoint
    await mockUser({ page, testUser: USER_DEACTIVATED });

    // Mock safe config
    await mockSafeConfig({
      page,
      testUser: USER_DEACTIVATED,
    });

    // Navigate directly to reset page
    await page.goto("/reset");

    // Should not see auth guard screens
    await expect(page.getByRole("heading", { name: "Account deactivated" })).not.toBeVisible();
    await expect(page.getByRole("heading", { name: "Identity Verification" })).not.toBeVisible();

    // Should see the reset page
    await expect(page.getByTestId("reset-warning-step")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Reset Safe Account" })).toBeVisible();
  });

  test("Reset page is accessible to users without KYC without auth guard screens", async ({ page }) => {
    // Set up wallet mock
    await setupMockWallet(page);

    // Mock auth challenge for signed up user (with userId in JWT)
    await mockAuthChallenge({ page, testUser: USER_SIGNED_UP_NO_KYC });

    // Mock user endpoint to return user without KYC
    await mockUser({ page, testUser: USER_SIGNED_UP_NO_KYC });

    // Mock safe config
    await mockSafeConfig({
      page,
      testUser: USER_SIGNED_UP_NO_KYC,
      configOverrides: {
        isDeployed: false,
        accountStatus: 1, // SafeNotDeployed
      },
    });

    // Navigate directly to reset page
    await page.goto("/reset");

    // Should not see auth guard screens
    await expect(page.getByRole("heading", { name: "Identity Verification" })).not.toBeVisible();
    await expect(page.getByRole("heading", { name: "Account deactivated" })).not.toBeVisible();

    // Should see the reset page
    await expect(page.getByTestId("reset-warning-step")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Reset Safe Account" })).toBeVisible();
  });

  test("Reset page is accessible to fully onboarded users without auth guard screens", async ({ page }) => {
    // Set up wallet mock
    await setupMockWallet(page);

    // Set up all mocks for fully onboarded user
    await setupAllMocks(page, BASE_USER);

    // Navigate directly to reset page
    await page.goto("/reset");

    // Should not see auth guard screens
    await expect(page.getByRole("heading", { name: "Identity Verification" })).not.toBeVisible();
    await expect(page.getByRole("heading", { name: "Account deactivated" })).not.toBeVisible();

    // Should see the reset page
    await expect(page.getByTestId("reset-warning-step")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Reset Safe Account" })).toBeVisible();
  });

  test("Withdraw page is accessible to deactivated users without auth guard screens", async ({ page }) => {
    // Set up wallet mock
    await setupMockWallet(page);

    // Mock auth challenge
    await mockAuthChallenge({ page, testUser: USER_DEACTIVATED });

    // Mock user endpoint
    await mockUser({ page, testUser: USER_DEACTIVATED });

    // Mock safe config
    await mockSafeConfig({
      page,
      testUser: USER_DEACTIVATED,
    });

    // Navigate directly to withdraw page
    await page.goto("/withdraw");

    // Should not see auth guard screens
    await expect(page.getByRole("heading", { name: "Account deactivated" })).not.toBeVisible();
    await expect(page.getByRole("heading", { name: "Identity Verification" })).not.toBeVisible();

    // Should see the withdraw page
    await expect(page.getByTestId("withdraw-funds-form")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Withdraw Funds" })).toBeVisible();
  });

  test("Withdraw page is accessible to users with KYC rejected without auth guard screens", async ({ page }) => {
    // Set up wallet mock
    await setupMockWallet(page);

    // Mock auth challenge for user with rejected KYC
    await mockAuthChallenge({ page, testUser: USER_KYC_REJECTED });

    // Mock user endpoint
    await mockUser({ page, testUser: USER_KYC_REJECTED });

    // Mock safe config
    await mockSafeConfig({
      page,
      testUser: USER_KYC_REJECTED,
      configOverrides: {
        isDeployed: false,
        accountStatus: 1, // SafeNotDeployed
      },
    });

    // Navigate directly to withdraw page
    await page.goto("/withdraw");

    // Should not see auth guard screens
    await expect(page.getByRole("heading", { name: "Identity Verification" })).not.toBeVisible();
    await expect(page.getByRole("heading", { name: "Account deactivated" })).not.toBeVisible();

    // Should see the withdraw page
    await expect(page.getByTestId("withdraw-funds-form")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Withdraw Funds" })).toBeVisible();
  });
});
