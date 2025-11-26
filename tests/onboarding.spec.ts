import { test, expect } from "@playwright/test";
import jwt from "jsonwebtoken";
import { setupMockWallet } from "./utils/mockWallet";
import { mockSignup } from "./utils/mockSignup";
import { mockKycIntegration } from "./utils/mockKycIntegration";
import { mockSourceOfFunds, DEFAULT_SOURCE_OF_FUNDS_QUESTIONS } from "./utils/mockSourceOfFunds";
import { mockPhoneVerification } from "./utils/mockPhoneVerification";
import { mockSafeDeployment } from "./utils/mockSafeDeployment";
import { mockUser } from "./utils/mockUser";
import { mockSafeConfig } from "./utils/mockSafeConfig";
import { mockAuthChallenge } from "./utils/mockAuthChallenge";
import {
  USER_NOT_SIGNED_UP,
  USER_SIGNED_UP_NO_KYC,
  USER_KYC_APPROVED_NO_SOF,
  USER_SOF_ANSWERED_NO_PHONE,
  USER_READY_FOR_SAFE_DEPLOYMENT,
  BASE_USER,
} from "./utils/testUsers";

test.describe("Onboarding Flow - Happy Path", () => {
  test("Complete onboarding flow from signup to safe deployment", async ({ page }) => {
    // Set up wallet mock
    await setupMockWallet(page);

    // ========================================================================
    // STEP 1: Signup
    // ========================================================================

    // Mock auth challenge for initial connection (not signed up yet)
    await mockAuthChallenge({ page, testUser: USER_NOT_SIGNED_UP });

    // Mock user endpoint to return not signed up user initially
    await mockUser({ page, testUser: USER_NOT_SIGNED_UP });

    // Generate a valid JWT token for the signed-up user
    const signedUpToken = jwt.sign(
      {
        userId: USER_SIGNED_UP_NO_KYC.userId,
        signerAddress: USER_SIGNED_UP_NO_KYC.signerAddress,
        chainId: "100",
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
        hasSignedUp: true,
      },
      "test-secret-key",
    );

    // Mock signup endpoint
    await mockSignup(page, {
      isError: false,
      successResponse: {
        id: USER_SIGNED_UP_NO_KYC.userId,
        token: signedUpToken,
        hasSignedUp: true,
      },
    });

    // Mock KYC integration endpoint (needed after signup)
    await mockKycIntegration(page, {
      kycUrl: "https://mock-sumsub.example.com/kyc-flow",
    });

    // Set up request tracking for user terms acceptance
    const termsRequests: Array<{ terms: string; version: string }> = [];
    let termsRequestCount = 0;

    await page.route("**/api/v1/user/terms", async (route) => {
      const method = route.request().method();

      if (method === "POST") {
        const postData = await route.request().postDataJSON();
        termsRequests.push(postData as { terms: string; version: string });
        termsRequestCount++;
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ ok: true }),
        });
      } else if (method === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            terms: [
              {
                type: "general-tos",
                currentVersion: "1.0",
                accepted: false,
                acceptedVersion: null,
                acceptedAt: null,
              },
              {
                type: "card-monavate-tos",
                currentVersion: "1.0",
                accepted: false,
                acceptedVersion: null,
                acceptedAt: null,
              },
              {
                type: "privacy-policy",
                currentVersion: "1.0",
                accepted: false,
                acceptedVersion: null,
                acceptedAt: null,
              },
            ],
          }),
        });
      } else {
        await route.continue();
      }
    });

    // Navigate to home page
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // The home page should show "Complete signup" button since wallet is connected but user not signed up
    const completeSignupButton = page.getByRole("button", { name: "Complete signup" });
    await expect(completeSignupButton).toBeVisible({ timeout: 10000 });
    await completeSignupButton.click();

    // Wait for signup page to load
    await expect(page.getByTestId("signup-page")).toBeVisible();

    // Verify submit button is disabled initially (no email, no TOS acceptance)
    await expect(page.getByTestId("signup-submit-button")).toBeDisabled();

    // Fill in email
    await page.getByTestId("signup-email-input").fill("test@example.com");

    // Verify submit button is still disabled (email filled but TOS not accepted)
    await expect(page.getByTestId("signup-submit-button")).toBeDisabled();

    // Accept terms of service
    await page.getByTestId("signup-tos-checkbox").check();

    // Verify submit button is now enabled (email filled and TOS accepted)
    await expect(page.getByTestId("signup-submit-button")).toBeEnabled();

    // Update user mock to signed up state (before clicking submit so refetchUser sees it)
    await mockUser({
      page,
      testUser: USER_SIGNED_UP_NO_KYC,
    });

    // Click submit
    await page.getByTestId("signup-submit-button").click();

    // Wait for all 3 terms acceptance POST requests to complete
    await expect
      .poll(() => termsRequestCount, {
        message: `Expected 3 user terms POST requests, got ${termsRequestCount}`,
        timeout: 10000,
        intervals: [100, 250, 500, 1000],
      })
      .toBe(3);

    // Verify all 3 terms were accepted with correct types and versions
    expect(termsRequests).toHaveLength(3);

    const hasGeneralTos = termsRequests.some((req) => req.terms === "general-tos" && req.version === "1.0");
    const hasCardTos = termsRequests.some((req) => req.terms === "card-monavate-tos" && req.version === "1.0");
    const hasPrivacyPolicy = termsRequests.some((req) => req.terms === "privacy-policy" && req.version === "1.0");

    expect(hasGeneralTos, `Missing general-tos in: ${JSON.stringify(termsRequests)}`).toBe(true);
    expect(hasCardTos, `Missing card-monavate-tos in: ${JSON.stringify(termsRequests)}`).toBe(true);
    expect(hasPrivacyPolicy, `Missing privacy-policy in: ${JSON.stringify(termsRequests)}`).toBe(true);

    // ========================================================================
    // STEP 2: KYC
    // ========================================================================

    // Wait for KYC page to load (after signup redirect)
    await expect(page.getByTestId("kyc-page")).toBeVisible();

    // Verify KYC iframe is loaded
    await expect(page.getByTestId("kyc-iframe")).toBeVisible();

    // ========================================================================
    // STEP 3: Source of Funds
    // ========================================================================

    // Mock source of funds endpoints (set up before status change)
    await mockSourceOfFunds(page);

    // Simulate KYC completion by updating user status to approved
    await mockUser({
      page,
      testUser: USER_KYC_APPROVED_NO_SOF.user,
    });

    // In a real scenario, the KYC page would poll and detect the approved status,
    // then automatically navigate. For testing, we'll navigate manually.
    await page.goto("/safe-deployment");

    // Mock safe config for safe deployment page
    await mockSafeConfig({
      page,
      testUser: USER_KYC_APPROVED_NO_SOF,
      configOverrides: {
        isDeployed: false,
        accountStatus: 1, // SafeNotDeployed
      },
    });

    // Wait for source of funds step to load
    await expect(page.getByTestId("source-of-funds-step")).toBeVisible();

    // Answer first question
    await page.getByTestId("source-of-funds-select-0").click();
    await page.getByRole("option", { name: "Employment income" }).click();

    // Answer second question
    await page.getByTestId("source-of-funds-select-1").click();
    await page.getByRole("option", { name: "€50,000 - €100,000" }).click();

    // Update user mock to have source of funds answered (before submission so refetchUser sees it)
    await mockUser({
      page,
      testUser: USER_SOF_ANSWERED_NO_PHONE.user,
    });

    // Submit source of funds
    await page.getByTestId("source-of-funds-submit-button").click();

    // ========================================================================
    // STEP 4: Phone Verification
    // ========================================================================

    // Mock phone verification endpoints
    await mockPhoneVerification(page);

    // Wait for phone verification step to load
    await expect(page.getByTestId("phone-verification-step")).toBeVisible();

    // Enter phone number
    await page.getByTestId("phone-number-input").fill("+1234567890");

    // Click continue
    await page.getByTestId("phone-continue-button").click();

    // Wait for phone confirmation form
    await expect(page.getByTestId("phone-confirm-form")).toBeVisible();

    // Verify phone number is displayed
    await expect(page.getByTestId("phone-number-display")).toContainText("+1234567890");

    // Click send code
    await page.getByTestId("phone-send-code-button").click();

    // Wait for OTP verification form
    await expect(page.getByTestId("otp-verification-form")).toBeVisible();

    // Enter OTP code (simulate entering 6 digits)
    // Fill each digit individually since OTP input has separate fields
    for (let i = 0; i < 6; i++) {
      await page.getByTestId(`otp-input-digit-${i}`).fill((i + 1).toString());
    }

    // Update user mock to have phone validated
    await mockUser({
      page,
      testUser: USER_READY_FOR_SAFE_DEPLOYMENT.user,
    });

    // ========================================================================
    // STEP 5: Safe Deployment
    // ========================================================================

    // Mock safe deployment endpoints with progression simulation
    // Set this up BEFORE clicking verify so the route is ready when DeploySafeStep mounts
    await mockSafeDeployment(page, {
      simulateProgression: true,
    });

    // Click verify (this will navigate to DeploySafe step)
    await page.getByTestId("otp-verify-button").click();

    // Wait for deploy safe step to load
    await expect(page.getByTestId("deploy-safe-step")).toBeVisible();

    // Verify loading state is shown
    await expect(page.getByTestId("safe-deployment-loading-icon")).toBeVisible();
    await expect(page.getByTestId("safe-deployment-loading-message")).toBeVisible();

    // Update user mock to fully onboarded state
    await mockUser({
      page,
      testUser: BASE_USER,
    });

    // Update safe config to deployed
    await mockSafeConfig({
      page,
      testUser: BASE_USER,
      configOverrides: {
        isDeployed: true,
        accountStatus: 0, // Ok
      },
    });

    // Wait for success state (polling should complete - mock needs 2 GET calls after POST)
    // Component polls every 5 seconds, so allow enough time for progression: not_deployed -> processing -> ok
    await expect(page.getByTestId("safe-deployment-success-icon")).toBeVisible({ timeout: 20000 });
    await expect(page.getByTestId("safe-deployment-success-message")).toContainText(
      "Your Safe account has been successfully created!",
    );

    // Verify visit home button is visible
    await expect(page.getByTestId("safe-deployment-visit-home-button")).toBeVisible();

    // Click visit home button
    await page.getByTestId("safe-deployment-visit-home-button").click();

    // Verify we're redirected to home page
    await expect(page).toHaveURL("/");
  });
});

test.describe("Onboarding Flow - Error Scenarios", () => {
  test("Signup error - email already registered", async ({ page }) => {
    // Set up wallet mock
    await setupMockWallet(page);

    // Mock auth challenge for initial connection
    await mockAuthChallenge({ page, testUser: USER_NOT_SIGNED_UP });

    // Mock user endpoint
    await mockUser({ page, testUser: USER_NOT_SIGNED_UP });

    // Mock signup endpoint with error
    await mockSignup(page, {
      isError: true,
      errorStatus: 409,
      errorResponse: {
        error: "Email address already registered",
      },
    });

    // Navigate to signup page
    await page.goto("/register");

    // Wait for signup page to load
    await expect(page.getByTestId("signup-page")).toBeVisible();

    // Fill in email
    await page.getByTestId("signup-email-input").fill("existing@example.com");

    // Accept terms of service
    await page.getByTestId("signup-tos-checkbox").check();

    // Click submit
    await page.getByTestId("signup-submit-button").click();

    // Verify error alert is shown
    await expect(page.getByTestId("signup-error-alert")).toBeVisible();
    await expect(page.getByTestId("signup-error-alert")).toContainText("already associated with a Gnosis Pay account");
  });

  test("KYC error - failed to load integration", async ({ page }) => {
    // Set up wallet mock
    await setupMockWallet(page);

    // Mock auth challenge
    await mockAuthChallenge({ page, testUser: USER_SIGNED_UP_NO_KYC });

    // Mock user endpoint
    await mockUser({ page, testUser: USER_SIGNED_UP_NO_KYC });

    // Mock KYC integration endpoint with error
    await mockKycIntegration(page, {
      isError: true,
      errorStatus: 500,
      errorResponse: {
        message: "Internal server error",
      },
    });

    // Navigate to KYC page
    await page.goto("/kyc");

    // Wait for KYC page to load
    await expect(page.getByTestId("kyc-page")).toBeVisible();

    // Verify error alert is shown
    await expect(page.getByTestId("kyc-error-alert")).toBeVisible();
    await expect(page.getByTestId("kyc-error-alert")).toContainText("Error fetching KYC integration");
  });

  test("Source of funds error - submission failed", async ({ page }) => {
    // Set up wallet mock
    await setupMockWallet(page);

    // Mock auth challenge
    await mockAuthChallenge({ page, testUser: USER_KYC_APPROVED_NO_SOF });

    // Mock user endpoint
    await mockUser({ page, testUser: USER_KYC_APPROVED_NO_SOF });

    // Mock safe config
    await mockSafeConfig({
      page,
      testUser: USER_KYC_APPROVED_NO_SOF,
      configOverrides: {
        isDeployed: false,
        accountStatus: 1, // SafeNotDeployed
      },
    });

    // Mock source of funds endpoints with POST error
    await mockSourceOfFunds(page, {
      getResponse: DEFAULT_SOURCE_OF_FUNDS_QUESTIONS,
      postIsError: true,
      postErrorStatus: 500,
      postErrorResponse: {
        message: "Internal server error",
      },
    });

    // Navigate to safe deployment page
    await page.goto("/safe-deployment");

    // Wait for source of funds step to load
    await expect(page.getByTestId("source-of-funds-step")).toBeVisible();

    // Answer first question
    await page.getByTestId("source-of-funds-select-0").click();
    await page.getByRole("option", { name: "Employment income" }).click();

    // Answer second question
    await page.getByTestId("source-of-funds-select-1").click();
    await page.getByRole("option", { name: "€50,000 - €100,000" }).click();

    // Submit source of funds
    await page.getByTestId("source-of-funds-submit-button").click();

    // Wait for error alert to be displayed
    await expect(page.getByTestId("safe-deployment-error-alert")).toBeVisible({ timeout: 10000 });

    // Verify the error message contains information about the failure
    await expect(page.getByTestId("safe-deployment-error-alert")).toContainText("Internal server error");
  });

  test("Phone verification error - invalid phone number", async ({ page }) => {
    // Set up wallet mock
    await setupMockWallet(page);

    // Mock auth challenge
    await mockAuthChallenge({ page, testUser: USER_SOF_ANSWERED_NO_PHONE });

    // Mock user endpoint
    await mockUser({ page, testUser: USER_SOF_ANSWERED_NO_PHONE });

    // Mock safe config
    await mockSafeConfig({
      page,
      testUser: USER_SOF_ANSWERED_NO_PHONE,
      configOverrides: {
        isDeployed: false,
        accountStatus: 1, // SafeNotDeployed
      },
    });

    // Mock source of funds (already answered)
    await mockSourceOfFunds(page);

    // Mock phone verification with send error
    await mockPhoneVerification(page, {
      sendIsError: true,
      sendErrorStatus: 422,
      sendErrorResponse: {
        error: "Invalid phone number",
      },
    });

    // Navigate to safe deployment page
    await page.goto("/safe-deployment");

    // Wait for phone verification step to load
    await expect(page.getByTestId("phone-verification-step")).toBeVisible();

    // Enter invalid phone number (use a properly formatted but invalid number)
    await page.getByTestId("phone-number-input").fill("+1111111111");

    // Click continue
    await page.getByTestId("phone-continue-button").click();

    // Wait for phone confirmation form
    await expect(page.getByTestId("phone-confirm-form")).toBeVisible();

    // Click send code
    await page.getByTestId("phone-send-code-button").click();

    // Verify error alert is shown
    await expect(page.getByTestId("safe-deployment-error-alert")).toBeVisible();
    await expect(page.getByTestId("safe-deployment-error-alert")).toContainText("Invalid phone number");
  });

  test("Phone verification error - OTP verification failed", async ({ page }) => {
    // Set up wallet mock
    await setupMockWallet(page);

    // Mock auth challenge
    await mockAuthChallenge({ page, testUser: USER_SOF_ANSWERED_NO_PHONE });

    // Mock user endpoint
    await mockUser({ page, testUser: USER_SOF_ANSWERED_NO_PHONE });

    // Mock safe config
    await mockSafeConfig({
      page,
      testUser: USER_SOF_ANSWERED_NO_PHONE,
      configOverrides: {
        isDeployed: false,
        accountStatus: 1, // SafeNotDeployed
      },
    });

    // Mock source of funds (already answered)
    await mockSourceOfFunds(page);

    // Mock phone verification with check error
    await mockPhoneVerification(page, {
      checkIsError: true,
      checkErrorStatus: 422,
      checkErrorResponse: {
        error: "Verification failed",
      },
    });

    // Navigate to safe deployment page
    await page.goto("/safe-deployment");

    // Wait for phone verification step to load
    await expect(page.getByTestId("phone-verification-step")).toBeVisible();

    // Enter phone number
    await page.getByTestId("phone-number-input").fill("+1234567890");

    // Click continue
    await page.getByTestId("phone-continue-button").click();

    // Wait for phone confirmation form
    await expect(page.getByTestId("phone-confirm-form")).toBeVisible();

    // Click send code
    await page.getByTestId("phone-send-code-button").click();

    // Wait for OTP verification form
    await expect(page.getByTestId("otp-verification-form")).toBeVisible();

    // Enter wrong OTP code
    for (let i = 0; i < 6; i++) {
      await page.getByTestId(`otp-input-digit-${i}`).fill("0");
    }

    // Click verify
    await page.getByTestId("otp-verify-button").click();

    // Verify error alert is shown
    await expect(page.getByTestId("safe-deployment-error-alert")).toBeVisible();
    await expect(page.getByTestId("safe-deployment-error-alert")).toContainText("Verification failed");
  });

  test("Safe deployment error - deployment failed", async ({ page }) => {
    // Set up wallet mock
    await setupMockWallet(page);

    // Mock auth challenge
    await mockAuthChallenge({ page, testUser: USER_READY_FOR_SAFE_DEPLOYMENT });

    // Mock user endpoint
    await mockUser({ page, testUser: USER_READY_FOR_SAFE_DEPLOYMENT });

    // Mock safe config
    await mockSafeConfig({
      page,
      testUser: USER_READY_FOR_SAFE_DEPLOYMENT,
      configOverrides: {
        isDeployed: false,
        accountStatus: 1, // SafeNotDeployed
      },
    });

    // Mock source of funds and phone verification (already completed)
    await mockSourceOfFunds(page);
    await mockPhoneVerification(page);

    // Mock safe deployment with POST error
    await mockSafeDeployment(page, {
      deploymentStatus: "not_deployed", // GET returns this, triggering POST
      postIsError: true,
      postErrorStatus: 422,
      postErrorResponse: {
        error: "Safe account already exists",
      },
    });

    // Navigate to safe deployment page
    await page.goto("/safe-deployment");

    // Wait for safe-deployment page to load
    await expect(page.getByTestId("safe-deployment-page")).toBeVisible();

    // The component will:
    // 1. Load and transition to DeploySafe step (user has completed SoF and phone)
    // 2. Make GET request to check deployment status, get "not_deployed"
    // 3. Transition to Deploying and make POST request
    // 4. POST fails with error, which sets error state and hides steps

    // Wait for the POST request to complete (it may happen quickly)
    // Then wait for error alert to be displayed
    await expect(page.getByTestId("safe-deployment-error-alert")).toBeVisible({ timeout: 15000 });

    // Verify the error message contains information about the failure
    await expect(page.getByTestId("safe-deployment-error-alert")).toContainText("Safe account already exists");
  });

  test("Safe deployment error - deployment status failed", async ({ page }) => {
    // Set up wallet mock
    await setupMockWallet(page);

    // Mock auth challenge
    await mockAuthChallenge({ page, testUser: USER_READY_FOR_SAFE_DEPLOYMENT });

    // Mock user endpoint
    await mockUser({ page, testUser: USER_READY_FOR_SAFE_DEPLOYMENT });

    // Mock safe config
    await mockSafeConfig({
      page,
      testUser: USER_READY_FOR_SAFE_DEPLOYMENT,
      configOverrides: {
        isDeployed: false,
        accountStatus: 1, // SafeNotDeployed
      },
    });

    // Mock source of funds and phone verification (already completed)
    await mockSourceOfFunds(page);
    await mockPhoneVerification(page);

    // Mock safe deployment with failed status
    await mockSafeDeployment(page, {
      deploymentStatus: "failed",
    });

    // Navigate to safe deployment page
    await page.goto("/safe-deployment");

    // Wait for safe-deployment page to load
    await expect(page.getByTestId("safe-deployment-page")).toBeVisible();

    // Verify error alert is shown
    await expect(page.getByTestId("safe-deployment-error-alert")).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId("safe-deployment-error-alert")).toContainText(
      "An error occurred while deploying your Safe",
    );
  });

  test("Safe deployment error - invalid account status", async ({ page }) => {
    // Set up wallet mock
    await setupMockWallet(page);

    // Mock auth challenge
    await mockAuthChallenge({ page, testUser: USER_KYC_APPROVED_NO_SOF });

    // Mock user endpoint
    await mockUser({ page, testUser: USER_KYC_APPROVED_NO_SOF });

    // Mock safe config with invalid account status (2)
    await mockSafeConfig({
      page,
      testUser: USER_KYC_APPROVED_NO_SOF,
      configOverrides: {
        isDeployed: false,
        accountStatus: 2, // Invalid/unexpected status
      },
    });

    // Mock source of funds endpoints
    await mockSourceOfFunds(page);

    // Navigate to safe deployment page
    await page.goto("/safe-deployment");

    // Wait for safe-deployment page to load
    await expect(page.getByTestId("safe-deployment-page")).toBeVisible();

    // Verify error alert is shown with the expected account status
    await expect(page.getByTestId("safe-deployment-error-alert")).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId("safe-deployment-error-alert")).toContainText(
      "Your Safe is not properly configured. Safe status is 2. Please contact support.",
    );

    // Verify that no step components are displayed when error is shown
    // These components are conditionally rendered only when !error, so they should not exist in the DOM
    await expect(page.getByTestId("source-of-funds-step")).toHaveCount(0);
    await expect(page.getByTestId("phone-verification-step")).toHaveCount(0);
    await expect(page.getByTestId("deploy-safe-step")).toHaveCount(0);
  });
});

test.describe("Onboarding Flow - Redirect Behavior", () => {
  test("User not signed up - redirects from /safe-deployment to /register", async ({ page }) => {
    // Set up wallet mock
    await setupMockWallet(page);

    // Mock auth challenge for user not signed up
    await mockAuthChallenge({ page, testUser: USER_NOT_SIGNED_UP });

    // Mock user endpoint to return not signed up user
    await mockUser({ page, testUser: USER_NOT_SIGNED_UP });

    // Mock KYC integration endpoint (needed for KYC page redirect)
    await mockKycIntegration(page, {
      kycUrl: "https://mock-sumsub.example.com/kyc-flow",
    });

    // Navigate to safe-deployment page
    await page.goto("/safe-deployment");

    // Wait for redirect to register page
    // Note: May redirect through /kyc first, then to /register
    await expect(page).toHaveURL("/register", { timeout: 10000 });

    // Verify signup page is visible
    await expect(page.getByTestId("signup-page")).toBeVisible();
  });

  test("User not signed up - stays on /register", async ({ page }) => {
    // Set up wallet mock
    await setupMockWallet(page);

    // Mock auth challenge for user not signed up
    await mockAuthChallenge({ page, testUser: USER_NOT_SIGNED_UP });

    // Mock user endpoint to return not signed up user
    await mockUser({ page, testUser: USER_NOT_SIGNED_UP });

    // Navigate to register page
    await page.goto("/register");

    // Wait for signup page to load
    await expect(page.getByTestId("signup-page")).toBeVisible();

    // Verify we're still on /register (no redirect)
    await expect(page).toHaveURL("/register");
  });

  test("User signed up with no KYC - redirects from /register to /kyc", async ({ page }) => {
    // Set up wallet mock
    await setupMockWallet(page);

    // Mock auth challenge
    await mockAuthChallenge({ page, testUser: USER_SIGNED_UP_NO_KYC });

    // Mock user endpoint
    await mockUser({ page, testUser: USER_SIGNED_UP_NO_KYC });

    // Mock KYC integration endpoint
    await mockKycIntegration(page, {
      kycUrl: "https://mock-sumsub.example.com/kyc-flow",
    });

    // Navigate to register page
    await page.goto("/register");

    // Wait for redirect to KYC page
    await expect(page).toHaveURL("/kyc", { timeout: 10000 });

    // Verify KYC page is visible
    await expect(page.getByTestId("kyc-page")).toBeVisible();
  });

  test("User signed up with no KYC - redirects from /safe-deployment to /kyc", async ({ page }) => {
    // Set up wallet mock
    await setupMockWallet(page);

    // Mock auth challenge
    await mockAuthChallenge({ page, testUser: USER_SIGNED_UP_NO_KYC });

    // Mock user endpoint
    await mockUser({ page, testUser: USER_SIGNED_UP_NO_KYC });

    // Mock KYC integration endpoint
    await mockKycIntegration(page, {
      kycUrl: "https://mock-sumsub.example.com/kyc-flow",
    });

    // Navigate to safe-deployment page
    await page.goto("/safe-deployment");

    // Wait for redirect to KYC page
    await expect(page).toHaveURL("/kyc", { timeout: 10000 });

    // Verify KYC page is visible
    await expect(page.getByTestId("kyc-page")).toBeVisible();
  });

  test("User with KYC approved but no SoF - redirects from /register to /safe-deployment", async ({ page }) => {
    // Set up wallet mock
    await setupMockWallet(page);

    // Mock auth challenge
    await mockAuthChallenge({ page, testUser: USER_KYC_APPROVED_NO_SOF });

    // Mock user endpoint
    await mockUser({ page, testUser: USER_KYC_APPROVED_NO_SOF });

    // Mock safe config
    await mockSafeConfig({
      page,
      testUser: USER_KYC_APPROVED_NO_SOF,
      configOverrides: {
        isDeployed: false,
        accountStatus: 1, // SafeNotDeployed
      },
    });

    // Mock source of funds endpoints
    await mockSourceOfFunds(page);

    // Navigate to register page
    await page.goto("/register");

    // Wait for redirect to safe-deployment page
    // Note: May redirect through /kyc first, but redirect happens quickly
    await expect(page).toHaveURL("/safe-deployment", { timeout: 10000 });

    // Verify safe-deployment page is visible
    await expect(page.getByTestId("safe-deployment-page")).toBeVisible();
  });

  test("User with KYC approved but no SoF - redirects from /kyc to /safe-deployment", async ({ page }) => {
    // Set up wallet mock
    await setupMockWallet(page);

    // Mock auth challenge
    await mockAuthChallenge({ page, testUser: USER_KYC_APPROVED_NO_SOF });

    // Mock user endpoint
    await mockUser({ page, testUser: USER_KYC_APPROVED_NO_SOF });

    // Mock safe config
    await mockSafeConfig({
      page,
      testUser: USER_KYC_APPROVED_NO_SOF,
      configOverrides: {
        isDeployed: false,
        accountStatus: 1, // SafeNotDeployed
      },
    });

    // Mock source of funds endpoints
    await mockSourceOfFunds(page);

    // Navigate to KYC page
    await page.goto("/kyc");

    // Wait for redirect to safe-deployment page (since KYC is approved)
    await expect(page).toHaveURL("/safe-deployment", { timeout: 10000 });

    // Verify safe-deployment page is visible
    await expect(page.getByTestId("safe-deployment-page")).toBeVisible();
  });

  test("User with KYC approved but not safe deployed - redirects from /register to /safe-deployment", async ({
    page,
  }) => {
    // Set up wallet mock
    await setupMockWallet(page);

    // Mock auth challenge
    await mockAuthChallenge({ page, testUser: USER_READY_FOR_SAFE_DEPLOYMENT });

    // Mock user endpoint
    await mockUser({ page, testUser: USER_READY_FOR_SAFE_DEPLOYMENT });

    // Mock safe config with not deployed
    await mockSafeConfig({
      page,
      testUser: USER_READY_FOR_SAFE_DEPLOYMENT,
      configOverrides: {
        isDeployed: false,
        accountStatus: 1, // SafeNotDeployed
      },
    });

    // Mock source of funds and phone verification (already completed)
    await mockSourceOfFunds(page);
    await mockPhoneVerification(page);

    // Navigate to register page
    await page.goto("/register");

    // Wait for redirect to safe-deployment page
    // Note: May redirect through /kyc first, but redirect happens quickly
    await expect(page).toHaveURL("/safe-deployment", { timeout: 10000 });

    // Verify safe-deployment page is visible
    await expect(page.getByTestId("safe-deployment-page")).toBeVisible();
  });

  test("User with KYC approved but not safe deployed - redirects from /kyc to /safe-deployment", async ({ page }) => {
    // Set up wallet mock
    await setupMockWallet(page);

    // Mock auth challenge
    await mockAuthChallenge({ page, testUser: USER_READY_FOR_SAFE_DEPLOYMENT });

    // Mock user endpoint
    await mockUser({ page, testUser: USER_READY_FOR_SAFE_DEPLOYMENT });

    // Mock safe config with not deployed
    await mockSafeConfig({
      page,
      testUser: USER_READY_FOR_SAFE_DEPLOYMENT,
      configOverrides: {
        isDeployed: false,
        accountStatus: 1, // SafeNotDeployed
      },
    });

    // Mock source of funds and phone verification (already completed)
    await mockSourceOfFunds(page);
    await mockPhoneVerification(page);

    // Navigate to KYC page
    await page.goto("/kyc");

    // Wait for redirect to safe-deployment page (since KYC is approved)
    await expect(page).toHaveURL("/safe-deployment", { timeout: 10000 });

    // Verify safe-deployment page is visible
    await expect(page.getByTestId("safe-deployment-page")).toBeVisible();
  });
});
