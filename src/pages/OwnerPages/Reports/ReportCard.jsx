import React from 'react';
import { motion } from 'framer-motion';
import { FiDownload, FiUser, FiMail, FiMapPin, FiFileText } from 'react-icons/fi';
import { format } from 'date-fns';
import { MdDelete } from "react-icons/md";

export default function CopyrightCard({ data }) {
    const {
        fileName,
        fileType,
        fileSize,
        url,
        createdAt,
        copyrightOwnerName,
        relationshipWithContent,
        email,
        phoneNumber,
        country,
        province,
        streetAddress,
        city,
        postalCode,
        signature,
        userId,
    } = data;

    const formattedDate = format(new Date(createdAt), 'PPPpp');

    return (
        <motion.div
            className="copyright-card relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
        >
            <MdDelete className='absolute top-2 right-2 text-red-800 text-xl cursor-pointer hover:text-red-700 transition' />
            <div className="card-header">
                <FiFileText className="icon" />
                <div>
                    <h2>{fileName}</h2>
                    <span>{fileType} • {fileSize}MB</span>
                </div>
            </div>

            <div className="card-body">
                <div className="info-row">
                    <strong>Owner:</strong> {copyrightOwnerName}
                </div>
                <div className="info-row">
                    <strong>Relationship:</strong> {relationshipWithContent}
                </div>
                <div className="info-row">
                    <strong>Email:</strong> {email}
                </div>
                <div className="info-row">
                    <strong>Phone:</strong> {phoneNumber}
                </div>
                <div className="info-row">
                    <strong>Address:</strong> {streetAddress}, {city}, {province}, {country}, {postalCode}
                </div>
                <div className="info-row">
                    <strong>Signature:</strong> {signature}
                </div>
                <div className="info-row">
                    <strong>Submitted by:</strong> {
                        typeof userId === 'object' && userId !== null
                            ? `${userId.username || userId.email || userId._id || 'Unknown'} (${userId.email || 'No email'})`
                            : userId || 'Unknown'
                    }
                </div>
                <div className="info-row">
                    <strong>Submitted on:</strong> {formattedDate}
                </div>
            </div>

            <div className="card-footer">
                <a href={url} target="_blank" rel="noopener noreferrer" className="download-btn w-full flex justify-center items-center">
                    <FiDownload className="icon" /> Download Document
                </a>
            </div>
        </motion.div>
    );
}
