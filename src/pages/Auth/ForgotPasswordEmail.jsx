import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { motion } from "framer-motion";
import "./Auth.scss";

const ForgotPasswordEmail = ({ onSendCode, onBackToLogin, loading, error }) => {
  const initialValues = { email: "" };
  
  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required")
  });

  const handleSubmit = async (values, { setSubmitting, setErrors }) => {
    try {
      await onSendCode(values.email);
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
          Forgot Password
        </motion.h2>
        <motion.p 
          className="auth-info"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          Enter your email to receive a reset code.
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
                {loading ? 'Sending...' : 'Send Reset Code'}
              </motion.button>
              <motion.div 
                className="auth-links"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
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

export default ForgotPasswordEmail; 