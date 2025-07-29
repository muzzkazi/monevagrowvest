import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Clock, ArrowRight, BarChart3 } from "lucide-react";
import ContactFormModal from "@/components/ContactFormModal";

const FeaturedInsights = () => {
  const [showContactForm, setShowContactForm] = useState(false);
  
  const insights = [
    {
      category: "Market Analysis",
      title: "Why Small Cap Funds Are Outperforming in 2024",
      excerpt: "Small cap mutual funds have delivered exceptional returns this year. Here's our analysis on the trend and which funds to consider.",
      image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=250&fit=crop",
      readTime: "5 min read",
      trending: true
    },
    {
      category: "Tax Planning",
      title: "New Tax Regime vs Old: Which Saves You More in 2024?",
      excerpt: "Complete comparison with real examples. Find out which tax regime works better for your salary bracket and investments.",
      image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=250&fit=crop",
      readTime: "7 min read",
      trending: false
    },
    {
      category: "SIP Strategy",
      title: "Step-Up SIP: The Secret to Building ₹1 Crore Faster",
      excerpt: "Learn how increasing your SIP amount annually can help you reach your financial goals 3-5 years earlier than traditional SIPs.",
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=250&fit=crop",
      readTime: "4 min read",
      trending: true
    }
  ];

  return (
    <section className="py-20 bg-financial-muted">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6">
            Market <span className="text-financial-accent">Insights</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Stay ahead with our expert analysis and actionable investment strategies
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {insights.map((insight, index) => (
            <Card key={index} className="bg-gradient-card border-0 shadow-card overflow-hidden hover-scale">
              <div className="relative">
                <img
                  src={insight.image}
                  alt={insight.title}
                  className="w-full h-48 object-cover"
                />
                {insight.trending && (
                  <Badge className="absolute top-4 left-4 bg-financial-accent text-white">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Trending
                  </Badge>
                )}
                <Badge variant="secondary" className="absolute top-4 right-4 bg-white/90">
                  {insight.category}
                </Badge>
              </div>
              
              <CardHeader>
                <CardTitle className="text-lg leading-tight">{insight.title}</CardTitle>
              </CardHeader>
              
              <CardContent>
                <p className="text-muted-foreground mb-4 text-sm">{insight.excerpt}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="w-3 h-3 mr-1" />
                    {insight.readTime}
                  </div>
                  <Button variant="ghost" size="sm" className="text-financial-accent hover:text-financial-accent/80">
                    Read More
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="bg-gradient-gold border-0 shadow-card text-center p-6">
            <BarChart3 className="w-12 h-12 text-financial-primary mx-auto mb-4" />
            <h3 className="text-xl font-bold text-financial-primary mb-2">Market Updates</h3>
            <p className="text-financial-secondary text-sm mb-4">Daily market analysis and fund performance updates</p>
            <Button 
              variant="outline" 
              className="border-financial-primary text-financial-primary hover:bg-financial-primary hover:text-white"
              onClick={() => setShowContactForm(true)}
            >
              Subscribe Free
            </Button>
          </Card>

          <Card className="bg-gradient-card border-0 shadow-card text-center p-6">
            <TrendingUp className="w-12 h-12 text-financial-accent mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Portfolio Review</h3>
            <p className="text-muted-foreground text-sm mb-4">Get your portfolio analyzed by our experts for free</p>
            <Button 
              className="bg-financial-accent hover:bg-financial-accent/90 text-white"
              onClick={() => window.location.href = '/contact'}
            >
              Book Review
            </Button>
          </Card>

          <Card className="bg-gradient-card border-0 shadow-card text-center p-6">
            <Clock className="w-12 h-12 text-financial-accent mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Weekly Webinars</h3>
            <p className="text-muted-foreground text-sm mb-4">Join our live sessions on investment strategies</p>
            <Button variant="outline" className="border-financial-accent text-financial-accent hover:bg-financial-accent hover:text-white">
              Join Live
            </Button>
          </Card>
        </div>
      </div>
      
      <ContactFormModal
        isOpen={showContactForm}
        onClose={() => setShowContactForm(false)}
        actionType="subscribe"
      />
    </section>
  );
};

export default FeaturedInsights;