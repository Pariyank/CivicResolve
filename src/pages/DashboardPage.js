import React, { useState, useEffect } from 'react';
import BASE_URL from '../config';
import { 
    Container, 
    Typography, 
    Paper, 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow, 
    Button, 
    Box, 
    CircularProgress, 
    Alert, 
    Chip 
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import axios from 'axios';

const DashboardPage = () => {
    const [user, setUser] = useState(null);
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Helper function to color-code status
    const getStatusColor = (status) => {
        switch (status) {
            case 'Received': return 'default';
            case 'Assigned': return 'info';
            case 'In Progress': return 'warning';
            case 'Resolved': return 'success';
            case 'Closed': return 'success';
            default: return 'default';
        }
    };

    useEffect(() => {
        // 1. Check for user data
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('authToken');

        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }

        if (!token) {
            navigate('/login');
            return;
        }

        // 2. Fetch User's Issues
        const fetchMyIssues = async () => {
            try {
                const config = {
                    headers: { 'Authorization': `Bearer ${token}` }
                };
                // Using the new route we created in Part 1
                const res = await axios.get(`${BASE_URL}/issues/my-issues`, config);
                setIssues(res.data);
            } catch (err) {
                console.error("Error fetching user issues", err);
                setError('Failed to load your issues. Please try logging in again.');
            } finally {
                setLoading(false);
            }
        };

        fetchMyIssues();
    }, [navigate]);

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <div>
                    <Typography variant="h4" gutterBottom fontWeight="bold">
                        My Dashboard
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        Welcome back, {user ? user.name : 'User'}
                    </Typography>
                </div>
                <Button component={RouterLink} to="/report" variant="contained">
                    Report New Issue
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <TableContainer component={Paper} elevation={2}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableCell><strong>Ticket ID</strong></TableCell>
                            <TableCell><strong>Category</strong></TableCell>
                            <TableCell><strong>Date Reported</strong></TableCell>
                            <TableCell><strong>Status</strong></TableCell>
                            <TableCell><strong>Actions</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {issues.length > 0 ? (
                            issues.map((issue) => (
                                <TableRow key={issue._id} hover>
                                    <TableCell sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                                        {issue.ticketId}
                                    </TableCell>
                                    <TableCell>{issue.category}</TableCell>
                                    <TableCell>
                                        {new Date(issue.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={issue.status} 
                                            color={getStatusColor(issue.status)} 
                                            size="small" 
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Button 
                                            component={RouterLink} 
                                            to={`/track?ticketId=${issue.ticketId}`}
                                            size="small" 
                                            variant="text"
                                        >
                                            View Details
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                    <Typography variant="body1" color="text.secondary">
                                        You haven't reported any issues yet.
                                    </Typography>
                                    <Button component={RouterLink} to="/report" sx={{ mt: 1 }}>
                                        Report your first issue
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    );
};

export default DashboardPage;