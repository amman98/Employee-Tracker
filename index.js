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
                choices: ["View All Departments", "Add A Department", "View All Roles", "Add A Role", "View All Employees", "Add An Employee", "Update Employee Role", "Quit"],
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
                    db.query('SELECT id FROM employee WHERE CONCAT(first_name, " ", last_name) = ?', [ans.managerName], function(err, results) {
                        if(err) throw err;
                        if(ans.managerName == "None") {
                            managerId = null;
                        }
                        else {
                            const managerId = results[0].id;
                        }

                        db.query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, (SELECT id FROM role WHERE title = ?), ?)', [ans.firstName, ans.lastName, ans.roleTitle, managerId], function(err, results) {
                            console.log("Added " + ans.firstName + " " + ans.lastName + " to the database");
                            if(err) throw err;
                            trackEmployees(); // recursively call trackEmployees()
                        });
                    });
                })
        });
    });
}

// updates an employee's role
function updateEmployeeRole() {
    db.query('SELECT CONCAT(first_name, " ", last_name) AS name FROM employee', function(err, results) {
        const employeeNames = results.map(row => row.name);

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

// start program by prompting user
trackEmployees();
