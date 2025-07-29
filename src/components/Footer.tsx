import { Link } from "react-router-dom";
import monevaLogo from "@/assets/moneva-logo.svg";

const Footer = () => {
  return (
    <footer className="bg-financial-primary text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <img 
                src={monevaLogo} 
                alt="Moneva" 
                className="h-10 w-auto"
              />
            </div>
            <p className="text-white/70">
              Your trusted partner in financial planning and wealth management.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-white/70">
              <li><Link to="/services" className="hover:text-financial-gold transition-colors">Investment Planning</Link></li>
              <li><Link to="/services" className="hover:text-financial-gold transition-colors">Retirement Planning</Link></li>
              <li><Link to="/services" className="hover:text-financial-gold transition-colors">Tax Planning</Link></li>
              <li><Link to="/services" className="hover:text-financial-gold transition-colors">Portfolio Management</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-white/70">
              <li><Link to="/calculators" className="hover:text-financial-gold transition-colors">SIP Calculator</Link></li>
              <li><Link to="/calculators" className="hover:text-financial-gold transition-colors">EMI Calculator</Link></li>
              <li><Link to="/calculators" className="hover:text-financial-gold transition-colors">Tax Calculator</Link></li>
              <li><Link to="/blog" className="hover:text-financial-gold transition-colors">Blog</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-white/70">
              <li>invest@moneva.in</li>
              <li>+91-XXX-XXXX-XXX</li>
              <li>Mumbai, India</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/20 pt-8">
          <div className="text-center mb-6">
            <p className="text-white/60 text-sm mb-3">
              <strong>Regulatory Disclosure:</strong> Moneva is a registered sub-broker with Angel One (SEBI Reg. No: INZ000156038) 
              and holds a valid ARN for mutual fund distribution. Investment advice is provided by qualified professionals 
              in compliance with SEBI regulations. Mutual fund investments are subject to market risks.
            </p>
            <p className="text-white/60 text-xs">
              ARN: [Your ARN Number] | Sub-Broker Code: [Your Code] | For grievances, contact: invest@moneva.in
            </p>
          </div>
          <div className="text-center text-white/60">
            <p>&copy; 2024 Moneva. All rights reserved. | Privacy Policy | Terms of Service</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;