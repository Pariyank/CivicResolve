import React, { useState } from 'react';
import { Container, TextField, Button, Typography, Box, Paper, Alert, Tabs, Tab, CircularProgress, Link as MuiLink } from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import BASE_URL from '../config'; // <--- IMPORT CONFIG

const LoginPage = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [roleTab, setRoleTab] = useState(0); // 0:Citizen, 1:Worker, 2:Admin, 3:Dept
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // --- URL CONSTRUCTION ---
        // If Citizen(0) or Worker(1) -> use /users/login
        // If Admin(2) or Dept(3)     -> use /auth/login
        // BASE_URL already includes '/api', so we just add '/users/login' etc.
        let loginEndpoint = (roleTab === 2 || roleTab === 3) 
            ? '/auth/login' 
            : '/users/login';

        const finalUrl = `${BASE_URL}${loginEndpoint}`;

        try {
            console.log("Attempting Login to:", finalUrl); // Debug Log

            const res = await axios.post(finalUrl, { email, password });
            
            let userData = res.data;
            
            // Normalize Role for App Logic
            if (res.data.officer) {
                userData = { ...res.data, ...res.data.officer, role: res.data.officer.role }; 
            }
            
            // STRICT REDIRECT LOGIC
            if (roleTab === 0 && userData.role !== 'citizen') throw new Error("Not a Citizen account");
            if (roleTab === 1 && userData.role !== 'worker') throw new Error("Not a Worker account");
            if (roleTab === 2 && userData.role !== 'admin') throw new Error("Not an Admin account");
            if (roleTab === 3 && userData.role !== 'department') throw new Error("Not a Department account");

            localStorage.setItem('authToken', res.data.token);
            localStorage.setItem('user', JSON.stringify(userData));
            onLogin(userData);

            // Navigation
            if (roleTab === 0) navigate('/dashboard');
            if (roleTab === 1) navigate('/worker/dashboard');
            if (roleTab === 2) navigate('/admin/dashboard');
            if (roleTab === 3) navigate('/dept/dashboard');

        } catch (err) {
            console.error("Login Error:", err);
            setError(err.message || err.response?.data?.message || 'Login failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container component="main" maxWidth="sm" sx={{ mt: 8 }}>
            <Paper elevation={3} sx={{ padding: 4 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                    <Tabs value={roleTab} onChange={(e, v) => setRoleTab(v)} variant="scrollable" scrollButtons="auto">
                        <Tab label="Citizen" />
                        <Tab label="Worker" />
                        <Tab label="Admin" />
                        <Tab label="Department" />
                    </Tabs>
                </Box>
                <Typography component="h1" variant="h5" align="center" gutterBottom>
                    Sign In
                </Typography>
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                    <TextField margin="normal" required fullWidth label="Email / Username" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <TextField margin="normal" required fullWidth label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    
                    {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                    
                    <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={loading}>
                        {loading ? <CircularProgress size={24} /> : 'Sign In'}
                    </Button>
                    
                    {(roleTab === 0 || roleTab === 1) && (
                        <Box textAlign="center">
                            <MuiLink component={RouterLink} to="/signup">Don't have an account? Sign Up</MuiLink>
                        </Box>
                    )}
                </Box>
            </Paper>
        </Container>
    );
};
export default LoginPage;