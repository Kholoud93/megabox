import React, { useState, useEffect, useRef } from 'react'
import './ChangeName.scss'
import { useFormik } from 'formik'
import { HiX } from "react-icons/hi";
import * as Yup from 'yup';
import { useAuth } from '../../context/AuthContext';
import { useCookies } from 'react-cookie';
import { toast } from 'react-toastify';
import { ToastOptions } from '../../helpers/ToastOptions';
import { motion } from 'framer-motion';
import { PreventFunction } from '../../helpers/Prevent';
import { HiArrowPath } from 'react-icons/hi2';
import axios from 'axios';
import { API_URL } from '../../services/api';

export default function ChangeName({ oldFileName, Toggle, FileId, refetch, isFolder = false }) {

    const validationChangeName = Yup.object({
        New_Name: Yup.string().required("Please new name is required")
    });

    const { ChangeFileName } = useAuth();
    const [MegaBox] = useCookies(['MegaBox'])

    const [ChangeNameLoading, setChangeNameLoading] = useState(false)


    const ChangeName = async (values) => {
        setChangeNameLoading(true)
        const { New_Name } = values;
        
        try {
            let ChangeNameResponse;
            
            if (isFolder) {
                // Rename folder
                const response = await axios.patch(
                    `${API_URL}/user/updateFolderName/${FileId}`,
                    { newFolderName: New_Name },
                    {
                        headers: {
                            Authorization: `Bearer ${MegaBox.MegaBox}`
                        }
                    }
                );
                ChangeNameResponse = response.data?.message?.includes('نجاح') || response.status === 200;
            } else {
                // Rename file
                ChangeNameResponse = await ChangeFileName(FileId, MegaBox.MegaBox, New_Name);
            }

            if (ChangeNameResponse) {
                toast.success(isFolder ? "Folder name changed successfully" : "File name changed successfully", ToastOptions("success"));
            }
            await refetch();
        } catch (error) {
            toast.error("Failed to rename. Please try again.", ToastOptions("error"));
        } finally {
            setChangeNameLoading(false);
            Toggle("", true);
        }
    }

    const inputRef = useRef(null);

    const formik = useFormik({
        initialValues: {
            New_Name: oldFileName || ""
        }, validationSchema: validationChangeName,
        onSubmit: ChangeName

    })

    useEffect(() => {
        // Auto-focus and select the input when modal opens
        if (inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, []);

    return <motion.div className='ChangeName_Backdrop' initial={{ opacity: 0 }}
        animate={{ opacity: 1 }} onClick={() => Toggle("", true)}
        transition={{ duration: 0.3, ease: 'linear' }}
        exit={{ opacity: 0 }}>

        <motion.form 
            className="ChangeName bg-gradient-to-br from-indigo-400 to-indigo-500" 
            style={{ fontFamily: "'Inter', 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif" }}
            onSubmit={formik.handleSubmit} 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }} 
            onClick={PreventFunction}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.4, type: 'spring' }}
        >

            <HiX 
                onClick={() => Toggle("", true)} 
                className='Close !text-indigo-100 hover:!text-white transition-all duration-200 hover:scale-110 cursor-pointer'
                style={{ filter: 'drop-shadow(0 2px 4px rgba(255,255,255,0.3))', color: 'rgb(224, 231, 255) !important' }}
            />

            <div className="mb-6 px-6 pt-4">
                <h2 className="text-2xl font-bold text-white mb-2 drop-shadow-lg" style={{ textShadow: '0 2px 10px rgba(255,255,255,0.3)' }}>
                    {isFolder ? 'Rename Folder' : 'Rename File'}
                </h2>
                <p className="text-sm text-white/90" style={{ textShadow: '0 1px 5px rgba(255,255,255,0.2)' }}>
                    Enter a new name for your {isFolder ? 'folder' : 'file'}
                </p>
            </div>

            <div className="w-full px-6 space-y-5">
                <div>
                    <label className="block mb-2 text-sm font-medium text-white/90 drop-shadow-md" style={{ textShadow: '0 1px 5px rgba(255,255,255,0.2)' }}>Current Name</label>
                    <div className="bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white/80 text-sm rounded-lg block w-full p-3 opacity-75">
                        {oldFileName}
                    </div>
                </div>
                
                <div>
                    <label htmlFor="New_Name" className="block mb-2 text-sm font-medium text-white drop-shadow-md" style={{ textShadow: '0 1px 5px rgba(255,255,255,0.2)' }}>New Name</label>
                    <input 
                        ref={inputRef}
                        type="text" 
                        onChange={formik.handleChange} 
                        onBlur={formik.handleBlur}
                        value={formik.values.New_Name}
                        id="New_Name" 
                        name='New_Name' 
                        className="bg-white/20 backdrop-blur-sm border-2 border-white/40 text-white placeholder-white/60 text-sm rounded-lg focus:border-white/60 focus:ring-2 focus:ring-white/40 block w-full p-3 transition-all outline-none" 
                        placeholder="Enter new file name"
                        style={{ textShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
                    />
                    {(formik.errors.New_Name && formik.touched.New_Name) && (
                        <p className="mt-2 text-sm text-red-200 font-medium drop-shadow-md" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>
                            {formik.errors.New_Name}
                        </p>
                    )}
                </div>
            </div>

            <div className="w-full px-6 pb-6 pt-4">
                <button 
                    type="submit"
                    disabled={ChangeNameLoading}
                    className='w-full h-[45px] hover:bg-white/30 hover:border-white/60 bg-white/20 backdrop-blur-sm border-2 border-white/40 flex justify-center items-center transition-all text-white rounded-lg font-semibold drop-shadow-lg disabled:opacity-50 disabled:cursor-not-allowed' 
                    style={{ textShadow: '0 2px 8px rgba(255,255,255,0.3)' }}
                >
                    {ChangeNameLoading ? (
                        <HiArrowPath className='LoadingButton h-5 w-5' />
                    ) : (
                        "Save Changes"
                    )}
                </button>
            </div>

        </motion.form>

    </motion.div>
}
