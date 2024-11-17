import React, {useEffect, useState} from 'react';
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
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [editedTask, setEditedTask] = useState({
        title: '',
        description: '',
        priority: '',
        due_date: '',
        status: 'pending'
    });
    const [sortBy, setSortBy] = useState('priority');

    const [token, setToken] = useState(localStorage.getItem('token') || ''); 
    const [isRegistering, setIsRegistering] = useState(false); 

    useEffect(() => {
        fetchTasks();
        fetchTaskLog();
    }, []);

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

    const fetchTasks = async () => {
        if (!token) return alert('Please log in first');
        try {
            const response = await axios.get('http://localhost:5001/tasks', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            setTasks(response.data);
        } catch (error) {
            console.error('Failed to fetch tasks:', error.response ? error.response.data : error.message);
            alert('Failed to fetch tasks');
        }
    };
    

    // Fetch task logs
    const fetchTaskLog = async () => {
        const token = localStorage.getItem('token'); 
    
        if (!token) {
            alert('Please log in');
            return;
        }
    
        try {
            const response = await axios.get('http://localhost:5001/tasklog', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setTaskLog(response.data); 
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



    const renderTaskList = () => {
        if (tasks.length === 0) {
            return <Typography>No tasks available</Typography>;
        }
        // Sort tasks based on the selected criteria (priority or due date)
        const sortedTasks = [...tasks].sort((a, b) => {
            if (sortBy === 'priority') {
                return a.priority - b.priority;
            } else {
                return new Date(a.due_date) - new Date(b.due_date);
            }
        });
    
        return (
            <List>
                {sortedTasks.map(task => (
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
                                <IconButton color="primary" onClick={() => handleEditTask(task)} style={{ fontSize: '1rem' }}>
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
        // Ensure all required fields are filled out before sending the request
        if (!editedTask.title || !editedTask.priority || !editedTask.due_date || !editedTask.status) {
            return alert('Title, priority, due date, and status are required fields.');
        }
    
        try {
            // Send PUT request to update task with the task ID in the URL
            const response = await axios.put(`http://localhost:5001/tasks/${taskId}`, editedTask, {
                headers: {
                    'Authorization': `Bearer ${token}`, // Ensure token is in the correct format
                },
            });
    
            // Check response status and handle accordingly
            if (response.status === 200) {
                // Successfully updated, reset editing state
                setEditingTaskId(null);  // Clear editing state
                setEditedTask({ title: '', description: '', priority: '', due_date: '', status: 'pending' });  // Clear form data and set default status
                alert('Task updated successfully!');
                fetchTasks();  // Re-fetch tasks after update
                fetchTaskLog();  // Re-fetch task log after update
            } else {
                alert('Failed to update task. Please try again.');
            }
        } catch (error) {
            // If an error occurs, log it to the console and alert the user
            console.error('Failed to update task:', error.response ? error.response.data : error.message);
            alert('Failed to update task');
        }
    };
    
    // Handle task edit
    const handleEditTask = (task) => {
        setEditingTaskId(task.id);  // Set the task id to start editing
        setEditedTask({
            title: task.title,
            description: task.description,
            priority: task.priority,
            due_date: task.due_date,
            status: task.status || ''  // Set status if available, otherwise empty string
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

const handleTaskChange = (e) => {
    if (editingTaskId !== null) {
        setEditedTask({
            ...editedTask,
            [e.target.name]: e.target.value
        });
    } else {
        setNewTask({
            ...newTask,
            [e.target.name]: e.target.value
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
                    <Button variant="contained" color="secondary" onClick={toggleSortBy} fullWidth>
                        Sort by {sortBy === 'priority' ? 'Date' : 'Priority'}
                    </Button>
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