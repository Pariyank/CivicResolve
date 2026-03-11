import React, { useState } from 'react';
import { Container, TextField, Button, Typography, Box, Paper, Alert, Grid, Link as MuiLink, CircularProgress } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import BASE_URL from '../config'; // <--- IMPORT CONFIG

const SignupPage = ({ onLogin }) => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const payload = {
            ...formData,
            role: 'citizen',
            department: 'None'
        };

        try {
            // Use BASE_URL + Endpoint
            const url = `${BASE_URL}/users/register`;
            
            console.log("Registering at:", url); // Debug Log

            const res = await axios.post(url, payload);
            
            localStorage.setItem('authToken', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data));
            if(onLogin) onLogin(res.data);
            
            navigate('/dashboard');
            
        } catch (err) {
            console.error("Signup Error:", err);
            setError(err.response?.data?.message || 'Signup failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container component="main" maxWidth="xs" sx={{ mt: 8 }}>
            <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography component="h1" variant="h5" fontWeight="bold">Citizen Registration</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Join to report and track civic issues.
                </Typography>

                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
                    <TextField margin="normal" required fullWidth label="Full Name" name="name" onChange={handleChange} />
                    <TextField margin="normal" required fullWidth label="Email Address" name="email" onChange={handleChange} />
                    <TextField margin="normal" required fullWidth label="Password" name="password" type="password" onChange={handleChange} />
                    
                    {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                    
                    <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={loading}>
                        {loading ? <CircularProgress size={24} /> : 'Sign Up'}
                    </Button>
                    
                    <Grid container justifyContent="flex-end">
                        <Grid item>
                            <MuiLink component={RouterLink} to="/login" variant="body2">Already have an account? Sign in</MuiLink>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
        </Container>
    );
};
export default SignupPage;