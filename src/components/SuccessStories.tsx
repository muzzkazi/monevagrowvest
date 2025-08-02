import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Home, GraduationCap, Heart } from "lucide-react";

const SuccessStories = () => {
  const stories = [
    {
      icon: <Home className="w-8 h-8 text-financial-accent" />,
      title: "First Home Achievement",
      story: "Rajesh's Success in 10 Months",
      description: "Started his investment journey with us 10 months ago. Smart SIP planning helped him save ₹2.5L for his home down payment.",
      image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=250&fit=crop",
      metrics: {
        timeline: "10 Months",
        investment: "₹5,000/month",
        result: "₹2.5L Saved"
      }
    },
    {
      icon: <GraduationCap className="w-8 h-8 text-financial-accent" />,
      title: "Education Fund Started",
      story: "Priya's Smart Planning",
      description: "Young mother who started planning for her child's education early. Built ₹3L corpus in just 8 months with our guidance.",
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&h=250&fit=crop",
      metrics: {
        timeline: "8 Months",
        investment: "₹10,000/month",
        result: "₹3L Fund"
      }
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-financial-accent" />,
      title: "Investment Growth",
      story: "Amit's Portfolio Success",
      description: "Started investing with us a year ago. His diversified portfolio has already shown 15% returns with our research-backed approach.",
      image: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&h=250&fit=crop",
      metrics: {
        timeline: "12 Months",
        investment: "₹15,000/month",
        result: "15% Returns"
      }
    },
    {
      icon: <Heart className="w-8 h-8 text-financial-accent" />,
      title: "Emergency Fund Built",
      story: "Sneha's Security Story",
      description: "Created a solid emergency fund in 6 months. Now feels financially secure with our systematic planning approach.",
      image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=250&fit=crop",
      metrics: {
        timeline: "6 Months",
        investment: "Emergency SIP",
        result: "₹1.5L Secured"
      }
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-background to-financial-muted/20 relative overflow-hidden">
      {/* Mesh gradient background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-financial-accent/5 via-transparent to-financial-gold/5"></div>
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-financial-accent/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-financial-gold/10 rounded-full blur-2xl animate-float-delayed"></div>
      </div>
      
      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl lg:text-5xl font-display font-bold mb-6">
            Real Stories, <span className="bg-gradient-to-r from-financial-accent to-financial-gold bg-clip-text text-transparent">Real Success</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Discover how our clients transformed their financial lives with smart planning and disciplined investing
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12 stagger-fade-in">
          {stories.map((story, index) => (
            <Card key={index} className="glass-card border-0 shadow-premium overflow-hidden hover-lift hover-glow group cursor-pointer">
              <div className="relative overflow-hidden">
                <img
                  src={story.image}
                  alt={story.title}
                  className="w-full h-48 object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Floating icon */}
                <div className="absolute top-4 left-4 glass-card p-3 rounded-xl backdrop-blur-md group-hover:scale-110 transition-transform duration-300">
                  <div className="relative z-10">
                    {story.icon}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-financial-accent/20 to-financial-gold/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                {/* Success badge */}
                <div className="absolute top-4 right-4 glass-card px-3 py-1 rounded-full backdrop-blur-md">
                  <span className="text-xs font-medium text-financial-accent">✨ Success</span>
                </div>
              </div>
              
              <CardHeader className="relative">
                <CardTitle className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-foreground group-hover:text-financial-accent transition-colors duration-300">{story.title}</h3>
                    <p className="text-sm text-financial-accent font-medium">{story.story}</p>
                  </div>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="relative">
                <p className="text-muted-foreground mb-6 leading-relaxed">{story.description}</p>
                
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 rounded-lg bg-gradient-to-br from-financial-accent/5 to-financial-gold/5 group-hover:from-financial-accent/10 group-hover:to-financial-gold/10 transition-all duration-300">
                    <p className="text-sm font-bold text-financial-accent">{story.metrics.timeline}</p>
                    <p className="text-xs text-muted-foreground">Timeline</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-gradient-to-br from-financial-accent/5 to-financial-gold/5 group-hover:from-financial-accent/10 group-hover:to-financial-gold/10 transition-all duration-300">
                    <p className="text-sm font-bold text-financial-accent">{story.metrics.investment}</p>
                    <p className="text-xs text-muted-foreground">Investment</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-gradient-to-br from-financial-accent/5 to-financial-gold/5 group-hover:from-financial-accent/10 group-hover:to-financial-gold/10 transition-all duration-300">
                    <p className="text-sm font-bold text-financial-accent">{story.metrics.result}</p>
                    <p className="text-xs text-muted-foreground">Result</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center animate-spring-bounce">
          <Button 
            variant="premium"
            size="lg"
            className="px-8 py-4 text-lg font-semibold shadow-floating hover:shadow-glow"
            onClick={() => window.location.href = '/contact'}
          >
            ✨ Start Your Success Story
          </Button>
        </div>
      </div>
    </section>
  );
};

export default SuccessStories;