import { test, expect } from "@playwright/test";
import { setupMockWallet } from "./utils/mockWallet";
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
  USER_SIGNED_UP_NO_KYC_REQUIRES_ACTION,
} from "./utils/testUsers";

test.describe("Onboarding Flow - Happy Path", () => {
  test("Complete onboarding flow from KYC to safe deployment", async ({ page }) => {
    // Set up wallet mock
    await setupMockWallet(page);

    // ========================================================================
    // STEP 1: KYC
    // ========================================================================

    // Sign-ups are closed, so onboarding starts from an existing account without KYC
    await mockAuthChallenge({ page, testUser: USER_SIGNED_UP_NO_KYC });

    // Mock user endpoint to return a signed up user without KYC
    await mockUser({ page, testUser: USER_SIGNED_UP_NO_KYC });

    // Mock KYC integration endpoint
    await mockKycIntegration(page, {
      kycUrl: "https://mock-sumsub.example.com/kyc-flow",
    });

    // Navigate to the KYC page
    await page.goto("/kyc");

    // Wait for KYC page to load
    await expect(page.getByTestId("kyc-page")).toBeVisible();

    // Verify KYC iframe is loaded
    await expect(page.getByTestId("kyc-iframe")).toBeVisible();

    // ========================================================================
    // STEP 2: Source of Funds
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
    // STEP 3: Phone Verification
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
    // STEP 4: Safe Deployment
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
  test("KYC error - requires action", async ({ page }) => {
    // Set up wallet mock
    await setupMockWallet(page);

    // Mock auth challenge
    await mockAuthChallenge({ page, testUser: USER_SIGNED_UP_NO_KYC });

    // Mock user endpoint
    await mockUser({ page, testUser: USER_SIGNED_UP_NO_KYC_REQUIRES_ACTION });

    // Mock KYC integration endpoint with error
    await mockKycIntegration(page);

    // Navigate to KYC page
    await page.goto("/kyc");

    // Wait for KYC page to load
    await expect(page.getByTestId("kyc-page")).toBeVisible();

    // Verify error alert is shown
    await expect(page.getByTestId("kyc-error-alert")).toBeVisible();
    await expect(page.getByTestId("kyc-error-alert")).toContainText(
      "Your KYC application has encountered an issue. Please contact the support using the chat widget",
    );

    // Verify contact support button is shown
    await expect(page.getByTestId("kyc-contact-support-button")).toBeVisible();

    // Click contact support button
    await page.getByTestId("kyc-contact-support-button").click();

    // Verify Zendesk chat iframe is opened
    await expect(page.getByTitle("Button to launch messaging window, conversation in progress")).toBeVisible();
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
});

test.describe("Onboarding Flow - Redirect Behavior", () => {
  test("User not signed up - sees the Rebind screen on /safe-deployment", async ({ page }) => {
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

    // Sign-ups are closed, so the onboarding routes are gated too
    await expect(page.getByRole("heading", { name: "Sign-ups are closed" })).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId("safe-deployment-page")).not.toBeVisible();
  });

  test("User not signed up - sees the Rebind screen on /register", async ({ page }) => {
    // Set up wallet mock
    await setupMockWallet(page);

    // Mock auth challenge for user not signed up
    await mockAuthChallenge({ page, testUser: USER_NOT_SIGNED_UP });

    // Mock user endpoint to return not signed up user
    await mockUser({ page, testUser: USER_NOT_SIGNED_UP });

    // Navigate to register page
    await page.goto("/register");

    // The signup page is no longer reachable
    await expect(page.getByRole("heading", { name: "Sign-ups are closed" })).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId("signup-page")).not.toBeVisible();

    // Verify the URL is untouched, the guard renders in place
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
