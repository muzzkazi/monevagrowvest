import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Shield, Users, Calculator, PieChart, Target, ArrowRight, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const Services = () => {
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
    <section id="services" className="py-20 bg-financial-muted">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6">
            Our <span className="text-financial-accent">Services</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Comprehensive financial solutions designed to help you build wealth, protect your future, and achieve your dreams.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card key={index} className="group bg-gradient-card border-0 shadow-card hover:shadow-financial transition-all duration-300 hover:-translate-y-2">
              <CardContent className="p-8">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-gradient-gold rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <service.icon className="w-8 h-8 text-financial-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-foreground">{service.title}</h3>
                  <p className="text-muted-foreground leading-relaxed mb-6">{service.description}</p>
                  
                  <div className="space-y-2 mb-6">
                    {service.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-financial-accent flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  {service.title === "Financial Planning Tools" ? (
                    <Link to="/calculators">
                      <Button variant="outline" className="w-full group border-financial-accent text-financial-accent hover:bg-financial-accent hover:text-white">
                        {service.cta}
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  ) : service.title === "Research Based Investment" || service.title === "Goal-Based Planning" ? (
                    <Link to="/ai-planning">
                      <Button variant="outline" className="w-full group border-financial-accent text-financial-accent hover:bg-financial-accent hover:text-white">
                        {service.cta}
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  ) : (
                    <Button variant="outline" className="w-full group border-financial-accent text-financial-accent hover:bg-financial-accent hover:text-white">
                      {service.cta}
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  )}
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