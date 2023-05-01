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

function getAllDepartments() {
    db.query('SELECT * FROM department', function(err, results) {
        console.log(results);
    });
}

getAllDepartments();