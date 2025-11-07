# Gnosis Pay Rewards Section - Comprehensive Test Plan

## Application Overview

The Gnosis Pay Rewards section is a React-based component that displays user reward information including GNO token balance, cashback rates, and OG NFT status. The component features:

- **GNO Balance Display**: Shows user's GNO token balance with proper decimal formatting (floored to 2 decimal places)
- **Cashback Rate Calculation**: Displays base cashback rate (0-4%) based on GNO balance tiers
- **OG NFT Badge**: Special badge and +1% bonus for users holding OG NFT tokens
- **Dynamic Rate Display**: Total cashback rate including base rate + OG bonus
- **Error Handling**: Graceful error states with user-friendly messages
- **Loading States**: Skeleton loading indicators during data fetching
- **Responsive Design**: Proper layout within the home page grid system

## Cashback Rate Tiers

The cashback rate is calculated based on GNO balance thresholds:
- **0 GNO**: 0% base rate
- **2.5+ GNO**: 1% base rate  
- **10+ GNO**: 2% base rate
- **25+ GNO**: 3% base rate
- **50+ GNO**: 4% base rate (maximum)

OG NFT holders receive an additional +1% bonus on top of their base rate.

## Test Scenarios

### 1. Basic Rewards Display

**File:** `tests/rewards.spec.ts`

#### 1.1 New User with No GNO Balance
**Steps:**
1. Mock rewards API with `NEW_USER` scenario (0 GNO, 0% rate, not OG)
2. Navigate to home page
3. Wait for rewards section to load

**Expected Results:**
- Cashback rate displays "0.00%"
- GNO balance displays "0.00 GNO"
- OG badge is not visible
- "Cashback" and "GNO balance" labels are visible

#### 1.2 User with Small GNO Balance (2.5 GNO)
**Steps:**
1. Mock rewards API with `SMALL_BALANCE` scenario
2. Navigate to home page
3. Verify display values

**Expected Results:**
- Cashback rate displays "1.00%"
- GNO balance displays "2.50 GNO"
- No OG badge visible

#### 1.3 User with Medium GNO Balance (10 GNO)
**Steps:**
1. Mock rewards API with `MEDIUM_BALANCE` scenario
2. Navigate to home page
3. Verify display values

**Expected Results:**
- Cashback rate displays "2.00%"
- GNO balance displays "10.00 GNO"

#### 1.4 User with Large GNO Balance (50 GNO)
**Steps:**
1. Mock rewards API with `LARGE_BALANCE` scenario
2. Navigate to home page
3. Verify display values

**Expected Results:**
- Cashback rate displays "4.00%" (maximum base rate)
- GNO balance displays "50.00 GNO"

### 2. OG NFT Badge Display and Functionality

#### 2.1 OG User with No GNO Balance
**Steps:**
1. Mock rewards API with `OG_NO_BALANCE` scenario (isOg: true, 0 GNO, 0% base)
2. Navigate to home page
3. Verify OG badge and bonus calculation

**Expected Results:**
- OG badge "🧑‍🚀 OG" is visible
- Cashback rate displays "1.00%" (0% base + 1% OG bonus)
- GNO balance displays "0.00 GNO"

#### 2.2 OG User with Small Balance (2.5 GNO)
**Steps:**
1. Mock rewards API with `OG_SMALL_BALANCE` scenario
2. Navigate to home page
3. Verify OG bonus calculation

**Expected Results:**
- OG badge is visible
- Cashback rate displays "2.00%" (1% base + 1% OG bonus)
- GNO balance displays "2.50 GNO"

#### 2.3 OG User with Medium Balance (10 GNO)
**Steps:**
1. Mock rewards API with `OG_MEDIUM_BALANCE` scenario
2. Navigate to home page
3. Verify OG bonus calculation

**Expected Results:**
- OG badge is visible
- Cashback rate displays "3.00%" (2% base + 1% OG bonus)
- GNO balance displays "10.00 GNO"

#### 2.4 OG User with Large Balance (50 GNO)
**Steps:**
1. Mock rewards API with `OG_LARGE_BALANCE` scenario
2. Navigate to home page
3. Verify OG bonus calculation

**Expected Results:**
- OG badge is visible
- Cashback rate displays "5.00%" (4% base + 1% OG bonus)
- GNO balance displays "50.00 GNO"

#### 2.5 Maximum Rewards Scenario (100 GNO + OG)
**Steps:**
1. Mock rewards API with `MAX_REWARDS` scenario
2. Navigate to home page
3. Verify maximum possible rewards

**Expected Results:**
- OG badge is visible
- Cashback rate displays "5.00%" (4% max base + 1% OG)
- GNO balance displays "100.00 GNO"

### 3. GNO Balance Formatting

#### 3.1 Fractional Balance Formatting
**Steps:**
1. Mock rewards API with `FRACTIONAL_BALANCE` scenario (7.25 GNO)
2. Navigate to home page
3. Verify decimal formatting

**Expected Results:**
- GNO balance displays "7.25 GNO" with correct decimal places
- Cashback rate displays "1.50%"

#### 3.2 Very Small Balance Formatting
**Steps:**
1. Mock rewards API with `TINY_BALANCE` scenario (0.1 GNO)
2. Navigate to home page
3. Verify small amount formatting

**Expected Results:**
- GNO balance displays "0.10 GNO"
- Cashback rate displays "0.10%"

#### 3.3 Flooring Behavior Test
**Steps:**
1. Mock rewards API with custom scenario (0.616 GNO)
2. Navigate to home page
3. Verify flooring (not rounding) behavior

**Expected Results:**
- GNO balance displays "0.61 GNO" (floored to 2 decimals, not rounded)

### 4. Threshold Boundary Cases

#### 4.1 Exact 10 GNO Threshold (OG User)
**Steps:**
1. Mock rewards API with `OG_THRESHOLD_10` scenario
2. Navigate to home page
3. Verify threshold behavior

**Expected Results:**
- OG badge visible
- Cashback rate displays "3.00%" (2% base + 1% OG)
- GNO balance displays "10.00 GNO"

#### 4.2 Exact 25 GNO Threshold (OG User)
**Steps:**
1. Mock rewards API with `OG_THRESHOLD_25` scenario
2. Navigate to home page
3. Verify threshold behavior

**Expected Results:**
- Cashback rate displays "4.00%" (3% base + 1% OG)
- GNO balance displays "25.00 GNO"

#### 4.3 Exact 50 GNO Threshold (OG User)
**Steps:**
1. Mock rewards API with `OG_THRESHOLD_50` scenario
2. Navigate to home page
3. Verify threshold behavior

**Expected Results:**
- Cashback rate displays "5.00%" (4% base + 1% OG)
- GNO balance displays "50.00 GNO"

### 5. Loading States and Skeleton Display

#### 5.1 Loading State with Skeleton
**Steps:**
1. Mock delayed rewards API response (500ms delay)
2. Navigate to home page
3. Observe loading state before content appears

**Expected Results:**
- Skeleton elements with `animate-pulse` class are visible during loading
- After delay, actual content loads showing "2.00%" and "10.00 GNO"
- Smooth transition from skeleton to content

### 6. Error Handling

#### 6.1 API Error State
**Steps:**
1. Mock rewards API to return 500 error
2. Navigate to home page
3. Wait for error state to appear

**Expected Results:**
- Error alert with role="alert" is visible
- Error message contains "Error fetching rewards"
- Rewards content (GNO balance, Cashback labels) are not visible
- Error uses `StandardAlert` component with destructive variant

### 7. Layout and Visual Elements

#### 7.1 Rewards Section Layout Verification
**Steps:**
1. Mock rewards API with `OG_MEDIUM_BALANCE` scenario
2. Navigate to home page
3. Verify layout structure and positioning

**Expected Results:**
- Rewards section appears in correct position on page
- Cashback and GNO balance rows are properly aligned
- OG badge displays correctly when present
- Wallet icon is visible in cashback row

#### 7.2 Help Icon Integration
**Steps:**
1. Mock rewards API with any scenario
2. Navigate to home page
3. Verify help icon presence

**Expected Results:**
- "Rewards" title is visible
- Help icon integration follows existing pattern
- Proper accessibility attributes for help functionality

## Technical Implementation Notes

### Test Structure
- **Pattern**: Follows `balances.spec.ts` structure with `setupTest` helper
- **Mocking**: Uses `REWARDS_SCENARIOS` from `mockRewards.ts`
- **Assertions**: Uses Playwright's `expect` with descriptive test steps
- **Error Handling**: Tests both success and failure paths

### Mock Data Scenarios
All test scenarios use predefined mock data from `tests/utils/mockRewards.ts`:
- `NEW_USER`: 0 GNO, 0% rate, not OG
- `SMALL_BALANCE`: 2.5 GNO, 1% rate, not OG
- `MEDIUM_BALANCE`: 10 GNO, 2% rate, not OG
- `LARGE_BALANCE`: 50 GNO, 4% rate, not OG
- `OG_*` variants: Same balances but with OG status
- `MAX_REWARDS`: 100 GNO, 4% rate, OG
- `FRACTIONAL_BALANCE`: 7.25 GNO for decimal testing
- `TINY_BALANCE`: 0.1 GNO for small amount testing

### Key Testing Considerations
1. **Decimal Formatting**: Component floors GNO balance to 2 decimal places
2. **Rate Calculation**: Total rate = base rate + (OG ? 1% : 0%)
3. **Error States**: Uses `StandardAlert` with `extractErrorMessage`
4. **Loading States**: Skeleton components during API calls
5. **Responsive Design**: Component works within home page grid layout

## Success Criteria
- All 19 test scenarios pass consistently
- Component handles all reward tiers correctly
- OG NFT badge displays and calculates bonus properly
- GNO balance formatting follows business rules
- Error and loading states provide good user experience
- Layout integrates properly with overall page design

## Test Execution
Run tests with: `pnpm test tests/rewards.spec.ts`

All tests should pass with proper mock wallet setup and API mocking in place.



