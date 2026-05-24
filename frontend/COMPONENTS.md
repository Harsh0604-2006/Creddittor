# Component Documentation

Detailed documentation of all React components in the application.

## Page Components

### Landing.tsx
**Path:** `src/components/pages/Landing.tsx`
**Route:** `/`

The main landing page of the application.

**Features:**
- Hero section with headline and subheadline
- Large CTA button ("Audit my stack")
- Trust badges showing no credit card required
- Stats section (Teams Audited, Total Saved, Tools Supported)
- Navigation bar with logo and action button
- Footer with links (Privacy, Terms, Contact)

**Props:** None

**State:** None (uses React Router useNavigate hook)

**Key Functions:**
- `navigate('/audit')` - Navigate to audit form

**Styling:**
- Dark gradient background (slate-900 to slate-800)
- White text for contrast
- Blue CTA button with hover effect
- Grid layout for stats (2 cols mobile, 3 cols desktop)

---

### Audit.tsx
**Path:** `src/components/pages/Audit.tsx`
**Route:** `/audit`

Dynamic form for users to input their AI tool stack.

**Features:**
- Team size input (number)
- Use case selection (dropdown)
- Dynamic tool rows with:
  - Tool name selection (dropdown)
  - Plan selection (dropdown, options depend on tool)
  - Number of seats (number input)
  - Monthly spend (currency input)
- Add tool button to add more rows
- Remove button on each tool row
- Form validation
- localStorage persistence
- Loading state on submit
- Error message display
- Total spending summary

**Props:** None

**State:**
- `tools` - Array of ToolEntry objects
- `teamSize` - Number
- `useCase` - UseCase type
- `isLoading` - Boolean
- `error` - String or null

**Key Functions:**
- `handleToolChange(index, field, value)` - Update tool row data
- `addTool()` - Add new tool row
- `removeTool(index)` - Remove tool row
- `handleSubmit(e)` - Validate and submit audit
- `loadStoredState()` - Load form from localStorage
- localStorage autosave effect

**localStorage Key:** `credex-audit-form`

**API Calls:**
- `POST /api/audit` - Submit form data, receives audit ID

**Navigation:**
- Navigate to `/result/:id` after successful submission

**Validation Rules:**
- At least one tool with complete data
- Team size 1-10,000
- Seats 1-1,000 per tool
- Monthly spend >= 0

---

### Result.tsx
**Path:** `src/components/pages/Result.tsx`
**Route:** `/result/:id`

Displays audit results and recommendations.

**Features:**
- Loads audit data from API by ID
- Hero section showing total monthly and annual savings
- Recommendation cards for each tool with:
  - Tool name
  - Current spend
  - Recommended action
  - Potential savings
  - Explanation
- Conditional CTA for high savings (>$500/month)
- AI-generated personalized summary section with loading skeleton
- Email capture form (LeadForm component)
- Shareable link section with copy-to-clipboard
- Open Graph meta tags for social sharing (react-helmet)
- Loading and error states

**Props:** None

**State:**
- `auditResult` - AuditResult object or null
- `summary` - String or null
- `isLoading` - Boolean
- `isSummaryLoading` - Boolean
- `error` - String or null
- `copied` - Boolean (for copy feedback)

**Key Functions:**
- `useEffect()` - Fetch audit data and summary on mount
- `copyToClipboard()` - Copy share URL to clipboard
- `apiClient.getAudit(id)` - Fetch audit results
- `apiClient.getSummary(id)` - Fetch AI summary

**API Calls:**
- `GET /api/audit/:id` - Fetch audit results
- `GET /api/summary/:id` - Fetch AI summary (async, shown with skeleton)

**Child Components:**
- `LeadForm` - Email capture form

**Error Handling:**
- Displays user-friendly error messages
- Links back to home on error
- Graceful fallback if summary fetch fails

**Meta Tags (via react-helmet):**
- Dynamic `<title>` with savings amount
- Open Graph: og:title, og:description, og:type, og:url
- Twitter card: twitter:card, twitter:title, twitter:description

---

### Home.tsx
**Path:** `src/components/pages/Home.tsx`
**Route:** (Legacy - now points to Landing)

Wrapper component. Currently identical to Landing.tsx but kept for backwards compatibility.

---

## Component Components

### LeadForm.tsx
**Path:** `src/components/LeadForm.tsx`

Email capture form for lead generation.

**Props:**
```typescript
interface LeadFormProps {
  auditId: string              // Audit ID to associate with lead
  onSuccess?: () => void       // Optional callback after success
}
```

**Features:**
- Email input (required)
- Company name input (optional)
- Role dropdown (optional)
- Form validation (email required)
- Loading state during submission
- Success confirmation message
- Error message display
- Auto-clear form on success

**State:**
- `email` - String
- `company` - String
- `role` - String
- `isLoading` - Boolean
- `error` - String or null
- `success` - Boolean

**Key Functions:**
- `handleSubmit(e)` - Validate and submit lead data
- `apiClient.submitLead(data)` - Submit to backend

**API Calls:**
- `POST /api/lead` - Submit lead data with email, company, role

**Roles:**
- Founder
- CEO
- CTO
- Engineering Manager
- Finance
- Operations
- Other

**Validation:**
- Email required (HTML5 validation)
- Email format validated by browser
- Company: optional, max 255 chars
- Role: optional, must be from predefined list

**Success Behavior:**
- Shows green success message
- Clears all form fields
- Calls optional onSuccess callback
- Prevents re-submission immediately

---

## Context/Hooks (None currently)

No custom hooks or context providers are used. All state management is local to components.

---

## Utility Components

### API Client
**Path:** `src/utils/api.ts`

Centralized API communication service.

**Functions:**
```typescript
apiClient.submitAudit(input: AuditInput)
apiClient.getAudit(id: string)
apiClient.getSummary(id: string)
apiClient.submitLead(data: LeadData)
```

**Configuration:**
- Base URL from `import.meta.env.VITE_API_URL`
- Default: `http://localhost:3000/api`
- Fallback to localhost if env not set

**Error Handling:**
- Throws Error objects with descriptive messages
- Caught by components and displayed to users

---

### Constants
**Path:** `src/utils/constants.ts`

**Exports:**
- `TOOL_OPTIONS` - Array of tool names
- `PLAN_OPTIONS` - Object mapping tools to their plans
- `USE_CASE_OPTIONS` - Array of use case options
- `formatCurrency(amount)` - Format number as USD currency
- `formatUseCaseLabel(useCase)` - Format use case string for display

---

## Type Definitions
**Path:** `src/types/index.ts`

All TypeScript interfaces:
- `UseCase` - Type union
- `ToolEntry` - Single tool in audit
- `AuditInput` - Complete audit form data
- `Recommendation` - Single recommendation
- `AuditResult` - Complete audit result with recommendations
- `LeadData` - Lead form submission data

---

## Component Hierarchy

```
App
├── /
│   └── Landing
├── /audit
│   └── Audit
└── /result/:id
    └── Result
        └── LeadForm
```

---

## Component Communication

**Data Flow:**
1. User fills audit form on `Audit` component
2. Audit calls API: `POST /api/audit` → receives ID
3. Navigation to `Result` component with ID in URL
4. Result fetches from API: `GET /api/audit/:id`
5. Result renders recommendations and LeadForm
6. LeadForm submits via: `POST /api/lead`

**No Prop Drilling:** Components don't pass data through intermediate components

**No State Management:** No Redux/Zustand needed; all state is local or in URL

---

## Styling Approach

All components use Tailwind CSS utility classes:
- No CSS modules or styled-components
- Responsive classes (sm:, md:, lg:)
- Semantic color classes (bg-blue-600, text-slate-900)
- Consistent spacing (gap-4, p-6, mb-8)
- Accessibility features (focus:ring-2, aria-labels)

---

## Accessibility Features

All components include:
- Semantic HTML (`<button>`, `<form>`, `<label>`)
- `aria-label` attributes on buttons and interactive elements
- `htmlFor` on labels linking to input IDs
- `role="alert"` on error messages with `aria-live="polite"`
- Focus visible indicators with Tailwind ring utilities
- Color contrast ratios meeting WCAG AA standards
- Keyboard navigation support

---

## Performance Considerations

**Optimizations:**
- No unnecessary re-renders (React hooks used correctly)
- localStorage to avoid refetching audit form
- Skeleton screens for loading summary
- Lazy loading of pages via React Router

**Potential Future Optimizations:**
- React.memo for LeadForm if it becomes complex
- useMemo for expensive calculations
- Code splitting at route level (already done by Router)

---

## Testing Notes

Each component can be tested independently:
- Landing - Snapshot test, navigation test
- Audit - Form submission, validation, localStorage
- Result - API data loading, meta tags, error states
- LeadForm - Form submission, validation, error states

See [TESTING.md](TESTING.md) for detailed testing strategies.
