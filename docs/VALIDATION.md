# Validation of this update

- React/Vite production build: passed.
- Admin and Staff server-render checks: passed (including role-specific controls).
- Employee API integration tests: 5 passed.
- Authentication/authorization integration tests: 9 passed.
- Spring Boot started successfully with a fresh in-memory H2 database and bootstrapped an administrator.

Tests cover employee CRUD and validation, anonymous rejection, login/logout, CSRF rejection and browser-style token rotation, Staff read/write restrictions, account creation, hashed passwords, duplicate account rejection, deactivation/session revocation, own-password changes, and administrator password reset.

Backend tests use H2 in MySQL compatibility mode. The actual MySQL connection and Windows launcher must be checked on your computer. This environment could not run Chromium because browser socket creation was blocked, so browser visual and end-to-end interaction checks were not completed.
