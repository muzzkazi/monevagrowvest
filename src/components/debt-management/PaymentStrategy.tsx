import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingDown, TrendingUp, Clock, DollarSign } from "lucide-react";
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
}

const PaymentStrategy = ({ debts, extraPayment }: PaymentStrategyProps) => {
  const strategies = useMemo(() => {
    if (debts.length === 0) return { snowball: null, avalanche: null };

    const calculatePayoff = (sortFn: (a: Debt, b: Debt) => number): PayoffResult => {
      const sortedDebts = [...debts].sort(sortFn);
      const payoffOrder: PayoffResult['payoffOrder'] = [];
      let totalMonths = 0;
      let totalInterest = 0;
      let remainingDebts = sortedDebts.map(debt => ({ ...debt }));
      let availableExtra = extraPayment;

      while (remainingDebts.length > 0) {
        totalMonths++;
        
        // Pay minimum on all debts
        remainingDebts.forEach(debt => {
          const monthlyInterest = (debt.balance * debt.interestRate) / (100 * 12);
          totalInterest += monthlyInterest;
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
            interestPaid: 0 // Simplified calculation
          });
        });
        
        remainingDebts = remainingDebts.filter(debt => debt.balance > 0);
        
        // Prevent infinite loop
        if (totalMonths > 600) break;
      }

      return {
        strategy: '',
        totalMonths,
        totalInterest,
        totalPaid: debts.reduce((sum, debt) => sum + debt.balance, 0) + totalInterest,
        payoffOrder
      };
    };

    // Snowball: Sort by balance (smallest first)
    const snowball = calculatePayoff((a, b) => a.balance - b.balance);
    snowball.strategy = 'snowball';

    // Avalanche: Sort by interest rate (highest first)
    const avalanche = calculatePayoff((a, b) => b.interestRate - a.interestRate);
    avalanche.strategy = 'avalanche';

    return { snowball, avalanche };
  }, [debts, extraPayment]);

  if (debts.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <TrendingDown className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Add debts to see payment strategy comparisons</p>
      </div>
    );
  }

  const { snowball, avalanche } = strategies;
  const betterStrategy = snowball && avalanche && snowball.totalInterest < avalanche.totalInterest ? snowball : avalanche;
  const interestSavings = snowball && avalanche ? Math.abs(snowball.totalInterest - avalanche.totalInterest) : 0;

  return (
    <div className="space-y-6">
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
              <DollarSign className="w-5 h-5 text-green-600" />
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