import { motion } from 'framer-motion';
import './HowItWorks.scss';
import step1 from '../../assets/How_it_works/Image upload-bro.svg';
import step2 from '../../assets/How_it_works/Organizing projects-rafiki.svg';
import step3 from '../../assets/How_it_works/Cloud sync-rafiki.svg';

const steps = [
    {
        image: step1,
        title: 'Sign Up & Upload',
        desc: 'Create your free account and upload your first video in seconds. Our intuitive interface makes it easy to get started.',
    },
    {
        image: step2,
        title: 'Organize & Manage',
        desc: 'Easily organize your videos into folders and manage your content. Keep everything tidy and accessible.',

    },
    {
        image: step3,
        title: 'Stream or Share',
        desc: 'Stream your videos instantly or share them securely with others. Control who has access to your content.',
    }
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.3
        }
    }
};

const textVariants = {
    hidden: { opacity: 0, x: -60 },
    visible: (i) => ({
        opacity: 1,
        x: 0,
        transition: {
            delay: i * 0.2,
            duration: 0.7,
            type: 'spring',
            stiffness: 60
        }
    })
};

const imageVariants = {
    hidden: { opacity: 0, x: 60 },
    visible: (i) => ({
        opacity: 1,
        x: 0,
        transition: {
            delay: i * 0.2 + 0.1,
            duration: 0.7,
            type: 'spring',
            stiffness: 60
        }
    })
};

const titleVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            type: 'spring',
            stiffness: 70
        }
    }
};

const HowItWorks = () => (
    <section className="howitworks">
        <div className="howitworks__container">
            <motion.h2 
                className="howitworks__title"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={titleVariants}
            >
                How It Works
            </motion.h2>
            <motion.div 
                className="howitworks__steps"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
            >
                {steps.map((step, idx) => (
                    <div className="howitworks__row" key={idx}>
                        <motion.div
                            className="howitworks__text"
                            custom={idx}
                            variants={textVariants}
                        >
                            <div className="howitworks__step-icon" style={{ fontSize: '2rem', marginBottom: '1rem' }}>
                                {step.icon}
                            </div>
                            <h3 className="howitworks__step-title">{step.title}</h3>
                            <p className="howitworks__step-desc">{step.desc}</p>
                        </motion.div>
                        <motion.div
                            className="howitworks__image-wrapper"
                            custom={idx}
                            variants={imageVariants}
                        >
                            <img className="howitworks__image" src={step.image} alt={step.title} />
                        </motion.div>
                    </div>
                ))}
            </motion.div>
        </div>
    </section>
);

export default HowItWorks; 