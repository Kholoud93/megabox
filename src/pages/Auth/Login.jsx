import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { motion } from "framer-motion";
import { RiEyeFill, RiEyeCloseLine } from "react-icons/ri";
import GoogleLoginButton from './GoogleLoginButton';
// import { GoogleLogin } from '@react-oauth/google';
import "./Auth.scss";


const Login = ({ onSignup, onForgot, onSubmit, loading, error }) => {
  const [showPassword, setShowPassword] = useState(false);
  const initialValues = { email: "", password: "" };

  const validationSchema = Yup.object({
    email: Yup.string().email("Invalid email").required("Required"),
    password: Yup.string().required("Required"),
  });

  const handleSubmit = async (values, { setSubmitting, setErrors }) => {
    try {
      await onSubmit(values);
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
          Login
        </motion.h2>

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
                transition={{ duration: 0.5, delay: 0.3 }}
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
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <label htmlFor="password">Password</label>
                <Field
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
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
                {loading ? 'Loading...' : 'Login'}
              </motion.button>

            </Form>
          )}
        </Formik>


        <GoogleLoginButton />


        <motion.div
          className="auth-links"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <span onClick={onSignup}>Sign up</span> | <span onClick={onForgot}>Forgot password?</span>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
