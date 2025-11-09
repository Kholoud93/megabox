import React, { useState } from 'react'
import './Sidenave.scss'
import { RiCloseCircleLine } from "react-icons/ri";
import { RiLogoutBoxLine } from "react-icons/ri";
import { FaBars } from "react-icons/fa";
// import { LuFiles } from "react-icons/lu";
// import { ImUpload } from "react-icons/im";
import { ImProfile } from "react-icons/im";
import { VscFileSubmodule } from "react-icons/vsc";
import { LuChartSpline } from "react-icons/lu";
import { FaUsers } from "react-icons/fa";
import logo from '../../assets/How_it_works/WhatsApp_Image_2025-05-23_at_17.08.42_4b820e50-removebg-preview.png'
// import { AiFillHome } from "react-icons/ai";

// icons 
// import logo from '../../Assets/logo2.png'
import { Sidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { useAuth } from '../../context/AuthContext';
import { FaPersonBreastfeeding } from "react-icons/fa6";
import { MdReport } from "react-icons/md";
import { FaHandshake } from "react-icons/fa";

export default function Sidenav({ role }) {
    const [collapsed, setcollapsed] = useState(false)
    const [Hide, setHide] = useState(false);
    const { pathname } = useLocation();
    const navigate = useNavigate()
    const { setUserRole } = useAuth();

    const [, , removeToken] = useCookies(['MegaBox']);

    const Logout = () => {
        removeToken("MegaBox", {
            path: '/',
        })
        setUserRole(null)
        navigate('/Login')
    }



    const handleHide = () => {
        setHide(!Hide)
    }
    const handleICon = () => {
        setcollapsed(!collapsed)
    }

    return <>
        <div className={Hide ? "dropback apper-dropback" : "dropback"} onClick={handleHide}>
        </div>
        <aside className={Hide ? 'allnav' : 'allnav apper'} >
            <Sidebar collapsed={collapsed}>
                <Menu className='main-menu'>

                    <Menu className={collapsed ? 'collapsed main-side overflow-y-auto min-h-screen' :
                        'main-side p-1 overflow-y-auto min-h-screen'}>

                        <MenuItem
                            className="mb-10 rounded-3xl text-3xl mt-8 text-white cursor-pointer close"
                            onClick={handleICon}
                            icon={collapsed ? <FaBars /> : <RiCloseCircleLine />}
                            component={<span className='Remove_hover'></span>}
                        ></MenuItem>

                        <Link to={'/'} className='flex justify-center items-center my-9' style={{ display: "flex", justifyContent: "center" }}>
                            <img src={logo} loading='lazy' alt="Logo" className={collapsed ? 'Logo-colaps' : 'Logo'} />
                        </Link>



                        {role === "User" ? (<div>
                            <div className="flex justify-between flex-col mb-2">
                                <div className="Links">
                                    <MenuItem onClick={handleHide} className={pathname === "/dashboard/profile" ? 'menu-items  Active' : 'menu-items'} component={<Link to='/dashboard/profile' className='Remove_hover transition ease-linear'></Link>}
                                        icon={<ImProfile className={pathname === "/dashboard/profile" ? 'icon transition ease-linear Active' : 'icon transition ease-linear'} />}>
                                        Profile
                                    </MenuItem>
                                </div>
                            </div>

                            <div className="flex justify-between flex-col mb-2">
                                <div className="Links">
                                    <MenuItem onClick={handleHide} className={pathname === "/dashboard" ? 'menu-items  Active' : 'menu-items'} component={<Link to='/dashboard' className='Remove_hover transition ease-linear'></Link>}
                                        icon={<VscFileSubmodule className={pathname === "/dashboard" ? 'icon transition ease-linear Active' : 'icon transition ease-linear'} />}>
                                        All Files
                                    </MenuItem>
                                </div>
                            </div>
                            <div className="flex justify-between flex-col mb-2">
                                <div className="Links">
                                    <MenuItem onClick={handleHide} className={pathname === "/dashboard/Earnings" ? 'menu-items  Active' : 'menu-items'} component={<Link to='/dashboard/Earnings' className='Remove_hover transition ease-linear'></Link>}
                                        icon={<VscFileSubmodule className={pathname === "/dashboard/Earnings" ? 'icon transition ease-linear Active' : 'icon transition ease-linear'} />}>
                                        Your shared files
                                    </MenuItem>
                                </div>
                            </div>

                            <div className="flex justify-between flex-col mb-2">
                                <div className="Links">
                                    <MenuItem onClick={handleHide} className={pathname === "/Partners" ? 'menu-items  Active' : 'menu-items'} component={<Link to='/Partners' className='Remove_hover transition ease-linear'></Link>}
                                        icon={<FaHandshake className={pathname === "/Partners" ? 'icon transition ease-linear Active' : 'icon transition ease-linear'} />}>
                                        Partners
                                    </MenuItem>
                                </div>
                            </div>

                        </div>) : role === "Owner" ? (
                            <div className="flex justify-between flex-col mb-2">
                                <div className="Links">
                                    <MenuItem onClick={handleHide} className={pathname === "/Owner/Reports" ? 'menu-items  Active' : 'menu-items'} component={<Link to='Reports' className='Remove_hover transition ease-linear'></Link>}
                                        icon={<MdReport className={pathname === "Reports" ? 'icon transition ease-linear Active' : 'icon transition ease-linear'} />}>
                                        Reports
                                    </MenuItem>
                                </div>

                                <div className="Links">
                                    <MenuItem onClick={handleHide} className={pathname === "/Owner/Users" ? 'menu-items  Active' : 'menu-items'} component={<Link to='/Owner/Users' className='Remove_hover transition ease-linear'></Link>}
                                        icon={<FaUsers className={pathname === "/Owner/Users" ? 'icon transition ease-linear Active' : 'icon transition ease-linear'} />}>
                                        Users
                                    </MenuItem>
                                </div>

                                <div className="Links">
                                    <MenuItem onClick={handleHide} className={pathname === "/Owner/AllPromoters" ? 'menu-items  Active' : 'menu-items'} component={<Link to='/Owner/AllPromoters' className='Remove_hover transition ease-linear'></Link>}
                                        icon={<FaPersonBreastfeeding className={pathname === "/Owner/AllPromoters" ? 'icon transition ease-linear Active' : 'icon transition ease-linear'} />}>
                                        Promoters
                                    </MenuItem>
                                </div>

                                <div className="Links">
                                    <MenuItem onClick={handleHide} className={pathname === "/Owner/profile" ? 'menu-items  Active' : 'menu-items'} component={<Link to='/Owner/profile' className='Remove_hover transition ease-linear'></Link>}
                                        icon={<ImProfile className={pathname === "/Owner/profile" ? 'icon transition ease-linear Active' : 'icon transition ease-linear'} />}>
                                        Profile
                                    </MenuItem>
                                </div>

                                <div className="Links">
                                    <MenuItem onClick={handleHide} className={pathname === "/Partners" ? 'menu-items  Active' : 'menu-items'} component={<Link to='/Partners' className='Remove_hover transition ease-linear'></Link>}
                                        icon={<FaHandshake className={pathname === "/Partners" ? 'icon transition ease-linear Active' : 'icon transition ease-linear'} />}>
                                        Partners
                                    </MenuItem>
                                </div>

                            </div>
                        ) : role === "Advertiser" ? (
                            <div className="flex justify-between flex-col mb-2">
                                <div className="Links">
                                    <MenuItem onClick={handleHide} className={pathname === "/dashboard/profile" ? 'menu-items  Active' : 'menu-items'} component={<Link to='/dashboard/profile' className='Remove_hover transition ease-linear'></Link>}
                                        icon={<ImProfile className={pathname === "/dashboard/profile" ? 'icon transition ease-linear Active' : 'icon transition ease-linear'} />}>
                                        Profile
                                    </MenuItem>
                                </div>
                                <div className="Links">
                                    <MenuItem onClick={handleHide} className={pathname === "/dashboard/profile" ? 'menu-items  Active' : 'menu-items'} component={<Link to='/dashboard/profile' className='Remove_hover transition ease-linear'></Link>}
                                        icon={<ImProfile className={pathname === "/dashboard/profile" ? 'icon transition ease-linear Active' : 'icon transition ease-linear'} />}>
                                        Profile
                                    </MenuItem>
                                </div>
                                <div className="Links">
                                    <MenuItem onClick={handleHide} className={pathname === "/Partners" ? 'menu-items  Active' : 'menu-items'} component={<Link to='/Partners' className='Remove_hover transition ease-linear'></Link>}
                                        icon={<FaHandshake className={pathname === "/Partners" ? 'icon transition ease-linear Active' : 'icon transition ease-linear'} />}>
                                        Partners
                                    </MenuItem>
                                </div>
                            </div>
                        ) : null}







                        <MenuItem MenuItem
                            className="rounded-3xl text-lg text-white
                        font-semibold Logout absolute bottom-2"
                            icon={<RiLogoutBoxLine />}
                            type={"button"}
                            component={<span className='Remove_hover transition ease-linear'></span>}
                            onClick={Logout}
                        >
                            Log out
                        </MenuItem>
                    </Menu>

                </Menu>
            </Sidebar >
        </aside >

        <span className='bars' onClick={handleHide}>
            {Hide ? <RiCloseCircleLine /> : <FaBars />}
        </span>

    </>
}