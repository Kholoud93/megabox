import React from "react";
import Footer from "../../components/Footer/Footer";

const PrivacyPolicy = () => {
    return (
        <>
            <main
                dir="ltr"
                className="max-w-4xl py-[140px] mx-auto lg:px-0 px-5 text-left text-gray-800 leading-loose"
            >
                <h1 className="text-3xl font-bold border-b-2 border-gray-200 pb-2 mb-6">
                    Privacy Policy - MegaBox
                </h1>

                <p>Release Date: To be determined later upon the official launch of the app at the end of this month.</p>
                <p>Effective Date: Will be announced in conjunction with the official launch of the MegaBox app.</p>

                <p>
                    Welcome to MegaBox, a product of MegaTech Egypt ("MegaBox", "we", or "the Company"). We are glad you chose to use our services. We place the highest importance on protecting your privacy and are committed to taking all legal, technical, and organizational measures to keep your personal data secure and to handle it transparently.
                </p>

                <p>
                    This Privacy Policy explains how we collect, store, process, use, and share your personal data when you interact with us through our website, the MegaBox app, or any of our available services.
                </p>

                <p>
                    We fully recognize the importance of protecting your information in the digital world. For this reason, we commit to applying the following principles during all stages of processing your personal data:
                </p>
                <ul className="list-disc pl-5">
                    <li>Legality</li>
                    <li>Transparency</li>
                    <li>Data Minimization</li>
                    <li>Security</li>
                    <li>Consent</li>
                </ul>

                <p>
                    If you provide personal information about others through MegaBox (such as sharing files or sending invitations), you are responsible for obtaining their consent. We reserve the right to verify the legality of the source.
                </p>

                <hr className="my-6" />

                <h2 className="text-2xl font-bold border-b-2 border-gray-200 pb-2">
                    Types of Information We Collect and Why
                </h2>

                <p>
                    We collect various types of data, whether you provide it directly or it is automatically collected during your use of our services, in order to improve your experience, protect service security, and deliver advanced and personalized functionality.
                </p>

                <h3 className="text-xl font-bold mt-4">Collected Information and Purpose:</h3>

                <div className="overflow-x-auto my-4">
                    <table className="w-full border border-gray-300 text-left">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-3 border">Type of Information</th>
                                <th className="p-3 border">Description</th>
                                <th className="p-3 border">Purpose of Collection and Processing</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                [
                                    "Account Information",
                                    "Such as email, mobile phone number, or social media account data upon registration.",
                                    "Used to activate the account, verify identity, secure the account, send notifications, and provide account recovery services if you forget your password."
                                ],
                                [
                                    "User Content",
                                    "All files and folders you store on MegaBox, such as images, documents, videos, and audio files.",
                                    "We store this content and provide features such as file synchronization across devices, sharing, quick access, and ensuring data security."
                                ],
                                [
                                    "Usage Data",
                                    "Activities within your account, such as uploading, deleting, sharing, or modifying files.",
                                    "Used to monitor performance, improve service quality, personalize experiences, and detect unusual or suspicious activity."
                                ],
                                [
                                    "Device Information",
                                    "IP address, device type, operating system version, browser, language settings, and geolocation (with your permission).",
                                    "Used to secure your account, improve experience, and resolve technical or performance issues."
                                ],
                                [
                                    "Cookies",
                                    "Small files saved on your device to improve performance and remember your preferences.",
                                    "Used for auto-login, faster navigation, content personalization, and usage analysis."
                                ],
                                [
                                    "Contact Data",
                                    "With your permission, we can access your address book to facilitate invitations and collaboration.",
                                    "Used only to enable sharing features easily and securely; we don’t store or share this data without your consent."
                                ],
                                [
                                    "Clipboard Data",
                                    "When copying a link or invitation code.",
                                    "We read the clipboard to help you open the relevant link or file only."
                                ]
                            ].map(([type, desc, purpose]) => (
                                <tr key={type}>
                                    <td className="p-3 border align-top">{type}</td>
                                    <td className="p-3 border align-top">{desc}</td>
                                    <td className="p-3 border align-top">{purpose}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <p>
                    We use smart analytics technologies (such as usage reports, automatic personalization, and behavioral classification) to deliver content and recommendations tailored to your preferences. You can decline this type of analysis at any time.
                </p>

                <hr className="my-6" />

                <h2 className="text-2xl font-bold border-b-2 border-gray-200 pb-2">
                    Sharing Personal Information with Third Parties
                </h2>

                <p>
                    We do not share your information without your consent, except in cases of legal or humanitarian necessity:
                </p>
                <ol className="list-decimal pl-5">
                    <li>Compliance with government authorities under applicable laws or regulations.</li>
                    <li>Protecting the life, physical safety, or property of an individual from serious risk.</li>
                    <li>Public health measures or protection of vulnerable groups.</li>
                </ol>

                <p>We follow the data minimization principle and record every sharing event, including:</p>
                <ul className="list-disc pl-5">
                    <li>Name and contact of the recipient</li>
                    <li>Purpose of processing</li>
                    <li>Data types</li>
                    <li>Recipient’s location</li>
                    <li>Security guarantees</li>
                    <li>Retention period</li>
                    <li>Technical and organizational measures</li>
                </ul>

                <hr className="my-6" />

                <h2 className="text-2xl font-bold border-b-2 border-gray-200 pb-2">
                    Sharing Information with Other Users
                </h2>
                <p>When you use collaboration features, the following may be displayed:</p>
                <ul className="list-disc pl-5">
                    <li>Username</li>
                    <li>Email address (depending on your settings)</li>
                    <li>Device type</li>
                    <li>Activity log related to shared files</li>
                </ul>
                <p>You can adjust visibility permissions in your account sharing settings at any time.</p>

                <hr className="my-6" />

                <h2 className="text-2xl font-bold border-b-2 border-gray-200 pb-2">
                    Sharing Data with Service Partners
                </h2>
                <p>
                    We may share your data with:
                </p>
                <ul className="list-disc pl-5">
                    <li>Technical support providers</li>
                    <li>Cloud computing providers</li>
                    <li>Payment processors</li>
                    <li>Identity verification partners</li>
                </ul>
                <p>
                    All sharing is governed by strict agreements and clear protection clauses.
                </p>
                <p>
                    When using Google or Apple login, we share your information in accordance with their privacy policies.
                </p>

                <hr className="my-6" />

                <h2 className="text-2xl font-bold border-b-2 border-gray-200 pb-2">
                    Data Protection and Storage
                </h2>
                <p>We use:</p>
                <ul className="list-disc pl-5">
                    <li>Encryption during transfer and storage</li>
                    <li>Two-factor authentication</li>
                    <li>Unauthorized access monitoring</li>
                    <li>Dedicated security teams</li>
                </ul>
                <p>Your data is deleted upon your request within 30 days, unless laws require retention.</p>

                <hr className="my-6" />

                <h2 className="text-2xl font-bold border-b-2 border-gray-200 pb-2">
                    Storage and Processing Location
                </h2>
                <p>
                    Your data is stored on servers in Japan. We ensure the same security level when transferring data to any external party.
                </p>

                <hr className="my-6" />

                <h2 className="text-2xl font-bold border-b-2 border-gray-200 pb-2">
                    Controlling Your Information
                </h2>
                <p>You can exercise the following rights:</p>
                <ol className="list-decimal pl-5">
                    <li>Request access to your information</li>
                    <li>Request correction or completion</li>
                    <li>Request deletion</li>
                    <li>Withdraw consent</li>
                    <li>Delete your account</li>
                    <li>Request a copy or transfer to another party</li>
                </ol>
                <p>Requests are processed within a reasonable time, and we will inform you if any reason prevents approval.</p>

                <hr className="my-6" />

                <h2 className="text-2xl font-bold border-b-2 border-gray-200 pb-2">
                    Changes
                </h2>
                <p>
                    If MegaBox is merged or sold, data will be transferred securely to the new entity with prior notice to you.
                </p>

                <hr className="my-6" />

                <h2 className="text-2xl font-bold mt-10">Contact Us</h2>
                <p>If you have questions or requests, contact us via:</p>
                <p>
                    Email:{" "}
                    <a
                        href="mailto:support@megabox.com"
                        className="text-blue-600 underline"
                    >
                        support@megabox.com
                    </a>
                </p>
                <p>We will respond within 7 business days.</p>

                <hr className="my-6" />

                <p className="bg-gray-100 border-l-4 border-blue-500 p-4 mt-6">
                    This document represents the official privacy policy of the MegaBox app and is legally binding from the date of the official launch.
                </p>
            </main>
            <Footer />
        </>
    );
};

export default PrivacyPolicy;
