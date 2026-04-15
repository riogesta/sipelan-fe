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
    - Token is stored in `localStorage` under the key `sipelan-token`.
    - Token is automatically trimmed of whitespace before being sent in the `Authorization` header.
- **Auto-Logout/Redirect:**
    - Any `401 Unauthorized` response from the backend triggers an automatic `localStorage.removeItem("sipelan-token")` and `window.location.reload()`.
    - This ensures users are redirected to the login screen if their session expires or becomes invalid.

## Project Structure
- `src/components/dashboard/`: Main dashboard views and dialogs.
- `src/hooks/use-api.ts`: Custom hooks for data fetching and mutations.
- `src/lib/api.ts`: API service layer.
- `src/lib/types.ts`: TypeScript interfaces matching backend models.
