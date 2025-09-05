import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";
import { Plus, Trash2, TrendingUp, TrendingDown, DollarSign, Target } from "lucide-react";

interface BudgetItem {
  id: string;
  name: string;
  category: string;
  budgetAmount: number;
  spentAmount: number;
  type: 'income' | 'expense';
}

interface Transaction {
  id: string;
  name: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  date: Date;
}

const categories = {
  income: ['Salary', 'Freelance', 'Business', 'Investments', 'Other Income'],
  expense: ['Food & Dining', 'Transportation', 'Shopping', 'Entertainment', 'Bills & Utilities', 'Healthcare', 'Education', 'Travel', 'Other Expenses']
};

const BudgetTracker = () => {
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [newItem, setNewItem] = useState({
    name: '',
    category: '',
    budgetAmount: '',
    type: 'expense' as 'income' | 'expense'
  });
  const [newTransaction, setNewTransaction] = useState({
    name: '',
    amount: '',
    category: '',
    type: 'expense' as 'income' | 'expense'
  });

  const addBudgetItem = () => {
    if (!newItem.name || !newItem.category || !newItem.budgetAmount) return;
    
    const item: BudgetItem = {
      id: Date.now().toString(),
      name: newItem.name,
      category: newItem.category,
      budgetAmount: parseFloat(newItem.budgetAmount),
      spentAmount: 0,
      type: newItem.type
    };
    
    setBudgetItems([...budgetItems, item]);
    setNewItem({ name: '', category: '', budgetAmount: '', type: 'expense' });
  };

  const addTransaction = () => {
    if (!newTransaction.name || !newTransaction.amount || !newTransaction.category) return;
    
    const transaction: Transaction = {
      id: Date.now().toString(),
      name: newTransaction.name,
      amount: parseFloat(newTransaction.amount),
      category: newTransaction.category,
      type: newTransaction.type,
      date: new Date()
    };
    
    setTransactions([...transactions, transaction]);
    
    // Update budget item spent amount
    setBudgetItems(items => 
      items.map(item => {
        if (item.category === transaction.category && item.type === transaction.type) {
          return { ...item, spentAmount: item.spentAmount + transaction.amount };
        }
        return item;
      })
    );
    
    setNewTransaction({ name: '', amount: '', category: '', type: 'expense' });
  };

  const removeBudgetItem = (id: string) => {
    setBudgetItems(budgetItems.filter(item => item.id !== id));
  };

  const totalIncome = budgetItems
    .filter(item => item.type === 'income')
    .reduce((sum, item) => sum + item.budgetAmount, 0);
  
  const totalExpenseBudget = budgetItems
    .filter(item => item.type === 'expense')
    .reduce((sum, item) => sum + item.budgetAmount, 0);
  
  const totalExpenseSpent = budgetItems
    .filter(item => item.type === 'expense')
    .reduce((sum, item) => sum + item.spentAmount, 0);
  
  const remainingBudget = totalIncome - totalExpenseSpent;
  const budgetUtilization = totalExpenseBudget > 0 ? (totalExpenseSpent / totalExpenseBudget) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Budget Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Income</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Budgeted</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalExpenseBudget)}</p>
              </div>
              <Target className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Spent</p>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(totalExpenseSpent)}</p>
              </div>
              <TrendingDown className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Remaining</p>
                <p className={`text-2xl font-bold ${remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(remainingBudget)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Utilization */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Utilization</CardTitle>
          <CardDescription>
            {budgetUtilization.toFixed(1)}% of your expense budget used
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={budgetUtilization} className="h-3" />
          <div className="flex justify-between text-sm text-muted-foreground mt-2">
            <span>₹0</span>
            <span>{formatCurrency(totalExpenseBudget)}</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Add Budget Item */}
        <Card>
          <CardHeader>
            <CardTitle>Set Budget Categories</CardTitle>
            <CardDescription>Define your income sources and expense limits</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="item-name">Category Name</Label>
                <Input
                  id="item-name"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="e.g., Monthly Groceries"
                />
              </div>
              <div>
                <Label htmlFor="item-type">Type</Label>
                <Select value={newItem.type} onValueChange={(value: 'income' | 'expense') => setNewItem({ ...newItem, type: value, category: '' })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="item-category">Category</Label>
                <Select value={newItem.category} onValueChange={(value) => setNewItem({ ...newItem, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories[newItem.type].map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="item-amount">
                  {newItem.type === 'income' ? 'Expected Amount' : 'Budget Limit'}
                </Label>
                <Input
                  id="item-amount"
                  type="number"
                  value={newItem.budgetAmount}
                  onChange={(e) => setNewItem({ ...newItem, budgetAmount: e.target.value })}
                  placeholder="Amount"
                />
              </div>
            </div>
            
            <Button onClick={addBudgetItem} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Budget Item
            </Button>
          </CardContent>
        </Card>

        {/* Add Transaction */}
        <Card>
          <CardHeader>
            <CardTitle>Record Transaction</CardTitle>
            <CardDescription>Track your actual income and expenses</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="trans-name">Transaction Name</Label>
                <Input
                  id="trans-name"
                  value={newTransaction.name}
                  onChange={(e) => setNewTransaction({ ...newTransaction, name: e.target.value })}
                  placeholder="e.g., Grocery Shopping"
                />
              </div>
              <div>
                <Label htmlFor="trans-type">Type</Label>
                <Select value={newTransaction.type} onValueChange={(value: 'income' | 'expense') => setNewTransaction({ ...newTransaction, type: value, category: '' })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="trans-category">Category</Label>
                <Select value={newTransaction.category} onValueChange={(value) => setNewTransaction({ ...newTransaction, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories[newTransaction.type].map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="trans-amount">Amount</Label>
                <Input
                  id="trans-amount"
                  type="number"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                  placeholder="Amount"
                />
              </div>
            </div>
            
            <Button onClick={addTransaction} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Transaction
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Budget Items List */}
      {budgetItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Budget Categories</CardTitle>
            <CardDescription>Track progress against your budget goals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {budgetItems.map((item) => {
                const percentage = item.budgetAmount > 0 ? (item.spentAmount / item.budgetAmount) * 100 : 0;
                const isOverBudget = percentage > 100;
                
                return (
                  <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{item.name}</h4>
                        <Badge variant={item.type === 'income' ? 'default' : 'secondary'}>
                          {item.type}
                        </Badge>
                        <Badge variant="outline">{item.category}</Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {formatCurrency(item.spentAmount)} / {formatCurrency(item.budgetAmount)}
                          </span>
                          <span className={`font-medium ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                        {item.type === 'expense' && (
                          <Progress 
                            value={Math.min(percentage, 100)} 
                            className={`h-2 ${isOverBudget ? 'text-red-600' : ''}`}
                          />
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeBudgetItem(item.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BudgetTracker;