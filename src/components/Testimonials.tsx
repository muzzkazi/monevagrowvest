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
      text: "Started with Moneva 8 months ago. Their SIP recommendations helped me build a diversified portfolio systematically.",
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
      text: "Just started my investment journey 6 months back. Moneva's guidance made it simple to begin with ₹3,000 SIP.",
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
    <section className="py-20 bg-financial-muted">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6">
            What Our <span className="text-financial-accent">Clients Say</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Over 500+ satisfied clients started their financial journey with us in our first year
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-gradient-card border-0 shadow-card hover-scale">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                  </div>
                </div>

                <div className="flex items-center mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-financial-accent text-financial-accent" />
                  ))}
                </div>

                <Quote className="w-6 h-6 text-financial-accent mb-3" />
                <p className="text-sm text-muted-foreground mb-4">{testimonial.text}</p>
                
                <div className="text-xs font-medium text-financial-accent bg-financial-accent/10 px-3 py-1 rounded-full inline-block">
                  {testimonial.investment}
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
              <p ref={returnsCount.ref} className="text-3xl font-bold text-financial-accent">{returnsCount.value}</p>
              <p className="text-sm text-muted-foreground">Avg Returns</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;