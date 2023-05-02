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

// retrieves all rows in the roles table
function getAllRoles() {
    db.query('SELECT * FROM role', function(err, results) {
        console.table(results);
        trackEmployees(); // recursively call trackEmployees()
    });
}

// retrieves all rows in the employees table
function getAllEmployees() {
    db.query('SELECT * FROM employee', function(err, results) {
        console.table(results);
        trackEmployees(); // recursively call trackEmployees()
    });
}

// start program by prompting user
trackEmployees();
