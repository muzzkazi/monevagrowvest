import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-financial-primary text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <img 
                src="/lovable-uploads/ed65aa4c-20d0-4af6-9c5c-9dc7c42a42d6.png" 
                alt="Moneva Logo" 
                className="h-10 w-auto"
                style={{ filter: 'brightness(0) saturate(100%) invert(12%) sepia(94%) saturate(7481%) hue-rotate(246deg) brightness(97%) contrast(149%)' }}
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
              <li>contact@moneva.in</li>
              <li>
                <a href="tel:+918087855185" className="hover:text-financial-gold transition-colors">
                  +91 80878 55185
                </a>
              </li>
              <li>Unit no. 611, Reliables Pride</li>
              <li>Anand Nagar Opp. Heera Panna</li>
              <li>Jogeshwari West, Mumbai – 400102</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/20 pt-8">
          <div className="text-center mb-6">
            <p className="text-white/60 text-sm mb-3">
              <strong>Regulatory Disclosure:</strong> Moneva is a SEBI registered investment advisor and authorized person for mutual fund distribution.
              We are authorized to provide investment advisory services and distribute mutual fund schemes. 
              All investments are subject to market risks. Please read the scheme information documents carefully before investing.
            </p>
            <p className="text-white/60 text-xs">
              BSE: AP01061201162326 | NSE: AP0397604963 | ARN: ARN-305935 | 
              For grievances, contact: contact@moneva.in
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