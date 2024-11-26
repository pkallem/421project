import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Container,
    TextField,
    Button,
    Typography,
    List,
    ListItem,
    ListItemText,
    IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const App = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [tasks, setTasks] = useState([]);
    const [taskLog, setTaskLog] = useState([]);
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        priority: '',
        due_date: '',
    });
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [editedTask, setEditedTask] = useState({
        title: '',
        description: '',
        priority: '',
        due_date: '',
        status: 'pending',
    });
    const [sortBy, setSortBy] = useState('priority');
    const [token, setToken] = useState(localStorage.getItem('token') || '');
    const [isRegistering, setIsRegistering] = useState(false);

    useEffect(() => {
        if (token) {
            fetchTasks();
            fetchTaskLog();
        }
    }, [token]);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5001/login', { username, password });
            const { token } = response.data;
            localStorage.setItem('token', token);
            setToken(token);
            alert('Login successful!');
        } catch (error) {
            console.error('Login failed:', error.response ? error.response.data : error.message);
            alert('Login failed');
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5001/register', { username, password });
            alert('Registration successful! You can now log in.');
            setIsRegistering(false);
        } catch (error) {
            console.error('Registration failed:', error.response ? error.response.data : error.message);
            alert('Registration failed');
        }
    };

    const handleTaskSubmit = async (e) => {
        e.preventDefault();
        if (!token) return alert('Please log in first');

        const { title, priority, due_date } = newTask;
        if (!title || !priority || !due_date) {
            return alert('Title, priority, and due date are required.');
        }
        if (priority <= 0 || !Number.isInteger(Number(priority))) {
            return alert('Priority must be a positive integer.');
        }
        if (new Date(due_date) < new Date()) {
            return alert('Due date cannot be in the past.');
        }

        try {
            await axios.post('http://localhost:5001/tasks', newTask, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setNewTask({
                title: '',
                description: '',
                priority: '',
                due_date: '',
            });
            alert('Task added!');
            fetchTasks();
            fetchTaskLog();
        } catch (error) {
            console.error('Failed to add task:', error.response ? error.response.data : error.message);
            alert('Failed to add task');
        }
    };

    const fetchTasks = async () => {
        if (!token) return;
        try {
            const response = await axios.get('http://localhost:5001/tasks', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setTasks(response.data);
        } catch (error) {
            if (error.response && error.response.status === 401) {
                localStorage.removeItem('token');
                setToken('');
                alert('Session expired. Please log in again.');
            } else {
                console.error('Failed to fetch tasks:', error.response ? error.response.data : error.message);
                alert('Failed to fetch tasks');
            }
        }
    };

    const fetchTaskLog = async () => {
        if (!token) return;
        try {
            const response = await axios.get('http://localhost:5001/tasklog', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setTaskLog(response.data);
        } catch (error) {
            if (error.response && error.response.status === 401) {
                localStorage.removeItem('token');
                setToken('');
                alert('Session expired. Please log in again.');
            } else {
                console.error('Failed to fetch task log:', error.response ? error.response.data : error.message);
                alert('Failed to fetch task log');
            }
        }
    };

    const clearTaskLog = async () => {
        if (!token) return alert('Please log in first');
        try {
            await axios.delete('http://localhost:5001/tasklogtwo', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setTaskLog([]);
            alert('Task log cleared successfully');
        } catch (error) {
            console.error('Failed to clear task log:', error);
            alert('Failed to clear task log');
        }
    };

    const handleDeleteTask = async (taskId) => {
        try {
            await axios.delete(`http://localhost:5001/tasks/${taskId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            alert('Task deleted');
            fetchTasks();
            fetchTaskLog();
        } catch (error) {
            console.error('Failed to delete task:', error.response ? error.response.data : error.message);
            alert('Failed to delete task');
        }
    };

    const renderTaskList = () => {
        if (tasks.length === 0) {
            return <Typography>No tasks available</Typography>;
        }

        const sortedTasks = [...tasks].sort((a, b) => {
            if (sortBy === 'priority') {
                return a.priority - b.priority;
            } else {
                return new Date(a.due_date) - new Date(b.due_date);
            }
        });

        return (
            <List>
                {sortedTasks.map((task) => (
                    <ListItem key={task.id}>
                        {editingTaskId === task.id ? (
                            <>
                                <TextField
                                    label="Title"
                                    variant="outlined"
                                    fullWidth
                                    name="title"
                                    value={editedTask.title}
                                    onChange={handleTaskChange}
                                    required
                                />
                                <TextField
                                    label="Description"
                                    variant="outlined"
                                    fullWidth
                                    name="description"
                                    value={editedTask.description}
                                    onChange={handleTaskChange}
                                />
                                <TextField
                                    label="Priority"
                                    variant="outlined"
                                    fullWidth
                                    name="priority"
                                    value={editedTask.priority}
                                    onChange={handleTaskChange}
                                    required
                                />
                                <TextField
                                    label="Due Date"
                                    type="date"
                                    variant="outlined"
                                    fullWidth
                                    name="due_date"
                                    value={editedTask.due_date}
                                    onChange={handleTaskChange}
                                    required
                                    InputLabelProps={{ shrink: true }}
                                />
                                <Button
                                    type="button"
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                    style={{ marginTop: '20px' }}
                                    onClick={() => handleSaveEdit(task.id)}
                                >
                                    Save Task
                                </Button>
                            </>
                        ) : (
                            <>
                                <ListItemText
                                    primary={task.title}
                                    secondary={`Due: ${task.due_date} | Priority: ${task.priority}`}
                                />
                                <IconButton
                                    color="primary"
                                    onClick={() => handleEditTask(task)}
                                    style={{ fontSize: '1rem' }}
                                >
                                    Edit
                                </IconButton>
                                <IconButton color="secondary" onClick={() => handleDeleteTask(task.id)}>
                                    <DeleteIcon />
                                </IconButton>
                            </>
                        )}
                    </ListItem>
                ))}
            </List>
        );
    };

    const handleSaveEdit = async (taskId) => {
        const { title, priority, due_date, status } = editedTask;
        if (!title || !priority || !due_date || !status) {
            return alert('Title, priority, due date, and status are required.');
        }
        if (priority <= 0 || !Number.isInteger(Number(priority))) {
            return alert('Priority must be a positive integer.');
        }
        if (new Date(due_date) < new Date()) {
            return alert('Due date cannot be in the past.');
        }

        try {
            const response = await axios.put(`http://localhost:5001/tasks/${taskId}`, editedTask, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.status === 200) {
                setEditingTaskId(null);
                setEditedTask({ title: '', description: '', priority: '', due_date: '', status: 'pending' });
                alert('Task updated successfully!');
                fetchTasks();
                fetchTaskLog();
            } else {
                alert('Failed to update task. Please try again.');
            }
        } catch (error) {
            console.error('Failed to update task:', error.response ? error.response.data : error.message);
            alert('Failed to update task');
        }
    };

    const handleEditTask = (task) => {
        setEditingTaskId(task.id);
        setEditedTask({
            title: task.title,
            description: task.description,
            priority: task.priority,
            due_date: task.due_date,
            status: task.status || '',
        });
    };

    // Component to show task log
    const renderTaskLog = () => {
        if (taskLog.length === 0) {
            return <Typography>No task log available</Typography>;
        }
        return (
            <List>
                {taskLog
                    .slice()
                    .reverse()
                    .map((log) => (
                        <ListItem key={log.id}>
                            <ListItemText
                                primary={`${log.log_action} - ${log.title}`}
                                secondary={`Date: ${log.log_timestamp} | Priority: ${log.priority}`}
                            />
                        </ListItem>
                    ))}
            </List>
        );
    };

    const handleTaskChange = (e) => {
        if (editingTaskId !== null) {
            setEditedTask({
                ...editedTask,
                [e.target.name]: e.target.value,
            });
        } else {
            setNewTask({
                ...newTask,
                [e.target.name]: e.target.value,
            });
        }
    };
    const toggleSortBy = () => {
        setSortBy((prevSortBy) => (prevSortBy === 'priority' ? 'date' : 'priority'));
    };

    return (
        <Container>
            <Typography variant="h3" gutterBottom>
                Task Management App
            </Typography>

            {!token && (
                <>
                    <Typography variant="h4" gutterBottom>
                        {isRegistering ? 'Register' : 'Login'}
                    </Typography>
                    {isRegistering ? (
                        <form onSubmit={handleRegister}>
                            <TextField
                                label="Username"
                                variant="outlined"
                                fullWidth
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                            <TextField
                                label="Password"
                                type="password"
                                variant="outlined"
                                fullWidth
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                style={{ marginTop: '20px', marginBottom: '20px' }}
                            />
                            <Button type="submit" variant="contained" color="primary" fullWidth>
                                Register
                            </Button>
                            <Button
                                variant="text"
                                color="secondary"
                                fullWidth
                                onClick={() => setIsRegistering(false)}
                                style={{ marginTop: '10px' }}
                            >
                                Already have an account? Login
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={handleLogin}>
                            <TextField
                                label="Username"
                                variant="outlined"
                                fullWidth
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                            <TextField
                                label="Password"
                                type="password"
                                variant="outlined"
                                fullWidth
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                style={{ marginTop: '20px', marginBottom: '20px' }}
                            />
                            <Button type="submit" variant="contained" color="primary" fullWidth>
                                Login
                            </Button>
                            <Button
                                variant="text"
                                color="secondary"
                                fullWidth
                                onClick={() => setIsRegistering(true)}
                                style={{ marginTop: '10px' }}
                            >
                                Don't have an account? Register
                            </Button>
                        </form>
                    )}
                </>
            )}

            {token && (
                <>
                    <Typography variant="h5" gutterBottom>
                        Add New Task
                    </Typography>
                    <form onSubmit={handleTaskSubmit}>
                        <TextField
                            label="Title"
                            variant="outlined"
                            fullWidth
                            name="title"
                            value={newTask.title}
                            onChange={handleTaskChange}
                            required
                            style={{ marginBottom: '20px' }}
                        />
                        <TextField
                            label="Description"
                            variant="outlined"
                            fullWidth
                            name="description"
                            value={newTask.description}
                            onChange={handleTaskChange}
                        />
                        <TextField
                            label="Priority"
                            variant="outlined"
                            fullWidth
                            name="priority"
                            value={newTask.priority}
                            onChange={handleTaskChange}
                            required
                            style={{ marginTop: '20px', marginBottom: '20px' }}
                        />
                        <TextField
                            label="Due Date"
                            type="date"
                            variant="outlined"
                            fullWidth
                            name="due_date"
                            value={newTask.due_date}
                            onChange={handleTaskChange}
                            required
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            fullWidth
                            style={{ marginTop: '20px', marginBottom: '20px' }}
                        >
                            Add Task
                        </Button>
                    </form>
                    <Typography variant="h5" gutterBottom>
                        Task List
                    </Typography>
                    {renderTaskList()}
                    <Button variant="contained" color="secondary" onClick={toggleSortBy} fullWidth>
                        Sort by {sortBy === 'priority' ? 'Date' : 'Priority'}
                    </Button>
                    <Typography variant="h5" gutterBottom style={{ marginTop: '20px' }}>
                        Task Log
                    </Typography>
                    {renderTaskLog()}
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={clearTaskLog}
                        fullWidth
                        style={{ marginTop: '20px', marginBottom: '20px' }}
                    >
                        Clear Task Log
                    </Button>
                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => {
                            localStorage.removeItem('token');
                            setToken('');
                            alert('Logged out');
                        }}
                    >
                        Logout
                    </Button>
                </>
            )}
        </Container>
    );
};

export default App;