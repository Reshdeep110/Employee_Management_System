USE peopleflow;
SELECT id, name, email, department, role, status, joined_on
FROM employees ORDER BY id DESC;

SELECT department, COUNT(*) AS employee_count
FROM employees GROUP BY department;

-- Change the email to the one you added in the React form.
SELECT * FROM employees WHERE email = 'demo.employee@example.com';
