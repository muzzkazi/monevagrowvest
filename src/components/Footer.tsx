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
              <li><button onClick={() => document.getElementById('services')?.scrollIntoView({behavior: 'smooth'})} className="hover:text-financial-gold transition-colors text-left">Investment Planning</button></li>
              <li><button onClick={() => document.getElementById('services')?.scrollIntoView({behavior: 'smooth'})} className="hover:text-financial-gold transition-colors text-left">Retirement Planning</button></li>
              <li><button onClick={() => document.getElementById('calculators')?.scrollIntoView({behavior: 'smooth'})} className="hover:text-financial-gold transition-colors text-left">Tax Planning</button></li>
              <li><button onClick={() => document.getElementById('services')?.scrollIntoView({behavior: 'smooth'})} className="hover:text-financial-gold transition-colors text-left">Portfolio Management</button></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-white/70">
              <li><button onClick={() => document.getElementById('calculators')?.scrollIntoView({behavior: 'smooth'})} className="hover:text-financial-gold transition-colors text-left">SIP Calculator</button></li>
              <li><button onClick={() => document.getElementById('calculators')?.scrollIntoView({behavior: 'smooth'})} className="hover:text-financial-gold transition-colors text-left">EMI Calculator</button></li>
              <li><button onClick={() => document.getElementById('calculators')?.scrollIntoView({behavior: 'smooth'})} className="hover:text-financial-gold transition-colors text-left">Tax Calculator</button></li>
              <li><a href="#" className="hover:text-financial-gold transition-colors">Blog</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-white/70">
              <li>info@moneva.in</li>
              <li>+91-XXX-XXXX-XXX</li>
              <li>Mumbai, India</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/20 pt-8 text-center text-white/60">
          <p>&copy; 2024 Moneva. All rights reserved. | Privacy Policy | Terms of Service</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;