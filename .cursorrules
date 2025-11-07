# Gnosis Pay UI Development Rules

## Color System & Theming

### Never Use Hard-coded Colors
- **NEVER** use hard-coded color values like `#000000`, `rgb(255, 0, 0)`, or `hsl(120, 100%, 50%)`
- **ALWAYS** use CSS custom properties defined in `src/index.css`
- Use Tailwind CSS color classes that map to our design system variables

### Available Color Variables
Use these predefined color variables from `src/index.css`:

#### Semantic Colors (Automatically adapt to light/dark mode)
- `background` / `bg-background` - Main background color
- `foreground` / `text-foreground` - Main text color
- `card` / `bg-card` - Card background
- `card-foreground` / `text-card-foreground` - Card text
- `muted` / `bg-muted` - Muted background
- `muted-foreground` / `text-muted-foreground` - Muted text
- `primary` / `bg-primary` - Primary button/action color
- `primary-foreground` / `text-primary-foreground` - Primary text
- `secondary` / `bg-secondary` - Secondary elements
- `destructive` / `bg-destructive` - Error/destructive actions
- `border` / `border-border` - Default border color
- `input` / `bg-input` - Input field backgrounds
- `ring` / `ring-ring` - Focus ring color

#### Brand Colors
- `brand` / `bg-brand` - Brand green color
- `button-bg` / `bg-button-bg` - Primary button background
- `button-bg-hover` / `hover:bg-button-bg-hover` - Button hover state
- `button-black` / `text-button-black` - Button text

#### Status Colors
- `success` / `text-success` - Success states
- `warning` / `text-warning` - Warning states  
- `info` / `text-info` - Info states
- `error` / `text-error` - Error states

#### Navigation & Links
- `link-active` / `text-link-active` - Active navigation links
- `link-secondary` / `text-link-secondary` - Secondary/inactive links

### Adding New Colors
If a design requires colors not in our system:
1. Add new CSS custom properties to `src/index.css` in both light and dark mode sections
2. Follow the existing naming convention (semantic names, not color names)
3. Ensure proper contrast ratios for accessibility
4. Test in both light and dark modes

### Examples
```tsx
// ❌ DON'T - Hard-coded colors
<div style={{ backgroundColor: '#ffffff', color: '#000000' }}>

// ❌ DON'T - Arbitrary Tailwind colors
<div className="bg-white text-black">

// ✅ DO - Use design system variables
<div className="bg-background text-foreground">
<div className="bg-card text-card-foreground border border-border">
<button className="bg-button-bg hover:bg-button-bg-hover text-button-black">

// ✅ DO - CSS custom properties for inline styles
<div style={{ backgroundColor: 'var(--color-brand)' }}>
```

## Responsive Design & Mobile-First

### Breakpoint Strategy
Follow the existing mobile-first approach:
- Default styles: Mobile (< 640px)
- `sm:` Small screens (≥ 640px)
- `md:` Medium screens (≥ 768px) 
- `lg:` Large screens (≥ 1024px)
- `xl:` Extra large (≥ 1280px)

### Layout Patterns
Follow these established patterns:

#### Navigation
- **Mobile**: Bottom fixed navigation with icon + label
- **Desktop**: Top header with horizontal navigation
```tsx
// Mobile navigation (hidden on lg+)
<footer className="fixed bottom-0 left-0 w-full border-t lg:hidden">

// Desktop navigation (hidden below lg)
<header className="w-full border-b hidden lg:block">
```

#### Page Layout
Use the 6-column grid system:
```tsx
// Standard page layout
<div className="grid grid-cols-6 gap-4 h-full m-4 lg:m-0 lg:mt-4">
  <div className="col-span-6 lg:col-start-2 lg:col-span-4">
    {/* Content centered on desktop, full width on mobile */}
  </div>
</div>
```

#### Modal Sizing
```tsx
// Small modals
<DialogContent className="max-w-md">

// Medium modals  
<DialogContent className="sm:max-w-lg">

// Responsive sheets
<SheetContent className="w-3/4 sm:max-w-sm">
```

### Mobile-First Requirements

#### Touch-Friendly Design
- Minimum 44px touch targets for interactive elements
- Adequate spacing between clickable elements
- Consider thumb-reach zones

#### Mobile Navigation
- Use bottom navigation for primary actions
- Implement swipe gestures where appropriate
- Ensure easy one-handed usage

#### Content Adaptation
- Stack layouts vertically on mobile
- Use horizontal layouts on larger screens
- Implement proper text scaling
- Optimize image sizes for different screens

#### Performance
- Lazy load images and heavy components
- Minimize layout shifts
- Use appropriate image formats and sizes

### Examples
```tsx
// ❌ DON'T - Desktop-first approach
<div className="flex lg:flex-col">

// ✅ DO - Mobile-first approach  
<div className="flex-col lg:flex-row">

// ❌ DON'T - Fixed mobile layout
<div className="w-full p-4">

// ✅ DO - Responsive spacing and sizing
<div className="w-full mx-4 lg:mx-0 p-4 lg:p-6">
<div className="max-w-xl mx-auto lg:max-w-4xl">

// ✅ DO - Progressive enhancement
<div className="space-y-4 lg:space-y-0 lg:space-x-4 lg:flex">
```

## Component Guidelines

### Reuse Existing Components
Before creating new components, check if existing ones can be used:
- `Button`, `IconButton` - Various button styles
- `Dialog`, `Sheet` - Modal and drawer patterns
- `Input`, `Select` - Form controls
- `Alert` - Status messages
- `Progress` - Loading indicators

### Component Structure
- Use `cn()` utility for className merging
- Support className prop for customization
- Use forwardRef for interactive components
- Implement proper TypeScript types

### Accessibility
- Include proper ARIA labels and roles
- Ensure keyboard navigation works
- Maintain focus management
- Support screen readers
- Test with accessibility tools

## Code Quality

### TypeScript
- Use strict TypeScript configuration
- Define proper interfaces for props
- Avoid `any` types
- Use type guards where appropriate

### Performance
- **USE BY DEFAULT**: Wrap functions with `useCallback` and expensive computations with `useMemo`
- Always use `useCallback` for event handlers passed as props to child components
- Always use `useMemo` for expensive calculations, object/array creation, and derived state
- Implement proper loading states
- Avoid unnecessary re-renders
- Optimize bundle size

#### useCallback & useMemo Guidelines
```tsx
// ✅ DO - Default useCallback for event handlers
const handleClick = useCallback(() => {
  // Handle click logic
}, [dependency]);

// ✅ DO - Default useMemo for object/array creation
const config = useMemo(() => ({
  option1: value1,
  option2: value2
}), [value1, value2]);

// ✅ DO - useMemo for expensive calculations
const expensiveValue = useMemo(() => {
  return items.filter(item => item.active).map(item => transform(item));
}, [items]);

// ❌ DON'T - Inline functions as props (causes re-renders)
<Button onClick={() => handleAction(id)} />

// ✅ DO - useCallback for props
<Button onClick={handleActionCallback} />
```

### Error Handling
- **ALWAYS** use the `StandardAlert` component for displaying errors, warnings, and info messages
- **ALWAYS** use `extractErrorMessage` from `@/utils/errorHelpers` to format error messages
- Implement proper error boundaries
- Show user-friendly error messages
- Handle loading and error states consistently
- Log errors appropriately

#### Error Display Pattern
```tsx
import { StandardAlert } from "@/components/ui/standard-alert";
import { extractErrorMessage } from "@/utils/errorHelpers";

// ✅ DO - Use StandardAlert with extractErrorMessage
<StandardAlert 
  variant="destructive" 
  message={extractErrorMessage(error)} 
/>

// ✅ DO - Warning messages
<StandardAlert 
  variant="warning" 
  message="This action cannot be undone" 
/>

// ✅ DO - Info messages  
<StandardAlert 
  variant="info" 
  message="Your card will arrive in 5-7 business days" 
/>

// ❌ DON'T - Raw error display
<div className="text-red-500">{error.message}</div>

// ❌ DON'T - Using other alert components for errors
<Alert variant="destructive">{error.toString()}</Alert>
```

### Promise Handling
- **PREFER** `promise.then().catch().finally()` over `try/catch` blocks when possible
- Use `try/catch` only when absolutely necessary (e.g., within async/await functions where promise chaining isn't practical)
- Maintain consistent error handling patterns across the codebase

#### Examples
```tsx
// ✅ DO - Use promise chaining
someApiCall()
  .then((response) => {
    // Handle success
    setData(response.data);
  })
  .catch((error) => {
    // Handle error
    setError("Failed to fetch data");
    console.error("API Error:", error);
  })
  .finally(() => {
    // Cleanup
    setIsLoading(false);
  });

// ❌ AVOID - try/catch unless necessary
try {
  const response = await someApiCall();
  setData(response.data);
} catch (error) {
  setError("Failed to fetch data");
} finally {
  setIsLoading(false);
}
```

## Testing Guidelines

### E2E Testing with Playwright

#### Test Planning & Generation
- **Use `@🎭 planner.chatmode.md`** to plan comprehensive test scenarios
  - The planner agent will navigate the application and create detailed test plans
  - Test plans should cover happy paths, edge cases, and error handling
  - Each scenario should have clear steps and expected outcomes

- **Use `@🎭 generator.chatmode.md`** to generate automated Playwright tests
  - The generator agent will create test code based on test plans
  - Tests are generated by executing each step in real-time
  - Generated tests follow best practices and include proper assertions

#### Running Tests
- **Always use the `--reporter=line` flag** when running tests:
  ```bash
  pnpm test --reporter=line
  ```
- This provides cleaner, more readable output during test execution

#### Test Organization
- **Combine related tests** to minimize setup overhead
  - Group tests that share similar setup or context
  - Only separate tests when they test fundamentally different features
  - Application setup is expensive, so consolidating tests improves performance

#### Test Best Practices
- **NEVER use `page.waitForTimeout()`** or `waitForTimeout()` in tests
  - Arbitrary timeouts make tests flaky and slow
  - Use proper Playwright waiting mechanisms instead:
    - `waitForSelector()` - Wait for elements to appear
    - `waitForLoadState()` - Wait for page load states
    - `expect().toBeVisible()` - Wait for elements with assertions
    - `waitForResponse()` - Wait for specific network responses
    - `waitForFunction()` - Wait for custom conditions

#### Examples
```bash
# Run all tests with line reporter
pnpm test --reporter=line

# Run specific test file
pnpm test card-transactions.spec.ts --reporter=line

# Run tests in headed mode for debugging
pnpm test --headed --reporter=line
```

```tsx
// ❌ DON'T - Use arbitrary timeouts
await page.waitForTimeout(500);
await page.waitForTimeout(1000);

// ✅ DO - Use proper waiting mechanisms
await page.waitForSelector('[data-testid="my-element"]');
await page.waitForLoadState('networkidle');
await expect(page.getByTestId('my-element')).toBeVisible();
await page.waitForResponse(response => response.url().includes('/api/data'));
await page.waitForFunction(() => document.querySelector('.loading') === null);
```

## Testing Considerations
- Test components in both light and dark modes
- Verify responsive behavior at different breakpoints
- Test keyboard navigation and accessibility
- Validate color contrast ratios
- Test on actual mobile devices when possible 