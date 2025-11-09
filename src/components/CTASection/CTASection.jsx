import { motion } from 'framer-motion';
import './CTASection.scss';
import { Link } from 'react-router-dom';

const CTASection = () => {

  const buttonVariants = {
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.2
      }
    },
    tap: {
      scale: 0.95,
      transition: {
        duration: 0.1
      }
    }
  };

  const containerVariants = {
    hidden: {
      opacity: 0,
      y: 20
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="cta-wrapperr-2">
      <div className="cta-background">
        <section className="cta-section">
          <div className="cta-container">

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="cta-content"
            >
              <div className="cta-text-content">
                <h2 className="cta-title">
                  Ready to Get Started?
                </h2>
                <p className="cta-description">
                  Join our community today and experience the best service we have to offer.
                </p>
              </div>

              <div className="cta-action-content">
                <div className="cta-buttons">
                  <Link to="/signup">
                    <motion.button
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                      className="cta-button cta-button-primary"
                    >
                      Sign Up
                    </motion.button>
                  </Link>
                  <Link to="/login">
                    <motion.button
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                      className="cta-button cta-button-secondary"
                    >
                      Login
                    </motion.button>
                  </Link>
                </div>
              </div>
            </motion.div>

          </div>
        </section>
      </div>
    </div>
  );
};

export default CTASection; 