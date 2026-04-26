# SIPELAN Frontend Context

## Architecture
- **Framework:** React 19 (Vite)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **UI Components:** Shadcn UI (Radix UI)
- **Charts:** Recharts

## API & Authentication
- **Base URL:** `http://localhost:8080/api`
- **API Client:** Custom `request` wrapper in `src/lib/api.ts`.
- **Token Management:**
    - Token is stored in a secure `HttpOnly` cookie named `token`.
    - Client requests must include `credentials: 'include'`.
    - A simple flag `sipelan-is-logged-in` is stored in `localStorage` to track session presence on the frontend.
- **Auto-Logout/Redirect:**
    - Any `401 Unauthorized` response from the backend triggers an automatic `localStorage.removeItem("sipelan-is-logged-in")` and `window.location.reload()`.
    - This ensures users are redirected to the login screen if their session expires or becomes invalid.

## Project Structure
- `src/components/dashboard/`: Main dashboard views and dialogs.
- `src/hooks/use-api.ts`: Custom hooks for data fetching and mutations.
- `src/lib/api.ts`: API service layer.
- `src/lib/types.ts`: TypeScript interfaces matching backend models.
