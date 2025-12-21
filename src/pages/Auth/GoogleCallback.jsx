import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useCookies } from 'react-cookie';
import { ToastOptions } from '../../helpers/ToastOptions';
import { API_URL, notificationService, authService } from '../../services/api';
import { getFCMToken } from '../../utils/fcmToken';
import Loading from '../../components/Loading/Loading';

const GoogleCallback = () => {
    const navigate = useNavigate();
    const [, setCookie] = useCookies(['MegaBox']);
    const [searchParams] = useSearchParams();
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const handleOAuthCallback = async () => {
            if (isProcessing) return;
            setIsProcessing(true);

            let accessToken = searchParams.get('access_token');
            let error = searchParams.get('error');

            if (!accessToken && !error && window.location.hash) {
                const hashParams = new URLSearchParams(window.location.hash.substring(1));
                accessToken = hashParams.get('access_token');
                error = hashParams.get('error');
            }

            if (!accessToken && !error) {
                const urlParams = new URLSearchParams(window.location.search);
                const urlHash = new URLSearchParams(window.location.hash.substring(1));
                accessToken = urlParams.get('access_token') || urlHash.get('access_token');
                error = urlParams.get('error') || urlHash.get('error');
            }

            if (accessToken) {
                try {
                    const data = await authService.loginWithGmail(accessToken);

                    if (data?.message === "Done" || data?.data?.access_Token) {
                        // Use 'Lax' instead of 'Strict' for better mobile compatibility
                        setCookie('MegaBox', data?.data?.access_Token, {
                            path: '/',
                            secure: window.location.protocol === 'https:',
                            sameSite: 'Lax',
                            maxAge: 7 * 24 * 60 * 60,
                        });

                        // Save FCM token for push notifications (if available)
                        try {
                            const fcmToken = await getFCMToken();
                            if (fcmToken && data?.data?.checkUser?._id) {
                                await notificationService.saveFcmToken(
                                    data.data.checkUser._id,
                                    fcmToken
                                );
                            }
                        } catch (error) {
                            // Silently fail - FCM token is optional
                        }

                        toast.success("Successfully logged in with Google!", ToastOptions("success"));

                        // Small delay to ensure cookie is set
                        setTimeout(() => {
                            navigate('/dashboard');
                        }, 100);
                    } else {
                        toast.error(data?.message || "Failed to login with Google. Please try again.", ToastOptions("error"));
                    navigate('/login');
                }
            } catch (err) {
                toast.error(err?.message || "An error occurred during Google login. Please try again.", ToastOptions("error"));
                navigate('/login');
            } finally {
                setIsProcessing(false);
            }
        } else if (error) {
            if (error === 'redirect_uri_mismatch') {
                toast.error("OAuth configuration error. Please check Google Cloud Console settings. Make sure the redirect URI is configured correctly.", ToastOptions("error"));
            } else {
                toast.error("Google Login Failed: " + error, ToastOptions("error"));
            }
            navigate('/login');
        } else {
            navigate('/login');
        }

            // Clean up URL - remove both query params and hash
            window.history.replaceState({}, document.title, '/auth/callback');
        };

        handleOAuthCallback();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
            <Loading />
        </div>
    );
};

export default GoogleCallback;

