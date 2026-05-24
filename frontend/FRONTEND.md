# AI Spend Audit Frontend

A complete React + TypeScript + Vite + Tailwind CSS frontend for the AI Spend Audit application.

## Features

✓ **Landing Page** (`/`) - Hero page with CTA to start audit
✓ **Audit Form** (`/audit`) - Dynamic form to input AI tool stack with localStorage persistence
✓ **Results Page** (`/result/:id`) - Displays audit results from backend API with personalized analysis
✓ **Email Capture** - Lead generation form with optional company and role fields
✓ **Mobile Responsive** - Fully responsive design using Tailwind CSS
✓ **Accessibility** - Proper aria-labels, semantic HTML, focus states
✓ **Meta Tags** - Open Graph and Twitter cards on results page (react-helmet)
✓ **Loading States** - Visual feedback during API calls with spinners and skeleton screens
✓ **Error Handling** - User-friendly error messages for failed API requests

## Project Structure

```
src/
├── App.tsx                    # Main router configuration
├── main.tsx                   # Entry point with React root
├── index.css                  # Tailwind CSS + global styles
├── types/
│   └── index.ts              # TypeScript type definitions
├── utils/
│   ├── api.ts                # API client service
│   └── constants.ts          # Tool options and constants
└── components/
    ├── LeadForm.tsx          # Email capture form component
    └── pages/
        ├── Landing.tsx       # Landing page (/)
        ├── Audit.tsx         # Audit form (/audit)
        ├── Result.tsx        # Results page (/result/:id)
        ├── Home.tsx          # Home page export
        └── AuditApp.tsx      # Legacy component (can be removed)
```

## Installation & Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Set up environment variables in `.env.local`:
```env
VITE_API_URL=http://localhost:3000/api
```

3. Start development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

4. Build for production:
```bash
npm run build
```

## API Integration

All API calls are made through the `apiClient` in `src/utils/api.ts`. The base URL is configured via `VITE_API_URL` environment variable.

### Endpoints Used

- **POST `/api/audit`** - Submit audit form, returns `{ id: string }`
- **GET `/api/audit/:id`** - Fetch audit results
- **GET `/api/summary/:id`** - Fetch AI-generated summary paragraph
- **POST `/api/lead`** - Capture lead email and metadata

## Component Overview

### Landing (`/`)
- Hero section with headline and CTA
- Stats display (teams audited, total savings, tools supported)
- Navigation to audit form

### Audit Form (`/audit`)
- Dynamic tool rows with dropdowns for tool selection and plans
- Team size and use case inputs
- Form state persists to localStorage automatically
- Validation before submission
- Loading state on submit button
- Error message display

### Result Page (`/result/:id`)
- Fetches audit data from backend
- Displays total monthly and annual savings in hero section
- Per-tool recommendation cards with:
  - Current spend
  - Recommended action
  - Potential savings
  - Explanation
- Conditional CTA for high savings (>$500/month)
- AI summary section with loading skeleton
- Email capture form (shown conditionally)
- Shareable link with copy-to-clipboard
- Open Graph meta tags for social sharing

### LeadForm
- Email (required), company (optional), role (optional) fields
- Success state confirmation
- Error handling and retry logic

## Styling

The project uses **Tailwind CSS v4** for styling. All components are built with utility classes for:
- Responsive breakpoints (sm, md, lg, xl)
- Consistent color palette
- Smooth transitions and hover states
- Accessible focus indicators

Custom CSS is minimal and only includes:
- Keyframe animations
- Tailwind layer utilities
- Focus/disabled state overrides

## Accessibility

- All form inputs have associated `<label>` elements with `htmlFor`
- All interactive elements have descriptive `aria-label` attributes
- Proper semantic HTML (buttons, forms, sections)
- Focus visible states with ring styles
- Error messages use `role="alert"` with `aria-live="polite"`
- Color contrast meets WCAG standards

## TypeScript Types

Key types defined in `src/types/index.ts`:

```typescript
type UseCase = 'coding' | 'writing' | 'data' | 'research' | 'mixed'

interface ToolEntry {
  tool: string
  plan: string
  seats: number
  monthlySpend: number
}

interface AuditInput {
  tools: ToolEntry[]
  teamSize: number
  useCase: UseCase
}

interface Recommendation {
  tool: string
  currentSpend: number
  recommendedAction: string
  savings: number
  reason: string
}

interface AuditResult {
  id: string
  recommendations: Recommendation[]
  totalMonthlySavings: number
  totalAnnualSavings: number
  summary?: string
}
```

## Environment Variables

Create a `.env.local` file in the frontend directory:

```env
VITE_API_URL=http://localhost:3000/api
```

For production, set this to your deployed API URL:
```env
VITE_API_URL=https://api.credex.ai
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build locally

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Mobile)

## Performance

- Lazy loading of pages via React Router
- Code splitting automatic with Vite
- Efficient API calls with proper error boundaries
- CSS minification and tree-shaking
- ~85KB gzipped bundle size

## Future Enhancements

- [ ] Dark mode toggle
- [ ] PDF export of audit results
- [ ] Comparison between audits
- [ ] User authentication and dashboard
- [ ] Advanced filtering and sorting of recommendations
- [ ] Integration with Slack for notifications
- [ ] A/B testing for CTAs

## Dependencies

Key dependencies:
- `react` & `react-dom` 19.x
- `react-router-dom` 7.x
- `tailwindcss` 4.x
- `react-helmet` 6.x (meta tags management)
- `typescript` 6.x

Dev dependencies:
- `vite` 8.x (build tool)
- `@vitejs/plugin-react` (React support)
- `tailwindcss/vite` (Tailwind integration)
- `@types/react` (TypeScript types)
