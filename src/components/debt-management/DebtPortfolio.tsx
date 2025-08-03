import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, DollarSign, Percent, CreditCard, Calendar } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { Debt } from "../DebtManagement";

interface DebtPortfolioProps {
  debts: Debt[];
  setDebts: (debts: Debt[]) => void;
  extraPayment: number;
  setExtraPayment: (amount: number) => void;
}

const DebtPortfolio = ({ debts, setDebts, extraPayment, setExtraPayment }: DebtPortfolioProps) => {
  const [newDebt, setNewDebt] = useState({
    name: "",
    type: "",
    balance: "",
    interestRate: "",
    minimumPayment: "",
    originalAmount: "",
    loanTenureMonths: "",
    startDate: ""
  });

  // Function to calculate EMI for fixed loans
  const calculateEMI = (principal: number, annualRate: number, tenureMonths: number): number => {
    if (!principal || !annualRate || !tenureMonths) return 0;
    
    const monthlyRate = annualRate / 100 / 12;
    if (monthlyRate === 0) return principal / tenureMonths; // No interest case
    
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / 
                (Math.pow(1 + monthlyRate, tenureMonths) - 1);
    
    return Math.round(emi);
  };

  // Auto-calculate EMI when loan details change
  const handleLoanDetailChange = (field: string, value: string) => {
    const updatedDebt = { ...newDebt, [field]: value };
    
    // Auto-calculate EMI for fixed loans
    if (!['credit-card', 'other'].includes(updatedDebt.type) && updatedDebt.type) {
      const principal = parseFloat(updatedDebt.originalAmount);
      const rate = parseFloat(updatedDebt.interestRate);
      const tenure = parseFloat(updatedDebt.loanTenureMonths);
      
      if (principal && rate && tenure) {
        const calculatedEMI = calculateEMI(principal, rate, tenure);
        updatedDebt.minimumPayment = calculatedEMI.toString();
      }
    }
    
    setNewDebt(updatedDebt);
  };

  // Function to calculate remaining balance for fixed loans
  const calculateRemainingBalance = (
    originalAmount: number,
    annualRate: number,
    totalMonths: number,
    startDate: Date
  ): number => {
    const monthlyRate = annualRate / 100 / 12;
    const monthlyPayment = (originalAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / 
                          (Math.pow(1 + monthlyRate, totalMonths) - 1);
    
    const currentDate = new Date();
    const monthsElapsed = Math.max(0, 
      (currentDate.getFullYear() - startDate.getFullYear()) * 12 + 
      (currentDate.getMonth() - startDate.getMonth())
    );
    
    if (monthsElapsed >= totalMonths) return 0;
    
    // Calculate remaining balance using amortization formula
    const remainingBalance = originalAmount * 
      (Math.pow(1 + monthlyRate, totalMonths) - Math.pow(1 + monthlyRate, monthsElapsed)) / 
      (Math.pow(1 + monthlyRate, totalMonths) - 1);
    
    return Math.max(0, remainingBalance);
  };

  const addDebt = () => {
    if (!newDebt.name || !newDebt.type || !newDebt.interestRate || !newDebt.minimumPayment) {
      return;
    }

    // For credit cards and other revolving debt, require manual balance input
    if (['credit-card', 'other'].includes(newDebt.type) && !newDebt.balance) {
      return;
    }

    // For fixed loans, require loan details to calculate balance
    if (!['credit-card', 'other'].includes(newDebt.type) && 
        (!newDebt.originalAmount || !newDebt.loanTenureMonths || !newDebt.startDate)) {
      return;
    }

    let calculatedBalance = 0;
    
    if (['credit-card', 'other'].includes(newDebt.type)) {
      calculatedBalance = parseFloat(newDebt.balance);
    } else {
      // Calculate current balance for fixed loans
      calculatedBalance = calculateRemainingBalance(
        parseFloat(newDebt.originalAmount),
        parseFloat(newDebt.interestRate),
        parseFloat(newDebt.loanTenureMonths),
        new Date(newDebt.startDate)
      );
    }

    const debt: Debt = {
      id: Date.now().toString(),
      name: newDebt.name,
      type: newDebt.type as Debt['type'],
      balance: calculatedBalance,
      interestRate: parseFloat(newDebt.interestRate),
      minimumPayment: parseFloat(newDebt.minimumPayment),
      originalAmount: newDebt.originalAmount ? parseFloat(newDebt.originalAmount) : undefined,
      loanTenureMonths: newDebt.loanTenureMonths ? parseFloat(newDebt.loanTenureMonths) : undefined,
      startDate: newDebt.startDate ? new Date(newDebt.startDate) : undefined
    };

    setDebts([...debts, debt]);
    setNewDebt({ 
      name: "", 
      type: "", 
      balance: "", 
      interestRate: "", 
      minimumPayment: "",
      originalAmount: "",
      loanTenureMonths: "",
      startDate: ""
    });
  };

  const removeDebt = (id: string) => {
    setDebts(debts.filter(debt => debt.id !== id));
  };

  const totalBalance = debts.reduce((sum, debt) => sum + debt.balance, 0);
  const totalMinPayment = debts.reduce((sum, debt) => sum + debt.minimumPayment, 0);
  const weightedAvgRate = debts.length > 0 
    ? debts.reduce((sum, debt) => sum + (debt.interestRate * debt.balance), 0) / totalBalance
    : 0;

  return (
    <div className="space-y-6">
      {/* Add New Debt Form */}
      <div className="border rounded-lg p-6 bg-muted/30">
        <h3 className="text-lg font-semibold mb-2">Build Your Debt Portfolio</h3>
        <p className="text-sm text-muted-foreground mb-4">Add all your debts and loans to get personalized payoff strategies</p>
        <div className="space-y-6">
          {/* Step 1: Debt Type Selection */}
          <div>
            <Label htmlFor="debt-type">Select Debt Type</Label>
            <Select value={newDebt.type} onValueChange={(value) => setNewDebt({ ...newDebt, type: value, name: "", balance: "", minimumPayment: "", originalAmount: "", loanTenureMonths: "", startDate: "" })}>
              <SelectTrigger>
                <SelectValue placeholder="Choose the type of debt" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="credit-card">Credit Card</SelectItem>
                <SelectItem value="personal-loan">Personal Loan</SelectItem>
                <SelectItem value="car-loan">Car Loan</SelectItem>
                <SelectItem value="mortgage">Home Mortgage</SelectItem>
                <SelectItem value="gold-loan">Gold Loan</SelectItem>
                <SelectItem value="other">Other Debt</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Step 2: Show relevant fields based on debt type */}
          {newDebt.type && (
            <div className="space-y-6 border-t pt-6">
              {/* Debt Name - Different labels based on type */}
              <div>
                <Label htmlFor="debt-name">
                  {newDebt.type === 'credit-card' 
                    ? 'Credit Card Name' 
                    : newDebt.type === 'other' 
                    ? 'Debt Name'
                    : 'Bank/Lender Name'
                  }
                </Label>
                <Input
                  id="debt-name"
                  placeholder={
                    newDebt.type === 'credit-card' 
                      ? 'e.g., HDFC Regalia, SBI SimplyCLICK' 
                      : newDebt.type === 'other'
                      ? 'Enter debt name'
                      : 'e.g., HDFC Bank, SBI, ICICI Bank'
                  }
                  value={newDebt.name}
                  onChange={(e) => setNewDebt({ ...newDebt, name: e.target.value })}
                />
              </div>

              {/* Financial Details - Show balance only for credit cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(['credit-card', 'other'].includes(newDebt.type)) && (
                  <div>
                    <Label htmlFor="debt-balance">Current Outstanding Balance</Label>
                    <Input
                      id="debt-balance"
                      type="number"
                      placeholder="Enter current balance"
                      value={newDebt.balance}
                      onChange={(e) => setNewDebt({ ...newDebt, balance: e.target.value })}
                    />
                  </div>
                )}
                
                <div>
                  <Label htmlFor="debt-rate">Interest Rate (% per annum)</Label>
                  <Input
                    id="debt-rate"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 18.5"
                    value={newDebt.interestRate}
                    onChange={(e) => handleLoanDetailChange('interestRate', e.target.value)}
                  />
                </div>
                
                {/* Show EMI field differently for loans vs credit cards */}
                {['credit-card', 'other'].includes(newDebt.type) ? (
                  <div>
                    <Label htmlFor="debt-min">Minimum Payment Due</Label>
                    <Input
                      id="debt-min"
                      type="number"
                      placeholder="Enter minimum payment"
                      value={newDebt.minimumPayment}
                      onChange={(e) => setNewDebt({ ...newDebt, minimumPayment: e.target.value })}
                    />
                  </div>
                ) : (
                  <div>
                    <Label htmlFor="debt-emi">Monthly EMI</Label>
                    <Input
                      id="debt-emi"
                      type="number"
                      placeholder="Will be calculated automatically"
                      value={newDebt.minimumPayment}
                      readOnly
                      className="bg-muted/50 cursor-not-allowed"
                    />
                    {newDebt.minimumPayment && (
                      <p className="text-xs text-green-600 mt-1">
                        ✅ Auto-calculated: {formatCurrency(parseFloat(newDebt.minimumPayment))}/month
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Loan Details - Show only for fixed loans */}
              {newDebt.type && !['credit-card', 'other'].includes(newDebt.type) && (
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium mb-3 text-financial-accent">Loan Details (for automatic calculations)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="original-amount">Loan Amount</Label>
                      <Input
                        id="original-amount"
                        type="number"
                        placeholder="e.g., 500000"
                        value={newDebt.originalAmount}
                        onChange={(e) => handleLoanDetailChange('originalAmount', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="loan-tenure">Loan Tenure (months)</Label>
                      <Input
                        id="loan-tenure"
                        type="number"
                        placeholder="e.g., 240 (20 years)"
                        value={newDebt.loanTenureMonths}
                        onChange={(e) => handleLoanDetailChange('loanTenureMonths', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="start-date">Loan Start Date</Label>
                      <Input
                        id="start-date"
                        type="date"
                        value={newDebt.startDate}
                        onChange={(e) => handleLoanDetailChange('startDate', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      💡 <strong>Auto-calculations:</strong> EMI and current balance will be calculated automatically based on these details
                    </p>
                    {newDebt.originalAmount && newDebt.interestRate && newDebt.loanTenureMonths && (
                      <div className="mt-2 text-sm">
                        <span className="text-muted-foreground">Calculated EMI: </span>
                        <span className="font-semibold text-financial-accent">
                          {formatCurrency(calculateEMI(
                            parseFloat(newDebt.originalAmount),
                            parseFloat(newDebt.interestRate),
                            parseFloat(newDebt.loanTenureMonths)
                          ))}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {newDebt.type && (
          <div className="flex gap-3">
            <Button onClick={addDebt} className="flex-1" disabled={
              !newDebt.name || !newDebt.interestRate || !newDebt.minimumPayment ||
              (['credit-card', 'other'].includes(newDebt.type) && !newDebt.balance) ||
              (!['credit-card', 'other'].includes(newDebt.type) && (!newDebt.originalAmount || !newDebt.loanTenureMonths || !newDebt.startDate))
            }>
              <Plus className="w-4 h-4 mr-2" />
              Add {newDebt.type === 'credit-card' ? 'Credit Card' : newDebt.type === 'other' ? 'Debt' : 'Loan'}
            </Button>
            {debts.length > 0 && (
              <Button 
                variant="outline" 
                onClick={() => setNewDebt({ name: "", type: "", balance: "", interestRate: "", minimumPayment: "", originalAmount: "", loanTenureMonths: "", startDate: "" })}
              >
                Add Another
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Extra Payment Setting */}
      <div className="border rounded-lg p-6 bg-muted/30">
        <h3 className="text-lg font-semibold mb-4">Extra Payment Budget</h3>
        <div className="flex items-center gap-4">
          <Label htmlFor="extra-payment" className="whitespace-nowrap">Monthly Extra Payment:</Label>
          <Input
            id="extra-payment"
            type="number"
            value={extraPayment}
            onChange={(e) => setExtraPayment(parseFloat(e.target.value) || 0)}
            className="max-w-xs"
          />
          <span className="text-muted-foreground">₹</span>
        </div>
      </div>

      {/* Portfolio Summary */}
      {debts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Total Debt
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {formatCurrency(totalBalance)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Min. Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(totalMinPayment)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Percent className="w-4 h-4" />
                Avg. Interest Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {weightedAvgRate.toFixed(2)}%
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Debt List */}
      {debts.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Your Debts</h3>
          {debts.map((debt) => (
            <Card key={debt.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{debt.name}</p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {debt.type.replace('-', ' ')} • Balance: {formatCurrency(debt.balance)}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeDebt(debt.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Interest Rate</p>
                        <p className="font-medium">{debt.interestRate}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Min. Payment</p>
                        <p className="font-medium">{formatCurrency(debt.minimumPayment)}</p>
                      </div>
                      {debt.loanTenureMonths && (
                        <div>
                          <p className="text-muted-foreground">Tenure</p>
                          <p className="font-medium">{debt.loanTenureMonths} months</p>
                        </div>
                      )}
                      {debt.startDate && (
                        <div>
                          <p className="text-muted-foreground">Started</p>
                          <p className="font-medium">{debt.startDate.toLocaleDateString()}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {debts.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No debts added yet. Add your first debt to get started.</p>
        </div>
      )}
    </div>
  );
};

export default DebtPortfolio;