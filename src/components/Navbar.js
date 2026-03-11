import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem, Avatar } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import { useTranslation } from 'react-i18next'; // Import hook
import LanguageIcon from '@mui/icons-material/Language';

const Navbar = ({ user, onLogout }) => {
    const { t, i18n } = useTranslation(); // Use hook
    const [anchorEl, setAnchorEl] = useState(null);
    const navigate = useNavigate();

    const handleMenu = (event) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);

    // Toggle Language Function
    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'hi' : 'en';
        i18n.changeLanguage(newLang);
    };

    const handleDashboardClick = () => {
        handleClose();
        if (user.role === 'admin') navigate('/admin/dashboard');
        else if (user.role === 'department') navigate('/dept/dashboard');
        else if (user.role === 'worker') navigate('/worker/dashboard');
        else navigate('/dashboard'); 
    };

    const handleLogoutClick = () => {
        handleClose();
        onLogout();
        navigate('/');
    };

    const isOfficial = user && (user.role === 'admin' || user.role === 'department' || user.role === 'worker');
    
    const getAvatarColor = () => {
        if (!user) return '#1976D2';
        if (user.role === 'admin') return '#ed6c02'; 
        if (user.role === 'department') return '#9c27b0'; 
        if (user.role === 'worker') return '#2e7d32'; 
        return '#1976D2'; 
    };

    return (
        <AppBar position="static" sx={{ backgroundColor: '#ffffff', color: '#212121', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <Toolbar>
                <ReportProblemIcon sx={{ color: '#1976D2', mr: 1, fontSize: '2rem' }} />
                <Typography variant="h6" component={RouterLink} to="/" sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit', fontWeight: 'bold' }}>
                    {t('app_name')}
                </Typography>
                
                <Button color="inherit" component={RouterLink} to="/">{t('home')}</Button>

                {!isOfficial && (
                    <>
                        <Button color="inherit" component={RouterLink} to="/report">{t('report')}</Button>
                        <Button color="inherit" component={RouterLink} to="/track">{t('track')}</Button>
                    </>
                )}

                {/* LANGUAGE SWITCHER BUTTON */}
                <Button 
                    startIcon={<LanguageIcon />} 
                    onClick={toggleLanguage}
                    sx={{ ml: 1, mr: 1, color: '#555', borderColor: '#ddd' }}
                    variant="outlined"
                    size="small"
                >
                    {i18n.language === 'en' ? 'Hindi' : 'English'}
                </Button>
                
                {user ? (
                    <Box sx={{ ml: 2 }}>
                        <IconButton onClick={handleMenu} size="large" color="inherit">
                            <Avatar sx={{ bgcolor: getAvatarColor(), width: 32, height: 32, fontSize: '1rem' }}>
                                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            </Avatar>
                        </IconButton>
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                        >
                            <MenuItem disabled><strong>{user.name}</strong> ({user.role})</MenuItem>
                            <MenuItem onClick={handleDashboardClick}>{t('dashboard')}</MenuItem>
                            <MenuItem onClick={handleLogoutClick}>{t('logout')}</MenuItem>
                        </Menu>
                    </Box>
                ) : (
                    <Box>
                        <Button color="inherit" component={RouterLink} to="/login">{t('login')}</Button>
                        <Button variant="contained" component={RouterLink} to="/signup" sx={{ ml: 1 }}>{t('signup')}</Button>
                    </Box>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;