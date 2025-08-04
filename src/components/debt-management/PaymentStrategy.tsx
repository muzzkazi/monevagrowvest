import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingDown, TrendingUp, Clock, DollarSign, Calculator, Trophy, Zap, Target, IndianRupee } from "lucide-react";
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
  const interestSavings = snowball && avalanche ? Math.abs(snowball.totalInterest - avalanche.totalInterest) : 0;
  const totalSavingsVsBaseline = noExtraPayment && betterStrategy ? noExtraPayment.totalInterest - betterStrategy.totalInterest : 0;
  const timeSavingsVsBaseline = noExtraPayment && betterStrategy ? noExtraPayment.totalMonths - betterStrategy.totalMonths : 0;
  const timeSavingsBetweenStrategies = snowball && avalanche ? Math.abs(snowball.totalMonths - avalanche.totalMonths) : 0;

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
    <div className="space-y-8">
      {/* Comprehensive Savings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardContent className="p-4 text-center">
            <Trophy className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <p className="text-sm text-muted-foreground">Recommended Strategy</p>
            <p className="font-semibold text-green-700 dark:text-green-300 capitalize">{betterStrategy?.strategy}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4 text-center">
            <IndianRupee className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <p className="text-sm text-muted-foreground">Total Interest Savings</p>
            <p className="font-semibold text-blue-700 dark:text-blue-300">{formatCurrency(totalSavingsVsBaseline)}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardContent className="p-4 text-center">
            <Clock className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <p className="text-sm text-muted-foreground">Time Saved</p>
            <p className="font-semibold text-purple-700 dark:text-purple-300">{timeSavingsVsBaseline} months</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
          <CardContent className="p-4 text-center">
            <Zap className="w-8 h-8 mx-auto mb-2 text-orange-600" />
            <p className="text-sm text-muted-foreground">Extra Payment</p>
            <p className="font-semibold text-orange-700 dark:text-orange-300">{formatCurrency(extraPayment)}/mo</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis */}
      {noExtraPayment && (
        <Card className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950 border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-300">
              <Target className="w-5 h-5" />
              Impact of Your Extra Payment Strategy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Without Extra Payments</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(noExtraPayment.totalInterest)}</p>
                <p className="text-xs text-muted-foreground">Total interest over {Math.floor(noExtraPayment.totalMonths / 12)}y {noExtraPayment.totalMonths % 12}m</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">With {betterStrategy?.strategy} Method</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(betterStrategy?.totalInterest)}</p>
                <p className="text-xs text-muted-foreground">Total interest over {Math.floor(betterStrategy?.totalMonths / 12)}y {betterStrategy?.totalMonths % 12}m</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Your Savings</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalSavingsVsBaseline)}</p>
                <p className="text-xs text-green-600">Save {timeSavingsVsBaseline} months & {((totalSavingsVsBaseline / noExtraPayment.totalInterest) * 100).toFixed(1)}% interest</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      {/* Strategy Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {snowball && (
          <Card className={betterStrategy?.strategy === 'snowball' ? 'ring-2 ring-primary' : ''}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Debt Snowball
                </span>
                {betterStrategy?.strategy === 'snowball' && (
                  <Badge variant="default">Recommended</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Time to Pay Off</p>
                  <p className="text-lg font-semibold flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {Math.floor(snowball.totalMonths / 12)}y {snowball.totalMonths % 12}m
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Interest</p>
                  <p className="text-lg font-semibold text-destructive">
                    {formatCurrency(snowball.totalInterest)}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Payoff Order (Smallest Balance First)</p>
                <div className="space-y-2">
                  {snowball.payoffOrder.slice(0, 3).map((item, index) => (
                    <div key={item.debt.id} className="flex justify-between items-center text-sm">
                      <span>{index + 1}. {item.debt.name}</span>
                      <span className="text-muted-foreground">{item.monthsPaid} months</span>
                    </div>
                  ))}
                  {snowball.payoffOrder.length > 3 && (
                    <p className="text-xs text-muted-foreground">+{snowball.payoffOrder.length - 3} more</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {avalanche && (
          <Card className={betterStrategy?.strategy === 'avalanche' ? 'ring-2 ring-primary' : ''}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <TrendingDown className="w-5 h-5" />
                  Debt Avalanche
                </span>
                {betterStrategy?.strategy === 'avalanche' && (
                  <Badge variant="default">Recommended</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Time to Pay Off</p>
                  <p className="text-lg font-semibold flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {Math.floor(avalanche.totalMonths / 12)}y {avalanche.totalMonths % 12}m
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Interest</p>
                  <p className="text-lg font-semibold text-destructive">
                    {formatCurrency(avalanche.totalInterest)}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Payoff Order (Highest Interest First)</p>
                <div className="space-y-2">
                  {avalanche.payoffOrder.slice(0, 3).map((item, index) => (
                    <div key={item.debt.id} className="flex justify-between items-center text-sm">
                      <span>{index + 1}. {item.debt.name}</span>
                      <span className="text-muted-foreground">{item.monthsPaid} months</span>
                    </div>
                  ))}
                  {avalanche.payoffOrder.length > 3 && (
                    <p className="text-xs text-muted-foreground">+{avalanche.payoffOrder.length - 3} more</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Savings Comparison */}
      {interestSavings > 0 && (
        <Card className="bg-muted/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IndianRupee className="w-5 h-5 text-green-600" />
              Potential Savings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  By choosing the {betterStrategy?.strategy} method, you could save:
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(interestSavings)}
                </p>
                <p className="text-sm text-green-600 mt-1">
                  and {timeSavingsBetweenStrategies} {timeSavingsBetweenStrategies === 1 ? 'month' : 'months'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">in interest payments</p>
                <p className="text-lg font-semibold">
                  vs. the {betterStrategy?.strategy === 'snowball' ? 'avalanche' : 'snowball'} method
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Interest Comparison by Debt */}
      {betterStrategy && (
        <Card className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950 dark:to-green-950 border-emerald-200 dark:border-emerald-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              Interest Comparison by Debt ({betterStrategy.strategy})
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Compare original interest vs final interest for each debt with your extra payment strategy
            </p>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={betterStrategy.strategy} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="snowball">Snowball Method</TabsTrigger>
                <TabsTrigger value="avalanche">Avalanche Method</TabsTrigger>
              </TabsList>
              
              <TabsContent value="snowball" className="space-y-3 mt-4">
                {snowball?.debtDetails.map((detail) => (
                  <Card key={detail.debt.id} className="border border-blue-200 bg-blue-50/30">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-blue-900">{detail.debt.name}</h4>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          {detail.debt.interestRate}% APR
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                          <p className="text-red-600 font-medium mb-1">Original Interest</p>
                          <p className="text-lg font-bold text-red-700">
                            {formatCurrency(detail.originalInterest)}
                          </p>
                          <p className="text-xs text-red-600">Without extra payments</p>
                        </div>
                        
                        <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                          <p className="text-orange-600 font-medium mb-1">Final Interest</p>
                          <p className="text-lg font-bold text-orange-700">
                            {formatCurrency(detail.finalInterest)}
                          </p>
                          <p className="text-xs text-orange-600">With snowball method</p>
                        </div>
                        
                        <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                          <p className="text-green-600 font-medium mb-1">Savings</p>
                          <p className="text-lg font-bold text-green-700">
                            {formatCurrency(detail.interestSavings)}
                          </p>
                          <p className="text-xs text-green-600">
                            {detail.originalInterest > 0 ? 
                              `${((detail.interestSavings / detail.originalInterest) * 100).toFixed(1)}% saved` : 
                              'No interest'
                            }
                          </p>
                        </div>
                      </div>
                      
                      {detail.interestSavings > 0 && (
                        <div className="mt-3">
                          <Progress 
                            value={(detail.interestSavings / detail.originalInterest) * 100} 
                            className="h-2"
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
              
              <TabsContent value="avalanche" className="space-y-3 mt-4">
                {avalanche?.debtDetails.map((detail) => (
                  <Card key={detail.debt.id} className="border border-purple-200 bg-purple-50/30">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-purple-900">{detail.debt.name}</h4>
                        <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                          {detail.debt.interestRate}% APR
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                          <p className="text-red-600 font-medium mb-1">Original Interest</p>
                          <p className="text-lg font-bold text-red-700">
                            {formatCurrency(detail.originalInterest)}
                          </p>
                          <p className="text-xs text-red-600">Without extra payments</p>
                        </div>
                        
                        <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                          <p className="text-orange-600 font-medium mb-1">Final Interest</p>
                          <p className="text-lg font-bold text-orange-700">
                            {formatCurrency(detail.finalInterest)}
                          </p>
                          <p className="text-xs text-orange-600">With avalanche method</p>
                        </div>
                        
                        <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                          <p className="text-green-600 font-medium mb-1">Savings</p>
                          <p className="text-lg font-bold text-green-700">
                            {formatCurrency(detail.interestSavings)}
                          </p>
                          <p className="text-xs text-green-600">
                            {detail.originalInterest > 0 ? 
                              `${((detail.interestSavings / detail.originalInterest) * 100).toFixed(1)}% saved` : 
                              'No interest'
                            }
                          </p>
                        </div>
                      </div>
                      
                      {detail.interestSavings > 0 && (
                        <div className="mt-3">
                          <Progress 
                            value={(detail.interestSavings / detail.originalInterest) * 100} 
                            className="h-2"
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Monthly Payment Plan */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Your Monthly Payment Plan
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Exact payment allocation for {betterStrategy?.strategy} method with ₹{extraPayment.toLocaleString()} extra payment
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={betterStrategy?.strategy || 'snowball'} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="snowball">Snowball Plan</TabsTrigger>
              <TabsTrigger value="avalanche">Avalanche Plan</TabsTrigger>
            </TabsList>
            
            <TabsContent value="snowball" className="space-y-3 mt-4">
              <div className="space-y-3">
                {snowballAllocation.map((debt, index) => (
                  <div 
                    key={debt.id} 
                    className={`p-4 rounded-lg border-2 ${
                      debt.isTarget 
                        ? 'border-primary bg-primary/5' 
                        : 'border-muted bg-muted/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{debt.name}</span>
                        {debt.isTarget && (
                          <Badge variant="default" className="text-xs">
                            TARGET DEBT
                          </Badge>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary">
                          {formatCurrency(debt.payment)}
                        </p>
                        <p className="text-xs text-muted-foreground">this month</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Balance</p>
                        <p className="font-medium">{formatCurrency(debt.balance)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Minimum</p>
                        <p className="font-medium">{formatCurrency(debt.minimumPayment)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Extra</p>
                        <p className="font-medium text-primary">
                          {debt.isTarget ? formatCurrency(extraPayment) : '₹0'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between items-center font-semibold">
                  <span>Total Monthly Payment:</span>
                  <span className="text-lg text-primary">
                    {formatCurrency(
                      snowballAllocation.reduce((sum, debt) => sum + debt.payment, 0)
                    )}
                  </span>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="avalanche" className="space-y-3 mt-4">
              <div className="space-y-3">
                {avalancheAllocation.map((debt, index) => (
                  <div 
                    key={debt.id} 
                    className={`p-4 rounded-lg border-2 ${
                      debt.isTarget 
                        ? 'border-primary bg-primary/5' 
                        : 'border-muted bg-muted/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{debt.name}</span>
                        {debt.isTarget && (
                          <Badge variant="default" className="text-xs">
                            TARGET DEBT
                          </Badge>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary">
                          {formatCurrency(debt.payment)}
                        </p>
                        <p className="text-xs text-muted-foreground">this month</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Balance</p>
                        <p className="font-medium">{formatCurrency(debt.balance)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Minimum</p>
                        <p className="font-medium">{formatCurrency(debt.minimumPayment)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Extra</p>
                        <p className="font-medium text-primary">
                          {debt.isTarget ? formatCurrency(extraPayment) : '₹0'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between items-center font-semibold">
                  <span>Total Monthly Payment:</span>
                  <span className="text-lg text-primary">
                    {formatCurrency(
                      avalancheAllocation.reduce((sum, debt) => sum + debt.payment, 0)
                    )}
                  </span>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Detailed Timeline */}
      <Tabs defaultValue={betterStrategy?.strategy || 'snowball'} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="snowball">Snowball Timeline</TabsTrigger>
          <TabsTrigger value="avalanche">Avalanche Timeline</TabsTrigger>
        </TabsList>
        
        <TabsContent value="snowball" className="space-y-4">
          {snowball?.payoffOrder.map((item, index) => (
            <Card key={item.debt.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">#{index + 1} - {item.debt.name}</span>
                  <Badge variant="outline">Month {item.monthsPaid}</Badge>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Original Balance</p>
                    <p className="font-medium">{formatCurrency(item.debt.balance)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Interest Rate</p>
                    <p className="font-medium">{item.debt.interestRate}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Min Payment</p>
                    <p className="font-medium">{formatCurrency(item.debt.minimumPayment)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        
        <TabsContent value="avalanche" className="space-y-4">
          {avalanche?.payoffOrder.map((item, index) => (
            <Card key={item.debt.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">#{index + 1} - {item.debt.name}</span>
                  <Badge variant="outline">Month {item.monthsPaid}</Badge>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Original Balance</p>
                    <p className="font-medium">{formatCurrency(item.debt.balance)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Interest Rate</p>
                    <p className="font-medium">{item.debt.interestRate}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Min Payment</p>
                    <p className="font-medium">{formatCurrency(item.debt.minimumPayment)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PaymentStrategy;