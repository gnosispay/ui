# Virtual Card Order - Comprehensive Test Plan

## Application Overview

The Virtual Card Order feature allows users to instantly create a virtual card for online purchases directly from the home page. The feature is accessible through the Cards component and provides a multi-step modal flow:

### Key Features
- **Instant Card Creation**: Virtual cards are activated immediately without shipping or payment validation
- **Modal-Based Flow**: Two-step dialog process (selection → confirmation)
- **Card Type Selection**: Choose between Virtual and Physical card options
- **API Integration**: Uses `/api/v1/cards/virtual` POST endpoint
- **Card Limits**: Maximum of 5 active cards (physical + virtual combined, excluding voided/lost/stolen)
- **Context Updates**: Automatically refreshes card list after successful creation
- **Error Handling**: Displays collapsed error messages via toast notifications
- **Navigation**: Physical card option redirects to `/card-order/new` page

### User Flow
1. User clicks "Add card" button from the Cards component on the home page
2. "Order a card" modal opens showing card type selection
3. User selects "Virtual Card" option
4. "Virtual card order" confirmation screen displays with description
5. User clicks "Order Virtual Card" button
6. API request is made to create the virtual card
7. Success toast appears and modal closes
8. Cards list refreshes to show the new virtual card

### Technical Components
- **CardsOrderModal**: Main dialog container managing modal state and step transitions
- **CardsOrderSelection**: First step showing Virtual/Physical card options
- **CardsOrderVirtual**: Second step for virtual card confirmation and creation
- **Cards Component**: Entry point with "Add card" button
- **API**: `postApiV1CardsVirtual()` endpoint for card creation

## Test Scenarios

### 1. Opening the Virtual Card Order Modal

#### 1.1 Open Modal from Home Page Cards Component
**Starting State:** User is logged in and viewing the home page with at least one existing card

**Steps:**
1. Navigate to the home page (`/`)
2. Wait for the page to fully load
3. Locate the Cards section on the home page
4. Identify the "Add card" button (button with plus icon)
5. Click the "Add card" button

**Expected Results:**
- Modal dialog appears with overlay
- Modal has heading "Order a card"
- Modal displays two card type options:
  - "Virtual Card" with Smartphone icon and description "Instant digital card for online purchases"
  - "Physical Card" with CreditCard icon and description "Physical card delivered to your address"
- Both options have chevron-right icons indicating they are clickable
- Modal has proper focus management (focus trapped within modal)
- Background content is not scrollable (modal overlay prevents interaction)

#### 1.2 Open Modal When User Has No Cards
**Starting State:** User is logged in with no existing cards

**Steps:**
1. Navigate to the home page (`/`)
2. Wait for the page to fully load
3. Locate the Cards section showing empty state
4. Click the "Add card" button

**Expected Results:**
- Modal opens successfully (same as 1.1)
- All card type options are available
- No errors or warnings about card limits

#### 1.3 Modal Accessibility
**Starting State:** User is on the home page

**Steps:**
1. Navigate to the home page using keyboard only (Tab key)
2. Tab to the "Add card" button
3. Press Enter or Space key to activate

**Expected Results:**
- Modal opens via keyboard interaction
- Focus moves to the first interactive element in the modal
- Escape key closes the modal
- Tab key cycles through modal elements only (focus trap)
- Screen reader announces modal title and role

### 2. Selecting Virtual Card Option

#### 2.1 Click Virtual Card Option
**Starting State:** "Order a card" modal is open on selection step

**Steps:**
1. Open the card order modal (see 1.1)
2. Locate the "Virtual Card" option
3. Click anywhere on the "Virtual Card" option button

**Expected Results:**
- Modal transitions to the virtual card confirmation step
- Modal heading changes to "Virtual card order"
- Description text appears: "The card will be available in your dashboard immediately for online purchases. You can also add it manually to your mobile wallet for offline purchases."
- Two buttons appear at the bottom:
  - "Back" button (outline variant)
  - "Order Virtual Card" button (primary variant)
- No loading state is active initially
- Previous selection screen is no longer visible

#### 2.2 Hover States on Virtual Card Option
**Starting State:** "Order a card" modal is open on selection step

**Steps:**
1. Open the card order modal
2. Move mouse over the "Virtual Card" option (without clicking)

**Expected Results:**
- Background color changes to muted/hover state
- Cursor changes to pointer
- Option remains clickable
- No other visual changes occur

#### 2.3 Virtual Card Option Keyboard Navigation
**Starting State:** "Order a card" modal is open on selection step

**Steps:**
1. Open the card order modal
2. Use Tab key to focus on "Virtual Card" option
3. Press Enter or Space key

**Expected Results:**
- Virtual Card option receives visible focus indicator
- Pressing Enter or Space activates the option
- Modal transitions to confirmation step (same as 2.1)

### 3. Virtual Card Confirmation Step

#### 3.1 Review Confirmation Information
**Starting State:** Virtual card confirmation step is displayed

**Steps:**
1. Navigate to virtual card confirmation step (see 2.1)
2. Review all displayed information

**Expected Results:**
- Modal title is "Virtual card order"
- Description text is clear and informative
- "Back" button is visible and enabled
- "Order Virtual Card" button is visible and enabled
- No loading indicators are present
- No error messages are displayed

#### 3.2 Go Back to Selection
**Starting State:** Virtual card confirmation step is displayed

**Steps:**
1. Navigate to virtual card confirmation step
2. Click the "Back" button

**Expected Results:**
- Modal transitions back to card type selection step
- Modal heading changes back to "Order a card"
- Both Virtual and Physical card options are visible again
- No data is lost or reset
- User can select Virtual Card option again

#### 3.3 Multiple Back and Forward Navigation
**Starting State:** "Order a card" modal is open

**Steps:**
1. Open modal and select "Virtual Card"
2. Click "Back" button
3. Select "Virtual Card" again
4. Click "Back" button again
5. Select "Virtual Card" a third time

**Expected Results:**
- Each transition works smoothly without errors
- Modal state resets properly on each back navigation
- No duplicate API calls are made
- UI remains responsive throughout

### 4. Successful Virtual Card Creation

#### 4.1 Order Virtual Card Successfully
**Starting State:** Virtual card confirmation step is displayed, user has fewer than 5 active cards

**Steps:**
1. Navigate to virtual card confirmation step
2. Click "Order Virtual Card" button
3. Wait for API request to complete

**Expected Results:**
- "Order Virtual Card" button shows loading state immediately (spinner appears)
- Button is disabled during loading
- API POST request is made to `/api/v1/cards/virtual`
- Success toast notification appears with message "Virtual card ordered successfully"
- Modal closes automatically after success
- Cards list on home page refreshes automatically
- New virtual card appears in the cards list
- New card shows:
  - Last four digits
  - "Virtual" label
  - Active status (no overlay icons)
- Page remains on home page (`/`)

#### 4.2 Verify New Card in Cards List
**Starting State:** Virtual card was just created successfully

**Steps:**
1. After successful card creation, locate the Cards section
2. Find the newly created virtual card
3. Verify card details

**Expected Results:**
- New virtual card is visible in the cards list
- Card displays correct last four digits
- Card shows "Virtual" type label
- Card has "Active" status (or appropriate status from API)
- Card is clickable and navigates to card details
- Card count increased by one

#### 4.3 Order Multiple Virtual Cards
**Starting State:** User has 0 virtual cards

**Steps:**
1. Order first virtual card (see 4.1)
2. Wait for success and card list refresh
3. Open card order modal again
4. Order second virtual card
5. Wait for success and card list refresh
6. Repeat until user has multiple virtual cards

**Expected Results:**
- Each card creation succeeds independently
- All created cards appear in the cards list
- Each card has unique last four digits
- Cards are displayed in order (newest first or as per API)
- No duplicate cards appear
- Card limit enforcement works (stops at 5 total active cards)

### 5. Error Handling

#### 5.1 API Error During Card Creation
**Starting State:** Virtual card confirmation step is displayed, API will return error

**Steps:**
1. Navigate to virtual card confirmation step
2. Mock API to return error response (e.g., 500 Internal Server Error)
3. Click "Order Virtual Card" button
4. Wait for API request to complete

**Expected Results:**
- Button shows loading state during request
- Error toast notification appears with collapsed error component
- Toast title is "Error ordering card"
- Error details are collapsible/expandable
- Modal remains open (does not close on error)
- Button returns to enabled state
- User can try again by clicking button again
- Cards list is not refreshed
- No new card appears in the list

#### 5.2 Network Timeout During Card Creation
**Starting State:** Virtual card confirmation step is displayed

**Steps:**
1. Navigate to virtual card confirmation step
2. Simulate network timeout (slow connection)
3. Click "Order Virtual Card" button
4. Wait for timeout to occur

**Expected Results:**
- Button shows loading state
- After timeout, error toast appears
- Error message indicates network/timeout issue
- Modal remains open
- Button becomes enabled again
- User can retry the operation

#### 5.3 Card Limit Exceeded Error
**Starting State:** User already has 5 active cards

**Steps:**
1. Navigate to virtual card confirmation step
2. Click "Order Virtual Card" button
3. Wait for API response

**Expected Results:**
- API returns error about card limit
- Error toast appears with message about maximum cards
- Error message is clear: "Maximum of 5 active cards reached" (or similar)
- Modal remains open
- User can close modal or go back
- No new card is created

#### 5.4 Authentication Error During Creation
**Starting State:** User's session expires during the flow

**Steps:**
1. Navigate to virtual card confirmation step
2. Simulate session expiration
3. Click "Order Virtual Card" button

**Expected Results:**
- API returns 401 Unauthorized error
- Error toast appears
- User is redirected to login page (if auth guard triggers)
- Or error message prompts user to re-authenticate
- No partial card creation occurs

#### 5.5 Retry After Error
**Starting State:** Previous card creation attempt failed with error

**Steps:**
1. Encounter an error during card creation (see 5.1)
2. Wait for error toast to appear
3. Dismiss error toast (if needed)
4. Click "Order Virtual Card" button again

**Expected Results:**
- New API request is made
- Button shows loading state again
- If API succeeds this time, normal success flow occurs
- If API fails again, error handling repeats
- No duplicate requests are made simultaneously
- UI remains stable throughout retries

### 6. Modal Closing Behavior

#### 6.1 Close Modal via X Button on Selection Step
**Starting State:** "Order a card" modal is open on selection step

**Steps:**
1. Open the card order modal
2. Locate and click the X (close) button in modal header
3. Observe modal behavior

**Expected Results:**
- Modal closes immediately
- Modal overlay disappears
- Focus returns to the "Add card" button
- Home page is still visible
- No API requests are made
- Modal state resets to selection step

#### 6.2 Close Modal via X Button on Confirmation Step
**Starting State:** Virtual card confirmation step is displayed

**Steps:**
1. Navigate to virtual card confirmation step
2. Click the X (close) button in modal header

**Expected Results:**
- Modal closes immediately
- Modal overlay disappears
- Focus returns to the "Add card" button
- Modal state resets (next opening shows selection step)
- No API requests are made

#### 6.3 Close Modal via Overlay Click on Selection Step
**Starting State:** "Order a card" modal is open on selection step

**Steps:**
1. Open the card order modal
2. Click on the dark overlay area outside the modal

**Expected Results:**
- Modal closes
- Same behavior as 6.1

#### 6.4 Close Modal via Overlay Click on Confirmation Step
**Starting State:** Virtual card confirmation step is displayed

**Steps:**
1. Navigate to virtual card confirmation step
2. Click on the overlay outside the modal

**Expected Results:**
- Modal closes
- Modal state resets to selection step
- Same behavior as 6.2

#### 6.5 Close Modal via Escape Key
**Starting State:** Modal is open (any step)

**Steps:**
1. Open the card order modal
2. Press Escape key

**Expected Results:**
- Modal closes immediately
- Focus returns to trigger button
- Modal state resets
- Works on both selection and confirmation steps

#### 6.6 Close Modal During Loading State
**Starting State:** Virtual card creation is in progress (loading)

**Steps:**
1. Navigate to virtual card confirmation step
2. Click "Order Virtual Card" button
3. While button shows loading state, try to close modal via X button or overlay

**Expected Results:**
- Modal should either:
  - Prevent closing during API request (recommended)
  - Or allow closing but cancel the API request
- If modal closes during request, no success toast should appear
- If modal prevents closing, X button and overlay clicks are ignored
- Escape key behavior should match X button behavior

#### 6.7 Modal State Reset After Closing
**Starting State:** Virtual card confirmation step is displayed

**Steps:**
1. Navigate to virtual card confirmation step
2. Close the modal (any method)
3. Open the modal again by clicking "Add card"

**Expected Results:**
- Modal opens on the selection step (not confirmation step)
- No previous state is retained
- Both card type options are visible
- Modal appears fresh and clean

### 7. Physical Card Option Verification

#### 7.1 Select Physical Card Option
**Starting State:** "Order a card" modal is open on selection step

**Steps:**
1. Open the card order modal
2. Click the "Physical Card" option

**Expected Results:**
- Modal closes immediately
- User is navigated to `/card-order/new` page
- URL changes to the physical card order page
- Modal does not transition to a confirmation step
- No API request is made for virtual card

#### 7.2 Physical Card Option Does Not Affect Virtual Flow
**Starting State:** "Order a card" modal is open

**Steps:**
1. Open the card order modal
2. Click "Physical Card" option
3. Navigate back to home page
4. Open the card order modal again
5. Select "Virtual Card" option

**Expected Results:**
- Virtual card flow works normally
- No interference from previous physical card selection
- Modal state is independent between openings

### 8. Edge Cases and Boundary Conditions

#### 8.1 Rapid Button Clicking
**Starting State:** Virtual card confirmation step is displayed

**Steps:**
1. Navigate to virtual card confirmation step
2. Rapidly click "Order Virtual Card" button multiple times in quick succession
3. Observe behavior

**Expected Results:**
- Only one API request is made
- Button disables after first click
- Subsequent clicks have no effect
- Only one success toast appears
- Only one card is created
- No duplicate cards in the list

#### 8.2 Order Card at Exactly 4 Active Cards
**Starting State:** User has exactly 4 active cards

**Steps:**
1. Verify user has 4 active cards
2. Open card order modal
3. Navigate to virtual card confirmation
4. Click "Order Virtual Card"

**Expected Results:**
- Card creation succeeds
- User now has 5 active cards (the maximum)
- Success toast appears
- New card appears in list

#### 8.3 Order Card When Already at 5 Active Cards
**Starting State:** User has exactly 5 active cards (the maximum)

**Steps:**
1. Verify user has 5 active cards
2. Open card order modal
3. Navigate to virtual card confirmation
4. Click "Order Virtual Card"

**Expected Results:**
- API returns error about card limit
- Error toast appears with clear message
- No new card is created
- User remains at 5 cards
- Modal remains open for user to close

#### 8.4 Voided Cards Don't Count Toward Limit
**Starting State:** User has 3 active cards and 2 voided cards

**Steps:**
1. Verify user has 3 active cards (voided cards excluded)
2. Order a new virtual card
3. Verify success

**Expected Results:**
- Card creation succeeds (3 < 5 limit)
- Voided cards are not counted in the limit
- User now has 4 active cards
- Voided cards still appear as voided (not affected)

#### 8.5 Lost/Stolen Cards Don't Count Toward Limit
**Starting State:** User has 3 active cards, 1 lost card, 1 stolen card

**Steps:**
1. Verify user has 3 active cards
2. Order a new virtual card
3. Verify success

**Expected Results:**
- Card creation succeeds
- Lost and stolen cards don't count toward 5-card limit
- User now has 4 active cards

#### 8.6 Slow Network Connection
**Starting State:** Simulated slow 3G network

**Steps:**
1. Enable network throttling (slow 3G)
2. Navigate to virtual card confirmation step
3. Click "Order Virtual Card"
4. Observe loading behavior

**Expected Results:**
- Button shows loading state
- Loading state persists until API responds
- No timeout error for reasonable delays (< 30 seconds)
- Success or error handling works normally
- UI remains responsive (no freezing)

#### 8.7 Modal Open During Page Navigation
**Starting State:** Modal is open on selection step

**Steps:**
1. Open the card order modal
2. Use browser back button or navigate away
3. Observe behavior

**Expected Results:**
- Modal closes when navigation occurs
- Or modal remains open if navigation is prevented
- No errors in console
- Page navigation completes successfully

#### 8.8 Multiple Modals Interaction
**Starting State:** User has other modals available (e.g., Send Funds, Add Funds)

**Steps:**
1. Open the card order modal
2. Without closing it, try to open another modal (if possible)

**Expected Results:**
- Only one modal is open at a time
- Opening a new modal closes the current one
- Or the app prevents opening multiple modals
- No overlapping modals appear
- No z-index issues

### 9. Mobile Responsiveness

#### 9.1 Open Modal on Mobile Viewport
**Starting State:** Browser viewport set to mobile size (e.g., 375x667)

**Steps:**
1. Resize browser to mobile dimensions
2. Navigate to home page
3. Locate and tap "Add card" button
4. Observe modal appearance

**Expected Results:**
- Modal appears properly sized for mobile
- Modal content is readable without horizontal scrolling
- Touch targets are appropriately sized (minimum 44x44px)
- Modal doesn't overflow viewport
- Text is legible at mobile sizes

#### 9.2 Virtual Card Selection on Mobile
**Starting State:** Modal is open on mobile viewport

**Steps:**
1. Open modal on mobile viewport
2. Tap "Virtual Card" option
3. Review confirmation step
4. Tap "Order Virtual Card"

**Expected Results:**
- All interactions work via touch
- Buttons are easy to tap (no mis-taps)
- Loading states are visible
- Toast notifications appear properly on mobile
- Modal transitions are smooth

#### 9.3 Modal Scrolling on Small Screens
**Starting State:** Modal is open on very small mobile viewport (e.g., 320x568)

**Steps:**
1. Resize to very small mobile size
2. Open modal
3. Check if content fits or requires scrolling

**Expected Results:**
- If content doesn't fit, modal body is scrollable
- Modal header and footer remain fixed (if applicable)
- Scrolling is smooth and natural
- All content is accessible via scrolling
- No content is cut off or hidden

#### 9.4 Landscape Orientation on Mobile
**Starting State:** Mobile device in landscape orientation

**Steps:**
1. Rotate device to landscape
2. Open card order modal
3. Complete virtual card order flow

**Expected Results:**
- Modal adapts to landscape orientation
- Content remains readable and accessible
- Buttons remain reachable
- No layout breaking occurs

### 10. Performance and Loading States

#### 10.1 Initial Modal Render Performance
**Starting State:** User is on home page

**Steps:**
1. Open browser performance tools
2. Click "Add card" button
3. Measure time to modal appearance

**Expected Results:**
- Modal appears within 100ms of click
- No visible lag or jank
- Smooth animation/transition
- No layout shifts during opening

#### 10.2 Cards List Refresh After Creation
**Starting State:** Virtual card was just created successfully

**Steps:**
1. Complete virtual card creation
2. Observe cards list update
3. Measure time from success toast to card appearance

**Expected Results:**
- Cards list refreshes automatically
- New card appears within 1-2 seconds
- Loading state may appear briefly during refresh
- No full page reload occurs
- Other cards remain visible during refresh

#### 10.3 Modal State Management Performance
**Starting State:** Modal is open

**Steps:**
1. Navigate between selection and confirmation steps multiple times
2. Observe transition performance

**Expected Results:**
- Step transitions are instant (< 50ms)
- No flickering or flash of content
- Smooth visual transitions
- No memory leaks from repeated navigation

### 11. Accessibility (A11y)

#### 11.1 Screen Reader Announcements
**Starting State:** Screen reader is active (e.g., NVDA, JAWS, VoiceOver)

**Steps:**
1. Navigate to home page with screen reader
2. Locate "Add card" button
3. Activate button
4. Navigate through modal content

**Expected Results:**
- "Add card" button is announced with proper label
- Modal opening is announced
- Modal title "Order a card" is announced
- Card type options are announced with descriptions
- Button roles and states are announced
- Loading states are announced ("Loading" or "Busy")
- Success/error toasts are announced

#### 11.2 Keyboard-Only Navigation
**Starting State:** User navigates using only keyboard

**Steps:**
1. Tab to "Add card" button
2. Press Enter to open modal
3. Tab through modal options
4. Select "Virtual Card" with Enter
5. Tab to "Order Virtual Card" button
6. Press Enter to create card

**Expected Results:**
- All interactive elements are reachable via Tab
- Focus order is logical (top to bottom, left to right)
- Focus indicators are clearly visible
- Enter/Space activate buttons
- Escape closes modal
- Focus returns to trigger after modal closes
- No keyboard traps

#### 11.3 Focus Management
**Starting State:** Modal is closed

**Steps:**
1. Click "Add card" button
2. Observe where focus goes when modal opens
3. Navigate through modal
4. Close modal
5. Observe where focus returns

**Expected Results:**
- Focus moves into modal when opened
- Focus is trapped within modal (Tab cycles within modal)
- Focus returns to "Add card" button when modal closes
- Focus is visible at all times
- Focus order makes logical sense

#### 11.4 Color Contrast and Visual Accessibility
**Starting State:** Modal is open

**Steps:**
1. Open modal
2. Check color contrast ratios using accessibility tools
3. Test in both light and dark modes

**Expected Results:**
- Text has minimum 4.5:1 contrast ratio (WCAG AA)
- Interactive elements have 3:1 contrast ratio
- Focus indicators have 3:1 contrast ratio
- Works in both light and dark themes
- Icons have sufficient contrast
- Disabled states are visually distinguishable

#### 11.5 ARIA Attributes and Roles
**Starting State:** Modal is open

**Steps:**
1. Open modal
2. Inspect DOM with accessibility tree
3. Verify ARIA attributes

**Expected Results:**
- Modal has `role="dialog"`
- Modal has `aria-modal="true"`
- Modal has `aria-labelledby` pointing to title
- Buttons have appropriate `aria-label` if needed
- Loading states have `aria-busy="true"`
- Disabled states have `aria-disabled="true"`
- All interactive elements have accessible names

### 12. Integration with Cards Context

#### 12.1 Cards Context Refresh After Creation
**Starting State:** Virtual card creation is successful

**Steps:**
1. Monitor Cards Context state
2. Complete virtual card creation
3. Observe context updates

**Expected Results:**
- `refreshCards()` function is called
- Cards context updates with new card data
- All components using cards context receive updates
- New card appears in all relevant UI locations
- Card count updates correctly

#### 12.2 Multiple Components Show New Card
**Starting State:** Virtual card was just created

**Steps:**
1. Create a virtual card
2. Check Cards component on home page
3. Navigate to /cards page
4. Verify card appears in both locations

**Expected Results:**
- New card appears in home page Cards component
- New card appears in /cards page
- Card data is consistent across all views
- No discrepancies in card information

### 13. Browser Compatibility

#### 13.1 Test in Chrome
**Steps:**
1. Open application in Chrome
2. Complete full virtual card order flow

**Expected Results:**
- All functionality works as expected
- No console errors
- Smooth animations and transitions

#### 13.2 Test in Firefox
**Steps:**
1. Open application in Firefox
2. Complete full virtual card order flow

**Expected Results:**
- All functionality works as expected
- No console errors
- Consistent behavior with Chrome

#### 13.3 Test in Safari
**Steps:**
1. Open application in Safari
2. Complete full virtual card order flow

**Expected Results:**
- All functionality works as expected
- No console errors
- Consistent behavior with other browsers

#### 13.4 Test in Mobile Safari (iOS)
**Steps:**
1. Open application on iPhone/iPad
2. Complete full virtual card order flow

**Expected Results:**
- Touch interactions work properly
- Modal displays correctly
- No iOS-specific issues

#### 13.5 Test in Mobile Chrome (Android)
**Steps:**
1. Open application on Android device
2. Complete full virtual card order flow

**Expected Results:**
- Touch interactions work properly
- Modal displays correctly
- No Android-specific issues

## Test Data Requirements

### User States
- User with 0 cards
- User with 1 card (virtual)
- User with 1 card (physical)
- User with 4 active cards (at limit threshold)
- User with 5 active cards (at maximum limit)
- User with voided cards (should not count toward limit)
- User with lost/stolen cards (should not count toward limit)
- User with mixed card types

### API Responses
- Successful card creation (200 OK)
- Card limit exceeded error (400/422)
- Authentication error (401)
- Server error (500)
- Network timeout
- Slow response (3+ seconds)

### Network Conditions
- Fast connection (WiFi)
- Slow 3G
- Offline (to test error handling)
- Intermittent connection

## Success Criteria

### Functional Requirements
- ✅ User can open card order modal from home page
- ✅ User can select virtual card option
- ✅ User can navigate back to selection from confirmation
- ✅ User can successfully create a virtual card
- ✅ New card appears in cards list after creation
- ✅ Success toast notification displays
- ✅ Error handling works for all error scenarios
- ✅ Modal closes properly via all methods
- ✅ Physical card option navigates to correct page
- ✅ Card limit enforcement works correctly

### Non-Functional Requirements
- ✅ Modal opens within 100ms
- ✅ API requests complete within 5 seconds (normal network)
- ✅ No memory leaks from repeated modal usage
- ✅ Smooth animations (60fps)
- ✅ Accessible via keyboard only
- ✅ Screen reader compatible
- ✅ WCAG AA color contrast compliance
- ✅ Works on mobile devices (iOS and Android)
- ✅ Works in all major browsers
- ✅ Responsive design adapts to all screen sizes

## Known Limitations

1. **Card Limit**: Maximum of 5 active cards (physical + virtual combined)
2. **No Undo**: Once a virtual card is created, it cannot be immediately deleted from this flow
3. **Instant Activation**: Virtual cards are activated immediately (no pending state)
4. **No Customization**: Virtual cards cannot be customized during creation (name, limits, etc.)

## Future Test Considerations

- Test virtual card creation with different user KYC statuses
- Test virtual card creation with different account balance states
- Test concurrent card creation attempts from multiple devices
- Test virtual card creation during system maintenance
- Performance testing with large numbers of existing cards
- Load testing for API endpoint
- Security testing for authorization and authentication

