import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";
import { useCountUp } from "@/hooks/useCountUp";

const Testimonials = () => {
  const clientsCount = useCountUp({ end: 500, suffix: "+", duration: 2000 });
  const aumCount = useCountUp({ end: 12, prefix: "₹", suffix: "Cr+", duration: 2500 });
  const returnsCount = useCountUp({ end: 12, suffix: "%", duration: 2200 });
  const testimonials = [
    {
      name: "Rajesh Kumar",
      location: "Mumbai",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      rating: 5,
      text: "Started with Moneva Growvest Pvt. Ltd. 8 months ago. Their SIP recommendations helped me build a diversified portfolio systematically.",
      investment: "₹50K SIP Portfolio"
    },
    {
      name: "Priya Sharma",
      location: "Bangalore",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
      rating: 5,
      text: "Young team with fresh ideas! Their tax planning advice helped me save ₹15,000 in my first year with them.",
      investment: "₹5L Annual Income"
    },
    {
      name: "Amit Patel",
      location: "Delhi",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      rating: 5,
      text: "Just started my investment journey 6 months back. Moneva Growvest Pvt. Ltd.'s guidance made it simple to begin with ₹3,000 SIP.",
      investment: "₹18K Invested"
    },
    {
      name: "Sneha Reddy",
      location: "Hyderabad",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
      rating: 5,
      text: "Transparent advice and no hidden charges. They helped me plan for my home loan with realistic expectations.",
      investment: "₹25L Home Loan"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-background via-financial-muted/30 to-background relative overflow-hidden">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/6 w-64 h-64 bg-financial-accent/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-financial-gold/5 rounded-full blur-2xl animate-float-delayed"></div>
      </div>
      
      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl lg:text-5xl font-display font-bold mb-6">
            What Our <span className="bg-gradient-to-r from-financial-accent to-financial-gold bg-clip-text text-transparent">Clients Say</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Over 500+ satisfied clients started their financial journey with us in our first year
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 stagger-fade-in">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="glass-card border-0 shadow-premium hover-lift hover-glow group overflow-hidden">
              <CardContent className="p-6 relative">
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-financial-accent/5 via-transparent to-financial-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center mb-4">
                    <div className="relative">
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full object-cover mr-4 ring-2 ring-financial-accent/20 group-hover:ring-financial-accent/40 transition-all duration-300"
                      />
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-financial-accent/20 to-financial-gold/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground group-hover:text-financial-accent transition-colors duration-300">{testimonial.name}</h4>
                      <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                    </div>
                  </div>

                  <div className="flex items-center mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-financial-accent text-financial-accent group-hover:scale-110 transition-transform duration-300" style={{ transitionDelay: `${i * 50}ms` }} />
                    ))}
                  </div>

                  <Quote className="w-6 h-6 text-financial-accent mb-3 group-hover:scale-110 transition-transform duration-300" />
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{testimonial.text}</p>
                  
                  <div className="text-xs font-medium text-financial-accent bg-gradient-to-r from-financial-accent/10 to-financial-gold/10 px-3 py-2 rounded-full inline-block backdrop-blur-sm border border-financial-accent/20">
                    {testimonial.investment}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div>
              <p ref={clientsCount.ref} className="text-3xl font-bold text-financial-accent">{clientsCount.value}</p>
              <p className="text-sm text-muted-foreground">Happy Clients</p>
            </div>
            <div>
              <p ref={aumCount.ref} className="text-3xl font-bold text-financial-accent">{aumCount.value}</p>
              <p className="text-sm text-muted-foreground">Assets Managed</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-financial-accent">12%</p>
              <p className="text-sm text-muted-foreground">Avg Returns</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;