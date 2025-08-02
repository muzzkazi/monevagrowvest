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
    <section className="py-32 bg-background relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-financial-tertiary/6 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-financial-gold/8 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>
      
      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-20 animate-fade-in-up">
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-glass backdrop-blur-sm border border-financial-accent/20 mb-6">
            <span className="text-sm font-medium text-financial-primary">🏆 Success Stories</span>
          </div>
          
          <h2 className="text-5xl lg:text-6xl font-bold mb-8 leading-tight">
            Real Stories, <span className="gradient-text">Real Success</span>
          </h2>
          <p className="text-xl lg:text-2xl text-financial-secondary max-w-4xl mx-auto leading-relaxed font-light">
            Discover how our clients transformed their financial lives with smart planning and disciplined investing
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mb-16">
          {stories.map((story, index) => (
            <Card key={index} className="glass border-0 shadow-glass overflow-hidden hover-lift hover-glow group animate-scale-in" style={{ animationDelay: `${index * 0.15}s` }}>
              <div className="relative overflow-hidden">
                <img
                  src={story.image}
                  alt={story.title}
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-primary/20 group-hover:bg-gradient-primary/10 transition-colors"></div>
                <div className="absolute top-6 left-6 glass p-4 rounded-2xl backdrop-blur-sm">
                  {story.icon}
                </div>
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="glass p-4 rounded-xl backdrop-blur-sm">
                    <h3 className="text-xl font-bold text-white mb-1">{story.title}</h3>
                    <p className="text-financial-gold-light text-sm font-medium">{story.story}</p>
                  </div>
                </div>
              </div>
              
              <CardContent className="p-8">
                <p className="text-financial-secondary leading-relaxed mb-8 text-lg">{story.description}</p>
                
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center group/metric hover-lift">
                    <div className="bg-gradient-accent/10 p-4 rounded-xl mb-3 group-hover/metric:bg-gradient-accent/20 transition-colors">
                      <p className="text-lg font-bold gradient-text">{story.metrics.timeline}</p>
                    </div>
                    <p className="text-sm text-financial-secondary font-medium">Timeline</p>
                  </div>
                  <div className="text-center group/metric hover-lift">
                    <div className="bg-gradient-accent/10 p-4 rounded-xl mb-3 group-hover/metric:bg-gradient-accent/20 transition-colors">
                      <p className="text-lg font-bold gradient-text">{story.metrics.investment}</p>
                    </div>
                    <p className="text-sm text-financial-secondary font-medium">Investment</p>
                  </div>
                  <div className="text-center group/metric hover-lift">
                    <div className="bg-gradient-accent/10 p-4 rounded-xl mb-3 group-hover/metric:bg-gradient-accent/20 transition-colors">
                      <p className="text-lg font-bold gradient-text">{story.metrics.result}</p>
                    </div>
                    <p className="text-sm text-financial-secondary font-medium">Result</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center animate-slide-in-right">
          <Button 
            className="group bg-gradient-accent hover:shadow-glow hover:scale-105 transition-spring text-white px-12 py-6 text-xl font-semibold rounded-2xl hover-lift"
            onClick={() => window.location.href = '/contact'}
          >
            <span className="flex items-center gap-3">
              Start Your Success Story
              <span className="group-hover:translate-x-1 transition-transform">🚀</span>
            </span>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default SuccessStories;