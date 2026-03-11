import React, { useState, useEffect } from 'react';
import { 
    Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
    TableHead, TableRow, Button, CircularProgress, Box, Alert, Chip, 
    TextField, Grid, MenuItem, Select, FormControl, InputLabel, InputAdornment, Stack, Tooltip 
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'; 
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import AccessTimeIcon from '@mui/icons-material/AccessTime'; // NEW ICON
import axios from 'axios';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import UpdateStatusModal from '../components/UpdateStatusModal';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import BASE_URL from '../config';

const AdminDashboardPage = () => {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [selectedIssue, setSelectedIssue] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const navigate = useNavigate();

    const categories = ["Garbage", "Road Defect", "Streetlight Outage", "Water Leak", "Sewage Block", "Public Vandalism", "Other"];
    const departments = ["Garbage", "Road Defect", "Streetlight Outage", "Water Leak", "Sewage Block", "Public Vandalism", "Other"];

   
    const slaConfig = {
        "Garbage": 24,
        "Sewage Block": 24,
        "Water Leak": 48,
        "Streetlight Outage": 48,
        "Road Defect": 72,
        "Public Vandalism": 72,
        "Other": 96
    };

    useEffect(() => {
        const fetchIssues = async () => {
            const token = localStorage.getItem('authToken');
            if (!token) { navigate('/login'); return; }
            try {
                const config = { headers: { 'Authorization': `Bearer ${token}` } };
                const res = await axios.get(`${BASE_URL}/issues/admin/all`, config);
                setIssues(res.data);
            } catch (err) { setError('Failed to fetch issues.'); } finally { setLoading(false); }
        };
        fetchIssues();
    }, [navigate]);

    // --- NEW: CALCULATE SLA STATUS ---
    const renderSLA = (issue) => {
        if (issue.status === 'Resolved' || issue.status === 'Closed') return <Chip label="Done" size="small" variant="outlined" />;

        const created = new Date(issue.createdAt);
        const now = new Date();
        const diffHours = Math.abs(now - created) / 36e5;
        const limit = slaConfig[issue.category] || 72; // Default 72h
        const remaining = limit - diffHours;

        if (remaining < 0) {
            return (
                <Chip 
                    icon={<AccessTimeIcon />} 
                    label={`${Math.abs(Math.round(remaining))}h OVERDUE`} 
                    color="error" 
                    size="small" 
                    sx={{ fontWeight: 'bold', animation: 'pulse 2s infinite' }} 
                />
            );
        } else if (remaining < 4) {
            return <Chip icon={<AccessTimeIcon />} label={`${Math.round(remaining)}h Left`} color="warning" size="small" />;
        } else {
            return <Chip icon={<AccessTimeIcon />} label={`${Math.round(remaining)}h Left`} color="success" variant="outlined" size="small" />;
        }
    };

    const generatePDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text("CivicResolve - Monthly Issue Report", 14, 20);
        const tableColumn = ["Ticket ID", "Category", "Ward", "Status", "Date Reported", "Assignment"];
        const tableRows = [];
        filteredIssues.forEach(issue => {
            let assignmentInfo = issue.assignedWorker ? `Worker: ${issue.assignedWorker.name}` : (issue.assignedDepartment ? `Dept: ${issue.assignedDepartment}` : "Unassigned");
            tableRows.push([issue.ticketId, issue.category, issue.ward, issue.status, new Date(issue.createdAt).toLocaleDateString(), assignmentInfo]);
        });
        autoTable(doc, { head: [tableColumn], body: tableRows, startY: 35, theme: 'grid', headStyles: { fillColor: [25, 118, 210] } });
        doc.save("CivicResolve_Report.pdf");
    };

    const handleAssignDept = async (issueId, deptName) => {
        if(!deptName) return;
        if(!window.confirm(`Assign Ticket to ${deptName} Department?`)) return;
        try {
            const token = localStorage.getItem('authToken');
            const res = await axios.put(`${BASE_URL}/issues/assign-dept/${issueId}`, { department: deptName }, { headers: { 'Authorization': `Bearer ${token}` } });
            setIssues(issues.map(i => i._id === issueId ? res.data : i));
        } catch (err) { alert("Failed to assign department."); }
    };

    const filteredIssues = issues.filter((issue) => {
        const matchesSearch = issue.ticketId.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = categoryFilter === 'All' || issue.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const handleOpenModal = (issue) => { setSelectedIssue(issue); setIsModalOpen(true); };
    const handleCloseModal = () => { setIsModalOpen(false); setSelectedIssue(null); };
    const handleStatusUpdate = (updatedIssue) => { setIssues(issues.map(i => i._id === updatedIssue._id ? updatedIssue : i)); };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <style>
                {`@keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.6; } 100% { opacity: 1; } }`}
            </style>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" fontWeight="bold" sx={{ color: '#1976D2' }}>Admin Control Panel</Typography>
                <Box>
                    <Button onClick={generatePDF} variant="outlined" color="primary" startIcon={<PictureAsPdfIcon />} sx={{ mr: 2 }}>Export Report</Button>
                    <Button component={RouterLink} to="/admin/manage-staff" variant="contained" color="secondary" startIcon={<PersonAddIcon />}>Add Staff</Button>
                </Box>
            </Box>
            
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Paper elevation={2} sx={{ p: 3, mb: 3, backgroundColor: '#fcfcfc' }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}><TextField fullWidth label="Search by Ticket ID" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>) }} /></Grid>
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth><InputLabel>Filter by Category</InputLabel><Select value={categoryFilter} label="Filter by Category" onChange={(e) => setCategoryFilter(e.target.value)}><MenuItem value="All">All</MenuItem>{categories.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}</Select></FormControl>
                    </Grid>
                </Grid>
            </Paper>

            <TableContainer component={Paper} elevation={3}>
                <Table>
                    <TableHead sx={{ bgcolor: '#eeeeee' }}>
                        <TableRow>
                            <TableCell><strong>Ticket ID</strong></TableCell>
                            <TableCell><strong>Evidence</strong></TableCell>
                            <TableCell sx={{ width: '25%' }}><strong>Details & SLA</strong></TableCell>
                            <TableCell><strong>Status</strong></TableCell>
                            <TableCell><strong>Assignment</strong></TableCell>
                            <TableCell><strong>Action</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredIssues.map((issue) => (
                            <TableRow key={issue._id} hover sx={{ backgroundColor: issue.status === 'Escalated' ? '#f3e5f5' : (issue.isHazard ? '#ffebee' : 'inherit'), borderLeft: issue.status === 'Escalated' ? '6px solid #9c27b0' : (issue.isHazard ? '6px solid #d32f2f' : 'none') }}>
                                <TableCell>
                                    <strong>{issue.ticketId}</strong>
                                    {issue.isHazard && <Chip label="HAZARD" color="error" size="small" sx={{ ml: 1, display: 'flex', mb: 0.5 }} />}
                                    {issue.status === 'Escalated' && <Chip label="ESCALATED" color="secondary" size="small" sx={{ ml: 1, display: 'flex' }} />}
                                    {issue.citizenFeedback === 'Satisfied' && <Chip icon={<ThumbUpAltIcon style={{color:'white', fontSize: 16}}/>} label="VERIFIED" color="success" size="small" sx={{ ml: 1, mt: 0.5, fontWeight:'bold' }} />}
                                </TableCell>
                                
                                <TableCell>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <a href={issue.imageUrl} target="_blank"><img src={issue.imageUrl} style={{ width: '50px', borderRadius: '4px' }} alt="Issue"/></a>
                                        {issue.resolutionImageUrl && <a href={issue.resolutionImageUrl} target="_blank"><img src={issue.resolutionImageUrl} style={{ width: '50px', border:'2px solid green', borderRadius: '4px' }} alt="Fix"/></a>}
                                    </Box>
                                </TableCell>

                                <TableCell>
                                    <Typography variant="body2"><strong>Cat:</strong> {issue.category}</Typography>
                                    <Box sx={{ mt: 1 }}>{renderSLA(issue)}</Box>
                                    {issue.resolutionNote && <Box sx={{ mt: 1, p: 0.5, bgcolor: '#e8f5e9' }}><Typography variant="caption" color="success.main">"{issue.resolutionNote}"</Typography></Box>}
                                </TableCell>

                                <TableCell><Chip label={issue.status} color={issue.status === 'Resolved' ? 'success' : issue.status === 'Closed' ? 'success' : 'warning'} size="small" /></TableCell>
                                
                                <TableCell sx={{ minWidth: 180 }}>
                                    <Stack spacing={0.5}>
                                        {issue.assignedDepartment ? <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#1976D2' }}>Dept: {issue.assignedDepartment}</Typography> : <Typography variant="body2" color="error">Unassigned</Typography>}
                                        {issue.assignedWorker && <Typography variant="body2" color="text.secondary">Worker: {issue.assignedWorker.name}</Typography>}
                                    </Stack>
                                </TableCell>

                                <TableCell><Button variant="outlined" size="small" onClick={() => handleOpenModal(issue)}>Override</Button></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <UpdateStatusModal open={isModalOpen} issue={selectedIssue} onClose={handleCloseModal} onUpdate={handleStatusUpdate} />
        </Container>
    );
};
export default AdminDashboardPage;