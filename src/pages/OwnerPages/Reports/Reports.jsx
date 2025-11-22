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
        <div className="admin-reports-page">
            <div className="admin-reports-page__wrapper">
                <div className="admin-reports-header">
                    <div className="admin-reports-header__title-section">
                        <h1 className="admin-reports-header__title">
                            {t("adminReports.title")}
                        </h1>
                        <p className="admin-reports-header__subtitle">
                            {t("adminReports.subtitle")}
                        </p>
                    </div>
                    <div className="admin-reports-header__count">
                        <span className="admin-reports-header__count-number">{Comps?.length || 0}</span>
                        <span className="admin-reports-header__count-label">{t("adminReports.complaintsCount")}</span>
                    </div>
                </div>

                {isLoading ? (
                    <div className="admin-reports-loading">
                        <p>{t("adminReports.loadingComplaints")}</p>
                    </div>
                ) : !Comps || Comps.length === 0 ? (
                    <div className="admin-reports-empty">
                        <h3>{t("adminReports.noComplaints")}</h3>
                        <p>{t("adminReports.noComplaintsMessage")}</p>
                    </div>
                ) : (
                    <div className="admin-reports-grid">
                        {Comps.map((comp, idx) =>
                            <CopyrightCard data={comp} key={idx} />
                        )}
                    </div>
                )}
            </div>
        </div>
    </>
}
