import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useCookies } from 'react-cookie';
import { ToastOptions } from '../../helpers/ToastOptions';
import './Auth.scss';
import GoogleIcon from './GoogleIcon';
import { API_URL } from '../../services/api';

// Google OAuth Client ID - can be moved to environment variable
// Web application client ID (correctly configured)
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '778654516378-r2qfdvpph3qnhe618e5dj4mju8i9ip49.apps.googleusercontent.com';

const GoogleLoginButton = ({ SignUp }) => {
    const navigate = useNavigate();
    const [, setCookie] = useCookies(['MegaBox']);
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const [isProcessing, setIsProcessing] = useState(false);

    const handleCredentialResponse = async (accessToken) => {
        if (isProcessing) return; // Prevent duplicate calls
        setIsProcessing(true);

        try {
            const res = await fetch(`${API_URL}/auth/loginWithGmail`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accessToken }),
            });

            const data = await res.json();
            if (res.ok) {
                // Use 'Lax' instead of 'Strict' for better mobile compatibility
                setCookie('MegaBox', data?.data?.access_Token, {
                    path: '/',
                    secure: window.location.protocol === 'https:',
                    sameSite: 'Lax',
                    maxAge: 7 * 24 * 60 * 60,
                });

                toast.success("Successfully logged in with Google!", ToastOptions("success"));

                // Small delay to ensure cookie is set
                setTimeout(() => {
                    navigate('/dashboard');
                }, 100);
            } else {
                toast.error(data.message || "Failed to login with Google. Please try again.", ToastOptions("error"));
            }
        } catch (err) {
            console.error('Google login error:', err);
            toast.error("An error occurred during Google login. Please try again.", ToastOptions("error"));
        } finally {
            setIsProcessing(false);
        }
    };

    // Handle OAuth callback from redirect flow
    // Check both query params and hash fragments
    useEffect(() => {
        // Debug: Log current URL to see what we're getting
        console.log('OAuth callback - Full URL:', window.location.href);
        console.log('OAuth callback - Hash:', window.location.hash);
        console.log('OAuth callback - Search:', window.location.search);

        // Check query parameters first
        let accessToken = searchParams.get('access_token');
        let error = searchParams.get('error');

        // If not in query params, check hash fragments (common in redirect flow)
        if (!accessToken && !error && window.location.hash) {
            const hashParams = new URLSearchParams(window.location.hash.substring(1));
            accessToken = hashParams.get('access_token');
            error = hashParams.get('error');
            console.log('OAuth callback - Found in hash:', { accessToken: accessToken ? 'present' : 'missing', error });
        }

        // Also check window.location directly (for desktop browsers that might not update React Router immediately)
        if (!accessToken && !error) {
            const urlParams = new URLSearchParams(window.location.search);
            const urlHash = new URLSearchParams(window.location.hash.substring(1));
            accessToken = urlParams.get('access_token') || urlHash.get('access_token');
            error = urlParams.get('error') || urlHash.get('error');
            console.log('OAuth callback - Direct URL check:', { accessToken: accessToken ? 'present' : 'missing', error });
        }

        if (accessToken && !isProcessing) {
            console.log('OAuth callback - Processing token');
            handleCredentialResponse(accessToken);
            // Clean up URL - remove both query params and hash
            const cleanPath = location.pathname;
            window.history.replaceState({}, document.title, cleanPath);
        } else if (error && !isProcessing) {
            console.error('OAuth Error:', error);
            if (error === 'redirect_uri_mismatch') {
                toast.error("OAuth configuration error. Please check Google Cloud Console settings.", ToastOptions("error"));
            } else {
                toast.error("Google Login Failed: " + error, ToastOptions("error"));
            }
            // Clean up URL
            const cleanPath = location.pathname;
            window.history.replaceState({}, document.title, cleanPath);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams, location.hash, location.search]);

    // Direct Google OAuth redirect - no library needed
    const handleGoogleLogin = () => {
        const redirectUri = window.location.origin + location.pathname;
        const scope = 'openid email profile';
        const responseType = 'token';

        console.log('Initiating Google OAuth:', { redirectUri, clientId: GOOGLE_CLIENT_ID });

        // Build Google OAuth URL
        const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
            `client_id=${encodeURIComponent(GOOGLE_CLIENT_ID)}&` +
            `redirect_uri=${encodeURIComponent(redirectUri)}&` +
            `response_type=${responseType}&` +
            `scope=${encodeURIComponent(scope)}&` +
            `include_granted_scopes=true`;

        console.log('Redirecting to Google OAuth URL');

        // Redirect to Google
        window.location.href = googleAuthUrl;
    };

    return (
        <button
            className="auth-btn auth-btn-primary auth-btn-primary-google"
            onClick={handleGoogleLogin}
            disabled={isProcessing}
        >
            <GoogleIcon />
            {isProcessing ? "Processing..." : (SignUp ? "Sign up" : "Sign in") + " with Google"}
        </button>
    );
};

export default GoogleLoginButton;
