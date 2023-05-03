const inquirer = require('inquirer');
const mysql = require('mysql2');

const db = mysql.createConnection(
    {
        host: '127.0.0.1',
        user: 'root',
        password: 'password',
        database: 'companies_db'
    },
    console.log(`Connected to the companies_db database.`)  
);

db.connect();

function trackEmployees() {
    inquirer
        .prompt([
            {
                type: "list",
                message: "What would you like to do?",
                choices: ["View All Departments", "Add A Department", "View All Roles", "Add A Role", "View All Employees", "Add An Employee", "Update Employee Role", "Update Employee Manager", "View Employees By Manager", "View Employees By Department", "Delete A Department", "Delete A Role", "Delete An Employee", "View Budget of Department", "Quit"],
                name: "queryCompany",
            }
        ]).then(ans => {
            if(ans.queryCompany === "View All Departments") {
                getAllDepartments();
            }
            else if(ans.queryCompany === "View All Roles") {
                getAllRoles();
            }
            else if(ans.queryCompany === "View All Employees") {
                getAllEmployees();
            }
            else if(ans.queryCompany === "Add A Department") {
                addDepartment();
            }
            else if(ans.queryCompany === "Add A Role") {
                addRole();
            }
            else if(ans.queryCompany === "Add An Employee") {
                addEmployee();
            }
            else if(ans.queryCompany === "Update Employee Role") {
                updateEmployeeRole();
            }
            else if(ans.queryCompany === "Update Employee Manager") {
                updateEmployeeManager();
            }
            else if(ans.queryCompany === "View Employees By Manager") {
                viewEmployeeByManager();
            }
            else if(ans.queryCompany === "View Employees By Department") {
                viewEmployeeByDepartment();
            }
            else if(ans.queryCompany === "Delete A Department") {
                deleteDepartment();
            }
            else if(ans.queryCompany === "Delete A Role") {
                deleteRole();
            }
            else if(ans.queryCompany === "Delete An Employee") {
                deleteEmployee();
            }
            else if(ans.queryCompany === "View Budget of Department") {
                viewDepartmentBudget();
            }
            else if(ans.queryCompany === "Quit") {
                return; // exit program
            }
        })
}

// retrieves all rows in the department table
function getAllDepartments() {
    db.query('SELECT * FROM department', function(err, results) {
        console.table(results);
        if(err) throw err;
        trackEmployees(); // recursively call trackEmployees()
    });
}

// adds a department to the department table
function addDepartment() {
    inquirer
        .prompt([
            {
                type: "input",
                message: "What is the name of the department?",
                name: "name",
            }
        ]).then(ans => {
            db.query('INSERT INTO department (name) VALUES (?)', ans.name, function(err, results) {
                console.log("Added " + ans.name + " to the database");
                if(err) throw err;
                trackEmployees(); // recursively call trackEmployees()
            });
        })
}

// get total utilized budget for department
function viewDepartmentBudget() {
    db.query('SELECT name FROM department', function(err, results) {
        const departmentNames = results.map(row => row.name);
        if(departmentNames.length === 0) {
            console.log("No department to check budget from.");
            trackEmployees();
            return;
        }

        inquirer
            .prompt([
                {
                    type: "list",
                    message: "Which department do you want to see the budget for?",
                    choices: departmentNames,
                    name: "depName",
                }
            ]).then(ans => {
                db.query('SELECT SUM(salary) AS total_salary FROM employee JOIN role ON employee.role_id = role.id JOIN department ON role.department_id = department.id WHERE department.name = ?', ans.depName, function(err, results) {
                    console.table(results);
                    if(err) throw err;
                    trackEmployees(); // recursively call trackEmployees()
                });
            })
    });
}

// retrieves all rows in the roles table
function getAllRoles() {
    db.query('SELECT role.id, role.title, department.name AS department, role.salary FROM role JOIN department ON role.department_id = department.id', function(err, results) {
        console.table(results);
        if(err) throw err;
        trackEmployees(); // recursively call trackEmployees()
    });
}

// adds a role to the role table
function addRole() {
    // extract all department names
    db.query('SELECT name FROM department', function(err, results) {
        const departmentNames = results.map(row => row.name);
        if(departmentNames.length === 0) {
            console.log("Can't add role as there are no departments to add them too.");
            trackEmployees(); // can't add role if no department to add to
            return;
        }

        inquirer
            .prompt([
                {
                    type: "input",
                    message: "What is the name of the role?",
                    name: "title",
                },
                {
                    type: "number",
                    message: "What is the salary of the role?",
                    name: "salary",
                },
                {
                    type: "list",
                    message: "Which department does the role belong to?",
                    choices: departmentNames,
                    name: "depName",
                }
            ]).then(ans => {
                db.query('INSERT INTO role (title, salary, department_id) VALUES (?, ?, (SELECT id FROM department WHERE name = ?))', [ans.title, ans.salary, ans.depName], function(err, results) {
                    console.log("Added " + ans.title + " to the database");
                    if(err) throw err;
                    trackEmployees(); // recursively call trackEmployees()
                });
            })
    });
}

// retrieves all rows in the employees table
function getAllEmployees() {
    // used ChatGPT to get the syntax for concatenating the manager first and last names into one column
    db.query('SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(m.first_name, " ", m.last_name) AS manager FROM employee JOIN role ON employee.role_id = role.id JOIN department ON role.department_id = department.id LEFT JOIN employee m ON employee.manager_id = m.id', function(err, results) {
        console.table(results);
        if(err) throw err;
        trackEmployees(); // recursively call trackEmployees()
    });
}

// adds an employee to the employee table
function addEmployee() {
    // extract all role titles
    db.query('SELECT title FROM role', function(err, results) {
        const roleTitles = results.map(row => row.title);
        if(roleTitles.length === 0) {
            console.log("Can't add employee as there are no roles to add them too.");
            trackEmployees();
            return;
        }

        db.query('SELECT CONCAT(first_name, " ", last_name) AS name FROM employee', function(err, results) {
            const managerNames = results.map(row => row.name);
            managerNames.push("None");

            inquirer
                .prompt([
                    {
                        type: "input",
                        message: "What is the employee's first name?",
                        name: "firstName",
                    },
                    {
                        type: "input",
                        message: "What is the employee's last name?",
                        name: "lastName",
                    },
                    {
                        type: "list",
                        message: "What is the employee's role?",
                        choices: roleTitles,
                        name: "roleTitle",
                    },
                    {
                        type: "list",
                        message: "Who is the employee's manager?",
                        choices: managerNames,
                        name: "managerName",
                    }
                ]).then(ans => {
                    db.query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, (SELECT id FROM role WHERE title = ?), (SELECT temp.id FROM (SELECT id FROM employee WHERE CONCAT(first_name, " ", last_name) = ?) AS temp))', [ans.firstName, ans.lastName, ans.roleTitle, ans.managerName], function(err, results) {
                        console.log("Added " + ans.firstName + " " + ans.lastName + " to the database");
                        if(err) throw err;
                        trackEmployees(); // recursively call trackEmployees()
                    });
                })
        });
    });
}

// updates an employee's role
function updateEmployeeRole() {
    db.query('SELECT CONCAT(first_name, " ", last_name) AS name FROM employee', function(err, results) {
        const employeeNames = results.map(row => row.name);
        if(employeeNames.length === 0) {
            console.log("Can't update employee as there are no employees in database.");
            trackEmployees();
            return;
        }

        db.query('SELECT title FROM role', function(err, results) {
            const roleTitles = results.map(row => row.title);

            inquirer
                .prompt([
                    {
                        type: "list",
                        message: "Which employee's role do you want to update?",
                        choices: employeeNames,
                        name: "employeeName",
                    },
                    {
                        type: "list",
                        message: "Which role do you want to assign the selected employee?",
                        choices: roleTitles,
                        name: "roleTitle",
                    }
                ]).then(ans => {
                    db.query('UPDATE employee JOIN role ON employee.role_id = role.id SET employee.role_id = (SELECT id FROM role WHERE title = ?) WHERE CONCAT(first_name, " ", last_name) = ?', [ans.roleTitle, ans.employeeName], function(err, results) {
                        console.log("Updated " + ans.employeeName + "'s role");
                        if(err) throw err;
                        trackEmployees();
                    });
                })
        });
    });
}

// updates an employee's manager
function updateEmployeeManager() {
    db.query('SELECT CONCAT(first_name, " ", last_name) AS name FROM employee', function(err, results) {
        const employeeNames = results.map(row => row.name);
        if(employeeNames.length === 0) {
            console.log("Can't update employee as there are no employees in database.");
            trackEmployees();
            return;
        }

        db.query('SELECT CONCAT(first_name, " ", last_name) AS manager_name FROM employee', function(err, results) {
            const managerNames = results.map(row => row.manager_name);

            inquirer
                .prompt([
                    {
                        type: "list",
                        message: "Which employee's manager do you want to update?",
                        choices: employeeNames,
                        name: "employeeName",
                    },
                    {
                        type: "list",
                        message: "Which manager do you want to assign the selected employee?",
                        choices: managerNames,
                        name: "managerName",
                    }
                ]).then(ans => {
                    db.query('UPDATE employee SET manager_id = (SELECT temp.manager_id FROM (SELECT id AS manager_id FROM employee WHERE CONCAT(first_name, " ", last_name) = ?) AS temp) WHERE CONCAT(first_name, " ", last_name) = ?', [ans.managerName, ans.employeeName], function(err, results) {
                        console.log("Updated " + ans.employeeName + "'s manager");
                        if(err) throw err;
                        trackEmployees();
                    });
                })
        });
    });
}

// displays employees under a selected manager
function viewEmployeeByManager() {
    //  grabs all managers in the employee table
    db.query('SELECT DISTINCT CONCAT(m.first_name, " ", m.last_name) AS manager_name FROM employee e JOIN employee m ON e.manager_id = m.id ORDER BY manager_name', function(err, results) {
        const managerNames = results.map(row => row.manager_name);
        
        // checks if there are any managers
        if(managerNames.length === 0) {
            console.log("There are no managers in the database to view.");
            trackEmployees();
            return;
        }

        inquirer
            .prompt([
                {
                    type: "list",
                    message: "Which manager's employees would you like to view?",
                    choices: managerNames,
                    name: "managerName",
                }
            ]).then(ans => {
                // grabs all employee names where their manager id matches the one from the selected name prior
                db.query('SELECT first_name, last_name FROM employee WHERE manager_id = (SELECT id FROM EMPLOYEE WHERE CONCAT(first_name, " ", last_name) = ?)', [ans.managerName], function(err, results) {
                    console.table(results);
                    if(err) throw err;
                    trackEmployees();
                });
            })
    });
}

// deletes a department
function deleteDepartment() {
    //  grabs all names in the department table
    db.query('SELECT name FROM department', function(err, results) {
        const departmentNames = results.map(row => row.name);
        
        // checks if there are any departments
        if(departmentNames.length === 0) {
            console.log("There are no departments in the database to delete.");
            trackEmployees();
            return;
        }

        inquirer
            .prompt([
                {
                    type: "list",
                    message: "Which department would you like to delete?",
                    choices: departmentNames,
                    name: "depName",
                }
            ]).then(ans => {
                // deletes selected department from table
                db.query('DELETE FROM department WHERE name = ?', [ans.depName], function(err, results) {
                    console.log(ans.depName + " has been deleted");
                    if(err) throw err;
                    trackEmployees();
                });
            })
    });
}

// deletes a role
function deleteRole() {
    //  grabs all names in the role table
    db.query('SELECT title FROM role', function(err, results) {
        const roleTitles = results.map(row => row.title);
        
        // checks if there are any departments
        if(roleTitles.length === 0) {
            console.log("There are no roles in the database to delete.");
            trackEmployees();
            return;
        }

        inquirer
            .prompt([
                {
                    type: "list",
                    message: "Which role would you like to delete?",
                    choices: roleTitles,
                    name: "roleTitle",
                }
            ]).then(ans => {
                // deletes selected role from table
                db.query('DELETE FROM role WHERE title = ?', [ans.roleTitle], function(err, results) {
                    console.log(ans.roleTitle + " has been deleted");
                    if(err) throw err;
                    trackEmployees();
                });
            })
    });
}

// deletes an employee
function deleteEmployee() {
    //  grabs all names in the employee table
    db.query('SELECT CONCAT(first_name, " ", last_name) AS name FROM employee', function(err, results) {
        const employeeNames = results.map(row => row.name);
        
        // checks if there are any employees
        if(employeeNames.length === 0) {
            console.log("There are no employees in the database to delete.");
            trackEmployees();
            return;
        }

        inquirer
            .prompt([
                {
                    type: "list",
                    message: "Which employee would you like to delete?",
                    choices: employeeNames,
                    name: "empName",
                }
            ]).then(ans => {
                // deletes selected department from table
                db.query('DELETE FROM employee WHERE CONCAT(first_name, " ", last_name) = ?', [ans.empName], function(err, results) {
                    console.log(ans.empName + " has been deleted");
                    if(err) throw err;
                    trackEmployees();
                });
            })
    });
}

// displays all employees under a selected department
function viewEmployeeByDepartment() {
    //  grabs all names in the department table
    db.query('SELECT name FROM department', function(err, results) {
        const departmentNames = results.map(row => row.name);
        
        // checks if there are any departments
        if(departmentNames.length === 0) {
            console.log("There are no departments in the database to view.");
            trackEmployees();
            return;
        }

        inquirer
            .prompt([
                {
                    type: "list",
                    message: "Which department's employees would you like to view?",
                    choices: departmentNames,
                    name: "depName",
                }
            ]).then(ans => {
                // grabs all employee names where their department id matches the one from the selected name prior
                db.query('SELECT first_name, last_name FROM employee JOIN role ON role.id = role_id JOIN department ON role.department_id = department.id WHERE department.name = ?', [ans.depName], function(err, results) {
                    console.table(results);
                    if(err) throw err;
                    trackEmployees();
                });
            })
    });
}

// start program by prompting user
trackEmployees();
