# Gnosis Pay Card Transactions - Comprehensive Test Plan

## Application Overview

The Gnosis Pay Card Transactions section is a React-based component that displays user card transaction history with detailed interaction capabilities. The component features:

- **Transaction List Display**: Shows transactions grouped by date with merchant information, amounts, and status
- **Transaction Row Interaction**: Clickable transaction rows that open detailed modal views
- **Transaction Details Modal**: Comprehensive transaction information including status, cashback eligibility, exchange rates, and dispute options
- **Dispute Flow**: Multi-step dispute process with reason selection and submission
- **Loading States**: Skeleton loading indicators during data fetching
- **Error Handling**: Graceful error states with user-friendly messages
- **Pagination**: Load more functionality for large transaction histories
- **Empty States**: User-friendly display when no transactions exist
- **Responsive Design**: Mobile-first design with proper touch targets

## Transaction Types and States

The system supports three main transaction types:
- **Payment**: Standard card purchases with various status states
- **Refund**: Money returned to the account
- **Reversal**: Transactions that were reversed/cancelled

### Payment Status States
- **Approved**: Successfully completed transactions
- **Pending**: Authorized but not yet cleared transactions
- **Failed States**: IncorrectPin, InsufficientFunds, InvalidAmount, PinEntryTriesExceeded, IncorrectSecurityCode, Other

### Transaction Display Features
- **Amount Formatting**: Proper currency formatting with symbols and decimals
- **Status Indicators**: Visual status with help icons for pending, refund, and reversal states
- **Merchant Information**: Name, location, and category display
- **Time Display**: Transaction time in HH:mm format
- **Exchange Rate**: For multi-currency transactions
- **Cashback Eligibility**: Shows if transaction impacts cashback

## Required Data Test IDs

To enable comprehensive testing, the following `data-testid` attributes must be added to the components:

### CardTransactions Component
- `data-testid="card-transactions-component"` - Main container
- `data-testid="empty-transactions-icon"` - Empty state inbox icon
- `data-testid="empty-transactions-message"` - Empty state message

### Transaction Rows
- `data-testid="transaction-row-{index}"` - Individual transaction rows (0-based index)
- `data-testid="transaction-date-header"` - Date group headers
- `data-testid="transaction-merchant-name"` - Merchant name display
- `data-testid="transaction-amount"` - Transaction amount display
- `data-testid="transaction-status-pending"` - Pending status indicator
- `data-testid="transaction-status-refund"` - Refund status indicator
- `data-testid="transaction-status-reversal"` - Reversal status indicator

### Transaction Details Modal
- `data-testid="transaction-details-modal"` - Modal container
- `data-testid="modal-merchant-name"` - Merchant name in modal header
- `data-testid="modal-transaction-date"` - Transaction date/time
- `data-testid="modal-transaction-amount"` - Amount in modal header
- `data-testid="modal-transaction-status"` - Status field
- `data-testid="modal-cashback-status"` - Cashback eligibility
- `data-testid="modal-card-info"` - Card information
- `data-testid="modal-exchange-rate"` - Exchange rate (if applicable)
- `data-testid="modal-category"` - Transaction category
- `data-testid="modal-country"` - Country information
- `data-testid="modal-txhash"` - Transaction hash

### Dispute Flow
- `data-testid="dispute-transaction-button"` - Dispute button in modal
- `data-testid="dispute-reason-select"` - Reason selection dropdown
- `data-testid="dispute-submit-button"` - Submit dispute button
- `data-testid="dispute-back-button"` - Back button in dispute flow
- `data-testid="dispute-success-message"` - Success confirmation

### Load More
- `data-testid="load-more-button"` - Load more transactions button

## Test Scenarios

### 1. Basic Transaction List Display

**File:** `tests/card-transactions.spec.ts`

#### 1.1 Empty Transaction State
**Steps:**
1. Mock card transactions API with `empty` scenario (0 transactions)
2. Navigate to home page
3. Wait for card transactions section to load

**Expected Results:**
- Empty state displays with inbox icon (`data-testid="empty-transactions-icon"`)
- Message shows "No card transactions to display" (`data-testid="empty-transactions-message"`)
- No transaction rows are visible
- No date headers are shown
- Card transactions component is visible (`data-testid="card-transactions-component"`)

#### 1.2 Single Pending Transaction
**Steps:**
1. Mock card transactions API with `singlePending` scenario
2. Navigate to home page
3. Wait for card transactions section to load
4. Verify transaction display

**Expected Results:**
- One transaction row is visible (`data-testid="transaction-row-0"`)
- Date header shows current date (`data-testid="transaction-date-header"`)
- Merchant name "Coffee Shop" is displayed (`data-testid="transaction-merchant-name"`)
- Amount shows "- €3.50" (negative for payment) (`data-testid="transaction-amount"`)
- Status shows "Pending" with help icon (`data-testid="transaction-status-pending"`)
- Transaction row is clickable and opens modal on click

#### 1.3 Single Completed Transaction
**Steps:**
1. Mock card transactions API with `singleCompleted` scenario
2. Navigate to home page
3. Wait for card transactions section to load
4. Verify transaction display

**Expected Results:**
- One transaction row is visible
- Merchant name "Grocery Store" is displayed
- Amount shows "- €25.00"
- No pending status indicator
- Transaction displays completion state

#### 1.4 Mixed Transaction Types with Multi-Currency
**Steps:**
1. Mock card transactions API with `mixed` scenario including multi-currency transactions
2. Navigate to home page
3. Wait for card transactions section to load
4. Verify all transaction types and currencies display correctly

**Expected Results:**
- Multiple transaction rows are visible with `data-testid="transaction-row-{index}"` for targeting
- Payment shows "- €49.99" with Amazon merchant (`data-testid="transaction-merchant-name"`)
- Refund shows "+ €19.99" with "• Refund" status and help icon
- Reversal shows "+ $50.00" with "• Reversal" status and help icon (different currency)
- Multi-currency transaction shows both billing and transaction amounts
- All transactions are grouped by date with `data-testid="transaction-date-header"`
- Each transaction row has unique identifiers for targeting specific transactions

### 2. Transaction Row Interaction and Modal Opening

#### 2.1 Click Transaction to Open Modal
**Steps:**
1. Mock card transactions API with `singleCompleted` scenario
2. Navigate to home page
3. Wait for card transactions section to load
4. Click on the transaction row (`data-testid="transaction-row-0"`)
5. Verify modal opens

**Expected Results:**
- Transaction details modal opens (`data-testid="transaction-details-modal"`)
- Modal contains transaction information
- Modal has proper dialog structure with title
- Background is dimmed/overlay is visible

#### 2.2 Modal Displays Correct Transaction Data
**Steps:**
1. Mock card transactions API with detailed transaction data
2. Click on transaction row
3. Verify modal content

**Expected Results:**
- Merchant name and icon are displayed in header (`data-testid="modal-merchant-name"`)
- Transaction date and time are formatted correctly (`data-testid="modal-transaction-date"`)
- Amount is displayed with proper sign and currency (`data-testid="modal-transaction-amount"`)
- Status section shows transaction status (`data-testid="modal-transaction-status"`)
- Cashback eligibility is displayed (`data-testid="modal-cashback-status"`)
- Card information shows if available (`data-testid="modal-card-info"`)

#### 2.3 Close Modal Functionality
**Steps:**
1. Open transaction details modal
2. Test various close methods:
   - Click outside modal
   - Press Escape key
   - Click close button (if present)

**Expected Results:**
- Modal closes properly with all methods
- Returns to transaction list view
- No modal content remains visible

### 3. Transaction Details Modal Content

#### 3.1 Payment Transaction Details
**Steps:**
1. Mock approved payment transaction with full details
2. Open transaction modal
3. Verify all detail fields

**Expected Results:**
- Status shows "Completed" in green
- Cashback eligibility status is displayed
- Card information shows "••• 1234" format
- Transaction currency is shown if different from billing
- Exchange rate is displayed for multi-currency
- Category shows merchant category (e.g., "Grocery stores")
- Country shows with flag emoji
- TxHash shows shortened format with external link button

#### 3.2 Pending Transaction Details
**Steps:**
1. Mock pending payment transaction
2. Open transaction modal
3. Verify pending-specific display

**Expected Results:**
- Status shows "Pending" in warning color
- Pending help icon is displayed
- Status help icon shows "pending-merchant" type
- Other details display correctly

#### 3.3 Refund Transaction Details
**Steps:**
1. Mock refund transaction
2. Open transaction modal
3. Verify refund-specific display

**Expected Results:**
- Amount shows positive value with "+" sign
- Status shows "Refund • [Date]" format
- Refund help icon is displayed
- No exchange rate shown (single amount)
- Cashback typically shows as not eligible

#### 3.4 Reversal Transaction Details
**Steps:**
1. Mock reversal transaction
2. Open transaction modal
3. Verify reversal-specific display

**Expected Results:**
- Amount shows positive value with "+" sign
- Status shows "Reversal • [Date]" format
- Reversal help icon is displayed
- Proper reversal formatting

#### 3.5 Failed Transaction Details
**Steps:**
1. Mock payment with failed status (e.g., "IncorrectPin")
2. Open transaction modal
3. Verify failed transaction display

**Expected Results:**
- Amount shows with strikethrough formatting
- Status shows failure reason in destructive color
- Other details display correctly

### 4. External Link Functionality

#### 4.1 TxHash External Link
**Steps:**
1. Mock transaction with blockchain hash
2. Open transaction modal
3. Click external link button next to TxHash

**Expected Results:**
- New tab/window opens to gnosisscan.io
- URL contains the transaction hash
- Original modal remains open
- External link icon is visible and clickable

### 5. Dispute Flow Integration

#### 5.1 Dispute Button Availability
**Steps:**
1. Mock transaction with threadId (disputable)
2. Open transaction modal
3. Verify dispute button presence

**Expected Results:**
- "Dispute Transaction" button is visible at bottom (`data-testid="dispute-transaction-button"`)
- Button is styled as outline variant
- Button spans full width
- Button is clickable


#### 5.2 Start Dispute Flow
**Steps:**
1. Mock transaction with threadId
2. Mock dispute reasons API
3. Open transaction modal
4. Click "Dispute Transaction" button

**Expected Results:**
- Modal switches to dispute view
- Dispute section header shows "Dispute Transaction"
- Reason selection dropdown is visible
- Back button is available
- Submit button is disabled initially

### 6. Dispute Reason Selection and Submission

#### 6.1 Load Dispute Reasons
**Steps:**
1. Start dispute flow
2. Verify dispute reasons loading

**Expected Results:**
- Dropdown shows loading skeleton initially
- After loading, dropdown contains reason options
- Placeholder text shows "Select a reason..."
- Reasons are populated from API response

#### 6.2 Select Dispute Reason
**Steps:**
1. Load dispute reasons successfully
2. Click dropdown and select a reason
3. Verify selection

**Expected Results:**
- Dropdown shows selected reason text
- Submit button becomes enabled
- Selected value is properly stored

#### 6.3 Fraudulent Transaction Warning
**Steps:**
1. Select "unrecognized_transaction_report_fraudulent" reason
2. Verify warning display

**Expected Results:**
- Warning alert appears with card restriction message
- Alert uses warning variant (yellow/amber styling)
- Warning explains card will be temporarily restricted
- Submit button remains enabled

#### 6.4 24-Hour Restriction Check
**Steps:**
1. Mock transaction less than 24 hours old
2. Select non-fraudulent dispute reason
3. Verify restriction

**Expected Results:**
- Destructive alert appears explaining 24-hour rule
- Submit button becomes disabled
- Error message mentions automatic processing within one business day

#### 6.5 Submit Dispute Successfully
**Steps:**
1. Select valid dispute reason
2. Ensure transaction is disputable
3. Click "Submit Dispute" button
4. Mock successful API response

**Expected Results:**
- Button shows "Submitting..." during request
- Success view displays with checkmark icon
- Success message explains dispute submission
- Email notification message is shown
- Back button is available

#### 6.6 Dispute Submission Error
**Steps:**
1. Select dispute reason
2. Click submit
3. Mock API error response

**Expected Results:**
- Error alert displays with extracted error message
- Submit button re-enables
- User can retry submission
- Error uses StandardAlert with destructive variant

### 7. Loading States and Skeletons

#### 7.1 Initial Transaction Loading
**Steps:**
1. Mock delayed card transactions API (500ms delay)
2. Navigate to transactions page
3. Observe loading state

**Expected Results:**
- TransactionSkeleton component displays
- Multiple skeleton rows with proper structure
- Date skeleton placeholders
- Merchant name and amount skeletons
- Icon placeholder circles
- Smooth transition to actual content

#### 7.2 Load More Transactions Loading
**Steps:**
1. Mock transactions with pagination (hasNextPage: true)
2. Scroll to bottom and click "Load More"
3. Observe loading state

**Expected Results:**
- "Load More" button shows loading state
- Button text changes to "Loading..." or shows count
- Button is disabled during loading
- New transactions append to existing list
- Loading indicator on button

#### 7.3 Dispute Reasons Loading
**Steps:**
1. Start dispute flow
2. Observe dispute reasons loading

**Expected Results:**
- Dropdown shows skeleton placeholder
- Skeleton matches dropdown height
- After loading, skeleton is replaced with actual dropdown
- No flickering or layout shifts

### 8. Error Handling

#### 8.1 Transaction Fetch Error
**Steps:**
1. Mock card transactions API to return 500 error
2. Navigate to transactions page
3. Wait for error state

**Expected Results:**
- TransactionFetchingAlert component displays
- Error uses StandardAlert with destructive variant
- Title shows "Error fetching transactions"
- Description shows "Please try again later."
- No transaction content is visible

#### 8.2 Dispute Reasons Fetch Error
**Steps:**
1. Start dispute flow
2. Mock dispute reasons API to return error
3. Observe error handling

**Expected Results:**
- Error alert displays above dispute form
- Error message uses extractErrorMessage utility
- Dropdown remains in loading/error state
- User can potentially retry (if retry mechanism exists)

#### 8.3 Dispute Submission Error
**Steps:**
1. Complete dispute form
2. Mock submission API to return error
3. Submit dispute

**Expected Results:**
- Error alert displays with specific error message
- Form remains in submission state
- Submit button re-enables for retry
- User can modify selection and retry

### 9. Pagination and Load More

#### 9.1 Load More Button Visibility
**Steps:**
1. Mock transactions with hasNextPage: true
2. Navigate to transactions page
3. Verify load more button

**Expected Results:**
- "Load More" button appears at bottom
- Button is full width
- Button uses outline variant
- Button is enabled and clickable

#### 9.2 Load More Button Absence
**Steps:**
1. Mock transactions with hasNextPage: false
2. Navigate to transactions page
3. Verify no load more button

**Expected Results:**
- No "Load More" button is visible
- Transaction list ends naturally
- No pagination UI elements

#### 9.3 Load More Functionality
**Steps:**
1. Mock initial transactions (20 items)
2. Mock load more response (additional 50 items)
3. Click "Load More" button
4. Verify additional transactions load

**Expected Results:**
- Button shows loading state during request
- New transactions append to existing list
- Date grouping is maintained
- Button updates or disappears if no more pages

#### 9.4 Load More Button Text States
**Steps:**
1. Mock load more with nextTransactionRangeTo value
2. Click "Load More"
3. Observe button text changes

**Expected Results:**
- Initial state: "Load More"
- Loading with count: "Loading last [X] transactions..."
- Loading without count: "Loading..."
- Button text updates appropriately

### 10. Date Grouping and Formatting

#### 10.1 Transaction Date Grouping
**Steps:**
1. Mock transactions from multiple days
2. Verify date grouping behavior

**Expected Results:**
- Transactions are grouped by date
- Date headers show in readable format
- Each date group contains appropriate transactions
- Chronological ordering is maintained

#### 10.2 Date Format Display
**Steps:**
1. Mock transactions with various dates
2. Verify date formatting

**Expected Results:**
- Date headers use consistent format
- Time displays in HH:mm format within transactions
- Modal shows full date/time: "MMM dd, yyyy 'at' HH:mm"
- Timezone handling is appropriate

### 11. Currency and Amount Formatting

#### 11.1 Single Currency Transactions
**Steps:**
1. Mock EUR-only transactions
2. Verify currency display

**Expected Results:**
- Amounts show with EUR symbol (€)
- Proper decimal formatting (2 decimal places)
- Negative amounts for payments (-)
- Positive amounts for refunds/reversals (+)

#### 11.2 Multi-Currency Transactions
**Steps:**
1. Mock transaction with different billing and transaction currencies
2. Open transaction modal
3. Verify currency handling

**Expected Results:**
- Primary amount shows billing currency
- Secondary amount shows transaction currency
- Exchange rate is calculated and displayed
- Both currencies are properly formatted

#### 11.3 Large Amount Formatting
**Steps:**
1. Mock transactions with large amounts (>1000)
2. Verify formatting

**Expected Results:**
- Large amounts format correctly
- Proper thousand separators if applicable
- No overflow in UI elements
- Consistent decimal places

## Technical Implementation Notes

### Test Structure
- **Pattern**: Follow existing test patterns from `rewards.spec.ts` and `balances.spec.ts`
- **Mocking**: Use `mockCardTransactions` and `CARD_TRANSACTIONS_SCENARIOS` from `mockCardTransactions.ts`
- **Assertions**: Use Playwright's `expect` with descriptive test steps
- **Error Handling**: Test both success and failure paths

### Mock Data Scenarios
All test scenarios use predefined mock data from `tests/utils/mockCardTransactions.ts`:
- `empty`: No transactions
- `singlePending`: One pending payment
- `singleCompleted`: One completed payment
- `mixed`: Payment, refund, and reversal transactions
- Custom scenarios can be created using `createPayment`, `createRefund`, `createReversal` helpers

### Key Testing Considerations
1. **Transaction Types**: Test all three types (Payment, Refund, Reversal) with various statuses
2. **Modal Interactions**: Ensure proper opening, closing, and navigation
3. **Dispute Flow**: Complete end-to-end dispute process testing
4. **Error States**: Comprehensive error handling for all API calls
5. **Loading States**: Skeleton displays and loading indicators
6. **Responsive Design**: Mobile-first approach with touch-friendly interactions
7. **Accessibility**: Proper ARIA labels, keyboard navigation, screen reader support

### API Endpoints Tested
- `GET /api/v1/cards/transactions` - Transaction list with pagination
- `GET /api/v1/transactions/dispute` - Dispute reasons
- `POST /api/v1/transactions/{threadId}/dispute` - Submit dispute

## Success Criteria
- All 40+ test scenarios pass consistently
- Component handles all transaction types and statuses correctly
- Modal interactions work seamlessly
- Dispute flow completes successfully
- Error and loading states provide good user experience
- Responsive design works across all device sizes
- Accessibility requirements are met
- Performance is acceptable with large transaction lists

## Test Execution
Run tests with: `pnpm test tests/card-transactions.spec.ts`

All tests should pass with proper mock wallet setup, API mocking, and test user configuration in place.
