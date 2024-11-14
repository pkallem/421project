import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, TextField, Button, Card, CardContent, Typography, Grid } from '@mui/material';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles({
    formContainer: {
        marginTop: '20px',
        marginBottom: '20px',
        padding: '20px',
        border: '1px solid #ccc',
        borderRadius: '10px',
        backgroundColor: '#f9f9f9',
    },
    taskCard: {
        marginBottom: '10px',
        padding: '20px',
        backgroundColor: '#fff',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    },
    taskTitle: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
    },
    taskDescription: {
        fontSize: '1rem',
        color: '#555',
    },
    buttonGroup: {
        marginTop: '15px',
    },
});

const App = () => {
    const classes = useStyles();
    const [tasks, setTasks] = useState([]);
    const [taskLog, setTaskLog] = useState([]); // State for task log
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [editedTask, setEditedTask] = useState({ title: '', description: '', priority: 1, due_date: '' });
    const [form, setForm] = useState({ title: '', description: '', priority: 1, due_date: '' });
    const [sortBy, setSortBy] = useState('priority'); // Start with 'priority'

    useEffect(() => {
        fetchTasks();
    }, []);
    
    useEffect(() => {
        fetchTaskLog();
    }, []);

    const fetchTasks = async () => {
        try {
            const result = await axios.get('http://localhost:5001/tasks');
            setTasks(result.data);
        } catch (error) {
            console.error('Error fetching tasks:', error.response ? error.response.data : error.message);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5001/tasks', form);
            fetchTasks();
            fetchTaskLog();
            setForm({ title: '', description: '', priority: 1, due_date: '' }); // Clear form after submit
        } catch (error) {
            console.error('Error adding task:', error.response ? error.response.data : error.message);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:5001/tasks/${id}`);
            fetchTasks();
            fetchTaskLog();
        } catch (error) {
            console.error('Error deleting task:', error.response ? error.response.data : error.message);
        }
    };

    const handleEditClick = (task) => {
        setEditingTaskId(task.id);
        setEditedTask({
            title: task.title,
            description: task.description,
            priority: task.priority,
            due_date: task.due_date,
        });
    };

    const handleSaveClick = async (id) => {
        try {
            await axios.put(`http://localhost:5001/tasks/${id}`, editedTask);
            setEditingTaskId(null);
            fetchTasks();
        } catch (error) {
            console.error('Error updating task:', error.response ? error.response.data : error.message);
        }
    };

    const handleFieldChange = (field, value) => {
        setEditedTask({ ...editedTask, [field]: value });
    };

    const fetchTaskLog = async () => {
        try {
            const result = await axios.get('http://localhost:5001/tasklog');
            setTaskLog(result.data);
        } catch (error) {
            console.error('Error fetching tasks:', error.response ? error.response.data : error.message);
        }
    };

    const clearTaskLog = async () => {
        try {
            const response = await axios.delete('http://localhost:5001/tasklogtwo');
            alert(response.data.message);
            fetchTaskLog();
        } catch (error) {
            alert('Failed to clear task log');
        }
    };

    const toggleSortBy = () => {
        setSortBy((prevSortBy) => (prevSortBy === 'priority' ? 'date' : 'priority'));
    };

    const sortedTasks = [...tasks].sort((a, b) => {
        if (sortBy === 'priority') {
            return a.priority - b.priority; // Lowest priority first
        } else {
            return new Date(a.due_date) - new Date(b.due_date); // Closest date first
        }
    });

    return (
        <Container>
            <Typography variant="h3" align="center" gutterBottom>
                Task Scheduler
            </Typography>

            <form className={classes.formContainer} onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Task Title"
                            variant="outlined"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            required
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Priority"
                            type="number"
                            variant="outlined"
                            value={form.priority}
                            onChange={(e) => setForm({ ...form, priority: e.target.value })}
                            required
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Description"
                            multiline
                            rows={4}
                            variant="outlined"
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Due Date"
                            type="date"
                            variant="outlined"
                            InputLabelProps={{ shrink: true }}
                            value={form.due_date}
                            onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                            required
                        />
                    </Grid>
                    <Grid item xs={12} className={classes.buttonGroup}>
                        <Button type="submit" variant="contained" color="primary" fullWidth>
                            Add Task
                        </Button>
                    </Grid>
                </Grid>
            </form>

            {/* Sorting Toggle Button */}
            <Button
                variant="contained"
                color="secondary"
                onClick={toggleSortBy}
                style={{ marginBottom: '20px' }}
            >
                Sorted by {sortBy === 'priority' ? 'Priority' : 'Date'}
            </Button>

            <Typography variant="h4" gutterBottom>
                Task List
            </Typography>
            {sortedTasks.length === 0 ? (
                <Typography variant="h6" align="center" color="textSecondary">
                    No tasks available. Add a new task!
                </Typography>
            ) : (
                sortedTasks.map((task) => (
                    <Card key={task.id} className={classes.taskCard}>
                        <CardContent>
                            {editingTaskId === task.id ? (
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Task Title"
                                            variant="outlined"
                                            value={editedTask.title}
                                            onChange={(e) => handleFieldChange('title', e.target.value)}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Priority"
                                            type="number"
                                            variant="outlined"
                                            value={editedTask.priority}
                                            onChange={(e) => handleFieldChange('priority', e.target.value)}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Description"
                                            multiline
                                            rows={4}
                                            variant="outlined"
                                            value={editedTask.description}
                                            onChange={(e) => handleFieldChange('description', e.target.value)}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Due Date"
                                            type="date"
                                            variant="outlined"
                                            InputLabelProps={{ shrink: true }}
                                            value={editedTask.due_date}
                                            onChange={(e) => handleFieldChange('due_date', e.target.value)}
                                        />
                                    </Grid>
                                    <Grid item xs={12} className={classes.buttonGroup}>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={() => handleSaveClick(task.id)}
                                        >
                                            Save
                                        </Button>
                                    </Grid>
                                </Grid>
                            ) : (
                                <>
                                    <Typography className={classes.taskTitle}>{task.title}</Typography>
                                    <Typography className={classes.taskDescription}>{task.description}</Typography>
                                    <Typography>Priority: {task.priority}</Typography>
                                    <Typography>Due Date: {task.due_date}</Typography>
                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        onClick={() => handleEditClick(task)}
                                        style={{ marginRight: '10px' }}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        color="secondary"
                                        onClick={() => handleDelete(task.id)}
                                    >
                                        Delete
                                    </Button>
                                </>
                            )}
                        </CardContent>
                    </Card>
                ))
            )}
            <Button
                variant="contained"
                color="secondary"
                onClick={clearTaskLog}
                style={{ marginBottom: '20px' }}
            >
                Clear Task Log
            </Button>
            {/* Task Log Section */}
            <Typography variant="h4" gutterBottom>
                Task Log
            </Typography>
            {taskLog.length === 0 ? (
                <Typography variant="h6" align="center" color="textSecondary">
                    No log entries.
                </Typography>
            ) : (
                taskLog.map((log) => (
                    <Card key={log.id} className={classes.taskCard}>
                        <CardContent>
                            <Typography className={classes.taskTitle}>{log.title}</Typography>
                            <Typography className={classes.taskDescription}>{log.description}</Typography>
                            <Typography>Priority: {log.priority}</Typography>
                            <Typography>Due Date: {log.due_date}</Typography>
                            <Typography>Log Action: {log.log_action}</Typography>
                            <Typography>Timestamp: {log.log_timestamp}</Typography>
                        </CardContent>
                    </Card>
                ))
            )}
        </Container>
    );
};

export default App;
