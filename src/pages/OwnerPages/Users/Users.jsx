import React, { useRef, useState } from 'react'
import "./Users.scss"
import { useQuery } from 'react-query';
import axios from 'axios';
import { AnimatePresence, motion, useInView } from 'framer-motion';
import { API_URL } from '../../../services/api';
// icons 
import { MdNotificationAdd, MdClose } from "react-icons/md";
import { FaCrown } from "react-icons/fa";
// icons 
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { ToastOptions } from '../../../helpers/ToastOptions';
import { toast } from 'react-toastify';

export default function Users() {
    const animationRef = useRef();
    const animationInView = useInView(animationRef, { once: true });
    const [selectedUser, setSelectedUser] = useState(null);
    const [addform, setaddform] = useState(false)
    const navigate = useNavigate()

    // get Allusers 
    const Allusers = async () => {
        let users = await axios.get(`${API_URL}/user/getAllUsers`)
        return users?.data?.message?.users
    }
    const { data: users } = useQuery("getAllusers", Allusers, {
        cacheTime: 300000,
        onError: () => {
            navigate("/login")
        }
    })

    // Notification for single user
    const handleNotifyUser = (user) => {
        setSelectedUser(user);
    }

    const closeNotificationPopup = () => {
        setSelectedUser(null);
    }

    const sendUserNotification = async (values) => {

        try {
            const res = await axios.post(`${API_URL}/user/sendnotification`, {
                _id: selectedUser.id,
                title: values.title,
                body: values.body
            });
            notificationFormik.resetForm()
            toast.success(`Notification sent to ${selectedUser.username}`, ToastOptions("success"));
            closeNotificationPopup();
        } catch (err) {
            toast.error("Failed to send notification", ToastOptions("error"));
        }
    };

    const notificationValidation = Yup.object({
        title: Yup.string().required("Title is required"),
        body: Yup.string().required("Message is required"),
    })

    const notificationFormik = useFormik({
        initialValues: {
            title: '',
            body: '',
        },
        validationSchema: notificationValidation,
        onSubmit: sendUserNotification
    })

    // Rest of your existing code for notifyAll...
    const notfiyAll = async (values) => {
        await axios.post(`${API_URL}/user/notifyall`, { ...values })
            .then((res) => {
                setaddform(!addform)
                formik.resetForm()
                toast.success(`${res?.data.message}`, ToastOptions("success"))
            }).catch((err) => {
                toast.error(`${err?.data.message}`, ToastOptions("error"))
            })
    }
    const Validation = Yup.object({
        title: Yup.string().required("title is required"),
        body: Yup.string().required("body is required"),
    })

    const formik = useFormik({
        initialValues: {
            title: '',
            body: '',
        },
        validationSchema: Validation,
        onSubmit: notfiyAll
    })

    const handleaddmod = () => {
        setaddform(!addform)
    }

    // animation
    const animationVariants = {
        hidden: { opacity: 0, height: 0 },
        visible: { opacity: 1, height: "max-content" },
        exit: { opacity: 0, height: 0 }
    };

    return (
        <>
            <div className="add">
                <button onClick={handleaddmod}>
                    {addform ? "Close Notify all" : "Notify all"}
                </button>
            </div>

            {addform && (
                <AnimatePresence>
                    <motion.div key="addteacher" layout className="addmoderator"
                        variants={animationVariants} initial="hidden" animate="visible" exit="exit">
                        <div className="addbody-for-lec">
                            <form onSubmit={formik.handleSubmit} className="mx-auto justify-between items-center">
                                <div className="mb-5 studentfield">
                                    <label htmlFor="Title" className="block mb-2 text-sm font-medium text-gray-900">Title</label>
                                    <input type="text" id="Title" name="title" value={formik.values.title}
                                        onBlur={formik.handleBlur} onChange={formik.handleChange}
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-[#01677e] focus:border-[#01677e] block w-full p-2.5 "
                                        placeholder="Important" />
                                    {formik.touched.title && formik.errors.title && (
                                        <p className="text-red-500 text-sm">{formik.errors.title}</p>
                                    )}
                                </div>
                                <div className="mb-5 studentfield">
                                    <label htmlFor="body" className="block mb-2 text-sm font-medium text-gray-900">Message</label>
                                    <textarea
                                        id="notification-body"
                                        name="body"
                                        rows={4}
                                        value={formik.values.body}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-[#01677e] focus:border-[#01677e] block w-full p-2.5"
                                        placeholder="Write your notification message here..."
                                    ></textarea>

                                    {formik.touched.body && formik.errors.body && (
                                        <p className="text-red-500 text-sm">{formik.errors.body}</p>
                                    )}
                                </div>
                                <button type="submit" className="text-white focus:ring-blue-300 font-medium px-5 py-2.5 text-center">Notify All</button>
                            </form>
                        </div>
                    </motion.div>
                </AnimatePresence>
            )}

            {/* Notification Popup for Single User */}
            <AnimatePresence>
                {selectedUser && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                            className="bg-white rounded-lg shadow-xl w-full max-w-md"
                        >
                            <div className="flex justify-between items-center border-b p-4">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Send Notification to {selectedUser.username}
                                </h3>
                                <button
                                    onClick={closeNotificationPopup}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <MdClose size={24} />
                                </button>
                            </div>

                            <form onSubmit={notificationFormik.handleSubmit} className="p-4">
                                <div className="mb-4">
                                    <label htmlFor="notification-title" className="block mb-2 text-sm font-medium text-gray-900">
                                        Title
                                    </label>
                                    <input
                                        type="text"
                                        id="notification-title"
                                        name="title"
                                        value={notificationFormik.values.title}
                                        onChange={notificationFormik.handleChange}
                                        onBlur={notificationFormik.handleBlur}
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-[#01677e] focus:border-[#01677e] block w-full p-2.5"
                                        placeholder="Notification title"
                                    />
                                    {notificationFormik.touched.title && notificationFormik.errors.title && (
                                        <p className="mt-1 text-sm text-red-600">{notificationFormik.errors.title}</p>
                                    )}
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="notification-body" className="block mb-2 text-sm font-medium text-gray-900">
                                        Message
                                    </label>
                                    <textarea
                                        id="notification-body"
                                        name="body"
                                        rows={4}
                                        value={notificationFormik.values.body}
                                        onChange={notificationFormik.handleChange}
                                        onBlur={notificationFormik.handleBlur}
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-[#01677e] focus:border-[#01677e] block w-full p-2.5"
                                        placeholder="Write your notification message here..."
                                    ></textarea>
                                    {notificationFormik.touched.body && notificationFormik.errors.body && (
                                        <p className="mt-1 text-sm text-red-600">{notificationFormik.errors.body}</p>
                                    )}
                                </div>

                                <div className="flex justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={closeNotificationPopup}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 text-sm font-medium text-white bg-[#01677e] rounded-lg hover:bg-[#01566a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#01677e]"
                                    >
                                        Send Notification
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <motion.div
                layout
                ref={animationRef}
                initial={{ opacity: 0 }}
                animate={animationInView && { opacity: 1 }}
                transition={{ duration: 0.5 }}
                className='main-Orders'
            >
                <div className="overflow-x-auto shadow-md sm:rounded-lg">
                    <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 ">userId</th>
                                <th scope="col" className="px-6 py-3">username</th>
                                <th scope="col" className="px-6 py-3">email</th>
                                <th scope="col" className="px-6 py-3">Premium status</th>
                                <th scope="col" className="px-6 py-3">actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users?.map((ele, index) => {
                                return (
                                    <tr key={index} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{ele?.userId}</td>
                                        <td className="px-6 py-4">{ele.username}</td>
                                        <td className="px-6 py-4">{ele.email}</td>
                                        <td className="px-6 py-4">
                                            {ele.isBrimume ? (
                                                <div className='flex items-center gap-3'>Premium <FaCrown className='primcrown' /></div>
                                            ) : (
                                                <div>Not Premium</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 svg-del">
                                            <button
                                                onClick={() => handleNotifyUser(ele)}
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                <MdNotificationAdd size={20} />
                                            </button>
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