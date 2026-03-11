import React, { useState, useEffect } from 'react';
import BASE_URL from '../config';
import { Modal, Box, Typography, Select, MenuItem, FormControl, InputLabel, Button, TextField, Alert, Divider, InputAdornment } from '@mui/material';
import axios from 'axios';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';

const style = {
    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
    width: 600, maxHeight: '90vh', overflowY: 'auto', bgcolor: 'background.paper',
    border: '2px solid #000', boxShadow: 24, p: 4, borderRadius: 2
};

const UpdateStatusModal = ({ issue, open, onClose, onUpdate }) => {
    const [status, setStatus] = useState('');
    const [note, setNote] = useState('');
    const [cost, setCost] = useState(''); 
    const [resolutionImage, setResolutionImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [userRole, setUserRole] = useState('');
    const [isRejecting, setIsRejecting] = useState(false);

    useEffect(() => {
        if (issue) {
            setStatus(issue.status || 'Received');
            setNote(issue.resolutionNote || '');
            setCost(issue.resolutionCost || ''); // Load existing cost
            setResolutionImage(null);
            setError('');
            setIsRejecting(false);
        }
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) setUserRole(storedUser.role);
    }, [issue]);

    const getStatusOptions = () => {
        const allStatuses = ['Received', 'Assigned to Dept', 'Assigned to Worker', 'Work In Progress', 'Resolved', 'Work Rejected', 'Closed'];
        if (userRole === 'admin') return allStatuses;
        if (userRole === 'department') return ['Assigned to Worker', 'Work In Progress', 'Resolved', 'Work Rejected', 'Closed'];
        if (userRole === 'worker') return ['Work In Progress', 'Resolved'];
        return allStatuses;
    };

    const handleUpdate = async (manualStatus = null) => {
        setError('');
        const finalStatus = manualStatus || status;

        if (!isRejecting && (finalStatus === 'Resolved' || finalStatus === 'Closed')) {
            if (!issue.resolutionImageUrl && !resolutionImage) {
                setError('Proof of Fix (Image) is mandatory.');
                return;
            }
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            const formData = new FormData();
            formData.append('status', finalStatus);
            formData.append('resolutionNote', note);
            
            // Only send cost if it exists. 
            // Note: Admin might send back the existing cost, Dept sends new cost.
            if(cost) formData.append('resolutionCost', cost); 
            
            if (resolutionImage) formData.append('resolutionImage', resolutionImage);

            const config = { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } };
            const res = await axios.put(`${BASE_URL}/issues/${issue._id}/status`, formData, config);
            
            onUpdate(res.data);
            setLoading(false);
            onClose();
        } catch (err) {
            setError('Update failed. ' + (err.response?.data?.message || 'Server error'));
            setLoading(false);
        }
    };

    if (!issue) return null;
    const allowedStatuses = getStatusOptions();
    const hasExistingProof = !!issue.resolutionImageUrl;
    
    // Logic for "Approval Mode" (Viewing a Resolved Ticket)
    const showApprovalActions = (userRole === 'admin' || userRole === 'department') && issue.status === 'Resolved';

    // Logic for Cost Input
    const canEditCost = userRole === 'department'; // Only Dept can edit cost in this modal
    const isAdminView = userRole === 'admin';

    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={style}>
                <Typography variant="h5" gutterBottom fontWeight="bold">Manage Ticket: {issue.ticketId}</Typography>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                {/* --- APPROVAL / VERIFICATION UI --- */}
                {showApprovalActions && !isRejecting ? (
                    <Box sx={{ textAlign: 'center', py: 2 }}>
                        <Typography variant="h6" color="primary">Work marked as Resolved.</Typography>
                        
                        {hasExistingProof && (
                            <img src={issue.resolutionImageUrl} alt="Proof" style={{ width: '100%', maxHeight: '200px', objectFit: 'contain', marginBottom: '16px', border: '1px solid #ccc' }} />
                        )}
                        
                        {/* Show Cost to Admin/Dept during verification */}
                        <Box sx={{ bgcolor: '#e8f5e9', p: 1, mb: 2, borderRadius: 1, display: 'inline-flex', alignItems: 'center' }}>
                            <CurrencyRupeeIcon sx={{ fontSize: 18, mr: 0.5, color: 'green' }} />
                            <Typography fontWeight="bold" color="success.main">
                                Cost Reported: ₹{cost || 0}
                            </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 2 }}>
                            <Button variant="contained" color="success" startIcon={<CheckCircleIcon />} onClick={() => handleUpdate('Closed')} disabled={loading}>
                                Verify & Close
                            </Button>
                            <Button variant="outlined" color="error" startIcon={<ThumbDownIcon />} onClick={() => { setIsRejecting(true); setStatus('Work Rejected'); setNote(''); }}>
                                Reject Work
                            </Button>
                        </Box>
                        <Divider sx={{ my: 3 }}>OR Manual Update</Divider>
                    </Box>
                ) : null}

                {/* --- FORM FIELDS --- */}
                
                <FormControl fullWidth margin="normal">
                    <InputLabel>Update Status</InputLabel>
                    <Select value={status} label="Update Status" onChange={(e) => setStatus(e.target.value)} disabled={isRejecting}>
                        {!allowedStatuses.includes(issue.status) && <MenuItem value={issue.status} disabled>{issue.status} (Current)</MenuItem>}
                        {allowedStatuses.map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
                    </Select>
                </FormControl>

                <TextField 
                    label={isRejecting ? "Rejection Reason" : "Note"} 
                    multiline rows={3} fullWidth 
                    value={note} onChange={(e) => setNote(e.target.value)} 
                    margin="normal" required={isRejecting} 
                    color={isRejecting ? "error" : "primary"} 
                />

                {/* --- COST FIELD LOGIC --- */}
                {/* 1. If Department: Show Editable Input */}
                {!isRejecting && canEditCost && (
                    <TextField 
                        label="Update Cost Incurred (₹)" 
                        type="number" 
                        fullWidth 
                        margin="normal" 
                        value={cost} 
                        onChange={(e) => setCost(e.target.value)}
                        InputProps={{ startAdornment: <InputAdornment position="start"><CurrencyRupeeIcon/></InputAdornment> }}
                        helperText="Enter final amount spent on repairs."
                    />
                )}

                {/* 2. If Admin: Show Read-Only Text (No Input) */}
                {!isRejecting && isAdminView && cost > 0 && (
                    <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1, border: '1px dashed #ccc' }}>
                        <Typography variant="body2" color="text.secondary">Reported Cost:</Typography>
                        <Typography variant="h6" color="primary" fontWeight="bold">₹ {cost}</Typography>
                    </Box>
                )}

                {!isRejecting && !hasExistingProof && (
                    <Button variant="outlined" component="label" fullWidth startIcon={<CloudUploadIcon />} sx={{ mt: 1, mb: 2 }}>
                        Upload Proof of Fix * <input type="file" hidden accept="image/*" onChange={(e) => setResolutionImage(e.target.files[0])} />
                    </Button>
                )}
                {resolutionImage && <Typography variant="caption" sx={{mb: 2, display: 'block', color: 'green'}}>Selected: {resolutionImage.name}</Typography>}

                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Button onClick={onClose} color="inherit">Cancel</Button>
                    <Button onClick={() => handleUpdate()} variant="contained" color={isRejecting ? "error" : "primary"} disabled={loading || (isRejecting && !note)}>
                        {loading ? 'Saving...' : (isRejecting ? 'Confirm Rejection' : 'Save Changes')}
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default UpdateStatusModal;