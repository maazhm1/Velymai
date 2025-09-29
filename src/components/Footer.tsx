import React from 'react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="w-full mt-16 py-6 text-center text-muted-foreground text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p>
          © 2025 Maaz HM |{' '}
          <Link to="/about" className="hover:text-primary transition-colors">
            About Me
          </Link>{' '}
          |{' '}
          <Link to="/about-website" className="hover:text-primary transition-colors">
            About Website
          </Link>
        </p>
      </div>
    </footer>
  );
}
export default Footer;
