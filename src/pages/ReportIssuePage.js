import React, { useState, useEffect, useRef } from 'react';
import BASE_URL from '../config'; 
import { 
    Container, TextField, Button, Select, MenuItem, FormControl, InputLabel, 
    Box, CircularProgress, Alert, Paper, Checkbox, FormControlLabel, 
    Dialog, DialogTitle, DialogContent, DialogActions, Card, CardMedia, CardContent, Chip, IconButton, InputAdornment, Typography 
} from '@mui/material';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import WarningIcon from '@mui/icons-material/Warning';
import MicIcon from '@mui/icons-material/Mic';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

import * as mobilenet from '@tensorflow-models/mobilenet';
import '@tensorflow/tfjs';

// Leaflet Icon Fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

function MapClickHandler({ setPosition }) {
    const map = useMap();
    useEffect(() => {
        const handleClick = (e) => {
            setPosition(e.latlng);
            map.flyTo(e.latlng, map.getZoom());
        };
        map.on('click', handleClick);
        return () => { map.off('click', handleClick); };
    }, [map, setPosition]);
    return null;
}

const ReportIssuePage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ category: '', description: '', ward: 'Ward 7', isHazard: false });
    const [position, setPosition] = useState(null);
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    // Duplicate & Voice State
    const [duplicates, setDuplicates] = useState([]);
    const [showDupModal, setShowDupModal] = useState(false);
    const [isListening, setIsListening] = useState(false);

    // AI State
    const [aiModel, setAiModel] = useState(null);
    const [isClassifying, setIsClassifying] = useState(false);
    const [aiPrediction, setAiPrediction] = useState('');

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (pos) => setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            () => setPosition({ lat: 28.6139, lng: 77.2090 })
        );

        const loadModel = async () => {
            try {
                console.log("Loading AI Model...");
                const model = await mobilenet.load();
                setAiModel(model);
                console.log("AI Model Loaded");
            } catch (err) { console.error("Failed to load AI model", err); }
        };
        loadModel();
    }, []);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImage(file);

        if (aiModel) {
            setIsClassifying(true);
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async (event) => {
                const imgElement = document.createElement('img');
                imgElement.src = event.target.result;
                imgElement.onload = async () => {
                    const predictions = await aiModel.classify(imgElement);
                    mapPredictionToCategory(predictions);
                    setIsClassifying(false);
                };
            };
        }
    };

    const mapPredictionToCategory = (predictions) => {
        const topPred = predictions[0].className.toLowerCase();
        let detectedCat = '';

        if (topPred.includes('trash') || topPred.includes('carton') || topPred.includes('paper') || topPred.includes('bottle')) detectedCat = 'Garbage';
        else if (topPred.includes('manhole') || topPred.includes('concrete') || topPred.includes('street')) detectedCat = 'Road Defect';
        else if (topPred.includes('spotlight') || topPred.includes('lamp')) detectedCat = 'Streetlight Outage';
        else if (topPred.includes('fountain') || topPred.includes('water')) detectedCat = 'Water Leak';

        if (detectedCat) {
            setFormData(prev => ({ ...prev, category: detectedCat }));
            setAiPrediction(`AI detected "${topPred}" and auto-selected "${detectedCat}"`);
        } else {
            setAiPrediction(`AI detected "${topPred}" but couldn't match a category.`);
        }
    };

    const startListening = () => {
        if (!('webkitSpeechRecognition' in window)) { alert("Browser not supported"); return; }
        const recognition = new window.webkitSpeechRecognition();
        recognition.continuous = false; 
        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onresult = (e) => setFormData(prev => ({ ...prev, description: prev.description + " " + e.results[0][0].transcript }));
        recognition.start();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.category || !image) { setError('Please select a category and upload an image.'); return; }
        
        if (!position) return;
        
        // --- DUPLICATE CHECK CALL ---
        try {
            const token = localStorage.getItem('authToken');
            const res = await axios.post(`${BASE_URL}/issues/check-duplicate`, {
                lat: position.lat, lng: position.lng, category: formData.category
            }, { headers: { Authorization: `Bearer ${token}` } });

            if (res.data.length > 0) {
                setDuplicates(res.data);
                setShowDupModal(true);
                return; // STOP SUBMISSION
            }
        } catch (err) { console.error(err); }

        proceedWithSubmission();
    };

    const proceedWithSubmission = async () => {
        setLoading(true);
        setError('');
        setShowDupModal(false); 

        const token = localStorage.getItem('authToken');
        const issueData = new FormData();
        issueData.append('category', formData.category);
        issueData.append('description', formData.description);
        issueData.append('ward', formData.ward);
        issueData.append('isHazard', formData.isHazard);
        issueData.append('location', JSON.stringify({ latitude: position.lat, longitude: position.lng }));
        issueData.append('issueImage', image);
        
        try {
            const config = { headers: { 'Authorization': `Bearer ${token}` } };
            const res = await axios.post(`${BASE_URL}/issues/report`, issueData, config);
            setLoading(false);
            setSuccess(`Issue reported! Your Ticket ID: ${res.data.ticketId}`);
            setTimeout(() => navigate(`/track?ticketId=${res.data.ticketId}`), 2500);
        } catch (err) {
            setLoading(false);
            setError(err.response?.data?.message || 'Failed to report issue.');
        }
    };

    if (!position) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Paper sx={{ p: { xs: 2, md: 4 } }}>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>Report an Issue</Typography>
                
                {aiPrediction && <Alert icon={<AutoAwesomeIcon />} severity="info" sx={{ mb: 2 }}>{aiPrediction}</Alert>}

                <Box component="form" onSubmit={handleSubmit} noValidate>
                    <Typography variant="h6" sx={{ mb: 1 }}>1. Pin location</Typography>
                    <MapContainer center={position} zoom={15} style={{ height: '300px', width: '100%', borderRadius: '8px' }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <Marker position={position} />
                        <MapClickHandler setPosition={setPosition} />
                    </MapContainer>

                    <Button variant="outlined" component="label" fullWidth sx={{ mt: 3, mb: 2, py: 2, borderStyle: 'dashed' }}>
                        {image ? "Change Photo" : "Upload Photo for AI Analysis"}
                        <input type="file" accept="image/*" hidden required onChange={handleImageUpload} />
                    </Button>
                    {isClassifying && <Typography align="center" color="primary">AI is analyzing image...</Typography>}
                    {image && <Typography align="center" sx={{ mb: 2 }}>Selected: {image.name}</Typography>}

                    <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>2. Issue Details</Typography>
                    <FormControl fullWidth margin="normal" required>
                        <InputLabel>Category</InputLabel>
                        <Select value={formData.category} label="Category" onChange={(e) => setFormData({...formData, category: e.target.value})}>
                            <MenuItem value="Garbage">Garbage</MenuItem>
                            <MenuItem value="Road Defect">Road Defect</MenuItem>
                            <MenuItem value="Streetlight Outage">Streetlight Outage</MenuItem>
                            <MenuItem value="Water Leak">Water Leak</MenuItem>
                            <MenuItem value="Sewage Block">Sewage Block</MenuItem>
                            <MenuItem value="Public Vandalism">Public Vandalism</MenuItem>
                            <MenuItem value="Other">Other</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField 
                        margin="normal" fullWidth label="Description (Voice Enabled)" multiline rows={3} 
                        value={formData.description} 
                        onChange={(e) => setFormData({...formData, description: e.target.value})} 
                        InputProps={{ endAdornment: (<InputAdornment position="end"><IconButton onClick={startListening} color={isListening ? "error" : "primary"}><MicIcon /></IconButton></InputAdornment>) }}
                        helperText={isListening ? "Listening..." : "Click mic to speak"}
                    />

                    <FormControlLabel
                        control={<Checkbox checked={formData.isHazard} onChange={(e) => setFormData({...formData, isHazard: e.target.checked})} color="error" />}
                        label={<Box sx={{ display: 'flex', alignItems: 'center', color: '#d32f2f', fontWeight: 'bold' }}><WarningIcon sx={{ mr: 1 }} /> Is this a Safety Hazard?</Box>}
                        sx={{ mt: 2, border: '1px solid #ffcdd2', p: 1, borderRadius: 1, width: '100%', bgcolor: '#ffebee' }}
                    />

                    {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                    {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}

                    <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2, py: 1.5 }} disabled={loading}>
                        {loading ? <CircularProgress size={24} /> : 'Submit Report'}
                    </Button>
                </Box>
            </Paper>

            <Dialog open={showDupModal} onClose={() => setShowDupModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ bgcolor: '#fff3cd', color: '#856404', display: 'flex', alignItems: 'center' }}>
                    <WarningIcon sx={{ mr: 1 }} /> Similar Issue Found Nearby!
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    <Typography paragraph>
                        We found <strong>{duplicates.length} active issue(s)</strong> within 50 meters of your location.
                    </Typography>
                    {duplicates.map((dup) => (
                        <Card key={dup._id} sx={{ mb: 2, display: 'flex', border: '1px solid #ddd' }}>
                            <CardMedia component="img" sx={{ width: 100 }} image={dup.imageUrl} alt="Existing Issue" />
                            <CardContent>
                                <Typography variant="subtitle1" fontWeight="bold">{dup.ticketId}</Typography>
                                <Typography variant="body2" color="text.secondary">{dup.description}</Typography>
                                <Chip label={dup.status} size="small" color="primary" sx={{ mt: 1 }} />
                            </CardContent>
                        </Card>
                    ))}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => navigate(`/track?ticketId=${duplicates[0].ticketId}`)} variant="contained" color="primary">
                        Track Existing Issue
                    </Button>
                    <Button onClick={proceedWithSubmission} color="inherit">
                        Report Anyway
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default ReportIssuePage;