const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const port = 5001;
require('dotenv').config();
const SECRET_KEY = process.env.SECRET_KEY;

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
        status TEXT DEFAULT 'pending',
        user_id INTEGER
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS Users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        password TEXT NOT NULL
    )`);

    db.run(`
        CREATE TABLE IF NOT EXISTS TaskLog (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            description TEXT,
            priority INTEGER,
            due_date DATE,
            log_action TEXT,
            log_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            user_id INTEGER
        )
    `);

    // Create triggers
     db.run(`
        CREATE TRIGGER IF NOT EXISTS log_task_deletion
        AFTER DELETE ON Tasks
        BEGIN
            INSERT INTO TaskLog (title, description, priority, due_date, log_action, log_timestamp)
            VALUES (OLD.title, OLD.description, OLD.priority, OLD.due_date, 'DELETE', CURRENT_TIMESTAMP);
        END;
    `);

    db.run(`
        CREATE TRIGGER IF NOT EXISTS log_task_add
        AFTER INSERT ON Tasks
        BEGIN
            INSERT INTO TaskLog (title, description, priority, due_date, log_action, log_timestamp)
            VALUES (NEW.title, NEW.description, NEW.priority, NEW.due_date, 'INSERT', CURRENT_TIMESTAMP);
        END;
    `);
});
// Middleware to authenticate token and attach user
const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Access denied' });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user; 
        next();
    });
};

// Add New Task
app.post('/tasks', authenticateToken, (req, res) => {
    const { title, description, priority, due_date } = req.body;
    const userId = req.user.userId; 

    if (!title || !priority || !due_date) {
        return res.status(400).json({ error: 'Missing title, priority, or due date' });
    }

    db.run(`
        INSERT INTO Tasks (title, description, priority, due_date, user_id) 
        VALUES (?, ?, ?, ?, ?)`,
        [title, description, priority, due_date, userId], function (err) {
            if (err) {
                return res.status(400).json({ error: err.message });
            }
            db.run(`
                INSERT INTO TaskLog (user_id, title, description, priority, due_date, log_action)
                VALUES (?, ?, ?, ?, ?, 'INSERT')`,
                [userId, title, description, priority, due_date], function (err) {
                    if (err) return res.status(400).json({ error: err.message });
                    res.json({ id: this.lastID });
                });
        });
});

// Delete Task
app.delete('/tasks/:id', authenticateToken, (req, res) => {
    const taskId = req.params.id;
    const userId = req.user.userId;

    db.get('SELECT * FROM Tasks WHERE id = ? AND user_id = ?', [taskId, userId], (err, task) => {
        if (err || !task) {
            return res.status(400).json({ error: 'Task not found or you do not have permission to delete it' });
        }
        db.run(`
            INSERT INTO TaskLog (user_id, title, description, priority, due_date, log_action)
            VALUES (?, ?, ?, ?, ?, 'DELETE')`,
            [userId, task.title, task.description, task.priority, task.due_date], function (err) {
                if (err) return res.status(400).json({ error: err.message });
                db.run('DELETE FROM Tasks WHERE id = ? AND user_id = ?', [taskId, userId], function (err) {
                    if (err) return res.status(400).json({ error: err.message });
                    res.json({ message: 'Task deleted successfully' });
                });
            });
    });
});

// Show Tasks (Authenticated)
app.get('/tasks', authenticateToken, (req, res) => {
    const userId = req.user.userId; 
    db.all('SELECT * FROM Tasks WHERE user_id = ?', [userId], (err, rows) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Show Tasklog (Authenticated)
app.get('/tasklog', authenticateToken, (req, res) => {
    const userId = req.user.userId;
    db.all('SELECT * FROM TaskLog WHERE user_id = ?', [userId], (err, rows) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json(rows); 
    });
});

// Clear Task Log
app.delete('/tasklogtwo', (req, res) => {
    db.run(`DELETE FROM TaskLog`, function (err) {
        if (err) {
            return res.status(500).json({ error: 'Failed to clear task log' });
        }
        res.json({ message: 'Task log cleared successfully' });
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

// Update Task
app.put('/tasks/:id', authenticateToken, (req, res) => {
    const { title, description, priority, due_date, status } = req.body;
    const taskId = req.params.id;
    const userId = req.user.userId; 

    if (!title || !priority || !due_date || status === undefined) {
        return res.status(400).json({ error: 'Missing title, priority, due date, or status' });
    }

    db.get('SELECT * FROM Tasks WHERE id = ? AND user_id = ?', [taskId, userId], (err, task) => {
        if (err || !task) {
            return res.status(400).json({ error: 'Task not found or you do not have permission to update it' });
        }
        db.run(`
            UPDATE Tasks 
            SET title = ?, description = ?, priority = ?, due_date = ?, status = ? 
            WHERE id = ? AND user_id = ?`,
            [title, description, priority, due_date, status, taskId, userId], function (err) {
                if (err) {
                    return res.status(400).json({ error: err.message });
                }
                db.run(`
                    INSERT INTO TaskLog (user_id, title, description, priority, due_date, log_action)
                    VALUES (?, ?, ?, ?, ?, 'UPDATE')`,
                    [userId, title, description, priority, due_date], function (err) {
                        if (err) {
                            return res.status(400).json({ error: err.message });
                        }

                        res.json({ message: 'Task updated successfully' });
                    });
            });
    });
});

// Login User
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    db.get(`SELECT * FROM Users WHERE username = ?`, [username], async (err, user) => {
        if (err || !user) {
            return res.status(400).json({ error: 'User not found' });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(400).json({ error: 'Invalid password' });
        }

        const token = jwt.sign({ userId: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ token });
    });
});

// Run server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
