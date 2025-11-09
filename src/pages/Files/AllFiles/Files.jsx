import React, { useState } from 'react'
import { Folder } from '../../../components/Folder/Folder'
import File from '../../../components/File/File'
import { IoAdd } from "react-icons/io5";
import { FaFolder } from "react-icons/fa";
import { FiFilter, FiGrid, FiList } from "react-icons/fi";
import { BsGrid3X3Gap, BsListUl } from "react-icons/bs";
import UploadFile from '../../../components/Upload/UploadFile/UploadFile';
import { AnimatePresence } from 'framer-motion';
import AddFolder from '../../../components/Upload/AddFolder/AddFolder';
import axios from 'axios';
import { API_URL } from '../../../services/api';
import { useCookies } from 'react-cookie';
import { useQuery } from 'react-query';
import { getFileCategory } from '../../../helpers/MimeType';
import Represents from '../../../components/Represents/Represents';
import ChangeName from '../../../components/ChangeName/ChangeName';

export default function Files() {

    const Active = "inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-500 rounded-lg shadow-sm transition-all duration-200 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2";
    const InActive = "inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm transition-all duration-200 hover:bg-gray-50 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2";

    const [AddFileShow, setAddFileShow] = useState(false);
    const [AddFolderAdding, setAddFolderAdding] = useState(false);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

    const ToggleShowAddFile = () => setAddFileShow(!AddFileShow);
    const ToggleFolderAdding = () => setAddFolderAdding(!AddFolderAdding);

    const [Token] = useCookies(['MegaBox']);
    const [FilterKey, setFilterKey] = useState('All');

    // get files
    const GetFiles = async ({ queryKey }) => {
        const [, filterKey] = queryKey;
        const config = {
            headers: {
                Authorization: `Bearer ${Token.MegaBox}`,
            },
        };

        if (filterKey.toLowerCase() !== 'all') {
            config.params = { type: filterKey };
        }

        const { data } = await axios.get(`${API_URL}/auth/getUserFiles`, config);
        return data;
    };

    const { data, refetch, isLoading: filesLoading } = useQuery(["GetUserFiles", FilterKey], GetFiles);

    // get folders 
    const Getfolders = async () => {
        const config = {
            headers: {
                Authorization: `Bearer ${Token.MegaBox}`,
            },
        };

        const { data } = await axios.get(`${API_URL}/user/getUserFolders`, config);
        return data;
    };

    const { data: folders, refetch: refFolders, isLoading: foldersLoading } = useQuery("GetUserFolders", Getfolders);

    const SelectFilter = async (type) => {
        setFilterKey(type);
    }

    const [ShowRepresent, setRepresents] = useState(false);
    const [Path, setPath] = useState();
    const [fileType, setfileType] = useState();

    const Representation = (path, type, close) => {
        if (close) {
            setPath(null)
            setfileType(null);
            setRepresents(false);
            return
        } else {
            setPath(path);
            setfileType(type);
            setRepresents(!ShowRepresent)
        }
    }

    const [ShowUpdateName, setupdateName] = useState(false);
    const [OldName, setOldName] = useState(null);
    const [FileId, setFileId] = useState(null);

    const ToggleNameChange = (name, close, id) => {
        if (close) {
            setupdateName(!ShowUpdateName);
            return;
        }
        setFileId(id)
        setOldName(name)
        setupdateName(!ShowUpdateName);
    }

    const ShareFile = async (folderId) => {
        console.log(folderId);
        const response = await axios.post(`${API_URL}/user/generateFolderShareLink`, {
            folderId
        }, {
            headers: {
                'Authorization': `Bearer ${Token.MegaBox}`
            }
        });
        console.log(response);
    }

    const filterOptions = [
        { key: "All", label: "All Files", count: data?.files?.length || 0 },
        { key: "image", label: "Images", count: data?.files?.filter(f => getFileCategory(f?.fileType) === 'image')?.length || 0 },
        { key: "video", label: "Videos", count: data?.files?.filter(f => getFileCategory(f?.fileType) === 'video')?.length || 0 },
        { key: "document", label: "Documents", count: data?.files?.filter(f => getFileCategory(f?.fileType) === 'document')?.length || 0 },
        { key: "zip", label: "Archives", count: data?.files?.filter(f => getFileCategory(f?.fileType) === 'zip')?.length || 0 },
    ];

    return <>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header Section */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="py-8">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">MegaBox</h1>
                                <p className="mt-2 text-sm text-gray-600">Manage your files and folders with ease</p>
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-3">
                                <button
                                    className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-white bg-primary-500 rounded-lg shadow-sm transition-all duration-200 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                                    onClick={ToggleShowAddFile}
                                >
                                    <IoAdd className="mr-2 h-4 w-4" />
                                    Upload File
                                </button>
                                <button
                                    className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-primary-600 bg-primary-50 border border-primary-200 rounded-lg shadow-sm transition-all duration-200 hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                                    onClick={ToggleFolderAdding}
                                >
                                    <FaFolder className="mr-2 h-4 w-4" />
                                    New Folder
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Folders Section */}
                <div className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-900">Folders</h2>
                            <p className="mt-1 text-sm text-gray-600">
                                {foldersLoading ? 'Loading folders...' : `${folders?.folders?.length || 0} folders`}
                            </p>
                        </div>
                    </div>

                    {foldersLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="bg-gray-200 rounded-lg h-32"></div>
                                    <div className="mt-3 bg-gray-200 rounded h-4 w-3/4"></div>
                                </div>
                            ))}
                        </div>
                    ) : folders?.folders?.length === 0 ? (
                        <div className="text-center py-12">
                            <FaFolder className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No folders</h3>
                            <p className="mt-1 text-sm text-gray-500">Get started by creating a new folder.</p>
                            <div className="mt-6">
                                <button
                                    onClick={ToggleFolderAdding}
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                >
                                    <FaFolder className="mr-2 h-4 w-4" />
                                    Create Folder
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {folders?.folders?.map((ele, index) => (
                                <Folder key={index} name={ele?.name} data={ele} />
                            ))}
                        </div>
                    )}
                </div>

                {/* Files Section */}
                <div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-900">Files</h2>
                            <p className="mt-1 text-sm text-gray-600">
                                {filesLoading ? 'Loading files...' : `${data?.files?.length || 0} files`}
                            </p>
                        </div>

                        {/* View Mode Toggle */}
                        <div className="mt-4 sm:mt-0 flex items-center space-x-2">
                            <span className="text-sm text-gray-500 mr-2">View:</span>
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-lg transition-all duration-200 ${viewMode === 'grid'
                                        ? 'bg-primary-100 text-primary-600'
                                        : 'bg-white text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <BsGrid3X3Gap className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-lg transition-all duration-200 ${viewMode === 'list'
                                        ? 'bg-primary-100 text-primary-600'
                                        : 'bg-white text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <BsListUl className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1 mb-6">
                        <div className="flex flex-wrap gap-1">
                            {filterOptions.map((option) => (
                                <button
                                    key={option.key}
                                    onClick={() => SelectFilter(option.key)}
                                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${FilterKey === option.key ? Active : InActive
                                        }`}
                                >
                                    {option.label}
                                    <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${FilterKey === option.key
                                            ? 'bg-white bg-opacity-20 text-white'
                                            : 'bg-gray-100 text-gray-600'
                                        }`}>
                                        {option.count}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Files Grid/List */}
                    {filesLoading ? (
                        <div className={`grid gap-6 ${viewMode === 'grid'
                                ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
                                : 'grid-cols-1'
                            }`}>
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="bg-gray-200 rounded-lg h-32"></div>
                                    <div className="mt-3 bg-gray-200 rounded h-4 w-3/4"></div>
                                </div>
                            ))}
                        </div>
                    ) : data?.files?.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
                            <div className="mx-auto h-12 w-12 text-gray-400">
                                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No files found</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {FilterKey === 'All'
                                    ? "Get started by uploading your first file."
                                    : `No ${FilterKey.toLowerCase()} files found.`
                                }
                            </p>
                            {FilterKey === 'All' && (
                                <div className="mt-6">
                                    <button
                                        onClick={ToggleShowAddFile}
                                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                    >
                                        <IoAdd className="mr-2 h-4 w-4" />
                                        Upload File
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className={`grid gap-6 ${viewMode === 'grid'
                                ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
                                : 'grid-cols-1'
                            }`}>
                            {data?.files?.map((ele, index) => (
                                <File
                                    key={index}
                                    Type={getFileCategory(ele?.fileType)}
                                    data={ele}
                                    Representation={Representation}
                                    refetch={refetch}
                                    onRename={ToggleNameChange}
                                    onShare={ShareFile}
                                    viewMode={viewMode}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>

        <AnimatePresence>
            {AddFileShow && <UploadFile ToggleUploadFile={ToggleShowAddFile} refetch={refetch} />}
            {AddFolderAdding && <AddFolder ToggleUploadFile={ToggleFolderAdding} refetch={refFolders} />}
            {ShowRepresent && <Represents path={Path} type={fileType} ToggleUploadFile={() => Representation("", "", true)} />}
            {ShowUpdateName && <ChangeName oldFileName={OldName} Toggle={ToggleNameChange} refetch={refetch} FileId={FileId} />}
        </AnimatePresence>
    </>
}
