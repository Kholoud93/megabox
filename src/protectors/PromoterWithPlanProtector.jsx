import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import Loading from '../components/Loading/Loading';
import { userService } from '../services/api';

export default function PromoterWithPlanProtector({ children }) {
    const [cookies] = useCookies(['MegaBox']);
    const [hasAccess, setHasAccess] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAccess = async () => {
            const token = cookies.MegaBox;
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const userData = await userService.getUserInfo(token);
                const isPromoter = userData?.isPromoter === "true" || userData?.isPromoter === true;
                const hasDownloadsPlan = userData?.Downloadsplan === "true" || userData?.Downloadsplan === true;
                const hasWatchingPlan = userData?.watchingplan === "true" || userData?.watchingplan === true;

                // User must be a promoter AND have at least one plan
                setHasAccess(isPromoter && (hasDownloadsPlan || hasWatchingPlan));
                setLoading(false);
            } catch (error) {
                console.error('Error checking promoter with plan status:', error);
                setLoading(false);
            }
        };

        checkAccess();
    }, [cookies]);

    if (loading) {
        return <Loading />;
    }

    if (hasAccess) {
        return children;
    }

    return <Navigate to="/dashboard" replace />;
}

