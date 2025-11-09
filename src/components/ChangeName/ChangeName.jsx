import React, { useState } from 'react'
import './ChangeName.scss'
import { useFormik } from 'formik'
import { IoClose } from "react-icons/io5";
import * as Yup from 'yup';
import { useAuth } from '../../context/AuthContext';
import { useCookies } from 'react-cookie';
import { toast } from 'react-toastify';
import { ToastOptions } from '../../helpers/ToastOptions';
import { motion } from 'framer-motion';
import { PreventFunction } from '../../helpers/Prevent';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

export default function ChangeName({ oldFileName, Toggle, FileId, refetch }) {

    const validationChangeName = Yup.object({
        New_Name: Yup.string().required("Please new name is required")
    });

    const { ChangeFileName } = useAuth();
    const [MegaBox] = useCookies(['MegaBox'])

    const [ChangeNameLoading, setChangeNameLoading] = useState(false)


    const ChangeName = async (values) => {
        setChangeNameLoading(true)
        const { New_Name } = values;
        const ChangeNameResponse = await ChangeFileName(FileId, MegaBox.MegaBox, New_Name);

        if (ChangeNameResponse)
            toast.success("File name change", ToastOptions("success"));
        await refetch();
        setChangeNameLoading(false)
        Toggle("", true);
    }

    const formik = useFormik({
        initialValues: {
            New_Name: ""
        }, validationSchema: validationChangeName,
        onSubmit: ChangeName

    })

    return <motion.div className='ChangeName_Backdrop' initial={{ opacity: 0 }}
        animate={{ opacity: 1 }} onClick={() => Toggle("", true)}
        transition={{ duration: 0.3, ease: 'linear' }}
        exit={{ opacity: 0 }}>

        <motion.form className="ChangeName " onSubmit={formik.handleSubmit} initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }} onClick={PreventFunction}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.4, type: 'spring' }}
        >


            <div className="w-full grid md:grid-cols-2 gap-2 p-5 items-center">
                <IoClose onClick={() => Toggle("", true)} className='Close' />

                <div>
                    <label className="block mb-2 text-sm font-medium text-gray-900">Old file name</label>
                    <div type="text" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg
                 block w-full p-2.5">{oldFileName}</div>
                </div>
                <div>
                    <label htmlFor="New_Name" className="block mb-2 text-sm font-medium text-gray-900">New File name</label>
                    <input type="text" onChange={formik.handleChange} onBlur={formik.handleBlur}
                        id="New_Name" name='New_Name' className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg
                 focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5" />
                </div>
            </div>

            {(formik.errors.New_Name && formik.touched.New_Name) && <p className="w-full py-2 flex justify-center items-center text-red-700">
                {formik.errors.New_Name}
            </p>}

            <div className="w-full px-5">
                <button className='w-full h-[40px] hover:bg-primary-700 flex justify-center items-center transition bg-primary-500 text-white rounded-lg'>
                    {ChangeNameLoading ? <AiOutlineLoading3Quarters className='LoadingButton' /> : "Change file name"}
                </button>
            </div>

        </motion.form>

    </motion.div>
}
