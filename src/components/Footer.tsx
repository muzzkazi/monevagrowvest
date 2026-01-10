import { Link } from "react-router-dom";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const Footer = () => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });

  return (
    <footer className="bg-gradient-primary text-white py-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')]"></div>
      <div ref={ref} className="container mx-auto px-4 relative z-10">
        <div className={`grid md:grid-cols-4 gap-8 mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className={`space-y-4 transition-all duration-500 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="flex items-center space-x-2">
              <img 
                src="/lovable-uploads/ed65aa4c-20d0-4af6-9c5c-9dc7c42a42d6.png" 
                alt="Moneva Logo" 
                className="h-12 w-auto transition-transform duration-300 hover:scale-105"
                style={{ filter: 'brightness(0) saturate(100%) invert(100%)' }}
              />
            </div>
            <p className="text-white/80 leading-relaxed font-light">
              Your trusted partner in financial planning and wealth management. Building prosperity through intelligent investment strategies.
            </p>
            <div className="flex space-x-4 pt-2">
              <div className="w-2 h-2 bg-financial-gold rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-financial-gold rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
              <div className="w-2 h-2 bg-financial-gold rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
            </div>
          </div>
          
          <div className={`transition-all duration-500 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <h4 className="font-display font-semibold mb-6 text-lg">Premium Services</h4>
            <ul className="space-y-3 text-white/80">
              <li><Link to="/services" className="hover:text-financial-gold transition-all duration-300 hover:translate-x-1 inline-block">Investment Planning</Link></li>
              <li><Link to="/services" className="hover:text-financial-gold transition-all duration-300 hover:translate-x-1 inline-block">Retirement Planning</Link></li>
              <li><Link to="/services" className="hover:text-financial-gold transition-all duration-300 hover:translate-x-1 inline-block">Tax Planning</Link></li>
              <li><Link to="/services" className="hover:text-financial-gold transition-all duration-300 hover:translate-x-1 inline-block">Portfolio Management</Link></li>
            </ul>
          </div>
          
          <div className={`transition-all duration-500 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <h4 className="font-display font-semibold mb-6 text-lg">Smart Tools</h4>
            <ul className="space-y-3 text-white/80">
              <li><Link to="/calculators" className="hover:text-financial-gold transition-all duration-300 hover:translate-x-1 inline-block">SIP Calculator</Link></li>
              <li><Link to="/calculators" className="hover:text-financial-gold transition-all duration-300 hover:translate-x-1 inline-block">EMI Calculator</Link></li>
              <li><Link to="/debt-management" className="hover:text-financial-gold transition-all duration-300 hover:translate-x-1 inline-block">Debt Management</Link></li>
              <li><Link to="/ai-planning" className="hover:text-financial-gold transition-all duration-300 hover:translate-x-1 inline-block">AI Financial Planning</Link></li>
            </ul>
          </div>
          
          <div className={`transition-all duration-500 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <h4 className="font-display font-semibold mb-6 text-lg">Connect With Us</h4>
            <div className="space-y-4 text-white/80">
              <div className="group">
                <p className="text-sm opacity-70 mb-1">Email us at</p>
                <a href="mailto:invest@moneva.in" className="hover:text-financial-gold transition-colors font-medium">invest@moneva.in</a>
              </div>
              <div className="group">
                <p className="text-sm opacity-70 mb-1">Call us at</p>
                <a href="tel:+918087855185" className="hover:text-financial-gold transition-colors font-medium text-lg">
                  +91 80878 55185
                </a>
              </div>
              <div className="pt-2">
                <p className="text-sm mb-2 opacity-70">Visit our office</p>
                <address className="text-sm leading-relaxed not-italic">
                  Unit no. 611, Reliables Pride<br/>
                  Anand Nagar Opp. Heera Panna<br/>
                  Jogeshwari West, Mumbai – 400102
                </address>
              </div>
            </div>
          </div>
        </div>
        
        <div className={`border-t border-white/20 pt-8 transition-all duration-700 delay-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          <div className="text-center mb-6">
            <p className="text-white/60 text-sm mb-3">
              <strong>Regulatory Disclosure:</strong> Moneva Growvest Pvt. Ltd. is an authorized person for mutual fund distribution.
              We are authorized to distribute mutual fund schemes. 
              All investments are subject to market risks. Please read the scheme information documents carefully before investing.
            </p>
            <p className="text-white/60 text-xs">
              BSE: AP01061201162326 | NSE: AP0397604963 | ARN: ARN-305935 | 
              For grievances, contact: invest@moneva.in
            </p>
          </div>
          <div className="text-center text-white/60">
            <p>&copy; 2024 Moneva Growvest Pvt. Ltd. All rights reserved. | Privacy Policy | Terms of Service</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;