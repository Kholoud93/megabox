import React from "react";
import Footer from "../../components/Footer/Footer";
import { useLanguage } from "../../context/LanguageContext";
import './RemovalPolicy.scss';

export default function RemovalGuidelines() {
    const { t, language } = useLanguage();

    return (
        <>
            <main className="RemovalPolicy" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                <div className="removal-container">
                    <div className="removal-header">
                        <h1>{t('removal.title')}</h1>
                    </div>

                    <div className="removal-content">
                        <Section title={t('removal.summary')}>
                            <p>{t('removal.summary1')}</p>
                            <p>{t('removal.summary2')}</p>
                            <p>{t('removal.summary3')}</p>
                            <div className="removal-notice">
                                <p>{t('removal.notice1')}</p>
                                <p>{t('removal.notice2')}</p>
                            </div>
                            <p>{t('removal.summary4')}</p>
                            <p>{t('removal.summary5')}</p>
                            <p>{t('removal.summary6')}</p>
                            <p>{t('removal.summary7')}</p>
                            <p>{t('removal.summary8')}</p>
                        </Section>

                        <Separator />

                        <Section title={t('removal.principles')}>
                            <p>{t('removal.principles1')}</p>
                            <p>{t('removal.principles2')}</p>
                            <p>{t('removal.principles3')}</p>
                            <p>{t('removal.principles4')}</p>
                            <p>{t('removal.principles5')}</p>
                        </Section>

                        <Separator />

                        <Section title={t('removal.emergency')}>
                            <p>{t('removal.emergency1')}</p>
                            <p>{t('removal.emergency2')}</p>
                            <p>{t('removal.emergency3')}</p>
                            <p>{t('removal.emergency4')}</p>
                        </Section>

                        <Separator />

                        <Section title={t('removal.prohibited')}>
                            <p>{t('removal.prohibited1')}</p>
                            <ul>
                                <li>{t('removal.prohibited2')}</li>
                                <li>{t('removal.prohibited3')}</li>
                                <li>{t('removal.prohibited4')}</li>
                                <li>{t('removal.prohibited5')}</li>
                                <li>{t('removal.prohibited6')}</li>
                            </ul>
                            <p>{t('removal.prohibited7')}</p>
                        </Section>

                        <Separator />

                        <Section title={t('removal.copyright')}>
                            <p>{t('removal.copyright1')}</p>
                            <p>{t('removal.copyright2')}</p>
                            <p>
                                <strong>
                                    <a
                                        href="https://www.megabox.com/copyright-feedback"
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        🔗 https://www.megabox.com/copyright-feedback
                                    </a>
                                </strong>
                            </p>
                        </Section>

                        <Separator />

                        <Section title={t('removal.otherIP')}>
                            <p>{t('removal.otherIP1')}</p>
                            <p>{t('removal.otherIP2')}</p>
                            <p>
                                <strong>
                                    <a href="mailto:copyrightresponse@megaboxapp.com">
                                        📧 copyrightresponse@megaboxapp.com
                                    </a>
                                </strong>
                            </p>
                        </Section>

                        <Separator />

                        <Section title={t('removal.civil')}>
                            <p>{t('removal.civil1')}</p>
                            <ul>
                                <li>{t('removal.civil2')}</li>
                                <li>{t('removal.civil3')}</li>
                                <li>{t('removal.civil4')}</li>
                            </ul>
                            <p>{t('removal.civil5')}</p>
                        </Section>

                        <Separator />

                        <Section title={t('removal.other')}>
                            <p>{t('removal.other1')}</p>
                            <p>{t('removal.other2')}</p>
                        </Section>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}

function Section({ title, children }) {
    return (
        <div>
            <h2>{title}</h2>
            <div>{children}</div>
        </div>
    );
}

function Separator() {
    return <hr />;
}
