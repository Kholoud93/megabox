import React, { useRef, useState } from 'react'
import "./Promoters.scss"
import { useQuery } from 'react-query';
import axios from 'axios';
import { motion, useInView } from 'framer-motion';
import { API_URL } from '../../../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { TbDeviceAnalytics } from "react-icons/tb";
import { MdDelete } from "react-icons/md";
import { MdAttachMoney } from "react-icons/md";

export default function Promoters() {


    const animationRef = useRef();
    const animationInView = useInView(animationRef, { once: true });
    const navigate = useNavigate()

    const AllPromoters = async () => {
        let Promoters = await axios.get(`${API_URL}/auth/getAllPromoters`);


        return Promoters?.data?.promoters;
    }

    const { data: Promoters } = useQuery("getAllPromoters", AllPromoters, {
        cacheTime: 300000,
        onError: () => {
            navigate("/login")
        }
    })


    return (
        <>
            <motion.div
                layout
                ref={animationRef}
                initial={{ opacity: 0 }}
                animate={animationInView && { opacity: 1 }}
                transition={{ duration: 0.5 }}
                className='Promoters'
            >
                <div className="overflow-x-auto shadow-md sm:rounded-lg">
                    <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">username</th>
                                <th scope="col" className="px-6 py-3">email</th>
                                <th scope="col" className="px-6 py-3">Watching Plan</th>
                                <th scope="col" className="px-6 py-3">Downloads Plan</th>
                                <th scope="col" className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Promoters?.map((ele, index) => {
                                return (
                                    <tr key={index} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-4">{ele.username}</td>
                                        <td className="px-6 py-4">{ele.email}</td>

                                        <td className="px-6 py-4">
                                            {ele?.watchingplan ? (
                                                <span className='text-green-700'>subscribed </span>
                                            ) : (
                                                <span className='text-red-700'>Unsubscribed</span>
                                            )}
                                        </td>

                                        <td className="px-6 py-4">
                                            {ele?.Downloadsplan ? (
                                                <span className='text-green-700'>subscribed </span>
                                            ) : (
                                                <span className='text-red-700'>Unsubscribed</span>
                                            )}
                                        </td>

                                        <td className="px-6 py-4 svg-del">
                                            <div className="w-full flex gap-2">
                                                <Link
                                                    title='Money'
                                                    to={`/Owner/Promoter/${ele?._id}`}
                                                    onClick={() => handleNotifyUser(ele)}
                                                    className="text-blue-600 hover:text-blue-800"
                                                >
                                                    <MdAttachMoney className='Analysis' size={20} />
                                                </Link>
                                                <button
                                                    title='Delete'
                                                    onClick={() => handleNotifyUser(ele)}
                                                    className="text-blue-600 hover:text-blue-800"
                                                >
                                                    <MdDelete className='text-red-600 hover:text-red-800' size={20} />
                                                </button>
                                            </div>

                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </>
    )
}