import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useCookies } from 'react-cookie';
import { ToastOptions } from '../../helpers/ToastOptions';
import './Auth.scss';
import GoogleIcon from './GoogleIcon';
import { useGoogleLogin } from '@react-oauth/google';

const GoogleLoginButton = ({ SignUp }) => {
    const navigate = useNavigate();
    const [, setCookie] = useCookies(['MegaBox']);
    const [searchParams] = useSearchParams();

    // Detect if device is mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    const handleCredentialResponse = async (accessToken) => {
        try {
            const res = await fetch('https://yalaa-production.up.railway.app/auth/loginWithGmail', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accessToken }),
            });

            const data = await res.json();
            if (res.ok) {

                setCookie('MegaBox', data?.data?.access_Token, {
                    path: '/',
                    secure: true,
                    sameSite: 'Strict',
                    maxAge: 7 * 24 * 60 * 60,
                });


                toast.success("Successfully logged in with Google!", ToastOptions("success"));
                navigate('/dashboard');
            } else {
                toast.error(data.message || "Failed to login with Google. Please try again.", ToastOptions("error"));
            }
        } catch (err) {

            toast.error("An error occurred during Google login. Please try again.", ToastOptions("error"));
        }
    };

    // Handle OAuth callback from redirect flow (for mobile)
    useEffect(() => {
        const accessToken = searchParams.get('access_token');
        const error = searchParams.get('error');
        
        if (accessToken) {
            handleCredentialResponse(accessToken);
            // Clean up URL
            navigate(window.location.pathname, { replace: true });
        } else if (error) {
            console.error('OAuth Error:', error);
            if (error === 'redirect_uri_mismatch') {
                toast.error("OAuth configuration error. Please ensure redirect URIs are configured in Google Cloud Console.", ToastOptions("error"));
            } else {
                toast.error("Google Login Failed", ToastOptions("error"));
            }
            // Clean up URL
            navigate(window.location.pathname, { replace: true });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    const googleGetIn = useGoogleLogin({
        // Use redirect for mobile, popup for desktop
        ux_mode: isMobile ? 'redirect' : 'popup',
        flow: 'implicit',
        onSuccess: async (tokenResponse) => {
            if (tokenResponse?.access_token) {
                await handleCredentialResponse(tokenResponse.access_token);
            } else {
                toast.error("Failed to retrieve Google access token", ToastOptions("error"));
            }
        },
        onError: (error) => {
            console.error('Google Login Error:', error);
            if (error?.error === 'redirect_uri_mismatch') {
                toast.error("OAuth configuration error. Please ensure redirect URIs are configured in Google Cloud Console.", ToastOptions("error"));
            } else {
                toast.error("Google Login Failed", ToastOptions("error"));
            }
        }
    });

    return (
        <button
            className="auth-btn auth-btn-primary auth-btn-primary-google"
            onClick={googleGetIn}
        >
            <GoogleIcon /> {SignUp ? "Sign up" : "Sign in"} with Google
        </button>
    );
};

export default GoogleLoginButton;
