import React, { useEffect, useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import Sidenav from '../components/Sidenav/Sidenav'
import BottomNavigation from '../components/BottomNavigation/BottomNavigation'
import DashboardHeader from '../components/DashboardHeader/DashboardHeader'
import { useAuth } from '../context/AuthContext'
import { useCookies } from 'react-cookie';
import { jwtDecode } from "jwt-decode";
import Loading from '../components/Loading/Loading';
import { useQuery } from 'react-query';
import { userService } from '../services';


export default function DashboardLayout({ role }) {

    const auth = useAuth();
    const [Token] = useCookies(['MegaBox']);

    const [RoleLoading, setRoleLoading] = useState(true)

    // Get user data for BottomNavigation
    const { data: userData } = useQuery(
        ['userAccount'],
        () => userService.getUserInfo(Token.MegaBox),
        {
            enabled: !!Token.MegaBox && role === "User",
            retry: false
        }
    );

    const isPromoter = userData?.isPromoter === "true" || userData?.isPromoter === true;

    const idTracker = () => {
        let id;

        if (Token.MegaBox) {
            id = jwtDecode(Token.MegaBox).id;
            return id
        } else {
            return false
        }
    }

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!auth) {
            navigate("/login");
            return;
        }

        if (idTracker() && auth.getUserRole) {
            // Get role from JWT token first for immediate check
            let tokenRole = null;
            try {
                const decoded = jwtDecode(Token.MegaBox);
                tokenRole = decoded?.role;
            } catch (error) {
                console.error('Error decoding token:', error);
            }

            // If user is Owner but on wrong route, redirect immediately
            if (tokenRole === "Owner" && role !== "Owner") {
                navigate("/Owner/profile", { replace: true });
                return;
            }

            // If user is not Owner but on Owner route, redirect based on their actual role
            if (tokenRole !== "Owner" && role === "Owner") {
                navigate("/dashboard", { replace: true });
                return;
            }

            auth.getUserRole(idTracker()).then(fetchedRole => {
                // Double-check with API role and redirect if mismatch
                if (fetchedRole === "Owner" && role !== "Owner") {
                    navigate("/Owner/profile", { replace: true });
                    return;
                }
                if (fetchedRole !== "Owner" && role === "Owner") {
                    navigate("/dashboard", { replace: true });
                    return;
                }
                setRoleLoading(false);
            });
        } else {
            navigate("/login")
        }

    }, [auth, navigate, role, Token]);

    // Ensure /dashboard shows Files (via index route in App.jsx)
    // The index route already handles this correctly


    if (RoleLoading)
        return <Loading />


    return <div className='flex justify-start items-center bg-[#f2f0f0] dark:bg-slate-900 transition-colors duration-300'>
        {role !== "Owner" && (
            <div className="sidnav">
                <Sidenav role={role} />
            </div>
        )}
        <div className="min-h-screen w-full overflow-hidden pb-24 md:pb-4 dark:bg-slate-900 transition-colors duration-300">
            <DashboardHeader />
            <Outlet>
            </Outlet>
        </div>
        {role === "User" && (
            <BottomNavigation 
                role={role} 
                isPromoter={isPromoter}
                userData={userData}
            />
        )}
        {role === "Owner" && (
            <BottomNavigation 
                role={role}
            />
        )}
    </div>
}
