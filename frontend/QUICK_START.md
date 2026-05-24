# Quick Start Guide - Frontend

Get the AI Spend Audit frontend running in 5 minutes.

## Prerequisites

- Node.js 18+ installed
- npm or yarn installed
- Backend API running (or mock server for testing)

## Step 1: Install Dependencies

```bash
cd frontend
npm install
```

This installs all required packages including React, React Router, Tailwind CSS, and react-helmet.

## Step 2: Configure Environment

Copy the example environment file and update it:

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
VITE_API_URL=http://localhost:3000/api
```

If your backend is running on a different port/host, update accordingly.

## Step 3: Start Development Server

```bash
npm run dev
```

Output:
```
  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

Open `http://localhost:5173` in your browser.

## Step 4: Test the Flow

1. **Homepage** - You should see the landing page with "Find out if you're overpaying for AI tools"
2. **Click "Audit my stack"** - Navigate to the audit form
3. **Fill the form:**
   - Select team size (e.g., 10)
   - Select use case (e.g., "Coding")
   - Add tools (e.g., Cursor, Claude)
   - Select plans and spending amounts
4. **Click "Run Audit"** - Should submit to backend API
5. **Results page** - Should display recommendations after API responds

## Building for Production

```bash
npm run build
```

This creates an optimized build in the `dist/` folder (~85KB gzipped).

To preview the production build locally:

```bash
npm run preview
```

## File Structure Reminder

```
src/
├── pages/          Landing, Audit, Result pages
├── components/     LeadForm and other components
├── utils/          API client, constants
└── types/          TypeScript interfaces
```

## Troubleshooting

### "Cannot find module '../../utils/api'"
- Make sure `.env.local` exists in the frontend root
- Run `npm install` to ensure all dependencies are installed
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`

### Development server won't start
- Kill the process on port 5173: `lsof -ti:5173 | xargs kill -9` (macOS/Linux)
- Or use: `netstat -ano | findstr :5173` (Windows)

### API calls failing with 404
- Verify `VITE_API_URL` is set correctly in `.env.local`
- Ensure backend API is running and accessible
- Check browser console for detailed error messages

### Tailwind CSS not applying
- Restart the dev server (it should auto-compile CSS)
- Check that `.env.local` exists (sometimes needed for HMR)

## Key URLs

- **Development:** `http://localhost:5173`
- **API:** `http://localhost:3000/api` (configurable)
- **Landing:** `http://localhost:5173/`
- **Audit Form:** `http://localhost:5173/audit`
- **Results:** `http://localhost:5173/result/:id`

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:3000/api` | Backend API base URL |

## Common Commands

```bash
# Start development server
npm run dev

# Build production bundle
npm run build

# Preview production build
npm run preview

# Run ESLint
npm run lint

# Check TypeScript compilation
npx tsc --noEmit
```

## Features Implemented

✓ Landing page with hero and stats
✓ Dynamic audit form with localStorage persistence
✓ Multi-tool selection with dynamic plan options
✓ API integration with proper error handling
✓ Results page with recommendations
✓ Email capture form for leads
✓ Shareable links with copy-to-clipboard
✓ Mobile responsive design
✓ Accessibility features (aria-labels, semantic HTML)
✓ Open Graph meta tags for social sharing
✓ Loading states and skeleton screens
✓ TypeScript throughout

## Next Steps

1. Start the backend server
2. Test the complete flow (form → audit submission → results)
3. Verify API integration working correctly
4. Test on mobile devices
5. Build production bundle with `npm run build`
6. Deploy to hosting service (Vercel, Netlify, etc.)

## Resources

- [React Documentation](https://react.dev)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React Router Docs](https://reactrouter.com)
- [Vite Documentation](https://vitejs.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## Support

If you encounter issues:

1. Check the browser console (F12) for JavaScript errors
2. Check the Network tab for failed API requests
3. Review the error messages shown in the UI
4. Check the [API_CONTRACT.md](API_CONTRACT.md) for expected API responses
5. Verify backend is running and accessible
