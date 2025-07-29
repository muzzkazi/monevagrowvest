import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-financial-primary text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-gold rounded-lg flex items-center justify-center">
                <span className="text-financial-primary font-bold text-lg">M</span>
              </div>
              <span className="text-2xl font-bold">Moneva</span>
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
              <strong>Regulatory Disclaimer:</strong> Investment advice provided on this platform is for educational purposes only. 
              We are not SEBI registered advisors. Please consult qualified professionals before investing. 
              Mutual fund investments are subject to market risks.
            </p>
            <p className="text-white/60 text-xs">
              ARN: Not applicable | This platform does not charge any fees for mutual fund recommendations
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