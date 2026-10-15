# Validation record

## Completed

- Backend compiled with Java 17 and Spring Boot 3.5.7.
- Five Spring Boot / MockMvc integration tests passed: create/read/update/delete lifecycle; case-insensitive duplicate email rejection; invalid email rejection; blank name rejection; missing employee deletion returns 404.
- Tests use an isolated H2 database, not MySQL.
- Frontend dependencies installed successfully and `npm run build` completed successfully.
- Backend started successfully in the file-backed H2 demo profile, and `/api/health` responded to an HTTP request.
- Maven wrapper scripts generated for Windows and Unix with Maven 3.9.9.

## Not verified in this environment

- Browser interaction / screenshot review: an automated browser was unavailable and its download failed. No completed end-to-end browser test is claimed.
- MySQL runtime and Docker Compose: no MySQL Server or Docker engine was available. Configuration and instructions are provided, but require verification on your computer.
- Windows launch scripts: supplied for Windows; build checks ran on Linux.

## Your acceptance check before recording

1. Follow START-HERE-WINDOWS.md and run the MySQL route.
2. Confirm the footer says MySQL and the header says API connected.
3. Add a dummy employee with a unique example.com email.
4. Refresh the browser; verify the row remains.
5. Run database/queries.sql in Workbench and locate the row.
6. Edit the role and check the result in Workbench.
7. Try adding the same email again; expect a duplicate error.
8. Try search, filters, pagination, Overview and Departments.
9. Export CSV and open it; it should contain the filtered records.
10. Delete the dummy employee and confirm its row disappears from MySQL.
11. Stop and restart the backend; verify your other records remain.

This is a learning/portfolio application, without authentication or role-based access control. Use sample data for your demonstration.
