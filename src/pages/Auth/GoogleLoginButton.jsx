import React, { useState } from 'react';
import './Auth.scss';
import GoogleIcon from './GoogleIcon';

// Google OAuth Client ID - can be moved to environment variable
// Web application client ID (correctly configured)
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '778654516378-r2qfdvpph3qnhe618e5dj4mju8i9ip49.apps.googleusercontent.com';

const GoogleLoginButton = ({ SignUp }) => {
    const [isProcessing, setIsProcessing] = useState(false);

    // Direct Google OAuth redirect - no library needed
    // OAuth callback handling is done in GoogleCallback component

    const handleGoogleLogin = () => {
        setIsProcessing(true);
        
        // Use a fixed redirect URI that matches Google Cloud Console configuration
        // This should be: https://your-vercel-app.vercel.app/auth/callback
        const redirectUri = window.location.origin + '/auth/callback';
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