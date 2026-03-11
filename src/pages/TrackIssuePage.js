import React, { useState, useEffect, useCallback } from 'react';
import BASE_URL from '../config';
import { Container, TextField, Button, Typography, Box, CircularProgress, Alert, Paper, Grid, Step, Stepper, StepLabel, Divider, Chip } from '@mui/material';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';

const steps = ['Received', 'Assigned to Dept', 'Assigned to Worker', 'Work In Progress', 'Resolved', 'Closed'];

const TrackIssuePage = () => {
    const [searchParams] = useSearchParams();
    const [ticketId, setTicketId] = useState('');
    const [issue, setIssue] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [feedbackLoading, setFeedbackLoading] = useState(false);

    const handleTrack = useCallback(async (e, id) => {
        if (e) e.preventDefault();
        const finalTicketId = id || ticketId;
        if (!finalTicketId) { if(e) setError('Please enter a Ticket ID.'); return; }

        setLoading(true);
        setError('');
        setIssue(null);

        try {
            const res = await axios.get(`${BASE_URL}/issues/track/${finalTicketId}`);
            setIssue(res.data);
        } catch (err) { setError('Ticket ID not found.'); } 
        finally { setLoading(false); }
    }, [ticketId]);

    useEffect(() => {
        const ticketFromUrl = searchParams.get('ticketId');
        if (ticketFromUrl) { setTicketId(ticketFromUrl); handleTrack(null, ticketFromUrl); }
    }, [searchParams, handleTrack]); 

    const handleFeedback = async (status) => {
        setFeedbackLoading(true);
        try {
            const res = await axios.put(`${BASE_URL}/issues/feedback/${issue.ticketId}`, { feedback: status });
            setIssue({ ...issue, citizenFeedback: res.data.issue.citizenFeedback });
        } catch (err) { alert("Failed to submit feedback"); } 
        finally { setFeedbackLoading(false); }
    };

    const getActiveStep = () => {
        if (!issue) return 0;
        const current = issue.status;
        if (current === 'Received') return 0;
        if (current === 'Assigned to Dept') return 1;
        if (current === 'Assigned to Worker') return 2;
        if (current === 'Work In Progress') return 3;
        if (current === 'Resolved') return 4;
        if (current === 'Closed') return 5;
        return 0;
    };

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
            <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#1976D2' }}>Track Your Issue</Typography>
                <Box component="form" onSubmit={handleTrack} sx={{ display: 'flex', gap: 2 }}>
                    <TextField size="small" fullWidth label="Enter Ticket ID" value={ticketId} onChange={(e) => setTicketId(e.target.value)} placeholder="CIV-XXXXXX" />
                    <Button type="submit" variant="contained" disabled={loading}>{loading ? <CircularProgress size={24} /> : 'Track'}</Button>
                </Box>
                {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            </Paper>

            {issue && (
                <Paper elevation={3} sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="h5" fontWeight="bold">Ticket: {issue.ticketId}</Typography>
                        <Typography variant="overline">{format(new Date(issue.createdAt), 'PPpp')}</Typography>
                    </Box>
                    <Divider sx={{ mb: 4 }} />

                    <Box sx={{ width: '100%', mb: 6 }}>
                        <Stepper activeStep={getActiveStep()} alternativeLabel>
                            {steps.map((label) => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
                        </Stepper>
                    </Box>

                    <Grid container spacing={4}>
                        <Grid item xs={12} md={7}>
                            <Typography variant="h6" color="primary">Details</Typography>
                            <Typography><strong>Category:</strong> {issue.category}</Typography>
                            <Typography><strong>Ward:</strong> {issue.ward}</Typography>
                            <Typography sx={{ mt: 1, bgcolor: '#f5f5f5', p: 2, borderRadius: 1 }}>{issue.description}</Typography>

                            {/* COST TRANSPARENCY */}
                            {issue.resolutionCost > 0 && (
                                <Box sx={{ mt: 2, p: 2, bgcolor: '#e8f5e9', border: '1px solid #4caf50', borderRadius: 2, display: 'flex', alignItems: 'center' }}>
                                    <CurrencyRupeeIcon sx={{ mr: 1, color: 'green' }} />
                                    <Typography fontWeight="bold" color="success.main">
                                        Public Funds Used for Repair: ₹{issue.resolutionCost}
                                    </Typography>
                                </Box>
                            )}

                            {issue.resolutionNote && (
                                <Box sx={{ mt: 3, p: 2, bgcolor: '#e3f2fd', borderRadius: 2, border: '1px solid #90caf9' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <AssignmentIcon color="primary" sx={{ mr: 1 }} />
                                        <Typography fontWeight="bold" color="primary">Authority Resolution Note</Typography>
                                    </Box>
                                    <Typography>{issue.resolutionNote}</Typography>
                                </Box>
                            )}

                            {(issue.status === 'Resolved' || issue.status === 'Closed') && (
                                <Box sx={{ mt: 3, p: 2, border: '1px dashed #ccc', borderRadius: 2 }}>
                                    <Typography variant="subtitle1" fontWeight="bold">Are you satisfied with this resolution?</Typography>
                                    {issue.citizenFeedback === 'Pending' ? (
                                        <Box sx={{ mt: 1, display: 'flex', gap: 2 }}>
                                            <Button variant="contained" color="success" startIcon={<ThumbUpIcon />} onClick={() => handleFeedback('Satisfied')} disabled={feedbackLoading}>Yes</Button>
                                            <Button variant="contained" color="error" startIcon={<ThumbDownIcon />} onClick={() => handleFeedback('Unsatisfied')} disabled={feedbackLoading}>No</Button>
                                        </Box>
                                    ) : (
                                        <Chip label={`Feedback: ${issue.citizenFeedback}`} color={issue.citizenFeedback === 'Satisfied' ? 'success' : 'error'} sx={{ mt: 1 }} />
                                    )}
                                </Box>
                            )}
                        </Grid>

                        <Grid item xs={12} md={5}>
                            <Typography variant="h6" color="primary">Original Issue</Typography>
                            <img src={issue.imageUrl} alt="Report" style={{ width: '100%', borderRadius: '8px', marginBottom: '20px' }} />

                            {issue.resolutionImageUrl && (
                                <>
                                    <Typography variant="h6" color="success.main" sx={{ display: 'flex', alignItems: 'center' }}>
                                        <CheckCircleIcon sx={{ mr: 1 }} /> Proof of Fix
                                    </Typography>
                                    <img src={issue.resolutionImageUrl} alt="Fixed" style={{ width: '100%', borderRadius: '8px', border: '2px solid #66bb6a' }} />
                                </>
                            )}
                        </Grid>
                    </Grid>
                </Paper>
            )}
        </Container>
    );
};

export default TrackIssuePage;