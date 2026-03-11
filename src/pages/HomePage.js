import React, { useEffect, useState } from 'react';
import BASE_URL from '../config';
import { Container, Typography, Button, Box, Grid, Paper, Card, CardContent } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import PublicIcon from '@mui/icons-material/Public';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PeopleIcon from '@mui/icons-material/People'; // NEW ICON

// Role Specific Icons
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'; 
import BusinessIcon from '@mui/icons-material/Business'; 
import EngineeringIcon from '@mui/icons-material/Engineering'; 

import axios from 'axios';

// Map imports
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Chart.js imports
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next'; 

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

// --- LEAFLET ICON FIX ---
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const HomePage = ({ user }) => {
    const [stats, setStats] = useState(null);
    const [mapData, setMapData] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // --- ROLE CHECKS ---
    const isAdmin = user && user.role === 'admin';
    const isDept = user && user.role === 'department';
    const isWorker = user && user.role === 'worker';
    const isOfficial = isAdmin || isDept || isWorker;
    const { t } = useTranslation();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch Stats
                const statsRes = await axios.get(`${BASE_URL}/issues/stats`);
                setStats(statsRes.data);

                // 2. Fetch Map Data
                const mapRes = await axios.get(`${BASE_URL}/issues/public-map`);
                setMapData(mapRes.data);

            } catch (error) {
                console.error("Error fetching data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const categoryData = {
        labels: stats?.categoryStats.map(item => item._id) || [],
        datasets: [{
            label: 'Issues by Category',
            data: stats?.categoryStats.map(item => item.count) || [],
            backgroundColor: 'rgba(25, 118, 210, 0.7)',
        }],
    };

    const statusData = {
        labels: [t('stat_resolved'), t('stat_pending')],
        datasets: [{
            data: [stats?.resolved || 0, stats?.pending || 0],
            backgroundColor: ['#4caf50', '#ff9800'],
            hoverOffset: 4,
        }],
    };

    // --- DYNAMIC HERO CONTENT HELPER ---
    const renderHeroContent = () => {
        if (!isOfficial) {
            return (
                <>
                    <Typography variant="h3" fontWeight="bold" gutterBottom>{t('hero_title')}</Typography>
                    <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>{t('hero_subtitle')}</Typography>
                    <Box>
                        <Button component={RouterLink} to="/report" variant="contained" size="large" color="secondary" sx={{ mr: 2, py: 1.5, px: 4, fontWeight: 'bold' }}>
                            {t('report')}
                        </Button>
                        <Button component={RouterLink} to="/track" variant="outlined" size="large" sx={{ py: 1.5, px: 4, color: 'white', borderColor: 'white' }}>
                            {t('track')}
                        </Button>
                    </Box>
                </>
            );
        }
        if (isAdmin) {
            return (
                <>
                    <AdminPanelSettingsIcon sx={{ fontSize: 80, mb: 2 }} />
                    <Typography variant="h3" fontWeight="bold" gutterBottom>{t('portal_admin_title')}</Typography>
                    <Button component={RouterLink} to="/admin/dashboard" variant="contained" size="large" 
                        sx={{ bgcolor: 'white', color: '#e65100', fontWeight: 'bold', '&:hover': { bgcolor: '#f5f5f5' } }}>
                        {t('portal_admin_btn')}
                    </Button>
                </>
            );
        } else if (isDept) {
            return (
                <>
                    <BusinessIcon sx={{ fontSize: 80, mb: 2 }} />
                    <Typography variant="h3" fontWeight="bold" gutterBottom>{t('portal_dept_title')}</Typography>
                    <Button component={RouterLink} to="/dept/dashboard" variant="contained" size="large" 
                        sx={{ bgcolor: 'white', color: '#7b1fa2', fontWeight: 'bold', '&:hover': { bgcolor: '#f5f5f5' } }}>
                        {t('portal_dept_btn')}
                    </Button>
                </>
            );
        } else if (isWorker) {
            return (
                <>
                    <EngineeringIcon sx={{ fontSize: 80, mb: 2 }} />
                    <Typography variant="h3" fontWeight="bold" gutterBottom>{t('portal_worker_title')}</Typography>
                    <Button component={RouterLink} to="/worker/dashboard" variant="contained" size="large" 
                        sx={{ bgcolor: 'white', color: '#2e7d32', fontWeight: 'bold', '&:hover': { bgcolor: '#f5f5f5' } }}>
                        {t('portal_worker_btn')}
                    </Button>
                </>
            );
        }
    };

    const getHeroBackground = () => {
        if (isAdmin) return 'linear-gradient(135deg, #e65100 0%, #ff9800 100%)'; // Orange
        if (isDept) return 'linear-gradient(135deg, #7b1fa2 0%, #ba68c8 100%)'; // Purple
        if (isWorker) return 'linear-gradient(135deg, #2e7d32 0%, #81c784 100%)'; // Green
        return 'linear-gradient(135deg, #1976D2 0%, #64b5f6 100%)'; // Blue
    };

    return (
        <Box>
            {/* 1. HERO SECTION */}
            <Box sx={{ background: getHeroBackground(), color: 'white', py: 10, textAlign: 'center' }}>
                <Container maxWidth="md">
                    {renderHeroContent()}
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ mt: -4, mb: 8 }}>
                {/* 2. LIVE STATS COUNTERS */}
                <Grid container spacing={3} sx={{ mb: 6 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card elevation={3} sx={{ textAlign: 'center', py: 2 }}>
                            <CardContent>
                                <AssessmentIcon color="primary" sx={{ fontSize: 40 }} />
                                <Typography variant="h4" fontWeight="bold">{loading ? '-' : stats?.total}</Typography>
                                <Typography color="text.secondary">{t('stat_total')}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card elevation={3} sx={{ textAlign: 'center', py: 2 }}>
                            <CardContent>
                                <CheckCircleIcon color="success" sx={{ fontSize: 40 }} />
                                <Typography variant="h4" fontWeight="bold">{loading ? '-' : stats?.resolved}</Typography>
                                <Typography color="text.secondary">{t('stat_resolved')}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card elevation={3} sx={{ textAlign: 'center', py: 2 }}>
                            <CardContent>
                                <PendingActionsIcon color="warning" sx={{ fontSize: 40 }} />
                                <Typography variant="h4" fontWeight="bold">{loading ? '-' : stats?.pending}</Typography>
                                <Typography color="text.secondary">{t('stat_pending')}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    {/* NEW CARD FOR REGISTERED CITIZENS */}
                    <Grid item xs={12} sm={6} md={3}>
                        <Card elevation={3} sx={{ textAlign: 'center', py: 2 }}>
                            <CardContent>
                                <PeopleIcon sx={{ fontSize: 40, color: '#9c27b0' }} />
                                <Typography variant="h4" fontWeight="bold">{loading ? '-' : stats?.totalCitizens}</Typography>
                                <Typography color="text.secondary">{t('stat_citizens')}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* 3. LIVE COMMUNITY HEATMAP */}
                <Box sx={{ mb: 8 }}>
                    <Typography variant="h4" align="center" gutterBottom fontWeight="bold" color="text.primary">
                        {t('map_title')}
                    </Typography>
                    
                    <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
                        <MapContainer 
                            center={[28.6139, 77.2090]} 
                            zoom={11} 
                            style={{ height: '450px', width: '100%', borderRadius: '8px' }}
                        >
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            {mapData.map((issue) => (
                                issue.location?.coordinates && (
                                    <Marker 
                                        key={issue._id} 
                                        position={[issue.location.coordinates[1], issue.location.coordinates[0]]}
                                    >
                                        <Popup>
                                            <Box sx={{ textAlign: 'center' }}>
                                                <Typography variant="subtitle2" fontWeight="bold">{issue.category}</Typography>
                                                <img src={issue.imageUrl} alt="Evidence" style={{ width: '120px', borderRadius: '4px' }} />
                                            </Box>
                                        </Popup>
                                    </Marker>
                                )
                            ))}
                        </MapContainer>
                    </Paper>
                </Box>

                {/* 4. CHARTS SECTION */}
                {!loading && stats && (
                    <Box sx={{ mb: 8 }}>
                        <Typography variant="h4" align="center" gutterBottom fontWeight="bold" color="text.primary">
                            {isOfficial ? t('analytics_title_sys') : t('analytics_title_com')}
                        </Typography>
                        
                        <Grid container spacing={4} justifyContent="center">
                            <Grid item xs={12} md={7}>
                                <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
                                    <Typography variant="h6" gutterBottom align="center">{t('chart_cat')}</Typography>
                                    <Bar data={categoryData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
                                </Paper>
                            </Grid>
                            <Grid item xs={12} md={5}>
                                <Paper elevation={2} sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <Typography variant="h6" gutterBottom>{t('chart_res')}</Typography>
                                    <Box sx={{ width: '70%' }}>
                                        <Doughnut data={statusData} />
                                    </Box>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Box>
                )}

                {/* 5. HOW IT WORKS */}
                {!isOfficial && (
                    <>
                        <Typography variant="h4" align="center" gutterBottom fontWeight="bold" sx={{ mt: 4 }}>
                            {t('hiw_title')}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', mt: 4, gap: 4 }}>
                            <Box sx={{ textAlign: 'center', maxWidth: 300 }}>
                                <PublicIcon sx={{ fontSize: 60, color: '#1976D2', mb: 2 }} />
                                <Typography variant="h6" fontWeight="bold">{t('hiw_1_t')}</Typography>
                                <Typography color="text.secondary">{t('hiw_1_d')}</Typography>
                            </Box>
                            <Box sx={{ textAlign: 'center', maxWidth: 300 }}>
                                <HowToRegIcon sx={{ fontSize: 60, color: '#1976D2', mb: 2 }} />
                                <Typography variant="h6" fontWeight="bold">{t('hiw_2_t')}</Typography>
                                <Typography color="text.secondary">{t('hiw_2_d')}</Typography>
                            </Box>
                            <Box sx={{ textAlign: 'center', maxWidth: 300 }}>
                                <TrackChangesIcon sx={{ fontSize: 60, color: '#1976D2', mb: 2 }} />
                                <Typography variant="h6" fontWeight="bold">{t('hiw_3_t')}</Typography>
                                <Typography color="text.secondary">{t('hiw_3_d')}</Typography>
                            </Box>
                        </Box>
                    </>
                )}
            </Container>
        </Box>
    );
};

export default HomePage;