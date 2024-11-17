import React, { useState} from 'react';
import axios from 'axios';
import { Container, TextField, Button, Typography, List, ListItem, ListItemText, IconButton } from '@mui/material';
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
        due_date: ''
    });
    const [token, setToken] = useState(localStorage.getItem('token') || ''); 
    const [isRegistering, setIsRegistering] = useState(false); 

    // Handle login form submission
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

    // Handle registration form submission
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

    // Handle task form submission
    const handleTaskSubmit = async (e) => {
        e.preventDefault();
        if (!token) return alert('Please log in first');
        
        try {
            await axios.post('http://localhost:5001/tasks', newTask, {
                headers: {
                    'Authorization': `Bearer ${token}`, 
                }
            });

            setNewTask({
                title: '',
                description: '',
                priority: '',
                due_date: ''
            });
            alert('Task added!');
            fetchTasks(); 
            fetchTaskLog();
        } catch (error) {
            console.error('Failed to add task:', error.response ? error.response.data : error.message);
            alert('Failed to add task');
        }
    };

    //  Fetch tasks after successful login
    const fetchTasks = async () => {
        if (!token) return alert('Please log in first');
        try {
            const response = await axios.get('http://localhost:5001/tasks', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });
            setTasks(response.data);
        } catch (error) {
            console.error('Failed to fetch tasks:', error.response ? error.response.data : error.message);
            alert('Failed to fetch tasks');
        }
    };

    // Fetch task logs
    const fetchTaskLog = async () => {
        const token = localStorage.getItem('token'); // Get the token from localStorage
    
        if (!token) {
            alert('Please log in');
            return;
        }
    
        try {
            const response = await axios.get('http://localhost:5001/tasklog', {
                headers: {
                    'Authorization': `Bearer ${token}` // Include the token in the request header
                }
            });
            setTaskLog(response.data); // Set the task log in the state
        } catch (error) {
            console.error('Failed to fetch task log:', error.response ? error.response.data : error.message);
            alert('Failed to fetch task log');
        }
    };
    
     // Clear Task Log
     const clearTaskLog = async () => {
        if (!token) return alert('Please log in first');
        try {
            await axios.delete('http://localhost:5001/tasklogtwo', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setTaskLog([]); // Clear task log from the UI
            alert('Task log cleared successfully');
        } catch (error) {
            console.error('Failed to clear task log:', error);
            alert('Failed to clear task log');
        }
    };

    // Delete task
    const handleDeleteTask = async (taskId) => {
        try {
            await axios.delete(`http://localhost:5001/tasks/${taskId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });
            alert('Task deleted');
            fetchTasks();
            fetchTaskLog();
        } catch (error) {
            console.error('Failed to delete task:', error.response ? error.response.data : error.message);
            alert('Failed to delete task');
        }
    };

    // Update task input field values
    const handleTaskChange = (e) => {
        setNewTask({
            ...newTask,
            [e.target.name]: e.target.value
        });
    };

    // Show task list
    const renderTaskList = () => {
        if (tasks.length === 0) {
            return <Typography>No tasks available</Typography>;
        }
        return (
            <List>
                {tasks.map(task => (
                    <ListItem key={task.id}>
                        <ListItemText 
                            primary={task.title} 
                            secondary={`Due: ${task.due_date} | Priority: ${task.priority}`} 
                        />
                        <IconButton color="secondary" onClick={() => handleDeleteTask(task.id)}>
                            <DeleteIcon />
                        </IconButton>
                    </ListItem>
                ))}
            </List>
        );
    };

// Component to show task log
const renderTaskLog = () => {
    if (taskLog.length === 0) {
        return <Typography>No task log available</Typography>;
    }
    return (
        <List>
            {taskLog
                .slice().reverse().map(log => (
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

    return (
        <Container>
            <Typography variant="h3" gutterBottom>
                Task Management App
            </Typography>

            {/* Login/Register*/}
            {!token && (
                <>
                    <Typography variant="h4" gutterBottom>{isRegistering ? 'Register' : 'Login'}</Typography>
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
                                style={{ marginTop: '10px'}}
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
                                style={{ marginTop: '10px'}}
                            >
                                Don't have an account? Register
                            </Button>
                        </form>
                    )}
                </>
            )}

            {/* After login, show tasks and task log */}
            {token && (
                <>
                    <Typography variant="h5" gutterBottom>Add New Task</Typography>
                    <form onSubmit={handleTaskSubmit}>
                        <TextField
                            label="Title"
                            variant="outlined"
                            fullWidth
                            name="title"
                            value={newTask.title}
                            onChange={handleTaskChange}
                            required
                            style={{marginBottom: '20px' }}
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
                        <Button type="submit" variant="contained" color="primary" fullWidth style={{ marginTop: '20px', marginBottom: '20px' }} >
                            Add Task
                        </Button>
                    </form>
                    <Typography variant="h5" gutterBottom >Task List</Typography>
                    {renderTaskList()}
                    <Typography variant="h5" gutterBottom style={{ marginTop: '20px'}}>Task Log</Typography>
                    {renderTaskLog()}
                    <Button 
                        variant="contained" 
                        color="secondary" 
                        onClick={clearTaskLog}
                        fullWidth
                        style={{ marginTop: '20px', marginBottom: '20px' }}
                    >
                        Clear Task Log</Button>
                    <Button variant="outlined" color="secondary" onClick={() => {
                        localStorage.removeItem('token');
                        setToken('');
                        alert('Logged out');
                    }}>Logout</Button>
                </>
            )}
        </Container>
    );
};

export default App;