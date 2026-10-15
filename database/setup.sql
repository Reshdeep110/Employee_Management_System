-- Run this file in MySQL Workbench, logged in as root.
-- Change the example password before you run it, and use the same value in DB_PASSWORD.
CREATE DATABASE IF NOT EXISTS peopleflow CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'peopleflow'@'localhost' IDENTIFIED BY 'ChangeThisLocalPassword123!';
GRANT ALL PRIVILEGES ON peopleflow.* TO 'peopleflow'@'localhost';
-- Spring Boot creates the employees table on first startup (ddl-auto=update).
-- If this account already exists, change its password explicitly with ALTER USER.
