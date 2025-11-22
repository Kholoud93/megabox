import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { motion } from "framer-motion";
import "./Auth.scss";

const ConfirmEmail = ({ email, onConfirm, onResend, loading, error }) => {
  const initialValues = { code: "" };

  const validationSchema = Yup.object({
    code: Yup.string()
      .required("OTP code is required")
      .matches(/^\d{6}$/, "OTP must be 6 digits")
  });

  const handleSubmit = async (values, { setSubmitting, setErrors }) => {
    try {
      await onConfirm(values.code);
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const resendOtp = async () => {
    if (onResend) {
      await onResend();
    }
  }

  return (
    <div className="auth-container">
      <motion.div className="auth-card" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="auth-title">Confirm Your Email</h2>
        <p className="auth-info">A confirmation code was sent to <b>{email}</b></p>
        {error && <div className="auth-error">{error}</div>}
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, errors }) => (
            <Form className="auth-form">
              <div className="auth-field">
                <label htmlFor="code">Confirmation Code</label>
                <Field
                  name="code"
                  type="text"
                  placeholder="Enter 6-digit code"
                  maxLength="6"
                />
                <ErrorMessage name="code" component="div" className="auth-error" />
              </div>
              {errors.submit && (
                <div className="auth-error">{errors.submit}</div>
              )}
              <button
                className="auth-btn auth-btn-primary"
                type="submit"
                disabled={isSubmitting || loading}
              >
                {loading ? 'Verifying...' : 'Confirm'}
              </button>
              <button
                className="auth-btn auth-btn-secondary"
                type="button"
                onClick={resendOtp}
                disabled={loading}
              >
                Resend Code
              </button>
            </Form>
          )}
        </Formik>
      </motion.div>
    </div>
  );
};

export default ConfirmEmail; 