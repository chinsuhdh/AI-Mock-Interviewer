import axios from 'axios';

// Cổng Backend của bạn là 5186 (dựa trên ảnh Swagger)
const BASE_URL = 'http://localhost:5186/api'; 

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Tự động thêm Token vào mỗi request nếu đã đăng nhập
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;