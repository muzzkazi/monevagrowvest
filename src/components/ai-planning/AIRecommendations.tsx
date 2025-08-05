import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Brain, 
  TrendingUp, 
  PieChart, 
  Target, 
  DollarSign, 
  Calendar,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Download,
  BookOpen,
  LineChart,
  Info,
  MessageCircle,
  Phone,
  PiggyBank
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ContactFormModal from "../ContactFormModal";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend as RechartsLegend, ResponsiveContainer, ReferenceLine } from 'recharts';

interface FinancialGoal {
  id: string;
  name: string;
  category: string;
  targetAmount: number;
  timeHorizon: number;
  priority: number;
  currentSavings: number;
}

interface SIPData {
  monthlyAmount: number;
  wantsTaxBenefits: boolean;
  taxBracket: string;
  timeHorizon: number;
}

interface AIRecommendationsProps {
  goals?: FinancialGoal[];
  sipData?: SIPData;
  riskProfile: string;
  planningMode: "goals" | "sip";
  onComplete: () => void;
}

interface AssetAllocation {
  category: string;
  percentage: number;
  amount: number;
  color: string;
  instruments: string[];
}

interface Recommendation {
  id: string;
  name: string;
  type: string;
  allocation: number;
  expectedReturn: string;
  riskLevel: "Low" | "Medium" | "High";
  reason: string;
  sipAmount?: number;
  score?: number;
  expenseRatio?: string;
  fundSize?: string;
  managerTenure?: string;
  taxEfficiency?: "High" | "Medium" | "Low";
  alternativeFund?: string;
}

interface TaxOptimization {
  elssRecommendation?: number;
  taxSavingPotential?: number;
  ltcgStrategy?: string;
  taxEfficientFunds?: string[];
}

interface RebalancingStrategy {
  frequency: string;
  triggerThreshold: string;
  methodology: string;
  nextReviewDate: string;
}

interface BehavioralInsights {
  investorType: string;
  commonBiases: string[];
  recommendations: string[];
  disciplineScore: number;
}

const AIRecommendations = ({ goals = [], sipData, riskProfile, planningMode, onComplete }: AIRecommendationsProps) => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(true);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [showContactForm, setShowContactForm] = useState(false);
  const [actionType, setActionType] = useState<"download" | "implement">("download");

  // Expected annual return based on risk profile (consistent across all calculations)
  const getExpectedReturn = () => {
    const expectedReturns = {
      Conservative: 8.5,
      Moderate: 11,
      Balanced: 13,
      Aggressive: 15
    };
    return expectedReturns[riskProfile as keyof typeof expectedReturns] || 11;
  };

  const expectedReturn = getExpectedReturn();

  // Helper function to calculate monthly SIP needed for a goal
  const calculateMonthlySIP = (targetAmount: number, currentSavings: number, timeHorizon: number) => {
    const futureValueOfCurrentSavings = currentSavings * Math.pow(1 + expectedReturn / 100, timeHorizon);
    const remainingAmount = targetAmount - futureValueOfCurrentSavings;
    
    if (remainingAmount <= 0) return 0;
    
    const monthlyRate = expectedReturn / 100 / 12;
    const totalMonths = timeHorizon * 12;
    
    // SIP formula: PMT = FV / [((1 + r)^n - 1) / r]
    const monthlySIP = remainingAmount / (((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate));
    return Math.round(monthlySIP);
  };

  // Calculate data based on planning mode
  let totalMonthlySIP = 0;
  let totalTargetAmount = 0;
  let goalSIPs: (FinancialGoal & { monthlySIP: number })[] = [];

  if (planningMode === "goals") {
    // Calculate individual SIPs for each goal using consistent expected return
    goalSIPs = goals.map(goal => ({
      ...goal,
      monthlySIP: calculateMonthlySIP(goal.targetAmount, goal.currentSavings, goal.timeHorizon)
    }));
    
    totalMonthlySIP = goalSIPs.reduce((total, goal) => total + goal.monthlySIP, 0);
    totalTargetAmount = goals.reduce((total, goal) => total + goal.targetAmount, 0);
  } else if (planningMode === "sip" && sipData) {
    // Use SIP data directly
    totalMonthlySIP = sipData.monthlyAmount;
    // Calculate projected value based on SIP amount and time horizon
    const monthlyReturn = expectedReturn / 100 / 12;
    const totalMonths = sipData.timeHorizon * 12;
    totalTargetAmount = sipData.monthlyAmount * (((Math.pow(1 + monthlyReturn, totalMonths) - 1) / monthlyReturn) * (1 + monthlyReturn));
  }

  // Debug logging
  console.log("=== AI Planning Debug ===");
  console.log("Planning Mode:", planningMode);
  console.log("Risk Profile:", riskProfile);
  console.log("Expected Return:", expectedReturn + "%");
  console.log("Goals:", goals);
  console.log("SIP Data:", sipData);
  console.log("Goal SIPs:", goalSIPs);
  console.log("Total Monthly SIP:", totalMonthlySIP);
  console.log("Total Target Amount:", totalTargetAmount);

  // Dynamic asset allocation based on risk profile and tax preferences
  const getRiskBasedAllocation = () => {
    // For SIP planning with tax benefits, prioritize ELSS and tax-efficient funds
    if (planningMode === "sip" && sipData?.wantsTaxBenefits) {
      const allocations = {
        Conservative: [
          { category: "ELSS (Tax Saving)", percentage: 30, color: "#10b981", instruments: ["Axis Long Term Equity Fund", "Mirae Asset Tax Saver Fund", "Invesco India Tax Plan"] },
          { category: "Short Duration Debt Funds", percentage: 25, color: "#059669", instruments: ["HDFC Short Term Debt Fund", "ICICI Pru Short Term Fund", "SBI Short Term Debt Fund"] },
          { category: "Large Cap Equity Funds", percentage: 20, color: "#3b82f6", instruments: ["HDFC Top 100 Fund", "ICICI Pru Bluechip Fund", "SBI Large Cap Fund"] },
          { category: "Conservative Hybrid Funds", percentage: 15, color: "#6366f1", instruments: ["HDFC Balanced Advantage Fund", "ICICI Pru Balanced Advantage Fund", "SBI Conservative Hybrid Fund"] },
          { category: "Gold Funds", percentage: 10, color: "#fbbf24", instruments: ["HDFC Gold Fund", "SBI Gold Fund", "Nippon India Gold Savings Fund"] }
        ],
        Moderate: [
          { category: "ELSS (Tax Saving)", percentage: 35, color: "#10b981", instruments: ["Axis Long Term Equity Fund", "Mirae Asset Tax Saver Fund", "Invesco India Tax Plan"] },
          { category: "Large Cap Equity Funds", percentage: 25, color: "#3b82f6", instruments: ["HDFC Top 100 Fund", "ICICI Pru Bluechip Fund", "SBI Large Cap Fund"] },
          { category: "Balanced Advantage Funds", percentage: 20, color: "#6366f1", instruments: ["HDFC Balanced Advantage Fund", "ICICI Pru Balanced Advantage Fund", "SBI Dynamic Asset Allocation Fund"] },
          { category: "Short Duration Debt Funds", percentage: 10, color: "#059669", instruments: ["HDFC Short Term Debt Fund", "ICICI Pru Short Term Fund", "SBI Short Term Debt Fund"] },
          { category: "Gold Funds", percentage: 10, color: "#fbbf24", instruments: ["HDFC Gold Fund", "SBI Gold Fund", "Nippon India Gold Savings Fund"] }
        ],
        Balanced: [
          { category: "ELSS (Tax Saving)", percentage: 40, color: "#10b981", instruments: ["Axis Long Term Equity Fund", "Mirae Asset Tax Saver Fund", "Invesco India Tax Plan"] },
          { category: "Flexi Cap Funds", percentage: 30, color: "#8b5cf6", instruments: ["Parag Parikh Flexi Cap Fund", "HDFC Flexi Cap Fund", "ICICI Pru Flexi Cap Fund"] },
          { category: "Large & Mid Cap Funds", percentage: 20, color: "#3b82f6", instruments: ["HDFC Large and Mid Cap Fund", "ICICI Pru Large & Mid Cap Fund", "SBI Large & Midcap Fund"] },
          { category: "Gold Funds", percentage: 10, color: "#fbbf24", instruments: ["HDFC Gold Fund", "SBI Gold Fund", "Nippon India Gold Savings Fund"] }
        ],
        Aggressive: [
          { category: "ELSS (Tax Saving)", percentage: 30, color: "#10b981", instruments: ["Axis Long Term Equity Fund", "Mirae Asset Tax Saver Fund", "Invesco India Tax Plan"] },
          { category: "Mid Cap Funds", percentage: 35, color: "#8b5cf6", instruments: ["Kotak Emerging Equity Fund", "HDFC Mid-Cap Opportunities Fund", "DSP Midcap Fund"] },
          { category: "Small Cap Funds", percentage: 20, color: "#ef4444", instruments: ["Axis Small Cap Fund", "SBI Small Cap Fund", "HDFC Small Cap Fund"] },
          { category: "Flexi Cap Funds", percentage: 15, color: "#6366f1", instruments: ["Parag Parikh Flexi Cap Fund", "HDFC Flexi Cap Fund", "ICICI Pru Flexi Cap Fund"] }
        ]
      };
      return allocations[riskProfile as keyof typeof allocations] || allocations.Moderate;
    }

    // Default allocations for goal-based planning or SIP without tax benefits
    const allocations = {
      Conservative: [
        { category: "Short Duration Debt Funds", percentage: 40, color: "#10b981", instruments: ["HDFC Short Term Debt Fund", "ICICI Pru Short Term Fund", "SBI Short Term Debt Fund"] },
        { category: "Corporate Bond Funds", percentage: 15, color: "#059669", instruments: ["HDFC Corporate Bond Fund", "ICICI Pru Corporate Bond Fund", "Aditya Birla Corporate Bond Fund"] },
        { category: "Conservative Hybrid Funds", percentage: 15, color: "#6366f1", instruments: ["HDFC Balanced Advantage Fund", "ICICI Pru Balanced Advantage Fund", "SBI Conservative Hybrid Fund"] },
        { category: "Arbitrage Funds", percentage: 10, color: "#8b5cf6", instruments: ["ICICI Pru Arbitrage Fund", "Kotak Equity Arbitrage Fund", "Nippon India Arbitrage Fund"] },
        { category: "Large Cap Equity Funds", percentage: 10, color: "#3b82f6", instruments: ["HDFC Top 100 Fund", "ICICI Pru Bluechip Fund", "SBI Large Cap Fund"] },
        { category: "Gold ETF", percentage: 10, color: "#fbbf24", instruments: ["HDFC Gold ETF", "SBI Gold ETF", "Nippon Gold BeES"] }
      ],
      Moderate: [
        { category: "Balanced Advantage Funds", percentage: 40, color: "#6366f1", instruments: ["HDFC Balanced Advantage Fund", "ICICI Pru Balanced Advantage Fund", "SBI Dynamic Asset Allocation Fund"] },
        { category: "Large Cap Equity Funds", percentage: 30, color: "#3b82f6", instruments: ["HDFC Top 100 Fund", "ICICI Pru Bluechip Fund", "SBI Large Cap Fund"] },
        { category: "Short Duration Debt Funds", percentage: 20, color: "#10b981", instruments: ["HDFC Short Term Debt Fund", "ICICI Pru Short Term Fund", "SBI Short Term Debt Fund"] },
        { category: "Gold Funds", percentage: 10, color: "#fbbf24", instruments: ["HDFC Gold Fund", "SBI Gold Fund", "Nippon India Gold Savings Fund"] }
      ],
      Balanced: [
        { category: "Flexi Cap Funds", percentage: 40, color: "#8b5cf6", instruments: ["Parag Parikh Flexi Cap Fund", "HDFC Flexi Cap Fund", "ICICI Pru Flexi Cap Fund"] },
        { category: "Large & Mid Cap Funds", percentage: 30, color: "#3b82f6", instruments: ["HDFC Large and Mid Cap Fund", "ICICI Pru Large & Mid Cap Fund", "SBI Large & Midcap Fund"] },
        { category: "Hybrid Equity Funds", percentage: 20, color: "#6366f1", instruments: ["SBI Equity Hybrid Fund", "HDFC Hybrid Equity Fund", "ICICI Pru Equity & Debt Fund"] },
        { category: "Gold Funds", percentage: 10, color: "#fbbf24", instruments: ["HDFC Gold Fund", "SBI Gold Fund", "Nippon India Gold Savings Fund"] }
      ],
      Aggressive: [
        { category: "Mid Cap Funds", percentage: 40, color: "#8b5cf6", instruments: ["Kotak Emerging Equity Fund", "HDFC Mid-Cap Opportunities Fund", "DSP Midcap Fund"] },
        { category: "Small Cap Funds", percentage: 30, color: "#ef4444", instruments: ["Axis Small Cap Fund", "SBI Small Cap Fund", "HDFC Small Cap Fund"] },
        { category: "Flexi Cap Funds", percentage: 20, color: "#6366f1", instruments: ["Parag Parikh Flexi Cap Fund", "HDFC Flexi Cap Fund", "ICICI Pru Flexi Cap Fund"] },
        { category: "Large Cap Funds", percentage: 10, color: "#3b82f6", instruments: ["HDFC Top 100 Fund", "ICICI Pru Bluechip Fund", "SBI Large Cap Fund"] }
      ]
    };
    return allocations[riskProfile as keyof typeof allocations] || allocations.Moderate;
  };

  const assetAllocation = getRiskBasedAllocation();
  
  // Calculate amounts for each allocation based on monthly SIP
  const assetAllocationWithAmounts: AssetAllocation[] = assetAllocation.map(asset => ({
    ...asset,
    amount: Math.round((totalMonthlySIP * asset.percentage) / 100)
  }));

  // Fund database with comprehensive details
  interface FundData {
    name: string;
    score: number;
    expenseRatio: string;
    fundSize: string;
    managerTenure: string;
    taxEfficiency: "High" | "Medium" | "Low";
    expectedReturn: string;
    alternativeFund: string;
  }

  interface RiskProfileFunds {
    [key: string]: FundData;
  }

  const getFundDatabase = (): { [key: string]: RiskProfileFunds } => {
    return {
      Conservative: {
        "ELSS (Tax Saving)": { name: "Axis Long Term Equity Fund", score: 91, expenseRatio: "1.25%", fundSize: "₹22,500 Cr", managerTenure: "8 years", taxEfficiency: "High", expectedReturn: "12-15%", alternativeFund: "Mirae Asset Tax Saver Fund" },
        "Short Duration Debt Funds": { name: "HDFC Short Term Debt Fund", score: 92, expenseRatio: "0.35%", fundSize: "₹8,500 Cr", managerTenure: "6 years", taxEfficiency: "High", expectedReturn: "6-8%", alternativeFund: "ICICI Pru Short Term Fund" },
        "Corporate Bond Funds": { name: "ICICI Pru Corporate Bond Fund", score: 89, expenseRatio: "0.42%", fundSize: "₹4,200 Cr", managerTenure: "4 years", taxEfficiency: "High", expectedReturn: "7-9%", alternativeFund: "Aditya Birla Corporate Bond Fund" },
        "Conservative Hybrid Funds": { name: "HDFC Balanced Advantage Fund", score: 87, expenseRatio: "0.95%", fundSize: "₹12,500 Cr", managerTenure: "8 years", taxEfficiency: "Medium", expectedReturn: "9-11%", alternativeFund: "ICICI Pru Balanced Advantage Fund" },
        "Arbitrage Funds": { name: "ICICI Pru Arbitrage Fund", score: 85, expenseRatio: "0.65%", fundSize: "₹3,200 Cr", managerTenure: "5 years", taxEfficiency: "High", expectedReturn: "5-7%", alternativeFund: "Kotak Equity Arbitrage Fund" },
        "Large Cap Equity Funds": { name: "HDFC Top 100 Fund", score: 94, expenseRatio: "1.25%", fundSize: "₹25,600 Cr", managerTenure: "12 years", taxEfficiency: "Medium", expectedReturn: "12-14%", alternativeFund: "ICICI Pru Bluechip Fund" },
        "Gold ETF": { name: "HDFC Gold ETF", score: 83, expenseRatio: "0.50%", fundSize: "₹1,800 Cr", managerTenure: "6 years", taxEfficiency: "Low", expectedReturn: "8-10%", alternativeFund: "SBI Gold ETF" },
        "Gold Funds": { name: "HDFC Gold Fund", score: 85, expenseRatio: "0.55%", fundSize: "₹1,800 Cr", managerTenure: "5 years", taxEfficiency: "Low", expectedReturn: "8-10%", alternativeFund: "SBI Gold Fund" }
      },
      Moderate: {
        "ELSS (Tax Saving)": { name: "Mirae Asset Tax Saver Fund", score: 93, expenseRatio: "1.05%", fundSize: "₹18,200 Cr", managerTenure: "7 years", taxEfficiency: "High", expectedReturn: "13-16%", alternativeFund: "Invesco India Tax Plan" },
        "Balanced Advantage Funds": { name: "HDFC Balanced Advantage Fund", score: 91, expenseRatio: "0.95%", fundSize: "₹12,500 Cr", managerTenure: "8 years", taxEfficiency: "Medium", expectedReturn: "10-12%", alternativeFund: "SBI Dynamic Asset Allocation Fund" },
        "Large Cap Equity Funds": { name: "ICICI Pru Bluechip Fund", score: 93, expenseRatio: "1.05%", fundSize: "₹18,200 Cr", managerTenure: "10 years", taxEfficiency: "Medium", expectedReturn: "12-15%", alternativeFund: "SBI Large Cap Fund" },
        "Short Duration Debt Funds": { name: "HDFC Short Term Debt Fund", score: 92, expenseRatio: "0.35%", fundSize: "₹8,500 Cr", managerTenure: "6 years", taxEfficiency: "High", expectedReturn: "6-8%", alternativeFund: "ICICI Pru Short Term Fund" },
        "Gold Funds": { name: "HDFC Gold Fund", score: 85, expenseRatio: "0.55%", fundSize: "₹1,800 Cr", managerTenure: "5 years", taxEfficiency: "Low", expectedReturn: "8-10%", alternativeFund: "SBI Gold Fund" }
      },
      Balanced: {
        "ELSS (Tax Saving)": { name: "Invesco India Tax Plan", score: 89, expenseRatio: "1.15%", fundSize: "₹12,800 Cr", managerTenure: "9 years", taxEfficiency: "High", expectedReturn: "14-17%", alternativeFund: "Axis Long Term Equity Fund" },
        "Flexi Cap Funds": { name: "Parag Parikh Flexi Cap Fund", score: 95, expenseRatio: "0.68%", fundSize: "₹35,600 Cr", managerTenure: "15 years", taxEfficiency: "Medium", expectedReturn: "14-16%", alternativeFund: "HDFC Flexi Cap Fund" },
        "Large & Mid Cap Funds": { name: "HDFC Large and Mid Cap Fund", score: 90, expenseRatio: "1.45%", fundSize: "₹8,900 Cr", managerTenure: "7 years", taxEfficiency: "Medium", expectedReturn: "13-16%", alternativeFund: "ICICI Pru Large & Mid Cap Fund" },
        "Hybrid Equity Funds": { name: "SBI Equity Hybrid Fund", score: 88, expenseRatio: "1.15%", fundSize: "₹6,500 Cr", managerTenure: "9 years", taxEfficiency: "Medium", expectedReturn: "11-13%", alternativeFund: "HDFC Hybrid Equity Fund" },
        "Gold Funds": { name: "Nippon India Gold Savings Fund", score: 86, expenseRatio: "0.65%", fundSize: "₹2,100 Cr", managerTenure: "6 years", taxEfficiency: "Low", expectedReturn: "8-10%", alternativeFund: "SBI Gold Fund" }
      },
      Aggressive: {
        "ELSS (Tax Saving)": { name: "Axis Long Term Equity Fund", score: 91, expenseRatio: "1.25%", fundSize: "₹22,500 Cr", managerTenure: "8 years", taxEfficiency: "High", expectedReturn: "15-18%", alternativeFund: "Mirae Asset Tax Saver Fund" },
        "Mid Cap Funds": { name: "Kotak Emerging Equity Fund", score: 92, expenseRatio: "1.85%", fundSize: "₹12,800 Cr", managerTenure: "11 years", taxEfficiency: "Medium", expectedReturn: "16-20%", alternativeFund: "DSP Midcap Fund" },
        "Small Cap Funds": { name: "Axis Small Cap Fund", score: 89, expenseRatio: "2.15%", fundSize: "₹8,600 Cr", managerTenure: "8 years", taxEfficiency: "Medium", expectedReturn: "18-25%", alternativeFund: "SBI Small Cap Fund" },
        "Flexi Cap Funds": { name: "HDFC Flexi Cap Fund", score: 91, expenseRatio: "1.35%", fundSize: "₹18,500 Cr", managerTenure: "9 years", taxEfficiency: "Medium", expectedReturn: "14-18%", alternativeFund: "ICICI Pru Flexi Cap Fund" },
        "Large Cap Funds": { name: "SBI Large Cap Fund", score: 88, expenseRatio: "0.95%", fundSize: "₹15,200 Cr", managerTenure: "6 years", taxEfficiency: "Medium", expectedReturn: "12-15%", alternativeFund: "HDFC Top 100 Fund" }
      }
    };
  };

  // Generate recommendations based on asset allocation
  const generateRecommendations = (): Recommendation[] => {
    const fundDatabase = getFundDatabase();
    const riskProfileFunds = fundDatabase[riskProfile] || fundDatabase.Moderate;
    
    return assetAllocationWithAmounts.map((asset, index) => {
      // Find matching fund for this category
      const fundData = riskProfileFunds[asset.category];
      
      if (!fundData) {
        // Fallback to first available fund
        const firstKey = Object.keys(riskProfileFunds)[0];
        const fallbackFund = riskProfileFunds[firstKey];
        return {
          id: (index + 1).toString(),
          name: fallbackFund.name,
          type: asset.category,
          allocation: asset.percentage,
          expectedReturn: fallbackFund.expectedReturn,
          riskLevel: fallbackFund.taxEfficiency === "High" ? "Low" : fallbackFund.taxEfficiency === "Medium" ? "Medium" : "High",
          reason: `Score: ${fallbackFund.score}/100. ${asset.category} allocation (${asset.percentage}%). Expense ratio: ${fallbackFund.expenseRatio}, Manager tenure: ${fallbackFund.managerTenure}.`,
          sipAmount: Math.round((totalMonthlySIP * asset.percentage) / 100),
          score: fallbackFund.score,
          expenseRatio: fallbackFund.expenseRatio,
          fundSize: fallbackFund.fundSize,
          managerTenure: fallbackFund.managerTenure,
          taxEfficiency: fallbackFund.taxEfficiency,
          alternativeFund: fallbackFund.alternativeFund
        };
      }

      return {
        id: (index + 1).toString(),
        name: fundData.name,
        type: asset.category,
        allocation: asset.percentage,
        expectedReturn: fundData.expectedReturn,
        riskLevel: fundData.taxEfficiency === "High" ? "Low" : fundData.taxEfficiency === "Medium" ? "Medium" : "High",
        reason: `Score: ${fundData.score}/100. ${asset.category} allocation (${asset.percentage}%). Expense ratio: ${fundData.expenseRatio}, Manager tenure: ${fundData.managerTenure}.`,
        sipAmount: Math.round((totalMonthlySIP * asset.percentage) / 100),
        score: fundData.score,
        expenseRatio: fundData.expenseRatio,
        fundSize: fundData.fundSize,
        managerTenure: fundData.managerTenure,
        taxEfficiency: fundData.taxEfficiency,
        alternativeFund: fundData.alternativeFund
      };
    });
  };

  const recommendations = generateRecommendations();

  // Generate investment projection data using consistent return rate
  const generateProjectionData = () => {
    let maxTimeHorizon = 10; // Default 10 years for SIP planning
    
    if (planningMode === "goals" && goals.length > 0) {
      maxTimeHorizon = Math.max(...goals.map(g => g.timeHorizon));
    } else if (planningMode === "sip" && sipData) {
      maxTimeHorizon = sipData.timeHorizon;
    }
    
    const data = [];
    const monthlyReturn = expectedReturn / 100 / 12;
    
    for (let month = 0; month <= maxTimeHorizon * 12; month++) {
      const year = month / 12;
      const totalInvested = totalMonthlySIP * month;
      
      // Calculate portfolio value using the exact same SIP compound formula
      let portfolioValue = 0;
      if (month > 0) {
        // Use the standard SIP future value formula: PMT * [((1 + r)^n - 1) / r] * (1 + r)
        portfolioValue = totalMonthlySIP * (((Math.pow(1 + monthlyReturn, month) - 1) / monthlyReturn) * (1 + monthlyReturn));
      }
      
      // Add current savings growth for any existing savings
      let currentSavingsGrowth = 0;
      if (planningMode === "goals") {
        currentSavingsGrowth = goals.reduce((total, goal) => {
          const yearsElapsed = month / 12;
          if (yearsElapsed <= goal.timeHorizon) {
            return total + goal.currentSavings * Math.pow(1 + expectedReturn / 100, yearsElapsed);
          }
          return total + goal.currentSavings * Math.pow(1 + expectedReturn / 100, goal.timeHorizon);
        }, 0);
      }
      
      const totalPortfolioValue = portfolioValue + currentSavingsGrowth;

      data.push({
        month,
        year: parseFloat(year.toFixed(1)),
        totalInvested: Math.round(totalInvested),
        portfolioValue: Math.round(totalPortfolioValue),
        returns: Math.round(totalPortfolioValue - totalInvested)
      });
    }
    
    return data;
  };

  const projectionData = generateProjectionData();

  const formatCurrency = (value: number) => {
    return `₹${(value / 100000).toFixed(1)}L`;
  };

  const formatTooltipCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(value);
  };

  // Tax Optimization Analysis
  const getTaxOptimization = (): TaxOptimization => {
    const annualSIP = totalMonthlySIP * 12;
    const elssRecommendation = Math.min(150000, annualSIP * 0.3); // Max 30% or ₹1.5L
    const taxSavingPotential = elssRecommendation * 0.31; // 31% tax bracket savings
    
    return {
      elssRecommendation,
      taxSavingPotential,
      ltcgStrategy: annualSIP > 500000 ? "Systematic profit booking after 1 year to utilize ₹1L exemption" : "Hold for long term, utilize ₹1L LTCG exemption",
      taxEfficientFunds: ["HDFC Tax Saver (ELSS)", "Axis Long Term Equity Fund", "Mirae Asset Tax Saver Fund"]
    };
  };

  // Rebalancing Strategy
  const getRebalancingStrategy = (): RebalancingStrategy => {
    return {
      frequency: "Quarterly Review, Annual Rebalancing",
      triggerThreshold: "±5% deviation from target allocation",
      methodology: "Threshold-based rebalancing with market condition adjustments",
      nextReviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN')
    };
  };

  // Behavioral Finance Insights
  const getBehavioralInsights = (): BehavioralInsights => {
    const insights = {
      Conservative: {
        investorType: "Risk-Averse Investor",
        commonBiases: ["Loss Aversion", "Status Quo Bias", "Overweighting Recent Events"],
        recommendations: ["Start small and increase gradually", "Focus on capital preservation", "Use systematic investment to reduce timing bias"],
        disciplineScore: 85
      },
      Moderate: {
        investorType: "Balanced Investor", 
        commonBiases: ["Anchoring Bias", "Herd Mentality", "Confirmation Bias"],
        recommendations: ["Diversify across asset classes", "Avoid market timing", "Regular portfolio reviews"],
        disciplineScore: 75
      },
      Balanced: {
        investorType: "Growth-Oriented Investor",
        commonBiases: ["Overconfidence", "Recency Bias", "Home Country Bias"],
        recommendations: ["International diversification", "Long-term perspective", "Systematic approach"],
        disciplineScore: 70
      },
      Aggressive: {
        investorType: "High-Risk Investor",
        commonBiases: ["Overconfidence", "Gambling Fallacy", "Hot-Hand Bias"],
        recommendations: ["Maintain discipline during volatility", "Regular profit booking", "Risk management crucial"],
        disciplineScore: 60
      }
    };

    return insights[riskProfile as keyof typeof insights] || insights.Moderate;
  };

  const taxOptimization = getTaxOptimization();
  const rebalancingStrategy = getRebalancingStrategy();
  const behavioralInsights = getBehavioralInsights();

  useEffect(() => {
    // Simulate AI generation process
    const interval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 100) {
          setIsGenerating(false);
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  const handleImplementPlan = () => {
    setActionType("implement");
    setShowContactForm(true);
  };

  const handleDownloadReport = async () => {
    // Direct PDF download without contact form
    toast({
      title: "Generating Enhanced PDF Report",
      description: "Creating your comprehensive investment strategy report with charts and visual elements...",
    });

    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.width;
      const pageHeight = pdf.internal.pageSize.height;
      let yPosition = 20;

      // Helper function to add new page if needed
      const checkPageBreak = (requiredHeight: number) => {
        if (yPosition + requiredHeight > pageHeight - 20) {
          pdf.addPage();
          yPosition = 20;
        }
      };

      // Create charts for PDF inclusion
      const createChartCanvas = (data: any[], type: 'line' | 'pie'): Promise<HTMLCanvasElement> => {
        return new Promise((resolve) => {
          const canvas = document.createElement('canvas');
          canvas.width = 600;
          canvas.height = 300;
          const ctx = canvas.getContext('2d')!;

          // Set background
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          if (type === 'line') {
            // Draw growth projection chart
            const maxValue = Math.max(...data.map(d => d.portfolioValue));
            const minValue = 0;
            const chartWidth = 500;
            const chartHeight = 200;
            const chartX = 50;
            const chartY = 50;

            // Draw axes
            ctx.strokeStyle = '#e5e7eb';
            ctx.lineWidth = 1;
            
            // Y-axis
            ctx.beginPath();
            ctx.moveTo(chartX, chartY);
            ctx.lineTo(chartX, chartY + chartHeight);
            ctx.stroke();
            
            // X-axis
            ctx.beginPath();
            ctx.moveTo(chartX, chartY + chartHeight);
            ctx.lineTo(chartX + chartWidth, chartY + chartHeight);
            ctx.stroke();

            // Draw grid lines
            ctx.strokeStyle = '#f3f4f6';
            for (let i = 1; i < 5; i++) {
              const y = chartY + (chartHeight / 5) * i;
              ctx.beginPath();
              ctx.moveTo(chartX, y);
              ctx.lineTo(chartX + chartWidth, y);
              ctx.stroke();
            }

            // Draw data lines
            if (data.length > 0) {
              // Portfolio value line (blue)
              ctx.strokeStyle = '#3b82f6';
              ctx.lineWidth = 3;
              ctx.beginPath();
              data.forEach((point, index) => {
                const x = chartX + (chartWidth / (data.length - 1)) * index;
                const y = chartY + chartHeight - ((point.portfolioValue - minValue) / (maxValue - minValue)) * chartHeight;
                if (index === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
              });
              ctx.stroke();

              // Total invested line (green)
              ctx.strokeStyle = '#10b981';
              ctx.lineWidth = 2;
              ctx.beginPath();
              data.forEach((point, index) => {
                const x = chartX + (chartWidth / (data.length - 1)) * index;
                const y = chartY + chartHeight - ((point.totalInvested - minValue) / (maxValue - minValue)) * chartHeight;
                if (index === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
              });
              ctx.stroke();
            }

            // Add labels
            ctx.fillStyle = '#374151';
            ctx.font = '12px Arial';
            ctx.fillText('Investment Growth Over Time', chartX + chartWidth/2 - 80, 30);
            
            // Legend
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(chartX + chartWidth - 150, 20, 15, 3);
            ctx.fillStyle = '#374151';
            ctx.fillText('Portfolio Value', chartX + chartWidth - 130, 25);
            
            ctx.fillStyle = '#10b981';
            ctx.fillRect(chartX + chartWidth - 150, 30, 15, 3);
            ctx.fillStyle = '#374151';
            ctx.fillText('Total Invested', chartX + chartWidth - 130, 35);

          } else if (type === 'pie') {
            // Draw asset allocation pie chart
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const radius = 80;
            
            let currentAngle = 0;
            const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
            
            data.forEach((asset, index) => {
              const sliceAngle = (asset.percentage / 100) * 2 * Math.PI;
              
              // Draw slice
              ctx.fillStyle = colors[index % colors.length];
              ctx.beginPath();
              ctx.moveTo(centerX, centerY);
              ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
              ctx.closePath();
              ctx.fill();
              
              // Draw label
              const labelAngle = currentAngle + sliceAngle / 2;
              const labelX = centerX + Math.cos(labelAngle) * (radius + 30);
              const labelY = centerY + Math.sin(labelAngle) * (radius + 30);
              
              ctx.fillStyle = '#374151';
              ctx.font = '10px Arial';
              ctx.textAlign = 'center';
              ctx.fillText(`${asset.category}`, labelX, labelY);
              ctx.fillText(`${asset.percentage}%`, labelX, labelY + 12);
              
              currentAngle += sliceAngle;
            });
            
            // Title
            ctx.fillStyle = '#374151';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Asset Allocation', centerX, 30);
          }

          resolve(canvas);
        });
      };

      // Header with Moneva logo and company info
      try {
        // Add actual Moneva logo
        pdf.addImage('/lovable-uploads/0e8706be-f873-45af-8037-de6a700531a1.png', 'PNG', 20, yPosition, 40, 12);
        
        // Company name next to logo
        pdf.setFontSize(14);
        pdf.setTextColor(40, 116, 166);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Moneva Growvest Pvt. Ltd.', 65, yPosition + 8);
      } catch (error) {
        // Fallback if logo fails to load
        pdf.setFontSize(20);
        pdf.setTextColor(40, 116, 166);
        pdf.text('MONEVA', 20, yPosition);
        pdf.setFontSize(10);
        pdf.text('Moneva Growvest Pvt. Ltd.', 20, yPosition + 8);
      }
      
      pdf.setFontSize(12);
      pdf.setTextColor(100, 100, 100);
      pdf.text('Investment Advisory & Wealth Management', 20, yPosition + 18);
      
      yPosition += 30;
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.text('AI-GENERATED INVESTMENT STRATEGY REPORT', 20, yPosition);
      
      yPosition += 10;
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, yPosition);
      pdf.text(`Risk Profile: ${riskProfile}`, pageWidth - 50, yPosition);
      
      yPosition += 20;

      // 1. EXECUTIVE SUMMARY (Enhanced with visual elements)
      checkPageBreak(50);
      
      // Draw a colored header background
      pdf.setFillColor(40, 116, 166);
      pdf.rect(20, yPosition - 5, pageWidth - 40, 12, 'F');
      
      pdf.setFontSize(14);
      pdf.setTextColor(255, 255, 255);
      pdf.text('1. EXECUTIVE SUMMARY', 25, yPosition + 3);
      yPosition += 15;
      
      // Summary in a styled box
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.5);
      pdf.rect(25, yPosition, pageWidth - 50, 45);
      
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      const summaryLines = [
        `Total Monthly SIP Required: ₹${totalMonthlySIP.toLocaleString()}`,
        `Total Target Amount: ₹${(totalTargetAmount / 100000).toFixed(1)} Lakhs`,
        `Investment Horizon: ${Math.max(...goals.map(g => g.timeHorizon))} years`,
        `Expected Annual Return: ${expectedReturn}%`,
        `Number of Goals: ${goals.length}`,
        `Wealth Multiplication Expected: ${((projectionData[projectionData.length - 1]?.portfolioValue || 0) / (projectionData[projectionData.length - 1]?.totalInvested || 1)).toFixed(1)}x`
      ];
      
      summaryLines.forEach((line, index) => {
        pdf.text(line, 30, yPosition + 8 + (index * 6));
      });
      
      yPosition += 55;

      // 2. ASSET ALLOCATION WITH PIE CHART
      checkPageBreak(80);
      
      pdf.setFillColor(40, 116, 166);
      pdf.rect(20, yPosition - 5, pageWidth - 40, 12, 'F');
      pdf.setFontSize(14);
      pdf.setTextColor(255, 255, 255);
      pdf.text('2. STRATEGIC ASSET ALLOCATION', 25, yPosition + 3);
      yPosition += 20;
      
      // Create and add pie chart
      try {
        const pieCanvas = await createChartCanvas(assetAllocation, 'pie');
        const pieImgData = pieCanvas.toDataURL('image/png');
        pdf.addImage(pieImgData, 'PNG', 20, yPosition, 80, 50);
        
        // Add allocation details next to chart
        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 0);
        let detailY = yPosition + 5;
        assetAllocationWithAmounts.forEach(asset => {
          pdf.text(`${asset.category}: ${asset.percentage}%`, 110, detailY);
          pdf.text(`Monthly: ₹${(asset.amount / 1000).toFixed(0)}K`, 110, detailY + 4);
          detailY += 10;
        });
        
        yPosition += 60;
      } catch (error) {
        // Fallback text-based allocation
        pdf.setFontSize(10);
        assetAllocationWithAmounts.forEach(asset => {
          pdf.text(`• ${asset.category}: ${asset.percentage}% (₹${(asset.amount / 1000).toFixed(0)}K/month)`, 25, yPosition);
          yPosition += 6;
        });
        yPosition += 10;
      }

      // 3. GROWTH PROJECTION WITH CHART
      checkPageBreak(90);
      
      pdf.setFillColor(40, 116, 166);
      pdf.rect(20, yPosition - 5, pageWidth - 40, 12, 'F');
      pdf.setFontSize(14);
      pdf.setTextColor(255, 255, 255);
      pdf.text('3. INVESTMENT GROWTH PROJECTION', 25, yPosition + 3);
      yPosition += 20;
      
      // Create and add growth chart
      try {
        const lineCanvas = await createChartCanvas(projectionData, 'line');
        const lineImgData = lineCanvas.toDataURL('image/png');
        pdf.addImage(lineImgData, 'PNG', 20, yPosition, 160, 60);
        yPosition += 70;
        
        // Add key metrics below chart
        pdf.setFillColor(245, 245, 245);
        pdf.rect(20, yPosition, pageWidth - 40, 25);
        
        const finalProjection = projectionData[projectionData.length - 1];
        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 0);
        pdf.text(`Total Investment: ₹${(finalProjection?.totalInvested / 100000 || 0).toFixed(1)}L`, 25, yPosition + 8);
        pdf.text(`Expected Portfolio: ₹${(finalProjection?.portfolioValue / 100000 || 0).toFixed(1)}L`, 25, yPosition + 15);
        pdf.text(`Expected Returns: ₹${(finalProjection?.returns / 100000 || 0).toFixed(1)}L`, 25, yPosition + 22);
        
        yPosition += 35;
      } catch (error) {
        // Fallback text projection
        const finalProjection = projectionData[projectionData.length - 1];
        const projectionLines = [
          `Investment Period: ${Math.max(...goals.map(g => g.timeHorizon))} years`,
          `Total Investment: ₹${(finalProjection?.totalInvested / 100000 || 0).toFixed(1)} Lakhs`,
          `Expected Portfolio Value: ₹${(finalProjection?.portfolioValue / 100000 || 0).toFixed(1)} Lakhs`,
          `Expected Returns: ₹${(finalProjection?.returns / 100000 || 0).toFixed(1)} Lakhs`
        ];
        
        projectionLines.forEach(line => {
          pdf.text(line, 25, yPosition);
          yPosition += 6;
        });
        yPosition += 10;
      }

      // 4. GOAL BREAKDOWN (Enhanced table format)
      checkPageBreak(30 + (goalSIPs.length * 8));
      
      pdf.setFillColor(40, 116, 166);
      pdf.rect(20, yPosition - 5, pageWidth - 40, 12, 'F');
      pdf.setFontSize(14);
      pdf.setTextColor(255, 255, 255);
      pdf.text('4. GOAL BREAKDOWN', 25, yPosition + 3);
      yPosition += 20;
      
      // Table header
      pdf.setFillColor(230, 230, 230);
      pdf.rect(25, yPosition, pageWidth - 50, 8);
      pdf.setFontSize(9);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Goal', 27, yPosition + 5);
      pdf.text('Monthly SIP', 80, yPosition + 5);
      pdf.text('Target Amount', 120, yPosition + 5);
      pdf.text('Duration', 160, yPosition + 5);
      yPosition += 10;
      
      goalSIPs.forEach((goal, index) => {
        if (index % 2 === 0) {
          pdf.setFillColor(250, 250, 250);
          pdf.rect(25, yPosition - 2, pageWidth - 50, 8);
        }
        
        pdf.setFontSize(8);
        pdf.text(goal.name, 27, yPosition + 3);
        pdf.text(`₹${goal.monthlySIP.toLocaleString()}`, 80, yPosition + 3);
        pdf.text(`₹${(goal.targetAmount / 100000).toFixed(1)}L`, 120, yPosition + 3);
        pdf.text(`${goal.timeHorizon} years`, 160, yPosition + 3);
        yPosition += 8;
      });
      
      yPosition += 10;

      // 5. FUND SELECTION (Formatted table)
      checkPageBreak(40);
      
      pdf.setFillColor(40, 116, 166);
      pdf.rect(20, yPosition - 5, pageWidth - 40, 12, 'F');
      pdf.setFontSize(14);
      pdf.setTextColor(255, 255, 255);
      pdf.text('5. RECOMMENDED FUND SELECTION', 25, yPosition + 3);
      yPosition += 20;
      
      const fundDatabase = getFundDatabase();
      const currentRiskFunds = fundDatabase[riskProfile as keyof typeof fundDatabase] || fundDatabase.Moderate;
      
      assetAllocation.forEach(asset => {
        checkPageBreak(25);
        
        // Category header
        pdf.setFillColor(245, 245, 245);
        pdf.rect(25, yPosition, pageWidth - 50, 8);
        pdf.setFontSize(11);
        pdf.setTextColor(0, 0, 0);
        pdf.text(`${asset.category} (${asset.percentage}%):`, 27, yPosition + 5);
        yPosition += 12;
        
        const fundKey = asset.category as keyof typeof currentRiskFunds;
        const fund = currentRiskFunds[fundKey];
        if (fund) {
          pdf.setFontSize(9);
          pdf.text(`Primary Fund: ${fund.name}`, 30, yPosition);
          yPosition += 5;
          pdf.text(`Expense Ratio: ${fund.expenseRatio} | Fund Size: ${fund.fundSize}`, 30, yPosition);
          yPosition += 5;
          pdf.text(`Expected Return: ${fund.expectedReturn} | Manager Tenure: ${fund.managerTenure}`, 30, yPosition);
          yPosition += 5;
          pdf.text(`Alternative: ${fund.alternativeFund}`, 30, yPosition);
          yPosition += 10;
        }
      });

      // 6. TAX OPTIMIZATION
      checkPageBreak(35);
      
      pdf.setFillColor(40, 116, 166);
      pdf.rect(20, yPosition - 5, pageWidth - 40, 12, 'F');
      pdf.setFontSize(14);
      pdf.setTextColor(255, 255, 255);
      pdf.text('6. TAX OPTIMIZATION STRATEGY', 25, yPosition + 3);
      yPosition += 15;
      
      // Tax savings box
      pdf.setFillColor(240, 253, 244);
      pdf.setDrawColor(34, 197, 94);
      pdf.rect(25, yPosition, pageWidth - 50, 20);
      
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Potential Annual Tax Savings: ₹${(taxOptimization.taxSavingPotential || 0).toLocaleString()}`, 30, yPosition + 8);
      pdf.text(`ELSS Investment Recommended: ₹${(taxOptimization.elssRecommendation || 0).toLocaleString()}`, 30, yPosition + 15);
      yPosition += 25;
      
      const taxLines = [
        '• Utilize ELSS funds for 80C deduction (up to ₹1.5L annually)',
        '• Long-term capital gains optimization after 1 year holding',
        '• Tax-loss harvesting opportunities for offset',
        '• Systematic withdrawal planning for tax efficiency'
      ];
      
      taxLines.forEach(line => {
        pdf.text(line, 30, yPosition);
        yPosition += 6;
      });
      
      yPosition += 10;

      // 7. REBALANCING STRATEGY
      checkPageBreak(30);
      
      pdf.setFillColor(40, 116, 166);
      pdf.rect(20, yPosition - 5, pageWidth - 40, 12, 'F');
      pdf.setFontSize(14);
      pdf.setTextColor(255, 255, 255);
      pdf.text('7. REBALANCING STRATEGY', 25, yPosition + 3);
      yPosition += 15;
      
      const rebalanceLines = [
        '• Quarterly review of asset allocation drift',
        '• Rebalance when allocation deviates by ±5%',
        '• Annual mandatory rebalancing regardless of drift',
        '• Market volatility triggers (>15% movement)',
        '• Professional guidance recommended for execution'
      ];
      
      rebalanceLines.forEach(line => {
        pdf.text(line, 30, yPosition);
        yPosition += 6;
      });
      
      yPosition += 10;

      // 8. BEHAVIORAL INSIGHTS
      checkPageBreak(30);
      
      pdf.setFillColor(40, 116, 166);
      pdf.rect(20, yPosition - 5, pageWidth - 40, 12, 'F');
      pdf.setFontSize(14);
      pdf.setTextColor(255, 255, 255);
      pdf.text('8. BEHAVIORAL INSIGHTS & RECOMMENDATIONS', 25, yPosition + 3);
      yPosition += 15;
      
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Investor Type: ${behavioralInsights.investorType}`, 30, yPosition);
      yPosition += 6;
      pdf.text(`Discipline Score: ${behavioralInsights.disciplineScore}/100`, 30, yPosition);
      yPosition += 10;
      
      pdf.text('Key Recommendations:', 30, yPosition);
      yPosition += 6;
      behavioralInsights.recommendations.slice(0, 4).forEach(rec => {
        pdf.text(`• ${rec}`, 35, yPosition);
        yPosition += 6;
      });

      // DISCLAIMER & FOOTER
      checkPageBreak(25);
      
      // Disclaimer box
      pdf.setFillColor(254, 243, 199);
      pdf.setDrawColor(245, 158, 11);
      pdf.rect(20, yPosition, pageWidth - 40, 20);
      
      pdf.setFontSize(8);
      pdf.setTextColor(120, 53, 15);
      pdf.text('DISCLAIMER: This report is generated by AI based on provided inputs and is for informational purposes only.', 25, yPosition + 6);
      pdf.text('Please consult with our certified financial advisors before making investment decisions.', 25, yPosition + 12);
      pdf.text('All investments are subject to market risks. Past performance does not guarantee future results.', 25, yPosition + 18);

      // Footer
      const footerY = pageHeight - 15;
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text('Moneva Growvest Pvt. Ltd. | SEBI Reg: ARN-305935 | +91 80878 55185 | invest@moneva.in', 20, footerY);
      pdf.text('All investments are subject to market risks. Please read scheme documents carefully.', 20, footerY + 5);

      // Save the PDF
      const filename = `Moneva_Investment_Strategy_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(filename);
      
      toast({
        title: "Enhanced PDF Report Generated",
        description: "Your comprehensive investment strategy report with charts and visual elements has been downloaded successfully.",
      });
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "Failed to generate PDF report. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (isGenerating) {
    return (
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <Brain className="h-16 w-16 text-financial-accent animate-pulse" />
        </div>
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">AI is analyzing your profile...</h3>
          <p className="text-muted-foreground">
            Our advanced algorithms are creating a personalized investment strategy based on your goals and risk profile.
          </p>
          <div className="space-y-2">
            <Progress value={generationProgress} className="w-full max-w-md mx-auto" />
            <p className="text-sm text-muted-foreground">{generationProgress}% Complete</p>
          </div>
        </div>
      </div>
    );
  }

  const formatCurrencyInCard = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <>
      {/* WhatsApp Contact Button - Floating */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => window.open('https://wa.me/918087855185?text=Hi! I want to discuss my AI-generated investment strategy', '_blank')}
          className="bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300"
          size="lg"
        >
          <MessageCircle className="h-6 w-6" />
          <span className="ml-2 hidden md:inline">WhatsApp Us</span>
        </Button>
      </div>

      <div className="space-y-6">
       {/* Investment Summary Section */}
       <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20">
         <CardHeader>
           <CardTitle className="flex items-center gap-2">
             {planningMode === "goals" ? (
               <>
                 <Target className="h-5 w-5 text-financial-accent" />
                 Investment Summary Based on Your Goals
               </>
             ) : (
               <>
                 <PiggyBank className="h-5 w-5 text-financial-accent" />
                 SIP Investment Summary
               </>
             )}
           </CardTitle>
         </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
             <div className="text-center">
               <h4 className="text-2xl font-bold text-financial-accent">{formatCurrencyInCard(totalMonthlySIP)}</h4>
               <p className="text-sm text-muted-foreground">
                 {planningMode === "goals" ? "Monthly SIP Required" : "Monthly SIP Amount"}
               </p>
             </div>
             <div className="text-center">
               <h4 className="text-2xl font-bold text-financial-accent">{formatCurrencyInCard(totalTargetAmount)}</h4>
               <p className="text-sm text-muted-foreground">
                 {planningMode === "goals" ? "Total Target Amount" : "Projected Portfolio Value"}
               </p>
             </div>
             <div className="text-center">
               <h4 className="text-2xl font-bold text-financial-accent">
                 {planningMode === "goals" && goals.length > 0 
                   ? Math.max(...goals.map(g => g.timeHorizon))
                   : sipData 
                   ? sipData.timeHorizon
                   : 10
                 }
               </h4>
               <p className="text-sm text-muted-foreground">Investment Horizon (Years)</p>
             </div>
          </div>
          
           {/* Individual Goal Breakdown - Only for Goal Planning */}
           {planningMode === "goals" && (
             <div className="space-y-3">
               <h4 className="font-semibold mb-3">Goal-wise SIP Breakdown:</h4>
               {goalSIPs.map((goal) => {
              return (
                <div key={goal.id} className="flex justify-between items-center p-3 bg-white/60 dark:bg-black/20 rounded-lg">
                  <div>
                    <span className="font-medium">{goal.name}</span>
                    <span className="text-sm text-muted-foreground ml-2">({goal.timeHorizon} years)</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrencyInCard(goal.monthlySIP)}/month</div>
                    <div className="text-xs text-muted-foreground">Target: {formatCurrencyInCard(goal.targetAmount)}</div>
                  </div>
                </div>
              );
             })}
           </div>
           )}
         </CardContent>
      </Card>

      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <CheckCircle className="h-12 w-12 text-green-500" />
        </div>
        <div>
          <h3 className="text-2xl font-bold mb-2">Your AI-Generated Investment Strategy</h3>
          <p className="text-muted-foreground">
            Based on your {goals.length} goals and {riskProfile.toLowerCase()} risk profile, here's your personalized investment roadmap.
          </p>
        </div>
      </div>

      <Tabs defaultValue="allocation" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="allocation">Asset Allocation</TabsTrigger>
          <TabsTrigger value="projection">Growth Projection</TabsTrigger>
          <TabsTrigger value="recommendations">Fund Selection</TabsTrigger>
          <TabsTrigger value="tax">Tax Optimization</TabsTrigger>
          <TabsTrigger value="rebalancing">Rebalancing</TabsTrigger>
          <TabsTrigger value="behavioral">Behavioral Insights</TabsTrigger>
        </TabsList>

        {/* Asset Allocation Tab */}
        <TabsContent value="allocation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-financial-accent" />
                Recommended Asset Allocation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assetAllocationWithAmounts.map((asset) => {
                  // Dynamic color based on percentage
                  const getProgressBarClass = (percentage: number) => {
                    if (percentage >= 30) return "h-2 [&>div]:bg-gradient-to-r [&>div]:from-green-500 [&>div]:to-green-600";
                    if (percentage >= 15) return "h-2 [&>div]:bg-gradient-to-r [&>div]:from-blue-500 [&>div]:to-blue-600";
                    if (percentage >= 10) return "h-2 [&>div]:bg-gradient-to-r [&>div]:from-yellow-500 [&>div]:to-yellow-600";
                    return "h-2 [&>div]:bg-gradient-to-r [&>div]:from-purple-500 [&>div]:to-purple-600";
                  };

                  return (
                    <div key={asset.category} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{asset.category}</span>
                        <span className="text-sm text-muted-foreground">
                          {asset.percentage}% ({formatCurrencyInCard(asset.amount)})
                        </span>
                      </div>
                       <Progress value={asset.percentage} className={getProgressBarClass(asset.percentage)} />
                       <div className="text-xs text-muted-foreground">
                         Suggested: {asset.instruments.join(", ")}
                       </div>
                     </div>
                   );
                 })}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 dark:bg-blue-950/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-1" />
                <div>
                  <h4 className="font-semibold mb-2">Why This Allocation?</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Balanced approach aligning with your {riskProfile.toLowerCase()} risk profile</li>
                    <li>• Diversification across asset classes to reduce risk</li>
                    <li>• Long-term growth potential while maintaining stability</li>
                    <li>• Tax-efficient structure for your income bracket</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Growth Projection Tab */}
        <TabsContent value="projection" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5 text-financial-accent" />
                Investment Growth Projection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart data={projectionData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="year" 
                      label={{ value: 'Years', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis 
                      tickFormatter={formatCurrency}
                      label={{ value: 'Amount', angle: -90, position: 'insideLeft' }}
                    />
                    <RechartsTooltip
                      formatter={(value: number, name: string) => [formatTooltipCurrency(value), name]}
                      labelFormatter={(value) => `Year ${value}`}
                    />
                    <RechartsLegend />
                    <Line 
                      type="monotone" 
                      dataKey="totalInvested" 
                      stroke="#10b981" 
                      name="Total Invested"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="portfolioValue" 
                      stroke="#3b82f6" 
                      name="Expected Portfolio Value"
                      strokeWidth={3}
                      dot={false}
                    />
                    {goals.map((goal, index) => (
                      <ReferenceLine 
                        key={goal.id}
                        x={goal.timeHorizon} 
                        stroke="#f59e0b" 
                        strokeDasharray="5 5"
                        label={{ value: goal.name, position: "top" }}
                      />
                    ))}
                  </RechartsLineChart>
                </ResponsiveContainer>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4 mt-6">
                <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <h4 className="text-lg font-semibold text-green-700 dark:text-green-400">
                    {formatTooltipCurrency(projectionData[projectionData.length - 1]?.totalInvested || 0)}
                  </h4>
                  <p className="text-sm text-muted-foreground">Total Investment</p>
                </div>
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <h4 className="text-lg font-semibold text-blue-700 dark:text-blue-400">
                    {formatTooltipCurrency(projectionData[projectionData.length - 1]?.portfolioValue || 0)}
                  </h4>
                  <p className="text-sm text-muted-foreground">Expected Portfolio Value</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                  <h4 className="text-lg font-semibold text-yellow-700 dark:text-yellow-400">
                    {formatTooltipCurrency(projectionData[projectionData.length - 1]?.returns || 0)}
                  </h4>
                  <p className="text-sm text-muted-foreground">Expected Returns</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 dark:bg-blue-950/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-1" />
                <div>
                  <h4 className="font-semibold mb-2">Key Insights from Your Projection</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Your investments are projected to grow at {riskProfile === 'Conservative' ? '8.5%' : riskProfile === 'Moderate' ? '11%' : riskProfile === 'Balanced' ? '13%' : '15%'} annually</li>
                    <li>• The power of compounding becomes evident after 3-5 years</li>
                    <li>• Consistent SIP investing helps average out market volatility</li>
                    <li>• Regular review and rebalancing will help optimize returns</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Enhanced Fund Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-financial-accent" />
                AI-Selected Funds (Risk Profile: {riskProfile})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground mb-4">
                Each fund corresponds to your asset allocation categories. Funds selected using our proprietary scoring algorithm.
              </div>
            </CardContent>
          </Card>
          
          {recommendations.map((rec) => (
            <Card key={rec.id} className="relative">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-semibold text-lg">{rec.name}</h4>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Score: {rec.score}/100
                      </Badge>
                      <Badge variant={rec.riskLevel === "Low" ? "secondary" : rec.riskLevel === "Medium" ? "default" : "destructive"}>
                        {rec.riskLevel} Risk
                      </Badge>
                    </div>
                    
                    <div className="grid md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-muted-foreground">Category:</span>
                        <p>{rec.type}</p>
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">Expense Ratio:</span>
                        <p className="text-green-600 font-medium">{rec.expenseRatio}</p>
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">Fund Size:</span>
                        <p>{rec.fundSize}</p>
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">Manager Tenure:</span>
                        <p>{rec.managerTenure}</p>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">{rec.reason}</p>
                    
                    <div className="flex items-center gap-6 text-sm bg-financial-muted p-3 rounded-lg">
                      <span><strong>Allocation:</strong> {rec.allocation}%</span>
                      <span><strong>Expected Return:</strong> {rec.expectedReturn}</span>
                      <span><strong>Monthly SIP:</strong> {formatCurrencyInCard(rec.sipAmount || 0)}</span>
                      <span><strong>Tax Efficiency:</strong> 
                        <Badge variant="outline" className={`ml-1 ${rec.taxEfficiency === 'High' ? 'bg-green-50 text-green-700' : rec.taxEfficiency === 'Medium' ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'}`}>
                          {rec.taxEfficiency}
                        </Badge>
                      </span>
                    </div>
                    
                    <div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950/20 p-2 rounded">
                      <strong>Alternative:</strong> {rec.alternativeFund} (if primary fund is unavailable)
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Tax Optimization Tab */}
        <TabsContent value="tax" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-financial-accent" />
                Tax Optimization Strategy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <h4 className="text-lg font-semibold text-green-700 dark:text-green-400">
                    {formatCurrencyInCard(taxOptimization.elssRecommendation || 0)}
                  </h4>
                  <p className="text-sm text-muted-foreground">ELSS Investment Recommended</p>
                </div>
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <h4 className="text-lg font-semibold text-blue-700 dark:text-blue-400">
                    {formatCurrencyInCard(taxOptimization.taxSavingPotential || 0)}
                  </h4>
                  <p className="text-sm text-muted-foreground">Annual Tax Savings (80C)</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                  <h4 className="text-lg font-semibold text-yellow-700 dark:text-yellow-400">
                    ₹1,00,000
                  </h4>
                  <p className="text-sm text-muted-foreground">LTCG Exemption (Annual)</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold">Tax-Efficient Fund Recommendations:</h4>
                <div className="grid gap-3">
                  {taxOptimization.taxEfficientFunds?.map((fund, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-financial-muted rounded-lg">
                      <span className="font-medium">{fund}</span>
                      <Badge variant="outline" className="bg-green-50 text-green-700">ELSS - 3 Year Lock-in</Badge>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">LTCG Strategy:</h4>
                <p className="text-sm text-muted-foreground">{taxOptimization.ltcgStrategy}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rebalancing Strategy Tab */}
        <TabsContent value="rebalancing" className="space-y-6">
          {/* Expert Advice Notice */}
          <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <AlertCircle className="h-6 w-6 text-orange-600 mt-1 flex-shrink-0" />
                <div className="space-y-2">
                  <h4 className="font-semibold text-orange-800 dark:text-orange-200">Expert Advice Required</h4>
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    Portfolio rebalancing is a complex process that requires careful analysis of market conditions, tax implications, and your personal financial situation. 
                    We strongly recommend consulting with our certified financial experts before making any rebalancing decisions.
                  </p>
                  <div className="flex gap-3 mt-4">
                    <Button
                      onClick={() => window.open('https://wa.me/918087855185?text=Hi! I need expert advice for portfolio rebalancing', '_blank')}
                      className="bg-green-600 hover:bg-green-700 text-white"
                      size="sm"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      WhatsApp Expert
                    </Button>
                    <Button
                      onClick={() => setShowContactForm(true)}
                      variant="outline"
                      className="border-orange-300 text-orange-700 hover:bg-orange-100 dark:border-orange-600 dark:text-orange-300"
                      size="sm"
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Schedule Call
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-financial-accent" />
                Dynamic Rebalancing Strategy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Review Frequency</h4>
                    <p className="text-sm text-muted-foreground">{rebalancingStrategy.frequency}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Trigger Threshold</h4>
                    <p className="text-sm text-muted-foreground">{rebalancingStrategy.triggerThreshold}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Methodology</h4>
                    <p className="text-sm text-muted-foreground">{rebalancingStrategy.methodology}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Next Review Date</h4>
                    <p className="text-sm font-medium text-financial-accent">{rebalancingStrategy.nextReviewDate}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Rebalancing Triggers:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Asset allocation drifts beyond ±5% of target</li>
                  <li>• Significant market movements (greater than 15% in 3 months)</li>
                  <li>• Goal timeline changes or life events</li>
                  <li>• Annual review regardless of drift</li>
                </ul>
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded border border-blue-200 dark:border-blue-800">
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    <strong>Note:</strong> Our experts will help you identify these triggers and execute rebalancing with minimal tax impact and optimal timing.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Behavioral Insights Tab */}
        <TabsContent value="behavioral" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-financial-accent" />
                Behavioral Finance Insights
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm">
                      <p>Understanding your investment psychology to avoid emotional decisions that can hurt returns. Based on your risk profile and goals.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-financial-muted rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">Investor Type</h4>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-sm">
                            <p>Your psychological investor profile based on risk tolerance, time horizon, and decision-making style. Helps predict how you might react during market volatility.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <p className="text-sm">{behavioralInsights.investorType}</p>
                  </div>
                  
                  <div className="p-4 bg-financial-muted rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">Discipline Score</h4>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-sm">
                            <p>Measures your likelihood to stick to your investment plan during market ups and downs. Higher scores indicate better discipline and lower chance of emotional decisions.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 relative">
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              behavioralInsights.disciplineScore >= 71 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                              behavioralInsights.disciplineScore >= 41 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                              'bg-gradient-to-r from-red-400 to-red-600'
                            }`}
                            style={{ width: `${behavioralInsights.disciplineScore}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-sm font-medium">{behavioralInsights.disciplineScore}/100</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-red-700 dark:text-red-400">Common Biases to Watch</h4>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-red-500 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-sm">
                            <p>Psychological biases that commonly affect investors like you. Being aware of these helps you recognize and avoid making emotional investment mistakes.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <ul className="text-sm space-y-1">
                      {behavioralInsights.commonBiases.map((bias, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <AlertCircle className="h-3 w-3 text-red-500" />
                          {bias}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-green-700 dark:text-green-400">Behavioral Recommendations</h4>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-green-600 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-sm">
                        <p>Specific strategies tailored to your psychological profile to help you stay disciplined and avoid common investment mistakes. Follow these to improve your success rate.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <ul className="text-sm space-y-1">
                  {behavioralInsights.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          onClick={handleDownloadReport}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Download Detailed Report
        </Button>
        <Button
          onClick={handleImplementPlan}
          size="lg"
          className="bg-financial-accent hover:bg-financial-accent/90 flex items-center gap-2"
        >
          <DollarSign className="h-4 w-4" />
          Implement This Strategy
        </Button>
      </div>

      {/* Educational Note */}
      <Card className="bg-amber-50 dark:bg-amber-950/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <BookOpen className="h-5 w-5 text-amber-600 mt-1" />
            <div>
              <h4 className="font-semibold mb-2">Next Steps</h4>
              <p className="text-sm text-muted-foreground">
                This AI-generated strategy is a starting point. Our financial advisors will review and customize 
                this plan based on your specific circumstances, current market conditions, and regulatory requirements 
                before implementation.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>

      {/* Contact Form Modal - Only for Implementation */}
      {actionType === "implement" && (
        <ContactFormModal 
          isOpen={showContactForm}
          onClose={() => setShowContactForm(false)}
          actionType={actionType}
        />
      )}
    </>
  );
};

export default AIRecommendations;