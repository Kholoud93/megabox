import './Features.scss';
import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import uploadingSvgContent from '../../assets/animations/uploading-animate.svg?raw';
import pressPlaySvgContent from '../../assets/animations/press-play-animate.svg?raw';
import mobileEncryptionSvgContent from '../../assets/animations/mobile-encryption-animate.svg?raw';
import webDevicesSvgContent from '../../assets/animations/web-devices-animate.svg?raw';
import { useLanguage } from '../../context/LanguageContext';
import { modifySvgToIndigo } from '../../utils/svgColorModifier';

// Import existing SVG images
import cloudSyncImage from '../../assets/How_it_works/Cloud sync-rafiki.svg';
import imageUploadImage from '../../assets/How_it_works/Image upload-bro.svg';
import organizingProjectsImage from '../../assets/How_it_works/Organizing projects-rafiki.svg';
import folderFilesImage from '../../assets/How_it_works/undraw_folder-files_5www.svg';

const sectionVariants = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

const imageVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.8,
    y: 30
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.4,
      delay: 0.1,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  },
  hover: {
    scale: 1.05,
    y: -10,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  float: {
    y: [0, -15, 0],
    rotate: [0, 2, -2, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const UploadingAnimation = () => {
  const svgRef = useRef(null);
  const modifiedSvgContent = modifySvgToIndigo(uploadingSvgContent);

  useEffect(() => {
    if (svgRef.current) {
      const svgElement = svgRef.current.querySelector('svg');
      if (svgElement) {
        svgElement.classList.add('animated');
      }
    }
  }, []);

  return (
    <div 
      className="cloud-computing-animation"
      ref={svgRef}
      dangerouslySetInnerHTML={{ __html: modifiedSvgContent }}
    />
  );
};

const PressPlayAnimation = () => {
  const svgRef = useRef(null);
  const modifiedSvgContent = modifySvgToIndigo(pressPlaySvgContent);

  useEffect(() => {
    if (svgRef.current) {
      const svgElement = svgRef.current.querySelector('svg');
      if (svgElement) {
        svgElement.classList.add('animated');
      }
    }
  }, []);

  return (
    <div 
      className="cloud-computing-animation"
      ref={svgRef}
      dangerouslySetInnerHTML={{ __html: modifiedSvgContent }}
    />
  );
};

const MobileEncryptionAnimation = () => {
  const svgRef = useRef(null);
  let modifiedSvgContent = modifySvgToIndigo(mobileEncryptionSvgContent);
  
  // Hide/remove mobile/tablet device elements by setting display:none
  // Look for tablet-related IDs and hide them
  modifiedSvgContent = modifiedSvgContent.replace(
    /<g[^>]*id="[^"]*[Tt]ablet[^"]*"[^>]*>/g,
    (match) => {
      if (match.includes('style=')) {
        return match.replace(/style="[^"]*"/, 'style="display:none"');
      }
      return match.replace('>', ' style="display:none">');
    }
  );

  useEffect(() => {
    if (svgRef.current) {
      const svgElement = svgRef.current.querySelector('svg');
      if (svgElement) {
        svgElement.classList.add('animated');
        
        // Also try to hide tablet elements via DOM manipulation
        const tabletElements = svgElement.querySelectorAll('[id*="tablet" i], [id*="Tablet"]');
        tabletElements.forEach((el) => {
          el.style.display = 'none';
        });
      }
    }
  }, []);

  return (
    <div 
      className="cloud-computing-animation"
      ref={svgRef}
      dangerouslySetInnerHTML={{ __html: modifiedSvgContent }}
    />
  );
};

const WebDevicesAnimation = () => {
  const svgRef = useRef(null);
  const modifiedSvgContent = modifySvgToIndigo(webDevicesSvgContent);

  useEffect(() => {
    if (svgRef.current) {
      const svgElement = svgRef.current.querySelector('svg');
      if (svgElement) {
        svgElement.classList.add('animated');
      }
    }
  }, []);

  return (
    <div 
      className="cloud-computing-animation"
      ref={svgRef}
      dangerouslySetInnerHTML={{ __html: modifiedSvgContent }}
    />
  );
};

const Features = () => {
  const { t, language } = useLanguage();

  const features = [
    {
      useAnimation: true,
      animationType: 'pressPlay',
      image: cloudSyncImage,
      descKey: 'features.feature1'
    },
    {
      useAnimation: true,
      animationType: 'mobileEncryption',
      image: organizingProjectsImage,
      descKey: 'features.feature2'
    },
    {
      useAnimation: true,
      image: imageUploadImage,
      descKey: 'features.feature3'
    },
    {
      useAnimation: true,
      animationType: 'webDevices',
      image: folderFilesImage,
      descKey: 'features.feature4'
    }
  ];

  return (
    <section className="features" id="features">
      <div className="features__container">
        {features.map((feature, idx) => {
          const isImageLeft = idx % 2 === 0;
          const isRTL = language === 'ar';
          // In RTL, reverse the image position logic
          const shouldImageBeLeft = isRTL ? !isImageLeft : isImageLeft;
          
          return (
            <motion.div
              key={idx}
              className={`features__section ${shouldImageBeLeft ? 'features__section--image-left' : 'features__section--image-right'}`}
              initial="hidden"
              whileInView="visible"
              viewport={{ 
                once: false, 
                amount: 0.2,
                margin: "-100px"
              }}
              variants={sectionVariants}
            >
            <motion.div
              className="features__animation-wrapper"
              initial="hidden"
              whileInView="visible"
              viewport={{ 
                once: false, 
                amount: 0.2,
                margin: "-100px"
              }}
              variants={imageVariants}
              whileHover="hover"
              animate={!feature.useAnimation ? "float" : undefined}
            >
              {feature.useAnimation ? (
                feature.animationType === 'pressPlay' ? (
                  <PressPlayAnimation />
                ) : feature.animationType === 'mobileEncryption' ? (
                  <MobileEncryptionAnimation />
                ) : feature.animationType === 'webDevices' ? (
                  <WebDevicesAnimation />
                ) : (
                  <UploadingAnimation />
                )
              ) : (
                <motion.img
                  src={feature.image}
                  alt={`Feature ${idx + 1}`}
                  className="features__image"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: false, amount: 0.2, margin: "-100px" }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                />
              )}
            </motion.div>
            <motion.div 
              className="features__content"
              initial={{ opacity: 0, x: shouldImageBeLeft ? (isRTL ? -30 : 30) : (isRTL ? 30 : -30) }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ 
                once: false, 
                amount: 0.2,
                margin: "-100px"
              }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <p className="features__description">{t(feature.descKey)}</p>
            </motion.div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default Features;
