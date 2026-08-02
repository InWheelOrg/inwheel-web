# Review instructions

## What Important means here

Reserve 🔴 Important for findings that would leak the shared `inwheel-api` API key
to the browser, let someone bypass the page gate, corrupt a previous friend's
accessibility data, or violate a core invariant below. Style, naming, and
refactoring suggestions are 🟡 Nit at most.

## Core invariants — always check, always Important

- **The `inwheel-api` API key never reaches the client.** It's read from a
  server-only env var (no `NEXT_PUBLIC_` prefix) and attached only inside a
  Server Action. Flag any code path that could expose it to a Client Component,
  a client bundle, or a response body.
- **Every route is gated by `src/proxy.ts`, not per-page checks.** Flag any new
  route that tries to re-implement its own auth check instead of relying on the
  proxy matcher, and flag any change to the matcher that could accidentally
  exclude a route that should be protected.
- **The session cookie is `httpOnly`, sealed via `iron-session`, never a raw
  password or unsealed value.** Flag any code that stores or compares a raw
  password anywhere other than `isCorrectPagePassword` (`src/lib/session.ts`).
- **Accessibility PATCH payloads only include fields the friend actually
  touched** (dirty-field tracking), relying on the API's RFC 7396 JSON Merge
  Patch semantics (omitted = untouched, explicit `null` = cleared). Flag any
  code that resubmits a whole profile/section snapshot regardless of what was
  edited — that reintroduces the stale-data clobbering the merge-patch fix was
  meant to prevent.
- **UI copy is French only.** Flag new user-facing English strings.

## Cap the nits

Report at most five 🟡 Nits per review. If you found more, say "plus N similar
items" in the summary. If all findings are nits, lead the summary with "No
blocking issues."

## Do not report

- Formatting, import ordering, or lint issues — ESLint and CI handle these
- Missing tests for trivial pass-throughs or code paths that cannot fail
- Documentation suggestions unless CLAUDE.md explicitly requires docs for this
  case
- Hypothetical future concerns without concrete evidence in the diff

## Always check

- No `NEXT_PUBLIC_` env var, client component, or client-visible response ever
  carries `INWHEEL_API_KEY`, `PAGE_PASSWORD`, or `SESSION_SECRET`
- New routes are covered by the proxy matcher (`src/proxy.ts`) unless
  deliberately public (e.g. the gate page itself)
- Cookies set anywhere use `httpOnly`, `secure` in production, and `sameSite`
- New Server Actions that call `inwheel-api` attach the API key server-side
  only, and validate/sanitize input before sending
- New exported functions, Server Actions, and components are covered by unit
  or E2E tests for each meaningful branch (happy path, validation/error path,
  edge cases). Flag absence as 🔴 Important unless the function is a trivial
  pass-through.
