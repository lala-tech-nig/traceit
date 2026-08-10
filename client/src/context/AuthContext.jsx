import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const userInfo = localStorage.getItem('traceit_user');
        if (userInfo) {
            setUser(JSON.parse(userInfo));
        }
        setLoading(false);
    }, []);

    const checkAndLoadUser = async (overrideUser = user) => {
        if (!overrideUser) return;
        try {
            const { data } = await axios.get(`${API_URL}/auth/profile`, {
                headers: { Authorization: `Bearer ${overrideUser.token}` }
            });
            if (data) {
                const isChanged = data.isApproved !== overrideUser.isApproved || data.hasPaid !== overrideUser.hasPaid;
                if (isChanged) {
                    const updatedUser = { ...overrideUser, ...data };
                    setUser(updatedUser);
                    localStorage.setItem('traceit_user', JSON.stringify(updatedUser));
                }
            }
        } catch (error) {
            console.error("Auto refresh failed", error);
        }
    };

    // Background polling for status updates
    useEffect(() => {
        let interval;
        if (user) {
            interval = setInterval(() => {
                checkAndLoadUser(user);
            }, 10000); // 10 seconds
        }
        return () => clearInterval(interval);
    }, [user, API_URL]);

    const login = async (email, password) => {
        try {
            const { data } = await axios.post(`${API_URL}/auth/login`, { email, password });
            setUser(data);
            localStorage.setItem('traceit_user', JSON.stringify(data));
            if (data.role === 'verificator') {
                navigate('/verificator');
            } else {
                navigate('/dashboard');
            }
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response && error.response.data.message
                    ? error.response.data.message
                    : error.message,
                isSuspended: error.response?.data?.isSuspended,
                email: error.response?.data?.email
            };
        }

    };

    const sendOtp = async (email, firstName) => {
        try {
            await axios.post(`${API_URL}/auth/send-otp`, { email, firstName });
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response && error.response.data.message
                    ? error.response.data.message
                    : error.message
            };
        }
    };

    const register = async (formData) => {
        try {
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            };

            const { data } = await axios.post(`${API_URL}/auth/register`, formData, config);
            setUser(data);
            localStorage.setItem('traceit_user', JSON.stringify(data));
            navigate('/dashboard');
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response && error.response.data.message
                    ? error.response.data.message
                    : error.message
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('traceit_user');
        setUser(null);
        navigate('/');
    };

    return (
        <AuthContext.Provider value={{ user, login, register, sendOtp, logout, loading, API_URL, checkAndLoadUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
