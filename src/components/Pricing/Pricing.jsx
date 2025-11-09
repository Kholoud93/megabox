import React from "react";
import "./Pricing.scss";
import { Link } from "react-router-dom";

const plans = [
    {
        name: "Views Plan",
        features: [
            "Pay per thousand views (CPM)",
            "Competitive rates vary by country",
            "Ability to display in-video ads",
            "Detailed viewer analytics",
            "Withdraw earnings upon reaching minimum threshold",
            "24/7 technical support"
        ],
        highlighted: true
    },
    {
        name: "Watching Plan",
        features: [
            "Pay per direct app install (CPI)",
            "Competitive rates vary by country",
            "Detailed conversion statistics",
            "Unique referral links",
            "Accurate tracking of downloads",
            "24/7 technical support"
        ],
        highlighted: false
    }
];

const Pricing = () => {
    return (
        <section id="pricing" className="pricing">
            <div className="pricing__container">
                <h2 className="pricing__title">Choose Your Plan</h2>
                <p className="pricing__subtitle">Flexible options for your needs</p>

                <div className="pricing__cards">
                    {plans.map((plan) => (
                        <div
                            className={`pricing__card${plan.highlighted ? " pricing__card--highlighted" : ""}`}
                            key={plan.name}
                        >
                            <h3 className="pricing__plan-name">{plan.name}</h3>
                            <ul className="pricing__features">
                                {plan.features.map((feature, i) => (
                                    <li key={i}>{feature}</li>
                                ))}
                            </ul>
                            <Link to={'/Partners'} className="pricing__button">
                                {plan.highlighted ? "Get Started" : "Choose Plan"}
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Pricing;
