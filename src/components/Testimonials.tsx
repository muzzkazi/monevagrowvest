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
    <section className="py-32 bg-gradient-mesh relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/3 right-1/4 w-88 h-88 bg-financial-accent/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-financial-gold/4 rounded-full blur-2xl animate-float" style={{ animationDelay: '3s' }}></div>
      </div>
      
      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-20 animate-fade-in-up">
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-glass backdrop-blur-sm border border-financial-accent/20 mb-6">
            <span className="text-sm font-medium text-financial-primary">⭐ Client Success Stories</span>
          </div>
          
          <h2 className="text-5xl lg:text-6xl font-bold mb-8 leading-tight">
            What Our <span className="gradient-text">Clients Say</span>
          </h2>
          <p className="text-xl lg:text-2xl text-financial-secondary max-w-4xl mx-auto leading-relaxed font-light">
            Over 500+ satisfied clients started their financial journey with us in our first year
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="glass border-0 shadow-glass hover-lift hover-glow group animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <div className="relative">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-financial-accent/20 group-hover:border-financial-accent/40 transition-colors"
                    />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-financial-success rounded-full border-2 border-white flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="font-bold text-lg text-financial-primary">{testimonial.name}</h4>
                    <p className="text-sm text-financial-secondary">{testimonial.location}</p>
                  </div>
                </div>

                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-financial-gold text-financial-gold mr-1" />
                  ))}
                </div>

                <Quote className="w-8 h-8 text-financial-accent/60 mb-4" />
                <p className="text-financial-secondary leading-relaxed mb-6 font-medium">{testimonial.text}</p>
                
                <div className="bg-gradient-accent/10 text-financial-accent font-semibold text-sm px-4 py-2 rounded-xl inline-block">
                  {testimonial.investment}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center animate-slide-in-right">
          <div className="glass p-12 rounded-3xl backdrop-blur-sm border border-financial-accent/20 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="group hover-lift">
                <div className="mb-4">
                  <p ref={clientsCount.ref} className="text-5xl font-bold gradient-text group-hover:scale-110 transition-transform">
                    {clientsCount.value}
                  </p>
                </div>
                <p className="text-lg font-semibold text-financial-secondary">Happy Clients</p>
                <div className="w-full h-1 bg-gradient-accent rounded-full mt-4 opacity-60 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <div className="group hover-lift">
                <div className="mb-4">
                  <p ref={aumCount.ref} className="text-5xl font-bold gradient-text group-hover:scale-110 transition-transform">
                    {aumCount.value}
                  </p>
                </div>
                <p className="text-lg font-semibold text-financial-secondary">Assets Managed</p>
                <div className="w-full h-1 bg-gradient-accent rounded-full mt-4 opacity-60 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <div className="group hover-lift">
                <div className="mb-4">
                  <p className="text-5xl font-bold gradient-text group-hover:scale-110 transition-transform">12%</p>
                </div>
                <p className="text-lg font-semibold text-financial-secondary">Avg Returns</p>
                <div className="w-full h-1 bg-gradient-accent rounded-full mt-4 opacity-60 group-hover:opacity-100 transition-opacity"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;