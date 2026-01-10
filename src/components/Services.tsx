import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Shield, Users, Calculator, PieChart, Target, ArrowRight, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const Services = () => {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation({ threshold: 0.2 });
  const { ref: gridRef, isVisible: gridVisible } = useScrollAnimation({ threshold: 0.1 });
  const services = [
    {
      icon: TrendingUp,
      title: "Research Based Investment",
      description: "Our expert team carefully evaluates trends to identify high-potential opportunities. Every strategy is backed by data, ensuring informed decisions that align with your goals.",
      features: ["Detailed market research", "Risk assessment", "Performance tracking", "Regular rebalancing"],
      cta: "Explore Investment Plans"
    },
    {
      icon: Users,
      title: "Personalized Support",
      description: "Our dedicated advisors take the time to understand your goals, offering guidance that fits your needs. With ongoing support, we're with you every step of the way.",
      features: ["Dedicated relationship manager", "24/7 support", "Regular portfolio reviews", "Goal tracking"],
      cta: "Meet Your Advisor"
    },
    {
      icon: Shield,
      title: "Transparent Advice",
      description: "Our recommendations are always transparent, with no hidden fees or surprises. We ensure you understand every step of your investment journey.",
      features: ["No hidden charges", "Detailed fee structure", "Complete transparency", "Regular reporting"],
      cta: "View Fee Structure"
    },
    {
      icon: Calculator,
      title: "Financial Planning Tools",
      description: "Access our comprehensive suite of calculators and planning tools to make informed decisions about your financial future.",
      features: ["SIP calculator", "EMI calculator", "Tax planning tools", "Retirement planner"],
      cta: "Try Our Calculators"
    },
    {
      icon: PieChart,
      title: "Portfolio Management",
      description: "Diversified portfolio strategies tailored to your risk tolerance and financial objectives, with regular monitoring and rebalancing.",
      features: ["Asset allocation", "Risk management", "Performance monitoring", "Regular rebalancing"],
      cta: "View Portfolio Options"
    },
    {
      icon: Target,
      title: "Goal-Based Planning",
      description: "Whether it's retirement, education, or buying a home, we create customized strategies to help you achieve your specific financial goals.",
      features: ["Retirement planning", "Education funding", "Home purchase", "Wealth creation"],
      cta: "Set Your Goals"
    }
  ];

  return (
    <section id="services" className="py-8 sm:py-12 bg-financial-muted">
      <div className="container mx-auto px-3 sm:px-4">
        <div 
          ref={headerRef}
          className={`text-center mb-6 sm:mb-10 transition-all duration-700 ease-out ${
            headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">
            Our <span className="text-financial-accent">Services</span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto">
            Comprehensive financial solutions designed to help you build wealth, protect your future, and achieve your dreams.
          </p>
        </div>
        
        <div 
          ref={gridRef}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
        >
          {services.map((service, index) => (
            <Card 
              key={index} 
              className={`card-float glass-card group border-0 shadow-card hover:shadow-financial overflow-hidden transition-all duration-500 ease-out ${
                gridVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              }`}
              style={{ transitionDelay: gridVisible ? `${index * 100}ms` : '0ms' }}
            >
              <CardContent className="p-4 sm:p-6 relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-gold opacity-5 rounded-full -translate-y-12 translate-x-12"></div>
                <div className="relative z-10">
                  <div className="mb-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-gold rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-all duration-500 shadow-gold">
                      <service.icon className="w-6 h-6 sm:w-7 sm:h-7 text-financial-primary" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-display font-semibold mb-2 sm:mb-3 text-foreground group-hover:text-financial-accent transition-colors duration-300">{service.title}</h3>
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4">{service.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      {service.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center gap-2 group/item">
                          <CheckCircle className="w-3.5 h-3.5 text-financial-accent flex-shrink-0 group-hover/item:scale-110 transition-transform duration-200" />
                          <span className="text-xs sm:text-sm text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
                  
                    {service.title === "Financial Planning Tools" ? (
                      <Link to="/calculators">
                        <Button variant="outline" className="btn-enhance w-full group border-financial-accent text-financial-accent hover:bg-financial-accent hover:text-white">
                          {service.cta}
                          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    ) : service.title === "Research Based Investment" || service.title === "Goal-Based Planning" ? (
                      <Link to="/ai-planning">
                        <Button variant="outline" className="btn-enhance w-full group border-financial-accent text-financial-accent hover:bg-financial-accent hover:text-white">
                          {service.cta}
                          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    ) : (
                      <Button variant="outline" className="btn-enhance w-full group border-financial-accent text-financial-accent hover:bg-financial-accent hover:text-white">
                        {service.cta}
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;