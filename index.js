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
                choices: ["View All Departments", "Add A Department", "View All Roles", "Add A Role", "View All Employees", "Add An Employee", "Update An Employee Role", "Quit"],
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
            else if(ans.queryCompany === "Quit") {
                return; // exit program
            }
        })
}

// retrieves all rows in the department table
function getAllDepartments() {
    db.query('SELECT * FROM department', function(err, results) {
        console.table(results);
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
                trackEmployees(); // recursively call trackEmployees()
            });
        })
}

// retrieves all rows in the roles table
function getAllRoles() {
    db.query('SELECT role.id, role.title, department.name, role.salary FROM role JOIN department ON role.department_id = department.id', function(err, results) {
        console.table(results);
        trackEmployees(); // recursively call trackEmployees()
    });
}

// adds a role to the role table
/*
function addRole() {
    // extract all department names
    db,query('SELECT name FROM department', function(err, results) {
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
                choices: [departmentNames],
                name: "depName",
            }
        ]).then(ans => {
            db.query(`SELECT id FROM role WHERE name = ${ans.depName}`, function(err, results) {

            });

            db.query('INSERT INTO role (title, salary, department_id) VALUES (?)', [ans.title, ans.salary], function(err, results) {
                console.log("Added " + ans.title + " to the database");
                trackEmployees(); // recursively call trackEmployees()
            });
        })
    });
}*/

// retrieves all rows in the employees table
function getAllEmployees() {
    db.query('SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name, role.salary, CONCAT_WS(" ", m.first_name, m.last_name) AS manager FROM employee JOIN role ON employee.role_id = role.id JOIN department ON role.department_id = department.id LEFT JOIN employee m ON employee.manager_id = m.id', function(err, results) {
        console.table(results);
        trackEmployees(); // recursively call trackEmployees()
    });
}

// start program by prompting user
trackEmployees();
