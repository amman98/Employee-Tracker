INSERT INTO department (name)
VALUES  ("Engineering"),
        ("Human Resources"),
        ("Customer Service"),
        ("Marketing");

INSERT INTO role (title, salary, department_id)
    VALUES  ("Software Engineer", 100000, 1),
            ("HR Rep", 50000, 2),
            ("Service Advisor", 20000, 3),
            ("Sales Manager", 40000, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
    VALUES  ("John", "Cena", 1, null),
            ("Amman", "Nega", 1, 1);