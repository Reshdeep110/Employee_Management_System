# Record a genuine working demonstration

Use **MySQL mode** for this recording, since the narration mentions MySQL. Do not record H2 mode and describe it as MySQL.

1. Open the running React app at localhost:5173. Show the employee directory.
2. Click Add employee. Enter a dummy name, a unique example.com email, Engineering and Java Developer. Select Active and today's joining date.
3. Click Save employee. Let the success notification and new row stay visible.
4. In the browser Network panel, select the POST /api/employees request. Show the request JSON and HTTP 201 response with the new database-generated ID.
5. Open EmployeeController.java in IntelliJ. Point out the @PostMapping method.
6. Open EmployeeService.java. Point out duplicate-email checking and repository.saveAndFlush.
7. Open EmployeeRepository.java. Show that it extends JpaRepository.
8. In MySQL Workbench, run database/queries.sql and show the saved employee.
9. Back in React, refresh the browser and search for the new employee. The data remains because it is stored in MySQL.
10. Edit the job role and show the changed database value. If desired, delete the dummy record and refresh Workbench to show it is gone.

Use only dummy data for public recordings. Record your actual screen and explain what you verified. This project includes optional local Docker packaging, but it is not deployed to a public hosting provider. Do not show a fake deployment URL or say it is live publicly unless you deploy it yourself.

The interface is inspired by your earlier video. It is not an exact copy of a recovered original project: video pixels do not contain React, Java or database source files.
