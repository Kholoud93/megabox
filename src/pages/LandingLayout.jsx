import React from 'react'
import Navbar from '../components/Navbar/Navbar'
import { Outlet } from 'react-router-dom'

export default function LandingLayout() {
    return <div className="w-full min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300">
        <Navbar />
        <Outlet />
    </div>
}
