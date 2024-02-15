const inquirer = require("inquirer");
const db = require("./db/connection");

db.connect((err) => {
  if (err) throw err;
  console.log("Connection Successful!");
  employeeDB();
});

const employeeDB = function () {
  inquirer
    .prompt([
      {
        type: "list",
        name: "prompt",
        message: "Choose a function:",
        choices: [
          "View All Employees",
          "View All Roles",
          "View All Departments",
          "Add an Employee",
          "Add a Role",
          "Add a Department",
          "Update an Employee's Role",
          "Quit",
        ],
      },
    ])
    .then((res) => {
      switch (res.prompt) {
        case "View All Employees":
          viewEmployees();
          break;
        case "View All Roles":
          viewRoles();
          break;
        case "View All Departments":
          viewDepartments();
          break;
        case "Add an Employee":
          addEmployee();
          break;
        case "Add a Role":
          addRole();
          break;
        case "Add a Department":
          addDepartment();
          break;
        case "Update an Employee's Role":
          updateEmployee();
          break;
        case "Quit":
          db.end();
          console.log("GoodBye!");
          break;
      }
    });
};

function viewEmployees() {
  const sql = `
    SELECT 
    employee.id, employee.first_name, employee.last_name, role.title, role.salary, department.name AS department, CONCAT(manager.first_name, " ", manager.last_name) as manager
    FROM employee
    JOIN role ON employee.role_id = role.id
    JOIN department ON role.department_id = department.id
    LEFT JOIN employee manager ON employee.manager_id = manager.id
`;
  db.query(sql, (err, result) => {
    if (err) throw err;
    console.table(result);
    employeeDB();
  });
}

function viewRoles() {
  const sql = `SELECT 
  role.id, role.title, role.salary, department.name AS department
  FROM role
  JOIN department ON role.department_id = department.id`;
  db.query(sql, (err, result) => {
    if (err) throw err;
    console.table(result);
    employeeDB();
  });
}

function viewDepartments() {
  const sql = `SELECT * FROM department`;
  db.query(sql, (err, result) => {
    if (err) throw err;
    console.table(result);
    employeeDB();
  });
}

function addEmployee() {
  const roleArray = [];
  const employeeArray = [];

  db.query(`SELECT * FROM role`, function (err, result) {
    for (let i = 0; i < result.length; i++) {
      roleArray.push(result[i].title);
    }
    db.query(`SELECT * FROM employee`, function (err, result) {
      for (let i = 0; i < result.length; i++) {
        let employeeName = `${result[i].first_name} ${result[i].last_name}`;
        employeeArray.push(employeeName);
      }
      return inquirer
        .prompt([
          {
            type: "input",
            message: "New employee's first name: ",
            name: "first_name",
          },
          {
            type: "input",
            message: "New employee's last name: ",
            name: "last_name",
          },
          {
            type: "list",
            message: "What is the employee's role?",
            name: "role",
            choices: roleArray,
          },
          {
            type: "list",
            message: "Does the new employee have a manager?",
            name: "has_manager",
            choices: ["Yes", "No"],
          },
        ])
        .then((data) => {
          let roleTitle = data.role;
          let first_name = data.first_name;
          let last_name = data.last_name;
          let role_id = "";
          let hasManager = "";
          db.query(
            `SELECT id FROM role WHERE role.title = ?`,
            data.role,
            (err, result) => {
              role_id = result[0].id;
            }
          );
          if (data.has_manager === "Yes") {
            return inquirer
              .prompt([
                {
                  type: "list",
                  message: "Who is the new employee's manager",
                  name: "manager",
                  choices: employeeArray,
                },
              ])
              .then((data) => {
                db.query(
                  `SELECT id FROM role WHERE role.title = ?`,
                  roleTitle,
                  (err, result) => {
                    role_id = result[0].id;
                  }
                );
                db.query(
                  `SELECT id FROM employee WHERE employee.first_name = ? AND employee.last_name = ?;`,
                  data.manager.split(" "),
                  (err, result) => {
                    hasManager = result[0].id;
                    db.query(
                      `INSERT INTO employee (first_name, last_name, role_id, manager_id) 
                          VALUES (?,?,?,?)`,
                      [first_name, last_name, role_id, hasManager],
                      (err, result) => {
                        console.log("\nEmployee added successfully");
                        viewEmployees();
                      }
                    );
                  }
                );
              });
          } else {
            manager = null;
            db.query(
              `SELECT id FROM role WHERE role.title = ?`,
              roleTitle,
              (err, result) => {
                role_id = result[0].id;
                db.query(
                  `INSERT INTO employee (first_name, last_name, role_id, manager_id) 
                      VALUES (?,?,?,?)`,
                  [data.first_name, data.last_name, role_id, manager],
                  (err, result) => {
                    console.log("\nEmployee added successfully");
                    viewEmployees();
                  }
                );
              }
            );
          }
        });
    });
  });
}

function addRole() {
  let departmentArray = [];
  db.query(`SELECT * FROM department`, function (err, result) {
    for (let i = 0; i < result.length; i++) {
      departmentArray.push(result[i].name);
    }
    return inquirer
      .prompt([
        {
          type: "input",
          message: "Title of new role: ",
          name: "title",
        },
        {
          type: "input",
          message: "New role's salary: ",
          name: "salary",
        },
        {
          type: "list",
          message: "New role's department: ",
          name: "department",
          choices: departmentArray,
        },
      ])
      .then((data) => {
        db.query(
          `SELECT id FROM department WHERE department.name = ?`,
          data.department,
          (err, result) => {
            let department_id = result[0].id;
            db.query(
              `INSERT INTO role(title, salary, department_id) VALUES (?,?,?)`,
              [data.title, data.salary, department_id],
              (err, result) => {
                console.log("\nRole added successfully");
                viewRoles();
              }
            );
          }
        );
      });
  });
}

function addDepartment() {
  inquirer
    .prompt({
      type: "input",
      name: "name",
      message: "New department's name: ",
    })
    .then((data) => {
      const sql = `INSERT INTO department (name) VALUES ("${data.name}")`;
      db.query(sql, (err, result) => {
        console.log(`New department added successfully`);
        employeeDB();
      });
    });
}

function updateEmployee() {
  const roleArray = [];
  const employeeArray = [];
  db.query(`SELECT * FROM role`, function (err, result) {
    for (let i = 0; i < result.length; i++) {
      roleArray.push(result[i].title);
    }
    db.query(`SELECT * FROM employee`, function (err, result) {
      for (let i = 0; i < result.length; i++) {
        let employeeName = `${result[i].first_name} ${result[i].last_name}`;
        employeeArray.push(employeeName);
      }
      return inquirer
        .prompt([
          {
            type: "list",
            message: "Name of emloyee you wish to update: ",
            name: "employee",
            choices: employeeArray,
          },
          {
            type: "list",
            message: "The employee's new role: ",
            name: "role",
            choices: roleArray,
          },
        ])
        .then((data) => {
          db.query(
            `SELECT id FROM role WHERE role.title = ?;`,
            data.role,
            (err, result) => {
              role_id = result[0].id;
              db.query(
                `SELECT id FROM employee WHERE employee.first_name = ? AND employee.last_name = ?;`,
                data.employee.split(" "),
                (err, result) => {
                  db.query(
                    `UPDATE employee SET role_id = ? WHERE id = ?;`,
                    [role_id, result[0].id],
                    (err, result) => {
                      console.log("\nRole updated successfully");
                      viewEmployees();
                    }
                  );
                }
              );
            }
          );
        });
    });
  });
}
