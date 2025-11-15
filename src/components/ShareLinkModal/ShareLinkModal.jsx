import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaCopy, FaCheck, FaLink } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { ToastOptions } from '../../helpers/ToastOptions';

const ShareLinkModal = ({ isOpen, onClose, shareUrl, title = "Share Link" }) => {
    const [copied, setCopied] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.select();
        }
    }, [isOpen]);

    const handleCopy = async () => {
        if (shareUrl) {
            try {
                await navigator.clipboard.writeText(shareUrl);
                setCopied(true);
                toast.success("Link copied to clipboard!", ToastOptions("success"));
                setTimeout(() => setCopied(false), 2000);
            } catch (error) {
                toast.error("Failed to copy link", ToastOptions("error"));
            }
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div
                    className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border-2 border-indigo-100"
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-indigo-100 p-2 rounded-lg">
                                <FaLink className="text-indigo-600 text-xl" />
                            </div>
                            <h3 className="text-xl font-bold text-indigo-900">{title}</h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
                        >
                            <FaTimes />
                        </button>
                    </div>

                    {/* Share Link Input */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Share this link:
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                ref={inputRef}
                                type="text"
                                value={shareUrl || ''}
                                readOnly
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                            <button
                                onClick={handleCopy}
                                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${copied
                                    ? 'bg-green-500 text-white'
                                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                    }`}
                            >
                                {copied ? (
                                    <>
                                        <FaCheck /> Copied!
                                    </>
                                ) : (
                                    <>
                                        <FaCopy /> Copy
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Info Message */}
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 mb-4">
                        <p className="text-sm text-indigo-800">
                            Anyone with this link can access the {title.toLowerCase().includes('folder') ? 'folder' : 'file'}.
                        </p>
                    </div>

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                    >
                        Close
                    </button>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ShareLinkModal;

