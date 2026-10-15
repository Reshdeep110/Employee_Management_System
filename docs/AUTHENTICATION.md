# Authentication implementation

## Data and session model

`users` stores name, normalized email, BCrypt hash, ADMIN/STAFF role, enabled flag, auth_version and created_at. Controllers return UserView DTOs, never entities or hashes. Passwords have a 12-character minimum and a 72-byte UTF-8 maximum for BCrypt.

Spring Security handles form login, session fixation protection, session persistence and logout. React sends credentials through the same-origin Vite proxy. The default session CSRF repository is retained; React fetches a masked token from `/api/auth/csrf`, sends the returned header on mutations, and fetches a fresh token after login/logout. Tokens are not stored in localStorage. CSRF errors clear the cached token for the next explicit retry.

Each authenticated request checks the current account status/version. Disabling, re-enabling or resetting a password increments auth_version. A mismatched session is rejected on its next request. Own-password changes require the current password and end all existing sessions. The users table is locked during status changes to guard active-admin checks.

## Endpoints

| Method | Path | Access |
|---|---|---|
| GET | /api/auth/csrf | Public, establishes CSRF session |
| POST | /api/auth/login | Public + CSRF; form-urlencoded email/password |
| GET | /api/auth/me | Signed-in user |
| POST | /api/auth/logout | CSRF; clears session |
| POST | /api/auth/password | Signed-in user + CSRF |
| GET | /api/admin/users | Admin |
| POST | /api/admin/users | Admin + CSRF |
| PATCH | /api/admin/users/{id}/status | Admin + CSRF |
| POST | /api/admin/users/{id}/password | Admin + CSRF |
| GET | /api/employees/** | Admin/Staff |
| POST/PUT/DELETE | /api/employees/** | Admin + CSRF |
| GET | /api/health | Public |

No public registration. Unmatched endpoints are denied. Staff have employee read/export access, not employee writes or account management.

## First administrator

Bootstrap credentials are supplied through ADMIN_EMAIL, ADMIN_NAME and ADMIN_PASSWORD and used only when users is empty. Never ship a default admin password. Start one backend instance for bootstrap. Later changes to these variables do not reset existing accounts.

## Scope

Local development configuration. No email delivery, MFA, public password recovery, persistent/distributed sessions or audit log. Sessions clear when the backend restarts. Configure HTTPS/secure cookies, rate limiting, infrastructure secrets and database permissions before public deployment.

Implementation references: Spring Security 6.5 authentication persistence and CSRF documentation:
https://docs.spring.io/spring-security/reference/6.5/servlet/authentication/persistence.html
https://docs.spring.io/spring-security/reference/6.5/servlet/exploits/csrf.html
