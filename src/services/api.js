import axios from 'axios';
import { toast } from 'react-toastify';
import { ToastOptions } from '../helpers/ToastOptions';


export const API_URL = 'https://yalaa-production.up.railway.app';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authService = {

  login: async (email, password) => {

    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      })
      toast.success("Welcome back", ToastOptions("success"));
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed. Please try again.", ToastOptions("error"));
      throw error.response?.data || error.message;
    }
  },

  signup: async (username, email, password, confirmationPassword) => {
    try {
      const response = await api.post('/auth/signup', {
        username,
        email,
        password,
        confirmationpassword: confirmationPassword
      });

      toast.success("Account created successfully! Please check your email for verification.", ToastOptions("success"));
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed. Please try again.", ToastOptions("error"));
      throw error.response?.data || error.message;
    }
  },

  signupWithRef: async (username, email, password, confirmationPassword, ref) => {
    try {
      const response = await api.post('/auth/signup', {
        username,
        email,
        password,
        confirmationpassword: confirmationPassword,
        ref
      });

      toast.success("Account created successfully! Please check your email for verification.", ToastOptions("success"));
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed. Please try again.", ToastOptions("error"));
      throw error.response?.data || error.message;
    }
  },

  confirmOTP: async (code, email) => {
    try {
      const response = await api.post('/auth/confirmOTP', {
        code,
        email
      });
      toast.success("Email verified successfully!", ToastOptions("success"));
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Verification failed. Please try again.", ToastOptions("error"));
      throw error.response?.data || error.message;
    }
  },

  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgetpassword', {
        email
      });
      toast.success("Reset code sent to your email!", ToastOptions("success"));
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send reset code. Please try again.", ToastOptions("error"));
      throw error.response?.data || error.message;
    }
  },

  resetPassword: async (email, password, code) => {
    try {
      const response = await api.post('/auth/resetpassword', {
        email,
        password,
        code
      });
      toast.success("Password reset successful! You can now login with your new password.", ToastOptions("success"));
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Password reset failed. Please try again.", ToastOptions("error"));
      throw error.response?.data || error.message;
    }
  },

  resendotp: async (email) => {
    try {
      const response = await api.post('/auth/resendOTP', {
        email,

      });
      toast.success("Otp resend successful! You can now check your mail", ToastOptions("success"));
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Otp resendfailed. Please try again.", ToastOptions("error"));
      throw error.response?.data || error.message;
    }
  },

  userRole: async (id) => {
    try {
      const { data } = await api.get(`/auth/getUserRoleById/${id}`);

      return data?.data;
    }
    catch (error) {
      console.log(error);
    }
  }

};

export const fileService = {
  uploadFile: async (file, token) => {
    try {

      const { data } = await api.post("/auth/createFile", file, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (data?.message === "✅ تم رفع الملف بنجاح")
        return true

      return false

    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong", ToastOptions("error"));
      throw error.response?.data || error.message;
    }
  },
  deletFile: async (id, token) => {
    try {

      const { data } = await api.delete(`/auth/deleteFile/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (data?.message === "✅ تم حذف الملف بنجاح")
        return true


      return false

    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong", ToastOptions("error"));
      throw error.response?.data || error.message;
    }
  },
  changeFileName: async (id, token, newFileName) => {
    try {

      const { data } = await api.patch(`/auth/updateFileName/${id}`, {
        newFileName
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });



      if (data?.message === "✅ تم تعديل اسم الملف بنجاح")
        return true


      return false

    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong", ToastOptions("error"));
      throw error.response?.data || error.message;
    }
  }
}

export const userService = {
  getUserInfo: async (token) => {
    try {
      const response = await api.get('/user/Getloginuseraccount', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateUsername: async (newUsername, token) => {
    try {
      const response = await api.patch('/user/updateUsername',
        { username: newUsername },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateProfileImage: async (imageFile, token) => {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      const response = await api.patch('/user/updateimage',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  deleteProfileImage: async (token) => {
    try {
      const response = await api.delete('/user/deleteimage', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default api; 