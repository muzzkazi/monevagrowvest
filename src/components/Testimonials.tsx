import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";

const Testimonials = () => {
  const testimonials = [
    {
      name: "Rajesh Kumar",
      location: "Mumbai",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      rating: 5,
      text: "Moneva helped me diversify my portfolio and achieve 18% returns last year. Their SIP recommendations were spot-on!",
      investment: "₹2.5L Portfolio"
    },
    {
      name: "Priya Sharma",
      location: "Bangalore",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
      rating: 5,
      text: "The tax planning strategies saved me over ₹45,000 this year. Professional service with transparent pricing.",
      investment: "₹8L Annual Income"
    },
    {
      name: "Amit Patel",
      location: "Delhi",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      rating: 5,
      text: "From ₹5,000 SIP to ₹12L portfolio in 4 years. Moneva's guidance made my retirement planning stress-free.",
      investment: "₹12L Portfolio"
    },
    {
      name: "Sneha Reddy",
      location: "Hyderabad",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
      rating: 5,
      text: "Best investment decision was choosing Moneva. They helped me buy my first home with smart loan planning.",
      investment: "₹85L Home Loan"
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
            Over 10,000+ satisfied clients trust us with their financial future
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
              <p className="text-3xl font-bold text-financial-accent">10,000+</p>
              <p className="text-sm text-muted-foreground">Happy Clients</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-financial-accent">₹500Cr+</p>
              <p className="text-sm text-muted-foreground">Assets Managed</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-financial-accent">15%</p>
              <p className="text-sm text-muted-foreground">Avg Returns</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;