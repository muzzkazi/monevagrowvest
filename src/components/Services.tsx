import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Shield, Users, Calculator, PieChart, Target } from "lucide-react";

const Services = () => {
  const services = [
    {
      icon: TrendingUp,
      title: "Research Based Investment",
      description: "Our expert team carefully evaluates trends to identify high-potential opportunities. Every strategy is backed by data, ensuring informed decisions that align with your goals."
    },
    {
      icon: Users,
      title: "Personalized Support",
      description: "Our dedicated advisors take the time to understand your goals, offering guidance that fits your needs. With ongoing support, we're with you every step of the way."
    },
    {
      icon: Shield,
      title: "Transparent Advice",
      description: "Our recommendations are always transparent, with no hidden fees or surprises. We ensure you understand every step of your investment journey."
    },
    {
      icon: Calculator,
      title: "Financial Planning Tools",
      description: "Access our comprehensive suite of calculators and planning tools to make informed decisions about your financial future."
    },
    {
      icon: PieChart,
      title: "Portfolio Management",
      description: "Diversified portfolio strategies tailored to your risk tolerance and financial objectives, with regular monitoring and rebalancing."
    },
    {
      icon: Target,
      title: "Goal-Based Planning",
      description: "Whether it's retirement, education, or buying a home, we create customized strategies to help you achieve your specific financial goals."
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
                  <p className="text-muted-foreground leading-relaxed">{service.description}</p>
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