import React, { useRef, useState } from 'react'
import "./Users.scss"
import { useQuery } from 'react-query';
import axios from 'axios';
import { AnimatePresence, motion, useInView } from 'framer-motion';
import { API_URL, adminService } from '../../../services/api';
import { useCookies } from 'react-cookie';
import { useQueryClient } from 'react-query';
// icons 
import { MdNotificationAdd, MdClose } from "react-icons/md";
import { FaCrown, FaBan } from "react-icons/fa";
import { HiTrash } from "react-icons/hi2";
// icons 
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { ToastOptions } from '../../../helpers/ToastOptions';
import { toast } from 'react-toastify';
import { useLanguage } from '../../../context/LanguageContext';

export default function Users() {
    const { t } = useLanguage();
    const animationRef = useRef();
    const animationInView = useInView(animationRef, { once: true });
    const [selectedUser, setSelectedUser] = useState(null);
    const [addform, setaddform] = useState(false)
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const navigate = useNavigate()
    const [Token] = useCookies(['MegaBox']);
    const queryClient = useQueryClient();

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
            toast.success(`${t("adminUsers.notificationSent")} ${selectedUser.username}`, ToastOptions("success"));
            closeNotificationPopup();
        } catch (err) {
            toast.error(t("adminUsers.notificationFailed"), ToastOptions("error"));
        }
    };

    const notificationValidation = Yup.object({
        title: Yup.string().required(t("adminUsers.titleRequired")),
        body: Yup.string().required(t("adminUsers.messageRequired")),
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
        title: Yup.string().required(t("adminUsers.titleRequired")),
        body: Yup.string().required(t("adminUsers.messageRequired")),
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

    // Toggle user ban
    const handleToggleBan = async (userId) => {
        try {
            await adminService.toggleUserBanByOwner(userId, Token.MegaBox);
            queryClient.invalidateQueries("getAllusers");
        } catch (error) {
            // Error is handled in the service
        }
    }

    // Delete user
    const handleDeleteUser = async (userId) => {
        try {
            await adminService.deleteUserById(userId, Token.MegaBox);
            queryClient.invalidateQueries("getAllusers");
            setDeleteConfirm(null);
        } catch (error) {
            // Error is handled in the service
        }
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
                    {addform ? t("adminUsers.closeNotifyAll") : t("adminUsers.notifyAll")}
                </button>
            </div>

            {addform && (
                <AnimatePresence>
                    <motion.div key="addteacher" layout className="addmoderator"
                        variants={animationVariants} initial="hidden" animate="visible" exit="exit">
                        <div className="addbody-for-lec">
                            <form onSubmit={formik.handleSubmit} className="mx-auto justify-between items-center">
                                <div className="mb-5 studentfield">
                                    <label htmlFor="Title" className="block mb-2 text-sm font-medium text-gray-900">{t("adminUsers.titleLabel")}</label>
                                    <input type="text" id="Title" name="title" value={formik.values.title}
                                        onBlur={formik.handleBlur} onChange={formik.handleChange}
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-[#01677e] focus:border-[#01677e] block w-full p-2.5 "
                                        placeholder={t("adminUsers.titlePlaceholder")} />
                                    {formik.touched.title && formik.errors.title && (
                                        <p className="text-red-500 text-sm">{formik.errors.title}</p>
                                    )}
                                </div>
                                <div className="mb-5 studentfield">
                                    <label htmlFor="body" className="block mb-2 text-sm font-medium text-gray-900">{t("adminUsers.messageLabel")}</label>
                                    <textarea
                                        id="notification-body"
                                        name="body"
                                        rows={4}
                                        value={formik.values.body}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-[#01677e] focus:border-[#01677e] block w-full p-2.5"
                                        placeholder={t("adminUsers.messagePlaceholder")}
                                    ></textarea>

                                    {formik.touched.body && formik.errors.body && (
                                        <p className="text-red-500 text-sm">{formik.errors.body}</p>
                                    )}
                                </div>
                                <button type="submit" className="text-white focus:ring-blue-300 font-medium px-5 py-2.5 text-center">{t("adminUsers.notifyAll")}</button>
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
                                    {t("adminUsers.sendNotificationTo")} {selectedUser.username}
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
                                        {t("adminUsers.titleLabel")}
                                    </label>
                                    <input
                                        type="text"
                                        id="notification-title"
                                        name="title"
                                        value={notificationFormik.values.title}
                                        onChange={notificationFormik.handleChange}
                                        onBlur={notificationFormik.handleBlur}
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-[#01677e] focus:border-[#01677e] block w-full p-2.5"
                                        placeholder={t("adminUsers.titlePlaceholder")}
                                    />
                                    {notificationFormik.touched.title && notificationFormik.errors.title && (
                                        <p className="mt-1 text-sm text-red-600">{notificationFormik.errors.title}</p>
                                    )}
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="notification-body" className="block mb-2 text-sm font-medium text-gray-900">
                                        {t("adminUsers.messageLabel")}
                                    </label>
                                    <textarea
                                        id="notification-body"
                                        name="body"
                                        rows={4}
                                        value={notificationFormik.values.body}
                                        onChange={notificationFormik.handleChange}
                                        onBlur={notificationFormik.handleBlur}
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-[#01677e] focus:border-[#01677e] block w-full p-2.5"
                                        placeholder={t("adminUsers.messagePlaceholder")}
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
                                        {t("adminUsers.cancel")}
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 text-sm font-medium text-white bg-[#01677e] rounded-lg hover:bg-[#01566a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#01677e]"
                                    >
                                        {t("adminUsers.sendNotification")}
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
                                <th scope="col" className="px-6 py-3 ">{t("adminUsers.userId")}</th>
                                <th scope="col" className="px-6 py-3">{t("adminUsers.username")}</th>
                                <th scope="col" className="px-6 py-3">{t("adminUsers.email")}</th>
                                <th scope="col" className="px-6 py-3">{t("adminUsers.premiumStatus")}</th>
                                <th scope="col" className="px-6 py-3">{t("adminUsers.status")}</th>
                                <th scope="col" className="px-6 py-3">{t("adminUsers.actions")}</th>
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
                                                <div className='flex items-center gap-3'>{t("adminUsers.premium")} <FaCrown className='primcrown' /></div>
                                            ) : (
                                                <div>{t("adminUsers.notPremium")}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${ele.isBanned ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                                }`}>
                                                {ele.isBanned ? t("adminUsers.banned") : t("adminUsers.active")}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => handleNotifyUser(ele)}
                                                    className="text-blue-600 hover:text-blue-800 transition-colors"
                                                    title={t("adminUsers.sendNotification")}
                                                >
                                                    <MdNotificationAdd size={20} />
                                                </button>
                                                <button
                                                    onClick={() => handleToggleBan(ele.id || ele._id)}
                                                    className={`transition-colors ${ele.isBanned ? 'text-green-600 hover:text-green-800' : 'text-orange-600 hover:text-orange-800'
                                                        }`}
                                                    title={ele.isBanned ? t("adminUsers.unbanUser") : t("adminUsers.banUser")}
                                                >
                                                    <FaBan size={20} />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteConfirm(ele)}
                                                    className="text-red-600 hover:text-red-800 transition-colors"
                                                    title={t("adminUsers.deleteUser")}
                                                >
                                                    <HiTrash size={20} />
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

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteConfirm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
                        >
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{t("adminUsers.deleteUserConfirm")}</h3>
                            <p className="text-gray-600 mb-6">
                                {t("adminUsers.deleteUserMessage")} <strong>{deleteConfirm.username}</strong>? {t("adminUsers.deleteUserWarning")}
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    {t("adminUsers.cancel")}
                                </button>
                                <button
                                    onClick={() => handleDeleteUser(deleteConfirm.id || deleteConfirm._id)}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    {t("adminUsers.delete")}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    )
}