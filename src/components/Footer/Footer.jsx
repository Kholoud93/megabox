import React from "react";
import "./Footer.scss";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiMail, FiPhone, FiMapPin, FiTwitter, FiFacebook, FiInstagram, FiLinkedin } from "react-icons/fi";

const Footer = () => (
  <footer className="footer">
    <div className="footer__container">
      {/* Main Footer Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
        {/* Brand Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-1"
        >
          <div className="footer__brand mb-4">MegaBox</div>
          <p className="text-gray-300 text-sm leading-relaxed mb-6">
            Secure cloud storage and file sharing platform. Store, share, and earn with confidence.
          </p>
          <div className="flex space-x-4">
            <motion.a
              href="#"
              whileHover={{ y: -2 }}
              className="w-10 h-10 bg-white bg-opacity-10 rounded-full flex items-center justify-center hover:bg-opacity-20 transition-all duration-200"
            >
              <FiTwitter className="w-5 h-5 text-white" />
            </motion.a>
            <motion.a
              href="#"
              whileHover={{ y: -2 }}
              className="w-10 h-10 bg-white bg-opacity-10 rounded-full flex items-center justify-center hover:bg-opacity-20 transition-all duration-200"
            >
              <FiFacebook className="w-5 h-5 text-white" />
            </motion.a>
            <motion.a
              href="#"
              whileHover={{ y: -2 }}
              className="w-10 h-10 bg-white bg-opacity-10 rounded-full flex items-center justify-center hover:bg-opacity-20 transition-all duration-200"
            >
              <FiInstagram className="w-5 h-5 text-white" />
            </motion.a>
            <motion.a
              href="#"
              whileHover={{ y: -2 }}
              className="w-10 h-10 bg-white bg-opacity-10 rounded-full flex items-center justify-center hover:bg-opacity-20 transition-all duration-200"
            >
              <FiLinkedin className="w-5 h-5 text-white" />
            </motion.a>
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
          <nav className="space-y-3">
            <Link to={"/"} className="footer__link block hover:text-white transition-colors duration-200">
              Home
            </Link>
            <Link to={"/About"} className="footer__link block hover:text-white transition-colors duration-200">
              About
            </Link>
            <Link to={"/Partners"} className="footer__link block hover:text-white transition-colors duration-200">
              Partners
            </Link>
            <Link to={"/Privacy"} className="footer__link block hover:text-white transition-colors duration-200">
              Privacy Policy
            </Link>
          </nav>
        </motion.div>

        {/* Support */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h3 className="text-lg font-semibold text-white mb-4">Support</h3>
          <nav className="space-y-3">
            <Link to={"/Privacy-Removal"} className="footer__link block hover:text-white transition-colors duration-200">
              Removal Policy
            </Link>
            <Link to={"/copyright-feedback"} className="footer__link block hover:text-white transition-colors duration-200">
              Report Issue
            </Link>
            <a href="mailto:support@megabox.com" className="footer__link block hover:text-white transition-colors duration-200">
              Contact Support
            </a>
          </nav>
        </motion.div>

        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h3 className="text-lg font-semibold text-white mb-4">Contact</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <FiMail className="w-4 h-4 text-primary-300 flex-shrink-0" />
              <a href="mailto:support@megabox.com" className="footer__link text-sm hover:text-white transition-colors duration-200">
                support@megabox.com
              </a>
            </div>
            <div className="flex items-center space-x-3">
              <FiPhone className="w-4 h-4 text-primary-300 flex-shrink-0" />
              <span className="footer__link text-sm">+1 (555) 123-4567</span>
            </div>
            <div className="flex items-center space-x-3">
              <FiMapPin className="w-4 h-4 text-primary-300 flex-shrink-0" />
              <span className="footer__link text-sm">Tokyo, Japan</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="border-t border-white border-opacity-20 pt-6"
      >
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
          <p className="text-sm text-gray-300">
            &copy; {new Date().getFullYear()} MegaBox. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-4 text-sm">
            <Link to="/Privacy-Removal" className="text-gray-300 hover:text-white transition-colors duration-200">
              Removal Policy
            </Link>
            <Link to="/Privacy" className="text-gray-300 hover:text-white transition-colors duration-200">
              Privacy
            </Link>
            <Link to="/copyright-feedback" className="text-gray-300 hover:text-white transition-colors duration-200">
              Report
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  </footer>
);

export default Footer;
