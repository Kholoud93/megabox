import './Features.scss';
import { motion } from 'framer-motion';

const features = [
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 5v14l11-7z" fill="currentColor" />
      </svg>
    ),
    title: 'Instant Video Playback',
    desc: 'Stream your videos instantly from anywhere, on any device, with no buffering.'
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z" fill="currentColor" />
      </svg>
    ),
    title: 'Secure Cloud Storage',
    desc: 'Your files are encrypted and safely stored in the cloud, accessible only by you.'
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z" fill="currentColor" />
      </svg>
    ),
    title: 'Easy Upload & Share',
    desc: 'Upload videos with a single click and share them securely with your team or friends.'
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14zM5 10h9v2H5zm0-3h9v2H5z" fill="currentColor" />
      </svg>
    ),
    title: 'HD & 4K Support',
    desc: 'Enjoy your videos in stunning HD and 4K quality, with adaptive streaming.'
  }
];

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.2,
      duration: 0.7,
      type: 'spring',
      stiffness: 60
    }
  })
};

const Features = () => (
  <section className="features">
    <div className="features__container">
      <h2 className="features__title">Features</h2>
      <div className="features__grid">
        {features.map((feature, idx) => (
          <motion.div
            className="feature-card"
            key={idx}
            custom={idx}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            variants={cardVariants}
          >
            <div className="feature-card__icon">{feature.icon}</div>
            <h3 className="feature-card__title">{feature.title}</h3>
            <p className="feature-card__desc">{feature.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default Features; 