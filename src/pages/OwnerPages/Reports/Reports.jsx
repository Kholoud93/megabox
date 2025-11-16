import React from 'react'
import CopyrightCard from './ReportCard'
import './Report.scss'
import axios from 'axios'
import { API_URL } from '../../../services/api'
import { useQuery } from 'react-query'
import Loading from '../../../components/Loading/Loading'
import { useLanguage } from '../../../context/LanguageContext'

export default function Reports() {
    const { t } = useLanguage();

    const GetAllComplaints = async () => {
        try {
            const { data } = await axios.get(`${API_URL}/auth/getAllCopyrightReports`);

            return data?.data
        } catch (err) {
            console.log(err);
            return err;
        }
    }

    const { data: Comps, isLoading } = useQuery("Get all compaints", GetAllComplaints, {
        cacheTime: 300000
    })


    return <>
        <div className="w-full p-5">
            <div className="mb-4">
                <h1 className='text-primary-700 text-xl flex justify-between items-center'>
                    <span>{t("adminReports.title")}</span>
                    <span className='font-semibold'>{Comps?.length || 0}</span>
                </h1>
                <p className="text-gray-600 mt-1">{t("adminReports.subtitle")}</p>
            </div>
        </div>

        {isLoading ? (
            <div className="w-full p-5">
                <div className="text-center py-12">
                    <p className="text-gray-600">{t("adminReports.loadingComplaints")}</p>
                </div>
            </div>
        ) : !Comps || Comps.length === 0 ? (
            <div className="w-full p-5">
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">{t("adminReports.noComplaints")}</h3>
                    <p className="text-gray-500">{t("adminReports.noComplaintsMessage")}</p>
                </div>
            </div>
        ) : (
            <div className="grid md:grid-cols-3 gap-2 p-5">
                {Comps.map((comp, idx) =>
                    <CopyrightCard data={comp} key={idx} />
                )}
            </div>
        )}
    </>
}
