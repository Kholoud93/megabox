import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiMoreVertical, FiArchive } from 'react-icons/fi';
import { HiTrash, HiPencil, HiShare } from "react-icons/hi2";
import { LuFolder } from "react-icons/lu";
import { useLanguage } from '../../context/LanguageContext';

export const Folder = ({ name, data, onRename, onDelete, onShare, onArchive, isSelectionMode, isSelected, onToggleSelect }) => {
    const [open, setOpen] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef(null);
    const buttonRef = useRef(null);
    const { t } = useLanguage();
    const { pathname } = useLocation();
    
    // Determine base path based on current location
    const getBasePath = () => {
        if (pathname.startsWith('/Promoter')) {
            return '/Promoter/file';
        } else if (pathname.startsWith('/dashboard')) {
            return '/dashboard/file';
        } else if (pathname.startsWith('/Owner')) {
            return '/Owner/file';
        }
        return '/dashboard/file'; // Default fallback
    };
    
    const folderPath = `${getBasePath()}/${encodeURIComponent(data?.name || name)}/${data?._id || data?.id}`;

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
            case 'archive':
                if (onArchive) {
                    onArchive(data?._id);
                }
                break;
            default:
                break;
        }
    };

    return (
        <div className={`relative bg-gradient-to-br from-white to-indigo-50 rounded-lg border-2 ${isSelected ? 'border-indigo-600 bg-indigo-100' : 'border-indigo-200'} shadow-md hover:shadow-xl transition-all duration-300 hover:border-indigo-400 hover:scale-[1.01] sm:hover:scale-[1.02] h-auto self-start`} style={{ zIndex: 1, position: 'relative', isolation: 'isolate' }}>
            {isSelectionMode && (
                <div className="absolute top-2 left-2 z-20">
                    <input
                        type="checkbox"
                        checked={isSelected || false}
                        onChange={(e) => {
                            e.stopPropagation();
                            if (onToggleSelect) {
                                onToggleSelect(data?._id || data?.id, true);
                            }
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-5 h-5 text-indigo-600 rounded border-indigo-300 focus:ring-indigo-500 cursor-pointer"
                    />
                </div>
            )}
            <Link to={folderPath} className="block" onClick={(e) => isSelectionMode && e.preventDefault()}>
                <div
                    className="flex items-center p-3 sm:p-4 md:p-5 cursor-pointer group"
                    onClick={(e) => {
                        if (isSelectionMode) {
                            e.preventDefault();
                            if (onToggleSelect) {
                                onToggleSelect(data?._id || data?.id, true);
                            }
                        } else {
                            setOpen(!open);
                        }
                    }}
                >
                    <div className="flex-shrink-0 relative">
                        <div className="absolute inset-0 bg-indigo-100 rounded-lg blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
                        <LuFolder className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-indigo-600 relative z-10 group-hover:text-indigo-700 transition-colors duration-300" style={{ filter: 'drop-shadow(0 2px 4px rgba(99, 102, 241, 0.3))' }} />
                    </div>
                    <div className="px-2 sm:px-3 md:px-4 mr-auto flex-1 min-w-0">
                        <h4 className="font-bold text-indigo-900 truncate text-sm sm:text-base md:text-lg group-hover:text-indigo-700 transition-colors duration-300" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                            {name}
                        </h4>
                        <p className="text-xs text-indigo-500 mt-0.5 sm:mt-1">{t("folder.folder")}</p>
                    </div>
                </div>
            </Link>

            <div
                ref={buttonRef}
                className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 z-10"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowMenu(!showMenu);
                }}
            >
                <FiMoreVertical className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 cursor-pointer hover:text-indigo-800 transition-colors" />
            </div>

            {showMenu && (
                <div
                    ref={menuRef}
                    className="absolute top-8 sm:top-10 right-1.5 sm:right-2 bg-white border-2 border-indigo-100 shadow-xl rounded-lg py-1.5 text-xs min-w-[160px] max-h-[280px] overflow-y-auto file-dropdown-menu"
                    style={{ zIndex: 10001 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={(e) => handleAction('rename', e)}
                        className="flex items-center gap-2 px-3 py-1.5 hover:bg-indigo-50 w-full text-left transition-colors text-indigo-900"
                    >
                        <HiPencil className='w-4 h-4 text-green-600 flex-shrink-0' />
                        <span className="font-medium">{t("folder.rename")}</span>
                    </button>
                    <button
                        onClick={(e) => handleAction('share', e)}
                        className="flex items-center gap-2 px-3 py-1.5 hover:bg-indigo-50 w-full text-left transition-colors text-indigo-900"
                    >
                        <HiShare className='w-4 h-4 text-blue-600 flex-shrink-0' />
                        <span className="font-medium">{t("folder.share")}</span>
                    </button>
                    {onArchive && (
                        <button
                            onClick={(e) => handleAction('archive', e)}
                            className="flex items-center gap-2 px-3 py-1.5 hover:bg-indigo-50 w-full text-left transition-colors text-indigo-900"
                        >
                            <FiArchive className='w-4 h-4 text-purple-600 flex-shrink-0' />
                            <span className="font-medium">{t("folder.archive")}</span>
                        </button>
                    )}
                    <div className="border-t border-gray-200 my-1"></div>
                    <button
                        onClick={(e) => handleAction('delete', e)}
                        className="flex items-center gap-2 px-3 py-1.5 hover:bg-red-50 w-full text-left transition-colors text-red-600"
                    >
                        <HiTrash className='w-4 h-4 text-red-600 flex-shrink-0' />
                        <span className="font-medium">{t("folder.delete")}</span>
                    </button>
                </div>
            )}
        </div>
    );
};