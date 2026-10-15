# PeopleFlow Employee Management

React + Spring Boot + MySQL, with administrator-managed authentication.

**Start with [START-HERE-WINDOWS.md](START-HERE-WINDOWS.md).** It explains first-admin setup, database connection, frontend/backend commands and common errors.

## Included

- Professional responsive login, PeopleFlow logo and a light blue-and-white workspace.
- MySQL-backed accounts, BCrypt password hashes and HttpOnly session cookies.
- CSRF protection and server-enforced Admin/Staff roles.
- Administrator account creation, deactivation/reactivation and password reset.
- Own-password changes, logout, expired-session handling.
- Existing employee CRUD, filtering, search, CSV export, overview and departments.
- Integration tests for employee operations and authentication/authorization.

No public signup. No hardcoded application login. Bootstrap the first admin through the Windows launcher. Login accounts and employee records are independent.

See `docs/AUTHENTICATION.md` for the endpoints and implementation notes. Original demo notes in `docs` may describe the pre-authentication workflow; API calls now require a session and CSRF token for mutations.
