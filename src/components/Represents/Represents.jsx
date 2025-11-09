import React from 'react';
import { motion } from 'framer-motion';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.js';
import Zoom from 'react-medium-image-zoom';
import { IoClose } from "react-icons/io5";

import './Represents.scss';

export default function Represents({ type, path, ToggleUploadFile }) {

    const NeededType = type?.split("/")[1];
    const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(NeededType);
    const isPdf = NeededType === 'pdf';
    const isVideo = ["mp4", "webm", "ogg"].includes(NeededType);

    const defaultLayout = defaultLayoutPlugin();

    function downloadCloudinaryFile(fileUrl, fileName = 'downloaded-file') {
        fetch(fileUrl, {
            mode: 'cors',
        })
            .then(response => {
                if (!response.ok) throw new Error('Failed to fetch file');
                return response.blob();
            })
            .then(blob => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
            })
            .catch(console.error);
    }

    return (
        <motion.div
            className="Represents_backDrob"
            onClick={ToggleUploadFile}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'linear' }}
        >
            <div className={`viewer-container flex justify-center items-center ${isImage ? 'no-scroll' : ''}`} onClick={(e) => e.stopPropagation()}>

                {(isImage || isVideo) && (
                    <div className="toolbar flex justify-end gap-2 p-2 absolute top-2 right-2 z-10">
                        <button onClick={() => downloadCloudinaryFile(path)} className="toolbar-btn">
                            📥 Download
                        </button>
                        <button onClick={() => ToggleUploadFile()} className="toolbar-btn">
                            Close
                        </button>
                    </div>
                )}

                {isImage ? (
                    <Zoom>
                        <img
                            src={path}
                            alt="file preview"
                            className="max-h-[90vh] object-contain cursor-zoom-in rounded-lg shadow-lg"
                        />
                    </Zoom>
                ) : isPdf ? (
                    <Worker workerUrl={workerUrl}>
                        <Viewer fileUrl={path} plugins={[defaultLayout]} />
                    </Worker>
                ) : isVideo ? (
                    <video
                        src={path}
                        controls
                        className="max-h-[90vh] w-full rounded-lg shadow-lg"
                        style={{ maxWidth: '100%', backgroundColor: '#000' }}
                    >
                        Your browser does not support the video tag.
                    </video>
                ) : (
                    <p className="text-center text-gray-600">File type not supported</p>
                )}
            </div>
        </motion.div>
    );
}




export function PdfPreview({ path, ToggleUploadFile }) {
    const defaultLayout = defaultLayoutPlugin();

    return (
        <motion.div
            className="Represents_backDrob"
            onClick={ToggleUploadFile}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'linear' }}
        >
            <div
                className="viewer-container flex justify-center items-center"
                onClick={(e) => e.stopPropagation()}
            >
                <Worker workerUrl={workerUrl}>
                    <Viewer fileUrl={path} plugins={[defaultLayout]} />
                </Worker>
            </div>
        </motion.div>
    );
}
