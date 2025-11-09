import React from "react";
import Footer from "../../components/Footer/Footer";

export default function RemovalGuidelines() {
    return <>
        <div className="font-sans bg-gray-100 text-gray-800 py-[70px]">
            <div className="max-w-4xl mx-auto bg-white p-10 mt-10 mb-10 rounded-xl shadow-lg border border-gray-200">
                <h1 className="text-3xl font-bold text-center text-primary-800 mb-8 pb-4 border-b-4 border-primary-800 tracking-wide">
                    Removal Guidelines Policy – MegaBox
                </h1>

                <Section title="Summary">
                    <p>
                        <strong>MegaBox</strong> is firmly committed to protecting the{" "}
                        <strong>privacy of its platform users</strong>, and constantly
                        strives to provide a secure environment that respects applicable
                        legal and ethical standards both locally and internationally.
                    </p>
                    <p>
                        Although privacy is a core pillar of MegaBox services, the company
                        acknowledges that it may be subject to certain legal limitations in
                        specific cases, especially when protecting public safety or
                        investigating unlawful activities. Therefore, MegaBox provides this
                        guideline to explain how it handles{" "}
                        <strong>legal requests</strong> in criminal or civil matters.
                    </p>
                    <p>
                        This document aims to enhance <strong>transparency</strong> and{" "}
                        <strong>clarity</strong> with all parties, including authorities,
                        users, and partners. It ensures consistent and fair procedures when
                        disclosure or intervention is needed.
                    </p>
                    <div className="bg-primary-50 border-r-4 border-primary-500 p-5 mt-6 mb-6 rounded-md leading-relaxed">
                        <p>
                            It is important to clarify this document{" "}
                            <strong>does not create any legal obligations</strong> on
                            MegaBox, nor establish any basis for legal liability. All
                            contractual limitations in the Terms of Service apply equally.
                            MegaBox reserves the right to modify, replace, or withdraw this
                            document without prior notice.
                        </p>
                        <p>
                            If any conflict arises between this guide and the Terms of
                            Service or Privacy Policy, <strong>the Terms of Service prevail</strong>.
                        </p>
                    </div>
                    <p>
                        Unless required by law, MegaBox retains discretion to determine the
                        scope of disclosure in response to requests, considering the source
                        and purpose.
                    </p>
                    <p>
                        MegaBox recommends legal requestors{" "}
                        <strong>contact the company in advance</strong> before submitting
                        formal orders. This helps verify availability and avoid unnecessary
                        steps, especially in emergencies.
                    </p>
                    <p>
                        In critical situations threatening life or safety, MegaBox may
                        preserve data and take precautionary measures without a direct
                        court order, if sufficient guarantees are provided.
                    </p>
                    <p>
                        MegaBox commits, when possible, to{" "}
                        <strong>inform affected users</strong> unless prohibited by law or
                        official orders.
                    </p>
                    <p>
                        The most updated version is always available on the{" "}
                        <strong>official MegaBox website</strong>.
                    </p>
                </Section>

                <Separator />

                <Section title="Guiding Principles">
                    <p>
                        When handling disclosure requests, MegaBox operates from the
                        principle that user data is <strong>confidential</strong>. It is
                        disclosed only in clear cases requiring legal intervention.
                    </p>
                    <p>
                        MegaBox <strong>encrypts all files</strong>, and only users can
                        decrypt their content. The company cannot access encrypted files
                        unless the user shares public links, grants permissions, or
                        discloses credentials.
                    </p>
                    <p>
                        While MegaBox is subject to <strong>Japanese law</strong>, it may
                        consider requests from foreign authorities if accompanied by valid
                        documents.
                    </p>
                    <p>
                        MegaBox does not access files under investigation unless legally
                        justified. Such decisions rely on objective assessment.
                    </p>
                    <p>
                        MegaBox strives to <strong>notify affected users</strong> whenever
                        possible.
                    </p>
                </Section>

                <Separator />

                <Section title="Emergency Response">
                    <p>
                        Emergencies are defined as situations requiring{" "}
                        <strong>immediate intervention</strong> to protect life or prevent
                        serious harm. Japanese authorities may submit urgent requests with
                        written assurances.
                    </p>
                    <p>
                        If MegaBox finds the request credible, it may act without a formal
                        court order in good faith, including temporarily disabling access.
                    </p>
                    <p>
                        Requesting parties must{" "}
                        <strong>accept responsibility for accuracy</strong> and indemnify
                        MegaBox against consequences.
                    </p>
                    <p>
                        MegaBox coordinates with an authorized contact and provides
                        dedicated emergency channels.
                    </p>
                </Section>

                <Separator />

                <Section title="Prohibited Content">
                    <p>
                        MegaBox strictly prohibits activities that violate laws or promote
                        harm. Prohibited content includes:
                    </p>
                    <ul className="list-disc ml-6 space-y-2">
                        <li>
                            Content related to <strong>child sexual exploitation (CSAM)</strong>
                        </li>
                        <li>
                            Content involving <strong>harassment or direct threats</strong>
                        </li>
                        <li>
                            <strong>Terrorist or extremist materials</strong>
                        </li>
                        <li>
                            Depictions of <strong>sexual assault on animals</strong>
                        </li>
                        <li>
                            Material degrading <strong>human dignity or inciting hatred</strong>
                        </li>
                    </ul>
                    <p>
                        MegaBox reserves the right to remove content, suspend accounts, and
                        cooperate with authorities.
                    </p>
                </Section>

                <Separator />

                <Section title="Copyright Infringement Notices">
                    <p>
                        MegaBox processes <strong>copyright infringement notices</strong>{" "}
                        according to best practices and international standards. A detailed
                        form is provided on the website.
                    </p>
                    <p>
                        Rights holders must provide complete information, including
                        descriptions, links, and contact details:
                    </p>
                    <p className="font-bold text-primary-800">
                        <a
                            href="https://www.megabox.com/copyright-feedback"
                            target="_blank"
                            rel="noreferrer"
                            className="hover:underline"
                        >
                            🔗 https://www.megabox.com/copyright-feedback
                        </a>
                    </p>
                </Section>

                <Separator />

                <Section title="Other Intellectual Property Infringement">
                    <p>
                        MegaBox applies the same standards to other IP violations, such as
                        trademarks or patents.
                    </p>
                    <p>Please email reports to:</p>
                    <p className="font-bold text-primary-800">
                        <a
                            href="mailto:copyrightresponse@megabox.com"
                            className="hover:underline"
                        >
                            📧 copyrightresponse@megabox.com
                        </a>
                    </p>
                </Section>

                <Separator />

                <Section title="Civil IP Disputes">
                    <p>
                        In civil lawsuits alleging IP infringement, MegaBox handles requests
                        under Japanese law. This may include:
                    </p>
                    <ul className="list-disc ml-6 space-y-2">
                        <li>A court-issued disclosure order</li>
                        <li>An official witness summons</li>
                        <li>A sworn affidavit or agreed documents</li>
                    </ul>
                    <p>
                        All procedures must comply with local court rules in Japan.
                    </p>
                </Section>

                <Separator />

                <Section title="Other Cases">
                    <p>
                        For scenarios not covered here, MegaBox acts only based on Japanese
                        law or recognized legal orders. It reserves discretion to decline
                        unsupported requests.
                    </p>
                    <p>
                        Technical capabilities remain a key factor, alongside compliance
                        with the Terms of Service and Privacy Policy.
                    </p>
                </Section>
            </div>
        </div>
        <Footer />

    </>
}

function Section({ title, children }) {
    return (
        <div className="mt-10">
            <h2 className="text-2xl font-bold text-primary-600 mb-4 pb-2 border-b border-gray-200 relative">
                {title}
                <span className="absolute left-0 bottom-0 w-12 h-1 bg-primary-600"></span>
            </h2>
            <div className="space-y-4 text-justify">{children}</div>
        </div>
    );
}

function Separator() {
    return (
        <hr className="my-12 border-0 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
    );
}
