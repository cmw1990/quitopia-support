import React from 'react';
import { Link } from 'react-router-dom';

const AppFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-50 border-t border-gray-100 py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Mission Fresh</h3>
            <p className="text-gray-600 text-sm">
              Your journey to a healthier, fresher life starts here.
              We're with you every step of the way.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Features</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/dashboard" className="text-gray-600 hover:text-indigo-600 transition">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/health" className="text-gray-600 hover:text-indigo-600 transition">
                  Health Tracking
                </Link>
              </li>
              <li>
                <Link to="/community" className="text-gray-600 hover:text-indigo-600 transition">
                  Community Support
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/help" className="text-gray-600 hover:text-indigo-600 transition">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/articles" className="text-gray-600 hover:text-indigo-600 transition">
                  Articles
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-600 hover:text-indigo-600 transition">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="text-gray-600 hover:text-indigo-600 transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-600 hover:text-indigo-600 transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-600 hover:text-indigo-600 transition">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-gray-500">
            © {currentYear} Mission Fresh. All rights reserved.
          </p>
          
          <div className="mt-4 sm:mt-0 flex space-x-6">
            <a href="https://twitter.com" className="text-gray-400 hover:text-indigo-600 transition">
              Twitter
            </a>
            <a href="https://facebook.com" className="text-gray-400 hover:text-indigo-600 transition">
              Facebook
            </a>
            <a href="https://instagram.com" className="text-gray-400 hover:text-indigo-600 transition">
              Instagram
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default AppFooter; 