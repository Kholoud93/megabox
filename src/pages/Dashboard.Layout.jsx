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
    const location = useLocation();

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

    const navigate = useNavigate();

    useEffect(() => {
        const idTracker = () => {
            let id;

            if (Token.MegaBox) {
                id = jwtDecode(Token.MegaBox).id;
                return id
            } else {
                return false
            }
        }

        if (!auth) {
            navigate("/login");
            return;
        }

        if (idTracker() && auth.getUserRole) {
            let tokenRole = null;
            try {
                const decoded = jwtDecode(Token.MegaBox);
                tokenRole = decoded?.role;
            } catch (error) {
                console.error('Error decoding token:', error);
                setRoleLoading(false);
                return;
            }

            // Use token role as primary source of truth
            // Token role is more reliable than API call which might have delays or inconsistencies
            
            // Check if user is Owner trying to access non-Owner routes
            if (tokenRole === "Owner" && role !== "Owner") {
                // Only redirect if not already on an Owner route
                if (!location.pathname.startsWith("/Owner")) {
                    navigate("/Owner/profile", { replace: true });
                    return;
                }
            }

            // Check if non-Owner is trying to access Owner routes
            if (tokenRole !== "Owner" && role === "Owner") {
                // Only redirect if currently on Owner route
                if (location.pathname.startsWith("/Owner")) {
                    // Redirect to appropriate route based on token role
                    if (tokenRole === "User") {
                        navigate("/dashboard", { replace: true });
                    } else {
                        navigate("/login", { replace: true });
                    }
                    return;
                }
            }

            // If token role matches the route role, allow access and stop loading
            if ((tokenRole === "Owner" && role === "Owner") || 
                (tokenRole !== "Owner" && role !== "Owner")) {
                setRoleLoading(false);
                return;
            }

            // Only use API role as a secondary check if token role is unclear
            auth.getUserRole(idTracker()).then(fetchedRole => {
                // Only redirect if API role differs from token role AND there's a mismatch with current route
                if (fetchedRole === "Owner" && tokenRole !== "Owner" && role !== "Owner") {
                    // API says Owner but token says non-Owner - trust token, don't redirect
                    setRoleLoading(false);
                    return;
                }
                
                if (fetchedRole !== "Owner" && tokenRole === "Owner" && role === "Owner") {
                    // API says non-Owner but token says Owner - trust token, don't redirect
                    setRoleLoading(false);
                    return;
                }
                
                // If both token and API agree, proceed with normal checks
                if (fetchedRole === "Owner" && role !== "Owner" && !location.pathname.startsWith("/Owner")) {
                    navigate("/Owner/profile", { replace: true });
                    return;
                }
                
                if (fetchedRole !== "Owner" && role === "Owner" && location.pathname.startsWith("/Owner")) {
                    navigate("/dashboard", { replace: true });
                    return;
                }
                
                setRoleLoading(false);
            }).catch(() => {
                // If API call fails, trust token role and allow access
                setRoleLoading(false);
            });
        } else {
            navigate("/login")
        }

    }, [auth, navigate, role, Token, location.pathname]);

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
