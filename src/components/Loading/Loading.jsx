import React from 'react'
import { TailSpin } from 'react-loader-spinner'
import './Loading.scss'

export default function Loading() {
    return <div className="Loader">
        <TailSpin
            visible={true}
            height="80"
            width="80"
            color="#6366f1"
            ariaLabel="tail-spin-loading"
            radius="1"
            wrapperStyle={{}}
            wrapperClass=""
        />
    </div>
}
