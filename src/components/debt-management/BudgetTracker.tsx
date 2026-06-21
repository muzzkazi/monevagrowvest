import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn, formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  IndianRupee,
  Target,
  Sparkles,
  RotateCcw,
  Pencil,
  CalendarIcon,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as ReTooltip,
  Legend,
} from "recharts";

interface BudgetItem {
  id: string;
  name: string;
  category: string;
  budgetAmount: number;
  type: "income" | "expense";
}

interface Transaction {
  id: string;
  name: string;
  amount: number;
  category: string;
  type: "income" | "expense";
  date: string; // ISO
}

const categories = {
  income: ["Salary", "Freelance", "Business", "Investments", "Other Income"],
  expense: [
    "Food & Dining",
    "Transportation",
    "Shopping",
    "Entertainment",
    "Bills & Utilities",
    "Healthcare",
    "Education",
    "Travel",
    "Other Expenses",
  ],
};

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--financial-accent, var(--primary)))",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#ec4899",
  "#84cc16",
];

const LS_BUDGETS = "moneva.budgetItems.v1";
const LS_TXNS = "moneva.transactions.v1";

const loadLS = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const sampleBudgets = (): BudgetItem[] => [
  { id: "b1", name: "Monthly Salary", category: "Salary", budgetAmount: 120000, type: "income" },
  { id: "b2", name: "Side Projects", category: "Freelance", budgetAmount: 20000, type: "income" },
  { id: "b3", name: "Groceries & Dining", category: "Food & Dining", budgetAmount: 18000, type: "expense" },
  { id: "b4", name: "Cab & Fuel", category: "Transportation", budgetAmount: 8000, type: "expense" },
  { id: "b5", name: "Rent & Utilities", category: "Bills & Utilities", budgetAmount: 35000, type: "expense" },
  { id: "b6", name: "Shopping", category: "Shopping", budgetAmount: 10000, type: "expense" },
  { id: "b7", name: "OTT & Outings", category: "Entertainment", budgetAmount: 5000, type: "expense" },
  { id: "b8", name: "Doctor & Pharmacy", category: "Healthcare", budgetAmount: 4000, type: "expense" },
];

const sampleTxns = (): Transaction[] => {
  const now = Date.now();
  const day = (n: number) => new Date(now - n * 86400000).toISOString();
  return [
    { id: "t1", name: "October Salary", amount: 120000, category: "Salary", type: "income", date: day(20) },
    { id: "t2", name: "Logo design gig", amount: 15000, category: "Freelance", type: "income", date: day(12) },
    { id: "t3", name: "BigBasket order", amount: 4200, category: "Food & Dining", type: "expense", date: day(18) },
    { id: "t4", name: "Zomato dinner", amount: 1850, category: "Food & Dining", type: "expense", date: day(14) },
    { id: "t5", name: "Swiggy weekend", amount: 2400, category: "Food & Dining", type: "expense", date: day(7) },
    { id: "t6", name: "Uber rides", amount: 3200, category: "Transportation", type: "expense", date: day(15) },
    { id: "t7", name: "Petrol", amount: 2500, category: "Transportation", type: "expense", date: day(5) },
    { id: "t8", name: "Apartment rent", amount: 28000, category: "Bills & Utilities", type: "expense", date: day(19) },
    { id: "t9", name: "Electricity bill", amount: 3400, category: "Bills & Utilities", type: "expense", date: day(10) },
    { id: "t10", name: "Myntra order", amount: 6800, category: "Shopping", type: "expense", date: day(9) },
    { id: "t11", name: "Amazon essentials", amount: 4200, category: "Shopping", type: "expense", date: day(4) },
    { id: "t12", name: "Netflix + Prime", amount: 1200, category: "Entertainment", type: "expense", date: day(6) },
    { id: "t13", name: "Movie night", amount: 1800, category: "Entertainment", type: "expense", date: day(3) },
    { id: "t14", name: "Pharmacy", amount: 1500, category: "Healthcare", type: "expense", date: day(8) },
  ];
};

const BudgetTracker = () => {
  const { toast } = useToast();
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>(() => loadLS(LS_BUDGETS, []));
  const [transactions, setTransactions] = useState<Transaction[]>(() => loadLS(LS_TXNS, []));

  const [newItem, setNewItem] = useState({
    name: "",
    category: "",
    budgetAmount: "",
    type: "expense" as "income" | "expense",
  });
  const [newTransaction, setNewTransaction] = useState({
    name: "",
    amount: "",
    category: "",
    type: "expense" as "income" | "expense",
  });
  const [editingTxn, setEditingTxn] = useState<Transaction | null>(null);

  useEffect(() => {
    localStorage.setItem(LS_BUDGETS, JSON.stringify(budgetItems));
  }, [budgetItems]);
  useEffect(() => {
    localStorage.setItem(LS_TXNS, JSON.stringify(transactions));
  }, [transactions]);

  // Aggregate spent per (type, category) from transactions
  const spentByKey = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of transactions) {
      const k = `${t.type}:${t.category}`;
      map.set(k, (map.get(k) ?? 0) + t.amount);
    }
    return map;
  }, [transactions]);

  const itemsWithSpent = useMemo(
    () =>
      budgetItems.map((b) => ({
        ...b,
        spentAmount: spentByKey.get(`${b.type}:${b.category}`) ?? 0,
      })),
    [budgetItems, spentByKey],
  );

  const addBudgetItem = () => {
    const amt = parseFloat(newItem.budgetAmount);
    if (!newItem.name.trim() || !newItem.category || !amt || amt <= 0) {
      toast({ title: "Missing info", description: "Fill name, category and a positive amount.", variant: "destructive" });
      return;
    }
    const dup = budgetItems.some(
      (b) => b.type === newItem.type && b.category === newItem.category,
    );
    if (dup) {
      toast({ title: "Category exists", description: `A ${newItem.type} budget for ${newItem.category} already exists.`, variant: "destructive" });
      return;
    }
    setBudgetItems((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: newItem.name.trim(),
        category: newItem.category,
        budgetAmount: amt,
        type: newItem.type,
      },
    ]);
    setNewItem({ name: "", category: "", budgetAmount: "", type: "expense" });
    toast({ title: "Budget added", description: `${newItem.name} added.` });
  };

  const addTransaction = () => {
    const amt = parseFloat(newTransaction.amount);
    if (!newTransaction.name.trim() || !newTransaction.category || !amt || amt <= 0) {
      toast({ title: "Missing info", description: "Fill name, category and a positive amount.", variant: "destructive" });
      return;
    }
    setTransactions((prev) => [
      {
        id: crypto.randomUUID(),
        name: newTransaction.name.trim(),
        amount: amt,
        category: newTransaction.category,
        type: newTransaction.type,
        date: new Date().toISOString(),
      },
      ...prev,
    ]);
    const hasBudget = budgetItems.some(
      (b) => b.type === newTransaction.type && b.category === newTransaction.category,
    );
    setNewTransaction({ name: "", amount: "", category: "", type: "expense" });
    toast({
      title: "Transaction recorded",
      description: hasBudget ? "Linked to your budget." : "Tip: add a budget for this category to track it.",
    });
  };

  const removeBudgetItem = (id: string) => {
    setBudgetItems((prev) => prev.filter((i) => i.id !== id));
    toast({ title: "Budget removed" });
  };
  const removeTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };
  const saveEditedTxn = () => {
    if (!editingTxn) return;
    const amt = Number(editingTxn.amount);
    if (!editingTxn.name.trim() || !editingTxn.category || !amt || amt <= 0) {
      toast({ title: "Invalid input", description: "Name, category and a positive amount are required.", variant: "destructive" });
      return;
    }
    setTransactions((prev) => prev.map((t) => (t.id === editingTxn.id ? { ...editingTxn, name: editingTxn.name.trim(), amount: amt } : t)));
    setEditingTxn(null);
    toast({ title: "Transaction updated" });
  };

  const loadSample = () => {
    setBudgetItems(sampleBudgets());
    setTransactions(sampleTxns());
    toast({ title: "Sample data loaded", description: "8 budgets and 14 transactions added." });
  };
  const clearAll = () => {
    setBudgetItems([]);
    setTransactions([]);
    toast({ title: "All data cleared" });
  };

  // KPIs — actual income & actual expenses from transactions
  const actualIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);
  const totalExpenseBudget = budgetItems
    .filter((i) => i.type === "expense")
    .reduce((s, i) => s + i.budgetAmount, 0);
  const totalExpenseSpent = transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);
  const remaining = actualIncome - totalExpenseSpent;
  const budgetUtilization =
    totalExpenseBudget > 0 ? (totalExpenseSpent / totalExpenseBudget) * 100 : 0;

  // Pie data — expense spend by category
  const pieData = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of transactions.filter((x) => x.type === "expense")) {
      map.set(t.category, (map.get(t.category) ?? 0) + t.amount);
    }
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Data is saved on this device. Start with sample data or add your own.
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadSample}>
            <Sparkles className="w-4 h-4 mr-2" /> Load sample data
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearAll}
            disabled={!budgetItems.length && !transactions.length}
          >
            <RotateCcw className="w-4 h-4 mr-2" /> Clear all
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Income (actual)</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(actualIncome)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Budgeted Expense</p>
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
                <p className={`text-2xl font-bold ${remaining >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {formatCurrency(remaining)}
                </p>
              </div>
              <IndianRupee className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Utilization + Pie */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Budget Utilization</CardTitle>
            <CardDescription>{budgetUtilization.toFixed(1)}% of your expense budget used</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={Math.min(budgetUtilization, 100)} className="h-3" />
            <div className="flex justify-between text-sm text-muted-foreground mt-2">
              <span>₹0</span>
              <span>{formatCurrency(totalExpenseBudget)}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Spend by Category</CardTitle>
            <CardDescription>Based on recorded expenses</CardDescription>
          </CardHeader>
          <CardContent>
            {pieData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No expense transactions yet</p>
            ) : (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={40} outerRadius={70} paddingAngle={2}>
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <ReTooltip formatter={(v: number) => formatCurrency(v)} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Inputs */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Set Budget Categories</CardTitle>
            <CardDescription>Define your income sources and expense limits</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="item-name">Name</Label>
                <Input
                  id="item-name"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="e.g., Monthly Groceries"
                />
              </div>
              <div>
                <Label htmlFor="item-type">Type</Label>
                <Select value={newItem.type} onValueChange={(v: "income" | "expense") => setNewItem({ ...newItem, type: v, category: "" })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
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
                <Select value={newItem.category} onValueChange={(v) => setNewItem({ ...newItem, category: v })}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {categories[newItem.type].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="item-amount">{newItem.type === "income" ? "Expected Amount" : "Budget Limit"}</Label>
                <Input
                  id="item-amount"
                  type="number"
                  min={0}
                  value={newItem.budgetAmount}
                  onChange={(e) => setNewItem({ ...newItem, budgetAmount: e.target.value })}
                  placeholder="Amount"
                />
              </div>
            </div>
            <Button onClick={addBudgetItem} className="w-full">
              <Plus className="w-4 h-4 mr-2" /> Add Budget Item
            </Button>
          </CardContent>
        </Card>

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
                <Select value={newTransaction.type} onValueChange={(v: "income" | "expense") => setNewTransaction({ ...newTransaction, type: v, category: "" })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
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
                <Select value={newTransaction.category} onValueChange={(v) => setNewTransaction({ ...newTransaction, category: v })}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {categories[newTransaction.type].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="trans-amount">Amount</Label>
                <Input
                  id="trans-amount"
                  type="number"
                  min={0}
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                  placeholder="Amount"
                />
              </div>
            </div>
            <Button onClick={addTransaction} className="w-full">
              <Plus className="w-4 h-4 mr-2" /> Add Transaction
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Budget categories list */}
      {itemsWithSpent.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Budget Categories</CardTitle>
            <CardDescription>Progress is calculated live from your transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {itemsWithSpent.map((item) => {
                const percentage = item.budgetAmount > 0 ? (item.spentAmount / item.budgetAmount) * 100 : 0;
                const isOver = percentage > 100;
                return (
                  <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h4 className="font-medium">{item.name}</h4>
                        <Badge variant={item.type === "income" ? "default" : "secondary"}>{item.type}</Badge>
                        <Badge variant="outline">{item.category}</Badge>
                        {isOver && item.type === "expense" && (
                          <Badge variant="destructive">Over budget</Badge>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {formatCurrency(item.spentAmount)} / {formatCurrency(item.budgetAmount)}
                          </span>
                          <span className={`font-medium ${isOver ? "text-red-600" : "text-green-600"}`}>
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                        <Progress value={Math.min(percentage, 100)} className="h-2" />
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeBudgetItem(item.id)} className="text-red-600 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transactions list */}
      {transactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>{transactions.length} recorded · most recent first</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {transactions
                .slice()
                .sort((a, b) => +new Date(b.date) - +new Date(a.date))
                .map((t) => (
                  <div key={t.id} className="flex items-center justify-between py-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium truncate">{t.name}</span>
                        <Badge variant="outline" className="text-xs">{t.category}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(t.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </span>
                      </div>
                    </div>
                    <div className={`font-semibold mr-3 ${t.type === "income" ? "text-green-600" : "text-red-600"}`}>
                      {t.type === "income" ? "+" : "-"}{formatCurrency(t.amount)}
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setEditingTxn(t)} aria-label="Edit transaction">
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => removeTransaction(t.id)} className="text-red-600 hover:text-red-700" aria-label="Delete transaction">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {budgetItems.length === 0 && transactions.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="p-10 text-center">
            <Sparkles className="w-10 h-10 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-1">Nothing here yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Load sample data to see how the tracker works, or create your first budget above.
            </p>
            <Button onClick={loadSample}>
              <Sparkles className="w-4 h-4 mr-2" /> Load sample data
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Edit transaction dialog */}
      <Dialog open={!!editingTxn} onOpenChange={(open) => !open && setEditingTxn(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit transaction</DialogTitle>
            <DialogDescription>Update the date, category, amount or name.</DialogDescription>
          </DialogHeader>
          {editingTxn && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={editingTxn.name}
                  maxLength={100}
                  onChange={(e) => setEditingTxn({ ...editingTxn, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-type">Type</Label>
                  <Select
                    value={editingTxn.type}
                    onValueChange={(v: "income" | "expense") =>
                      setEditingTxn({ ...editingTxn, type: v, category: "" })
                    }
                  >
                    <SelectTrigger id="edit-type"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-amount">Amount</Label>
                  <Input
                    id="edit-amount"
                    type="number"
                    min={0}
                    value={editingTxn.amount || ""}
                    onChange={(e) =>
                      setEditingTxn({ ...editingTxn, amount: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-category">Category</Label>
                  <Select
                    value={editingTxn.category}
                    onValueChange={(v) => setEditingTxn({ ...editingTxn, category: v })}
                  >
                    <SelectTrigger id="edit-category"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {categories[editingTxn.type].map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn("w-full justify-start text-left font-normal", !editingTxn.date && "text-muted-foreground")}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {editingTxn.date ? format(new Date(editingTxn.date), "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={new Date(editingTxn.date)}
                        onSelect={(d) => d && setEditingTxn({ ...editingTxn, date: d.toISOString() })}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTxn(null)}>Cancel</Button>
            <Button onClick={saveEditedTxn}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};


export default BudgetTracker;
