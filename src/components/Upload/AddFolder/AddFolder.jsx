import React from 'react';
import '../Upload.scss';
import { IoClose } from 'react-icons/io5';
import { PreventFunction } from '../../../helpers/Prevent';
import { motion } from 'framer-motion';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { PopupButton } from '../../../helpers/SubmitButton';
import axios from 'axios';
import { API_URL } from '../../../services/api';
import { toast } from 'react-toastify';
import { ToastOptions } from '../../../helpers/ToastOptions';
import { useCookies } from 'react-cookie';

export default function AddFolder({ ToggleUploadFile, refetch }) {
    const [cookies] = useCookies(['MegaBox']);

    const Addfolder = async (values) => {
        try {
            const res = await axios.post(
                `${API_URL}/user/createFolder`,
                { name: values.fileName },
                {
                    headers: {
                        Authorization: `Bearer ${cookies.MegaBox}`,
                    },
                }
            );
            if (res.status === 200 || res.status === 201) {
                toast.success('Folder added successfully', ToastOptions('success'));
                ToggleUploadFile();
                refetch()
            } else {
                toast.error('Failed to create folder.', ToastOptions('error'));
            }
        } catch (error) {
      
            toast.error('Something went wrong. Please try again.', ToastOptions('error'));
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
                className="UploadFile relative p-6"
                onClick={PreventFunction}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                transition={{ duration: 0.4, type: 'spring' }}
            >
                <IoClose className="Close" onClick={ToggleUploadFile} />

                <form className="rounded-lg overflow-hidden w-full" onSubmit={formik.handleSubmit}>
                    <div>
                        <label
                            htmlFor="fileName"
                            className="block mb-2 text-sm font-medium text-gray-900"
                        >
                            File Name
                        </label>
                        <input
                            type="text"
                            id="fileName"
                            name="fileName"
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:border-primary-500 block w-full p-2.5"
                            placeholder="Folder name"
                            value={formik.values.fileName}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                        />
                        {formik.touched.fileName && formik.errors.fileName && (
                            <p className="mt-2 text-red-900 font-bold">
                                {formik.errors.fileName}
                            </p>
                        )}
                    </div>

                    <div className="w-full flex justify-center items-center mt-4">
                        <button className={PopupButton} type="submit">
                            Add Folder
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
}
