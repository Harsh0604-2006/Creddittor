# Frontend Testing & Development Notes

## Testing Without Backend

To test the frontend before the backend is ready, you can mock API responses:

### Option 1: Mock API Service

Create `src/utils/mockApi.ts`:

```typescript
import type { AuditInput, AuditResult, LeadData } from '../types'

export const mockApiClient = {
  async submitAudit(input: AuditInput): Promise<{ id: string }> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    return { id: 'mock-' + Math.random().toString(36).slice(2) }
  },

  async getAudit(id: string): Promise<AuditResult> {
    await new Promise(resolve => setTimeout(resolve, 500))
    return {
      id,
      recommendations: [
        {
          tool: 'Cursor',
          currentSpend: 200,
          recommendedAction: 'Switch to Business plan',
          savings: 50,
          reason: 'Business plan offers better value for your team size'
        }
      ],
      totalMonthlySavings: 80,
      totalAnnualSavings: 960,
      summary: 'Mock summary for testing purposes'
    }
  },

  async getSummary(id: string): Promise<{ summary: string }> {
    await new Promise(resolve => setTimeout(resolve, 300))
    return {
      summary: 'Your team has great potential for optimization. By consolidating to team plans and right-sizing seat counts, you could achieve significant monthly savings.'
    }
  },

  async submitLead(data: LeadData): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400))
    console.log('Lead submitted:', data)
  }
}
```

Then update `src/utils/api.ts` to use mock:

```typescript
const API_URL = import.meta.env.VITE_API_URL
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

const actualApiClient = { /* ... */ }

export const apiClient = USE_MOCK ? mockApiClient : actualApiClient
```

And add to `.env.local`:

```env
VITE_USE_MOCK=true
VITE_API_URL=http://localhost:3000/api
```

### Option 2: Browser DevTools

Intercept and mock network requests in Chrome DevTools:

1. Open DevTools (F12)
2. Go to Network tab
3. Right-click failed request → "Edit and Resend"
4. Modify response to mock data

## Testing Checklist

### Landing Page (`/`)
- [ ] Page loads without errors
- [ ] Hero headline visible and properly styled
- [ ] CTA button navigates to `/audit`
- [ ] Stats display correctly
- [ ] Responsive on mobile (hamburger menu if added)
- [ ] All links work (Footer links, back button)

### Audit Form (`/audit`)
- [ ] Form loads with one empty tool row
- [ ] Can add multiple tools
- [ ] Can remove tools
- [ ] Tool dropdown shows all available tools
- [ ] Plan dropdown updates when tool changes
- [ ] All input fields accept proper values
- [ ] Form state persists to localStorage
  - [ ] Refresh page → form data returns
  - [ ] Close and reopen browser → form data persists
- [ ] Form validation:
  - [ ] Prevents submit without filled tools
  - [ ] Shows error message when submitting empty form
- [ ] Spending summary updates correctly
- [ ] Annual spend calculation is correct (monthly × 12)
- [ ] Submit button shows loading state
- [ ] After submission, navigates to results page with ID

### Results Page (`/result/:id`)
- [ ] Page loads with audit ID
- [ ] Hero section shows correct savings amounts
- [ ] Recommendations display with correct data
- [ ] Each recommendation shows:
  - [ ] Tool name
  - [ ] Current spend
  - [ ] Recommended action
  - [ ] Savings amount
  - [ ] Explanation
- [ ] High savings (>$500) shows consultation CTA
- [ ] Low savings (<$100) shows "You're spending well" message
- [ ] Email form displays
- [ ] Email form validation:
  - [ ] Requires email
  - [ ] Optional company and role fields
  - [ ] Shows success message after submission
- [ ] Share link shows correct URL
- [ ] Copy button works (test with `navigator.clipboard.writeText`)
- [ ] Meta tags update (check page source)
  - [ ] `<title>` includes savings amount
  - [ ] Open Graph tags have correct values
  - [ ] Twitter card tags present

### API Integration
- [ ] POST `/api/audit` returns ID
- [ ] GET `/api/audit/:id` returns recommendations
- [ ] GET `/api/summary/:id` returns summary (if implemented)
- [ ] POST `/api/lead` saves lead data
- [ ] Error handling works:
  - [ ] Shows error message on network failure
  - [ ] Shows error message on invalid response
  - [ ] Allows retry after error

### Mobile Responsiveness
- [ ] Test on iPhone SE (375px)
- [ ] Test on iPad (768px)
- [ ] Test on desktop (1920px)
- [ ] Check breakpoints: sm, md, lg
- [ ] Forms stack vertically on mobile
- [ ] Text is readable without zooming
- [ ] Touch targets are 44px+ minimum

### Accessibility
- [ ] Use Tab key to navigate
- [ ] All form inputs have labels
- [ ] All buttons have aria-labels
- [ ] Error messages have role="alert"
- [ ] Focus visible indicators present
- [ ] Color not sole indicator (use icons too)
- [ ] Alt text on images (none currently, but if added)
- [ ] Heading hierarchy: h1 → h2 → h3

### Performance
- [ ] First contentful paint < 1s
- [ ] Largest contentful paint < 2.5s
- [ ] No console errors or warnings
- [ ] No memory leaks (check DevTools Memory tab)
- [ ] Bundle size reasonable (~85KB gzipped)

## Browser Testing

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] iOS Safari
- [ ] Chrome Mobile

## Common Issues & Solutions

### localStorage Not Working
- Check if in private/incognito mode (localStorage disabled)
- Check browser console for "QuotaExceededError"
- Clear browser storage: Settings → Clear browsing data

### Styling Issues
- Check that Tailwind CSS is compiled (browser DevTools → Styles)
- Verify `tailwind.config.js` includes `src/**/*.{jsx,tsx}`
- Rebuild with `npm run build`

### TypeScript Errors
- Run `npx tsc --noEmit` to check for type errors
- Check `tsconfig.json` is configured correctly
- Ensure all imports have proper type definitions

### API Integration Issues
- Verify backend is running on correct port
- Check `VITE_API_URL` in `.env.local`
- Look at Network tab in DevTools for failed requests
- Check CORS headers in backend response
- Verify request/response JSON format matches API_CONTRACT.md

## Performance Testing

### Bundle Size
```bash
npm run build
# Check dist/ folder size
# Should be ~85KB gzipped
```

### Lighthouse Score
1. Build production bundle
2. Run `npm run preview`
3. Open DevTools → Lighthouse
4. Run audit
5. Aim for:
   - Performance: > 90
   - Accessibility: > 90
   - Best Practices: > 85
   - SEO: > 90

## Load Testing

Test with simulated slow network:
1. DevTools → Network tab
2. Throttling dropdown → "Slow 3G"
3. Verify loading states display correctly
4. Check error handling with timeouts

## Unit Testing (Optional)

If unit tests are added later, structure:
- `src/components/*.test.tsx`
- `src/utils/*.test.ts`
- Use Vitest or Jest
- Test:
  - Component rendering
  - Form validation
  - API client methods
  - localStorage persistence

## Debugging Tips

### React DevTools
1. Install React DevTools browser extension
2. Open DevTools → Components tab
3. Inspect component props and state
4. Trace component re-renders

### Network Debugging
1. DevTools → Network tab
2. Filter by XHR/Fetch
3. Check request/response payloads
4. Verify status codes (200, 400, 500)

### Console Logging
Add debugging logs:
```typescript
console.log('Audit submitted:', input)
console.log('API response:', result)
console.log('Stored in localStorage:', localStorage.getItem('credex-audit-form'))
```

## Deployment Checklist

- [ ] All environment variables configured
- [ ] API URL points to production backend
- [ ] Build succeeds without errors: `npm run build`
- [ ] No console errors in production build
- [ ] Mobile responsive tested
- [ ] All pages load correctly
- [ ] Forms work end-to-end
- [ ] Meta tags correct
- [ ] Analytics code added (if needed)
- [ ] Error tracking enabled (if needed)
- [ ] HTTPS configured
- [ ] Domain DNS updated

## Performance Optimization Notes

Already implemented:
- Code splitting via React Router
- CSS minification via Tailwind/Vite
- Image optimization (no images currently)
- Tree-shaking unused code

Potential future optimizations:
- Image lazy loading (when images added)
- React.memo for expensive components
- useMemo/useCallback for expensive calculations
- Service Worker for offline support
- Skeleton screens (partially implemented)
