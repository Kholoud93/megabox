import React, { useRef, useState } from 'react'
import '../Upload.scss'
import { IoClose } from "react-icons/io5";
import { PreventFunction } from '../../../helpers/Prevent';
import { motion } from 'framer-motion';
import { useFormik } from 'formik';
import { FaFolderOpen } from "react-icons/fa";
import * as Yup from 'yup';
import { PopupButton } from '../../../helpers/SubmitButton';
import { toast } from 'react-toastify';
import { ToastOptions } from '../../../helpers/ToastOptions';
import { useCookies } from 'react-cookie';
import { API_URL } from '../../../services/api';
import axios from 'axios';
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { MdDelete } from "react-icons/md";

export default function UploadFile({ ToggleUploadFile, refetch, insideFile, id }) {

    const Active = "inline-block p-4 cursor-pointer text-white bg-primary-500 rounded shadow";
    const InActive = "inline-block p-4 rounded cursor-pointer hover:text-gray-600 hover:bg-gray-50"


    const [FileType, setFileType] = useState("Image");

    const SelectFileType = (Type) => setFileType(Type);

    const Validation = Yup.object({
        file: Yup.mixed()
            .required('File is required')
            .test("fileExist", "File is required", (value) => value instanceof File)
    });

    const [Token] = useCookies(['MegaBox']);
    const [UploadLoading, setUploadLoading] = useState(false);

    const AddFile = async (values) => {
        const { file } = values;
        setUploadLoading(true)

        if (!file || !(file instanceof File)) {
            toast.error("Please select a valid file.", ToastOptions("error"));
            return;
        }

        try {
            const formData = new FormData();

            formData.append("file", file);

            const userUrl = insideFile ? `user/createFile/${id}` : "auth/createFile"

            const { data } = await axios.post(`${API_URL}/${userUrl}`, formData, {
                headers: {
                    Authorization: `Bearer ${Token.MegaBox}`
                }
            });


            if (data?.message === "✅ تم رفع الملف بنجاح") {
                setUploadLoading(false)
                await refetch();
                ToggleUploadFile();
                toast.success("File uploaded successfully", ToastOptions("success"));
            }

        } catch (err) {
    
            toast.error("File upload failed", ToastOptions("error"));
        }
    };


    const fomrik = useFormik({
        initialValues: {
            file: null
        }, validationSchema: Validation,
        onSubmit: AddFile
    })

    const HandleUserFile = (event) => {
        const CoverImage = event.target.files[0];

        fomrik.setFieldValue("file", CoverImage)
    }

    const acceptedMimeTypes = {
        Image: 'image/*',
        Video: 'video/*',
        Document: '.pdf',
        Zip: '.zip'
    };

    const ref = useRef();
    const RemoveFile = () => {
        ref.current.value = null
        fomrik.setFieldValue("file", null);
    }


    return <motion.div className='UploadFile_backDrob' onClick={ToggleUploadFile} initial={{ opacity: 0 }}
        animate={{ opacity: 1 }} transition={{ duration: 0.3, ease: 'linear' }} exit={{ opacity: 0 }} >

        <motion.div className="UploadFile relative p-6" onClick={PreventFunction} initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} transition={{ duration: 0.4, type: 'spring' }}>

            <IoClose className='Close' onClick={ToggleUploadFile} />

            <ul className="flex flex-wrap mt-3 text-sm font-medium text-center text-gray-500">
                <li className="me-2" onClick={() => SelectFileType("Image")}>
                    <p aria-current="page" className={FileType === "Image" ? Active : InActive}>Image</p>
                </li>
                <li className="me-2" onClick={() => SelectFileType("Video")}>
                    <p className={FileType === "Video" ? Active : InActive}>Video</p>
                </li>
                <li className="me-2" onClick={() => SelectFileType("Document")}>
                    <p className={FileType === "Document" ? Active : InActive}>Document</p>
                </li>
                <li className="me-2" onClick={() => SelectFileType("Zip")}>
                    <p className={FileType === "Zip" ? Active : InActive}>Zip Folder</p>
                </li>
            </ul>

            <form className="rounded-lg overflow-hidden w-full" onSubmit={fomrik.handleSubmit}>

                <div className="md:flex">
                    <div className="w-full p-3  cursor-pointer">
                        <div className="relative border-solid w-full h-48 rounded-lg border-2 border-primary-500 bg-gray-100 flex justify-center items-center">

                            <div className="absolute">

                                <div className="flex flex-col items-center">
                                    <FaFolderOpen className="text-4xl text-primary-500" />
                                    <span className="block text-gray-400 font-normal">Attach you files here</span>
                                </div>
                            </div>

                            <input
                                type="file"
                                onChange={HandleUserFile}
                                className="h-full w-full opacity-0"
                                name="file"
                                accept={FileType ? acceptedMimeTypes[FileType] : '*'}
                                disabled={!FileType}
                                ref={ref}
                            />
                        </div>
                    </div>
                </div>

                {(fomrik.errors.file && fomrik.touched.file) &&
                    <p className='mt-2 text-red-900 font-bold'>{fomrik.errors.file}</p>}


                {fomrik.values.file && <div className="p-4 mb-4 text-sm text-green-800 relative rounded-lg bg-green-50" role="alert">
                    <MdDelete className='absolute top-2 right-2 text-red-900 text-xl cursor-pointer' onClick={RemoveFile} />
                    <span className="font-medium">File Uplodaed</span>
                </div>}

                <div className="w-full flex justify-center items-center mt-2">
                    <button className={`${PopupButton} flex justify-center items-center`}>

                        {UploadLoading ? <AiOutlineLoading3Quarters className='LoadingButton' /> : "Add File"}

                    </button>

                </div>

            </form>





        </motion.div>
    </motion.div>
}
