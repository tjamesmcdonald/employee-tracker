INSERT INTO department (name)
VALUES
    ('Sales'),
    ('Human Resources'),
    ('Maintenance'),
    ('Purchasing');

INSERT INTO role (title, salary, department_id)
VALUES
    ('Cashier', 30000.00, 1),
    ('Department Head', 110000.00, 2),
    ('Custodian', 20000.00, 3),
    ('Purchaser', 50000, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
    ('Thomas', 'Eddison', 1, 1),
    ('Robert', 'Oppenheimer', 2, 2),
    ('Nikola', 'Tesla', 3, 3),
    ('Enrico', 'Fermi', 4, 4);
