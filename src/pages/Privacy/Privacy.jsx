import React from "react";
import Footer from "../../components/Footer/Footer";
import { useLanguage } from "../../context/LanguageContext";
import './Privacy.scss';

const PrivacyPolicy = () => {
    const { t, language } = useLanguage();

    const infoTableData = [
        [t('privacy.accountInfo'), t('privacy.accountInfoDesc'), t('privacy.accountInfoPurpose')],
        [t('privacy.userContent'), t('privacy.userContentDesc'), t('privacy.userContentPurpose')],
        [t('privacy.usageData'), t('privacy.usageDataDesc'), t('privacy.usageDataPurpose')],
        [t('privacy.deviceInfo'), t('privacy.deviceInfoDesc'), t('privacy.deviceInfoPurpose')],
        [t('privacy.cookies'), t('privacy.cookiesDesc'), t('privacy.cookiesPurpose')],
        [t('privacy.contactData'), t('privacy.contactDataDesc'), t('privacy.contactDataPurpose')],
        [t('privacy.clipboardData'), t('privacy.clipboardDataDesc'), t('privacy.clipboardDataPurpose')]
    ];

    return (
        <>
            <main className="PrivacyPolicy" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                <div className="privacy-container">
                    <div className="privacy-header">
                        <h1>{t('privacy.title')}</h1>
                        <p className="privacy-meta">{t('privacy.releaseDate')}: {t('privacy.releaseDateValue')}</p>
                        <p className="privacy-meta">{t('privacy.effectiveDate')}: {t('privacy.effectiveDateValue')}</p>
                    </div>

                    <div className="privacy-content">
                        <p>{t('privacy.welcome')}</p>

                        <p>{t('privacy.intro')}</p>

                        <p>{t('privacy.principlesIntro')}</p>
                        <ul>
                            <li>{t('privacy.principle1')}</li>
                            <li>{t('privacy.principle2')}</li>
                            <li>{t('privacy.principle3')}</li>
                            <li>{t('privacy.principle4')}</li>
                            <li>{t('privacy.principle5')}</li>
                        </ul>

                        <p>{t('privacy.consentNote')}</p>

                        <hr />

                        <h2>{t('privacy.infoCollectionTitle')}</h2>

                        <p>{t('privacy.infoCollectionDesc')}</p>

                        <h3>{t('privacy.collectedInfoTitle')}</h3>

                        <div className="overflow-x-auto">
                            <table>
                                <thead>
                                    <tr>
                                        <th>{t('privacy.infoType')}</th>
                                        <th>{t('privacy.infoDescription')}</th>
                                        <th>{t('privacy.infoPurpose')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {infoTableData.map(([type, desc, purpose], index) => (
                                        <tr key={index}>
                                            <td>{type}</td>
                                            <td>{desc}</td>
                                            <td>{purpose}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <p>{t('privacy.analytics')}</p>

                        <hr />

                        <h2>{t('privacy.thirdPartyTitle')}</h2>

                        <p>{t('privacy.thirdPartyDesc')}</p>
                        <ol>
                            <li>{t('privacy.thirdParty1')}</li>
                            <li>{t('privacy.thirdParty2')}</li>
                            <li>{t('privacy.thirdParty3')}</li>
                        </ol>

                        <p>{t('privacy.minimizationNote')}</p>
                        <ul>
                            <li>{t('privacy.minimization1')}</li>
                            <li>{t('privacy.minimization2')}</li>
                            <li>{t('privacy.minimization3')}</li>
                            <li>{t('privacy.minimization4')}</li>
                            <li>{t('privacy.minimization5')}</li>
                            <li>{t('privacy.minimization6')}</li>
                            <li>{t('privacy.minimization7')}</li>
                        </ul>

                        <hr />

                        <h2>{t('privacy.userSharingTitle')}</h2>
                        <p>{t('privacy.userSharingDesc')}</p>
                        <ul>
                            <li>{t('privacy.userSharing1')}</li>
                            <li>{t('privacy.userSharing2')}</li>
                            <li>{t('privacy.userSharing3')}</li>
                            <li>{t('privacy.userSharing4')}</li>
                        </ul>
                        <p>{t('privacy.userSharingNote')}</p>

                        <hr />

                        <h2>{t('privacy.partnersTitle')}</h2>
                        <p>{t('privacy.partnersDesc')}</p>
                        <ul>
                            <li>{t('privacy.partners1')}</li>
                            <li>{t('privacy.partners2')}</li>
                            <li>{t('privacy.partners3')}</li>
                            <li>{t('privacy.partners4')}</li>
                        </ul>
                        <p>{t('privacy.partnersNote1')}</p>
                        <p>{t('privacy.partnersNote2')}</p>

                        <hr />

                        <h2>{t('privacy.protectionTitle')}</h2>
                        <p>{t('privacy.protectionDesc')}</p>
                        <ul>
                            <li>{t('privacy.protection1')}</li>
                            <li>{t('privacy.protection2')}</li>
                            <li>{t('privacy.protection3')}</li>
                            <li>{t('privacy.protection4')}</li>
                        </ul>
                        <p>{t('privacy.protectionNote')}</p>

                        <hr />

                        <h2>{t('privacy.storageTitle')}</h2>
                        <p>{t('privacy.storageDesc')}</p>

                        <hr />

                        <h2>{t('privacy.controllingTitle')}</h2>
                        <p>{t('privacy.controllingDesc')}</p>
                        <ol>
                            <li>{t('privacy.controlling1')}</li>
                            <li>{t('privacy.controlling2')}</li>
                            <li>{t('privacy.controlling3')}</li>
                            <li>{t('privacy.controlling4')}</li>
                            <li>{t('privacy.controlling5')}</li>
                            <li>{t('privacy.controlling6')}</li>
                        </ol>
                        <p>{t('privacy.controllingNote')}</p>

                        <hr />

                        <h2>{t('privacy.changesTitle')}</h2>
                        <p>{t('privacy.changesDesc')}</p>

                        <hr />

                        <h2>{t('privacy.contactTitle')}</h2>
                        <p>{t('privacy.contactDesc')}</p>
                        <p>
                            {t('privacy.contactEmail')}{" "}
                            <a href="mailto:support@megaboxapp.com">
                                support@megaboxapp.com
                            </a>
                        </p>
                        <p>{t('privacy.contactResponse')}</p>

                        <hr />

                        <p className="privacy-notice">
                            {t('privacy.footerNote')}
                        </p>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
};

export default PrivacyPolicy;
