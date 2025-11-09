import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { motion } from "framer-motion";
import { RiEyeFill, RiEyeCloseLine } from "react-icons/ri";
import "./Auth.scss";

const ForgotPasswordReset = ({ onReset, onBackToLogin, loading, error }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const initialValues = { 
    email: "", 
    code: "", 
    password: "",
    confirmPassword: "" 
  };
  
  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    code: Yup.string()
      .required("Reset code is required")
      .matches(/^\d{6}$/, "Code must be 6 digits"),
    password: Yup.string()
      .required("Password is required")
      .min(8, "Password must be at least 8 characters")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    confirmPassword: Yup.string()
      .required("Please confirm your password")
      .oneOf([Yup.ref('password')], "Passwords must match")
  });

  const handleSubmit = async (values, { setSubmitting, setErrors }) => {
    try {
      await onReset(values);
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-shape auth-shape--1" />
      <div className="auth-shape auth-shape--2" />
      <div className="auth-shape auth-shape--3" />
      <div className="auth-shape auth-shape--4" />
      <motion.div 
        className="auth-card" 
        initial={{ opacity: 0, y: 40 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h2 
          className="auth-title"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Reset Password
        </motion.h2>
        <motion.p 
          className="auth-info"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          Enter your email, the reset code, and your new password.
        </motion.p>
        {error && (
          <motion.div 
            className="auth-error"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {error}
          </motion.div>
        )}
        <Formik 
          initialValues={initialValues} 
          validationSchema={validationSchema} 
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, errors }) => (
            <Form className="auth-form">
              <motion.div 
                className="auth-field"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <label htmlFor="email">Email</label>
                <Field 
                  name="email" 
                  type="email" 
                  placeholder="Enter your email"
                />
                <ErrorMessage name="email" component="div" className="auth-error" />
              </motion.div>
              <motion.div 
                className="auth-field"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <label htmlFor="code">Reset Code</label>
                <Field 
                  name="code" 
                  type="text" 
                  placeholder="Enter 6-digit code"
                  maxLength="6"
                />
                <ErrorMessage name="code" component="div" className="auth-error" />
              </motion.div>
              <motion.div 
                className="auth-field"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <label htmlFor="password">New Password</label>
                <Field 
                  name="password" 
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  tabIndex={-1}
                >
                  {showPassword ? <RiEyeFill /> : <RiEyeCloseLine />}
                </button>
                <ErrorMessage name="password" component="div" className="auth-error" />
              </motion.div>
              <motion.div 
                className="auth-field"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <Field 
                  name="confirmPassword" 
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <RiEyeFill /> : <RiEyeCloseLine />}
                </button>
                <ErrorMessage name="confirmPassword" component="div" className="auth-error" />
              </motion.div>
              {errors.submit && (
                <motion.div 
                  className="auth-error"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {errors.submit}
                </motion.div>
              )}
              <motion.button 
                className="auth-btn auth-btn-primary" 
                type="submit" 
                disabled={isSubmitting || loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </motion.button>
              <motion.div 
                className="auth-links"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                <span onClick={onBackToLogin}>Back to Login</span>
              </motion.div>
            </Form>
          )}
        </Formik>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordReset; 