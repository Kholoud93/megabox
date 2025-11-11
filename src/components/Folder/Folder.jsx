import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiMoreVertical } from 'react-icons/fi';
import { HiTrash, HiPencil, HiShare } from "react-icons/hi2";
import { LuFolder } from "react-icons/lu";
import { useLanguage } from '../../context/LanguageContext';

export const Folder = ({ name, data, onRename, onDelete, onShare }) => {
    const [open, setOpen] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef(null);
    const buttonRef = useRef(null);
    const { t } = useLanguage();

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                showMenu &&
                menuRef.current &&
                buttonRef.current &&
                !menuRef.current.contains(event.target) &&
                !buttonRef.current.contains(event.target)
            ) {
                setShowMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showMenu]);

    const handleAction = (action, e) => {
        e.preventDefault();
        e.stopPropagation();
        setShowMenu(false);
        
        switch (action) {
            case 'rename':
                onRename(name, false, data?._id);
                break;
            case 'delete':
                onDelete(data?._id);
                break;
            case 'share':
                onShare(data?._id);
                break;
            default:
                break;
        }
    };

    return (
        <div className="relative bg-gradient-to-br from-white to-indigo-50 rounded-lg border-2 border-indigo-200 shadow-md hover:shadow-xl transition-all duration-300 hover:border-indigo-400 hover:scale-[1.02]">
            <Link to={`file/${data?.name}/${data?._id}`} className="block">
                <div
                    className="flex items-center p-5 cursor-pointer group"
                    onClick={() => setOpen(!open)}
                >
                    <div className="flex-shrink-0 relative">
                        <div className="absolute inset-0 bg-indigo-100 rounded-lg blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
                        <LuFolder className="w-12 h-12 text-indigo-600 relative z-10 group-hover:text-indigo-700 transition-colors duration-300" style={{ filter: 'drop-shadow(0 2px 4px rgba(99, 102, 241, 0.3))' }} />
                    </div>
                    <div className="px-4 mr-auto flex-1 min-w-0">
                        <h4 className="font-bold text-indigo-900 truncate text-lg group-hover:text-indigo-700 transition-colors duration-300" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                            {name}
                        </h4>
                        <p className="text-xs text-indigo-500 mt-1">{t("folder.folder")}</p>
                    </div>
                </div>
            </Link>
            
            <div
                ref={buttonRef}
                className="absolute top-2 right-2 z-10"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowMenu(!showMenu);
                }}
            >
                <FiMoreVertical className="w-5 h-5 text-indigo-600 cursor-pointer hover:text-indigo-800 transition-colors" />
            </div>

            {showMenu && (
                <div
                    ref={menuRef}
                    className="absolute top-10 right-2 bg-white border-2 border-indigo-100 shadow-xl rounded-lg py-2 z-30 text-sm min-w-[180px]"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button 
                        onClick={(e) => handleAction('rename', e)} 
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-indigo-50 w-full text-left transition-colors text-indigo-900"
                    >
                        <HiPencil className='w-5 h-5 text-green-600' />
                        <span className="font-medium">{t("folder.rename")}</span>
                    </button>
                    <button 
                        onClick={(e) => handleAction('share', e)} 
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-indigo-50 w-full text-left transition-colors text-indigo-900"
                    >
                        <HiShare className='w-5 h-5 text-blue-600' />
                        <span className="font-medium">{t("folder.share")}</span>
                    </button>
                    <div className="border-t border-gray-200 my-1"></div>
                    <button 
                        onClick={(e) => handleAction('delete', e)} 
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 w-full text-left transition-colors text-red-600"
                    >
                        <HiTrash className='w-5 h-5 text-red-600' />
                        <span className="font-medium">{t("folder.delete")}</span>
                    </button>
                </div>
            )}
        </div>
    );
};