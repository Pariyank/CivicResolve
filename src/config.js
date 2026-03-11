// Logic to pick the right URL automatically
const BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api'  // If on your laptop
    : 'https://civicresolve-ouky.onrender.com/api'; // If on Firebase

export default BASE_URL;