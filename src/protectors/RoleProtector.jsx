import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCookies } from 'react-cookie';
import { jwtDecode } from 'jwt-decode';
import Loading from '../components/Loading/Loading';

// TESTING MODE: Set to true to allow access to Owner pages for testing
// WARNING: Set this back to false before deploying to production!
const TESTING_MODE = false; // Disabled for production - Owner pages are now protected
const ALLOW_OWNER_ACCESS_IN_TESTING = false; // Disabled - Owner pages are now protected

export default function RoleProtector({ children, requiredRole }) {
    // TESTING MODE: Completely bypass all checks for Owner pages
    if (TESTING_MODE && ALLOW_OWNER_ACCESS_IN_TESTING && requiredRole === "Owner") {
        console.warn("⚠️ TESTING MODE: Bypassing all protection for Owner pages. Remember to disable this in production!");
        return children;
    }

    const { getUserRole } = useAuth();
    const [cookies] = useCookies(['MegaBox']);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = cookies.MegaBox;
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const decoded = jwtDecode(token);
            getUserRole(decoded?.id).then(fetchedRole => {
                setRole(fetchedRole);
                setLoading(false);
            });
        } catch (error) {

            setLoading(false);
        }
    }, [cookies, getUserRole]);

    if (loading) {
        return <Loading />
    }

    if (role === requiredRole) {
        return children;
    }

    return <Navigate to="/" replace />;
}
