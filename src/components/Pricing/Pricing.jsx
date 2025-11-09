import React from "react";
import "./Pricing.scss";
import { Link } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";

const Pricing = () => {
    const { t } = useLanguage();

    const plans = [
        {
            nameKey: "pricing.plans.viewsPlan.name",
            features: [
                "pricing.plans.viewsPlan.features.feature1",
                "pricing.plans.viewsPlan.features.feature2",
                "pricing.plans.viewsPlan.features.feature3",
                "pricing.plans.viewsPlan.features.feature4",
                "pricing.plans.viewsPlan.features.feature5",
                "pricing.plans.viewsPlan.features.feature6"
            ],
            highlighted: true
        },
        {
            nameKey: "pricing.plans.watchingPlan.name",
            features: [
                "pricing.plans.watchingPlan.features.feature1",
                "pricing.plans.watchingPlan.features.feature2",
                "pricing.plans.watchingPlan.features.feature3",
                "pricing.plans.watchingPlan.features.feature4",
                "pricing.plans.watchingPlan.features.feature5",
                "pricing.plans.watchingPlan.features.feature6"
            ],
            highlighted: false
        }
    ];

    return (
        <section id="pricing" className="pricing">
            <div className="pricing__container">
                <h2 className="pricing__title">{t("pricing.title")}</h2>
                <p className="pricing__subtitle">{t("pricing.subtitle")}</p>

                <div className="pricing__cards">
                    {plans.map((plan, index) => (
                        <div
                            className={`pricing__card${plan.highlighted ? " pricing__card--highlighted" : ""}`}
                            key={index}
                        >
                            <h3 className="pricing__plan-name">{t(plan.nameKey)}</h3>
                            <ul className="pricing__features">
                                {plan.features.map((featureKey, i) => (
                                    <li key={i}>{t(featureKey)}</li>
                                ))}
                            </ul>
                            <Link to={'/Partners'} className="pricing__button">
                                {plan.highlighted ? t("pricing.getStarted") : t("pricing.choosePlan")}
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Pricing;
