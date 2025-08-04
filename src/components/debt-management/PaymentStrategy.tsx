import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { TrendingDown, TrendingUp, Clock, DollarSign, Calculator, Trophy, Zap, Target, IndianRupee, ChevronDown, Eye } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { Debt } from "../DebtManagement";

interface PaymentStrategyProps {
  debts: Debt[];
  extraPayment: number;
}

interface PayoffResult {
  strategy: string;
  totalMonths: number;
  totalInterest: number;
  totalPaid: number;
  payoffOrder: Array<{
    debt: Debt;
    monthsPaid: number;
    interestPaid: number;
  }>;
  debtDetails: Array<{
    debt: Debt;
    originalInterest: number;
    finalInterest: number;
    interestSavings: number;
  }>;
}

const PaymentStrategy = ({ debts, extraPayment }: PaymentStrategyProps) => {
  const strategies = useMemo(() => {
    if (debts.length === 0) return { snowball: null, avalanche: null, noExtraPayment: null };

    // Calculate baseline scenario (no extra payments)
    const calculateNoExtraPayment = () => {
      let totalInterest = 0;
      let maxMonths = 0;
      let totalPaid = 0;

      debts.forEach(debt => {
        const monthlyRate = debt.interestRate / 100 / 12;
        const balance = debt.balance;
        const minPayment = debt.minimumPayment;

        if (monthlyRate === 0) {
          const months = Math.ceil(balance / minPayment);
          maxMonths = Math.max(maxMonths, months);
          totalPaid += balance;
        } else {
          const months = Math.ceil(-Math.log(1 - (balance * monthlyRate) / minPayment) / Math.log(1 + monthlyRate));
          const totalPayments = months * minPayment;
          const interest = totalPayments - balance;
          
          maxMonths = Math.max(maxMonths, months);
          totalInterest += interest;
          totalPaid += totalPayments;
        }
      });

      return { totalInterest, totalMonths: maxMonths, totalPaid };
    };

    // Calculate original interest for each debt without extra payments
    const calculateOriginalInterest = (debt: Debt) => {
      const monthlyRate = debt.interestRate / 100 / 12;
      const balance = debt.balance;
      const minPayment = debt.minimumPayment;

      if (monthlyRate === 0) {
        return 0;
      } else {
        const months = Math.ceil(-Math.log(1 - (balance * monthlyRate) / minPayment) / Math.log(1 + monthlyRate));
        const totalPayments = months * minPayment;
        return totalPayments - balance;
      }
    };

    const calculatePayoff = (sortFn: (a: Debt, b: Debt) => number): PayoffResult => {
      const sortedDebts = [...debts].sort(sortFn);
      const payoffOrder: PayoffResult['payoffOrder'] = [];
      const debtInterestTracker = new Map<string, number>();
      let totalMonths = 0;
      let totalInterest = 0;
      let remainingDebts = sortedDebts.map(debt => ({ ...debt }));
      let availableExtra = extraPayment;

      // Initialize interest tracker for each debt
      debts.forEach(debt => {
        debtInterestTracker.set(debt.id, 0);
      });

      while (remainingDebts.length > 0) {
        totalMonths++;
        
        // Pay minimum on all debts and track interest for each
        remainingDebts.forEach(debt => {
          const monthlyInterest = (debt.balance * debt.interestRate) / (100 * 12);
          totalInterest += monthlyInterest;
          debtInterestTracker.set(debt.id, (debtInterestTracker.get(debt.id) || 0) + monthlyInterest);
          debt.balance = Math.max(0, debt.balance - debt.minimumPayment + monthlyInterest);
        });

        // Apply extra payment to first debt
        if (remainingDebts.length > 0 && availableExtra > 0) {
          const targetDebt = remainingDebts[0];
          const extraApplied = Math.min(availableExtra, targetDebt.balance);
          targetDebt.balance -= extraApplied;
        }

        // Remove paid off debts
        const paidOffDebts = remainingDebts.filter(debt => debt.balance <= 0);
        paidOffDebts.forEach(debt => {
          const originalDebt = debts.find(d => d.id === debt.id)!;
          payoffOrder.push({
            debt: originalDebt,
            monthsPaid: totalMonths,
            interestPaid: debtInterestTracker.get(debt.id) || 0
          });
        });
        
        remainingDebts = remainingDebts.filter(debt => debt.balance > 0);
        
        // Prevent infinite loop
        if (totalMonths > 600) break;
      }

      // Calculate debt details with original vs final interest
      const debtDetails = debts.map(debt => {
        const originalInterest = calculateOriginalInterest(debt);
        const finalInterest = debtInterestTracker.get(debt.id) || 0;
        const interestSavings = originalInterest - finalInterest;
        
        return {
          debt,
          originalInterest,
          finalInterest,
          interestSavings
        };
      });

      return {
        strategy: '',
        totalMonths,
        totalInterest,
        totalPaid: debts.reduce((sum, debt) => sum + debt.balance, 0) + totalInterest,
        payoffOrder,
        debtDetails
      };
    };

    // Calculate all scenarios
    const noExtraPayment = calculateNoExtraPayment();
    const snowball = calculatePayoff((a, b) => a.balance - b.balance);
    snowball.strategy = 'snowball';
    const avalanche = calculatePayoff((a, b) => b.interestRate - a.interestRate);
    avalanche.strategy = 'avalanche';

    return { snowball, avalanche, noExtraPayment };
  }, [debts, extraPayment]);

  if (debts.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Calculator className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Add debts to see comprehensive payment strategy analysis</p>
      </div>
    );
  }

  const { snowball, avalanche, noExtraPayment } = strategies;
  const betterStrategy = snowball && avalanche && snowball.totalInterest < avalanche.totalInterest ? snowball : avalanche;
  const totalSavingsVsBaseline = noExtraPayment && betterStrategy ? noExtraPayment.totalInterest - betterStrategy.totalInterest : 0;
  const timeSavingsVsBaseline = noExtraPayment && betterStrategy ? noExtraPayment.totalMonths - betterStrategy.totalMonths : 0;

  // Calculate payment allocation for current month
  const getPaymentAllocation = (strategy: 'snowball' | 'avalanche') => {
    if (debts.length === 0) return [];
    
    // Sort debts based on strategy
    const sortedDebts = [...debts].sort((a, b) => {
      if (strategy === 'snowball') {
        return a.balance - b.balance; // Smallest balance first
      } else {
        return b.interestRate - a.interestRate; // Highest interest rate first
      }
    });

    // Calculate payment allocation
    const allocation = sortedDebts.map((debt, index) => ({
      ...debt,
      payment: debt.minimumPayment + (index === 0 ? extraPayment : 0), // Add extra payment to first debt
      isTarget: index === 0
    }));

    return allocation;
  };

  const snowballAllocation = getPaymentAllocation('snowball');
  const avalancheAllocation = getPaymentAllocation('avalanche');

  return (
    <div className="space-y-6">
      {/* Key Insights - Simplified Overview */}
      <Card className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950 dark:to-green-950 border-emerald-200 dark:border-emerald-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
            <Trophy className="w-5 h-5" />
            Your Optimal Strategy: {betterStrategy?.strategy?.toUpperCase()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <IndianRupee className="w-8 h-8 mx-auto mb-2 text-emerald-600" />
              <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{formatCurrency(totalSavingsVsBaseline)}</p>
              <p className="text-sm text-muted-foreground">Interest Savings</p>
            </div>
            <div className="text-center">
              <Clock className="w-8 h-8 mx-auto mb-2 text-emerald-600" />
              <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{timeSavingsVsBaseline} months</p>
              <p className="text-sm text-muted-foreground">Time Saved</p>
            </div>
            <div className="text-center">
              <Target className="w-8 h-8 mx-auto mb-2 text-emerald-600" />
              <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{Math.floor(betterStrategy?.totalMonths / 12)}y {betterStrategy?.totalMonths % 12}m</p>
              <p className="text-sm text-muted-foreground">Debt-Free Timeline</p>
            </div>
          </div>
          <div className="mt-4 p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
            <p className="text-sm text-emerald-700 dark:text-emerald-300">
              With {formatCurrency(extraPayment)}/month extra payment using the <strong>{betterStrategy?.strategy}</strong> method,
              you'll save {((totalSavingsVsBaseline / (noExtraPayment?.totalInterest || 1)) * 100).toFixed(1)}% in interest compared to minimum payments only.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Strategy Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {snowball && (
          <Card className={`${betterStrategy?.strategy === 'snowball' ? 'ring-2 ring-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/50' : 'bg-muted/30'}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  <span className="font-medium">Snowball Method</span>
                  {betterStrategy?.strategy === 'snowball' && (
                    <Badge variant="default" className="text-xs bg-emerald-600">Best</Badge>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Total Interest</p>
                  <p className="font-semibold">{formatCurrency(snowball.totalInterest)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Timeline</p>
                  <p className="font-semibold">{Math.floor(snowball.totalMonths / 12)}y {snowball.totalMonths % 12}m</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {avalanche && (
          <Card className={`${betterStrategy?.strategy === 'avalanche' ? 'ring-2 ring-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/50' : 'bg-muted/30'}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4" />
                  <span className="font-medium">Avalanche Method</span>
                  {betterStrategy?.strategy === 'avalanche' && (
                    <Badge variant="default" className="text-xs bg-emerald-600">Best</Badge>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Total Interest</p>
                  <p className="font-semibold">{formatCurrency(avalanche.totalInterest)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Timeline</p>
                  <p className="font-semibold">{Math.floor(avalanche.totalMonths / 12)}y {avalanche.totalMonths % 12}m</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Collapsible Detailed Analysis */}
      <Collapsible>
        <CollapsibleTrigger asChild>
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors border-dashed">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Eye className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <span className="font-medium text-lg">View Detailed Analysis</span>
                    <p className="text-sm text-muted-foreground">Interest breakdown, payment plans & timelines</p>
                  </div>
                </div>
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="space-y-6 mt-4">
          {/* Monthly Payment Plan */}
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Your Monthly Payment Plan
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Next month's payment allocation for {betterStrategy?.strategy} method
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(betterStrategy?.strategy === 'snowball' ? snowballAllocation : avalancheAllocation).map((debt) => (
                  <div 
                    key={debt.id} 
                    className={`p-4 rounded-lg border-2 ${
                      debt.isTarget 
                        ? 'border-primary bg-primary/5' 
                        : 'border-muted bg-muted/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{debt.name}</span>
                        {debt.isTarget && (
                          <Badge variant="default" className="text-xs">TARGET</Badge>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary">
                          {formatCurrency(debt.payment)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {debt.isTarget ? `Min: ${formatCurrency(debt.minimumPayment)} + Extra: ${formatCurrency(extraPayment)}` : 'Minimum payment'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default PaymentStrategy;