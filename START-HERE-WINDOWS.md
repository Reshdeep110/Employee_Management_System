# PeopleFlow — Windows setup (start here)

This version adds administrator-managed login to your React + Spring Boot + MySQL project. There is no public signup. Existing employee records stay in your existing MySQL database; the application adds a separate `users` table for login accounts.

## 1. Extract into a new folder

Stop your old frontend and backend terminals with Ctrl+C. Extract this ZIP into a new folder such as `C:\Users\DELL\Downloads\PeopleFlow-Login`. Open the extracted `employee-management` folder in VS Code. Do not overwrite your old project until you have tried the update.

## 2. Check the tools

You need a JDK (your installed Temurin JDK 21 works), Node.js 22.12 or newer, and your running MySQL server. In a terminal:

```powershell
java -version
javac -version
node -v
```

`javac` is the Java compiler. The included MySQL launcher automatically looks for a JDK under `C:\Program Files\Eclipse Adoptium`; if it cannot find one, it asks for the JDK folder. Never use a `jre` folder for JAVA_HOME.

## 3. Prepare MySQL

Open MySQL Workbench, connect using your existing MySQL account, and run:

```sql
CREATE DATABASE IF NOT EXISTS peopleflow;
```

This keeps an existing database and its records. Do not drop any tables. Start the MySQL Windows service if your connection is offline.

## 4. Start the backend and create the first admin

Double-click **start-backend-mysql.cmd** inside the extracted project. This starts the included PowerShell launcher without permanently changing your PowerShell execution policy.

Answer its prompts:

1. **MySQL username:** press Enter for `root`.
2. **MySQL password:** type your existing password (you previously used `root`). The characters will be hidden while you type.
3. **First administrator email:** enter the email you want to use on the login page.
4. **Administrator full name:** enter your name.
5. **New login password:** choose a separate password of at least 12 characters (maximum 72 UTF-8 bytes). Remember it; it will not be printed or saved in a text file.

The first launch downloads Maven dependencies, compiles Java, connects to MySQL and creates the first admin **only if the users table is empty**. Keep this terminal open. Wait for `Started PeopleFlowApplication`.

Your MySQL password and PeopleFlow login password have different purposes. Never try to sign in with the database username unless that is the email you deliberately created as an application account.

On later launches, enter the MySQL credentials and **press Enter at the administrator email prompt**. Your account is already in MySQL. Entering bootstrap credentials again does not reset an existing account.

## 5. Start the frontend

In VS Code, open a second terminal from the extracted project folder and run:

```powershell
cd .\frontend
npm.cmd ci
npm.cmd run dev
```

`npm.cmd ci` installs the versions recorded in the lockfile. Run it once after extraction (and whenever the lockfile changes). `npm.cmd run dev` starts the React development server. Keep this terminal open too.

Open **http://127.0.0.1:5173/**. Use this exact hostname consistently. Sign in using the administrator email and login password you chose in step 4.

## 6. Create accounts

1. Open **Accounts** in the sidebar.
2. Click **Create account**.
3. Enter the person's name, email, access role and an initial password (12+ characters).
4. Click **Create account** and share the credentials privately.

**Admin:** can add, edit and delete employee records, export CSV, create accounts, reset other users' passwords and activate/deactivate accounts.

**Staff:** can view employees, departments and overview, search/filter the directory and export the visible filtered data. Staff cannot change employee data or access account management. These restrictions are enforced by the backend as well as the UI.

Accounts are separate from employee profiles. Adding an employee does not create a login; creating a login does not add an employee record. Use the same email if appropriate, but these records are intentionally independent.

## 7. Passwords and access

- Click the **key icon** in the top bar to change your own password. Enter your current password and the new password twice. You will need to sign in again.
- Admins can click the **lock icon** beside another account to reset its password. Share the new password privately. There is no automated email delivery or public forgot-password flow.
- Click **Deactivate**, then confirm, to stop a user signing in. Their existing sessions are rejected on their next API request. Reactivating the account requires a fresh login.
- You cannot deactivate yourself or reset your own password through the admin reset action.
- Click **Sign out** to end the session. Inactive browser sessions expire after 30 minutes; restarting the backend also clears browser sessions.
- Create a second trusted administrator if you need another person to help with account recovery. If every administrator loses their password, this version has no public recovery endpoint; do not delete the users table to recover it.

## 8. Verify your database

In MySQL Workbench:

```sql
SELECT id, name, email, role, enabled, created_at
FROM peopleflow.users
ORDER BY id DESC;

SELECT *
FROM peopleflow.employees
ORDER BY id DESC;
```

The `password_hash` column contains BCrypt hashes, not readable passwords. Do not manually insert a plain password into that column. The dashboard footer/health endpoint should indicate MySQL. If it says H2 local demo, stop that backend and use `start-backend-mysql.cmd`.

## 9. If something goes wrong

- **No compiler / javac not found:** run the MySQL launcher and select a JDK folder containing `bin\javac.exe`. Java 8 JRE is not enough.
- **Database access denied:** check your MySQL service, username and database password. Your login password is not the database password.
- **Login fails:** use the first-admin email and password you chose. Bootstrap variables only work while users is empty. Ask another admin to reset an existing account.
- **401 / session ended:** sign in again.
- **403 / token expired:** refresh the page and retry. Staff cannot perform admin actions.
- **Port already in use:** stop the old frontend/backend with Ctrl+C before starting this version.
- **Import error for logo:** the supplied `frontend/src/assets/peopleflow-logo.png` must stay in place.
- **Dependency download error:** check your internet connection and rerun the launcher / npm command.

## Manual backend commands (alternative to launcher)

From the project root, in PowerShell:

```powershell
cd .\backend
$env:JAVA_HOME = 'C:\Program Files\Eclipse Adoptium\jdk-21.0.12.101-hotspot'
$env:Path = "$env:JAVA_HOME\bin;$env:Path"
$env:SPRING_PROFILES_ACTIVE = 'mysql'
$env:DB_URL = 'jdbc:mysql://127.0.0.1:3306/peopleflow?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC'
$env:DB_USERNAME = 'root'
$env:DB_PASSWORD = Read-Host 'MySQL password'
$env:ADMIN_EMAIL = Read-Host 'First administrator email (first launch only)'
$env:ADMIN_NAME = Read-Host 'Administrator name'
$env:ADMIN_PASSWORD = Read-Host 'New login password (12+ characters)'
.\mvnw.cmd spring-boot:run
```

The manual Read-Host inputs are visible; use the included launcher for hidden password entry. Environment variables apply to that terminal, and the `.env` file is only used by Docker Compose, not by native PowerShell.

## Optional H2 demo

To test without MySQL, set `SPRING_PROFILES_ACTIVE=demo` and the same `ADMIN_EMAIL`, `ADMIN_NAME`, `ADMIN_PASSWORD` bootstrap variables in a backend terminal before running Maven. H2 accounts and employees are stored in `backend/data/peopleflow.mv.db`, independently of MySQL. Do not expect H2 records to appear in Workbench.

## Optional Docker

Copy `.env.example` to `.env`, replace all example database and administrator credentials, then run `docker compose up --build`. This creates a separate Docker MySQL database, not your existing Windows MySQL database. Its Workbench port is 3307. Docker setup requires Docker Desktop. Keep port 5173/8080 free before starting it.

## Tests and build

Backend: from backend, run `.\mvnw.cmd test`. Tests use an isolated in-memory H2 database and do not touch your MySQL data.
Frontend: from frontend, run `npm.cmd run build`.

For public deployment, use HTTPS, set `COOKIE_SECURE=true`, deploy frontend/API on the same site, configure login rate limiting at the reverse proxy, use a dedicated least-privilege MySQL user, and manage credentials outside source control. This ZIP is configured for local development and demonstration.
