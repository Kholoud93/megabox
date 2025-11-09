import React, { useState } from 'react';
import { RiFolderVideoFill } from "react-icons/ri";
import { IoImageSharp, IoDocumentsSharp } from "react-icons/io5";
import { motion } from 'framer-motion';
import { AgoFormatter } from '../../helpers/DateFormates';
import fileImage from '../../assets/How_it_works/FileTest.png';
import videoImage from '../../assets/How_it_works/Vedio.png';
import { FiArchive, FiMoreVertical } from 'react-icons/fi';
// import { downloadCloudinaryFile } from '../../helpers/DownLoadCloudnairy';
import { MdDelete } from "react-icons/md";
import { TbArrowsExchange } from "react-icons/tb";
import { FiZoomIn } from "react-icons/fi";
import { useAuth } from '../../context/AuthContext';
import { useCookies } from 'react-cookie';
import { toast } from 'react-toastify';
import { ToastOptions } from '../../helpers/ToastOptions';
import { IoMdShare } from "react-icons/io";

const typeConfig = {
    image: {
        icon: <IoImageSharp className='text-secondary-600 w-[25px] h-[25px]' />,
        previewStyle: (url) => ({
            backgroundImage: `url(${url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
        }),
    },
    video: {
        icon: <RiFolderVideoFill className='text-secondary-600 w-[25px] h-[25px]' />,
        previewStyle: () => ({
            backgroundImage: `url(${videoImage})`,
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
        }),
    },
    document: {
        icon: <IoDocumentsSharp className='text-secondary-600 w-[25px] h-[25px]' />,
        previewStyle: () => ({
            backgroundImage: `url(${fileImage})`,
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
        })
    },
    zip: {
        icon: <FiArchive className='text-secondary-600 w-[25px] h-[25px]' />,
        previewStyle: () => ({
            backgroundImage: `url(${fileImage})`,
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
        }),
        isDownloadOnly: true,
    }
};

export default function File({ Type, data, Representation, onRename, refetch, onShare }) {

    const [showMenu, setShowMenu] = useState(false);
    const { url, createdAt, fileName, fileType, _id } = data;
    const config = typeConfig[Type];

    const [MegaBox] = useCookies(['MegaBox'])

    const { DeleteFile } = useAuth();

    const truncateString = (str) =>
        str?.length <= 20 ? str : str?.slice(0, 20) + '...';

    if (!config) return null;

    const handleAction = async (action) => {
        setShowMenu(false);
        switch (action) {
            case 'delete':
                const DeleteRes = await DeleteFile(_id, MegaBox.MegaBox);

                if (DeleteRes)
                    toast.success("File deleted successfully", ToastOptions("success"));
                refetch();
                break;
            case 'rename':
                onRename(fileName, false, _id);
                break;
            case 'zoom':
                Representation(url, fileType)
                break;
            case "share":
                await onShare(_id)
                break;
            default:
                break;
        }
    };

    return (
        <motion.div
            className={`relative bg-white border rounded-lg h-[300px]  ${config.isDownloadOnly ? 'opacity-90 hover:opacity-100' : ''}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <div
                className="absolute top-2 right-2 z-10"
                onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering file click
                    setShowMenu(!showMenu);
                }}
            >
                <FiMoreVertical className="w-5 h-5 text-gray-600 cursor-pointer" />
            </div>

            {showMenu && (
                <div
                    className="absolute top-8 right-2 bg-white border shadow rounded p-1 z-20 text-sm"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button onClick={() => handleAction('rename')} className="flex items-center gap-2 px-3 py-1 hover:bg-gray-100 w-full text-left">
                        Rename <TbArrowsExchange className='text-green-800' />
                    </button>
                    <button onClick={() => handleAction('share')} className="flex items-center gap-2 px-3 py-1 hover:bg-gray-100 w-full text-left">
                        Share <IoMdShare className='text-yellow-800' />
                    </button>
                    <button onClick={() => handleAction('zoom')} className="flex items-center gap-2 px-3 py-1 hover:bg-gray-100 w-full text-left">
                        Zoom <FiZoomIn className='text-blue-700' />
                    </button>
                    <button onClick={() => handleAction('delete')} className="flex items-center gap-2 px-3 py-1 hover:bg-gray-100 w-full text-left">
                        Delete <MdDelete className='text-red-600' />
                    </button>
                </div>
            )}

            <div className="w-full h-[40px] p-2 flex gap-2 items-center">
                {config.icon}
                <p className="truncate">{truncateString(fileName)}</p>
            </div>

            <div
                className="w-full h-[200px]"
                style={config.previewStyle(url)}
            />

            <div className="w-full h-[60px] flex justify-end items-center p-2">
                <p className='text-sm text-gray-500'>{AgoFormatter(createdAt)}</p>
            </div>
        </motion.div>
    );
}
