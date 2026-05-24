# Frontend API Contract

This document defines the API contract between the frontend and backend for the AI Spend Audit application.

## Base URL

All endpoints use the base URL from environment variable `VITE_API_URL` (default: `http://localhost:3000/api`)

## Endpoints

### 1. Submit Audit

**Endpoint:** `POST /api/audit`

**Request Body:**
```json
{
  "tools": [
    {
      "tool": "Cursor",
      "plan": "Pro",
      "seats": 10,
      "monthlySpend": 200
    },
    {
      "tool": "Claude",
      "plan": "Pro",
      "seats": 5,
      "monthlySpend": 100
    }
  ],
  "teamSize": 15,
  "useCase": "coding"
}
```

**Response:**
```json
{
  "id": "abc123def456"
}
```

**Status Codes:**
- `200 OK` - Audit submitted successfully
- `400 Bad Request` - Invalid input data
- `500 Internal Server Error` - Server error

---

### 2. Get Audit Results

**Endpoint:** `GET /api/audit/:id`

**URL Parameters:**
- `id` (string, required) - Audit ID from submission response

**Response:**
```json
{
  "id": "abc123def456",
  "recommendations": [
    {
      "tool": "Cursor",
      "currentSpend": 200,
      "recommendedAction": "Switch to Business plan",
      "savings": 50,
      "reason": "Business plan offers better value for 10+ users"
    },
    {
      "tool": "Claude",
      "currentSpend": 100,
      "recommendedAction": "Consolidate to Team plan",
      "savings": 30,
      "reason": "Team plan costs less per user for your usage pattern"
    }
  ],
  "totalMonthlySavings": 80,
  "totalAnnualSavings": 960,
  "summary": "Optional AI-generated summary that may be populated later"
}
```

**Status Codes:**
- `200 OK` - Audit found
- `404 Not Found` - Audit ID doesn't exist
- `500 Internal Server Error` - Server error

---

### 3. Get AI Summary

**Endpoint:** `GET /api/summary/:id`

**URL Parameters:**
- `id` (string, required) - Audit ID

**Response:**
```json
{
  "summary": "Based on your audit, your team is overspending primarily on Cursor and Claude. By consolidating to team plans and optimizing seat allocation, you could save approximately $960 annually. The recommended plan migrations would improve cost efficiency without sacrificing functionality for your coding-focused team of 15 people."
}
```

**Status Codes:**
- `200 OK` - Summary retrieved
- `404 Not Found` - Audit ID doesn't exist
- `500 Internal Server Error` - Server error or LLM unavailable

---

### 4. Submit Lead

**Endpoint:** `POST /api/lead`

**Request Body:**
```json
{
  "auditId": "abc123def456",
  "email": "user@example.com",
  "company": "Acme Inc",
  "role": "CTO"
}
```

**Optional Fields:**
- `company` (string) - Company name (optional)
- `role` (string) - User's role (optional, one of: Founder, CEO, CTO, Engineering Manager, Finance, Operations, Other)

**Response:**
```json
{}
```

**Status Codes:**
- `201 Created` - Lead saved successfully
- `400 Bad Request` - Missing required fields or invalid data
- `500 Internal Server Error` - Server error

---

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error message describing what went wrong",
  "code": "ERROR_CODE"
}
```

Example:
```json
{
  "error": "Invalid audit ID",
  "code": "AUDIT_NOT_FOUND"
}
```

---

## Request/Response Headers

### Required Headers
- `Content-Type: application/json` (for POST requests)

### Recommended Headers
- `Accept: application/json`

---

## Rate Limiting

- No rate limiting currently implemented
- Recommend implementing: 100 requests per minute per IP

---

## CORS

The backend should allow CORS from:
- `http://localhost:5173` (development)
- `http://localhost:3000` (local testing)
- Production domain (to be configured)

Required CORS headers:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

---

## Validation Rules

### AuditInput Validation

```typescript
- tools: ToolEntry[]
  - Must have at least 1 tool
  - Max 20 tools
  - Each tool must have:
    - tool: non-empty string, must match one of predefined tools
    - plan: non-empty string, must be valid plan for selected tool
    - seats: integer, 1-1000
    - monthlySpend: number >= 0, max 100,000

- teamSize: integer, 1-10,000
- useCase: one of 'coding', 'writing', 'data', 'research', 'mixed'
```

### LeadData Validation

```typescript
- auditId: non-empty string, must match existing audit
- email: valid email format (RFC 5322)
- company: optional string, max 255 characters
- role: optional string, one of predefined roles
```

---

## Tool Definitions

Supported tools and plans:

```javascript
{
  "Cursor": ["Hobby", "Pro", "Business", "Enterprise"],
  "GitHub Copilot": ["Individual", "Business", "Enterprise"],
  "Claude": ["Free", "Pro", "Max", "Team", "Enterprise", "API"],
  "ChatGPT": ["Plus", "Team", "Enterprise", "API"],
  "Gemini": ["Pro", "Ultra", "API"],
  "Windsurf": ["Free", "Pro", "Teams"]
}
```

---

## Example Flow

1. User fills audit form on `/audit`
2. Frontend calls `POST /api/audit` with form data
3. Backend returns `{ id: "xyz123" }`
4. Frontend navigates to `/result/xyz123`
5. Frontend calls `GET /api/audit/xyz123` → displays recommendations
6. Frontend calls `GET /api/summary/xyz123` → displays AI summary
7. User fills email form
8. Frontend calls `POST /api/lead` to save lead data
9. Results page fully loaded with sharing capabilities

---

## Frontend Error Handling

The frontend handles API errors gracefully:

- **Network errors** → "Unable to reach server. Please check your connection."
- **4xx errors** → "Invalid request. Please refresh and try again."
- **5xx errors** → "Server error. Please try again later."
- **Timeout** → "Request took too long. Please try again."

All errors are displayed to users with an error message component that includes `role="alert"` for accessibility.
