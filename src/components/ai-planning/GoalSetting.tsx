import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Plus, Trash2, Home, GraduationCap, Car, Plane, PiggyBank } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, parseCommaNumber, formatInputValue } from "@/lib/utils";

interface FinancialGoal {
  id: string;
  name: string;
  category: string;
  targetAmount: number;
  timeHorizon: number;
  priority: number;
  currentSavings: number;
}

interface GoalSettingProps {
  onComplete: (goals: FinancialGoal[]) => void;
}

const GoalSetting = ({ onComplete }: GoalSettingProps) => {
  const { toast } = useToast();
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [newGoal, setNewGoal] = useState({
    name: "",
    category: "",
    targetAmount: 0,
    timeHorizon: 5,
    priority: 5,
    currentSavings: 0
  });
  const [targetAmountInput, setTargetAmountInput] = useState("");
  const [currentSavingsInput, setCurrentSavingsInput] = useState("");

  const goalCategories = [
    { value: "retirement", label: "Retirement", icon: PiggyBank },
    { value: "home", label: "Home Purchase", icon: Home },
    { value: "education", label: "Education", icon: GraduationCap },
    { value: "car", label: "Vehicle", icon: Car },
    { value: "travel", label: "Travel", icon: Plane },
    { value: "emergency", label: "Emergency Fund", icon: PiggyBank },
    { value: "other", label: "Other", icon: PiggyBank }
  ];

  const addGoal = () => {
    if (!newGoal.name || !newGoal.category || newGoal.targetAmount <= 0) {
      toast({
        title: "Incomplete Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const goal: FinancialGoal = {
      id: Date.now().toString(),
      ...newGoal
    };

    setGoals([...goals, goal]);
    setNewGoal({
      name: "",
      category: "",
      targetAmount: 0,
      timeHorizon: 5,
      priority: 5,
      currentSavings: 0
    });
    setTargetAmountInput("");
    setCurrentSavingsInput("");

    toast({
      title: "Goal Added",
      description: `${goal.name} has been added to your financial goals.`
    });
  };

  const removeGoal = (id: string) => {
    setGoals(goals.filter(goal => goal.id !== id));
  };

  const handleComplete = () => {
    if (goals.length === 0) {
      toast({
        title: "No Goals Set",
        description: "Please add at least one financial goal to continue.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Goals Saved",
      description: "Your financial goals have been saved successfully."
    });
    onComplete(goals);
  };

  // formatCurrency is now imported from utils

  return (
    <div className="space-y-6">
      {/* Add New Goal Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add Financial Goal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="goalName">Goal Name *</Label>
              <Input
                id="goalName"
                placeholder="e.g., Dream Home, Child's Education"
                value={newGoal.name}
                onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={newGoal.category} onValueChange={(value) => setNewGoal({ ...newGoal, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {goalCategories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      <div className="flex items-center gap-2">
                        <category.icon className="h-4 w-4" />
                        {category.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="targetAmount">Target Amount (₹) *</Label>
              <Input
                id="targetAmount"
                type="text"
                placeholder="10,00,000"
                value={targetAmountInput}
                onChange={(e) => {
                  const formatted = formatInputValue(e.target.value);
                  setTargetAmountInput(formatted);
                  setNewGoal({ ...newGoal, targetAmount: parseCommaNumber(formatted) });
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentSavings">Current Savings (₹)</Label>
              <Input
                id="currentSavings"
                type="text"
                placeholder="1,00,000"
                value={currentSavingsInput}
                onChange={(e) => {
                  const formatted = formatInputValue(e.target.value);
                  setCurrentSavingsInput(formatted);
                  setNewGoal({ ...newGoal, currentSavings: parseCommaNumber(formatted) });
                }}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Time Horizon: {newGoal.timeHorizon} years</Label>
              <Slider
                value={[newGoal.timeHorizon]}
                onValueChange={(value) => setNewGoal({ ...newGoal, timeHorizon: value[0] })}
                max={30}
                min={1}
                step={1}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label>Priority Level: {newGoal.priority}/10</Label>
              <Slider
                value={[newGoal.priority]}
                onValueChange={(value) => setNewGoal({ ...newGoal, priority: value[0] })}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
            </div>
          </div>

          <Button onClick={addGoal} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Goal
          </Button>
        </CardContent>
      </Card>

      {/* Goals List */}
      {goals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Financial Goals ({goals.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {goals.map((goal) => {
                const categoryInfo = goalCategories.find(cat => cat.value === goal.category);
                const Icon = categoryInfo?.icon || PiggyBank;
                const monthlyRequired = (goal.targetAmount - goal.currentSavings) / (goal.timeHorizon * 12);

                return (
                  <div key={goal.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <Icon className="h-5 w-5 text-financial-accent mt-1" />
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">{goal.name}</h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeGoal(goal.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-muted-foreground">
                            <div>
                              <span className="font-medium">Target:</span> {formatCurrency(goal.targetAmount)}
                            </div>
                            <div>
                              <span className="font-medium">Timeline:</span> {goal.timeHorizon} years
                            </div>
                            <div>
                              <span className="font-medium">Priority:</span> {goal.priority}/10
                            </div>
                            <div>
                              <span className="font-medium">Monthly SIP:</span> {formatCurrency(monthlyRequired)}
                            </div>
                          </div>
                          {goal.currentSavings > 0 && (
                            <div className="text-sm text-green-600">
                              Current Savings: {formatCurrency(goal.currentSavings)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Continue Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleComplete} 
          size="lg"
          className="bg-financial-accent hover:bg-financial-accent/90"
        >
          Continue to Risk Assessment
        </Button>
      </div>
    </div>
  );
};

export default GoalSetting;