import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Trophy,
  Target,
  TrendingUp,
  LineChart,
  Zap,
  Gamepad2,
  BarChart3,
  Brain,
  Rewind,
  Compass,
  ArrowDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

import InvestmentSimulation from './InvestmentSimulation';
import MarketExplorer from './education/MarketExplorer';

const FinancialEducation = () => {
  const [activeTab, setActiveTab] = useState('time-machine');

  return (
    <section className="py-20 bg-gradient-hero relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-20 h-20 bg-financial-gold/10 rounded-full animate-float"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-financial-accent/10 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-accent/10 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-financial-gold text-financial-primary">
            <Gamepad2 className="w-4 h-4 mr-2" />
            Investing Lab
          </Badge>
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
            Master Investment
            <span className="text-financial-accent"> Strategies</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Learn through simulation, understand your risk tolerance, and explore market dynamics. 
            Build practical investing skills with hands-on tools and real market data.
          </p>
        </div>

        {/* Landing intro — explains the two tools and links down to the full experience */}
        <div className="max-w-6xl mx-auto mb-14">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="glass-card border-financial-gold/30 hover:border-financial-gold/60 transition-colors">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-11 h-11 rounded-xl bg-financial-gold/15 flex items-center justify-center">
                    <Rewind className="w-5 h-5 text-financial-gold" aria-hidden="true" />
                  </div>
                  <Badge variant="outline" className="text-financial-gold border-financial-gold/50">
                    Simulation
                  </Badge>
                </div>
                <CardTitle className="text-2xl">Time Machine</CardTitle>
                <CardDescription className="text-base">
                  Rewind up to 25 years of Indian market history and watch Conservative, Moderate,
                  and Aggressive strategies react to every crash, rally, and reform — year by year,
                  with real return data. Compare tenures to see which window delivered the highest returns.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="ghost"
                  className="text-financial-gold hover:text-financial-gold hover:bg-financial-gold/10 -ml-3"
                  onClick={() => {
                    setActiveTab('time-machine');
                    document.getElementById('investing-lab-tabs')?.scrollIntoView({
                      behavior: 'smooth',
                      block: 'start',
                    });
                  }}
                >
                  Open Time Machine
                  <ArrowDown className="w-4 h-4 ml-2" aria-hidden="true" />
                </Button>
              </CardContent>
            </Card>

            <Card className="glass-card border-financial-accent/30 hover:border-financial-accent/60 transition-colors">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-11 h-11 rounded-xl bg-financial-accent/15 flex items-center justify-center">
                    <Compass className="w-5 h-5 text-financial-accent" aria-hidden="true" />
                  </div>
                  <Badge variant="outline" className="text-financial-accent border-financial-accent/50">
                    Exploration
                  </Badge>
                </div>
                <CardTitle className="text-2xl">Market Explorer</CardTitle>
                <CardDescription className="text-base">
                  Interactively explore Nifty 50 and Sensex through the decades — spot the events
                  that moved indices, and see how sector weights and returns shifted around them.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="ghost"
                  className="text-financial-accent hover:text-financial-accent hover:bg-financial-accent/10 -ml-3"
                  onClick={() => {
                    setActiveTab('market-explorer');
                    document.getElementById('investing-lab-tabs')?.scrollIntoView({
                      behavior: 'smooth',
                      block: 'start',
                    });
                  }}
                >
                  Open Market Explorer
                  <ArrowDown className="w-4 h-4 ml-2" aria-hidden="true" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>




        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-6xl mx-auto" id="investing-lab-tabs">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="time-machine" className="flex items-center">
              <LineChart className="w-4 h-4 mr-2" />
              Time Machine
            </TabsTrigger>
            <TabsTrigger value="market-explorer" className="flex items-center">
              <BarChart3 className="w-4 h-4 mr-2" />
              Market Explorer
            </TabsTrigger>
          </TabsList>

          {/* Investment Time Machine Tab */}
          <TabsContent value="time-machine" className="space-y-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-4">Investment Time Machine</h3>
              <p className="text-muted-foreground">Experience 10 years of Indian market history and see how different strategies perform</p>
            </div>
            <InvestmentSimulation />
          </TabsContent>

          {/* Market Explorer Tab */}
          <TabsContent value="market-explorer" className="space-y-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-4">Indian Market Explorer</h3>
              <p className="text-muted-foreground">Explore historical performance of Indian indices with key market events and sector insights</p>
            </div>
            <MarketExplorer />
          </TabsContent>
        </Tabs>
        <p className="text-center text-sm text-muted-foreground mt-6">
          Want a personalized risk profile? It's now part of our <a href="/ai-planning" className="text-financial-accent hover:underline font-medium">AI Planning wizard</a>.
        </p>
      </div>
    </section>
  );
};

export default FinancialEducation;