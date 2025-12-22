import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, fileService, notificationService } from '../services/api';
import { useCookies } from 'react-cookie';
import { getFCMToken } from '../utils/fcmToken';
import { jwtDecode } from 'jwt-decode';
import { useQueryClient } from 'react-query';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tempEmail, setTempEmail] = useState('');
  const [UserRole, setUserRole] = useState('')
  const [UserRefLink, setUserRefLink] = useState('')

  const [cookies, setToken, removeToken] = useCookies(['MegaBox'], {
    doNotParse: true,
  });
  
  const queryClient = useQueryClient();

  const getUserRole = async (id) => {
    try {
      setError(null)
      const role = await authService.userRole(id);

      setUserRole(role?.role);
      setUserRefLink(role?.referralLink);

      return role?.role;

    } catch (err) {

      setError(err)
      return false;
    }
  }

  // Initialize UserRole from token on page load/reload
  useEffect(() => {
    const token = cookies.MegaBox;
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded?.role) {
          setUserRole(decoded.role);
        }
        // Optionally fetch referral link if needed
        if (decoded?.id && !UserRefLink) {
          getUserRole(decoded.id).catch(() => {
            // Silently fail if role fetch fails
          });
        }
      } catch (error) {
        // Invalid token, clear it
        console.warn('Invalid token on page load:', error);
        removeToken("MegaBox", {
          path: '/',
        });
        setUserRole('');
      }
    } else {
      setUserRole('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cookies.MegaBox]);

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.login(email, password);

      setUser(response);

      if (response?.message === "Done") {
        setToken("MegaBox", response?.data?.access_Token);
        setUserRole(response?.data?.checkUser?.role);
        setUserRefLink(response?.data?.checkUser?.referralLink);
        
        // Save FCM token for push notifications (if available)
        try {
          const fcmToken = await getFCMToken();
          if (fcmToken && response?.data?.checkUser?._id) {
            await notificationService.saveFcmToken(
              response.data.checkUser._id,
              fcmToken
            );
          }
        } catch {
          // Silently fail - FCM token is optional
        }
      }

      setLoading(false);
      return response?.data?.access_Token;
    } catch (err) {
      setError(err.message || 'Login failed');
      setLoading(false);
      return false;
    }
  };

  const signup = async (username, email, password, confirmationPassword) => {
    try {
      setLoading(true);
      setError(null);
      await authService.signup(username, email, password, confirmationPassword);
      setTempEmail(email);
      setLoading(false);
      return true;
    } catch (err) {
      setError(err.message || 'Signup failed');
      setLoading(false);
      return false;
    }
  };


  const signupWithRef = async (username, email, password, confirmationPassword, ref) => {
    try {
      setLoading(true);
      setError(null);
      await authService.signupWithRef(username, email, password, confirmationPassword, ref);
      setTempEmail(email);
      setLoading(false);
      return true;
    } catch (err) {
      setError(err.message || 'Signup failed');
      setLoading(false);
      return false;
    }
  };

  // const confirmEmail = async (code) => {
  //   try {
  //     setLoading(true);
  //     setError(null);
  //     // Implement your email confirmation API call here
  //     // const response = await api.confirmEmail(code);
  //     setLoading(false);
  //     return true;
  //   } catch (err) {
  //     setError(err.message);
  //     setLoading(false);
  //     return false;
  //   }
  // };

  const sendResetCode = async (email) => {
    try {
      setLoading(true);
      setError(null);
      await authService.resendotp(email,);
      setTempEmail(email);
      setLoading(false);
      return true;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return false;
    }
  };

  const resetPassword = async (email, password, code) => {
    try {
      setLoading(true);
      setError(null);
      await authService.resetPassword(email, password, code);
      setLoading(false);
      return true;
    } catch (err) {
      setError(err.message || 'Failed to reset password');
      setLoading(false);
      return false;
    }
  };

  const confirmOTP = async (code, email) => {
    try {
      setLoading(true);
      setError(null);
      await authService.confirmOTP(code, email);
      setLoading(false);
      return true;
    } catch (err) {
      setError(err.message || 'OTP confirmation failed');
      setLoading(false);
      return false;
    }
  };

  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      setError(null);
      await authService.forgotPassword(email);
      setTempEmail(email);
      setLoading(false);
      return true;
    } catch (err) {
      setError(err.message || 'Failed to send reset code');
      setLoading(false);
      return false;
    }
  };


  const UploadFile = async (file, token) => {
    try {
      setError(null)

      const fileUploaded = await fileService.uploadFile(file, token);

      return fileUploaded

    } catch (err) {

      setError(err)
      return false;
    }
  }

  const DeleteFile = async (id, token) => {
    try {
      setError(null);

      const fileDeleted = await fileService.deletFile(id, token);

      return fileDeleted
    } catch (err) {

      setError(err)
      return false;
    }
  }

  const ChangeFileName = async (id, token, newFileName) => {
    try {
      setError(null);

      const fileDeleted = await fileService.changeFileName(id, token, newFileName);

      return fileDeleted
    } catch (err) {

      setError(err)
      return false;
    }
  }

  // Centralized logout function
  const logout = async () => {
    try {
      const token = cookies.MegaBox;
      
      // Delete FCM token on logout
      if (token) {
        try {
          await notificationService.deleteFcmToken(token);
        } catch (error) {
          // Silently fail - FCM token deletion is optional
          console.warn('Failed to delete FCM token:', error);
        }
      }
    } catch (error) {
      // Continue with logout even if FCM token deletion fails
      console.warn('Error during logout cleanup:', error);
    }
    
    // Clear React Query cache
    queryClient.clear();
    
    // Clear all auth state
    setUser(null);
    setUserRole('');
    setUserRefLink('');
    setTempEmail('');
    setError(null);
    
    // Remove cookie with all necessary options
    removeToken("MegaBox", {
      path: '/',
    });
    
    // Also try to remove cookie manually as a fallback (multiple attempts to ensure it's cleared)
    document.cookie = "MegaBox=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
    document.cookie = "MegaBox=; path=/; domain=" + window.location.hostname + "; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
    // Try without domain for localhost
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      document.cookie = "MegaBox=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      tempEmail,
      login,
      signup,
      sendResetCode,
      resetPassword,
      confirmOTP,
      forgotPassword,
      getUserRole,
      UserRole,
      setUserRole,
      UserRefLink,
      UploadFile,
      DeleteFile,
      ChangeFileName,
      signupWithRef,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 