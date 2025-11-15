import React, { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import Sidenav from '../components/Sidenav/Sidenav'
import { useAuth } from '../context/AuthContext'
import { useCookies } from 'react-cookie';
import { jwtDecode } from "jwt-decode";
import Loading from '../components/Loading/Loading';


export default function DashboardLayout({ role }) {

    const auth = useAuth();
    const [Token] = useCookies(['MegaBox']);

    const [RoleLoading, setRoleLoading] = useState(true)

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

    useEffect(() => {
        if (!auth) {
            navigate("/login");
            return;
        }

        if (idTracker() && auth.getUserRole) {
            auth.getUserRole(idTracker());
            setRoleLoading(false)
        } else {
            navigate("/login")
        }

    }, [auth, navigate]);


    if (RoleLoading)
        return <Loading />


    return <div className='flex justify-start items-center bg-[#f2f0f0]'>
        <div className="sidnav">
            <Sidenav role={role} />
        </div>
        <div className="min-h-screen w-full overflow-hidden">
            <Outlet>
            </Outlet>
        </div>
    </div>
}
