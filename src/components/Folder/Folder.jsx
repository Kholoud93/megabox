import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export const Folder = ({ name, data }) => {
    const [open, setOpen] = useState(false);

    return <Link to={`file/${data?.name}/${data?._id}`}>
        <div
            className="flex items-center bg-white rounded-md p-3 text-white cursor-pointer transition duration-500 ease-in-out shadow hover:shadow-lg"
            onClick={() => setOpen(!open)}
        >
            <div>
                <svg
                    fill="currentColor"
                    className="w-10 h-10 text-primary-500"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                >
                    <path d="M0 4c0-1.1.9-2 2-2h7l2 2h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4z" />
                </svg>
            </div>
            <div className="px-3 mr-auto">
                <h4 className="font-bold text-primary-500">{name}</h4>
            </div>
        </div>
    </Link>
};