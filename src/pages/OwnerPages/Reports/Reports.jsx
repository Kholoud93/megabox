import React from 'react'
import CopyrightCard from './ReportCard'
import './Report.scss'
import axios from 'axios'
import { API_URL } from '../../../services/api'
import { useQuery } from 'react-query'
import Loading from '../../../components/Loading/Loading'

export default function Reports() {

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


    if (isLoading) return <Loading />

    return <>
        <div className="w-full p-5">
            <h1 className='text-primary-700 text-xl flex justify-between'>
                <span>Complaints</span>  <span className='font-semibold'>{Comps?.length || 0}</span>
            </h1>
        </div>

        <div className="grid md:grid-cols-3 gap-2 p-5">
            {Comps?.map((comp, idx) =>
                <CopyrightCard data={comp} key={idx} />
            )}

        </div>
    </>
}
