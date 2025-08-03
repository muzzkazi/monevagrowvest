import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, DollarSign, Percent, CreditCard } from "lucide-react";
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
    balance: "",
    interestRate: "",
    minimumPayment: ""
  });

  const addDebt = () => {
    if (!newDebt.name || !newDebt.balance || !newDebt.interestRate || !newDebt.minimumPayment) {
      return;
    }

    const debt: Debt = {
      id: Date.now().toString(),
      name: newDebt.name,
      balance: parseFloat(newDebt.balance),
      interestRate: parseFloat(newDebt.interestRate),
      minimumPayment: parseFloat(newDebt.minimumPayment)
    };

    setDebts([...debts, debt]);
    setNewDebt({ name: "", balance: "", interestRate: "", minimumPayment: "" });
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <Label htmlFor="debt-balance">Current Balance</Label>
            <Input
              id="debt-balance"
              type="number"
              placeholder="10000"
              value={newDebt.balance}
              onChange={(e) => setNewDebt({ ...newDebt, balance: e.target.value })}
            />
          </div>
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
        <Button onClick={addDebt} className="mt-4" disabled={!newDebt.name || !newDebt.balance}>
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
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <p className="font-semibold">{debt.name}</p>
                      <p className="text-sm text-muted-foreground">Balance</p>
                      <p className="font-medium text-destructive">{formatCurrency(debt.balance)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Interest Rate</p>
                      <p className="font-medium">{debt.interestRate}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Min. Payment</p>
                      <p className="font-medium">{formatCurrency(debt.minimumPayment)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeDebt(debt.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
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