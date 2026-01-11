# implementation_plan_onboarding_user_guide_v2.md

## Objective
Create a seamless, lightweight, and "wow" onboarding experience for first-time users. The guide will use a "spotlight" effect to focus user attention on key elements, guiding them through the setup flow: Categories -> Budgeting -> Dashboard.

## Selected Library: `driver.js`
- **Why?**:
    - **Best in Class for "Spotlight"**: Creates a high-contrast, focused overlay (dims background, highlights element) that feels very premium.
    - **Extremely Lightweight**: ~5kb gzipped, zero dependencies.
    - **Mobile First**: Excellent handling of scroll and positioning on mobile devices.
    - **Customizable**: We can style the popovers to match our application's design system (Shadcn/Inter font).

## 1. Database Schema Changes
To track user progress and ensure they only see the guide once.

- **File**: `lib/db/schema.ts`
- **Table**: `user_profile`
- **Change**: Add `onboardingCompleted` column.
  ```typescript
  onboardingCompleted: boolean('onboarding_completed').default(false).notNull(),
  ```

## 2. Onboarding Flow Design (Multi-Step Journey)

The tour is split into 3 "Chapters", connected via routing.

### Chapter 1: The Setup (Categories)
- **Route**: `/categories`
- **Trigger**: User signs up -> Redirected here. OR User visits and `onboardingCompleted === false`.
- **Tour Steps**:
    1.  **Welcome Modal**: Center screen. "Welcome! Let's get your finances set up."
    2.  **Highlight "Add Category"**: "Start by creating buckets for your money (e.g., Groceries, Rent)."
    3.  **Highlight "Tabs"**: "Switch between Expenses and Income here."
- **Completion**: "Next: Set your Budget" button -> Redirects to `/budget?tour=true`.

### Chapter 2: The Plan (Budgeting)
- **Route**: `/budget`
- **Trigger**: URL param `?tour=true` (or state).
- **Tour Steps**:
    1.  **Highlight Config Panel**: "Choose your budget cycle (Monthly, Weekly) and start date."
    2.  **Highlight Input Fields**: "Give every dollar a job. Set limits by Amount ($) or Percentage (%)."
- **Completion**: "Next: See your Dashboard" button -> Redirects to `/` (Root).

### Chapter 3: The Reward (Dashboard)
- **Route**: `/` (Root Page)
- **Trigger**: URL param `?tour=true`.
- **Tour Steps**:
    1.  **Highlight "Pulse" Chart**: "Track your spending habits and trends here."
    2.  **Highlight "Add Transaction"**: "Record expenses on the go."
- **Completion**: "You're all set!" -> **API Action**: Set `onboardingCompleted = true` in DB.

## 3. Implementation Steps

### Step 1: Install Driver.js
```bash
npm install driver.js
```

### Step 2: Create `useOnboardingTour` Hook
A custom hook to manage the tour logic, keeping components clean.
- **Path**: `hooks/use-onboarding-tour.ts`
- **Logic**:
    - Checks `userProfile.onboardingCompleted`.
    - Checks URL params.
    - Initializes `driver.js` instance with custom theme (colors, padding, animate: true).
    - Exposes a `startTour(chapter)` function.

### Step 3: Integrate into Pages
1.  **`app/(main)/categories/page.tsx`**: Import hook. Call `startTour('categories')` on mount if criteria met.
2.  **`app/(main)/budget/page.tsx`**: Import hook. Call `startTour('budget')`.
3.  **`app/(main)/page.tsx`**: Import hook. Call `startTour('dashboard')`.

### Step 4: API Route for Completion
- **Path**: `app/api/user/onboarding/route.ts` (New)
- **Method**: `POST`
- **Action**: Updates `user_profile.onboardingCompleted` to `true`.

## 4. Styling & "Wow" Factors
- **Popover Design**: We will use `driver.js`'s popover class to apply our CSS:
    - **Font**: Inter (Clean, modern).
    - **Shadows**: Soft, deep shadows (elevation).
    - **Buttons**: Primary accent color (Indigo) for actions.
    - **Animation**: Enable smooth transitions for the spotlight mask.

## 5. Mobile Considerations
- `driver.js` handles "scroll-into-view" automatically on mobile.
- We will ensure popover text is short and punchy.
- We will verify that the "Next" buttons are easily clickable on touch screens.
