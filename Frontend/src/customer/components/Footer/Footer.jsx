import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-outline-variant/30 pt-20 pb-10 px-10 md:px-24 font-body">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        
        {/* Brand Column */}
        <div className="md:col-span-1">
          <h3 className="font-headline text-2xl font-bold tracking-tight text-on-surface mb-6">
            Clothsy
          </h3>
          <p className="text-on-surface-variant text-sm leading-relaxed max-w-xs">
            Defining the modern aesthetic through architectural forms and uncompromising quality.
          </p>
        </div>

        {/* Links Column 1 */}
        <div>
          <h4 className="font-label text-xs font-bold uppercase tracking-widest text-on-surface mb-6">Shop</h4>
          <ul className="space-y-4 text-sm text-on-surface-variant">
            <li><Link to="/products" className="hover:text-primary transition-colors">New Arrivals</Link></li>
            <li><Link to="/products" className="hover:text-primary transition-colors">Outerwear</Link></li>
            <li><Link to="/products" className="hover:text-primary transition-colors">Ready to Wear</Link></li>
            <li><Link to="/products" className="hover:text-primary transition-colors">Accessories</Link></li>
          </ul>
        </div>

        {/* Links Column 2 */}
        <div>
          <h4 className="font-label text-xs font-bold uppercase tracking-widest text-on-surface mb-6">Brand</h4>
          <ul className="space-y-4 text-sm text-on-surface-variant">
            <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
            <li><Link to="/journal" className="hover:text-primary transition-colors">The Monolith Concept</Link></li>
            <li><Link to="/sustainability" className="hover:text-primary transition-colors">Sustainability</Link></li>
          </ul>
        </div>

        {/* Links Column 3 */}
        <div>
          <h4 className="font-label text-xs font-bold uppercase tracking-widest text-on-surface mb-6">Support</h4>
          <ul className="space-y-4 text-sm text-on-surface-variant">
            <li><Link to="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
            <li><Link to="/returns" className="hover:text-primary transition-colors">Shipping & Returns</Link></li>
            <li><Link to="/track" className="hover:text-primary transition-colors">Track Order</Link></li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-outline-variant/30 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-on-surface-variant tracking-wider">
        <p className="flex items-center gap-1">
          © {new Date().getFullYear()} Clothsy Editorial. Made with 
          <span className="text-primary mx-1">♥</span> 
          by Harsha.
        </p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-primary transition-colors">Instagram</a>
          <a href="#" className="hover:text-primary transition-colors">Pinterest</a>
          <a href="#" className="hover:text-primary transition-colors">Twitter</a>
        </div>
      </div>
    </footer>
  );
}