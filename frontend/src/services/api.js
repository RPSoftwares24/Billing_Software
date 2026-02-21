import axios from 'axios';

const API = axios.create({
    baseURL: 'http://192.168.1.44:8000/api', 
});

export default API;