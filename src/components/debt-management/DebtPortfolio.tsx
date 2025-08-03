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

  const addDebt = () => {
    if (!newDebt.name || !newDebt.type || !newDebt.balance || !newDebt.interestRate || !newDebt.minimumPayment) {
      return;
    }

    const debt: Debt = {
      id: Date.now().toString(),
      name: newDebt.name,
      type: newDebt.type as Debt['type'],
      balance: parseFloat(newDebt.balance),
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
        <h3 className="text-lg font-semibold mb-4">Add New Debt</h3>
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="debt-name">Debt Name</Label>
              <Input
                id="debt-name"
                placeholder="Credit Card 1"
                value={newDebt.name}
                onChange={(e) => setNewDebt({ ...newDebt, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="debt-type">Debt Type</Label>
              <Select value={newDebt.type} onValueChange={(value) => setNewDebt({ ...newDebt, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select debt type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit-card">Credit Card</SelectItem>
                  <SelectItem value="personal-loan">Personal Loan</SelectItem>
                  <SelectItem value="car-loan">Car Loan</SelectItem>
                  <SelectItem value="mortgage">Home Mortgage</SelectItem>
                  <SelectItem value="gold-loan">Gold Loan</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="debt-balance">Current Balance</Label>
              <Input
                id="debt-balance"
                type="number"
                placeholder="10000"
                value={newDebt.balance}
                onChange={(e) => setNewDebt({ ...newDebt, balance: e.target.value })}
              />
            </div>
          </div>

          {/* Financial Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="debt-rate">Interest Rate (%)</Label>
              <Input
                id="debt-rate"
                type="number"
                step="0.01"
                placeholder="18.5"
                value={newDebt.interestRate}
                onChange={(e) => setNewDebt({ ...newDebt, interestRate: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="debt-min">Minimum Payment</Label>
              <Input
                id="debt-min"
                type="number"
                placeholder="300"
                value={newDebt.minimumPayment}
                onChange={(e) => setNewDebt({ ...newDebt, minimumPayment: e.target.value })}
              />
            </div>
          </div>

          {/* Conditional fields for fixed loans */}
          {newDebt.type && !['credit-card', 'other'].includes(newDebt.type) && (
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium mb-3 text-muted-foreground">Loan Details (for accurate calculations)</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="original-amount">Original Loan Amount</Label>
                  <Input
                    id="original-amount"
                    type="number"
                    placeholder="100000"
                    value={newDebt.originalAmount}
                    onChange={(e) => setNewDebt({ ...newDebt, originalAmount: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="loan-tenure">Total Tenure (months)</Label>
                  <Input
                    id="loan-tenure"
                    type="number"
                    placeholder="60"
                    value={newDebt.loanTenureMonths}
                    onChange={(e) => setNewDebt({ ...newDebt, loanTenureMonths: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="start-date">Loan Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={newDebt.startDate}
                    onChange={(e) => setNewDebt({ ...newDebt, startDate: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
        <Button onClick={addDebt} className="mt-6" disabled={!newDebt.name || !newDebt.type || !newDebt.balance}>
          <Plus className="w-4 h-4 mr-2" />
          Add Debt
        </Button>
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