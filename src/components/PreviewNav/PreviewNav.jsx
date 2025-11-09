import React from 'react'
import './PreviewNav.scss'
import { Link } from 'react-router-dom'

export default function PreviewNav() {
    return (
        <nav className="PreviewNav">


            <ul className="nav-list">

                <Link to="/" className="font-bold Logo">
                    MegaBox
                </Link>

                <div className="flex gap-3">
                    <li className="login-link"><Link to="/">Home</Link></li>
                    <li className="login-link"><Link to="/login">Login</Link></li>
                </div>

            </ul>
        </nav>
    )
}
