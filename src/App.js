import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import React, { useState, useEffect } from 'react';

import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import ReportIssuePage from './pages/ReportIssuePage';
import TrackIssuePage from './pages/TrackIssuePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import DeptDashboardPage from './pages/DeptDashboardPage';
import WorkerDashboardPage from './pages/WorkerDashboardPage';
import ManageStaffPage from './pages/ManageStaffPage'; // <--- Import New Page

import './App.css';

const theme = createTheme({
    palette: {
        primary: { main: '#1976D2' },
        secondary: { main: '#388E3C' },
        background: { default: '#F4F6F8' },
    },
    typography: {
        fontFamily: "'Lato', sans-serif",
        h1: { fontFamily: "'Poppins', sans-serif", fontWeight: 700 },
    },
});

const RequireAuth = ({ children, user, roleRequired }) => {
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    if (roleRequired && user.role !== roleRequired) {
        return <Navigate to="/" replace />;
    }
    return children;
};

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const handleLogin = (userData) => {
        setUser(userData);
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        setUser(null);
    };

    if (loading) return null;

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            
            <Navbar user={user} onLogout={handleLogout} />
            
            <main>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<HomePage user={user} />} />
                    <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
                    <Route path="/signup" element={<SignupPage onLogin={handleLogin} />} />
                    <Route path="/track" element={<TrackIssuePage />} />

                    {/* Protected User Route */}
                    <Route path="/report" element={
                        <RequireAuth user={user} roleRequired="citizen">
                            <ReportIssuePage />
                        </RequireAuth>
                    } />
                    
                    <Route path="/dashboard" element={
                        <RequireAuth user={user} roleRequired="citizen">
                            <DashboardPage />
                        </RequireAuth>
                    } />
                    
                    {/* Protected Admin Routes */}
                    <Route path="/admin/dashboard" element={
                        <RequireAuth user={user} roleRequired="admin">
                            <AdminDashboardPage />
                        </RequireAuth>
                    } />

                    {/* NEW: Manage Staff Route */}
                    <Route path="/admin/manage-staff" element={
                        <RequireAuth user={user} roleRequired="admin">
                            <ManageStaffPage />
                        </RequireAuth>
                    } />

                    {/* Protected Department Route */}
                    <Route path="/dept/dashboard" element={
                        <RequireAuth user={user} roleRequired="department">
                            <DeptDashboardPage />
                        </RequireAuth>
                    } />

                    {/* Protected Worker Route */}
                    <Route path="/worker/dashboard" element={
                        <RequireAuth user={user} roleRequired="worker">
                            <WorkerDashboardPage />
                        </RequireAuth>
                    } />

                </Routes>
            </main>
        </ThemeProvider>
    );
}

export default App;