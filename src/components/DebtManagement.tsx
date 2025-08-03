import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DebtPortfolio from "./debt-management/DebtPortfolio";
import PaymentStrategy from "./debt-management/PaymentStrategy";
import LoanAmortization from "./debt-management/LoanAmortization";
import { CreditCard, TrendingDown, Calculator } from "lucide-react";

export interface Debt {
  id: string;
  name: string;
  type: 'credit-card' | 'personal-loan' | 'car-loan' | 'mortgage' | 'gold-loan' | 'other';
  balance: number;
  interestRate: number;
  minimumPayment: number;
  originalAmount?: number;
  loanTenureMonths?: number;
  startDate?: Date;
}

const DebtManagement = () => {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [extraPayment, setExtraPayment] = useState(500);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent leading-tight py-1">
          Debt Management Tools
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Take control of your debt with smart strategies and comprehensive tools
        </p>
      </div>

      <Tabs defaultValue="debt-analysis" className="space-y-8">
        <TabsList className="grid w-full grid-cols-2 max-w-xl mx-auto">
          <TabsTrigger value="debt-analysis" className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4" />
            <span className="hidden sm:inline">Debt Analysis</span>
            <span className="sm:hidden">Analysis</span>
          </TabsTrigger>
          <TabsTrigger value="amortization" className="flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            <span className="hidden sm:inline">Loan Calculator</span>
            <span className="sm:hidden">Calculator</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="debt-analysis" className="animate-fade-in space-y-8">
          {/* Debt Portfolio Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Your Debt Portfolio
              </CardTitle>
              <CardDescription>
                Add all your debts to get started with smart payoff strategies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DebtPortfolio 
                debts={debts} 
                setDebts={setDebts}
                extraPayment={extraPayment}
                setExtraPayment={setExtraPayment}
              />
            </CardContent>
          </Card>

          {/* Strategy Explanation */}
          {debts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>How Debt Payoff Strategies Work</CardTitle>
                <CardDescription>
                  Understanding the math behind debt elimination methods
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-primary">💪 Debt Snowball Method</h4>
                    <p className="text-sm text-muted-foreground">
                      Pay minimums on all debts, then put extra money toward the <strong>smallest balance first</strong>. 
                      This builds momentum and motivation as you eliminate debts quickly.
                    </p>
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <p className="text-xs text-muted-foreground">
                        <strong>Psychology:</strong> Quick wins boost confidence and motivation to continue
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold text-primary">⚡ Debt Avalanche Method</h4>
                    <p className="text-sm text-muted-foreground">
                      Pay minimums on all debts, then put extra money toward the <strong>highest interest rate first</strong>. 
                      This mathematically saves the most money on interest.
                    </p>
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <p className="text-xs text-muted-foreground">
                        <strong>Mathematics:</strong> Eliminates expensive debt first, reducing total interest paid
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Strategy Results */}
          {debts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Your Optimal Strategy Comparison</CardTitle>
                <CardDescription>
                  See which method works best for your specific situation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PaymentStrategy 
                  debts={debts} 
                  extraPayment={extraPayment}
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="amortization" className="animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle>Loan Amortization Calculator</CardTitle>
              <CardDescription>
                Explore prepayment options and see how much you can save
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LoanAmortization />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DebtManagement;