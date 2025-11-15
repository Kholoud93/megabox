import React, { createContext, useContext, useState } from 'react';
import { authService, fileService } from '../services/api';
import { useCookies } from 'react-cookie';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tempEmail, setTempEmail] = useState('');
  const [UserRole, setUserRole] = useState('')
  const [UserRefLink, setUserRefLink] = useState('')


  const [, setToken] = useCookies(['MegaBox'], {
    doNotParse: true,
  });

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.login(email, password);

      setUser(response);

      if (response?.message === "Done") {
        setToken("MegaBox", response?.data?.access_Token);
        console.log(response?.data?.checkUser);
        setUserRole(response?.data?.checkUser?.role);
        setUserRefLink(response?.data?.checkUser?.referralLink);
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
      const response = await authService.signup(username, email, password, confirmationPassword);
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
      const response = await authService.signupWithRef(username, email, password, confirmationPassword, ref);
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
      const response = await authService.resendotp(email,);
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
      const response = await authService.resetPassword(email, password, code);
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
      const response = await authService.confirmOTP(code, email);
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
      const response = await authService.forgotPassword(email);
      setTempEmail(email);
      setLoading(false);
      return true;
    } catch (err) {
      setError(err.message || 'Failed to send reset code');
      setLoading(false);
      return false;
    }
  };

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
      signupWithRef
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 