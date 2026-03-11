import React, { useState } from 'react';
import BASE_URL from '../config';
import { Container, Typography, Paper, TextField, Button, Box, Select, MenuItem, FormControl, InputLabel, Alert } from '@mui/material';
import axios from 'axios';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

const ManageStaffPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'worker', // Default selection
        department: 'Garbage' // Default selection
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const departments = [
        "Garbage", "Road Defect", "Streetlight Outage", 
        "Water Leak", "Sewage Block", "Public Vandalism", "Other"
    ];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        try {
            let url = '';
            let payload = { ...formData };

            console.log("Creating Account Role:", formData.role);

            // --- CRITICAL ROUTING LOGIC ---
            if (formData.role === 'department') {
                // CASE 1: Department Head -> Goes to OFFICER API
                // Officers require a 'ward' field in the schema
                url = `${BASE_URL}/auth/register`;
                payload.ward = 'All'; 
            } 
            else if (formData.role === 'worker') {
                // CASE 2: Field Worker -> Goes to USER API
                // Workers are stored in the same collection as Citizens
                url = `${BASE_URL}/users/register`;
            }

            console.log("Sending to URL:", url);

            // Send request
            await axios.post(url, payload);
            
            setMessage(`Success! Created ${formData.role} account for ${formData.name}`);
            
            // Clear form but keep role/dept for easier multiple entries
            setFormData({ 
                ...formData, 
                name: '', 
                email: '', 
                password: '' 
            });
            
        } catch (err) {
            console.error("Registration Error:", err);
            // Show specific backend error message
            setError(err.response?.data?.message || 'Failed to create account. Check console.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 5, mb: 5 }}>
            <Button 
                startIcon={<ArrowBackIcon />} 
                onClick={() => navigate('/admin/dashboard')} 
                sx={{ mb: 2 }}
            >
                Back to Dashboard
            </Button>

            <Paper elevation={3} sx={{ p: 4 }}>
                <Box display="flex" alignItems="center" mb={3}>
                    <PersonAddIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                    <Box>
                        <Typography variant="h4" fontWeight="bold">Onboard Staff</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Create accounts for Dept Heads & Workers
                        </Typography>
                    </Box>
                </Box>

                {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <Box component="form" onSubmit={handleSubmit}>
                    
                    {/* Role Selection */}
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Role</InputLabel>
                        <Select
                            name="role"
                            value={formData.role}
                            label="Role"
                            onChange={handleChange}
                        >
                            <MenuItem value="department">Department Head (Manager)</MenuItem>
                            <MenuItem value="worker">Field Worker</MenuItem>
                        </Select>
                    </FormControl>

                    {/* Department Selection */}
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Department</InputLabel>
                        <Select
                            name="department"
                            value={formData.department}
                            label="Department"
                            onChange={handleChange}
                        >
                            {departments.map((dept) => (
                                <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <TextField
                        fullWidth margin="normal"
                        label="Full Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                    <TextField
                        fullWidth margin="normal"
                        label="Email Address"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                    <TextField
                        fullWidth margin="normal"
                        label="Password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />

                    <Button 
                        type="submit" 
                        variant="contained" 
                        fullWidth 
                        size="large"
                        sx={{ mt: 3, py: 1.5 }}
                        disabled={loading}
                    >
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default ManageStaffPage;