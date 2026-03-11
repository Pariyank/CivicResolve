import React, { useState, useEffect } from 'react';
import BASE_URL from '../config';
// --- FIX: Added 'Alert' to imports ---
import { 
    Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
    TableHead, TableRow, Button, CircularProgress, Box, Chip, 
    Select, MenuItem, FormControl, InputLabel, Tabs, Tab, Tooltip, Stack, Alert 
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import HistoryIcon from '@mui/icons-material/History';
import RateReviewIcon from '@mui/icons-material/RateReview';
import axios from 'axios';
import UpdateStatusModal from '../components/UpdateStatusModal';

const DeptDashboardPage = () => {
    const [issues, setIssues] = useState([]);
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tabValue, setTabValue] = useState(0); // 0: Active, 1: Escalated/Critical, 2: History
    
    // Modal State
    const [selectedIssue, setSelectedIssue] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('authToken');
            const user = JSON.parse(localStorage.getItem('user'));
            
            if (!user || !user.department) return;

            const config = { headers: { 'Authorization': `Bearer ${token}` } };

            try {
                // Fetch Issues & Workers
                const [issueRes, workerRes] = await Promise.all([
                    axios.get(`${BASE_URL}/issues/dept/all`, config),
                    axios.get(`${BASE_URL}/issues/workers/${user.department}`, config)
                ]);
                setIssues(issueRes.data);
                setWorkers(workerRes.data);
            } catch (err) { console.error("Error loading dashboard:", err); } 
            finally { setLoading(false); }
        };
        fetchData();
    }, []);

    const handleAssignWorker = async (issueId, workerId) => {
        if(!workerId) return;
        try {
            const token = localStorage.getItem('authToken');
            await axios.put(`${BASE_URL}/issues/assign-worker/${issueId}`, { workerId }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Update Local State
            const updatedList = issues.map(i => {
                if(i._id === issueId) {
                    const w = workers.find(work => work._id === workerId);
                    return { ...i, status: 'Assigned to Worker', assignedWorker: w };
                }
                return i;
            });
            setIssues(updatedList);
        } catch (err) { alert("Failed to assign worker"); }
    };

    // --- FILTER LOGIC ---
    const getFilteredIssues = () => {
        if (tabValue === 0) { // Active Normal
            return issues.filter(i => ['Assigned to Dept', 'Assigned to Worker', 'Work In Progress', 'Resolved'].includes(i.status) && !i.isHazard && i.status !== 'Escalated' && i.status !== 'Work Rejected');
        }
        if (tabValue === 1) { // Critical / Escalated
            return issues.filter(i => i.status === 'Escalated' || i.isHazard || i.status === 'Work Rejected');
        }
        if (tabValue === 2) { // Closed
            return issues.filter(i => i.status === 'Closed');
        }
        return issues;
    };

    const handleOpenModal = (issue) => { setSelectedIssue(issue); setIsModalOpen(true); };
    const handleCloseModal = () => { setIsModalOpen(false); setSelectedIssue(null); };
    const handleStatusUpdate = (updatedIssue) => { setIssues(issues.map(i => i._id === updatedIssue._id ? updatedIssue : i)); };

    if(loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 8 }}>
            <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">Department Dashboard</Typography>
            
            <Paper elevation={2} sx={{ mb: 3 }}>
                <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} indicatorColor="primary" textColor="primary" centered>
                    <Tab label="Active Tasks" />
                    <Tab label="⚠ Escalated & Hazards" icon={<WarningIcon />} iconPosition="start" />
                    <Tab label="History (Closed)" icon={<HistoryIcon />} iconPosition="start" />
                </Tabs>
            </Paper>

            <TableContainer component={Paper} elevation={3}>
                <Table>
                    <TableHead sx={{ bgcolor: tabValue===1 ? '#fce4ec' : '#eeeeee' }}>
                        <TableRow>
                            <TableCell><strong>Ticket ID</strong></TableCell>
                            <TableCell><strong>Proof Chain</strong></TableCell>
                            <TableCell sx={{ width: '30%' }}><strong>Details</strong></TableCell>
                            <TableCell><strong>Status</strong></TableCell>
                            <TableCell><strong>Worker Assignment</strong></TableCell>
                            <TableCell><strong>Action</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {getFilteredIssues().length === 0 ? (
                            <TableRow><TableCell colSpan={6} align="center">No tasks in this category.</TableCell></TableRow>
                        ) : (
                            getFilteredIssues().map(issue => (
                                <TableRow 
                                    key={issue._id} 
                                    hover
                                    sx={{ 
                                        backgroundColor: issue.status === 'Escalated' ? '#f3e5f5' : (issue.isHazard ? '#ffebee' : 'inherit'),
                                        borderLeft: issue.status === 'Escalated' ? '6px solid #9c27b0' : (issue.isHazard ? '6px solid #d32f2f' : 'none')
                                    }}
                                >
                                    <TableCell>
                                        <strong>{issue.ticketId}</strong>
                                        {issue.status === 'Escalated' && <Chip label="ESCALATED" color="secondary" size="small" sx={{ ml: 1, fontWeight: 'bold' }} />}
                                    </TableCell>
                                    
                                    <TableCell>
                                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                            {/* Original */}
                                            <Tooltip title="Reported Image"><a href={issue.imageUrl} target="_blank" rel="noreferrer"><img src={issue.imageUrl} style={{width:'50px', borderRadius:'4px'}} alt="Orig"/></a></Tooltip>
                                            
                                            {/* Arrow if progression */}
                                            {(issue.previousResolutionUrl || issue.resolutionImageUrl) && <Typography variant="caption">→</Typography>}

                                            {/* Rejected/Previous Proof */}
                                            {issue.previousResolutionUrl && (
                                                <Tooltip title="REJECTED / OLD Proof">
                                                    <a href={issue.previousResolutionUrl} target="_blank" rel="noreferrer">
                                                        <img src={issue.previousResolutionUrl} style={{width:'50px', borderRadius:'4px', border:'2px solid red', opacity: 0.6}} alt="Bad Proof"/>
                                                    </a>
                                                </Tooltip>
                                            )}

                                            {/* Current Valid Proof */}
                                            {issue.resolutionImageUrl ? (
                                                <Tooltip title="Current Fix Proof">
                                                    <a href={issue.resolutionImageUrl} target="_blank" rel="noreferrer">
                                                        <img src={issue.resolutionImageUrl} style={{width:'50px', borderRadius:'4px', border:'2px solid green'}} alt="Fix"/>
                                                    </a>
                                                </Tooltip>
                                            ) : (
                                                /* Placeholder for Pending Fix */
                                                (issue.status === 'Escalated' || issue.status === 'Work Rejected') && (
                                                    <Box sx={{width:50, height:50, border:'1px dashed grey', borderRadius:1, display:'flex', alignItems:'center', justifyContent:'center'}}>
                                                        <Typography variant="caption" fontSize={10} align="center">Waiting<br/>Proof</Typography>
                                                    </Box>
                                                )
                                            )}
                                        </Box>
                                    </TableCell>

                                    <TableCell>
                                        <Typography variant="body2">{issue.category} - {issue.ward}</Typography>
                                        <Typography variant="body2" color="textSecondary">{issue.description}</Typography>
                                        {/* Show Rejection Reason if Escalated */}
                                        {issue.status === 'Escalated' && (
                                            <Alert severity="warning" sx={{ mt: 1, py: 0 }}><strong>Citizen Feedback:</strong> Unsatisfied - Re-work Required</Alert>
                                        )}
                                    </TableCell>

                                    <TableCell><Chip label={issue.status} color={issue.status === 'Escalated' ? 'secondary' : 'primary'} size="small" /></TableCell>

                                    <TableCell sx={{ minWidth: 200 }}>
                                        {/* Worker Assignment Dropdown */}
                                        {issue.status !== 'Closed' ? (
                                            <FormControl fullWidth size="small">
                                                <InputLabel>Assign Worker</InputLabel>
                                                <Select 
                                                    value={issue.assignedWorker?._id || ""} 
                                                    label="Assign Worker"
                                                    onChange={(e) => handleAssignWorker(issue._id, e.target.value)}
                                                >
                                                    <MenuItem value="" disabled>Select Worker</MenuItem>
                                                    {workers.map(w => <MenuItem key={w._id} value={w._id}>{w.name}</MenuItem>)}
                                                </Select>
                                            </FormControl>
                                        ) : (
                                            <Typography variant="caption">{issue.assignedWorker?.name || "Unassigned"}</Typography>
                                        )}
                                    </TableCell>

                                    <TableCell>
                                        <Button variant="contained" size="small" startIcon={<RateReviewIcon />} onClick={() => handleOpenModal(issue)} color="secondary">
                                            Update
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <UpdateStatusModal open={isModalOpen} issue={selectedIssue} onClose={handleCloseModal} onUpdate={handleStatusUpdate} />
        </Container>
    );
};

export default DeptDashboardPage;