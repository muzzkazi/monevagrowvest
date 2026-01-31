import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Clock, ArrowRight, BarChart3, RefreshCw, Activity } from "lucide-react";
import ContactFormModal from "@/components/ContactFormModal";
import { useMarketInsights } from "@/hooks/useMarketInsights";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const FeaturedInsights = () => {
  const [showContactForm, setShowContactForm] = useState(false);
  const [actionType, setActionType] = useState<"download" | "implement" | "subscribe" | "webinar">("subscribe");
  const { insights, marketData, isLoading, error, refreshInsights } = useMarketInsights();
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation({ threshold: 0.2 });
  const { ref: gridRef, isVisible: gridVisible } = useScrollAnimation({ threshold: 0.1 });
  const { ref: cardsRef, isVisible: cardsVisible } = useScrollAnimation({ threshold: 0.1 });

  return (
    <section className="py-12 sm:py-16 bg-financial-muted">
      <div className="container mx-auto px-4">
        <div 
          ref={headerRef}
          className={`text-center mb-8 transition-all duration-700 ${headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <div className="flex items-center justify-center gap-4 mb-3">
            <h2 className="text-3xl sm:text-4xl font-bold">
              Market <span className="text-financial-accent">Insights</span>
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshInsights}
              disabled={isLoading}
              className="border-financial-accent text-financial-accent hover:bg-financial-accent hover:text-white"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-3">
            Stay ahead with our expert analysis and actionable investment strategies
          </p>
          
          {marketData && (
            <div className="flex items-center justify-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-financial-accent" />
                <span className="font-medium">SENSEX:</span>
                <span className="font-bold">{marketData.sensex.current.toLocaleString()}</span>
                <span className={`font-medium ${marketData.sensex.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {marketData.sensex.change >= 0 ? '+' : ''}{marketData.sensex.change.toFixed(2)} ({marketData.sensex.changePercent.toFixed(2)}%)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-financial-accent" />
                <span className="font-medium">NIFTY:</span>
                <span className="font-bold">{marketData.nifty.current.toLocaleString()}</span>
                <span className={`font-medium ${marketData.nifty.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {marketData.nifty.change >= 0 ? '+' : ''}{marketData.nifty.change.toFixed(2)} ({marketData.nifty.changePercent.toFixed(2)}%)
                </span>
              </div>
            </div>
          )}
        </div>

        {isLoading && (
          <div className="text-center py-8">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-financial-accent" />
            <p className="text-muted-foreground">Loading fresh market insights...</p>
          </div>
        )}
        
        {error && (
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={refreshInsights} variant="outline">
              Try Again
            </Button>
          </div>
        )}

        <div ref={gridRef} className="grid lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-4 mb-6">
          {!isLoading && !error && insights.map((insight, index) => (
            <Card 
              key={index} 
              className={`bg-gradient-card border-0 shadow-card overflow-hidden hover-scale transition-all duration-500 ${gridVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
              style={{ transitionDelay: gridVisible ? `${index * 100}ms` : '0ms' }}
            >
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
                
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="w-3 h-3 mr-1" />
                    {insight.readTime}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {insight.source}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {new Date(insight.publishedAt).toLocaleDateString()}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-financial-accent hover:text-financial-accent/80"
                    onClick={() => window.open(insight.url, "_blank", "noopener,noreferrer")}
                  >
                    Read More
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div ref={cardsRef} className="grid md:grid-cols-3 gap-4">
          <Card className={`bg-gradient-gold border-0 shadow-card text-center p-6 transition-all duration-500 ${cardsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
            <BarChart3 className="w-12 h-12 text-financial-primary mx-auto mb-4" />
            <h3 className="text-xl font-bold text-financial-primary mb-2">Market Updates</h3>
            <p className="text-financial-secondary text-sm mb-4">Daily market analysis and fund performance updates</p>
            <Button 
              variant="outline" 
              className="border-financial-primary text-financial-primary hover:bg-financial-primary hover:text-white"
              onClick={() => {
                setActionType("subscribe");
                setShowContactForm(true);
              }}
            >
              Subscribe Free
            </Button>
          </Card>

          <Card className={`bg-gradient-card border-0 shadow-card text-center p-6 transition-all duration-500 ${cardsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`} style={{ transitionDelay: cardsVisible ? '100ms' : '0ms' }}>
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

          <Card className={`bg-gradient-card border-0 shadow-card text-center p-6 transition-all duration-500 ${cardsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`} style={{ transitionDelay: cardsVisible ? '200ms' : '0ms' }}>
            <Clock className="w-12 h-12 text-financial-accent mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Weekly Webinars</h3>
            <p className="text-muted-foreground text-sm mb-4">Join our live sessions on investment strategies</p>
            <Button 
              variant="outline" 
              className="border-financial-accent text-financial-accent hover:bg-financial-accent hover:text-white"
              onClick={() => {
                setActionType("webinar");
                setShowContactForm(true);
              }}
            >
              Join Live
            </Button>
          </Card>
        </div>
      </div>
      
      <ContactFormModal
        isOpen={showContactForm}
        onClose={() => setShowContactForm(false)}
        actionType={actionType}
      />
    </section>
  );
};

export default FeaturedInsights;