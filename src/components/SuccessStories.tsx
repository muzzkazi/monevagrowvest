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
    <section className="py-8 sm:py-12 bg-background">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="text-center mb-6 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">
            Real Stories, <span className="text-financial-accent">Real Success</span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover how our clients transformed their financial lives with smart planning and disciplined investing
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {stories.map((story, index) => (
            <Card key={index} className="bg-gradient-card border-0 shadow-card overflow-hidden hover-scale">
              <div className="relative">
                <img
                  src={story.image}
                  alt={story.title}
                  className="w-full h-36 sm:h-44 object-cover"
                />
                <div className="absolute top-3 left-3 bg-white/90 p-1.5 rounded-lg">
                  {story.icon}
                </div>
              </div>
              
              <CardHeader className="py-3 px-4">
                <CardTitle className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold">{story.title}</h3>
                    <p className="text-xs sm:text-sm text-financial-accent">{story.story}</p>
                  </div>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="px-4 pb-4 pt-0">
                <p className="text-sm text-muted-foreground mb-4">{story.description}</p>
                
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="text-center">
                    <p className="text-xs sm:text-sm font-medium text-financial-accent">{story.metrics.timeline}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Timeline</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs sm:text-sm font-medium text-financial-accent">{story.metrics.investment}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Investment</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs sm:text-sm font-medium text-financial-accent">{story.metrics.result}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Result</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button 
            className="bg-financial-accent hover:bg-financial-accent/90 text-white px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base"
            onClick={() => window.location.href = '/contact'}
          >
            Start Your Success Story
          </Button>
        </div>
      </div>
    </section>
  );
};

export default SuccessStories;