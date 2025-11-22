import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { motion } from "framer-motion";
import GoogleIcon from "./GoogleIcon";
import { RiEyeFill, RiEyeCloseLine } from "react-icons/ri";
import GoogleLoginButton from './GoogleLoginButton';
import { useLanguage } from '../../context/LanguageContext';
import "./Auth.scss";

const Signup = ({ onLogin, onConfirmMail, loading, error }) => {
  const { t } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);




  const initialValues = {
    username: "",
    email: "",
    password: "",
    confirmationPassword: ""
  };

  const validationSchema = Yup.object({
    username: Yup.string()
      .required(t('auth.usernameRequired'))
      .min(3, t('auth.usernameMin')),
    email: Yup.string()
      .email(t('auth.invalidEmail'))
      .required(t('auth.required')),
    password: Yup.string()
      .required(t('auth.required'))
      .min(8, t('auth.passwordMin')),
    confirmationPassword: Yup.string()
      .required(t('auth.confirmPasswordRequired'))
      .oneOf([Yup.ref('password')], t('auth.passwordsMatch'))
  });

  const handleSubmit = async (values, { setSubmitting, setErrors }) => {
    try {
      await onConfirmMail(values);
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
          {t('auth.signUp')}
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
                <label htmlFor="username">{t('auth.username')}</label>
                <Field
                  name="username"
                  type="text"
                  placeholder={t('auth.usernamePlaceholder')}
                />
                <ErrorMessage name="username" component="div" className="auth-error" />
              </motion.div>
              <motion.div
                className="auth-field"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <label htmlFor="email">{t('auth.email')}</label>
                <Field
                  name="email"
                  type="email"
                  placeholder={t('auth.emailPlaceholder')}
                />
                <ErrorMessage name="email" component="div" className="auth-error" />
              </motion.div>
              <motion.div
                className="auth-field"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <label htmlFor="password">{t('auth.password')}</label>
                <Field
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t('auth.passwordPlaceholder')}
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
                transition={{ duration: 0.5, delay: 0.6 }}
              >

                <label htmlFor="confirmationPassword">{t('auth.confirmPassword')}</label>
                <Field
                  name="confirmationPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder={t('auth.confirmPasswordPlaceholder')}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <RiEyeFill /> : <RiEyeCloseLine />}
                </button>
                <ErrorMessage name="confirmationPassword" component="div" className="auth-error" />
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


              <div className="auth-buttons-group">
                <motion.button
                  className="auth-btn auth-btn-primary"
                  type="submit"
                  disabled={isSubmitting || loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? t('auth.loading') : t('auth.signUp')}
                </motion.button>

                <GoogleLoginButton SignUp={true} />
              </div>

            </Form>
          )}
        </Formik>

        <motion.div
          className="auth-links"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <span onClick={onLogin}>{t('auth.alreadyHaveAccount')} {t('auth.login')}</span>
        </motion.div>
      </motion.div>
    </div>
  );
};



export default Signup; 