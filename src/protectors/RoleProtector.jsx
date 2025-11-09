import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCookies } from 'react-cookie';
import { jwtDecode } from 'jwt-decode';
import Loading from '../components/Loading/Loading';

export default function RoleProtector({ children, requiredRole }) {
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
