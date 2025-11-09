import React from 'react'
import Navbar from '../components/Navbar/Navbar'
import { Outlet } from 'react-router-dom'

export default function LandingLayout() {
    return <div className="w-full h-screen bg-light">
        <Navbar />
        <Outlet />
    </div>
}
