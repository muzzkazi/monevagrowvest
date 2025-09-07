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
  Brain
} from 'lucide-react';

import InvestmentSimulation from './InvestmentSimulation';
import RiskProfiler from './education/RiskProfiler';
import MarketExplorer from './education/MarketExplorer';

const FinancialEducation = () => {
  const [activeTab, setActiveTab] = useState('time-machine');

  const handleRiskProfileComplete = (profile: string, score: number) => {
    // Risk profile completed
  };

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


        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="time-machine" className="flex items-center">
              <LineChart className="w-4 h-4 mr-2" />
              Time Machine
            </TabsTrigger>
            <TabsTrigger value="market-explorer" className="flex items-center">
              <BarChart3 className="w-4 h-4 mr-2" />
              Market Explorer
            </TabsTrigger>
            <TabsTrigger value="risk-profiler" className="flex items-center">
              <Target className="w-4 h-4 mr-2" />
              Risk Profiler
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

          {/* Risk Profiler Tab */}
          <TabsContent value="risk-profiler" className="space-y-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-4">Discover Your Risk Profile</h3>
              <p className="text-muted-foreground">Answer a few questions to understand your investment personality and get personalized recommendations</p>
            </div>
            <RiskProfiler onProfileComplete={handleRiskProfileComplete} />
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
      </div>
    </section>
  );
};

export default FinancialEducation;