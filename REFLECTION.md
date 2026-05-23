# SecureGate — Reflection & Engineering Analysis

**Name:** [Your full name]
**Cohort:** Design to MVP Bootcamp
**Live URL:** [Your Vercel deployment link]
**GitHub Repo:** [Your repo URL]

---

## Part 1 — What I Built

SecureGate is a standalone authentication app with sign-up, login, email verification, password reset, rate limiting, and a protected dashboard. It uses Next.js 16 with the App Router, Prisma 7 with PostgreSQL, NextAuth v5 (Credentials provider), bcrypt hashing (12 salt rounds), Resend for transactional emails, Zod for validation, and an in-memory rate limiter for brute-force protection.

## Part 2 — What Surprised Me

The hardest part was the Prisma 7 migration. I expected to just add `url = env("DATABASE_URL")` to the schema like in Prisma 6, but version 7 requires a `prisma.config.ts` file and a driver adapter (`@prisma/adapter-pg`) passed to `PrismaClient`. The abstraction leaked hard — I had to read the Prisma 7 config types and the adapter-pg source to understand the new constructor pattern. This is a textbook example of the Law of Leaky Abstractions.

## Part 3 — Engineering Laws Quiz

### Q1 — Murphy's Law

**Code reference:** `app/api/forgot-password/route.ts` lines 36-45, `lib/rate-limit.ts` lines 1-20

**My Answer:** Murphy's Law forced me to add rate limiting on the login and forgot-password endpoints. Without rate limiting, an attacker could brute-force passwords indefinitely or spam the forgot-password endpoint to flood a user's inbox. I also had to handle the case where the forgot-password endpoint returns a success message even when the email doesn't exist — otherwise an attacker could enumerate which emails are registered.

**What goes wrong if ignored:** Without rate limiting, a single IP could make unlimited login attempts, making brute-force feasible. Without the generic success message, an attacker could build a list of registered emails by observing different responses.

### Q2 — Law of Leaky Abstractions

**Code reference:** `lib/prisma.ts` lines 1-10, `prisma.config.ts` lines 1-8

**My Answer:** Prisma is the abstraction that leaked most. In Prisma 6, the database URL is declared in `schema.prisma` with `env()`. Prisma 7 removed that and requires a `prisma.config.ts` file with `defineConfig()`. Worse, `PrismaClient` now needs an adapter (`@prisma/adapter-pg`) passed to its constructor — something I only discovered when the build failed with `PrismaClient needs to be constructed with a non-empty, valid PrismaClientOptions`. The abstraction hid the fact that Prisma 7 fundamentally changed its driver layer.

**What goes wrong if ignored:** The app won't build or connect to the database. The error message is opaque — it says "non-empty PrismaClientOptions" without mentioning adapters.

### Q3 — YAGNI

**Code reference:** `lib/auth.ts` lines 1-45

**My Answer:** SecureGate intentionally omits social login (Google, GitHub), multi-factor authentication, and audit logs because the task scope is specifically credentials-based auth with email verification. Adding OAuth providers would require additional route handling, callback URLs, and provider configuration — none of which are needed for the core flow. Adding audit logs would require an AuditLog table, a middleware layer, and storage considerations. Later, if the app grew, I'd add OAuth via NextAuth's provider array (just add `GitHub({...})` to the providers list), MFA via `@simplewebauthn/browser` with a TOTP table, and audit logs via a Prisma `AuditLog` model with a middleware hook.

**What goes wrong if ignored:** Premature feature work delays the core auth flow, increasing the risk of not finishing the required features within the time limit.

### Q4 — Kerckhoffs's Principle

**Code reference:** `app/api/auth/signup/route.ts` line 30 — `bcrypt.hash(password, 12)`

**My Answer:** A salt is a random value appended to each password before hashing, ensuring identical passwords produce different hashes. bcrypt automatically generates a random salt per password and includes it in the output hash. If I stored SHA-256 hashes instead, an attacker with a rainbow table (precomputed hash-to-password map) could reverse the hashes in seconds. bcrypt's adaptive cost factor (12 rounds ≈ 250ms per hash) makes brute-forcing computationally expensive — even with the source code and salt known.

**What goes wrong if ignored:** A database breach would expose all passwords. With SHA-256 and no salt, 90%+ of weak passwords would be recovered instantly via rainbow tables.

### Q5 — Postel's Law + Security by Design

**Code reference:** `app/api/forgot-password/route.ts` lines 36-45 — `if (user) { ... }` + always returning success

**My Answer:** The forgot-password endpoint returns the same success message whether the email exists or not: "If that email is registered, a reset link has been sent." This is Postel's Law applied to security — be conservative in what you send. If the response differed (e.g., "Email not found" vs "Reset link sent"), an attacker could probe the endpoint to build a list of registered users.

**What goes wrong if ignored:** User email enumeration becomes trivial. An attacker could scrape which users are on the platform and target them with phishing attacks.

### Q6 — The Boy Scout Rule

**Code reference:** `proxy.ts` lines 1-16

**My Answer:** The scaffolded project had a `middleware.ts` convention (deprecated in Next.js 16). I cleaned it up by renaming to `proxy.ts` and using the new `export function proxy()` signature as required by the Next.js 16 upgrade guide. I also removed the unused Geist font imports from the layout that the scaffold added by default.

**What goes wrong if ignored:** Using the deprecated `middleware.ts` still works in Next.js 16 but logs deprecation warnings. More importantly, it would be harder to upgrade to future versions.

### Q7 — Gall's Law

**Code reference:** Project structure — built in 5 sequential phases

**My Answer:** SecureGate was built phase by phase: scaffold → auth core → email verification → forgot password → rate limiting. Each phase was a working, testable system before the next was added. This is Gall's Law in action — a complex system that works evolved from a simple system that worked. If I had tried to build all six phases simultaneously, bugs would compound (e.g., a broken signup would make it impossible to test verification), and debugging surface area would explode.

**What goes wrong if ignored:** Trying to build everything at once means nothing works until everything works. Debugging becomes impossible because you don't know which layer caused the failure.

### Q8 — Law of Leaky Abstractions (ORM)

**Code reference:** `prisma/schema.prisma` — `User`, `Account`, `Session` models; NextAuth `PrismaAdapter`

**My Answer:** In my Prisma schema, the `User` model has an `emailVerified` field of type `DateTime?`. But at the database level, Prisma creates it as a nullable `timestamp(3)` column. These are not the same — Prisma's `DateTime` in the schema maps to specific SQL types, and Prisma's optional handling (`?`) creates nullable columns, not application-level optionality. The leak is that Prisma's schema language hides PostgreSQL's nullability, default value expressions, and index structures. NextAuth's `PrismaAdapter` also expects specific model shapes — if I had omitted the `Account` or `Session` models, the adapter would fail at runtime despite the schema passing validation.

**What goes wrong if ignored:** Assuming the schema model and database structure are identical leads to confusion when raw SQL queries, migrations, or direct database access behave differently from Prisma queries.

### Q9 — Zawinski's Law

**Code reference:** `lib/rate-limit.ts` lines 1-20

**My Answer:** Rate limiting is not built into Next.js or NextAuth. I had to add it myself as a standalone module. This demonstrates that frameworks are focused tools — they handle auth flows and routing, not abuse prevention. Zawinski's Law warns that "every program attempts to expand until it can read mail." If Next.js or NextAuth tried to build in rate limiting, they'd grow beyond their core responsibility, eventually becoming bloated. By keeping rate limiting as a separate concern, I can swap it for Upstash Redis in production without touching auth logic.

**What goes wrong if ignored:** Without a separate rate-limiting layer, the login endpoint is unprotected. Adding it inside NextAuth would couple auth logic with abuse prevention, making both harder to change independently.

### Q10 — Principle of Least Surprise

**Code reference:** `app/login/page.tsx` lines 29-33 — `setError("Invalid credentials")`

**My Answer:** The login form shows a single error message: "Invalid credentials" — regardless of whether the email doesn't exist or the password is wrong. This is the Principle of Least Surprise: users expect a single, clear failure message. A more specific message like "Password is incorrect" reveals that the email exists, which is a security leak. The wording "Invalid credentials" covers both cases without surprising the user with technical details or security-sensitive information.

**What goes wrong if ignored:** Distinct error messages for "email not found" vs "wrong password" enable user enumeration attacks.

### Q11 — Murphy's Law + Defensive Programming

**Code reference:** `app/dashboard/page.tsx` lines 6-17 — `auth()` check + `emailVerified` check

**My Answer:** The middleware (`proxy.ts`) checks for a session cookie and redirects unauthenticated users to `/login`. But the dashboard page itself also calls `auth()` and redirects if no session exists. This is defense in depth — if the middleware fails to redirect (e.g., the cookie exists but is invalid), the page-level check catches it. If a user manually deletes their session cookie, the NextAuth `auth()` call returns `null`, the dashboard redirects to `/login`, and the middleware won't match on the redirect since `/login` isn't in its matcher. The exact path: delete cookie → navigate to /dashboard → middleware runs (no cookie → passes through because NextAuth proxy handles auth) → dashboard page calls `auth()` → `auth()` returns null → `redirect("/login")`.

**What goes wrong if ignored:** A stale or invalid session could allow access to the dashboard page without proper authentication. The middleware-only approach is a single point of failure.

### Q12 — Kerckhoffs's Principle + Technical Debt

**Code reference:** `.env.local` — `NEXTAUTH_SECRET`

**My Answer:** If `NEXTAUTH_SECRET` was accidentally committed to GitHub, an attacker who finds it can forge JWT tokens and impersonate any user. The recovery steps are: (1) Rotate the secret immediately — generate a new one and update both `.env.local` and Vercel env vars. (2) All existing JWT sessions become invalid — users must re-login. (3) If using database sessions (not JWT), sessions survive because they're stored in the DB, not signed with the secret. (4) Remove the secret from git history with `git filter-branch` or `BFG Repo-Cleaner` — but assume the secret is compromised regardless. (5) Monitor for unauthorized access in logs. (6) Add a pre-commit hook to scan for secrets.

**What goes wrong if ignored:** An attacker with the secret can forge session tokens, access any account, and exfiltrate user data. The secret is the root of trust for the entire auth system.

### Q13 — Conway's Law

**Code reference:** Project structure — `app/`, `lib/`, `prisma/`, `emails/`, `proxy.ts`

**My Answer:** Conway's Law says systems mirror the communication structure of the people who build them. As a solo developer, my folder structure reflects how I think about the system: `app/` for pages/routes (the UI layer), `lib/` for shared logic (auth, prisma, utils), `prisma/` for data models, `proxy.ts` for edge routing. Each directory is a "team member" with a clear responsibility. If I had a frontend specialist and a backend specialist on the team, the structure would likely split into `client/` and `server/` directories — reflecting the team's communication boundaries.

**What goes wrong if ignored:** A messy folder structure with no clear ownership boundaries makes it hard to reason about the system. New developers can't tell where to add code, leading to duplication and circular dependencies.

### Q14 — Technical Debt

**Code reference:** `lib/rate-limit.ts` lines 1-20

**My Answer:** The in-memory rate limiter is technical debt. It works for a single-process development server but will fail in production when multiple Vercel serverless instances handle requests — each instance has its own memory, so a user could bypass the 5-attempt limit by hitting different instances. The refactored version uses Upstash Redis:

```typescript
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

export const rateLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "10 m"),
  analytics: true,
})
```

I left the simple version because the task spec says "upstash/ratelimit or custom middleware" and the in-memory version is sufficient for local development. However, deploying to Vercel without Upstash would make rate limiting ineffective.

**What goes wrong if ignored:** In production on Vercel, the rate limiter becomes a no-op across multiple instances, leaving the login endpoint unprotected against brute-force attacks.

### Q15 — Synthesis: All Principles Apply

**Code reference:** All files

**My Answer:** If I added Flutterwave payment integration to SecureGate, every engineering principle becomes more critical:
- **Murphy's Law** — Payment failures, duplicates, and webhook retries will happen. Idempotency keys, transaction logging, and idempotent webhook handlers are mandatory.
- **Kerckhoffs's Principle** — API keys and webhook secrets must be environment variables, not hardcoded. Security must rely on the key strength, not hiding the integration code.
- **YAGNI** — Only build the specific payment flow required (e.g., one-time payment for premium dashboard), not a full payment orchestration system.
- **Postel's Law** — Webhook handlers must be conservative in what they accept. Validate signatures before processing.
- **Gall's Law** — Start with a simple checkout → payment confirmation → dashboard unlock. Add refunds, partial payments, and subscriptions later.
- **Boy Scout Rule** — Clean up the payment callback handler before adding the webhook handler.
- The **Principle of Least Surprise** becomes critical when money is involved — users expect immediate feedback on payment success/failure, clear error messages, and no double charges. Idempotency is no longer optional.

**What goes wrong if ignored:** One missing idempotency check or unhandled webhook retry could charge a user twice, eroding trust and requiring manual refunds. Payment integration raises the stakes on every principle.

## Part 4 — One Thing I Would Refactor

The in-memory rate limiter (`lib/rate-limit.ts`). For Vercel production, I'd replace it with Upstash Redis-based rate limiting as shown in the Q14 answer above. This ensures rate limits are consistent across all serverless function instances.

## Part 5 — How This Changes How I Build

Before this task, I thought authentication was about login forms and "protecting" routes. Now I understand that auth is a security boundary that touches every layer of the stack — the database schema (hashed passwords, token expiry), the API layer (rate limiting, error message wording), the middleware (redirect logic, verified-user checks), and the UI (password strength indicators, loading states, generic error messages). I now think about what Murphy would do before writing any auth code, and I check every endpoint for information leakage before considering it complete.
