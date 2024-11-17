## Project Overview
**Project Overview:** The Daily Planner/Task Scheduler is a simple and intuitive application that helps users organize and manage their daily tasks effectively. The application will allow users to create tasks, set deadlines, and track progress over time. The system will store user tasks in a database, which can be queried to view daily, weekly, and monthly tasks. It will be particularly useful for students, professionals, and anyone looking to improve their productivity and task management.

### Key Features
 - Users can create new tasks with details such as task title, description, priority level, and due date.
 - Users can visualize the number of pending and completed tasks for any given day.
 - Each task can be marked as “completed” and users can track their progress based on the number of tasks completed daily.

### Requirements

1. Add New Record: Users will be able to create new tasks by entering task details such as title, description, priority, and due date. This data will be stored in the database as a new record. An input form on the web interface will collect the necessary data. Once submitted, the backend will insert this information into the database using an INSERT SQL command.
2. Delete Record: A "delete" button will be provided for each task, allowing users to select which task they wish to delete. The backend will execute a DELETE SQL command to remove the record from the database.
3. Update Record: The interface will provide an "edit" button for each task, which will allow users to modify the task details. The backend will use an UPDATE SQL command to change the relevant record in the database.
4. Show (Select) Record: The frontend will display tasks from the database in a list view. The backend will use SELECT SQL queries to retrieve task records from the database based on specific conditions like date, priority, or completion status.
5. Data Validation: Data validation will be done on both the client-side (using JavaScript for instant feedback) and the server-side (backend validation) before the data is inserted or updated in the database. Examples include ensuring the task title is not empty, the due date is in the future, and the priority is valid.
6. Implement Trigger: Every time a task is deleted, by creating an AFTER DELETE trigger that inserts the task details into a "TaskLog" table before deletion. Another example could be an AFTER INSERT trigger to automatically set default values for certain fields, like the task creation timestamp.
7. Procedure: A stored procedure could be created to handle task creation, which validates the input and then inserts the new task into the database. This procedure could also be used for task updates. Another procedure might retrieve tasks for a specific date range.
8. Transaction: A transaction could be used when creating or updating a task to ensure that all associated database changes (like logging the action or updating dependent records) occur together. If one part fails, the transaction is rolled back to avoid partial updates.
9. Secure Password Storage: During user registration, passwords will be hashed before storing, and during login, the entered password will be hashed and compared with the stored hash.

## Project Setup Instructions

To set up the SQLite database for the task scheduler project, follow these steps:

### 1. Install SQLite

If you don’t have SQLite installed on your local machine, you can install it via the following methods:

- **macOS**:
  ```bash
  brew install sqlite

### 2. Create the SQLite Database

Open a terminal and run the following commands:
- **macOS**
  ```bash
  sqlite3 tasks.db

### 3. Create the Tasks Table

Inside the SQLite shell (which opens after running sqlite3 tasks.db), create the Tasks table by running the following SQL command:

- **macOS**
  ```bash
  
  CREATE TABLE IF NOT EXISTS Tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    priority INTEGER NOT NULL,
    due_date DATE,
    status TEXT DEFAULT 'pending',
    user_id INTEGER
  );

Also, we need to set up a table for logging tasks. Create that table by running the following SQL command:

- **macOS**
  ```bash
  
  CREATE TABLE IF NOT EXISTS TaskLog (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    priority INTEGER,
    due_date DATE,
    log_action TEXT,
    log_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER
  );


### 4. Exit the SQLite Shell
After creating the table, type .exit to exit the SQLite shell:

- **macOS**
  ```bash
  .exit

### 5. Install dependencies
- **macOS**
  ```bash
  npm install

### 6. Start Frontend
In the client folder, run:
- **macOS**
  ```bash
  npm start

### 7. Start Backend
In the server folder, run:
- **macOS**
  ```bash
  node app.js