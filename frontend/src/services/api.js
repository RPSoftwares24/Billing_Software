import axios from 'axios';

const API = axios.create({
    baseURL: 'https://api.rpsoftwares.com/api', 
});

export default API;