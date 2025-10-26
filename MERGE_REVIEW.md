Merge Review — codex/revise-company-creation-flow-for-rut-issues

Date: 2025-10-26
Branch merged: origin/codex/revise-company-creation-flow-for-rut-issues
Target branch: main

Summary of purpose
- Fix company creation flow RUT handling across front-end forms and utilities.
- Normalize/sanitize RUT payloads so back-end receives consistent values.
- Improve formatting helpers and input formatting for user experience.

Files changed (high level)
- web/src/utils/rut.ts
  - Added `normalizeRut` to return a stable numericPart-VD format (e.g. "12345678-K").
  - Exported `stripRutFormatting` utility for queries and search normalization.
  - Kept `formatRut` and `formatRutInput` for display/input formatting.
  - Kept `isValidRut` for local validation.

- web/src/components/CompanyForm.tsx
  - Resolved merge conflicts and integrated RUT formatting/normalization.
  - Use `formatRutInput` for input formatting and `normalizeRut` for payloads.
  - Switched onSubmit contract to accept `CompanyInput`.
  - Cleaned up Unicode corruption in UI strings (accents/diacritics fixed).

- web/src/components/WorkerForm.tsx
  - Similar RUT changes: use `formatRutInput` for input and `normalizeRut` in payload.
  - Adjusted types and fixed merge markers.

- web/src/types/company.ts
  - Renamed exported `Worker` interface to `WorkerModel` to avoid collision with the global `Worker` type (web worker). This avoids ESLint `no-redeclare` errors.
  - Updated `WorkerProfile` to reference the new `WorkerModel`.

- Various components and hooks updated to `WorkerModel` and to import types appropriately:
  - web/src/hooks/useCompany.ts
  - web/src/pages/CompanyDetailsPage.tsx
  - web/src/components/WorkerList.tsx
  - web/src/components/WorkerCard.tsx

- Unicode/UTF8 fixes applied to `CompanyForm.tsx` (several labels and placeholder texts).

Lint / Type issues addressed
- Resolved ESLint errors that blocked the previous lint run:
  - Replaced conflicting `Worker` type with `WorkerModel` across the codebase.
  - Added type-only React imports (`import type * as React from 'react'`) in files where only React types are referenced to satisfy ESLint's "React is not defined" errors without introducing unused value imports.
  - Cleaned up all merge conflict markers.

Notes & rationale
- Renaming `Worker` to `WorkerModel` is a conservative change to avoid collisions with the browser/DOM `Worker` type. If you prefer the original `Worker` name, we can instead adjust ESLint globals/config (but this change is safer and local).
- The `normalizeRut` function outputs a stable form (numericPart-VD). For display, `formatRut` will add dots and the dash as needed.
- UI strings suffered UTF-8 corruption; these were fixed in `CompanyForm.tsx`.

Validation performed
- Ran `pnpm --filter web lint` locally; previous errors for React/Worker redeclare were fixed. Note: the project shows a TypeScript version warning from the eslint parser due to a mismatched global TypeScript version; this is a warning, not a blocker.

Recommended next steps
1. Run a full typecheck and build locally:
   - `pnpm run typecheck`
   - `pnpm run build`
2. Run full test suite if available:
   - `pnpm run test`
3. If CI is configured, open a PR and let CI run the repo checks.

Commit & Deploy
- I will commit this review file alongside any remaining local changes, then proceed to run `pnpm run deploy` as requested.

If anything in the summary looks off or you'd like a different naming strategy for types, tell me and I will adjust before pushing/deploying.
