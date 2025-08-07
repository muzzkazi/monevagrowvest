import PageLayout from "@/components/shared/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const MutualFundComparison = () => {
  return (
    <PageLayout>
      <div className="pt-28">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Mutual Fund Comparison
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Compare mutual funds side by side to make informed investment decisions
            </p>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Compare Mutual Funds</CardTitle>
              <CardDescription>
                Feature coming soon - Compare performance, expense ratios, and returns of different mutual funds
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This comprehensive comparison tool will help you analyze and compare mutual funds based on various parameters including returns, risk, expense ratios, and fund manager performance.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default MutualFundComparison;