import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-gold rounded-lg flex items-center justify-center">
              <span className="text-primary font-bold text-lg">M</span>
            </div>
            <span className="text-2xl font-bold text-primary">Moneva</span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#home" className="text-foreground hover:text-financial-accent transition-colors">
              Home
            </a>
            <a href="#services" className="text-foreground hover:text-financial-accent transition-colors">
              Services
            </a>
            <a href="#about" className="text-foreground hover:text-financial-accent transition-colors">
              About
            </a>
            <a href="#calculators" className="text-foreground hover:text-financial-accent transition-colors">
              Calculators
            </a>
            <a href="#contact" className="text-foreground hover:text-financial-accent transition-colors">
              Contact
            </a>
          </nav>
          
          <Button className="bg-financial-accent hover:bg-financial-accent/90 text-white">
            Get Started
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;