import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import './EmptyState.scss';

export default function EmptyState({
    icon: Icon,
    title,
    message,
    buttonText,
    onButtonClick,
    buttonLink
}) {
    const navigate = useNavigate();

    const handleClick = () => {
        if (onButtonClick) {
            onButtonClick();
        } else if (buttonLink) {
            navigate(buttonLink);
        }
    };

    return (
        <motion.div
            className="empty-state"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
                duration: 0.6,
                ease: [0.25, 0.46, 0.45, 0.94]
            }}
        >
            {Icon && (
                <motion.div
                    className="empty-state__icon"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                        delay: 0.2,
                        type: "spring",
                        stiffness: 200,
                        damping: 15
                    }}
                >
                    <Icon />
                </motion.div>
            )}
            <h3 className="empty-state__title">{title}</h3>
            <p className="empty-state__message">{message}</p>
            {buttonText && (
                <motion.button
                    className="empty-state__button"
                    onClick={handleClick}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    {buttonText}
                </motion.button>
            )}
        </motion.div>
    );
}

