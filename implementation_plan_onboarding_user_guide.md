# implementation_plan_onboarding_user_guide.md

## Objective
Create a seamless, lightweight, and "wow" onboarding experience for first-time users of SimplePersonalBudget. The guide will lead users through Categories, Budgeting, and the Dashboard, ensuring they understand the core value proposition immediately.

## Recommended Technology
**Library**: `driver.js`
- **Why?**: 
    - **Lightweight**: Zero dependencies, vanilla JS core (very fast).
    - **Mobile First**: Excellent support for handling mobile viewports and preventing scroll issues.
    - **Spotlight Effect**: Offers a built-in "focus" mode that dims the background and highlights the active element, providing the premium feel requested.
    - **Framework Agnostic**: Easy to wrap in a simple React Hook.

## 1. Database Schema Changes
To track user progress and ensure they only see the guide once, we will modify the `users` table schema.

- **File**: `lib/db/schema.ts`
- **Change**: Add `onboarding_completed` (boolean, default `false`) to the `users` table.
- **Alternative**: For a strictly frontend-only (lighter) approach, we can use `localStorage.getItem('has_seen_onboarding')`. However, the DB approach is more robust across devices. *Recommendation: DB access is available, so let's use it for a premium experience.*

## 2. Onboarding Flow Design

The tour will be a **multi-page journey**. Instead of one giant tour, it will be broken into contextual "chapters".

### Phase 1: The Setup (Trigger: New User Sign-up)
**Redirect**: After user creation, route users specifically to `/categories?tour=true`.

### Phase 2: Categories Page (`/categories`)
**Goal**: Explain Expense vs. Income buckets.
- **Step 1**: Welcome Modal (Center screen). "Welcome to SimplePersonalBudget! Let's get organized."
- **Step 2**: Highlight **"Add Category" button**. "Create buckets for your spending (e.g., Food, Rent) and income."
- **Step 3**: Highlight **"Expense/Income" tabs** (if applicable). "Toggle between money coming in and money going out."
- **Completion Action**: When the user adds at least one category, show a "Next: Set Budget" button that links to `/budget?tour=true`.

### Phase 3: Budget Page (`/budget`)
**Goal**: Explain Cycles and Targets.
- **Step 1**: Highlight **Global Settings (Period/Cycle)**. "Choose how you track: Monthly, Weekly, or Custom."
- **Step 2**: Highlight an **Input Field (Percentage/Dollar)**. "Assign every dollar a job. You can set limits by fixed amounts or percentages of your income."
- **Completion Action**: Button "All Set! Go to Dashboard" -> Links to `/dashboard?tour=true`.

### Phase 4: Dashboard (`/dashboard`)
**Goal**: Show them the reward (Habits & Tracking).
- **Step 1**: Highlight **Main Chart/Pulse**. "See your spending habits at a glance."
- **Step 2**: Highlight **"Add Transaction"**. "Track specific purchases here easily."
- **Final Step**: "You're all set! Steward your money well." -> **API Call**: Update `onboarding_completed: true`.

## 3. Implementation Steps

### Step 1: Install Dependencies
```bash
npm install driver.js
```

### Step 2: Create Reusable Hook (`hooks/use-tour.tsx`)
We will create a custom hook `useTour` that:
1.  Accepts a configuration (array of steps).
2.  Checks if the tour should run (URL param or User Prop).
3.  Initializes `driver.js` with our design system theme (colors, fonts).

### Step 3: Integrate into Pages
1.  **Modify Categories Page**: Import hook. Define steps for categories elements.
2.  **Modify Budget Page**: Import hook. Define steps for budget inputs.
3.  **Modify Dashboard Page**: Import hook. Define steps for charts.

## 4. Design & Aesthetics (The "Wow" Factor)
- **Animation**: The spotlight transition in `driver.js` is naturally smooth.
- **Styling**: We will customize the popover CSS to match Shadcn/Tailwind aesthetics (Rounded corners, Inter font, nice drop shadows, glassmorphism background for the popover).

## 5. Mobile Considerations
- On mobile, `driver.js` automatically handles scrolling to the element.
- We will ensure popover text is concise for small screens.
- We will ensure the "Next" buttons are easily tappable thumb-targets.
