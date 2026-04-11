import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCookies } from 'react-cookie';
import { jwtDecode } from 'jwt-decode';
import Loading from '../components/Loading/Loading';

const TESTING_MODE = false;
const ALLOW_OWNER_ACCESS_IN_TESTING = false;

export default function RoleProtector({ children, requiredRole }) {
    const { getUserRole } = useAuth();
    const [cookies] = useCookies(['MegaBox']);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (TESTING_MODE && ALLOW_OWNER_ACCESS_IN_TESTING && requiredRole === "Owner") {
            setLoading(false);
            return;
        }

        const token = cookies.MegaBox;
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const decoded = jwtDecode(token);
            const tokenRole = decoded?.role;
            getUserRole(decoded?.id).then((fetchedRole) => {
                const apiRole =
                    fetchedRole === false || fetchedRole == null || fetchedRole === undefined
                        ? null
                        : fetchedRole;
                setRole(apiRole ?? tokenRole ?? null);
                setLoading(false);
            });
        } catch {
            setLoading(false);
        }
    }, [cookies, getUserRole, requiredRole]);

    if (TESTING_MODE && ALLOW_OWNER_ACCESS_IN_TESTING && requiredRole === "Owner") {
        return children;
    }

    if (loading) {
        return <Loading />
    }

    if (role === requiredRole) {
        return children;
    }

    if (role === "Owner") {
        return <Navigate to="/Owner/profile" replace />;
    }

    if (role === "User") {
        return <Navigate to="/dashboard" replace />;
    }

    return <Navigate to="/" replace />;
}
