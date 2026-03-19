import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const getApiUrl = () => {
    try {
        const debuggerHost = Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost;

        if (debuggerHost) {
            const ip = debuggerHost.split(':')[0];
            console.log('Detected server IP from Expo:', ip);
            return `http://${ip}:8080`;
        }
    } catch (error) {
        console.error('Could not detect Expo host:', error);
    }

    return Constants.expoConfig?.extra?.apiUrl || 'http://localhost:8080';
};

const API_URL = getApiUrl();
console.log('Using API URL:', API_URL);

const api = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    async (config) => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error('Error getting token:', error);
            // If token is corrupted (Row too big), clear it so user can login again
            await AsyncStorage.removeItem('userToken').catch(() => { });
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            await AsyncStorage.removeItem('userToken');
        }
        return Promise.reject(error);
    }
);

export const login = async (email, password) => {
    const response = await api.post('/api/auth/login', { email, password });
    const token = typeof response.data === 'string' ? response.data : response.data.token;
    if (token) {
        await AsyncStorage.setItem('userToken', token);
    }
    return response.data;
};

export const register = async (email, username, password) => {
    const response = await api.post('/api/auth/register', { email, username, password });
    return response.data;
};

export const logout = async () => {
    await AsyncStorage.removeItem('userToken');
};

export const getToken = async () => {
    return await AsyncStorage.getItem('userToken');
};

export const isAuthenticated = async () => {
    const token = await AsyncStorage.getItem('userToken');
    return !!token;
};

// Services functions
export const getUserServices = async () => {
    const response = await api.get('/api/user/services');
    return response.data;
};

export const getAllServices = async () => {
    const response = await api.get('/services');
    return response.data;
};

export const connectService = async (serviceName) => {
    const response = await api.post('/api/user/services', { serviceName });
    return response.data;
};

export const disconnectService = async (serviceName) => {
    const response = await api.delete(`/api/user/services/${serviceName}`);
    return response.data;
};

export const connectGitHubMobile = async (accessToken, userEmail) => {
    const response = await api.post('/api/auth/github-mobile', { accessToken, userEmail });
    return response.data;
};

// AREA functions
export const getAreas = async () => {
    const response = await api.get('/areas');
    return response.data;
};

export const createArea = async (areaData) => {
    const response = await api.post('/areas', areaData);
    return response.data;
};

export const deleteArea = async (areaId) => {
    const response = await api.delete(`/areas/${areaId}`);
    return response.data;
};

export const toggleArea = async (areaId, enabled) => {
    const response = await api.patch(`/areas/${areaId}`, { enabled });
    return response.data;
};

export default api;
