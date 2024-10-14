## Database Setup Instructions

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
  
  CREATE TABLE Tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    priority INTEGER NOT NULL,
    due_date DATE,
    status TEXT DEFAULT 'pending'
  );


### 4. Exit the SQLite Shell
After creating the table, type .exit to exit the SQLite shell:

- **macOS**
  ```bash
  .exit

### 5. Start Frontend
In the client folder, run:
- **macOS**
  ```bash
  npm start

### 6. Start Backend
In the server folder, run:
- **macOS**
  ```bash
  node app.js

