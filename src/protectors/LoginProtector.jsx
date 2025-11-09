import React from 'react';
import { useCookies } from 'react-cookie';
import { Navigate } from 'react-router-dom'

export default function LoginProtector(props) {
    const [cookies] = useCookies(["MegaBox"]);
    const MegaBox = cookies.MegaBox;

    if (MegaBox) {
        return props.children
    } else {
        return <Navigate to={"/"} />
    }
}
