import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { motion } from "framer-motion";
import { FiSend, FiDownload, FiUpload, FiAlertTriangle, FiFileText, FiUser, FiMail, FiMapPin, FiCheckCircle } from "react-icons/fi";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../../services/api";
import { useCookies } from "react-cookie";
import { ToastOptions } from "../../helpers/ToastOptions";

export default function Feedback() {

    const MAX_FILE_SIZE = 30 * 1024;
    const [MegaBox] = useCookies(['MegaBox'])

    const validation = Yup.object({
        type: Yup.string().required("Required"),
        copyrightUrl: Yup.string().url("Must be a valid URL").required("Required"),
        copyrightOwnerName: Yup.string().required("Required"),
        relationshipWithContent: Yup.string().required("Required"),
        email: Yup.string().email("Invalid email").required("Required"),
        phoneNumber: Yup.string().required("Required"),
        country: Yup.string().required("Required"),
        province: Yup.string().required("Required"),
        streetAddress: Yup.string().required("Required"),
        city: Yup.string().required("Required"),
        postalCode: Yup.string().required("Required"),
        signature: Yup.string().required("Required"),
        agreement: Yup.bool().oneOf([true], "You must agree to continue"),

        file: Yup
            .mixed()
            .required("File is required")
            .test(
                "fileSize",
                "File size must be less than 30KB",
                value => value && value.size <= MAX_FILE_SIZE
            )
    });

    const [SendDataLoading, setSendDataLoading] = useState(false)

    const SendComp = async (values) => {
        try {

            if (!MegaBox.MegaBox) return toast.error("Please you should login first", ToastOptions("error"));

            setSendDataLoading(true)

            const formData = new FormData();

            formData.append("type", values.type);
            formData.append("copyrightUrl", values.copyrightUrl);
            formData.append("file", values.file); // file is already a File object
            formData.append("copyrightOwnerName", values.copyrightOwnerName);
            formData.append("relationshipWithContent", values.relationshipWithContent);
            formData.append("email", values.email);
            formData.append("phoneNumber", values.phoneNumber);
            formData.append("country", values.country);
            formData.append("province", values.province);
            formData.append("streetAddress", values.streetAddress);
            formData.append("city", values.city);
            formData.append("postalCode", values.postalCode);
            formData.append("signature", values.signature);
            formData.append("agreement", values.agreement.toString());

            const { data } = await axios.post(`${API_URL}/auth/report`, formData, {
                headers: {
                    Authorization: `Bearer ${MegaBox.MegaBox}`
                }
            });

            console.log(data);

            if (data?.message === "✅ تم إرسال البلاغ وحفظ الملف بنجاح.") {
                formik.resetForm();
                toast.success("Your complaint has been sent", ToastOptions("success"));
            } else {
                toast.error("Ther is something wrong", ToastOptions("error"));
            }

            setSendDataLoading(false)

        } catch (err) {
            console.log(err);
            setSendDataLoading(false)
        }
    }

    const formik = useFormik({
        initialValues: {
            type: "",
            copyrightUrl: "",
            file: null,
            copyrightOwnerName: "",
            relationshipWithContent: "",
            email: "",
            phoneNumber: "",
            country: "",
            province: "",
            streetAddress: "",
            city: "",
            postalCode: "",
            signature: "",
            agreement: false,
        },
        validationSchema: validation,
        onSubmit: SendComp
    });

    const handleDownload = () => {
        const link = document.createElement("a");
        link.href = "https://res.cloudinary.com/dn6149nzx/raw/upload/v1752321748/megabox-copyright-feedback-professional_sgcflc.csv";
        link.download = "MegaBox_Terms.docx"; // This is the suggested filename for the download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-8"
                >
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-red-100 rounded-full">
                            <FiAlertTriangle className="h-8 w-8 text-red-600" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Copyright Infringement Report
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Report copyright violations and help us maintain a safe platform for all users
                    </p>
                </motion.div>

                {/* Main Form */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden"
                >
                    <div className="bg-gradient-to-r from-red-600 to-red-700 px-8 py-6">
                        <div className="flex items-center space-x-4">
                            <FiFileText className="h-6 w-6 text-white" />
                            <div>
                                <h2 className="text-xl font-semibold text-white">Report Form</h2>
                                <p className="text-red-100 text-sm mt-1">
                                    Please provide accurate information to help us process your report
                                </p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={formik.handleSubmit} className="p-8 space-y-6">
                        {/* Type of Infringement */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 flex items-center">
                                <FiAlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                                Select the Type of Infringement
                            </label>
                            <select
                                name="type"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.type}
                                className={`w-full border rounded-lg px-4 py-3 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${formik.touched.type && formik.errors.type
                                        ? "border-red-500 bg-red-50"
                                        : "border-gray-300 hover:border-gray-400"
                                    }`}
                            >
                                <option value="">Select infringement type...</option>
                                <option value="Copyright">Copyright</option>
                                <option value="Trademark">Trademark</option>
                                <option value="Other">Other</option>
                            </select>
                            {formik.touched.type && formik.errors.type && (
                                <p className="text-red-500 text-sm flex items-center">
                                    <FiAlertTriangle className="h-3 w-3 mr-1" />
                                    {formik.errors.type}
                                </p>
                            )}
                        </div>

                        {/* Copyright content URL */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">
                                Copyright Content URL
                            </label>
                            <input
                                type="url"
                                name="copyrightUrl"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.copyrightUrl}
                                placeholder="https://example.com/infringing-content"
                                className={`w-full border rounded-lg px-4 py-3 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${formik.touched.copyrightUrl && formik.errors.copyrightUrl
                                        ? "border-red-500 bg-red-50"
                                        : "border-gray-300 hover:border-gray-400"
                                    }`}
                            />
                            {formik.touched.copyrightUrl && formik.errors.copyrightUrl && (
                                <p className="text-red-500 text-sm flex items-center">
                                    <FiAlertTriangle className="h-3 w-3 mr-1" />
                                    {formik.errors.copyrightUrl}
                                </p>
                            )}
                        </div>

                        {/* File Upload Section */}
                        <div className="space-y-4">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-blue-800 text-sm mb-4">
                                    Please download the template file first, fill in the infringing URLs you wish to remove, and then upload it.
                                </p>

                                <div className="flex flex-col sm:flex-row gap-3">
                                    <button
                                        type="button"
                                        onClick={handleDownload}
                                        className="flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
                                    >
                                        <FiDownload className="h-4 w-4" />
                                        Download Template File
                                    </button>

                                    <label className="flex items-center justify-center gap-2 border border-blue-600 text-blue-700 hover:bg-blue-50 transition-colors duration-200 rounded-lg py-2 px-4 cursor-pointer text-sm font-medium">
                                        <FiUpload className="h-4 w-4" />
                                        <span>Upload Completed File</span>
                                        <input
                                            type="file"
                                            accept=".csv,text/csv"
                                            name="file"
                                            onChange={(event) => {
                                                const file = event.currentTarget.files[0];
                                                formik.setFieldValue("file", file);
                                            }}
                                            className="hidden"
                                        />
                                    </label>
                                </div>

                                {/* Show uploaded file */}
                                {formik.values.file && (
                                    <div className="flex items-center gap-2 mt-3 bg-green-50 p-3 rounded-lg border border-green-200">
                                        <FiCheckCircle className="h-4 w-4 text-green-600" />
                                        <span className="text-sm text-green-700">{formik.values.file.name}</span>
                                        <button
                                            type="button"
                                            onClick={() => formik.setFieldValue("file", null)}
                                            className="text-red-500 hover:text-red-700 text-sm ml-auto"
                                            title="Remove file"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Owner/Agent Name */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 flex items-center">
                                <FiUser className="h-4 w-4 text-gray-500 mr-2" />
                                Copyright Owner/Agent Name
                            </label>
                            <input
                                type="text"
                                name="copyrightOwnerName"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.copyrightOwnerName}
                                placeholder="Enter full name"
                                className={`w-full border rounded-lg px-4 py-3 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${formik.touched.copyrightOwnerName && formik.errors.copyrightOwnerName
                                        ? "border-red-500 bg-red-50"
                                        : "border-gray-300 hover:border-gray-400"
                                    }`}
                            />
                            {formik.touched.copyrightOwnerName && formik.errors.copyrightOwnerName && (
                                <p className="text-red-500 text-sm flex items-center">
                                    <FiAlertTriangle className="h-3 w-3 mr-1" />
                                    {formik.errors.copyrightOwnerName}
                                </p>
                            )}
                        </div>

                        {/* Relationship with Content */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">
                                Relationship with Copyrighted Content
                            </label>
                            <input
                                type="text"
                                name="relationshipWithContent"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.relationshipWithContent}
                                placeholder="e.g., Copyright owner, Authorized agent"
                                className={`w-full border rounded-lg px-4 py-3 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${formik.touched.relationshipWithContent && formik.errors.relationshipWithContent
                                        ? "border-red-500 bg-red-50"
                                        : "border-gray-300 hover:border-gray-400"
                                    }`}
                            />
                            {formik.touched.relationshipWithContent && formik.errors.relationshipWithContent && (
                                <p className="text-red-500 text-sm flex items-center">
                                    <FiAlertTriangle className="h-3 w-3 mr-1" />
                                    {formik.errors.relationshipWithContent}
                                </p>
                            )}
                        </div>

                        {/* Contact Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700 flex items-center">
                                    <FiMail className="h-4 w-4 text-gray-500 mr-2" />
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.email}
                                    placeholder="your@email.com"
                                    className={`w-full border rounded-lg px-4 py-3 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${formik.touched.email && formik.errors.email
                                            ? "border-red-500 bg-red-50"
                                            : "border-gray-300 hover:border-gray-400"
                                        }`}
                                />
                                {formik.touched.email && formik.errors.email && (
                                    <p className="text-red-500 text-sm flex items-center">
                                        <FiAlertTriangle className="h-3 w-3 mr-1" />
                                        {formik.errors.email}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">
                                    Phone Number
                                </label>
                                <input
                                    type="text"
                                    name="phoneNumber"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.phoneNumber}
                                    placeholder="+1 (555) 123-4567"
                                    className={`w-full border rounded-lg px-4 py-3 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${formik.touched.phoneNumber && formik.errors.phoneNumber
                                            ? "border-red-500 bg-red-50"
                                            : "border-gray-300 hover:border-gray-400"
                                        }`}
                                />
                                {formik.touched.phoneNumber && formik.errors.phoneNumber && (
                                    <p className="text-red-500 text-sm flex items-center">
                                        <FiAlertTriangle className="h-3 w-3 mr-1" />
                                        {formik.errors.phoneNumber}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Address Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                <FiMapPin className="h-5 w-5 text-gray-500 mr-2" />
                                Address Information
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">Country</label>
                                    <input
                                        type="text"
                                        name="country"
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.country}
                                        placeholder="United States"
                                        className={`w-full border rounded-lg px-4 py-3 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${formik.touched.country && formik.errors.country
                                                ? "border-red-500 bg-red-50"
                                                : "border-gray-300 hover:border-gray-400"
                                            }`}
                                    />
                                    {formik.touched.country && formik.errors.country && (
                                        <p className="text-red-500 text-sm flex items-center">
                                            <FiAlertTriangle className="h-3 w-3 mr-1" />
                                            {formik.errors.country}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">Province/State</label>
                                    <input
                                        type="text"
                                        name="province"
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.province}
                                        placeholder="California"
                                        className={`w-full border rounded-lg px-4 py-3 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${formik.touched.province && formik.errors.province
                                                ? "border-red-500 bg-red-50"
                                                : "border-gray-300 hover:border-gray-400"
                                            }`}
                                    />
                                    {formik.touched.province && formik.errors.province && (
                                        <p className="text-red-500 text-sm flex items-center">
                                            <FiAlertTriangle className="h-3 w-3 mr-1" />
                                            {formik.errors.province}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">Street Address</label>
                                    <input
                                        type="text"
                                        name="streetAddress"
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.streetAddress}
                                        placeholder="123 Main Street"
                                        className={`w-full border rounded-lg px-4 py-3 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${formik.touched.streetAddress && formik.errors.streetAddress
                                                ? "border-red-500 bg-red-50"
                                                : "border-gray-300 hover:border-gray-400"
                                            }`}
                                    />
                                    {formik.touched.streetAddress && formik.errors.streetAddress && (
                                        <p className="text-red-500 text-sm flex items-center">
                                            <FiAlertTriangle className="h-3 w-3 mr-1" />
                                            {formik.errors.streetAddress}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">City</label>
                                    <input
                                        type="text"
                                        name="city"
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.city}
                                        placeholder="San Francisco"
                                        className={`w-full border rounded-lg px-4 py-3 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${formik.touched.city && formik.errors.city
                                                ? "border-red-500 bg-red-50"
                                                : "border-gray-300 hover:border-gray-400"
                                            }`}
                                    />
                                    {formik.touched.city && formik.errors.city && (
                                        <p className="text-red-500 text-sm flex items-center">
                                            <FiAlertTriangle className="h-3 w-3 mr-1" />
                                            {formik.errors.city}
                                        </p>
                                    )}
                                </div>

                                <div className="md:col-span-2 space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">Postal Code</label>
                                    <input
                                        type="text"
                                        name="postalCode"
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.postalCode}
                                        placeholder="94105 (or -- if not applicable)"
                                        className={`w-full border rounded-lg px-4 py-3 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${formik.touched.postalCode && formik.errors.postalCode
                                                ? "border-red-500 bg-red-50"
                                                : "border-gray-300 hover:border-gray-400"
                                            }`}
                                    />
                                    {formik.touched.postalCode && formik.errors.postalCode && (
                                        <p className="text-red-500 text-sm flex items-center">
                                            <FiAlertTriangle className="h-3 w-3 mr-1" />
                                            {formik.errors.postalCode}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Signature */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">
                                Signature
                            </label>
                            <input
                                type="text"
                                name="signature"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.signature}
                                placeholder="Your full name as signature"
                                className={`w-full border rounded-lg px-4 py-3 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${formik.touched.signature && formik.errors.signature
                                        ? "border-red-500 bg-red-50"
                                        : "border-gray-300 hover:border-gray-400"
                                    }`}
                            />
                            {formik.touched.signature && formik.errors.signature && (
                                <p className="text-red-500 text-sm flex items-center">
                                    <FiAlertTriangle className="h-3 w-3 mr-1" />
                                    {formik.errors.signature}
                                </p>
                            )}
                        </div>

                        {/* Agreement */}
                        <div className="space-y-4">
                            <div className="flex items-start space-x-3">
                                <input
                                    id="agreement"
                                    name="agreement"
                                    type="checkbox"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    checked={formik.values.agreement}
                                    className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                />
                                <label htmlFor="agreement" className="text-sm text-gray-700">
                                    I have read and agree to the terms and conditions.
                                </label>
                            </div>
                            {formik.touched.agreement && formik.errors.agreement && (
                                <p className="text-red-500 text-sm flex items-center">
                                    <FiAlertTriangle className="h-3 w-3 mr-1" />
                                    {formik.errors.agreement}
                                </p>
                            )}

                            {/* Agreement Notice */}
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-900 mb-3">Agreement Notice:</h4>
                                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                                    <li>
                                        The information in this form is accurate and I am the owner/agent of an exclusive right that is allegedly infringed. If there is perjury, I am willing to bear legal responsibility.
                                    </li>
                                    <li>
                                        I have a belief that the use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law.
                                    </li>
                                </ol>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={SendDataLoading}
                            className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white font-semibold py-4 rounded-lg hover:bg-primary-700 transition-colors duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <FiSend className="h-5 w-5" />
                            {SendDataLoading ? "Submitting Report..." : "Submit Report"}
                        </motion.button>
                    </form>
                </motion.div>

                {/* Back to Home */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="text-center mt-8"
                >
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors duration-200"
                    >
                        ← Back to Main Page
                    </Link>
                </motion.div>
            </div>
        </div>
    );
}
