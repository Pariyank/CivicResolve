import React, { useState, useEffect } from 'react';
import BASE_URL from '../config';
import { Container, Typography, Card, CardContent, Button, Box, TextField, Chip, Divider, Alert, InputAdornment } from '@mui/material';
import axios from 'axios';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const WorkerDashboardPage = () => {
    const [tasks, setTasks] = useState([]);
    const [file, setFile] = useState(null);
    const [note, setNote] = useState('');
    const [cost, setCost] = useState(''); 
    const [submittingId, setSubmittingId] = useState(null);

    useEffect(() => {
        const fetchTasks = async () => {
            const token = localStorage.getItem('authToken');
            try {
            
                const res = await axios.get(`${BASE_URL}/issues/worker/tasks`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setTasks(res.data);
            } catch (err) {
                console.error("Error fetching tasks", err);
            }
        };
        fetchTasks();
    }, []);

    const handleComplete = async (issueId) => {
        if (!file) { alert("Please upload a proof image."); return; }
        
        setSubmittingId(issueId);
        try {
            const token = localStorage.getItem('authToken');
            const formData = new FormData();
            formData.append('resolutionImage', file);
            formData.append('note', note);
            formData.append('resolutionCost', cost); 

            await axios.put(`${BASE_URL}/issues/worker-complete/${issueId}`, formData, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
            });
            alert("Job Submitted Successfully!");
            window.location.reload();
        } catch (err) {
            console.error(err);
            alert("Failed to submit job.");
        } finally {
            setSubmittingId(null);
        }
    };

    const openGoogleMaps = (location) => {
        if (location && location.coordinates) {
            const lat = location.coordinates[1];
            const lng = location.coordinates[0];
            const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
            window.open(url, '_blank');
        } else {
            alert("Location data missing for this ticket.");
        }
    };

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
            <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">My Assigned Tasks</Typography>
            
            {tasks.length === 0 ? <Typography color="text.secondary">No pending tasks. Good job!</Typography> : (
                tasks.map(task => (
                    <Card 
                        key={task._id} 
                        sx={{ 
                            mb: 3, 
                            borderLeft: task.status === 'Work Rejected' ? '6px solid #d32f2f' : '6px solid #1976D2' 
                        }} 
                        elevation={3}
                    >
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box>
                                    <Typography variant="h6" fontWeight="bold">{task.category}</Typography>
                                    <Typography variant="caption" color="text.secondary">Ticket: {task.ticketId} | Ward: {task.ward}</Typography>
                                </Box>
                                <Chip 
                                    label={task.status} 
                                    color={task.status === 'Resolved' ? 'success' : task.status === 'Work Rejected' ? 'error' : 'warning'} 
                                    size="small" 
                                />
                            </Box>

                            {task.status === 'Work Rejected' && (
                                <Alert severity="error" sx={{ mt: 2 }} icon={<ErrorOutlineIcon />}>
                                    <strong>Work Rejected:</strong> {task.resolutionNote || "Please redo the work and upload clear proof."}
                                </Alert>
                            )}

                            <Typography sx={{ mt: 2, mb: 2, bgcolor: '#f5f5f5', p: 1.5, borderRadius: 1 }}>{task.description}</Typography>

                            <Button variant="outlined" startIcon={<LocationOnIcon />} onClick={() => openGoogleMaps(task.location)} sx={{ mb: 2 }} color="secondary">
                                Get Directions
                            </Button>

                            <Divider />
                            
                            {task.status !== 'Closed' && (
                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="subtitle2" gutterBottom>
                                        {task.status === 'Work Rejected' ? 'Re-Submit Work:' : 'Complete Job:'}
                                    </Typography>
                                    <TextField fullWidth size="small" label="Resolution Note" onChange={(e) => setNote(e.target.value)} multiline sx={{ mb: 2 }} />
                                    
                                    {/* Cost Input using InputAdornment */}
                                    <TextField 
                                        fullWidth 
                                        size="small" 
                                        label="Cost Incurred (₹)" 
                                        type="number" 
                                        InputProps={{ 
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <CurrencyRupeeIcon fontSize="small"/>
                                                </InputAdornment>
                                            ) 
                                        }}
                                        onChange={(e) => setCost(e.target.value)} 
                                        sx={{ mb: 2 }}
                                    />
                                    
                                    <Box sx={{ mt: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
                                        <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />}>
                                            Upload Proof *
                                            <input type="file" hidden onChange={(e) => setFile(e.target.files[0])} />
                                        </Button>
                                        {file && <Typography variant="caption">Selected: {file.name}</Typography>}
                                        
                                        <Button variant="contained" color="success" startIcon={<CheckCircleIcon />} onClick={() => handleComplete(task._id)} disabled={submittingId === task._id} sx={{ ml: 'auto' }}>
                                            {submittingId === task._id ? 'Submitting...' : 'Mark Completed'}
                                        </Button>
                                    </Box>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                ))
            )}
        </Container>
    );
};

export default WorkerDashboardPage;