import React, { useEffect, useState } from 'react';
import './VedioPreview.scss';
import PreviewNav from '../../components/PreviewNav/PreviewNav';
import { GiSaveArrow } from "react-icons/gi";
import { GiSave } from "react-icons/gi";
import { CiMobile3 } from "react-icons/ci";
import { FaFile } from "react-icons/fa";
import FilePreview from './FilePreview';
// import { useLocation } from 'react-router-dom';
import { extractBranchDataFromUrl } from '../../helpers/Deeplink';
import axios from 'axios';
import { API_URL } from '../../services/api';
import Loading from '../../components/Loading/Loading';
import { DateFormatter } from '../../helpers/DateFormates';
import { GetFileTypeByName } from '../../helpers/GetFileTypeByName';
import { useNavigate } from 'react-router-dom';

export default function VedioPreview() {
    // const { pathname } = useLocation();
    const [fileData, setFileData] = useState(null);
    const [FileLoading, setFileLoading] = useState(true);

    const navigate = useNavigate();

    const GetFileData = async (id) => {
        try {
            const data = await fileService.getSharedFile(id);
            console.log({
                ...data?.file,
                fileType: GetFileTypeByName(data?.file?.name)
            });
            setFileData({
                ...data?.file,
                fileType: GetFileTypeByName(data?.file?.name)
            })
            return data
        } catch (err) {
            console.log(err);
        } finally {
            setFileLoading(false)
        }

    }

    useEffect(() => {
        const url = window.location.href;
        extractBranchDataFromUrl(url)
            .then(data => {
                if (data) {
                    // GetFileData("683c27333577316ffd99166d")
                    GetFileData(data?.fileId)

                    console.log(data?.file_id);
                } else {
                    navigate("/");
                    console.log("No deep link data found");
                }
            })
            .catch(error => {
                navigate("/");
                console.error('Error extracting Branch deep link data:', error);
            });
    }, []);

    // useEffect(() => {
    //     console.log(fileData);

    // }, [fileData])

    if (FileLoading)
        return <Loading />

    return (
        <div className="VedioPreviewLayout min-h-screen">
            <PreviewNav />
            <section className="VedioPreview_main">

                <div className="VedioPreview container mx-auto flex lg:flex-nowrap gap-3 flex-wrap">
                    <div className="lg:w-1/3 w-full VedioPreview_buttons flex flex-col items-center gap-3">
                        {/* <button className="First_Button">Save to MegaBox <GiSave /></button>
                        <button className="Main_Button">Download <GiSaveArrow /></button> */}
                        <a href='https://play.google.com/store/apps/details?id=com.dubox.drive' className="First_Button">Show it in application <CiMobile3 /></a>
                    </div>

                    <div className="lg:w-3/4 w-full VedioPreview_main_sec2">
                        <div className="h-[80px] border-b felx justify-start">
                            <div className="flex items-center gap-4 h-full px-3">
                                <FaFile className="w-10 h-10 FileTypeIcon" />
                                <div className="font-medium dark:text-white">
                                    <div>{fileData?.name}</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        {DateFormatter(fileData?.createdAt)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center items-center">
                            <FilePreview fileType={fileData} />
                        </div>

                    </div>
                </div>

            </section>
        </div>
    );
}
