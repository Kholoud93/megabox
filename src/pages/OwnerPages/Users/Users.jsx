import React, { useRef, useState, useMemo, useEffect } from 'react'
import "./Users.scss"
import { useQuery } from 'react-query';
import axios from 'axios';
import { AnimatePresence, motion, useInView } from 'framer-motion';
import { API_URL, adminService } from '../../../services/api';
import { useCookies } from 'react-cookie';
import { useQueryClient } from 'react-query';
// icons 
import { MdNotificationAdd, MdClose, MdSearch } from "react-icons/md";
import { FaCrown, FaBan } from "react-icons/fa";
import { HiTrash } from "react-icons/hi2";
// icons 
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { ToastOptions } from '../../../helpers/ToastOptions';
import { toast } from 'react-toastify';
import { useLanguage } from '../../../context/LanguageContext';
import SearchFilter from '../../../components/SearchFilter/SearchFilter';
import NotificationModal from '../../../components/NotificationModal/NotificationModal';

export default function Users() {
    const { t } = useLanguage();
    const animationRef = useRef();
    const animationInView = useInView(animationRef, { once: true });
    const [selectedUser, setSelectedUser] = useState(null);
    const [addform, setaddform] = useState(false)
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({});
    const [premiumModal, setPremiumModal] = useState(null);
    const [searchUserModal, setSearchUserModal] = useState(false);
    const [searchedUser, setSearchedUser] = useState(null);
    const [searchingUser, setSearchingUser] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
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
                closeNotifyAllModal()
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
        setaddform(true)
    }

    const closeNotifyAllModal = () => {
        setaddform(false)
        formik.resetForm()
    }

    // Toggle user ban
    const handleToggleBan = async (userId) => {
        try {
            // Get current user data to determine new ban status
            const currentUsers = queryClient.getQueryData("getAllusers");
            const currentUser = currentUsers?.find(user => (user.id === userId || user._id === userId));
            const newBanStatus = !currentUser?.isBanned;
            
            // Optimistically update the UI
            queryClient.setQueryData("getAllusers", (oldData) => {
                if (!oldData) return oldData;
                return oldData.map(user => {
                    if ((user.id === userId || user._id === userId)) {
                        return { ...user, isBanned: newBanStatus };
                    }
                    return user;
                });
            });
            
            await adminService.toggleUserBanByOwner(userId, Token.MegaBox, newBanStatus);
            // Show success message with translation
            toast.success(
                newBanStatus ? t("adminUsers.userBannedSuccess") : t("adminUsers.userUnbannedSuccess"),
                ToastOptions("success")
            );
            // Only invalidate, don't refetch immediately to keep optimistic update
            queryClient.invalidateQueries("getAllusers", { refetchActive: false, refetchInactive: false });
        } catch (error) {
            // Revert optimistic update on error
            queryClient.invalidateQueries("getAllusers");
            queryClient.refetchQueries("getAllusers");
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

    // Search user by email or ID
    const handleSearchUser = async (searchValue) => {
        if (!searchValue.trim()) {
            toast.error(t("adminUsers.searchRequired"), ToastOptions("error"));
            return;
        }
        setSearchingUser(true);
        try {
            const result = await adminService.searchUser(searchValue.trim(), Token.MegaBox);
            setSearchedUser(result.user || result);
            setSearchUserModal(true);
        } catch (error) {
            setSearchedUser(null);
        } finally {
            setSearchingUser(false);
        }
    }

    // Toggle user premium
    const handleTogglePremium = async (userId) => {
        try {
            await adminService.toggleUserPremium(userId, Token.MegaBox);
            queryClient.invalidateQueries("getAllusers");
            if (searchedUser && (searchedUser._id === userId || searchedUser.id === userId)) {
                setSearchedUser(prev => ({ ...prev, isBrimume: !prev.isBrimume }));
            }
        } catch (error) {
            // Error is handled in the service
        }
    }

    // Set user premium with expiration date
    const handleSetPremium = async (userId, expirationDate) => {
        try {
            await adminService.setUserPremium(userId, expirationDate, Token.MegaBox);
            queryClient.invalidateQueries("getAllusers");
            setPremiumModal(null);
            if (searchedUser && (searchedUser._id === userId || searchedUser.id === userId)) {
                setSearchedUser(prev => ({ ...prev, isBrimume: true, premiumExpiration: expirationDate }));
            }
        } catch (error) {
            // Error is handled in the service
        }
    }

    // Premium form validation
    const premiumValidation = Yup.object({
        expirationDate: Yup.date()
            .min(new Date(), t("adminUsers.expirationDateMustBeFuture"))
            .required(t("adminUsers.expirationDateRequired"))
    });

    const premiumFormik = useFormik({
        initialValues: {
            expirationDate: ''
        },
        validationSchema: premiumValidation,
        onSubmit: (values) => {
            const userId = premiumModal?.id || premiumModal?._id;
            if (userId) {
                handleSetPremium(userId, values.expirationDate);
            }
        }
    });

    // Filter users based on search and filters
    const filteredUsers = useMemo(() => {
        if (!users) return [];

        return users.filter((user) => {
            // Search filter
            if (searchTerm) {
                const searchLower = searchTerm.toLowerCase();
                const searchableText = `${user.username || ''} ${user.email || ''} ${user.userId || ''}`.toLowerCase();
                if (!searchableText.includes(searchLower)) {
                    return false;
                }
            }

            // Premium status filter
            if (filters.premiumStatus !== undefined) {
                if (filters.premiumStatus === 'premium' && !user.isBrimume) {
                    return false;
                }
                if (filters.premiumStatus === 'notPremium' && user.isBrimume) {
                    return false;
                }
            }

            // Ban status filter
            if (filters.banStatus !== undefined) {
                if (filters.banStatus === 'banned' && !user.isBanned) {
                    return false;
                }
                if (filters.banStatus === 'active' && user.isBanned) {
                    return false;
                }
            }

            return true;
        });
    }, [users, searchTerm, filters]);

    // Pagination logic
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    // Reset to page 1 when filters change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filters]);

    // Filter configuration
    const filterConfig = [
        {
            key: 'premiumStatus',
            label: t('adminUsers.premiumStatus'),
            allLabel: t('searchFilter.all'),
            options: [
                { value: 'premium', label: t('adminUsers.premium') },
                { value: 'notPremium', label: t('adminUsers.notPremium') }
            ]
        },
        {
            key: 'banStatus',
            label: t('adminUsers.status'),
            allLabel: t('searchFilter.all'),
            options: [
                { value: 'active', label: t('adminUsers.active') },
                { value: 'banned', label: t('adminUsers.banned') }
            ]
        }
    ];

    // animation
    const animationVariants = {
        hidden: { opacity: 0, height: 0 },
        visible: { opacity: 1, height: "max-content" },
        exit: { opacity: 0, height: 0 }
    };

    return (
        <div className="admin-users-page">
            <div className="admin-users-page__wrapper">

            {/* Notify All Modal */}
            <NotificationModal
                isOpen={addform}
                onClose={closeNotifyAllModal}
                onSubmit={formik.handleSubmit}
                formik={formik}
                title={t("adminUsers.notifyAll")}
                submitButtonText={t("adminUsers.notifyAll")}
            />

            {/* Notification Popup for Single User */}
            <NotificationModal
                isOpen={!!selectedUser}
                onClose={closeNotificationPopup}
                onSubmit={notificationFormik.handleSubmit}
                formik={notificationFormik}
                title={t("adminUsers.sendNotificationTo")}
                submitButtonText={t("adminUsers.sendNotification")}
                showUsername={true}
                username={selectedUser?.username || ''}
            />

            <motion.div
                layout
                ref={animationRef}
                initial={{ opacity: 0 }}
                animate={animationInView && { opacity: 1 }}
                transition={{ duration: 0.5 }}
                className='main-Orders'
            >
                <div className="mb-4">
                    <div className="admin-users-header">
                        <div className="admin-users-header__search">
                            <SearchFilter
                                searchPlaceholder={t('adminUsers.searchUsers')}
                                filters={filterConfig}
                                onSearchChange={setSearchTerm}
                                onFilterChange={setFilters}
                            />
                        </div>
                        <button 
                            onClick={handleaddmod}
                            className="admin-users-header__notify-btn"
                        >
                            {t("adminUsers.notifyAll")}
                        </button>
                    </div>
                    {users && (
                        <p className="admin-users-count text-sm text-gray-600 mt-2">
                            {paginatedUsers.length > 0 ? (
                                <>
                                    {startIndex + 1}-{Math.min(endIndex, filteredUsers.length)} {t('adminUsers.of')} {filteredUsers.length} {t('adminUsers.users')}
                                </>
                            ) : (
                                <>
                                    0 {t('adminUsers.of')} {filteredUsers.length} {t('adminUsers.users')}
                                </>
                            )}
                        </p>
                    )}
                </div>

                <div className="overflow-x-auto shadow-md sm:rounded-lg">
                    <table className="admin-users-table">
                        <thead className="admin-users-table__header">
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
                            {paginatedUsers.length > 0 ? (
                                paginatedUsers.map((ele, index) => {
                                    return (
                                        <tr key={ele.id || ele._id || index} className="bg-white border-b hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap" data-label={t("adminUsers.userId")}>{ele?.userId}</td>
                                            <td className="px-6 py-4" data-label={t("adminUsers.username")}>{ele.username}</td>
                                            <td className="px-6 py-4" data-label={t("adminUsers.email")}>{ele.email}</td>
                                            <td className="px-6 py-4" data-label={t("adminUsers.premiumStatus")}>
                                                {ele.isBrimume ? (
                                                    <div className='flex items-center gap-3'>{t("adminUsers.premium")} <FaCrown className='primcrown' /></div>
                                                ) : (
                                                    <div>{t("adminUsers.notPremium")}</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4" data-label={t("adminUsers.status")}>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${ele.isBanned ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                                    }`}>
                                                    {ele.isBanned ? t("adminUsers.banned") : t("adminUsers.active")}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4" data-label={t("adminUsers.actions")}>
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => handleNotifyUser(ele)}
                                                        className="text-indigo-600 hover:text-indigo-800 transition-colors"
                                                        title={t("adminUsers.sendNotification")}
                                                    >
                                                        <MdNotificationAdd size={20} />
                                                    </button>
                                                    <button
                                                        onClick={() => setPremiumModal(ele)}
                                                        className={`transition-colors ${ele.isBrimume ? 'text-yellow-600 hover:text-yellow-800' : 'text-purple-600 hover:text-purple-800'}`}
                                                        title={ele.isBrimume ? t("adminUsers.removePremium") : t("adminUsers.makePremium")}
                                                    >
                                                        <FaCrown size={20} />
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
                                })) : (
                                <tr>
                                    <td colSpan="6" className="text-center py-8 text-gray-500">
                                        {t('adminUsers.noUsersFound')}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="admin-users-pagination">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="admin-users-pagination__btn admin-users-pagination__btn--prev"
                        >
                            {t("adminUsers.prev")}
                        </button>
                        <div className="admin-users-pagination__info">
                            {t("adminUsers.page")} {currentPage} {t("adminUsers.of")} {totalPages}
                        </div>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="admin-users-pagination__btn admin-users-pagination__btn--next"
                        >
                            {t("adminUsers.next")}
                        </button>
                    </div>
                )}
            </motion.div>

            {/* Search User Modal */}
            <AnimatePresence>
                {searchUserModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
                        >
                            <div className="flex justify-between items-center border-b pb-4 mb-4">
                                <h3 className="text-xl font-bold text-gray-900">{t("adminUsers.searchUser")}</h3>
                                <button
                                    onClick={() => {
                                        setSearchUserModal(false);
                                        setSearchedUser(null);
                                    }}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <MdClose size={24} />
                                </button>
                            </div>
                            <div className="mb-4">
                                <label className="block mb-2 text-sm font-medium text-gray-900">
                                    {t("adminUsers.searchByEmailOrId")}
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        id="user-search"
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-600 focus:border-indigo-600 block w-full p-2.5"
                                        placeholder={t("adminUsers.enterEmailOrId")}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                handleSearchUser(e.target.value);
                                            }
                                        }}
                                    />
                                    <button
                                        onClick={() => {
                                            const input = document.getElementById('user-search');
                                            handleSearchUser(input.value);
                                        }}
                                        disabled={searchingUser}
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                                    >
                                        {searchingUser ? t("adminUsers.searching") : t("adminUsers.search")}
                                    </button>
                                </div>
                            </div>
                            {searchedUser && (
                                <div className="border-t pt-4">
                                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="font-semibold text-gray-900">{searchedUser.username}</p>
                                                <p className="text-sm text-gray-600">{searchedUser.email}</p>
                                                <p className="text-xs text-gray-500 mt-1">ID: {searchedUser._id || searchedUser.id || searchedUser.userId}</p>
                                            </div>
                                            <div className="text-right">
                                                {searchedUser.isBrimume ? (
                                                    <div className="flex items-center gap-2 text-yellow-600">
                                                        <FaCrown />
                                                        <span className="text-sm font-medium">{t("adminUsers.premium")}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-600">{t("adminUsers.notPremium")}</span>
                                                )}
                                            </div>
                                        </div>
                                        {searchedUser.isBrimume && searchedUser.premiumExpiration && (
                                            <div className="mt-2 pt-2 border-t border-gray-200">
                                                <p className="text-xs text-gray-600">
                                                    {t("adminUsers.premiumExpires")}: {new Date(searchedUser.premiumExpiration).toLocaleDateString()}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                setPremiumModal(searchedUser);
                                                setSearchUserModal(false);
                                            }}
                                            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                        >
                                            {searchedUser.isBrimume ? t("adminUsers.updatePremium") : t("adminUsers.makePremium")}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSearchUserModal(false);
                                                setSearchedUser(null);
                                            }}
                                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                                        >
                                            {t("adminUsers.close")}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Premium Modal */}
            <AnimatePresence>
                {premiumModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
                        >
                            <div className="flex justify-between items-center border-b pb-4 mb-4">
                                <h3 className="text-xl font-bold text-gray-900">
                                    {premiumModal.isBrimume ? t("adminUsers.removePremium") : t("adminUsers.makePremium")}
                                </h3>
                                <button
                                    onClick={() => {
                                        setPremiumModal(null);
                                        premiumFormik.resetForm();
                                    }}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <MdClose size={24} />
                                </button>
                            </div>
                            <div className="mb-4">
                                <p className="text-gray-600 mb-4">
                                    {t("adminUsers.user")}: <strong>{premiumModal.username}</strong> ({premiumModal.email})
                                </p>
                                {premiumModal.isBrimume && premiumModal.premiumExpiration && (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                                        <p className="text-sm text-yellow-800">
                                            {t("adminUsers.currentPremiumExpires")}: <strong>{new Date(premiumModal.premiumExpiration).toLocaleDateString()}</strong>
                                        </p>
                                    </div>
                                )}
                            </div>
                            {premiumModal.isBrimume ? (
                                <div>
                                    <p className="text-gray-600 mb-4">{t("adminUsers.removePremiumConfirm")}</p>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => {
                                                setPremiumModal(null);
                                                premiumFormik.resetForm();
                                            }}
                                            className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                                        >
                                            {t("adminUsers.cancel")}
                                        </button>
                                        <button
                                            onClick={() => handleTogglePremium(premiumModal.id || premiumModal._id)}
                                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                        >
                                            {t("adminUsers.removePremium")}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={premiumFormik.handleSubmit}>
                                    <div className="mb-4">
                                        <label htmlFor="expirationDate" className="block mb-2 text-sm font-medium text-gray-900">
                                            {t("adminUsers.premiumExpirationDate")}
                                        </label>
                                        <input
                                            type="datetime-local"
                                            id="expirationDate"
                                            name="expirationDate"
                                            value={premiumFormik.values.expirationDate}
                                            onChange={premiumFormik.handleChange}
                                            onBlur={premiumFormik.handleBlur}
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-600 focus:border-indigo-600 block w-full p-2.5"
                                        />
                                        {premiumFormik.touched.expirationDate && premiumFormik.errors.expirationDate && (
                                            <p className="mt-1 text-sm text-red-600">{premiumFormik.errors.expirationDate}</p>
                                        )}
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setPremiumModal(null);
                                                premiumFormik.resetForm();
                                            }}
                                            className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                                        >
                                            {t("adminUsers.cancel")}
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                        >
                                            {t("adminUsers.makePremium")}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

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
            </div>
        </div>
    )
}