const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bcrypt = require('bcryptjs');

const app = express();
const port = 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Database
const db = new sqlite3.Database('./tasks.db');

// Create Tables if they don't exist
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS Tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        priority INTEGER NOT NULL,
        due_date DATE,
        status TEXT DEFAULT 'pending'
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS Users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        password TEXT NOT NULL
    )`);
});

// Add New Task
app.post('/tasks', (req, res) => {
    const { title, description, priority, due_date } = req.body;

    if (!title || !priority || !due_date) {
        return res.status(400).json({ error: 'Missing title, priority, or due date' });
    }

    db.run(`INSERT INTO Tasks (title, description, priority, due_date) VALUES (?, ?, ?, ?)`,
        [title, description, priority, due_date], function (err) {
            if (err) {
                return res.status(400).json({ error: err.message });
            }
            res.json({ id: this.lastID });
        });
});

// Delete Task
app.delete('/tasks/:id', (req, res) => {
    db.run(`DELETE FROM Tasks WHERE id = ?`, [req.params.id], function (err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({ message: 'Task deleted' });
    });
});

// Update Task
app.put('/tasks/:id', (req, res) => {
    const { title, description, priority, due_date, status } = req.body;

    db.run(`UPDATE Tasks SET title = ?, description = ?, priority = ?, due_date = ?, status = ? WHERE id = ?`,
        [title, description, priority, due_date, status, req.params.id], function (err) {
            if (err) {
                return res.status(400).json({ error: err.message });
            }
            res.json({ message: 'Task updated' });
        });
});

// Show Tasks (Select Records)
app.get('/tasks', (req, res) => {
    db.all(`SELECT * FROM Tasks`, [], (err, rows) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Register User
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(`INSERT INTO Users (username, password) VALUES (?, ?)`, [username, hashedPassword], function (err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({ message: 'User registered' });
    });
});

// Run server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
