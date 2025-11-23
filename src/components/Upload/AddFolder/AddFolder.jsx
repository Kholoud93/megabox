import React from 'react';
import '../Upload.scss';
import { HiX } from 'react-icons/hi';
import { LuFolderPlus } from 'react-icons/lu';
import { PreventFunction } from '../../../helpers/Prevent';
import { motion } from 'framer-motion';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { PopupButton } from '../../../helpers/SubmitButton';
import axios from 'axios';
import { API_URL, userService } from '../../../services/api';
import { toast } from 'react-toastify';
import { ToastOptions } from '../../../helpers/ToastOptions';
import { useCookies } from 'react-cookie';

export default function AddFolder({ ToggleUploadFile, refetch, parentFolderId = null }) {
    const [cookies] = useCookies(['MegaBox']);

    const Addfolder = async (values) => {
        try {
            await userService.createFolder(values.fileName, parentFolderId, cookies.MegaBox);
            toast.success('Folder added successfully', ToastOptions('success'));
            ToggleUploadFile();
            // Wait for refetch to complete before closing
            if (refetch) {
                await refetch();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Something went wrong. Please try again.', ToastOptions('error'));
        }
    };

    const validationSchema = Yup.object({
        fileName: Yup.string().required('File name is required'),
    });

    const formik = useFormik({
        initialValues: { fileName: '' },
        validationSchema,
        onSubmit: Addfolder,
    });

    return (
        <motion.div
            className="UploadFile_backDrob"
            onClick={ToggleUploadFile}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, ease: 'linear' }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                className="UploadFile relative p-6 bg-gradient-to-br from-indigo-400 to-indigo-500"
                style={{ fontFamily: "'Inter', 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif" }}
                onClick={PreventFunction}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                transition={{ duration: 0.4, type: 'spring' }}
            >
                <HiX 
                    className="Close !text-indigo-100 hover:!text-white transition-all duration-200 hover:scale-110 cursor-pointer" 
                    onClick={ToggleUploadFile}
                    style={{ filter: 'drop-shadow(0 2px 4px rgba(255,255,255,0.3))', color: 'rgb(224, 231, 255) !important' }}
                />

                <div className="mb-4">
                    <h2 className="text-2xl font-bold text-white mb-2 drop-shadow-lg" style={{ textShadow: '0 2px 10px rgba(255,255,255,0.3)' }}>Create New Folder</h2>
                    <p className="text-sm text-white/90" style={{ textShadow: '0 1px 5px rgba(255,255,255,0.2)' }}>Enter a name for your new folder</p>
                </div>

                <form className="rounded-lg overflow-hidden w-full" onSubmit={formik.handleSubmit}>
                    <div className="mb-4">
                        <label
                            htmlFor="fileName"
                            className="block mb-2 text-sm font-medium text-white drop-shadow-md"
                            style={{ textShadow: '0 1px 5px rgba(255,255,255,0.2)' }}
                        >
                            Folder Name
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <LuFolderPlus className="h-5 w-5 text-white/90" />
                            </div>
                            <input
                                type="text"
                                id="fileName"
                                name="fileName"
                                className="bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white placeholder-white/60 text-sm rounded-lg focus:border-white/60 focus:ring-2 focus:ring-white/40 block w-full pl-10 p-2.5 transition-all"
                                placeholder="Enter folder name"
                                value={formik.values.fileName}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                style={{ textShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
                            />
                        </div>
                        {formik.touched.fileName && formik.errors.fileName && (
                            <p className="mt-2 text-sm text-white font-medium drop-shadow-md" style={{ textShadow: '0 1px 5px rgba(255,255,255,0.3)' }}>
                                {formik.errors.fileName}
                            </p>
                        )}
                    </div>

                    <div className="w-full flex justify-center items-center mt-6">
                        <button className="w-[300px] bg-white/20 backdrop-blur-sm border-2 border-white/40 text-white h-[40px] rounded-md hover:bg-white/30 hover:border-white/60 transition-all flex items-center justify-center gap-2 font-semibold drop-shadow-lg" style={{ textShadow: '0 2px 8px rgba(255,255,255,0.3)' }} type="submit">
                            <LuFolderPlus className="h-5 w-5" />
                            Create Folder
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
}
